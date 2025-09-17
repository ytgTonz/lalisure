import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email';

// This endpoint can be called by a cron job to retry failed emails
export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (you might want to add authentication here)
    const authHeader = request.headers.get('authorization');

    // For now, we'll allow all requests, but in production you should add authentication
    // if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('Starting email retry process...');

    await EmailService.retryFailedEmails();

    console.log('Email retry process completed');

    return NextResponse.json({
      success: true,
      message: 'Email retry process completed successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error in email retry cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process email retries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support GET requests for testing
export async function GET(request: NextRequest) {
  return POST(request);
}
