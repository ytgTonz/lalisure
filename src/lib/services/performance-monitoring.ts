/**
 * Performance Monitoring Service
 *
 * Tracks application performance metrics including:
 * - API response times
 * - Database query performance
 * - Page load times
 * - Resource usage
 */

import { analytics } from './analytics';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface QueryPerformance {
  operation: string;
  model: string;
  duration: number;
  resultCount?: number;
  cached?: boolean;
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: PerformanceMetric[] = [];
  private queryMetrics: QueryPerformance[] = [];
  private maxMetrics = 1000;
  private slowQueryThreshold = 100; // ms

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Start performance measurement
   */
  startMeasure(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    };
  }

  /**
   * Measure async function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Measure sync function execution time
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    const startTime = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date(),
      metadata,
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Send slow operations to analytics
    if (duration > 1000) { // > 1 second
      analytics.capture('slow_operation', {
        operation_name: name,
        duration_ms: duration,
        ...metadata,
      });
    }

    // Log in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log(`⏱️ [Performance] ${name}: ${duration.toFixed(2)}ms`, metadata);
    }
  }

  /**
   * Track database query performance
   */
  trackQuery(
    operation: string,
    model: string,
    duration: number,
    resultCount?: number,
    cached: boolean = false
  ): void {
    const queryMetric: QueryPerformance = {
      operation,
      model,
      duration,
      resultCount,
      cached,
    };

    this.queryMetrics.push(queryMetric);
    if (this.queryMetrics.length > this.maxMetrics) {
      this.queryMetrics.shift();
    }

    // Alert on slow queries
    if (duration > this.slowQueryThreshold) {
      console.warn(`🐌 Slow query detected: ${model}.${operation} took ${duration}ms`);

      analytics.capture('slow_database_query', {
        model,
        operation,
        duration_ms: duration,
        result_count: resultCount,
        cached,
      });
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
    if (this.metrics.length === 0) {
      return {
        total: 0,
        average: 0,
        median: 0,
        p95: 0,
        p99: 0,
        min: 0,
        max: 0,
      };
    }

    const durations = this.metrics.map(m => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      total: this.metrics.length,
      average: sum / durations.length,
      median: this.getPercentile(durations, 50),
      p95: this.getPercentile(durations, 95),
      p99: this.getPercentile(durations, 99),
      min: durations[0],
      max: durations[durations.length - 1],
    };
  }

  /**
   * Get query statistics
   */
  getQueryStats() {
    if (this.queryMetrics.length === 0) {
      return {
        total: 0,
        byModel: {},
        byOperation: {},
        slowQueries: 0,
        cachedQueries: 0,
        averageDuration: 0,
      };
    }

    const byModel: Record<string, number> = {};
    const byOperation: Record<string, number> = {};
    let slowQueries = 0;
    let cachedQueries = 0;
    const durations = this.queryMetrics.map(q => q.duration);
    const sum = durations.reduce((a, b) => a + b, 0);

    this.queryMetrics.forEach(query => {
      byModel[query.model] = (byModel[query.model] || 0) + 1;
      byOperation[query.operation] = (byOperation[query.operation] || 0) + 1;
      if (query.duration > this.slowQueryThreshold) slowQueries++;
      if (query.cached) cachedQueries++;
    });

    return {
      total: this.queryMetrics.length,
      byModel,
      byOperation,
      slowQueries,
      cachedQueries,
      averageDuration: sum / this.queryMetrics.length,
      cacheHitRate: (cachedQueries / this.queryMetrics.length) * 100,
    };
  }

  /**
   * Get recent slow operations
   */
  getSlowOperations(threshold: number = 1000): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 20);
  }

  /**
   * Get recent slow queries
   */
  getSlowQueries(threshold?: number): QueryPerformance[] {
    const t = threshold || this.slowQueryThreshold;
    return this.queryMetrics
      .filter(q => q.duration > t)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 20);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.queryMetrics = [];
  }

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(ms: number): void {
    this.slowQueryThreshold = ms;
  }

  /**
   * Track API endpoint performance
   */
  trackAPIEndpoint(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number
  ): void {
    this.recordMetric(`API: ${method} ${endpoint}`, duration, {
      endpoint,
      method,
      statusCode,
      type: 'api',
    });

    // Send to PostHog
    analytics.capture('api_request', {
      endpoint,
      method,
      status_code: statusCode,
      duration_ms: duration,
      slow: duration > 1000,
    });
  }

  /**
   * Track page load performance
   */
  trackPageLoad(pageName: string, loadTime: number): void {
    this.recordMetric(`Page: ${pageName}`, loadTime, {
      type: 'page_load',
    });

    analytics.performanceEvents.pageLoadTime(pageName, loadTime);
  }

  /**
   * Track form submission performance
   */
  trackFormSubmission(formName: string, submissionTime: number): void {
    this.recordMetric(`Form: ${formName}`, submissionTime, {
      type: 'form_submission',
    });

    analytics.performanceEvents.formSubmissionTime(formName, submissionTime);
  }

  // Private helpers

  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[index];
  }
}

export const performanceMonitoring = PerformanceMonitoringService.getInstance();

/**
 * Decorator for measuring function performance
 */
export function Measure(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return await performanceMonitoring.measureAsync(
        measureName,
        () => originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}
