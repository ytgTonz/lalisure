import { PolicyType } from '@prisma/client';

// Base rates per R1000 of coverage for home insurance
const BASE_RATE = 0.008; // 0.8% base rate for home insurance

// Risk factors and multipliers
interface RiskFactors {
  location: {
    province: string;
    postalCode: string;
    crimeRate?: 'low' | 'medium' | 'high';
    naturalDisasterRisk?: 'low' | 'medium' | 'high';
  };
  demographics: {
    age: number;
    gender?: 'male' | 'female' | 'other';
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  };
  property: {
    yearBuilt: number;
    squareFeet: number;
    constructionType: 'frame' | 'brick' | 'stone' | 'concrete' | 'other';
    roofType: 'shingle' | 'tile' | 'metal' | 'slate' | 'other';
    heatingType: 'gas' | 'electric' | 'oil' | 'solar' | 'other';
    safetyFeatures: string[];
    hasPool: boolean;
    hasGarage: boolean;
    foundationType: 'concrete' | 'basement' | 'crawl_space' | 'slab' | 'other';
    propertyType: 'single_family' | 'condo' | 'townhouse' | 'duplex' | 'other';
  };
  personal?: {
    creditScore?: number;
    occupation?: string;
    claimsHistory?: number; // Number of previous claims
  };
}

