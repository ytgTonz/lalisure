# Lalisure Insurance Platform V2.0.0 - Product Requirements Document

> **Document Status**: Active Development
> **Created**: October 8, 2025
> **Last Updated**: October 10, 2025
> **V1 Archive**: `archive/v1-nextjs-original` | Tag: `v1.0.0-complete` > **V2 Development Branch**: `fix/nextjs-compatibility`

---

## 📋 **DOCUMENT OVERVIEW**

This PRD outlines the product requirements for Lalisure Insurance Platform V2.0.0, building on the complete and production-ready V1.0.0 foundation.

**Related Documentation**:

- [V1 Complete State Snapshot](./archive/V1_COMPLETE_STATE_SNAPSHOT.md)
- [V1 to V2 Transition Guide](./archive/V1_TO_V2_TRANSITION_GUIDE.md)
- [Archival Progress Tracker](./transition/ARCHIVAL_PROGRESS_TRACKER.md)

---

## 🎯 **EXECUTIVE SUMMARY**

### **Vision Statement**

Lalisure will simple down its approach and offer a per price based (Rand amount) home insurance.
The amounts that we will cover range from R30k to R200k
LaliSure only focuses on home insurance in rural areas with no address. This is where W3W comes in.

### **V2 Goals**

1. Provide affordable home insurance to rural homes across south africa
2. Simplifying the use of the Lalisure platforms (web/mobile)
3. Have Traffic on the system
4. Achieve 10x user growth
5. Reduce claims processing time by 50%

### **Success Metrics**

| Metric                 | V1 Baseline      | V2 Target                      | Timeline |
| ---------------------- | ---------------- | ------------------------------ | -------- |
| Active Users           | 500              | 5,000 (10x growth)             | Q4 2025  |
| Active Policies        | 300              | 3,000                          | Q4 2025  |
| Countries Supported    | 1 (South Africa) | 1 (South Africa - Rural Focus) | Ongoing  |
| Insurance Products     | 1 (Home)         | 1 (Home - Simplified Tiers)    | Q4 2025  |
| Claims Processing Time | 5 days           | 2.5 days (50% reduction)       | Q3 2025  |
| Mobile App Adoption    | 0%               | 70% of customers               | Q4 2025  |
| Agent-Created Policies | 40%              | 90%                            | Q3 2025  |
| Customer Satisfaction  | 3.5/5            | 4.5/5                          | Q4 2025  |

---

## 📊 **V1 RECAP & LEARNINGS**

### **What V1 Achieved** (100% Complete)

**Core Features**:

- ✅ Home insurance policy management
- ✅ Claims submission and processing
- ✅ Payment processing (Paystack)
- ✅ Email & SMS notifications
- ✅ Role-based access (5 user types)
- ✅ Comprehensive monitoring & analytics

**Technical Achievements**:

- ✅ Next.js 15 + React 19 + tRPC architecture
- ✅ 88% test coverage
- ✅ 80-90% performance improvement
- ✅ Full security implementation (OWASP Top 10)
- ✅ 42 documentation files

**Reference**: See [V1 Complete State Snapshot](./archive/V1_COMPLETE_STATE_SNAPSHOT.md)

---

## 🆕 **V2 NEW FEATURES & CHANGES**

### **Major New Features**

#### **Feature 1: Policy verification for auth**

**Description**: The mobile version of the platform will take the policy number and verify the user by sending an OTP to the user number to verify the user and create session that will be managed by the backend and log them in. Session expires after 30 days in which the user will have to log back in again.

**User Stories**:

- As a [CUSTOMER], I want to [user mobile app by verifying that the policy is mine using my number] so that [I am auth to access my information]
- As a [AGENT], I want to [use the platform] so that [create a policy for the customer and for it to be approved by my supervisor]
- As a [supervisor], I want to [use the platform] so that [can accept/confirm/ reject/ deny policy and claim creation and modification]

**Acceptance Criteria**:

- [ ] Policiy is created by Agent and not customer.
- [ ] policy is approved by supervisor.
- [ ] policy number is communicated back to customer and is used to access mobile application by sending otp to customer.

**Priority**: High

---

#### **Feature 2: Simplified Tier-Based Coverage System**

**Description**: Replace complex policy customization with fixed coverage tiers ranging from R30,000 to R200,000. This simplifies the purchase process and makes pricing more transparent for rural customers. Coverage amounts: R30k, R50k, R75k, R100k, R150k, R200k.

