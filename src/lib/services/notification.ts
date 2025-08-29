
import { db } from '@/lib/db';
import { Notification, NotificationType } from '@prisma/client';

type NotificationData = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
};

export const NotificationService = {
  async create(notificationData: NotificationData): Promise<Notification> {
    return db.notification.create({
      data: notificationData,
    });
  },

  async notifyPaymentConfirmed(userId: string, details: { amount: number; policyNumber: string }) {
    await this.create({
      userId,
      type: 'PAYMENT_CONFIRMED',
      title: 'Payment Confirmed',
      message: `Your payment of $${details.amount} for policy ${details.policyNumber} has been confirmed.`,
      data: {
        amount: details.amount,
        policyNumber: details.policyNumber,
      },
    });
  },

  async getUserNotifications(userId: string, { limit = 20, offset = 0, unreadOnly = false }) {
    const where = {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    };

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      hasMore: total > offset + notifications.length,
    };
  },

  async getUnreadCount(userId: string): Promise<number> {
    return db.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  },

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    return db.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  },

  async markAllAsRead(userId: string) {
    await db.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return { success: true };
  },
};
