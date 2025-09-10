import { PrismaClient, UserRole, PolicyType, PolicyStatus, ClaimType, ClaimStatus, DocumentType, PaymentStatus, PaymentType, TemplateCategory } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/staff-auth';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.document.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database...');

  // Create or find users (skip if already exist)
  const customer = await prisma.user.upsert({
    where: { clerkId: 'user_2dummy1customer' },
    update: {},
    create: {
      clerkId: 'user_2dummy1customer',
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0123',
      role: UserRole.CUSTOMER,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0124',
      role: UserRole.AGENT,
      password: await hashPassword('password123'), // Default password for testing
    },
  });

  const underwriter = await prisma.user.upsert({
    where: { email: 'underwriter@example.com' },
    update: {},
    create: {
      email: 'underwriter@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      phone: '+1-555-0125',
      role: UserRole.UNDERWRITER,
      password: await hashPassword('password123'), // Default password for testing
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      phone: '+1-555-0126',
      role: UserRole.ADMIN,
      password: await hashPassword('password123'), // Default password for testing
    },
  });

  // Create policies for customer
  const homePolicy = await prisma.policy.upsert({
    where: { policyNumber: 'POL-HOME-001' },
    update: {},
    create: {
      policyNumber: 'POL-HOME-001',
      userId: customer.id,
      type: PolicyType.HOME,
      status: PolicyStatus.ACTIVE,
      premium: 1850.00,
      coverage: 450000.00,
      deductible: 2500.00,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      propertyInfo: {
        address: '123 Long Street',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
        propertyType: 'Single Family Home',
        buildYear: 2015,
        squareFeet: 2400,
        bedrooms: 3,
        bathrooms: 2.5,
        constructionType: 'Frame',
        roofType: 'Shingle',
        foundationType: 'Concrete',
        heatingType: 'Gas',
        coolingType: 'Central Air',
        safetyFeatures: ['Smoke Detectors', 'Security System'],
        hasPool: false,
        hasGarage: true,
        garageSpaces: 2,
      },
    },
  });

  const homePolicy2 = await prisma.policy.upsert({
    where: { policyNumber: 'POL-HOME-002' },
    update: {},
    create: {
      policyNumber: 'POL-HOME-002',
      userId: customer.id,
      type: PolicyType.HOME,
      status: PolicyStatus.PENDING_REVIEW,
      premium: 2200.00,
      coverage: 350000.00,
      deductible: 1500.00,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-03-01'),
      propertyInfo: {
        address: '456 Sandton Drive',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2196',
        propertyType: 'Condo',
        buildYear: 2010,
        squareFeet: 1800,
        bedrooms: 2,
        bathrooms: 2.0,
        constructionType: 'Brick',
        roofType: 'Tile',
        foundationType: 'Concrete',
        heatingType: 'Electric',
        coolingType: 'Central Air',
        safetyFeatures: ['Smoke Detectors'],
        hasPool: false,
        hasGarage: false,
        garageSpaces: 0,
      },
      personalInfo: {
        dateOfBirth: new Date('1985-06-15'),
        occupation: 'Software Engineer',
        maritalStatus: 'Married',
      },
    },
  });

  // Create claims
  const homeClaim = await prisma.claim.upsert({
    where: { claimNumber: 'CLM-HOME-001' },
    update: {},
    create: {
      claimNumber: 'CLM-HOME-001',
      userId: customer.id,
      policyId: homePolicy.id,
      type: ClaimType.FIRE_DAMAGE,
      status: ClaimStatus.UNDER_REVIEW,
      amount: 15000.00,
      description: 'Kitchen fire damage from electrical malfunction. Smoke damage throughout first floor, need repairs to cabinets, countertops, and paint.',
      incidentDate: new Date('2024-08-15'),
      location: '123 Maple Street, Springfield, IL 62701',
      what3words: 'filled.count.soap',
    },
  });

  const waterClaim = await prisma.claim.upsert({
    where: { claimNumber: 'CLM-WATER-001' },
    update: {},
    create: {
      claimNumber: 'CLM-WATER-001',
      userId: customer.id,
      policyId: homePolicy2.id,
      type: ClaimType.WATER_DAMAGE,
      status: ClaimStatus.APPROVED,
      amount: 8500.00,
      description: 'Water damage from burst pipe in bathroom. Damage to flooring and drywall.',
      incidentDate: new Date('2024-07-22'),
      location: '456 Oak Avenue, Springfield, IL',
      what3words: 'three.word.address',
    },
  });

  const theftClaim = await prisma.claim.upsert({
    where: { claimNumber: 'CLM-THEFT-001' },
    update: {},
    create: {
      claimNumber: 'CLM-THEFT-001',
      userId: customer.id,
      policyId: homePolicy.id,
      type: ClaimType.THEFT_BURGLARY,
      status: ClaimStatus.SUBMITTED,
      amount: 3200.00,
      description: 'Burglary - electronics stolen including TV, laptop, and jewelry. Police report filed.',
      incidentDate: new Date('2024-08-25'),
      location: '123 Maple Street, Springfield, IL 62701',
      what3words: 'filled.count.soap',
    },
  });

  // Create payments
  await prisma.payment.upsert({
    where: { paystackId: 'ref_test_paystack_001' },
    update: {},
    create: {
      policyId: homePolicy.id,
      paystackId: 'ref_test_paystack_001',
      amount: 462.50, // Quarterly premium
      currency: 'zar',
      status: PaymentStatus.COMPLETED,
      type: PaymentType.PREMIUM,
      dueDate: new Date('2024-09-01'),
      paidAt: new Date('2024-08-28'),
    },
  });

  await prisma.payment.upsert({
    where: { paystackId: 'ref_test_paystack_002' },
    update: {},
    create: {
      policyId: homePolicy2.id,
      paystackId: 'ref_test_paystack_002',
      amount: 550.00, // Monthly premium
      currency: 'zar',
      status: PaymentStatus.PENDING,
      type: PaymentType.PREMIUM,
      dueDate: new Date('2024-09-15'),
    },
  });

  await prisma.payment.upsert({
    where: { paystackId: 'ref_test_paystack_003' },
    update: {},
    create: {
      policyId: homePolicy2.id,
      paystackId: 'ref_test_paystack_003',
      amount: 8500.00, // Claim payout
      currency: 'zar',
      status: PaymentStatus.COMPLETED,
      type: PaymentType.CLAIM_PAYOUT,
      paidAt: new Date('2024-08-20'),
    },
  });

  // Create documents for claims
  await prisma.document.create({
    data: {
      claimId: homeClaim.id,
      filename: 'kitchen_damage_photo1.jpg',
      url: 'https://example.com/documents/kitchen_damage_photo1.jpg',
      type: DocumentType.PHOTO,
      size: 2048576, // 2MB
      mimeType: 'image/jpeg',
    },
  });

  await prisma.document.create({
    data: {
      claimId: homeClaim.id,
      filename: 'fire_department_report.pdf',
      url: 'https://example.com/documents/fire_department_report.pdf',
      type: DocumentType.OTHER,
      size: 1024512, // 1MB
      mimeType: 'application/pdf',
    },
  });

  await prisma.document.create({
    data: {
      claimId: waterClaim.id,
      filename: 'water_damage_photos.jpg',
      url: 'https://example.com/documents/water_damage_photos.jpg',
      type: DocumentType.PHOTO,
      size: 3145728, // 3MB
      mimeType: 'image/jpeg',
    },
  });

  await prisma.document.create({
    data: {
      claimId: waterClaim.id,
      filename: 'repair_estimate.pdf',
      url: 'https://example.com/documents/repair_estimate.pdf',
      type: DocumentType.ESTIMATE,
      size: 512256, // 512KB
      mimeType: 'application/pdf',
    },
  });

  await prisma.document.create({
    data: {
      claimId: theftClaim.id,
      filename: 'theft_police_report.pdf',
      url: 'https://example.com/documents/theft_police_report.pdf',
      type: DocumentType.POLICE_REPORT,
      size: 768384, // 768KB
      mimeType: 'application/pdf',
    },
  });

  // Seed email templates
  await seedEmailTemplates(admin.id);

  console.log('Database seeded successfully!');
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.policy.count()} policies`);
  console.log(`Created ${await prisma.claim.count()} claims`);
  console.log(`Created ${await prisma.payment.count()} payments`);
  console.log(`Created ${await prisma.document.count()} documents`);
  console.log(`Created ${await prisma.emailTemplate.count()} email templates`);
}

// Email Template Seeding Function (can be called independently)
async function seedEmailTemplates(adminId: string) {
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

    // PAYMENT TEMPLATES
    {
      name: 'payment_confirmed',
      title: 'Payment Confirmation',
      subject: 'Payment Confirmed - Policy {{policyNumber}}',
      category: TemplateCategory.PAYMENTS,
      isActive: true,
      variables: ['policyNumber', 'policyholderName', 'amount', 'transactionId', 'paymentMethod', 'paymentDate'],
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Home Insurance</h1>
            <p style="color: #e8f5e8; margin: 5px 0 0 0; font-size: 14px;">Payment Successfully Processed</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background-color: #28a745; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 24px; font-weight: bold;">✓</span>
              </div>
              <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 24px; font-weight: 400;">Payment Confirmed</h2>
              <p style="color: #666666; font-size: 16px; margin: 0;">Thank you for your payment, {{policyholderName}}!</p>
            </div>

            <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 25px; margin: 30px 0; border-radius: 8px;">
              <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Payment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: 500; width: 140px;">Policy Number:</td>
                  <td style="padding: 8px 0; color: #333333; font-weight: 600;">{{policyNumber}}</td>
                </tr>
                <tr style="background-color: #ffffff;">
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Amount Paid:</td>
                  <td style="padding: 8px 0; color: #28a745; font-weight: 600; font-size: 18px;">R{{amount}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Transaction ID:</td>
                  <td style="padding: 8px 0; color: #333333; font-family: monospace;">{{transactionId}}</td>
                </tr>
                <tr style="background-color: #ffffff;">
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Payment Method:</td>
                  <td style="padding: 8px 0; color: #333333;">{{paymentMethod}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: 500;">Payment Date:</td>
                  <td style="padding: 8px 0; color: #333333;">{{paymentDate}}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #155724; margin: 0 0 10px 0; font-size: 16px;">What's Next?</h4>
              <ul style="color: #155724; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Your policy remains active and in good standing</li>
                <li>You'll receive a payment receipt via email shortly</li>
                <li>Download your updated policy documents from your dashboard</li>
                <li>Track all your payments and policy details online</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="#" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);">View Policy Details</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px;">Questions about your payment?</p>
            <p style="color: #333333; margin: 0; font-weight: 600;">Call us: <a href="tel:0800123456" style="color: #667eea; text-decoration: none;">0800 123 456</a> | Email: <a href="mailto:billing@homeinsurance.co.za" style="color: #28a745; text-decoration: none;">billing@homeinsurance.co.za</a></p>
            <p style="color: #999999; margin: 15px 0 0 0; font-size: 12px;">© 2024 Home Insurance. All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `Payment Confirmed - Home Insurance

