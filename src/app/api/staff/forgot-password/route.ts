
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { EmailService } from '@/lib/services/email';
import crypto from 'crypto';
import { UserRole, EmailType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user && user.role !== UserRole.CUSTOMER) {
      // Generate a password reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      const passwordResetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

      await db.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken,
          passwordResetTokenExpires,
        },
      });

      // Send the password reset email
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/staff/reset-password?token=${resetToken}`;

      await EmailService.sendTrackedEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `<p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
               <p>Please click on the following link, or paste this into your browser to complete the process:</p>
               <p><a href="${resetUrl}">${resetUrl}</a></p>
               <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
        type: EmailType.PASSWORD_RESET,
        userId: user.id,
      });
    }

    // Always return a success message to prevent email enumeration attacks
    return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
