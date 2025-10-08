/**
 * Security Testing Endpoint
 * Tests rate limiting, sanitization, and audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RateLimitPresets, getClientIdentifier } from '@/lib/utils/rate-limit';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/utils/sanitize';
import { createSecureResponse } from '@/lib/utils/security-headers';
import { createAuditLog, AuditAction, AuditSeverity } from '@/lib/services/audit-log';

export async function GET(request: NextRequest) {
  try {
    // Test rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(identifier, RateLimitPresets.API);

    if (!rateLimitResult.success) {
      // Log rate limit exceeded
      await createAuditLog({
        action: AuditAction.RATE_LIMIT_EXCEEDED,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        severity: AuditSeverity.MEDIUM,
        success: false,
        details: {
          endpoint: '/api/test/security',
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
      });

      return createSecureResponse(
        JSON.stringify({
          error: rateLimitResult.message,
          resetAt: rateLimitResult.resetAt,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
          },
        }
      );
    }

    // Test sanitization
    const testInputs = {
      maliciousHtml: '<script>alert("XSS")</script>Hello',
      email: 'TEST@Example.COM  ',
      phone: '0821234567',
      normalText: 'This is safe text',
    };

    const sanitized = {
      html: sanitizeString(testInputs.maliciousHtml),
      email: sanitizeEmail(testInputs.email),
      phone: sanitizePhone(testInputs.phone),
      text: sanitizeString(testInputs.normalText),
    };

    // Log security test access
    await createAuditLog({
      action: AuditAction.SYSTEM_CONFIG_CHANGED,
      resourceType: 'SECURITY_TEST',
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      severity: AuditSeverity.LOW,
      details: {
        endpoint: '/api/test/security',
        testType: 'security_features',
      },
    });

    return createSecureResponse(
      JSON.stringify({
        success: true,
        security: {
          rateLimit: {
            enabled: true,
            remaining: rateLimitResult.remaining,
            resetAt: new Date(rateLimitResult.resetAt).toISOString(),
          },
          sanitization: {
            enabled: true,
            examples: {
              original: testInputs,
              sanitized,
            },
          },
          headers: {
            enabled: true,
            applied: [
              'Content-Security-Policy',
              'X-Content-Type-Options',
              'X-Frame-Options',
              'Referrer-Policy',
            ],
          },
          auditLogging: {
            enabled: true,
            logged: ['RATE_LIMIT_EXCEEDED', 'SYSTEM_CONFIG_CHANGED'],
          },
        },
        message: 'All security features are operational',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Security test error:', error);
    
    return createSecureResponse(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply stricter rate limiting for write operations
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(identifier, RateLimitPresets.WRITE);

    if (!rateLimitResult.success) {
      await createAuditLog({
        action: AuditAction.RATE_LIMIT_EXCEEDED,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        severity: AuditSeverity.MEDIUM,
        success: false,
      });

      return createSecureResponse(
        JSON.stringify({ error: rateLimitResult.message }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();

    // Demonstrate input sanitization
    const sanitizedData = {
      name: sanitizeString(body.name || ''),
      email: sanitizeEmail(body.email || ''),
      message: sanitizeString(body.message || ''),
    };

    // Log the test operation
    await createAuditLog({
      action: AuditAction.SYSTEM_CONFIG_CHANGED,
      resourceType: 'SECURITY_TEST_POST',
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      severity: AuditSeverity.LOW,
      details: sanitizedData,
    });

    return createSecureResponse(
      JSON.stringify({
        success: true,
        received: body,
        sanitized: sanitizedData,
        message: 'Data received and sanitized successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return createSecureResponse(
      JSON.stringify({ error: 'Invalid request' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

