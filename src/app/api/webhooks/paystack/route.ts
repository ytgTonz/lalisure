import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { PaystackService } from '@/lib/services/paystack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('x-paystack-signature');

    if (!signature) {
      console.error('No Paystack signature found');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Validate webhook signature
    const isValid = PaystackService.validateWebhook(body, signature);
    if (!isValid) {
      console.error('Invalid Paystack webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('Paystack webhook event:', event.event);

    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      
      case 'transfer.success':
        await handleTransferSuccess(event.data);
        break;
      
      case 'transfer.failed':
        await handleTransferFailed(event.data);
        break;
      
      case 'transfer.reversed':
        await handleTransferReversed(event.data);
        break;

      case 'subscription.create':
        await handleSubscriptionCreated(event.data);
        break;

      case 'subscription.disable':
        await handleSubscriptionDisabled(event.data);
        break;

      case 'invoice.create':
        await handleInvoiceCreated(event.data);
        break;

      case 'invoice.update':
        await handleInvoiceUpdated(event.data);
        break;

      default:
        console.log(`Unhandled Paystack webhook event: ${event.event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleChargeSuccess(data: any) {
  try {
    console.log('Processing charge.success event:', data.reference);
    
    // Find the payment record
    const payment = await db.payment.findUnique({
      where: { paystackId: data.reference },
      include: { policy: { include: { user: true } } },
    });

    if (!payment) {
      console.error('Payment not found for reference:', data.reference);
      return;
    }

    if (payment.status === 'COMPLETED') {
      console.log('Payment already marked as completed:', data.reference);
      return;
    }

    // Update payment status
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(data.paid_at || new Date()),
      },
    });

    // Send notification to user about successful payment
    const { NotificationService } = await import('@/lib/services/notification');
    await NotificationService.notifyPaymentConfirmed(payment.policy.userId, {
      policyNumber: payment.policy.policyNumber,
      amount: payment.amount,
      paymentMethod: data.channel,
      userEmail: payment.policy.user.email,
      userName: `${payment.policy.user.firstName || ''} ${payment.policy.user.lastName || ''}`.trim(),
      userPhone: payment.policy.user.phone || undefined,
    });

    console.log('Payment completed successfully:', data.reference);
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

async function handleTransferSuccess(data: any) {
  try {
    console.log('Processing transfer.success event:', data.reference);
    
    // Find any payment records related to this transfer (for claim payouts)
    const payment = await db.payment.findFirst({
      where: {
        paystackId: data.reference,
        type: 'CLAIM_PAYOUT',
      },
      include: { policy: { include: { user: true } } },
    });

    if (payment) {
      const updated = await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });

      // Send notification about successful payout (email + optional SMS)
      try {
        const { NotificationService } = await import('@/lib/services/notification');
        await NotificationService.create({
          userId: payment.policy.userId,
          type: 'PAYMENT_CONFIRMED',
          title: 'Claim Payout Successful',
          message: `Your claim payout of R${payment.amount} for policy ${payment.policy.policyNumber} has been processed successfully.`,
          data: {
            amount: payment.amount,
            policyNumber: payment.policy.policyNumber,
            paymentMethod: 'transfer',
            transactionId: data.reference,
          },
          userEmail: payment.policy.user.email || undefined,
          userName: `${payment.policy.user.firstName || ''} ${payment.policy.user.lastName || ''}`.trim(),
          userPhone: payment.policy.user.phone || undefined,
          sendEmail: true,
          sendSms: !!payment.policy.user.phone,
        });
      } catch (notifyError) {
        console.error('Failed to send payout notification:', notifyError);
      }

      console.log('Claim payout completed:', data.reference, updated.id);
    }
  } catch (error) {
    console.error('Error handling transfer success:', error);
  }
}

async function handleTransferFailed(data: any) {
  try {
    console.log('Processing transfer.failed event:', data.reference);
    
    const payment = await db.payment.findFirst({
      where: {
        paystackId: data.reference,
        type: 'CLAIM_PAYOUT',
      },
      include: { policy: { include: { user: true } } },
    });

    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
        },
      });

      // Notify user about failed payout
      try {
        const { NotificationService } = await import('@/lib/services/notification');
        await NotificationService.create({
          userId: payment.policy.userId,
          type: 'PAYMENT_FAILED',
          title: 'Claim Payout Failed',
          message: `Your claim payout of R${payment.amount} for policy ${payment.policy.policyNumber} has failed. Our team will investigate and contact you shortly.`,
          data: {
            amount: payment.amount,
            policyNumber: payment.policy.policyNumber,
            transactionId: data.reference,
            reason: data.message || 'Payment processing failed',
          },
          userEmail: payment.policy.user.email || undefined,
          userName: `${payment.policy.user.firstName || ''} ${payment.policy.user.lastName || ''}`.trim(),
          userPhone: payment.policy.user.phone || undefined,
          sendEmail: true,
          sendSms: false, // Don't send SMS for failures to avoid alarm
        });
      } catch (notifyError) {
        console.error('Failed to send payout failure notification:', notifyError);
      }

      console.log('Claim payout failed:', data.reference);
    }
  } catch (error) {
    console.error('Error handling transfer failed:', error);
  }
}

async function handleTransferReversed(data: any) {
  try {
    console.log('Processing transfer.reversed event:', data.reference);
    
    const payment = await db.payment.findFirst({
      where: {
        paystackId: data.reference,
        type: 'CLAIM_PAYOUT',
      },
    });

    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
        },
      });

      console.log('Claim payout reversed:', data.reference);
    }
  } catch (error) {
    console.error('Error handling transfer reversed:', error);
  }
}

async function handleSubscriptionCreated(data: any) {
  try {
    console.log('Processing subscription.create event:', data.subscription_code);
    
    // No Subscription model in schema; best-effort log only.
    // If metadata is present, you could upsert linkage to policy/user here.
    console.log('Subscription created:', data.subscription_code);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionDisabled(data: any) {
  try {
    console.log('Processing subscription.disable event:', data.subscription_code);
    
    // No Subscription model; record an internal notification so support can follow up.
    try {
      const userIdFromMetadata = data?.metadata?.user_id as string | undefined;
      if (userIdFromMetadata) {
        const { NotificationService } = await import('@/lib/services/notification');
        await NotificationService.create({
          userId: userIdFromMetadata,
          type: 'GENERAL',
          title: 'Subscription Disabled',
          message: 'Your recurring payment subscription has been disabled. If this was unintentional, please re-enable or contact support.',
          data: { subscriptionCode: data.subscription_code },
          sendEmail: false,
          sendSms: false,
        });
      }
    } catch (notifyError) {
      console.error('Failed to record subscription disable notification:', notifyError);
    }
    console.log('Subscription disabled:', data.subscription_code);
  } catch (error) {
    console.error('Error handling subscription disabled:', error);
  }
}

async function handleInvoiceCreated(data: any) {
  try {
    console.log('Processing invoice.create event:', data.subscription_code);
    
    // Create a pending payment record for recurring invoices when policy metadata is provided
    const policyIdFromMetadata = data?.metadata?.policy_id as string | undefined;
    const amountInKobo = Number(data?.amount || data?.amount_due || 0);
    const reference = (data?.invoice_code || data?.reference || data?.id || data?.subscription_code) as string | undefined;

    if (policyIdFromMetadata && amountInKobo > 0 && reference) {
      // Check if payment already exists
      const existing = await db.payment.findUnique({ where: { paystackId: reference } });
      if (!existing) {
        await db.payment.create({
          data: {
            policyId: policyIdFromMetadata,
            paystackId: reference,
            amount: PaystackService.formatAmountFromKobo(amountInKobo),
            status: 'PENDING',
            type: 'PREMIUM',
            dueDate: data?.due_date ? new Date(data.due_date) : undefined,
          },
        });
        console.log('Created pending payment for invoice:', reference);
      }
    }

    console.log('Invoice created for subscription:', data.subscription_code);
  } catch (error) {
    console.error('Error handling invoice created:', error);
  }
}

async function handleInvoiceUpdated(data: any) {
  try {
    console.log('Processing invoice.update event:', data.subscription_code);
    
    // Update payment status based on invoice payment state
    const reference = (data?.invoice_code || data?.reference || data?.id || data?.subscription_code) as string | undefined;
    if (reference) {
      const payment = await db.payment.findUnique({ where: { paystackId: reference }, include: { policy: { include: { user: true } } } });
      if (payment) {
        // Determine status
        const status = String(data?.status || '').toLowerCase();
        if (status === 'paid' || status === 'success' || data?.paid === true) {
          await db.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED', paidAt: new Date(data?.paid_at || new Date()) },
          });

          // Notify user of successful recurring payment
          try {
            const { NotificationService } = await import('@/lib/services/notification');
            await NotificationService.notifyPaymentConfirmed(payment.policy.userId, {
              policyNumber: payment.policy.policyNumber,
              amount: payment.amount,
              paymentMethod: 'subscription',
              userEmail: payment.policy.user.email,
              userName: `${payment.policy.user.firstName || ''} ${payment.policy.user.lastName || ''}`.trim(),
              userPhone: payment.policy.user.phone || undefined,
            });
          } catch (notifyError) {
            console.error('Failed to send invoice paid notification:', notifyError);
          }
        } else if (status === 'failed') {
          await db.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
        }
      }
    }

    console.log('Invoice updated for subscription:', data.subscription_code);
  } catch (error) {
    console.error('Error handling invoice updated:', error);
  }
}