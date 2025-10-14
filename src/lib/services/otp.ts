/**
 * OTP Service for Mobile Authentication (V2)
 *
 * Handles OTP generation, validation, and delivery via Twilio SMS.
 * Security features:
 * - 6-digit codes with 5-minute expiry
 * - Rate limiting (max 3 OTPs per 15 minutes)
 * - Attempt limiting (max 5 failed attempts before lockout)
 * - Bcrypt hashing for stored OTP codes
 */

import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { SmsService } from './sms';

export interface OtpGenerationResult {
  success: boolean;
  message: string;
  maskedPhone?: string;
  expiresAt?: Date;
  error?: string;
}

export interface OtpVerificationResult {
  success: boolean;
  userId?: string;
  message: string;
  attemptsRemaining?: number;
  error?: string;
}

export class OtpService {
  // OTP Configuration
  private static readonly OTP_LENGTH = 6;
  private static readonly OTP_EXPIRY_MINUTES = 5;
  private static readonly MAX_OTP_ATTEMPTS = 5;
  private static readonly RATE_LIMIT_WINDOW_MINUTES = 15;
  private static readonly MAX_OTP_REQUESTS = 3;
  private static readonly LOCKOUT_DURATION_MINUTES = 30;

  /**
   * Generate a random 6-digit OTP code
   */
  private static generateOtpCode(): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < this.OTP_LENGTH; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  /**
   * Hash OTP code using bcrypt
   */
  private static async hashOtpCode(code: string): Promise<string> {
    return bcrypt.hash(code, 10);
  }

  /**
   * Verify OTP code against hashed value
   */
  private static async verifyOtpCode(code: string, hashedCode: string): Promise<boolean> {
    return bcrypt.compare(code, hashedCode);
  }

  /**
   * Mask phone number for display (e.g., "+2783XXXXX16")
   */
  private static maskPhoneNumber(phone: string): string {
    if (phone.length <= 6) return '***';
    return `${phone.substring(0, phone.length - 8)}XXXXX${phone.substring(phone.length - 2)}`;
  }

