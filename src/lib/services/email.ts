import { Resend } from 'resend';
import { db } from '@/lib/db';
import { EmailStatus, EmailType } from '@prisma/client';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface PolicyNotificationData {
  policyNumber: string;
  policyholderName: string;
  coverageAmount: number;
  effectiveDate: string;
  premiumAmount: number;
}

export interface ClaimNotificationData {
  claimNumber: string;
  policyNumber: string;
  policyholderName: string;
  claimType: string;
  incidentDate: string;
  status: string;
  estimatedAmount?: number;

}

export interface PaymentNotificationData {
  policyNumber: string;
  policyholderName: string;
  amount: number;
  dueDate: string;
  paymentMethod?: string;
}

export interface InvitationNotificationData {
  inviteeEmail: string;
  inviterName: string;
  role: string;
  department?: string;
  message?: string;
  acceptUrl: string;
  expiresAt: string;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@homeinsurance.com';

export class EmailService {
  /**
   * Send email with tracking and queue support
   */
  static async sendEmail({ to, from = FROM_EMAIL, subject, html, text }: EmailTemplate) {
    try {
      const result = await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        react: undefined,
      });

      return { success: true, data: result };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send email with database tracking
   */
  static async sendTrackedEmail({
    to,
    from = FROM_EMAIL,
    subject,
    html,
    text,
    type,
    userId,
    templateId,
    metadata
  }: {
    to: string | string[];
    from?: string;
    subject: string;
    html?: string;
    text?: string;
    type: EmailType;
    userId?: string;
    templateId?: string;
    metadata?: any;
  }) {
    const recipients = Array.isArray(to) ? to : [to];

    // Create email records in database
    const emailRecords = await Promise.all(
      recipients.map(recipient =>
        db.email.create({
          data: {
            type,
            to: recipient,
            from,
            subject,
            htmlContent: html,
            textContent: text,
            userId,
            templateId,
            metadata,
            status: EmailStatus.PENDING
          }
        })
      )
    );

    // Send emails
    const results = [];
    for (let i = 0; i < recipients.length; i++) {
      const result = await this.sendEmail({
        to: recipients[i],
        from,
        subject,
        html,
        text
      });

      const emailRecord = emailRecords[i];

      if (result.success) {
        await db.email.update({
          where: { id: emailRecord.id },
          data: {
            status: EmailStatus.SENT,
            messageId: result.data?.id,
            sentAt: new Date()
          }
        });
      } else {
        await db.email.update({
          where: { id: emailRecord.id },
          data: {
            status: EmailStatus.FAILED,
            errorMessage: result.error,
            retryCount: { increment: 1 }
          }
        });
      }

      results.push(result);
    }

    return results;
  }

