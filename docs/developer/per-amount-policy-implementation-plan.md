# Per-Amount Policy Model Implementation Plan

## Overview
Transition from fixed coverage tiers to a flexible per-amount model where customers select their exact desired coverage amount (e.g., R90,000) with premiums calculated dynamically based on that amount.

## Phase 1: Backend Foundation (Week 1-2) ✅ COMPLETED
### Database & Schema Updates ✅
- **Update Policy Model**: ✅ Policy schema already supports flexible amounts via `coverage` Float field
- **Update Premium Calculator**: ✅ Enhanced `PremiumCalculator` service with:
  - `calculateDynamicRate()` method for percentage-based calculations (0.8%-1.5% of coverage amount)
  - `calculatePremiumPerAmount()` method for per-amount coverage calculations
  - Dynamic rate scaling based on coverage amount (discounts for higher amounts)
- **Add Validation Rules**: ✅ Implemented `coverageAmountSchema` with minimum (R25,000) and maximum (R5,000,000) coverage limits with R5,000 increments

### API Layer Updates ✅
- **Policy tRPC Router**: ✅ Added new endpoints for per-amount model:
  - `generatePerAmountQuote`: New endpoint for per-amount quote generation
  - `calculatePremiumRealTime`: Real-time premium calculation for dynamic updates
  - Maintained backward compatibility with existing `generateQuote` endpoint
- **Premium Calculation**: ✅ New calculation logic using coverage amount * dynamic rate instead of tiered pricing
- **Validation Schemas**: ✅ Added new Zod schemas:
  - `coverageAmountSchema`: Validates amount ranges and R5,000 increments
  - `perAmountCoverageSchema`: Structure for per-amount coverage breakdown
  - `perAmountQuoteRequestSchema`: Complete validation for per-amount quotes

## Phase 2: UI Components Overhaul (Week 2-3)
### Coverage Selection Components
- **Coverage Step Component**: Replace dropdown selections with:
  - Amount input field with currency formatting
  - Slider component for visual selection (R25K - R5M range)
  - Real-time premium calculation display
  - Increment/decrement buttons for precise amounts

### Agent Tools Enhancement
- **Quote Generator**: Update quote form to include:
  - Coverage amount selector with live premium updates
  - "What-if" scenario comparison tool
  - Premium breakdown display
- **Coverage Calculator**: Transform existing calculator to per-amount model

### Customer-Facing Components
- **Policy Wizard**: Update multi-step form for amount selection
- **Policy Dashboard**: Display selected coverage amounts clearly
- **Premium Display**: Show monthly/annual amounts based on selected coverage

## Phase 3: Business Logic Updates (Week 3-4)
### Premium Calculation Engine
- **Rate Tables**: Implement dynamic rate calculation (0.8%-1.5% based on risk factors)
- **Risk Assessment**: Update risk multipliers for location, property type, age, etc.
- **Real-time Calculation**: Add instant premium updates as coverage amount changes

### Quote Generation System
- **Agent Workflows**: Update quote generation to support any coverage amount
- **Customer Communication**: Modify email templates and quote documents
- **Commission Calculation**: Update agent commission to percentage of premium value

## Phase 4: User Experience & Testing (Week 4-5)
### Frontend Polish
- **Interactive Elements**:
  - Smooth slider interactions
  - Real-time premium updates
  - Visual feedback for amount changes
- **Mobile Optimization**: Ensure coverage selection works well on mobile devices
- **Accessibility**: Add proper ARIA labels and keyboard navigation

### Validation & Error Handling
- **Amount Validation**: Ensure amounts meet increment requirements
- **Premium Bounds**: Validate calculated premiums are reasonable
- **User Feedback**: Clear error messages for invalid amounts

## Phase 5: Integration & Deployment (Week 5-6)
### System Integration
- **Payment Integration**: Update Paystack integration for variable premium amounts
- **Document Generation**: Modify policy documents to show exact coverage amounts
- **Reporting**: Update analytics to track coverage amount distributions

### Testing & Quality Assurance
- **Unit Tests**: Test premium calculations across amount ranges
- **Integration Tests**: Verify end-to-end quote generation
- **User Acceptance Testing**: Validate with agent and customer workflows

## Key Files to Modify

### Core Services
- `src/lib/services/premium-calculator.ts` - Core calculation logic
- `src/server/api/routers/policy.ts` - Policy API endpoints
- `src/lib/validations/policy.ts` - Validation schemas

### UI Components
- `src/components/forms/steps/coverage-step.tsx` - Coverage selection
- `src/components/ui/coverage-calculator.tsx` - Amount calculator
- `src/components/agent/quote-generator.tsx` - Agent quote tools

### Database
- `prisma/schema.prisma` - Policy model updates
- Database migration for existing policies

## Current State Analysis

### Premium Calculator Service
The existing `PremiumCalculator` already uses a base rate system (`BASE_RATE = 0.008` or 0.8%) applied to total coverage amount. Key observations:

