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

    // TODO: Send notification to user about successful payment
    // await NotificationService.notifyPaymentConfirmed(payment.policy.userId, {
    //   policyNumber: payment.policy.policyNumber,
    //   amount: payment.amount,
    //   paymentMethod: data.channel,
    // });

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
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });

      // TODO: Send notification about successful payout
      console.log('Claim payout completed:', data.reference);
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
    });

    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
        },
      });

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
    
    // TODO: Update any subscription records if you're storing them separately
    // For now, we'll just log the event
    console.log('Subscription created:', data.subscription_code);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionDisabled(data: any) {
  try {
    console.log('Processing subscription.disable event:', data.subscription_code);
    
    // TODO: Handle subscription cancellation
    console.log('Subscription disabled:', data.subscription_code);
  } catch (error) {
    console.error('Error handling subscription disabled:', error);
  }
}

async function handleInvoiceCreated(data: any) {
  try {
    console.log('Processing invoice.create event:', data.subscription_code);
    
    // TODO: Handle subscription invoice creation
    // This could be used to create payment records for recurring payments
    console.log('Invoice created for subscription:', data.subscription_code);
  } catch (error) {
    console.error('Error handling invoice created:', error);
  }
}

async function handleInvoiceUpdated(data: any) {
  try {
    console.log('Processing invoice.update event:', data.subscription_code);
    
    // TODO: Handle subscription invoice updates
    console.log('Invoice updated for subscription:', data.subscription_code);
  } catch (error) {
    console.error('Error handling invoice updated:', error);
  }
}