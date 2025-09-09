# Developer Guide

## 🎯 Getting Started as a New Developer

Welcome to the Home Insurance Platform team! This guide will help you understand the codebase structure, patterns, and conventions used in this project.

## 📚 Understanding the Codebase

### Core Architecture

This is a **full-stack TypeScript application** with these key architectural decisions:

1. **Next.js App Router** - Modern React framework with file-based routing
2. **tRPC** - Type-safe API layer with end-to-end TypeScript
3. **Prisma + MongoDB** - Type-safe database access
4. **Feature-Based Structure** - Organized by business domains

### Mental Model

Think of the application as having these layers:

```
┌─────────────────┐
│   UI Components │ ← React components in /components
├─────────────────┤
│   Pages/Routes  │ ← Next.js pages in /app
├─────────────────┤
│   API Layer     │ ← tRPC routers in /server/api
├─────────────────┤
│ Business Logic  │ ← Services in /lib/services
├─────────────────┤
│   Database      │ ← Prisma + MongoDB
└─────────────────┘
```

## 🗂 Directory Deep Dive

### `/src/app` - Next.js App Router

This uses Next.js 15's App Router pattern:

```typescript
// Example: /app/policies/[id]/page.tsx
export default function PolicyDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // This automatically becomes route: /policies/{id}
  const { data: policy } = api.policy.getPolicyById.useQuery({
    policyId: params.id,
  });

  return <PolicyDetailsView policy={policy} />;
}
```

**Key Concepts:**

- `page.tsx` = publicly accessible route
- `layout.tsx` = shared layout wrapper
- `[id]` = dynamic route parameter
- `[[...slug]]` = catch-all routes (used for Clerk auth)

### `/src/components` - UI Components

Organized by **feature** and **abstraction level**:

```
components/
├── ui/              # Generic, reusable components (buttons, inputs)
├── forms/           # Form-specific components
├── policies/        # Policy-domain components
├── claims/          # Claims-domain components
└── layout/          # Layout and navigation components
```

**Example Component Structure:**

```typescript
// components/policies/policy-card.tsx
interface PolicyCardProps {
  policy: Policy;
  onEdit?: () => void;
}

export function PolicyCard({ policy, onEdit }: PolicyCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3>{policy.policyNumber}</h3>
        <Badge variant={policy.status === "ACTIVE" ? "default" : "secondary"}>
          {policy.status}
        </Badge>
      </CardHeader>
      {/* ... */}
    </Card>
  );
}
```

### `/src/server/api` - tRPC Backend

This is where **business logic** and **data access** happens:

```typescript
// server/api/routers/policy.ts
export const policyRouter = createTRPCRouter({
  getUserPolicies: protectedProcedure // ← Requires authentication
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        status: z.enum(["ACTIVE", "DRAFT"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.policy.findMany({
        where: {
          userId: ctx.user.id, // ← Automatic user filtering
          ...(input.status && { status: input.status }),
        },
        take: input.limit,
      });
    }),
});
```

**tRPC Benefits:**

- **Type Safety**: Input/output types automatically inferred
- **Validation**: Zod schemas validate inputs
- **Authorization**: Built-in auth checks

### `/src/lib/services` - Business Logic

Pure business logic, separated from API concerns:

```typescript
// lib/services/premium-calculator.ts
export class PremiumCalculatorService {
  static calculateHomePremium(data: QuoteData): PremiumCalculation {
    // Complex business logic here
    const basePremium = this.calculateBasePremium(data.coverage);
    const riskMultiplier = this.assessRisk(data.propertyInfo);

    return {
      basePremium,
      finalPremium: basePremium * riskMultiplier,
      breakdown: {
        /* detailed breakdown */
      },
    };
  }
}
```

**Service Benefits:**

- **Testable**: Pure functions, easy to unit test
- **Reusable**: Can be used in multiple API endpoints
- **Maintainable**: Complex logic in dedicated files

## 🔄 Data Flow Patterns

### 1. User Action → API Call → Database

```typescript
// 1. User clicks button in component
function PolicyCard({ policy }) {
  const updateStatus = api.policy.updatePolicyStatus.useMutation();

  const handleActivate = () => {
    updateStatus.mutate({ policyId: policy.id, status: "ACTIVE" });
  };

  return <Button onClick={handleActivate}>Activate Policy</Button>;
}

// 2. tRPC handles the API call
export const policyRouter = createTRPCRouter({
  updatePolicyStatus: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        status: z.enum(["ACTIVE", "DRAFT", "EXPIRED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 3. Update database via Prisma
      return await ctx.db.policy.update({
        where: { id: input.policyId },
        data: { status: input.status },
      });
    }),
});
```

