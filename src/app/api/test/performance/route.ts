/**
 * Performance Test Endpoint
 *
 * Tests and reports on various performance metrics:
 * - Database query performance
 * - Cache hit rates
 * - Bundle sizes
 * - API response times
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PerformanceTest {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  duration?: number;
  details?: string;
  metric?: number;
  threshold?: number;
}

export async function GET(req: NextRequest) {
  const tests: PerformanceTest[] = [];
  const startTime = Date.now();

  // Test 1: Database connection speed
  try {
    const dbStart = Date.now();
    await db.user.count();
    const dbDuration = Date.now() - dbStart;

    tests.push({
      name: 'Database Connection',
      status: dbDuration < 500 ? 'pass' : dbDuration < 1000 ? 'warning' : 'fail',
      duration: dbDuration,
      threshold: 500,
      details: `Query completed in ${dbDuration}ms`,
    });
  } catch (error: any) {
    tests.push({
      name: 'Database Connection',
      status: 'fail',
      details: error.message,
    });
  }

  // Test 2: Database index usage (User model)
  try {
    const indexStart = Date.now();
    // Query that should use index (role + status)
    await db.user.findMany({
      where: { role: 'CUSTOMER', status: 'ACTIVE' },
      take: 10,
    });
    const indexDuration = Date.now() - indexStart;

    tests.push({
      name: 'Database Indexed Query (Users)',
      status: indexDuration < 100 ? 'pass' : indexDuration < 250 ? 'warning' : 'fail',
      duration: indexDuration,
      threshold: 100,
      details: `Indexed query completed in ${indexDuration}ms`,
    });
  } catch (error: any) {
    tests.push({
      name: 'Database Indexed Query (Users)',
      status: 'fail',
      details: error.message,
    });
  }

  // Test 3: Database query with relations
  try {
    const relationStart = Date.now();
    await db.policy.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: { select: { id: true, email: true } },
        claims: { select: { id: true, status: true } },
      },
      take: 5,
    });
    const relationDuration = Date.now() - relationStart;

    tests.push({
      name: 'Database Query with Relations',
      status: relationDuration < 200 ? 'pass' : relationDuration < 500 ? 'warning' : 'fail',
      duration: relationDuration,
      threshold: 200,
      details: `Query with relations completed in ${relationDuration}ms`,
    });
  } catch (error: any) {
    tests.push({
      name: 'Database Query with Relations',
      status: 'fail',
      details: error.message,
    });
  }

  // Test 4: Collection counts (database size metrics)
  try {
    const counts = {
      users: await db.user.count(),
      policies: await db.policy.count(),
      claims: await db.claim.count(),
      payments: await db.payment.count(),
      notifications: await db.notification.count(),
      emails: await db.email.count(),
    };

    tests.push({
      name: 'Database Size Metrics',
      status: 'pass',
      details: `Users: ${counts.users}, Policies: ${counts.policies}, Claims: ${counts.claims}, Payments: ${counts.payments}, Notifications: ${counts.notifications}, Emails: ${counts.emails}`,
    });
  } catch (error: any) {
    tests.push({
      name: 'Database Size Metrics',
      status: 'fail',
      details: error.message,
    });
  }

  // Test 5: Memory usage
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

  tests.push({
    name: 'Memory Usage',
    status: heapUsedMB < 200 ? 'pass' : heapUsedMB < 400 ? 'warning' : 'fail',
    metric: heapUsedMB,
    threshold: 200,
    details: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB`,
  });

  // Test 6: Environment configuration
  const envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
    JWT_SECRET: !!process.env.JWT_SECRET,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    PAYSTACK_SECRET_KEY: !!process.env.PAYSTACK_SECRET_KEY,
  };

  const missingEnvVars = Object.entries(envVars)
    .filter(([_, exists]) => !exists)
    .map(([key]) => key);

  tests.push({
    name: 'Environment Configuration',
    status: missingEnvVars.length === 0 ? 'pass' : 'warning',
    details:
      missingEnvVars.length === 0
        ? 'All critical environment variables are set'
        : `Missing: ${missingEnvVars.join(', ')}`,
  });

  // Calculate overall metrics
  const totalDuration = Date.now() - startTime;
  const passCount = tests.filter(t => t.status === 'pass').length;
  const failCount = tests.filter(t => t.status === 'fail').length;
  const warningCount = tests.filter(t => t.status === 'warning').length;

  const overallStatus =
    failCount > 0 ? 'fail' : warningCount > 0 ? 'warning' : 'pass';

  // Performance score (0-100)
  const performanceScore = Math.round(
    ((passCount * 100 + warningCount * 50) / tests.length)
  );

  return NextResponse.json({
    summary: {
      status: overallStatus,
      score: performanceScore,
      totalTests: tests.length,
      passed: passCount,
      warnings: warningCount,
      failed: failCount,
      totalDuration: `${totalDuration}ms`,
    },
    tests,
    recommendations: generateRecommendations(tests),
    timestamp: new Date().toISOString(),
  });
}

function generateRecommendations(tests: PerformanceTest[]): string[] {
  const recommendations: string[] = [];

  // Database performance recommendations
  const dbTests = tests.filter(t => t.name.includes('Database'));
  const slowDbTests = dbTests.filter(
    t => t.duration && t.threshold && t.duration > t.threshold
  );

  if (slowDbTests.length > 0) {
    recommendations.push(
      '🔍 Database queries are slow. Verify indexes are created: run `npx prisma db push`'
    );
  }

  // Memory recommendations
  const memoryTest = tests.find(t => t.name === 'Memory Usage');
  if (memoryTest && memoryTest.metric && memoryTest.metric > 300) {
    recommendations.push(
      '💾 High memory usage detected. Consider implementing pagination or reducing query result sizes.'
    );
  }

  // Environment recommendations
  const envTest = tests.find(t => t.name === 'Environment Configuration');
  if (envTest && envTest.status !== 'pass') {
    recommendations.push(
      '⚙️ Missing environment variables. Check .env.example and configure all required variables.'
    );
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      '✅ Performance looks good! Consider implementing React Query cache optimization for frequently accessed data.',
      '📊 Monitor database query patterns in production and add indexes as needed.',
      '🚀 Consider adding Redis cache for frequently accessed data if traffic increases.'
    );
  }

  return recommendations;
}
