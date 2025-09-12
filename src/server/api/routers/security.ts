import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '@/server/api/trpc';
import { SecurityEventType, SecurityEventSeverity } from '@prisma/client';

export const securityRouter = createTRPCRouter({
  // Get security events with filtering
  getEvents: adminProcedure
    .input(z.object({
      type: z.nativeEnum(SecurityEventType).optional(),
      severity: z.nativeEnum(SecurityEventSeverity).optional(),
      resolved: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.type) where.type = input.type;
      if (input.severity) where.severity = input.severity;
      if (input.resolved !== undefined) where.resolved = input.resolved;
      
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) where.createdAt.gte = input.startDate;
        if (input.endDate) where.createdAt.lte = input.endDate;
      }

      const [events, total] = await Promise.all([
        ctx.db.securityEvent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
            resolvedByUser: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }),
        ctx.db.securityEvent.count({ where })
      ]);

      return {
        events,
        total,
        hasMore: input.offset + input.limit < total
      };
    }),

  // Get security event statistics
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalEvents,
      unresolvedEvents,
      criticalEvents,
      recentEvents
    ] = await Promise.all([
      ctx.db.securityEvent.count(),
      ctx.db.securityEvent.count({ where: { resolved: false } }),
      ctx.db.securityEvent.count({ where: { severity: SecurityEventSeverity.CRITICAL } }),
      ctx.db.securityEvent.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    // Get events by type
    const eventsByType = await ctx.db.securityEvent.groupBy({
      by: ['type'],
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } }
    });

    // Get events by severity
    const eventsBySeverity = await ctx.db.securityEvent.groupBy({
      by: ['severity'],
      _count: { severity: true }
    });

    return {
      totalEvents,
      unresolvedEvents,
      criticalEvents,
      recentEvents,
      eventsByType,
      eventsBySeverity
    };
  }),

  // Resolve a security event
  resolveEvent: adminProcedure
    .input(z.object({
      eventId: z.string(),
      resolution: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.securityEvent.update({
        where: { id: input.eventId },
        data: {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy: ctx.userId,
          metadata: {
            ...(event?.metadata as any || {}),
            resolution: input.resolution
          }
        }
      });

      // Log the resolution
      await ctx.db.securityEvent.create({
        data: {
          type: SecurityEventType.SYSTEM_ACCESS,
          severity: SecurityEventSeverity.LOW,
          userId: ctx.userId,
          userEmail: ctx.user.email,
          description: `Security event ${input.eventId} resolved`,
          ipAddress: ctx.req?.headers['x-forwarded-for'] as string || 'unknown',
          userAgent: ctx.req?.headers['user-agent'] || 'unknown',
          metadata: {
            resolvedEventId: input.eventId,
            resolution: input.resolution
          }
        }
      });

      return event;
    }),

  // Create a security event (for logging)
  createEvent: adminProcedure
    .input(z.object({
      type: z.nativeEnum(SecurityEventType),
      severity: z.nativeEnum(SecurityEventSeverity),
      description: z.string(),
      userId: z.string().optional(),
      userEmail: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      metadata: z.any().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.securityEvent.create({
        data: {
          type: input.type,
          severity: input.severity,
          userId: input.userId,
          userEmail: input.userEmail,
          description: input.description,
          ipAddress: input.ipAddress || ctx.req?.headers['x-forwarded-for'] as string || 'unknown',
          userAgent: input.userAgent || ctx.req?.headers['user-agent'] || 'unknown',
          metadata: input.metadata
        }
      });

      return event;
    }),

  // Get security settings
  getSettings: adminProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db.systemSettings.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        twoFactorRequired: true,
        sessionTimeout: true,
        passwordComplexity: true,
        ipWhitelist: true,
        auditLogging: true,
        suspiciousActivityAlerts: true,
        dataEncryption: true,
        apiRateLimit: true
      }
    });

    return settings || {
      twoFactorRequired: false,
      sessionTimeout: 30,
      passwordComplexity: true,
      ipWhitelist: false,
      auditLogging: true,
      suspiciousActivityAlerts: true,
      dataEncryption: true,
      apiRateLimit: 1000
    };
  }),

  // Update security settings
  updateSettings: adminProcedure
    .input(z.object({
      twoFactorRequired: z.boolean().optional(),
      sessionTimeout: z.number().min(5).max(480).optional(),
      passwordComplexity: z.boolean().optional(),
      ipWhitelist: z.boolean().optional(),
      auditLogging: z.boolean().optional(),
      suspiciousActivityAlerts: z.boolean().optional(),
      dataEncryption: z.boolean().optional(),
      apiRateLimit: z.number().min(100).max(10000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
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
          platformName: 'LaLiSure Insurance',
          emailNotifications: true,
          smsNotifications: false,
          whatsappNotifications: false,
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

      // Log security settings change
      await ctx.db.securityEvent.create({
        data: {
          type: SecurityEventType.CONFIGURATION_CHANGE,
          severity: SecurityEventSeverity.HIGH,
          userId: ctx.userId,
          userEmail: ctx.user.email,
          description: 'Security settings updated',
          ipAddress: ctx.req?.headers['x-forwarded-for'] as string || 'unknown',
          userAgent: ctx.req?.headers['user-agent'] || 'unknown',
          metadata: {
            changes: Object.keys(input),
            previousSettings: existingSettings ? Object.keys(existingSettings) : []
          }
        }
      });

      return updatedSettings;
    })
});
