import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = headers();
    
    // Verify webhook signature (optional but recommended)
    const signature = headersList.get('resend-signature');
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      // In a real implementation, you'd verify the signature here
      // For now, we'll just check if the secret is provided
      console.log('Webhook signature verification would happen here');
    }

    // Process the webhook data
    await EmailService.processWebhook(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    message: 'Resend webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}