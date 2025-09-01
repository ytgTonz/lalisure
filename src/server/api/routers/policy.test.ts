import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '../root';
import { db } from '@/lib/db';
import { PremiumCalculatorService } from '@/lib/services/premium-calculator';

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    policy: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock premium calculator
vi.mock('@/lib/services/premium-calculator');
const mockPremiumCalculator = vi.mocked(PremiumCalculatorService);

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  analytics: {
    policyEvents: {
      created: vi.fn(),
      updated: vi.fn(),
      statusChanged: vi.fn(),
    },
  },
}));

const mockDb = vi.mocked(db);

describe('Policy Router Integration Tests', () => {
  const createCaller = createCallerFactory(appRouter);
  
  // Mock context for regular user
  const mockUserCtx = {
    user: {
      id: 'user_123',
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
    },
    db: mockDb,
  };

  // Mock context for agent
  const mockAgentCtx = {
    user: {
      id: 'agent_123',
      email: 'agent@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'AGENT',
    },
    db: mockDb,
  };

  const userCaller = createCaller(mockUserCtx);
  const agentCaller = createCaller(mockAgentCtx);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createPolicy', () => {
    const validPolicyData = {
      propertyInfo: {
        address: '123 Maple Street',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
        propertyType: 'Single Family',
        buildYear: 2015,
        squareFeet: 2400,
        bedrooms: 3,
        bathrooms: 2.5,
        constructionType: 'Brick',
        roofType: 'Tile',
        foundationType: 'Concrete',
        heatingType: 'Gas',
        coolingType: 'Central Air',
        safetyFeatures: ['Smoke Detectors', 'Security System'],
        hasPool: false,
        hasGarage: true,
        garageSpaces: 2,
      },
      coverage: 450000,
      deductible: 2500,
    };

    it('should create policy successfully', async () => {
      // Mock premium calculation
      mockPremiumCalculator.calculateHomePremium.mockReturnValue({
        basePremium: 1500,
        riskFactors: {
          locationRisk: 1.1,
          propertyRisk: 0.95,
          coverageRisk: 1.05,
        },
        adjustments: {
          safetyDiscount: -50,
          bundleDiscount: 0,
          loyaltyDiscount: 0,
        },
        finalPremium: 1650,
        breakdown: {
          basePremium: 1500,
          locationAdjustment: 150,
          propertyAdjustment: -75,
          coverageAdjustment: 75,
          safetyDiscount: -50,
          totalPremium: 1650,
        },
      });

      // Mock policy creation
      const mockCreatedPolicy = {
        id: 'policy_123',
        policyNumber: 'POL-HOME-001',
        userId: 'user_123',
        type: 'HOME',
        status: 'DRAFT',
        premium: 1650,
        coverage: 450000,
        deductible: 2500,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        propertyInfo: validPolicyData.propertyInfo,
        personalInfo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.policy.create.mockResolvedValue(mockCreatedPolicy);

      const result = await userCaller.policy.createPolicy(validPolicyData);

      expect(result).toEqual(mockCreatedPolicy);

      expect(mockPremiumCalculator.calculateHomePremium).toHaveBeenCalledWith({
        coverage: 450000,
        deductible: 2500,
        propertyInfo: validPolicyData.propertyInfo,
      });

      expect(mockDb.policy.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_123',
          type: 'HOME',
          status: 'DRAFT',
          premium: 1650,
          coverage: 450000,
          deductible: 2500,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          propertyInfo: validPolicyData.propertyInfo,
          personalInfo: null,
        },
      });
    });

    it('should generate unique policy number', async () => {
      // Mock premium calculation
      mockPremiumCalculator.calculateHomePremium.mockReturnValue({
        finalPremium: 1500,
      });

      // Mock policy creation
      mockDb.policy.create.mockResolvedValue({
        id: 'policy_456',
        policyNumber: expect.stringMatching(/^POL-HOME-\d{3}$/),
        userId: 'user_123',
        type: 'HOME',
        premium: 1500,
      });

      await userCaller.policy.createPolicy(validPolicyData);

      expect(mockDb.policy.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            policyNumber: expect.stringMatching(/^POL-HOME-\d{3}$/),
          }),
        })
      );
    });

    it('should handle invalid property data', async () => {
      const invalidData = {
        ...validPolicyData,
        coverage: -1000, // Invalid negative coverage
      };

      await expect(
        userCaller.policy.createPolicy(invalidData)
      ).rejects.toThrow();
    });
  });

  describe('getUserPolicies', () => {
    it('should get user policies with filters', async () => {
      const mockPolicies = [
        {
          id: 'policy_1',
          policyNumber: 'POL-HOME-001',
          type: 'HOME',
          status: 'ACTIVE',
          premium: 1500,
          coverage: 400000,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'policy_2',
          policyNumber: 'POL-HOME-002',
          type: 'HOME',
          status: 'DRAFT',
          premium: 1800,
          coverage: 500000,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2025-01-31'),
          createdAt: new Date('2024-01-15'),
        },
      ];

      mockDb.policy.findMany.mockResolvedValue(mockPolicies);
      mockDb.policy.count.mockResolvedValue(2);

      const result = await userCaller.policy.getUserPolicies({
        limit: 10,
        offset: 0,
        status: 'ACTIVE',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.policies).toEqual(mockPolicies);
      expect(result.total).toBe(2);

      expect(mockDb.policy.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should get policies without filters', async () => {
      const mockPolicies = [
        {
          id: 'policy_1',
          policyNumber: 'POL-HOME-001',
          type: 'HOME',
          status: 'ACTIVE',
          premium: 1500,
        },
      ];

      mockDb.policy.findMany.mockResolvedValue(mockPolicies);
      mockDb.policy.count.mockResolvedValue(1);

      const result = await userCaller.policy.getUserPolicies({
        limit: 10,
        offset: 0,
      });

      expect(result.policies).toEqual(mockPolicies);

      expect(mockDb.policy.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('getPolicyById', () => {
    it('should get policy by ID for owner', async () => {
      const mockPolicy = {
        id: 'policy_123',
        policyNumber: 'POL-HOME-001',
        userId: 'user_123',
        type: 'HOME',
        status: 'ACTIVE',
        premium: 1500,
        coverage: 400000,
        deductible: 2000,
        propertyInfo: {
          address: '123 Maple Street',
          city: 'Cape Town',
          propertyType: 'Single Family',
        },
      };

      mockDb.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await userCaller.policy.getPolicyById({
        policyId: 'policy_123',
      });

      expect(result).toEqual(mockPolicy);

      expect(mockDb.policy.findUnique).toHaveBeenCalledWith({
        where: { id: 'policy_123' },
      });
    });

    it('should deny access to policy of different user', async () => {
      const mockPolicy = {
        id: 'policy_123',
        userId: 'different_user',
        type: 'HOME',
      };

      mockDb.policy.findUnique.mockResolvedValue(mockPolicy);

      await expect(
        userCaller.policy.getPolicyById({
          policyId: 'policy_123',
        })
      ).rejects.toThrow('Policy not found or unauthorized');
    });

    it('should allow agent to view any policy', async () => {
      const mockPolicy = {
        id: 'policy_123',
        userId: 'different_user',
        type: 'HOME',
        status: 'ACTIVE',
      };

      mockDb.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await agentCaller.policy.getPolicyById({
        policyId: 'policy_123',
      });

      expect(result).toEqual(mockPolicy);
    });
  });

  describe('updatePolicy', () => {
    it('should update policy successfully', async () => {
      const existingPolicy = {
        id: 'policy_123',
        userId: 'user_123',
        type: 'HOME',
        status: 'DRAFT',
        premium: 1500,
        coverage: 400000,
        deductible: 2000,
        propertyInfo: {
          address: '123 Old Street',
          city: 'Cape Town',
        },
      };

      const updateData = {
        propertyInfo: {
          address: '456 New Avenue',
          city: 'Cape Town',
          province: 'Western Cape',
          postalCode: '8001',
          propertyType: 'Single Family',
          buildYear: 2020,
          squareFeet: 2800,
          bedrooms: 4,
          bathrooms: 3,
          constructionType: 'Brick',
          roofType: 'Shingle',
          foundationType: 'Concrete',
          heatingType: 'Electric',
          coolingType: 'Central Air',
          safetyFeatures: ['Smoke Detectors', 'Security System', 'Sprinkler System'],
          hasPool: true,
          hasGarage: true,
          garageSpaces: 2,
        },
        coverage: 500000,
        deductible: 2500,
      };

      mockDb.policy.findUnique.mockResolvedValue(existingPolicy);

      // Mock premium recalculation
      mockPremiumCalculator.calculateHomePremium.mockReturnValue({
        finalPremium: 1850,
        breakdown: {
          basePremium: 1700,
          locationAdjustment: 100,
          propertyAdjustment: 150,
          coverageAdjustment: -100,
          totalPremium: 1850,
        },
      });

      const updatedPolicy = {
        ...existingPolicy,
        ...updateData,
        premium: 1850,
        updatedAt: new Date(),
      };

      mockDb.policy.update.mockResolvedValue(updatedPolicy);

      const result = await userCaller.policy.updatePolicy({
        policyId: 'policy_123',
        ...updateData,
      });

      expect(result).toEqual(updatedPolicy);

      expect(mockPremiumCalculator.calculateHomePremium).toHaveBeenCalledWith({
        coverage: 500000,
        deductible: 2500,
        propertyInfo: updateData.propertyInfo,
      });

      expect(mockDb.policy.update).toHaveBeenCalledWith({
        where: { id: 'policy_123' },
        data: {
          ...updateData,
          premium: 1850,
        },
      });
    });

    it('should not allow updating active policy by customer', async () => {
      const activePolicy = {
        id: 'policy_123',
        userId: 'user_123',
        status: 'ACTIVE',
      };

      mockDb.policy.findUnique.mockResolvedValue(activePolicy);

      await expect(
        userCaller.policy.updatePolicy({
          policyId: 'policy_123',
          coverage: 500000,
        })
      ).rejects.toThrow('Cannot update active policy');
    });

    it('should allow agent to update any policy', async () => {
      const activePolicy = {
        id: 'policy_123',
        userId: 'different_user',
        status: 'ACTIVE',
        type: 'HOME',
        premium: 1500,
        coverage: 400000,
        deductible: 2000,
        propertyInfo: {
          address: '123 Street',
          city: 'Cape Town',
        },
      };

      mockDb.policy.findUnique.mockResolvedValue(activePolicy);

      // Mock premium calculation
      mockPremiumCalculator.calculateHomePremium.mockReturnValue({
        finalPremium: 1600,
      });

      const updatedPolicy = {
        ...activePolicy,
        coverage: 450000,
        premium: 1600,
      };

      mockDb.policy.update.mockResolvedValue(updatedPolicy);

      const result = await agentCaller.policy.updatePolicy({
        policyId: 'policy_123',
        coverage: 450000,
      });

      expect(result).toEqual(updatedPolicy);
    });
  });

  describe('deletePolicy', () => {
    it('should delete draft policy successfully', async () => {
      const draftPolicy = {
        id: 'policy_123',
        userId: 'user_123',
        status: 'DRAFT',
        type: 'HOME',
      };

      mockDb.policy.findUnique.mockResolvedValue(draftPolicy);
      mockDb.policy.delete.mockResolvedValue(draftPolicy);

      const result = await userCaller.policy.deletePolicy({
        policyId: 'policy_123',
      });

      expect(result).toEqual({ success: true });

      expect(mockDb.policy.delete).toHaveBeenCalledWith({
        where: { id: 'policy_123' },
      });
    });

    it('should not allow deleting active policy', async () => {
      const activePolicy = {
        id: 'policy_123',
        userId: 'user_123',
        status: 'ACTIVE',
      };

      mockDb.policy.findUnique.mockResolvedValue(activePolicy);

      await expect(
        userCaller.policy.deletePolicy({
          policyId: 'policy_123',
        })
      ).rejects.toThrow('Cannot delete non-draft policy');
    });

    it('should allow admin to delete any policy', async () => {
      const adminCtx = {
        user: {
          id: 'admin_123',
          role: 'ADMIN',
        },
        db: mockDb,
      };

      const adminCaller = createCaller(adminCtx);

      const activePolicy = {
        id: 'policy_123',
        userId: 'different_user',
        status: 'ACTIVE',
      };

      mockDb.policy.findUnique.mockResolvedValue(activePolicy);
      mockDb.policy.delete.mockResolvedValue(activePolicy);

      const result = await adminCaller.policy.deletePolicy({
        policyId: 'policy_123',
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe('updatePolicyStatus', () => {
    it('should update policy status successfully by agent', async () => {
      const policy = {
        id: 'policy_123',
        userId: 'user_123',
        status: 'PENDING_REVIEW',
        type: 'HOME',
      };

      mockDb.policy.findUnique.mockResolvedValue(policy);

      const updatedPolicy = {
        ...policy,
        status: 'ACTIVE',
        updatedAt: new Date(),
      };

      mockDb.policy.update.mockResolvedValue(updatedPolicy);

      const result = await agentCaller.policy.updatePolicyStatus({
        policyId: 'policy_123',
        status: 'ACTIVE',
        reason: 'Policy approved after review',
      });

      expect(result).toEqual(updatedPolicy);

      expect(mockDb.policy.update).toHaveBeenCalledWith({
        where: { id: 'policy_123' },
        data: {
          status: 'ACTIVE',
        },
      });
    });

    it('should not allow customer to update policy status', async () => {
      await expect(
        userCaller.policy.updatePolicyStatus({
          policyId: 'policy_123',
          status: 'ACTIVE',
        })
      ).rejects.toThrow('Insufficient permissions');
    });
  });

  describe('calculateQuote', () => {
    it('should calculate quote without saving policy', async () => {
      const quoteData = {
        propertyInfo: {
          address: '789 Quote Street',
          city: 'Durban',
          province: 'KwaZulu-Natal',
          postalCode: '4001',
          propertyType: 'Townhouse',
          buildYear: 2018,
          squareFeet: 1800,
          bedrooms: 2,
          bathrooms: 2,
          constructionType: 'Brick',
          roofType: 'Tile',
          foundationType: 'Concrete',
          heatingType: 'Gas',
          coolingType: 'None',
          safetyFeatures: ['Smoke Detectors'],
          hasPool: false,
          hasGarage: false,
          garageSpaces: 0,
        },
        coverage: 300000,
        deductible: 1500,
      };

      const expectedQuote = {
        basePremium: 1200,
        riskFactors: {
          locationRisk: 0.9,
          propertyRisk: 1.0,
          coverageRisk: 0.95,
        },
        adjustments: {
          safetyDiscount: -25,
          bundleDiscount: 0,
          loyaltyDiscount: 0,
        },
        finalPremium: 1275,
        breakdown: {
          basePremium: 1200,
          locationAdjustment: -120,
          propertyAdjustment: 0,
          coverageAdjustment: -75,
          safetyDiscount: -25,
          totalPremium: 1275,
        },
      };

      mockPremiumCalculator.calculateHomePremium.mockReturnValue(expectedQuote);

      const result = await userCaller.policy.calculateQuote(quoteData);

      expect(result).toEqual(expectedQuote);

      expect(mockPremiumCalculator.calculateHomePremium).toHaveBeenCalledWith(quoteData);

      // Should not create a policy
      expect(mockDb.policy.create).not.toHaveBeenCalled();
    });

    it('should handle invalid quote data', async () => {
      const invalidQuoteData = {
        propertyInfo: {
          address: '',
          city: '',
          // Missing required fields
        },
        coverage: 0,
        deductible: -100,
      };

      await expect(
        userCaller.policy.calculateQuote(invalidQuoteData)
      ).rejects.toThrow();
    });
  });

  describe('getPolicyStats', () => {
    it('should get policy statistics for user', async () => {
      const mockStats = [
        { _count: { id: 3 }, status: 'ACTIVE' },
        { _count: { id: 1 }, status: 'DRAFT' },
        { _count: { id: 1 }, status: 'EXPIRED' },
      ];

      mockDb.policy.groupBy.mockResolvedValue(mockStats);

      const result = await userCaller.policy.getPolicyStats();

      expect(result).toEqual({
        total: 5,
        active: 3,
        draft: 1,
        expired: 1,
        pendingReview: 0,
        cancelled: 0,
        suspended: 0,
      });

      expect(mockDb.policy.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        where: {
          userId: 'user_123',
        },
        _count: {
          id: true,
        },
      });
    });

    it('should handle empty policy stats', async () => {
      mockDb.policy.groupBy.mockResolvedValue([]);

      const result = await userCaller.policy.getPolicyStats();

      expect(result).toEqual({
        total: 0,
        active: 0,
        draft: 0,
        expired: 0,
        pendingReview: 0,
        cancelled: 0,
        suspended: 0,
      });
    });
  });
});