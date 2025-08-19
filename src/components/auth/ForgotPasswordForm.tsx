import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: 'Reset Email Sent',
        description: 'Check your email for password reset instructions.',
      });
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email';
      if (error.message.includes('Email rate limit exceeded')) {
        errorMessage = 'Too many reset attempts. Please wait a few minutes before trying again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`space-y-6 text-center ${isMobile ? 'px-1' : 'px-0'}`}>
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Email Sent!</h3>
          <p className="text-slate-300 text-sm">
            We've sent password reset instructions to <span className="font-medium text-white">{email}</span>
          </p>
          <p className="text-slate-400 text-xs">
            Check your email and click the reset link to create a new password.
          </p>
        </div>

        <Button 
          onClick={onBackToLogin}
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'px-1' : 'px-0'}`}>
      <div className="text-center space-y-2 mb-6">
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <Mail className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-white">Reset Your Password</h3>
        </div>
        <p className="text-slate-300 text-sm">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200 text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="email"
            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-green-400/20 ${isMobile ? 'h-12 text-base' : 'h-11 text-sm'}`}
            placeholder="Enter your email address"
          />
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription className="text-red-300 text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className={`w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium transition-all duration-200 ${isMobile ? 'h-12 text-base' : 'h-11 text-sm'}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending...</span>
            </div>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;