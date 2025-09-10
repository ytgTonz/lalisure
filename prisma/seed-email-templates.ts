import { PrismaClient, TemplateCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEmailTemplates() {
  console.log('Seeding email templates...');

  // Get first admin user or create a dummy one
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    // Try to create admin user with unique clerkId
    adminUser = await prisma.user.create({
      data: {
        clerkId: `admin_${Date.now()}`,
        email: 'admin@homeinsurance.co.za',
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    });
  }

  const emailTemplates = [
    // CLAIMS TEMPLATES
    {
      name: 'claim_submitted',
      title: 'Claim Submission Confirmation',
      subject: 'Claim {{claimNumber}} Submitted Successfully - Home Insurance',
      category: TemplateCategory.CLAIMS,
      isActive: true,
      variables: ['claimNumber', 'policyNumber', 'policyholderName', 'claimType', 'incidentDate', 'estimatedAmount', 'location'],
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Home Insurance</h1>
            <p style="color: #e8eaf6; margin: 5px 0 0 0; font-size: 14px;">Your Trusted Insurance Partner</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 400;">Claim Submitted Successfully</h2>
            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Dear {{policyholderName}},</p>

            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 8px;">
              <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Your Claim Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: 500; width: 140px;">Claim Number:</td>
                  <td style="padding: 8px 0; color: #333333; font-weight: 600;">{{claimNumber}}</td>
                </tr>
                <tr style="background-color: #ffffff;">
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Policy Number:</td>
                  <td style="padding: 8px 0; color: #333333; font-weight: 600;">{{policyNumber}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Claim Type:</td>
                  <td style="padding: 8px 0; color: #333333;">{{claimType}}</td>
                </tr>
                <tr style="background-color: #ffffff;">
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Incident Date:</td>
                  <td style="padding: 8px 0; color: #333333;">{{incidentDate}}</td>
                </tr>
                {{#if location}}
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Location:</td>
                  <td style="padding: 8px 0; color: #333333;">{{location}}</td>
                </tr>
                {{/if}}
                {{#if estimatedAmount}}
                <tr style="background-color: #ffffff;">
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Estimated Amount:</td>
                  <td style="padding: 8px 0; color: #333333; font-weight: 600; color: #667eea;">R{{estimatedAmount}}</td>
                </tr>
                {{/if}}
              </table>
            </div>

            <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #1976d2; margin: 0 0 10px 0; font-size: 16px;">What Happens Next?</h4>
              <ul style="color: #424242; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Our claims team will review your submission within 24 hours</li>
                <li>You'll receive updates via email and your dashboard</li>
                <li>If additional information is needed, we'll contact you directly</li>
                <li>You can track your claim status anytime in your account</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">Track Your Claim</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px;">Questions about your claim?</p>
            <p style="color: #333333; margin: 0; font-weight: 600;">Call us: <a href="tel:0800123456" style="color: #667eea; text-decoration: none;">0800 123 456</a> | Email: <a href="mailto:claims@homeinsurance.co.za" style="color: #667eea; text-decoration: none;">claims@homeinsurance.co.za</a></p>
            <p style="color: #999999; margin: 15px 0 0 0; font-size: 12px;">© 2024 Home Insurance. All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `Claim Submitted Successfully - Home Insurance

Dear {{policyholderName}},

Your claim has been successfully submitted and is now under review.

CLAIM DETAILS:
Claim Number: {{claimNumber}}
Policy Number: {{policyNumber}}
Claim Type: {{claimType}}
Incident Date: {{incidentDate}}
{{#if location}}Location: {{location}}{{/if}}
{{#if estimatedAmount}}Estimated Amount: R{{estimatedAmount}}{{/if}}

WHAT HAPPENS NEXT:
• Our claims team will review your submission within 24 hours
• You'll receive updates via email and your dashboard
• If additional information is needed, we'll contact you directly
• You can track your claim status anytime in your account

Track your claim: [Login to your dashboard]

Questions about your claim?
Call us: 0800 123 456
Email: claims@homeinsurance.co.za

© 2024 Home Insurance. All rights reserved.`,
    },

    {
      name: 'claim_status_update',
      title: 'Claim Status Update Notification',
      subject: 'Update on Claim {{claimNumber}} - Status: {{status}}',
      category: TemplateCategory.CLAIMS,
      isActive: true,
      variables: ['claimNumber', 'policyNumber', 'policyholderName', 'status', 'estimatedAmount', 'nextSteps', 'contactInfo'],
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Home Insurance</h1>
            <p style="color: #e8eaf6; margin: 5px 0 0 0; font-size: 14px;">Your Trusted Insurance Partner</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 400;">Claim Status Update</h2>
            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Dear {{policyholderName}},</p>

            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 25px; margin: 30px 0; border-radius: 8px;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 16px; height: 16px; background-color: #856404; border-radius: 50%; margin-right: 10px;"></div>
                <h3 style="color: #856404; margin: 0; font-size: 18px;">Status Update</h3>
              </div>
              <p style="color: #856404; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Your claim status has been updated to: <span style="color: #333333; background-color: #ffffff; padding: 2px 8px; border-radius: 4px;">{{status}}</span></p>
              <p style="color: #856404; margin: 0; font-size: 14px;">Claim Number: {{claimNumber}} | Policy: {{policyNumber}}</p>
            </div>

            {{#if estimatedAmount}}
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 25px; margin: 30px 0; border-radius: 8px;">
              <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">Settlement Information</h3>
              <p style="color: #155724; margin: 0; font-size: 16px; font-weight: 600;">Settlement Amount: <span style="font-size: 20px; color: #28a745;">R{{estimatedAmount}}</span></p>
            </div>
            {{/if}}

            {{#if nextSteps}}
            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 8px;">
              <h4 style="color: #333333; margin: 0 0 15px 0; font-size: 16px;">Next Steps</h4>
              <div style="color: #666666; line-height: 1.6;">{{{nextSteps}}}</div>
            </div>
            {{/if}}

            <div style="text-align: center; margin: 40px 0;">
              <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">View Claim Details</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            {{#if contactInfo}}
            <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px;">{{{contactInfo}}}</p>
            {{/if}}
            <p style="color: #333333; margin: 0; font-weight: 600;">Call us: <a href="tel:0800123456" style="color: #667eea; text-decoration: none;">0800 123 456</a> | Email: <a href="mailto:claims@homeinsurance.co.za" style="color: #667eea; text-decoration: none;">claims@homeinsurance.co.za</a></p>
            <p style="color: #999999; margin: 15px 0 0 0; font-size: 12px;">© 2024 Home Insurance. All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `Claim Status Update - Home Insurance

Dear {{policyholderName}},

Your claim status has been updated.

STATUS UPDATE:
Claim: {{claimNumber}}
Policy: {{policyNumber}}
New Status: {{status}}

{{#if estimatedAmount}}
SETTLEMENT INFORMATION:
Settlement Amount: R{{estimatedAmount}}
{{/if}}

{{#if nextSteps}}
NEXT STEPS:
{{{nextSteps}}}
{{/if}}

View claim details: [Login to your dashboard]

{{#if contactInfo}}
{{{contactInfo}}}
{{/if}}

Call us: 0800 123 456
Email: claims@homeinsurance.co.za

© 2024 Home Insurance. All rights reserved.`,
    },

    // WELCOME TEMPLATE
    {
      name: 'welcome',
      title: 'Welcome Email',
      subject: 'Welcome to Home Insurance, {{userName}}!',
      category: TemplateCategory.WELCOME,
      isActive: true,
      variables: ['userName', 'userEmail', 'accountType', 'loginUrl', 'supportEmail', 'supportPhone'],
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Home Insurance</h1>
            <p style="color: #e8eaf6; margin: 5px 0 0 0; font-size: 14px;">Welcome to Our Family</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background-color: #667eea; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 24px; font-weight: bold;">🎉</span>
              </div>
              <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 24px; font-weight: 400;">Welcome to Home Insurance!</h2>
              <p style="color: #666666; font-size: 16px; margin: 0;">Hi {{userName}}, we're excited to have you join our community!</p>
            </div>

            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 8px;">
              <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Your Account Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: 500; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; color: #333333; font-weight: 600;">{{userName}}</td>
                </tr>
                <tr style="background-color: #ffffff;">
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Email:</td>
                  <td style="padding: 8px 0; color: #333333;">{{userEmail}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Account Type:</td>
                  <td style="padding: 8px 0; color: #667eea; font-weight: 600;">{{accountType}}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #1976d2; margin: 0 0 10px 0; font-size: 16px;">Getting Started - What You Can Do</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 6px;">
                  <h5 style="color: #1976d2; margin: 0 0 8px 0; font-size: 14px;">🏠 Insurance</h5>
                  <ul style="color: #64748b; margin: 0; padding-left: 15px; font-size: 12px; line-height: 1.4;">
                    <li>Get a quote</li>
                    <li>Buy coverage</li>
                    <li>Manage policies</li>
                    <li>Track claims</li>
                  </ul>
                </div>
                <div style="background: white; padding: 15px; border-radius: 6px;">
                  <h5 style="color: #1976d2; margin: 0 0 8px 0; font-size: 14px;">📋 Account</h5>
                  <ul style="color: #64748b; margin: 0; padding-left: 15px; font-size: 12px; line-height: 1.4;">
                    <li>Update profile</li>
                    <li>Payment methods</li>
                    <li>Document vault</li>
                    <li>Communication prefs</li>
                  </ul>
                </div>
                <div style="background: white; padding: 15px; border-radius: 6px;">
                  <h5 style="color: #1976d2; margin: 0 0 8px 0; font-size: 14px;">🆘 Support</h5>
                  <ul style="color: #64748b; margin: 0; padding-left: 15px; font-size: 12px; line-height: 1.4;">
                    <li>24/7 help center</li>
                    <li>Live chat</li>
                    <li>FAQ library</li>
                    <li>Emergency contacts</li>
                  </ul>
                </div>
                <div style="background: white; padding: 15px; border-radius: 6px;">
                  <h5 style="color: #1976d2; margin: 0 0 8px 0; font-size: 14px;">📊 Resources</h5>
                  <ul style="color: #64748b; margin: 0; padding-left: 15px; font-size: 12px; line-height: 1.4;">
                    <li>Insurance guides</li>
                    <li>Calculator tools</li>
                    <li>Educational content</li>
                    <li>Community forum</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #155724; margin: 0 0 10px 0; font-size: 16px;">🚀 Quick Start Guide</h4>
              <ol style="color: #155724; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li><strong>Complete your profile:</strong> Add your personal and property details</li>
                <li><strong>Get your first quote:</strong> Use our quick quote tool</li>
                <li><strong>Set up payments:</strong> Add your preferred payment method</li>
                <li><strong>Explore your dashboard:</strong> Familiarize yourself with all features</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="{{loginUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">Get Started Now</a>
            </div>

            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px; text-align: center;">
                <strong>💡 Pro Tip:</strong> Download our mobile app for on-the-go access to your insurance account!
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px;">Need help getting started?</p>
            <p style="color: #333333; margin: 0; font-weight: 600;">
              Email: <a href="mailto:{{supportEmail}}" style="color: #667eea; text-decoration: none;">{{supportEmail}}</a> |
              Phone: <a href="tel:{{supportPhone}}" style="color: #667eea; text-decoration: none;">{{supportPhone}}</a>
            </p>
            <p style="color: #999999; margin: 15px 0 0 0; font-size: 12px;">© 2024 Home Insurance. All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `Welcome to Home Insurance!

Hi {{userName}}, we're excited to have you join our community!

YOUR ACCOUNT DETAILS:
Name: {{userName}}
Email: {{userEmail}}
Account Type: {{accountType}}

GETTING STARTED - WHAT YOU CAN DO:

🏠 INSURANCE:
• Get a quote
• Buy coverage
• Manage policies
• Track claims

📋 ACCOUNT:
• Update profile
• Payment methods
• Document vault
• Communication preferences

🆘 SUPPORT:
• 24/7 help center
• Live chat
• FAQ library
• Emergency contacts

📊 RESOURCES:
• Insurance guides
• Calculator tools
• Educational content
• Community forum

🚀 QUICK START GUIDE:
1. Complete your profile: Add your personal and property details
2. Get your first quote: Use our quick quote tool
3. Set up payments: Add your preferred payment method
4. Explore your dashboard: Familiarize yourself with all features

GET STARTED NOW: {{loginUrl}}

💡 Pro Tip: Download our mobile app for on-the-go access to your insurance account!

Need help getting started?
Email: {{supportEmail}} | Phone: {{supportPhone}}

© 2024 Home Insurance. All rights reserved.`,
    },
  ];

  // Create templates in database
  for (const template of emailTemplates) {
    try {
      await prisma.emailTemplate.upsert({
        where: { name: template.name },
        update: {
          ...template,
          updatedBy: adminUser.id,
        },
        create: {
          ...template,
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
        },
      });
      console.log(`Created/Updated email template: ${template.name}`);
    } catch (error) {
      console.error(`Error seeding template ${template.name}:`, error);
    }
  }

  console.log('Email template seeding completed!');
}

seedEmailTemplates()
  .catch((e) => {
    console.error('Error seeding email templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
