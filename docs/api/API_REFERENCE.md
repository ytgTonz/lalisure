# API Reference

## 🔗 tRPC Endpoints

This application uses tRPC for type-safe API communication. All endpoints are available through the `api` object in React components.

## 📋 Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Agent Settings Management](#agent-settings-management)
- [Policy Management](#policy-management)
- [Claims Processing](#claims-processing)
- [Payment Processing](#payment-processing)
- [Notifications](#notifications)
- [Email Analytics](#email-analytics)
- [Security Monitoring](#security-monitoring)
- [System Settings](#system-settings)
- [South African Data Constants](#south-african-data-constants)
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

// Response - Complete User Profile with all fields
type UserProfile = {
  id: string;
  clerkId: string | null;
  email: string;

  // Basic Information
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;

  // System Fields
  role: UserRole; // CUSTOMER, AGENT, ADMIN, UNDERWRITER
  status: UserStatus; // ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION

  // Extended Profile Information
  dateOfBirth: Date | null;
  gender: Gender | null; // MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
  idNumber: string | null;
  idType: IdType | null; // ID, PASSPORT
  country: string | null;
  workPhone: string | null;

  // Address Information
  streetAddress: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;

  // Employment Details
  employmentStatus: EmploymentStatus | null; // EMPLOYED, SELF_EMPLOYED, UNEMPLOYED, STUDENT, RETIRED, PENSIONER
  employer: string | null;
  jobTitle: string | null;
  workAddress: string | null;

  // Income Details
  monthlyIncome: number | null;
  incomeSource: string | null;

  // Verification Status
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;

  // Payment Integration
  stripeCustomerId: string | null;
  paystackCustomerId: string | null;

  // Agent-specific fields (null for non-agents)
  agentCode: string | null;
  licenseNumber: string | null;
  commissionRate: number | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
};
```

## 👨‍💼 Agent Settings Management

### `agentSettings.getSettings`

Get current agent's settings and preferences.

**Type**: Query | **Auth**: Agent

```typescript
const { data: settings } = api.agentSettings.getSettings.useQuery();

// Response
type AgentSettings = {
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
    monday: { enabled: boolean; start: string; end: string };
    tuesday: { enabled: boolean; start: string; end: string };
    wednesday: { enabled: boolean; start: string; end: string };
    thursday: { enabled: boolean; start: string; end: string };
    friday: { enabled: boolean; start: string; end: string };
    saturday: { enabled: boolean; start: string; end: string };
    sunday: { enabled: boolean; start: string; end: string };
  };
};
```

### `agentSettings.updateSettings`

Update agent's settings and preferences.

**Type**: Mutation | **Auth**: Agent

```typescript
const updateSettings = api.agentSettings.updateSettings.useMutation();

updateSettings.mutate({
  firstName: "John",
  lastName: "Smith",
  phone: "+27123456789",
  agentCode: "AGT001",
  licenseNumber: "LIC123456",
  commissionRate: 15.5,
  address: {
    street: "123 Agent Street",
    city: "Cape Town",
    province: "WC",
    postalCode: "8001",
    country: "South Africa",
  },
  preferences: {
    emailNotifications: true,
    smsNotifications: true,
    weeklyReports: true,
    autoFollowUp: false,
    timezone: "Africa/Johannesburg",
    language: "en",
  },
  workingHours: {
    monday: { enabled: true, start: "08:00", end: "17:00" },
    tuesday: { enabled: true, start: "08:00", end: "17:00" },
    wednesday: { enabled: true, start: "08:00", end: "17:00" },
    thursday: { enabled: true, start: "08:00", end: "17:00" },
    friday: { enabled: true, start: "08:00", end: "17:00" },
    saturday: { enabled: false, start: "09:00", end: "13:00" },
    sunday: { enabled: false, start: "09:00", end: "13:00" },
  },
});

// Input
type AgentSettingsInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  agentCode?: string;
  licenseNumber?: string;
  commissionRate?: number;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    weeklyReports?: boolean;
    autoFollowUp?: boolean;
    timezone?: string;
    language?: string;
  };
  workingHours?: {
    monday?: { enabled?: boolean; start?: string; end?: string };
    tuesday?: { enabled?: boolean; start?: string; end?: string };
    wednesday?: { enabled?: boolean; start?: string; end?: string };
    thursday?: { enabled?: boolean; start?: string; end?: string };
    friday?: { enabled?: boolean; start?: string; end?: string };
    saturday?: { enabled?: boolean; start?: string; end?: string };
    sunday?: { enabled?: boolean; start?: string; end?: string };
  };
};

// Response
type AgentSettingsResponse = AgentSettings; // Updated settings
```

### `agentSettings.checkAgentCode`

Check if an agent code is available.

**Type**: Query | **Auth**: Agent

```typescript
const { data: available } = api.agentSettings.checkAgentCode.useQuery({
  agentCode: "AGT001",
});

// Response
type AgentCodeCheckResponse = {
  available: boolean;
  message: string;
};
```

### `agentSettings.getAllAgents`

Get all agents in the system (admin only).

**Type**: Query | **Auth**: Admin

```typescript
const { data: agents } = api.agentSettings.getAllAgents.useQuery();

// Response
type AllAgentsResponse = Array<{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  agentCode: string;
  licenseNumber: string;
  commissionRate: number;
  createdAt: Date;
}>;
```

### `user.updateProfile`

Update current user's comprehensive profile information including personal details, address, employment, and income information.

**Type**: Mutation | **Auth**: Protected

```typescript
const updateProfile = api.user.updateProfile.useMutation();

updateProfile.mutate({
  // Basic Information
  firstName: "John",
  lastName: "Doe",
  phone: "+27123456789",
  avatar: "https://example.com/avatar.jpg",

  // Extended Profile Information
  dateOfBirth: new Date("1989-01-15"),
  idNumber: "8901155555555",
  idType: "ID", // or "PASSPORT"
  country: "South Africa",
  workPhone: "+27211234567",

  // Address Information
  streetAddress: "123 Main Street",
  city: "Cape Town",
  province: "Western Cape",
  postalCode: "8001",

  // Employment Details
  employmentStatus: "EMPLOYED", // EMPLOYED, SELF_EMPLOYED, UNEMPLOYED, STUDENT, RETIRED, PENSIONER
  employer: "Tech Company",
  jobTitle: "Software Developer",
  workAddress: "456 Business District, Cape Town",

  // Income Details
  monthlyIncome: 25000.00,
  incomeSource: "Salary",
});

// Input (all fields optional)
type UpdateProfileInput = {
  // Basic Information
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;

  // Extended Profile Information
  dateOfBirth?: Date;
  idNumber?: string;
  idType?: "ID" | "PASSPORT";
  country?: string;
  workPhone?: string;

  // Address Information
  streetAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;

  // Employment Details
  employmentStatus?: "EMPLOYED" | "SELF_EMPLOYED" | "UNEMPLOYED" | "STUDENT" | "RETIRED" | "PENSIONER";
  employer?: string;
  jobTitle?: string;
  workAddress?: string;

  // Income Details
  monthlyIncome?: number; // Must be positive
  incomeSource?: string;
};

// Response
type UpdateProfileResponse = User; // Updated user profile with all fields
```

### `user.getDashboardStats`

Get dashboard statistics for the current user including policy and claim counts.

**Type**: Query | **Auth**: Protected

```typescript
const { data: stats } = api.user.getDashboardStats.useQuery();

// Response
type DashboardStats = {
  policiesCount: number;
  claimsCount: number;
  activePoliciesCount: number;
};
```

### `user.createProfile`

Create a new user profile (used during registration).

**Type**: Mutation | **Auth**: Public

```typescript
const createProfile = api.user.createProfile.useMutation();

createProfile.mutate({
  clerkId: "user_123",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
});

// Input
type CreateProfileInput = {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
};
```

### `user.getCurrentUser`

Get the current authenticated user (alias for getProfile).

**Type**: Query | **Auth**: Protected

```typescript
const { data: user } = api.user.getCurrentUser.useQuery();
// Returns same UserProfile type as getProfile
```

---

## 👥 Admin User Management

### `user.getAllUsers`

Get all users with filtering, searching, and pagination (admin only).

**Type**: Query | **Auth**: Admin

```typescript
const { data: users } = api.user.getAllUsers.useQuery({
  role: "CUSTOMER", // Optional filter by role
  status: "ACTIVE", // Optional filter by status
  search: "john", // Optional search in name/email
  limit: 50,
  offset: 0,
});

// Input
type GetAllUsersInput = {
  role?: "CUSTOMER" | "AGENT" | "ADMIN" | "UNDERWRITER";
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  search?: string; // Searches firstName, lastName, email
  limit?: number; // 1-100, default 50
  offset?: number; // Default 0
};

// Response
type GetAllUsersResponse = {
  users: (UserProfile & {
    policiesCount: number;
    claimsCount: number;
  })[];
  total: number;
  hasMore: boolean;
};
```

### `user.updateRole`

Update a user's role (admin only).

**Type**: Mutation | **Auth**: Admin

```typescript
const updateRole = api.user.updateRole.useMutation();

updateRole.mutate({
  userId: "user_123",
  newRole: "AGENT",
});

// Input
type UpdateRoleInput = {
  userId: string;
  newRole: "CUSTOMER" | "AGENT" | "ADMIN" | "UNDERWRITER";
};

// Note: Admins cannot demote themselves
```

### `user.getUserStats`

Get user statistics by role (admin only).

**Type**: Query | **Auth**: Admin

```typescript
const { data: stats } = api.user.getUserStats.useQuery();

// Response
type UserStats = {
  total: number;
  byRole: {
    CUSTOMER: number;
    AGENT: number;
    UNDERWRITER: number;
    ADMIN: number;
  };
  activeThisMonth: number;
};
```

### `user.bulkUpdateRole`

Update multiple users' roles at once (admin only).

**Type**: Mutation | **Auth**: Admin

```typescript
const bulkUpdateRole = api.user.bulkUpdateRole.useMutation();

bulkUpdateRole.mutate({
  userIds: ["user_1", "user_2", "user_3"],
  newRole: "AGENT",
});

// Response
type BulkUpdateRoleResponse = {
  updatedCount: number;
};
```

### `user.bulkActivate`

Bulk activate or deactivate users (admin only).

**Type**: Mutation | **Auth**: Admin

```typescript
const bulkActivate = api.user.bulkActivate.useMutation();

bulkActivate.mutate({
  userIds: ["user_1", "user_2"],
  active: false, // true to activate, false to deactivate
});

// Response
type BulkActivateResponse = {
  processedCount: number;
};

// Note: Admins cannot deactivate themselves
```

### `user.bulkInvite`

Send bulk invitations to multiple email addresses (admin only).

**Type**: Mutation | **Auth**: Admin

```typescript
const bulkInvite = api.user.bulkInvite.useMutation();

bulkInvite.mutate({
  emails: ["john@example.com", "jane@example.com"],
  role: "CUSTOMER", // Default role for invitees
});

// Response
type BulkInviteResponse = {
  sentCount: number;
};
```

### `user.createUser`

Create a new user account (admin only).

**Type**: Mutation | **Auth**: Admin

```typescript
const createUser = api.user.createUser.useMutation();

createUser.mutate({
  email: "newuser@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "CUSTOMER",
  phone: "+27123456789",
  sendInvitation: true, // Send welcome email
});

// Input
type CreateUserInput = {
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "AGENT" | "ADMIN" | "UNDERWRITER";
  phone?: string;
  sendInvitation?: boolean; // Default false
};
```

### `user.updateUser`

Update any user's details (admin only).

**Type**: Mutation | **Auth**: Admin

```typescript
const updateUser = api.user.updateUser.useMutation();

updateUser.mutate({
  userId: "user_123",
  firstName: "Updated Name",
  email: "newemail@example.com",
  role: "AGENT",
});

// Input
type UpdateUserInput = {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: "CUSTOMER" | "AGENT" | "ADMIN" | "UNDERWRITER";
};
```

### `user.deleteUser`

Delete a user account (admin only).

**Type**: Mutation | **Auth**: Admin

```typescript
const deleteUser = api.user.deleteUser.useMutation();

deleteUser.mutate({
  userId: "user_123",
});

// Note: Cannot delete users with active policies
// Note: Admins cannot delete themselves
```

### `user.updateUserStatus`

Update a user's account status (admin only).

**Type**: Mutation | **Auth**: Admin

```typescript
const updateUserStatus = api.user.updateUserStatus.useMutation();

updateUserStatus.mutate({
  userId: "user_123",
  status: "SUSPENDED",
});

// Input
type UpdateUserStatusInput = {
  userId: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
};

// Note: Admins cannot deactivate themselves
```

### `user.getUserById`

Get detailed user information by ID (admin only).

**Type**: Query | **Auth**: Admin

```typescript
const { data: user } = api.user.getUserById.useQuery({
  userId: "user_123",
});

// Response includes policies and claims summary
type UserWithDetails = UserProfile & {
  policies: Array<{
    id: string;
    policyNumber: string;
    status: string;
    premium: number;
  }>;
  claims: Array<{
    id: string;
    claimNumber: string;
    status: string;
    amount: number;
  }>;
  policiesCount: number;
  claimsCount: number;
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

### `policy.getDrafts`

Get draft policies for the current user.

**Type**: Query | **Auth**: Protected

```typescript
const { data: drafts } = api.policy.getDrafts.useQuery();

// Response
type DraftPoliciesResponse = Policy[]; // Only DRAFT status policies
```

### `policy.saveDraft`

Save an incomplete policy as a draft.

**Type**: Mutation | **Auth**: Protected

```typescript
const saveDraft = api.policy.saveDraft.useMutation();

saveDraft.mutate({
  type: "HOME",
  coverage: {
    dwelling: 500000,
    personalProperty: 100000,
    liability: 300000,
    additionalLivingExpenses: 50000,
  },
  deductible: 2500,
  riskFactors: {
    location: {
      province: "WC",
      postalCode: "8001",
      ruralArea: false,
    },
    demographics: {
      age: 35,
    },
  },
  propertyInfo: {
    address: "123 Main Street",
    city: "Cape Town",
    province: "WC",
    postalCode: "8001",
    propertyType: "SINGLE_FAMILY",
    buildYear: 2015,
    squareFeet: 2400,
  },
  isDraft: true,
  completionPercentage: 75,
});

// Input
type DraftPolicyInput = {
  type?: PolicyType;
  startDate?: Date;
  endDate?: Date;
  deductible?: number;
  coverage?: CoverageOptions;
  riskFactors?: RiskFactors;
  propertyInfo?: PropertyInfo;
  personalInfo?: PersonalInfo;
  isDraft: boolean;
  completionPercentage: number;
};

// Response
type DraftPolicyResponse = Policy; // Created draft policy
```

### `policy.convertDraftToPolicy`

Convert a draft policy to a full policy.

**Type**: Mutation | **Auth**: Protected

```typescript
const convertDraft = api.policy.convertDraftToPolicy.useMutation();

convertDraft.mutate({
  draftId: "policy_123",
  finalData: {
    type: "HOME",
    coverage: {
      dwelling: 500000,
      personalProperty: 100000,
      liability: 300000,
      additionalLivingExpenses: 50000,
    },
    deductible: 2500,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    riskFactors: {
      location: {
        province: "WC",
        postalCode: "8001",
        ruralArea: false,
      },
      demographics: {
        age: 35,
      },
    },
    propertyInfo: {
      address: "123 Main Street",
      city: "Cape Town",
      province: "WC",
      postalCode: "8001",
      propertyType: "SINGLE_FAMILY",
      buildYear: 2015,
      squareFeet: 2400,
    },
  },
});

// Input
type ConvertDraftInput = {
  draftId: string;
  finalData: CreatePolicyInput;
};

// Response
type ConvertDraftResponse = Policy; // Converted policy with PENDING_REVIEW status
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
  type: "HOME",
  coverage: {
    dwelling: 500000,
    personalProperty: 100000,
    liability: 300000,
    additionalLivingExpenses: 50000,
  },
  deductible: 2500,
  startDate: new Date(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  riskFactors: {
    location: {
      province: "WC", // South African province code
      postalCode: "8001",
      ruralArea: false,
      distanceFromFireStation: 5,
      distanceFromPoliceStation: 3,
    },
    demographics: {
      age: 35,
      gender: "male",
      maritalStatus: "married",
    },
    personal: {
      employmentStatus: "employed",
      monthlyIncome: 25000,
      claimsHistory: 0,
    },
  },
  propertyInfo: {
    address: "123 Main Street",
    city: "Cape Town",
    province: "WC",
    postalCode: "8001",
    propertyType: "SINGLE_FAMILY", // or FARMHOUSE, RURAL_HOMESTEAD, etc.
    buildYear: 2015,
    squareFeet: 2400,
    bedrooms: 3,
    bathrooms: 2.5,
    constructionType: "BRICK", // or STEEL_FRAME, TRADITIONAL_MUD, etc.
    roofType: "TILE", // or THATCH, METAL, etc.
    foundationType: "CONCRETE_SLAB",
    heatingType: "GAS", // or WOOD_BURNING, SOLAR, etc.
    coolingType: "AIR_CONDITIONING",
    safetyFeatures: ["SMOKE_DETECTORS", "SECURITY_ALARM", "ELECTRIC_FENCING"],
    hasPool: false,
    hasGarage: true,
    garageSpaces: 2,
    // Rural-specific fields
    hasFarmBuildings: false,
    hasLivestock: false,
    hasCrops: false,
    propertySize: 0.5, // in hectares
    accessRoad: "TARRED", // or GRAVEL, DIRT, PRIVATE
  },
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1989-01-15",
    phone: "+27123456789",
    email: "john@example.com",
  },
});

// Premium is automatically calculated based on inputs
// Response includes calculated premium and policy details
```

### Enhanced Property Types

The system now supports 12 property types including rural properties:

**Urban Properties:**

- `SINGLE_FAMILY` - Single Family Home
- `TOWNHOUSE` - Townhouse
- `CONDO` - Condominium
- `APARTMENT` - Apartment

**Rural Properties:**

- `FARMHOUSE` - Traditional farm dwelling
- `RURAL_HOMESTEAD` - Family home in rural area
- `COUNTRY_ESTATE` - Large rural estate
- `SMALLHOLDING` - Small rural property
- `GAME_FARM_HOUSE` - House on game farm
- `VINEYARD_HOUSE` - House on vineyard
- `MOUNTAIN_CABIN` - Mountain cabin
- `COASTAL_COTTAGE` - Coastal cottage

### Enhanced Construction Types

**Traditional:**

- `BRICK` - Brick construction
- `STONE` - Stone construction
- `CONCRETE` - Concrete construction
- `WOOD_FRAME` - Wood frame construction

**Rural:**

- `STEEL_FRAME` - Steel frame construction
- `TRADITIONAL_MUD` - Traditional mud construction
- `THATCH_ROOF` - Thatch roof construction
- `MIXED_CONSTRUCTION` - Mixed construction materials

### Enhanced Safety Features

**Basic:**

- `SMOKE_DETECTORS` - Smoke detection system
- `SECURITY_ALARM` - Basic security alarm
- `FIRE_EXTINGUISHERS` - Fire extinguishers

**Advanced:**

- `MONITORED_ALARM` - Monitored alarm system
- `SECURITY_CAMERAS` - Security camera system
- `ELECTRIC_FENCING` - Electric perimeter fencing
- `SECURITY_GATES` - Security gates
- `SAFE_ROOM` - Safe room/panic room
- `SPRINKLER_SYSTEM` - Fire sprinkler system

### Enhanced Premium Calculation

The premium calculation now includes comprehensive rural property factors:

**Base Rate:** 0.8% per R1,000 coverage

**Risk Factors:**

- **Location Risk**: Province-based + rural area adjustments
- **Property Risk**: Construction type + rural features
- **Personal Risk**: Employment + income + claims history
- **Emergency Services**: Distance from fire/police stations

**Rural Adjustments:**

- Rural area: +10% premium
- Distance from fire station >30km: +20%
- Distance from police station >25km: +15%
- Farm buildings: +10%
- Livestock: +5%
- Crops: +5%
- Property size >10 hectares: +20%

**Safety Discounts:**

- Monitored alarm: -5%
- Security cameras: -3%
- Electric fencing: -4%
- Security gates: -2%
- Safe room: -3%
- Sprinkler system: -4%
- Maximum safety discount: 15%

**Construction Type Factors:**

- Steel frame: -15%
- Brick/Stone: -10%
- Concrete: -5%
- Wood frame: Base rate
- Traditional mud: +15%
- Thatch roof: +20%

**Access Road Factors:**

- Tarred road: -5%
- Gravel road: Base rate
- Dirt road: +10%
- Private road: +15%

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
  type: "HOME",
  coverage: {
    dwelling: 500000,
    personalProperty: 100000,
    liability: 300000,
    additionalLivingExpenses: 50000,
  },
  deductible: 2500,
  riskFactors: {
    location: {
      province: "WC",
      postalCode: "8001",
      ruralArea: false,
      distanceFromFireStation: 5,
      distanceFromPoliceStation: 3,
    },
    demographics: {
      age: 35,
    },
    personal: {
      employmentStatus: "employed",
      monthlyIncome: 25000,
      claimsHistory: 0,
    },
  },
  propertyInfo: {
    address: "123 Main Street",
    city: "Cape Town",
    province: "WC",
    postalCode: "8001",
    propertyType: "SINGLE_FAMILY",
    buildYear: 2015,
    squareFeet: 2400,
    constructionType: "BRICK",
    roofType: "TILE",
    safetyFeatures: ["SMOKE_DETECTORS", "SECURITY_ALARM"],
  },
});

// Response
type PremiumCalculation = {
  quoteNumber: string; // Auto-generated quote number
  basePremium: number;
  adjustedPremium: number;
  riskMultiplier: number;
  breakdown: {
    baseCoverage: number;
    riskAdjustment: number;
    locationFactor: number;
    ageFactor: number;
    discounts: number;
  };
  monthlyPremium: number;
  annualPremium: number;
  validUntil: Date; // 30 days from creation
  coverage: CoverageOptions;
  deductible: number;
};
```

### `policy.checkQuoteExpiration`

Check if a quote is still valid and get expiration details.

**Type**: Query | **Auth**: Protected

```typescript
const { data: expiration } = api.policy.checkQuoteExpiration.useQuery({
  quoteNumber: "QUOTE-ABC123",
});

// Response
type QuoteExpirationResponse = {
  isExpired: boolean;
  expiresAt: Date;
  daysRemaining: number;
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

## 📧 Email Analytics API

### `emailAnalytics.getOverview`

Get email analytics overview for specified time range.

**Parameters:**

- `timeRange`: `'7d' | '30d' | '90d' | '1y'` - Analysis period

**Returns:**

```typescript
{
  total: number,        // Total emails sent
  sent: number,         // Successfully sent emails
  delivered: number,    // Delivered emails
  opened: number,       // Opened emails
  clicked: number,      // Clicked emails
  bounced: number,      // Bounced emails
  complaint: number,    // Spam complaints
  deliveryRate: number, // Delivery rate percentage
  openRate: number,     // Open rate percentage
  clickRate: number,    // Click rate percentage
  bounceRate: number    // Bounce rate percentage
}
```

### `emailAnalytics.getByType`

Get email analytics broken down by email type.

**Parameters:**

- `timeRange`: `'7d' | '30d' | '90d' | '1y'` - Analysis period

**Returns:**

```typescript
Array<{
  type: EmailType; // INVITATION | NOTIFICATION | WELCOME | etc.
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complaint: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}>;
```

### `emailAnalytics.getDeliveryTrends`

Get email delivery trends over time.

**Parameters:**

- `days`: `number` - Number of days to analyze (1-90)

**Returns:**

```typescript
Array<{
  date: string; // YYYY-MM-DD format
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}>;
```

### `emailAnalytics.retryFailedEmails`

Retry sending failed emails.

**Returns:**

```typescript
{
  success: boolean;
}
```

---

## 🛡️ Security Monitoring API

### `security.getEvents`

Get security events with filtering and pagination.

**Parameters:**

- `type?`: `SecurityEventType` - Filter by event type
- `severity?`: `SecurityEventSeverity` - Filter by severity
- `resolved?`: `boolean` - Filter by resolution status
- `limit?`: `number` (default: 50) - Results per page
- `offset?`: `number` (default: 0) - Pagination offset
- `startDate?`: `Date` - Start date filter
- `endDate?`: `Date` - End date filter

**Returns:**

```typescript
{
  events: Array<{
    id: string,
    type: SecurityEventType,
    severity: SecurityEventSeverity,
    userId?: string,
    userEmail?: string,
    description: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any,
    resolved: boolean,
    resolvedAt?: Date,
    createdAt: Date,
    user?: {
      id: string,
      email: string,
      firstName?: string,
      lastName?: string
    },
    resolvedByUser?: {
      id: string,
      email: string,
      firstName?: string,
      lastName?: string
    }
  }>,
  total: number,
  hasMore: boolean
}
```

### `security.getStats`

Get security event statistics.

**Returns:**

```typescript
{
  totalEvents: number,
  unresolvedEvents: number,
  criticalEvents: number,
  recentEvents: number,
  eventsByType: Array<{
    type: SecurityEventType,
    _count: number
  }>,
  eventsBySeverity: Array<{
    severity: SecurityEventSeverity,
    _count: number
  }>
}
```

### `security.resolveEvent`

Mark a security event as resolved.

**Parameters:**

- `eventId`: `string` - Event ID to resolve
- `resolution?`: `string` - Optional resolution notes

**Returns:**

```typescript
SecurityEvent; // Updated event object
```

### `security.getSettings`

Get current security settings.

**Returns:**

```typescript
{
  twoFactorRequired: boolean,
  sessionTimeout: number,
  passwordComplexity: boolean,
  ipWhitelist: boolean,
  auditLogging: boolean,
  suspiciousActivityAlerts: boolean,
  dataEncryption: boolean,
  apiRateLimit: number
}
```

### `security.updateSettings`

Update security settings.

**Parameters:**

- `twoFactorRequired?`: `boolean`
- `sessionTimeout?`: `number` (5-480 minutes)
- `passwordComplexity?`: `boolean`
- `ipWhitelist?`: `boolean`
- `auditLogging?`: `boolean`
- `suspiciousActivityAlerts?`: `boolean`
- `dataEncryption?`: `boolean`
- `apiRateLimit?`: `number` (100-10000)

**Returns:**

```typescript
SystemSettings; // Updated settings object
```

---

## ⚙️ System Settings API

### `settings.get`

Get current system settings.

**Returns:**

```typescript
SystemSettings; // Complete settings object
```

### `settings.update`

Update system settings.

**Parameters:** (all optional)

- `platformName?`: `string`
- `platformDescription?`: `string`
- `platformLogo?`: `string`
- `emailNotifications?`: `boolean`
- `smsNotifications?`: `boolean`
- `whatsappNotifications?`: `boolean`
- `twoFactorRequired?`: `boolean`
- `sessionTimeout?`: `number` (5-480 minutes)
- `passwordComplexity?`: `boolean`
- `ipWhitelist?`: `boolean`
- `auditLogging?`: `boolean`
- `suspiciousActivityAlerts?`: `boolean`
- `dataEncryption?`: `boolean`
- `apiRateLimit?`: `number` (100-10000)
- `maintenanceMode?`: `boolean`
- `maintenanceMessage?`: `string`
- `autoBackup?`: `boolean`
- `backupFrequency?`: `'daily' | 'weekly' | 'monthly'`
- `paymentGateway?`: `string`
- `currency?`: `string`
- `taxRate?`: `number` (0-1)
- `smtpHost?`: `string`
- `smtpPort?`: `number`
- `smtpUsername?`: `string`
- `smtpPassword?`: `string`
- `fromEmail?`: `string`
- `fromName?`: `string`
- `smsProvider?`: `string`
- `smsApiKey?`: `string`
- `smsApiSecret?`: `string`
- `smsFromNumber?`: `string`

**Returns:**

```typescript
SystemSettings; // Updated settings object
```

### `settings.reset`

Reset all settings to default values.

**Returns:**

```typescript
SystemSettings; // Default settings object
```

### `settings.getHistory`

Get settings change history.

**Parameters:**

- `limit?`: `number` (default: 50) - Results per page
- `offset?`: `number` (default: 0) - Pagination offset

**Returns:**

```typescript
{
  settings: Array<SystemSettings>,
  total: number,
  hasMore: boolean
}
```

---

## 📊 Database Schema & Types

### User-Related Enums

```typescript
enum UserRole {
  CUSTOMER = "CUSTOMER",
  AGENT = "AGENT",
  ADMIN = "ADMIN",
  UNDERWRITER = "UNDERWRITER"
}

enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION"
}

enum IdType {
  ID = "ID",           // South African ID Document
  PASSPORT = "PASSPORT" // Passport
}

enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"
}

enum EmploymentStatus {
  EMPLOYED = "EMPLOYED",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  UNEMPLOYED = "UNEMPLOYED",
  STUDENT = "STUDENT",
  RETIRED = "RETIRED",
  PENSIONER = "PENSIONER"
}
```

### Policy & Claims Enums

```typescript
enum PolicyType {
  HOME = "HOME"
  // Additional types to be added: AUTO, LIFE, etc.
}

enum PolicyStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  SUSPENDED = "SUSPENDED"
}

enum ClaimType {
  FIRE_DAMAGE = "FIRE_DAMAGE",
  WATER_DAMAGE = "WATER_DAMAGE",
  STORM_DAMAGE = "STORM_DAMAGE",
  THEFT_BURGLARY = "THEFT_BURGLARY",
  VANDALISM = "VANDALISM",
  LIABILITY = "LIABILITY",
  STRUCTURAL_DAMAGE = "STRUCTURAL_DAMAGE",
  ELECTRICAL_DAMAGE = "ELECTRICAL_DAMAGE",
  PLUMBING_DAMAGE = "PLUMBING_DAMAGE",
  OTHER = "OTHER"
}

enum ClaimStatus {
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  INVESTIGATING = "INVESTIGATING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SETTLED = "SETTLED"
}
```

### Payment & Document Enums

```typescript
enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

enum PaymentType {
  PREMIUM = "PREMIUM",
  DEDUCTIBLE = "DEDUCTIBLE",
  CLAIM_PAYOUT = "CLAIM_PAYOUT"
}

enum DocumentType {
  PHOTO = "PHOTO",
  RECEIPT = "RECEIPT",
  POLICE_REPORT = "POLICE_REPORT",
  MEDICAL_REPORT = "MEDICAL_REPORT",
  ESTIMATE = "ESTIMATE",
  OTHER = "OTHER"
}
```

### Verification Status Fields

All user profiles include verification status tracking:

```typescript
type VerificationStatus = {
  emailVerified: boolean;    // Email address verified
  phoneVerified: boolean;    // Phone number verified
  idVerified: boolean;       // ID document verified
};
```

### Complete Profile Completeness Tracking

The system tracks profile completion across multiple categories:

```typescript
type ProfileCompleteness = {
  hasBasicInfo: boolean;      // firstName && lastName
  hasContactInfo: boolean;    // phone number provided
  hasAddressInfo: boolean;    // streetAddress && city
  hasEmploymentInfo: boolean; // employmentStatus provided
  hasIncomeInfo: boolean;     // monthlyIncome provided
  hasIdInfo: boolean;         // idNumber && idType provided
};
```

## 🇿🇦 South African Data Constants

### Provinces

The system includes comprehensive South African province data with risk assessments:

```typescript
export const SOUTH_AFRICAN_PROVINCES = [
  {
    code: "WC",
    name: "Western Cape",
    crimeRate: "medium",
    ruralPercentage: 35,
  },
  { code: "EC", name: "Eastern Cape", crimeRate: "high", ruralPercentage: 65 },
  { code: "NC", name: "Northern Cape", crimeRate: "low", ruralPercentage: 80 },
  { code: "FS", name: "Free State", crimeRate: "medium", ruralPercentage: 60 },
  {
    code: "KZN",
    name: "KwaZulu-Natal",
    crimeRate: "high",
    ruralPercentage: 45,
  },
  { code: "NW", name: "North West", crimeRate: "medium", ruralPercentage: 70 },
  { code: "GP", name: "Gauteng", crimeRate: "high", ruralPercentage: 15 },
  { code: "MP", name: "Mpumalanga", crimeRate: "medium", ruralPercentage: 55 },
  { code: "LP", name: "Limpopo", crimeRate: "medium", ruralPercentage: 75 },
];
```

### Rural Property Types

```typescript
export const RURAL_PROPERTY_TYPES = [
  {
    value: "FARMHOUSE",
    label: "Farmhouse",
    description: "Traditional farm dwelling",
  },
  {
    value: "RURAL_HOMESTEAD",
    label: "Rural Homestead",
    description: "Family home in rural area",
  },
  {
    value: "COUNTRY_ESTATE",
    label: "Country Estate",
    description: "Large rural estate property",
  },
  {
    value: "SMALLHOLDING",
    label: "Smallholding",
    description: "Small rural property with agricultural use",
  },
  {
    value: "GAME_FARM_HOUSE",
    label: "Game Farm House",
    description: "House on game farm property",
  },
  {
    value: "VINEYARD_HOUSE",
    label: "Vineyard House",
    description: "House on vineyard property",
  },
  {
    value: "MOUNTAIN_CABIN",
    label: "Mountain Cabin",
    description: "Cabin in mountain area",
  },
  {
    value: "COASTAL_COTTAGE",
    label: "Coastal Cottage",
    description: "Cottage near coastline",
  },
];
```

### Construction Types

```typescript
export const RURAL_CONSTRUCTION_TYPES = [
  {
    value: "BRICK",
    label: "Brick",
    description: "Traditional brick construction",
  },
  { value: "STONE", label: "Stone", description: "Natural stone construction" },
  {
    value: "CONCRETE",
    label: "Concrete",
    description: "Concrete block construction",
  },
  {
    value: "STEEL_FRAME",
    label: "Steel Frame",
    description: "Steel frame construction",
  },
  {
    value: "WOOD_FRAME",
    label: "Wood Frame",
    description: "Wooden frame construction",
  },
  {
    value: "MIXED_CONSTRUCTION",
    label: "Mixed Construction",
    description: "Combination of materials",
  },
  {
    value: "TRADITIONAL_MUD",
    label: "Traditional Mud",
    description: "Traditional mud construction",
  },
  {
    value: "THATCH_ROOF",
    label: "Thatch Roof",
    description: "Thatch roof construction",
  },
];
```

### Safety Features

```typescript
export const RURAL_SAFETY_FEATURES = [
  {
    value: "SMOKE_DETECTORS",
    label: "Smoke Detectors",
    description: "Smoke detection system",
  },
  {
    value: "SECURITY_ALARM",
    label: "Security Alarm",
    description: "Basic security alarm system",
  },
  {
    value: "MONITORED_ALARM",
    label: "Monitored Alarm",
    description: "Professionally monitored alarm",
  },
  {
    value: "SECURITY_CAMERAS",
    label: "Security Cameras",
    description: "CCTV surveillance system",
  },
  {
    value: "ELECTRIC_FENCING",
    label: "Electric Fencing",
    description: "Electric perimeter fencing",
  },
  {
    value: "SECURITY_GATES",
    label: "Security Gates",
    description: "Security gate system",
  },
  {
    value: "SAFE_ROOM",
    label: "Safe Room",
    description: "Panic room or safe room",
  },
  {
    value: "FIRE_EXTINGUISHERS",
    label: "Fire Extinguishers",
    description: "Fire extinguisher system",
  },
  {
    value: "SPRINKLER_SYSTEM",
    label: "Sprinkler System",
    description: "Fire sprinkler system",
  },
  { value: "NONE", label: "None", description: "No safety features" },
];
```

## 📚 Additional Resources

- **Type Definitions**: All types are auto-generated from tRPC and available in your IDE
- **API Testing**: Use the tRPC panel in development for API testing
- **Error Reference**: Check `/src/server/api/trpc.ts` for error handling middleware
- **Data Constants**: Available in `/src/lib/data/south-africa.ts`
- **Validation Schemas**: Available in `/src/lib/validations/policy.ts` and `/src/lib/validations/agent.ts`
