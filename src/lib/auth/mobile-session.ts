/**
 * Mobile Session Management for V2
 *
 * Handles 30-day JWT-based sessions for mobile users who authenticate via OTP.
 * - Sessions are stored in the database and validated on each request
 * - Automatic expiry after 30 days
 * - IP address tracking for security
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

const MOBILE_SESSION_COOKIE = 'mobile-session';
const SESSION_DURATION_DAYS = 30;

export interface MobileUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
}

export interface MobileSession {
  user: MobileUser;
  sessionToken: string;
  expiresAt: Date;
  issuedAt: Date;
}

export interface CreateSessionOptions {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create a new 30-day mobile session token
 */
export async function createMobileSession(
  userId: string,
  options?: { ipAddress?: string; userAgent?: string }
): Promise<{ token: string; expiresAt: Date }> {
  try {
    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate expiry (30 days from now)
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

    // Create JWT token
    const token = await new SignJWT({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
      type: 'mobile_session',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresAt)
      .sign(JWT_SECRET);

    // Store session token in database
    await db.user.update({
      where: { id: userId },
      data: {
        mobileSessionToken: token,
        mobileSessionExpiry: expiresAt,
        lastLoginAt: new Date(),
        lastLoginIp: options?.ipAddress || null,
      },
    });

    return { token, expiresAt };
  } catch (error) {
    console.error('Failed to create mobile session:', error);
    throw new Error('Session creation failed');
  }
}

/**
 * Verify and retrieve mobile session from token
 */
export async function verifyMobileSession(token: string): Promise<MobileSession | null> {
  try {
    // 1. Verify JWT signature and expiry
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.type !== 'mobile_session') {
      return null;
    }

    const user = payload.user as MobileUser;

    // 2. Check if session exists in database and hasn't been revoked
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        mobileSessionToken: true,
        mobileSessionExpiry: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    if (!dbUser) {
      return null;
    }

    // Check if user account is active
    if (dbUser.status !== 'ACTIVE') {
      return null;
    }

    // Check if session token matches and hasn't expired
    if (dbUser.mobileSessionToken !== token) {
      return null;
    }

    if (!dbUser.mobileSessionExpiry || new Date() > dbUser.mobileSessionExpiry) {
      return null;
    }

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        phone: dbUser.phone,
        role: dbUser.role,
      },
      sessionToken: token,
      expiresAt: dbUser.mobileSessionExpiry,
      issuedAt: new Date(payload.iat! * 1000),
    };
  } catch (error) {
    console.error('Mobile session verification failed:', error);
    return null;
  }
}

/**
 * Get mobile session from cookies (server-side)
 */
export async function getMobileSession(): Promise<MobileSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(MOBILE_SESSION_COOKIE)?.value;

    if (!token) {
      return null;
    }

    return await verifyMobileSession(token);
  } catch (error) {
    console.error('Failed to get mobile session from cookies:', error);
    return null;
  }
}

/**
 * Get mobile session from request (middleware)
 */
export async function getMobileSessionFromRequest(
  request: NextRequest
): Promise<MobileSession | null> {
  try {
    const token = request.cookies.get(MOBILE_SESSION_COOKIE)?.value;

    if (!token) {
      // Also check Authorization header for mobile API requests
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const bearerToken = authHeader.substring(7);
        return await verifyMobileSession(bearerToken);
      }
      return null;
    }

    return await verifyMobileSession(token);
  } catch (error) {
    console.error('Failed to get mobile session from request:', error);
    return null;
  }
}

/**
 * Set mobile session cookie (server-side)
 */
export async function setMobileSessionCookie(token: string, expiresAt: Date) {
  try {
    const cookieStore = await cookies();

    cookieStore.set(MOBILE_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });
  } catch (error) {
    console.error('Failed to set mobile session cookie:', error);
  }
}

/**
 * Refresh mobile session (extend by another 30 days)
 */
export async function refreshMobileSession(
  currentToken: string
): Promise<{ token: string; expiresAt: Date } | null> {
  try {
    const session = await verifyMobileSession(currentToken);

    if (!session) {
      return null;
    }

    // Create new session with fresh 30-day expiry
    return await createMobileSession(session.user.id);
  } catch (error) {
    console.error('Failed to refresh mobile session:', error);
    return null;
  }
}

/**
 * Revoke mobile session (logout)
 */
export async function revokeMobileSession(userId: string): Promise<void> {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        mobileSessionToken: null,
        mobileSessionExpiry: null,
      },
    });

    // Clear cookie
    const cookieStore = await cookies();
    cookieStore.delete(MOBILE_SESSION_COOKIE);
  } catch (error) {
    console.error('Failed to revoke mobile session:', error);
    throw new Error('Session revocation failed');
  }
}

/**
 * Revoke mobile session by token
 */
export async function revokeMobileSessionByToken(token: string): Promise<void> {
  try {
    const session = await verifyMobileSession(token);

    if (!session) {
      return;
    }

    await revokeMobileSession(session.user.id);
  } catch (error) {
    console.error('Failed to revoke mobile session by token:', error);
    throw new Error('Session revocation failed');
  }
}

/**
 * Clean up expired sessions (run as cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await db.user.updateMany({
      where: {
        mobileSessionExpiry: {
          lt: new Date(),
        },
        mobileSessionToken: {
          not: null,
        },
      },
      data: {
        mobileSessionToken: null,
        mobileSessionExpiry: null,
      },
    });

    return result.count;
  } catch (error) {
    console.error('Session cleanup error:', error);
    return 0;
  }
}

/**
 * Check if route is a mobile-authenticated route
 */
export function isMobileRoute(pathname: string): boolean {
  // Mobile routes use /mobile/* prefix
  return pathname.startsWith('/mobile/');
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string | undefined {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    undefined
  );
}
