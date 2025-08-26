import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { PolicyType, PolicyStatus } from '@prisma/client';

export const policyRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.user.id },
    });

    if (!user) throw new Error('User not found');

    return ctx.db.policy.findMany({
      where: { userId: user.id },
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

      return ctx.db.policy.findFirst({
        where: { 
          id: input.id,
          userId: user.id 
        },
        include: {
          claims: true,
          payments: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(PolicyType),
        premium: z.number(),
        coverage: z.number(),
        deductible: z.number(),
        startDate: z.date(),
        endDate: z.date(),
        vehicleInfo: z.object({
          make: z.string(),
          model: z.string(),
          year: z.number(),
          vin: z.string(),
          licensePlate: z.string(),
        }).optional(),
        propertyInfo: z.object({
          address: z.string(),
          propertyType: z.string(),
          buildYear: z.number().optional(),
          squareFeet: z.number().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.user.id },
      });

      if (!user) throw new Error('User not found');

      const policyNumber = `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return ctx.db.policy.create({
        data: {
          ...input,
          policyNumber,
          userId: user.id,
          status: PolicyStatus.DRAFT,
        },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(PolicyStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.user.id },
      });

      if (!user) throw new Error('User not found');

      return ctx.db.policy.update({
        where: { 
          id: input.id,
          userId: user.id 
        },
        data: { status: input.status },
      });
    }),
});