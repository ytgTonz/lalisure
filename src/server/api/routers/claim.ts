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
      // Verify user owns the policy
      const policy = await ctx.db.policy.findFirst({
        where: {
          id: input.policyId,
          userId: ctx.user.id,
        },
      });

      if (!policy) {
        throw new Error('Policy not found or access denied');
      }

      // Generate claim number
      const claimCount = await ctx.db.claim.count();
      const claimNumber = `CLM-${Date.now()}-${String(claimCount + 1).padStart(4, '0')}`;

      // Process location data
      let locationString = '';
      let what3words = '';
      
      if (input.incidentLocation) {
        const { address, city, province, postalCode } = input.incidentLocation;
        locationString = [address, city, province, postalCode].filter(Boolean).join(', ');
      }

      if (input.what3words) {
        what3words = input.what3words;
      }

      const claim = await ctx.db.claim.create({
        data: {
          claimNumber,
          userId: ctx.user.id,
          policyId: input.policyId,
          type: input.type,
          status: ClaimStatus.SUBMITTED,
          description: input.description,
          incidentDate: input.incidentDate,
          location: locationString,
          what3words: what3words,
          amount: input.estimatedAmount,
        },
        include: {
          policy: true,
        },
      });

      // Create documents if provided
      if (input.documents && input.documents.length > 0) {
        await ctx.db.document.createMany({
          data: input.documents.map(doc => ({
            claimId: claim.id,
            filename: doc.name,
            url: doc.url,
            type: doc.type || 'OTHER',
            size: doc.size,
            mimeType: doc.mimeType || 'application/octet-stream',
          })),
        });
      }

      return claim;
    }),

  // Get claims for current user
  getAll: protectedProcedure
    .input(z.object({
      filters: claimFilterSchema.optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { filters = {}, cursor, limit } = input;

      const where: Record<string, unknown> = {
        userId: ctx.user.id,
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
      if (filters.userId) where.userId = filters.userId;
      
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

      const claims = await ctx.db.claim.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          policy: {
            select: {
              policyNumber: true,
              type: true,
            },
          },
          documents: true,
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
      const claim = await ctx.db.claim.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          policy: true,
          documents: true,
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
      const [
        total,
        submitted,
        underReview,
        investigating,
        approved,
        rejected,
        settled,
        totalAmount,
      ] = await Promise.all([
        ctx.db.claim.count({ where: { userId: ctx.user.id } }),
        ctx.db.claim.count({ where: { userId: ctx.user.id, status: ClaimStatus.SUBMITTED } }),
        ctx.db.claim.count({ where: { userId: ctx.user.id, status: ClaimStatus.UNDER_REVIEW } }),
        ctx.db.claim.count({ where: { userId: ctx.user.id, status: ClaimStatus.INVESTIGATING } }),
        ctx.db.claim.count({ where: { userId: ctx.user.id, status: ClaimStatus.APPROVED } }),
        ctx.db.claim.count({ where: { userId: ctx.user.id, status: ClaimStatus.REJECTED } }),
        ctx.db.claim.count({ where: { userId: ctx.user.id, status: ClaimStatus.SETTLED } }),
        ctx.db.claim.aggregate({
          where: { userId: ctx.user.id },
          _sum: { amount: true },
        }),
      ]);

      return {
        total,
        submitted,
        underReview,
        investigating,
        approved,
        rejected,
        settled,
        totalAmount: totalAmount._sum.amount || 0,
      };
    }),
});