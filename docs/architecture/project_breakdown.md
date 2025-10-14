# Insurance Platform - 2025 Modern Tech Stack Project Breakdown

## 1. Backend Architecture & Design

### 1.1 API Design & Architecture

**Modern API Structure with tRPC + Next.js App Router**

```
src/
├── app/api/                 # Next.js 14+ App Router API routes
│   ├── trpc/[trpc]/        # tRPC router endpoint
│   ├── webhooks/           # Webhook handlers
│   └── upload/             # File upload endpoints
├── server/                 # tRPC server setup
│   ├── routers/           # Feature-based routers
│   │   ├── auth.ts        # Authentication
│   │   ├── policies.ts    # Policy management
│   │   ├── claims.ts      # Claims processing
│   │   ├── media.ts       # File handling
│   │   └── locations.ts   # What3Words integration
│   ├── middleware/        # Auth, logging, rate limiting
│   └── context.ts         # Request context
```

**Modern Microservices Architecture**

- **Auth Service**: Clerk + NextAuth.js v5 for authentication
- **Policy Service**: tRPC procedures with Zod validation
- **Claims Service**: Event-driven with Inngest for workflows
- **Media Service**: UploadThing for file handling
- **Notification Service**: Resend for emails, Twilio for SMS
- **Analytics Service**: PostHog for product analytics

### 1.2 Database Design (2025 Standards)

**MongoDB with Prisma ORM + MongoDB Connector**

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  policies Policy[]
  claims   Claim[]

  @@map("users")
}

model Policy {
  id           String      @id @default(auto()) @map("_id") @db.ObjectId
  policyNumber String      @unique
  type         PolicyType
  status       PolicyStatus

  // Embedded documents
  coverage     Json        // Flexible coverage options
  premium      Json        // Premium calculations
  property     Json        // Property details with What3Words

  // Relations
  userId String @db.ObjectId
  user   User   @relation(fields: [userId], references: [id])
  claims Claim[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("policies")
}

model Claim {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  claimNumber String      @unique
  status      ClaimStatus
  description String

  // Embedded location data
  location    Json        // What3Words + coordinates

  // Relations
  policyId String @db.ObjectId
  policy   Policy @relation(fields: [policyId], references: [id])
  userId   String @db.ObjectId
  user     User   @relation(fields: [userId], references: [id])

  // Media handling
  mediaIds String[] @db.ObjectId

  workflow Json[] // Status workflow tracking

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("claims")
}

enum PolicyType {
  HOME
  CONDO
  RENTERS
}

enum PolicyStatus {
  ACTIVE
  PENDING
  CANCELLED
  EXPIRED
}

enum ClaimStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  DENIED
  SETTLED
}
```

### 1.3 Authentication & Authorization (2025 Best Practices)

**Clerk + NextAuth.js v5 Hybrid Approach**

```typescript
// lib/auth.ts - NextAuth v5 configuration
import { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "clerk",
      name: "Clerk",
      type: "oidc",
      issuer: process.env.CLERK_ISSUER_URL,
      clientId: process.env.CLERK_CLIENT_ID,
      clientSecret: process.env.CLERK_CLIENT_SECRET,
    },
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
};

