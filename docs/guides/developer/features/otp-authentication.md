# V2 OTP Authentication System - Implementation Guide

## Overview

The V2 OTP Authentication System enables mobile users to authenticate using their policy number and phone verification, replacing the need for Clerk authentication on mobile devices. This document outlines the complete implementation.

---

## 🎯 **Key Features**

- **Policy-Based Access**: Users authenticate using their policy number
- **Phone Verification**: OTP codes sent via Twilio SMS
- **30-Day Sessions**: Long-lived JWT sessions for mobile convenience
- **Security Features**: Rate limiting, attempt limiting, and secure token storage
- **Rural-Friendly**: Works with low bandwidth and offline capabilities

---

## 📋 **Implementation Components**

### **1. Database Schema (`prisma/schema.prisma`)**

#### **User Model Updates**
```prisma
// Mobile OTP Authentication (V2)
otpCode           String?    // Current OTP code (hashed)
otpExpiresAt      DateTime?  // OTP expiration time (5 minutes)
otpAttempts       Int        @default(0) // Failed OTP attempts counter
otpLastSentAt     DateTime?  // Last OTP sent timestamp (rate limiting)
mobileSessionToken String?   // 30-day mobile session JWT
mobileSessionExpiry DateTime? // Mobile session expiration
lastLoginAt       DateTime?  // Last successful login timestamp
lastLoginIp       String?    // Last login IP address
```

#### **UserRole Enum Update**
```prisma
enum UserRole {
  CUSTOMER
  AGENT
  SUPERVISOR // V2: Approval authority for policies/claims
  ADMIN
  UNDERWRITER // Deprecated in V2, use SUPERVISOR instead
}
```

#### **New Indexes**
```prisma
@@index([phone]) // For OTP lookup by phone number
@@index([mobileSessionToken]) // For mobile session validation
@@index([otpExpiresAt]) // For OTP cleanup queries
```

---

### **2. Validation Schemas (`src/lib/validations/mobile-auth.ts`)**

#### **Policy Verification**
```typescript
policyVerificationSchema = z.object({
  policyNumber: z.string().regex(/^POL-/),
  phoneNumber: z.string().regex(phoneNumberRegex).transform(...),
});
```

#### **OTP Request**
```typescript
otpRequestSchema = z.object({
  policyNumber: z.string(),
  phoneNumber: z.string(),
});
```

#### **OTP Verification**
```typescript
otpVerificationSchema = z.object({
  policyNumber: z.string(),
  phoneNumber: z.string(),
  otpCode: z.string().length(6),
  deviceInfo: z.object({...}).optional(),
});
```

---

### **3. OTP Service (`src/lib/services/otp.ts`)**

#### **Key Methods**

**`generateAndSendOtp(policyNumber, phoneNumber)`**
- Validates policy and phone number
- Checks rate limits (3 requests per 15 minutes)
- Generates 6-digit OTP code
- Hashes OTP with bcrypt
- Sends SMS via Twilio
- Returns masked phone number

**`verifyOtp(policyNumber, phoneNumber, otpCode)`**
- Validates OTP code
- Checks expiry (5 minutes)
- Limits attempts (5 max)
- Marks phone as verified
- Returns userId on success

#### **Security Configuration**
```typescript
OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 5
MAX_OTP_ATTEMPTS = 5
RATE_LIMIT_WINDOW_MINUTES = 15
MAX_OTP_REQUESTS = 3
LOCKOUT_DURATION_MINUTES = 30
```

---

### **4. Mobile Session Management (`src/lib/auth/mobile-session.ts`)**

#### **Key Methods**

**`createMobileSession(userId, options)`**
- Creates 30-day JWT token
- Stores token in database
- Tracks IP address and login time
- Returns token and expiry date

**`verifyMobileSession(token)`**
- Validates JWT signature
- Checks database for token match
- Verifies user account status
- Returns session object or null

**`getMobileSessionFromRequest(request)`**
- Extracts token from cookies or Authorization header
- Validates session
- Returns session data

**`refreshMobileSession(currentToken)`**
- Extends session by another 30 days
- Creates new token
- Updates database

**`revokeMobileSession(userId)`**
- Clears session token from database
- Deletes session cookie
- Logs out user

#### **Session Configuration**
```typescript
SESSION_DURATION_DAYS = 30
MOBILE_SESSION_COOKIE = 'mobile-session'
```

---

### **5. tRPC Router (`src/server/api/routers/mobile-auth.ts`)**

#### **Endpoints**

**`mobileAuth.verifyPolicy`** (Step 1)
- Input: `{ policyNumber, phoneNumber }`
- Output: `{ success, maskedPhone, policyholderName }`
- Validates policy and phone match
- Returns masked phone for user confirmation

**`mobileAuth.requestOtp`** (Step 2)
- Input: `{ policyNumber, phoneNumber }`
- Output: `{ success, message, maskedPhone, expiresAt }`
- Generates and sends OTP via SMS
- Enforces rate limits

**`mobileAuth.verifyOtp`** (Step 3)
- Input: `{ policyNumber, phoneNumber, otpCode, deviceInfo }`
- Output: `{ success, session: { token, expiresAt }, user: {...} }`
- Verifies OTP code
- Creates 30-day mobile session
- Returns session token and user data

**`mobileAuth.refreshSession`**
- Input: `{ sessionToken }`
- Output: `{ success, session: { token, expiresAt } }`
- Extends session by another 30 days

**`mobileAuth.logout`**
- Input: `{ sessionToken }`
- Output: `{ success, message }`
- Revokes mobile session

