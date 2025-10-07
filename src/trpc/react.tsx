'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

import { type AppRouter } from '@/server/api/root';

export const trpc = createTRPCReact<AppRouter>();
export const api = trpc; // alias for backwards compatibility

export function TRPCReactProvider(props: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: Data is considered fresh for 30 seconds
        staleTime: 30 * 1000,
        // Cache time: Inactive queries are garbage collected after 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests once before showing error
        retry: 1,
        // Don't refetch on window focus for better UX
        refetchOnWindowFocus: false,
        // Refetch on reconnect for data consistency
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once on network errors
        retry: 1,
      },
    },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </trpc.Provider>
    </QueryClientProvider>
  );
}