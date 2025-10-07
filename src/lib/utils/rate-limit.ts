/**
 * Rate Limiting Utility
 * Implements token bucket algorithm for API rate limiting
 */

interface RateLimitStore {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitStore>();

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed per window
   */
  maxRequests: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  /**
   * Optional message to return when rate limit is exceeded
   */
  message?: string;
}

/**
 * Rate limiter using token bucket algorithm
 * @param identifier - Unique identifier for the client (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Object with success status and remaining tokens
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetAt: number; message?: string } {
  const now = Date.now();
  const { maxRequests, windowMs, message } = config;

  // Get or create rate limit entry
  let entry = store.get(identifier);

  if (!entry) {
    entry = {
      tokens: maxRequests,
      lastRefill: now,
    };
    store.set(identifier, entry);
  }

  // Calculate how many tokens to refill based on time passed
  const timePassed = now - entry.lastRefill;
  const tokensToAdd = Math.floor((timePassed / windowMs) * maxRequests);

  if (tokensToAdd > 0) {
    entry.tokens = Math.min(maxRequests, entry.tokens + tokensToAdd);
    entry.lastRefill = now;
  }

  // Check if request can be processed
  if (entry.tokens > 0) {
    entry.tokens--;
    return {
      success: true,
      remaining: entry.tokens,
      resetAt: entry.lastRefill + windowMs,
    };
  }

  // Rate limit exceeded
  return {
    success: false,
    remaining: 0,
    resetAt: entry.lastRefill + windowMs,
    message: message || 'Too many requests. Please try again later.',
  };
}

/**
 * Predefined rate limit configurations for different endpoint types
 */
export const RateLimitPresets = {
  // Strict limits for authentication endpoints
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  // Standard API limits
  API: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'API rate limit exceeded. Please try again later.',
  },
  // Generous limits for read operations
  READ: {
    maxRequests: 200,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests. Please slow down.',
  },
  // Strict limits for write operations
  WRITE: {
    maxRequests: 30,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many write requests. Please try again later.',
  },
  // Very strict for sensitive operations (e.g., password reset)
  SENSITIVE: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many attempts. Please try again in 1 hour.',
  },
} as const;

/**
 * Get client identifier from request
 * Uses IP address and user agent for fingerprinting
 */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Create a simple hash of IP + User Agent
  const identifier = `${ip}-${userAgent}`;
  return identifier;
}

/**
 * Cleanup old entries from the store (should be called periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [key, entry] of store.entries()) {
    if (now - entry.lastRefill > maxAge) {
      store.delete(key);
    }
  }
}

// Cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60 * 60 * 1000);
}

