import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { NotificationService } from '@/lib/services/notification';

const notificationPreferencesSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    policyUpdates: z.boolean(),
    claimUpdates: z.boolean(),
    paymentReminders: z.boolean(),
    paymentConfirmations: z.boolean(),
    marketingEmails: z.boolean(),
  }),
  sms: z.object({
    enabled: z.boolean(),
    urgentClaimUpdates: z.boolean(),
    paymentReminders: z.boolean(),
    policyExpirations: z.boolean(),
  }),
  push: z.object({
    enabled: z.boolean(),
    policyUpdates: z.boolean(),
    claimUpdates: z.boolean(),
    paymentReminders: z.boolean(),
  }),
});

export const notificationRouter = createTRPCRouter({
  // Get user notifications with pagination
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      return NotificationService.getUserNotifications(ctx.user.id, input);
    }),

  // Get unread notification count
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      return NotificationService.getUnreadCount(ctx.user.id);
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return NotificationService.markAsRead(input.notificationId, ctx.user.id);
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      await NotificationService.markAllAsRead(ctx.user.id);
      return { success: true };
    }),

  // Get user notification preferences
  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { notificationPreferences: true },
      });

      // Return default preferences if none exist
      return user?.notificationPreferences || {
        email: {
          enabled: true,
          policyUpdates: true,
          claimUpdates: true,
          paymentReminders: true,
          paymentConfirmations: true,
          marketingEmails: false,
        },
        sms: {
          enabled: false,
          urgentClaimUpdates: false,
          paymentReminders: false,
          policyExpirations: false,
        },
        push: {
          enabled: true,
          policyUpdates: true,
          claimUpdates: true,
          paymentReminders: true,
        },
      };
    }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(notificationPreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          notificationPreferences: input,
        },
        select: { notificationPreferences: true },
      });
    }),

  // Send test notification (for development/testing)
  sendTestNotification: protectedProcedure
    .input(
      z.object({
        type: z.enum(['email', 'sms', 'both']).default('email'),
        message: z.string().optional().default('This is a test notification'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create test notification
      const notification = await NotificationService.create({
        userId: ctx.user.id,
        type: 'GENERAL',
        title: 'Test Notification',
        message: input.message,
      });

      return { success: true, notificationId: notification.id };
    }),

  // Create manual notification (admin only)
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum([
          'POLICY_CREATED',
          'POLICY_RENEWED',
          'POLICY_EXPIRING',
          'CLAIM_SUBMITTED',
          'CLAIM_STATUS_UPDATE',
          'PAYMENT_DUE',
          'PAYMENT_CONFIRMED',
          'PAYMENT_FAILED',
          'WELCOME',
          'GENERAL',
        ]),
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(1000),
        data: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission (admin/agent only)
      if (!['ADMIN', 'AGENT'].includes(ctx.user.role)) {
        throw new Error('Insufficient permissions');
      }

      return NotificationService.create(input);
    }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Users can only delete their own notifications
      await ctx.db.notification.deleteMany({
        where: {
          id: input.notificationId,
          userId: ctx.user.id,
        },
      });

      return { success: true };
    }),

  // Bulk operations
  bulkMarkAsRead: protectedProcedure
    .input(z.object({ notificationIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.notification.updateMany({
        where: {
          id: { in: input.notificationIds },
          userId: ctx.user.id,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return { success: true };
    }),

  bulkDelete: protectedProcedure
    .input(z.object({ notificationIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.notification.deleteMany({
        where: {
          id: { in: input.notificationIds },
          userId: ctx.user.id,
        },
      });

      return { success: true };
    }),

  // Get notification statistics (for admin dashboard)
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Only admin/agents can view stats
      if (!['ADMIN', 'AGENT'].includes(ctx.user.role)) {
        throw new Error('Insufficient permissions');
      }

      const stats = await ctx.db.notification.groupBy({
        by: ['type'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      });

      const totalNotifications = await ctx.db.notification.count();
      const unreadNotifications = await ctx.db.notification.count({
        where: { read: false },
      });

      return {
        totalNotifications,
        unreadNotifications,
        readRate: totalNotifications > 0 ? 
          ((totalNotifications - unreadNotifications) / totalNotifications) * 100 : 0,
        typeBreakdown: stats.map(stat => ({
          type: stat.type,
          count: stat._count.id,
        })),
      };
    }),
});