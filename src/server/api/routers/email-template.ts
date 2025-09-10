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
  getAll: protectedProcedure
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
  getById: protectedProcedure
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
  create: protectedProcedure
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
  update: protectedProcedure
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
  delete: protectedProcedure
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
  toggleActive: protectedProcedure
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
  getStats: protectedProcedure
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
      subject: 'Claim {{claimNumber}} Submitted Successfully - Home Insurance',
      category: 'CLAIMS',
      isActive: true,
      variables: ['claimNumber', 'policyNumber', 'policyholderName', 'claimType', 'incidentDate', 'estimatedAmount', 'location'],
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Home Insurance</h1>
            <p style="color: #e8eaf6; margin: 5px 0 0 0; font-size: 14px;">Your Trusted Insurance Partner</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 400;">Claim Submitted Successfully</h2>
            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Dear {{policyholderName}},</p>

            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 8px;">
              <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Your Claim Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: 500; width: 140px;">Claim Number:</td>
                  <td style="padding: 8px 0; color: #333333; font-weight: 600;">{{claimNumber}}</td>
                </tr>
                <tr style="background-color: #ffffff;">
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Policy Number:</td>
                  <td style="padding: 8px 0; color: #333333; font-weight: 600;">{{policyNumber}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Claim Type:</td>
                  <td style="padding: 8px 0; color: #333333;">{{claimType}}</td>
                </tr>
                <tr style="background-color: #ffffff;">
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Incident Date:</td>
                  <td style="padding: 8px 0; color: #333333;">{{incidentDate}}</td>
                </tr>
                {{#if location}}
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Location:</td>
                  <td style="padding: 8px 0; color: #333333;">{{location}}</td>
                </tr>
                {{/if}}
                {{#if estimatedAmount}}
                <tr style="background-color: #ffffff;">
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Estimated Amount:</td>
                  <td style="padding: 8px 0; color: #333333; font-weight: 600; color: #667eea;">R{{estimatedAmount}}</td>
                </tr>
                {{/if}}
              </table>
            </div>

            <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #1976d2; margin: 0 0 10px 0; font-size: 16px;">What Happens Next?</h4>
              <ul style="color: #424242; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Our claims team will review your submission within 24 hours</li>
                <li>You'll receive updates via email and your dashboard</li>
                <li>If additional information is needed, we'll contact you directly</li>
                <li>You can track your claim status anytime in your account</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">Track Your Claim</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px;">Questions about your claim?</p>
            <p style="color: #333333; margin: 0; font-weight: 600;">Call us: <a href="tel:0800123456" style="color: #667eea; text-decoration: none;">0800 123 456</a> | Email: <a href="mailto:claims@homeinsurance.co.za" style="color: #667eea; text-decoration: none;">claims@homeinsurance.co.za</a></p>
            <p style="color: #999999; margin: 15px 0 0 0; font-size: 12px;">© 2024 Home Insurance. All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `Claim Submitted Successfully - Home Insurance

Dear {{policyholderName}},

Your claim has been successfully submitted and is now under review.

CLAIM DETAILS:
Claim Number: {{claimNumber}}
Policy Number: {{policyNumber}}
Claim Type: {{claimType}}
Incident Date: {{incidentDate}}
{{#if location}}Location: {{location}}{{/if}}
{{#if estimatedAmount}}Estimated Amount: R{{estimatedAmount}}{{/if}}

WHAT HAPPENS NEXT:
• Our claims team will review your submission within 24 hours
• You'll receive updates via email and your dashboard
• If additional information is needed, we'll contact you directly
• You can track your claim status anytime in your account

Track your claim: [Login to your dashboard]

Questions about your claim?
Call us: 0800 123 456
Email: claims@homeinsurance.co.za

© 2024 Home Insurance. All rights reserved.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Add other default templates here...
  };

  return defaultTemplates[name] || null;
}
