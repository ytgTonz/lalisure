import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { StripeService } from '@/lib/services/stripe';
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

        // Get or create Stripe customer
        let stripeCustomerId = await ctx.db.user.findUnique({
          where: { id: ctx.user.id },
          select: { stripeCustomerId: true },
        }).then(user => user?.stripeCustomerId);

        if (!stripeCustomerId) {
          const customer = await StripeService.createCustomer({
            email: ctx.user.email,
            name: `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim(),
            metadata: {
              user_id: ctx.user.id,
            },
          });

          stripeCustomerId = customer.id;

          // Update user with Stripe customer ID
          await ctx.db.user.update({
            where: { id: ctx.user.id },
            data: { stripeCustomerId: customer.id },
          });
        }

        // Create payment intent
        const paymentIntent = await StripeService.createPaymentIntent({
          amount: StripeService.formatAmount(input.amount),
          customerId: stripeCustomerId,
          description: input.description || `Premium payment for policy ${policy.policyNumber}`,
          policyId: input.policyId,
          metadata: {
            policy_number: policy.policyNumber,
            user_id: ctx.user.id,
          },
        });

        // Create payment record
        await ctx.db.payment.create({
          data: {
            policyId: input.policyId,
            stripeId: paymentIntent.id,
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
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        };
      } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error('Failed to create payment intent');
      }
    }),

  // Confirm payment completion
  confirmPayment: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get payment intent from Stripe
        const paymentIntent = await StripeService.getPaymentIntent(input.paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
          throw new Error('Payment not successful');
        }

        // Update payment record
        const payment = await ctx.db.payment.findUnique({
          where: { stripeId: input.paymentIntentId },
          include: { policy: true },
        });

        if (!payment || payment.policy.userId !== ctx.user.id) {
          throw new Error('Payment not found or unauthorized');
        }

        await ctx.db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
          },
        });

        // Send notification (TODO: Implement simplified notification)
        // await NotificationService.notifyPaymentConfirmed(ctx.user.id, {
        //   policyNumber: payment.policy.policyNumber,
        //   policyholderName: `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim(),
        //   amount: payment.amount,
        //   dueDate: new Date().toLocaleDateString(),
        //   paymentMethod: 'Credit Card',
        // });

        // Track analytics
        if (typeof window !== 'undefined') {
          analytics.paymentEvents.completed(payment.amount, 'card', payment.policyId);
        }

        return { success: true };
      } catch (error) {
        console.error('Error confirming payment:', error);
        throw new Error('Failed to confirm payment');
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

  // Create recurring payment setup
  createSubscription: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        priceId: z.string(),
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

        // Get Stripe customer ID
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.user.id },
          select: { stripeCustomerId: true },
        });

        if (!user?.stripeCustomerId) {
          throw new Error('Stripe customer not found');
        }

        // Create subscription
        const subscription = await StripeService.createSubscription({
          customerId: user.stripeCustomerId,
          priceId: input.priceId,
          policyId: input.policyId,
          metadata: {
            policy_number: policy.policyNumber,
            user_id: ctx.user.id,
          },
        });

        return {
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        };
      } catch (error) {
        console.error('Error creating subscription:', error);
        throw new Error('Failed to create subscription');
      }
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify subscription belongs to user
        const subscription = await StripeService.getSubscription(input.subscriptionId);
        
        if (subscription.metadata.user_id !== ctx.user.id) {
          throw new Error('Unauthorized');
        }

        await StripeService.cancelSubscription(input.subscriptionId);
        return { success: true };
      } catch (error) {
        console.error('Error canceling subscription:', error);
        throw new Error('Failed to cancel subscription');
      }
    }),

  // Get payment methods for user
  getPaymentMethods: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { stripeCustomerId: true },
      });

      if (!user?.stripeCustomerId) {
        return [];
      }

      return StripeService.listCustomerPaymentMethods(user.stripeCustomerId);
    }),

  // Create setup intent for saving payment method
  createSetupIntent: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // Get or create Stripe customer
        let user = await ctx.db.user.findUnique({
          where: { id: ctx.user.id },
          select: { stripeCustomerId: true },
        });

        let stripeCustomerId = user?.stripeCustomerId;

        if (!stripeCustomerId) {
          const customer = await StripeService.createCustomer({
            email: ctx.user.email,
            name: `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim(),
            metadata: {
              user_id: ctx.user.id,
            },
          });

          stripeCustomerId = customer.id;

          await ctx.db.user.update({
            where: { id: ctx.user.id },
            data: { stripeCustomerId: customer.id },
          });
        }

        const setupIntent = await StripeService.createSetupIntent(stripeCustomerId);

        return {
          clientSecret: setupIntent.client_secret,
        };
      } catch (error) {
        console.error('Error creating setup intent:', error);
        throw new Error('Failed to create setup intent');
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
});