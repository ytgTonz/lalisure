'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/services/analytics';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize PostHog
    analytics.init();
  }, []);

  useEffect(() => {
    // Identify user when loaded
    if (isLoaded && user) {
      analytics.identify(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim(),
        first_name: user.firstName,
        last_name: user.lastName,
        avatar: user.imageUrl,
      });
    }
  }, [user, isLoaded]);

  useEffect(() => {
    // Track page views
    analytics.capturePageView();
  }, [pathname]);

  return <>{children}</>;
}