**User Stories**:

- As a CUSTOMER, I want to choose from simple coverage tiers so that I can easily understand what I'm buying
- As an AGENT, I want to quickly create policies using predefined tiers so that I can serve more customers efficiently
- As a SUPERVISOR, I want to review tier-based policies quickly so that approval is faster

**Acceptance Criteria**:

- [ ] System supports 6 fixed coverage tiers (R30k-R200k)
- [ ] Premium calculation is automatic based on tier selection
- [ ] Tier selection UI is simple and mobile-friendly
- [ ] Historical custom policies remain accessible but new policies use tiers only

**Priority**: High
**Estimated Effort**: 5 story points
**Dependencies**: Database schema update, pricing calculation service

---

#### **Feature 3: What3Words Address Integration**

**Description**: Integrate What3Words (W3W) API for location verification in rural areas without traditional street addresses. This allows customers and agents to precisely identify property locations using a 3-word address format.

**User Stories**:

- As an AGENT, I want to capture property location using What3Words so that I can insure homes without street addresses
- As a CUSTOMER, I want my rural home to be accurately located so that claims assessors can find my property
- As a SUPERVISOR, I want to verify property locations on a map so that I can approve policies with confidence

**Acceptance Criteria**:

- [ ] What3Words API integration for address lookup
- [ ] Map display showing W3W location
- [ ] Address validation and verification workflow
- [ ] Mobile-friendly W3W input interface
- [ ] Fallback to GPS coordinates if W3W unavailable

**Priority**: High
**Estimated Effort**: 8 story points
**Dependencies**: What3Words API subscription, map integration service

---

### **Enhancements to Existing Features**

#### **Enhancement 1: Claims Processing Workflow**

**Current State (V1)**: Claims require manual review at multiple stages with limited automation
**Proposed Changes**:

- Add automated claim validation for common claim types
- Implement supervisor bulk-approval interface
- Add claim status notifications via SMS
- Integrate document upload from mobile app

**Rationale**: Reduce claims processing time by 50% to meet V2 targets
**Impact**: Customers get faster payouts, supervisors have reduced workload, staff efficiency improves

---

#### **Enhancement 2: Agent Dashboard**

**Current State (V1)**: Basic policy creation interface with limited analytics
**Proposed Changes**:

- Add agent performance metrics (policies created, approval rate)
- Implement quick-create workflow for tier-based policies
- Add customer search and history view
- Mobile-responsive agent interface

**Rationale**: Improve agent productivity and enable mobile-first agent workflow
**Impact**: Agents can create policies faster, work from mobile devices in the field

---

#### **Enhancement 3: Notification System**

**Current State (V1)**: Email and SMS notifications for basic events
**Proposed Changes**:

- Add WhatsApp notification channel (via Twilio)
- Implement customer notification preferences
- Rich notifications with policy/claim details
- Multi-language support (English, isiZulu, isiXhosa, Afrikaans)

**Rationale**: Improve customer communication in rural areas where WhatsApp is more accessible than email
**Impact**: Higher notification engagement rates, better customer experience

---

### **Features to Deprecate or Remove**

_[To be filled: Are any V1 features being removed?]_

| Feature                                    | Reason for Removal                          | Migration Path                                                          |
| ------------------------------------------ | ------------------------------------------- | ----------------------------------------------------------------------- |
| clerk dependency for mobile authentication | Diificult to implelment properly and simply | users have to use their phone numbers and recieve an otp to access app. |

---

## 👥 **USER PERSONAS & ROLES**

### **V1 Roles** (Continuing in V2)

1. **Customer** - End users buying insurance
2. **Agent** - Sales agents creating policies
3. **Underwriter** - Risk assessment specialists
4. **Staff** - Customer support staff
5. **Admin** - System administrators

### **New V2 Roles** (If Any)

1. **Supervisor** - Monitors and has higher previlieges than agent and can approve/deny policy and claims
2. **SuperAdmin** - System administrators
3. **Admin** - User Admin

**Key Note:**

#### **[New Role Name]**

_The (Admin, SuperAdmin) split up the task of just the single admin_
_Underwriter role has been deleted and replaced my Supervisor Role_

---

## 🏗️ **TECHNICAL REQUIREMENTS**

### **Architecture Changes**

_[To be filled: Will the architecture change significantly?]_