  /**
   * Check if user has exceeded rate limits
   */
  private static async checkRateLimit(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        otpLastSentAt: true,
        otpAttempts: true,
      },
    });

    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }

    // Check if user is locked out due to too many failed attempts
    if (user.otpAttempts >= this.MAX_OTP_ATTEMPTS) {
      if (user.otpLastSentAt) {
        const lockoutEnd = new Date(user.otpLastSentAt.getTime() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000);
        if (new Date() < lockoutEnd) {
          const minutesRemaining = Math.ceil((lockoutEnd.getTime() - Date.now()) / 60000);
          return {
            allowed: false,
            reason: `Too many failed attempts. Please try again in ${minutesRemaining} minutes.`
          };
        }
      }
    }

    // Check rate limiting (max 3 OTP requests per 15 minutes)
    if (user.otpLastSentAt) {
      const rateLimitWindow = new Date(Date.now() - this.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
      if (user.otpLastSentAt > rateLimitWindow) {
        // Count recent OTP requests (this is simplified - in production, track in separate table)
        return {
          allowed: false,
          reason: 'Too many OTP requests. Please wait a few minutes before trying again.',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Generate and send OTP to user's phone
   */
  static async generateAndSendOtp(
    policyNumber: string,
    phoneNumber: string
  ): Promise<OtpGenerationResult> {
    try {
      // 1. Find user by policy number and phone
      const policy = await db.policy.findUnique({
        where: { policyNumber },
        include: { user: true },
      });

      if (!policy) {
        return {
          success: false,
          message: 'Policy not found',
          error: 'POLICY_NOT_FOUND',
        };
      }

      const user = policy.user;

      // Normalize and validate phone number match
      const normalizedUserPhone = user.phone?.startsWith('0')
        ? `+27${user.phone.substring(1)}`
        : user.phone;

      if (normalizedUserPhone !== phoneNumber) {
        return {
          success: false,
          message: 'Phone number does not match policy records',
          error: 'PHONE_MISMATCH',
        };
      }

      // 2. Check rate limits
      const rateLimitCheck = await this.checkRateLimit(user.id);
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          message: rateLimitCheck.reason || 'Rate limit exceeded',
          error: 'RATE_LIMIT_EXCEEDED',
        };
      }

      // 3. Generate OTP code
      const otpCode = this.generateOtpCode();
      const hashedOtp = await this.hashOtpCode(otpCode);
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // 4. Save OTP to database
      await db.user.update({
        where: { id: user.id },
        data: {
          otpCode: hashedOtp,
          otpExpiresAt: expiresAt,
          otpLastSentAt: new Date(),
          otpAttempts: 0, // Reset attempts on new OTP
        },
      });

      // 5. Send OTP via SMS
      const smsMessage = `Your Lalisure Insurance verification code is: ${otpCode}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes. Do not share this code.`;

      const smsResult = await SmsService.sendSms(phoneNumber, smsMessage);

      if (!smsResult.success) {
        console.error('Failed to send OTP SMS:', smsResult.error);
        return {
          success: false,
          message: 'Failed to send verification code. Please try again.',
          error: 'SMS_DELIVERY_FAILED',
        };
      }

      return {
        success: true,
        message: `Verification code sent to ${this.maskPhoneNumber(phoneNumber)}`,
        maskedPhone: this.maskPhoneNumber(phoneNumber),
        expiresAt,
      };

    } catch (error) {
      console.error('OTP generation error:', error);
      return {
        success: false,
        message: 'Failed to generate verification code. Please try again later.',
        error: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Verify OTP code provided by user
   */
  static async verifyOtp(
    policyNumber: string,
    phoneNumber: string,
    otpCode: string
  ): Promise<OtpVerificationResult> {
    try {
      // 1. Find user by policy number
      const policy = await db.policy.findUnique({
        where: { policyNumber },
        include: { user: true },
      });

      if (!policy) {
        return {
          success: false,
          message: 'Policy not found',
          error: 'POLICY_NOT_FOUND',
        };
      }

      const user = policy.user;

      // Verify phone number matches
      const normalizedUserPhone = user.phone?.startsWith('0')
        ? `+27${user.phone.substring(1)}`
        : user.phone;

      if (normalizedUserPhone !== phoneNumber) {
        return {
          success: false,
          message: 'Phone number does not match policy records',
          error: 'PHONE_MISMATCH',
        };
      }

      // 2. Check if OTP exists and hasn't expired
      if (!user.otpCode || !user.otpExpiresAt) {
        return {
          success: false,
          message: 'No verification code found. Please request a new code.',
          error: 'OTP_NOT_FOUND',
        };
      }

      if (new Date() > user.otpExpiresAt) {
        return {
          success: false,
          message: 'Verification code has expired. Please request a new code.',
          error: 'OTP_EXPIRED',
        };
      }

      // 3. Check if user has exceeded max attempts
      if (user.otpAttempts >= this.MAX_OTP_ATTEMPTS) {
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new verification code.',
          error: 'MAX_ATTEMPTS_EXCEEDED',
        };
      }

      // 4. Verify the OTP code
      const isValid = await this.verifyOtpCode(otpCode, user.otpCode);

      if (!isValid) {
        // Increment failed attempts
        await db.user.update({
          where: { id: user.id },
          data: {
            otpAttempts: user.otpAttempts + 1,
          },
        });

        const attemptsRemaining = this.MAX_OTP_ATTEMPTS - (user.otpAttempts + 1);

        return {
          success: false,
          message: `Invalid verification code. ${attemptsRemaining} attempts remaining.`,
          attemptsRemaining,
          error: 'INVALID_OTP',
        };
      }

      // 5. OTP is valid - clear OTP data and mark phone as verified
      await db.user.update({
        where: { id: user.id },
        data: {
          otpCode: null,
          otpExpiresAt: null,
          otpAttempts: 0,
          otpLastSentAt: null,
          phoneVerified: true,
          lastLoginAt: new Date(),
        },
      });

      return {
        success: true,
        userId: user.id,
        message: 'Verification successful',
      };

    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again later.',
        error: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Clean up expired OTP codes (run as cron job)
   */
  static async cleanupExpiredOtps(): Promise<number> {
    try {
      const result = await db.user.updateMany({
        where: {
          otpExpiresAt: {
            lt: new Date(),
          },
          otpCode: {
            not: null,
          },
        },
        data: {
          otpCode: null,
          otpExpiresAt: null,
        },
      });

      return result.count;
    } catch (error) {
      console.error('OTP cleanup error:', error);
      return 0;
    }
  }
}
