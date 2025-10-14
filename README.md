# Lalisure - Home Insurance Platform

A modern, full-stack home insurance management platform built with Next.js 15, TypeScript, and Paystack integration for the South African market.

## 🏠 Overview

**Lalisure** is a comprehensive insurance management platform that serves customers, agents, underwriters, and administrators. The platform provides end-to-end home insurance management with policy creation, claims processing, payment handling, and customer communication features. Built specifically for South Africa with ZAR currency and local payment integration via Paystack.

### 🚀 **Current Status**: **100% Complete - Production Ready** ✅

> **V1.0.0 Archive**: This version has been archived. See [Version Archive](#-version-archive) below for details.
> **Active Development**: V2.0.0 is now in development on branch `develop/v2-new-prd`

- ✅ **Core Infrastructure**: Complete database models, tRPC API, authentication system
- ✅ **Staff Portal**: Full login/register system with role-based access
- ✅ **Customer Portal**: Complete policy management, claims processing, payments
- ✅ **Admin Dashboard**: Comprehensive user management, analytics, system configuration
- ✅ **Email Service**: Advanced email system with tracking and analytics
- ✅ **Security Center**: Real-time security monitoring and event logging
- ✅ **Analytics System**: Full analytics dashboard with real-time data
- ✅ **Bulk Operations**: Admin bulk actions for users and policies
- ✅ **Production Ready**: Successfully builds and deploys on Render

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm run
- MongoDB database
- Redis (optional, for caching)
- Docker (for development environment)

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd lalisure
   npm run install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development environment:**

   ```bash
   # Start MongoDB and Redis with Docker
   docker-compose up -d

   # Generate Prisma client and seed database
   npm run db:generate
   npm run db:push
   npm run db:seed

   # Start development server
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

### 🔐 **Staff Access Methods**

For staff members (agents, underwriters, admins), use one of the following methods:

#### **Method 1: Direct URL Access**

Navigate to: `http://localhost:3000/staff/login`

#### **Method 2: Keyboard Shortcuts** (when on the main site)

- Press `Ctrl + Shift + S` (Windows/Linux)
- Press `Cmd + Shift + S` (Mac)

#### **Method 3: Admin Corner**

- Click in the bottom-right corner of any page 3 times
- A staff access modal will appear

#### **Method 4: Special URLs**

- `/staff-portal` - Redirects to staff login
- `/admin-access` - Redirects to admin login
- `/team-login` - Redirects to staff login

### 📱 **Mobile Access**

- Use the keyboard shortcut method
- Admin corner works on touch devices
- Access is optimized for mobile browsers

## 📁 Project Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── customer/                 # Customer portal (policies, claims, payments)
│   │   ├── dashboard/            # Customer dashboard
│   │   ├── policies/             # Policy management pages
│   │   ├── claims/               # Claims processing pages
│   │   └── payments/             # Payment & billing pages
│   ├── staff/                    # Staff portal (agents, admins, underwriters)
│   │   ├── login/                # Staff login page
│   │   ├── register/             # Staff registration page
│   │   └── [role]/               # Role-specific dashboards
│   ├── admin/                    # Admin portal
│   │   ├── dashboard/            # Admin dashboard
│   │   ├── users/                # User management
│   │   ├── email-analytics/      # Email performance analytics
│   │   ├── analytics/            # System analytics
│   │   ├── security/             # Security monitoring
│   │   ├── settings/             # System configuration
│   │   └── invitations/          # User invitation management
│   ├── agent/                    # Agent portal
│   │   ├── dashboard/            # Agent dashboard
│   │   ├── customers/            # Customer management
│   │   ├── policies/             # Policy oversight
│   │   └── claims/               # Claims processing
│   ├── underwriter/              # Underwriter portal
│   │   ├── dashboard/            # Underwriter dashboard
│   │   ├── risk-assessment/      # Risk assessment tools
│   │   └── policies/             # Policy underwriting
│   ├── api/                      # API routes
│   │   ├── staff/                # Staff authentication APIs
│   │   │   ├── login/            # Staff login endpoint
│   │   │   └── register/         # Staff registration endpoint
│   │   ├── cron/                 # Scheduled tasks
│   │   │   └── email-retry/      # Email retry scheduler
│   │   ├── trpc/                 # tRPC API endpoints
│   │   ├── webhooks/             # External service webhooks
│   │   │   ├── clerk/            # Clerk authentication webhooks
│   │   │   ├── paystack/         # Paystack payment webhooks
│   │   │   └── resend/           # Email webhook handler
│   │   └── uploadthing/          # File upload endpoints
│   ├── contact/                  # Contact page
│   ├── products/                 # Products/Services page
│   ├── about/                    # About page
│   ├── support/                  # Support & Help center
│   └── onboarding/               # User onboarding flow
├── components/                   # Reusable React components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout components
│   ├── policies/                # Policy-specific components
│   ├── claims/                  # Claims-specific components
│   ├── admin/                   # Admin-specific components
│   ├── agent/                   # Agent-specific components
│   ├── customer/                # Customer-specific components
│   ├── providers/               # React context providers
│   ├── analytics/               # Analytics components
│   ├── communication/           # Communication components
│   ├── reports/                 # Reporting components
│   └── support/                 # Support components
├── lib/                         # Shared utilities and services
│   ├── auth/                    # Authentication utilities
│   │   ├── staff-auth.ts        # Staff authentication
│   │   └── index.ts             # Main auth exports
│   ├── services/                # Business logic services
│   │   ├── paystack.ts          # Paystack payment service
│   │   ├── premium-calculator.ts # Insurance premium calculator
│   │   ├── email.ts             # Advanced email service with tracking
│   │   ├── sms.ts               # SMS service
│   │   ├── notification.ts      # Notification service
│   │   ├── analytics.ts         # Analytics service
│   │   ├── security-logger.ts   # Security event logging
│   │   └── what3words.ts        # Location service
│   ├── validations/             # Zod validation schemas
│   ├── utils/                   # Helper functions
│   └── db.ts                    # Database connection
├── server/                      # tRPC server configuration
│   └── api/                     # API router definitions
├── middleware.ts                # Next.js middleware
├── providers.tsx               # React providers setup
└── trpc/                        # tRPC client setup
```

### Key Directories Explained

- **`app/`** - Next.js App Router with role-based portals
- **`components/`** - Feature-organized reusable UI components
- **`lib/services/`** - Business logic services (Paystack, Premium Calculator, etc.)
- **`server/api/`** - tRPC API endpoints with end-to-end type safety
- **`prisma/`** - Database schema and migrations
- **`docs/`** - Comprehensive documentation
- **`tests/`** - Test suites and fixtures

## 🛠 Tech Stack

### Frontend

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui + custom components
- **State:** TanStack Query + Zustand
- **Forms:** React Hook Form + Zod validation

### Backend

- **API:** tRPC for type-safe APIs
- **Database:** MongoDB with Prisma ORM
- **Authentication:** Clerk
- **File Storage:** UploadThing
- **Payments:** Paystack (South African market)
- **Email:** Resend with webhook tracking and analytics
- **SMS:** Twilio
- **Webhooks:** Real-time webhook processing for emails and payments

### DevOps & Testing

- **Testing:** Vitest + Playwright + React Testing Library
- **Deployment:** Render (Production) | Vercel (Staging)
- **Monitoring:** PostHog + Error Tracking
- **Development:** Docker for local services
- **CI/CD:** Automated build and deployment pipelines

## 🏗 Architecture Patterns

### 1. Feature-Based Organization

Components and pages are organized by business features (policies, claims, payments) rather than technical concerns.

### 2. Type-Safe APIs

All API communication uses tRPC for end-to-end type safety between client and server.

### 3. Service Layer Pattern

Business logic is encapsulated in service classes (`PaystackService`, `PremiumCalculator`) for reusability and testing.

### 4. Role-Based Access Control

Built-in RBAC with Customer, Agent, Admin, and Underwriter roles.

## 🚦 Development Workflow

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Database Management

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Open Prisma Studio
npm run db:studio

# Seed development data
npm run db:seed
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run build  # Includes type checking
```

## 🔧 Configuration

### Environment Variables

| Variable                            | Description               | Required |
| ----------------------------------- | ------------------------- | -------- |
| `DATABASE_URL`                      | MongoDB connection string | Yes      |
| `PAYSTACK_SECRET_KEY`               | Paystack secret key       | Yes      |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`   | Paystack public key       | Yes      |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication      | Yes      |
| `CLERK_SECRET_KEY`                  | Clerk secret key          | Yes      |
| `UPLOADTHING_SECRET`                | File upload service       | Yes      |
| `RESEND_API_KEY`                    | Email service             | Optional |
| `RESEND_FROM_EMAIL`                 | Email sender address      | Optional |
| `TWILIO_*`                          | SMS notifications         | Optional |
| `WEBHOOK_SECRET`                    | Webhook signature secret  | Optional |

### Production Environment

| Variable         | Production URL                              | Description           |
| ---------------- | ------------------------------------------- | --------------------- |
| **Frontend**     | `https://lalisure.onrender.com`             | Main application URL  |
| **API Base**     | `https://lalisure.onrender.com/api/`        | Backend API endpoints |
| **Staff Portal** | `https://lalisure.onrender.com/staff/login` | Staff authentication  |
| **Database**     | MongoDB Atlas Cluster                       | Production database   |

### API Endpoints (Production)

```bash
# Staff Authentication
POST https://lalisure.onrender.com/api/staff/login
POST https://lalisure.onrender.com/api/staff/register

# tRPC API
POST https://lalisure.onrender.com/api/trpc/[endpoint]

# Webhooks
POST https://lalisure.onrender.com/api/webhooks/paystack
POST https://lalisure.onrender.com/api/webhooks/clerk
POST https://lalisure.onrender.com/api/webhooks/resend

# Scheduled Tasks
POST https://lalisure.onrender.com/api/cron/email-retry

# File Upload
POST https://lalisure.onrender.com/api/uploadthing
```

### Database Schema

The platform uses MongoDB with Prisma ORM. Key models:

- **User** - Customer accounts with role-based permissions
- **Policy** - Home insurance policies with premium calculations
- **Claim** - Claims processing with document attachments
- **Payment** - Payment records with Paystack integration
- **Notification** - Multi-channel notification system
- **Email** - Email tracking with delivery status and analytics
- **EmailTracking** - Detailed email event tracking (opens, clicks)
- **SecurityEvent** - Security event logging and monitoring
- **SystemSettings** - Platform configuration and settings

## 📊 Features

### ✅ **Fully Implemented (95% Complete)**

#### **🔐 Authentication & Access Control**

- **Multi-Role Authentication**: Customer, Agent, Admin, Underwriter roles
- **Staff Registration System**: Complete staff onboarding with role assignment
- **Hidden Staff Access Methods**: Multiple secure access methods for staff
- **Clerk Integration**: Secure authentication with social login support
- **Session Management**: JWT-based sessions with automatic expiration

#### **👥 Staff Portal Features**

- **Staff Login/Register**: Dedicated authentication for staff members
- **Role-Based Dashboards**: Customized interfaces for each role
- **Secure Access Methods**:
  - Keyboard shortcuts (`Ctrl+Shift+S`)
  - Admin corner (triple-click bottom-right)
  - Special URLs (`/staff-portal`, `/admin-access`)
  - Mobile-optimized touch gestures

#### **🏠 Insurance Management**

- **Policy Creation**: Dynamic policy wizard with risk assessment
- **Premium Calculation**: Advanced pricing engine with risk factors
- **Claims Processing**: Complete workflow from submission to settlement
- **Document Management**: Secure file uploads with UploadThing
- **Payment Integration**: Paystack for South African payments (ZAR)

#### **💳 Payment & Billing**

- **Paystack Integration**: Local payment processing
- **Recurring Payments**: Subscription-based premium payments
- **Payment Verification**: Real-time transaction validation
- **Bank Account Verification**: South African bank integration
- **Multi-Currency Support**: ZAR-focused with international backup

#### **📱 User Experience**

- **Responsive Design**: Mobile-first approach
- **Progressive Web App**: PWA capabilities
- **Offline Support**: Basic functionality without internet
- **Accessibility**: WCAG compliant design
- **Multi-Language Ready**: Framework for localization

#### **📊 Analytics & Reporting**

- **PostHog Integration**: User behavior analytics
- **Admin Dashboard**: System-wide analytics and reporting
- **Email Analytics**: Comprehensive email performance tracking
- **Performance Monitoring**: Real-time system metrics
- **Business Intelligence**: Custom reporting tools

#### **📧 Email Service & Communication**

- **Advanced Email Service**: Full email tracking and analytics
- **Email Templates**: Professional template system with editor
- **Webhook Integration**: Real-time email delivery tracking
- **Bulk Email Support**: Mass email campaigns with personalization
- **Retry Mechanism**: Automatic retry for failed emails
- **Invitation System**: Seamless staff invitation workflow

#### **🛡️ Security & Monitoring**

- **Security Event Logging**: Comprehensive audit trail
- **Real-time Monitoring**: Security event detection and alerts
- **Admin Security Center**: Security settings and event management
- **Role-based Access Control**: Enhanced RBAC system
- **Bulk Operations**: Secure admin bulk actions with logging

### 🚧 **Partially Complete (20%)**

- **Advanced Fraud Detection**: Basic implementation
- **AI-Powered Features**: Foundation for automation
- **Mobile App**: PWA as interim solution

### 📋 **Planned Enhancements (5%)**

- **Advanced Analytics Dashboard**: Business intelligence tools
- **Mobile Native App**: React Native implementation
- **AI Claims Processing**: Automated document analysis
- **Advanced Security**: Enhanced fraud detection and prevention

## 🧪 Testing Strategy

### Test Coverage

- **Unit Tests** - Services, utilities, and components
- **Integration Tests** - API endpoints and database operations
- **E2E Tests** - Complete user journeys
- **Visual Tests** - Component rendering and interactions

### Test Organization

```
src/
├── **/*.test.ts(x)      # Unit tests alongside source files
tests/
├── e2e/                 # End-to-end test suites
└── fixtures/            # Test data and utilities
```

## 🔐 Security Features

### **Authentication & Access Control**

- **Multi-Role Authentication**: Customer, Agent, Admin, Underwriter roles
- **Staff Portal Security**: Dedicated authentication system for staff
- **Hidden Access Methods**: Multiple secure entry points for staff
- **Session Management**: JWT-based sessions with configurable timeouts
- **Clerk Integration**: Enterprise-grade authentication with MFA support

### **Staff Access Security**

- **Keyboard Shortcuts**: `Ctrl+Shift+S` global shortcut (configurable)
- **Admin Corner**: Triple-click bottom-right corner detection
- **URL Obfuscation**: Special URLs that redirect to staff portal
- **Gesture Recognition**: Touch and mouse gesture patterns
- **Access Logging**: Complete audit trail of staff access attempts

### **Security Monitoring & Event Logging**

- **Real-time Security Events**: Live monitoring of security activities
- **Comprehensive Audit Trail**: All admin actions logged with details
- **Security Event Types**: Login, failed login, permission changes, data access
- **Security Dashboard**: Admin interface for security event management
- **Automated Alerts**: Security threshold monitoring and notifications

### **Data Protection**

- **Input Validation**: Zod schemas for all user inputs
- **File Upload Security**: MIME type validation, size limits, virus scanning
- **Rate Limiting**: API endpoint protection with configurable thresholds
- **Encryption**: End-to-end encryption for sensitive data
- **Webhook Validation**: Secure webhook signature verification

### **Compliance**

- **POPIA Compliance**: South African data protection regulations
- **GDPR Ready**: Framework for international compliance
- **Audit Trail**: Complete logging of all system activities
- **Access Reviews**: Regular review of staff permissions and access

### **Infrastructure Security**

- **Environment Variables**: Secure configuration management
- **Database Security**: MongoDB with encrypted connections
- **API Security**: tRPC with type-safe endpoints
- **Middleware Protection**: Request validation and sanitization

## 📈 Performance Optimizations

- **Database Indexing** - Optimized queries with proper indexes
- **Image Optimization** - Next.js automatic image optimization
- **Code Splitting** - Dynamic imports and lazy loading
- **Caching** - TanStack Query for client-side caching
- **Bundle Analysis** - Webpack bundle analyzer integration

## 🤝 Contributing

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Write tests for new features
- Use conventional commit messages

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Run `npm run lint` and `npm run test`
4. Submit PR with clear description
5. Address review feedback

## 📦 **Version Archive**

### **V1.0.0 - Production Complete** (October 2025) ✅

The V1.0.0 version represents a complete, production-ready South African home insurance platform with 100% feature completion.

**Archive Access**:

- **Git Tag**: `v1.0.0-complete` (immutable reference)
- **Archive Branch**: `archive/v1-nextjs-original` (permanent copy)
- **Complete State Documentation**: [V1 Complete State Snapshot](./docs/archive/V1_COMPLETE_STATE_SNAPSHOT.md)
- **Transition Guide**: [V1 to V2 Migration Guide](./docs/archive/V1_TO_V2_TRANSITION_GUIDE.md)

**V1 Highlights**:

- 100% feature complete (Policies, Claims, Payments, Notifications)
- 88% test coverage (170+ test cases)
- 80-90% performance optimization
- Full security implementation (OWASP Top 10)
- Comprehensive monitoring (Analytics, Error Tracking, Performance)
- 42 documentation files
- Production-ready infrastructure

**Access V1 Code**:

```bash
# Via tag (immutable snapshot)
git checkout v1.0.0-complete

# Via archive branch (browsable)
git checkout archive/v1-nextjs-original

# Return to current development
git checkout develop/v2-new-prd
```

---

### **V2.0.0 - In Development** 🚧

V2 development is actively underway with new features and enhancements based on updated product requirements.

**Development Branch**: `develop/v2-new-prd`
**PRD**: [V2 Product Requirements](./docs/PRD_V2.md)
**Progress Tracker**: [Archival Progress Tracker](./docs/transition/ARCHIVAL_PROGRESS_TRACKER.md)

**V2 Approach**: Evolutionary development building on V1's solid foundation

**To Contribute to V2**:

```bash
# Checkout V2 development branch
git checkout develop/v2-new-prd

# Install dependencies
npm install

# Start development
npm run dev
```

---

## 📝 Documentation

### **📚 Documentation Hub**

All documentation is organized in the [docs/](./docs/) folder. Start here: [Documentation README](./docs/README.md)

### **🚀 Quick Start Guides**

- [Installation Guide](./docs/getting-started/installation.md) - Set up from scratch
- [OTP Authentication Quick Start](./docs/getting-started/otp-quick-start.md) - Mobile OTP login
- [First Policy Guide](./docs/getting-started/first-policy.md) - Create your first policy

### **📖 User Guides**

- [Customer Portal Guide](./docs/guides/user/customer-guide.md) - For policyholders
- [Agent Workflow Guide](./docs/guides/user/agent-guide.md) - For insurance agents
- [Admin Operations Guide](./docs/guides/user/admin-guide.md) - For administrators
- [Complete User Manual](./docs/guides/user/user-manual.md) - All roles

### **👨‍💻 Developer Documentation**

- [Developer Guide](./docs/guides/developer/README.md) - Complete development guide
- [Setup Guides](./docs/guides/developer/setup/) - Environment configuration
- [Feature Documentation](./docs/guides/developer/features/) - Feature-specific guides
- [Testing Guides](./docs/guides/developer/testing/) - Testing strategies
- [Deployment Guides](./docs/guides/developer/deployment/) - Production deployment

### **🔌 API Documentation**

- [API Overview](./docs/api/README.md) - Getting started with APIs
- [tRPC API Reference](./docs/api/TRPC_API_DOCUMENTATION.md) - Complete endpoint reference
- [Mobile API Guide](./docs/api/MOBILE_API_DOCUMENTATION.md) - Mobile integration
- [Authentication](./docs/api/authentication.md) - Auth methods

### **🏗️ Architecture Documentation**

- [System Architecture](./docs/architecture/overview.md) - Architecture overview
- [Database Schema](./docs/architecture/database-schema.md) - Database design
- [Authentication Flow](./docs/architecture/authentication-flow-security-analysis.md) - Auth architecture
- [Security Architecture](./docs/architecture/security.md) - Security design
- [Project Structure](./docs/architecture/project_breakdown.md) - Detailed breakdown
- [Flowcharts](./docs/architecture/FLOWCHARTS.md) - System diagrams

### **📋 Reference Documentation**

- [V2 Product Requirements (PRD)](./docs/reference/PRD_V2.md) - Active development requirements
- [V1 Product Requirements](./docs/reference/PRD.md) - Original specification
- [Glossary](./docs/reference/glossary.md) - Terms and definitions

### **🤝 Contributing**

- [Contributing Guide](./docs/contributing/README.md) - How to contribute
- [Code Style Guide](./docs/contributing/code-style.md) - Coding standards
- [Documentation Guide](./docs/contributing/documentation-guide.md) - Writing docs

### **📦 V1 Archive**

- [V1 Complete State](./docs/archive/v1/V1_COMPLETE_STATE_SNAPSHOT.md) - V1 documentation snapshot
- [V1 to V2 Transition](./docs/archive/v1/V1_TO_V2_TRANSITION_GUIDE.md) - Migration guide
- [Phase Completion Reports](./docs/archive/phases/) - Historical development phases

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Issues:**

```bash
# Check if MongoDB is running
docker-compose ps

# Restart MongoDB container
docker-compose restart mongodb
```

**Prisma Client Issues:**

```bash
# Regenerate Prisma client
npm run db:generate

# Reset database (development only)
npm run db:push --force-reset
```

**Build Errors:**

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules && npm run install
```

## 📞 Support

For questions and support:

- Check existing GitHub issues
- Review documentation in `/docs`
- Contact the development team

---

**Built with ❤️ for the South African insurance market**
