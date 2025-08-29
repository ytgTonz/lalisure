# Home Insurance Platform

A modern, full-stack home insurance management platform built with Next.js 15, TypeScript, and Paystack integration for the South African market.

## 🏠 Overview

This platform provides comprehensive home insurance management with policy creation, claims processing, payment handling, and customer communication features. Built specifically for South Africa with ZAR currency and local payment integration via Paystack.

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

## 📁 Project Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── sign-in/             
│   │   └── sign-up/             
│   ├── api/                      # API routes
│   │   ├── trpc/                # tRPC endpoints
│   │   ├── webhooks/            # External service webhooks
│   │   └── uploadthing/         # File upload endpoints
│   ├── dashboard/               # Main dashboard
│   ├── policies/                # Policy management pages
│   ├── claims/                  # Claims processing pages
│   ├── payments/                # Payment & billing pages
│   └── settings/                # User settings
├── components/                   # Reusable React components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout components
│   ├── policies/                # Policy-specific components
│   └── claims/                  # Claims-specific components
├── lib/                         # Shared utilities and services
│   ├── services/                # Business logic services
│   ├── validations/             # Zod validation schemas
│   └── utils/                   # Helper functions
├── server/                      # tRPC server configuration
│   └── api/                     # API router definitions
└── trpc/                        # tRPC client setup
```

### Key Directories Explained

- **`app/`** - Next.js App Router pages and layouts
- **`components/`** - Reusable UI components organized by feature
- **`lib/services/`** - Business logic (PaystackService, PremiumCalculator, etc.)
- **`server/api/routers/`** - tRPC API endpoints with type safety
- **`prisma/`** - Database schema and migrations

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
- **Deployment:** Vercel
- **Monitoring:** PostHog + Sentry
- **Development:** Docker for local services

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

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | Yes |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `UPLOADTHING_SECRET` | File upload service | Yes |
| `RESEND_API_KEY` | Email service | Optional |
| `TWILIO_*` | SMS notifications | Optional |

### Database Schema
The platform uses MongoDB with Prisma ORM. Key models:
- **User** - Customer accounts with role-based permissions
- **Policy** - Home insurance policies with premium calculations
- **Claim** - Claims processing with document attachments
- **Payment** - Payment records with Paystack integration
- **Notification** - Multi-channel notification system

## 📊 Features

### ✅ Implemented
- **User Authentication** - Clerk integration with role-based access
- **Policy Management** - Create, manage home insurance policies
- **Premium Calculation** - Dynamic pricing based on risk factors
- **Claims Processing** - Full claims workflow with file uploads
- **Payment Processing** - Paystack integration for ZAR payments
- **Notification System** - Email, SMS, and in-app notifications
- **Document Management** - Secure file uploads and storage
- **Responsive Design** - Mobile-first UI design

### 🚧 Future Enhancements
- **Advanced Analytics** - Business intelligence dashboard
- **Mobile App** - React Native companion app
- **AI Integration** - Automated claims processing
- **Advanced Security** - Enhanced fraud detection

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

- **Input Validation** - Zod schemas for all user inputs
- **File Upload Security** - MIME type validation and size limits
- **Rate Limiting** - API endpoint protection
- **Authentication** - Clerk secure authentication
- **Authorization** - Role-based access control
- **Webhook Validation** - Secure webhook signature verification

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