interface HomeCoverageOptions {
  dwelling: number;
  personalProperty: number;
  liability: number;
  medicalPayments: number;
  otherStructures?: number;
  lossOfUse?: number;
}

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
  static calculatePremium(
    policyType: PolicyType,
    coverage: any,
    riskFactors: any,
    deductible: number = 1000
  ): PremiumCalculationResult {
    const totalCoverage = this.getTotalCoverage(coverage);
    const basePremium = totalCoverage * BASE_RATE;

    // Calculate risk multiplier for home insurance
    const locationFactor = this.calculateLocationFactor(riskFactors?.location);
    const ageFactor = this.calculateAgeFactor(riskFactors?.demographics?.age || 25);
    const propertyFactor = this.calculatePropertyFactor(riskFactors?.property);
    const personalFactor = this.calculatePersonalFactor(riskFactors?.personal);
    const deductibleFactor = this.calculateDeductibleFactor(deductible, totalCoverage);

    const riskMultiplier = locationFactor * ageFactor * propertyFactor * personalFactor * deductibleFactor;
    
    const adjustedPremium = basePremium * riskMultiplier;
    const discounts = this.calculateDiscounts(policyType, riskFactors, adjustedPremium);
    const finalPremium = Math.max(adjustedPremium - discounts, basePremium * 0.5); // Minimum 50% of base premium

    return {
      basePremium,
      adjustedPremium: finalPremium,
      riskMultiplier,
      breakdown: {
        baseCoverage: basePremium,
        riskAdjustment: basePremium * (riskMultiplier - 1),
        locationFactor,
        ageFactor,
        discounts: -discounts,
      },
      monthlyPremium: Math.round((finalPremium / 12) * 100) / 100,
      annualPremium: Math.round(finalPremium * 100) / 100,
    };
  }

  static getTotalCoverage(coverage: any): number {
    if (!coverage || typeof coverage !== 'object') return 0;
    return Object.values(coverage).reduce((total: number, amount) => total + (Number(amount) || 0), 0);
  }

  private static calculateLocationFactor(location?: any): number {
    let factor = 1.0;

    if (!location?.province) return factor;

    // Province-based factors for South Africa (simplified)
    const highRiskProvinces = ['GP', 'WC', 'KZN']; // Gauteng, Western Cape, KwaZulu-Natal
    const lowRiskProvinces = ['NC', 'NW', 'FS']; // Northern Cape, North West, Free State
    
    if (highRiskProvinces.includes(location.province)) {
      factor *= 1.15;
    } else if (lowRiskProvinces.includes(location.province)) {
      factor *= 0.9;
    }

    // Crime rate adjustment
    switch (location.crimeRate) {
      case 'high':
        factor *= 1.2;
        break;
      case 'medium':
        factor *= 1.05;
        break;
      case 'low':
        factor *= 0.95;
        break;
    }

    // Natural disaster risk adjustment
    switch (location.naturalDisasterRisk) {
      case 'high':
        factor *= 1.25;
        break;
      case 'medium':
        factor *= 1.1;
        break;
      case 'low':
        factor *= 0.95;
        break;
    }

    return Math.max(0.8, Math.min(1.5, factor));
  }

  private static calculateAgeFactor(age: number): number {
    // Home insurance age factors - younger homeowners tend to have slightly higher risk
    if (age < 30) return 1.05; // Slightly higher risk for very young homeowners
    if (age < 50) return 0.95; // Lower risk for middle-aged homeowners
    return 1.0; // Standard rate for older homeowners
  }

  private static calculatePropertyFactor(property?: any): number {
    let factor = 1.0;

    if (!property) return factor;

    // Age of property
    if (property.yearBuilt || property.buildYear) {
      const yearBuilt = property.yearBuilt || property.buildYear;
      const propertyAge = new Date().getFullYear() - yearBuilt;
      if (propertyAge < 5) factor *= 0.9;
      else if (propertyAge < 15) factor *= 0.95;
      else if (propertyAge < 30) factor *= 1.0;
      else if (propertyAge < 50) factor *= 1.1;
      else factor *= 1.2;
    }

    // Construction type
    switch (property.constructionType) {
      case 'steel':
        factor *= 0.85;
        break;
      case 'masonry':
        factor *= 0.9;
        break;
      case 'frame':
        factor *= 1.0;
        break;
    }

    // Safety features
    const safetyFeatures = property.safetyFeatures || [];
    const discountPerFeature = 0.02;
    const maxDiscount = 0.15;
    const safetyDiscount = Math.min(safetyFeatures.length * discountPerFeature, maxDiscount);
    factor *= (1 - safetyDiscount);

    return Math.max(0.7, Math.min(1.3, factor));
  }


  private static calculatePersonalFactor(personal?: RiskFactors['personal']): number {
    if (!personal) return 1.0;

    let factor = 1.0;

    // Credit score impact
    if (personal.creditScore) {
      if (personal.creditScore >= 800) factor *= 0.85;
      else if (personal.creditScore >= 740) factor *= 0.9;
      else if (personal.creditScore >= 670) factor *= 1.0;
      else if (personal.creditScore >= 580) factor *= 1.15;
      else factor *= 1.3;
    }

    // Claims history impact on home insurance
    if (personal.claimsHistory) {
      if (personal.claimsHistory === 0) factor *= 0.9; // No claims discount
      else if (personal.claimsHistory <= 2) factor *= 1.1; // Few claims
      else factor *= 1.3; // Multiple claims
    }

    return Math.max(0.7, Math.min(1.5, factor));
  }

  private static calculateDeductibleFactor(deductible: number, coverage: number): number {
    const deductibleRatio = deductible / coverage;
    
    if (deductibleRatio >= 0.05) return 0.8; // 5% or higher deductible
    else if (deductibleRatio >= 0.02) return 0.9; // 2-5% deductible
    else if (deductibleRatio >= 0.01) return 0.95; // 1-2% deductible
    else return 1.0; // Less than 1% deductible
  }

  private static calculateDiscounts(
    policyType: PolicyType,
    riskFactors: any,
    premium: number
  ): number {
    let totalDiscount = 0;

    // Multi-policy discount (simulated)
    // In real implementation, this would check for existing policies
    // totalDiscount += premium * 0.05; // 5% multi-policy discount

    // Good driver discount (for auto)
    if (policyType === PolicyType.AUTO) {
      // Assume good driver if age > 25 and no specified risk factors
      if (riskFactors?.demographics?.age > 25) {
        totalDiscount += premium * 0.1; // 10% good driver discount
      }
    }

    // Loyalty discount (simulated - would check customer tenure)
    // totalDiscount += premium * 0.03; // 3% loyalty discount

    return totalDiscount;
  }

  static generateQuoteNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `QTE-${timestamp}-${random}`.toUpperCase();
  }
}