**Current V1 Architecture**:

- Frontend: Next.js 15 + React 19
- API: tRPC
- Database: MongoDB + Prisma
- Auth: Dual (Clerk + JWT)

**Proposed V2 Changes**:

- [x] Keep current architecture
- [ ] Remove clerk dependency for mobile auth: Users will have to auth using OTP sent to their phone. Here is how it will work. A user will input their Policy Number, that policy will be looked up on the database and will retrieve the number of the customer owning that policy in a hidden format (083XXXX16). The user will be prompted to input their details and an otp will be sent to their phone for auth.

**Rationale**: These changes are included because of the complex nature of relying on external clerk auth systems to manage session handling.

---

---

### **Performance Requirements**

| Metric                  | V1 Performance | V2 Target        | Priority |
| ----------------------- | -------------- | ---------------- | -------- |
| API Response Time       | <50ms          | <40ms            | High     |
| Page Load Time          | <2s            | <1.5s            | High     |
| Mobile App Load Time    | N/A            | <2s              | High     |
| Database Queries        | <100ms         | <75ms            | Medium   |
| Concurrent Users        | 100            | 1,000            | High     |
| What3Words API Response | N/A            | <300ms           | Medium   |
| OTP Delivery Time       | N/A            | <30s             | High     |
| Uptime                  | 99.9%          | 99.95%           | Critical |
| Mobile Data Usage       | N/A            | <5MB per session | High     |

---

### **Security & Compliance**

**Current (V1)**:

- POPI Act compliance (South Africa)
- FAIS compliance
- OWASP Top 10 protections

**New Requirements for V2**:

- [x] OTP-based authentication security (rate limiting, brute force protection)
- [x] Mobile session management (30-day expiry, secure token storage)
- [x] What3Words data privacy compliance
- [x] Multi-factor authentication for admin/supervisor roles
- [x] Enhanced audit logging for all policy/claim approvals
- [x] Secure API endpoints for mobile app communication
- [x] Data encryption at rest and in transit
- [x] Regular security penetration testing (quarterly)
- [x] GDPR-like consent management for customer data

---

### **Scalability Requirements**

**Expected Growth**:

- Users: 500 → 5,000 (10x)
- Policies: 300 → 3,000 (10x)
- Claims/month: 50 → 500 (10x)
- Agent Users: 10 → 50 (5x)
- Mobile App Users: 0 → 3,500 (70% of customers)
- Countries: 1 → 1 (South Africa rural focus)

**Scalability Needs**:

- [x] Horizontal scaling for API servers (containerized deployment)
- [x] Database connection pooling and read replicas
- [x] CDN for static assets and mobile app assets
- [x] Caching layer (Redis) for frequently accessed data
- [x] Queue system for async operations (email, SMS, notifications)
- [x] Load balancing for high availability
- [x] Auto-scaling based on traffic patterns
- [x] Mobile API rate limiting and throttling

---

## 🌍 **MARKET & REGIONAL REQUIREMENTS**

### **Target Market: South Africa (Rural Focus)**

**V2 maintains exclusive focus on South African rural communities**

**Market Details**:

- **Country**: South Africa (Rural Areas)
- **Currency**: South African Rand (R)
- **Payment Gateway**: Paystack (with mobile money support)
- **Phone Format**: +27 (South African mobile numbers)
- **Languages Supported**:
  - English (primary)
  - isiZulu
  - isiXhosa
  - Afrikaans
- **Regulations**:
  - POPI Act (Protection of Personal Information)
  - FAIS (Financial Advisory and Intermediary Services Act)
  - FSB (Financial Services Board) regulations
- **Insurance Focus**: Home Insurance Only
- **Coverage Range**: R30,000 - R200,000
- **Geographic Coverage**:
  - Rural areas across all 9 provinces
  - Properties without traditional street addresses
  - What3Words address support for location identification

**V2 Regional Enhancements**:

- [x] Improved mobile network compatibility (2G/3G friendly)
- [x] Offline-capable mobile features
- [x] Low-bandwidth optimizations
- [x] Multi-language SMS and WhatsApp notifications
- [x] Rural-specific payment options (cash collection via agents)

---

## 💼 **BUSINESS REQUIREMENTS**

### **Revenue Model**

**V1 Model**: Premium-based revenue with customizable policy pricing

**V2 Changes**:

