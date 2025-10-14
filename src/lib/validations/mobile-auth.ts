import { z } from 'zod';

/**
 * Mobile Authentication Validation Schemas for V2
 *
 * These schemas validate the OTP-based authentication flow for mobile users.
 * Users authenticate using their policy number + phone verification.
 */

// South African phone number validation (10 digits starting with 0, or +27)
const phoneNumberRegex = /^(?:\+27|0)[1-9][0-9]{8}$/;

export const policyVerificationSchema = z.object({
  policyNumber: z
    .string()
    .min(1, 'Policy number is required')
    .regex(/^POL-/, 'Invalid policy number format'),

  phoneNumber: z
    .string()
    .regex(phoneNumberRegex, 'Invalid South African phone number format')
    .transform((val) => {
      // Normalize to +27 format
      if (val.startsWith('0')) {
        return `+27${val.substring(1)}`;
      }
      return val;
    }),
});

export const otpRequestSchema = z.object({
  policyNumber: z
    .string()
    .min(1, 'Policy number is required')
    .regex(/^POL-/, 'Invalid policy number format'),

  phoneNumber: z
    .string()
    .regex(phoneNumberRegex, 'Invalid phone number format')
    .transform((val) => {
      // Normalize to +27 format
      if (val.startsWith('0')) {
        return `+27${val.substring(1)}`;
      }
      return val;
    }),
});

export const otpVerificationSchema = z.object({
  policyNumber: z
    .string()
    .min(1, 'Policy number is required'),

  phoneNumber: z
    .string()
    .regex(phoneNumberRegex, 'Invalid phone number format')
    .transform((val) => {
      // Normalize to +27 format
      if (val.startsWith('0')) {
        return `+27${val.substring(1)}`;
      }
      return val;
    }),

  otpCode: z
    .string()
    .length(6, 'OTP code must be 6 digits')
    .regex(/^\d{6}$/, 'OTP code must contain only numbers'),

  deviceInfo: z.object({
    userAgent: z.string().optional(),
    platform: z.string().optional(),
    ipAddress: z.string().optional(),
  }).optional(),
});

export const mobileSessionRefreshSchema = z.object({
  sessionToken: z
    .string()
    .min(1, 'Session token is required'),
});

export const mobileLogoutSchema = z.object({
  sessionToken: z
    .string()
    .min(1, 'Session token is required'),
});

// Type exports
export type PolicyVerificationInput = z.infer<typeof policyVerificationSchema>;
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;
export type MobileSessionRefreshInput = z.infer<typeof mobileSessionRefreshSchema>;
export type MobileLogoutInput = z.infer<typeof mobileLogoutSchema>;
