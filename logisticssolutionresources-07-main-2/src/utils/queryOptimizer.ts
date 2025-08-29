import { QueryClient } from '@tanstack/react-query';

/**
 * Optimized query client configuration for better development experience
 * and improved error handling
 */
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Reduce aggressive refetching in development
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retryOnMount: false,
        retry: (failureCount, error: any) => {
          // Don't retry 400/403 errors (permissions/RLS)
          if (error?.status === 400 || error?.status === 403) {
            return false;
          }
          // Only retry network errors up to 2 times
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: (failureCount, error: any) => {
          // Never retry mutations with 400/403 errors
          if (error?.status === 400 || error?.status === 403) {
            return false;
          }
          return failureCount < 1;
        },
      },
    },
  });
};