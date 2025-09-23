# AI Agent Completion Guide: Lalisure Insurance Platform

## 🎯 **Mission Statement & Context**

You are an AI agent tasked with completing the Lalisure insurance platform. This document provides complete context and instructions for systematic completion, designed to survive context resets and token limitations.

### **Project Overview**
- **Platform**: South African home insurance platform
- **Stack**: Next.js 14, tRPC, Prisma, TypeScript, Tailwind CSS
- **Current State**: 40-50% complete (despite docs claiming 75%+)
- **Primary Issue**: Gap between sophisticated code architecture and functional features

### **Critical Discovery**
**Pattern Found**: "Code exists ≠ Feature works"
- Impressive individual components exist
- Integration between systems is incomplete
- Critical configurations are missing
- Regional mismatches (US code for SA business)

---

## 📊 **Current State Analysis Summary**

| System | Documentation Claim | Actual Status | Issues Found |
|--------|-------------------|---------------|--------------|
| **Claim Submission** | ✅ 100% Complete | 🟡 75% Functional | Untested end-to-end, potential auth issues |
| **Email Notifications** | ✅ 100% Complete | 🔴 30% - Code exists | Missing RESEND_API_KEY, database dependency |
| **Email Templates** | ✅ 100% Complete | 🔴 20% - Backend only | Frontend shows hardcoded data, not DB |
| **SMS Integration** | ✅ 100% Complete | 🔴 10% - Wrong country | US phone validation for SA business |
| **Payment Processing** | 🟡 65% Functional | 🟡 60% Functional | TODOs in webhooks, missing notifications |
| **Role-Based Access** | 🔴 40% Incomplete | 🟡 45% Better than claimed | Inconsistent application |

### **Key File Locations**
- Claims: `src/app/customer/claims/new/page.tsx` + `src/server/api/routers/claim.ts`
- Email: `src/lib/services/email.ts` + `src/lib/services/notification.ts`
- Templates: `src/server/api/routers/email-template.ts` + `src/app/admin/email-templates/page.tsx`
- SMS: `src/lib/services/sms.ts`
- Payments: `src/server/api/routers/payment.ts`
- Auth: `src/components/auth/RoleGuard.tsx`

---

## 🚨 **CRITICAL CONTEXT MANAGEMENT PROTOCOL**

### **When Starting New Session:**
1. **Read this entire document first**
2. **Identify current phase from Phase Tracker below**
3. **Run verification commands for previous phase**
4. **Focus ONLY on current phase tasks**
5. **Do NOT skip to later phases**

### **Phase Completion Protocol:**
1. **COMPLETE ALL** tasks in current phase
2. **VERIFY ALL** completion criteria met
3. **UPDATE** Phase Tracker section below
4. **STOP** - Do not continue to next phase automatically
5. **DOCUMENT** any issues or modifications made

### **Emergency Reset Command:**
If AI starts deviating or context becomes unclear:
```
RESET: Focus only on Phase [X]. Ignore all previous context.
Current task is [specific step]. Do not proceed beyond this step.
Complete this specific task: [task description]
```

---

## 📋 **PHASE TRACKER - UPDATE THIS SECTION**

**Current Phase**: [UPDATE AFTER EACH PHASE]
**Last Completed Phase**: [UPDATE AFTER EACH PHASE]
**Next Phase**: [UPDATE AFTER EACH PHASE]

### **Phase Status Log:**
- [ ] **Phase 1**: Infrastructure Foundation
- [ ] **Phase 2**: Core System Integration
- [ ] **Phase 3**: Payment & Financial Systems
- [ ] **Phase 4**: Role-Based Access & Security
- [ ] **Phase 5**: Production Readiness

**Notes from Previous Sessions:**
[ADD NOTES HERE AFTER EACH SESSION]

---

## 🔧 **PHASE 1: Infrastructure Foundation**

**MUST COMPLETE ENTIRELY BEFORE PHASE 2**

