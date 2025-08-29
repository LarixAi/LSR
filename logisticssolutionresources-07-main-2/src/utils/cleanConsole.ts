/**
 * Clean Console Logger Utility
 * Replaces all console.log statements with conditional logging
 */

import { Logger } from './logger';

// Create app-wide logger instances
const createAppLogger = (component: string) => new Logger(component);

// Global console replacements for production
export const cleanConsole = () => {
  if (!import.meta.env.DEV) {
    // In production, replace console methods with safer versions
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.log = (...args: unknown[]) => {
      // Only log in development
      if (import.meta.env.DEV) {
        originalLog(...args);
      }
    };
    
    console.warn = (...args: unknown[]) => {
      originalWarn(...args);
    };
    
    console.error = (...args: unknown[]) => {
      originalError(...args);
    };
  }
};

// Specific logger instances for common components
export const authLogger = createAppLogger('Auth');
export const apiLogger = createAppLogger('API');
export const routeLogger = createAppLogger('Routes');
export const dataLogger = createAppLogger('Data');

// Development-only logging helper
export const devLog = (message: string, data?: unknown) => {
  if (import.meta.env.DEV) {
    console.log(`[DEV] ${message}`, data);
  }
};

// Safe error logging for production
export const logError = (error: Error, context?: string) => {
  const errorLogger = createAppLogger(context || 'Error');
  errorLogger.error(error.message, {
    stack: error.stack,
    name: error.name
  });
};

export default {
  auth: authLogger,
  api: apiLogger,
  route: routeLogger,
  data: dataLogger,
  devLog,
  logError,
  cleanConsole
};