# Phase 5.2: Monitoring & Analytics - Implementation Guide

**Date**: October 7, 2025
**Status**: ✅ Complete
**Progress**: Phase 5.2 - 100%

---

## 📊 Monitoring & Analytics Summary

### Completed Implementations (Step 5.2)

Phase 5.2 adds comprehensive monitoring and analytics infrastructure for production debugging, performance tracking, and proactive error detection.

---

## 🎯 Implemented Features

### 1. PostHog Analytics Integration ✅

**Status**: Already implemented and enhanced

**Location**: `src/lib/services/analytics.ts` (299 lines)

**Features**:
- Client-side event tracking
- User identification and properties
- Insurance-specific event categories:
  - Policy events (viewed, created, updated, renewed)
  - Claim events (submitted, status changed, document uploaded)
  - Payment events (initiated, completed, failed)
  - User events (sign up, sign in, profile updated)
  - Feature usage tracking
  - Error tracking
  - Performance tracking

**Usage Example**:
```typescript
import { analytics } from '@/lib/services/analytics';

// Track policy creation
analytics.policyEvents.created(policyId, 'HOME', 1500, 500000);

// Track claim submission
analytics.claimEvents.submitted(claimId, 'FIRE_DAMAGE', 25000);

// Track payment
analytics.paymentEvents.completed(1500, 'paystack', policyId);

// Track feature usage
analytics.featureEvents.premiumCalculatorUsed(inputData, calculatedPremium);
```

**Configuration**: `.env`
```env
NEXT_PUBLIC_POSTHOG_KEY="phc_your_posthog_key"
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
```

---

### 2. Error Monitoring System ✅

**Created**: `src/lib/services/error-monitoring.ts` (362 lines)

**Features**:
- **Error Categorization**: Network, Database, Authentication, Authorization, Validation, Business Logic, External Service
- **Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL
- **Context Capture**: User ID, role, endpoint, request details
- **Error Queue**: In-memory error history (last 100 errors)
- **Critical Error Alerts**: Automatic alerting for critical errors
- **Statistics**: Error breakdown by severity and category

**Error Categories**:
```typescript
enum ErrorCategory {
  NETWORK = 'network',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  UNKNOWN = 'unknown',
}
```

**Usage Examples**:
```typescript
import { errorMonitoring, ErrorSeverity, ErrorCategory } from '@/lib/services/error-monitoring';

// Capture general error
errorMonitoring.captureError(
  error,
  ErrorSeverity.HIGH,
  ErrorCategory.DATABASE,
  { userId, endpoint: '/api/policies' }
);

// Capture API error
errorMonitoring.captureAPIError(
  '/api/policies',
  'POST',
  500,
  error,
  { userId, userRole: 'CUSTOMER' }
);

// Capture database error
errorMonitoring.captureDatabaseError(
  'policy.create',
  error,
  'INSERT INTO policies...',
  { userId }
);

// Capture auth error
errorMonitoring.captureAuthError('login', error, { userId });

// Get error statistics
const stats = errorMonitoring.getStats();
// Returns: { total, bySeverity, byCategory, oldest, newest }
```

**Integration with PostHog**:
All errors are automatically sent to PostHog for centralized tracking and analysis.

---

### 3. Performance Monitoring ✅

**Created**: `src/lib/services/performance-monitoring.ts` (258 lines)

**Features**:
- **Operation Timing**: Measure sync and async function execution
- **Database Query Tracking**: Automatic query performance monitoring
- **Slow Operation Detection**: Alerts for operations >1s
- **Statistics**: Average, median, P95, P99 response times
- **API Endpoint Tracking**: Track response times by endpoint
- **Page Load Tracking**: Monitor client-side page performance

**Usage Examples**:
```typescript
import { performanceMonitoring, Measure } from '@/lib/services/performance-monitoring';

// Measure async operation
const result = await performanceMonitoring.measureAsync(
  'fetchUserPolicies',
  async () => {
    return await db.policy.findMany({ where: { userId } });
  },
  { userId }
);

// Measure sync operation
const result = performanceMonitoring.measure(
  'calculatePremium',
  () => calculator.calculate(data),
  { coverage: 500000 }
);

// Using decorator
class PolicyService {
  @Measure('PolicyService.create')
  async createPolicy(data: any) {
    // ... implementation
  }
}

// Track API endpoint
performanceMonitoring.trackAPIEndpoint(
  '/api/policies',
  'POST',
  200,
  duration
);

// Get statistics
const stats = performanceMonitoring.getStats();
// Returns: { total, average, median, p95, p99, min, max }

const queryStats = performanceMonitoring.getQueryStats();
// Returns: { total, byModel, byOperation, slowQueries, cachedQueries, cacheHitRate }
```

