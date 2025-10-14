# Lalisure Mobile API Documentation

## Overview

Lalisure provides a comprehensive RESTful API built with tRPC for mobile applications. This document outlines the available endpoints, authentication methods, and integration guidelines for mobile developers.

## 📋 Table of Contents

- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Authentication & User Management](#authentication--user-management)
- [Agent Settings Management](#agent-settings-management)
- [Policy Management](#policy-management)
- [Claims Management](#claims-management)
- [Payment Processing](#payment-processing)
- [Notifications](#notifications)
- [tRPC Request Format](#trpc-request-format)
- [Error Handling](#error-handling)
- [Role-Based Access Control](#role-based-access-control)
- [File Uploads](#file-uploads)
- [Webhook Endpoints](#webhook-endpoints)
- [Development Environment](#development-environment)
- [Mobile Integration Examples](#mobile-integration-examples)
- [Comprehensive API Examples](#comprehensive-api-examples)
- [South African Data Constants](#south-african-data-constants)
- [Premium Calculation Examples](#premium-calculation-examples)
- [API Testing Status](#api-testing-status)
- [Support & Contact](#support--contact)

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

## 👨‍💼 Agent Settings Management

### Agent Settings Router (`/api/trpc/agentSettings.*`)

#### 1. Get Agent Settings

- **Endpoint**: `GET /api/trpc/agentSettings.getSettings`
- **Auth**: Required (Agent or higher)
- **Response**: Current agent's settings and preferences

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "agentCode": "string",
  "licenseNumber": "string",
  "commissionRate": "number",
  "address": {
    "street": "string",
    "city": "string",
    "province": "string",
    "postalCode": "string",
    "country": "string"
  },
  "preferences": {
    "emailNotifications": "boolean",
    "smsNotifications": "boolean",
    "weeklyReports": "boolean",
    "autoFollowUp": "boolean",
    "timezone": "string",
    "language": "string"
  },
  "workingHours": {
    "monday": { "enabled": "boolean", "start": "string", "end": "string" },
    "tuesday": { "enabled": "boolean", "start": "string", "end": "string" },
    "wednesday": { "enabled": "boolean", "start": "string", "end": "string" },
    "thursday": { "enabled": "boolean", "start": "string", "end": "string" },
    "friday": { "enabled": "boolean", "start": "string", "end": "string" },
    "saturday": { "enabled": "boolean", "start": "string", "end": "string" },
    "sunday": { "enabled": "boolean", "start": "string", "end": "string" }
  }
}
```

#### 2. Update Agent Settings

- **Endpoint**: `POST /api/trpc/agentSettings.updateSettings`
- **Auth**: Required (Agent or higher)
- **Input**:

```json
{
  "firstName": "string?",
  "lastName": "string?",
  "phone": "string?",
  "agentCode": "string?",
  "licenseNumber": "string?",
  "commissionRate": "number?",
  "address": {
    "street": "string?",
    "city": "string?",
    "province": "string?",
    "postalCode": "string?",
    "country": "string?"
  },
  "preferences": {
    "emailNotifications": "boolean?",
    "smsNotifications": "boolean?",
    "weeklyReports": "boolean?",
    "autoFollowUp": "boolean?",
    "timezone": "string?",
    "language": "string?"
  },
  "workingHours": {
    "monday": { "enabled": "boolean?", "start": "string?", "end": "string?" },
    "tuesday": { "enabled": "boolean?", "start": "string?", "end": "string?" },
    "wednesday": {
      "enabled": "boolean?",
      "start": "string?",
      "end": "string?"
    },
    "thursday": { "enabled": "boolean?", "start": "string?", "end": "string?" },
    "friday": { "enabled": "boolean?", "start": "string?", "end": "string?" },
    "saturday": { "enabled": "boolean?", "start": "string?", "end": "string?" },
    "sunday": { "enabled": "boolean?", "start": "string?", "end": "string?" }
  }
}
```

#### 3. Check Agent Code Availability

- **Endpoint**: `GET /api/trpc/agentSettings.checkAgentCode`
- **Auth**: Required (Agent or higher)
- **Input**: `{ "agentCode": "string" }`
- **Response**:

```json
{
  "available": "boolean",
  "message": "string"
}
```

#### 4. Get All Agents

- **Endpoint**: `GET /api/trpc/agentSettings.getAllAgents`
- **Auth**: Required (Admin only)
- **Response**: Array of agent information

```json
[
  {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "agentCode": "string",
    "licenseNumber": "string",
    "commissionRate": "number",
    "createdAt": "date"
  }
]
```

## 📋 Policy Management

### Policy Router (`/api/trpc/policy.*`)

#### 1. Get User Policies

- **Endpoint**: `GET /api/trpc/policy.getUserPolicies`
- **Auth**: Required (Protected)
- **Query Parameters**:

```json
{
  "limit": "number (1-100, default: 10)",
  "offset": "number (default: 0)",
  "status": "DRAFT|PENDING_REVIEW|ACTIVE|EXPIRED|CANCELLED|SUSPENDED?",
  "sortBy": "createdAt|updatedAt|premium?",
  "sortOrder": "asc|desc?"
}
```

#### 2. Get Policy by ID

- **Endpoint**: `GET /api/trpc/policy.getPolicyById`
- **Auth**: Required (Protected)
- **Input**: `{ "policyId": "string" }`

#### 3. Create Policy

- **Endpoint**: `POST /api/trpc/policy.create`
- **Auth**: Required (Protected)
- **Input**: Enhanced policy creation schema with rural property support

```json
{
  "type": "HOME",
  "coverage": {
    "dwelling": "number",
    "personalProperty": "number",
    "liability": "number",
    "additionalLivingExpenses": "number"
  },
  "deductible": "number",
  "startDate": "date",
  "endDate": "date",
  "riskFactors": {
    "location": {
      "province": "WC|EC|NC|FS|KZN|NW|GP|MP|LP",
      "postalCode": "string",
      "ruralArea": "boolean",
      "distanceFromFireStation": "number?",
      "distanceFromPoliceStation": "number?"
    },
    "demographics": {
      "age": "number",
      "gender": "male|female|other?",
      "maritalStatus": "single|married|divorced|widowed?"
    },
    "personal": {
      "employmentStatus": "employed|self_employed|unemployed|retired|student?",
      "monthlyIncome": "number?",
      "claimsHistory": "number"
    }
  },
  "propertyInfo": {
    "address": "string",
    "city": "string",
    "province": "string",
    "postalCode": "string",
    "propertyType": "SINGLE_FAMILY|FARMHOUSE|RURAL_HOMESTEAD|COUNTRY_ESTATE|SMALLHOLDING|GAME_FARM_HOUSE|VINEYARD_HOUSE|MOUNTAIN_CABIN|COASTAL_COTTAGE|TOWNHOUSE|CONDO|APARTMENT",
    "buildYear": "number",
    "squareFeet": "number",
    "bedrooms": "number?",
    "bathrooms": "number?",
    "constructionType": "BRICK|STONE|CONCRETE|STEEL_FRAME|WOOD_FRAME|MIXED_CONSTRUCTION|TRADITIONAL_MUD|THATCH_ROOF?",
    "roofType": "TILE|THATCH|METAL|SLATE|SHINGLE|CONCRETE|CORRUGATED_IRON?",
    "foundationType": "CONCRETE_SLAB|CONCRETE_FOUNDATION|STONE_FOUNDATION|PIER_AND_BEAM|CRAWL_SPACE|BASEMENT?",
    "heatingType": "GAS|ELECTRIC|WOOD_BURNING|SOLAR|HEAT_PUMP|COAL|NONE?",
    "coolingType": "AIR_CONDITIONING|CEILING_FANS|EVAPORATIVE_COOLING|NONE?",
    "safetyFeatures": "string[]",
    "hasPool": "boolean",
    "hasGarage": "boolean",
    "garageSpaces": "number?",
    "hasFarmBuildings": "boolean",
    "hasLivestock": "boolean",
    "hasCrops": "boolean",
    "propertySize": "number?",
    "accessRoad": "TARRED|GRAVEL|DIRT|PRIVATE?"
  },
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "string",
    "phone": "string",
    "email": "string"
  }
}
```

#### 4. Save Draft Policy

- **Endpoint**: `POST /api/trpc/policy.saveDraft`
- **Auth**: Required (Protected)
- **Input**: Same as create policy but with `isDraft: true` and `completionPercentage: number`

#### 5. Get Draft Policies

- **Endpoint**: `GET /api/trpc/policy.getDrafts`
- **Auth**: Required (Protected)
- **Response**: Array of draft policies

#### 6. Convert Draft to Policy

- **Endpoint**: `POST /api/trpc/policy.convertDraftToPolicy`
- **Auth**: Required (Protected)
- **Input**:

```json
{
  "draftId": "string",
  "finalData": "CreatePolicyInput"
}
```

#### 7. Calculate Quote

- **Endpoint**: `POST /api/trpc/policy.calculateQuote`
- **Auth**: Required (Protected)
- **Input**: Same as create policy
- **Response**:

```json
{
  "quoteNumber": "string",
  "basePremium": "number",
  "adjustedPremium": "number",
  "riskMultiplier": "number",
  "breakdown": {
    "baseCoverage": "number",
    "riskAdjustment": "number",
    "locationFactor": "number",
    "ageFactor": "number",
    "discounts": "number"
  },
  "monthlyPremium": "number",
  "annualPremium": "number",
  "validUntil": "date",
  "coverage": "CoverageOptions",
  "deductible": "number"
}
```

#### 8. Check Quote Expiration

- **Endpoint**: `GET /api/trpc/policy.checkQuoteExpiration`
- **Auth**: Required (Protected)
- **Input**: `{ "quoteNumber": "string" }`
- **Response**:

```json
{
  "isExpired": "boolean",
  "expiresAt": "date",
  "daysRemaining": "number"
}
```

#### 9. Update Policy Status

- **Endpoint**: `POST /api/trpc/policy.updatePolicyStatus`
- **Auth**: Required (Agent or higher)
- **Input**:

```json
{
  "policyId": "string",
  "status": "PENDING_REVIEW|ACTIVE|EXPIRED|CANCELLED|SUSPENDED",
  "reason": "string?"
}
```

#### 10. Get Policy Statistics

- **Endpoint**: `GET /api/trpc/policy.getPolicyStats`
- **Auth**: Required (Protected)
- **Response**:

```json
{
  "total": "number",
  "active": "number",
  "draft": "number",
  "expired": "number",
  "pendingReview": "number",
  "cancelled": "number",
  "suspended": "number"
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
[{ "json": { "id": "policy1" } }, { "json": { "id": "policy2" } }]
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

## 📱 Mobile Integration Examples

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

## 🔧 Comprehensive API Examples

### 1. User Management Examples

#### Get User Profile

```javascript
// Method: GET
// URL: /api/trpc/user.getProfile?batch=1&input={"0":{"json":null}}
// Headers: Authorization: Bearer <clerk_jwt_token>

const response = await fetch(
  'https://your-domain.com/api/trpc/user.getProfile?batch=1&input={"0":{"json":null}}',
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${clerkJWT}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
// Response: { "result": { "data": { "id": "user_123", "email": "user@example.com", ... } } }
```

#### Update User Profile

```javascript
// Method: POST
// URL: /api/trpc/user.updateProfile
// Headers: Authorization: Bearer <clerk_jwt_token>
// Body: [{"json": {...}}]

const updateData = {
  firstName: "John",
  lastName: "Doe",
  phone: "+27123456789",
};

const response = await fetch(
  "https://your-domain.com/api/trpc/user.updateProfile",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clerkJWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        json: updateData,
      },
    ]),
  }
);

const result = await response.json();
// Response: { "result": { "data": { "id": "user_123", "firstName": "John", ... } } }
```

### 2. Agent Settings Examples

#### Get Agent Settings

```javascript
// Method: GET
// URL: /api/trpc/agentSettings.getSettings?batch=1&input={"0":{"json":null}}
// Auth: Agent or higher

const response = await fetch(
  'https://your-domain.com/api/trpc/agentSettings.getSettings?batch=1&input={"0":{"json":null}}',
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${agentJWT}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
// Response: { "result": { "data": { "firstName": "Agent", "agentCode": "AGT001", ... } } }
```

#### Update Agent Settings

```javascript
// Method: POST
// URL: /api/trpc/agentSettings.updateSettings
// Auth: Agent or higher

const settingsData = {
  firstName: "John",
  lastName: "Smith",
  agentCode: "AGT001",
  commissionRate: 15.5,
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
};

const response = await fetch(
  "https://your-domain.com/api/trpc/agentSettings.updateSettings",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${agentJWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        json: settingsData,
      },
    ]),
  }
);

const result = await response.json();
// Response: { "result": { "data": { "firstName": "John", "agentCode": "AGT001", ... } } }
```

#### Check Agent Code Availability

```javascript
// Method: GET
// URL: /api/trpc/agentSettings.checkAgentCode?batch=1&input={"0":{"json":{"agentCode":"AGT001"}}}
// Auth: Agent or higher

const response = await fetch(
  'https://your-domain.com/api/trpc/agentSettings.checkAgentCode?batch=1&input={"0":{"json":{"agentCode":"AGT001"}}}',
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${agentJWT}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
// Response: { "result": { "data": { "available": true, "message": "Agent code is available" } } }
```

### 3. Policy Management Examples

#### Get User Policies

```javascript
// Method: GET
// URL: /api/trpc/policy.getUserPolicies?batch=1&input={"0":{"json":{"limit":10,"offset":0,"status":"ACTIVE"}}}
// Auth: Protected

const queryParams = {
  limit: 10,
  offset: 0,
  status: "ACTIVE",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const response = await fetch(
  `https://your-domain.com/api/trpc/policy.getUserPolicies?batch=1&input={"0":{"json":${JSON.stringify(
    queryParams
  )}}}`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
// Response: { "result": { "data": { "policies": [...], "total": 5, "hasMore": false } } }
```

#### Create Policy

```javascript
// Method: POST
// URL: /api/trpc/policy.create
// Auth: Protected

const policyData = {
  type: "HOME",
  coverage: {
    dwelling: 500000,
    personalProperty: 100000,
    liability: 300000,
    additionalLivingExpenses: 50000,
  },
  deductible: 2500,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
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
    propertyType: "SINGLE_FAMILY",
    buildYear: 2015,
    squareFeet: 2400,
    bedrooms: 3,
    bathrooms: 2.5,
    constructionType: "BRICK",
    roofType: "TILE",
    foundationType: "CONCRETE_SLAB",
    heatingType: "GAS",
    coolingType: "AIR_CONDITIONING",
    safetyFeatures: ["SMOKE_DETECTORS", "SECURITY_ALARM"],
    hasPool: false,
    hasGarage: true,
    garageSpaces: 2,
    hasFarmBuildings: false,
    hasLivestock: false,
    hasCrops: false,
    propertySize: 0.5,
    accessRoad: "TARRED",
  },
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1989-01-15",
    phone: "+27123456789",
    email: "john@example.com",
  },
};

const response = await fetch("https://your-domain.com/api/trpc/policy.create", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${userJWT}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify([
    {
      json: policyData,
    },
  ]),
});

const result = await response.json();
// Response: { "result": { "data": { "id": "policy_123", "policyNumber": "POL-HOME-001", ... } } }
```

#### Save Draft Policy

```javascript
// Method: POST
// URL: /api/trpc/policy.saveDraft
// Auth: Protected

const draftData = {
  ...policyData, // Same as create policy
  isDraft: true,
  completionPercentage: 75,
};

const response = await fetch(
  "https://your-domain.com/api/trpc/policy.saveDraft",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        json: draftData,
      },
    ]),
  }
);

const result = await response.json();
// Response: { "result": { "data": { "id": "draft_123", "status": "DRAFT", ... } } }
```

#### Get Draft Policies

```javascript
// Method: GET
// URL: /api/trpc/policy.getDrafts?batch=1&input={"0":{"json":null}}
// Auth: Protected

const response = await fetch(
  'https://your-domain.com/api/trpc/policy.getDrafts?batch=1&input={"0":{"json":null}}',
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
// Response: { "result": { "data": [{ "id": "draft_123", "status": "DRAFT", ... }] } }
```

#### Convert Draft to Policy

```javascript
// Method: POST
// URL: /api/trpc/policy.convertDraftToPolicy
// Auth: Protected

const convertData = {
  draftId: "draft_123",
  finalData: policyData, // Complete policy data
};

const response = await fetch(
  "https://your-domain.com/api/trpc/policy.convertDraftToPolicy",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        json: convertData,
      },
    ]),
  }
);

const result = await response.json();
// Response: { "result": { "data": { "id": "policy_123", "status": "PENDING_REVIEW", ... } } }
```

#### Calculate Quote

```javascript
// Method: POST
// URL: /api/trpc/policy.calculateQuote
// Auth: Protected

const quoteData = {
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
};

const response = await fetch(
  "https://your-domain.com/api/trpc/policy.calculateQuote",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        json: quoteData,
      },
    ]),
  }
);

const result = await response.json();
// Response: { "result": { "data": { "quoteNumber": "QUOTE-ABC123", "annualPremium": 2500, ... } } }
```

#### Check Quote Expiration

```javascript
// Method: GET
// URL: /api/trpc/policy.checkQuoteExpiration?batch=1&input={"0":{"json":{"quoteNumber":"QUOTE-ABC123"}}}
// Auth: Protected

const response = await fetch(
  'https://your-domain.com/api/trpc/policy.checkQuoteExpiration?batch=1&input={"0":{"json":{"quoteNumber":"QUOTE-ABC123"}}}',
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
// Response: { "result": { "data": { "isExpired": false, "expiresAt": "2024-02-15T10:30:00Z", "daysRemaining": 15 } } }
```

### 4. Claims Management Examples

#### Get User Claims

```javascript
// Method: GET
// URL: /api/trpc/claim.getUserClaims?batch=1&input={"0":{"json":{"limit":10,"offset":0,"status":"SUBMITTED"}}}
// Auth: Protected

const queryParams = {
  limit: 10,
  offset: 0,
  status: "SUBMITTED",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const response = await fetch(
  `https://your-domain.com/api/trpc/claim.getUserClaims?batch=1&input={"0":{"json":${JSON.stringify(
    queryParams
  )}}}`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
// Response: { "result": { "data": { "claims": [...], "total": 3 } } }
```

#### Submit Claim

```javascript
// Method: POST
// URL: /api/trpc/claim.submitClaim
// Auth: Protected

const claimData = {
  policyId: "policy_123",
  type: "FIRE_DAMAGE",
  description: "Kitchen fire caused by electrical malfunction",
  incidentDate: new Date("2024-01-15T10:30:00Z").toISOString(),
  location: "123 Main Street, Cape Town",
  what3words: "filled.count.soap",
  amount: 15000,
};

const response = await fetch(
  "https://your-domain.com/api/trpc/claim.submitClaim",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        json: claimData,
      },
    ]),
  }
);

const result = await response.json();
// Response: { "result": { "data": { "id": "claim_123", "claimNumber": "CLM-FIRE-001", ... } } }
```

### 5. Payment Processing Examples

#### Create Payment Intent

```javascript
// Method: POST
// URL: /api/trpc/payment.createPaymentIntent
// Auth: Protected

const paymentData = {
  policyId: "policy_123",
  amount: 1500,
  description: "Premium payment for policy POL-HOME-001",
};

const response = await fetch(
  "https://your-domain.com/api/trpc/payment.createPaymentIntent",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        json: paymentData,
      },
    ]),
  }
);

const result = await response.json();
// Response: { "result": { "data": { "authorization_url": "https://checkout.paystack.com/...", "reference": "ref_123456789" } } }
```

#### Verify Payment

```javascript
// Method: POST
// URL: /api/trpc/payment.verifyPayment
// Auth: Protected

const verifyData = {
  reference: "ref_123456789",
};

const response = await fetch(
  "https://your-domain.com/api/trpc/payment.verifyPayment",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        json: verifyData,
      },
    ]),
  }
);

const result = await response.json();
// Response: { "result": { "data": { "success": true, "transaction": {...} } } }
```

### 6. Notifications Examples

#### Get Notifications

```javascript
// Method: GET
// URL: /api/trpc/notification.getNotifications?batch=1&input={"0":{"json":{"limit":10,"offset":0,"unreadOnly":false}}}
// Auth: Protected

const queryParams = {
  limit: 10,
  offset: 0,
  unreadOnly: false,
};

const response = await fetch(
  `https://your-domain.com/api/trpc/notification.getNotifications?batch=1&input={"0":{"json":${JSON.stringify(
    queryParams
  )}}}`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
// Response: { "result": { "data": { "notifications": [...], "total": 5, "hasMore": false } } }
```

#### Mark Notification as Read

```javascript
// Method: POST
// URL: /api/trpc/notification.markAsRead
// Auth: Protected

const markReadData = {
  notificationId: "notif_123",
};

const response = await fetch(
  "https://your-domain.com/api/trpc/notification.markAsRead",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        json: markReadData,
      },
    ]),
  }
);

const result = await response.json();
// Response: { "result": { "data": { "id": "notif_123", "read": true, ... } } }
```

## 🔄 Batch Request Examples

### Multiple Queries in One Request

```javascript
// Method: GET
// URL: /api/trpc/user.getProfile,policy.getUserPolicies,notification.getUnreadCount?batch=1&input={"0":{"json":null},"1":{"json":{"limit":5}},"2":{"json":null}}

const response = await fetch(
  'https://your-domain.com/api/trpc/user.getProfile,policy.getUserPolicies,notification.getUnreadCount?batch=1&input={"0":{"json":null},"1":{"json":{"limit":5}},"2":{"json":null}}',
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
// Response: { "result": { "data": [profileData, policiesData, unreadCount] } }
```

## 🚨 Error Handling Examples

### Standard Error Response

```javascript
// When an error occurs, the response will be:
{
  "error": {
    "json": {
      "message": "Invalid input data",
      "code": -32001,
      "data": {
        "code": "VALIDATION_ERROR",
        "httpStatus": 422,
        "stack": "...",
        "path": "policy.create",
        "zodError": {
          "issues": [
            {
              "code": "invalid_type",
              "expected": "string",
              "received": "undefined",
              "path": ["propertyInfo", "address"],
              "message": "Property address is required"
            }
          ]
        }
      }
    }
  }
}
```

### Error Handling in Mobile App

```javascript
const handleApiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (data.error) {
      // Handle tRPC error
      const error = data.error.json;
      console.error("API Error:", error.message);

      switch (error.data.code) {
        case "UNAUTHORIZED":
          // Redirect to login
          break;
        case "FORBIDDEN":
          // Show access denied message
          break;
        case "VALIDATION_ERROR":
          // Show validation errors
          break;
        default:
          // Show generic error
          break;
      }
    } else {
      // Success
      return data.result.data;
    }
  } catch (error) {
    console.error("Network Error:", error);
    // Handle network errors
  }
};
```

## 🇿🇦 South African Data Constants

### Provinces

```javascript
// Available province codes for risk factors
const PROVINCES = [
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

### Property Types

```javascript
// Available property types for policy creation
const PROPERTY_TYPES = {
  // Urban Properties
  SINGLE_FAMILY: "Single Family Home",
  TOWNHOUSE: "Townhouse",
  CONDO: "Condominium",
  APARTMENT: "Apartment",

  // Rural Properties
  FARMHOUSE: "Farmhouse",
  RURAL_HOMESTEAD: "Rural Homestead",
  COUNTRY_ESTATE: "Country Estate",
  SMALLHOLDING: "Smallholding",
  GAME_FARM_HOUSE: "Game Farm House",
  VINEYARD_HOUSE: "Vineyard House",
  MOUNTAIN_CABIN: "Mountain Cabin",
  COASTAL_COTTAGE: "Coastal Cottage",
};
```

### Construction Types

```javascript
// Available construction types
const CONSTRUCTION_TYPES = {
  // Traditional
  BRICK: "Brick",
  STONE: "Stone",
  CONCRETE: "Concrete",
  WOOD_FRAME: "Wood Frame",

  // Rural
  STEEL_FRAME: "Steel Frame",
  TRADITIONAL_MUD: "Traditional Mud",
  THATCH_ROOF: "Thatch Roof",
  MIXED_CONSTRUCTION: "Mixed Construction",
};
```

### Safety Features

```javascript
// Available safety features
const SAFETY_FEATURES = {
  // Basic
  SMOKE_DETECTORS: "Smoke Detectors",
  SECURITY_ALARM: "Security Alarm",
  FIRE_EXTINGUISHERS: "Fire Extinguishers",

  // Advanced
  MONITORED_ALARM: "Monitored Alarm",
  SECURITY_CAMERAS: "Security Cameras",
  ELECTRIC_FENCING: "Electric Fencing",
  SECURITY_GATES: "Security Gates",
  SAFE_ROOM: "Safe Room",
  SPRINKLER_SYSTEM: "Sprinkler System",
  NONE: "None",
};
```

### Access Road Types

```javascript
// Available access road types
const ACCESS_ROAD_TYPES = {
  TARRED: "Tarred Road",
  GRAVEL: "Gravel Road",
  DIRT: "Dirt Road",
  PRIVATE: "Private Road",
};
```

## 📊 Premium Calculation Examples

### Rural Property Premium Calculation

```javascript
// Example: Farmhouse in Western Cape
const ruralPolicyData = {
  type: "HOME",
  coverage: {
    dwelling: 800000,
    personalProperty: 150000,
    liability: 500000,
    additionalLivingExpenses: 80000,
  },
  deductible: 5000,
  riskFactors: {
    location: {
      province: "WC",
      postalCode: "8001",
      ruralArea: true,
      distanceFromFireStation: 25,
      distanceFromPoliceStation: 20,
    },
    demographics: {
      age: 45,
      gender: "male",
      maritalStatus: "married",
    },
    personal: {
      employmentStatus: "self_employed",
      monthlyIncome: 35000,
      claimsHistory: 1,
    },
  },
  propertyInfo: {
    address: "Farm Road 123",
    city: "Stellenbosch",
    province: "WC",
    postalCode: "7600",
    propertyType: "FARMHOUSE",
    buildYear: 2010,
    squareFeet: 3500,
    bedrooms: 4,
    bathrooms: 3,
    constructionType: "BRICK",
    roofType: "THATCH",
    foundationType: "CONCRETE_SLAB",
    heatingType: "WOOD_BURNING",
    coolingType: "CEILING_FANS",
    safetyFeatures: ["ELECTRIC_FENCING", "SECURITY_CAMERAS", "MONITORED_ALARM"],
    hasPool: false,
    hasGarage: true,
    garageSpaces: 3,
    hasFarmBuildings: true,
    hasLivestock: true,
    hasCrops: false,
    propertySize: 5.5,
    accessRoad: "GRAVEL",
  },
};

// Expected premium calculation factors:
// - Base rate: 0.8% of coverage
// - Rural area: +10%
// - Distance from fire station >15km: +10%
// - Distance from police station >10km: +5%
// - Farm buildings: +10%
// - Livestock: +5%
// - Thatch roof: +20%
// - Electric fencing: -4%
// - Security cameras: -3%
// - Monitored alarm: -5%
// - Gravel road: Base rate
// - Property size >5 hectares: +10%
```

## API Testing Status ✅

- **Authentication**: Working (Clerk integration functional)
- **tRPC Endpoints**: Working (proper query/mutation handling)
- **Error Handling**: Working (structured error responses)
- **Role-based Access**: Working (middleware enforces permissions)
- **TypeScript**: Working (full type safety)
- **Rural Property Support**: Working (12 property types, 8 construction types)
- **Draft Policy System**: Working (save, retrieve, convert drafts)
- **Quote Expiration**: Working (30-day validity with checking)
- **Agent Settings**: Working (profile, preferences, working hours)

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
