/**
 * Enhanced Development Environment Optimizer
 * Eliminates console spam and improves development experience
 */

// Track HMR failures and message throttling
const hmrFailures = new Map<string, number>();
const messageThrottle = new Map<string, number>();
const maxRetries = 3;
const throttleWindow = 1000; // 1 second

// Comprehensive cross-origin error patterns
const crossOriginPatterns = [
  'Unable to post message',
  'Recipient has origin',
  'cross-origin',
  'Protocols, domains, and ports must match',
  'Blocked a frame with origin',
  'postMessage',
  'lovable.dev',
  'lovableproject.com',
  'gptengineer.app',
  'localhost:3000',
  'frame with origin',
  'from accessing a frame'
];

// Throttle function to prevent message spam
const shouldThrottle = (key: string): boolean => {
  const now = Date.now();
  const lastTime = messageThrottle.get(key) || 0;
  
  if (now - lastTime < throttleWindow) {
    return true; // Throttle this message
  }
  
  messageThrottle.set(key, now);
  return false;
};

// Enhanced error filtering
const shouldSuppressError = (message: string): boolean => {
  return crossOriginPatterns.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
};

export const optimizeDevEnvironment = () => {
  if (!import.meta.env.DEV) return;

  // Enhanced console error suppression
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Check if this is a cross-origin error
    if (shouldSuppressError(message)) {
      return; // Completely suppress cross-origin development noise
    }
    
    // Throttle repetitive messages
    const messageKey = message.substring(0, 50);
    if (shouldThrottle(`error:${messageKey}`)) {
      return;
    }
    
    originalError(...args);
  };

  // Enhanced console warn suppression
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Suppress cross-origin warnings
    if (shouldSuppressError(message)) {
      return;
    }
    
    // Throttle performance warnings
    if (message.includes('render took') || message.includes('performance')) {
      if (shouldThrottle(`warn:${message.substring(0, 30)}`)) {
        return;
      }
    }
    
    originalWarn(...args);
  };

  // Enhanced HMR error handling
  if (import.meta.hot) {
    import.meta.hot.on('vite:error', (error: any) => {
      const errorKey = error.id || error.message || 'unknown';
      const failures = hmrFailures.get(errorKey) || 0;
      
      if (failures < maxRetries) {
        hmrFailures.set(errorKey, failures + 1);
        
        // Only log significant HMR failures
        if (!shouldSuppressError(errorKey)) {
          console.warn(`HMR retry ${failures + 1}/${maxRetries} for ${errorKey}`);
        }
        
        // Attempt graceful recovery
        setTimeout(() => {
          import.meta.hot?.invalidate();
        }, 500);
      } else if (!shouldSuppressError(errorKey)) {
        console.error(`HMR failed permanently for ${errorKey}, manual refresh may be needed`);
      }
    });

    // Clear failure tracking on successful updates
    import.meta.hot.on('vite:afterUpdate', (data) => {
      if (data.updates?.length > 0) {
        data.updates.forEach(update => {
          hmrFailures.delete(update.path);
        });
      }
    });
  }

  // Suppress window.postMessage errors at the source
  const originalPostMessage = window.postMessage.bind(window);
  window.postMessage = function(message: any, targetOrigin?: string | WindowPostMessageOptions, transfer?: Transferable[]) {
    try {
      if (typeof targetOrigin === 'string') {
        return originalPostMessage(message, targetOrigin, transfer);
      } else {
        return originalPostMessage(message, targetOrigin);
      }
    } catch (error) {
      // Silently handle postMessage errors in development
      return;
    }
  };

  // Clean up throttle map periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, time] of messageThrottle.entries()) {
      if (now - time > throttleWindow * 10) {
        messageThrottle.delete(key);
      }
    }
  }, throttleWindow * 10);
};

// Auto-initialize in development
if (import.meta.env.DEV) {
  optimizeDevEnvironment();
}