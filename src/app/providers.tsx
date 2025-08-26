'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { api } from '@/trpc/server';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}

export default api.withTRPC(Providers);