Thank you for your payment, {{policyholderName}}!

PAYMENT DETAILS:
Policy Number: {{policyNumber}}
Amount Paid: R{{amount}}
Transaction ID: {{transactionId}}
Payment Method: {{paymentMethod}}
Payment Date: {{paymentDate}}

Your policy remains active and in good standing. You'll receive a payment receipt via email shortly.

View policy details: [Login to your dashboard]

Questions about your payment?
Call us: 0800 123 456
Email: billing@homeinsurance.co.za

© 2024 Home Insurance. All rights reserved.`,
    },

    {
      name: 'payment_due',
      title: 'Payment Due Reminder',
      subject: 'Payment Due Soon - Policy {{policyNumber}}',
      category: TemplateCategory.PAYMENTS,
      isActive: true,
      variables: ['policyNumber', 'policyholderName', 'amount', 'dueDate', 'paymentMethod', 'daysUntilDue'],
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Home Insurance</h1>
            <p style="color: #fff3cd; margin: 5px 0 0 0; font-size: 14px;">Payment Reminder</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background-color: #ffc107; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 24px; font-weight: bold;">!</span>
              </div>
              <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 24px; font-weight: 400;">Payment Due Reminder</h2>
              <p style="color: #666666; font-size: 16px; margin: 0;">Dear {{policyholderName}}, your premium payment is due soon.</p>
            </div>

            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 25px; margin: 30px 0; border-radius: 8px;">
              <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">Payment Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #856404; font-weight: 500; width: 140px;">Policy Number:</td>
                  <td style="padding: 8px 0; color: #856404; font-weight: 600;">{{policyNumber}}</td>
                </tr>
                <tr style="background-color: #ffffff;">
                  <td style="padding: 8px 0; color: #856404; font-weight: 500;">Amount Due:</td>
                  <td style="padding: 8px 0; color: #856404; font-weight: 600; font-size: 18px;">R{{amount}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #856404; font-weight: 500;">Due Date:</td>
                  <td style="padding: 8px 0; color: #856404; font-weight: 600;">{{dueDate}}</td>
                </tr>
                {{#if daysUntilDue}}
                <tr style="background-color: #ffffff;">
                  <td style="padding: 8px 0; color: #856404; font-weight: 500;">Days Until Due:</td>
                  <td style="padding: 8px 0; color: #856404; font-weight: 600;">{{daysUntilDue}} days</td>
                </tr>
                {{/if}}
                {{#if paymentMethod}}
                <tr>
                  <td style="padding: 8px 0; color: #856404; font-weight: 500;">Payment Method:</td>
                  <td style="padding: 8px 0; color: #856404;">{{paymentMethod}}</td>
                </tr>
                {{/if}}
              </table>
            </div>

            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #721c24; margin: 0 0 10px 0; font-size: 16px;">⚠️ Important Notice</h4>
              <p style="color: #721c24; margin: 0; line-height: 1.6;">Please make your payment by the due date to avoid policy suspension or cancellation. Late payments may incur additional fees.</p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="#" style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4); margin-right: 10px;">Pay Now</a>
              <a href="#" style="background: #6c757d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">Update Payment Method</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px;">Need help with your payment?</p>
            <p style="color: #333333; margin: 0; font-weight: 600;">Call us: <a href="tel:0800123456" style="color: #ffc107; text-decoration: none;">0800 123 456</a> | Email: <a href="mailto:billing@homeinsurance.co.za" style="color: #ffc107; text-decoration: none;">billing@homeinsurance.co.za</a></p>
            <p style="color: #999999; margin: 15px 0 0 0; font-size: 12px;">© 2024 Home Insurance. All rights reserved.</p>
          </div>
        </div>
      `,
      textContent: `Payment Due Reminder - Home Insurance

Dear {{policyholderName}}, your premium payment is due soon.

PAYMENT INFORMATION:
Policy Number: {{policyNumber}}
Amount Due: R{{amount}}
Due Date: {{dueDate}}
{{#if daysUntilDue}}Days Until Due: {{daysUntilDue}} days{{/if}}
{{#if paymentMethod}}Payment Method: {{paymentMethod}}{{/if}}

IMPORTANT: Please make your payment by the due date to avoid policy suspension or cancellation. Late payments may incur additional fees.

Pay now: [Payment link]
Update payment method: [Settings link]

Need help with your payment?
Call us: 0800 123 456
Email: billing@homeinsurance.co.za

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

    // POLICY TEMPLATES
    {
      name: 'policy_created',
      title: 'New Policy Created Confirmation',
      subject: 'Welcome to Home Insurance - Policy {{policyNumber}} Created',
      category: TemplateCategory.POLICIES,
      isActive: true,
      variables: ['policyNumber', 'policyholderName', 'coverageAmount', 'effectiveDate', 'premiumAmount', 'expiryDate', 'propertyAddress'],
      htmlContent: `<p>Policy created template coming soon...</p>`,
      textContent: `Policy created template coming soon...`,
    },

    {
      name: 'policy_renewal',
      title: 'Policy Renewal Reminder',
      subject: 'Policy Renewal Due - {{policyNumber}}',
      category: TemplateCategory.POLICIES,
      isActive: true,
      variables: ['policyNumber', 'policyholderName', 'currentPremium', 'newPremium', 'renewalDate', 'expiryDate', 'renewalDiscount'],
      htmlContent: `<p>Template coming soon...</p>`,
      textContent: `Template coming soon...`,
    },

    // INVITATION TEMPLATE
    {
      name: 'invitation',
      title: 'Team Invitation',
      subject: 'You\'re invited to join {{inviterName}}\'s team at Home Insurance',
      category: TemplateCategory.INVITATIONS,
      isActive: true,
      variables: ['inviteeEmail', 'inviterName', 'role', 'department', 'acceptUrl', 'expiresAt', 'message', 'companyName'],
      htmlContent: `<p>Template coming soon...</p>`,
      textContent: `Template coming soon...`,
    },

    // GENERAL TEMPLATES
    {
      name: 'password_reset',
      title: 'Password Reset',
      subject: 'Reset Your Home Insurance Password',
      category: TemplateCategory.GENERAL,
      isActive: true,
      variables: ['userName', 'resetUrl', 'expiresIn'],
      htmlContent: `<p>Template coming soon...</p>`,
      textContent: `Template coming soon...`,
    },

    {
      name: 'account_verification',
      title: 'Account Verification',
      subject: 'Verify Your Home Insurance Account',
      category: TemplateCategory.GENERAL,
      isActive: true,
      variables: ['userName', 'verificationUrl', 'expiresIn'],
      htmlContent: `<p>Template coming soon...</p>`,
      textContent: `Template coming soon...`,
    },
  ];

  // Create templates in database
  for (const template of emailTemplates) {
    await prisma.emailTemplate.create({
      data: {
        ...template,
        createdBy: adminId,
        updatedBy: adminId,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });