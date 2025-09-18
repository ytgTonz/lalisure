# Customer API Endpoints for Postman Testing

## 🎯 Overview

This document provides all customer-facing API endpoints for testing with Postman. The Lalisure application uses tRPC for type-safe API communication, so all endpoints follow the tRPC format.

## 🔗 Base URL

**Development**: `http://localhost:3000`  
**Production**: `https://lalisure.onrender.com`

## 🔐 Authentication

### Customer Authentication (Clerk)

- **Provider**: Clerk Authentication
- **Token**: JWT token from Clerk
- **Header**: `Authorization: Bearer <clerk_jwt_token>`

### Getting Clerk Token

1. Sign in to the application
2. Open browser DevTools → Application → Local Storage
3. Find the Clerk session token
4. Use it in the Authorization header

## 📋 Customer Endpoints

### 1. User Management (`/api/trpc/user.*`)

#### Get User Profile

- **Method**: `GET`
- **Endpoint**: `/api/trpc/user.getProfile`
- **Auth**: Required
- **Description**: Get current user's profile information

```http
GET {{baseUrl}}/api/trpc/user.getProfile
Authorization: Bearer {{clerk_token}}
```

#### Create Profile

- **Method**: `POST`
- **Endpoint**: `/api/trpc/user.createProfile`
- **Auth**: Public
- **Description**: Create a new user profile

```http
POST {{baseUrl}}/api/trpc/user.createProfile
Content-Type: application/json

[{
  "json": {
    "clerkId": "user_2abc123def456",
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}]
```

#### Update Profile

- **Method**: `POST`
- **Endpoint**: `/api/trpc/user.updateProfile`
- **Auth**: Required
- **Description**: Update user profile information

```http
POST {{baseUrl}}/api/trpc/user.updateProfile
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{
  "json": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+27123456789",
    "avatar": "https://example.com/avatar.jpg"
  }
}]
```

#### Get Dashboard Statistics

- **Method**: `GET`
- **Endpoint**: `/api/trpc/user.getDashboardStats`
- **Auth**: Required
- **Description**: Get user's dashboard statistics

```http
GET {{baseUrl}}/api/trpc/user.getDashboardStats
Authorization: Bearer {{clerk_token}}
```

### 2. Policy Management (`/api/trpc/policy.*`)

#### Get All Policies

- **Method**: `GET`
- **Endpoint**: `/api/trpc/policy.getAll`
- **Auth**: Required
- **Description**: Get all policies for the current user

```http
GET {{baseUrl}}/api/trpc/policy.getAll?batch=1&input={"0":{"json":{"filters":{},"limit":10}}}
Authorization: Bearer {{clerk_token}}
```

#### Get Policy by ID

- **Method**: `GET`
- **Endpoint**: `/api/trpc/policy.getById`
- **Auth**: Required
- **Description**: Get a specific policy by ID

```http
GET {{baseUrl}}/api/trpc/policy.getById?batch=1&input={"0":{"json":{"id":"policy_id_here"}}}
Authorization: Bearer {{clerk_token}}
```

#### Create Policy

- **Method**: `POST`
- **Endpoint**: `/api/trpc/policy.create`
- **Auth**: Required
- **Description**: Create a new insurance policy

```http
POST {{baseUrl}}/api/trpc/policy.create
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{
  "json": {
    "type": "HOME",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "deductible": 1000,
    "coverage": {
      "dwelling": 300000,
      "personalProperty": 150000,
      "liability": 500000,
      "medicalPayments": 5000
    },
    "riskFactors": {
      "location": {
        "province": "WC",
        "postalCode": "8001"
      },
      "demographics": {
        "age": 30
      },
      "personal": {
        "employmentStatus": "employed",
        "monthlyIncome": 25000
      }
    },
    "propertyInfo": {
      "address": "123 Main Street",
      "city": "Cape Town",
      "province": "WC",
      "postalCode": "8001",
      "propertyType": "SINGLE_FAMILY",
      "buildYear": 2020,
      "squareFeet": 1500
    }
  }
}]
```

#### Update Policy

- **Method**: `POST`
- **Endpoint**: `/api/trpc/policy.update`
- **Auth**: Required
- **Description**: Update an existing policy

```http
POST {{baseUrl}}/api/trpc/policy.update
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{
  "json": {
    "id": "policy_id_here",
    "coverage": {
      "dwelling": 350000,
      "personalProperty": 175000
    }
  }
}]
```

#### Get Quote

- **Method**: `POST`
- **Endpoint**: `/api/trpc/policy.getQuote`
- **Auth**: Required
- **Description**: Get insurance quote for policy parameters

```http
POST {{baseUrl}}/api/trpc/policy.getQuote
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{
  "json": {
    "type": "HOME",
    "coverage": {
      "dwelling": 300000,
      "personalProperty": 150000,
      "liability": 500000,
      "medicalPayments": 5000
    },
    "riskFactors": {
      "location": {
        "province": "WC",
        "postalCode": "8001"
      },
      "demographics": {
        "age": 30
      }
    },
    "propertyInfo": {
      "address": "123 Main Street",
      "city": "Cape Town",
      "province": "WC",
      "postalCode": "8001",
      "propertyType": "SINGLE_FAMILY",
      "buildYear": 2020,
      "squareFeet": 1500
    }
  }
}]
```

