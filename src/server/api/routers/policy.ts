import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, agentProcedure, adminProcedure } from '@/server/api/trpc';
import { PolicyStatus } from '@prisma/client';
import { PremiumCalculator } from '@/lib/services/premium-calculator';
import {
  createPolicySchema,
  updatePolicySchema,
  policyFilterSchema,
  quoteRequestSchema,
  draftPolicySchema,
  perAmountQuoteRequestSchema,
  coverageAmountSchema
} from '@/lib/validations/policy';
import { NotificationService } from '@/lib/services/notification';
import { SecurityLogger } from '@/lib/services/security-logger';

export const policyRouter = createTRPCRouter({
  // Get all policies with filtering and pagination for the current user
  getAll: protectedProcedure
    .input(z.object({
      filters: policyFilterSchema.optional(),
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { filters = {}, limit, cursor } = input;
      
      const where: Record<string, unknown> = {
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

  // Get all policies for agents (no userId filter)
  getAllForAgents: agentProcedure
    .input(z.object({
      filters: policyFilterSchema.optional(),
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { filters = {}, limit, cursor } = input;
      
      const where: Record<string, unknown> = {}; // No userId filter for agents

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

  // Get all policies for admins (no userId filter)
  getAllForAdmins: adminProcedure
    .input(z.object({
      filters: policyFilterSchema.optional(),
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { filters = {}, limit, cursor } = input;
      
      const where: Record<string, unknown> = {}; // No userId filter for admins

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

  // NEW: Generate per-amount quote using new model
  generatePerAmountQuote: protectedProcedure
    .input(perAmountQuoteRequestSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const quote = PremiumCalculator.calculatePremiumPerAmount(
          input.policyType,
          input.coverageAmount,
          input.riskFactors,
          input.deductible
        );

        const response = {
          quoteNumber: PremiumCalculator.generateQuoteNumber(),
          ...quote,
          coverageAmount: input.coverageAmount,
          deductible: input.deductible,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };
        return response;
      } catch (error) {
        console.error('Per-amount quote generation error:', error);
        throw new Error(`Failed to generate quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // NEW: Real-time premium calculation for per-amount model
  calculatePremiumRealTime: protectedProcedure
    .input(z.object({
      coverageAmount: coverageAmountSchema,
      riskFactors: z.object({
        location: z.object({
          province: z.string(),
          postalCode: z.string(),
          crimeRate: z.enum(['low', 'medium', 'high']).optional(),
          naturalDisasterRisk: z.enum(['low', 'medium', 'high']).optional(),
        }).optional(),
        demographics: z.object({
          age: z.number().min(18).max(120),
        }).optional(),
        property: z.object({
          yearBuilt: z.number().optional(),
          squareFeet: z.number().optional(),
          constructionType: z.string().optional(),
          safetyFeatures: z.array(z.string()).optional(),
        }).optional(),
        personal: z.object({
          creditScore: z.number().min(300).max(850).optional(),
          claimsHistory: z.number().min(0).max(20).default(0),
        }).optional(),
      }).optional(),
      deductible: z.number().min(0).max(50000).default(1000),
    }))
    .query(async ({ input }) => {
      try {
        return PremiumCalculator.calculatePremiumPerAmount(
          'HOME' as any, // Default to HOME for real-time calculations
          input.coverageAmount,
          input.riskFactors,
          input.deductible
        );
      } catch (error) {
        console.error('Real-time premium calculation error:', error);
        throw new Error(`Premium calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Generate a quote (no policy created yet) - LEGACY SUPPORT
  generateQuote: protectedProcedure
    .input(quoteRequestSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Handle both old and new frontend data structures
        let coverage: any;
        let riskFactors: any;
        let policyType: any;

        if (input.coverageAmount) {
          // New frontend structure
          coverage = {
            dwelling: input.coverageAmount * 0.7, // Assume 70% dwelling
            personalProperty: input.coverageAmount * 0.2, // 20% personal property
            liability: input.coverageAmount * 0.1, // 10% liability
          };
          riskFactors = {
            location: {
              province: input.location?.split(',')[1]?.trim() || 'Unknown',
              postalCode: input.postalCode || '0000',
            },
            demographics: {
              age: input.age || 35,
            },
            property: input.propertyInfo ? {
              yearBuilt: input.propertyInfo.buildYear || 2000,
              squareFeet: input.propertyInfo.squareFeet || 2000,
              safetyFeatures: input.propertyInfo.safetyFeatures || [],
              propertyType: input.propertyInfo.propertyType || 'house',
              constructionType: 'brick', // Default
              roofType: 'tile', // Default
              heatingType: 'electric', // Default
              hasPool: input.propertyInfo.hasPool || false,
              hasGarage: input.propertyInfo.hasGarage || false,
              foundationType: 'concrete', // Default
            } : undefined,
            personal: {
              creditScore: input.creditScore || 650,
              claimsHistory: input.previousClaims || 0,
            }
          };
          policyType = input.policyType;
        } else {
          // Old structure (fallback)
          coverage = input.coverage;
          riskFactors = input.riskFactors;
          policyType = input.type;
        }

        const quote = PremiumCalculator.calculatePremium(
          policyType,
          coverage,
          riskFactors,
          input.deductible
        );

        const response = {
          quoteNumber: PremiumCalculator.generateQuoteNumber(),
          ...quote,
          coverage: coverage,
          deductible: input.deductible,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };
        return response;
      } catch (error) {
        console.error('Quote generation error:', error);
        throw new Error(`Failed to generate quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Check quote expiration
  checkQuoteExpiration: protectedProcedure
    .input(z.object({
      quoteNumber: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, you would store quotes in the database
      // For now, we'll simulate quote expiration check
      const quoteAge = Date.now() - parseInt(input.quoteNumber.split('-')[1], 36);
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      
      return {
        isExpired: quoteAge > thirtyDaysInMs,
        expiresAt: new Date(Date.now() + thirtyDaysInMs - quoteAge),
        daysRemaining: Math.max(0, Math.ceil((thirtyDaysInMs - quoteAge) / (24 * 60 * 60 * 1000))),
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
          coverage: PremiumCalculator.getTotalCoverage(input.coverage),
          deductible: input.deductible,
          startDate: input.startDate,
          endDate: input.endDate,
          propertyInfo: input.propertyInfo,
          personalInfo: input.personalInfo || null, // Optional personal info for HOME policies
          vehicleInfo: null, // Not applicable for HOME policies
        },
      });

      // Send email notification
      await NotificationService.notifyPolicyCreated(ctx.user.id, {
        policyNumber,
        coverageAmount: PremiumCalculator.getTotalCoverage(input.coverage),
        effectiveDate: input.startDate.toISOString().split('T')[0],
        premiumAmount: premiumCalculation.annualPremium,
        userEmail: ctx.user.email,
        userName: `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim(),
      });

      return policy;
    }),

  // Save draft policy
  saveDraft: protectedProcedure
    .input(draftPolicySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const draftNumber = `DRAFT-${Date.now().toString(36).toUpperCase()}`;
        
        const draft = await ctx.db.policy.create({
          data: {
            policyNumber: draftNumber,
            userId: ctx.user.id,
            type: input.type || 'HOME',
            status: PolicyStatus.DRAFT,
            premium: 0, // Will be calculated when finalized
            coverage: input.coverage ? PremiumCalculator.getTotalCoverage(input.coverage) : 0,
            deductible: input.deductible || 1000,
            startDate: input.startDate || new Date(),
            endDate: input.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            propertyInfo: input.propertyInfo || {},
            personalInfo: input.personalInfo || null,
            vehicleInfo: null,
          },
        });

        // Log draft creation
        await SecurityLogger.logEvent({
          type: 'POLICY_CREATED',
          severity: 'LOW',
          userId: ctx.user.id,
          details: {
            policyId: draft.id,
            policyNumber: draft.policyNumber,
            isDraft: true,
            completionPercentage: input.completionPercentage,
          },
        });

        return draft;
      } catch (error) {
        console.error('Draft policy creation error:', error);
        throw new Error(`Failed to save draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Get draft policies for user
  getDrafts: protectedProcedure
    .query(async ({ ctx }) => {
      const drafts = await ctx.db.policy.findMany({
        where: {
          userId: ctx.user.id,
          status: PolicyStatus.DRAFT,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return drafts;
    }),

  // Convert draft to full policy
  convertDraftToPolicy: protectedProcedure
    .input(z.object({
      draftId: z.string(),
      finalData: createPolicySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the draft
        const draft = await ctx.db.policy.findFirst({
          where: {
            id: input.draftId,
            userId: ctx.user.id,
            status: PolicyStatus.DRAFT,
          },
        });

        if (!draft) {
          throw new Error('Draft not found');
        }

        // Calculate premium for final policy
        const premiumCalculation = PremiumCalculator.calculatePremium(
          input.finalData.type,
          input.finalData.coverage,
          input.finalData.riskFactors,
          input.finalData.deductible
        );

        // Update draft to full policy
        const policy = await ctx.db.policy.update({
          where: { id: draft.id },
          data: {
            status: PolicyStatus.PENDING_REVIEW,
            premium: premiumCalculation.annualPremium,
            coverage: PremiumCalculator.getTotalCoverage(input.finalData.coverage),
            deductible: input.finalData.deductible,
            startDate: input.finalData.startDate,
            endDate: input.finalData.endDate,
            propertyInfo: input.finalData.propertyInfo,
            personalInfo: input.finalData.personalInfo,
          },
        });

        // Send notification
        await NotificationService.sendNotification({
          userId: ctx.user.id,
          type: 'POLICY_CREATED',
          title: 'Policy Created Successfully',
          message: `Your home insurance policy ${policy.policyNumber} has been created and is pending review.`,
        });

        return policy;
      } catch (error) {
        console.error('Draft conversion error:', error);
        throw new Error(`Failed to convert draft to policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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

      // Only allow updates to DRAFT and PENDING_REVIEW policies
      if (!['DRAFT', 'PENDING_REVIEW'].includes(existingPolicy.status)) {
        throw new Error('Only draft and pending review policies can be edited');
      }

      // If coverage or risk factors changed, recalculate premium
      let newPremium = existingPolicy.premium;
      if (updateData.coverageAmount || updateData.deductible || updateData.propertyInfo || updateData.vehicleInfo || updateData.personalInfo) {
        // For now, keep existing premium calculation logic
        // In a real app, you'd recalculate based on new data
        const coverage = { dwelling: updateData.coverageAmount || existingPolicy.coverage };
        const riskFactors = {
          location: updateData.propertyInfo ? {
            province: updateData.propertyInfo.province || '',
            postalCode: updateData.propertyInfo.postalCode || ''
          } : { province: '', postalCode: '' },
          demographics: { age: 25 },
          personal: {}
        };
        const deductible = updateData.deductible || existingPolicy.deductible;
        
        try {
          const premiumCalculation = PremiumCalculator.calculatePremium(
            existingPolicy.type,
            coverage,
            riskFactors,
            deductible
          );
          newPremium = premiumCalculation.annualPremium;
        } catch (error) {
          // If premium calculation fails, keep existing premium
          console.warn('Failed to recalculate premium:', error);
        }
      }

      // Prepare update data
      const updatePayload: Record<string, any> = {};
      
      if (updateData.deductible !== undefined) {
        updatePayload.deductible = updateData.deductible;
      }
      
      if (updateData.propertyInfo) {
        updatePayload.propertyInfo = {
          ...existingPolicy.propertyInfo,
          ...updateData.propertyInfo,
        };
      }
      
      if (updateData.vehicleInfo) {
        updatePayload.vehicleInfo = {
          ...existingPolicy.vehicleInfo,
          ...updateData.vehicleInfo,
        };
      }
      
      if (updateData.personalInfo) {
        updatePayload.personalInfo = {
          ...existingPolicy.personalInfo,
          ...updateData.personalInfo,
        };
      }

      if (newPremium !== existingPolicy.premium) {
        updatePayload.premium = newPremium;
      }

      // Update coverage if it changed
      if (updateData.coverageAmount && updateData.coverageAmount !== existingPolicy.coverage) {
        updatePayload.coverage = updateData.coverageAmount;
      }

      return ctx.db.policy.update({
        where: { id },
        data: updatePayload,
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

  // Admin: Bulk approve pending policies
  bulkApprove: adminProcedure
    .input(z.object({
      policyIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const policies = await ctx.db.policy.findMany({
        where: { 
          id: { in: input.policyIds },
          status: PolicyStatus.PENDING_REVIEW
        },
        include: { user: true }
      });

      const updatedPolicies = await Promise.all(
        policies.map(policy => 
          ctx.db.policy.update({
            where: { id: policy.id },
            data: { status: PolicyStatus.ACTIVE }
          })
        )
      );

      // Log bulk approval
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Bulk approved ${updatedPolicies.length} policies`,
        ctx.req?.headers['x-forwarded-for'] as string,
        ctx.req?.headers['user-agent'],
        { policyIds: input.policyIds, count: updatedPolicies.length }
      );

      return { updatedCount: updatedPolicies.length };
    }),

  // Admin: Bulk expire old policies
  bulkExpire: adminProcedure
    .input(z.object({
      policyIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const policies = await ctx.db.policy.findMany({
        where: { 
          id: { in: input.policyIds },
          status: PolicyStatus.ACTIVE
        }
      });

      const updatedPolicies = await Promise.all(
        policies.map(policy => 
          ctx.db.policy.update({
            where: { id: policy.id },
            data: { status: PolicyStatus.EXPIRED }
          })
        )
      );

      // Log bulk expiration
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Bulk expired ${updatedPolicies.length} policies`,
        ctx.req?.headers['x-forwarded-for'] as string,
        ctx.req?.headers['user-agent'],
        { policyIds: input.policyIds, count: updatedPolicies.length }
      );

      return { updatedCount: updatedPolicies.length };
    }),

  // Admin: Send renewal notices
  bulkRenewal: adminProcedure
    .input(z.object({
      policyIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const policies = await ctx.db.policy.findMany({
        where: { 
          id: { in: input.policyIds },
          status: PolicyStatus.ACTIVE
        },
        include: { user: true }
      });

      // Send renewal notices
      const notificationService = new NotificationService();
      await Promise.all(
        policies.map(policy => 
          notificationService.sendNotification({
            userId: policy.userId,
            type: 'POLICY_RENEWAL',
            title: 'Policy Renewal Notice',
            message: `Your policy ${policy.policyNumber} is due for renewal.`,
            data: { policyId: policy.id }
          })
        )
      );

      // Log bulk renewal notices
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Sent renewal notices for ${policies.length} policies`,
        ctx.req?.headers['x-forwarded-for'] as string,
        ctx.req?.headers['user-agent'],
        { policyIds: input.policyIds, count: policies.length }
      );

      return { processedCount: policies.length };
    }),

  // Admin: Run audit check
  bulkAudit: adminProcedure
    .input(z.object({
      policyIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const policies = await ctx.db.policy.findMany({
        where: { id: { in: input.policyIds } },
        include: { user: true, claims: true, payments: true }
      });

      const auditResults = policies.map(policy => {
        const issues = [];
        
        // Check for missing payments
        if (policy.status === PolicyStatus.ACTIVE && policy.payments.length === 0) {
          issues.push('No payments recorded');
        }
        
        // Check for claims without proper documentation
        const claimsWithoutDocs = policy.claims.filter(claim => !claim.documents || claim.documents.length === 0);
        if (claimsWithoutDocs.length > 0) {
          issues.push(`${claimsWithoutDocs.length} claims without documentation`);
        }
        
        // Check for policies past end date
        if (policy.endDate < new Date() && policy.status === PolicyStatus.ACTIVE) {
          issues.push('Policy past end date but still active');
        }

        return {
          policyId: policy.id,
          policyNumber: policy.policyNumber,
          issues,
          hasIssues: issues.length > 0
        };
      });

      // Log audit check
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Ran audit check on ${policies.length} policies`,
        ctx.req?.headers['x-forwarded-for'] as string,
        ctx.req?.headers['user-agent'],
        { policyIds: input.policyIds, auditResults }
      );

      return { auditResults };
    }),

  // Admin: Recalculate premiums
  bulkRecalculate: adminProcedure
    .input(z.object({
      policyIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const policies = await ctx.db.policy.findMany({
        where: { id: { in: input.policyIds } }
      });

      const calculator = new PremiumCalculator();
      const updatedPolicies = await Promise.all(
        policies.map(async policy => {
          const newPremium = await calculator.calculatePremium({
            type: policy.type,
            propertyInfo: policy.propertyInfo,
            personalInfo: policy.personalInfo,
            vehicleInfo: policy.vehicleInfo
          });

          return ctx.db.policy.update({
            where: { id: policy.id },
            data: { premium: newPremium }
          });
        })
      );

      // Log premium recalculation
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Recalculated premiums for ${updatedPolicies.length} policies`,
        ctx.req?.headers['x-forwarded-for'] as string,
        ctx.req?.headers['user-agent'],
        { policyIds: input.policyIds, count: updatedPolicies.length }
      );

      return { updatedCount: updatedPolicies.length };
    }),
});