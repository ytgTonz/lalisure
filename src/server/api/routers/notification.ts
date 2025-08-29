import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

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
  // Get unread notification count (simplified version)
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const count = await ctx.db.notification.count({
          where: { 
            userId: ctx.user.id,
            read: false 
          },
        });
        return count;
      } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }
    }),

  // Get user notifications with pagination (simplified version)
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where = {
          userId: ctx.user.id,
          ...(input.unreadOnly ? { read: false } : {}),
        };

        const [notifications, total] = await Promise.all([
          ctx.db.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: input.limit,
            skip: input.offset,
          }),
          ctx.db.notification.count({ where }),
        ]);

        return {
          notifications,
          total,
          hasMore: total > input.offset + notifications.length,
        };
      } catch (error) {
        console.error('Error getting notifications:', error);
        return {
          notifications: [],
          total: 0,
          hasMore: false,
        };
      }
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.notification.update({
          where: { 
            id: input.notificationId,
            userId: ctx.user.id, // Ensure user owns the notification
          },
          data: { 
            read: true, 
            readAt: new Date() 
          },
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        throw new Error('Failed to mark notification as read');
      }
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        await ctx.db.notification.updateMany({
          where: { 
            userId: ctx.user.id, 
            read: false 
          },
          data: { 
            read: true, 
            readAt: new Date() 
          },
        });
        return { success: true };
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw new Error('Failed to mark all notifications as read');
      }
    }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.notification.deleteMany({
          where: {
            id: input.notificationId,
            userId: ctx.user.id, // Ensure user owns the notification
          },
        });
        return { success: true };
      } catch (error) {
        console.error('Error deleting notification:', error);
        throw new Error('Failed to delete notification');
      }
    }),

  // Get notification preferences
  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      try {
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
      } catch (error) {
        console.error('Error getting preferences:', error);
        // Return default preferences on error
        return {
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
      }
    }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(notificationPreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.user.update({
          where: { id: ctx.user.id },
          data: {
            notificationPreferences: input,
          },
          select: { notificationPreferences: true },
        });
      } catch (error) {
        console.error('Error updating preferences:', error);
        throw new Error('Failed to update notification preferences');
      }
    }),

  // Create a simple test notification
  createTestNotification: protectedProcedure
    .input(
      z.object({
        title: z.string().default('Test Notification'),
        message: z.string().default('This is a test notification'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const notification = await ctx.db.notification.create({
          data: {
            userId: ctx.user.id,
            type: 'GENERAL',
            title: input.title,
            message: input.message,
            data: { test: true },
            read: false,
          },
        });

        return { success: true, notificationId: notification.id };
      } catch (error) {
        console.error('Error creating test notification:', error);
        throw new Error('Failed to create test notification');
      }
    }),
});