# Phase 4: Role-Based Access & Security - Testing Guide

## Overview

This document provides comprehensive testing procedures for Phase 4 security implementations.

## Test Endpoints

### 1. Security Features Test

```bash
GET http://localhost:3000/api/test/security
```

**Tests:**

- Rate limiting functionality
- Input sanitization
- Security headers application
- Audit logging

**Expected Response:**

```json
{
  "success": true,
  "security": {
    "rateLimit": {
      "enabled": true,
      "remaining": 99,
      "resetAt": "2025-10-07T12:00:00.000Z"
    },
    "sanitization": {
      "enabled": true,
      "examples": {
        "original": {
          "maliciousHtml": "<script>alert(\"XSS\")</script>Hello",
          "email": "TEST@Example.COM  ",
          "phone": "0821234567"
        },
        "sanitized": {
          "html": "Hello",
          "email": "test@example.com",
          "phone": "+27821234567"
        }
      }
    },
    "headers": {
      "enabled": true,
      "applied": [
        "Content-Security-Policy",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "Referrer-Policy"
      ]
    },
    "auditLogging": {
      "enabled": true
    }
  }
}
```

### 2. Role-Based Access Control Test

```bash
GET http://localhost:3000/api/test/role-access
```

**Tests:**

- Authentication detection (Staff JWT vs Clerk)
- Role identification
- Permission level mapping
- Access level determination

**Expected Responses:**

**For Staff Users (JWT):**

```json
{
  "authenticated": true,
  "authMethod": "STAFF_JWT",
  "user": {
    "id": "user_id",
    "email": "admin@lalisure.com",
    "role": "ADMIN",
    "name": "Admin User"
  },
  "sessionExpires": "2025-10-08T12:00:00.000Z",
  "accessLevel": {
    "role": "Administrator",
    "permissions": [
      "Full system access",
      "User management",
      "System configuration"
    ],
    "canAccess": ["/admin/*", "/api/admin/*"]
  }
}
```

**For Customer Users (Clerk):**

```json
{
  "authenticated": true,
  "authMethod": "CLERK",
  "user": {
    "id": "user_id",
    "email": "customer@example.com",
    "role": "CUSTOMER",
    "name": "John Doe"
  },
  "accessLevel": {
    "role": "Customer",
    "permissions": ["View own policies", "Submit claims", "Make payments"],
    "canAccess": ["/customer/*", "/api/customer/*"]
  }
}
```

## Manual Testing Procedures

### Test 1: Authentication System Verification

**Objective:** Verify both authentication systems work correctly

**Steps:**

1. **Test Staff Authentication:**

   - Navigate to `/staff/login`
   - Login with staff credentials
   - Access `/admin/dashboard` → Should succeed for ADMIN role
   - Access `/agent/dashboard` → Should redirect for ADMIN role
   - Call `GET /api/test/role-access` → Should return STAFF_JWT auth method

2. **Test Customer Authentication:**
   - Navigate to `/sign-in`
   - Login with Clerk credentials
   - Access `/customer/dashboard` → Should succeed
   - Access `/admin/dashboard` → Should redirect to staff login
   - Call `GET /api/test/role-access` → Should return CLERK auth method

### Test 2: Rate Limiting

**Objective:** Verify rate limiting prevents abuse

**Steps:**

1. Open terminal and run:

   ```bash
   # Run 101 requests quickly
   for i in {1..101}; do
     curl http://localhost:3000/api/test/security
   done
   ```

2. **Expected:** Requests 1-100 succeed, request 101 returns 429 (Too Many Requests)

3. Check response headers:
   - `X-RateLimit-Remaining`: Should decrease with each request
   - `X-RateLimit-Reset`: Timestamp when limit resets

### Test 3: Input Sanitization

**Objective:** Verify malicious input is sanitized

**Test Cases:**

```bash
# Test XSS prevention
curl -X POST http://localhost:3000/api/test/security \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(\"XSS\")</script>", "email": "TEST@EXAMPLE.COM"}'
```

**Expected Response:**

- `name` should be sanitized (script tags removed)
- `email` should be lowercase and trimmed

### Test 4: Security Headers

**Objective:** Verify security headers are applied