### 2. Database → API → UI State

```typescript
// 1. Query database in tRPC
const policies = api.policy.getUserPolicies.useQuery();

// 2. React Query handles caching/loading states
if (policies.isLoading) return <Skeleton />;
if (policies.error) return <ErrorMessage />;

// 3. Render with type-safe data
return policies.data.map((policy) => (
  <PolicyCard key={policy.id} policy={policy} />
));
```

## 🧩 Key Patterns to Follow

### 1. Component Patterns

**✅ Good - Single Responsibility:**

```typescript
function PolicyStatusBadge({ status }: { status: PolicyStatus }) {
  const variant = status === "ACTIVE" ? "default" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}
```

**❌ Avoid - Too Many Responsibilities:**

```typescript
function PolicyCard({ policy }) {
  // DON'T: Handle data fetching, formatting, AND rendering
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    /* fetch data */
  }, []);

  return (
    <div>
      {/* Complex formatting logic */}
      {/* Multiple unrelated UI concerns */}
    </div>
  );
}
```

### 2. API Patterns

**✅ Good - Proper Validation:**

```typescript
createPolicy: protectedProcedure
  .input(createPolicySchema) // ← Zod validation
  .mutation(async ({ ctx, input }) => {
    // Validate business rules
    if (input.coverage > 1000000) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Coverage too high",
      });
    }

    return await ctx.db.policy.create({ data: input });
  });
```

### 3. Error Handling

**✅ Good - Graceful Error States:**

```typescript
function PolicyList() {
  const { data, error, isLoading } = api.policy.getUserPolicies.useQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error.message} />;
  if (!data?.length) return <EmptyState />;

  return (
    <div>
      {data.map((policy) => (
        <PolicyCard policy={policy} />
      ))}
    </div>
  );
}
```

## 🛠 Development Workflow

### 1. Adding a New Feature

**Step 1: Define the Data Model**

