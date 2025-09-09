# Lalisure - Home Insurance Platform

A modern, full-stack home insurance management platform built with Next.js 15, TypeScript, and Paystack integration for the South African market.

## 🏠 Overview

**Lalisure** is a comprehensive insurance management platform that serves customers, agents, underwriters, and administrators. The platform provides end-to-end home insurance management with policy creation, claims processing, payment handling, and customer communication features. Built specifically for South Africa with ZAR currency and local payment integration via Paystack.

### 🚀 **Current Status**: **75% Complete**

- ✅ **Core Infrastructure**: Database models, tRPC API, authentication system
- ✅ **Staff Portal**: Login/Register system with role-based access
- ✅ **Customer Portal**: Policy management, claims processing, payments
- ✅ **Admin Dashboard**: User management, analytics, system configuration
- ✅ **Production Ready**: Successfully builds and deploys on Render

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB database
- Redis (optional, for caching)
- Docker (for development environment)

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd lalisure
   pnpm install
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
   pnpm db:generate
   pnpm db:push
   pnpm db:seed

   # Start development server
   pnpm dev
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
│   │   ├── analytics/            # System analytics
│   │   └── settings/             # System configuration
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
│   │   ├── trpc/                 # tRPC API endpoints
│   │   ├── webhooks/             # External service webhooks
│   │   │   ├── clerk/            # Clerk authentication webhooks
│   │   │   └── paystack/         # Paystack payment webhooks
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
│   │   ├── email.ts             # Email service
│   │   ├── sms.ts               # SMS service
│   │   ├── notification.ts      # Notification service
│   │   ├── analytics.ts         # Analytics service
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
- **Email:** Resend
- **SMS:** Twilio

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
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:coverage
```

### Database Management

```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes
pnpm db:push

# Open Prisma Studio
pnpm db:studio

# Seed development data
pnpm db:seed
```

### Code Quality

```bash
# Linting
pnpm lint

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
| `TWILIO_*`                          | SMS notifications         | Optional |

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

## 📊 Features

### ✅ **Fully Implemented (75% Complete)**

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
- **Performance Monitoring**: Real-time system metrics
- **Business Intelligence**: Custom reporting tools

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
3. Run `pnpm lint` and `pnpm test`
4. Submit PR with clear description
5. Address review feedback

## 📝 Documentation

- **`IMPLEMENTATION_PLAN.md`** - Detailed development roadmap
- **`FLOWCHARTS.md`** - System architecture diagrams
- **`/docs`** - Additional technical documentation
- **Inline Comments** - Complex business logic explanation

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
pnpm db:generate

# Reset database (development only)
pnpm db:push --force-reset
```

**Build Errors:**

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules && pnpm install
```

## 📞 Support

For questions and support:

- Check existing GitHub issues
- Review documentation in `/docs`
- Contact the development team

---

**Built with ❤️ for the South African insurance market**
