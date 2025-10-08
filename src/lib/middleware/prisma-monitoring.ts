/**
 * Prisma Query Performance Monitoring Middleware
 *
 * Automatically tracks all database queries and their performance.
 * Integrates with performance monitoring service.
 */

import { Prisma } from '@prisma/client';
import { performanceMonitoring } from '../services/performance-monitoring';

export function createPrismaMonitoringMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const startTime = performance.now();

    try {
      const result = await next(params);
      const duration = performance.now() - startTime;

      // Get result count for find operations
      let resultCount: number | undefined;
      if (Array.isArray(result)) {
        resultCount = result.length;
      } else if (result && typeof result === 'object') {
        resultCount = 1;
      }

      // Track query performance
      performanceMonitoring.trackQuery(
        params.action,
        params.model || 'unknown',
        duration,
        resultCount,
        false // We don't track cache hits here yet
      );

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Track failed query
      performanceMonitoring.trackQuery(
        params.action,
        params.model || 'unknown',
        duration,
        0,
        false
      );

      throw error;
    }
  };
}

/**
 * Prisma Query Logging Middleware (Development)
 *
 * Logs detailed query information in development mode
 */
export function createPrismaLoggingMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    if (process.env.NODE_ENV !== 'development') {
      return next(params);
    }

    const startTime = performance.now();
    const result = await next(params);
    const duration = performance.now() - startTime;

    // Log slow queries
    if (duration > 100) {
      console.log(`🐌 Slow Query [${duration.toFixed(2)}ms]:`, {
        model: params.model,
        action: params.action,
        args: JSON.stringify(params.args).substring(0, 200),
      });
    }

    return result;
  };
}

/**
 * Prisma Error Logging Middleware
 *
 * Captures and categorizes database errors
 */
export function createPrismaErrorMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    try {
      return await next(params);
    } catch (error) {
      // Import error monitoring lazily to avoid circular dependencies
      const { errorMonitoring, ErrorCategory, ErrorSeverity } = await import(
        '../services/error-monitoring'
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Known Prisma errors
        errorMonitoring.captureDatabaseError(
          `${params.model}.${params.action}`,
          error as Error,
          `Code: ${error.code}`,
          {
            metadata: {
              code: error.code,
              meta: error.meta,
            },
          }
        );
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        // Validation errors
        errorMonitoring.captureError(
          error as Error,
          ErrorSeverity.MEDIUM,
          ErrorCategory.VALIDATION,
          {
            metadata: {
              model: params.model,
              action: params.action,
            },
          }
        );
      } else {
        // Unknown database errors
        errorMonitoring.captureDatabaseError(
          `${params.model}.${params.action}`,
          error as Error
        );
      }

      throw error;
    }
  };
}