```typescript
// 1. Update Prisma schema if needed
model NewFeature {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  name      String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

**Step 2: Create API Endpoints**

```typescript
// 2. Add tRPC router
export const newFeatureRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createNewFeatureSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.newFeature.create({
        data: { ...input, userId: ctx.user.id },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.newFeature.findMany({
      where: { userId: ctx.user.id },
    });
  }),
});
```

**Step 3: Create UI Components**

```typescript
// 3. Build React components
function NewFeatureForm() {
  const createFeature = api.newFeature.create.useMutation();

  const onSubmit = (data) => {
    createFeature.mutate(data, {
      onSuccess: () => router.push("/new-feature"),
    });
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

**Step 4: Add Route/Page**

```typescript
// 4. Create Next.js page
// app/new-feature/page.tsx
export default function NewFeaturePage() {
  return (
    <div>
      <h1>New Feature</h1>
      <NewFeatureForm />
    </div>
  );
}
```

### 2. Testing Your Changes

```bash
# Run tests
pnpm test                    # Unit tests
pnpm test:e2e               # End-to-end tests

# Check types
pnpm build                  # TypeScript compilation

# Check code quality
pnpm lint                   # ESLint
```

## 🎨 UI/UX Guidelines

### Design System

We use **shadcn/ui** components with Tailwind CSS:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Use design system components
<Card>
  <CardHeader>
    <CardTitle>Policy Details</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="outline" size="sm">
      Edit Policy
    </Button>
  </CardContent>
</Card>;
```

### Responsive Design

Always mobile-first:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid: 1 col mobile, 2 tablet, 3 desktop */}
</div>
```

## 🚨 Common Pitfalls to Avoid

### 1. **Don't Mix Concerns**

```typescript
// ❌ BAD: API logic in components
function PolicyCard({ policyId }) {
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    fetch(`/api/policies/${policyId}`) // Don't do this!
      .then((res) => res.json())
      .then(setPolicy);
  }, []);
}

// ✅ GOOD: Use tRPC hooks
function PolicyCard({ policyId }) {
  const { data: policy } = api.policy.getPolicyById.useQuery({ policyId });
}
```

### 2. **Don't Skip Input Validation**

```typescript
// ❌ BAD: No validation
createPolicy: protectedProcedure.mutation(async ({ ctx, input }) => {
  return await ctx.db.policy.create({ data: input }); // Dangerous!
});

// ✅ GOOD: Always validate
createPolicy: protectedProcedure
  .input(createPolicySchema)
  .mutation(async ({ ctx, input }) => {
    return await ctx.db.policy.create({ data: input });
  });
```

### 3. **Don't Forget Error Handling**

```typescript
// ❌ BAD: No error handling
function PolicyList() {
  const { data } = api.policy.getUserPolicies.useQuery();
  return data.map((policy) => <PolicyCard policy={policy} />); // Will crash!
}

// ✅ GOOD: Handle all states
function PolicyList() {
  const { data, error, isLoading } = api.policy.getUserPolicies.useQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.length) return <EmptyState />;

  return data.map((policy) => <PolicyCard key={policy.id} policy={policy} />);
}
```

## 🔐 Staff Access System

### Overview

The platform includes a sophisticated **hidden staff access system** that provides multiple secure methods for staff members to access their portals without exposing these methods to customers.

### Access Methods

#### **1. Keyboard Shortcuts**

```typescript
// Global keyboard event listener (Ctrl+Shift+S)
const handleKeyboardShortcut = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.shiftKey && event.key === "S") {
    event.preventDefault();
    // Trigger staff access modal or redirect
    window.location.href = "/staff/login";
  }
};
```

**Implementation**: Added to main layout or provider component
**Security**: Only works with specific key combination
**Cross-platform**: Works on Windows (Ctrl), Mac (Cmd), Linux

#### **2. Admin Corner**

```typescript
// Triple-click detection in bottom-right corner
let clickCount = 0;
const cornerElement = document.getElementById("admin-corner");

const handleCornerClick = (event: MouseEvent) => {
  const rect = cornerElement.getBoundingClientRect();
  const isInCorner =
    event.clientX > rect.right - 50 && event.clientY > rect.bottom - 50;

  if (isInCorner) {
    clickCount++;
    if (clickCount === 3) {
      showStaffAccessModal();
      clickCount = 0;
    }
  }
};
```

**Implementation**: Invisible element positioned at bottom-right
**Security**: Requires precise interaction in specific screen area
**Mobile Support**: Works with touch events

#### **3. URL Patterns**

```typescript
// Special URLs that redirect to staff login
const staffUrls = [
  "/staff-portal",
  "/admin-access",
  "/team-login",
  "/internal-tools",
];

// Middleware or page-level redirect
export default function StaffPortalRedirect() {
  useEffect(() => {
    router.push("/staff/login");
  }, []);
}
```

**Implementation**: Next.js dynamic routes with redirects
**Security**: URLs not linked anywhere in navigation
**Audit Trail**: Can be logged for access tracking

#### **4. Magic Gestures**

```typescript
// Mouse movement pattern recognition
const gesturePattern = [
  { direction: "right", distance: 200 },
  { direction: "down", distance: 100 },
  { direction: "right", distance: 150 },
];

const trackMouseGesture = (event: MouseEvent) => {
  // Track mouse movement patterns
  // Trigger staff access when pattern matches
};
```

**Implementation**: Mouse event listeners with pattern matching
**Security**: Requires specific, deliberate mouse movements
**Accessibility**: Alternative methods available

### Security Implementation

#### **Access Logging**

```typescript
const logStaffAccess = async (method: string, userId?: string) => {
  await fetch("/api/analytics/staff-access", {
    method: "POST",
    body: JSON.stringify({
      method, // 'keyboard', 'corner', 'url', 'gesture'
      userId, // undefined for anonymous access attempts
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      url: window.location.href,
    }),
  });
};
```

#### **Rate Limiting**

```typescript
// Prevent brute force attempts
const accessAttempts = new Map<string, number>();

const checkRateLimit = (identifier: string): boolean => {
  const attempts = accessAttempts.get(identifier) || 0;
  if (attempts > 5) {
    // Block access attempts for 15 minutes
    return false;
  }
  accessAttempts.set(identifier, attempts + 1);
  return true;
};
```

#### **Session Management**

```typescript
// Staff session configuration
const STAFF_SESSION_CONFIG = {
  cookieName: "staff-session",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};
```

### Staff Authentication Flow

#### **Registration Process**

```typescript
// API: POST /api/staff/register
const registerStaff = async (data: StaffRegistrationData) => {
  // 1. Validate input data
  // 2. Check for existing user
  // 3. Hash password
  // 4. Create user record
  // 5. Send welcome email
  // 6. Log registration event
};
```

#### **Login Process**

```typescript
// API: POST /api/staff/login
const authenticateStaff = async (credentials: LoginCredentials) => {
  // 1. Find user by email
  // 2. Verify staff role
  // 3. Check password
  // 4. Create JWT session
  // 5. Set secure cookie
  // 6. Log successful login
  // 7. Redirect to role-specific dashboard
};
```

### Role-Based Access Control

#### **Role Hierarchy**

```typescript
enum UserRole {
  CUSTOMER = 1,
  AGENT = 2,
  UNDERWRITER = 3,
  ADMIN = 4,
}

// Role-based route protection
const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (userRole: UserRole) => {
    return allowedRoles.includes(userRole);
  };
};
```

#### **Dashboard Routing**

```typescript
const getDashboardUrl = (userRole: UserRole): string => {
  switch (userRole) {
    case UserRole.ADMIN:
      return "/admin/dashboard";
    case UserRole.AGENT:
      return "/agent/dashboard";
    case UserRole.UNDERWRITER:
      return "/underwriter/dashboard";
    default:
      return "/customer/dashboard";
  }
};
```

### Implementation Checklist

#### **For New Developers**

- [ ] Understand all access methods
- [ ] Test each access method locally
- [ ] Review security implementations
- [ ] Understand role-based permissions
- [ ] Learn session management patterns
- [ ] Review audit logging systems

#### **Security Review**

- [ ] Access methods are not exposed in UI
- [ ] All access attempts are logged
- [ ] Rate limiting is implemented
- [ ] Session timeouts are configured
- [ ] HTTPS is enforced in production
- [ ] Audit trails are maintained

### Testing Staff Access

#### **Manual Testing**

```bash
# Test keyboard shortcuts
# 1. Open any page
# 2. Press Ctrl+Shift+S
# 3. Verify redirect to /staff/login

# Test admin corner
# 1. Move mouse to bottom-right corner
# 2. Triple-click
# 3. Verify staff access modal appears

# Test URL patterns
# 1. Navigate to /staff-portal
# 2. Verify redirect to /staff/login
```

#### **Automated Testing**

```typescript
describe("Staff Access System", () => {
  test("keyboard shortcut triggers staff access", () => {
    // Simulate Ctrl+Shift+S
    // Verify redirect behavior
  });

  test("admin corner detects triple-click", () => {
    // Simulate mouse events
    // Verify access modal appears
  });

  test("URL patterns redirect correctly", () => {
    // Test various staff URLs
    // Verify secure redirects
  });
});
```

### Troubleshooting Staff Access

#### **Common Issues**

1. **Keyboard shortcut not working**

   - Check for browser extensions interfering
   - Verify event listeners are attached
   - Test in incognito mode

2. **Admin corner not responding**

   - Check element positioning
   - Verify click area dimensions
   - Test touch events on mobile

3. **URL redirects failing**
   - Check Next.js routing configuration
   - Verify middleware rules
   - Test with different browsers

#### **Debug Mode**

```typescript
// Enable staff access debugging
if (process.env.NODE_ENV === "development") {
  window.staffAccessDebug = {
    logAccessAttempts: true,
    showAccessElements: true,
    bypassRateLimiting: false,
  };
}
```

---

## 🔍 Debugging Tips

### 1. tRPC DevTools

- Install React Query DevTools for debugging API calls
- Use browser network tab to see tRPC requests

### 2. Database Debugging

```bash
# Open Prisma Studio to inspect data
pnpm db:studio

# Check database queries in development
# Enable Prisma logging in lib/db.ts
```

### 3. Type Errors

```typescript
// Use type assertions carefully
const policy = data as Policy; // ❌ Avoid

// Better: Use proper typing
const { data: policy } = api.policy.getPolicyById.useQuery({
  policyId: id,
}); // ✅ Type-safe
```

## 📚 Recommended Learning Resources

1. **Next.js App Router** - [Official Docs](https://nextjs.org/docs/app)
2. **tRPC** - [Official Docs](https://trpc.io/docs)
3. **Prisma** - [Official Docs](https://www.prisma.io/docs)
4. **Tailwind CSS** - [Official Docs](https://tailwindcss.com/docs)
5. **React Query** - [TanStack Query](https://tanstack.com/query/latest)

## 🤝 Getting Help

1. **Check existing code** - Look for similar patterns in the codebase
2. **Read tests** - Tests often show expected usage
3. **Ask the team** - Don't hesitate to ask questions!
4. **Documentation** - Check `/docs` folder for more details

---

Welcome to the team! 🎉 Take your time exploring the codebase, and don't hesitate to ask questions.