  // Send email using database template
  static async sendTemplateEmail(
    templateName: string,
    recipientEmail: string,
    recipientName: string,
    variables: Record<string, string> = {}
  ) {
    try {
      // Try to get template from database first
      const db = (await import('@/lib/db')).db;
      const template = await db.emailTemplate.findUnique({
        where: { name: templateName },
      });

      if (template && template.isActive) {
        // Use database template
        let subject = template.subject;
        let htmlContent = template.htmlContent;
        let textContent = template.textContent;

        // Replace variables in subject
        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          subject = subject.replace(regex, value);
          htmlContent = htmlContent.replace(regex, value);
          if (textContent) {
            textContent = textContent.replace(regex, value);
          }
        });

        return this.sendEmail({
          to: recipientEmail,
          subject,
          html: htmlContent,
          text: textContent,
        });
      } else {
        // Fall back to hardcoded templates
        return this.sendFallbackTemplate(templateName, recipientEmail, recipientName, variables);
      }
    } catch (error) {
      console.error('Template email failed:', error);
      // Fall back to hardcoded templates
      return this.sendFallbackTemplate(templateName, recipientEmail, recipientName, variables);
    }
  }

  private static async sendFallbackTemplate(
    templateName: string,
    recipientEmail: string,
    recipientName: string,
    variables: Record<string, string>
  ) {
    // Use the existing hardcoded templates as fallback
    const templateMap: Record<string, { subject: string; html: string }> = {
      claim_submitted: {
        subject: 'Claim {{claimNumber}} Submitted Successfully',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Claim Submitted Successfully</h2>
            <p>Dear ${recipientName},</p>
            <p>Your claim has been successfully submitted and is now under review.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Claim Details</h3>
              <p><strong>Claim Number:</strong> {{claimNumber}}</p>
              <p><strong>Policy:</strong> {{policyNumber}}</p>
              <p><strong>Type:</strong> {{claimType}}</p>
              <p><strong>Incident Date:</strong> {{incidentDate}}</p>
              {{#if estimatedAmount}}<p><strong>Estimated Amount:</strong> R{{estimatedAmount}}</p>{{/if}}
            </div>
            <p>We'll contact you within 24-48 hours with an update.</p>
            <p>Best regards,<br>Claims Team</p>
          </div>
        `,
      },
      // Add other fallback templates here...
    };

    const template = templateMap[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    let subject = template.subject;
    let html = template.html;

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      subject = subject.replace(regex, value);
      html = html.replace(regex, value);
    });

    // Replace recipient name
    html = html.replace(/\$\{recipientName\}/g, recipientName);

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html,
    });
  }

  // Policy-related emails
  static async sendPolicyCreated(email: string, data: PolicyNotificationData) {
    const subject = `Policy ${data.policyNumber} Created - Welcome to Home Insurance`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Home Insurance!</h2>
        <p>Dear ${data.policyholderName},</p>
        <p>Your home insurance policy has been successfully created. Here are the details:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Policy Information</h3>
          <p><strong>Policy Number:</strong> ${data.policyNumber}</p>
          <p><strong>Coverage Amount:</strong> R${data.coverageAmount.toLocaleString()}</p>
          <p><strong>Effective Date:</strong> ${data.effectiveDate}</p>
          <p><strong>Premium Amount:</strong> R${data.premiumAmount.toLocaleString()}</p>
        </div>
        
        <p>Your policy documents will be available in your dashboard. If you have any questions, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>Home Insurance Team</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  static async sendPolicyRenewal(email: string, data: PolicyNotificationData) {
    const subject = `Policy ${data.policyNumber} Renewal Reminder`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Policy Renewal Reminder</h2>
        <p>Dear ${data.policyholderName},</p>
        <p>Your home insurance policy is up for renewal. Please review the details below:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Renewal Information</h3>
          <p><strong>Policy Number:</strong> ${data.policyNumber}</p>
          <p><strong>Coverage Amount:</strong> R${data.coverageAmount.toLocaleString()}</p>
          <p><strong>Renewal Date:</strong> ${data.effectiveDate}</p>
          <p><strong>Premium Amount:</strong> R${data.premiumAmount.toLocaleString()}</p>
        </div>
        
        <p style="color: #dc2626;"><strong>Action Required:</strong> Please log in to your account to review and accept your renewal terms.</p>
        
        <p>Best regards,<br>Home Insurance Team</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Claim-related emails
  static async sendClaimSubmitted(email: string, data: ClaimNotificationData) {
    const subject = `Claim ${data.claimNumber} Submitted Successfully`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Claim Submitted</h2>
        <p>Dear ${data.policyholderName},</p>
        <p>Your home insurance claim has been successfully submitted. Here are the details:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Claim Information</h3>
          <p><strong>Claim Number:</strong> ${data.claimNumber}</p>
          <p><strong>Policy Number:</strong> ${data.policyNumber}</p>
          <p><strong>Claim Type:</strong> ${data.claimType}</p>
          <p><strong>Incident Date:</strong> ${data.incidentDate}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          ${data.estimatedAmount ? `<p><strong>Estimated Amount:</strong> R${data.estimatedAmount.toLocaleString()}</p>` : ''}
        </div>
        
        <p>Our claims team will review your submission and contact you within 24-48 hours. You can track your claim status in your dashboard.</p>
        
        <p>Best regards,<br>Home Insurance Claims Team</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  static async sendClaimStatusUpdate(email: string, data: ClaimNotificationData) {
    const subject = `Claim ${data.claimNumber} Status Update`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Claim Status Update</h2>
        <p>Dear ${data.policyholderName},</p>
        <p>There's an update on your home insurance claim:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Updated Claim Information</h3>
          <p><strong>Claim Number:</strong> ${data.claimNumber}</p>
          <p><strong>Policy Number:</strong> ${data.policyNumber}</p>
          <p><strong>New Status:</strong> <span style="color: #059669; font-weight: bold;">${data.status}</span></p>
          ${data.estimatedAmount ? `<p><strong>Settlement Amount:</strong> R${data.estimatedAmount.toLocaleString()}</p>` : ''}
        </div>
        
        <p>Please log in to your dashboard for more details and any required actions.</p>
        
        <p>Best regards,<br>Home Insurance Claims Team</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Payment-related emails
  static async sendPaymentDue(email: string, data: PaymentNotificationData) {
    const subject = `Payment Due - Policy ${data.policyNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Payment Due</h2>
        <p>Dear ${data.policyholderName},</p>
        <p>Your premium payment is due soon:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Information</h3>
          <p><strong>Policy Number:</strong> ${data.policyNumber}</p>
          <p><strong>Amount Due:</strong> R${data.amount.toLocaleString()}</p>
          <p><strong>Due Date:</strong> ${data.dueDate}</p>
          ${data.paymentMethod ? `<p><strong>Payment Method:</strong> ${data.paymentMethod}</p>` : ''}
        </div>
        
        <p style="color: #dc2626;"><strong>Action Required:</strong> Please make your payment before the due date to avoid policy cancellation.</p>
        
        <p>Best regards,<br>Home Insurance Billing Team</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  static async sendPaymentConfirmation(email: string, data: PaymentNotificationData) {
    const subject = `Payment Confirmation - Policy ${data.policyNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Payment Confirmed</h2>
        <p>Dear ${data.policyholderName},</p>
        <p>Your payment has been successfully processed:</p>
        
        <div style="background-color: #f0f9f4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #059669;">Payment Details</h3>
          <p><strong>Policy Number:</strong> ${data.policyNumber}</p>
          <p><strong>Amount Paid:</strong> R${data.amount.toLocaleString()}</p>
          <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
          ${data.paymentMethod ? `<p><strong>Payment Method:</strong> ${data.paymentMethod}</p>` : ''}
        </div>
        
        <p>Thank you for your payment. Your policy remains active and in good standing.</p>
        
        <p>Best regards,<br>Home Insurance Billing Team</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Generate invitation HTML
  static generateInvitationHtml(data: InvitationNotificationData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">You're Invited to Join Our Team</h2>
        <p>Dear colleague,</p>
        <p>You've been invited to join the Home Insurance Platform as a <strong>${data.role}</strong>.</p>

        ${data.department ? `<p><strong>Department:</strong> ${data.department}</p>` : ''}

        ${data.message ? `
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Personal Message from ${data.inviterName}:</h3>
            <p style="font-style: italic;">"${data.message}"</p>
          </div>
        ` : ''}

        <div style="background-color: #f0f9f4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #059669;">Your Role & Responsibilities</h3>
          <p>As a <strong>${data.role}</strong>, you'll have access to:</p>
          <ul>
            ${data.role === 'AGENT' ? `
              <li>Customer management dashboard</li>
              <li>Policy creation and management tools</li>
              <li>Claims processing capabilities</li>
              <li>Quote generation system</li>
            ` : data.role === 'ADMIN' ? `
              <li>System administration dashboard</li>
              <li>User management and permissions</li>
              <li>Analytics and reporting tools</li>
              <li>Security and compliance controls</li>
            ` : data.role === 'UNDERWRITER' ? `
              <li>Risk assessment tools</li>
              <li>Policy underwriting workflows</li>
              <li>Claims investigation interface</li>
              <li>Decision-making support systems</li>
            ` : `
              <li>Access to team collaboration tools</li>
              <li>Project management features</li>
              <li>Communication and support tools</li>
            `}
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.acceptUrl}" style="
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          ">Accept Invitation</a>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>Important:</strong> This invitation expires on ${new Date(data.expiresAt).toLocaleDateString()}.
            Please accept it before the expiration date.
          </p>
        </div>

        <p>If you have any questions about this invitation or need assistance, please contact your IT support team.</p>

        <p>Best regards,<br>Home Insurance Platform Team</p>
      </div>
    `;
  }

  // Invitation emails (legacy method for backward compatibility)
  static async sendInvitationEmail(data: InvitationNotificationData) {
    const subject = `You're invited to join Home Insurance Platform - ${data.role} Role`;
    const html = this.generateInvitationHtml(data);

    return this.sendTrackedEmail({
      to: data.inviteeEmail,
      subject,
      html,
      type: EmailType.INVITATION,
      metadata: data
    });
  }

  // Welcome and general emails
  static async sendWelcomeEmail(email: string, name: string, userId?: string) {
    const subject = 'Welcome to Home Insurance Platform';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Home Insurance!</h2>
        <p>Dear ${name},</p>
        <p>Welcome to our home insurance platform! We're excited to have you as a customer.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Getting Started</h3>
          <p>Here's what you can do with your account:</p>
          <ul>
            <li>Create and manage your home insurance policies</li>
            <li>Submit and track insurance claims</li>
            <li>Make premium payments securely</li>
            <li>Access important documents</li>
            <li>Update your profile and preferences</li>
          </ul>
        </div>

        <p>If you need any assistance, our support team is here to help.</p>

        <p>Best regards,<br>Home Insurance Team</p>
      </div>
    `;

    return this.sendTrackedEmail({
      to: email,
      subject,
      html,
      type: EmailType.WELCOME,
      userId
    });
  }

  /**
   * Process email webhooks from Resend
   */
  static async processWebhook(webhookData: any) {
    try {
      const { type, data } = webhookData;

      switch (type) {
        case 'email.delivered':
          await this.handleEmailDelivered(data);
          break;
        case 'email.opened':
          await this.handleEmailOpened(data);
          break;
        case 'email.clicked':
          await this.handleEmailClicked(data);
          break;
        case 'email.bounced':
          await this.handleEmailBounced(data);
          break;
        case 'email.complained':
          await this.handleEmailComplained(data);
          break;
        default:
          console.log('Unknown webhook type:', type);
      }
    } catch (error) {
      console.error('Error processing email webhook:', error);
    }
  }

  private static async handleEmailDelivered(data: any) {
    const { email_id, delivered_at } = data;

    await db.email.updateMany({
      where: { messageId: email_id },
      data: {
        status: EmailStatus.DELIVERED,
        deliveredAt: new Date(delivered_at)
      }
    });
  }

  private static async handleEmailOpened(data: any) {
    const { email_id, opened_at, ip_address, user_agent } = data;

    // Update email status
    await db.email.updateMany({
      where: { messageId: email_id },
      data: {
        status: EmailStatus.OPENED,
        openedAt: new Date(opened_at)
      }
    });

    // Record tracking event
    const email = await db.email.findFirst({
      where: { messageId: email_id }
    });

    if (email) {
      await db.emailTracking.create({
        data: {
          emailId: email.id,
          event: EmailStatus.OPENED,
          ipAddress: ip_address,
          userAgent: user_agent
        }
      });
    }
  }

  private static async handleEmailClicked(data: any) {
    const { email_id, clicked_at, ip_address, user_agent, url } = data;

    // Update email status
    await db.email.updateMany({
      where: { messageId: email_id },
      data: {
        status: EmailStatus.CLICKED,
        clickedAt: new Date(clicked_at)
      }
    });

    // Record tracking event
    const email = await db.email.findFirst({
      where: { messageId: email_id }
    });

    if (email) {
      await db.emailTracking.create({
        data: {
          emailId: email.id,
          event: EmailStatus.CLICKED,
          ipAddress: ip_address,
          userAgent: user_agent,
          url: url
        }
      });
    }
  }

  private static async handleEmailBounced(data: any) {
    const { email_id, bounced_at, bounce_reason } = data;

    await db.email.updateMany({
      where: { messageId: email_id },
      data: {
        status: EmailStatus.BOUNCED,
        bouncedAt: new Date(bounced_at),
        bounceReason: bounce_reason
      }
    });
  }

  private static async handleEmailComplained(data: any) {
    const { email_id, complained_at } = data;

    await db.email.updateMany({
      where: { messageId: email_id },
      data: {
        status: EmailStatus.COMPLAINT,
        complaintAt: new Date(complained_at)
      }
    });
  }

  /**
   * Retry failed emails
   */
  static async retryFailedEmails() {
    const failedEmails = await db.email.findMany({
      where: {
        status: EmailStatus.FAILED,
        retryCount: { lt: db.email.fields.maxRetries },
        nextRetryAt: { lte: new Date() }
      },
      take: 50 // Process in batches
    });

    for (const email of failedEmails) {
      try {
        const result = await this.sendEmail({
          to: email.to,
          from: email.from,
          subject: email.subject,
          html: email.htmlContent || undefined,
          text: email.textContent || undefined
        });

        if (result.success) {
          await db.email.update({
            where: { id: email.id },
            data: {
              status: EmailStatus.SENT,
              messageId: result.data?.id,
              sentAt: new Date(),
              retryCount: { increment: 1 },
              errorMessage: null
            }
          });
        } else {
          // Calculate next retry time (exponential backoff)
          const nextRetryDelay = Math.pow(2, email.retryCount) * 60 * 1000; // minutes
          await db.email.update({
            where: { id: email.id },
            data: {
              retryCount: { increment: 1 },
              nextRetryAt: new Date(Date.now() + nextRetryDelay),
              errorMessage: result.error
            }
          });
        }
      } catch (error) {
        console.error(`Failed to retry email ${email.id}:`, error);
      }
    }
  }

  /**
   * Get email analytics
   */
  static async getEmailAnalytics({
    startDate,
    endDate,
    type
  }: {
    startDate?: Date;
    endDate?: Date;
    type?: EmailType;
  }) {
    const where: any = {};
    if (startDate) where.createdAt = { gte: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };
    if (type) where.type = type;

    const [
      totalEmails,
      sentEmails,
      deliveredEmails,
      openedEmails,
      clickedEmails,
      bouncedEmails,
      complaintEmails
    ] = await Promise.all([
      db.email.count({ where }),
      db.email.count({ where: { ...where, status: EmailStatus.SENT } }),
      db.email.count({ where: { ...where, status: EmailStatus.DELIVERED } }),
      db.email.count({ where: { ...where, status: EmailStatus.OPENED } }),
      db.email.count({ where: { ...where, status: EmailStatus.CLICKED } }),
      db.email.count({ where: { ...where, status: EmailStatus.BOUNCED } }),
      db.email.count({ where: { ...where, status: EmailStatus.COMPLAINT } })
    ]);

    return {
      total: totalEmails,
      sent: sentEmails,
      delivered: deliveredEmails,
      opened: openedEmails,
      clicked: clickedEmails,
      bounced: bouncedEmails,
      complaint: complaintEmails,
      deliveryRate: sentEmails > 0 ? (deliveredEmails / sentEmails) * 100 : 0,
      openRate: deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0,
      clickRate: deliveredEmails > 0 ? (clickedEmails / deliveredEmails) * 100 : 0,
      bounceRate: sentEmails > 0 ? (bouncedEmails / sentEmails) * 100 : 0
    };
  }

  /**
   * Send bulk emails
   */
  static async sendBulkEmails({
    recipients,
    subject,
    html,
    text,
    type,
    templateId,
    batchSize = 50
  }: {
    recipients: Array<{ email: string; userId?: string; variables?: Record<string, string> }>;
    subject: string;
    html: string;
    text?: string;
    type: EmailType;
    templateId?: string;
    batchSize?: number;
  }) {
    const results = [];
    const batches = [];

    // Split recipients into batches
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async (recipient) => {
        let emailHtml = html;
        let emailText = text;
        let emailSubject = subject;

        // Replace variables in content
        if (recipient.variables) {
          Object.entries(recipient.variables).forEach(([key, value]) => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            emailHtml = emailHtml.replace(regex, value);
            emailSubject = emailSubject.replace(regex, value);
            if (emailText) {
              emailText = emailText.replace(regex, value);
            }
          });
        }

        return this.sendTrackedEmail({
          to: recipient.email,
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
          type,
          userId: recipient.userId,
          templateId
        });
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }
}

export default EmailService;