# Lalisure Mobile API Documentation

## Overview
Lalisure provides a comprehensive RESTful API built with tRPC for mobile applications. This document outlines the available endpoints, authentication methods, and integration guidelines for mobile developers.

## Base URL
- **Development**: `http://localhost:3002`
- **Production**: TBD (Configure in production environment)

## API Architecture
- **Framework**: Next.js 15.5.0 with tRPC
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Clerk with JWT tokens
- **File Upload**: UploadThing
- **Payments**: Paystack integration

## Authentication

### Authentication Provider: Clerk
- **Sign In URL**: `/sign-in`
- **Sign Up URL**: `/sign-up` 
- **After Sign In**: `/dashboard`
- **After Sign Up**: `/onboarding`

### Mobile Authentication Setup
1. **Install Clerk SDK**: Use appropriate Clerk mobile SDK for your platform
2. **Configure Keys**:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cXVhbGl0eS1hbHBhY2EtNDkuY2xlcmsuYWNjb3VudHMuZGV2JA
   CLERK_SECRET_KEY=sk_test_nFeCcMkI90oU5e5x5mHpTwpB90D7caUphfPdRukd4W
   ```
3. **JWT Token**: Include in Authorization header for protected endpoints
   ```
   Authorization: Bearer <clerk_jwt_token>
   ```

## API Endpoints

### Base Path
All API calls should be made to: `/api/trpc/[router].[procedure]`

## 🔐 Authentication & User Management

### User Router (`/api/trpc/user.*`)

#### 1. Get User Profile
- **Endpoint**: `GET /api/trpc/user.getProfile`
- **Auth**: Required (Protected)
- **Response**: Current user's profile information
```json
{
  "id": "string",
  "clerkId": "string", 
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "avatar": "string",
  "role": "CUSTOMER|AGENT|UNDERWRITER|ADMIN",
  "createdAt": "date",
  "updatedAt": "date"
}
```

#### 2. Create Profile
- **Endpoint**: `POST /api/trpc/user.createProfile`
- **Auth**: Public
- **Input**:
```json
{
  "clerkId": "string",
  "email": "string",
  "firstName": "string?",
  "lastName": "string?"
}
```

#### 3. Update Profile  
- **Endpoint**: `POST /api/trpc/user.updateProfile`
- **Auth**: Required (Protected)
- **Input**:
```json
{
  "firstName": "string?",
  "lastName": "string?", 
  "phone": "string?",
  "avatar": "string?"
}
```

#### 4. Dashboard Statistics
- **Endpoint**: `GET /api/trpc/user.getDashboardStats`
- **Auth**: Required (Protected)
- **Response**:
```json
{
  "policiesCount": "number",
  "claimsCount": "number",
  "activePoliciesCount": "number"
}
```

## 📋 Policy Management

### Policy Router (`/api/trpc/policy.*`)

#### 1. Get All Policies
- **Endpoint**: `GET /api/trpc/policy.getAll`
- **Auth**: Required (Protected)
- **Query Parameters**:
```json
{
  "filters": {
    "type": "AUTO|HOME|HEALTH|LIFE?",
    "status": "DRAFT|PENDING|ACTIVE|EXPIRED|CANCELLED?",
    "search": "string?",
    "minPremium": "number?",
    "maxPremium": "number?"
  },
  "limit": "number (1-100, default: 10)",
  "cursor": "string?"
}
```

#### 2. Get Policy by ID
- **Endpoint**: `GET /api/trpc/policy.getById`
- **Auth**: Required (Protected)
- **Input**: `{ "id": "string" }`

#### 3. Create Policy
- **Endpoint**: `POST /api/trpc/policy.create`
- **Auth**: Required (Protected)
- **Input**: Policy creation schema with coverage details

#### 4. Generate Quote (Public)
- **Endpoint**: `POST /api/trpc/policy.generateQuote`
- **Auth**: Required (Protected)
- **Input**:
```json
{
  "type": "AUTO|HOME|HEALTH|LIFE",
  "coverage": {
    "liability": "number",
    "comprehensive": "number"
  },
  "riskFactors": {
    "age": "number",
    "location": "string?"
  },
  "deductible": "number"
}
```

## 🎯 Claims Management

### Claim Router (`/api/trpc/claim.*`)

#### 1. Get All Claims
- **Endpoint**: `GET /api/trpc/claim.getAll`
- **Auth**: Required (Protected)
- **Query Parameters**: Similar filtering to policies

#### 2. Create Claim
- **Endpoint**: `POST /api/trpc/claim.create`
- **Auth**: Required (Protected)

#### 3. Get Claim by ID
- **Endpoint**: `GET /api/trpc/claim.getById`
- **Auth**: Required (Protected)

## 💰 Payment Processing

### Payment Router (`/api/trpc/payment.*`)

#### 1. Create Payment Intent
- **Endpoint**: `POST /api/trpc/payment.createPaymentIntent`
- **Auth**: Required (Protected)

#### 2. Get Payment Status
- **Endpoint**: `GET /api/trpc/payment.getStatus`
- **Auth**: Required (Protected)

## 🔔 Notifications

### Notification Router (`/api/trpc/notification.*`)

#### 1. Get Notifications
- **Endpoint**: `GET /api/trpc/notification.getAll`
- **Auth**: Required (Protected)

#### 2. Mark as Read
- **Endpoint**: `POST /api/trpc/notification.markAsRead`
- **Auth**: Required (Protected)

## tRPC Request Format

### Query Procedures (GET)
```
GET /api/trpc/[router].[procedure]?batch=1&input={"0":{"json":{...params}}}
```

### Mutation Procedures (POST)
```
POST /api/trpc/[router].[procedure]
Content-Type: application/json

