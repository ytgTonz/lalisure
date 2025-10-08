
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/staff-auth';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    // Hash the token to find it in the database
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await db.user.findFirst({
      where: {
        passwordResetToken,
        passwordResetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpires: null,
        passwordResetAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Password has been reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
