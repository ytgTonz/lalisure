import { PolicyType } from '@prisma/client';

// Base rates per $1000 of coverage
const BASE_RATES = {
  [PolicyType.AUTO]: 0.012, // 1.2%
  [PolicyType.HOME]: 0.008, // 0.8%
  [PolicyType.LIFE]: 0.015, // 1.5%
  [PolicyType.HEALTH]: 0.045, // 4.5%
  [PolicyType.BUSINESS]: 0.025, // 2.5%
} as const;

// Risk factors and multipliers
interface RiskFactors {
  location: {
    state: string;
    zipCode: string;
    crimeRate?: 'low' | 'medium' | 'high';
    naturalDisasterRisk?: 'low' | 'medium' | 'high';
  };
  demographics: {
    age: number;
    gender?: 'male' | 'female' | 'other';
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  };
  property?: {
    yearBuilt: number;
    squareFeet: number;
    constructionType?: 'frame' | 'masonry' | 'steel';
    safetyFeatures?: string[];
  };
  vehicle?: {
    year: number;
    make: string;
    model: string;
    safetyRating?: number; // 1-5 stars
    annualMileage?: number;
  };
  personal?: {
    creditScore?: number;
    occupation?: string;
    smokingStatus?: 'smoker' | 'non-smoker' | 'former-smoker';
    healthConditions?: string[];
  };
}

interface CoverageOptions {
  dwelling?: number;
  personalProperty?: number;
  liability?: number;
  medicalPayments?: number;
  collision?: number;
  comprehensive?: number;
  deathBenefit?: number;
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
    coverage: CoverageOptions,
    riskFactors: RiskFactors,
    deductible: number = 1000
  ): PremiumCalculationResult {
    const baseRate = BASE_RATES[policyType];
    const totalCoverage = this.getTotalCoverage(coverage);
    const basePremium = totalCoverage * baseRate;

    // Calculate risk multiplier
    const locationFactor = this.calculateLocationFactor(riskFactors.location);
    const ageFactor = this.calculateAgeFactor(riskFactors.demographics.age, policyType);
    const propertyFactor = this.calculatePropertyFactor(riskFactors.property);
    const vehicleFactor = this.calculateVehicleFactor(riskFactors.vehicle);
    const personalFactor = this.calculatePersonalFactor(riskFactors.personal);
    const deductibleFactor = this.calculateDeductibleFactor(deductible, totalCoverage);

    const riskMultiplier = locationFactor * ageFactor * propertyFactor * vehicleFactor * personalFactor * deductibleFactor;
    
    const adjustedPremium = basePremium * riskMultiplier;
    const discounts = this.calculateDiscounts(riskFactors, policyType, adjustedPremium);
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

  private static getTotalCoverage(coverage: CoverageOptions): number {
    return Object.values(coverage).reduce((total, amount) => total + (amount || 0), 0);
  }

  private static calculateLocationFactor(location: RiskFactors['location']): number {
    let factor = 1.0;

    // State-based factors (simplified)
    const highRiskStates = ['CA', 'FL', 'TX', 'NY', 'LA'];
    const lowRiskStates = ['VT', 'ME', 'NH', 'WY', 'ND'];
    
    if (highRiskStates.includes(location.state)) {
      factor *= 1.15;
    } else if (lowRiskStates.includes(location.state)) {
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

  private static calculateAgeFactor(age: number, policyType: PolicyType): number {
    let factor = 1.0;

    switch (policyType) {
      case PolicyType.AUTO:
        if (age < 25) factor = 1.4;
        else if (age < 35) factor = 1.1;
        else if (age < 65) factor = 1.0;
        else factor = 1.15;
        break;
      
      case PolicyType.LIFE:
        if (age < 30) factor = 0.8;
        else if (age < 40) factor = 0.9;
        else if (age < 50) factor = 1.0;
        else if (age < 60) factor = 1.3;
        else factor = 1.8;
        break;
      
      case PolicyType.HOME:
        if (age < 30) factor = 1.05;
        else if (age < 50) factor = 0.95;
        else factor = 1.0;
        break;
      
      default:
        factor = 1.0;
    }

    return Math.max(0.7, Math.min(2.0, factor));
  }

  private static calculatePropertyFactor(property?: RiskFactors['property']): number {
    if (!property) return 1.0;

    let factor = 1.0;

    // Age of property
    const propertyAge = new Date().getFullYear() - property.yearBuilt;
    if (propertyAge < 5) factor *= 0.9;
    else if (propertyAge < 15) factor *= 0.95;
    else if (propertyAge < 30) factor *= 1.0;
    else if (propertyAge < 50) factor *= 1.1;
    else factor *= 1.2;

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

  private static calculateVehicleFactor(vehicle?: RiskFactors['vehicle']): number {
    if (!vehicle) return 1.0;

    let factor = 1.0;

    // Vehicle age
    const vehicleAge = new Date().getFullYear() - vehicle.year;
    if (vehicleAge < 2) factor *= 1.1;
    else if (vehicleAge < 5) factor *= 1.0;
    else if (vehicleAge < 10) factor *= 0.95;
    else factor *= 0.9;

    // Safety rating
    if (vehicle.safetyRating) {
      if (vehicle.safetyRating >= 5) factor *= 0.9;
      else if (vehicle.safetyRating >= 4) factor *= 0.95;
      else if (vehicle.safetyRating <= 2) factor *= 1.1;
    }

    // Annual mileage
    if (vehicle.annualMileage) {
      if (vehicle.annualMileage < 7500) factor *= 0.9;
      else if (vehicle.annualMileage > 15000) factor *= 1.15;
    }

    return Math.max(0.8, Math.min(1.3, factor));
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

    // Smoking status (for life/health insurance)
    switch (personal.smokingStatus) {
      case 'smoker':
        factor *= 1.5;
        break;
      case 'former-smoker':
        factor *= 1.2;
        break;
      case 'non-smoker':
        factor *= 0.95;
        break;
    }

    return Math.max(0.7, Math.min(1.8, factor));
  }

  private static calculateDeductibleFactor(deductible: number, coverage: number): number {
    const deductibleRatio = deductible / coverage;
    
    if (deductibleRatio >= 0.05) return 0.8; // 5% or higher deductible
    else if (deductibleRatio >= 0.02) return 0.9; // 2-5% deductible
    else if (deductibleRatio >= 0.01) return 0.95; // 1-2% deductible
    else return 1.0; // Less than 1% deductible
  }

  private static calculateDiscounts(
    riskFactors: RiskFactors,
    policyType: PolicyType,
    premium: number
  ): number {
    let totalDiscount = 0;

    // Multi-policy discount (simulated)
    // In real implementation, this would check for existing policies
    // totalDiscount += premium * 0.05; // 5% multi-policy discount

    // Good driver discount (for auto)
    if (policyType === PolicyType.AUTO) {
      // Assume good driver if age > 25 and no specified risk factors
      if (riskFactors.demographics.age > 25) {
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