[{"json": {...params}}]
```

### Batch Requests
tRPC supports batching multiple requests:
```json
[
  {"json": {"id": "policy1"}},
  {"json": {"id": "policy2"}}
]
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "json": {
      "message": "Error message",
      "code": -32001,
      "data": {
        "code": "UNAUTHORIZED|FORBIDDEN|NOT_FOUND|VALIDATION_ERROR",
        "httpStatus": 401,
        "stack": "...",
        "path": "router.procedure",
        "zodError": null
      }
    }
  }
}
```

### Common HTTP Status Codes
- `200`: Success
- `401`: Unauthorized (missing/invalid authentication)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `405`: Method Not Allowed (GET on mutation, POST on query)
- `422`: Validation Error (invalid input)
- `500`: Internal Server Error

## Role-Based Access Control

### User Roles (Hierarchical)
1. **CUSTOMER** (Level 1): Basic user operations
2. **AGENT** (Level 2): Customer operations + agent functions
3. **UNDERWRITER** (Level 3): Agent operations + underwriting
4. **ADMIN** (Level 4): Full system access

### Protected Procedures
- **protectedProcedure**: Requires any authenticated user
- **agentProcedure**: Requires AGENT role or higher
- **underwriterProcedure**: Requires UNDERWRITER role or higher
- **adminProcedure**: Requires ADMIN role

## File Uploads

### UploadThing Integration
- **Endpoint**: `/api/uploadthing`
- **Auth**: Required
- **Use**: Document uploads for claims, policy documents

## Webhook Endpoints (Internal)

### Clerk Webhooks
- **Endpoint**: `/api/webhooks/clerk`
- **Purpose**: User lifecycle management

### Payment Webhooks  
- **Paystack**: `/api/webhooks/paystack`
- **Stripe** (Legacy): `/api/webhooks/stripe`

## Development Environment

### Required Environment Variables
```env
# Database
DATABASE_URL="mongodb+srv://..."

# Clerk Authentication  
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Payments
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...

# Other services
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
WHAT3WORDS_API_KEY=
```

### Testing
- **Server**: `npm run dev` (runs on port 3000/3002)
- **Build**: `npm run build`
- **Test**: `npm run test:e2e` for end-to-end tests

## Mobile Integration Examples

### React Native with tRPC
```javascript
import { createTRPCReact } from '@trpc/react-query';
import { AppRouter } from './path-to-server/api/root';

export const trpc = createTRPCReact<AppRouter>();

// Query example
const { data: profile } = trpc.user.getProfile.useQuery();

// Mutation example  
const createPolicy = trpc.policy.create.useMutation();
```

### HTTP Client Example (Fetch)
```javascript
// GET Query
const response = await fetch(
  'http://localhost:3002/api/trpc/user.getProfile?batch=1&input={"0":{"json":null}}',
  {
    headers: {
      'Authorization': `Bearer ${clerkJWT}`,
      'Content-Type': 'application/json'
    }
  }
);

// POST Mutation
const response = await fetch(
  'http://localhost:3002/api/trpc/user.updateProfile',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clerkJWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      "json": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }])
  }
);
```

## API Testing Status ✅

- **Authentication**: Working (Clerk integration functional)
- **tRPC Endpoints**: Working (proper query/mutation handling)
- **Error Handling**: Working (structured error responses)
- **Role-based Access**: Working (middleware enforces permissions)
- **TypeScript**: Working (full type safety)

## Support & Contact

For API issues or questions, please refer to:
- **Source Code**: Located in `src/server/api/routers/`
- **Environment**: Configure in `.env` file
- **Documentation**: This file serves as the primary reference

---

**Last Updated**: September 1, 2025
**API Version**: 1.0
**tRPC Version**: 11.0.0
**Next.js Version**: 15.5.0