import { describe, it, expect } from 'vitest'
import { PremiumCalculator } from './premium-calculator'

describe('PremiumCalculator', () => {
  describe('generateQuoteNumber', () => {
    it('should generate a quote number', () => {
      const quoteNumber = PremiumCalculator.generateQuoteNumber()
      expect(quoteNumber).toMatch(/^QTE-[A-Z0-9]+-[A-Z0-9]+$/)
    })

    it('should generate unique quote numbers', () => {
      const quote1 = PremiumCalculator.generateQuoteNumber()
      const quote2 = PremiumCalculator.generateQuoteNumber()
      expect(quote1).not.toBe(quote2)
    })
  })

  describe('calculatePremium', () => {
    it('should calculate premium with valid coverage and risk factors', () => {
      const coverage = {
        dwelling: 500000,
        personalProperty: 100000,
        liability: 300000,
        medicalPayments: 50000,
      }

      const riskFactors = {
        location: {
          province: 'GP',
          postalCode: '2000',
          crimeRate: 'medium' as const,
        },
        demographics: {
          age: 35,
        },
        property: {
          yearBuilt: 2015,
          squareFeet: 2000,
          constructionType: 'brick' as const,
          roofType: 'tile' as const,
          heatingType: 'gas' as const,
          safetyFeatures: ['MONITORED_ALARM', 'SMOKE_DETECTORS'],
          hasPool: false,
          hasGarage: true,
          foundationType: 'concrete' as const,
          propertyType: 'single_family' as const,
        },
      }

      const result = PremiumCalculator.calculatePremium('HOME' as any, coverage, riskFactors, 5000)

      expect(result).toBeDefined()
      expect(result.basePremium).toBeGreaterThan(0)
      expect(result.adjustedPremium).toBeGreaterThan(0)
      expect(result.monthlyPremium).toBeGreaterThan(0)
      expect(result.annualPremium).toBeGreaterThan(0)
      expect(result.riskMultiplier).toBeGreaterThan(0)
      expect(result.monthlyPremium * 12).toBeCloseTo(result.annualPremium, 0)
    })

    it('should throw error for invalid coverage', () => {
      expect(() => {
        PremiumCalculator.calculatePremium('HOME' as any, {}, {}, 1000)
      }).toThrow('Invalid total coverage')
    })

    it('should apply age factor correctly', () => {
      const coverage = { dwelling: 300000 }
      const youngDriver = { demographics: { age: 25 } }
      const middleAged = { demographics: { age: 40 } }
      
      const resultYoung = PremiumCalculator.calculatePremium('HOME' as any, coverage, youngDriver)
      const resultMiddle = PremiumCalculator.calculatePremium('HOME' as any, coverage, middleAged)
      
      // Middle-aged should have lower premium due to better age factor
      expect(resultMiddle.breakdown.ageFactor).toBeLessThan(resultYoung.breakdown.ageFactor)
    })

    it('should apply location factor correctly', () => {
      const coverage = { dwelling: 300000 }
      const highRisk = { location: { province: 'GP', postalCode: '2000', crimeRate: 'high' as const } }
      const lowRisk = { location: { province: 'NC', postalCode: '8000', crimeRate: 'low' as const } }
      
      const resultHigh = PremiumCalculator.calculatePremium('HOME' as any, coverage, highRisk)
      const resultLow = PremiumCalculator.calculatePremium('HOME' as any, coverage, lowRisk)
      
      // High-risk location should have higher location factor
      expect(resultHigh.breakdown.locationFactor).toBeGreaterThan(resultLow.breakdown.locationFactor)
    })
  })

  describe('calculatePremiumPerAmount', () => {
    it('should calculate premium for amount-based coverage', () => {
      const riskFactors = {
        location: { province: 'WC', postalCode: '7700' },
        demographics: { age: 35 },
        property: {
          yearBuilt: 2018,
          squareFeet: 1800,
          constructionType: 'brick' as const,
          safetyFeatures: ['SECURITY_CAMERAS', 'ELECTRIC_FENCING'],
        },
      }

      const result = PremiumCalculator.calculatePremiumPerAmount('HOME' as any, 500000, riskFactors, 2000)

      expect(result).toBeDefined()
      expect(result.basePremium).toBeGreaterThan(0)
      expect(result.adjustedPremium).toBeGreaterThan(0)
      expect(result.monthlyPremium).toBeGreaterThan(0)
      expect(result.annualPremium).toBe(result.adjustedPremium)
    })

    it('should apply volume discount for high coverage amounts', () => {
      const riskFactors = { demographics: { age: 40 } }
      
      // Use same deductible ratio to isolate volume discount effect
      const result100k = PremiumCalculator.calculatePremiumPerAmount('HOME' as any, 100000, riskFactors, 1000)
      const result1m = PremiumCalculator.calculatePremiumPerAmount('HOME' as any, 1000000, riskFactors, 10000)
      
      // Rate for 1M coverage should be lower (volume discount)
      const rate100k = result100k.basePremium / 100000
      const rate1m = result1m.basePremium / 1000000
      
      expect(rate1m).toBeLessThan(rate100k)
    })

    it('should throw error for zero or negative coverage', () => {
      expect(() => {
        PremiumCalculator.calculatePremiumPerAmount('HOME' as any, 0, {})
      }).toThrow('Invalid coverage amount')

      expect(() => {
        PremiumCalculator.calculatePremiumPerAmount('HOME' as any, -1000, {})
      }).toThrow('Invalid coverage amount')
    })
  })

  describe('calculateSimplePremium', () => {
    it('should calculate simple flat-rate premium', () => {
      const result = PremiumCalculator.calculateSimplePremium(300000)

      expect(result).toBeDefined()
      expect(result.basePremium).toBe(3600) // 300000 * 0.012
      expect(result.adjustedPremium).toBe(3600)
      expect(result.monthlyPremium).toBe(300) // 3600 / 12
      expect(result.annualPremium).toBe(3600)
      expect(result.riskMultiplier).toBe(1.0)
      expect(result.breakdown.riskAdjustment).toBe(0)
    })

    it('should be consistent regardless of coverage amount (same rate)', () => {
      const result100k = PremiumCalculator.calculateSimplePremium(100000)
      const result500k = PremiumCalculator.calculateSimplePremium(500000)
      
      // Rate should be exactly 1.2% for both
      expect(result100k.annualPremium / 100000).toBe(0.012)
      expect(result500k.annualPremium / 500000).toBe(0.012)
    })

    it('should throw error for invalid coverage amount', () => {
      expect(() => {
        PremiumCalculator.calculateSimplePremium(0)
      }).toThrow('Invalid coverage amount')

      expect(() => {
        PremiumCalculator.calculateSimplePremium(-5000)
      }).toThrow('Invalid coverage amount')
    })
  })

  describe('calculateDynamicRate', () => {
    it('should calculate rate within bounds', () => {
      const riskFactors = {
        location: { province: 'GP', postalCode: '2000' },
        demographics: { age: 35 },
        property: { yearBuilt: 2015, safetyFeatures: ['MONITORED_ALARM'] },
      }

      const rate = PremiumCalculator.calculateDynamicRate(300000, riskFactors)

      // Rate should be between MIN_RATE (0.007) and MAX_RATE (0.015)
      expect(rate).toBeGreaterThanOrEqual(0.007)
      expect(rate).toBeLessThanOrEqual(0.015)
    })

    it('should apply volume discount for large amounts', () => {
      const riskFactors = { demographics: { age: 40 } }
      
      const rate100k = PremiumCalculator.calculateDynamicRate(100000, riskFactors)
      const rate1m = PremiumCalculator.calculateDynamicRate(1000000, riskFactors)
      
      // Higher coverage should have lower rate
      expect(rate1m).toBeLessThan(rate100k)
    })
  })
})