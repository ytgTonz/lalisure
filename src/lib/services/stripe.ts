import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripe: Stripe | null = null;

const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }
  return stripe;
};

export interface CreatePaymentIntentData {
  amount: number; // in cents
  currency?: string;
  policyId?: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface CreateCustomerData {
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionData {
  customerId: string;
  priceId: string;
  policyId: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  // Payment Intents
  static async createPaymentIntent(data: CreatePaymentIntentData): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await getStripe().paymentIntents.create({
        amount: data.amount,
        currency: data.currency || 'ZAR',
        customer: data.customerId,
        description: data.description || 'Home Insurance Premium Payment',
        metadata: {
          policy_id: data.policyId || '',
          ...data.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  static async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await getStripe().paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw error;
    }
  }

  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await getStripe().paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  // Customers
  static async createCustomer(data: CreateCustomerData): Promise<Stripe.Customer> {
    try {
      const customer = await getStripe().customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        metadata: data.metadata,
      });

      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  static async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await getStripe().customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      throw error;
    }
  }

  static async updateCustomer(
    customerId: string, 
    data: Partial<CreateCustomerData>
  ): Promise<Stripe.Customer> {
    try {
      return await getStripe().customers.update(customerId, data);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  static async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    try {
      return await getStripe().customers.del(customerId);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Payment Methods
  static async attachPaymentMethod(
    paymentMethodId: string, 
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      return await getStripe().paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  }

  static async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await getStripe().paymentMethods.detach(paymentMethodId);
    } catch (error) {
      console.error('Error detaching payment method:', error);
      throw error;
    }
  }

  static async listCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await getStripe().paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('Error listing payment methods:', error);
      throw error;
    }
  }

  // Subscriptions (for recurring premium payments)
  static async createSubscription(data: CreateSubscriptionData): Promise<Stripe.Subscription> {
    try {
      const subscription = await getStripe().subscriptions.create({
        customer: data.customerId,
        items: [{
          price: data.priceId,
        }],
        metadata: {
          policy_id: data.policyId,
          ...data.metadata,
        },
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await getStripe().subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await getStripe().subscriptions.cancel(subscriptionId);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Products and Prices (for insurance plans)
  static async createProduct(name: string, description?: string): Promise<Stripe.Product> {
    try {
      return await getStripe().products.create({
        name,
        description,
        type: 'service',
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async createPrice(
    productId: string, 
    unitAmount: number, 
    currency: string = 'ZAR',
    recurring?: { interval: 'month' | 'year' }
  ): Promise<Stripe.Price> {
    try {
      return await getStripe().prices.create({
        product: productId,
        unit_amount: unitAmount,
        currency,
        recurring,
      });
    } catch (error) {
      console.error('Error creating price:', error);
      throw error;
    }
  }

  // Invoices
  static async createInvoice(customerId: string, description?: string): Promise<Stripe.Invoice> {
    try {
      return await getStripe().invoices.create({
        customer: customerId,
        description,
        collection_method: 'send_invoice',
        days_until_due: 30,
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  static async payInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      return await getStripe().invoices.pay(invoiceId);
    } catch (error) {
      console.error('Error paying invoice:', error);
      throw error;
    }
  }

  // Webhook handling
  static constructEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    try {
      return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      console.error('Error constructing webhook event:', error);
      throw error;
    }
  }

  // Refunds
  static async createRefund(
    paymentIntentId: string, 
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<Stripe.Refund> {
    try {
      return await getStripe().refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason,
      });
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  // Charges
  static async listCharges(customerId?: string, limit: number = 10): Promise<Stripe.Charge[]> {
    try {
      const charges = await getStripe().charges.list({
        customer: customerId,
        limit,
      });
      return charges.data;
    } catch (error) {
      console.error('Error listing charges:', error);
      throw error;
    }
  }

  // Balance and transfers (for claim payouts)
  static async getBalance(): Promise<Stripe.Balance> {
    try {
      return await getStripe().balance.retrieve();
    } catch (error) {
      console.error('Error retrieving balance:', error);
      throw error;
    }
  }

  // Setup Intents (for saving payment methods)
  static async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    try {
      return await getStripe().setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
      });
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  }

  // Utility methods
  static formatAmount(amount: number): number {
    // Convert currency unit to cents
    return Math.round(amount * 100);
  }

  static formatAmountFromCents(amountInCents: number): number {
    // Convert cents to currency unit
    return amountInCents / 100;
  }

  static formatCurrency(amountInCents: number, currency: string = 'ZAR'): string {
    const amount = this.formatAmountFromCents(amountInCents);
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }
}

export default StripeService;