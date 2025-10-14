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

### Phase 2 Completed (2025-09-22)

**Files Modified:**
- `src/components/ui/coverage-amount-selector.tsx` - New comprehensive coverage amount selection component
- `src/components/forms/steps/coverage-step.tsx` - Enhanced with tabbed interface for per-amount vs detailed selection
- `src/components/agent/quote-generator.tsx` - Updated agent quote generator with per-amount model integration

**Key Features Implemented:**

1. **Coverage Amount Selector Component**: A sophisticated UI component featuring:
   - Slider interface for visual coverage amount selection (R25K - R5M range)
   - Manual input field with currency formatting and validation
   - Increment/decrement buttons for precise amount adjustments
   - Real-time premium calculation with live updates
   - Quick selection buttons for common amounts (R250K, R500K, R750K, R1M)
   - Dynamic rate display showing percentage of coverage amount
   - Discount notifications for higher coverage amounts
   - Integration with tRPC `calculatePremiumRealTime` endpoint

2. **Enhanced Coverage Step Component**: Modernized with dual-mode selection:
   - **Tabbed Interface**: Clean toggle between "Total Amount" and "Detailed Breakdown" modes
   - **Per-Amount Mode (Recommended)**: Single coverage amount input that auto-distributes across:
     - Dwelling Coverage (60% of total)
     - Personal Property (25% of total)
     - Liability Coverage (12% of total)
     - Medical Payments (3% of total)
   - **Detailed Mode (Advanced)**: Individual control over each coverage type
   - **Real-time Premium Display**: Shows live premium calculations as amounts change
   - **Distribution Breakdown**: Clear visualization of how total amount is allocated

3. **Agent Quote Generator Integration**: Professional per-amount quote generation:
   - **Dual Coverage Selection**: Same tabbed interface as customer-facing components
   - **Risk Factor Integration**: Automatically creates risk profiles from property data
   - **Live Premium Estimates**: Real-time premium calculation during quote creation
   - **Enhanced Review Section**: Clear display of coverage mode and distribution
   - **Auto-Distribution Logic**: Intelligent allocation of total coverage across types
   - **Professional Presentation**: Enhanced UI with proper spacing and visual hierarchy

4. **Real-time Premium Calculation**: Advanced premium calculation features:
   - **Debounced API Calls**: Efficient real-time updates with 300ms debounce
   - **Risk Factor Integration**: Location, property type, age, and safety features
   - **Dynamic Rate Scaling**: Better rates for higher coverage amounts
   - **Loading States**: Professional loading indicators during calculations
   - **Error Handling**: Graceful fallbacks for calculation failures

**Technical Enhancements:**

1. **Component Architecture**: Clean separation of concerns with reusable components
2. **State Management**: Efficient React state handling with proper form integration
3. **Performance**: Optimized with debounced API calls and smart re-rendering
4. **Accessibility**: Proper ARIA labels and keyboard navigation support
5. **Type Safety**: Full TypeScript integration with proper type definitions
6. **Responsive Design**: Mobile-optimized layouts with appropriate breakpoints

**User Experience Improvements:**

1. **Simplified Selection**: Users can now select total coverage amount instead of individual components
2. **Visual Feedback**: Slider, buttons, and real-time premium updates provide immediate feedback
3. **Educational Elements**: Clear explanations of per-amount vs detailed modes
4. **Professional Presentation**: Enhanced visual design with proper spacing and typography
5. **Flexibility**: Advanced users can still use detailed breakdown mode when needed

**Integration Points:**

1. **Form Integration**: Seamless integration with React Hook Form validation
2. **tRPC Integration**: Full integration with backend premium calculation endpoints
3. **Risk Assessment**: Automatic risk factor creation from property data
4. **Currency Formatting**: Consistent South African Rand formatting throughout
5. **Error Handling**: Comprehensive error states and user feedback

**Phase 2 deliverables successfully completed ahead of schedule, providing a modern, intuitive interface for coverage selection that maintains backward compatibility while introducing advanced per-amount functionality.**