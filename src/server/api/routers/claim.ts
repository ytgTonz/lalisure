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
import { NotificationService } from '@/lib/services/notification';
import { logClaimAction, AuditAction } from '@/lib/services/audit-log';

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
        const documentTypes = ['PHOTO', 'RECEIPT', 'POLICE_REPORT', 'MEDICAL_REPORT', 'ESTIMATE', 'OTHER'];
        await ctx.db.document.createMany({
          data: input.documents.map(doc => ({
            claimId: claim.id,
            filename: doc.name,
            url: doc.url,
            type: (documentTypes.includes((doc.type || '').toUpperCase()) ? (doc.type || '').toUpperCase() : 'OTHER') as any,
            size: doc.size,
            mimeType: doc.mimeType || 'application/octet-stream',
          })),
        });
      }

      // Send email and SMS notification
      await NotificationService.notifyClaimSubmitted(ctx.user.id, {
        claimNumber,
        policyNumber: claim.policy.policyNumber,
        claimType: input.type.replace('_', ' '),
        incidentDate: input.incidentDate.toISOString().split('T')[0],
        status: 'Submitted',
        estimatedAmount: input.estimatedAmount,
        userEmail: ctx.user.email,
        userName: `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim(),
        userPhone: ctx.user.phone || undefined,
      });

      // Log claim submission to audit log
      await logClaimAction(
        AuditAction.CLAIM_SUBMITTED,
        ctx.user.id,
        ctx.user.role,
        claim.id,
        {
          claimNumber,
          policyId: input.policyId,
          type: input.type,
          amount: input.estimatedAmount,
        }
      );

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
      const { filters, cursor, limit } = input;

      const where: Record<string, unknown> = {
        userId: ctx.user.id,
      };

      // Apply filters if they exist
      if (filters) {
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
          if (filters.minAmount) (where.amount as any).gte = filters.minAmount;
          if (filters.maxAmount) (where.amount as any).lte = filters.maxAmount;
        }

        if (filters.dateFrom || filters.dateTo) {
          where.incidentDate = {};
          if (filters.dateFrom) (where.incidentDate as any).gte = filters.dateFrom;
          if (filters.dateTo) (where.incidentDate as any).lte = filters.dateTo;
        }
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
              phone: true,
            },
          },
        },
      });

      // Send email and SMS notification for status updates
      if (updateData.status && updateData.status !== claim.status) {
        await NotificationService.notifyClaimStatusUpdate(claim.userId, {
          claimNumber: claim.claimNumber,
          policyNumber: claim.policy.policyNumber,
          claimType: claim.type.replace('_', ' '),
          incidentDate: claim.incidentDate.toISOString().split('T')[0],
          status: updateData.status.replace('_', ' '),
          estimatedAmount: claim.amount ?? undefined,
          userEmail: claim.user.email,
          userName: `${claim.user.firstName || ''} ${claim.user.lastName || ''}`.trim(),
          userPhone: claim.user.phone || undefined,
        });

        // Log claim status change to audit log
        const action = updateData.status === ClaimStatus.APPROVED 
          ? AuditAction.CLAIM_APPROVED 
          : updateData.status === ClaimStatus.REJECTED 
          ? AuditAction.CLAIM_REJECTED 
          : AuditAction.CLAIM_UPDATED;

        await logClaimAction(
          action,
          ctx.user.id,
          ctx.user.role,
          claim.id,
          {
            oldStatus: claim.status,
            newStatus: updateData.status,
            claimNumber: claim.claimNumber,
            amount: claim.amount,
          }
        );
      } else if (updateData.status === undefined) {
        // Log general claim update
        await logClaimAction(
          AuditAction.CLAIM_UPDATED,
          ctx.user.id,
          ctx.user.role,
          claim.id,
          {
            claimNumber: claim.claimNumber,
            updatedFields: Object.keys(updateData),
          }
        );
      }

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