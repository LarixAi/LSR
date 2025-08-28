
import { useErrorHandler } from './useErrorHandler';

/**
 * @deprecated Use useErrorHandler instead for better error handling capabilities
 */
export const useApiErrorHandler = () => {
  const { handleError, handleSuccess } = useErrorHandler({ component: 'ApiErrorHandler' });
  
  return {
    handleError: (error: Error | unknown, context?: string) => {
      handleError(error, context);
    },
    handleSuccess: (title: string, message: string) => {
      handleSuccess(message, title);
    }
  };
};
