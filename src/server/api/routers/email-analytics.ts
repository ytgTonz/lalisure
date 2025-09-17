import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '@/server/api/trpc';
import { EmailService } from '@/lib/services/email';
import { EmailType } from '@prisma/client';

export const emailAnalyticsRouter = createTRPCRouter({
  // Get email analytics overview
  getOverview: adminProcedure
    .input(z.object({
      timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
    }))
    .query(async ({ input }) => {
      const now = new Date();
      const startDate = new Date();

      switch (input.timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const analytics = await EmailService.getEmailAnalytics({
        startDate,
        endDate: now
      });

      return analytics;
    }),

  // Get email analytics by type
  getByType: adminProcedure
    .input(z.object({
      timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
    }))
    .query(async ({ input }) => {
      const now = new Date();
      const startDate = new Date();

      switch (input.timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const emailTypes = [
        EmailType.INVITATION,
        EmailType.NOTIFICATION,
        EmailType.WELCOME,
        EmailType.POLICY_UPDATE,
        EmailType.CLAIM_UPDATE,
        EmailType.PAYMENT_REMINDER
      ];

      const analyticsByType = await Promise.all(
        emailTypes.map(async (type) => {
          const analytics = await EmailService.getEmailAnalytics({
            startDate,
            endDate: now,
            type
          });
          return {
            type,
            ...analytics
          };
        })
      );

      return analyticsByType;
    }),

  // Get email delivery trends
  getDeliveryTrends: adminProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(30),
    }))
    .query(async ({ input }) => {
      const trends = [];
      const { db } = await import('@/lib/db');

      for (let i = input.days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const [
          sent,
          delivered,
          opened,
          clicked,
          bounced
        ] = await Promise.all([
          db.email.count({
            where: {
              sentAt: { gte: startOfDay, lte: endOfDay }
            }
          }),
          db.email.count({
            where: {
              deliveredAt: { gte: startOfDay, lte: endOfDay }
            }
          }),
          db.email.count({
            where: {
              openedAt: { gte: startOfDay, lte: endOfDay }
            }
          }),
          db.email.count({
            where: {
              clickedAt: { gte: startOfDay, lte: endOfDay }
            }
          }),
          db.email.count({
            where: {
              bouncedAt: { gte: startOfDay, lte: endOfDay }
            }
          })
        ]);

        trends.push({
          date: startOfDay.toISOString().split('T')[0],
          sent,
          delivered,
          opened,
          clicked,
          bounced
        });
      }

      return trends;
    }),

  // Get failed emails
  getFailedEmails: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const { db } = await import('@/lib/db');

      const [emails, total] = await Promise.all([
        db.email.findMany({
          where: {
            status: 'FAILED'
          },
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
            }
          }
        }),
        db.email.count({
          where: {
            status: 'FAILED'
          }
        })
      ]);

      return {
        emails,
        total,
        hasMore: total > input.offset + input.limit
      };
    }),

  // Retry failed emails
  retryFailedEmails: adminProcedure.mutation(async () => {
    await EmailService.retryFailedEmails();
    return { success: true };
  }),

  // Get email performance metrics
  getPerformanceMetrics: adminProcedure.query(async () => {
    const { db } = await import('@/lib/db');

    // Get metrics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalEmails,
      avgDeliveryTime,
      avgOpenTime,
      topPerformingTemplates
    ] = await Promise.all([
      // Total emails sent
      db.email.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),

      // Average delivery time (in minutes)
      db.email.aggregate({
        where: {
          deliveredAt: { not: null },
          createdAt: { gte: thirtyDaysAgo }
        },
        _avg: {
          deliveredAt: true,
          createdAt: true
        }
      }),

      // Average time to open (in hours)
      db.email.aggregate({
        where: {
          openedAt: { not: null },
          deliveredAt: { not: null },
          createdAt: { gte: thirtyDaysAgo }
        },
        _avg: {
          openedAt: true,
          deliveredAt: true
        }
      }),

      // Top performing templates by open rate
      db.$queryRaw<Array<{ templateId: string; name: string; openRate: number; totalSent: number }>>`
        SELECT
          e.templateId,
          t.name,
          (COUNT(CASE WHEN e.status = 'OPENED' THEN 1 END) * 100.0 / COUNT(*)) as openRate,
          COUNT(*) as totalSent
        FROM Email e
        LEFT JOIN EmailTemplate t ON e.templateId = t.id
        WHERE e.createdAt >= ${thirtyDaysAgo}
          AND e.templateId IS NOT NULL
        GROUP BY e.templateId, t.name
        ORDER BY openRate DESC
        LIMIT 10
      `
    ]);

    // Calculate average delivery time
    let avgDeliveryMinutes = 0;
    if (avgDeliveryTime._avg.deliveredAt && avgDeliveryTime._avg.createdAt) {
      const deliveryTime = new Date(avgDeliveryTime._avg.deliveredAt).getTime() -
                          new Date(avgDeliveryTime._avg.createdAt).getTime();
      avgDeliveryMinutes = deliveryTime / (1000 * 60); // Convert to minutes
    }

    // Calculate average open time
    let avgOpenHours = 0;
    if (avgOpenTime._avg.openedAt && avgOpenTime._avg.deliveredAt) {
      const openTime = new Date(avgOpenTime._avg.openedAt).getTime() -
                      new Date(avgOpenTime._avg.deliveredAt).getTime();
      avgOpenHours = openTime / (1000 * 60 * 60); // Convert to hours
    }

    return {
      totalEmailsSent: totalEmails,
      avgDeliveryTime: Math.round(avgDeliveryMinutes * 100) / 100, // Round to 2 decimal places
      avgOpenTime: Math.round(avgOpenHours * 100) / 100,
      topTemplates: topPerformingTemplates
    };
  })
});
