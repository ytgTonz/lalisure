
import { NextRequest, NextResponse } from 'next/server';
import { clearStaffSession } from '@/lib/auth/staff-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    await clearStaffSession();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Staff logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
