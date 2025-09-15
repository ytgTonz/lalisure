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
  await prisma.invitation.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database...');

  // Create or find users (consistent approach using email for uniqueness)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
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
    where: { email: 'agent@lalisure.com' },
    update: {},
    create: {
      clerkId: 'staff_agent_001',
      email: 'agent@lalisure.com',
      firstName: 'Test',
      lastName: 'Agent',
      phone: '+1-555-0124',
      role: UserRole.AGENT,
      password: await hashPassword('password'),
    },
  });

  const underwriter = await prisma.user.upsert({
    where: { email: 'underwriter@lalisure.com' },
    update: {},
    create: {
      clerkId: 'staff_underwriter_001',
      email: 'underwriter@lalisure.com',
      firstName: 'Test',
      lastName: 'Underwriter',
      phone: '+1-555-0125',
      role: UserRole.UNDERWRITER,
      password: await hashPassword('password'),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lalisure.com' },
    update: {},
    create: {
      clerkId: 'staff_admin_001',
      email: 'admin@lalisure.com',
      firstName: 'Test',
      lastName: 'Admin',
      phone: '+1-555-0126',
      role: UserRole.ADMIN,
      password: await hashPassword('password'),
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
        dateOfBirth: '1985-06-15' // Fixed: Use Date object instead of string
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
  await prisma.payment.create({
    data: {
      policyId: homePolicy.id,
      paystackId: 'ref_test_paystack_001',
      amount: 462.50,
      currency: 'zar',
      status: PaymentStatus.COMPLETED,
      type: PaymentType.PREMIUM,
      dueDate: new Date('2024-09-01'),
      paidAt: new Date('2024-08-28'),
    },
  });

  await prisma.payment.create({
    data: {
      policyId: homePolicy2.id,
      paystackId: 'ref_test_paystack_002',
      amount: 550.00,
      currency: 'zar',
      status: PaymentStatus.PENDING,
      type: PaymentType.PREMIUM,
      dueDate: new Date('2024-09-15'),
    },
  });

  await prisma.payment.create({
    data: {
      policyId: homePolicy2.id,
      paystackId: 'ref_test_paystack_003',
      amount: 8500.00,
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
      size: 2048576,
      mimeType: 'image/jpeg',
    },
  });

  await prisma.document.create({
    data: {
      claimId: homeClaim.id,
      filename: 'fire_department_report.pdf',
      url: 'https://example.com/documents/fire_department_report.pdf',
      type: DocumentType.OTHER,
      size: 1024512,
      mimeType: 'application/pdf',
    },
  });

  await prisma.document.create({
    data: {
      claimId: waterClaim.id,
      filename: 'water_damage_photos.jpg',
      url: 'https://example.com/documents/water_damage_photos.jpg',
      type: DocumentType.PHOTO,
      size: 3145728,
      mimeType: 'image/jpeg',
    },
  });

  await prisma.document.create({
    data: {
      claimId: waterClaim.id,
      filename: 'repair_estimate.pdf',
      url: 'https://example.com/documents/repair_estimate.pdf',
      type: DocumentType.ESTIMATE,
      size: 512256,
      mimeType: 'application/pdf',
    },
  });

  await prisma.document.create({
    data: {
      claimId: theftClaim.id,
      filename: 'theft_police_report.pdf',
      url: 'https://example.com/documents/theft_police_report.pdf',
      type: DocumentType.POLICE_REPORT,
      size: 768384,
      mimeType: 'application/pdf',
    },
  });

  // Seed simplified email templates
  await seedEmailTemplates(admin.id);

  console.log('Database seeded successfully!');
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.policy.count()} policies`);
  console.log(`Created ${await prisma.claim.count()} claims`);
  console.log(`Created ${await prisma.payment.count()} payments`);
  console.log(`Created ${await prisma.document.count()} documents`);
  console.log(`Created ${await prisma.emailTemplate.count()} email templates`);
}

// Simplified Email Template Seeding Function
async function seedEmailTemplates(adminId: string) {
  const emailTemplates = [
    // CLAIMS TEMPLATES
    {
      name: 'claim_submitted',
      title: 'Claim Submission Confirmation',
      subject: 'Claim {{claimNumber}} Submitted Successfully',
      category: TemplateCategory.CLAIMS,
      isActive: true,
      variables: ['claimNumber', 'policyNumber', 'policyholderName', 'claimType', 'incidentDate'],
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Claim Submitted Successfully</h2>
          <p>Dear {{policyholderName}},</p>
          <p>Your claim has been successfully submitted:</p>
          <ul>
            <li>Claim Number: {{claimNumber}}</li>
            <li>Policy Number: {{policyNumber}}</li>
            <li>Claim Type: {{claimType}}</li>
            <li>Incident Date: {{incidentDate}}</li>
          </ul>
          <p>We will review your claim and contact you within 24 hours.</p>
          <p>Best regards,<br>Home Insurance Team</p>
        </div>
      `,
      textContent: `Claim Submitted Successfully

Dear {{policyholderName}},

Your claim has been successfully submitted:
- Claim Number: {{claimNumber}}
- Policy Number: {{policyNumber}}
- Claim Type: {{claimType}}
- Incident Date: {{incidentDate}}

We will review your claim and contact you within 24 hours.

Best regards,
Home Insurance Team`,
    },

    {
      name: 'claim_status_update',
      title: 'Claim Status Update',
      subject: 'Update on Claim {{claimNumber}}',
      category: TemplateCategory.CLAIMS,
      isActive: true,
      variables: ['claimNumber', 'policyholderName', 'status'],
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Claim Status Update</h2>
          <p>Dear {{policyholderName}},</p>
          <p>Your claim {{claimNumber}} status has been updated to: <strong>{{status}}</strong></p>
          <p>Please login to your account for more details.</p>
          <p>Best regards,<br>Home Insurance Team</p>
        </div>
      `,
      textContent: `Claim Status Update

Dear {{policyholderName}},

Your claim {{claimNumber}} status has been updated to: {{status}}

Please login to your account for more details.

Best regards,
Home Insurance Team`,
    },

    // PAYMENT TEMPLATES
    {
      name: 'payment_confirmed',
      title: 'Payment Confirmation',
      subject: 'Payment Confirmed - Policy {{policyNumber}}',
      category: TemplateCategory.PAYMENTS,
      isActive: true,
      variables: ['policyNumber', 'policyholderName', 'amount', 'paymentDate'],
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Confirmed</h2>
          <p>Dear {{policyholderName}},</p>
          <p>Your payment has been successfully processed:</p>
          <ul>
            <li>Policy Number: {{policyNumber}}</li>
            <li>Amount: R{{amount}}</li>
            <li>Payment Date: {{paymentDate}}</li>
          </ul>
          <p>Thank you for your payment.</p>
          <p>Best regards,<br>Home Insurance Team</p>
        </div>
      `,
      textContent: `Payment Confirmed

Dear {{policyholderName}},

Your payment has been successfully processed:
- Policy Number: {{policyNumber}}
- Amount: R{{amount}}
- Payment Date: {{paymentDate}}

Thank you for your payment.

Best regards,
Home Insurance Team`,
    },

    {
      name: 'payment_due',
      title: 'Payment Due Reminder',
      subject: 'Payment Due - Policy {{policyNumber}}',
      category: TemplateCategory.PAYMENTS,
      isActive: true,
      variables: ['policyNumber', 'policyholderName', 'amount', 'dueDate'],
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Due Reminder</h2>
          <p>Dear {{policyholderName}},</p>
          <p>Your premium payment is due soon:</p>
          <ul>
            <li>Policy Number: {{policyNumber}}</li>
            <li>Amount Due: R{{amount}}</li>
            <li>Due Date: {{dueDate}}</li>
          </ul>
          <p>Please make your payment to avoid policy cancellation.</p>
          <p>Best regards,<br>Home Insurance Team</p>
        </div>
      `,
      textContent: `Payment Due Reminder

Dear {{policyholderName}},

Your premium payment is due soon:
- Policy Number: {{policyNumber}}
- Amount Due: R{{amount}}
- Due Date: {{dueDate}}

Please make your payment to avoid policy cancellation.

Best regards,
Home Insurance Team`,
    },

    // WELCOME TEMPLATE
    {
      name: 'welcome',
      title: 'Welcome Email',
      subject: 'Welcome to Home Insurance, {{userName}}!',
      category: TemplateCategory.WELCOME,
      isActive: true,
      variables: ['userName', 'userEmail'],
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Home Insurance!</h2>
          <p>Hi {{userName}},</p>
          <p>Welcome to Home Insurance! We're excited to have you join our community.</p>
          <p>Your account has been created with email: {{userEmail}}</p>
          <p>You can now login and start managing your insurance needs.</p>
          <p>Best regards,<br>Home Insurance Team</p>
        </div>
      `,
      textContent: `Welcome to Home Insurance!

Hi {{userName}},

Welcome to Home Insurance! We're excited to have you join our community.

Your account has been created with email: {{userEmail}}

You can now login and start managing your insurance needs.

Best regards,
Home Insurance Team`,
    },
  ];

  // Create templates in database
  for (const template of emailTemplates) {
    try {
      await prisma.emailTemplate.create({
        data: {
          ...template,
          createdBy: adminId,
          updatedBy: adminId,
        },
      });
    } catch (error) {
      console.error(`Failed to create template ${template.name}:`, error);
    }
  }
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });