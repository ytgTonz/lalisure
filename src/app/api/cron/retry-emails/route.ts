import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retry failed emails
    await EmailService.retryFailedEmails();

    return NextResponse.json({ 
      success: true, 
      message: 'Failed emails retry process completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email retry cron job failed:', error);
    return NextResponse.json(
      { error: 'Email retry process failed' },
      { status: 500 }
    );
  }
}

// Allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