- [x] Simplified tier-based premium structure
- [x] Agent commission model (5-10% of premium)
- [x] Premium calculation based on coverage tier and risk assessment
- [x] Monthly/annual premium payment options
- [x] Agent cash collection with digital reconciliation

**Revenue Streams**:

1. **Policy Premiums** (Primary): Monthly/annual payments from active policies
2. **Renewal Commissions**: Automated renewal premium collection
3. **Agent Network**: Commission-based agent sales model

---

### **Pricing Strategy**

**Tier-Based Pricing Structure**

| Coverage Tier | Monthly Premium (Est.) | Annual Premium (Est.) | Target Market           |
| ------------- | ---------------------- | --------------------- | ----------------------- |
| R30,000       | R150 - R200            | R1,800 - R2,400       | Entry-level rural homes |
| R50,000       | R220 - R280            | R2,640 - R3,360       | Standard rural homes    |
| R75,000       | R300 - R380            | R3,600 - R4,560       | Mid-tier rural homes    |
| R100,000      | R380 - R450            | R4,560 - R5,400       | Upper rural homes       |
| R150,000      | R520 - R620            | R6,240 - R7,440       | Premium rural homes     |
| R200,000      | R650 - R780            | R7,800 - R9,360       | High-value rural homes  |

**Pricing Rationale**:

- Simplified tier structure reduces complexity for customers and agents
- Affordable monthly options (<R800/month) for rural households
- Transparent pricing builds trust in underserved markets
- Annual payment discount (10-15%) encourages commitment

---

### **Partnership & Integration Requirements**

**Current Integrations (V1)**:

- Clerk (Customer Auth) - **To be deprecated**
- Paystack (Payments) - **Continuing**
- Resend (Email) - **Continuing**
- Twilio (SMS) - **Continuing + Enhanced**
- PostHog (Analytics) - **Continuing**

**New Integrations for V2**:

- [x] **What3Words API**: Location addressing for rural properties without street addresses
- [x] **Custom OTP Service**: Replace Clerk with custom OTP authentication system
- [x] **Twilio WhatsApp**: WhatsApp messaging integration for rural customers
- [x] **Google Maps API**: Map visualization for property locations (with W3W integration)
- [x] **Mobile Payment Gateway**: Integration for rural mobile money transactions (optional)

**Integration Priorities**:

1. High Priority: What3Words, Custom OTP, WhatsApp
2. Medium Priority: Enhanced Maps, Mobile Payment
3. Low Priority: Additional analytics integrations

---

## 📱 **PLATFORM REQUIREMENTS**

### **Web Application** (Current)

- ✅ Desktop responsive
- ✅ Mobile responsive
- Browser support: Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Agent and staff web portal
- ✅ Admin dashboard
- ✅ Supervisor approval interface

### **Mobile Application** (V2 Priority)

**Selected Approach**: Progressive Web App (PWA)

- [x] **Progressive Web App (PWA)** - Primary mobile solution
  - Installable on Android/iOS without app stores
  - Offline capabilities for rural areas
  - Low bandwidth optimization
  - Camera access for document uploads
  - OTP-based authentication
  - Push notifications support

**Rationale**:

- PWA eliminates app store submission delays
- Lower development cost than native apps
- Works across all devices with modern browsers
- Offline-first design suits rural connectivity
- Easy updates without app store approval
- Smaller download size than native apps

**Future Consideration**:

- Native apps (React Native) may be considered post-V2 based on user demand

---

## 🎨 **UI/UX REQUIREMENTS**

### **Design Changes**

**V1 Design**: Modern, clean interface with shadcn/ui components

**V2 Changes**: Incremental improvements with mobile-first focus

- [x] **Incremental improvements** - Maintain brand consistency while optimizing for mobile
- [x] Simplified policy creation workflow
- [x] Mobile-first responsive design
- [x] Touch-friendly interface elements (minimum 44px tap targets)
- [x] Reduced form complexity (tier-based selection)
- [x] Visual hierarchy for rural users with varying literacy levels

**Design Goals**:

1. **Simplicity**: Reduce cognitive load with clear, simple interfaces
2. **Mobile-First**: Optimize for mobile/tablet usage in the field
3. **Visual Clarity**: High contrast, large text, clear icons for accessibility
4. **Speed**: Fast loading, minimal interactions to complete tasks
5. **Trust**: Professional, consistent branding to build confidence
6. **Multilingual**: Support for local languages (isiZulu, isiXhosa, Afrikaans)
7. **Offline-Ready**: Clear indicators for offline/online status

