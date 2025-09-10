
import { db } from '@/lib/db';
import { Notification, NotificationType } from '@prisma/client';
import { EmailService } from './email';

type NotificationData = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
  userEmail?: string;
  userName?: string;
};

type EmailNotificationData = {
  userId: string;
  userEmail: string;
  userName: string;
  type: NotificationType;
  data: Record<string, any>;
};

export const NotificationService = {
  async create(notificationData: NotificationData): Promise<Notification> {
    const { sendEmail = false, ...data } = notificationData;
    const notification = await db.notification.create({
      data,
    });

    // If email notification is requested, send it asynchronously
    if (sendEmail) {
      // Send email asynchronously to not block the response
      setImmediate(() => this.sendEmailNotification({
        userId: data.userId,
        userEmail: data.userEmail || '',
        userName: data.userName || '',
        type: data.type,
        data: data.data || {},
      }));
    }

    return notification;
  },

  async sendEmailNotification(emailData: EmailNotificationData): Promise<void> {
    try {
      switch (emailData.type) {
        case 'PAYMENT_CONFIRMED':
          await EmailService.sendPaymentConfirmation(emailData.userEmail, {
            policyNumber: emailData.data.policyNumber,
            policyholderName: emailData.userName,
            amount: emailData.data.amount,
            dueDate: emailData.data.dueDate || new Date().toLocaleDateString(),
            paymentMethod: emailData.data.paymentMethod,
          });
          break;

        case 'PAYMENT_DUE':
          await EmailService.sendPaymentDue(emailData.userEmail, {
            policyNumber: emailData.data.policyNumber,
            policyholderName: emailData.userName,
            amount: emailData.data.amount,
            dueDate: emailData.data.dueDate,
            paymentMethod: emailData.data.paymentMethod,
          });
          break;

        case 'CLAIM_SUBMITTED':
          await EmailService.sendClaimSubmitted(emailData.userEmail, {
            claimNumber: emailData.data.claimNumber,
            policyNumber: emailData.data.policyNumber,
            policyholderName: emailData.userName,
            claimType: emailData.data.claimType,
            incidentDate: emailData.data.incidentDate,
            status: emailData.data.status,
            estimatedAmount: emailData.data.estimatedAmount,
          });
          break;

        case 'CLAIM_STATUS_UPDATE':
          await EmailService.sendClaimStatusUpdate(emailData.userEmail, {
            claimNumber: emailData.data.claimNumber,
            policyNumber: emailData.data.policyNumber,
            policyholderName: emailData.userName,
            claimType: emailData.data.claimType,
            incidentDate: emailData.data.incidentDate,
            status: emailData.data.status,
            estimatedAmount: emailData.data.estimatedAmount,
          });
          break;

        case 'POLICY_CREATED':
          await EmailService.sendPolicyCreated(emailData.userEmail, {
            policyNumber: emailData.data.policyNumber,
            policyholderName: emailData.userName,
            coverageAmount: emailData.data.coverageAmount,
            effectiveDate: emailData.data.effectiveDate,
            premiumAmount: emailData.data.premiumAmount,
          });
          break;

        case 'WELCOME':
          await EmailService.sendWelcomeEmail(emailData.userEmail, emailData.userName);
          break;
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
      // Don't throw error to avoid breaking the main flow
    }
  },

  async notifyPaymentConfirmed(
    userId: string,
    details: {
      amount: number;
      policyNumber: string;
      userEmail?: string;
      userName?: string;
      dueDate?: string;
      paymentMethod?: string;
    }
  ) {
    await this.create({
      userId,
      type: 'PAYMENT_CONFIRMED',
      title: 'Payment Confirmed',
      message: `Your payment of R${details.amount} for policy ${details.policyNumber} has been confirmed.`,
      data: {
        amount: details.amount,
        policyNumber: details.policyNumber,
        dueDate: details.dueDate,
        paymentMethod: details.paymentMethod,
      },
      userEmail: details.userEmail,
      userName: details.userName,
      sendEmail: true,
    });
  },

  async notifyClaimSubmitted(
    userId: string,
    details: {
      claimNumber: string;
      policyNumber: string;
      claimType: string;
      incidentDate: string;
      status: string;
      estimatedAmount?: number;
      userEmail?: string;
      userName?: string;
    }
  ) {
    await this.create({
      userId,
      type: 'CLAIM_SUBMITTED',
      title: 'Claim Submitted Successfully',
      message: `Your claim ${details.claimNumber} for ${details.claimType} has been submitted and is under review.`,
      data: {
        claimNumber: details.claimNumber,
        policyNumber: details.policyNumber,
        claimType: details.claimType,
        incidentDate: details.incidentDate,
        status: details.status,
        estimatedAmount: details.estimatedAmount,
      },
      userEmail: details.userEmail,
      userName: details.userName,
      sendEmail: true,
    });
  },

  async notifyClaimStatusUpdate(
    userId: string,
    details: {
      claimNumber: string;
      policyNumber: string;
      claimType: string;
      incidentDate: string;
      status: string;
      estimatedAmount?: number;
      userEmail?: string;
      userName?: string;
    }
  ) {
    await this.create({
      userId,
      type: 'CLAIM_STATUS_UPDATE',
      title: 'Claim Status Updated',
      message: `Your claim ${details.claimNumber} status has been updated to: ${details.status}`,
      data: {
        claimNumber: details.claimNumber,
        policyNumber: details.policyNumber,
        claimType: details.claimType,
        incidentDate: details.incidentDate,
        status: details.status,
        estimatedAmount: details.estimatedAmount,
      },
      userEmail: details.userEmail,
      userName: details.userName,
      sendEmail: true,
    });
  },

  async notifyPolicyCreated(
    userId: string,
    details: {
      policyNumber: string;
      coverageAmount: number;
      effectiveDate: string;
      premiumAmount: number;
      userEmail?: string;
      userName?: string;
    }
  ) {
    await this.create({
      userId,
      type: 'POLICY_CREATED',
      title: 'Policy Created Successfully',
      message: `Your home insurance policy ${details.policyNumber} has been created and is now active.`,
      data: {
        policyNumber: details.policyNumber,
        coverageAmount: details.coverageAmount,
        effectiveDate: details.effectiveDate,
        premiumAmount: details.premiumAmount,
      },
      userEmail: details.userEmail,
      userName: details.userName,
      sendEmail: true,
    });
  },

  async notifyWelcome(
    userId: string,
    details: {
      userEmail: string;
      userName: string;
    }
  ) {
    await this.create({
      userId,
      type: 'WELCOME',
      title: 'Welcome to Home Insurance!',
      message: 'Welcome to our home insurance platform. Your account has been created successfully.',
      data: {},
      userEmail: details.userEmail,
      userName: details.userName,
      sendEmail: true,
    });
  },

  async notifyInvitation(
    details: {
      inviteeEmail: string;
      inviterName: string;
      role: string;
      department?: string;
      message?: string;
      acceptUrl: string;
      expiresAt: string;
    }
  ) {
    // Send invitation email directly (not stored as notification)
    const { EmailService } = await import('./email');
    await EmailService.sendInvitationEmail(details);
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
