'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { UserRole } from '@prisma/client';
import { api } from '@/trpc/react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallbackRoute?: string;
}

export function RoleGuard({ allowedRoles, children, fallbackRoute }: RoleGuardProps) {
  const { user, isLoaded: clerkLoaded } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Try to get user info from TRPC (which handles both Clerk and staff auth)
  const { data: userData, isLoading: userLoading } = api.user.getProfile.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });


  useEffect(() => {
    // Wait for both Clerk and TRPC to finish loading
    if (clerkLoaded && !userLoading) {
      setIsChecking(false);
      
      // Determine user role - prefer TRPC data (handles staff auth) over Clerk
      const userRole = userData?.role || user?.publicMetadata?.role as UserRole;
      
      if (userRole && !allowedRoles.includes(userRole)) {
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
  }, [clerkLoaded, userLoading, userData, user, allowedRoles, router, fallbackRoute]);

  // Show loading state while checking roles
  if (isChecking || !clerkLoaded || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-stone-700"></div>
      </div>
    );
  }

  // Determine user role - prefer TRPC data over Clerk
  const userRole = userData?.role || user?.publicMetadata?.role as UserRole;
  
  // If user doesn't have required role, show loading (will redirect)
  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-stone-700"></div>
      </div>
    );
  }

  // User has required role, show content
  return <>{children}</>;
}