// RBAC with Zod schemas
const roleSchema = z.enum(["CLIENT", "AGENT", "ADJUSTER", "ADMIN"]);
const permissionSchema = z.enum([
  "policy:read",
  "policy:create",
  "policy:update",
  "claim:read",
  "claim:create",
  "claim:update",
  "admin:read",
  "admin:write",
]);
```

### 1.4 Modern Business Logic with tRPC

**Type-safe API procedures**

```typescript
// server/routers/policies.ts
export const policiesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const policies = await ctx.prisma.policy.findMany({
        where: { userId: ctx.user.id },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          claims: {
            select: { id: true, status: true, createdAt: true },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined;
      if (policies.length > input.limit) {
        const nextItem = policies.pop();
        nextCursor = nextItem!.id;
      }

      return { policies, nextCursor };
    }),

  create: protectedProcedure
    .input(createPolicySchema)
    .mutation(async ({ ctx, input }) => {
      // Premium calculation with modern algorithms
      const premium = await calculatePremium({
        property: input.property,
        coverage: input.coverage,
        riskFactors: await getRiskFactors(input.property.location),
      });

      return await ctx.prisma.policy.create({
        data: {
          ...input,
          premium,
          userId: ctx.user.id,
          policyNumber: generatePolicyNumber(),
        },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["ACTIVE", "CANCELLED", "EXPIRED"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Event-driven workflow
      await inngest.send({
        name: "policy.status.updated",
        data: {
          policyId: input.id,
          status: input.status,
          reason: input.reason,
          userId: ctx.user.id,
        },
      });

      return await ctx.prisma.policy.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
```

## 2. Frontend Architecture & Design (2025 Standards)

### 2.1 Next.js 15+ App Router Structure

**Modern App Architecture**

```
src/
├── app/                     # App Router (Next.js 15+)
│   ├── (dashboard)/         # Route groups
│   │   ├── policies/        # Parallel routes
│   │   │   ├── @modal/     # Intercepted routes
│   │   │   ├── [id]/       # Dynamic routes
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                # API routes
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # Feature-based components
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # React Hook Form + Zod
│   ├── charts/            # Recharts visualizations
│   └── providers/         # Context providers
├── lib/                   # Utilities
│   ├── trpc.ts           # tRPC client
│   ├── auth.ts           # Auth configuration
│   └── utils.ts          # Utility functions
├── hooks/                 # Custom hooks
├── stores/               # Zustand stores
└── types/                # TypeScript definitions
```

### 2.2 State Management (2025 Approach)

**Zustand + TanStack Query + tRPC**

```typescript
// stores/policiesStore.ts - Client-side caching with Zustand
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface PolicyFilters {
  status: PolicyStatus[];
  type: PolicyType[];
  search: string;
}

interface PolicyStore {
  filters: PolicyFilters;
  selectedPolicyId: string | null;

  // Actions
  setFilters: (filters: Partial<PolicyFilters>) => void;
  selectPolicy: (id: string) => void;
  clearSelection: () => void;
}

export const usePolicyStore = create<PolicyStore>()(
  devtools(
    persist(
      immer((set) => ({
        filters: { status: [], type: [], search: "" },
        selectedPolicyId: null,

        setFilters: (newFilters) =>
          set((state) => {
            Object.assign(state.filters, newFilters);
          }),

        selectPolicy: (id) =>
          set((state) => {
            state.selectedPolicyId = id;
          }),

        clearSelection: () =>
          set((state) => {
            state.selectedPolicyId = null;
          }),
      })),
      { name: "policy-store" }
    )
  )
);

// hooks/usePolicies.ts - Server state with tRPC + TanStack Query
export function usePolicies() {
  const filters = usePolicyStore((state) => state.filters);

  return api.policies.getAll.useQuery(
    {
      filters,
      limit: 20,
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useCreatePolicy() {
  const utils = api.useUtils();

  return api.policies.create.useMutation({
    onSuccess: () => {
      // Optimistic updates
      utils.policies.getAll.invalidate();
      toast.success("Policy created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create policy: ${error.message}`);
    },
  });
}
```

### 2.3 Modern Component Architecture

**Server + Client Components with Composition**

```typescript
// app/policies/page.tsx - Server Component
import { Suspense } from "react";
import { PoliciesHeader } from "@/components/policies/PoliciesHeader";
import { PoliciesList } from "@/components/policies/PoliciesList";
import { PoliciesFilters } from "@/components/policies/PoliciesFilters";
import { PolicyCreateModal } from "@/components/policies/PolicyCreateModal";

export default function PoliciesPage() {
  return (
    <div className="container mx-auto p-6">
      <PoliciesHeader />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <PoliciesFilters />
        </aside>

        <main className="lg:col-span-3">
          <Suspense fallback={<PoliciesListSkeleton />}>
            <PoliciesList />
          </Suspense>
        </main>
      </div>

      <PolicyCreateModal />
    </div>
  );
}

// components/policies/PolicyCard.tsx - Client Component
("use client");

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PolicyCardProps {
  policy: Policy;
  onSelect: (id: string) => void;
}

export function PolicyCard({ policy, onSelect }: PolicyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>{policy.policyNumber}</span>
            <Badge
              variant={policy.status === "ACTIVE" ? "default" : "secondary"}
            >
              {policy.status}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {policy.property.address}
          </p>

          <div className="flex justify-between items-center">
            <span className="font-semibold">
              ${policy.premium.monthly}/month
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(policy.id)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

## 3. UI/UX Design System (2025 Standards)

### 3.1 Modern Design System Foundation

**Tailwind CSS v4 + CSS Variables + Design Tokens**

```css
/* app/globals.css */
@import "tailwindcss";

:root {
  /* Brand Colors - Insurance Industry */
  --brand-primary: 223 47% 23%; /* Deep Navy #1e3a5f */
  --brand-secondary: 210 40% 65%; /* Steel Blue #7da3cc */
  --brand-accent: 142 76% 36%; /* Trust Green #16a34a */

  /* Status Colors */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --error: 0 84% 60%;
  --info: 221 83% 53%;

  /* Semantic Colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  /* Spacing Scale (Tailwind v4) */
  --spacing-xs: 0.25rem; /* 4px */
  --spacing-sm: 0.5rem; /* 8px */
  --spacing-md: 1rem; /* 16px */
  --spacing-lg: 1.5rem; /* 24px */
  --spacing-xl: 2rem; /* 32px */

  /* Typography Scale */
  --font-size-xs: 0.75rem; /* 12px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-base: 1rem; /* 16px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.25rem; /* 20px */

  /* Border Radius */
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}

/* Component-specific CSS-in-JS alternative */
@layer components {
  .policy-card {
    @apply bg-card text-card-foreground border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow;
  }

  .claim-status-badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }

  .form-field {
    @apply space-y-2;
  }
}
```

### 3.2 Modern Component Library

**shadcn/ui + Custom Insurance Components**

```typescript
// components/ui/data-table.tsx - Modern table with sorting, filtering, pagination
"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search policies..."
          value={
            (table.getColumn("policyNumber")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("policyNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// components/insurance/claim-status-tracker.tsx - Custom Insurance Component
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

const statusConfig = {
  SUBMITTED: {
    icon: Clock,
    color: "bg-blue-100 text-blue-800",
    progress: 25,
  },
  UNDER_REVIEW: {
    icon: AlertCircle,
    color: "bg-yellow-100 text-yellow-800",
    progress: 50,
  },
  APPROVED: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    progress: 75,
  },
  DENIED: {
    icon: XCircle,
    color: "bg-red-100 text-red-800",
    progress: 100,
  },
  SETTLED: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    progress: 100,
  },
};

interface ClaimStatusTrackerProps {
  status: ClaimStatus;
  workflow: Array<{
    stage: string;
    status: string;
    timestamp: string;
    notes?: string;
  }>;
}

export function ClaimStatusTracker({
  status,
  workflow,
}: ClaimStatusTrackerProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <Badge className={config.color}>{status.replace("_", " ")}</Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {config.progress}% Complete
        </span>
      </div>

      <Progress value={config.progress} className="w-full" />

      <div className="space-y-2">
        {workflow.map((step, index) => (
          <div key={index} className="flex items-start space-x-3 text-sm">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-muted" />
            <div className="flex-1">
              <p className="font-medium">{step.stage}</p>
              <p className="text-muted-foreground">
                {new Date(step.timestamp).toLocaleString()}
              </p>
              {step.notes && (
                <p className="text-xs text-muted-foreground mt-1">
                  {step.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 4. Development Environment Setup (2025 Standards)

### 4.1 Modern Development Stack

**Prerequisites & Setup**

```bash
# Required software (2025 versions)
- Node.js 22+ LTS (latest features + performance)
- npm run 9+ (faster, more efficient package manager)
- Docker Desktop with Compose v2
- VS Code with modern extensions
- Bun 1.0+ (for faster development builds)

# VS Code Extensions (2025 Essential)
code --install-extension bradlc.vscode-tailwindcss
code --install-extension prisma.prisma
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension usernamehw.errorlens
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension esbenp.prettier-vscode
code --install-extension ms-playwright.playwright
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
```

**Modern Environment Configuration**

```bash
# .env.local
# Database
DATABASE_URL="mongodb://localhost:27017/insurance_platform"
DIRECT_URL="mongodb://localhost:27017/insurance_platform" # For Prisma migrations

# Authentication (Clerk + NextAuth hybrid)
NEXTAUTH_SECRET="your-super-secure-secret"
NEXTAUTH_URL="http://localhost:3000"
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."

# File Uploads (UploadThing)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"

# External APIs
WHAT3WORDS_API_KEY="your-w3w-key"
RESEND_API_KEY="re_..." # Email service
TWILIO_ACCOUNT_SID="..." # SMS service

# Monitoring & Analytics
SENTRY_DSN="https://..."
POSTHOG_KEY="phc_..."
VERCEL_ANALYTICS_ID="..."

# Payment Processing
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI/ML Services (for risk assessment)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

### 4.2 Modern Docker Development Environment

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: insurance_mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: insurance_platform
    volumes:
      - mongodb_data:/data/db
      - ./docker/mongodb/init.js:/docker-entrypoint-initdb.d/init.js:ro

  redis:
    image: redis:7.2-alpine
    container_name: insurance_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  mailhog:
    image: mailhog/mailhog:v1.0.1
    container_name: insurance_mailhog
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI
    environment:
      MH_STORAGE: maildir
      MH_MAILDIR_PATH: /maildir
    volumes:
      - mailhog_data:/maildir

  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: insurance_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=mongodb://admin:password123@mongodb:27017/insurance_platform?authSource=admin
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - mongodb
      - redis

volumes:
  mongodb_data:
  redis_data:
  mailhog_data:

# Dockerfile.dev
FROM node:22-alpine AS base

# Install npm run
RUN npm install -g npm run

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json npm run-lock.yaml* ./
RUN npm run install --frozen-lockfile

# Development image
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npm run prisma generate

EXPOSE 3000
CMD ["npm run", "dev"]
```

### 4.3 Modern Development Scripts

```json
{
  "name": "insurance-platform",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest --coverage",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "build-storybook": "storybook build",
    "storybook": "storybook dev -p 6006",
    "prepare": "husky install"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "@prisma/client": "5.8.0",
    "@trpc/server": "11.0.0-rc.502",
    "@trpc/client": "11.0.0-rc.502",
    "@trpc/next": "11.0.0-rc.502",
    "@trpc/react-query": "11.0.0-rc.502",
    "@tanstack/react-query": "5.15.0",
    "zustand": "4.4.7",
    "zod": "3.22.4",
    "tailwindcss": "4.0.0-alpha.3",
    "@tailwindcss/typography": "0.5.10",
    "framer-motion": "10.16.16",
    "react-hook-form": "7.48.2",
    "@hookform/resolvers": "3.3.2",
    "uploadthing": "6.2.0",
    "resend": "2.1.0",
    "@radix-ui/react-dialog": "1.0.5",
    "@radix-ui/react-dropdown-menu": "2.0.6",
    "lucide-react": "0.298.0",
    "recharts": "2.8.0",
    "date-fns": "3.0.6"
  },
  "devDependencies": {
    "@types/node": "20.10.5",
    "@types/react": "18.2.45",
    "@types/react-dom": "18.2.18",
    "typescript": "5.3.3",
    "prisma": "5.8.0",
    "tailwindcss": "4.0.0-alpha.3",
    "postcss": "8.4.32",
    "autoprefixer": "10.4.16",
    "eslint": "8.56.0",
    "eslint-config-next": "15.0.0",
    "@typescript-eslint/eslint-plugin": "6.15.0",
    "@typescript-eslint/parser": "6.15.0",
    "prettier": "3.1.1",
    "prettier-plugin-tailwindcss": "0.5.9",
    "vitest": "1.1.0",
    "@vitejs/plugin-react": "4.2.1",
    "playwright": "1.40.1",
    "@playwright/test": "1.40.1",
    "storybook": "7.6.6",
    "@storybook/react": "7.6.6",
    "@storybook/react-vite": "7.6.6",
    "husky": "8.0.3",
    "lint-staged": "15.2.0",
    "tsx": "4.6.2"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

## 5. DevOps & Infrastructure (2025 Standards)

### 5.1 Modern CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "22"
  PNPM_VERSION: "9"

jobs:
  quality-checks:
    name: Quality Checks
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup npm run
        uses: npm run/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm run"

      - name: Install dependencies
        run: npm run install --frozen-lockfile

      - name: Generate Prisma client
        run: npm run db:generate

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test --coverage

      - name: Build application
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: quality-checks
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup npm run
        uses: npm run/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm run"

      - name: Install dependencies
        run: npm run install --frozen-lockfile

      - name: Install Playwright browsers
        run: npm run exec playwright install --with-deps

      - name: Start services
        run: |
          docker compose -f docker-compose.test.yml up -d
          npm run db:push
          npm run db:seed

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: "fs"
          scan-ref: "."
          format: "sarif"
          output: "trivy-results.sarif"

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: "trivy-results.sarif"

      - name: Dependency audit
        run: npm run audit --audit-level moderate

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [quality-checks, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_TEAM_ID }}

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [quality-checks, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
          scope: ${{ secrets.VERCEL_TEAM_ID }}

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: "#deployments"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 5.2 Modern Cloud Infrastructure (Vercel + Planetscale + Upstash)

**Edge-First Architecture**

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering (Next.js 15)
    reactCompiler: true, // React Compiler
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploadthing-prod.s3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.clerk.dev',
      },
    ],
  },
  // Edge Runtime for API routes
  runtime: 'edge',
}

export default nextConfig

// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "edge"
    }
  },
  "regions": ["iad1", "sfo1", "lhr1"], // Multi-region deployment
  "crons": [
    {
      "path": "/api/cron/process-claims",
      "schedule": "0 */6 * * *" // Every 6 hours
    },
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 * * *" // Daily at 9 AM
    }
  ]
}
```

**Infrastructure as Code (Terraform + Vercel)**

```hcl
# infrastructure/main.tf
terraform {
  required_providers {
    vercel = {
      source = "vercel/vercel"
      version = "~> 0.15"
    }
    upstash = {
      source = "upstash/upstash"
      version = "~> 1.0"
    }
  }
}

resource "vercel_project" "insurance_platform" {
  name      = "insurance-platform"
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = "your-org/insurance-platform"
  }

  environment = [
    {
      key    = "DATABASE_URL"
      value  = var.database_url
      target = ["production", "preview", "development"]
    },
    {
      key    = "REDIS_URL"
      value  = upstash_redis_database.main.endpoint
      target = ["production", "preview", "development"]
    }
  ]
}

resource "upstash_redis_database" "main" {
  database_name = "insurance-platform-redis"
  region        = "us-east-1"
  tls           = true
}

resource "vercel_deployment" "production" {
  project_id = vercel_project.insurance_platform.id
  files = {
    "package.json" = file("${path.root}/package.json")
    "next.config.js" = file("${path.root}/next.config.js")
  }
}
```

### 5.3 Modern Monitoring & Observability

**Comprehensive Monitoring Stack**

```typescript
// lib/monitoring.ts
import { withSentry } from "@sentry/nextjs";
import { PostHog } from "posthog-js";
import { Analytics } from "@vercel/analytics/react";

// Sentry configuration
export const sentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ["localhost", /^\//],
    }),
  ],
};

