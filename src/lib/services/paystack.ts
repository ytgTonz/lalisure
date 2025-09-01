import axios, { AxiosResponse } from 'axios';

const getPaystackApi = () => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not set in environment variables');
  }
  
  return axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });
};

// Types for Paystack API
export interface PaystackTransaction {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  gateway_response: string;
  paid_at?: string;
  created_at: string;
  channel: string;
  authorization: PaystackAuthorization;
  customer: PaystackCustomer;
}

export interface PaystackAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
}

export interface PaystackCustomer {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  customer_code: string;
  phone?: string;
  metadata?: Record<string, any>;
  risk_action: string;
}

export interface CreateTransactionData {
  amount: number; // in kobo (1 ZAR = 100 kobo)
  currency?: string;
  email: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  channels?: string[];
}

export interface CreateCustomerData {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface InitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyTransactionResponse {
  status: boolean;
  message: string;
  data: PaystackTransaction;
}

export interface CreateCustomerResponse {
  status: boolean;
  message: string;
  data: PaystackCustomer;
}

export class PaystackService {
  // Transaction Management
  static async initializeTransaction(data: CreateTransactionData): Promise<InitializeTransactionResponse> {
    try {
      // Generate reference if not provided
      const reference = data.reference || this.generateReference();
      
      const response: AxiosResponse<InitializeTransactionResponse> = await getPaystackApi().post('/transaction/initialize', {
        amount: data.amount,
        currency: data.currency || 'ZAR',
        email: data.email,
        reference,
        callback_url: data.callback_url,
        metadata: data.metadata,
        channels: data.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      });

      return response.data;
    } catch (error) {
      console.error('Error initializing transaction:', error);
      throw error;
    }
  }

  static async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    try {
      const response: AxiosResponse<VerifyTransactionResponse> = await getPaystackApi().get(`/transaction/verify/${reference}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      throw error;
    }
  }

  static async getTransaction(id: number): Promise<VerifyTransactionResponse> {
    try {
      const response: AxiosResponse<VerifyTransactionResponse> = await getPaystackApi().get(`/transaction/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  static async listTransactions(params?: {
    perPage?: number;
    page?: number;
    customer?: number;
    status?: string;
    from?: string;
    to?: string;
    amount?: number;
  }) {
    try {
      const response = await getPaystackApi().get('/transaction', { params });
      return response.data;
    } catch (error) {
      console.error('Error listing transactions:', error);
      throw error;
    }
  }

  // Customer Management
  static async createCustomer(data: CreateCustomerData): Promise<CreateCustomerResponse> {
    try {
      const response: AxiosResponse<CreateCustomerResponse> = await getPaystackApi().post('/customer', data);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  static async getCustomer(emailOrCode: string) {
    try {
      const response = await getPaystackApi().get(`/customer/${emailOrCode}`);
      return response.data;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  }

  static async updateCustomer(code: string, data: Partial<CreateCustomerData>) {
    try {
      const response = await getPaystackApi().put(`/customer/${code}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  static async listCustomers(params?: {
    perPage?: number;
    page?: number;
    from?: string;
    to?: string;
  }) {
    try {
      const response = await getPaystackApi().get('/customer', { params });
      return response.data;
    } catch (error) {
      console.error('Error listing customers:', error);
      throw error;
    }
  }

  // Plans and Subscriptions (for recurring payments)
  static async createPlan(data: {
    name: string;
    interval: 'daily' | 'weekly' | 'monthly' | 'biannually' | 'annually';
    amount: number;
    description?: string;
    currency?: string;
  }) {
    try {
      const response = await getPaystackApi().post('/plan', {
        ...data,
        currency: data.currency || 'ZAR',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  static async createSubscription(data: {
    customer: string;
    plan: string;
    authorization?: string;
    start_date?: string;
  }) {
    try {
      const response = await getPaystackApi().post('/subscription', data);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Transfers (for claim payouts)
  static async createTransferRecipient(data: {
    type: string;
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
  }) {
    try {
      const response = await getPaystackApi().post('/transferrecipient', {
        ...data,
        currency: data.currency || 'ZAR',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating transfer recipient:', error);
      throw error;
    }
  }

  static async initiateTransfer(data: {
    source: string;
    amount: number;
    recipient: string;
    reason?: string;
  }) {
    try {
      const response = await getPaystackApi().post('/transfer', data);
      return response.data;
    } catch (error) {
      console.error('Error initiating transfer:', error);
      throw error;
    }
  }

  // Utility methods
  static formatAmount(amount: number): number {
    // Convert ZAR to kobo (1 ZAR = 100 kobo)
    return Math.round(amount * 100);
  }

  static formatAmountFromKobo(amountInKobo: number): number {
    // Convert kobo to ZAR
    return amountInKobo / 100;
  }

  static formatCurrency(amountInKobo: number, currency: string = 'ZAR'): string {
    const amount = this.formatAmountFromKobo(amountInKobo);
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  static generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `ref_${timestamp}_${random}`;
  }

  // Webhook validation
  static validateWebhook(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex');
    
    return hash === signature;
  }

  // Banks (for transfer recipients)
  static async listBanks(country: string = 'south-africa') {
    try {
      const response = await getPaystackApi().get('/bank', {
        params: { country },
      });
      return response.data;
    } catch (error) {
      console.error('Error listing banks:', error);
      throw error;
    }
  }

  static async verifyAccountNumber(data: {
    account_number: string;
    bank_code: string;
  }) {
    try {
      const response = await getPaystackApi().get('/bank/resolve', {
        params: data,
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying account number:', error);
      throw error;
    }
  }
}

export default PaystackService;