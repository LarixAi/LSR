import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const StripeSuccessHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const error = searchParams.get('error');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handlePaymentResult = async () => {
      if (success === 'true' && sessionId) {
        setIsProcessing(true);
        try {
          // Update subscription status in database
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            // You can add additional logic here to update subscription status
            console.log('Payment successful, session ID:', sessionId);
          }
          
          toast.success('Payment successful! Your subscription has been activated.');
        } catch (error) {
          console.error('Error processing payment result:', error);
          toast.error('Payment successful but there was an issue updating your account. Please contact support.');
        } finally {
          setIsProcessing(false);
        }
      } else if (canceled === 'true') {
        toast.info('Payment was canceled. You can try again anytime.');
      } else if (error) {
        toast.error(`Payment failed: ${error}`);
      }
    };

    handlePaymentResult();
  }, [success, canceled, error, sessionId]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleTryAgain = () => {
    navigate('/subscriptions');
  };

  const handleViewSubscription = () => {
    navigate('/subscriptions');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-blue-600">
              Processing Payment...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Please wait while we process your payment and activate your subscription.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success === 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your subscription has been activated successfully. You now have access to all the features of your chosen plan.
            </p>
            <div className="space-y-2">
              <Button onClick={handleContinue} className="w-full">
                Continue to Dashboard
              </Button>
              <Button onClick={handleViewSubscription} variant="outline" className="w-full">
                View Subscription Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (canceled === 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-yellow-600">
              Payment Canceled
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your payment was canceled. No charges were made to your account. You can try again anytime.
            </p>
            <div className="space-y-2">
              <Button onClick={handleTryAgain} className="w-full">
                Try Again
              </Button>
              <Button onClick={handleContinue} variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              There was an error processing your payment. Please try again or contact support if the problem persists.
            </p>
            <div className="space-y-2">
              <Button onClick={handleTryAgain} className="w-full">
                Try Again
              </Button>
              <Button onClick={handleContinue} variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default case - redirect to dashboard
  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  return null;
};