// PostHog configuration
export const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
  loaded: (posthog) => {
    if (process.env.NODE_ENV === "development") posthog.debug();
  },
});

// Custom insurance metrics
export const trackInsuranceEvent = (event: string, properties: any) => {
  posthogClient.capture(event, {
    ...properties,
    timestamp: new Date().toISOString(),
    source: "insurance-platform",
  });
};

// Error boundary with monitoring
export function InsuranceErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            We're sorry, but something unexpected happened. Our team has been
            notified.
          </p>
          <Button onClick={resetError} variant="outline">
            Try again
          </Button>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

// Performance monitoring
export function withInsuranceMonitoring<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function MonitoredComponent(props: T) {
    useEffect(() => {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        trackInsuranceEvent("component_render_time", {
          component: WrappedComponent.displayName || WrappedComponent.name,
          loadTime,
        });
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
}
```

## 6. Security Implementation (2025 Standards)

### 6.1 Modern Security Architecture

**Zero-Trust Security Model**

```typescript
// lib/security.ts
import { ratelimit } from "@/lib/redis";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

// Rate limiting with Upstash Redis
export async function rateLimitMiddleware(
  request: NextRequest,
  identifier: string,
  limit: number = 10,
  window: number = 60000 // 1 minute
) {
  const { success, remaining, reset } = await ratelimit.limit(
    `ratelimit:${identifier}`,
    limit,
    window
  );

  if (!success) {
    throw new Error("Rate limit exceeded");
  }

  return { remaining, reset };
}

// Content Security Policy (CSP)
export const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.vercel-insights.com https://va.vercel-scripts.com https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://uploadthing-prod.s3.us-west-2.amazonaws.com https://img.clerk.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

// Security headers middleware
export function securityHeaders() {
  return {
    "Content-Security-Policy": cspHeader.replace(/\s{2,}/g, " ").trim(),
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}

// Input validation with Zod
export const secureInputSchema = z.object({
  // Sanitize strings
  description: z
    .string()
    .min(1)
    .max(1000)
    .transform((str) => str.trim())
    .refine(
      (str) => !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(str),
      {
        message: "Script tags are not allowed",
      }
    ),

  // Validate email
  email: z.string().email().toLowerCase(),

  // Sanitize phone numbers
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format"),

  // Validate monetary amounts
  amount: z.number().positive().max(10000000), // Max $10M
});

// Encryption utilities
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

export function encryptSensitiveData(data: string): string {
  const algorithm = "aes-256-gcm";
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const iv = randomBytes(16);

  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptSensitiveData(encryptedData: string): string {
  const algorithm = "aes-256-gcm";
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

  const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
```

### 6.2 Compliance & Data Protection (2025)

**GDPR + CCPA Compliance Framework**

```typescript
// lib/compliance.ts
interface DataProcessingRecord {
  userId: string;
  dataType: "personal" | "sensitive" | "financial";
  action: "collect" | "process" | "store" | "delete" | "share";
  purpose: string;
  legalBasis:
    | "consent"
    | "contract"
    | "legal_obligation"
    | "vital_interests"
    | "public_task"
    | "legitimate_interests";
  timestamp: Date;
  retention: Date;
}

export class ComplianceManager {
  private auditLog: DataProcessingRecord[] = [];

  async logDataProcessing(record: Omit<DataProcessingRecord, "timestamp">) {
    const fullRecord: DataProcessingRecord = {
      ...record,
      timestamp: new Date(),
    };

    this.auditLog.push(fullRecord);

    // Store in secure audit database
    await prisma.auditLog.create({
      data: fullRecord,
    });
  }

  async handleDataDeletionRequest(userId: string) {
    // GDPR Article 17 - Right to Erasure
    const transactions = prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${userId}@example.com`,
          firstName: "DELETED",
          lastName: "DELETED",
          deletedAt: new Date(),
        },
      }),
      prisma.policy.updateMany({
        where: { userId },
        data: {
          personalData: null, // Remove PII but keep business data
        },
      }),
      prisma.claim.updateMany({
        where: { userId },
        data: {
          personalNotes: null, // Remove personal notes
        },
      }),
    ]);

    await this.logDataProcessing({
      userId,
      dataType: "personal",
      action: "delete",
      purpose: "GDPR Right to Erasure Request",
      legalBasis: "legal_obligation",
    });

    return transactions;
  }

  async generateDataExport(userId: string) {
    // GDPR Article 20 - Right to Data Portability
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        policies: true,
        claims: true,
      },
    });

    await this.logDataProcessing({
      userId,
      dataType: "personal",
      action: "process",
      purpose: "GDPR Data Export Request",
      legalBasis: "legal_obligation",
    });

    return userData;
  }
}

// Privacy-first design patterns
export const PrivacyConfig = {
  // Data minimization
  collectOnlyNecessaryData: true,

  // Purpose limitation
  dataUsagePurposes: [
    "insurance_underwriting",
    "claims_processing",
    "customer_service",
    "legal_compliance",
  ],

  // Storage limitation
  retentionPeriods: {
    user_data: "7 years", // Insurance industry standard
    claim_data: "10 years",
    audit_logs: "3 years",
    session_data: "24 hours",
  },

  // Accuracy principle
  dataValidationRules: {
    email: "verified_required",
    address: "geocoded_verified",
    identity: "kyc_verified",
  },
};
```

## 7. Testing Strategy (2025 Standards)

### 7.1 Modern Testing Stack

**Vitest + Playwright + Testing Library**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        ".next/",
        "coverage/",
        "**/*.d.ts",
        "**/*.config.*",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

// tests/setup.ts
import { beforeAll, afterAll, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/test-path",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock tRPC
vi.mock("@/utils/api", () => ({
  api: {
    policies: {
      getAll: {
        useQuery: vi.fn(() => ({
          data: [],
          isLoading: false,
          error: null,
        })),
      },
    },
  },
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.NEXTAUTH_SECRET = "test-secret";
});
```

**Component Testing with Testing Library**

```typescript
// components/__tests__/PolicyCard.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PolicyCard } from "@/components/PolicyCard";

const mockPolicy = {
  id: "1",
  policyNumber: "POL-001",
  status: "ACTIVE" as const,
  type: "HOME" as const,
  premium: { monthly: 125, annual: 1500 },
  property: {
    address: "123 Main St, Anytown, ST 12345",
    what3words: "filled.count.soap",
  },
  coverage: {
    dwelling: 300000,
    personalProperty: 150000,
    liability: 500000,
  },
};

describe("PolicyCard", () => {
  it("renders policy information correctly", () => {
    const onSelect = vi.fn();

    render(<PolicyCard policy={mockPolicy} onSelect={onSelect} />);

    expect(screen.getByText("POL-001")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("$125/month")).toBeInTheDocument();
    expect(
      screen.getByText("123 Main St, Anytown, ST 12345")
    ).toBeInTheDocument();
  });

  it("calls onSelect when view details button is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<PolicyCard policy={mockPolicy} onSelect={onSelect} />);

    const viewButton = screen.getByRole("button", { name: /view details/i });
    await user.click(viewButton);

    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("shows correct status badge color", () => {
    const { rerender } = render(
      <PolicyCard policy={mockPolicy} onSelect={vi.fn()} />
    );

    expect(screen.getByText("ACTIVE")).toHaveClass("bg-green-100");

    rerender(
      <PolicyCard
        policy={{ ...mockPolicy, status: "EXPIRED" }}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("EXPIRED")).toHaveClass("bg-red-100");
  });
});
```

**API Route Testing**

```typescript
// app/api/__tests__/policies.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import { createMocks } from "node-mocks-http";
import handler from "@/app/api/policies/route";
import { prismaMock } from "@/tests/mocks/prisma";

// Mock the Prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("/api/policies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns user policies", async () => {
    const mockPolicies = [
      { id: "1", policyNumber: "POL-001", userId: "user1" },
      { id: "2", policyNumber: "POL-002", userId: "user1" },
    ];

    prismaMock.policy.findMany.mockResolvedValue(mockPolicies);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
          },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.policies).toHaveLength(2);
        expect(data.policies[0].policyNumber).toBe("POL-001");
      },
    });
  });

  it("POST creates new policy with validation", async () => {
    const newPolicy = {
      type: "HOME",
      property: {
        address: "123 Main St",
        what3words: "filled.count.soap",
        yearBuilt: 2020,
        sqft: 2000,
      },
      coverage: {
        dwelling: 300000,
        personalProperty: 150000,
        liability: 500000,
      },
    };

    prismaMock.policy.create.mockResolvedValue({
      id: "3",
      policyNumber: "POL-003",
      ...newPolicy,
      userId: "user1",
    });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: "POST",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
          body: JSON.stringify(newPolicy),
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.policyNumber).toBe("POL-003");
      },
    });
  });

  it("returns 400 for invalid policy data", async () => {
    const invalidPolicy = {
      type: "INVALID_TYPE", // Invalid enum value
      property: {
        // Missing required fields
      },
    };

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: "POST",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
          body: JSON.stringify(invalidPolicy),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toContain("validation");
      },
    });
  });
});
```

### 7.2 E2E Testing with Playwright

**Modern Playwright Configuration**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['github'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
})

// e2e/claim-submission.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Claim Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'testpass123')
    await page.click('[data-testid="login-button"]')

    // Wait for dashboard to load
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()
  })

  test('should complete full claim submission', async ({ page }) => {
    // Navigate to claim submission
    await page.click('[data-testid="submit-claim-button"]')
    await expect(page.locator('h1')).toContainText('Submit New Claim')

    // Fill basic information
    await page.selectOption('[data-testid="policy-select"]', 'POL-001')
    await page.selectOption('[
```