**Steps:**

1. Use browser DevTools or curl with verbose mode:

   ```bash
   curl -I http://localhost:3000/api/test/security
   ```

2. **Verify these headers exist:**
   - `Content-Security-Policy`
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Strict-Transport-Security` (in production only)

### Test 5: Audit Logging

**Objective:** Verify sensitive operations are logged

**Steps:**

1. Submit a claim as a customer
2. Update claim status as an agent
3. Check database for audit log entries:
   ```javascript
   // In MongoDB Compass or database client
   db.audit_logs.find().sort({ timestamp: -1 }).limit(10);
   ```

**Expected Entries:**

- CLAIM_SUBMITTED entry for customer submission
- CLAIM_UPDATED entry for agent status change
- All entries should include:
  - `action`: The action performed
  - `userId`: User who performed the action
  - `userRole`: User's role
  - `resourceId`: ID of affected resource
  - `timestamp`: When action occurred

### Test 6: Role-Based Access Control

**Objective:** Verify proper role enforcement

**Test Matrix:**

| Route                    | CUSTOMER | AGENT | UNDERWRITER | ADMIN |
| ------------------------ | -------- | ----- | ----------- | ----- |
| `/customer/dashboard`    | ✅       | ❌    | ❌          | ❌    |
| `/customer/policies/new` | ✅       | ❌    | ❌          | ❌    |
| `/agent/dashboard`       | ❌       | ✅    | ❌          | ❌    |
| `/agent/customers`       | ❌       | ✅    | ❌          | ❌    |
| `/underwriter/dashboard` | ❌       | ❌    | ✅          | ❌    |
| `/underwriter/policies`  | ❌       | ❌    | ✅          | ❌    |
| `/admin/dashboard`       | ❌       | ❌    | ❌          | ✅    |
| `/admin/users`           | ❌       | ❌    | ❌          | ✅    |

**For each ✅:** User should access the page successfully
**For each ❌:** User should be redirected to appropriate login/dashboard

### Test 7: tRPC Procedure Authorization

**Objective:** Verify backend procedures enforce role requirements

**Test Procedures:**

1. **Protected Procedure (any authenticated user):**

   ```typescript
   // Should succeed for all authenticated users
   trpc.user.getProfile.query();
   ```

2. **Agent Procedure:**

   ```typescript
   // Should succeed for AGENT, UNDERWRITER, ADMIN (role hierarchy)
   // Should fail for CUSTOMER
   trpc.claim.update.mutate({ ... })
   ```

3. **Admin Procedure:**
   ```typescript
   // Should succeed for ADMIN only
   // Should fail for all other roles
   trpc.user.updateRole.mutate({ ... })
   ```

## Automated Testing

### Run Database Migration

```bash
# Push schema changes (includes AuditLog model)
npx prisma db push

# Verify schema
npx prisma studio
```

### Verify Security Utilities

```bash
# All security utilities should be importable without errors
node -e "require('./src/lib/utils/rate-limit.ts'); console.log('✓ Rate limit OK')"
node -e "require('./src/lib/utils/sanitize.ts'); console.log('✓ Sanitize OK')"
node -e "require('./src/lib/utils/security-headers.ts'); console.log('✓ Headers OK')"
node -e "require('./src/lib/services/audit-log.ts'); console.log('✓ Audit log OK')"
```

## Phase 4 Completion Checklist

- [x] Authentication system unified and documented
- [x] RoleGuard properly applied (customers only)
- [x] Rate limiting implemented with presets
- [x] Input sanitization utilities created
- [x] Security headers configured and applied via middleware
- [x] Audit logging system created and integrated
- [x] AuditLog database model added to schema
- [x] Test endpoints created for verification
- [x] Sensitive operations (claims, policies) log to audit

## Known Limitations

1. **Rate Limiting:** In-memory store resets on server restart. Consider Redis for production.
2. **Audit Log Cleanup:** Manual cleanup needed for old entries. Consider scheduled job.
3. **Security Headers:** Some CSP rules may need adjustment based on third-party integrations.

## Next Steps (Phase 5)

- Performance optimization
- Production deployment preparation
- End-to-end testing suite
- Monitoring and analytics setup
