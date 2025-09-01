import { PrismaClient, UserRole, PolicyType, PolicyStatus, ClaimType, ClaimStatus, DocumentType, PaymentStatus, PaymentType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.document.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database...');

  // Create users
  const customer = await prisma.user.create({
    data: {
      clerkId: 'user_2dummy1customer',
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0123',
      role: UserRole.CUSTOMER,
    },
  });

  const agent = await prisma.user.create({
    data: {
      clerkId: 'user_2dummy2agent',
      email: 'agent@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0124',
      role: UserRole.AGENT,
    },
  });

  const underwriter = await prisma.user.create({
    data: {
      clerkId: 'user_2dummy3underwriter',
      email: 'underwriter@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      phone: '+1-555-0125',
      role: UserRole.UNDERWRITER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      clerkId: 'user_2dummy4admin',
      email: 'admin@example.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      phone: '+1-555-0126',
      role: UserRole.ADMIN,
    },
  });

  // Create policies for customer
  const homePolicy = await prisma.policy.create({
    data: {
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

  const homePolicy2 = await prisma.policy.create({
    data: {
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
  const homeClaim = await prisma.claim.create({
    data: {
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

  const waterClaim = await prisma.claim.create({
    data: {
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

  const theftClaim = await prisma.claim.create({
    data: {
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
      stripeId: 'pi_test_payment_001',
      paystackId: 'ref_test_paystack_001',
      amount: 462.50, // Quarterly premium
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
      stripeId: 'pi_test_payment_002',
      amount: 550.00, // Monthly premium
      currency: 'zar',
      status: PaymentStatus.PENDING,
      type: PaymentType.PREMIUM,
      dueDate: new Date('2024-09-15'),
    },
  });

  await prisma.payment.create({
    data: {
      policyId: homePolicy2.id,
      stripeId: 'pi_test_payment_003',
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

  console.log('Database seeded successfully!');
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.policy.count()} policies`);
  console.log(`Created ${await prisma.claim.count()} claims`);
  console.log(`Created ${await prisma.payment.count()} payments`);
  console.log(`Created ${await prisma.document.count()} documents`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });