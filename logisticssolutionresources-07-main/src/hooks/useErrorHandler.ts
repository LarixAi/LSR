import { useCallback } from 'react';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';

interface ErrorContext {
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export const useErrorHandler = (context?: ErrorContext) => {
  const logger = new Logger(context?.component || 'useErrorHandler');

  const handleError = useCallback((error: Error | unknown, localContext?: string) => {
    const fullContext = localContext || context?.action || 'operation';
    
    let message = 'An unexpected error occurred';
    let errorDetails: Record<string, any> = {};

    if (error instanceof Error) {
      message = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack,
        ...context?.metadata
      };
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      const err = error as any;
      message = err.message || err.error_description || JSON.stringify(error);
      errorDetails = { ...err, ...context?.metadata };
    }

    // Enhanced error message mapping
    if (message.includes('Invalid login credentials')) {
      message = 'Invalid email or password. Please check your credentials.';
    } else if (message.includes('Email not confirmed')) {
      message = 'Please check your email and confirm your account.';
    } else if (message.includes('Too many requests')) {
      message = 'Too many attempts. Please try again later.';
    } else if (message.includes('Failed to fetch')) {
      message = 'Network error. Please check your connection and try again.';
    } else if (message.includes('Unauthorized')) {
      message = 'You are not authorized to perform this action.';
    }

    logger.error(`Error in ${fullContext}`, errorDetails);
    toast.error(message);

    return { message, errorDetails };
  }, [logger, context]);

  const handleSuccess = useCallback((message: string, title?: string) => {
    if (title) {
      toast.success(title, { description: message });
    } else {
      toast.success(message);
    }
    
    logger.info('Success notification shown', { message, title });
  }, [logger]);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string;
      successMessage?: string;
      errorContext?: string;
    }
  ): Promise<T | null> => {
    try {
      if (options?.loadingMessage) {
        toast.loading(options.loadingMessage);
      }

      const result = await operation();

      toast.dismiss();
      
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      return result;
    } catch (error) {
      toast.dismiss();
      handleError(error, options?.errorContext);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleSuccess,
    handleAsyncOperation
  };
};