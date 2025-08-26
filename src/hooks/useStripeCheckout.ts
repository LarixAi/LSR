import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CheckoutParams {
  planId: string;
  isAnnual?: boolean;
}

export const useStripeCheckout = () => {
  return useMutation({
    mutationFn: async ({ planId, isAnnual = false }: CheckoutParams) => {
      console.log('Starting Stripe checkout process:', { planId, isAnnual });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('No authentication token found');
        throw new Error('No authentication token found');
      }

      console.log('Making request to create-checkout function');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId,
          isAnnual,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Checkout function error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create checkout session`);
      }

      const responseData = await response.json();
      console.log('Checkout function response:', responseData);
      
      const { url } = responseData;
      
      if (!url) {
        console.error('No checkout URL received in response');
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to Stripe checkout:', url);
      
      // Show loading toast
      toast.loading('Redirecting to payment page...');
      
      // Redirect to Stripe checkout
      window.location.href = url;
      
      return { url };
    },
    onError: (error: any) => {
      console.error('Stripe checkout error:', error);
      toast.error('Failed to create checkout session: ' + error.message);
    },
    onSuccess: (data) => {
      console.log('Stripe checkout success:', data);
      toast.dismiss(); // Dismiss loading toast
    },
  });
};