#### Save Draft Policy

- **Method**: `POST`
- **Endpoint**: `/api/trpc/policy.saveDraft`
- **Auth**: Required
- **Description**: Save a policy as draft

```http
POST {{baseUrl}}/api/trpc/policy.saveDraft
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{
  "json": {
    "type": "HOME",
    "coverage": {
      "dwelling": 300000
    },
    "riskFactors": {
      "location": {
        "province": "WC",
        "postalCode": "8001"
      },
      "demographics": {
        "age": 30
      }
    },
    "isDraft": true,
    "completionPercentage": 60
  }
}]
```

### 3. Claims Management (`/api/trpc/claim.*`)

#### Submit Claim

- **Method**: `POST`
- **Endpoint**: `/api/trpc/claim.submit`
- **Auth**: Required
- **Description**: Submit a new insurance claim

```http
POST {{baseUrl}}/api/trpc/claim.submit
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{
  "json": {
    "policyId": "policy_id_here",
    "incidentDate": "2024-01-15T10:30:00.000Z",
    "incidentType": "THEFT",
    "description": "Burglary occurred during the night",
    "estimatedAmount": 5000,
    "incidentLocation": {
      "address": "123 Main Street",
      "city": "Cape Town",
      "province": "WC",
      "postalCode": "8001"
    },
    "contactPhone": "+27123456789",
    "contactEmail": "customer@example.com"
  }
}]
```

#### Get User Claims

- **Method**: `GET`
- **Endpoint**: `/api/trpc/claim.getUserClaims`
- **Auth**: Required
- **Description**: Get all claims for the current user

```http
GET {{baseUrl}}/api/trpc/claim.getUserClaims?batch=1&input={"0":{"json":{"limit":10,"offset":0}}}
Authorization: Bearer {{clerk_token}}
```

#### Get Claim by ID

- **Method**: `GET`
- **Endpoint**: `/api/trpc/claim.getById`
- **Auth**: Required
- **Description**: Get a specific claim by ID

```http
GET {{baseUrl}}/api/trpc/claim.getById?batch=1&input={"0":{"json":{"id":"claim_id_here"}}}
Authorization: Bearer {{clerk_token}}
```

#### Update Claim

- **Method**: `POST`
- **Endpoint**: `/api/trpc/claim.update`
- **Auth**: Required
- **Description**: Update an existing claim

```http
POST {{baseUrl}}/api/trpc/claim.update
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{
  "json": {
    "id": "claim_id_here",
    "description": "Updated description of the incident",
    "estimatedAmount": 6000
  }
}]
```

### 4. Payment Processing (`/api/trpc/payment.*`)

#### Create Payment Intent

- **Method**: `POST`
- **Endpoint**: `/api/trpc/payment.createPaymentIntent`
- **Auth**: Required
- **Description**: Create a payment intent for premium payment

```http
POST {{baseUrl}}/api/trpc/payment.createPaymentIntent
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{
  "json": {
    "policyId": "policy_id_here",
    "amount": 2500.00,
    "description": "Monthly premium payment"
  }
}]
```

#### Get Payment Status

- **Method**: `GET`
- **Endpoint**: `/api/trpc/payment.getStatus`
- **Auth**: Required
- **Description**: Get payment status by reference

```http
GET {{baseUrl}}/api/trpc/payment.getStatus?batch=1&input={"0":{"json":{"reference":"payment_reference_here"}}}
Authorization: Bearer {{clerk_token}}
```

#### Get Payment History

- **Method**: `GET`
- **Endpoint**: `/api/trpc/payment.getHistory`
- **Auth**: Required
- **Description**: Get user's payment history

```http
GET {{baseUrl}}/api/trpc/payment.getHistory?batch=1&input={"0":{"json":{"limit":10,"offset":0}}}
Authorization: Bearer {{clerk_token}}
```

#### Verify Payment

- **Method**: `POST`
- **Endpoint**: `/api/trpc/payment.verify`
- **Auth**: Required
- **Description**: Verify a payment transaction

```http
POST {{baseUrl}}/api/trpc/payment.verify
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{
  "json": {
    "reference": "payment_reference_here"
  }
}]
```

### 5. Notifications (`/api/trpc/notification.*`)

#### Get Notifications

- **Method**: `GET`
- **Endpoint**: `/api/trpc/notification.getNotifications`
- **Auth**: Required
- **Description**: Get user notifications

```http
GET {{baseUrl}}/api/trpc/notification.getNotifications?batch=1&input={"0":{"json":{"limit":20,"offset":0}}}
Authorization: Bearer {{clerk_token}}
```

#### Get Unread Count

- **Method**: `GET`
- **Endpoint**: `/api/trpc/notification.getUnreadCount`
- **Auth**: Required
- **Description**: Get count of unread notifications

```http
GET {{baseUrl}}/api/trpc/notification.getUnreadCount
Authorization: Bearer {{clerk_token}}
```

#### Mark as Read