---

### 4. Database Query Performance Tracking ✅

**Created**: `src/lib/middleware/prisma-monitoring.ts` (96 lines)

**Features**:
- **Automatic Query Tracking**: All Prisma queries monitored
- **Performance Metrics**: Duration, result count, model, operation
- **Slow Query Detection**: Alerts for queries >100ms
- **Error Logging**: Captures and categorizes Prisma errors
- **Development Logging**: Detailed query logs in development

**Middleware Stack**:
1. **Monitoring Middleware**: Tracks query performance
2. **Error Middleware**: Captures and categorizes database errors
3. **Logging Middleware** (dev only): Detailed query logging

**Integration** (`src/lib/db.ts`):
```typescript
import {
  createPrismaMonitoringMiddleware,
  createPrismaLoggingMiddleware,
  createPrismaErrorMiddleware,
} from './middleware/prisma-monitoring';

// Add middleware to Prisma client
db.$use(createPrismaMonitoringMiddleware());
db.$use(createPrismaErrorMiddleware());

if (process.env.NODE_ENV === 'development') {
  db.$use(createPrismaLoggingMiddleware());
}
```

**Automatic Benefits**:
- ✅ All database queries automatically tracked
- ✅ Slow queries logged and sent to PostHog
- ✅ Database errors categorized and monitored
- ✅ No manual instrumentation required

---

### 5. Monitoring Dashboard API ✅

**Created**: `src/app/api/monitoring/dashboard/route.ts` (236 lines)

**Endpoint**: `GET /api/monitoring/dashboard`

**Response Structure**:
```typescript
{
  timestamp: string,
  healthScore: number,              // 0-100 overall health
  errors: {
    stats: {
      total: number,
      bySeverity: { LOW, MEDIUM, HIGH, CRITICAL },
      byCategory: { ... },
      oldest: Date,
      newest: Date
    },
    recent: Array<{ id, message, severity, category, timestamp, context }>
  },
  performance: {
    stats: { total, average, median, p95, p99, min, max },
    slowOperations: Array<{ name, duration, timestamp, metadata }>
  },
  database: {
    queryStats: {
      total,
      byModel: { User, Policy, Claim, ... },
      byOperation: { findMany, create, update, ... },
      slowQueries: number,
      cachedQueries: number,
      averageDuration: number,
      cacheHitRate: number
    },
    slowQueries: Array<{ model, operation, duration, resultCount, cached }>
  },
  system: {
    database: { connected, responseTime, status },
    memory: { heapUsed, heapTotal, heapPercentage, status },
    uptime: { seconds, formatted },
    environment: string
  },
  recommendations: string[]
}
```

**Health Score Calculation**:
```typescript
// Starts at 100, deducts for:
- Critical errors: -10 each
- High errors: -5 each
- Medium errors: -2 each
- Slow queries (>10): -10
- Low cache hit rate (<30%): -10
- Slow database (<500ms): -15
- High memory usage (>400MB): -20
```

**Usage**:
```bash
curl http://localhost:3000/api/monitoring/dashboard

# Example response
{
  "healthScore": 95,
  "errors": {
    "stats": { "total": 2, "bySeverity": { "LOW": 2 } }
  },
  "performance": {
    "stats": { "average": 45, "p95": 120, "p99": 250 }
  },
  "database": {
    "queryStats": {
      "total": 150,
      "cacheHitRate": 65,
      "slowQueries": 2
    }
  },
  "recommendations": [
    "✅ System is healthy. All metrics within acceptable ranges."
  ]
}
```

---

## 📈 Monitoring Coverage

### Automatic Monitoring

**Database Queries** (via Prisma middleware):
- ✅ All queries tracked automatically
- ✅ Performance metrics collected
- ✅ Slow queries detected (>100ms)
- ✅ Error categorization
- ✅ Result count tracking

**Errors** (via error monitoring service):
- ✅ Automatic categorization
- ✅ Severity determination
- ✅ Context capture (user, endpoint, etc.)
- ✅ PostHog integration
- ✅ Critical error alerts

**Performance** (via performance monitoring service):
- ✅ Operation timing
- ✅ API endpoint tracking
- ✅ Slow operation detection (>1s)
- ✅ Statistics (P50, P95, P99)
- ✅ PostHog integration

### Manual Instrumentation Required

