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

  // TODO: Add calculatePremium tests once the method signature is fixed
  // The current calculatePremium method has issues with undefined policyType
})