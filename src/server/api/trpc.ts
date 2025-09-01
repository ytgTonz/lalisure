import { initTRPC, TRPCError } from '@trpc/server';
import { type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { getCurrentUser } from '@/server/auth';
import { db } from '@/lib/db';
import { UserRole, User } from '@prisma/client';

type CreateContextOptions = {
  userId: string | null;
  user: User | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    userId: opts.userId,
    user: opts.user,
    db,
  };
};

export const createTRPCContext = async (_opts: { req: NextRequest }) => {
  const { userId } = await auth();
  let user = await getCurrentUser();

  // If user is authenticated but not in database, create them
  if (userId && !user) {
    try {
      const { currentUser } = await import('@clerk/nextjs/server');
      const clerkUser = await currentUser();
      
      if (clerkUser) {
        user = await db.user.create({
          data: {
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            avatar: clerkUser.imageUrl || null,
            role: 'CUSTOMER',
          },
        });
      }
    } catch (error) {
      console.error('Error creating user in TRPC context:', error);
    }
  }

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