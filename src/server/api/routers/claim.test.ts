import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '../root';
import { db } from '@/lib/db';

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    claim: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    policy: {
      findFirst: vi.fn(),
    },
    document: {
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock What3Words service
vi.mock('@/lib/services/what3words', () => ({
  What3WordsService: {
    convertToCoordinates: vi.fn(),
    convertFromCoordinates: vi.fn(),
    validateAddress: vi.fn(),
  },
}));

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  analytics: {
    claimEvents: {
      submitted: vi.fn(),
      statusChanged: vi.fn(),
      documented: vi.fn(),
    },
  },
}));

const mockDb = vi.mocked(db);

describe('Claim Router Integration Tests', () => {
  const createCaller = createCallerFactory(appRouter);
  
  // Mock context for customer
  const mockCustomerCtx = {
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

  const customerCaller = createCaller(mockCustomerCtx);
  const agentCaller = createCaller(mockAgentCtx);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('submitClaim', () => {
    const validClaimData = {
      policyId: 'policy_123',
      type: 'FIRE_DAMAGE' as const,
      description: 'Kitchen fire caused by electrical malfunction. Smoke damage throughout first floor.',
      incidentDate: new Date('2024-01-15T10:30:00Z'),
      location: '123 Maple Street, Cape Town, Western Cape 8001',
      what3words: 'filled.count.soap',
      amount: 15000,
    };

    it('should submit claim successfully', async () => {
      // Mock policy verification
      mockDb.policy.findFirst.mockResolvedValue({
        id: 'policy_123',
        policyNumber: 'POL-HOME-001',
        userId: 'user_123',
        type: 'HOME',
        status: 'ACTIVE',
        coverage: 450000,
        deductible: 2500,
      });

      // Mock claim creation
      const mockCreatedClaim = {
        id: 'claim_123',
        claimNumber: 'CLM-FIRE-001',
        userId: 'user_123',
        policyId: 'policy_123',
        type: 'FIRE_DAMAGE',
        status: 'SUBMITTED',
        amount: 15000,
        description: validClaimData.description,
        incidentDate: validClaimData.incidentDate,
        location: validClaimData.location,
        what3words: validClaimData.what3words,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.claim.create.mockResolvedValue(mockCreatedClaim);

      const result = await customerCaller.claim.submitClaim(validClaimData);

      expect(result).toEqual(mockCreatedClaim);

      expect(mockDb.policy.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'policy_123',
          userId: 'user_123',
          status: 'ACTIVE',
        },
      });

      expect(mockDb.claim.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_123',
          policyId: 'policy_123',
          type: 'FIRE_DAMAGE',
          status: 'SUBMITTED',
          amount: 15000,
          description: validClaimData.description,
          incidentDate: validClaimData.incidentDate,
          location: validClaimData.location,
          what3words: validClaimData.what3words,
          claimNumber: expect.stringMatching(/^CLM-FIRE-\d{3}$/),
        },
      });
    });

    it('should generate unique claim numbers for different claim types', async () => {
      // Mock policy verification
      mockDb.policy.findFirst.mockResolvedValue({
        id: 'policy_123',
        userId: 'user_123',
        status: 'ACTIVE',
      });

      // Test fire damage claim number
      mockDb.claim.create.mockResolvedValueOnce({
        id: 'claim_fire',
        claimNumber: 'CLM-FIRE-001',
        type: 'FIRE_DAMAGE',
      });

      await customerCaller.claim.submitClaim({
        ...validClaimData,
        type: 'FIRE_DAMAGE',
      });

      // Test water damage claim number
      mockDb.claim.create.mockResolvedValueOnce({
        id: 'claim_water',
        claimNumber: 'CLM-WATER-001',
        type: 'WATER_DAMAGE',
      });

      await customerCaller.claim.submitClaim({
        ...validClaimData,
        type: 'WATER_DAMAGE',
      });

      // Test theft claim number
      mockDb.claim.create.mockResolvedValueOnce({
        id: 'claim_theft',
        claimNumber: 'CLM-THEFT-001',
        type: 'THEFT_BURGLARY',
      });

      await customerCaller.claim.submitClaim({
        ...validClaimData,
        type: 'THEFT_BURGLARY',
      });

      expect(mockDb.claim.create).toHaveBeenCalledTimes(3);
      expect(mockDb.claim.create).toHaveBeenNthCalledWith(1, 
        expect.objectContaining({
          data: expect.objectContaining({
            claimNumber: expect.stringMatching(/^CLM-FIRE-\d{3}$/),
          }),
        })
      );
      expect(mockDb.claim.create).toHaveBeenNthCalledWith(2, 
        expect.objectContaining({
          data: expect.objectContaining({
            claimNumber: expect.stringMatching(/^CLM-WATER-\d{3}$/),
          }),
        })
      );
      expect(mockDb.claim.create).toHaveBeenNthCalledWith(3, 
        expect.objectContaining({
          data: expect.objectContaining({
            claimNumber: expect.stringMatching(/^CLM-THEFT-\d{3}$/),
          }),
        })
      );
    });

    it('should reject claim for inactive policy', async () => {
      mockDb.policy.findFirst.mockResolvedValue({
        id: 'policy_123',
        userId: 'user_123',
        status: 'EXPIRED',
      });

      await expect(
        customerCaller.claim.submitClaim(validClaimData)
      ).rejects.toThrow('Policy not found, not owned by user, or not active');
    });

    it('should reject claim for unauthorized policy', async () => {
      mockDb.policy.findFirst.mockResolvedValue(null);

      await expect(
        customerCaller.claim.submitClaim(validClaimData)
      ).rejects.toThrow('Policy not found, not owned by user, or not active');
    });

    it('should validate incident date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidClaimData = {
        ...validClaimData,
        incidentDate: futureDate,
      };

      await expect(
        customerCaller.claim.submitClaim(invalidClaimData)
      ).rejects.toThrow();
    });

    it('should validate claim amount against policy coverage', async () => {
      mockDb.policy.findFirst.mockResolvedValue({
        id: 'policy_123',
        userId: 'user_123',
        status: 'ACTIVE',
        coverage: 100000,
        deductible: 2500,
      });

      const highAmountClaim = {
        ...validClaimData,
        amount: 150000, // Exceeds coverage
      };

      await expect(
        customerCaller.claim.submitClaim(highAmountClaim)
      ).rejects.toThrow('Claim amount exceeds policy coverage');
    });
  });

  describe('getUserClaims', () => {
    it('should get user claims with filters', async () => {
      const mockClaims = [
        {
          id: 'claim_1',
          claimNumber: 'CLM-FIRE-001',
          type: 'FIRE_DAMAGE',
          status: 'SUBMITTED',
          amount: 15000,
          description: 'Kitchen fire damage',
          incidentDate: new Date('2024-01-15'),
          createdAt: new Date('2024-01-16'),
          policy: {
            policyNumber: 'POL-HOME-001',
            type: 'HOME',
          },
        },
        {
          id: 'claim_2',
          claimNumber: 'CLM-WATER-001',
          type: 'WATER_DAMAGE',
          status: 'UNDER_REVIEW',
          amount: 8500,
          description: 'Burst pipe flooding',
          incidentDate: new Date('2024-01-10'),
          createdAt: new Date('2024-01-11'),
          policy: {
            policyNumber: 'POL-HOME-001',
            type: 'HOME',
          },
        },
      ];

      mockDb.claim.findMany.mockResolvedValue(mockClaims);
      mockDb.claim.count.mockResolvedValue(2);

      const result = await customerCaller.claim.getUserClaims({
        limit: 10,
        offset: 0,
        status: 'SUBMITTED',
        type: 'FIRE_DAMAGE',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.claims).toEqual(mockClaims);
      expect(result.total).toBe(2);

      expect(mockDb.claim.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
          status: 'SUBMITTED',
          type: 'FIRE_DAMAGE',
        },
        include: {
          policy: {
            select: {
              policyNumber: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should get claims without filters', async () => {
      const mockClaims = [
        {
          id: 'claim_1',
          claimNumber: 'CLM-FIRE-001',
          type: 'FIRE_DAMAGE',
          status: 'SUBMITTED',
          amount: 15000,
        },
      ];

      mockDb.claim.findMany.mockResolvedValue(mockClaims);
      mockDb.claim.count.mockResolvedValue(1);

      const result = await customerCaller.claim.getUserClaims({
        limit: 10,
        offset: 0,
      });

      expect(result.claims).toEqual(mockClaims);

      expect(mockDb.claim.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
        },
        include: {
          policy: {
            select: {
              policyNumber: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('getClaimById', () => {
    it('should get claim by ID for owner', async () => {
      const mockClaim = {
        id: 'claim_123',
        claimNumber: 'CLM-FIRE-001',
        userId: 'user_123',
        policyId: 'policy_123',
        type: 'FIRE_DAMAGE',
        status: 'SUBMITTED',
        amount: 15000,
        description: 'Kitchen fire damage',
        incidentDate: new Date('2024-01-15'),
        location: '123 Maple Street',
        what3words: 'filled.count.soap',
        policy: {
          policyNumber: 'POL-HOME-001',
          type: 'HOME',
        },
        documents: [
          {
            id: 'doc_1',
            filename: 'fire_damage_photo.jpg',
            url: 'https://example.com/doc1.jpg',
            type: 'PHOTO',
            size: 2048576,
          },
        ],
      };

      mockDb.claim.findUnique.mockResolvedValue(mockClaim);

      const result = await customerCaller.claim.getClaimById({
        claimId: 'claim_123',
      });

      expect(result).toEqual(mockClaim);

      expect(mockDb.claim.findUnique).toHaveBeenCalledWith({
        where: { id: 'claim_123' },
        include: {
          policy: {
            select: {
              policyNumber: true,
              type: true,
            },
          },
          documents: true,
        },
      });
    });

    it('should deny access to claim of different user', async () => {
      const mockClaim = {
        id: 'claim_123',
        userId: 'different_user',
        type: 'FIRE_DAMAGE',
      };

      mockDb.claim.findUnique.mockResolvedValue(mockClaim);

      await expect(
        customerCaller.claim.getClaimById({
          claimId: 'claim_123',
        })
      ).rejects.toThrow('Claim not found or unauthorized');
    });

    it('should allow agent to view any claim', async () => {
      const mockClaim = {
        id: 'claim_123',
        userId: 'different_user',
        type: 'FIRE_DAMAGE',
        status: 'SUBMITTED',
        policy: {
          policyNumber: 'POL-HOME-001',
        },
        documents: [],
      };

      mockDb.claim.findUnique.mockResolvedValue(mockClaim);

      const result = await agentCaller.claim.getClaimById({
        claimId: 'claim_123',
      });

      expect(result).toEqual(mockClaim);
    });
  });

  describe('updateClaimStatus', () => {
    it('should update claim status by agent', async () => {
      const mockClaim = {
        id: 'claim_123',
        userId: 'user_123',
        status: 'SUBMITTED',
        type: 'FIRE_DAMAGE',
        amount: 15000,
      };

      mockDb.claim.findUnique.mockResolvedValue(mockClaim);

      const updatedClaim = {
        ...mockClaim,
        status: 'UNDER_REVIEW',
        updatedAt: new Date(),
      };

      mockDb.claim.update.mockResolvedValue(updatedClaim);

      const result = await agentCaller.claim.updateClaimStatus({
        claimId: 'claim_123',
        status: 'UNDER_REVIEW',
        notes: 'Claim received, starting investigation',
      });

      expect(result).toEqual(updatedClaim);

      expect(mockDb.claim.update).toHaveBeenCalledWith({
        where: { id: 'claim_123' },
        data: {
          status: 'UNDER_REVIEW',
        },
      });
    });

    it('should not allow customer to update claim status', async () => {
      await expect(
        customerCaller.claim.updateClaimStatus({
          claimId: 'claim_123',
          status: 'APPROVED',
        })
      ).rejects.toThrow('Insufficient permissions');
    });

    it('should validate status transitions', async () => {
      const mockClaim = {
        id: 'claim_123',
        status: 'SETTLED',
        type: 'FIRE_DAMAGE',
      };

      mockDb.claim.findUnique.mockResolvedValue(mockClaim);

      await expect(
        agentCaller.claim.updateClaimStatus({
          claimId: 'claim_123',
          status: 'SUBMITTED', // Cannot go backwards from SETTLED
        })
      ).rejects.toThrow('Invalid status transition');
    });
  });

  describe('addClaimDocument', () => {
    it('should add document to claim successfully', async () => {
      const mockClaim = {
        id: 'claim_123',
        userId: 'user_123',
        type: 'FIRE_DAMAGE',
        status: 'SUBMITTED',
      };

      mockDb.claim.findFirst.mockResolvedValue(mockClaim);

      const mockDocument = {
        id: 'doc_123',
        claimId: 'claim_123',
        filename: 'damage_photo.jpg',
        url: 'https://example.com/doc123.jpg',
        type: 'PHOTO',
        size: 1048576,
        mimeType: 'image/jpeg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.document.create.mockResolvedValue(mockDocument);

      const result = await customerCaller.claim.addClaimDocument({
        claimId: 'claim_123',
        filename: 'damage_photo.jpg',
        url: 'https://example.com/doc123.jpg',
        type: 'PHOTO',
        size: 1048576,
        mimeType: 'image/jpeg',
      });

      expect(result).toEqual(mockDocument);

      expect(mockDb.document.create).toHaveBeenCalledWith({
        data: {
          claimId: 'claim_123',
          filename: 'damage_photo.jpg',
          url: 'https://example.com/doc123.jpg',
          type: 'PHOTO',
          size: 1048576,
          mimeType: 'image/jpeg',
        },
      });
    });

    it('should validate file size limits', async () => {
      const mockClaim = {
        id: 'claim_123',
        userId: 'user_123',
        status: 'SUBMITTED',
      };

      mockDb.claim.findFirst.mockResolvedValue(mockClaim);

      await expect(
        customerCaller.claim.addClaimDocument({
          claimId: 'claim_123',
          filename: 'huge_file.jpg',
          url: 'https://example.com/huge.jpg',
          type: 'PHOTO',
          size: 50 * 1024 * 1024, // 50MB - exceeds limit
          mimeType: 'image/jpeg',
        })
      ).rejects.toThrow('File size exceeds maximum allowed size');
    });

    it('should validate file types', async () => {
      const mockClaim = {
        id: 'claim_123',
        userId: 'user_123',
        status: 'SUBMITTED',
      };

      mockDb.claim.findFirst.mockResolvedValue(mockClaim);

      await expect(
        customerCaller.claim.addClaimDocument({
          claimId: 'claim_123',
          filename: 'malicious.exe',
          url: 'https://example.com/malicious.exe',
          type: 'OTHER',
          size: 1024,
          mimeType: 'application/x-msdownload',
        })
      ).rejects.toThrow('File type not allowed');
    });

    it('should not allow adding documents to settled claims', async () => {
      const mockClaim = {
        id: 'claim_123',
        userId: 'user_123',
        status: 'SETTLED',
      };

      mockDb.claim.findFirst.mockResolvedValue(mockClaim);

      await expect(
        customerCaller.claim.addClaimDocument({
          claimId: 'claim_123',
          filename: 'late_document.pdf',
          url: 'https://example.com/late.pdf',
          type: 'OTHER',
          size: 1024,
          mimeType: 'application/pdf',
        })
      ).rejects.toThrow('Cannot add documents to settled or closed claims');
    });
  });

  describe('getClaimDocuments', () => {
    it('should get claim documents successfully', async () => {
      const mockClaim = {
        id: 'claim_123',
        userId: 'user_123',
      };

      const mockDocuments = [
        {
          id: 'doc_1',
          filename: 'damage_photo1.jpg',
          url: 'https://example.com/doc1.jpg',
          type: 'PHOTO',
          size: 2048576,
          mimeType: 'image/jpeg',
          createdAt: new Date('2024-01-16'),
        },
        {
          id: 'doc_2',
          filename: 'repair_estimate.pdf',
          url: 'https://example.com/doc2.pdf',
          type: 'ESTIMATE',
          size: 512000,
          mimeType: 'application/pdf',
          createdAt: new Date('2024-01-17'),
        },
      ];

      mockDb.claim.findFirst.mockResolvedValue(mockClaim);
      mockDb.document.findMany.mockResolvedValue(mockDocuments);

      const result = await customerCaller.claim.getClaimDocuments({
        claimId: 'claim_123',
      });

      expect(result).toEqual(mockDocuments);

      expect(mockDb.document.findMany).toHaveBeenCalledWith({
        where: { claimId: 'claim_123' },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('getClaimStats', () => {
    it('should get claim statistics for user', async () => {
      const mockStats = [
        { _count: { id: 2 }, status: 'SUBMITTED' },
        { _count: { id: 1 }, status: 'UNDER_REVIEW' },
        { _count: { id: 1 }, status: 'APPROVED' },
        { _count: { id: 1 }, status: 'SETTLED' },
      ];

      mockDb.claim.groupBy.mockResolvedValue(mockStats);

      const result = await customerCaller.claim.getClaimStats();

      expect(result).toEqual({
        total: 5,
        submitted: 2,
        underReview: 1,
        investigating: 0,
        approved: 1,
        rejected: 0,
        settled: 1,
      });

      expect(mockDb.claim.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        where: {
          userId: 'user_123',
        },
        _count: {
          id: true,
        },
      });
    });

    it('should get claim statistics by type', async () => {
      const mockStatsByType = [
        { _count: { id: 3 }, type: 'FIRE_DAMAGE' },
        { _count: { id: 2 }, type: 'WATER_DAMAGE' },
        { _count: { id: 1 }, type: 'THEFT_BURGLARY' },
      ];

      mockDb.claim.groupBy.mockResolvedValue(mockStatsByType);

      const result = await customerCaller.claim.getClaimStatsByType();

      expect(result).toEqual([
        { type: 'FIRE_DAMAGE', count: 3 },
        { type: 'WATER_DAMAGE', count: 2 },
        { type: 'THEFT_BURGLARY', count: 1 },
      ]);

      expect(mockDb.claim.groupBy).toHaveBeenCalledWith({
        by: ['type'],
        where: {
          userId: 'user_123',
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });
    });
  });

  describe('getAllClaimsForAgent', () => {
    it('should allow agent to view all claims', async () => {
      const mockClaims = [
        {
          id: 'claim_1',
          claimNumber: 'CLM-FIRE-001',
          userId: 'user_123',
          type: 'FIRE_DAMAGE',
          status: 'SUBMITTED',
          amount: 15000,
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
          policy: {
            policyNumber: 'POL-HOME-001',
            type: 'HOME',
          },
        },
        {
          id: 'claim_2',
          claimNumber: 'CLM-WATER-001',
          userId: 'user_456',
          type: 'WATER_DAMAGE',
          status: 'UNDER_REVIEW',
          amount: 8500,
          user: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
          policy: {
            policyNumber: 'POL-HOME-002',
            type: 'HOME',
          },
        },
      ];

      mockDb.claim.findMany.mockResolvedValue(mockClaims);
      mockDb.claim.count.mockResolvedValue(2);

      const result = await agentCaller.claim.getAllClaims({
        limit: 10,
        offset: 0,
        status: 'SUBMITTED',
      });

      expect(result.claims).toEqual(mockClaims);
      expect(result.total).toBe(2);

      expect(mockDb.claim.findMany).toHaveBeenCalledWith({
        where: {
          status: 'SUBMITTED',
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          policy: {
            select: {
              policyNumber: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should not allow customer to view all claims', async () => {
      await expect(
        customerCaller.claim.getAllClaims({
          limit: 10,
          offset: 0,
        })
      ).rejects.toThrow('Insufficient permissions');
    });
  });
});