**Key UI Improvements**:

- Simplified navigation (max 3 levels deep)
- Progress indicators for multi-step processes
- Visual feedback for all actions
- Error messages in plain language
- Icon-based navigation for low-literacy users

---

### **Accessibility Requirements**

**Target Standards**:

- [x] **WCAG 2.1 Level AA** (Primary target)
- [x] High contrast mode support
- [x] Screen reader compatibility
- [x] Keyboard navigation support
- [x] Touch-friendly design (rural mobile users)
- [x] Low-literacy friendly design (icons, visual cues)
- [x] Multi-language support (4 South African languages)
- [x] Offline accessibility for poor connectivity areas

**Specific Requirements**:

- Color contrast ratio 4.5:1 minimum for text
- Text resizing up to 200% without loss of functionality
- Alternative text for all images
- Form labels and error messages clearly visible
- Touch targets minimum 44x44px

---

## 📅 **TIMELINE & MILESTONES**

### **Development Phases**

**Target Launch**: Q4 2025 (16-week timeline)

#### **Phase 1: Planning & Design** (Weeks 1-3) - Oct 2025

- [x] Finalize PRD (completed)
- [ ] Technical design documentation
- [ ] Mobile PWA UI/UX mockups
- [ ] What3Words integration architecture
- [ ] OTP authentication system design
- [ ] Database schema updates for tier-based policies

#### **Phase 2: Foundation** (Weeks 4-6) - Oct-Nov 2025

- [ ] Database schema migration (tier-based policies)
- [ ] Custom OTP authentication system implementation
- [ ] Session management for mobile (30-day expiry)
- [ ] What3Words API integration
- [ ] PWA foundation setup
- [ ] Supervisor role implementation

#### **Phase 3: Feature Development** (Weeks 7-11) - Nov 2025

- [ ] Tier-based policy creation (6 tiers)
- [ ] Mobile OTP login flow
- [ ] What3Words property location
- [ ] Agent mobile interface
- [ ] Supervisor approval workflow
- [ ] WhatsApp notifications (Twilio)
- [ ] Multi-language support (4 languages)
- [ ] Offline PWA capabilities
- [ ] Enhanced claims processing

#### **Phase 4: Testing & QA** (Weeks 12-14) - Dec 2025

- [ ] Unit testing (maintain 90%+ coverage)
- [ ] Integration testing (OTP, W3W, payments)
- [ ] E2E testing (policy creation to claim)
- [ ] Mobile device testing (various Android/iOS)
- [ ] Offline functionality testing
- [ ] Load testing (1000 concurrent users)
- [ ] Security penetration testing
- [ ] UAT with agents and supervisors

#### **Phase 5: Launch** (Weeks 15-16) - Dec 2025

- [ ] Beta program (50 rural users)
- [ ] Agent training program
- [ ] Production deployment
- [ ] Monitoring & analytics setup
- [ ] Performance optimization
- [ ] Stabilization & bug fixes

**Total Timeline**: 16 weeks / 4 months (Oct - Dec 2025)

---

## 🧪 **TESTING REQUIREMENTS**

### **Test Coverage Targets**

| Test Type         | V1 Coverage | V2 Target | Priority |
| ----------------- | ----------- | --------- | -------- |
| Unit Tests        | 90%+        | 90%+      | High     |
| Integration Tests | 85%+        | 88%+      | High     |
| E2E Tests         | 80%+        | 85%+      | High     |
| Mobile PWA Tests  | N/A         | 80%+      | High     |
| Overall           | 88%         | 90%+      | Critical |

---

### **Testing Strategy**

**V2 Testing Approach**:

- [x] **Test-driven development (TDD)** for critical features (OTP, payments, claims)
- [x] **Automated regression testing** on every deployment
- [x] **Performance testing** (API response times, mobile load times)
- [x] **Security testing** (OWASP Top 10, penetration testing)
- [x] **Load testing** (1000+ concurrent users)
- [x] **Mobile device testing** (multiple Android/iOS devices)
- [x] **Offline functionality testing** (PWA offline mode)
- [x] **User acceptance testing (UAT)** with rural agents and customers
- [x] **Integration testing** (What3Words, OTP, payments, WhatsApp)
- [x] **Accessibility testing** (WCAG 2.1 AA compliance)

