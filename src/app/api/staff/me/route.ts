
import { NextRequest, NextResponse } from 'next/server';
import { getStaffSession } from '@/lib/auth/staff-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getStaffSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error('Error fetching staff session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
