import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, agentProcedure } from '@/server/api/trpc';
import { PolicyType, PolicyStatus } from '@prisma/client';
import { PremiumCalculator } from '@/lib/services/premium-calculator';
import { 
  createPolicySchema, 
  updatePolicySchema, 
  policyFilterSchema,
  quoteRequestSchema 
} from '@/lib/validations/policy';

export const policyRouter = createTRPCRouter({
  // Get all policies with filtering and pagination
  getAll: protectedProcedure
    .input(z.object({
      filters: policyFilterSchema.optional(),
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { filters = {}, limit, cursor } = input;
      
      const where: any = {
        userId: ctx.user.id,
      };

      // Apply filters
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.search) {
        where.OR = [
          { policyNumber: { contains: filters.search, mode: 'insensitive' } },
          { propertyInfo: { path: ['address'], string_contains: filters.search } },
          { vehicleInfo: { path: ['make'], string_contains: filters.search } },
        ];
      }
      if (filters.minPremium) where.premium = { gte: filters.minPremium };
      if (filters.maxPremium) where.premium = { ...where.premium, lte: filters.maxPremium };

      const policies = await ctx.db.policy.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          claims: {
            select: { id: true, status: true, amount: true }
          },
          payments: {
            select: { id: true, status: true, amount: true }
          },
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (policies.length > limit) {
        const nextItem = policies.pop();
        nextCursor = nextItem!.id;
      }

      return {
        policies,
        nextCursor,
      };
    }),

  // Get policy by ID with full details
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const policy = await ctx.db.policy.findFirst({
        where: { 
          id: input.id,
          userId: ctx.user.id 
        },
        include: {
          claims: {
            include: {
              documents: true
            },
            orderBy: { createdAt: 'desc' }
          },
          payments: {
            orderBy: { createdAt: 'desc' }
          },
        },
      });

      if (!policy) {
        throw new Error('Policy not found');
      }

      return policy;
    }),

  // Generate a quote (no policy created yet)
  generateQuote: protectedProcedure
    .input(quoteRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const quote = PremiumCalculator.calculatePremium(
        input.type,
        input.coverage,
        input.riskFactors,
        input.deductible
      );

      return {
        quoteNumber: PremiumCalculator.generateQuoteNumber(),
        ...quote,
        coverage: input.coverage,
        deductible: input.deductible,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };
    }),

  // Create new policy
  create: protectedProcedure
    .input(createPolicySchema)
    .mutation(async ({ ctx, input }) => {
      // Calculate premium
      const premiumCalculation = PremiumCalculator.calculatePremium(
        input.type,
        input.coverage,
        input.riskFactors,
        input.deductible
      );

      const policyNumber = `POL-${input.type}-${Date.now().toString(36).toUpperCase()}`;

      const policy = await ctx.db.policy.create({
        data: {
          policyNumber,
          userId: ctx.user.id,
          type: input.type,
          status: PolicyStatus.DRAFT,
          premium: premiumCalculation.annualPremium,
          coverage: PremiumCalculator['getTotalCoverage'](input.coverage),
          deductible: input.deductible,
          startDate: input.startDate,
          endDate: input.endDate,
          propertyInfo: input.propertyInfo,
          vehicleInfo: input.vehicleInfo,
          personalInfo: input.personalInfo,
        },
      });

      return policy;
    }),

  // Update existing policy
  update: protectedProcedure
    .input(updatePolicySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      // Verify policy ownership
      const existingPolicy = await ctx.db.policy.findFirst({
        where: { id, userId: ctx.user.id }
      });

      if (!existingPolicy) {
        throw new Error('Policy not found');
      }

      // If coverage or risk factors changed, recalculate premium
      let newPremium = existingPolicy.premium;
      if (updateData.coverage || updateData.riskFactors) {
        const coverage = updateData.coverage || existingPolicy.coverage;
        const riskFactors = updateData.riskFactors || existingPolicy.riskFactors;
        const deductible = updateData.deductible || existingPolicy.deductible;
        
        if (coverage && riskFactors) {
          const premiumCalculation = PremiumCalculator.calculatePremium(
            existingPolicy.type,
            coverage as any,
            riskFactors as any,
            deductible
          );
          newPremium = premiumCalculation.annualPremium;
        }
      }

      return ctx.db.policy.update({
        where: { id },
        data: {
          ...updateData,
          premium: newPremium,
        },
      });
    }),

  // Update policy status (agent/admin only for certain statuses)
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.nativeEnum(PolicyStatus),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const policy = await ctx.db.policy.findFirst({
        where: { id: input.id, userId: ctx.user.id }
      });

      if (!policy) {
        throw new Error('Policy not found');
      }

      // Customers can only change to certain statuses
      const allowedCustomerStatuses = [PolicyStatus.DRAFT, PolicyStatus.PENDING_REVIEW];
      if (ctx.user.role === 'CUSTOMER' && !allowedCustomerStatuses.includes(input.status)) {
        throw new Error('Insufficient permissions to change to this status');
      }

      return ctx.db.policy.update({
        where: { id: input.id },
        data: { 
          status: input.status,
          // In a real app, you'd store the reason in an audit log
        },
      });
    }),

  // Get policy statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [totalPolicies, activePolicies, claimsCount, totalPremiums] = await Promise.all([
        ctx.db.policy.count({
          where: { userId: ctx.user.id }
        }),
        ctx.db.policy.count({
          where: { userId: ctx.user.id, status: PolicyStatus.ACTIVE }
        }),
        ctx.db.claim.count({
          where: { userId: ctx.user.id }
        }),
        ctx.db.policy.aggregate({
          where: { userId: ctx.user.id, status: PolicyStatus.ACTIVE },
          _sum: { premium: true }
        })
      ]);

      return {
        totalPolicies,
        activePolicies,
        claimsCount,
        totalAnnualPremiums: totalPremiums._sum.premium || 0,
      };
    }),

  // Delete policy (soft delete - change status)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const policy = await ctx.db.policy.findFirst({
        where: { id: input.id, userId: ctx.user.id }
      });

      if (!policy) {
        throw new Error('Policy not found');
      }

      // Only allow deletion of draft policies
      if (policy.status !== PolicyStatus.DRAFT) {
        throw new Error('Only draft policies can be deleted');
      }

      return ctx.db.policy.update({
        where: { id: input.id },
        data: { status: PolicyStatus.CANCELLED },
      });
    }),
});