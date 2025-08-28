import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LoginStatusIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export const LoginStatusIndicator: React.FC<LoginStatusIndicatorProps> = ({ 
  status, 
  message 
}) => {
  if (status === 'idle') return null;

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getVariant = () => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getVariant()} className="mt-4">
      <div className="flex items-center gap-2">
        {getIcon()}
        <AlertDescription>
          {message || `Status: ${status}`}
        </AlertDescription>
      </div>
    </Alert>
  );
};