import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email';
import { headers } from 'next/headers';

// Verify webhook signature (optional but recommended for production)
async function verifyWebhookSignature(payload: string, signature: string) {
  // In production, you should verify the webhook signature
  // For now, we'll skip this for simplicity
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = headers();

    // Get the webhook signature if available
    const signature = headersList.get('x-resend-signature') || '';

    // Verify webhook (skip for now)
    const isValid = await verifyWebhookSignature(JSON.stringify(body), signature);

    if (!isValid) {
      console.warn('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Process the webhook
    if (body.type && body.data) {
      await EmailService.processWebhook(body);
      console.log(`Processed webhook: ${body.type}`);
    } else if (Array.isArray(body)) {
      // Handle batch webhooks
      for (const webhook of body) {
        if (webhook.type && webhook.data) {
          await EmailService.processWebhook(webhook);
          console.log(`Processed batch webhook: ${webhook.type}`);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error processing Resend webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  // Resend may send GET requests for verification
  // Return a success response
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
