import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables first, before any imports
Object.defineProperty(process, 'env', {
  value: {
    ...process.env,
    PAYSTACK_SECRET_KEY: 'sk_test_mock_secret_key',
    PAYSTACK_WEBHOOK_SECRET: 'webhook_secret_123',
  },
});

import axios from 'axios';
import { PaystackService } from './paystack';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Create a mock axios instance
const mockAxiosInstance = {
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
};

describe('PaystackService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.create to return our mock instance
    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);
  });

  describe('Transaction Management', () => {
    it('should initialize transaction successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Authorization URL created',
          data: {
            authorization_url: 'https://checkout.paystack.com/pay/test',
            access_code: 'test_access_code',
            reference: 'ref_123456789',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await PaystackService.initializeTransaction({
        amount: 100000, // 1000 ZAR in kobo
        email: 'test@example.com',
        metadata: { user_id: 'user123' },
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/transaction/initialize', expect.objectContaining({
        amount: 100000,
        currency: 'ZAR',
        email: 'test@example.com',
        metadata: { user_id: 'user123' },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      }));
    });

    it('should verify transaction successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Verification successful',
          data: {
            id: 12345,
            reference: 'ref_123456789',
            amount: 100000,
            status: 'success',
            gateway_response: 'Successful',
            paid_at: '2024-01-15T10:30:00Z',
            created_at: '2024-01-15T10:25:00Z',
            channel: 'card',
            currency: 'ZAR',
            authorization: {
              authorization_code: 'AUTH_test123',
              bin: '408408',
              last4: '4081',
              exp_month: '12',
              exp_year: '2030',
              channel: 'card',
              card_type: 'visa',
              bank: 'TEST BANK',
              country_code: 'ZA',
              brand: 'visa',
              reusable: true,
              signature: 'SIG_test123',
            },
            customer: {
              id: 67890,
              first_name: 'John',
              last_name: 'Doe',
              email: 'test@example.com',
              customer_code: 'CUS_test123',
              phone: '+27123456789',
              metadata: { user_id: 'user123' },
              risk_action: 'default',
            },
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await PaystackService.verifyTransaction('ref_123456789');

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/transaction/verify/ref_123456789');
    });

    it('should handle transaction verification failure', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(PaystackService.verifyTransaction('invalid_ref')).rejects.toThrow('Network error');
    });
  });

  describe('Customer Management', () => {
    it('should create customer successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Customer created',
          data: {
            id: 67890,
            first_name: 'John',
            last_name: 'Doe',
            email: 'test@example.com',
            customer_code: 'CUS_test123',
            phone: '+27123456789',
            metadata: { user_id: 'user123' },
            risk_action: 'default',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const customerData = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+27123456789',
        metadata: { user_id: 'user123' },
      };

      const result = await PaystackService.createCustomer(customerData);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/customer', customerData);
    });

    it('should get customer successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Customer retrieved',
          data: {
            id: 67890,
            email: 'test@example.com',
            customer_code: 'CUS_test123',
            first_name: 'John',
            last_name: 'Doe',
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await PaystackService.getCustomer('test@example.com');

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/customer/test@example.com');
    });
  });

  describe('Plans and Subscriptions', () => {
    it('should create plan successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Plan created',
          data: {
            name: 'Monthly Premium Plan',
            amount: 50000, // 500 ZAR in kobo
            interval: 'monthly',
            plan_code: 'PLN_test123',
            currency: 'ZAR',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const planData = {
        name: 'Monthly Premium Plan',
        interval: 'monthly' as const,
        amount: 50000,
        description: 'Monthly insurance premium',
      };

      const result = await PaystackService.createPlan(planData);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/plan', {
        ...planData,
        currency: 'ZAR',
      });
    });

    it('should create subscription successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Subscription created',
          data: {
            customer: 'CUS_test123',
            plan: 'PLN_test123',
            subscription_code: 'SUB_test123',
            authorization_url: 'https://checkout.paystack.com/subscribe/test',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const subscriptionData = {
        customer: 'CUS_test123',
        plan: 'PLN_test123',
      };

      const result = await PaystackService.createSubscription(subscriptionData);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/subscription', subscriptionData);
    });
  });

  describe('Transfer Operations', () => {
    it('should create transfer recipient successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Transfer recipient created',
          data: {
            type: 'nuban',
            name: 'John Doe',
            account_number: '1234567890',
            bank_code: '058',
            currency: 'ZAR',
            recipient_code: 'RCP_test123',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const recipientData = {
        type: 'nuban',
        name: 'John Doe',
        account_number: '1234567890',
        bank_code: '058',
      };

      const result = await PaystackService.createTransferRecipient(recipientData);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/transferrecipient', {
        ...recipientData,
        currency: 'ZAR',
      });
    });

    it('should initiate transfer successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Transfer initiated',
          data: {
            reference: 'TRF_test123',
            source: 'balance',
            amount: 50000,
            recipient: 'RCP_test123',
            reason: 'Claim payout',
            status: 'pending',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const transferData = {
        source: 'balance',
        amount: 50000,
        recipient: 'RCP_test123',
        reason: 'Claim payout',
      };

      const result = await PaystackService.initiateTransfer(transferData);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/transfer', transferData);
    });
  });

  describe('Utility Methods', () => {
    it('should format amount correctly', () => {
      expect(PaystackService.formatAmount(100)).toBe(10000); // 100 ZAR = 10000 kobo
      expect(PaystackService.formatAmount(1000.50)).toBe(100050); // 1000.50 ZAR = 100050 kobo
      expect(PaystackService.formatAmount(0.01)).toBe(1); // 0.01 ZAR = 1 kobo
    });

    it('should format amount from kobo correctly', () => {
      expect(PaystackService.formatAmountFromKobo(10000)).toBe(100); // 10000 kobo = 100 ZAR
      expect(PaystackService.formatAmountFromKobo(100050)).toBe(1000.50); // 100050 kobo = 1000.50 ZAR
      expect(PaystackService.formatAmountFromKobo(1)).toBe(0.01); // 1 kobo = 0.01 ZAR
    });

    it('should format currency correctly', () => {
      const formatted = PaystackService.formatCurrency(100000, 'ZAR'); // 100000 kobo = 1000 ZAR
      expect(formatted).toMatch(/R\s*1[,\s]*000/); // Should contain R and 1000 formatted
    });

    it('should generate reference correctly', () => {
      const reference1 = PaystackService.generateReference();
      const reference2 = PaystackService.generateReference();
      
      expect(reference1).toMatch(/^ref_\d+_\d+$/);
      expect(reference2).toMatch(/^ref_\d+_\d+$/);
      expect(reference1).not.toBe(reference2); // Should be unique
    });

    it('should validate webhook signature correctly', () => {
      const payload = JSON.stringify({ event: 'charge.success' });
      
      // Use a real signature for testing
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha512', 'webhook_secret_123')
        .update(payload)
        .digest('hex');
      
      const isValid = PaystackService.validateWebhook(payload, hash);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Bank Operations', () => {
    it('should list banks successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Banks retrieved',
          data: [
            {
              name: 'Standard Bank',
              slug: 'standard-bank',
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
              slug: 'absa-bank',
              code: '632005',
              longcode: '632005',
              gateway: 'emandate',
              pay_with_bank: true,
              active: true,
              country: 'South Africa',
              currency: 'ZAR',
            },
          ],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await PaystackService.listBanks('south-africa');

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bank', {
        params: { country: 'south-africa' },
      });
    });

    it('should verify account number successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Account verification successful',
          data: {
            account_number: '1234567890',
            account_name: 'John Doe',
            bank_id: 1,
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const accountData = {
        account_number: '1234567890',
        bank_code: '051',
      };

      const result = await PaystackService.verifyAccountNumber(accountData);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bank/resolve', {
        params: accountData,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('API Error'));

      await expect(PaystackService.initializeTransaction({
        amount: 100000,
        email: 'test@example.com',
      })).rejects.toThrow('API Error');
    });

    it('should handle customer creation errors gracefully', async () => {
      const mockAxiosInstance = mockedAxios.create();
      vi.mocked(mockAxiosInstance.post).mockRejectedValue(new Error('Invalid email'));

      await expect(PaystackService.createCustomer({
        email: 'invalid-email',
      })).rejects.toThrow('Invalid email');
    });

    it('should handle bank listing errors gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network timeout'));

      await expect(PaystackService.listBanks()).rejects.toThrow('Network timeout');
    });
  });
});