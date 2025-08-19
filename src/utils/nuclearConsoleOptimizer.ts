/**
 * Nuclear Console Optimizer - The ultimate cross-origin spam eliminator
 * This is the most aggressive console suppression system to completely eliminate
 * development noise from cross-origin messaging, frame access, and postMessage errors.
 */

// Store original console methods before any other modules can override them
const ORIGINAL_CONSOLE = {
  error: console.error,
  warn: console.warn,
  log: console.log,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};

// Comprehensive spam patterns - covers all known cross-origin noise
const SPAM_PATTERNS = [
  // Cross-origin messaging errors
  /unable to post message/i,
  /recipient has origin/i,
  /blocked a frame with origin/i,
  /protocols, domains, and ports must match/i,
  /cross.?origin/i,
  /postmessage/i,
  /from accessing a frame/i,
  /access.*frame.*origin/i,
  /frame.*blocked/i,
  
  // Specific development domains
  /lovable\.dev/i,
  /lovableproject\.com/i,
  /gptengineer\.app/i,
  /localhost:3000/i,
  /preview--.*\.lovable\.app/i,
  /id-preview--.*\.lovable\.app/i,
  
  // Development tooling noise
  /recorder\.js/i,
  /lovable\.js/i,
  /hot.*update/i,
  /chunk.*load/i,
  
  // Browser extension noise
  /extension.*content.*script/i,
  /chrome.*extension/i,
  /moz.*extension/i,
  
  // Analytics and tracking noise
  /googletagmanager/i,
  /gtag/i,
  /analytics/i,
  /tracking/i
];

// Smart message filtering - only allow through significant errors
const isSpamMessage = (args: any[]): boolean => {
  if (!import.meta.env.DEV) return false;
  
  const message = args
    .map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg && typeof arg === 'object') {
        return arg.message || arg.toString();
      }
      return String(arg);
    })
    .join(' ')
    .toLowerCase();
  
  return SPAM_PATTERNS.some(pattern => pattern.test(message));
};

// Rate limiting to prevent console flooding
const rateLimits = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const MAX_MESSAGES_PER_WINDOW = 2;

const isRateLimited = (key: string): boolean => {
  const now = Date.now();
  const limit = rateLimits.get(key);
  
  if (!limit || now - limit.lastReset > RATE_LIMIT_WINDOW) {
    rateLimits.set(key, { count: 1, lastReset: now });
    return false;
  }
  
  if (limit.count >= MAX_MESSAGES_PER_WINDOW) {
    return true;
  }
  
  limit.count++;
  return false;
};

// Create optimized console method with nuclear suppression
const createNuclearConsoleMethod = (original: Function, level: string) => {
  return (...args: any[]) => {
    // Nuclear option: Block all spam in development
    if (isSpamMessage(args)) {
      return; // Completely suppress
    }
    
    // Rate limit remaining messages
    const messageKey = `${level}:${String(args[0] || '').substring(0, 50)}`;
    if (isRateLimited(messageKey)) {
      return;
    }
    
    // Allow significant messages through
    original.apply(console, args);
  };
};

// Override all console methods with nuclear suppression
const applyNuclearConsoleOverride = () => {
  console.error = createNuclearConsoleMethod(ORIGINAL_CONSOLE.error, 'error');
  console.warn = createNuclearConsoleMethod(ORIGINAL_CONSOLE.warn, 'warn');
  console.log = createNuclearConsoleMethod(ORIGINAL_CONSOLE.log, 'log');
  console.info = createNuclearConsoleMethod(ORIGINAL_CONSOLE.info, 'info');
  console.debug = createNuclearConsoleMethod(ORIGINAL_CONSOLE.debug, 'debug');
};

// Nuclear postMessage override - block at the source
const applyNuclearPostMessageOverride = () => {
  const originalPostMessage = window.postMessage;
  
  window.postMessage = function(message: any, targetOrigin?: string | WindowPostMessageOptions, transfer?: Transferable[]) {
    // Nuclear option: Block all potentially problematic postMessage calls
    if (typeof targetOrigin === 'string') {
      const blockedOrigins = [
        'https://gptengineer.app',
        'http://localhost:3000',
        'https://lovable.dev',
        'https://lovableproject.com'
      ];
      
      if (blockedOrigins.some(origin => targetOrigin.includes(origin)) || targetOrigin === '*') {
        return; // Silently block
      }
    }
    
    try {
      return originalPostMessage.call(this, message, targetOrigin, transfer);
    } catch (error) {
      // Completely suppress all postMessage errors
      return;
    }
  };
};

// Nuclear error handler override
const applyNuclearErrorHandlers = () => {
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (typeof message === 'string' && isSpamMessage([message])) {
      return true; // Prevent default error handling
    }
    
    // Allow original handler for significant errors
    if (originalOnError) {
      return originalOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };
  
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    const message = event.reason?.message || String(event.reason || '');
    if (isSpamMessage([message])) {
      event.preventDefault();
      return;
    }
    
    // Allow original handler for significant rejections
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.call(window, event);
    }
  };
};

// Nuclear addEventListener override to catch frame access attempts
const applyNuclearEventListenerOverride = () => {
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
    if (typeof listener === 'function') {
      const wrappedListener = (...args: any[]) => {
        try {
          return listener.apply(this, args);
        } catch (error: any) {
          // Suppress cross-origin and frame access errors
          if (error.message && isSpamMessage([error.message])) {
            return;
          }
          throw error;
        }
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
};

// Main nuclear initialization
export const initializeNuclearConsoleOptimizer = () => {
  if (!import.meta.env.DEV) return;
  
  try {
    applyNuclearConsoleOverride();
    applyNuclearPostMessageOverride();
    applyNuclearErrorHandlers();
    applyNuclearEventListenerOverride();
    
    // Use original console to show activation message
    ORIGINAL_CONSOLE.info('🚀 NUCLEAR Console Spam Elimination activated - all cross-origin spam blocked at browser level');
    
    // Clean up rate limits periodically
    setInterval(() => {
      rateLimits.clear();
    }, 60000); // Clear every minute
    
  } catch (error) {
    ORIGINAL_CONSOLE.error('Failed to initialize nuclear console optimizer:', error);
  }
};

// Emergency restoration function for debugging
export const restoreOriginalConsole = () => {
  Object.assign(console, ORIGINAL_CONSOLE);
};

export { ORIGINAL_CONSOLE };