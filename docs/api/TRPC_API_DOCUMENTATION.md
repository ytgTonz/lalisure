# tRPC API Documentation - Lalisure Insurance Platform

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [User Router](#user-router)
   - [Policy Router](#policy-router)
   - [Claim Router](#claim-router)
   - [Payment Router](#payment-router)
   - [Notification Router](#notification-router)
   - [Email Router](#email-router)
   - [Email Template Router](#email-template-router)
   - [Email Analytics Router](#email-analytics-router)
   - [Invitation Router](#invitation-router)
   - [Analytics Router](#analytics-router)
   - [Settings Router](#settings-router)
   - [Security Router](#security-router)
   - [Agent Settings Router](#agent-settings-router)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)

---

## Introduction

The Lalisure Insurance Platform uses [tRPC](https://trpc.io/) for type-safe API communication between the client and server. All endpoints are fully typed and validated using [Zod](https://zod.dev/) schemas.

**Base URL**: `/api/trpc`

**Protocol**: HTTP/HTTPS  
**Format**: JSON  
**Type Safety**: Full TypeScript type inference

---

## Authentication

The platform uses a **dual authentication system**:

1. **Clerk Authentication** (for Customers)

   - OAuth-based authentication
   - Session management via Clerk
   - Used in `protectedProcedure` for customer endpoints

2. **JWT Authentication** (for Staff, Agents, Admins, Underwriters)
   - Token-based authentication
   - Custom JWT implementation
   - Used in `adminProcedure`, `agentProcedure`, and other staff procedures

### Procedure Types

| Procedure              | Required Auth          | Available To            |
| ---------------------- | ---------------------- | ----------------------- |
| `publicProcedure`      | None                   | Everyone                |
| `protectedProcedure`   | Clerk/JWT              | Authenticated users     |
| `adminProcedure`       | JWT (Admin role)       | Admins only             |
| `agentProcedure`       | JWT (Agent role)       | Agents and Admins       |
| `underwriterProcedure` | JWT (Underwriter role) | Underwriters and Admins |
| `staffProcedure`       | JWT (Staff role)       | Staff and Admins        |

---

## API Endpoints

### User Router

**Namespace**: `user`

#### `user.getProfile`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get the current user's profile
- **Input**: None
- **Output**: User object with profile details

#### `user.getCurrentUser`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get current authenticated user
- **Input**: None
- **Output**: User object

#### `user.createProfile`

- **Type**: Mutation
- **Auth**: Public
- **Description**: Create a new user profile (used during registration)
- **Input**:
  ```typescript
  {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }
  ```
- **Output**: Created user object

#### `user.updateProfile`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Update current user's profile
- **Input**:
  ```typescript
  {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: Date;
    idType?: 'ID' | 'PASSPORT';
    idNumber?: string;
    employmentStatus?: 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'RETIRED' | 'PENSIONER';
    monthlyIncome?: number;
    streetAddress?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  }
  ```
- **Output**: Updated user object

#### `user.completeProfile`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Complete user profile with required KYC information
- **Input**: Extended profile data with KYC fields
- **Output**: Updated user with `profileComplete: true`

#### `user.getAllUsers`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get all users with filtering and pagination
- **Input**:
  ```typescript
  {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    limit?: number; // default 50
    cursor?: string;
  }
  ```
- **Output**: Paginated list of users

#### `user.getUserById`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get a specific user by ID
- **Input**: `{ id: string }`
- **Output**: User object

#### `user.updateUserRole`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Update a user's role
- **Input**: `{ userId: string; role: UserRole }`
- **Output**: Updated user

#### `user.updateUserStatus`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Update a user's status (ACTIVE, SUSPENDED, etc.)
- **Input**: `{ userId: string; status: UserStatus }`
- **Output**: Updated user

---

### Policy Router

**Namespace**: `policy`

#### `policy.getAll`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get all policies for the current user with filtering
- **Input**:
  ```typescript
  {
    filters?: {
      status?: PolicyStatus;
      type?: string;
      startDate?: Date;
      endDate?: Date;
    };
    limit?: number; // 1-100, default 10
    cursor?: string;
  }
  ```
- **Output**: Paginated list of policies

#### `policy.getById`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get a specific policy by ID
- **Input**: `{ id: string }`
- **Output**: Policy object with full details

#### `policy.create`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Create a new policy
- **Input**:
  ```typescript
  {
    type: string; // 'HOME', 'CONTENTS', etc.
    propertyAddress: string;
    propertyType: string;
    buildingValue?: number;
    contentsValue?: number;
    coverageAmount: number;
    deductible: number;
    startDate: Date;
    endDate?: Date;
    additionalCoverage?: string[];
    securityFeatures?: string[];
    // ... additional fields
  }
  ```
- **Output**: Created policy object

#### `policy.update`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Update an existing policy
- **Input**: Policy ID + fields to update
- **Output**: Updated policy

#### `policy.cancel`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Cancel a policy
- **Input**: `{ policyId: string; reason: string }`
- **Output**: Cancelled policy with status updated

#### `policy.renew`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Renew an expiring policy
- **Input**: `{ policyId: string }`
- **Output**: Renewed policy

#### `policy.getQuote`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get a premium quote for policy parameters
- **Input**:
  ```typescript
  {
    coverageAmount: number;
    deductible: number;
    propertyType: string;
    province: string;
    securityFeatures?: string[];
    // ... risk assessment fields
  }
  ```
- **Output**:
  ```typescript
  {
    premium: number; // Monthly premium in ZAR
    annualPremium: number;
    breakdown: {
      basePremium: number;
      riskFactors: {
        factor: string;
        adjustment: number;
      }
      [];
      discounts: {
        reason: string;
        amount: number;
      }
      [];
    }
  }
  ```

#### `policy.getSimpleQuote`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get simplified quote without detailed breakdown
- **Input**: Basic coverage parameters
- **Output**: `{ premium: number }`

#### `policy.saveDraft`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Save a policy application as draft
- **Input**: Partial policy data
- **Output**: Draft policy ID

#### `policy.getDrafts`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get all draft policies for current user
- **Input**: None
- **Output**: List of draft policies

---

### Claim Router

**Namespace**: `claim`

#### `claim.getAll`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get all claims for the current user
- **Input**:
  ```typescript
  {
    status?: ClaimStatus;
    limit?: number;
    cursor?: string;
  }
  ```
- **Output**: Paginated list of claims

#### `claim.getById`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get a specific claim by ID
- **Input**: `{ id: string }`
- **Output**: Claim object with full details

#### `claim.create`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Submit a new insurance claim
- **Input**:
  ```typescript
  {
    policyId: string;
    type: string; // 'FIRE', 'THEFT', 'WATER_DAMAGE', etc.
    description: string;
    dateOfLoss: Date;
    amount: number; // Claimed amount in ZAR
    location?: {
      address?: string;
      what3words?: string;
      coordinates?: { lat: number; lng: number };
    };
    witnesses?: Array<{
      name: string;
      phone: string;
      email?: string;
    }>;
    policeReportNumber?: string;
    documents?: string[]; // File URLs from UploadThing
  }
  ```
- **Output**: Created claim object

#### `claim.update`

- **Type**: Mutation
- **Auth**: Protected (Underwriter/Admin can update status)
- **Description**: Update claim details
- **Input**: Claim ID + fields to update
- **Output**: Updated claim

#### `claim.updateStatus`

- **Type**: Mutation
- **Auth**: Underwriter/Admin
- **Description**: Update claim status
- **Input**:
  ```typescript
  {
    claimId: string;
    status: ClaimStatus;
    notes?: string;
    assessedAmount?: number; // For approved claims
  }
  ```
- **Output**: Updated claim with audit log entry

#### `claim.addNote`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Add a note to a claim
- **Input**: `{ claimId: string; note: string }`
- **Output**: Updated claim

#### `claim.uploadDocuments`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Upload supporting documents to a claim
- **Input**: `{ claimId: string; documentUrls: string[] }`
- **Output**: Updated claim

---

### Payment Router

**Namespace**: `payment`

#### `payment.createPaymentIntent`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Create a Paystack payment intent for a policy premium
- **Input**:
  ```typescript
  {
    policyId?: string;
    amount: number; // Amount in ZAR
    type: 'PREMIUM' | 'CLAIM' | 'OTHER';
    description?: string;
  }
  ```
- **Output**:
  ```typescript
  {
    authorization_url: string; // Paystack checkout URL
    reference: string; // Payment reference
    access_code: string;
  }
  ```

#### `payment.verifyPayment`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Verify a Paystack payment after redirect
- **Input**: `{ reference: string }`
- **Output**:
  ```typescript
  {
    success: boolean;
    transaction: {
      reference: string;
      amount: number;
      status: string;
      channel: string;
      paid_at: string;
    }
  }
  ```

#### `payment.getPaymentHistory`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get payment history for current user
- **Input**:
  ```typescript
  {
    status?: PaymentStatus;
    limit?: number;
    cursor?: string;
  }
  ```
- **Output**: Paginated payment history

#### `payment.getPayment`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get details of a specific payment
- **Input**: `{ id: string }`
- **Output**: Payment object

#### `payment.getUpcomingPayments`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get upcoming payments (renewals, installments)
- **Input**: None
- **Output**: List of upcoming payments

#### `payment.getPaymentStats`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get payment statistics for current user
- **Input**: None
- **Output**:
  ```typescript
  {
    totalPaid: number;
    pendingPayments: number;
    thisYearPayments: number;
  }
  ```

#### `payment.getCustomerTransactions`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get Paystack customer details and transactions
- **Input**: None
- **Output**: Paystack customer object

---

### Notification Router

**Namespace**: `notification`

#### `notification.getAll`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get all notifications for current user
- **Input**:
  ```typescript
  {
    type?: NotificationType;
    isRead?: boolean;
    limit?: number;
    cursor?: string;
  }
  ```
- **Output**: Paginated notifications

#### `notification.markAsRead`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Mark notification(s) as read
- **Input**: `{ notificationId: string } | { notificationIds: string[] }`
- **Output**: Success status

#### `notification.markAllAsRead`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Mark all notifications as read for current user
- **Input**: None
- **Output**: Number of notifications updated

#### `notification.delete`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Delete a notification
- **Input**: `{ notificationId: string }`
- **Output**: Success status

#### `notification.getUnreadCount`

- **Type**: Query
- **Auth**: Protected
- **Description**: Get count of unread notifications
- **Input**: None
- **Output**: `{ count: number }`

---

### Email Router

**Namespace**: `email`

#### `email.getAnalytics`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get email analytics and delivery statistics
- **Input**:
  ```typescript
  {
    startDate?: Date;
    endDate?: Date;
    type?: EmailType;
  }
  ```
- **Output**: Email analytics data

#### `email.getTemplates`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get all active email templates
- **Input**: None
- **Output**: List of email templates

#### `email.createTemplate`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Create a new email template
- **Input**:
  ```typescript
  {
    name: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    description?: string;
    variables?: string[];
  }
  ```
- **Output**: Created template

#### `email.updateTemplate`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Update an email template
- **Input**: Template ID + fields to update
- **Output**: Updated template

#### `email.deleteTemplate`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Soft delete an email template
- **Input**: `{ templateId: string }`
- **Output**: Success status

---

### Email Template Router

**Namespace**: `emailTemplate`

#### `emailTemplate.getAll`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get all email templates with filters
- **Input**:
  ```typescript
  {
    isActive?: boolean;
    search?: string;
  }
  ```
- **Output**: List of email templates

#### `emailTemplate.getById`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get a specific template by ID
- **Input**: `{ id: string }`
- **Output**: Email template object

#### `emailTemplate.create`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Create email template
- **Input**: Template data
- **Output**: Created template

#### `emailTemplate.update`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Update email template
- **Input**: Template ID + updates
- **Output**: Updated template

#### `emailTemplate.delete`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Delete email template
- **Input**: `{ id: string }`
- **Output**: Success status

#### `emailTemplate.sendTestEmail`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Send test email using template
- **Input**:
  ```typescript
  {
    templateId: string;
    to: string;
    variables?: Record<string, string>;
  }
  ```
- **Output**: Send status

---

### Email Analytics Router

**Namespace**: `emailAnalytics`

#### `emailAnalytics.getOverview`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get email analytics overview
- **Input**:
  ```typescript
  {
    startDate?: Date;
    endDate?: Date;
  }
  ```
- **Output**:
  ```typescript
  {
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    failed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  }
  ```

#### `emailAnalytics.getByType`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get analytics breakdown by email type
- **Input**: Date range
- **Output**: Analytics grouped by email type

#### `emailAnalytics.getByTemplate`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get analytics for specific template
- **Input**: `{ templateId: string; startDate?: Date; endDate?: Date }`
- **Output**: Template-specific analytics

---

### Invitation Router

**Namespace**: `invitation`

#### `invitation.create`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Create an invitation for a new staff member
- **Input**:
  ```typescript
  {
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    expiresInDays?: number; // Default 7
  }
  ```
- **Output**: Created invitation with token

#### `invitation.getAll`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get all invitations
- **Input**:
  ```typescript
  {
    status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
    role?: UserRole;
  }
  ```
- **Output**: List of invitations

#### `invitation.getByToken`

- **Type**: Query
- **Auth**: Public
- **Description**: Get invitation details by token
- **Input**: `{ token: string }`
- **Output**: Invitation object

#### `invitation.accept`

- **Type**: Mutation
- **Auth**: Public
- **Description**: Accept an invitation and create account
- **Input**:
  ```typescript
  {
    token: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }
  ```
- **Output**: Created user and JWT token

#### `invitation.resend`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Resend an invitation email
- **Input**: `{ invitationId: string }`
- **Output**: Success status

#### `invitation.revoke`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Revoke/cancel an invitation
- **Input**: `{ invitationId: string }`
- **Output**: Success status

---

### Analytics Router

**Namespace**: `analytics`

#### `analytics.getOverview`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get dashboard overview metrics
- **Input**: None
- **Output**:
  ```typescript
  {
    totalRevenue: number;
    totalPolicies: number;
    activePolicies: number;
    totalClaims: number;
    totalUsers: number;
    newUsersThisMonth: number;
    pendingClaims: number;
    revenueGrowth: number; // percentage
    policyGrowth: number;
    userGrowth: number;
  }
  ```

#### `analytics.getRevenue`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get revenue analytics by time range
- **Input**:
  ```typescript
  {
    timeRange: "7d" | "30d" | "90d" | "1y"; // default '30d'
  }
  ```
- **Output**:
  ```typescript
  {
    totalRevenue: number;
    revenueByMethod: Array<{ method: string; amount: number; count: number }>;
    dailyRevenue: Array<{ date: string; revenue: number }>;
  }
  ```

#### `analytics.getPolicyMetrics`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get policy analytics
- **Input**: `{ timeRange: '7d' | '30d' | '90d' | '1y' }`
- **Output**:
  ```typescript
  {
    totalPolicies: number;
    activePolicies: number;
    pendingPolicies: number;
    expiredPolicies: number;
    newPolicies: number;
    totalPremium: number;
    policiesByType: Array<{ type: string; count: number }>;
    avgPremiumByType: Array<{ type: string; avgPremium: number }>;
  }
  ```

#### `analytics.getClaimsMetrics`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get claims analytics
- **Input**: `{ timeRange: '7d' | '30d' | '90d' | '1y' }`
- **Output**:
  ```typescript
  {
    totalClaims: number;
    submittedClaims: number;
    reviewingClaims: number;
    approvedClaims: number;
    settledClaims: number;
    rejectedClaims: number;
    newClaims: number;
    totalClaimValue: number;
    claimsByType: Array<{ type: string; count: number; totalValue: number }>;
    avgProcessingTime: number; // days
  }
  ```

#### `analytics.getUserMetrics`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get user analytics
- **Input**: `{ timeRange: '7d' | '30d' | '90d' | '1y' }`
- **Output**:
  ```typescript
  {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userBreakdown: {
      customers: number;
      agents: number;
      underwriters: number;
      admins: number;
    }
    userRegistrationTrend: Array<{ date: string; count: number }>;
    activeUserCount: number;
  }
  ```

#### `analytics.exportData`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Export analytics data
- **Input**:
  ```typescript
  {
    type: "revenue" | "policies" | "claims" | "users";
    timeRange: "7d" | "30d" | "90d" | "1y";
    format: "json" | "csv";
  }
  ```
- **Output**: Export status

---

### Settings Router

**Namespace**: `settings`

#### `settings.get`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get current system settings
- **Input**: None
- **Output**: System settings object

#### `settings.update`

- **Type**: Mutation
- **Auth**: Admin
- **Description**: Update system settings
- **Input**:
  ```typescript
  {
    platformName?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    whatsappNotifications?: boolean;
    twoFactorRequired?: boolean;
    sessionTimeout?: number; // minutes
    passwordComplexity?: boolean;
    ipWhitelist?: boolean;
    auditLogging?: boolean;
    suspiciousActivityAlerts?: boolean;
    dataEncryption?: boolean;
    apiRateLimit?: number;
    maintenanceMode?: boolean;
    autoBackup?: boolean;
    backupFrequency?: 'daily' | 'weekly' | 'monthly';
    paymentGateway?: 'paystack';
    currency?: 'ZAR';
    taxRate?: number;
    smsProvider?: 'twilio';
  }
  ```
- **Output**: Updated settings

---

### Security Router

**Namespace**: `security`

#### `security.getSecurityEvents`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get security events and audit logs
- **Input**:
  ```typescript
  {
    type?: SecurityEventType;
    severity?: SecurityEventSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    cursor?: string;
  }
  ```
- **Output**: Paginated security events

#### `security.getAuditLogs`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get audit logs for sensitive operations
- **Input**:
  ```typescript
  {
    action?: AuditAction;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
  ```
- **Output**: Paginated audit logs

#### `security.reportSuspiciousActivity`

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Report suspicious activity
- **Input**:
  ```typescript
  {
    type: string;
    description: string;
    details?: Record<string, any>;
  }
  ```
- **Output**: Created security event

---

### Agent Settings Router

**Namespace**: `agentSettings`

#### `agentSettings.getSettings`

- **Type**: Query
- **Auth**: Protected (Agent/Admin)
- **Description**: Get current user's agent settings
- **Input**: None
- **Output**:
  ```typescript
  {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    agentCode: string;
    licenseNumber: string;
    commissionRate: number;
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
    };
    preferences: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      weeklyReports: boolean;
      autoFollowUp: boolean;
      timezone: string;
      language: string;
    };
    workingHours: {
      [day: string]: { enabled: boolean; start: string; end: string };
    };
  }
  ```

#### `agentSettings.updateSettings`

- **Type**: Mutation
- **Auth**: Protected (Agent/Admin)
- **Description**: Update agent settings
- **Input**: Agent settings fields to update
- **Output**: Success message and updated user

#### `agentSettings.checkAgentCode`

- **Type**: Query
- **Auth**: Protected
- **Description**: Check if agent code is available
- **Input**: `{ agentCode: string }`
- **Output**: `{ available: boolean; message: string }`

#### `agentSettings.getAllAgents`

- **Type**: Query
- **Auth**: Admin
- **Description**: Get all agents in the system
- **Input**: None
- **Output**: List of agents with basic details

---

## Error Handling

tRPC errors follow this structure:

```typescript
{
  error: {
    message: string;
    code:
      | 'PARSE_ERROR'
      | 'BAD_REQUEST'
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'METHOD_NOT_SUPPORTED'
      | 'TIMEOUT'
      | 'CONFLICT'
      | 'PRECONDITION_FAILED'
      | 'PAYLOAD_TOO_LARGE'
      | 'INTERNAL_SERVER_ERROR';
    data?: {
      zodError?: ZodError; // For validation errors
      // ... additional error context
    };
  }
}
```

### Common Error Codes

| Code                    | HTTP Status | Description                         |
| ----------------------- | ----------- | ----------------------------------- |
| `UNAUTHORIZED`          | 401         | Missing or invalid authentication   |
| `FORBIDDEN`             | 403         | Insufficient permissions            |
| `NOT_FOUND`             | 404         | Resource not found                  |
| `BAD_REQUEST`           | 400         | Invalid input or validation error   |
| `CONFLICT`              | 409         | Resource conflict (e.g., duplicate) |
| `INTERNAL_SERVER_ERROR` | 500         | Server error                        |

---

## Rate Limiting

API endpoints are protected by rate limiting with the following presets:

| Preset      | Requests | Window | Applied To                 |
| ----------- | -------- | ------ | -------------------------- |
| `AUTH`      | 5        | 15 min | Authentication endpoints   |
| `API`       | 100      | 1 min  | General API endpoints      |
| `READ`      | 200      | 1 min  | Read-only queries          |
| `WRITE`     | 50       | 1 min  | Mutations                  |
| `SENSITIVE` | 10       | 5 min  | Admin/sensitive operations |

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

When rate limited, the API returns:

```typescript
{
  error: {
    message: "Too many requests",
    code: "TOO_MANY_REQUESTS",
    data: {
      retryAfter: number; // seconds
    }
  }
}
```

---

## Data Types

### South African Specific Types

```typescript
// Phone numbers
type SAPhoneNumber = string; // Format: +27XXXXXXXXX

// ID Numbers
type SAIDNumber = string; // Format: YYMMDDGGGGSAZ (13 digits)

// Currency
type ZARAmount = number; // Always in Rand (ZAR)

// Provinces
type SAProvince =
  | "Eastern Cape"
  | "Free State"
  | "Gauteng"
  | "KwaZulu-Natal"
  | "Limpopo"
  | "Mpumalanga"
  | "Northern Cape"
  | "North West"
  | "Western Cape";
```

---

## Integration Examples

### Client-side (React)

```typescript
import { api } from "@/trpc/react";

function MyComponent() {
  // Query
  const { data: policies, isLoading } = api.policy.getAll.useQuery({
    filters: { status: "ACTIVE" },
    limit: 10,
  });

  // Mutation
  const createClaim = api.claim.create.useMutation({
    onSuccess: () => {
      // Handle success
    },
  });

  const handleSubmit = (data) => {
    createClaim.mutate({
      policyId: "policy_123",
      type: "THEFT",
      description: "Items stolen from property",
      amount: 5000,
      dateOfLoss: new Date(),
    });
  };
}
```

### Server-side (API Route)

```typescript
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export async function POST(req: Request) {
  const ctx = await createTRPCContext({ req });
  const caller = appRouter.createCaller(ctx);

  const policies = await caller.policy.getAll({
    filters: { status: "ACTIVE" },
    limit: 10,
  });

  return Response.json(policies);
}
```

---

## Webhooks

### Paystack Webhook

**Endpoint**: `/api/webhooks/paystack`  
**Method**: POST  
**Auth**: Paystack signature verification

Supported events:

- `charge.success` - Payment successful
- `transfer.success` - Payout successful
- `transfer.failed` - Payout failed
- `invoice.create` - Invoice created
- `invoice.update` - Invoice updated
- `subscription.create` - Subscription created
- `subscription.disable` - Subscription disabled

---

## Testing Endpoints

For development and testing purposes:

- `/api/test/notifications` - Test notification system
- `/api/test/claims-workflow` - Test claims workflow
- `/api/test/security` - Test security features
- `/api/test/role-access` - Test role-based access
- `/api/test/performance` - Performance testing
- `/api/health/services` - Service health check
- `/api/monitoring/dashboard` - Monitoring dashboard

---

## Support

For API support or questions:

- **Documentation**: `docs/developer/`
- **Email**: support@lalisure.com
- **Developer Portal**: Coming soon

---

**Last Updated**: October 7, 2025  
**API Version**: 1.0  
**Platform Version**: 0.1.0
