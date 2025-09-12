import { SecurityEventType, SecurityEventSeverity } from '@prisma/client';
import { db } from '@/lib/db';

export interface SecurityEventData {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  description: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export class SecurityLogger {
  static async logEvent(eventData: SecurityEventData) {
    try {
      await db.securityEvent.create({
        data: {
          type: eventData.type,
          severity: eventData.severity,
          userId: eventData.userId,
          userEmail: eventData.userEmail,
          description: eventData.description,
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
          metadata: eventData.metadata
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  static async logLogin(userId: string, userEmail: string, ipAddress?: string, userAgent?: string) {
    await this.logEvent({
      type: SecurityEventType.LOGIN,
      severity: SecurityEventSeverity.LOW,
      description: 'User logged in successfully',
      userId,
      userEmail,
      ipAddress,
      userAgent
    });
  }

  static async logFailedLogin(email: string, ipAddress?: string, userAgent?: string, reason?: string) {
    await this.logEvent({
      type: SecurityEventType.FAILED_LOGIN,
      severity: SecurityEventSeverity.MEDIUM,
      description: `Failed login attempt${reason ? `: ${reason}` : ''}`,
      userEmail: email,
      ipAddress,
      userAgent,
      metadata: { reason }
    });
  }

  static async logPermissionChange(userId: string, userEmail: string, oldRole: string, newRole: string, changedBy: string, ipAddress?: string, userAgent?: string) {
    await this.logEvent({
      type: SecurityEventType.PERMISSION_CHANGE,
      severity: SecurityEventSeverity.HIGH,
      description: `User role changed from ${oldRole} to ${newRole}`,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata: { oldRole, newRole, changedBy }
    });
  }

  static async logDataAccess(userId: string, userEmail: string, resource: string, action: string, ipAddress?: string, userAgent?: string) {
    await this.logEvent({
      type: SecurityEventType.DATA_ACCESS,
      severity: SecurityEventSeverity.LOW,
      description: `Data access: ${action} on ${resource}`,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata: { resource, action }
    });
  }

  static async logSuspiciousActivity(userId: string, userEmail: string, description: string, ipAddress?: string, userAgent?: string, metadata?: any) {
    await this.logEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: SecurityEventSeverity.CRITICAL,
      description,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata
    });
  }

  static async logPasswordChange(userId: string, userEmail: string, ipAddress?: string, userAgent?: string) {
    await this.logEvent({
      type: SecurityEventType.PASSWORD_CHANGE,
      severity: SecurityEventSeverity.MEDIUM,
      description: 'Password changed',
      userId,
      userEmail,
      ipAddress,
      userAgent
    });
  }

  static async logRoleChange(userId: string, userEmail: string, oldRole: string, newRole: string, changedBy: string, ipAddress?: string, userAgent?: string) {
    await this.logEvent({
      type: SecurityEventType.ROLE_CHANGE,
      severity: SecurityEventSeverity.HIGH,
      description: `User role changed from ${oldRole} to ${newRole}`,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata: { oldRole, newRole, changedBy }
    });
  }

  static async logSystemAccess(userId: string, userEmail: string, action: string, ipAddress?: string, userAgent?: string, metadata?: any) {
    await this.logEvent({
      type: SecurityEventType.SYSTEM_ACCESS,
      severity: SecurityEventSeverity.LOW,
      description: `System access: ${action}`,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata
    });
  }

  static async logApiAccess(userId: string, userEmail: string, endpoint: string, method: string, ipAddress?: string, userAgent?: string) {
    await this.logEvent({
      type: SecurityEventType.API_ACCESS,
      severity: SecurityEventSeverity.LOW,
      description: `API access: ${method} ${endpoint}`,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata: { endpoint, method }
    });
  }

  static async logFileUpload(userId: string, userEmail: string, fileName: string, fileType: string, ipAddress?: string, userAgent?: string) {
    await this.logEvent({
      type: SecurityEventType.FILE_UPLOAD,
      severity: SecurityEventSeverity.LOW,
      description: `File uploaded: ${fileName}`,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata: { fileName, fileType }
    });
  }

  static async logDataExport(userId: string, userEmail: string, dataType: string, recordCount: number, ipAddress?: string, userAgent?: string) {
    await this.logEvent({
      type: SecurityEventType.DATA_EXPORT,
      severity: SecurityEventSeverity.MEDIUM,
      description: `Data exported: ${dataType} (${recordCount} records)`,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata: { dataType, recordCount }
    });
  }

  static async logConfigurationChange(userId: string, userEmail: string, setting: string, oldValue: any, newValue: any, ipAddress?: string, userAgent?: string) {
    await this.logEvent({
      type: SecurityEventType.CONFIGURATION_CHANGE,
      severity: SecurityEventSeverity.HIGH,
      description: `Configuration changed: ${setting}`,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata: { setting, oldValue, newValue }
    });
  }
}
