import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { StripeService } from '@/lib/services/stripe';
// import { NotificationService } from '@/lib/services/notification';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = StripeService.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;
    
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    
    case 'setup_intent.succeeded':
      await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent);
      break;
    
    case 'payment_method.attached':
      await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);

    // Update payment record in database
    const payment = await db.payment.findUnique({
      where: { stripeId: paymentIntent.id },
      include: { 
        policy: {
          include: {
            user: true
          }
        }
      },
    });

    if (!payment) {
      console.error('Payment not found in database:', paymentIntent.id);
      return;
    }

    // Update payment status
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    // Send notification to user (TODO: Implement simplified notification)
    // if (payment.policy.user) {
    //   await NotificationService.notifyPaymentConfirmed(payment.policy.user.id, {
    //     policyNumber: payment.policy.policyNumber,
    //     policyholderName: `${payment.policy.user.firstName || ''} ${payment.policy.user.lastName || ''}`.trim(),
    //     amount: payment.amount,
    //     dueDate: new Date().toLocaleDateString(),
    //     paymentMethod: 'Credit Card',
    //   });
    // }

    console.log('Payment processed successfully:', payment.id);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);

    // Update payment record in database
    const payment = await db.payment.findUnique({
      where: { stripeId: paymentIntent.id },
      include: { 
        policy: {
          include: {
            user: true
          }
        }
      },
    });

    if (!payment) {
      console.error('Payment not found in database:', paymentIntent.id);
      return;
    }

    // Update payment status
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
      },
    });

    // Send notification to user (TODO: Implement simplified notification)
    // if (payment.policy.user) {
    //   await NotificationService.create({
    //     userId: payment.policy.user.id,
    //     type: 'PAYMENT_FAILED',
    //     title: 'Payment Failed',
    //     message: `Your payment of $${payment.amount.toLocaleString()} for policy ${payment.policy.policyNumber} could not be processed.`,
    //     data: {
    //       policyNumber: payment.policy.policyNumber,
    //       amount: payment.amount,
    //       paymentIntentId: paymentIntent.id,
    //     },
    //   });
    // }

    console.log('Failed payment processed:', payment.id);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Invoice payment succeeded:', invoice.id);
    
    // Handle subscription payment success
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const policyId = subscription.metadata.policy_id;
      const userId = subscription.metadata.user_id;

      if (policyId && userId) {
        // Create payment record for subscription payment
        await db.payment.create({
          data: {
            policyId,
            stripeId: invoice.payment_intent as string,
            amount: (invoice.amount_paid || 0) / 100, // Convert from cents
            status: 'COMPLETED',
            type: 'PREMIUM',
            paidAt: new Date(),
          },
        });

        // Send notification
        const policy = await db.policy.findUnique({
          where: { id: policyId },
          include: { user: true },
        });

        // if (policy?.user) {
        //   await NotificationService.notifyPaymentConfirmed(userId, {
        //     policyNumber: policy.policyNumber,
        //     policyholderName: `${policy.user.firstName || ''} ${policy.user.lastName || ''}`.trim(),
        //     amount: (invoice.amount_paid || 0) / 100,
        //     dueDate: new Date().toLocaleDateString(),
        //     paymentMethod: 'Credit Card (Auto-Pay)',
        //   });
        // }
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment success:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('Invoice payment failed:', invoice.id);
    
    // Handle subscription payment failure
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const userId = subscription.metadata.user_id;

      // if (userId) {
      //   await NotificationService.create({
      //     userId,
      //     type: 'PAYMENT_FAILED',
      //     title: 'Subscription Payment Failed',
      //     message: `Your automatic payment for $${((invoice.amount_due || 0) / 100).toLocaleString()} could not be processed.`,
      //     data: {
      //       invoiceId: invoice.id,
      //       amount: (invoice.amount_due || 0) / 100,
      //     },
      //   });
      // }
    }
  } catch (error) {
    console.error('Error handling invoice payment failure:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription created:', subscription.id);
    
    const userId = subscription.metadata.user_id;
    const policyId = subscription.metadata.policy_id;

    // if (userId && policyId) {
    //   // You could create a subscription record in your database here
    //   // For now, just send a notification
    //   await NotificationService.create({
    //     userId,
    //     type: 'GENERAL',
    //     title: 'Auto-Pay Enabled',
    //     message: 'Automatic premium payments have been set up for your policy.',
    //     data: {
    //       subscriptionId: subscription.id,
    //       policyId,
    //     },
    //   });
    // }
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription updated:', subscription.id);
    // Handle subscription updates if needed
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription deleted:', subscription.id);
    
    const userId = subscription.metadata.user_id;

    // if (userId) {
    //   await NotificationService.create({
    //     userId,
    //     type: 'GENERAL',
    //     title: 'Auto-Pay Cancelled',
    //     message: 'Automatic premium payments have been cancelled for your policy.',
    //     data: {
    //       subscriptionId: subscription.id,
    //     },
    //   });
    // }
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  try {
    console.log('Setup intent succeeded:', setupIntent.id);
    // Payment method has been saved successfully
    // The payment method is automatically attached to the customer
  } catch (error) {
    console.error('Error handling setup intent success:', error);
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  try {
    console.log('Payment method attached:', paymentMethod.id);
    
    if (paymentMethod.customer) {
      // Find user by Stripe customer ID
      const user = await db.user.findFirst({
        where: { stripeCustomerId: paymentMethod.customer as string },
      });

      // if (user) {
      //   await NotificationService.create({
      //     userId: user.id,
      //     type: 'GENERAL',
      //     title: 'Payment Method Added',
      //     message: `New ${paymentMethod.card?.brand?.toUpperCase()} card ending in ${paymentMethod.card?.last4} has been added to your account.`,
      //     data: {
      //       paymentMethodId: paymentMethod.id,
      //       cardBrand: paymentMethod.card?.brand,
      //       cardLast4: paymentMethod.card?.last4,
      //     },
      //   });
      // }
    }
  } catch (error) {
    console.error('Error handling payment method attachment:', error);
  }
}