# Mobile & External API Client Authentication Guide

## Overview

This document details how mobile applications, desktop clients, and other external applications should authenticate with the Lalisure Insurance Platform API. The platform uses **two distinct authentication systems** based on user type.

---

## Table of Contents

1. [Authentication Systems Overview](#authentication-systems-overview)
2. [Customer Authentication Flow (Clerk-based)](#customer-authentication-flow-clerk-based)
3. [Staff Authentication Flow (JWT-based)](#staff-authentication-flow-jwt-based)
4. [API Architecture](#api-architecture)
5. [Mobile Implementation Examples](#mobile-implementation-examples)
6. [Security Best Practices](#security-best-practices)
7. [Error Handling](#error-handling)
8. [Token Management](#token-management)
9. [Testing & Debugging](#testing--debugging)

---

## Authentication Systems Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Lalisure API Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────┐         ┌──────────────────┐        │
│  │  Customer Routes  │         │   Staff Routes   │        │
│  │   /customer/*     │         │  /admin/*        │        │
│  │   /api/trpc/*     │         │  /agent/*        │        │
│  └─────────┬─────────┘         │  /underwriter/*  │        │
│            │                   └────────┬─────────┘        │
│            │                            │                   │
│  ┌─────────▼─────────┐         ┌───────▼──────────┐       │
│  │  Clerk Auth       │         │  JWT Auth        │       │
│  │  Middleware       │         │  Middleware      │       │
│  └───────────────────┘         └──────────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │                                │
         ▼                                ▼
   ┌─────────┐                      ┌─────────┐
   │  Clerk  │                      │  Custom │
   │ Service │                      │   JWT   │
   └─────────┘                      └─────────┘
```

### User Types & Authentication Methods

| User Type      | Routes                          | Auth Method | Token Type        | Implementation      |
|----------------|---------------------------------|-------------|-------------------|---------------------|
| **Customer**   | `/customer/*`, `/api/trpc/*`   | Clerk       | Clerk JWT         | Clerk SDK           |
| **Agent**      | `/agent/*`, `/api/staff/*`     | Custom JWT  | HS256 JWT         | Custom middleware   |
| **Underwriter**| `/underwriter/*`, `/api/staff/*`| Custom JWT | HS256 JWT         | Custom middleware   |
| **Admin**      | `/admin/*`, `/api/staff/*`     | Custom JWT  | HS256 JWT         | Custom middleware   |

---

## Customer Authentication Flow (Clerk-based)

### Flow Diagram

```
┌──────────┐
│  Mobile  │
│   App    │
└────┬─────┘
     │
     │ 1. Initiate Sign-up/Sign-in
     ▼
┌─────────────┐
│   Clerk     │
│  Frontend   │  (OAuth, Email/Pass, Social)
│     SDK     │
└────┬────────┘
     │
     │ 2. User authenticates
     │    (credentials verified)
     ▼
┌─────────────┐
│   Clerk     │
│  Backend    │  Generates session token
└────┬────────┘
     │
     │ 3. Return JWT token
     ▼
┌──────────┐
│  Mobile  │  Store token securely
│   App    │  (Keychain/Keystore)
└────┬─────┘
     │
     │ 4. API Request
     │    Authorization: Bearer <clerk_jwt>
     ▼
┌─────────────────────┐
│  Lalisure API       │
│  Middleware         │  5. Validate token with Clerk
│  (middleware.ts)    │
└────┬────────────────┘
     │
     │ 6. Token valid? ✓
     ▼
┌─────────────────────┐
│  Business Logic     │  7. Process request
│  (TRPC/REST)        │     Fetch user from DB
└─────────────────────┘
     │
     │ 8. Return response
     ▼
┌──────────┐
│  Mobile  │  Display data
│   App    │
└──────────┘
```

### Implementation Details

#### Step 1: Initialize Clerk in Mobile App

**React Native Example:**
```javascript
// app/_layout.tsx
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from './cache';

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <App />
    </ClerkProvider>
  );
}
```

**Secure Token Cache (React Native):**
```javascript
// cache.ts
import * as SecureStore from 'expo-secure-store';

export const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};
```

#### Step 2: User Sign-up/Sign-in

**Sign-up:**
```typescript
// screens/SignUpScreen.tsx
import { useSignUp } from '@clerk/clerk-expo';

export default function SignUpScreen() {
  const { signUp, setActive } = useSignUp();

  const onSignUpPress = async () => {
    try {
      // Create user
      await signUp.create({
        emailAddress: 'user@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Navigate to verification screen
      navigation.navigate('VerifyEmail');
    } catch (err) {
      console.error('Sign up error:', err);
    }
  };

  return (
    // ... UI components
  );
}
```

**Sign-in:**
```typescript
// screens/SignInScreen.tsx
import { useSignIn } from '@clerk/clerk-expo';

export default function SignInScreen() {
  const { signIn, setActive } = useSignIn();

  const onSignInPress = async () => {
    try {
      const result = await signIn.create({
        identifier: 'user@example.com',
        password: 'SecurePassword123!',
      });

      if (result.status === 'complete') {
        // Set active session
        await setActive({ session: result.createdSessionId });
        // Navigate to main app
        navigation.navigate('Dashboard');
      }
    } catch (err) {
      console.error('Sign in error:', err);
    }
  };

  return (
    // ... UI components
  );
}
```

#### Step 3: Get Authentication Token

**Retrieve Token:**
```typescript
// services/auth.ts
import { useAuth } from '@clerk/clerk-expo';

export function useAuthToken() {
  const { getToken, userId, isSignedIn } = useAuth();

  const getAuthHeader = async () => {
    if (!isSignedIn) {
      throw new Error('User not signed in');
    }

    const token = await getToken();

    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  return {
    getAuthHeader,
    userId,
    isSignedIn,
  };
}
```

#### Step 4: Make Authenticated API Requests

**TRPC Client Setup:**
```typescript
// utils/trpc.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/api/root';
import { useAuth } from '@clerk/clerk-expo';
import superjson from 'superjson';

export function useTRPC() {
  const { getToken } = useAuth();

  const client = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${process.env.EXPO_PUBLIC_API_URL}/api/trpc`,
        async headers() {
          const token = await getToken();
          return {
            Authorization: token ? `Bearer ${token}` : undefined,
          };
        },
      }),
    ],
  });

  return client;
}
```

**Usage in Component:**
```typescript
// screens/DashboardScreen.tsx
import { useTRPC } from '../utils/trpc';

export default function DashboardScreen() {
  const trpc = useTRPC();
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      // This automatically includes Clerk JWT token
      const data = await trpc.policy.getUserPolicies.query();
      setPolicies(data);
    } catch (error) {
      console.error('Failed to load policies:', error);
    }
  };

  return (
    // ... UI to display policies
  );
}
```

**REST API Request:**
```typescript
// services/api.ts
import { useAuth } from '@clerk/clerk-expo';

export function useAPI() {
  const { getToken } = useAuth();

  const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`,
      {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  };

  return { fetchAPI };
}

// Usage
const { fetchAPI } = useAPI();
const data = await fetchAPI('/api/customer/profile');
```

#### Step 5: Server-Side Token Validation

**How Lalisure Validates Customer Tokens** (Automatic):

```typescript
// src/middleware.ts (runs on every request)
export default clerkMiddleware(async (auth, req) => {
  if (isCustomerRoute(req)) {
    const { userId } = await auth();  // ✅ Validates token with Clerk
    if (!userId) {
      return NextResponse.redirect(signInUrl);
    }
  }
});
```

**TRPC Context Creation** (src/server/api/trpc.ts:26-78):
```typescript
export const createTRPCContext = async (_opts: { req: NextRequest }) => {
  // Get Clerk user ID from validated token
  const { userId: clerkUserId } = await auth();

  if (clerkUserId) {
    // Fetch full user from database
    let user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    // Auto-create user if authenticated but not in DB
    if (!user) {
      const { currentUser } = await import('@clerk/nextjs/server');
      const clerkUser = await currentUser();

      if (clerkUser) {
        user = await db.user.create({
          data: {
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            role: 'CUSTOMER',
          },
        });
      }
    }

    return createInnerTRPCContext({
      userId: clerkUserId,
      user,  // Full user object available in procedures
      req: _opts.req,
    });
  }

  return createInnerTRPCContext({
    userId: null,
    user: null,
    req: _opts.req,
  });
};
```

### Customer Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/trpc/*` | POST | All TRPC procedures | ✅ Clerk JWT |
| `/customer/*` | GET | Customer dashboard routes | ✅ Clerk JWT |
| `/api/webhooks/clerk` | POST | Clerk webhook for user sync | ❌ (Webhook signature) |

---

## Staff Authentication Flow (JWT-based)

### Flow Diagram

```
┌──────────┐
│  Mobile  │
│   App    │  (Staff portal app)
└────┬─────┘
     │
     │ 1. POST /api/staff/login
     │    { email, password }
     ▼
┌─────────────────────┐
│  Lalisure API       │
│  /api/staff/login   │  2. Verify credentials
└────┬────────────────┘     - Check email exists
     │                       - Verify role (not CUSTOMER)
     │                       - Validate password (bcrypt)
     │
     │ 3. Generate JWT token
     │    HS256, 24h expiry
     ▼
┌──────────┐
│  Mobile  │  4. Store token + user data
│   App    │     securely (Keychain)
└────┬─────┘
     │
     │ 5. API Request
     │    Cookie: staff-session=<jwt>
     │    OR
     │    Authorization: Bearer <jwt>
     ▼
┌─────────────────────┐
│  Lalisure API       │
│  Middleware         │  6. Verify JWT signature
│  (middleware.ts)    │     Check role permissions
└────┬────────────────┘
     │
     │ 7. JWT valid & role authorized? ✓
     ▼
┌─────────────────────┐
│  Business Logic     │  8. Process request
│  (TRPC/REST)        │     Apply role-based logic
└─────────────────────┘
     │
     │ 9. Return response
     ▼
┌──────────┐
│  Mobile  │  Display data
│   App    │
└──────────┘
```

### Implementation Details

#### Step 1: Staff Login

**Mobile Login Request:**
```typescript
// services/staffAuth.ts
import * as SecureStore from 'expo-secure-store';

interface StaffLoginCredentials {
  email: string;
  password: string;
}

interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'AGENT' | 'UNDERWRITER';
}

interface StaffLoginResponse {
  success: boolean;
  user: StaffUser;
}

export class StaffAuthService {
  private static TOKEN_KEY = 'staff_jwt_token';
  private static USER_KEY = 'staff_user_data';
  private static API_URL = process.env.EXPO_PUBLIC_API_URL;

  /**
   * Authenticate staff member
   */
  static async login(credentials: StaffLoginCredentials): Promise<StaffUser> {
    const response = await fetch(`${this.API_URL}/api/staff/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // Important for cookie handling
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data: StaffLoginResponse = await response.json();

    // Extract JWT from Set-Cookie header or response body
    // For mobile apps, we'll typically use a custom header instead of cookies
    const token = response.headers.get('X-Staff-Token');

    if (token) {
      await this.storeToken(token);
    }

    await this.storeUser(data.user);

    return data.user;
  }

  /**
   * Store JWT token securely
   */
  private static async storeToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.TOKEN_KEY, token);
  }

  /**
   * Store user data
   */
  private static async storeUser(user: StaffUser): Promise<void> {
    await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get stored JWT token
   */
  static async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  static async getUser(): Promise<StaffUser | null> {
    const userData = await SecureStore.getItemAsync(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    // Verify token is still valid
    try {
      const response = await fetch(`${this.API_URL}/api/staff/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Logout staff member
   */
  static async logout(): Promise<void> {
    const token = await this.getToken();

    if (token) {
      // Call logout endpoint to invalidate session server-side
      await fetch(`${this.API_URL}/api/staff/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Clear local storage
    await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    await SecureStore.deleteItemAsync(this.USER_KEY);
  }

  /**
   * Get authorization header
   */
  static async getAuthHeader(): Promise<{ Authorization: string } | {}> {
    const token = await this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
```

**Login Screen:**
```typescript
// screens/StaffLoginScreen.tsx
import { useState } from 'react';
import { StaffAuthService } from '../services/staffAuth';

export default function StaffLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await StaffAuthService.login({ email, password });

      // Navigate based on role
      switch (user.role) {
        case 'ADMIN':
          navigation.navigate('AdminDashboard');
          break;
        case 'AGENT':
          navigation.navigate('AgentDashboard');
          break;
        case 'UNDERWRITER':
          navigation.navigate('UnderwriterDashboard');
          break;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... UI components
  );
}
```

#### Step 2: Make Authenticated Staff Requests

**API Client with JWT:**
```typescript
// services/staffAPI.ts
import { StaffAuthService } from './staffAuth';

export class StaffAPIClient {
  private static API_URL = process.env.EXPO_PUBLIC_API_URL;

  /**
   * Make authenticated API request
   */
  static async fetch(endpoint: string, options: RequestInit = {}) {
    const authHeader = await StaffAuthService.getAuthHeader();

    const response = await fetch(`${this.API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid
      await StaffAuthService.logout();
      throw new Error('Session expired. Please log in again.');
    }

    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  /**
   * Get current staff user
   */
  static async getCurrentUser() {
    return this.fetch('/api/staff/me');
  }

  /**
   * Update staff settings
   */
  static async updateSettings(settings: any) {
    return this.fetch('/api/staff/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}
```

**TRPC Client for Staff:**
```typescript
// utils/staffTRPC.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/api/root';
import { StaffAuthService } from '../services/staffAuth';
import superjson from 'superjson';

export function useStaffTRPC() {
  const client = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${process.env.EXPO_PUBLIC_API_URL}/api/trpc`,
        async headers() {
          const authHeader = await StaffAuthService.getAuthHeader();
          return authHeader;
        },
      }),
    ],
  });

  return client;
}

// Usage in component
const trpc = useStaffTRPC();
const claims = await trpc.claim.getUnderwriterPendingClaims.query();
```

#### Step 3: Server-Side JWT Validation

**Staff Token Validation** (src/lib/auth/staff-auth.ts:44-61):
```typescript
export async function verifyStaffToken(token: string): Promise<StaffSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = payload.user as StaffUser;

    // ✅ Verify user has staff role
    if (!['ADMIN', 'AGENT', 'UNDERWRITER'].includes(user.role)) {
      return null;
    }

    return {
      user,
      expires: new Date(payload.exp! * 1000),
    };
  } catch (error) {
    return null; // ✅ Fail secure
  }
}
```

**Middleware Enforcement** (src/middleware.ts:10-36):
```typescript
if (isStaffRoute(req)) {
  const staffSession = await getStaffSessionFromRequest(req as NextRequest);

  if (!staffSession) {
    return NextResponse.redirect(staffLoginUrl);
  }

  // ✅ Role-based routing enforcement
  const { user } = staffSession;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/staff/login', req.url));
  }

  if (pathname.startsWith('/agent') && user.role !== 'AGENT') {
    return NextResponse.redirect(new URL('/staff/login', req.url));
  }

  if (pathname.startsWith('/underwriter') && user.role !== 'UNDERWRITER') {
    return NextResponse.redirect(new URL('/staff/login', req.url));
  }

  return NextResponse.next();
}
```

### Staff Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/staff/login` | POST | Staff authentication | ❌ |
| `/api/staff/logout` | POST | Invalidate session | ✅ Staff JWT |
| `/api/staff/me` | GET | Get current staff user | ✅ Staff JWT |
| `/api/staff/register` | POST | Create new staff account | ✅ Admin JWT |
| `/api/staff/settings` | GET/PUT | Staff settings | ✅ Staff JWT |
| `/api/staff/forgot-password` | POST | Initiate password reset | ❌ |
| `/api/staff/reset-password` | POST | Complete password reset | ❌ (token in body) |
| `/admin/*` | ALL | Admin routes | ✅ Admin JWT |
| `/agent/*` | ALL | Agent routes | ✅ Agent JWT |
| `/underwriter/*` | ALL | Underwriter routes | ✅ Underwriter JWT |

---

## API Architecture

### Endpoint Categories

#### 1. **TRPC Endpoints** (Type-safe, Recommended)

**Base URL**: `/api/trpc`

**Available Routers**:
- `user` - User management (src/server/api/routers/user.ts)
- `policy` - Insurance policies (src/server/api/routers/policy.ts)
- `claim` - Claims management (src/server/api/routers/claim.ts)
- `payment` - Payment processing (src/server/api/routers/payment.ts)
- `notification` - Notifications (src/server/api/routers/notification.ts)
- `analytics` - Analytics data (src/server/api/routers/analytics.ts)
- `invitation` - Staff invitations (src/server/api/routers/invitation.ts)
- `settings` - Application settings (src/server/api/routers/settings.ts)

**Procedure Types**:
```typescript
// Public - No authentication required
publicProcedure

// Protected - Requires Clerk JWT (CUSTOMER role)
protectedProcedure

// Agent - Requires Staff JWT with AGENT role or higher
agentProcedure

// Underwriter - Requires Staff JWT with UNDERWRITER role or higher
underwriterProcedure

// Admin - Requires Staff JWT with ADMIN role
adminProcedure
```

**Example TRPC Calls**:
```typescript
// Customer: Get my policies
const policies = await trpc.policy.getUserPolicies.query();

// Customer: Create a claim
const claim = await trpc.claim.create.mutate({
  policyId: 'policy_123',
  description: 'Car accident',
  incidentDate: new Date(),
});

// Agent: Get assigned claims
const claims = await trpc.claim.getAgentClaims.query();

// Underwriter: Approve claim
await trpc.claim.approve.mutate({
  claimId: 'claim_123',
  approvalNotes: 'Approved after review',
});

// Admin: Get analytics
const stats = await trpc.analytics.getSystemStats.query({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31'),
});
```

#### 2. **REST Endpoints**

**Staff Authentication**:
```bash
# Login
POST /api/staff/login
Content-Type: application/json

{
  "email": "agent@lalisure.com",
  "password": "SecurePassword123!"
}

# Response
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "agent@lalisure.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "AGENT"
  }
}

# Get current user
GET /api/staff/me
Authorization: Bearer <jwt_token>

# Logout
POST /api/staff/logout
Authorization: Bearer <jwt_token>
```

**Webhooks** (Server-to-Server):
```bash
# Clerk webhook (user sync)
POST /api/webhooks/clerk
svix-id: <webhook_id>
svix-timestamp: <timestamp>
svix-signature: <signature>

# Paystack webhook (payment confirmation)
POST /api/webhooks/paystack
x-paystack-signature: <signature>
```

#### 3. **File Upload**

**UploadThing Endpoint**:
```typescript
// Upload document
POST /api/uploadthing
Content-Type: multipart/form-data
Authorization: Bearer <clerk_jwt_or_staff_jwt>

// Example: Upload claim document
const uploadedFiles = await uploadFiles('claimDocuments', {
  files: [file],
  metadata: {
    claimId: 'claim_123',
    userId: 'user_123',
  },
});
```

### Authentication Flow by Endpoint Type

```
┌─────────────────┐
│  Client Request │
└────────┬────────┘
         │
         ▼
   ┌─────────────┐
   │ Middleware  │  (src/middleware.ts)
   │  Validates  │
   │  ALL routes │
   └────┬────────┘
        │
        ├─────────── /customer/* ──────> Clerk JWT Validation
        │
        ├─────────── /admin/* ─────────> Staff JWT + ADMIN role
        │
        ├─────────── /agent/* ─────────> Staff JWT + AGENT role
        │
        ├─────────── /underwriter/* ───> Staff JWT + UNDERWRITER role
        │
        ├─────────── /api/trpc/* ──────> Context creation (Clerk or Staff)
        │
        ├─────────── /api/staff/* ─────> Staff JWT (login endpoint public)
        │
        └─────────── /api/webhooks/* ──> Signature verification
```

---

## Mobile Implementation Examples

### React Native (Expo) - Customer App

**Project Structure**:
```
mobile-customer/
├── app/
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/
│   │   ├── policies.tsx
│   │   ├── claims.tsx
│   │   └── profile.tsx
│   └── _layout.tsx
├── services/
│   ├── auth.ts
│   └── api.ts
├── utils/
│   ├── trpc.ts
│   └── cache.ts
└── package.json
```

**Installation**:
```bash
npx create-expo-app mobile-customer
cd mobile-customer
npm install @clerk/clerk-expo @trpc/client @trpc/react-query
npm install @tanstack/react-query expo-secure-store superjson
```

**Configuration** (app.json):
```json
{
  "expo": {
    "extra": {
      "clerkPublishableKey": "pk_test_...",
      "apiUrl": "https://api.lalisure.com"
    }
  }
}
```

### React Native - Staff App

**Project Structure**:
```
mobile-staff/
├── app/
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (admin)/
│   │   ├── dashboard.tsx
│   │   └── users.tsx
│   ├── (agent)/
│   │   ├── dashboard.tsx
│   │   └── claims.tsx
│   └── _layout.tsx
├── services/
│   ├── staffAuth.ts
│   ├── staffAPI.ts
│   └── storage.ts
└── package.json
```

**Installation**:
```bash
npx create-expo-app mobile-staff
cd mobile-staff
npm install @trpc/client @tanstack/react-query expo-secure-store
```

### Flutter - Customer App

**Authentication Service**:
```dart
// lib/services/auth_service.dart
import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  final Clerk _clerk = Clerk(
    publishableKey: const String.fromEnvironment('CLERK_PUBLISHABLE_KEY'),
  );

  final _storage = const FlutterSecureStorage();

  Future<void> signIn(String email, String password) async {
    final result = await _clerk.signIn.create(
      SignInCreateParams(
        identifier: email,
        password: password,
      ),
    );

    if (result.status == SignInStatus.complete) {
      final session = result.createdSessionId;
      await _storage.write(key: 'session_id', value: session);
    }
  }

  Future<String?> getToken() async {
    return await _clerk.session?.getToken();
  }
}
```

**API Service**:
```dart
// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class APIService {
  static const String baseUrl = String.fromEnvironment('API_URL');
  final AuthService _authService;

  APIService(this._authService);

  Future<Map<String, dynamic>> fetchWithAuth(String endpoint) async {
    final token = await _authService.getToken();

    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Request failed: ${response.statusCode}');
    }
  }

  Future<List<Policy>> getPolicies() async {
    // Use TRPC endpoint
    final data = await fetchWithAuth('/api/trpc/policy.getUserPolicies');
    return (data['result']['data'] as List)
        .map((policy) => Policy.fromJson(policy))
        .toList();
  }
}
```

### iOS (Swift) - Staff App

**Authentication Manager**:
```swift
// Services/AuthManager.swift
import Foundation
import Security

class StaffAuthManager {
    static let shared = StaffAuthManager()
    private let baseURL = "https://api.lalisure.com"

    struct StaffUser: Codable {
        let id: String
        let email: String
        let firstName: String
        let lastName: String
        let role: String
    }

    func login(email: String, password: String) async throws -> StaffUser {
        let url = URL(string: "\(baseURL)/api/staff/login")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["email": email, "password": password]
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw AuthError.loginFailed
        }

        struct LoginResponse: Codable {
            let success: Bool
            let user: StaffUser
        }

        let loginResponse = try JSONDecoder().decode(LoginResponse.self, from: data)

        // Extract JWT from response header
        if let token = httpResponse.value(forHTTPHeaderField: "X-Staff-Token") {
            try saveToken(token)
        }

        try saveUser(loginResponse.user)

        return loginResponse.user
    }

    private func saveToken(_ token: String) throws {
        let data = token.data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "staff_jwt",
            kSecValueData as String: data
        ]

        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    func getToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "staff_jwt",
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let token = String(data: data, encoding: .utf8) else {
            return nil
        }

        return token
    }
}
```

**API Client**:
```swift
// Services/APIClient.swift
import Foundation

class APIClient {
    private let baseURL = "https://api.lalisure.com"

    func fetchWithAuth<T: Decodable>(_ endpoint: String) async throws -> T {
        guard let token = StaffAuthManager.shared.getToken() else {
            throw APIError.unauthorized
        }

        let url = URL(string: "\(baseURL)\(endpoint)")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.requestFailed
        }

        return try JSONDecoder().decode(T.self, from: data)
    }

    func getClaims() async throws -> [Claim] {
        // TRPC endpoint
        struct TRPCResponse: Codable {
            let result: ResultData

            struct ResultData: Codable {
                let data: [Claim]
            }
        }

        let response: TRPCResponse = try await fetchWithAuth("/api/trpc/claim.getAgentClaims")
        return response.result.data
    }
}
```

### Android (Kotlin) - Customer App

**Authentication Service**:
```kotlin
// services/AuthService.kt
import com.clerk.android.Clerk
import com.clerk.android.model.Session
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class AuthService(private val clerk: Clerk) {

    suspend fun signIn(email: String, password: String): Result<Session> {
        return try {
            val result = clerk.signIn.create(email, password)

            if (result.status == SignInStatus.COMPLETE) {
                Result.success(result.session!!)
            } else {
                Result.failure(Exception("Sign in incomplete"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getToken(): String? {
        return clerk.session?.getToken()
    }

    val isAuthenticated: Flow<Boolean> = clerk.session.map { it != null }
}
```

**API Service**:
```kotlin
// services/APIService.kt
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*

class APIService(
    private val authService: AuthService,
    private val baseUrl: String = "https://api.lalisure.com"
) {
    private val client = HttpClient()

    suspend inline fun <reified T> fetchWithAuth(endpoint: String): T {
        val token = authService.getToken()
            ?: throw IllegalStateException("Not authenticated")

        return client.get("$baseUrl$endpoint") {
            headers {
                append(HttpHeaders.Authorization, "Bearer $token")
                append(HttpHeaders.ContentType, "application/json")
            }
        }.body()
    }

    suspend fun getPolicies(): List<Policy> {
        data class TRPCResponse(val result: ResultData) {
            data class ResultData(val data: List<Policy>)
        }

        val response = fetchWithAuth<TRPCResponse>("/api/trpc/policy.getUserPolicies")
        return response.result.data
    }
}
```

---

## Security Best Practices

### 1. **Token Storage**

#### ✅ SECURE Storage

**Mobile Apps**:
- **iOS**: Use Keychain Services
- **Android**: Use EncryptedSharedPreferences or Keystore
- **React Native**: Use expo-secure-store or react-native-keychain
- **Flutter**: Use flutter_secure_storage

**Never**:
- ❌ AsyncStorage (React Native)
- ❌ localStorage (Web views)
- ❌ SharedPreferences (Android, unencrypted)
- ❌ UserDefaults (iOS)
- ❌ Plain text files

#### Example: Secure Token Storage

```typescript
// ✅ CORRECT - React Native
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('auth_token', token);

// ❌ WRONG - React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('auth_token', token); // INSECURE!
```

### 2. **Token Transmission**

#### ✅ SECURE Transmission

```typescript
// ✅ CORRECT - HTTPS only
const response = await fetch('https://api.lalisure.com/api/trpc/...', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// ❌ WRONG - HTTP (unencrypted)
const response = await fetch('http://api.lalisure.com/api/trpc/...', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
}); // Token transmitted in plain text!
```

**Enforce HTTPS**:
```typescript
// React Native - Network Security Config
// android/app/src/main/res/xml/network_security_config.xml
<network-security-config>
  <domain-config cleartextTrafficPermitted="false">
    <domain includeSubdomains="true">api.lalisure.com</domain>
  </domain-config>
</network-security-config>
```

```swift
// iOS - App Transport Security
// Info.plist
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
</dict>
```

### 3. **Token Validation**

**Always validate tokens on the server**:

```typescript
// ✅ CORRECT - Server validates every request
// src/middleware.ts
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth(); // Validates with Clerk
  if (!userId) {
    return NextResponse.redirect(signInUrl);
  }
});

// ❌ WRONG - Client-side only validation
// Mobile app
if (token && !isExpired(token)) {
  // Assumes token is valid without server check
  fetchData(); // INSECURE!
}
```

### 4. **Token Expiration**

**Implement automatic token refresh**:

```typescript
// Customer (Clerk handles this automatically)
const { getToken } = useAuth();

// Token is automatically refreshed if expired
const token = await getToken();

// Staff (Manual refresh needed)
class StaffAuthService {
  private static async refreshToken(): Promise<string> {
    const currentToken = await this.getToken();

    const response = await fetch('/api/staff/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    const { token } = await response.json();
    await this.storeToken(token);
    return token;
  }

  static async getValidToken(): Promise<string> {
    const token = await this.getToken();

    // Check if token is expired (decode JWT)
    const decoded = this.decodeToken(token);
    const now = Date.now() / 1000;

    if (decoded.exp < now + 300) { // Refresh 5 min before expiry
      return await this.refreshToken();
    }

    return token;
  }
}
```

### 5. **Role-Based Access Control**

**Validate permissions on server**:

```typescript
// ✅ CORRECT - Server enforces RBAC
// src/server/api/trpc.ts
const enforceUserHasRole = (requiredRole: UserRole) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.CUSTOMER]: 1,
      [UserRole.AGENT]: 2,
      [UserRole.UNDERWRITER]: 3,
      [UserRole.ADMIN]: 4,
    };

    if (roleHierarchy[ctx.user.role] < roleHierarchy[requiredRole]) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next({ ctx });
  });

export const adminProcedure = t.procedure.use(enforceUserHasRole(UserRole.ADMIN));

// ❌ WRONG - Client-side only RBAC
// Mobile app
if (user.role === 'ADMIN') {
  // Shows admin UI, but doesn't enforce on server
  <AdminPanel /> // INSECURE!
}
```

### 6. **Network Security**

**Certificate Pinning** (Advanced):

```swift
// iOS - Certificate Pinning
import Alamofire

let evaluators: [String: ServerTrustEvaluating] = [
    "api.lalisure.com": PinnedCertificatesTrustEvaluator()
]

let manager = Session(
    serverTrustManager: ServerTrustManager(evaluators: evaluators)
)
```

```kotlin
// Android - Certificate Pinning
val certificatePinner = CertificatePinner.Builder()
    .add("api.lalisure.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
    .build()

val client = OkHttpClient.Builder()
    .certificatePinner(certificatePinner)
    .build()
```

### 7. **Data Encryption at Rest**

**Encrypt sensitive data**:

```typescript
// React Native
import * as Crypto from 'expo-crypto';

async function encryptData(data: string): Promise<string> {
  const key = await SecureStore.getItemAsync('encryption_key');
  // Use AES-256-GCM encryption
  const encrypted = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data + key
  );
  return encrypted;
}
```

### 8. **Prevent Token Leakage**

**Never log tokens**:

```typescript
// ❌ WRONG
console.log('Token:', token); // Token in logs!
analytics.track('API Call', { token }); // Token sent to analytics!

// ✅ CORRECT
console.log('Token length:', token.length); // Safe
analytics.track('API Call', {
  userId: user.id, // Use user ID instead
  timestamp: Date.now()
});
```

**Prevent clipboard access**:

```typescript
// React Native
import Clipboard from '@react-native-clipboard/clipboard';

// ❌ WRONG
Clipboard.setString(token); // Token in clipboard history!

// ✅ CORRECT - Never copy tokens to clipboard
```

### 9. **Biometric Authentication** (Optional Enhancement)

```typescript
// React Native
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticateWithBiometrics(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to access Lalisure',
    fallbackLabel: 'Use passcode',
  });

  return result.success;
}

// Use before retrieving token
if (await authenticateWithBiometrics()) {
  const token = await StaffAuthService.getToken();
  // Proceed with request
}
```

### 10. **Secure Development Checklist**

- [ ] HTTPS only (no HTTP)
- [ ] Certificate pinning (production)
- [ ] Secure token storage (Keychain/Keystore)
- [ ] No tokens in logs
- [ ] No tokens in analytics
- [ ] No tokens in clipboard
- [ ] Server-side token validation
- [ ] Server-side RBAC enforcement
- [ ] Token expiration handling
- [ ] Automatic token refresh
- [ ] Biometric authentication (optional)
- [ ] Network security config (Android)
- [ ] App Transport Security (iOS)
- [ ] ProGuard/R8 obfuscation (Android)
- [ ] Bitcode enabled (iOS)
- [ ] Root/Jailbreak detection

---

## Error Handling

### Common Errors & Solutions

#### 1. **401 Unauthorized**

**Causes**:
- Token expired
- Token invalid/malformed
- User not authenticated

**Handling**:
```typescript
class APIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

async function handleAPIRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AuthService.logout();
      navigation.navigate('Login');
      throw new APIError(401, 'Session expired. Please log in again.');
    }
    throw error;
  }
}
```

#### 2. **403 Forbidden**

**Causes**:
- Insufficient permissions
- Wrong role for endpoint
- Account suspended

**Handling**:
```typescript
if (error.response?.status === 403) {
  Alert.alert(
    'Access Denied',
    'You do not have permission to perform this action.',
    [{ text: 'OK' }]
  );
  navigation.goBack();
}
```

#### 3. **Network Errors**

**Causes**:
- No internet connection
- API server down
- Timeout

**Handling**:
```typescript
import NetInfo from '@react-native-community/netinfo';

async function fetchWithRetry<T>(
  request: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      return await request();
    } catch (error) {
      if (i === retries - 1) throw error;

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  throw new Error('Max retries exceeded');
}
```

#### 4. **Token Refresh Failures**

**Handling**:
```typescript
class StaffAuthService {
  private static isRefreshing = false;
  private static refreshSubscribers: Array<(token: string) => void> = [];

  private static subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private static onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  static async getValidToken(): Promise<string> {
    const token = await this.getToken();

    if (!token) {
      throw new Error('No token available');
    }

    const decoded = this.decodeToken(token);
    const now = Date.now() / 1000;

    // Token still valid
    if (decoded.exp > now + 300) {
      return token;
    }

    // Token refresh already in progress
    if (this.isRefreshing) {
      return new Promise<string>(resolve => {
        this.subscribeTokenRefresh(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshToken();
      this.onTokenRefreshed(newToken);
      return newToken;
    } catch (error) {
      // Refresh failed - logout user
      await this.logout();
      throw new Error('Session expired. Please log in again.');
    } finally {
      this.isRefreshing = false;
    }
  }
}
```

### Error Response Format

All API errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

**Common Error Codes**:

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `TIMEOUT` | 408 | Request timeout |

---

## Token Management

### Token Lifecycle

```
┌─────────────┐
│ User Login  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Generate Token   │  Expiry: 24h (staff) / 1h (customer, auto-refresh)
│ Store Securely   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Make API Request │◄─────────┐
└──────┬───────────┘           │
       │                       │
       ▼                       │
┌──────────────────┐           │
│ Token Expired?   │───No─────┘
└──────┬───────────┘
       │ Yes
       ▼
┌──────────────────┐
│ Refresh Token    │
└──────┬───────────┘
       │ Success
       ▼
┌──────────────────┐
│ New Token Stored │
└──────┬───────────┘
       │
       │ Failure
       ▼
┌──────────────────┐
│ Logout User      │
│ Navigate to Auth │
└──────────────────┘
```

### Token Decode Utility

```typescript
// utils/jwt.ts
interface JWTPayload {
  exp: number;
  iat: number;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function decodeJWT(token: string): JWTPayload {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    );

    return decoded;
  } catch (error) {
    throw new Error('Failed to decode token');
  }
}

export function isTokenExpired(token: string, bufferSeconds = 300): boolean {
  try {
    const decoded = decodeJWT(token);
    const now = Date.now() / 1000;
    return decoded.exp < now + bufferSeconds;
  } catch {
    return true;
  }
}

export function getTokenExpiryDate(token: string): Date | null {
  try {
    const decoded = decodeJWT(token);
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}
```

### Token Rotation Strategy

**Customer Tokens (Clerk)**:
- Clerk handles rotation automatically
- Tokens refresh when `getToken()` is called
- No manual intervention needed

**Staff Tokens (Custom JWT)**:
- 24-hour lifetime
- Manual refresh required (recommended: implement refresh endpoint)
- User must re-authenticate after 24 hours

**Recommended Implementation**:

```typescript
// Server: Add refresh endpoint
// src/app/api/staff/refresh/route.ts
export async function POST(request: NextRequest) {
  const session = await getStaffSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if token is close to expiry
  const now = Date.now();
  const expiryTime = session.expires.getTime();
  const timeUntilExpiry = expiryTime - now;

  // Only refresh if less than 1 hour remaining
  if (timeUntilExpiry > 60 * 60 * 1000) {
    return NextResponse.json({
      message: 'Token still valid',
      requiresRefresh: false
    });
  }

  // Generate new token
  const newToken = await createStaffToken(session.user);

  const response = NextResponse.json({
    success: true,
    requiresRefresh: true
  });

  // Set new token in cookie
  response.cookies.set('staff-session', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
    path: '/',
  });

  return response;
}
```

---

## Testing & Debugging

### Test Authentication Flows

#### 1. **Customer Authentication Test** (Jest + React Native Testing Library)

```typescript
// __tests__/auth/CustomerAuth.test.tsx
import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useCurrentUser } from '../hooks/useCurrentUser';

jest.mock('@clerk/clerk-expo');

describe('Customer Authentication', () => {
  it('should authenticate customer with valid credentials', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({
      status: 'complete',
      createdSessionId: 'session_123',
    });

    (useAuth as jest.Mock).mockReturnValue({
      signIn: { create: mockSignIn },
      setActive: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.signIn.create).toBeDefined();
    });

    const signInResult = await result.current.signIn.create({
      identifier: 'customer@example.com',
      password: 'Password123!',
    });

    expect(signInResult.status).toBe('complete');
    expect(mockSignIn).toHaveBeenCalledWith({
      identifier: 'customer@example.com',
      password: 'Password123!',
    });
  });

  it('should handle invalid credentials', async () => {
    const mockSignIn = jest.fn().mockRejectedValue(
      new Error('Invalid credentials')
    );

    (useAuth as jest.Mock).mockReturnValue({
      signIn: { create: mockSignIn },
    });

    const { result } = renderHook(() => useAuth());

    await expect(
      result.current.signIn.create({
        identifier: 'customer@example.com',
        password: 'WrongPassword',
      })
    ).rejects.toThrow('Invalid credentials');
  });
});
```

#### 2. **Staff Authentication Test**

```typescript
// __tests__/auth/StaffAuth.test.ts
import { StaffAuthService } from '../services/staffAuth';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

global.fetch = jest.fn();

describe('Staff Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate staff with valid credentials', async () => {
    const mockUser = {
      id: 'user_123',
      email: 'agent@lalisure.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'AGENT',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, user: mockUser }),
      headers: new Headers({ 'X-Staff-Token': 'jwt_token_123' }),
    });

    const user = await StaffAuthService.login({
      email: 'agent@lalisure.com',
      password: 'Password123!',
    });

    expect(user).toEqual(mockUser);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'staff_jwt_token',
      'jwt_token_123'
    );
  });

  it('should handle login failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    await expect(
      StaffAuthService.login({
        email: 'agent@lalisure.com',
        password: 'WrongPassword',
      })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should validate token expiry', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjkwMDAwMDB9.signature';

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(expiredToken);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const isAuth = await StaffAuthService.isAuthenticated();
    expect(isAuth).toBe(false);
  });
});
```

#### 3. **API Request Test**

```typescript
// __tests__/api/PolicyAPI.test.ts
import { useTRPC } from '../utils/trpc';
import { renderHook } from '@testing-library/react-native';

jest.mock('@clerk/clerk-expo');

describe('Policy API', () => {
  it('should fetch user policies with authentication', async () => {
    const mockPolicies = [
      {
        id: 'policy_1',
        policyNumber: 'POL-2025-001',
        type: 'AUTO',
        status: 'ACTIVE',
      },
    ];

    const mockGetToken = jest.fn().mockResolvedValue('clerk_jwt_token');

    (useAuth as jest.Mock).mockReturnValue({
      getToken: mockGetToken,
      isSignedIn: true,
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: { data: mockPolicies }
      }),
    });

    const { result } = renderHook(() => useTRPC());
    const policies = await result.current.policy.getUserPolicies.query();

    expect(policies).toEqual(mockPolicies);
    expect(mockGetToken).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/trpc'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer clerk_jwt_token',
        }),
      })
    );
  });

  it('should handle unauthorized requests', async () => {
    const mockGetToken = jest.fn().mockResolvedValue(null);

    (useAuth as jest.Mock).mockReturnValue({
      getToken: mockGetToken,
      isSignedIn: false,
    });

    const { result } = renderHook(() => useTRPC());

    await expect(
      result.current.policy.getUserPolicies.query()
    ).rejects.toThrow();
  });
});
```

### Debugging Tools

#### 1. **Network Debugging** (React Native)

**Reactotron Setup**:
```typescript
// ReactotronConfig.ts
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';

Reactotron
  .configure({
    name: 'Lalisure Mobile',
  })
  .useReactNative({
    networking: {
      ignoreUrls: /symbolicate|127.0.0.1/,
    },
  })
  .use(reactotronRedux())
  .connect();

// Log API requests
Reactotron.log('API Request', {
  url: '/api/trpc/policy.getUserPolicies',
  method: 'POST',
  hasToken: !!token,
});
```

**Flipper Network Plugin**:
```bash
# Install Flipper
brew install --cask flipper

# Add to React Native app
npm install react-native-flipper --save-dev

# View network requests in Flipper UI
```

#### 2. **Authentication State Debugging**

```typescript
// utils/AuthDebugger.ts
export class AuthDebugger {
  static logAuthState(context: string) {
    if (__DEV__) {
      console.group(`🔐 Auth State - ${context}`);

      // Customer auth
      const { isSignedIn, userId } = useAuth();
      console.log('Clerk Auth:', { isSignedIn, userId });

      // Staff auth
      StaffAuthService.getToken().then(token => {
        console.log('Staff Token:', token ? 'Present' : 'None');
        if (token) {
          const decoded = decodeJWT(token);
          console.log('Token Expiry:', new Date(decoded.exp * 1000));
          console.log('Token User:', decoded.user);
        }
      });

      console.groupEnd();
    }
  }
}

// Usage in components
useEffect(() => {
  AuthDebugger.logAuthState('Dashboard Mount');
}, []);
```

#### 3. **API Request Interceptor**

```typescript
// utils/APIDebugger.ts
export function debugAPIRequest(
  url: string,
  options: RequestInit,
  response: Response
) {
  if (__DEV__) {
    console.group(`📡 API Request - ${url}`);
    console.log('Method:', options.method || 'GET');
    console.log('Headers:', options.headers);
    console.log('Status:', response.status, response.statusText);
    console.log('Response:', response);
    console.groupEnd();
  }
}

// Wrap fetch
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  const response = await originalFetch(url, options);
  debugAPIRequest(url.toString(), options || {}, response);
  return response;
};
```

### Postman/Insomnia Collections

**Customer API Collection**:
```json
{
  "info": {
    "name": "Lalisure Customer API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{clerk_jwt}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Get User Policies",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/trpc/policy.getUserPolicies",
          "host": ["{{base_url}}"],
          "path": ["api", "trpc", "policy.getUserPolicies"]
        }
      }
    }
  ]
}
```

**Staff API Collection**:
```json
{
  "info": {
    "name": "Lalisure Staff API"
  },
  "item": [
    {
      "name": "Staff Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"agent@lalisure.com\",\n  \"password\": \"Password123!\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/staff/login",
          "host": ["{{base_url}}"],
          "path": ["api", "staff", "login"]
        }
      }
    },
    {
      "name": "Get Staff Claims",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{staff_jwt}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/trpc/claim.getAgentClaims",
          "host": ["{{base_url}}"],
          "path": ["api", "trpc", "claim.getAgentClaims"]
        }
      }
    }
  ]
}
```

---

## Conclusion

This guide provides comprehensive documentation for implementing authentication in mobile and external applications consuming the Lalisure Insurance Platform API.

### Key Takeaways

1. **Two Authentication Systems**: Customer (Clerk JWT) and Staff (Custom JWT)
2. **User → API → Auth Provider**: All authentication flows through your API middleware
3. **Secure Token Storage**: Always use platform-specific secure storage
4. **HTTPS Only**: Never transmit tokens over HTTP
5. **Server-Side Validation**: Never trust client-side validation alone
6. **Role-Based Access Control**: Enforced at middleware and procedure levels
7. **Token Expiration**: Implement automatic refresh for seamless UX

### Next Steps

- [ ] Choose your mobile framework (React Native, Flutter, native)
- [ ] Implement authentication service
- [ ] Configure secure token storage
- [ ] Set up API client with automatic token injection
- [ ] Implement error handling and retry logic
- [ ] Add biometric authentication (optional)
- [ ] Test authentication flows
- [ ] Deploy with certificate pinning (production)

### Support & Resources

- **API Base URL**: `https://api.lalisure.com`
- **Clerk Documentation**: https://clerk.com/docs
- **TRPC Documentation**: https://trpc.io/docs
- **Security Best Practices**: [authentication-flow-security-analysis.md](./authentication-flow-security-analysis.md)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-07
**Author**: Technical Documentation Team
**Classification**: Internal/Partner Use
