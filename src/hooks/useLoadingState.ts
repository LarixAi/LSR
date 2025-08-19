import { useState, useCallback } from 'react';

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  onSuccess?: (data?: any) => void;
  onError?: (error: Error) => void;
}

export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const { initialLoading = false, onSuccess, onError } = options;
  
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async <T>(
    asyncOperation: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncOperation();
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
    isIdle: !loading && !error
  };
};