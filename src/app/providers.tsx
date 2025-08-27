'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { TRPCReactProvider } from '@/trpc/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: 'hsl(221.2 83.2% 53.3%)',
          colorBackground: 'hsl(0 0% 100%)',
          colorText: 'hsl(222.2 84% 4.9%)',
          colorTextSecondary: 'hsl(215.4 16.3% 46.9%)',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'bg-card border border-border shadow-sm',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
        },
      }}
    >
      <TRPCReactProvider>
        {children}
      </TRPCReactProvider>
    </ClerkProvider>
  );
}

export default Providers;