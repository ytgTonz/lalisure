import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc';
import { UserRole } from '@prisma/client';

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  createProfile: publicProcedure
    .input(
      z.object({
        clerkId: z.string(),
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: {
          clerkId: input.clerkId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          role: UserRole.CUSTOMER,
        },
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        avatar: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: ctx.user.id,
        },
        data: input,
      });
    }),

  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const [policiesCount, claimsCount, activePoliciесCount] = await Promise.all([
      ctx.db.policy.count({
        where: { userId: ctx.user.id },
      }),
      ctx.db.claim.count({
        where: { userId: ctx.user.id },
      }),
      ctx.db.policy.count({
        where: { 
          userId: ctx.user.id,
          status: 'ACTIVE'
        },
      }),
    ]);

    return {
      policiesCount,
      claimsCount,
      activePoliciesCount: activePoliciесCount,
    };
  }),
});