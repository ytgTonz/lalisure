import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { auth } from '@clerk/nextjs/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { getCurrentUser } from '@/server/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

type CreateContextOptions = {
  userId: string | null;
  user: any;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    userId: opts.userId,
    user: opts.user,
    db,
  };
};

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { userId } = await auth();
  const user = await getCurrentUser();

  return createInnerTRPCContext({
    userId,
    user,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      userId: ctx.userId,
      user: ctx.user,
      db: ctx.db,
    },
  });
});

const enforceUserHasRole = (requiredRole: UserRole) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.userId || !ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.CUSTOMER]: 1,
      [UserRole.AGENT]: 2,
      [UserRole.UNDERWRITER]: 3,
      [UserRole.ADMIN]: 4,
    };

    const userRoleLevel = roleHierarchy[ctx.user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next({
      ctx: {
        userId: ctx.userId,
        user: ctx.user,
        db: ctx.db,
      },
    });
  });

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const agentProcedure = t.procedure.use(enforceUserHasRole(UserRole.AGENT));
export const underwriterProcedure = t.procedure.use(enforceUserHasRole(UserRole.UNDERWRITER));
export const adminProcedure = t.procedure.use(enforceUserHasRole(UserRole.ADMIN));