- **Method**: `POST`
- **Endpoint**: `/api/trpc/notification.markAsRead`
- **Auth**: Required
- **Description**: Mark notification as read

```http
POST {{baseUrl}}/api/trpc/notification.markAsRead
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{
  "json": {
    "id": "notification_id_here"
  }
}]
```

#### Mark All as Read

- **Method**: `POST`
- **Endpoint**: `/api/trpc/notification.markAllAsRead`
- **Auth**: Required
- **Description**: Mark all notifications as read

```http
POST {{baseUrl}}/api/trpc/notification.markAllAsRead
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{}]
```

#### Update Notification Preferences

- **Method**: `POST`
- **Endpoint**: `/api/trpc/notification.updatePreferences`
- **Auth**: Required
- **Description**: Update notification preferences

```http
POST {{baseUrl}}/api/trpc/notification.updatePreferences
Authorization: Bearer {{clerk_token}}
Content-Type: application/json

[{
  "json": {
    "email": {
      "enabled": true,
      "policyUpdates": true,
      "claimUpdates": true,
      "paymentReminders": true,
      "paymentConfirmations": true,
      "marketingEmails": false
    },
    "sms": {
      "enabled": true,
      "urgentClaimUpdates": true,
      "paymentReminders": true,
      "policyExpirations": true
    },
    "push": {
      "enabled": true,
      "policyUpdates": true,
      "claimUpdates": true,
      "paymentReminders": true
    }
  }
}]
```

## 🧪 Postman Collection Setup

### Environment Variables

Create a Postman environment with these variables:

```json
{
  "baseUrl": "http://localhost:3000",
  "clerk_token": "your_clerk_jwt_token_here",
  "policy_id": "sample_policy_id",
  "claim_id": "sample_claim_id",
  "notification_id": "sample_notification_id"
}
```

### Pre-request Scripts

Add this pre-request script to automatically handle tRPC formatting:

```javascript
// For GET requests with query parameters
if (pm.request.method === "GET" && pm.request.url.query.has("input")) {
  // Already formatted for tRPC
} else if (pm.request.method === "POST") {
  // Ensure request body is properly formatted for tRPC
  const body = pm.request.body.raw;
  if (body && !body.startsWith("[")) {
    pm.request.body.raw = `[{"json": ${body}}]`;
  }
}
```

### Test Scripts

Add this test script to handle common responses:

```javascript
// Test for successful response
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

// Test for tRPC response format
pm.test("Response is valid tRPC format", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("result");
});

// Test for authentication errors
pm.test("Not unauthorized", function () {
  pm.expect(pm.response.code).to.not.equal(401);
});
```

## 🔍 Common Response Formats

### Success Response

```json
{
  "result": {
    "data": {
      // Response data here
    }
  }
}
```

### Error Response

```json
{
  "error": {
    "json": {
      "message": "Error message",
      "code": -32001,
      "data": {
        "code": "UNAUTHORIZED",
        "httpStatus": 401,
        "path": "user.getProfile"
      }
    }
  }
}
```

## 📝 Testing Checklist

### Authentication Tests

- [ ] Get user profile with valid token
- [ ] Get user profile with invalid token (should return 401)
- [ ] Get user profile without token (should return 401)

### Policy Tests

- [ ] Create new policy
- [ ] Get all policies
- [ ] Get policy by ID
- [ ] Update policy
- [ ] Get quote
- [ ] Save draft policy

### Claims Tests

- [ ] Submit new claim
- [ ] Get user claims
- [ ] Get claim by ID
- [ ] Update claim

### Payment Tests

- [ ] Create payment intent
- [ ] Get payment status
- [ ] Get payment history
- [ ] Verify payment

### Notification Tests

- [ ] Get notifications
- [ ] Get unread count
- [ ] Mark notification as read
- [ ] Mark all as read
- [ ] Update preferences

## 🚨 Common Issues

### 1. Authentication Errors

- **Issue**: 401 Unauthorized
- **Solution**: Check if Clerk token is valid and properly formatted
- **Header**: `Authorization: Bearer <token>`

### 2. tRPC Format Errors

- **Issue**: 400 Bad Request
- **Solution**: Ensure POST requests use `[{"json": {...}}]` format
- **Example**: `[{"json": {"id": "123"}}]`

### 3. Validation Errors

- **Issue**: 422 Validation Error
- **Solution**: Check required fields and data types
- **Common**: Province codes (WC, EC, etc.), date formats, number ranges

### 4. CORS Issues

- **Issue**: CORS errors in browser
- **Solution**: Use Postman or ensure proper CORS headers

## 📚 Additional Resources

- [tRPC Documentation](https://trpc.io/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [Postman tRPC Testing](https://blog.postman.com/testing-trpc-apis-with-postman/)

## 🎯 Quick Start

1. **Set up environment variables** in Postman
2. **Get Clerk token** from browser DevTools
3. **Test authentication** with `user.getProfile`
4. **Create a policy** with `policy.create`
5. **Submit a claim** with `claim.submit`
6. **Test payments** with `payment.createPaymentIntent`

This collection covers all customer-facing endpoints for comprehensive API testing! 🚀
