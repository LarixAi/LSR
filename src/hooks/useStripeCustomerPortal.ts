import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Custom hook to manage the no subscription dialog
export const useNoSubscriptionDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [onUpgradeCallback, setOnUpgradeCallback] = React.useState<(() => void) | null>(null);

  const openDialog = (onUpgrade: () => void) => {
    setOnUpgradeCallback(() => onUpgrade);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setOnUpgradeCallback(null);
  };

  const handleUpgrade = () => {
    if (onUpgradeCallback) {
      onUpgradeCallback();
    }
    closeDialog();
  };

  return {
    isDialogOpen,
    openDialog,
    closeDialog,
    handleUpgrade
  };
};

export const useStripeCustomerPortal = (onNoSubscription?: () => void) => {
  return useMutation({
    mutationFn: async () => {
      // Check if user has an active subscription first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }

      // Get user's subscription status
      const { data: profile } = await supabase.auth.getUser(session.access_token);
      if (!profile.user) {
        throw new Error('User not found');
      }

      // Check if user has an active subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', profile.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!subscription) {
        // Call the callback if provided, otherwise throw error
        if (onNoSubscription) {
          onNoSubscription();
          return { url: null }; // Return early to prevent further processing
        }
        throw new Error('No active subscription found. Please upgrade your plan first.');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer portal session');
      }

      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No customer portal URL received');
      }

      // Redirect to Stripe customer portal
      window.location.href = url;
      
      return { url };
    },
    onError: (error: any) => {
      console.error('Stripe customer portal error:', error);
      
      // Provide more helpful error messages
      if (error.message.includes('No active subscription found')) {
        // Don't show toast for this error since we handle it with dialog
        return;
      } else if (error.message.includes('No Stripe customer found')) {
        toast.error('You need to have an active subscription to access payment settings. Please upgrade your plan first.');
      } else if (error.message.includes('authentication')) {
        toast.error('Please log in to access payment settings.');
      } else {
        toast.error('Failed to access customer portal: ' + error.message);
      }
    },
  });
};
