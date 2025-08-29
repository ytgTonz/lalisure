import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { PaystackService } from '@/lib/services/paystack';
import { analytics } from '@/lib/services/analytics';

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

        // Send notification (TODO: Implement simplified notification)
        // await NotificationService.notifyPaymentConfirmed(ctx.user.id, {
        //   policyNumber: payment.policy.policyNumber,
        //   policyholderName: `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim(),
        //   amount: payment.amount,
        //   dueDate: new Date().toLocaleDateString(),
        //   paymentMethod: transactionResponse.data.channel,
        // });

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
});