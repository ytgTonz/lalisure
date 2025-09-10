import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { PaystackService } from '@/lib/services/paystack';
import { analytics } from '@/lib/services/analytics';
import { NotificationService } from '@/lib/services/notification';

export const paymentRouter = createTRPCRouter({
  // Create payment intent for premium payment
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        amount: z.number().min(0.01),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get policy to validate ownership
        const policy = await ctx.db.policy.findFirst({
          where: {
            id: input.policyId,
            userId: ctx.user.id,
          },
        });

        if (!policy) {
          throw new Error('Policy not found or unauthorized');
        }

        // Get or create Paystack customer
        let paystackCustomerId = await ctx.db.user.findUnique({
          where: { id: ctx.user.id },
          select: { paystackCustomerId: true },
        }).then(user => user?.paystackCustomerId);

        if (!paystackCustomerId) {
          const customerResponse = await PaystackService.createCustomer({
            email: ctx.user.email,
            first_name: ctx.user.firstName || undefined,
            last_name: ctx.user.lastName || undefined,
            phone: ctx.user.phone || undefined,
            metadata: {
              user_id: ctx.user.id,
            },
          });

          paystackCustomerId = customerResponse.data.customer_code;

          // Update user with Paystack customer ID
          await ctx.db.user.update({
            where: { id: ctx.user.id },
            data: { paystackCustomerId: customerResponse.data.customer_code },
          });
        }

        // Initialize Paystack transaction
        const transactionResponse = await PaystackService.initializeTransaction({
          amount: PaystackService.formatAmount(input.amount),
          email: ctx.user.email,
          metadata: {
            policy_number: policy.policyNumber,
            user_id: ctx.user.id,
            policy_id: input.policyId,
          },
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/verify`,
        });

        // Create payment record
        await ctx.db.payment.create({
          data: {
            policyId: input.policyId,
            paystackId: transactionResponse.data.reference,
            amount: input.amount,
            status: 'PENDING',
            type: 'PREMIUM',
          },
        });

        // Track analytics
        if (typeof window !== 'undefined') {
          analytics.paymentEvents.initiated(input.amount, 'card');
        }

        return {
          authorization_url: transactionResponse.data.authorization_url,
          reference: transactionResponse.data.reference,
        };
      } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error('Failed to create payment intent');
      }
    }),

  // Verify payment completion
  verifyPayment: protectedProcedure
    .input(
      z.object({
        reference: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify transaction with Paystack
        const transactionResponse = await PaystackService.verifyTransaction(input.reference);

        if (!transactionResponse.status || transactionResponse.data.status !== 'success') {
          throw new Error('Payment not successful');
        }

        // Update payment record
        const payment = await ctx.db.payment.findUnique({
          where: { paystackId: input.reference },
          include: { policy: true },
        });

        if (!payment || payment.policy.userId !== ctx.user.id) {
          throw new Error('Payment not found or unauthorized');
        }

        await ctx.db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(transactionResponse.data.paid_at || new Date()),
          },
        });

        // Send email notification
        await NotificationService.notifyPaymentConfirmed(ctx.user.id, {
          policyNumber: payment.policy.policyNumber,
          policyholderName: `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim(),
          amount: payment.amount,
          dueDate: new Date().toLocaleDateString(),
          paymentMethod: transactionResponse.data.channel,
          userEmail: ctx.user.email,
          userName: `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim(),
        });

        // Track analytics
        if (typeof window !== 'undefined') {
          analytics.paymentEvents.completed(payment.amount, transactionResponse.data.channel, payment.policyId);
        }

        return { 
          success: true,
          transaction: transactionResponse.data 
        };
      } catch (error) {
        console.error('Error verifying payment:', error);
        throw new Error('Failed to verify payment');
      }
    }),

  // Get payment history for user
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        policyId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        policy: {
          userId: ctx.user.id,
        },
        ...(input.policyId ? { policyId: input.policyId } : {}),
      };

      const [payments, total] = await Promise.all([
        ctx.db.payment.findMany({
          where,
          include: {
            policy: {
              select: {
                policyNumber: true,
                type: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.db.payment.count({ where }),
      ]);

      return {
        payments,
        total,
        hasMore: total > input.offset + payments.length,
      };
    }),

  // Get payment details
  getPayment: protectedProcedure
    .input(z.object({ paymentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.findUnique({
        where: { id: input.paymentId },
        include: {
          policy: {
            select: {
              policyNumber: true,
              type: true,
              userId: true,
            },
          },
        },
      });

      if (!payment || payment.policy.userId !== ctx.user.id) {
        throw new Error('Payment not found or unauthorized');
      }

      return payment;
    }),

  // Get upcoming payments (due soon)
  getUpcomingPayments: protectedProcedure
    .query(async ({ ctx }) => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      return ctx.db.payment.findMany({
        where: {
          policy: {
            userId: ctx.user.id,
          },
          status: 'PENDING',
          dueDate: {
            lte: thirtyDaysFromNow,
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
        orderBy: { dueDate: 'asc' },
      });
    }),

  // Create recurring payment plan
  createSubscription: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        interval: z.enum(['monthly', 'quarterly', 'annually']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get policy to validate ownership
        const policy = await ctx.db.policy.findFirst({
          where: {
            id: input.policyId,
            userId: ctx.user.id,
          },
        });

        if (!policy) {
          throw new Error('Policy not found or unauthorized');
        }

        // Get Paystack customer ID
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.user.id },
          select: { paystackCustomerId: true },
        });

        if (!user?.paystackCustomerId) {
          throw new Error('Paystack customer not found');
        }

        // Calculate plan amount based on interval
        let planAmount = policy.premium;
        if (input.interval === 'monthly') {
          planAmount = Math.round(policy.premium / 12);
        } else if (input.interval === 'quarterly') {
          planAmount = Math.round(policy.premium / 4);
        }

        // Create Paystack plan
        const plan = await PaystackService.createPlan({
          name: `${policy.policyNumber} - ${input.interval} Premium`,
          interval: input.interval === 'quarterly' ? 'quarterly' : input.interval,
          amount: PaystackService.formatAmount(planAmount),
          description: `${input.interval} premium payment for policy ${policy.policyNumber}`,
        });

        // Create subscription
        const subscription = await PaystackService.createSubscription({
          customer: user.paystackCustomerId,
          plan: plan.data.plan_code,
        });

        return {
          planCode: plan.data.plan_code,
          subscriptionCode: subscription.data.subscription_code,
          authorization_url: subscription.data.authorization_url,
        };
      } catch (error) {
        console.error('Error creating subscription:', error);
        throw new Error('Failed to create subscription');
      }
    }),

  // Get customer transactions (payment methods)
  getCustomerTransactions: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { paystackCustomerId: true },
      });

      if (!user?.paystackCustomerId) {
        return [];
      }

      try {
        const customer = await PaystackService.getCustomer(user.paystackCustomerId);
        return customer.data;
      } catch (error) {
        console.error('Error fetching customer data:', error);
        return null;
      }
    }),

  // Get payment statistics for dashboard
  getPaymentStats: protectedProcedure
    .query(async ({ ctx }) => {
      const thisYear = new Date().getFullYear();
      const startOfYear = new Date(thisYear, 0, 1);

      const [totalPaid, pendingPayments, thisYearPayments] = await Promise.all([
        ctx.db.payment.aggregate({
          where: {
            policy: { userId: ctx.user.id },
            status: 'COMPLETED',
          },
          _sum: { amount: true },
        }),
        ctx.db.payment.count({
          where: {
            policy: { userId: ctx.user.id },
            status: 'PENDING',
          },
        }),
        ctx.db.payment.aggregate({
          where: {
            policy: { userId: ctx.user.id },
            status: 'COMPLETED',
            paidAt: { gte: startOfYear },
          },
          _sum: { amount: true },
        }),
      ]);

      return {
        totalPaid: totalPaid._sum.amount || 0,
        pendingPayments,
        thisYearPayments: thisYearPayments._sum.amount || 0,
      };
    }),

  // Get available banks for transfer recipients
  getBanks: protectedProcedure
    .query(async () => {
      try {
        return await PaystackService.listBanks();
      } catch (error) {
        console.error('Error fetching banks:', error);
        throw new Error('Failed to fetch banks');
      }
    }),

  // Verify bank account details
  verifyBankAccount: protectedProcedure
    .input(
      z.object({
        account_number: z.string(),
        bank_code: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await PaystackService.verifyAccountNumber({
          account_number: input.account_number,
          bank_code: input.bank_code,
        });
      } catch (error) {
        console.error('Error verifying bank account:', error);
        throw new Error('Failed to verify bank account');
      }
    }),

  // Create setup intent for saving payment methods (Paystack compatible)
  createSetupIntent: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Get or create Paystack customer
        let paystackCustomerId = await ctx.db.user.findUnique({
          where: { id: ctx.user.id },
          select: { paystackCustomerId: true },
        }).then(user => user?.paystackCustomerId);

        if (!paystackCustomerId) {
          const customerResponse = await PaystackService.createCustomer({
            email: ctx.user.email,
            first_name: ctx.user.firstName || undefined,
            last_name: ctx.user.lastName || undefined,
            phone: ctx.user.phone || undefined,
            metadata: {
              user_id: ctx.user.id,
            },
          });

          paystackCustomerId = customerResponse.data.customer_code;

          // Update user with Paystack customer ID
          await ctx.db.user.update({
            where: { id: ctx.user.id },
            data: { paystackCustomerId: customerResponse.data.customer_code },
          });
        }

        // For Paystack, we'll create a minimal transaction to set up the payment method
        // This is a simplified approach - in production you might want to use dedicated authorization endpoints
        const setupTransaction = await PaystackService.initializeTransaction({
          amount: 100, // R1.00 - minimal amount for setup
          email: ctx.user.email,
          metadata: {
            setup_payment_method: true,
            user_id: ctx.user.id,
          },
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/payments/methods`,
        });

        return {
          clientSecret: setupTransaction.data.reference,
          customerId: paystackCustomerId,
          authorizationUrl: setupTransaction.data.authorization_url,
        };
      } catch (error) {
        console.error('Error creating setup intent:', error);
        throw new Error('Failed to create setup intent');
      }
    }),

  // Verify setup intent after payment method setup
  verifySetup: protectedProcedure
    .input(z.object({ reference: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify the setup transaction with Paystack
        const verificationResponse = await PaystackService.verifyTransaction(input.reference);
        
        if (!verificationResponse.status || verificationResponse.data.status !== 'success') {
          throw new Error('Setup verification failed - transaction was not successful');
        }

        // Check if this was actually a setup transaction
        const metadata = verificationResponse.data.metadata;
        if (!metadata?.setup_payment_method) {
          throw new Error('This transaction was not a payment method setup');
        }

        // Verify the user owns this transaction
        if (metadata.user_id !== ctx.user.id) {
          throw new Error('Unauthorized - transaction belongs to different user');
        }

        // Update user's Paystack customer ID if not already set
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.user.id },
          select: { paystackCustomerId: true },
        });

        if (!user?.paystackCustomerId && verificationResponse.data.customer) {
          await ctx.db.user.update({
            where: { id: ctx.user.id },
            data: { paystackCustomerId: verificationResponse.data.customer.customer_code },
          });
        }

        return {
          success: true,
          transaction: {
            reference: verificationResponse.data.reference,
            amount: verificationResponse.data.amount,
            status: verificationResponse.data.status,
            channel: verificationResponse.data.channel,
            paid_at: verificationResponse.data.paid_at,
          },
          customer: verificationResponse.data.customer ? {
            customer_code: verificationResponse.data.customer.customer_code,
            email: verificationResponse.data.customer.email,
          } : null,
        };
      } catch (error) {
        console.error('Error verifying setup:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to verify setup');
      }
    }),

  // Get saved payment methods for user
  getPaymentMethods: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.user.id },
          select: { paystackCustomerId: true },
        });

        if (!user?.paystackCustomerId) {
          return [];
        }

        // For Paystack, we'll return customer info as the "payment method"
        // In a full implementation, you'd store and retrieve saved cards/authorizations
        const customer = await PaystackService.getCustomer(user.paystackCustomerId);

        return [{
          id: user.paystackCustomerId,
          type: 'paystack_customer',
          last4: null,
          brand: 'Paystack',
          expiryMonth: null,
          expiryYear: null,
          customerCode: customer.data.customer_code,
          email: customer.data.email,
          isDefault: true,
        }];
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        return [];
      }
    }),

  // Remove payment method
  removePaymentMethod: protectedProcedure
    .input(z.object({ methodId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // For Paystack, we can't actually delete customer records through API
        // Instead, we'll update the user's record to remove the association
        await ctx.db.user.update({
          where: { id: ctx.user.id },
          data: { paystackCustomerId: null },
        });

        return { success: true };
      } catch (error) {
        console.error('Error removing payment method:', error);
        throw new Error('Failed to remove payment method');
      }
    }),

  // Export payment history as CSV
  exportPaymentHistory: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        policyId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: any = {
          policy: { userId: ctx.user.id },
        };

        // Add date filters if provided
        if (input.startDate) {
          where.createdAt = { gte: new Date(input.startDate) };
        }
        if (input.endDate) {
          where.createdAt = { ...where.createdAt, lte: new Date(input.endDate) };
        }
        if (input.policyId) {
          where.policyId = input.policyId;
        }

        const payments = await ctx.db.payment.findMany({
          where,
          include: {
            policy: {
              select: {
                policyNumber: true,
                type: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        // Convert to CSV format
        const csvHeaders = [
          'Date',
          'Policy Number',
          'Policy Type',
          'Amount (R)',
          'Currency',
          'Status',
          'Payment Method',
          'Reference',
        ];

        const csvRows = payments.map(payment => [
          payment.createdAt.toISOString().split('T')[0], // Date only
          payment.policy.policyNumber,
          payment.type,
          payment.amount,
          payment.currency || 'ZAR',
          payment.status,
          'Paystack', // Payment method
          payment.paystackId,
        ]);

        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        return {
          csvContent,
          filename: `payment-history-${new Date().toISOString().split('T')[0]}.csv`,
          totalRecords: payments.length,
        };
      } catch (error) {
        console.error('Error exporting payment history:', error);
        throw new Error('Failed to export payment history');
      }
    }),

  // Bulk payment processing
  createBulkPayment: protectedProcedure
    .input(
      z.object({
        paymentIds: z.array(z.string()).min(1).max(10), // Max 10 payments at once
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get all payments to validate ownership
        const payments = await ctx.db.payment.findMany({
          where: {
            id: { in: input.paymentIds },
            policy: { userId: ctx.user.id },
            status: 'PENDING',
          },
          include: {
            policy: {
              select: {
                policyNumber: true,
                type: true,
              },
            },
          },
        });

        if (payments.length === 0) {
          throw new Error('No valid payments found');
        }

        if (payments.length !== input.paymentIds.length) {
          throw new Error('Some payments are not available or already paid');
        }

        // Calculate total amount
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

        // Get or create Paystack customer
        let paystackCustomerId = await ctx.db.user.findUnique({
          where: { id: ctx.user.id },
          select: { paystackCustomerId: true },
        }).then(user => user?.paystackCustomerId);

        if (!paystackCustomerId) {
          const customerResponse = await PaystackService.createCustomer({
            email: ctx.user.email,
            first_name: ctx.user.firstName || undefined,
            last_name: ctx.user.lastName || undefined,
            phone: ctx.user.phone || undefined,
            metadata: {
              user_id: ctx.user.id,
            },
          });

          paystackCustomerId = customerResponse.data.customer_code;

          await ctx.db.user.update({
            where: { id: ctx.user.id },
            data: { paystackCustomerId: customerResponse.data.customer_code },
          });
        }

        // Create bulk payment description
        const bulkDescription = input.description ||
          `Bulk payment for ${payments.length} policy premium${payments.length > 1 ? 's' : ''}: ${payments.map(p => p.policy.policyNumber).join(', ')}`;

        // Initialize Paystack transaction
        const transactionResponse = await PaystackService.initializeTransaction({
          amount: PaystackService.formatAmount(totalAmount),
          email: ctx.user.email,
          metadata: {
            bulk_payment: true,
            payment_ids: input.paymentIds,
            user_id: ctx.user.id,
            policy_numbers: payments.map(p => p.policy.policyNumber),
          },
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/verify`,
        });

        return {
          authorization_url: transactionResponse.data.authorization_url,
          reference: transactionResponse.data.reference,
          totalAmount,
          paymentCount: payments.length,
          policyNumbers: payments.map(p => p.policy.policyNumber),
        };
      } catch (error) {
        console.error('Error creating bulk payment:', error);
        throw new Error('Failed to create bulk payment');
      }
    }),

  // Process bulk payment completion
  verifyBulkPayment: protectedProcedure
    .input(z.object({ reference: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify transaction with Paystack
        const transactionResponse = await PaystackService.verifyTransaction(input.reference);

        if (!transactionResponse.status || transactionResponse.data.status !== 'success') {
          throw new Error('Bulk payment not successful');
        }

        // Get the transaction metadata to find payment IDs
        const metadata = transactionResponse.data.metadata;
        if (!metadata?.bulk_payment || !metadata?.payment_ids) {
          throw new Error('Invalid bulk payment transaction');
        }

        const paymentIds = metadata.payment_ids as string[];

        // Update all payments in the bulk transaction
        const updatePromises = paymentIds.map(paymentId =>
          ctx.db.payment.updateMany({
            where: {
              id: paymentId,
              policy: { userId: ctx.user.id },
              status: 'PENDING',
            },
            data: {
              status: 'COMPLETED',
              paidAt: new Date(transactionResponse.data.paid_at || new Date()),
            },
          })
        );

        await Promise.all(updatePromises);

        // Track analytics
        if (typeof window !== 'undefined') {
          analytics.paymentEvents.completed(transactionResponse.data.amount, transactionResponse.data.channel, null);
        }

        return {
          success: true,
          transaction: transactionResponse.data,
          paymentsProcessed: paymentIds.length,
        };
      } catch (error) {
        console.error('Error verifying bulk payment:', error);
        throw new Error('Failed to verify bulk payment');
      }
    }),
});