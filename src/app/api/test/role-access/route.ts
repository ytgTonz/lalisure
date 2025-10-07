/**
 * Role-Based Access Control Testing Endpoint
 * Tests authentication and authorization for different user roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStaffSessionFromRequest } from '@/lib/auth/staff-auth';
import { createSecureResponse } from '@/lib/utils/security-headers';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check for staff session first
    const staffSession = await getStaffSessionFromRequest(request);
    
    if (staffSession) {
      return createSecureResponse(
        JSON.stringify({
          authenticated: true,
          authMethod: 'STAFF_JWT',
          user: {
            id: staffSession.user.id,
            email: staffSession.user.email,
            role: staffSession.user.role,
            name: `${staffSession.user.firstName} ${staffSession.user.lastName}`,
          },
          sessionExpires: staffSession.expires.toISOString(),
          accessLevel: getAccessLevel(staffSession.user.role),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check for Clerk session
    const { userId } = await auth();
    
    if (userId) {
      // Get user from database
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      if (user) {
        return createSecureResponse(
          JSON.stringify({
            authenticated: true,
            authMethod: 'CLERK',
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              name: `${user.firstName} ${user.lastName}`,
            },
            accessLevel: getAccessLevel(user.role),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // No authentication found
    return createSecureResponse(
      JSON.stringify({
        authenticated: false,
        message: 'No valid authentication found',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Role access test error:', error);
    
    return createSecureResponse(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Get access level description for a role
 */
function getAccessLevel(role: string): {
  role: string;
  permissions: string[];
  canAccess: string[];
} {
  switch (role) {
    case 'ADMIN':
      return {
        role: 'Administrator',
        permissions: [
          'Full system access',
          'User management',
          'System configuration',
          'View all data',
          'Approve/reject policies',
          'Manage claims',
        ],
        canAccess: ['/admin/*', '/api/admin/*', '/api/trpc/admin.*'],
      };
    
    case 'AGENT':
      return {
        role: 'Insurance Agent',
        permissions: [
          'Create policies',
          'Manage assigned customers',
          'Process claims',
          'View customer data',
        ],
        canAccess: ['/agent/*', '/api/agent/*', '/api/trpc/agent.*'],
      };
    
    case 'UNDERWRITER':
      return {
        role: 'Underwriter',
        permissions: [
          'Review policy applications',
          'Risk assessment',
          'Approve/reject policies',
          'View applicant data',
        ],
        canAccess: ['/underwriter/*', '/api/underwriter/*', '/api/trpc/underwriter.*'],
      };
    
    case 'CUSTOMER':
    default:
      return {
        role: 'Customer',
        permissions: [
          'View own policies',
          'Submit claims',
          'Make payments',
          'Update profile',
        ],
        canAccess: ['/customer/*', '/api/customer/*', '/api/trpc/user.*'],
      };
  }
}