```typescript
const basePremium = totalCoverage * BASE_RATE;
```

This foundation is solid but needs enhancement for:
- Variable rate ranges (0.8% - 1.5%)
- Better risk factor integration
- Real-time calculation APIs

### Coverage Step Component
Currently uses fixed dropdown selections:
```typescript
<SelectItem value="500000">R 500,000</SelectItem>
<SelectItem value="750000">R 750,000</SelectItem>
// ... more fixed tiers
```

Needs transformation to:
- Flexible amount input
- Slider for visual selection
- Real-time premium display

### Quote Generator
Contains comprehensive quote generation but uses fixed coverage tiers. The structure is well-organized with:
- Multi-step form validation
- Customer information capture
- Property details collection
- Coverage selection (needs updating)

## Implementation Details

### Phase 1 Tasks

#### 1.1 Update Premium Calculator
```typescript
// Add to PremiumCalculator class
static calculateDynamicRate(coverageAmount: number, riskFactors: any): number {
  const baseRate = 0.008; // 0.8%
  const maxRate = 0.015;  // 1.5%

  // Calculate rate based on risk factors
  let rate = baseRate;

  // Apply risk multipliers
  if (riskFactors.location?.riskLevel === 'high') rate *= 1.2;
  if (riskFactors.property?.age > 50) rate *= 1.1;

  return Math.min(rate, maxRate);
}
```

#### 1.2 Update Validation Schemas
```typescript
// In lib/validations/policy.ts
const coverageAmountSchema = z.number()
  .min(25000, "Minimum coverage is R25,000")
  .max(5000000, "Maximum coverage is R5,000,000")
  .refine(amount => amount % 5000 === 0, "Amount must be in R5,000 increments");
```

### Phase 2 Tasks

#### 2.1 New Coverage Amount Component
```typescript
// New component: CoverageAmountSelector
interface CoverageAmountSelectorProps {
  value: number;
  onChange: (amount: number) => void;
  onPremiumCalculated: (premium: number) => void;
}
```

#### 2.2 Enhanced Quote Generator
- Replace fixed dropdowns with amount selectors
- Add real-time premium calculation
- Implement "what-if" scenarios

### Phase 3 Tasks

#### 3.1 Real-time Premium API
```typescript
// New tRPC endpoint
calculatePremiumRealTime: publicProcedure
  .input(z.object({
    coverageAmount: z.number(),
    riskFactors: z.object({...})
  }))
  .query(async ({ input }) => {
    return PremiumCalculator.calculatePremium(
      PolicyType.HOME,
      { dwelling: input.coverageAmount },
      input.riskFactors
    );
  })
```

## Risk Mitigation

### Backward Compatibility
- Existing policies remain unchanged
- Migration script for database if needed
- Feature flag for gradual rollout

### Performance Considerations
- Cache premium calculations for common amounts
- Debounce real-time calculations
- Optimize database queries

### User Experience
- Progressive enhancement for JavaScript-disabled users
- Clear loading states during calculations
- Helpful error messages for invalid amounts

## Success Metrics
- **Performance**: Quote generation <30 seconds for any amount
- **Accuracy**: Premium calculations within 0.1% of expected values
- **Adoption**: Agent usage rate >90% within 2 weeks
- **Customer Satisfaction**: Flexibility rating >4.5/5

## Testing Strategy
- **Unit Tests**: Premium calculations across all amount ranges
- **Integration Tests**: End-to-end quote generation workflows
- **Performance Tests**: Load testing with various coverage amounts
- **User Testing**: Agent feedback on new tools

This implementation plan provides a structured approach to transitioning from fixed coverage tiers to a flexible per-amount model while maintaining system reliability and enhancing user experience.

## Implementation Progress

### Phase 1 Completed (2025-09-22)

**Files Modified:**
- `src/lib/services/premium-calculator.ts` - Added dynamic rate calculation methods
- `src/lib/validations/policy.ts` - Added per-amount validation schemas
- `src/server/api/routers/policy.ts` - Added new tRPC endpoints for per-amount model

**Key Features Implemented:**
1. **Dynamic Rate Calculation**: Premium rates now scale from 0.8%-1.5% based on:
   - Coverage amount (higher amounts get better rates)
   - Location risk factors
   - Property characteristics
   - Personal risk factors

2. **Per-Amount Quote Generation**: New `generatePerAmountQuote` endpoint that:
   - Accepts any coverage amount between R25,000 - R5,000,000
   - Validates amounts in R5,000 increments
   - Provides detailed premium breakdown

3. **Real-Time Premium Calculation**: New `calculatePremiumRealTime` endpoint for:
   - Instant premium updates as coverage amount changes
   - Live quote generation without creating policy records

4. **Backward Compatibility**: All existing functionality remains intact while new features are available

**Next Steps**: Phase 2 will focus on updating UI components to use the new per-amount model.