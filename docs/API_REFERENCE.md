# API Reference

## 🔗 tRPC Endpoints

This application uses tRPC for type-safe API communication. All endpoints are available through the `api` object in React components.

## 📋 Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Policy Management](#policy-management)
- [Claims Processing](#claims-processing)
- [Payment Processing](#payment-processing)
- [Notifications](#notifications)
- [Error Handling](#error-handling)

## 🔐 Authentication

The platform supports two authentication systems:

### **Customer Authentication**

- **Provider**: Clerk Authentication
- **Roles**: Customer only
- **Features**: Social login, email/password, MFA support
- **Session**: JWT-based with automatic refresh

### **Staff Authentication**

- **Provider**: Custom JWT-based system
- **Roles**: Agent, Admin, Underwriter
- **Features**: Email/password, role-based access
- **Session**: Secure JWT with configurable timeouts

### **Authorization Levels**

- **Public**: No authentication required
- **Protected**: Requires valid user session (customers)
- **Staff**: Requires valid staff session (agents/admins/underwriters)
- **Agent**: Requires AGENT, ADMIN, or UNDERWRITER role
- **Admin**: Requires ADMIN role only

---

## 👥 Staff Authentication API

### `POST /api/staff/login`

Authenticate staff members and establish session.

**Type**: API Route | **Auth**: None (creates session)

```typescript
// Request
{
  email: string; // Staff email address
  password: string; // Staff password
}

// Response
{
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "AGENT" | "ADMIN" | "UNDERWRITER";
  }
}

// Error Responses
{
  error: "Invalid credentials" |
    "Access denied. Staff login only." |
    "Account not configured for password login";
}
```

### `POST /api/staff/register`

Register new staff members with role assignment.

**Type**: API Route | **Auth**: Admin (for role assignment)

```typescript
// Request
{
  firstName: string; // Staff first name
  lastName: string; // Staff last name
  email: string; // Staff email address
  password: string; // Secure password (min 8 chars)
  role: "AGENT" | "ADMIN" | "UNDERWRITER"; // Staff role
}

// Response (Success)
{
  success: boolean;
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: Date;
  }
}

// Error Responses
{
  error: "All fields are required" |
    "Invalid email format" |
    "Password must be at least 8 characters long" |
    "Invalid role selected" |
    "User with this email already exists";
}
```

### Staff Session Management

```typescript
// Session is automatically created on successful login
// JWT token stored in httpOnly cookie
// Session expires after 24 hours (configurable)
// Automatic redirect to role-specific dashboard
```

### Staff Access Methods

Staff can access the staff portal through multiple secure methods:

#### **Method 1: Direct URL**

```
https://lalisure.onrender.com/staff/login
```

#### **Method 2: Keyboard Shortcut**

- Press `Ctrl + Shift + S` (Windows/Linux)
- Press `Cmd + Shift + S` (Mac)
- Works globally when on any page

#### **Method 3: Admin Corner**

- Click in the bottom-right corner of any page 3 times
- A staff access modal appears
- Works on both desktop and mobile

#### **Method 4: Special URLs**

```
https://lalisure.onrender.com/staff-portal    # Redirects to login
https://lalisure.onrender.com/admin-access   # Redirects to login
https://lalisure.onrender.com/team-login     # Redirects to login
```

---

## 🔑 Customer Authentication (Clerk)

## 👤 User Management

### `user.getProfile`

Get current user's profile information.

**Type**: Query | **Auth**: Protected

```typescript
const { data: profile } = api.user.getProfile.useQuery();

// Response
type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
};
```

### `user.updateProfile`

Update current user's profile information.

**Type**: Mutation | **Auth**: Protected

```typescript
const updateProfile = api.user.updateProfile.useMutation();

updateProfile.mutate({
  firstName: "John",
  lastName: "Doe",
  phone: "+27123456789",
});

// Input
type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};
```

### `user.updateNotificationPreferences`

Update user's notification preferences.

**Type**: Mutation | **Auth**: Protected

```typescript
const updatePrefs = api.user.updateNotificationPreferences.useMutation();

updatePrefs.mutate({
  email: {
    enabled: true,
    policyUpdates: true,
    claimUpdates: true,
    paymentReminders: true,
    marketingEmails: false,
  },
  sms: {
    enabled: false,
    urgentClaimUpdates: false,
    paymentReminders: false,
    policyExpirations: false,
  },
});
```

## 🏠 Policy Management

### `policy.getUserPolicies`

Get policies for the current user with optional filtering.

**Type**: Query | **Auth**: Protected

```typescript
const { data: policies } = api.policy.getUserPolicies.useQuery({
  limit: 10,
  offset: 0,
  status: "ACTIVE",
  sortBy: "createdAt",
  sortOrder: "desc",
});

// Input (all optional)
type GetUserPoliciesInput = {
  limit?: number; // Default: 10, Max: 100
  offset?: number; // Default: 0
  status?: PolicyStatus; // Filter by status
  sortBy?: "createdAt" | "updatedAt" | "premium";
  sortOrder?: "asc" | "desc";
};

// Response
type GetUserPoliciesResponse = {
  policies: Policy[];
  total: number;
  hasMore: boolean;
};
```

### `policy.getPolicyById`

Get detailed information for a specific policy.

**Type**: Query | **Auth**: Protected (own policies) | Agent (all policies)

```typescript
const { data: policy } = api.policy.getPolicyById.useQuery({
  policyId: "policy_123",
});

// Response includes full policy details with relationships
type PolicyWithDetails = Policy & {
  claims: Claim[];
  payments: Payment[];
};
```

### `policy.createPolicy`

Create a new home insurance policy.

**Type**: Mutation | **Auth**: Protected

```typescript
const createPolicy = api.policy.createPolicy.useMutation();

createPolicy.mutate({
  propertyInfo: {
    address: "123 Main Street",
    city: "Cape Town",
    state: "Western Cape",
    zipCode: "8001",
    propertyType: "Single Family",
    buildYear: 2015,
    squareFeet: 2400,
    bedrooms: 3,
    bathrooms: 2.5,
    constructionType: "Brick",
    roofType: "Tile",
    foundationType: "Concrete",
    heatingType: "Gas",
    coolingType: "Central Air",
    safetyFeatures: ["Smoke Detectors", "Security System"],
    hasPool: false,
    hasGarage: true,
    garageSpaces: 2,
  },
  coverage: 450000,
  deductible: 2500,
});

// Premium is automatically calculated based on inputs
```

### `policy.updatePolicy`

Update an existing policy (draft policies only for customers).

**Type**: Mutation | **Auth**: Protected (own draft policies) | Agent (all policies)

```typescript
const updatePolicy = api.policy.updatePolicy.useMutation();

updatePolicy.mutate({
  policyId: "policy_123",
  coverage: 500000,
  deductible: 3000,
  propertyInfo: {
    // Updated property information
  },
});
```

### `policy.deletePolicy`

Delete a draft policy.

**Type**: Mutation | **Auth**: Protected (own draft policies) | Admin (all policies)

```typescript
const deletePolicy = api.policy.deletePolicy.useMutation();

deletePolicy.mutate({ policyId: "policy_123" });
```

### `policy.calculateQuote`

Calculate premium quote without creating a policy.

**Type**: Mutation | **Auth**: Protected

```typescript
const calculateQuote = api.policy.calculateQuote.useMutation();

const quote = await calculateQuote.mutateAsync({
  propertyInfo: {
    /* property details */
  },
  coverage: 400000,
  deductible: 2000,
});

// Response
type PremiumCalculation = {
  basePremium: number;
  riskFactors: {
    locationRisk: number;
    propertyRisk: number;
    coverageRisk: number;
  };
  adjustments: {
    safetyDiscount: number;
    bundleDiscount: number;
    loyaltyDiscount: number;
  };
  finalPremium: number;
  breakdown: {
    basePremium: number;
    locationAdjustment: number;
    propertyAdjustment: number;
    coverageAdjustment: number;
    safetyDiscount: number;
    totalPremium: number;
  };
};
```

### `policy.updatePolicyStatus`

Update policy status (agents/admins only).

**Type**: Mutation | **Auth**: Agent

```typescript
const updateStatus = api.policy.updatePolicyStatus.useMutation();

updateStatus.mutate({
  policyId: "policy_123",
  status: "ACTIVE",
  reason: "Policy approved after underwriting review",
});
```

### `policy.getPolicyStats`

Get policy statistics for current user.

**Type**: Query | **Auth**: Protected

```typescript
const { data: stats } = api.policy.getPolicyStats.useQuery();

// Response
type PolicyStats = {
  total: number;
  active: number;
  draft: number;
  expired: number;
  pendingReview: number;
  cancelled: number;
  suspended: number;
};
```

## 🛡️ Claims Processing

### `claim.getUserClaims`

Get claims for the current user with filtering options.

**Type**: Query | **Auth**: Protected

```typescript
const { data: claims } = api.claim.getUserClaims.useQuery({
  limit: 10,
  offset: 0,
  status: "SUBMITTED",
  type: "FIRE_DAMAGE",
  sortBy: "createdAt",
  sortOrder: "desc",
});

// Response includes policy information
type ClaimsResponse = {
  claims: (Claim & { policy: { policyNumber: string; type: string } })[];
  total: number;
};
```

### `claim.getClaimById`

Get detailed claim information including documents.

**Type**: Query | **Auth**: Protected (own claims) | Agent (all claims)

```typescript
const { data: claim } = api.claim.getClaimById.useQuery({
  claimId: "claim_123",
});

// Response includes documents and policy info
type ClaimWithDetails = Claim & {
  policy: { policyNumber: string; type: string };
  documents: Document[];
};
```

### `claim.submitClaim`

Submit a new insurance claim.

**Type**: Mutation | **Auth**: Protected

```typescript
const submitClaim = api.claim.submitClaim.useMutation();

submitClaim.mutate({
  policyId: "policy_123",
  type: "FIRE_DAMAGE",
  description: "Kitchen fire caused by electrical malfunction",
  incidentDate: new Date("2024-01-15T10:30:00Z"),
  location: "123 Main Street, Cape Town",
  what3words: "filled.count.soap",
  amount: 15000,
});

// Claim number is auto-generated based on type
```

### `claim.updateClaimStatus`

Update claim status (agents only).

**Type**: Mutation | **Auth**: Agent

```typescript
const updateStatus = api.claim.updateClaimStatus.useMutation();

updateStatus.mutate({
  claimId: "claim_123",
  status: "UNDER_REVIEW",
  notes: "Claim received, starting investigation process",
});

// Valid status transitions enforced server-side
```

### `claim.addClaimDocument`

Add document to an existing claim.

**Type**: Mutation | **Auth**: Protected (own claims) | Agent (all claims)

```typescript
const addDocument = api.claim.addClaimDocument.useMutation();

addDocument.mutate({
  claimId: "claim_123",
  filename: "damage_photo.jpg",
  url: "https://utfs.io/f/abc123...",
  type: "PHOTO",
  size: 1048576,
  mimeType: "image/jpeg",
});

// File upload handled separately via UploadThing
```

### `claim.getClaimDocuments`

Get all documents for a claim.

**Type**: Query | **Auth**: Protected (own claims) | Agent (all claims)

```typescript
const { data: documents } = api.claim.getClaimDocuments.useQuery({
  claimId: "claim_123",
});

type DocumentResponse = Document[];
```

### `claim.getClaimStats`

Get claim statistics for current user.

**Type**: Query | **Auth**: Protected

```typescript
const { data: stats } = api.claim.getClaimStats.useQuery();

type ClaimStats = {
  total: number;
  submitted: number;
  underReview: number;
  investigating: number;
  approved: number;
  rejected: number;
  settled: number;
};
```

### `claim.getAllClaims`

Get all claims in system (agents only).

**Type**: Query | **Auth**: Agent

```typescript
const { data: allClaims } = api.claim.getAllClaims.useQuery({
  limit: 20,
  offset: 0,
  status: "SUBMITTED",
});

// Includes user information for agents
```

## 💳 Payment Processing

### `payment.createPaymentIntent`

Initialize Paystack payment transaction.

**Type**: Mutation | **Auth**: Protected

```typescript
const createPayment = api.payment.createPaymentIntent.useMutation();

const payment = await createPayment.mutateAsync({
  policyId: "policy_123",
  amount: 1500,
  description: "Premium payment for policy POL-HOME-001",
});

// Response
type PaymentIntent = {
  authorization_url: string; // Redirect user here
  reference: string; // Transaction reference
};
```

### `payment.verifyPayment`

Verify payment completion with Paystack.

**Type**: Mutation | **Auth**: Protected

```typescript
const verifyPayment = api.payment.verifyPayment.useMutation();

const result = await verifyPayment.mutateAsync({
  reference: "ref_123456789",
});

type VerifyPaymentResponse = {
  success: boolean;
  transaction: PaystackTransaction;
};
```

### `payment.getPaymentHistory`

Get payment history with filtering.

**Type**: Query | **Auth**: Protected

```typescript
const { data: history } = api.payment.getPaymentHistory.useQuery({
  limit: 10,
  offset: 0,
  policyId: "policy_123", // optional filter
});

type PaymentHistoryResponse = {
  payments: (Payment & { policy: { policyNumber: string } })[];
  total: number;
  hasMore: boolean;
};
```

### `payment.getUpcomingPayments`

Get payments due in next 30 days.

**Type**: Query | **Auth**: Protected

```typescript
const { data: upcoming } = api.payment.getUpcomingPayments.useQuery();

type UpcomingPayment = Payment &
  {
    policy: { policyNumber: string; type: string };
  }[];
```

### `payment.getPaymentStats`

Get payment statistics for dashboard.

**Type**: Query | **Auth**: Protected

```typescript
const { data: stats } = api.payment.getPaymentStats.useQuery();

type PaymentStats = {
  totalPaid: number; // All time
  pendingPayments: number; // Count
  thisYearPayments: number; // Current year total
};
```

### `payment.createSubscription`

Set up recurring premium payments.

**Type**: Mutation | **Auth**: Protected

```typescript
const createSub = api.payment.createSubscription.useMutation();

const subscription = await createSub.mutateAsync({
  policyId: "policy_123",
  interval: "monthly", // or "quarterly", "annually"
});

type SubscriptionResponse = {
  planCode: string;
  subscriptionCode: string;
  authorization_url: string; // For setup
};
```

### `payment.getBanks`

Get list of South African banks for transfers.

**Type**: Query | **Auth**: Protected

```typescript
const { data: banks } = api.payment.getBanks.useQuery();

type Bank = {
  name: string;
  code: string;
  longcode: string;
  active: boolean;
  country: string;
  currency: string;
}[];
```

### `payment.verifyBankAccount`

Verify bank account details.

**Type**: Mutation | **Auth**: Protected

```typescript
const verifyAccount = api.payment.verifyBankAccount.useMutation();

const result = await verifyAccount.mutateAsync({
  account_number: "1234567890",
  bank_code: "051",
});

type BankVerificationResponse = {
  account_number: string;
  account_name: string;
  bank_id: number;
};
```

## 🔔 Notifications

### `notification.getNotifications`

Get user's notifications with pagination.

**Type**: Query | **Auth**: Protected

```typescript
const { data: notifications } = api.notification.getNotifications.useQuery({
  limit: 10,
  offset: 0,
  unreadOnly: false,
});

type NotificationsResponse = {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
};
```

### `notification.getUnreadCount`

Get count of unread notifications.

**Type**: Query | **Auth**: Protected

```typescript
const { data: count } = api.notification.getUnreadCount.useQuery();
// Returns: number
```

### `notification.markAsRead`

Mark notification(s) as read.

**Type**: Mutation | **Auth**: Protected

```typescript
const markRead = api.notification.markAsRead.useMutation();

// Mark single notification
markRead.mutate({ notificationId: "notif_123" });

// Mark all as read
markRead.mutate({ markAll: true });
```

### `notification.delete`

Delete notification(s).

**Type**: Mutation | **Auth**: Protected

```typescript
const deleteNotif = api.notification.delete.useMutation();

// Delete single
deleteNotif.mutate({ notificationId: "notif_123" });

// Delete multiple
deleteNotif.mutate({ notificationIds: ["notif_1", "notif_2"] });
```

### `notification.testEmailNotification`

Send test email notification.

**Type**: Mutation | **Auth**: Protected

```typescript
const testEmail = api.notification.testEmailNotification.useMutation();

testEmail.mutate({
  type: "POLICY_CREATED",
  recipientEmail: "user@example.com",
});
```

## ⚠️ Error Handling

### tRPC Error Types

```typescript
import { TRPCError } from "@trpc/server";

// Common error codes
type TRPCErrorCode =
  | "BAD_REQUEST" // Invalid input
  | "UNAUTHORIZED" // Not authenticated
  | "FORBIDDEN" // Not authorized
  | "NOT_FOUND" // Resource not found
  | "INTERNAL_SERVER_ERROR"; // Server error
```

### Client-Side Error Handling

```typescript
function MyComponent() {
  const { data, error, isLoading } = api.policy.getUserPolicies.useQuery();

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    // Error has type inference
    return (
      <ErrorAlert>
        {error.message} (Code: {error.data?.code})
      </ErrorAlert>
    );
  }

  return <PolicyList policies={data.policies} />;
}
```

### Mutation Error Handling

```typescript
function PolicyForm() {
  const createPolicy = api.policy.createPolicy.useMutation({
    onError: (error) => {
      if (error.data?.code === "BAD_REQUEST") {
        toast.error("Please check your input data");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
    onSuccess: (policy) => {
      toast.success(`Policy ${policy.policyNumber} created!`);
      router.push(`/policies/${policy.id}`);
    },
  });

  return (
    <form onSubmit={(data) => createPolicy.mutate(data)}>
      {/* form fields */}
    </form>
  );
}
```

## 🔄 Real-time Updates

### Query Invalidation

```typescript
function PolicyActions({ policyId }) {
  const utils = api.useUtils();

  const updatePolicy = api.policy.updatePolicy.useMutation({
    onSuccess: () => {
      // Invalidate and refetch related queries
      utils.policy.getUserPolicies.invalidate();
      utils.policy.getPolicyById.invalidate({ policyId });
    },
  });

  return <Button onClick={() => updatePolicy.mutate(data)}>Update</Button>;
}
```

### Optimistic Updates

```typescript
const updatePolicy = api.policy.updatePolicy.useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await utils.policy.getPolicyById.cancel({ policyId });

    // Snapshot current data
    const previousData = utils.policy.getPolicyById.getData({ policyId });

    // Optimistically update
    utils.policy.getPolicyById.setData({ policyId }, (old) => ({
      ...old,
      ...newData,
    }));

    return { previousData };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    utils.policy.getPolicyById.setData({ policyId }, context.previousData);
  },
});
```

---

## 📚 Additional Resources

- **Type Definitions**: All types are auto-generated from tRPC and available in your IDE
- **API Testing**: Use the tRPC panel in development for API testing
- **Error Reference**: Check `/src/server/api/trpc.ts` for error handling middleware
