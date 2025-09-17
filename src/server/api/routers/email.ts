import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure
} from "@/server/api/trpc";
import { EmailType, EmailStatus } from '@prisma/client';
import { EmailService } from '@/lib/services/email';

export const emailRouter = createTRPCRouter({
  // Get email analytics
  getAnalytics: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      type: z.nativeEnum(EmailType).optional(),
    }))
    .query(async ({ input }) => {
      return EmailService.getEmailAnalytics(input);
    }),

  // Get email templates
  getTemplates: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.db.emailTemplate.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
    }),

  // Create email template
  createTemplate: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      subject: z.string().min(1),
      htmlContent: z.string().min(1),
      textContent: z.string().optional(),
      description: z.string().optional(),
      variables: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.emailTemplate.create({
        data: {
          ...input,
          createdBy: ctx.userId,
          isActive: true,
        }
      });
    }),

  // Update email template
  updateTemplate: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      subject: z.string().min(1).optional(),
      htmlContent: z.string().min(1).optional(),
      textContent: z.string().optional(),
      description: z.string().optional(),
      variables: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.db.emailTemplate.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: ctx.userId,
          updatedAt: new Date(),
        }
      });
    }),

  // Delete email template
  deleteTemplate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.emailTemplate.update({
        where: { id: input.id },
        data: {
          isActive: false,
          updatedBy: ctx.userId,
          updatedAt: new Date(),
        }
      });
    }),

  // Send test email
  sendTestEmail: adminProcedure
    .input(z.object({
      to: z.string().email(),
      templateName: z.string().optional(),
      subject: z.string().optional(),
      html: z.string().optional(),
      type: z.nativeEnum(EmailType).default(EmailType.TEST),
    }))
    .mutation(async ({ input }) => {
      if (input.templateName) {
        return EmailService.sendTemplateEmail(
          input.templateName,
          input.to,
          'Test User',
          { testVariable: 'Test Value' }
        );
      } else {
        return EmailService.sendTrackedEmail({
          to: input.to,
          subject: input.subject || 'Test Email',
          html: input.html || '<p>This is a test email from Lalisure.</p>',
          type: input.type,
        });
      }
    }),

  // Retry failed emails
  retryFailedEmails: adminProcedure
    .mutation(async () => {
      await EmailService.retryFailedEmails();
      return { success: true, message: 'Failed emails retry process started' };
    }),

  // Get email logs
  getEmailLogs: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.nativeEnum(EmailStatus).optional(),
      type: z.nativeEnum(EmailType).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, status, type, startDate, endDate } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      if (type) where.type = type;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [emails, total] = await Promise.all([
        ctx.db.email.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }),
        ctx.db.email.count({ where })
      ]);

      return {
        emails,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      };
    }),

  // Get email tracking data
  getEmailTracking: adminProcedure
    .input(z.object({
      emailId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.emailTracking.findMany({
        where: { emailId: input.emailId },
        orderBy: { createdAt: 'desc' }
      });
    }),

  // Send bulk email
  sendBulkEmail: adminProcedure
    .input(z.object({
      recipients: z.array(z.object({
        email: z.string().email(),
        userId: z.string().optional(),
        variables: z.record(z.string()).optional(),
      })),
      subject: z.string().min(1),
      html: z.string().min(1),
      text: z.string().optional(),
      type: z.nativeEnum(EmailType),
      templateId: z.string().optional(),
      batchSize: z.number().min(1).max(100).default(50),
    }))
    .mutation(async ({ input }) => {
      const results = await EmailService.sendBulkEmails({
        recipients: input.recipients,
        subject: input.subject,
        html: input.html,
        text: input.text,
        type: input.type,
        templateId: input.templateId,
        batchSize: input.batchSize,
      });

      return {
        success: true,
        results,
        totalSent: results.length,
      };
    }),
});
