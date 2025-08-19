import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface APICallOptions extends RequestInit {
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export const useAPIOptimization = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cache = useRef<Map<string, CacheEntry<any>>>(new Map());
  const requestQueue = useRef<Map<string, Promise<any>>>(new Map());

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  const getCachedData = useCallback(<T>(key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      cache.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const setCachedData = useCallback(<T>(
    key: string, 
    data: T, 
    duration: number = 5 * 60 * 1000 // 5 minutes default
  ) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    });
  }, []);

  const makeOptimizedAPICall = useCallback(async <T>(
    url: string,
    options: APICallOptions = {}
  ): Promise<T> => {
    const {
      cacheKey,
      cacheDuration = 5 * 60 * 1000, // 5 minutes
      retries = 3,
      retryDelay = 1000,
      timeout = 30000,
      ...fetchOptions
    } = options;

    // Check cache first
    if (cacheKey) {
      const cachedData = getCachedData<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Check if request is already in progress
      const existingRequest = requestQueue.current.get(cacheKey);
      if (existingRequest) {
        return existingRequest;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const executeRequest = async (attempt: number = 1): Promise<T> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful response
        if (cacheKey) {
          setCachedData(cacheKey, data, cacheDuration);
          requestQueue.current.delete(cacheKey);
        }

        return data;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }

        if (attempt < retries) {
          console.warn(`API call failed (attempt ${attempt}/${retries}):`, error.message);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          return executeRequest(attempt + 1);
        }

        throw error;
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    const requestPromise = executeRequest().catch(error => {
      setError(error);
      if (cacheKey) {
        requestQueue.current.delete(cacheKey);
      }
      throw error;
    });

    if (cacheKey) {
      requestQueue.current.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }, [getCachedData, setCachedData]);

  const batchAPIRequests = useCallback(async <T>(
    requests: Array<{
      url: string;
      options?: APICallOptions;
    }>
  ): Promise<T[]> => {
    const promises = requests.map(({ url, options }) => 
      makeOptimizedAPICall<T>(url, options)
    );

    return Promise.all(promises);
  }, [makeOptimizedAPICall]);

  const createRateLimitedRequest = useCallback((
    requestsPerSecond: number
  ) => {
    const queue: Array<() => Promise<any>> = [];
    let isProcessing = false;
    const interval = 1000 / requestsPerSecond;

    const processQueue = async () => {
      if (isProcessing || queue.length === 0) return;

      isProcessing = true;
      const request = queue.shift();
      
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Rate limited request failed:', error);
        }
        
        setTimeout(() => {
          isProcessing = false;
          processQueue();
        }, interval);
      } else {
        isProcessing = false;
      }
    };

    return <T>(url: string, options?: APICallOptions): Promise<T> => {
      return new Promise((resolve, reject) => {
        queue.push(async () => {
          try {
            const result = await makeOptimizedAPICall<T>(url, options);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        
        processQueue();
      });
    };
  }, [makeOptimizedAPICall]);

  const prefetchData = useCallback(async (
    requests: Array<{
      url: string;
      cacheKey: string;
      options?: APICallOptions;
    }>
  ) => {
    const prefetchPromises = requests.map(({ url, cacheKey, options }) =>
      makeOptimizedAPICall(url, { ...options, cacheKey })
        .catch(error => {
          console.warn(`Prefetch failed for ${cacheKey}:`, error);
          return null;
        })
    );

    await Promise.allSettled(prefetchPromises);
  }, [makeOptimizedAPICall]);

  const getCacheStats = useCallback(() => {
    const entries = Array.from(cache.current.entries());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([, entry]) => now < entry.expiry).length,
      expiredEntries: entries.filter(([, entry]) => now >= entry.expiry).length,
      cacheSize: JSON.stringify(Object.fromEntries(entries)).length,
      oldestEntry: Math.min(...entries.map(([, entry]) => entry.timestamp)),
      newestEntry: Math.max(...entries.map(([, entry]) => entry.timestamp))
    };
  }, []);

  return {
    isLoading,
    error,
    makeOptimizedAPICall,
    batchAPIRequests,
    createRateLimitedRequest,
    prefetchData,
    clearCache,
    getCachedData,
    setCachedData,
    getCacheStats
  };
};