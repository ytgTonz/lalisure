/**
 * Monitoring Dashboard API
 *
 * Provides real-time monitoring data for:
 * - Error statistics
 * - Performance metrics
 * - Database query performance
 * - System health
 */

import { NextRequest, NextResponse } from 'next/server';
import { errorMonitoring } from '@/lib/services/error-monitoring';
import { performanceMonitoring } from '@/lib/services/performance-monitoring';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Collect all monitoring data
    const [
      errorStats,
      performanceStats,
      queryStats,
      recentErrors,
      slowOperations,
      slowQueries,
      systemHealth,
    ] = await Promise.all([
      Promise.resolve(errorMonitoring.getStats()),
      Promise.resolve(performanceMonitoring.getStats()),
      Promise.resolve(performanceMonitoring.getQueryStats()),
      Promise.resolve(errorMonitoring.getRecentErrors(10)),
      Promise.resolve(performanceMonitoring.getSlowOperations(500)),
      Promise.resolve(performanceMonitoring.getSlowQueries(100)),
      getSystemHealth(),
    ]);

    // Calculate health score (0-100)
    const healthScore = calculateHealthScore(errorStats, queryStats, systemHealth);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      healthScore,
      errors: {
        stats: errorStats,
        recent: recentErrors.map(e => ({
          id: e.id,
          message: e.message,
          severity: e.severity,
          category: e.category,
          timestamp: e.timestamp,
          context: {
            userId: e.context.userId,
            endpoint: e.context.endpoint,
            statusCode: e.context.statusCode,
          },
        })),
      },
      performance: {
        stats: performanceStats,
        slowOperations: slowOperations.map(op => ({
          name: op.name,
          duration: Math.round(op.duration),
          timestamp: op.timestamp,
          metadata: op.metadata,
        })),
      },
      database: {
        queryStats,
        slowQueries: slowQueries.map(q => ({
          model: q.model,
          operation: q.operation,
          duration: Math.round(q.duration),
          resultCount: q.resultCount,
          cached: q.cached,
        })),
      },
      system: systemHealth,
      recommendations: generateRecommendations(errorStats, queryStats, performanceStats),
    });
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}

async function getSystemHealth() {
  const startTime = Date.now();

  try {
    // Test database connection
    await db.user.count();
    const dbResponseTime = Date.now() - startTime;

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

    // Uptime
    const uptimeSeconds = Math.floor(process.uptime());

    return {
      database: {
        connected: true,
        responseTime: dbResponseTime,
        status: dbResponseTime < 500 ? 'healthy' : dbResponseTime < 1000 ? 'degraded' : 'slow',
      },
      memory: {
        heapUsed: heapUsedMB,
        heapTotal: heapTotalMB,
        heapPercentage: Math.round((heapUsedMB / heapTotalMB) * 100),
        status: heapUsedMB < 200 ? 'healthy' : heapUsedMB < 400 ? 'warning' : 'critical',
      },
      uptime: {
        seconds: uptimeSeconds,
        formatted: formatUptime(uptimeSeconds),
      },
      environment: process.env.NODE_ENV || 'development',
    };
  } catch (error) {
    return {
      database: {
        connected: false,
        responseTime: null,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      memory: { heapUsed: 0, heapTotal: 0, heapPercentage: 0, status: 'unknown' },
      uptime: { seconds: 0, formatted: '0s' },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

function calculateHealthScore(
  errorStats: any,
  queryStats: any,
  systemHealth: any
): number {
  let score = 100;

  // Deduct for errors
  score -= errorStats.bySeverity?.CRITICAL * 10 || 0;
  score -= errorStats.bySeverity?.HIGH * 5 || 0;
  score -= errorStats.bySeverity?.MEDIUM * 2 || 0;

  // Deduct for slow queries
  if (queryStats.slowQueries > 10) score -= 10;
  else if (queryStats.slowQueries > 5) score -= 5;

  // Deduct for poor cache hit rate
  if (queryStats.cacheHitRate < 30) score -= 10;
  else if (queryStats.cacheHitRate < 50) score -= 5;

  // Deduct for system health issues
  if (systemHealth.database?.status === 'slow') score -= 15;
  else if (systemHealth.database?.status === 'degraded') score -= 10;
  else if (systemHealth.database?.status === 'error') score -= 30;

  if (systemHealth.memory?.status === 'critical') score -= 20;
  else if (systemHealth.memory?.status === 'warning') score -= 10;

  return Math.max(0, Math.min(100, score));
}

function generateRecommendations(
  errorStats: any,
  queryStats: any,
  performanceStats: any
): string[] {
  const recommendations: string[] = [];

  // Error-based recommendations
  if (errorStats.bySeverity?.CRITICAL > 0) {
    recommendations.push(
      `🚨 ${errorStats.bySeverity.CRITICAL} critical errors detected. Investigate immediately.`
    );
  }

  if (errorStats.byCategory?.DATABASE > 5) {
    recommendations.push(
      '🔍 Multiple database errors detected. Check database connectivity and query correctness.'
    );
  }

  // Query performance recommendations
  if (queryStats.slowQueries > 10) {
    recommendations.push(
      `🐌 ${queryStats.slowQueries} slow queries detected. Review and optimize database indexes.`
    );
  }

  if (queryStats.cacheHitRate < 30) {
    recommendations.push(
      `📊 Low cache hit rate (${queryStats.cacheHitRate.toFixed(1)}%). Implement caching for frequently accessed data.`
    );
  }

  // Performance recommendations
  if (performanceStats.p95 > 1000) {
    recommendations.push(
      `⏱️ 95th percentile response time is ${performanceStats.p95.toFixed(0)}ms. Optimize slow operations.`
    );
  }

  // Success message if all is well
  if (recommendations.length === 0) {
    recommendations.push(
      '✅ System is healthy. All metrics within acceptable ranges.',
      '📈 Continue monitoring performance trends.',
      '🔄 Consider implementing Redis cache if traffic increases.'
    );
  }

  return recommendations;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
