import { db } from '@/lib/db';
import { TemplateCategory } from '@prisma/client';

export class TemplateSeeder {
  static async seedDefaultTemplates() {
    const defaultTemplates = [
      {
        name: 'claim_submitted',
        title: 'Claim Submission Confirmation',
        subject: 'Claim {{claimNumber}} Submitted Successfully',
        category: 'CLAIMS' as TemplateCategory,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background-color: #f8fafc; padding: 40px 20px; text-align: center; border-bottom: 3px solid #2563eb;">
              <h1 style="color: #1e40af; margin: 0; font-size: 28px;">Claim Submitted Successfully</h1>
            </div>

            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">Dear {{userName}},</p>

              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Thank you for submitting your insurance claim. Your claim has been successfully received and is now being processed by our team.
              </p>

              <div style="background-color: #f3f4f6; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2563eb;">
                <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">Claim Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Claim Number:</td>
                    <td style="padding: 8px 0; color: #374151;">{{claimNumber}}</td>
                  </tr>
                  <tr style="background-color: #ffffff;">
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Policy Number:</td>
                    <td style="padding: 8px 0; color: #374151;">{{policyNumber}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Claim Type:</td>
                    <td style="padding: 8px 0; color: #374151;">{{claimType}}</td>
                  </tr>
                  <tr style="background-color: #ffffff;">
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Incident Date:</td>
                    <td style="padding: 8px 0; color: #374151;">{{incidentDate}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Status:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: bold;">{{status}}</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #059669;">
                <h4 style="margin: 0 0 10px 0; color: #065f46;">What happens next?</h4>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 8px;">Our claims team will review your submission within 24-48 hours</li>
                  <li style="margin-bottom: 8px;">You may be contacted for additional information</li>
                  <li style="margin-bottom: 8px;">Track your claim progress in your dashboard</li>
                  <li style="margin-bottom: 0;">Receive updates via email and SMS</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/claims"
                   style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  View Claim Details
                </a>
              </div>

              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
                  <strong>Need help?</strong> Contact our support team at support@lalisure.com or call +27 (0) 123 456 789
                </p>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Best regards,<br>
                <strong>Lalisure Insurance Claims Team</strong>
              </p>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is an automated message from Lalisure Insurance. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        textContent: `
Claim Submitted Successfully

Dear {{userName}},

Thank you for submitting your insurance claim. Your claim has been successfully received and is now being processed by our team.

CLAIM DETAILS
Claim Number: {{claimNumber}}
Policy Number: {{policyNumber}}
Claim Type: {{claimType}}
Incident Date: {{incidentDate}}
Status: {{status}}

What happens next?
- Our claims team will review your submission within 24-48 hours
- You may be contacted for additional information
- Track your claim progress in your dashboard
- Receive updates via email and SMS

Need help? Contact our support team at support@lalisure.com or call +27 (0) 123 456 789

Best regards,
Lalisure Insurance Claims Team
        `,
        variables: ['claimNumber', 'policyNumber', 'userName', 'claimType', 'incidentDate', 'status', 'estimatedAmount'],
        isActive: true,
      },
      {
        name: 'payment_confirmed',
        title: 'Payment Confirmation',
        subject: 'Payment Confirmed - Policy {{policyNumber}}',
        category: 'PAYMENTS' as TemplateCategory,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background-color: #ecfdf5; padding: 40px 20px; text-align: center; border-bottom: 3px solid #059669;">
              <h1 style="color: #065f46; margin: 0; font-size: 28px;">Payment Confirmed</h1>
            </div>

            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">Dear {{userName}},</p>

              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Thank you for your payment. Your premium payment has been successfully processed and your policy remains active.
              </p>

              <div style="background-color: #ecfdf5; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #059669;">
                <h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px;">Payment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Policy Number:</td>
                    <td style="padding: 8px 0; color: #374151;">{{policyNumber}}</td>
                  </tr>
                  <tr style="background-color: #f0fdf4;">
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Amount Paid:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px;">R{{amount}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Payment Method:</td>
                    <td style="padding: 8px 0; color: #374151;">{{paymentMethod}}</td>
                  </tr>
                  <tr style="background-color: #f0fdf4;">
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Payment Date:</td>
                    <td style="padding: 8px 0; color: #374151;">{{currentDate}}</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #d97706;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">Important Information</h4>
                <p style="margin: 0; color: #374151;">
                  Your policy coverage is now active and up to date. You will receive a confirmation email with your updated policy details.
                </p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/policies"
                   style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  View Policy Details
                </a>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Best regards,<br>
                <strong>Lalisure Insurance Billing Team</strong>
              </p>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is an automated message from Lalisure Insurance. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        textContent: `
Payment Confirmed

Dear {{userName}},

Thank you for your payment. Your premium payment has been successfully processed and your policy remains active.

PAYMENT DETAILS
Policy Number: {{policyNumber}}
Amount Paid: R{{amount}}
Payment Method: {{paymentMethod}}
Payment Date: {{currentDate}}

Your policy coverage is now active and up to date.

Best regards,
Lalisure Insurance Billing Team
        `,
        variables: ['policyNumber', 'userName', 'amount', 'paymentMethod', 'currentDate'],
        isActive: true,
      },
      {
        name: 'policy_created',
        title: 'Policy Creation Welcome',
        subject: 'Welcome to Lalisure - Policy {{policyNumber}} Created',
        category: 'POLICIES' as TemplateCategory,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Lalisure Insurance!</h1>
            </div>

            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">Dear {{userName}},</p>

              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Congratulations! Your home insurance policy has been successfully created and is now active.
                Welcome to the Lalisure Insurance family.
              </p>

              <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 30px 0; border: 2px solid #e5e7eb;">
                <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">Your Policy Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Policy Number:</td>
                    <td style="padding: 8px 0; color: #374151; font-mono;">{{policyNumber}}</td>
                  </tr>
                  <tr style="background-color: #ffffff;">
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Coverage Amount:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 16px;">R{{coverageAmount}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Effective Date:</td>
                    <td style="padding: 8px 0; color: #374151;">{{effectiveDate}}</td>
                  </tr>
                  <tr style="background-color: #ffffff;">
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Premium Amount:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 16px;">R{{premiumAmount}} annually</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #059669;">
                <h4 style="margin: 0 0 10px 0; color: #065f46;">What you can do now:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 8px;">View your policy documents in your dashboard</li>
                  <li style="margin-bottom: 8px;">Make premium payments securely online</li>
                  <li style="margin-bottom: 8px;">Submit claims quickly through our mobile app</li>
                  <li style="margin-bottom: 8px;">Update your contact information anytime</li>
                  <li style="margin-bottom: 0;">Access 24/7 customer support</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/dashboard"
                   style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
                  Go to Dashboard
                </a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/policies"
                   style="background-color: #f3f4f6; color: #374151; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; border: 1px solid #d1d5db;">
                  View Policy
                </a>
              </div>

              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
                  <strong>Questions?</strong> Our support team is here to help at support@lalisure.com or +27 (0) 123 456 789
                </p>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Welcome aboard! We're excited to have you as part of our insurance family.<br><br>
                Best regards,<br>
                <strong>Lalisure Insurance Team</strong>
              </p>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is an automated message from Lalisure Insurance. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        textContent: `
Welcome to Lalisure Insurance!

Dear {{userName}},

Congratulations! Your home insurance policy has been successfully created and is now active.
Welcome to the Lalisure Insurance family.

YOUR POLICY DETAILS
Policy Number: {{policyNumber}}
Coverage Amount: R{{coverageAmount}}
Effective Date: {{effectiveDate}}
Premium Amount: R{{premiumAmount}} annually

What you can do now:
- View your policy documents in your dashboard
- Make premium payments securely online
- Submit claims quickly through our mobile app
- Update your contact information anytime
- Access 24/7 customer support

Questions? Our support team is here to help at support@lalisure.com or +27 (0) 123 456 789

Welcome aboard! We're excited to have you as part of our insurance family.

Best regards,
Lalisure Insurance Team
        `,
        variables: ['policyNumber', 'userName', 'coverageAmount', 'effectiveDate', 'premiumAmount'],
        isActive: true,
      }
    ];

    for (const templateData of defaultTemplates) {
      // Check if template already exists
      const existing = await db.emailTemplate.findUnique({
        where: { name: templateData.name },
      });

      if (!existing) {
        // Create a dummy admin user ID (you should replace this with actual admin ID)
        const adminUser = await db.user.findFirst({
          where: { role: 'ADMIN' },
        });

        if (adminUser) {
          await db.emailTemplate.create({
            data: {
              ...templateData,
              createdBy: adminUser.id,
              updatedBy: adminUser.id,
            },
          });
        }
      }
    }

    console.log('Default email templates seeded successfully!');
  }
}
