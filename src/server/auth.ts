import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
} 

export async function createUserIfNotExists(clerkUser: ClerkUser) {
  try {
    const existingUser = await db.user.findUnique({
      where: {
        clerkId: clerkUser.id,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    const newUser = await db.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        avatar: clerkUser.imageUrl || null,
        role: UserRole.CUSTOMER,
      },
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function hasRole(requiredRole: UserRole) {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.CUSTOMER]: 1,
    [UserRole.AGENT]: 2,
    [UserRole.UNDERWRITER]: 3,
    [UserRole.ADMIN]: 4,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  return userId;
}

export async function requireRole(requiredRole: UserRole) {
  await requireAuth();
  
  const hasPermission = await hasRole(requiredRole);
  
  if (!hasPermission) {
    throw new Error('Insufficient permissions');
  }
}