'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { UserRole } from '@prisma/client';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallbackRoute?: string;
}

export function RoleGuard({ allowedRoles, children, fallbackRoute }: RoleGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.publicMetadata?.role as UserRole;
      
      // If user doesn't have required role, redirect them
      if (!allowedRoles.includes(userRole)) {
        // Redirect to their appropriate dashboard or fallback
        if (fallbackRoute) {
          router.push(fallbackRoute);
        } else {
          // Redirect to appropriate dashboard based on their actual role
          if (userRole === 'ADMIN') {
            router.push('/admin/dashboard');
          } else if (userRole === 'AGENT') {
            router.push('/agent/dashboard');
          } else if (userRole === 'UNDERWRITER') {
            router.push('/underwriter/dashboard');
          } else {
            router.push('/customer/dashboard');
          }
        }
        return;
      }
    }
  }, [isLoaded, user, allowedRoles, router, fallbackRoute]);

  // Show loading state while checking roles
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-stone-700"></div>
      </div>
    );
  }

  const userRole = user?.publicMetadata?.role as UserRole;
  
  // If user doesn't have required role, show loading (will redirect)
  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-stone-700"></div>
      </div>
    );
  }

  // User has required role, show content
  return <>{children}</>;
}