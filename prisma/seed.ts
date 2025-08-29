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
        address: '123 Maple Street, Springfield, IL 62701',
        propertyType: 'Single Family Home',
        buildYear: 2015,
        squareFeet: 2400,
      },
    },
  });

  const autoPolicy = await prisma.policy.create({
    data: {
      policyNumber: 'POL-AUTO-001',
      userId: customer.id,
      type: PolicyType.AUTO,
      status: PolicyStatus.ACTIVE,
      premium: 1200.00,
      coverage: 100000.00,
      deductible: 1000.00,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-01-15'),
      vehicleInfo: {
        make: 'Honda',
        model: 'Civic',
        year: 2022,
        vin: '1HGBH41JXMN109186',
        licensePlate: 'ABC1234',
      },
    },
  });

  const lifePolicy = await prisma.policy.create({
    data: {
      policyNumber: 'POL-LIFE-001',
      userId: customer.id,
      type: PolicyType.LIFE,
      status: PolicyStatus.PENDING_REVIEW,
      premium: 2400.00,
      coverage: 500000.00,
      deductible: 0.00,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2054-03-01'),
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
      type: ClaimType.FIRE,
      status: ClaimStatus.UNDER_REVIEW,
      amount: 15000.00,
      description: 'Kitchen fire damage from electrical malfunction. Smoke damage throughout first floor, need repairs to cabinets, countertops, and paint.',
      incidentDate: new Date('2024-08-15'),
      location: '123 Maple Street, Springfield, IL 62701',
      what3words: 'filled.count.soap',
    },
  });

  const autoClaim = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-AUTO-001',
      userId: customer.id,
      policyId: autoPolicy.id,
      type: ClaimType.AUTO_ACCIDENT,
      status: ClaimStatus.APPROVED,
      amount: 8500.00,
      description: 'Rear-end collision at intersection. Damage to rear bumper, trunk, and taillights.',
      incidentDate: new Date('2024-07-22'),
      location: 'Main St & Oak Ave, Springfield, IL',
      what3words: 'three.word.address',
    },
  });

  const theftClaim = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-THEFT-001',
      userId: customer.id,
      policyId: homePolicy.id,
      type: ClaimType.THEFT,
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
      policyId: autoPolicy.id,
      stripeId: 'pi_test_payment_002',
      amount: 100.00, // Monthly premium
      currency: 'zar',
      status: PaymentStatus.PENDING,
      type: PaymentType.PREMIUM,
      dueDate: new Date('2024-09-15'),
    },
  });

  await prisma.payment.create({
    data: {
      policyId: autoPolicy.id,
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
      claimId: autoClaim.id,
      filename: 'accident_photos.jpg',
      url: 'https://example.com/documents/accident_photos.jpg',
      type: DocumentType.PHOTO,
      size: 3145728, // 3MB
      mimeType: 'image/jpeg',
    },
  });

  await prisma.document.create({
    data: {
      claimId: autoClaim.id,
      filename: 'police_report_12345.pdf',
      url: 'https://example.com/documents/police_report_12345.pdf',
      type: DocumentType.POLICE_REPORT,
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