**`mobileAuth.getSession`**
- Input: `{ sessionToken }`
- Output: `{ user, expiresAt, issuedAt }`
- Returns current session info

---

## 🔄 **Authentication Flow**

### **Mobile Login Flow**

```
1. User enters Policy Number
   ↓
2. User enters Phone Number
   ↓
3. System validates policy + phone match
   → mobileAuth.verifyPolicy
   ↓
4. System sends OTP via SMS
   → mobileAuth.requestOtp
   ↓
5. User enters 6-digit OTP code
   ↓
6. System verifies OTP
   → mobileAuth.verifyOtp
   ↓
7. System creates 30-day session
   ↓
8. User is logged in (session stored in cookie/local storage)
```

### **Session Management**

```
On Each Request:
1. Extract session token from cookie or Authorization header
2. Verify JWT signature
3. Check database for token match
4. Validate expiry (30 days)
5. Return user data or null
```

---

## 🛠️ **Implementation Steps**

### **Step 1: Database Migration**

```bash
# Generate Prisma client with new schema
npm run db:generate

# Push schema changes to MongoDB
npm run db:push
```

### **Step 2: Environment Variables**

Add to `.env`:
```env
# JWT Secret for mobile sessions
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters

# Twilio (already configured for SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+27XXXXXXXXX
```

### **Step 3: Test OTP Flow**

```typescript
// Example frontend usage
const { mutate: verifyPolicy } = trpc.mobileAuth.verifyPolicy.useMutation();
const { mutate: requestOtp } = trpc.mobileAuth.requestOtp.useMutation();
const { mutate: verifyOtp } = trpc.mobileAuth.verifyOtp.useMutation();

// Step 1: Verify policy
verifyPolicy({
  policyNumber: 'POL-HOME-12345',
  phoneNumber: '+27831234567'
}, {
  onSuccess: (data) => {
    console.log('Masked phone:', data.maskedPhone);
    // Step 2: Request OTP
    requestOtp({ policyNumber, phoneNumber });
  }
});

// Step 3: Verify OTP
verifyOtp({
  policyNumber,
  phoneNumber,
  otpCode: '123456',
  deviceInfo: { ... }
}, {
  onSuccess: (data) => {
    // Store session token
    localStorage.setItem('mobileSession', data.session.token);
    // Redirect to dashboard
  }
});
```

---

## 🔒 **Security Features**

### **Rate Limiting**
- **OTP Requests**: Max 3 per 15 minutes
- **Failed Attempts**: Max 5 before 30-minute lockout
- **Purpose**: Prevent brute force attacks

### **OTP Security**
- **Length**: 6 digits (1 million combinations)
- **Expiry**: 5 minutes
- **Hashing**: Bcrypt (10 rounds)
- **One-time use**: Cleared after verification

### **Session Security**
- **Duration**: 30 days (rural-friendly)
- **Storage**: Database + JWT
- **Revocation**: Instant via database update
- **IP Tracking**: Login IP stored for audit

### **Phone Number Validation**
- **Format**: South African (+27 or 0XXXXXXXXX)
- **Normalization**: All stored as +27 format
- **Masking**: Displayed as +27XX...XX16

---

## 📱 **Frontend Integration**

### **Required Pages**

1. **`/mobile/login`** - Policy number + phone entry
2. **`/mobile/verify-otp`** - OTP code input
3. **`/mobile/dashboard`** - Authenticated mobile home

### **Auth Context**

```typescript
// Create mobile auth context
const MobileAuthContext = createContext({
  session: null,
  login: async (policyNumber, phoneNumber, otpCode) => {},
  logout: async () => {},
  refreshSession: async () => {},
});
```

---

## 🧪 **Testing**

### **Unit Tests**
- OTP generation and hashing
- Session token creation and validation
- Rate limiting logic
- Phone number normalization

### **Integration Tests**
- Full login flow (policy → OTP → session)
- Session refresh
- Logout
- Rate limit enforcement

### **E2E Tests**
- Mobile login from policy number
- OTP delivery and verification
- Session persistence
- Logout flow

---

## 📊 **Monitoring**

### **Metrics to Track**
- OTP delivery success rate
- OTP verification success rate
- Average login time
- Session duration
- Failed login attempts
- Rate limit triggers

### **Security Events**
- All OTP requests logged
- Failed verification attempts logged
- Successful logins logged with IP
- Session revocations logged

---

## 🚀 **Next Steps**

1. **Update Middleware** - Add mobile session check
2. **Create Mobile UI** - Login, verify OTP, dashboard pages
3. **Update Documentation** - User manual for mobile auth
4. **Test in Production** - Beta test with 10 users
5. **Monitor & Iterate** - Track metrics and adjust

---

## 📚 **Related Files**

- `prisma/schema.prisma` - Database schema
- `src/lib/validations/mobile-auth.ts` - Validation schemas
- `src/lib/services/otp.ts` - OTP generation and verification
- `src/lib/auth/mobile-session.ts` - Session management
- `src/server/api/routers/mobile-auth.ts` - tRPC endpoints
- `src/server/api/root.ts` - Router registration

---

## ✅ **Implementation Status**

- [x] Database schema updated
- [x] Validation schemas created
- [x] OTP service implemented
- [x] Mobile session service created
- [x] tRPC router implemented
- [x] Router registered in app
- [ ] Middleware updated (next step)
- [ ] Mobile UI pages created
- [ ] Testing completed
- [ ] Documentation updated

---

**Document Version**: 1.0
**Last Updated**: {{ current_date }}
**Author**: Claude Code Assistant