### **Step 1.1: Environment Configuration Audit**
```bash
# Check current environment setup
TASK: Review .env.example vs implementation requirements
VERIFY: Each service has proper configuration
SERVICES TO CHECK:
  - RESEND_API_KEY (email service)
  - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER (SMS)
  - PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY (payments)
  - CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (auth)
  - DATABASE_URL (database)

ACTIONS:
1. Create/update .env.local with all required variables
2. Document each variable's purpose
3. Test each service connection
```

### **Step 1.2: Database Schema Validation**
```bash
# Ensure database matches code requirements
LOCATION: Check prisma/schema.prisma vs code usage

VERIFY TABLES EXIST:
  - Email (for email tracking)
  - EmailTemplate (for template system)
  - Notification (for notification system)
  - EmailTracking (for delivery tracking)

ACTIONS:
1. Run: npx prisma db push
2. Verify: npx prisma studio (check tables exist)
3. Test: Database connection in application
```

### **Step 1.3: Regional Localization Fix**
```typescript
// CRITICAL: Fix South African phone validation
LOCATION: src/lib/services/sms.ts
PROBLEM: Lines 108-109 use US phone format

CURRENT CODE:
const phoneRegex = /^\+1[0-9]{10}$/;

REPLACE WITH:
const phoneRegex = /^\+27[0-9]{9}$/; // South African format

ALSO UPDATE:
- cleanPhoneNumber method (lines 86-101)
- Add SA country code logic instead of US
- Update validation messages
```

### **Step 1.4: Service Configuration Validation**
```typescript
// Create service health check
CREATE FILE: src/app/api/health/services/route.ts

IMPLEMENT CHECKS FOR:
1. Resend API connection
2. Twilio credentials validation
3. Paystack API connection
4. Database connectivity
5. File upload service (UploadThing)

RETURN: JSON status of each service (green/red)
```

### **Phase 1 Completion Criteria:**
- [ ] All environment variables documented and set
- [ ] Database schema matches code requirements
- [ ] South African phone validation implemented
- [ ] Service health endpoint returns all services healthy
- [ ] No console errors about missing configurations
- [ ] `npm run build` completes without errors

### **Phase 1 Verification Commands:**
```bash
npm run build                    # Should complete without errors
npx prisma db push              # Should sync without issues
curl http://localhost:3000/api/health/services  # All green
npm run dev                     # Check console for config errors
```

---

## 🔗 **PHASE 2: Core System Integration**

**START ONLY AFTER PHASE 1 COMPLETE**

### **Step 2.1: Email System Integration**
```typescript
// Bridge template backend with frontend UI
PROBLEM: src/app/admin/email-templates/page.tsx shows hardcoded templates
LOCATION: Lines 80-136 contain defaultTemplates array

ACTIONS:
1. Remove hardcoded defaultTemplates array
2. Use actual database queries via tRPC
3. Ensure template CRUD operations work through UI
4. Test template creation, editing, deletion

FILES TO MODIFY:
- src/app/admin/email-templates/page.tsx
- Ensure tRPC queries work properly
```

### **Step 2.2: Notification System Testing**
```typescript
// Test end-to-end notification flow
CREATE FILE: src/app/api/test/notifications/route.ts

IMPLEMENT TESTS FOR:
1. Email delivery via Resend
2. SMS delivery via Twilio (with SA numbers)
3. Database notification record creation
4. Template variable replacement
5. Error handling for failed deliveries

TEST EACH NOTIFICATION TYPE:
- CLAIM_SUBMITTED
- PAYMENT_CONFIRMED
- POLICY_CREATED
- WELCOME
- CLAIM_STATUS_UPDATE
```

### **Step 2.3: Claims Workflow Validation**
```bash
# Test complete claims submission flow
LOCATION: src/app/customer/claims/new/page.tsx

END-TO-END TEST:
1. User fills out claim form
2. Form submits to backend
3. Database record created
4. Email notification sent
5. SMS notification sent (SA number)
6. File uploads work properly
7. User receives confirmation

VERIFY COMPONENTS:
- ClaimSubmissionForm component
- File upload functionality
- What3words integration
- Location input validation
```

