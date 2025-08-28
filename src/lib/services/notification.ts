import { db } from '@/lib/db';
import { EmailService, type PolicyNotificationData, type ClaimNotificationData, type PaymentNotificationData } from './email';
import { SmsService } from './sms';
import type { User, NotificationType, Notification } from '@prisma/client';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class NotificationService {
  /**
   * Create and deliver a notification to a user
   */
  static async create(data: CreateNotificationData): Promise<Notification> {
    // Create the notification record
    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
      },
    });

    // Get user with notification preferences
    const user = await db.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Deliver notification based on user preferences
    await this.deliver(notification, user);

    return notification;
  }

  /**
   * Deliver a notification through configured channels
   */
  static async deliver(notification: Notification, user: User): Promise<void> {
    const preferences = user.notificationPreferences;
    let emailSent = false;
    let smsSent = false;

    try {
      // Send email notification
      if (this.shouldSendEmail(notification.type, preferences)) {
        const emailResult = await this.sendEmailNotification(notification, user);
        emailSent = emailResult.success;
      }

      // Send SMS notification
      if (this.shouldSendSms(notification.type, preferences) && user.phone) {
        const smsResult = await this.sendSmsNotification(notification, user);
        smsSent = smsResult.success;
      }
    } catch (error) {
      console.error('Error delivering notification:', error);
    }

    // Update delivery status
    await db.notification.update({
      where: { id: notification.id },
      data: {
        emailSent,
        smsSent,
      },
    });
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(notification: Notification, user: User) {
    const data = notification.data as any;

    switch (notification.type) {
      case 'WELCOME':
        return EmailService.sendWelcomeEmail(user.email, user.firstName || 'Customer');

      case 'POLICY_CREATED':
        return EmailService.sendPolicyCreated(user.email, data as PolicyNotificationData);

      case 'POLICY_RENEWED':
        return EmailService.sendPolicyRenewal(user.email, data as PolicyNotificationData);

      case 'CLAIM_SUBMITTED':
        return EmailService.sendClaimSubmitted(user.email, data as ClaimNotificationData);

      case 'CLAIM_STATUS_UPDATE':
        return EmailService.sendClaimStatusUpdate(user.email, data as ClaimNotificationData);

      case 'PAYMENT_DUE':
        return EmailService.sendPaymentDue(user.email, data as PaymentNotificationData);

      case 'PAYMENT_CONFIRMED':
        return EmailService.sendPaymentConfirmation(user.email, data as PaymentNotificationData);

      default:
        // Generic email
        return EmailService.sendEmail({
          to: user.email,
          subject: notification.title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${notification.title}</h2>
              <p>${notification.message}</p>
            </div>
          `,
        });
    }
  }

  /**
   * Send SMS notification
   */
  private static async sendSmsNotification(notification: Notification, user: User) {
    if (!user.phone) {
      return { success: false, error: 'No phone number' };
    }

    const message = `${notification.title}: ${notification.message}`;
    return SmsService.sendSms(user.phone, message);
  }

  /**
   * Check if email should be sent based on preferences
   */
  private static shouldSendEmail(type: NotificationType, preferences?: any): boolean {
    if (!preferences?.email?.enabled) return false;

    switch (type) {
      case 'POLICY_CREATED':
      case 'POLICY_RENEWED':
      case 'POLICY_EXPIRING':
        return preferences.email.policyUpdates;
      case 'CLAIM_SUBMITTED':
      case 'CLAIM_STATUS_UPDATE':
        return preferences.email.claimUpdates;
      case 'PAYMENT_DUE':
        return preferences.email.paymentReminders;
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_FAILED':
        return preferences.email.paymentConfirmations;
      case 'WELCOME':
      case 'GENERAL':
        return true;
      default:
        return true;
    }
  }

  /**
   * Check if SMS should be sent based on preferences
   */
  private static shouldSendSms(type: NotificationType, preferences?: any): boolean {
    if (!preferences?.sms?.enabled) return false;

    switch (type) {
      case 'CLAIM_STATUS_UPDATE':
        return preferences.sms.urgentClaimUpdates;
      case 'PAYMENT_DUE':
        return preferences.sms.paymentReminders;
      case 'POLICY_EXPIRING':
        return preferences.sms.policyExpirations;
      default:
        return false;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    return db.notification.update({
      where: { id: notificationId, userId },
      data: { read: true, readAt: new Date() },
    });
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ) {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

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
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return db.notification.count({
      where: { userId, read: false },
    });
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }

  /**
   * Delete old notifications (cleanup job)
   */
  static async deleteOldNotifications(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        read: true,
      },
    });

    return result.count;
  }

  // Convenience methods for common notification types
  static async notifyPolicyCreated(userId: string, policyData: PolicyNotificationData) {
    return this.create({
      userId,
      type: 'POLICY_CREATED',
      title: 'Policy Created Successfully',
      message: `Your home insurance policy ${policyData.policyNumber} has been created.`,
      data: policyData,
    });
  }

  static async notifyClaimSubmitted(userId: string, claimData: ClaimNotificationData) {
    return this.create({
      userId,
      type: 'CLAIM_SUBMITTED',
      title: 'Claim Submitted',
      message: `Your claim ${claimData.claimNumber} has been submitted successfully.`,
      data: claimData,
    });
  }

  static async notifyClaimStatusUpdate(userId: string, claimData: ClaimNotificationData) {
    return this.create({
      userId,
      type: 'CLAIM_STATUS_UPDATE',
      title: 'Claim Status Update',
      message: `Your claim ${claimData.claimNumber} status has been updated to ${claimData.status}.`,
      data: claimData,
    });
  }

  static async notifyPaymentDue(userId: string, paymentData: PaymentNotificationData) {
    return this.create({
      userId,
      type: 'PAYMENT_DUE',
      title: 'Payment Due',
      message: `Your premium payment of $${paymentData.amount} is due on ${paymentData.dueDate}.`,
      data: paymentData,
    });
  }

  static async notifyPaymentConfirmed(userId: string, paymentData: PaymentNotificationData) {
    return this.create({
      userId,
      type: 'PAYMENT_CONFIRMED',
      title: 'Payment Confirmed',
      message: `Your payment of $${paymentData.amount} has been processed successfully.`,
      data: paymentData,
    });
  }

  static async sendWelcomeNotification(userId: string) {
    return this.create({
      userId,
      type: 'WELCOME',
      title: 'Welcome to Home Insurance!',
      message: 'Thank you for joining us. Your account is now active.',
    });
  }
}

export default NotificationService;