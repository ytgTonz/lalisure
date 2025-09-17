import { EmailService } from './email';
import { EmailType } from '@prisma/client';

export class EmailTestService {
  /**
   * Test email configuration and connectivity
   */
  static async testEmailConfiguration() {
    const results = {
      resendApiKey: !!process.env.RESEND_API_KEY,
      fromEmail: !!process.env.RESEND_FROM_EMAIL,
      webhookSecret: !!process.env.RESEND_WEBHOOK_SECRET,
      appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    };

    return {
      ...results,
      allConfigured: Object.values(results).every(Boolean),
    };
  }

  /**
   * Send a test email to verify functionality
   */
  static async sendTestEmail(to: string, testType: 'basic' | 'template' | 'tracked' = 'basic') {
    const testData = {
      to,
      subject: `Lalisure Email Test - ${testType.toUpperCase()}`,
      html: this.generateTestHtml(testType),
      text: this.generateTestText(testType),
    };

    switch (testType) {
      case 'basic':
        return EmailService.sendEmail(testData);
      
      case 'template':
        return EmailService.sendTemplateEmail(
          'test_template',
          to,
          'Test User',
          { testVariable: 'Test Value' }
        );
      
      case 'tracked':
        return EmailService.sendTrackedEmail({
          ...testData,
          type: EmailType.TEST,
          metadata: { testType, timestamp: new Date().toISOString() }
        });
      
      default:
        throw new Error(`Unknown test type: ${testType}`);
    }
  }

  /**
   * Test all email types
   */
  static async testAllEmailTypes(to: string) {
    const results = [];

    // Test invitation email
    try {
      const invitationResult = await EmailService.sendTrackedEmail({
        to,
        subject: 'Test Invitation Email',
        html: EmailService.generateInvitationHtml({
          inviteeEmail: to,
          inviterName: 'Test Admin',
          role: 'AGENT',
          acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/test-token`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        type: EmailType.INVITATION,
        metadata: { testType: 'invitation' }
      });
      results.push({ type: 'invitation', success: true, result: invitationResult });
    } catch (error) {
      results.push({ type: 'invitation', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Test welcome email
    try {
      const welcomeResult = await EmailService.sendWelcomeEmail(to, 'Test User');
      results.push({ type: 'welcome', success: true, result: welcomeResult });
    } catch (error) {
      results.push({ type: 'welcome', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Test policy email
    try {
      const policyResult = await EmailService.sendPolicyCreated(to, {
        policyNumber: 'TEST-001',
        policyholderName: 'Test User',
        coverageAmount: 500000,
        effectiveDate: new Date().toLocaleDateString(),
        premiumAmount: 5000,
      });
      results.push({ type: 'policy', success: true, result: policyResult });
    } catch (error) {
      results.push({ type: 'policy', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Test claim email
    try {
      const claimResult = await EmailService.sendClaimSubmitted(to, {
        claimNumber: 'CLM-001',
        policyNumber: 'TEST-001',
        policyholderName: 'Test User',
        claimType: 'Property Damage',
        incidentDate: new Date().toLocaleDateString(),
        status: 'Submitted',
        estimatedAmount: 10000,
      });
      results.push({ type: 'claim', success: true, result: claimResult });
    } catch (error) {
      results.push({ type: 'claim', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    return results;
  }

  /**
   * Generate test HTML content
   */
  private static generateTestHtml(testType: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <h2 style="color: #0c4a6e; margin-top: 0;">🧪 Lalisure Email Test</h2>
          <p style="color: #0c4a6e; margin-bottom: 0;">
            This is a <strong>${testType}</strong> test email from the Lalisure platform.
          </p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Test Details</h3>
          <ul style="color: #475569;">
            <li><strong>Test Type:</strong> ${testType}</li>
            <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
            <li><strong>From Email:</strong> ${process.env.RESEND_FROM_EMAIL || 'Not configured'}</li>
          </ul>
        </div>

        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
          <p style="color: #166534; margin: 0;">
            ✅ If you received this email, the email system is working correctly!
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            This is an automated test email from the Lalisure insurance platform.
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate test text content
   */
  private static generateTestText(testType: string): string {
    return `
Lalisure Email Test - ${testType.toUpperCase()}

This is a ${testType} test email from the Lalisure platform.

Test Details:
- Test Type: ${testType}
- Timestamp: ${new Date().toISOString()}
- Environment: ${process.env.NODE_ENV || 'development'}
- From Email: ${process.env.RESEND_FROM_EMAIL || 'Not configured'}

If you received this email, the email system is working correctly!

This is an automated test email from the Lalisure insurance platform.
Please do not reply to this email.
    `.trim();
  }

  /**
   * Validate email configuration
   */
  static validateConfiguration() {
    const errors = [];
    const warnings = [];

    if (!process.env.RESEND_API_KEY) {
      errors.push('RESEND_API_KEY is not set');
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      errors.push('RESEND_FROM_EMAIL is not set');
    } else if (!process.env.RESEND_FROM_EMAIL.includes('@')) {
      errors.push('RESEND_FROM_EMAIL is not a valid email address');
    }

    if (!process.env.RESEND_WEBHOOK_SECRET) {
      warnings.push('RESEND_WEBHOOK_SECRET is not set (webhook verification will be disabled)');
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      warnings.push('NEXT_PUBLIC_APP_URL is not set (invitation links may not work)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
