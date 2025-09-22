import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/trpc/react';

export const useCurrentUser = () => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  
  const { data: dbUser, isLoading: dbLoading, error } = api.user.getCurrentUser.useQuery(
    undefined,
    {
      enabled: clerkLoaded && !!clerkUser,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  return {
    user: dbUser,
    clerkUser,
    isLoading: !clerkLoaded || dbLoading,
    error,
    isLoaded: clerkLoaded && !dbLoading,
  };
};
