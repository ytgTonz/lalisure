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
    try {
      const totalCoverage = this.getTotalCoverage(coverage);

      if (totalCoverage <= 0) {
        throw new Error(`Invalid total coverage: ${totalCoverage}`);
      }

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

      if (finalPremium <= 0) {
        throw new Error(`Calculated premium is invalid: ${finalPremium}`);
      }

      const result = {
        basePremium: Math.round(basePremium * 100) / 100,
        adjustedPremium: Math.round(finalPremium * 100) / 100,
        riskMultiplier: Math.round(riskMultiplier * 1000) / 1000,
        breakdown: {
          baseCoverage: Math.round(basePremium * 100) / 100,
          riskAdjustment: Math.round((basePremium * (riskMultiplier - 1)) * 100) / 100,
          locationFactor: Math.round(locationFactor * 1000) / 1000,
          ageFactor: Math.round(ageFactor * 1000) / 1000,
          discounts: Math.round(-discounts * 100) / 100,
        },
        monthlyPremium: Math.round((finalPremium / 12) * 100) / 100,
        annualPremium: Math.round(finalPremium * 100) / 100,
      };

      return result;
    } catch (error) {
      console.error('Error in PremiumCalculator.calculatePremium:', error);
      throw new Error(`Premium calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static getTotalCoverage(coverage: any): number {
    if (!coverage || typeof coverage !== 'object') return 0;
    return Object.values(coverage).reduce((total: number, amount) => total + (Number(amount) || 0), 0);
  }

  private static calculateLocationFactor(location?: any): number {
    let factor = 1.0;

    if (!location?.province) return factor;

    // Province-based factors for South Africa (updated with proper codes)
    const highRiskProvinces = ['GP', 'WC', 'KZN']; // Gauteng, Western Cape, KwaZulu-Natal
    const lowRiskProvinces = ['NC', 'NW', 'FS']; // Northern Cape, North West, Free State
    const mediumRiskProvinces = ['EC', 'MP', 'LP']; // Eastern Cape, Mpumalanga, Limpopo
    
    if (highRiskProvinces.includes(location.province)) {
      factor *= 1.15;
    } else if (lowRiskProvinces.includes(location.province)) {
      factor *= 0.9;
    } else if (mediumRiskProvinces.includes(location.province)) {
      factor *= 1.05;
    }

    // Rural area adjustment
    if (location.ruralArea) {
      factor *= 1.1; // Higher risk for rural areas due to emergency response times
    }

    // Distance from emergency services
    if (location.distanceFromFireStation) {
      if (location.distanceFromFireStation > 30) factor *= 1.2;
      else if (location.distanceFromFireStation > 15) factor *= 1.1;
      else if (location.distanceFromFireStation < 5) factor *= 0.95;
    }

    if (location.distanceFromPoliceStation) {
      if (location.distanceFromPoliceStation > 25) factor *= 1.15;
      else if (location.distanceFromPoliceStation > 10) factor *= 1.05;
      else if (location.distanceFromPoliceStation < 3) factor *= 0.95;
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

    // Construction type - updated for rural properties
    switch (property.constructionType) {
      case 'STEEL_FRAME':
        factor *= 0.85;
        break;
      case 'BRICK':
      case 'STONE':
        factor *= 0.9;
        break;
      case 'CONCRETE':
        factor *= 0.95;
        break;
      case 'WOOD_FRAME':
        factor *= 1.0;
        break;
      case 'MIXED_CONSTRUCTION':
        factor *= 1.05;
        break;
      case 'TRADITIONAL_MUD':
        factor *= 1.15;
        break;
      case 'THATCH_ROOF':
        factor *= 1.2;
        break;
    }

    // Roof type - updated for rural properties
    switch (property.roofType) {
      case 'TILE':
      case 'SLATE':
        factor *= 0.95;
        break;
      case 'METAL':
      case 'CONCRETE':
        factor *= 1.0;
        break;
      case 'SHINGLE':
        factor *= 1.05;
        break;
      case 'THATCH':
        factor *= 1.2;
        break;
      case 'CORRUGATED_IRON':
        factor *= 1.1;
        break;
    }

    // Rural property factors
    if (property.hasFarmBuildings) factor *= 1.1;
    if (property.hasLivestock) factor *= 1.05;
    if (property.hasCrops) factor *= 1.05;
    
    // Access road factor
    switch (property.accessRoad) {
      case 'TARRED':
        factor *= 0.95;
        break;
      case 'GRAVEL':
        factor *= 1.0;
        break;
      case 'DIRT':
        factor *= 1.1;
        break;
      case 'PRIVATE':
        factor *= 1.15;
        break;
    }

    // Property size factor (for rural properties)
    if (property.propertySize && property.propertySize > 1) {
      if (property.propertySize > 10) factor *= 1.2;
      else if (property.propertySize > 5) factor *= 1.1;
      else factor *= 1.05;
    }

    // Safety features - updated for rural security
    const safetyFeatures = property.safetyFeatures || [];
    let safetyDiscount = 0;
    
    safetyFeatures.forEach((feature: string) => {
      switch (feature) {
        case 'MONITORED_ALARM':
          safetyDiscount += 0.05;
          break;
        case 'SECURITY_CAMERAS':
          safetyDiscount += 0.03;
          break;
        case 'ELECTRIC_FENCING':
          safetyDiscount += 0.04;
          break;
        case 'SECURITY_GATES':
          safetyDiscount += 0.02;
          break;
        case 'SAFE_ROOM':
          safetyDiscount += 0.03;
          break;
        case 'SPRINKLER_SYSTEM':
          safetyDiscount += 0.04;
          break;
        case 'SMOKE_DETECTORS':
          safetyDiscount += 0.01;
          break;
        case 'FIRE_EXTINGUISHERS':
          safetyDiscount += 0.01;
          break;
      }
    });
    
    const maxDiscount = 0.15;
    safetyDiscount = Math.min(safetyDiscount, maxDiscount);
    factor *= (1 - safetyDiscount);

    return Math.max(0.7, Math.min(1.5, factor));
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

    // Employment status impact
    if (personal.employmentStatus) {
      switch (personal.employmentStatus) {
        case 'employed':
          factor *= 0.95;
          break;
        case 'self_employed':
          factor *= 1.05;
          break;
        case 'retired':
          factor *= 0.9;
          break;
        case 'unemployed':
          factor *= 1.2;
          break;
        case 'student':
          factor *= 1.1;
          break;
      }
    }

    // Monthly income impact
    if (personal.monthlyIncome) {
      if (personal.monthlyIncome >= 50000) factor *= 0.9;
      else if (personal.monthlyIncome >= 25000) factor *= 0.95;
      else if (personal.monthlyIncome >= 15000) factor *= 1.0;
      else if (personal.monthlyIncome >= 10000) factor *= 1.05;
      else factor *= 1.15;
    }

    // Claims history impact on home insurance
    if (personal.claimsHistory !== undefined) {
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

    // Safety features discount (for home insurance)
    if (policyType === PolicyType.HOME && riskFactors?.property?.safetyFeatures) {
      const safetyFeatures = riskFactors.property.safetyFeatures;
      const discountPerFeature = 0.02; // 2% per safety feature
      const maxDiscount = 0.1; // Maximum 10% discount
      const safetyDiscount = Math.min(safetyFeatures.length * discountPerFeature, maxDiscount);
      totalDiscount += premium * safetyDiscount;
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