**Client-side Events** (via analytics service):
- Policy views/creates/updates
- Claim submissions
- Payment flows
- Feature usage
- User interactions

**Example Integration**:
```typescript
// In your API route or component
import { analytics } from '@/lib/services/analytics';
import { performanceMonitoring } from '@/lib/services/performance-monitoring';
import { errorMonitoring } from '@/lib/services/error-monitoring';

export async function POST(req: Request) {
  const endMeasure = performanceMonitoring.startMeasure('createPolicy');

  try {
    const result = await createPolicy(data);

    // Track success
    analytics.policyEvents.created(result.id, result.type, result.premium, result.coverage);

    endMeasure();
    return NextResponse.json(result);
  } catch (error) {
    // Track error
    errorMonitoring.captureAPIError('/api/policies', 'POST', 500, error);

    endMeasure();
    return NextResponse.json({ error: 'Failed to create policy' }, { status: 500 });
  }
}
```

---

## 🎯 Production Monitoring Checklist

### Before Deployment

- [x] PostHog configured with production key
- [x] Error monitoring service active
- [x] Performance monitoring service active
- [x] Prisma middleware monitoring enabled
- [x] Monitoring dashboard endpoint created
- [ ] Set up alerting for critical errors (external service)
- [ ] Configure log aggregation (optional)
- [ ] Set up uptime monitoring (external service)

### Post-Deployment

- [ ] Verify PostHog receiving events
- [ ] Test monitoring dashboard endpoint
- [ ] Confirm slow query alerts working
- [ ] Validate error categorization
- [ ] Monitor health score trends
- [ ] Set up dashboard visualization (Grafana/PostHog)

---

## 📊 Monitoring Best Practices

### 1. **Error Handling Pattern**
```typescript
try {
  // ... operation
} catch (error) {
  errorMonitoring.captureException(error, {
    userId,
    endpoint: req.url,
    method: req.method,
  });
  throw error; // Re-throw after logging
}
```

### 2. **Performance Measurement Pattern**
```typescript
const endMeasure = performanceMonitoring.startMeasure('operationName');
try {
  const result = await performOperation();
  endMeasure();
  return result;
} catch (error) {
  endMeasure(); // Always end measurement
  throw error;
}
```

### 3. **Analytics Event Pattern**
```typescript
// Track user actions
analytics.userEvents.signUp('clerk');

// Track business events
analytics.policyEvents.created(id, type, premium, coverage);

// Track feature usage
analytics.featureEvents.used('premium_calculator', { coverage: 500000 });
```

---

## 📝 Files Created/Modified

### Created (3 files)
1. **`src/lib/services/error-monitoring.ts`** (362 lines)
   - Centralized error tracking
   - Error categorization and severity
   - Context capture and statistics

2. **`src/lib/services/performance-monitoring.ts`** (258 lines)
   - Performance measurement utilities
   - Query performance tracking
   - Slow operation detection

3. **`src/lib/middleware/prisma-monitoring.ts`** (96 lines)
   - Automatic query tracking
   - Database error categorization
   - Development query logging

4. **`src/app/api/monitoring/dashboard/route.ts`** (236 lines)
   - Monitoring dashboard API
   - Health score calculation
   - Recommendations engine

### Modified (1 file)
1. **`src/lib/db.ts`**
   - Added Prisma monitoring middleware
   - Added error logging middleware
   - Enhanced development logging

---

## 🔍 Key Insights

### Error Monitoring
- **Automatic Categorization**: Reduces manual effort in error classification
- **Context Capture**: Critical for debugging production issues
- **PostHog Integration**: Centralizes all monitoring data
- **Critical Alerts**: Proactive notification of severe issues

### Performance Monitoring
- **P95/P99 Metrics**: Better indicators than averages for user experience
- **Slow Query Detection**: Identifies database bottlenecks early
- **Cache Hit Rate**: Measures caching effectiveness
- **Operation Tracking**: Pinpoints performance hotspots

### Database Monitoring
- **Automatic Middleware**: No manual instrumentation needed
- **Development Logging**: Detailed query information during development
- **Error Categorization**: Distinguishes validation vs. connection errors
- **Slow Query Threshold**: Configurable based on application needs

---

## 🚀 Next Steps (Phase 5.3)

**Documentation & Testing**:
1. API documentation generation (TypeDoc/Swagger)
2. User manual creation
3. Deployment documentation update
4. End-to-end test suite with Playwright
5. Test coverage improvements (target >80%)

---

**Document Version**: 1.0
**Prepared by**: AI Agent
**Review Status**: Ready for Phase 5.3
