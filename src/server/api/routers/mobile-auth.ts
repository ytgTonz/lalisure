/**
 * Mobile Authentication tRPC Router (V2)
 *
 * Handles OTP-based authentication for mobile users.
 * Flow: Policy Verification → OTP Request → OTP Verification → Session Creation
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { OtpService } from '@/lib/services/otp';
import {
  createMobileSession,
  getMobileSessionFromRequest,
  refreshMobileSession,
  revokeMobileSessionByToken,
  getClientIp,
} from '@/lib/auth/mobile-session';
import {
  policyVerificationSchema,
  otpRequestSchema,
  otpVerificationSchema,
  mobileSessionRefreshSchema,
  mobileLogoutSchema,
} from '@/lib/validations/mobile-auth';
import { SecurityLogger } from '@/lib/services/security-logger';
import { db } from '@/lib/db';

export const mobileAuthRouter = createTRPCRouter({
  /**
   * Step 1: Verify Policy Number and Phone Number
   * Returns masked phone number if policy and phone match
   */
  verifyPolicy: publicProcedure
    .input(policyVerificationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { policyNumber, phoneNumber } = input;

        // Find policy and user
        const policy = await ctx.db.policy.findUnique({
          where: { policyNumber },
          include: { user: true },
        });

        if (!policy) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Policy not found. Please check your policy number.',
          });
        }

        // Normalize phone numbers for comparison
        const normalizedUserPhone = policy.user.phone?.startsWith('0')
          ? `+27${policy.user.phone.substring(1)}`
          : policy.user.phone;

        if (normalizedUserPhone !== phoneNumber) {
          // Log failed attempt
          await SecurityLogger.logEvent({
            type: 'FAILED_LOGIN',
            severity: 'MEDIUM',
            userId: policy.user.id,
            details: {
              reason: 'Phone number mismatch',
              policyNumber,
              attemptedPhone: phoneNumber.substring(0, 8) + 'XXXXX',
            },
          });

          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Phone number does not match our records for this policy.',
          });
        }

        // Check if user account is active
        if (policy.user.status !== 'ACTIVE') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'This account is not active. Please contact support.',
          });
        }

        // Mask phone number for display
        const maskedPhone = phoneNumber.substring(0, phoneNumber.length - 8) +
          'XXXXX' + phoneNumber.substring(phoneNumber.length - 2);

        return {
          success: true,
          message: 'Policy verified successfully',
          maskedPhone,
          policyholderName: `${policy.user.firstName || ''} ${policy.user.lastName || ''}`.trim(),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Policy verification error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify policy. Please try again later.',
        });
      }
    }),

  /**
   * Step 2: Request OTP Code
   * Generates and sends OTP via SMS
   */
  requestOtp: publicProcedure
    .input(otpRequestSchema)
    .mutation(async ({ input }) => {
      try {
        const { policyNumber, phoneNumber } = input;

        const result = await OtpService.generateAndSendOtp(policyNumber, phoneNumber);

        if (!result.success) {
          throw new TRPCError({
            code: result.error === 'RATE_LIMIT_EXCEEDED' ? 'TOO_MANY_REQUESTS' : 'BAD_REQUEST',
            message: result.message,
          });
        }

        return {
          success: true,
          message: result.message,
          maskedPhone: result.maskedPhone,
          expiresAt: result.expiresAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('OTP request error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send verification code. Please try again later.',
        });
      }
    }),

  /**
   * Step 3: Verify OTP and Create Session
   * Validates OTP code and creates 30-day mobile session
   */
  verifyOtp: publicProcedure
    .input(otpVerificationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { policyNumber, phoneNumber, otpCode, deviceInfo } = input;

        // Verify OTP
        const verificationResult = await OtpService.verifyOtp(
          policyNumber,
          phoneNumber,
          otpCode
        );

        if (!verificationResult.success) {
          // Log failed verification attempt
          await SecurityLogger.logEvent({
            type: 'FAILED_LOGIN',
            severity: 'MEDIUM',
            details: {
              reason: verificationResult.error,
              policyNumber,
              attemptsRemaining: verificationResult.attemptsRemaining,
            },
          });

          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: verificationResult.message,
          });
        }

        // Get IP address from request
        const ipAddress = getClientIp(ctx.req as any) || deviceInfo?.ipAddress;

        // Create mobile session
        const sessionResult = await createMobileSession(verificationResult.userId!, {
          ipAddress,
          userAgent: deviceInfo?.userAgent,
        });

        // Get user details
        const user = await ctx.db.user.findUnique({
          where: { id: verificationResult.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        });

        // Log successful login
        await SecurityLogger.logEvent({
          type: 'LOGIN',
          severity: 'LOW',
          userId: verificationResult.userId,
          details: {
            method: 'OTP',
            policyNumber,
            ipAddress,
            userAgent: deviceInfo?.userAgent,
          },
        });

        return {
          success: true,
          message: 'Login successful',
          session: {
            token: sessionResult.token,
            expiresAt: sessionResult.expiresAt,
          },
          user: {
            id: user!.id,
            email: user!.email,
            firstName: user!.firstName,
            lastName: user!.lastName,
            phone: user!.phone,
            role: user!.role,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('OTP verification error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Verification failed. Please try again later.',
        });
      }
    }),

  /**
   * Refresh Mobile Session
   * Extends session by another 30 days
   */
  refreshSession: publicProcedure
    .input(mobileSessionRefreshSchema)
    .mutation(async ({ input }) => {
      try {
        const { sessionToken } = input;

        const refreshResult = await refreshMobileSession(sessionToken);

        if (!refreshResult) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Session expired or invalid. Please log in again.',
          });
        }

        return {
          success: true,
          message: 'Session refreshed successfully',
          session: {
            token: refreshResult.token,
            expiresAt: refreshResult.expiresAt,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Session refresh error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to refresh session. Please try again later.',
        });
      }
    }),

  /**
   * Logout (Revoke Session)
   * Invalidates mobile session token
   */
  logout: publicProcedure
    .input(mobileLogoutSchema)
    .mutation(async ({ input }) => {
      try {
        const { sessionToken } = input;

        await revokeMobileSessionByToken(sessionToken);

        return {
          success: true,
          message: 'Logged out successfully',
        };
      } catch (error) {
        console.error('Logout error:', error);
        // Don't throw error on logout - always return success
        return {
          success: true,
          message: 'Logged out successfully',
        };
      }
    }),

  /**
   * Get Current Session Info
   * Returns user data and session expiry for logged-in mobile users
   */
  getSession: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        // Create a mock request object with the session token
        const mockRequest = {
          cookies: {
            get: (name: string) => ({ value: input.sessionToken }),
          },
          headers: {
            get: () => null,
          },
        } as any;

        const session = await getMobileSessionFromRequest(mockRequest);

        if (!session) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Session invalid or expired',
          });
        }

        return {
          user: session.user,
          expiresAt: session.expiresAt,
          issuedAt: session.issuedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Get session error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve session information',
        });
      }
    }),
});
