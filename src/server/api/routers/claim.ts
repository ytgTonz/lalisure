import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { ClaimType, ClaimStatus } from '@prisma/client';

export const claimRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.user.id },
    });

    if (!user) throw new Error('User not found');

    return ctx.db.claim.findMany({
      where: { userId: user.id },
      include: {
        policy: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.user.id },
      });

      if (!user) throw new Error('User not found');

      return ctx.db.claim.findFirst({
        where: { 
          id: input.id,
          userId: user.id 
        },
        include: {
          policy: true,
          documents: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        type: z.nativeEnum(ClaimType),
        description: z.string(),
        incidentDate: z.date(),
        location: z.string().optional(),
        what3words: z.string().optional(),
        amount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.user.id },
      });

      if (!user) throw new Error('User not found');

      const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return ctx.db.claim.create({
        data: {
          ...input,
          claimNumber,
          userId: user.id,
          status: ClaimStatus.SUBMITTED,
        },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(ClaimStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.user.id },
      });

      if (!user) throw new Error('User not found');

      return ctx.db.claim.update({
        where: { 
          id: input.id,
          userId: user.id 
        },
        data: { status: input.status },
      });
    }),
});