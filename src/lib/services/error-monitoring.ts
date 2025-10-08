/**
 * Error Monitoring Service
 *
 * Centralized error tracking and monitoring for production debugging.
 * Captures errors, categorizes them, and provides context for investigation.
 */

import { analytics } from './analytics';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  NETWORK = 'network',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  UNKNOWN = 'unknown',
}

export interface ErrorContext {
  userId?: string;
  userRole?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface CapturedError {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  timestamp: Date;
  environment: string;
}

class ErrorMonitoringService {
  private static instance: ErrorMonitoringService;
  private errorQueue: CapturedError[] = [];
  private maxQueueSize = 100;

  static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }

  /**
   * Capture an error with context
   */
  captureError(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context: ErrorContext = {}
  ): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    const capturedError: CapturedError = {
      id: this.generateErrorId(),
      message: errorMessage,
      stack: errorStack,
      severity,
      category,
      context,
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
    };

    // Add to queue
    this.errorQueue.push(capturedError);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift(); // Remove oldest error
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Monitoring]', {
        severity,
        category,
        message: errorMessage,
        context,
      });
    }

    // Send to PostHog
    analytics.errorEvents.occurred(category, errorMessage, {
      severity,
      stack: errorStack?.substring(0, 500), // Truncate stack trace
      ...context,
    });

    // Alert for critical errors
    if (severity === ErrorSeverity.CRITICAL) {
      this.alertCriticalError(capturedError);
    }
  }

  /**
   * Capture exception with automatic categorization
   */
  captureException(error: Error, context: ErrorContext = {}): void {
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(error, category);
    this.captureError(error, severity, category, context);
  }

  /**
   * Capture API error
   */
  captureAPIError(
    endpoint: string,
    method: string,
    statusCode: number,
    error: Error | string,
    context: ErrorContext = {}
  ): void {
    const severity = this.determineSeverityFromStatusCode(statusCode);
    const category = statusCode >= 500 ? ErrorCategory.EXTERNAL_SERVICE : ErrorCategory.NETWORK;

    this.captureError(error, severity, category, {
      endpoint,
      method,
      statusCode,
      ...context,
    });

    // Also send to PostHog API error event
    analytics.errorEvents.apiError(
      endpoint,
      statusCode,
      typeof error === 'string' ? error : error.message
    );
  }

  /**
   * Capture database error
   */
  captureDatabaseError(
    operation: string,
    error: Error,
    query?: string,
    context: ErrorContext = {}
  ): void {
    this.captureError(error, ErrorSeverity.HIGH, ErrorCategory.DATABASE, {
      ...context,
      metadata: {
        operation,
        query: query?.substring(0, 200), // Truncate long queries
      },
    });
  }

  /**
   * Capture authentication error
   */
  captureAuthError(
    authType: 'login' | 'signup' | 'token' | 'session',
    error: Error | string,
    context: ErrorContext = {}
  ): void {
    this.captureError(error, ErrorSeverity.MEDIUM, ErrorCategory.AUTHENTICATION, {
      ...context,
      metadata: { authType },
    });
  }

  /**
   * Capture authorization error (permission denied)
   */
  captureAuthzError(
    requiredPermission: string,
    userId: string,
    userRole: string,
    context: ErrorContext = {}
  ): void {
    this.captureError(
      `Permission denied: ${requiredPermission}`,
      ErrorSeverity.LOW,
      ErrorCategory.AUTHORIZATION,
      {
        userId,
        userRole,
        ...context,
        metadata: { requiredPermission },
      }
    );
  }

  /**
   * Capture validation error
   */
  captureValidationError(
    field: string,
    value: any,
    error: string,
    context: ErrorContext = {}
  ): void {
    this.captureError(
      `Validation failed for ${field}: ${error}`,
      ErrorSeverity.LOW,
      ErrorCategory.VALIDATION,
      {
        ...context,
        metadata: { field, value: JSON.stringify(value).substring(0, 100) },
      }
    );
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): CapturedError[] {
    return this.errorQueue.slice(-count).reverse();
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): CapturedError[] {
    return this.errorQueue.filter(e => e.severity === severity);
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): CapturedError[] {
    return this.errorQueue.filter(e => e.category === category);
  }

  /**
   * Clear error queue
   */
  clearErrors(): void {
    this.errorQueue = [];
  }

  /**
   * Get error statistics
   */
  getStats() {
    const total = this.errorQueue.length;
    const bySeverity = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    };
    const byCategory = {
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.DATABASE]: 0,
      [ErrorCategory.AUTHENTICATION]: 0,
      [ErrorCategory.AUTHORIZATION]: 0,
      [ErrorCategory.VALIDATION]: 0,
      [ErrorCategory.BUSINESS_LOGIC]: 0,
      [ErrorCategory.EXTERNAL_SERVICE]: 0,
      [ErrorCategory.UNKNOWN]: 0,
    };

    this.errorQueue.forEach(error => {
      bySeverity[error.severity]++;
      byCategory[error.category]++;
    });

    return {
      total,
      bySeverity,
      byCategory,
      oldest: this.errorQueue[0]?.timestamp,
      newest: this.errorQueue[this.errorQueue.length - 1]?.timestamp,
    };
  }

  // Private methods

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('database') || message.includes('prisma') || name.includes('prismaerror')) {
      return ErrorCategory.DATABASE;
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (message.includes('validation') || name.includes('validationerror')) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes('api') || message.includes('service')) {
      return ErrorCategory.EXTERNAL_SERVICE;
    }

    return ErrorCategory.UNKNOWN;
  }

  private determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    // Critical categories
    if (category === ErrorCategory.DATABASE) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity
    if (category === ErrorCategory.NETWORK || category === ErrorCategory.EXTERNAL_SERVICE) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity
    if (category === ErrorCategory.VALIDATION || category === ErrorCategory.AUTHORIZATION) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  private determineSeverityFromStatusCode(statusCode: number): ErrorSeverity {
    if (statusCode >= 500) return ErrorSeverity.HIGH;
    if (statusCode >= 400) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  private alertCriticalError(error: CapturedError): void {
    // In production, this would send alerts via email, Slack, etc.
    console.error('🚨 CRITICAL ERROR:', {
      id: error.id,
      message: error.message,
      category: error.category,
      context: error.context,
    });

    // Could integrate with notification services here
    // Example: Send to Slack, PagerDuty, email, etc.
  }
}

export const errorMonitoring = ErrorMonitoringService.getInstance();
