import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserVerificationService from '@/services/userVerificationService';
import { supabase } from '@/integrations/supabase/client';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('No verification token provided');
      return;
    }

    verifyEmailToken();
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      const result = await UserVerificationService.verifyEmailToken(token!);
      
      if (result.success) {
        setVerificationStatus('success');
        
        // Send welcome email
        await UserVerificationService.sendWelcomeEmail(result.userId!);
        
        toast({
          title: "Email Verified Successfully!",
          description: "Your email has been verified. Welcome to LSR Transport!",
        });
      } else {
        if (result.error?.includes('expired')) {
          setVerificationStatus('expired');
        } else {
          setVerificationStatus('error');
          setErrorMessage(result.error || 'Verification failed');
        }
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('An unexpected error occurred');
    }
  };

  const handleResendVerification = async () => {
    if (!token) return;
    
    setIsResending(true);
    try {
      // Get user ID from token
      const { data: tokenData } = await supabase
        .from('verification_tokens')
        .select('user_id')
        .eq('token', token)
        .single();

      if (tokenData) {
        const success = await UserVerificationService.sendVerificationEmail(tokenData.user_id);
        
        if (success) {
          toast({
            title: "Verification Email Sent",
            description: "A new verification email has been sent to your inbox.",
          });
        } else {
          toast({
            title: "Failed to Send Email",
            description: "Please try again later or contact support.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/auth');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying Your Email</h2>
            <p className="text-muted-foreground">Please wait while we verify your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your email address has been verified. You can now access all features of LSR Transport.
            </p>
            <div className="space-y-3">
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={handleGoToLogin} className="w-full">
                Sign In
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-muted-foreground mb-4">
              {errorMessage || 'We couldn\'t verify your email address. Please try again.'}
            </p>
            <div className="space-y-3">
              <Button onClick={handleGoToLogin} className="w-full">
                Go to Sign In
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <Clock className="h-16 w-16 text-orange-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-orange-600 mb-2">Verification Link Expired</h2>
            <p className="text-muted-foreground mb-6">
              Your verification link has expired. Please request a new verification email.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleResendVerification} 
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleGoToLogin} className="w-full">
                Go to Sign In
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Mail className="h-6 w-6" />
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
          
          {verificationStatus === 'error' && (
            <Alert className="mt-6">
              <AlertDescription>
                If you continue to have issues, please contact our support team or try signing in again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
