# Claude Development Context - Home Insurance Platform

This file provides essential context for new Claude agents working on the home insurance platform project.

## Project Overview
Specialized home insurance platform built with Next.js 15, featuring home insurance policy management, home damage claims processing, and user authentication. The project follows a phased implementation approach with comprehensive features tailored specifically for home insurance operations.

## Current Status
- **Phase 1**: Foundation & Setup ✅ COMPLETED
- **Phase 2**: Authentication & User Management ✅ COMPLETED  
- **Phase 3**: Home Insurance Policy Management System ✅ COMPLETED
- **Phase 4**: Home Insurance Claims Processing System ✅ COMPLETED
- **Phase 4.5**: Home Insurance Focus Refactoring ✅ COMPLETED
- **Phase 5**: Advanced Features (Next - Communication, Analytics, Payments)

## Development Environment
- **Framework**: Next.js 15 with App Router and TypeScript
- **Package Manager**: pnpm
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Clerk
- **API**: tRPC with type safety
- **UI**: Tailwind CSS v4 + shadcn/ui components
- **Development Server**: Runs on http://localhost:3002

## Key Commands
```bash
# Install dependencies
pnpm install

# Start development server
npm run dev

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:seed     # Seed development data
npm run db:studio   # Open Prisma Studio

# Docker environment
docker-compose up -d  # Start MongoDB, Redis, MailHog
```

## Important Files and Structure
```
src/
├── app/                          # Next.js App Router pages
│   ├── dashboard/               # User dashboard
│   ├── policies/                # Policy management pages
│   │   ├── page.tsx            # Policy listing with filters
│   │   ├── new/page.tsx        # Policy creation
│   │   └── [id]/page.tsx       # Policy details
│   ├── sign-in/[[...sign-in]]/ # Authentication pages
│   └── providers.tsx           # Clerk & tRPC providers
├── server/api/                  # tRPC server
│   ├── routers/
│   │   ├── user.ts             # User management
│   │   └── policy.ts           # Policy CRUD operations
│   └── trpc.ts                 # tRPC configuration with RBAC
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/                 # Dashboard layout components
│   ├── forms/                  # Form components and wizards
│   └── policies/               # Policy-specific components
├── lib/
│   ├── services/               # Business logic services
│   │   └── premium-calculator.ts  # Premium calculation engine
│   └── validations/            # Zod validation schemas
└── trpc/                       # tRPC client setup

prisma/
├── schema.prisma               # Database schema
├── seed.ts                    # Development seed data
└── migrations/                # Database migrations

docker-compose.yml             # Development environment
middleware.ts                  # Clerk authentication middleware
```

## Database Schema (Key Models)
- **User**: Authentication and profile data with roles (CUSTOMER, AGENT, ADMIN)
- **Policy**: Home insurance policies with PropertyInfo (address, construction details, safety features)
- **Claim**: Home insurance claims with home-specific types (FIRE_DAMAGE, WATER_DAMAGE, STORM_DAMAGE, etc.)
- **Payment**: Premium payments and billing
- **Document**: File attachments for claims and policy documents

## Core Home Insurance Features Implemented

### Authentication & User Management
- Clerk authentication with custom styling
- Role-based access control (RBAC)
- User dashboard with home insurance focus
- Account settings with notifications

### Home Insurance Policy Management System
- Multi-step home insurance policy creation wizard (Coverage → Risk Factors → Property Details → Review)
- Policy listing with advanced filtering and sorting
- Detailed policy view with comprehensive home insurance information
- Policy status management with business rules
- Home insurance premium calculation engine with property-specific risk assessment
- Specialized for HOME insurance only (simplified from multi-insurance platform)

### Home Insurance Claims Processing System
- Claims submission form with home-specific claim types:
  - FIRE_DAMAGE, WATER_DAMAGE, STORM_DAMAGE
  - THEFT_BURGLARY, VANDALISM, LIABILITY
  - STRUCTURAL_DAMAGE, ELECTRICAL_DAMAGE, PLUMBING_DAMAGE
- File upload system with UploadThing integration
- Claims status tracking (SUBMITTED, UNDER_REVIEW, INVESTIGATING, APPROVED, REJECTED, SETTLED)
- Document management and categorization
- What3Words API integration for precise incident location
- Claims listing with filtering and status management

### Home Insurance Premium Calculation
- Sophisticated algorithms considering:
  - Home-specific risk factors (property age, construction type, location)
  - Coverage amounts for dwelling, personal property, liability
  - Location-based pricing adjustments (state, crime rate, natural disaster risk)
  - Property features discounts (safety features, construction materials)
  - Credit score and claims history impact

## Environment Variables
Required in `.env.local`:
```
DATABASE_URL="mongodb://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"
```

## Development Workflow
1. All changes should follow existing code patterns and conventions
2. Use the TodoWrite tool to track implementation progress
3. Test changes in development server before committing
4. Update IMPLEMENTATION_PLAN.md when completing phases
5. Follow TypeScript strict mode and ESLint rules

## Testing & Validation
- Run development server to test changes: `npm run dev`
- Use Prisma Studio to inspect database: `npm run db:studio`
- Seed database for testing: `npm run db:seed`
- Check TypeScript compilation: `tsc --noEmit`

## Common Issues & Solutions
- **Module not found errors**: Check if dependencies are installed with `pnpm install`
- **Database connection issues**: Ensure MongoDB is running via Docker
- **Authentication errors**: Verify Clerk environment variables
- **Port conflicts**: Development server auto-assigns available ports (3000-3002)

## Recently Completed: Home Insurance Focus Refactoring
Major platform update completed (Phase 4.5):
- ✅ Refactored from multi-insurance to home insurance only
- ✅ Updated database schema (PolicyType enum now HOME only)
- ✅ Updated ClaimType enum for home-specific claims
- ✅ Removed PolicyTypeStep from policy wizard
- ✅ Updated premium calculator for home insurance calculations only
- ✅ Updated UI branding and labels throughout application
- ✅ Simplified policy creation workflow

## Next Phase: Advanced Features (Phase 5)
The next implementation phase will focus on:
- Communication system (Resend email, Twilio SMS)
- Analytics and reporting (PostHog integration)
- Payment integration (Stripe for premium payments)
- Business intelligence dashboard
- Advanced notifications and alerts

## Code Quality Standards
- Use TypeScript strict mode
- Follow existing component patterns
- Implement proper error handling
- Use tRPC for type-safe APIs
- Follow shadcn/ui component patterns
- Maintain responsive design with Tailwind CSS

This context should provide sufficient information for new agents to understand the project structure, current implementation status, and development practices.