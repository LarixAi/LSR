/**
 * Production-ready logging utility
 * Replaces console.log statements with structured logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  component?: string;
}

class Logger {
  private component: string;
  private isDevelopment = import.meta.env.DEV;

  constructor(component: string) {
    this.component = component;
  }

  private log(level: LogLevel, message: string, data?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      component: this.component,
    };

    // In development, use console for debugging
    if (this.isDevelopment) {
      const levelName = LogLevel[level];
      const prefix = `[${levelName}] ${this.component}:`;
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, data);
          break;
        case LogLevel.INFO:
          console.info(prefix, message, data);
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, data);
          break;
        case LogLevel.ERROR:
          console.error(prefix, message, data);
          break;
      }
    } else {
      // In production, send to monitoring service
      // This could be Sentry, LogRocket, or custom endpoint
      this.sendToMonitoring(entry);
    }
  }

  private sendToMonitoring(entry: LogEntry) {
    // In production, implement proper error tracking
    // For now, we'll store critical errors in localStorage for debugging
    if (entry.level >= LogLevel.ERROR) {
      try {
        const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
        errors.push(entry);
        // Keep only last 50 errors
        if (errors.length > 50) {
          errors.splice(0, errors.length - 50);
        }
        localStorage.setItem('app_errors', JSON.stringify(errors));
      } catch (error) {
        // Silent fail if localStorage is unavailable
      }
    }
  }

  debug(message: string, data?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, any>) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, any>) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, data);
  }
}

// Simple logger instance for easy usage
export const logger = {
  devLog: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[DEV] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    const errorInfo = error instanceof Error ? error.message : error;
    console.error(`[ERROR] ${message}`, errorInfo || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  },
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }
};

export { Logger };
export default Logger;
