import { PolicyType } from '@prisma/client';

// V2: Simplified flat rate for amount-based pricing (LaLiSure model)
// Same coverage amount = same premium for ALL customers (no risk factors)
const FLAT_RATE = 0.012; // 1.2% annual rate - transparent pricing for rural markets

// Coverage limits for V2 (aligned with PRD_V2.md)
const MIN_COVERAGE = 30000;  // R30,000 minimum
const MAX_COVERAGE = 200000; // R200,000 maximum

interface PremiumCalculationResult {
  basePremium: number;
  adjustedPremium: number;
  riskMultiplier: number;
  breakdown: {
    baseCoverage: number;
    riskAdjustment: number;
    locationFactor: number;
    ageFactor: number;
    discounts: number;
  };
  monthlyPremium: number;
  annualPremium: number;
}

export class PremiumCalculator {
  /**
   * V2: Simplified premium calculation - NO risk factors, NO complex logic
   * Same coverage amount = same premium for ALL customers
   *
   * This approach ensures:
   * - Transparent pricing that builds trust in rural communities
   * - No discrimination based on personal factors
   * - Instant quotes without lengthy questionnaires
   * - Easy to understand pricing model
   *
   * @param coverageAmount - Coverage amount between R30,000 and R200,000
   * @returns Premium calculation result with monthly and annual amounts
   */
  static calculateSimplePremium(coverageAmount: number): PremiumCalculationResult {
    try {
      // Validate coverage amount against V2 limits
      if (coverageAmount < MIN_COVERAGE || coverageAmount > MAX_COVERAGE) {
        throw new Error(
          `Coverage amount must be between R${MIN_COVERAGE.toLocaleString()} and R${MAX_COVERAGE.toLocaleString()}`
        );
      }

      // Simple flat rate calculation - no risk factors considered
      const annualPremium = coverageAmount * FLAT_RATE;
      const monthlyPremium = annualPremium / 12;

      const result = {
        basePremium: Math.round(annualPremium * 100) / 100,
        adjustedPremium: Math.round(annualPremium * 100) / 100,
        riskMultiplier: 1.0, // Always 1.0 for simplified model
        breakdown: {
          baseCoverage: Math.round(annualPremium * 100) / 100,
          riskAdjustment: 0, // No risk adjustments in simplified model
          locationFactor: 1.0,
          ageFactor: 1.0,
          discounts: 0, // No discounts in simplified model
        },
        monthlyPremium: Math.round(monthlyPremium * 100) / 100,
        annualPremium: Math.round(annualPremium * 100) / 100,
      };

      return result;
    } catch (error) {
      console.error('Error in PremiumCalculator.calculateSimplePremium:', error);
      throw new Error(
        `Premium calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate a unique quote number with timestamp
   * Format: QTE-{timestamp36}-{random}
   */
  static generateQuoteNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `QTE-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Legacy support - converts old coverage structure to total amount
   * Used for backward compatibility with V1 policies
   */
  static getTotalCoverage(coverage: any): number {
    if (!coverage || typeof coverage !== 'object') return 0;
    return Object.values(coverage).reduce(
      (total: number, amount) => total + (Number(amount) || 0),
      0
    );
  }

  /**
   * Get the configured coverage limits for V2
   */
  static getCoverageLimits() {
    return {
      min: MIN_COVERAGE,
      max: MAX_COVERAGE,
      tiers: [30000, 50000, 75000, 100000, 150000, 200000], // PRD V2 recommended tiers
    };
  }

  /**
   * Calculate premium for a specific tier
   * Convenience method for tier-based UI
   */
  static calculateTierPremium(tier: number): PremiumCalculationResult {
    const limits = this.getCoverageLimits();
    if (!limits.tiers.includes(tier)) {
      throw new Error(`Invalid tier. Must be one of: ${limits.tiers.join(', ')}`);
    }
    return this.calculateSimplePremium(tier);
  }
}
