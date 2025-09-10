import { Resend } from 'resend';

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

  // Invitation emails
  static async sendInvitationEmail(data: InvitationNotificationData) {
    const subject = `You're invited to join Home Insurance Platform - ${data.role} Role`;
    const html = `
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

    return this.sendEmail({ to: data.inviteeEmail, subject, html });
  }

  // Welcome and general emails
  static async sendWelcomeEmail(email: string, name: string) {
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

    return this.sendEmail({ to: email, subject, html });
  }
}

export default EmailService;