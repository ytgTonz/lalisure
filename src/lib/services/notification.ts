
import { db } from '@/lib/db';
import { Notification, NotificationType } from '@prisma/client';
import { EmailService } from './email';
import { SmsService } from './sms';

type NotificationData = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
  sendSms?: boolean;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
};

type EmailNotificationData = {
  userId: string;
  userEmail: string;
  userName: string;
  type: NotificationType;
  data: Record<string, any>;
};

type SmsNotificationData = {
  userId: string;
  userPhone: string;
  userName: string;
  type: NotificationType;
  data: Record<string, any>;
};

export const NotificationService = {
  async create(notificationData: NotificationData): Promise<Notification> {
    const { sendEmail = false, sendSms = false, userPhone, ...data } = notificationData;
    const notification = await db.notification.create({
      data,
    });

    // Send notifications asynchronously to not block the response
    if (sendEmail) {
      setImmediate(() => this.sendEmailNotification({
        userId: data.userId,
        userEmail: data.userEmail || '',
        userName: data.userName || '',
        type: data.type,
        data: data.data || {},
      }));
    }

    if (sendSms && userPhone) {
      setImmediate(() => this.sendSmsNotification({
        userId: data.userId,
        userPhone: userPhone,
        userName: data.userName || '',
        type: data.type,
        data: data.data || {},
      }));
    }

    return notification;
  },

  async sendEmailNotification(emailData: EmailNotificationData): Promise<void> {
    try {
      const templateName = this.getTemplateName(emailData.type);
      const variables = this.buildTemplateVariables(emailData);

      await EmailService.sendTemplateEmail(
        templateName,
        emailData.userEmail,
        emailData.userName,
        variables
      );

      // Update notification to mark email as sent
      await db.notification.updateMany({
        where: { userId: emailData.userId, type: emailData.type },
        data: { emailSent: true },
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
      // Don't throw error to avoid breaking the main flow
    }
  },

  async sendSmsNotification(smsData: SmsNotificationData): Promise<void> {
    try {
      const message = this.buildSmsMessage(smsData.type, smsData.data, smsData.userName);
      const result = await SmsService.sendSms(smsData.userPhone, message);

      if (result.success) {
        // Update notification to mark SMS as sent
        await db.notification.updateMany({
          where: { userId: smsData.userId, type: smsData.type },
          data: { smsSent: true },
        });
      }
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
      // Don't throw error to avoid breaking the main flow
    }
  },

  private getTemplateName(type: NotificationType): string {
    const templateMap: Record<string, string> = {
      'PAYMENT_CONFIRMED': 'payment_confirmed',
      'PAYMENT_DUE': 'payment_due',
      'CLAIM_SUBMITTED': 'claim_submitted',
      'CLAIM_STATUS_UPDATE': 'claim_status_update',
      'POLICY_CREATED': 'policy_created',
      'POLICY_RENEWAL': 'policy_renewal',
      'WELCOME': 'welcome',
    };

    return templateMap[type] || 'general';
  },

  private buildSmsMessage(type: NotificationType, data: Record<string, any>, userName: string): string {
    const companyName = 'Lalisure Insurance';
    
    switch (type) {
      case 'PAYMENT_CONFIRMED':
        return `${companyName}: Payment of R${data.amount} confirmed for policy ${data.policyNumber}. Thank you! ${userName}`;

      case 'PAYMENT_DUE':
        return `${companyName}: Payment of R${data.amount} due for policy ${data.policyNumber} by ${data.dueDate}. Pay now to avoid late fees. ${userName}`;

      case 'CLAIM_SUBMITTED':
        return `${companyName}: Claim ${data.claimNumber} submitted successfully. We'll review and update you soon. Track: bit.ly/claims ${userName}`;

      case 'CLAIM_STATUS_UPDATE':
        return `${companyName}: Claim ${data.claimNumber} status updated to ${data.status}. Check your account for details. ${userName}`;

      case 'POLICY_CREATED':
        return `${companyName}: Policy ${data.policyNumber} created! Coverage: R${data.coverageAmount}. Welcome to Lalisure! ${userName}`;

      case 'POLICY_RENEWAL':
        return `${companyName}: Policy ${data.policyNumber} renewed. Coverage continues seamlessly. Thank you for choosing Lalisure! ${userName}`;

      case 'POLICY_EXPIRING':
        return `${companyName}: URGENT - Policy ${data.policyNumber} expires ${data.expiryDate}. Renew now to maintain coverage. ${userName}`;

      case 'WELCOME':
        return `${companyName}: Welcome ${userName}! Your account is ready. Download our app or visit our portal to manage your insurance. Welcome aboard!`;

      default:
        return `${companyName}: Important update regarding your account. Please check your email or app for details. ${userName}`;
    }
  },

  private buildTemplateVariables(emailData: EmailNotificationData): Record<string, string> {
    const data = emailData.data;
    const baseVariables: Record<string, string> = {
      userName: emailData.userName,
      userEmail: emailData.userEmail,
      currentDate: new Date().toLocaleDateString(),
    };

    // Add type-specific variables
    switch (emailData.type) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_DUE':
        return {
          ...baseVariables,
          policyNumber: data.policyNumber || '',
          policyholderName: emailData.userName,
          amount: String(data.amount || 0),
          dueDate: data.dueDate || new Date().toLocaleDateString(),
          paymentMethod: data.paymentMethod || 'Card',
          transactionId: data.transactionId || '',
        };

      case 'CLAIM_SUBMITTED':
      case 'CLAIM_STATUS_UPDATE':
        return {
          ...baseVariables,
          claimNumber: data.claimNumber || '',
          policyNumber: data.policyNumber || '',
          policyholderName: emailData.userName,
          claimType: data.claimType || '',
          incidentDate: data.incidentDate || '',
          status: data.status || '',
          estimatedAmount: String(data.estimatedAmount || ''),
        };

      case 'POLICY_CREATED':
      case 'POLICY_RENEWAL':
        return {
          ...baseVariables,
          policyNumber: data.policyNumber || '',
          policyholderName: emailData.userName,
          coverageAmount: String(data.coverageAmount || 0),
          effectiveDate: data.effectiveDate || '',
          premiumAmount: String(data.premiumAmount || 0),
          expiryDate: data.expiryDate || '',
        };

      case 'WELCOME':
        return {
          ...baseVariables,
          accountType: data.accountType || 'Customer',
          loginUrl: data.loginUrl || `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
        };

      default:
        return baseVariables;
    }
  },

  async notifyPaymentConfirmed(
    userId: string,
    details: {
      amount: number;
      policyNumber: string;
      userEmail?: string;
      userName?: string;
      userPhone?: string;
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
      userPhone: details.userPhone,
      sendEmail: true,
      sendSms: !!details.userPhone,
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
      userPhone?: string;
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
      userPhone: details.userPhone,
      sendEmail: true,
      sendSms: !!details.userPhone,
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
      userPhone?: string;
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
      userPhone: details.userPhone,
      sendEmail: true,
      sendSms: !!details.userPhone,
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
      userPhone?: string;
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
      userPhone: details.userPhone,
      sendEmail: true,
      sendSms: !!details.userPhone,
    });
  },

  async notifyPaymentDue(
    userId: string,
    details: {
      amount: number;
      policyNumber: string;
      dueDate: string;
      userEmail?: string;
      userName?: string;
      userPhone?: string;
    }
  ) {
    await this.create({
      userId,
      type: 'PAYMENT_DUE',
      title: 'Payment Due Reminder',
      message: `Payment of R${details.amount} is due for policy ${details.policyNumber} on ${details.dueDate}.`,
      data: {
        amount: details.amount,
        policyNumber: details.policyNumber,
        dueDate: details.dueDate,
      },
      userEmail: details.userEmail,
      userName: details.userName,
      userPhone: details.userPhone,
      sendEmail: true,
      sendSms: !!details.userPhone,
    });
  },

  async notifyWelcome(
    userId: string,
    details: {
      userEmail: string;
      userName: string;
      userPhone?: string;
    }
  ) {
    await this.create({
      userId,
      type: 'WELCOME',
      title: 'Welcome to Lalisure Insurance!',
      message: 'Welcome to our home insurance platform. Your account has been created successfully.',
      data: {},
      userEmail: details.userEmail,
      userName: details.userName,
      userPhone: details.userPhone,
      sendEmail: true,
      sendSms: !!details.userPhone,
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
