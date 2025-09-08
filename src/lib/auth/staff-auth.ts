import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

const STAFF_SESSION_COOKIE = 'staff-session';

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface StaffSession {
  user: StaffUser;
  expires: Date;
}

// Create JWT token for staff user
export async function createStaffToken(user: StaffUser): Promise<string> {
  return await new SignJWT({ 
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

// Verify JWT token and return staff session
export async function verifyStaffToken(token: string): Promise<StaffSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = payload.user as StaffUser;
    
    // Check if token is for staff role
    if (!['ADMIN', 'AGENT', 'UNDERWRITER'].includes(user.role)) {
      return null;
    }

    return {
      user,
      expires: new Date(payload.exp! * 1000),
    };
  } catch (error) {
    return null;
  }
}

// Get current staff session from cookies
export async function getStaffSession(): Promise<StaffSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_SESSION_COOKIE)?.value;
  
  if (!token) {
    return null;
  }

  return await verifyStaffToken(token);
}

// Get staff session from request (for middleware)
export async function getStaffSessionFromRequest(request: NextRequest): Promise<StaffSession | null> {
  const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
  
  if (!token) {
    return null;
  }

  return await verifyStaffToken(token);
}

// Set staff session cookie
export async function setStaffSession(user: StaffUser) {
  const token = await createStaffToken(user);
  const cookieStore = await cookies();
  
  cookieStore.set(STAFF_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
}

// Clear staff session cookie
export async function clearStaffSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_SESSION_COOKIE);
}

// Hash password for staff users
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Verify password for staff users
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Check if user has required staff role
export function hasStaffRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

// Check if route is for staff (admin, agent, underwriter)
export function isStaffRoute(pathname: string): boolean {
  return /^\/(admin|agent|underwriter)/.test(pathname);
}

// Check if route is for customers
export function isCustomerRoute(pathname: string): boolean {
  return /^\/customer/.test(pathname);
}