### **Phase 2 Completion Criteria:**
- [ ] Email templates UI connected to database (no hardcoded data)
- [ ] All notification types working (email + SMS)
- [ ] Claims submission flow works end-to-end
- [ ] File uploads functional
- [ ] Users receive confirmations for all actions
- [ ] Test endpoint for notifications working

### **Phase 2 Verification Commands:**
```bash
# Manual tests required:
1. Submit claim through UI - should receive email + SMS
2. Admin create/edit email template - should persist to DB
3. curl -X POST /api/test/notifications - should send test messages
```

---

## 💰 **PHASE 3: Payment & Financial Systems**

**START ONLY AFTER PHASE 2 COMPLETE**

### **Step 3.1: Payment Webhook Completion**
```typescript
// Complete TODO items in payment system
LOCATION: src/app/api/webhooks/paystack/route.ts

TODOS TO COMPLETE:
Line ~45: // TODO: Send notification about successful payout
Line ~67: // TODO: Update any subscription records
Line ~89: // TODO: Handle subscription cancellation
Line ~112: // TODO: Handle subscription invoice creation
Line ~134: // TODO: Handle subscription invoice updates

IMPLEMENT:
1. Payment confirmation notifications (email + SMS)
2. Subscription handling if needed
3. Proper error handling for failed payments
4. Database updates for payment status
```

### **Step 3.2: Premium Calculator Integration**
```typescript
// Fix calculator implementation
LOCATION: src/lib/services/premium-calculator.test.ts
ISSUE: Line 6: // TODO: Add calculatePremium tests once method signature is fixed

ACTIONS:
1. Complete calculatePremium method implementation
2. Add proper tests for calculator
3. Ensure calculations match SA insurance standards
4. Integrate with policy creation workflow
```

### **Step 3.3: Payment Verification System**
```typescript
// Complete payment verification workflow
LOCATION: src/server/api/routers/payment.ts

ENSURE WORKING:
1. createPaymentIntent mutation
2. verifyPayment mutation
3. Payment status updates
4. Notification sending after successful payment
5. Error handling for failed payments
```

### **Phase 3 Completion Criteria:**
- [ ] All payment webhook TODOs implemented
- [ ] Payment confirmations sent via email + SMS
- [ ] Premium calculator working and tested
- [ ] Payment verification flow complete
- [ ] Database properly updated after payments
- [ ] Error handling for failed payments

### **Phase 3 Verification Commands:**
```bash
npm test -- premium-calculator.test.ts  # Should pass
# Manual test: Complete payment flow - should receive confirmations
# Check webhook endpoint handles all Paystack events
```

---

## 🔐 **PHASE 4: Role-Based Access & Security**

**START ONLY AFTER PHASE 3 COMPLETE**

### **Step 4.1: Authentication System Unification**
```typescript
// Resolve mixed authentication systems
ISSUE: Mixed Clerk + staff auth systems
LOCATION: Multiple files using different auth methods

TASKS:
1. Standardize authentication across all user types
2. Ensure RoleGuard consistently applied
3. Resolve conflicts between Clerk and staff auth
4. Test all user role transitions

FILES TO REVIEW:
- src/components/auth/RoleGuard.tsx
- src/server/auth.ts
- src/lib/auth/staff-auth.ts
```

### **Step 4.2: Security Implementation**
```typescript
// Add missing security measures
TASKS:
1. Rate limiting for API endpoints
2. Input sanitization validation
3. Security headers configuration
4. Audit logging for sensitive operations
5. CSRF protection
6. Data validation improvements
```

### **Step 4.3: Access Control Testing**
```bash
# Test role-based access thoroughly
TEST SCENARIOS:
1. Customer accessing admin routes (should be blocked)
2. Agent accessing underwriter functions (should be blocked)
3. Admin accessing all areas (should work)
4. Unauthenticated access (should redirect)
5. Role transitions working properly
```

### **Phase 4 Completion Criteria:**
- [ ] Single, unified authentication system
- [ ] Role-based access consistently enforced
- [ ] Security measures implemented
- [ ] Audit logging functional
- [ ] All access control tests pass
- [ ] No security vulnerabilities found

### **Phase 4 Verification Commands:**
```bash
# Manual testing required for role-based access
# Security audit tools if available
npm run security-audit  # If implemented
```