**Testing Tools**:

- Vitest/Jest for unit tests
- Playwright for E2E tests
- Lighthouse for performance/PWA audits
- PostHog for real user monitoring
- Manual testing with rural users

---

## 🚀 **DEPLOYMENT & ROLLOUT**

### **Deployment Strategy**

**Chosen Approach**: **Phased Rollout with Feature Flags**

**Deployment Plan**:

- [x] **Feature flags** for gradual feature enablement
- [x] **Phased rollout** by user type (agents first, then customers)
- [x] **Blue-green deployment** for zero-downtime releases
- [x] **Canary releases** for high-risk features (OTP auth, What3Words)

**Rationale**:

- Phased approach reduces risk with new OTP authentication
- Feature flags allow quick rollback if issues arise
- Agent testing before customer rollout ensures quality
- Blue-green deployment maintains 99.95% uptime target

**Rollout Phases**:

1. **Week 1**: Internal team testing
2. **Week 2**: Agent beta (10 agents)
3. **Week 3**: Expanded agent rollout (50 agents)
4. **Week 4**: Customer beta (50 rural customers)
5. **Week 5+**: Full production rollout

---

### **Migration Plan**

**Data Migration**: Full migration of all V1 data

- [x] **Full migration** - All existing policies, claims, users
- [x] Policy data transformation (custom → tier mapping)
- [x] User authentication migration (Clerk → OTP system)
- [x] Historical data preservation
- [x] Agent/staff user migration

**User Migration**:

- [x] **Automatic migration** for agents, staff, admin roles
- [x] **Opt-in migration** for customers (activate mobile via OTP)
- [x] Legacy Clerk auth maintained for 30 days during transition
- [x] Customer notification campaign (SMS/Email/WhatsApp)

**Migration Timeline**:

- Week 1-2: Database schema migration
- Week 2-3: Staff/agent account migration
- Week 3-4: Customer notification and opt-in period
- Week 4+: Full V2 operation, V1 auth deprecation

**Rollback Plan**:

- Database backups before each migration step
- Feature flags to disable new features if needed
- Dual authentication support during transition

---

## 📊 **MONITORING & ANALYTICS**

### **Metrics to Track**

**Technical Metrics**:

- [x] API response times (target <40ms)
- [x] Page load times (target <1.5s)
- [x] Mobile PWA load times (target <2s)
- [x] Database query performance (target <75ms)
- [x] Error rates and exceptions
- [x] Uptime and availability (target 99.95%)
- [x] OTP delivery success rate (target >98%)
- [x] What3Words API response times
- [x] Concurrent user capacity
- [x] Mobile data usage per session

**Business Metrics**:

- [x] Policy creation rate (daily/weekly)
- [x] Agent-created vs. self-service policies
- [x] Policy approval rate by supervisors
- [x] Claims processing time (target 2.5 days)
- [x] Customer acquisition cost
- [x] Policy renewal rate
- [x] Revenue per user
- [x] Premium payment success rate
- [x] Agent performance metrics

**User Metrics**:

- [x] Daily/monthly active users
- [x] Mobile app adoption rate (target 70%)
- [x] User session duration
- [x] Feature usage analytics
- [x] Customer satisfaction score (target 4.5/5)
- [x] Mobile vs. web usage split
- [x] OTP authentication success rate
- [x] User retention rate
- [x] Support ticket volume

**Monitoring Tools**:

- PostHog for product analytics
- Sentry for error tracking
- Render metrics for infrastructure monitoring
- Custom dashboards for business metrics

---

## 💰 **BUDGET & RESOURCES**

### **Budget Breakdown**

**Estimated 4-Month V2 Development Budget**

| Category             | Monthly Cost | 4-Month Total | Priority | Notes                           |
| -------------------- | ------------ | ------------- | -------- | ------------------------------- |
| Development          | -            | In-house      | High     | Existing development team       |
| Infrastructure       | R5,000       | R20,000       | High     | Render, MongoDB, Redis          |
| Third-party Services | R3,500       | R14,000       | High     | What3Words, Twilio, Paystack    |
| Design/UI/UX         | -            | R15,000       | Medium   | Freelance for mobile mockups    |
| Testing              | R2,000       | R8,000        | High     | Device testing, security audit  |
| Marketing/Training   | R5,000       | R20,000       | Medium   | Agent training, user onboarding |
| Contingency (15%)    | -            | R11,550       | -        | Unexpected costs                |
| **Total**            | **~R15,500** | **~R88,550**  | -        | **Approx. 4-month budget**      |

