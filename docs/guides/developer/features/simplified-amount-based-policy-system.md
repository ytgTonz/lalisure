# Simplified Amount-Based Policy System

## Overview

This document outlines the transition from a complex risk-based premium calculation system to a simplified amount-based system where premiums are determined solely by the coverage amount chosen by the customer.

## Key Principles

### 1. Amount-Only Pricing
- Customer selects a coverage amount (e.g., R30,000, R50,000, R100,000)
- Premium is calculated using a fixed rate regardless of customer profile
- Same coverage amount = same premium for ALL customers

### 2. No Risk Factor Calculations
- Location doesn't affect pricing
- Property details don't affect pricing
- Personal demographics don't affect pricing
- Property age/construction type doesn't affect pricing

### 3. Property Information for Records Only
- Property details are collected for policy documentation
- Used for claim verification and service purposes
- NOT used for premium calculation

### 4. Metric System Only
- All measurements in metric units (square meters, not square feet)
- No pre-populated fields - only placeholders
- Clear metric unit indicators

## New Premium Calculation

### Fixed Rate Structure
```typescript
// Simple flat rate - no risk factors
const FLAT_RATE = 0.012; // 1.2% of coverage amount per year

Premium = Coverage Amount × FLAT_RATE
Monthly Premium = Annual Premium ÷ 12
```

### Example Pricing
- R30,000 coverage = R30,000 × 1.2% = R360/year = R30/month
- R50,000 coverage = R50,000 × 1.2% = R600/year = R50/month
- R100,000 coverage = R100,000 × 1.2% = R1,200/year = R100/month

## Implementation Changes

### 1. Premium Calculator Simplification
- Remove all risk factor calculations
- Use single flat rate for all customers
- Keep only coverage amount validation

### 2. Policy Wizard Updates
- Simplify coverage selection to amount-only
- Keep property information step for documentation
- Remove risk assessment step entirely
- Update all field labels to metric system

### 3. Property Information Changes
- Convert all measurements to metric
- Remove pre-populated values
- Add clear metric unit placeholders
- Keep information for documentation only

### 4. Quote Generation
- Use flat rate calculation only
- Same quote for same coverage amount
- Remove risk factor considerations

## Benefits

### For Customers
- Simple, transparent pricing
- Easy to understand and compare
- No discrimination based on location or property type
- Predictable premium costs

### For Business
- Simplified underwriting process
- Faster quote generation
- Reduced complexity in system maintenance
- Easier to explain to customers and agents

### For Agents
- Simple pricing structure to explain
- No complex risk assessments needed
- Faster quote turnaround
- Focus on coverage needs rather than risk factors

## Files to Modify

### Core Logic
1. `src/lib/services/premium-calculator.ts` - Simplify to flat rate only
2. `src/server/api/routers/policy.ts` - Update quote generation endpoints

### UI Components
1. `src/components/forms/policy-wizard.tsx` - Remove risk factors step
2. `src/components/forms/steps/coverage-step.tsx` - Simplify to amount selection
3. `src/components/forms/steps/property-info-step.tsx` - Convert to metric, remove pre-fills
4. `src/components/forms/steps/risk-factors-step.tsx` - Remove entirely

### Validation
1. `src/lib/validations/policy.ts` - Update schemas for simplified model

## Migration Strategy

### Phase 1: Preserve Existing Functionality
- Keep existing risk-based system as fallback
- Add new simplified calculation method
- Feature flag to switch between systems

### Phase 2: Update UI Components
- Modify wizard to use simplified approach
- Update property information to metric system
- Remove risk factor collection

### Phase 3: Switch to New System
- Enable simplified system by default
- Keep risk-based as option for special cases
- Monitor for any issues

### Phase 4: Cleanup
- Remove unused risk calculation code
- Update documentation
- Clean up database schema if needed

## Technical Specifications

### New Premium Calculator Method
```typescript
static calculateSimplePremium(coverageAmount: number): PremiumCalculationResult {
  const FLAT_RATE = 0.012; // 1.2% annual rate
  const annualPremium = coverageAmount * FLAT_RATE;
  const monthlyPremium = annualPremium / 12;

  return {
    basePremium: annualPremium,
    adjustedPremium: annualPremium,
    riskMultiplier: 1.0,
    breakdown: {
      baseCoverage: annualPremium,
      riskAdjustment: 0,
      locationFactor: 1.0,
      ageFactor: 1.0,
      discounts: 0,
    },
    monthlyPremium: Math.round(monthlyPremium * 100) / 100,
    annualPremium: Math.round(annualPremium * 100) / 100,
  };
}
```

### Metric System Conversions
- Square feet → Square meters (÷ 10.764)
- Remove all imperial unit references
- Add "m²" placeholders for area fields
- Add "km" placeholders for distance fields

### Property Information Fields (Documentation Only)
- Address (text)
- Property size in m² (number with placeholder)
- Build year (number)
- Property type (dropdown)
- Construction materials (dropdown)
- Safety features (checkboxes)
- Rural property features (checkboxes)

## Success Criteria

### Functional Requirements
- [ ] Same coverage amount produces identical premium for all customers
- [ ] Property information collected but doesn't affect pricing
- [ ] All measurements in metric system
- [ ] No pre-populated fields
- [ ] Fast quote generation (under 2 seconds)

### User Experience
- [ ] Simple coverage amount selection
- [ ] Clear metric unit indicators
- [ ] Transparent pricing display
- [ ] Easy-to-understand quote breakdown

### Business Requirements
- [ ] Consistent pricing across customer base
- [ ] Simplified agent training requirements
- [ ] Reduced system complexity
- [ ] Maintained data collection for claims

This simplified system will make insurance accessible and transparent while maintaining necessary documentation for policy administration and claims processing.