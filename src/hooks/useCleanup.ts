import { useEffect, useRef } from 'react';

/**
 * Hook to ensure proper cleanup of resources and prevent memory leaks
 */
export const useCleanup = () => {
  const timeouts = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervals = useRef<Set<NodeJS.Timeout>>(new Set());
  const eventListeners = useRef<Array<{
    element: Element | Window | Document;
    event: string;
    handler: EventListener;
  }>>([]);

  const addTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      timeouts.current.delete(timeout);
      callback();
    }, delay);
    timeouts.current.add(timeout);
    return timeout;
  };

  const addInterval = (callback: () => void, delay: number): NodeJS.Timeout => {
    const interval = setInterval(callback, delay);
    intervals.current.add(interval);
    return interval;
  };

  const addEventListener = (
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    eventListeners.current.push({ element, event, handler });
  };

  const clearTimeout = (timeout: NodeJS.Timeout) => {
    timeouts.current.delete(timeout);
    global.clearTimeout(timeout);
  };

  const clearInterval = (interval: NodeJS.Timeout) => {
    intervals.current.delete(interval);
    global.clearInterval(interval);
  };

  useEffect(() => {
    return () => {
      // Clear all timeouts
      timeouts.current.forEach(timeout => global.clearTimeout(timeout));
      timeouts.current.clear();

      // Clear all intervals
      intervals.current.forEach(interval => global.clearInterval(interval));
      intervals.current.clear();

      // Remove all event listeners
      eventListeners.current.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      eventListeners.current.length = 0;
    };
  }, []);

  return {
    addTimeout,
    addInterval,
    addEventListener,
    clearTimeout,
    clearInterval
  };
};

/**
 * Hook for async operations that can be cancelled
 */
export const useAbortController = () => {
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    abortController.current = new AbortController();
    
    return () => {
      abortController.current?.abort();
    };
  }, []);

  const getSignal = () => abortController.current?.signal;

  const abort = () => {
    abortController.current?.abort();
    abortController.current = new AbortController();
  };

  return { getSignal, abort };
};