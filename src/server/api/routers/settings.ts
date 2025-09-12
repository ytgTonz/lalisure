import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '@/server/api/trpc';
import { SecurityEventType, SecurityEventSeverity } from '@prisma/client';

export const settingsRouter = createTRPCRouter({
  // Get current system settings
  get: adminProcedure.query(async ({ ctx }) => {
    let settings = await ctx.db.systemSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await ctx.db.systemSettings.create({
        data: {
          platformName: 'LaLiSure Insurance',
          emailNotifications: true,
          smsNotifications: false,
          whatsappNotifications: false,
          twoFactorRequired: false,
          sessionTimeout: 30,
          passwordComplexity: true,
          ipWhitelist: false,
          auditLogging: true,
          suspiciousActivityAlerts: true,
          dataEncryption: true,
          apiRateLimit: 1000,
          maintenanceMode: false,
          autoBackup: true,
          backupFrequency: 'daily',
          paymentGateway: 'paystack',
          currency: 'ZAR',
          taxRate: 0.15,
          smsProvider: 'twilio',
          updatedBy: ctx.userId
        }
      });
    }

    return settings;
  }),

  // Update system settings
  update: adminProcedure
    .input(z.object({
      platformName: z.string().optional(),
      platformDescription: z.string().optional(),
      platformLogo: z.string().optional(),
      emailNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      whatsappNotifications: z.boolean().optional(),
      twoFactorRequired: z.boolean().optional(),
      sessionTimeout: z.number().min(5).max(480).optional(),
      passwordComplexity: z.boolean().optional(),
      ipWhitelist: z.boolean().optional(),
      auditLogging: z.boolean().optional(),
      suspiciousActivityAlerts: z.boolean().optional(),
      dataEncryption: z.boolean().optional(),
      apiRateLimit: z.number().min(100).max(10000).optional(),
      maintenanceMode: z.boolean().optional(),
      maintenanceMessage: z.string().optional(),
      autoBackup: z.boolean().optional(),
      backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
      paymentGateway: z.string().optional(),
      currency: z.string().optional(),
      taxRate: z.number().min(0).max(1).optional(),
      smtpHost: z.string().optional(),
      smtpPort: z.number().optional(),
      smtpUsername: z.string().optional(),
      smtpPassword: z.string().optional(),
      fromEmail: z.string().email().optional(),
      fromName: z.string().optional(),
      smsProvider: z.string().optional(),
      smsApiKey: z.string().optional(),
      smsApiSecret: z.string().optional(),
      smsFromNumber: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get current settings or create new ones
      const existingSettings = await ctx.db.systemSettings.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      const updatedSettings = await ctx.db.systemSettings.upsert({
        where: { id: existingSettings?.id || '' },
        update: {
          ...input,
          updatedBy: ctx.userId,
          updatedAt: new Date()
        },
        create: {
          ...input,
          updatedBy: ctx.userId
        }
      });

      // Log configuration change
      await ctx.db.securityEvent.create({
        data: {
          type: SecurityEventType.CONFIGURATION_CHANGE,
          severity: SecurityEventSeverity.MEDIUM,
          userId: ctx.userId,
          userEmail: ctx.user.email,
          description: 'System settings updated',
          ipAddress: ctx.req?.headers['x-forwarded-for'] as string || 'unknown',
          userAgent: ctx.req?.headers['user-agent'] || 'unknown',
          metadata: {
            changes: Object.keys(input),
            previousSettings: existingSettings ? Object.keys(existingSettings) : []
          }
        }
      });

      return updatedSettings;
    }),

  // Reset settings to defaults
  reset: adminProcedure.mutation(async ({ ctx }) => {
    const defaultSettings = {
      platformName: 'LaLiSure Insurance',
      platformDescription: null,
      platformLogo: null,
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: false,
      twoFactorRequired: false,
      sessionTimeout: 30,
      passwordComplexity: true,
      ipWhitelist: false,
      auditLogging: true,
      suspiciousActivityAlerts: true,
      dataEncryption: true,
      apiRateLimit: 1000,
      maintenanceMode: false,
      maintenanceMessage: null,
      autoBackup: true,
      backupFrequency: 'daily',
      paymentGateway: 'paystack',
      currency: 'ZAR',
      taxRate: 0.15,
      smtpHost: null,
      smtpPort: null,
      smtpUsername: null,
      smtpPassword: null,
      fromEmail: null,
      fromName: null,
      smsProvider: 'twilio',
      smsApiKey: null,
      smsApiSecret: null,
      smsFromNumber: null,
      updatedBy: ctx.userId
    };

    const resetSettings = await ctx.db.systemSettings.create({
      data: defaultSettings
    });

    // Log configuration reset
    await ctx.db.securityEvent.create({
      data: {
        type: SecurityEventType.CONFIGURATION_CHANGE,
        severity: SecurityEventSeverity.HIGH,
        userId: ctx.userId,
        userEmail: ctx.user.email,
        description: 'System settings reset to defaults',
        ipAddress: ctx.req?.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: ctx.req?.headers['user-agent'] || 'unknown',
        metadata: {
          action: 'reset_to_defaults'
        }
      }
    });

    return resetSettings;
  }),

  // Get settings history
  getHistory: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const settings = await ctx.db.systemSettings.findMany({
        orderBy: { updatedAt: 'desc' },
        take: input.limit,
        skip: input.offset,
        include: {
          updatedByUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      const total = await ctx.db.systemSettings.count();

      return {
        settings,
        total,
        hasMore: input.offset + input.limit < total
      };
    })
});
