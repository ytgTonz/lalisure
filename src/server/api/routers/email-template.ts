import { z } from 'zod';
import { TemplateCategory } from '@prisma/client';
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure
} from '@/server/api/trpc';

const templateFilterSchema = z.object({
  search: z.string().optional(),
  category: z.nativeEnum(TemplateCategory).optional(),
  isActive: z.boolean().optional(),
});

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  title: z.string().min(1, 'Template title is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().min(1, 'HTML content is required'),
  textContent: z.string().optional(),
  variables: z.array(z.string()),
  category: z.nativeEnum(TemplateCategory),
  isActive: z.boolean().default(true),
});

const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: z.string(),
});

export const emailTemplateRouter = createTRPCRouter({
  // Get all email templates (Admin only)
  getAll: adminProcedure
    .input(z.object({
      filters: templateFilterSchema.optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { filters = {}, limit, offset } = input;

      const where: any = {};

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { title: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      const [templates, total] = await Promise.all([
        ctx.db.emailTemplate.findMany({
          where,
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            updater: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.db.emailTemplate.count({ where }),
      ]);

      return {
        templates,
        total,
        hasMore: total > offset + templates.length,
      };
    }),

  // Get single template by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.emailTemplate.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          updater: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      return template;
    }),

  // Get template by name (for system use)
  getByName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.emailTemplate.findUnique({
        where: { name: input.name },
      });

      if (!template || !template.isActive) {
        // Return default template if not found or inactive
        return getDefaultTemplate(input.name);
      }

      return template;
    }),

  // Create new template
  create: adminProcedure
    .input(createTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if template name already exists
      const existing = await ctx.db.emailTemplate.findUnique({
        where: { name: input.name },
      });

      if (existing) {
        throw new Error('Template name already exists');
      }

      return ctx.db.emailTemplate.create({
        data: {
          ...input,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    }),

  // Update existing template
  update: adminProcedure
    .input(updateTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const template = await ctx.db.emailTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      return ctx.db.emailTemplate.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: ctx.user.id,
        },
        include: {
          updater: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    }),

  // Delete template
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.emailTemplate.findUnique({
        where: { id: input.id },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      // Don't allow deletion of default templates
      if (isDefaultTemplate(template.name)) {
        throw new Error('Cannot delete default system templates');
      }

      await ctx.db.emailTemplate.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle template active status
  toggleActive: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.emailTemplate.findUnique({
        where: { id: input.id },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      return ctx.db.emailTemplate.update({
        where: { id: input.id },
        data: {
          isActive: !template.isActive,
          updatedBy: ctx.user.id,
        },
      });
    }),

  // Get template statistics
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [total, active, byCategory] = await Promise.all([
        ctx.db.emailTemplate.count(),
        ctx.db.emailTemplate.count({ where: { isActive: true } }),
        ctx.db.emailTemplate.groupBy({
          by: ['category'],
          _count: { id: true },
          where: { isActive: true },
        }),
      ]);

      return {
        total,
        active,
        inactive: total - active,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item.category] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
      };
    }),
});

// Helper functions for default templates
function isDefaultTemplate(name: string): boolean {
  const defaultTemplates = [
    'claim_submitted',
    'claim_status_update',
    'payment_confirmed',
    'payment_due',
    'policy_created',
    'policy_renewal',
    'invitation',
    'welcome'
  ];
  return defaultTemplates.includes(name);
}

function getDefaultTemplate(name: string): any {
  const defaultTemplates: Record<string, any> = {
    claim_submitted: {
      id: 'default_claim_submitted',
      name: 'claim_submitted',
      title: 'Claim Submission Confirmation',
      subject: 'Claim {{claimNumber}} Submitted Successfully',
      category: 'CLAIMS',
      isActive: true,
      variables: ['claimNumber', 'policyNumber', 'policyholderName', 'claimType', 'incidentDate', 'estimatedAmount'],
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Claim Submitted Successfully</h2>
          <p>Dear {{policyholderName}},</p>
          <p>Your claim has been successfully submitted and is now under review.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Claim Details</h3>
            <p><strong>Claim Number:</strong> {{claimNumber}}</p>
            <p><strong>Policy:</strong> {{policyNumber}}</p>
            <p><strong>Type:</strong> {{claimType}}</p>
            <p><strong>Incident Date:</strong> {{incidentDate}}</p>
            {{#if estimatedAmount}}<p><strong>Estimated Amount:</strong> R{{estimatedAmount}}</p>{{/if}}
          </div>
          <p>We'll contact you within 24-48 hours with an update.</p>
          <p>Best regards,<br>Claims Team</p>
        </div>
      `,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Add other default templates here...
  };

  return defaultTemplates[name] || null;
}