**Third-Party Service Costs** (Monthly):

- What3Words API: R1,500/month (estimated)
- Twilio (SMS + WhatsApp): R1,500/month
- Paystack: Transaction-based (no fixed cost)
- Render hosting: R3,000/month (scaled)
- MongoDB Atlas: R1,000/month
- Other services: R500/month

---

### **Team Requirements**

**V2 Development Team** (16-week timeline)

| Role                | Headcount | Duration   | Allocation |
| ------------------- | --------- | ---------- | ---------- |
| Product Manager     | 1         | 16 weeks   | 50%        |
| Tech Lead/Architect | 1         | 16 weeks   | 100%       |
| Backend Developers  | 2         | 16 weeks   | 100%       |
| Frontend Developers | 2         | 16 weeks   | 100%       |
| UI/UX Designer      | 1         | Weeks 1-6  | 50%        |
| QA Engineer         | 1         | Weeks 8-16 | 75%        |
| DevOps Engineer     | 1         | As needed  | 25%        |

**Additional Support**:

- Business Analyst (requirements clarification): As needed
- Security Consultant (penetration testing): Week 12-14
- Agent Trainer (user training): Week 14-16

---

## ⚠️ **RISKS & MITIGATION**

### **Identified Risks**

| Risk                                   | Probability | Impact | Mitigation Strategy                                                                                    |
| -------------------------------------- | ----------- | ------ | ------------------------------------------------------------------------------------------------------ |
| **OTP Authentication Adoption Issues** | Medium      | High   | Comprehensive user testing, clear instructions, SMS/WhatsApp support, fallback support channels        |
| **What3Words API Downtime**            | Low         | Medium | Fallback to GPS coordinates, cache W3W data, SLA monitoring, alternative location methods              |
| **Rural Connectivity Challenges**      | High        | High   | Offline-first PWA design, data sync when online, low-bandwidth optimization, agent-assisted onboarding |
| **Mobile Device Fragmentation**        | Medium      | Medium | Extensive device testing, progressive enhancement, graceful degradation for older devices              |
| **Agent Training Gaps**                | Medium      | High   | Comprehensive training program, ongoing support, in-app help, simplified workflows                     |
| **Data Migration Issues**              | Medium      | High   | Thorough testing, staged migration, rollback plan, dual system operation during transition             |
| **Security Vulnerabilities**           | Low         | High   | Security audits, penetration testing, OWASP compliance, rate limiting on OTP, monitoring               |
| **Supervisor Bottleneck**              | Medium      | Medium | Bulk approval tools, automated validation, clear SLA expectations, adequate supervisor staffing        |
| **Customer Confusion**                 | Medium      | Medium | User education campaign, multi-channel support, simplified UI, agent assistance program                |
| **Third-Party Service Costs**          | Low         | Medium | Budget monitoring, usage optimization, negotiate contracts, explore alternatives if needed             |
| **Timeline Delays**                    | Medium      | Medium | Agile methodology, sprint planning, regular reviews, prioritize P0 features, buffer time built in      |
| **Low Mobile App Adoption**            | Medium      | High   | Incentive program, agent promotion, user education, clear value proposition, ease of installation      |

---

## 🎯 **SUCCESS CRITERIA**

### **V2 Launch Criteria**

**Go-Live Readiness Checklist**

**Technical Criteria**:

- [ ] **All P0 features complete**
  - OTP authentication system functional
  - Tier-based policy creation working
  - What3Words integration operational
  - Mobile PWA installable and functional
  - Supervisor approval workflow complete
  - Claims processing enhanced
- [ ] **Test coverage ≥90%** (unit, integration, E2E)
- [ ] **Performance targets met**
  - API response <40ms
  - Page load <1.5s
  - Mobile load <2s
  - OTP delivery <30s
- [ ] **Security audit passed** (penetration testing, OWASP compliance)
- [ ] **Zero critical bugs, <5 high-priority bugs**
- [ ] **Infrastructure ready** (scaled for 1000 concurrent users)
- [ ] **Monitoring and alerts configured** (PostHog, Sentry, uptime)

**Business Criteria**:

- [ ] **UAT approved** by agents, supervisors, and customers
- [ ] **Documentation complete**
  - User manual updated
  - Agent training materials
  - API documentation for mobile
  - Support knowledge base
