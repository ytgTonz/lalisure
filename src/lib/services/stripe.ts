import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

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
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency || 'usd',
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
      return await stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw error;
    }
  }

  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  // Customers
  static async createCustomer(data: CreateCustomerData): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
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
      const customer = await stripe.customers.retrieve(customerId);
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
      return await stripe.customers.update(customerId, data);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  static async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    try {
      return await stripe.customers.del(customerId);
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
      return await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  }

  static async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      console.error('Error detaching payment method:', error);
      throw error;
    }
  }

  static async listCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
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
      const subscription = await stripe.subscriptions.create({
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
      return await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Products and Prices (for insurance plans)
  static async createProduct(name: string, description?: string): Promise<Stripe.Product> {
    try {
      return await stripe.products.create({
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
    currency: string = 'usd',
    recurring?: { interval: 'month' | 'year' }
  ): Promise<Stripe.Price> {
    try {
      return await stripe.prices.create({
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
      return await stripe.invoices.create({
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
      return await stripe.invoices.pay(invoiceId);
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
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
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
      return await stripe.refunds.create({
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
      const charges = await stripe.charges.list({
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
      return await stripe.balance.retrieve();
    } catch (error) {
      console.error('Error retrieving balance:', error);
      throw error;
    }
  }

  // Setup Intents (for saving payment methods)
  static async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    try {
      return await stripe.setupIntents.create({
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
    // Convert dollars to cents
    return Math.round(amount * 100);
  }

  static formatAmountFromCents(amountInCents: number): number {
    // Convert cents to dollars
    return amountInCents / 100;
  }

  static formatCurrency(amountInCents: number, currency: string = 'USD'): string {
    const amount = this.formatAmountFromCents(amountInCents);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }
}

export default StripeService;