---

## 🚀 **PHASE 5: Production Readiness**

**START ONLY AFTER PHASE 4 COMPLETE**

### **Step 5.1: Performance Optimization**
```typescript
// Address performance requirements
TASKS:
1. Implement caching strategies
2. Image optimization setup
3. Bundle size optimization
4. Database query optimization
5. API response time improvements
```

### **Step 5.2: Monitoring & Analytics**
```typescript
// Complete analytics implementation
VERIFY: PostHog integration working
ADD: Custom business metrics tracking
IMPLEMENT: Error monitoring and alerting
SETUP: Performance monitoring
```

### **Step 5.3: Documentation & Testing**
```bash
# Complete project documentation
TASKS:
1. API documentation generation
2. User manual creation
3. Deployment documentation update
4. Test coverage improvements
5. End-to-end test suite
```

### **Phase 5 Completion Criteria:**
- [ ] Performance optimized for production
- [ ] Monitoring and analytics implemented
- [ ] Documentation complete and accurate
- [ ] Test coverage adequate (>80%)
- [ ] Production deployment ready
- [ ] All features working end-to-end

### **Phase 5 Verification Commands:**
```bash
npm run build                     # Production build success
npm run test                      # All tests pass
npm run e2e                       # End-to-end tests pass
npm run lighthouse                # Performance audit
```

---

## 🔍 **CRITICAL ISSUES REFERENCE**

### **Known Broken Integrations:**
1. **Email Templates UI**: Shows hardcoded data instead of database
2. **SMS Service**: Wrong country validation (US vs SA)
3. **Payment Webhooks**: Multiple TODO items incomplete
4. **Environment Setup**: Missing critical API keys
5. **Database Schema**: Potential mismatches with code

### **Configuration Requirements:**
```env
# Required environment variables
RESEND_API_KEY=your_resend_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+27_your_sa_number
PAYSTACK_SECRET_KEY=your_paystack_secret
PAYSTACK_PUBLIC_KEY=your_paystack_public
DATABASE_URL=your_database_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Regional Fixes Required:**
- Phone number validation: US (+1) → South Africa (+27)
- SMS templates: Remove US references
- Business logic: Adapt to SA insurance regulations
- Currency: Ensure Rand (R) formatting

---

## 🎯 **SUCCESS METRICS**

### **Technical Success Indicators:**
- [ ] No console errors in development or production
- [ ] All documented features work end-to-end
- [ ] Performance metrics meet standards
- [ ] Security audit passes
- [ ] All tests pass

### **Business Success Indicators:**
- [ ] Complete insurance claim workflow functional
- [ ] Payment processing with confirmations working
- [ ] Email and SMS notifications delivering correctly
- [ ] Role-based access securing platform properly
- [ ] Admin functions work as documented

### **User Experience Indicators:**
- [ ] Customers can submit claims and receive updates
- [ ] Payments process smoothly with confirmations
- [ ] Staff can manage customers and policies effectively
- [ ] All user workflows complete without errors

---

## 🔄 **CONTINUOUS VALIDATION PROTOCOL**

After each significant change:
1. Run `npm run build` (should complete without errors)
2. Test the specific feature end-to-end manually
3. Check browser and server console for errors
4. Verify database records created correctly
5. Confirm external services (email/SMS) called successfully

### **Emergency Debugging:**
If something breaks:
1. Check console errors first
2. Verify environment variables set
3. Test database connectivity
4. Check service health endpoint
5. Review recent changes made

---

## 📝 **SESSION NOTES TEMPLATE**

**Date**: [DATE]
**Phase Worked On**: [PHASE NUMBER]
**Tasks Completed**:
- [ ] Task 1
- [ ] Task 2

**Issues Encountered**:
- Issue 1: Description and resolution
- Issue 2: Description and resolution

**Next Session Should Focus On**:
- Next specific task to complete

**Verification Status**:
- [ ] All phase completion criteria met
- [ ] Ready for next phase: Yes/No

---

**Remember**: Always verify actual functionality, not just code presence. "Code exists ≠ Feature works" is the key principle for this project.