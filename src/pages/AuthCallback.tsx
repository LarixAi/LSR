
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const redirect_to = searchParams.get('redirect_to');

        if (!token_hash || !type) {
          setStatus('error');
          setMessage('Invalid verification link');
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

        if (error) {
          console.error('Verification error:', error);
          setStatus('error');
          setMessage(error.message || 'Verification failed');
        } else {
          setStatus('success');
          
          if (type === 'signup') {
            setMessage('Email verified successfully! You can now sign in.');
          } else if (type === 'recovery') {
            setMessage('Password reset verified! You can now set a new password.');
          } else if (type === 'email_change') {
            setMessage('Email change confirmed successfully!');
          } else {
            setMessage('Verification completed successfully!');
          }

          // Handle different verification types
          setTimeout(() => {
            if (type === 'recovery') {
              // Redirect to reset password page for password recovery
              navigate('/reset-password');
            } else if (redirect_to) {
              window.location.href = redirect_to;
            } else {
              navigate('/');
            }
          }, 2000);
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white">Logistics Solution Resources</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === 'loading' && (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-12 h-12 text-green-500" />
              )}
              {status === 'error' && (
                <XCircle className="w-12 h-12 text-red-500" />
              )}
            </div>
            <CardTitle>
              {status === 'loading' && 'Verifying...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription>
              {message || 'Please wait while we verify your email...'}
            </CardDescription>
          </CardHeader>
          
          {status === 'error' && (
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate('/auth')}
              >
                Back to Sign In
              </Button>
            </CardContent>
          )}
          
          {status === 'success' && (
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Redirecting you now...
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AuthCallback;
