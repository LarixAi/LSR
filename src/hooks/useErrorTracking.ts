import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ErrorLog {
  id?: string;
  error_type: string;
  message: string;
  stack_trace?: string;
  user_id?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

interface ErrorStats {
  totalErrors: number;
  unresolvedErrors: number;
  errorsByType: Record<string, number>;
  errorsByDay: Array<{ date: string; count: number }>;
}

export const useErrorTracking = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    totalErrors: 0,
    unresolvedErrors: 0,
    errorsByType: {},
    errorsByDay: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const logError = useCallback(async (
    error: Error,
    severity: ErrorLog['severity'] = 'medium',
    metadata?: Record<string, any>
  ) => {
    try {
      const errorLog: ErrorLog = {
        error_type: error.name || 'UnknownError',
        message: error.message,
        stack_trace: error.stack,
        timestamp: new Date().toISOString(),
        severity,
        resolved: false,
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          ...metadata
        }
      };

      // Log to console for development
      console.error('Error logged:', errorLog);

      // In production, this would send to error tracking service
      // For now, just add to local state since table doesn't exist
      const mockData: ErrorLog = {
        ...errorLog,
        id: Math.random().toString(36).substring(7)
      };

      setErrors(prev => [mockData, ...prev]);
      updateStats();

      // Send critical errors to monitoring service immediately
      if (severity === 'critical') {
        await sendCriticalAlert(errorLog);
      }

    } catch (logError) {
      console.error('Error tracking failed:', logError);
    }
  }, []);

  const sendCriticalAlert = async (errorLog: ErrorLog) => {
    // In production, integrate with services like PagerDuty, Slack, etc.
    console.warn('CRITICAL ERROR DETECTED:', errorLog);
    
    // Example webhook call to alert system
    try {
      await fetch('/api/alerts/critical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLog)
      });
    } catch (error) {
      console.error('Failed to send critical alert:', error);
    }
  };

  const updateStats = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock stats since error_logs table doesn't exist
      const mockStats: ErrorStats = {
        totalErrors: errors.length,
        unresolvedErrors: errors.filter(e => !e.resolved).length,
        errorsByType: errors.reduce((acc, error) => {
          acc[error.error_type] = (acc[error.error_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        errorsByDay: [
          { date: '2024-01-01', count: 5 },
          { date: '2024-01-02', count: 3 },
          { date: '2024-01-03', count: 8 },
          { date: '2024-01-04', count: 2 },
          { date: '2024-01-05', count: 6 }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to update error stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [errors]);

  const resolveError = useCallback(async (errorId: string) => {
    try {
      await supabase
        .from('error_logs' as any)
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', errorId);

      setErrors(prev => prev.map(error => 
        error.id === errorId ? { ...error, resolved: true } : error
      ));
      
      updateStats();
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  }, [updateStats]);

  const capturePageError = useCallback(() => {
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      logError(new Error(event.message), 'high', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(new Error(`Unhandled Promise Rejection: ${event.reason}`), 'high');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [logError]);

  useEffect(() => {
    const cleanup = capturePageError();
    updateStats();
    return cleanup;
  }, [capturePageError, updateStats]);

  return {
    errors,
    stats,
    isLoading,
    logError,
    resolveError,
    updateStats
  };
};