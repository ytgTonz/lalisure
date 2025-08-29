import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTRPCMsw } from 'msw-trpc';
import { setupServer } from 'msw/node';
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '../root';
import { db } from '@/lib/db';
import { PaystackService } from '@/lib/services/paystack';

// Mock PaystackService
vi.mock('@/lib/services/paystack');
const mockPaystackService = vi.mocked(PaystackService);

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    policy: {
      findFirst: vi.fn(),
    },
    payment: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  analytics: {
    paymentEvents: {
      initiated: vi.fn(),
      completed: vi.fn(),
    },
  },
}));

// Mock environment variables
vi.mock('process', () => ({
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

const mockDb = vi.mocked(db);

describe('Payment Router Integration Tests', () => {
  const createCaller = createCallerFactory(appRouter);
  
  // Mock context
  const mockCtx = {
    user: {
      id: 'user_123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+27123456789',
    },
    db: mockDb,
  };

  const caller = createCaller(mockCtx);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully for new customer', async () => {
      // Mock policy lookup
      mockDb.policy.findFirst.mockResolvedValue({
        id: 'policy_123',
        policyNumber: 'POL-HOME-001',
        userId: 'user_123',
        type: 'HOME',
        status: 'ACTIVE',
        premium: 1500,
        coverage: 400000,
        deductible: 2000,
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock user lookup (no existing Paystack customer)
      mockDb.user.findUnique.mockResolvedValue(null);

      // Mock Paystack customer creation
      mockPaystackService.createCustomer.mockResolvedValue({
        status: true,
        message: 'Customer created',
        data: {
          id: 67890,
          first_name: 'John',
          last_name: 'Doe',
          email: 'test@example.com',
          customer_code: 'CUS_test123',
          phone: '+27123456789',
          metadata: { user_id: 'user_123' },
          risk_action: 'default',
        },
      });

      // Mock user update
      mockDb.user.update.mockResolvedValue({
        id: 'user_123',
        paystackCustomerId: 'CUS_test123',
      });

      // Mock Paystack transaction initialization
      mockPaystackService.initializeTransaction.mockResolvedValue({
        status: true,
        message: 'Authorization URL created',
        data: {
          authorization_url: 'https://checkout.paystack.com/pay/test',
          access_code: 'test_access_code',
          reference: 'ref_123456789',
        },
      });

      // Mock payment creation
      mockDb.payment.create.mockResolvedValue({
        id: 'payment_123',
        policyId: 'policy_123',
        paystackId: 'ref_123456789',
        amount: 1500,
        status: 'PENDING',
        type: 'PREMIUM',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await caller.payment.createPaymentIntent({
        policyId: 'policy_123',
        amount: 1500,
        description: 'Premium payment for policy POL-HOME-001',
      });

      expect(result).toEqual({
        authorization_url: 'https://checkout.paystack.com/pay/test',
        reference: 'ref_123456789',
      });

      expect(mockPaystackService.createCustomer).toHaveBeenCalledWith({
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+27123456789',
        metadata: { user_id: 'user_123' },
      });

      expect(mockPaystackService.initializeTransaction).toHaveBeenCalledWith({
        amount: 150000, // 1500 ZAR in kobo
        email: 'test@example.com',
        metadata: {
          policy_number: 'POL-HOME-001',
          user_id: 'user_123',
          policy_id: 'policy_123',
        },
        callback_url: 'http://localhost:3000/payments/verify',
      });

      expect(mockDb.payment.create).toHaveBeenCalledWith({
        data: {
          policyId: 'policy_123',
          paystackId: 'ref_123456789',
          amount: 1500,
          status: 'PENDING',
          type: 'PREMIUM',
        },
      });
    });

    it('should create payment intent for existing customer', async () => {
      // Mock policy lookup
      mockDb.policy.findFirst.mockResolvedValue({
        id: 'policy_123',
        policyNumber: 'POL-HOME-001',
        userId: 'user_123',
      });

      // Mock user lookup (existing Paystack customer)
      mockDb.user.findUnique.mockResolvedValue({
        paystackCustomerId: 'CUS_existing123',
      });

      // Mock Paystack transaction initialization
      mockPaystackService.initializeTransaction.mockResolvedValue({
        status: true,
        message: 'Authorization URL created',
        data: {
          authorization_url: 'https://checkout.paystack.com/pay/existing',
          access_code: 'existing_access_code',
          reference: 'ref_existing789',
        },
      });

      // Mock payment creation
      mockDb.payment.create.mockResolvedValue({
        id: 'payment_existing',
        policyId: 'policy_123',
        paystackId: 'ref_existing789',
        amount: 1500,
        status: 'PENDING',
        type: 'PREMIUM',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await caller.payment.createPaymentIntent({
        policyId: 'policy_123',
        amount: 1500,
      });

      expect(result).toEqual({
        authorization_url: 'https://checkout.paystack.com/pay/existing',
        reference: 'ref_existing789',
      });

      // Should not create new customer
      expect(mockPaystackService.createCustomer).not.toHaveBeenCalled();
      expect(mockDb.user.update).not.toHaveBeenCalled();
    });

    it('should throw error for unauthorized policy access', async () => {
      // Mock policy lookup returning null (user doesn't own policy)
      mockDb.policy.findFirst.mockResolvedValue(null);

      await expect(
        caller.payment.createPaymentIntent({
          policyId: 'unauthorized_policy',
          amount: 1500,
        })
      ).rejects.toThrow('Policy not found or unauthorized');
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      // Mock Paystack transaction verification
      mockPaystackService.verifyTransaction.mockResolvedValue({
        status: true,
        message: 'Verification successful',
        data: {
          id: 12345,
          reference: 'ref_123456789',
          amount: 150000, // 1500 ZAR in kobo
          status: 'success',
          gateway_response: 'Successful',
          paid_at: '2024-01-15T10:30:00Z',
          created_at: '2024-01-15T10:25:00Z',
          channel: 'card',
          currency: 'ZAR',
        },
      });

      // Mock payment lookup
      mockDb.payment.findUnique.mockResolvedValue({
        id: 'payment_123',
        policyId: 'policy_123',
        paystackId: 'ref_123456789',
        amount: 1500,
        status: 'PENDING',
        policy: {
          userId: 'user_123',
          policyNumber: 'POL-HOME-001',
        },
      });

      // Mock payment update
      mockDb.payment.update.mockResolvedValue({
        id: 'payment_123',
        status: 'COMPLETED',
        paidAt: new Date('2024-01-15T10:30:00Z'),
      });

      const result = await caller.payment.verifyPayment({
        reference: 'ref_123456789',
      });

      expect(result.success).toBe(true);
      expect(result.transaction).toBeDefined();
      expect(result.transaction.status).toBe('success');

      expect(mockPaystackService.verifyTransaction).toHaveBeenCalledWith('ref_123456789');
      
      expect(mockDb.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment_123' },
        data: {
          status: 'COMPLETED',
          paidAt: new Date('2024-01-15T10:30:00Z'),
        },
      });
    });

    it('should throw error for failed payment verification', async () => {
      // Mock Paystack transaction verification (failed)
      mockPaystackService.verifyTransaction.mockResolvedValue({
        status: false,
        message: 'Transaction failed',
        data: {
          status: 'failed',
          reference: 'ref_failed123',
        },
      });

      await expect(
        caller.payment.verifyPayment({
          reference: 'ref_failed123',
        })
      ).rejects.toThrow('Payment not successful');
    });

    it('should throw error for unauthorized payment access', async () => {
      // Mock Paystack transaction verification (successful)
      mockPaystackService.verifyTransaction.mockResolvedValue({
        status: true,
        data: {
          status: 'success',
          reference: 'ref_unauthorized',
        },
      });

      // Mock payment lookup (different user)
      mockDb.payment.findUnique.mockResolvedValue({
        id: 'payment_unauthorized',
        policy: {
          userId: 'different_user',
        },
      });

      await expect(
        caller.payment.verifyPayment({
          reference: 'ref_unauthorized',
        })
      ).rejects.toThrow('Payment not found or unauthorized');
    });
  });

  describe('getPaymentHistory', () => {
    it('should get payment history successfully', async () => {
      const mockPayments = [
        {
          id: 'payment_1',
          amount: 1500,
          status: 'COMPLETED',
          type: 'PREMIUM',
          createdAt: new Date('2024-01-15'),
          policy: {
            policyNumber: 'POL-HOME-001',
            type: 'HOME',
          },
        },
        {
          id: 'payment_2',
          amount: 1200,
          status: 'PENDING',
          type: 'PREMIUM',
          createdAt: new Date('2024-01-10'),
          policy: {
            policyNumber: 'POL-HOME-002',
            type: 'HOME',
          },
        },
      ];

      mockDb.payment.findMany.mockResolvedValue(mockPayments);
      mockDb.payment.count.mockResolvedValue(2);

      const result = await caller.payment.getPaymentHistory({
        limit: 10,
        offset: 0,
      });

      expect(result.payments).toEqual(mockPayments);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);

      expect(mockDb.payment.findMany).toHaveBeenCalledWith({
        where: {
          policy: {
            userId: 'user_123',
          },
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

    it('should filter payment history by policy', async () => {
      const mockPayments = [
        {
          id: 'payment_1',
          amount: 1500,
          status: 'COMPLETED',
          type: 'PREMIUM',
          createdAt: new Date('2024-01-15'),
          policy: {
            policyNumber: 'POL-HOME-001',
            type: 'HOME',
          },
        },
      ];

      mockDb.payment.findMany.mockResolvedValue(mockPayments);
      mockDb.payment.count.mockResolvedValue(1);

      const result = await caller.payment.getPaymentHistory({
        limit: 10,
        offset: 0,
        policyId: 'policy_123',
      });

      expect(result.payments).toEqual(mockPayments);
      expect(result.total).toBe(1);

      expect(mockDb.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            policy: {
              userId: 'user_123',
            },
            policyId: 'policy_123',
          },
        })
      );
    });
  });

  describe('getPaymentStats', () => {
    it('should get payment statistics successfully', async () => {
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);

      mockDb.payment.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 5000 } }) // totalPaid
        .mockResolvedValueOnce({ _sum: { amount: 3000 } }); // thisYearPayments

      mockDb.payment.count.mockResolvedValue(2); // pendingPayments

      const result = await caller.payment.getPaymentStats();

      expect(result).toEqual({
        totalPaid: 5000,
        pendingPayments: 2,
        thisYearPayments: 3000,
      });

      expect(mockDb.payment.aggregate).toHaveBeenCalledWith({
        where: {
          policy: { userId: 'user_123' },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      });

      expect(mockDb.payment.count).toHaveBeenCalledWith({
        where: {
          policy: { userId: 'user_123' },
          status: 'PENDING',
        },
      });
    });
  });

  describe('getBanks', () => {
    it('should get banks list successfully', async () => {
      const mockBanks = {
        status: true,
        data: [
          {
            name: 'Standard Bank',
            code: '051',
            longcode: '051',
            gateway: 'emandate',
            pay_with_bank: true,
            active: true,
            country: 'South Africa',
            currency: 'ZAR',
          },
          {
            name: 'ABSA Bank',
            code: '632005',
            longcode: '632005',
            gateway: 'emandate',
            pay_with_bank: true,
            active: true,
            country: 'South Africa',
            currency: 'ZAR',
          },
        ],
      };

      mockPaystackService.listBanks.mockResolvedValue(mockBanks);

      const result = await caller.payment.getBanks();

      expect(result).toEqual(mockBanks);
      expect(mockPaystackService.listBanks).toHaveBeenCalled();
    });
  });

  describe('verifyBankAccount', () => {
    it('should verify bank account successfully', async () => {
      const mockVerification = {
        status: true,
        data: {
          account_number: '1234567890',
          account_name: 'John Doe',
          bank_id: 1,
        },
      };

      mockPaystackService.verifyAccountNumber.mockResolvedValue(mockVerification);

      const result = await caller.payment.verifyBankAccount({
        account_number: '1234567890',
        bank_code: '051',
      });

      expect(result).toEqual(mockVerification);
      expect(mockPaystackService.verifyAccountNumber).toHaveBeenCalledWith({
        account_number: '1234567890',
        bank_code: '051',
      });
    });
  });

  describe('createSubscription', () => {
    it('should create subscription successfully', async () => {
      // Mock policy lookup
      mockDb.policy.findFirst.mockResolvedValue({
        id: 'policy_123',
        policyNumber: 'POL-HOME-001',
        userId: 'user_123',
        premium: 1200, // Annual premium
      });

      // Mock user lookup
      mockDb.user.findUnique.mockResolvedValue({
        paystackCustomerId: 'CUS_test123',
      });

      // Mock Paystack plan creation
      mockPaystackService.createPlan.mockResolvedValue({
        status: true,
        data: {
          plan_code: 'PLN_test123',
          name: 'POL-HOME-001 - monthly Premium',
          amount: 10000, // 100 ZAR monthly
          interval: 'monthly',
        },
      });

      // Mock Paystack subscription creation
      mockPaystackService.createSubscription.mockResolvedValue({
        status: true,
        data: {
          subscription_code: 'SUB_test123',
          authorization_url: 'https://checkout.paystack.com/subscribe/test',
        },
      });

      const result = await caller.payment.createSubscription({
        policyId: 'policy_123',
        interval: 'monthly',
      });

      expect(result).toEqual({
        planCode: 'PLN_test123',
        subscriptionCode: 'SUB_test123',
        authorization_url: 'https://checkout.paystack.com/subscribe/test',
      });

      expect(mockPaystackService.createPlan).toHaveBeenCalledWith({
        name: 'POL-HOME-001 - monthly Premium',
        interval: 'monthly',
        amount: 10000, // Monthly premium (1200/12 * 100)
        description: 'monthly premium payment for policy POL-HOME-001',
      });
    });

    it('should calculate quarterly subscription correctly', async () => {
      // Mock policy lookup
      mockDb.policy.findFirst.mockResolvedValue({
        id: 'policy_123',
        policyNumber: 'POL-HOME-001',
        userId: 'user_123',
        premium: 1200, // Annual premium
      });

      // Mock user lookup
      mockDb.user.findUnique.mockResolvedValue({
        paystackCustomerId: 'CUS_test123',
      });

      // Mock Paystack plan creation
      mockPaystackService.createPlan.mockResolvedValue({
        status: true,
        data: {
          plan_code: 'PLN_quarterly123',
          name: 'POL-HOME-001 - quarterly Premium',
          amount: 30000, // 300 ZAR quarterly
          interval: 'quarterly',
        },
      });

      // Mock Paystack subscription creation
      mockPaystackService.createSubscription.mockResolvedValue({
        status: true,
        data: {
          subscription_code: 'SUB_quarterly123',
          authorization_url: 'https://checkout.paystack.com/subscribe/quarterly',
        },
      });

      const result = await caller.payment.createSubscription({
        policyId: 'policy_123',
        interval: 'quarterly',
      });

      expect(mockPaystackService.createPlan).toHaveBeenCalledWith({
        name: 'POL-HOME-001 - quarterly Premium',
        interval: 'quarterly',
        amount: 30000, // Quarterly premium (1200/4 * 100)
        description: 'quarterly premium payment for policy POL-HOME-001',
      });
    });
  });
});