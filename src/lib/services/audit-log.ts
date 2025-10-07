/**
 * Audit Logging Service
 * Tracks sensitive operations and security events
 */

import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // Policy Operations
  POLICY_CREATED = 'POLICY_CREATED',
  POLICY_UPDATED = 'POLICY_UPDATED',
  POLICY_APPROVED = 'POLICY_APPROVED',
  POLICY_REJECTED = 'POLICY_REJECTED',
  POLICY_CANCELLED = 'POLICY_CANCELLED',
  
  // Claims Operations
  CLAIM_SUBMITTED = 'CLAIM_SUBMITTED',
  CLAIM_UPDATED = 'CLAIM_UPDATED',
  CLAIM_APPROVED = 'CLAIM_APPROVED',
  CLAIM_REJECTED = 'CLAIM_REJECTED',
  CLAIM_PAID = 'CLAIM_PAID',
  
  // Payment Operations
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_ISSUED = 'REFUND_ISSUED',
  
  // Security Events
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_EXPORT = 'DATA_EXPORT',
  
  // System Events
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  EMAIL_SENT = 'EMAIL_SENT',
  SMS_SENT = 'SMS_SENT',
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

interface AuditLogData {
  action: AuditAction;
  userId?: string;
  userRole?: UserRole;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity?: AuditSeverity;
  success?: boolean;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    const {
      action,
      userId,
      userRole,
      resourceId,
      resourceType,
      details,
      ipAddress,
      userAgent,
      severity = AuditSeverity.LOW,
      success = true,
    } = data;

    // Log to database
    await db.auditLog.create({
      data: {
        action,
        userId,
        userRole,
        resourceId,
        resourceType,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
        severity,
        success,
        timestamp: new Date(),
      },
    });

    // Also log to console for immediate visibility
    const logLevel = getLogLevel(severity);
    console[logLevel](`[AUDIT] ${action}`, {
      userId,
      userRole,
      resourceId,
      success,
      details,
    });

    // For critical events, consider additional alerting
    if (severity === AuditSeverity.CRITICAL) {
      await alertCriticalEvent(data);
    }
  } catch (error) {
    // Don't throw - audit logging should never break the main flow
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Get appropriate log level based on severity
 */
function getLogLevel(severity: AuditSeverity): 'log' | 'warn' | 'error' {
  switch (severity) {
    case AuditSeverity.CRITICAL:
    case AuditSeverity.HIGH:
      return 'error';
    case AuditSeverity.MEDIUM:
      return 'warn';
    default:
      return 'log';
  }
}

/**
 * Alert on critical events (can be extended with email/SMS notifications)
 */
async function alertCriticalEvent(data: AuditLogData): Promise<void> {
  // For now, just log to console
  // In production, this should send alerts via email, SMS, or monitoring service
  console.error('🚨 CRITICAL SECURITY EVENT:', {
    action: data.action,
    userId: data.userId,
    resourceId: data.resourceId,
    details: data.details,
    timestamp: new Date().toISOString(),
  });

  // TODO: Integrate with monitoring service (e.g., Sentry, Datadog)
  // TODO: Send email/SMS to administrators
}

/**
 * Helper functions for common audit log scenarios
 */

export async function logLogin(userId: string, ipAddress?: string, userAgent?: string, success = true) {
  await createAuditLog({
    action: success ? AuditAction.LOGIN : AuditAction.LOGIN_FAILED,
    userId,
    ipAddress,
    userAgent,
    severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
    success,
  });
}

export async function logUnauthorizedAccess(
  userId: string | undefined,
  resourceType: string,
  resourceId: string,
  ipAddress?: string
) {
  await createAuditLog({
    action: AuditAction.UNAUTHORIZED_ACCESS,
    userId,
    resourceId,
    resourceType,
    ipAddress,
    severity: AuditSeverity.HIGH,
    success: false,
  });
}

export async function logPolicyAction(
  action: AuditAction,
  userId: string,
  userRole: UserRole,
  policyId: string,
  details?: Record<string, any>
) {
  await createAuditLog({
    action,
    userId,
    userRole,
    resourceId: policyId,
    resourceType: 'POLICY',
    details,
    severity: AuditSeverity.MEDIUM,
  });
}

export async function logClaimAction(
  action: AuditAction,
  userId: string,
  userRole: UserRole,
  claimId: string,
  details?: Record<string, any>
) {
  await createAuditLog({
    action,
    userId,
    userRole,
    resourceId: claimId,
    resourceType: 'CLAIM',
    details,
    severity: AuditSeverity.MEDIUM,
  });
}

export async function logPaymentAction(
  action: AuditAction,
  userId: string,
  paymentId: string,
  amount: number,
  success = true
) {
  await createAuditLog({
    action,
    userId,
    resourceId: paymentId,
    resourceType: 'PAYMENT',
    details: { amount },
    severity: success ? AuditSeverity.MEDIUM : AuditSeverity.HIGH,
    success,
  });
}

export async function logDataExport(userId: string, userRole: UserRole, exportType: string) {
  await createAuditLog({
    action: AuditAction.DATA_EXPORT,
    userId,
    userRole,
    resourceType: exportType,
    severity: AuditSeverity.HIGH,
    details: { exportType },
  });
}

export async function logRateLimitExceeded(
  identifier: string,
  endpoint: string,
  ipAddress?: string
) {
  await createAuditLog({
    action: AuditAction.RATE_LIMIT_EXCEEDED,
    resourceId: identifier,
    resourceType: 'RATE_LIMIT',
    ipAddress,
    details: { endpoint },
    severity: AuditSeverity.MEDIUM,
    success: false,
  });
}

/**
 * Query audit logs (for admin dashboard)
 */
export async function getAuditLogs(filters: {
  userId?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const {
    userId,
    action,
    severity,
    startDate,
    endDate,
    limit = 100,
    offset = 0,
  } = filters;

  return await db.auditLog.findMany({
    where: {
      ...(userId && { userId }),
      ...(action && { action }),
      ...(severity && { severity }),
      ...(startDate && { timestamp: { gte: startDate } }),
      ...(endDate && { timestamp: { lte: endDate } }),
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset,
  });
}

