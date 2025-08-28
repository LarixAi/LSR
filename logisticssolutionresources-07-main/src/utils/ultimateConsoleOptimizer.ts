/**
 * Ultimate Console Optimizer - Nuclear Option
 * Completely eliminates cross-origin console spam at the browser level
 */

// Track original console methods
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
  debug: console.debug,
  info: console.info
};

// More comprehensive error patterns for ULTIMATE spam suppression
const SPAM_PATTERNS = [
  // Cross-origin messaging
  /unable to post message/i,
  /recipient has origin/i,
  /blocked a frame with origin/i,
  /protocols, domains, and ports must match/i,
  /cross.?origin/i,
  /postmessage/i,
  /from accessing a frame/i,
  
  // Specific domains
  /lovable\.dev/i,
  /lovableproject\.com/i,
  /gptengineer\.app/i,
  /localhost:3000/i,
  /googletagmanager\.com/i,
  /auth\.lovable\.dev/i,
  
  // File patterns that indicate cross-origin issues
  /lovable\.js/,
  /recorder\.js/i,
  /universal-script/i,
  
  // Sandbox and browser warnings
  /sandbox.*invalid/i,
  /orientation.lock/i,
  /presentation.*invalid/i,
  /preload.*not used/i,
  /preconnected.*fonts/i,
  
  // Development noise
  /vite.*connecting/i,
  /vite.*connected/i,
  /facebook\.com\/tr/i,
  /meta pixel/i,
  /conflicting versions/i,
  /syntax.*unexpected.*token/i,
  /recorder\.js/,
  /\d+-[a-f0-9]+\.js/,
  
  // Stack trace noise
  /forEach\s*D\s*\(lovable\.js/,
  /anonymous function.*lovable\.js/,
  /emit.*lovable\.js/,
];

// Performance counters
let suppressedCount = 0;
let lastReset = Date.now();

const isSpamMessage = (message: string): boolean => {
  return SPAM_PATTERNS.some(pattern => pattern.test(message));
};

const createOptimizedConsoleMethod = (
  originalMethod: (...args: any[]) => void,
  level: string
) => {
  return (...args: any[]) => {
    // Convert all args to strings for pattern matching
    const messageString = args.map(arg => 
      typeof arg === 'string' ? arg : 
      typeof arg === 'object' && arg?.toString ? arg.toString() :
      String(arg)
    ).join(' ');

    // Check if this is spam
    if (isSpamMessage(messageString)) {
      suppressedCount++;
      
      // Reset counter every 30 seconds and show stats
      const now = Date.now();
      if (now - lastReset > 30000) {
        if (suppressedCount > 0) {
          originalMethod(`🔇 Suppressed ${suppressedCount} console spam messages in last 30s`);
          suppressedCount = 0;
        }
        lastReset = now;
      }
      
      return; // Completely suppress
    }

    // Allow legitimate messages through
    originalMethod.apply(console, args);
  };
};

// Override console methods with spam filtering
const overrideConsole = () => {
  console.error = createOptimizedConsoleMethod(originalConsole.error, 'error');
  console.warn = createOptimizedConsoleMethod(originalConsole.warn, 'warn');
  console.log = createOptimizedConsoleMethod(originalConsole.log, 'log');
  console.debug = createOptimizedConsoleMethod(originalConsole.debug, 'debug');
  console.info = createOptimizedConsoleMethod(originalConsole.info, 'info');
};

// Override window.postMessage to prevent errors at source
const overridePostMessage = () => {
  const originalPostMessage = window.postMessage;
  
  window.postMessage = function(message: any, targetOrigin?: string | WindowPostMessageOptions, transfer?: Transferable[]) {
    try {
      // Check if this is a cross-origin call that will fail
      if (typeof targetOrigin === 'string') {
        if (targetOrigin.includes('gptengineer.app') || 
            targetOrigin.includes('localhost:3000') ||
            targetOrigin === '*') {
          return; // Silently ignore these calls
        }
        return originalPostMessage.call(this, message, targetOrigin, transfer);
      } else {
        return originalPostMessage.call(this, message, targetOrigin);
      }
    } catch (error) {
      // Completely suppress postMessage errors
      return;
    }
  };
};

// Override window.onerror to catch remaining errors
const overrideErrorHandlers = () => {
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const messageStr = String(message);
    
    // Suppress cross-origin related errors
    if (isSpamMessage(messageStr)) {
      return true; // Prevent default handling
    }
    
    // Allow legitimate errors through
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    
    return false;
  };

  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    const messageStr = event.reason?.message || String(event.reason) || '';
    
    // Suppress cross-origin related promise rejections
    if (isSpamMessage(messageStr)) {
      event.preventDefault();
      return;
    }
    
    // Allow legitimate rejections through
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.call(this, event);
    }
  };
};

// Monkey patch common error sources
const patchEventListeners = () => {
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'error' && typeof listener === 'function') {
      const wrappedListener = function(event: any) {
        const message = event.message || event.error?.message || '';
        if (isSpamMessage(message)) {
          return; // Suppress
        }
        return (listener as Function).call(this, event);
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
};

// Main initialization function
export const initializeUltimateConsoleOptimizer = () => {
  if (!import.meta.env.DEV) return;

  try {
    overrideConsole();
    overridePostMessage();
    overrideErrorHandlers();
    patchEventListeners();
    
    // Show initialization message
    originalConsole.log('🚀 Ultimate Console Optimizer activated - cross-origin spam will be suppressed');
  } catch (error) {
    originalConsole.error('Failed to initialize Ultimate Console Optimizer:', error);
  }
};

// Auto-initialize immediately
initializeUltimateConsoleOptimizer();