import { z } from 'zod';
import { ClaimStatus } from '@prisma/client';
import { 
  createTRPCRouter,
  protectedProcedure,
  agentProcedure,
} from '@/server/api/trpc';
import { 
  claimSubmissionSchema, 
  claimUpdateSchema,
  claimFilterSchema 
} from '@/lib/validations/claim';

export const claimRouter = createTRPCRouter({
  // Submit a new claim
  submit: protectedProcedure
    .input(claimSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;

      // Verify user owns the policy
      const policy = await ctx.db.policy.findFirst({
        where: {
          id: input.policyId,
          userId: userId,
        },
      });

      if (!policy) {
        throw new Error('Policy not found or access denied');
      }

      // Generate claim number
      const claimCount = await ctx.db.claim.count();
      const claimNumber = `CLM-${Date.now()}-${String(claimCount + 1).padStart(4, '0')}`;

      const claim = await ctx.db.claim.create({
        data: {
          claimNumber,
          userId,
          policyId: input.policyId,
          type: input.type,
          status: ClaimStatus.PENDING_REVIEW,
          description: input.description,
          incidentDate: input.incidentDate,
          incidentLocation: input.incidentLocation,
          amount: input.estimatedAmount,
          witnesses: input.witnesses,
          policeReport: input.policeReport,
          medicalTreatment: input.medicalTreatment,
          vehicleDetails: input.vehicleDetails,
          propertyDetails: input.propertyDetails,
        },
        include: {
          policy: true,
          user: true,
        },
      });

      // Create documents if provided
      if (input.documents && input.documents.length > 0) {
        await ctx.db.document.createMany({
          data: input.documents.map(doc => ({
            name: doc.name,
            type: doc.type,
            url: doc.url,
            size: doc.size,
            userId,
            claimId: claim.id,
            status: 'ACTIVE',
          })),
        });
      }

      return claim;
    }),

  // Get claims for current user
  getAll: protectedProcedure
    .input(claimFilterSchema.extend({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const { cursor, limit, ...filters } = input;

      const where: any = {
        userId,
      };

      // Apply filters
      if (filters.search) {
        where.OR = [
          { claimNumber: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.policyId) where.policyId = filters.policyId;
      
      if (filters.minAmount || filters.maxAmount) {
        where.amount = {};
        if (filters.minAmount) where.amount.gte = filters.minAmount;
        if (filters.maxAmount) where.amount.lte = filters.maxAmount;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.incidentDate = {};
        if (filters.dateFrom) where.incidentDate.gte = filters.dateFrom;
        if (filters.dateTo) where.incidentDate.lte = filters.dateTo;
      }

      if (cursor) {
        where.id = { lt: cursor };
      }

      const claims = await ctx.db.claim.findMany({
        where,
        take: limit + 1,
        orderBy: {
          [filters.sortBy]: filters.sortOrder,
        },
        include: {
          policy: true,
          documents: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (claims.length > limit) {
        const nextItem = claims.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        claims,
        nextCursor,
      };
    }),

  // Get single claim by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      
      const claim = await ctx.db.claim.findFirst({
        where: {
          id: input.id,
          userId,
        },
        include: {
          policy: true,
          documents: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!claim) {
        throw new Error('Claim not found or access denied');
      }

      return claim;
    }),

  // Update claim status and details (agent/admin only)
  update: agentProcedure
    .input(claimUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const claim = await ctx.db.claim.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          policy: true,
          documents: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return claim;
    }),

  // Get claims statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const { userId } = ctx.auth;

      const [
        total,
        pending,
        approved,
        denied,
        closed,
        totalAmount,
      ] = await Promise.all([
        ctx.db.claim.count({ where: { userId } }),
        ctx.db.claim.count({ where: { userId, status: ClaimStatus.PENDING_REVIEW } }),
        ctx.db.claim.count({ where: { userId, status: ClaimStatus.APPROVED } }),
        ctx.db.claim.count({ where: { userId, status: ClaimStatus.DENIED } }),
        ctx.db.claim.count({ where: { userId, status: ClaimStatus.CLOSED } }),
        ctx.db.claim.aggregate({
          where: { userId },
          _sum: { amount: true },
        }),
      ]);

      return {
        total,
        pending,
        approved,
        denied,
        closed,
        totalAmount: totalAmount._sum.amount || 0,
      };
    }),
});