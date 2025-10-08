/**
 * Cache Utilities
 *
 * Provides caching utilities for improving performance across the application.
 * Uses Next.js unstable_cache for API routes and server components.
 */

import { unstable_cache } from 'next/cache';

/**
 * Cache durations in seconds
 */
export const CACHE_DURATIONS = {
  /** 5 seconds - For rapidly changing data */
  REALTIME: 5,
  /** 30 seconds - For frequently accessed data with moderate changes */
  SHORT: 30,
  /** 5 minutes - For user-specific data */
  MEDIUM: 300,
  /** 30 minutes - For relatively static data */
  LONG: 1800,
  /** 24 hours - For very static data */
  DAY: 86400,
} as const;

/**
 * Cache tag categories for invalidation
 */
export const CACHE_TAGS = {
  USER: (userId: string) => `user:${userId}`,
  POLICY: (policyId: string) => `policy:${policyId}`,
  POLICIES_USER: (userId: string) => `policies:user:${userId}`,
  CLAIM: (claimId: string) => `claim:${claimId}`,
  CLAIMS_USER: (userId: string) => `claims:user:${userId}`,
  CLAIMS_POLICY: (policyId: string) => `claims:policy:${policyId}`,
  PAYMENT: (paymentId: string) => `payment:${paymentId}`,
  PAYMENTS_POLICY: (policyId: string) => `payments:policy:${policyId}`,
  NOTIFICATION: (userId: string) => `notifications:${userId}`,
  EMAIL_TEMPLATE: (templateId: string) => `email-template:${templateId}`,
  EMAIL_TEMPLATES: 'email-templates:all',
  SYSTEM_SETTINGS: 'system-settings',
} as const;

/**
 * Creates a cached function with specified tags and revalidation time
 *
 * @example
 * ```typescript
 * const getCachedUser = createCachedFunction(
 *   async (userId: string) => {
 *     return await db.user.findUnique({ where: { id: userId } });
 *   },
 *   {
 *     tags: (userId) => [CACHE_TAGS.USER(userId)],
 *     revalidate: CACHE_DURATIONS.MEDIUM,
 *   }
 * );
 * ```
 */
export function createCachedFunction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: {
    tags?: (...args: TArgs) => string[] | string;
    revalidate?: number;
  }
) {
  return unstable_cache(
    fn,
    undefined,
    {
      tags: typeof options.tags === 'function' ? undefined : options.tags ? [options.tags] : undefined,
      revalidate: options.revalidate,
    }
  );
}

/**
 * Cache configuration presets for common use cases
 */
export const CACHE_PRESETS = {
  /** User profile data - 5 minutes, tagged by user ID */
  USER_PROFILE: {
    revalidate: CACHE_DURATIONS.MEDIUM,
    getTags: (userId: string) => [CACHE_TAGS.USER(userId)],
  },

  /** User's policies list - 5 minutes, tagged by user */
  USER_POLICIES: {
    revalidate: CACHE_DURATIONS.MEDIUM,
    getTags: (userId: string) => [CACHE_TAGS.POLICIES_USER(userId)],
  },

  /** Single policy details - 30 minutes, tagged by policy ID */
  POLICY_DETAILS: {
    revalidate: CACHE_DURATIONS.LONG,
    getTags: (policyId: string) => [CACHE_TAGS.POLICY(policyId)],
  },

  /** User's claims - 30 seconds, tagged by user */
  USER_CLAIMS: {
    revalidate: CACHE_DURATIONS.SHORT,
    getTags: (userId: string) => [CACHE_TAGS.CLAIMS_USER(userId)],
  },

  /** Email templates - 30 minutes, system-wide */
  EMAIL_TEMPLATES: {
    revalidate: CACHE_DURATIONS.LONG,
    getTags: () => [CACHE_TAGS.EMAIL_TEMPLATES],
  },

  /** System settings - 24 hours, system-wide */
  SYSTEM_SETTINGS: {
    revalidate: CACHE_DURATIONS.DAY,
    getTags: () => [CACHE_TAGS.SYSTEM_SETTINGS],
  },

  /** Notifications - 5 seconds, tagged by user (real-time feel) */
  NOTIFICATIONS: {
    revalidate: CACHE_DURATIONS.REALTIME,
    getTags: (userId: string) => [CACHE_TAGS.NOTIFICATION(userId)],
  },
} as const;

/**
 * Helper to invalidate cache by tags
 * Note: This requires Next.js 14+ with revalidateTag
 */
export async function invalidateCacheTags(tags: string[]) {
  const { revalidateTag } = await import('next/cache');
  tags.forEach(tag => revalidateTag(tag));
}

/**
 * Invalidation helpers for common operations
 */
export const invalidateCache = {
  /** Invalidate all user-related caches */
  user: async (userId: string) => {
    await invalidateCacheTags([
      CACHE_TAGS.USER(userId),
      CACHE_TAGS.POLICIES_USER(userId),
      CACHE_TAGS.CLAIMS_USER(userId),
      CACHE_TAGS.NOTIFICATION(userId),
    ]);
  },

  /** Invalidate policy and related caches */
  policy: async (policyId: string, userId: string) => {
    await invalidateCacheTags([
      CACHE_TAGS.POLICY(policyId),
      CACHE_TAGS.POLICIES_USER(userId),
      CACHE_TAGS.CLAIMS_POLICY(policyId),
      CACHE_TAGS.PAYMENTS_POLICY(policyId),
    ]);
  },

  /** Invalidate claim and related caches */
  claim: async (claimId: string, userId: string, policyId: string) => {
    await invalidateCacheTags([
      CACHE_TAGS.CLAIM(claimId),
      CACHE_TAGS.CLAIMS_USER(userId),
      CACHE_TAGS.CLAIMS_POLICY(policyId),
    ]);
  },

  /** Invalidate payment and related caches */
  payment: async (paymentId: string, policyId: string) => {
    await invalidateCacheTags([
      CACHE_TAGS.PAYMENT(paymentId),
      CACHE_TAGS.PAYMENTS_POLICY(policyId),
    ]);
  },

  /** Invalidate email templates cache */
  emailTemplates: async () => {
    await invalidateCacheTags([CACHE_TAGS.EMAIL_TEMPLATES]);
  },

  /** Invalidate system settings cache */
  systemSettings: async () => {
    await invalidateCacheTags([CACHE_TAGS.SYSTEM_SETTINGS]);
  },
} as const;