- [ ] **Support team trained** on new features and processes
- [ ] **Agent training completed** (minimum 30 agents trained)
- [ ] **Marketing materials ready** (SMS campaigns, WhatsApp templates)
- [ ] **Legal compliance verified** (POPI Act, FAIS)
- [ ] **Data migration successfully completed** with validation
- [ ] **Rollback plan tested and ready**

**Success Metrics (Post-Launch - 90 Days)**:

- [ ] 70% mobile app adoption rate
- [ ] 90% agent-created policies
- [ ] 2.5 day average claims processing time
- [ ] 99.95% uptime achieved
- [ ] 4.5/5 customer satisfaction score
- [ ] 10x user growth initiated

---

## 📚 **APPENDIX**

### **A. Glossary**

| Term                    | Definition                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| **OTP**                 | One-Time Password - A temporary code sent via SMS for authentication                              |
| **W3W / What3Words**    | A geocoding system that divides the world into 3m x 3m squares, each with a unique 3-word address |
| **PWA**                 | Progressive Web App - A web application that behaves like a native mobile app                     |
| **Tier-based Coverage** | Fixed coverage amounts (R30k-R200k) instead of customizable policy amounts                        |
| **Supervisor**          | User role with approval authority over agent-created policies and claims                          |
| **POPI Act**            | Protection of Personal Information Act - South African data protection law                        |
| **FAIS**                | Financial Advisory and Intermediary Services Act - South African financial services regulation    |
| **Agent**               | Field representative who creates policies on behalf of customers                                  |
| **Rural Insurance**     | Insurance products designed for customers in rural areas without traditional street addresses     |
| **Session Management**  | System for maintaining user login state with 30-day expiry for mobile users                       |
| **Paystack**            | Payment gateway used for processing premium payments in South Africa                              |
| **tRPC**                | TypeScript Remote Procedure Call - Type-safe API framework used in the application                |
| **Clerk**               | Third-party authentication service being deprecated in V2                                         |
| **Blue-Green Deploy**   | Deployment strategy using two identical environments for zero-downtime releases                   |
| **Feature Flag**        | Toggle mechanism to enable/disable features without code deployment                               |
| **UAT**                 | User Acceptance Testing - Final testing phase with actual users before production release         |
| **SLA**                 | Service Level Agreement - Commitment to specific performance/availability standards               |
| **E2E Testing**         | End-to-End Testing - Testing complete user workflows from start to finish                         |
| **CDN**                 | Content Delivery Network - Distributed server network for fast content delivery                   |
| **WCAG**                | Web Content Accessibility Guidelines - International accessibility standards                      |

### **B. Related Documents**

- [V1 Complete State Snapshot](./archive/V1_COMPLETE_STATE_SNAPSHOT.md)
- [V1 to V2 Transition Guide](./archive/V1_TO_V2_TRANSITION_GUIDE.md)
- [Archival Progress Tracker](./transition/ARCHIVAL_PROGRESS_TRACKER.md)
- [V1 API Documentation](./external/TRPC_API_DOCUMENTATION.md)
- [V1 User Manual](./USER_MANUAL.md)

### **C. Stakeholder Sign-off**

**Pending Approval**

| Stakeholder      | Role           | Approval Date | Status  |
| ---------------- | -------------- | ------------- | ------- |
| Product Owner    | Product Owner  | Pending       | Pending |
| Technical Lead   | Tech Lead      | Pending       | Pending |
| Business Owner   | Business Owner | Pending       | Pending |
| Legal/Compliance | Compliance     | Pending       | Pending |

---

## 📝 **DOCUMENT REVISION HISTORY**

| Version  | Date       | Author   | Changes                  |
| -------- | ---------- | -------- | ------------------------ |
| 0.1      | 2025-10-08 | AI Agent | Initial template created |
| [Future] | [Date]     | [Author] | [Changes]                |

---

**Document Status**: 🚧 **DRAFT - REQUIRES COMPLETION**

**Next Steps**:

1. Product team to fill in all "[To be filled]" sections
2. Stakeholder review and feedback
3. Technical feasibility review
4. Budget approval
5. Final sign-off
6. Begin V2 development

---

**This PRD template is based on the complete V1.0.0 foundation. Review the V1 documentation linked above to understand the current state before planning V2 features.**
