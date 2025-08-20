
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'basic' | 'premium' | 'enterprise';
  max_drivers: number;
  monthly_price: number;
  annual_price: number;
  description: string;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface CompanySubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  subscription_plans: SubscriptionPlan;
  created_at: string;
}

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });

      if (error) {
        console.error('Error fetching subscription plans:', error);
        return [];
      }

      return data || [];
    }
  });
};

export const useCompanySubscription = (organizationId?: string) => {
  return useQuery({
    queryKey: ['company-subscription', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const { data, error } = await supabase
        .from('company_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching company subscription:', error);
        return null;
      }

      return data;
    },
    enabled: !!organizationId
  });
};

export const useCheckSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('No organization found');
      }

      const { data, error } = await supabase
        .from('company_subscriptions')
        .select('status')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'active')
        .single();

      if (error) {
        throw new Error('Failed to check subscription status');
      }

      return { status: data?.status || 'inactive' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-subscription'] });
    },
    onError: (error: any) => {
      console.error('Failed to check subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive"
      });
    }
  });
};

export const useCreateCheckout = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (planId: string) => {
      console.log('Mock: Creating checkout session for plan:', planId);
      return { url: 'https://checkout.stripe.com/mock-session' };
    },
    onSuccess: (data) => {
      // Mock opening checkout
      console.log('Mock: Would open Stripe checkout at:', data.url);
      toast({
        title: "Checkout Session Created",
        description: "Redirecting to payment page...",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create checkout session: " + error.message,
        variant: "destructive",
      });
    }
  });
};

export const useCustomerPortal = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('Mock: Opening customer portal');
      return { url: 'https://billing.stripe.com/mock-portal' };
    },
    onSuccess: (data) => {
      // Mock opening portal
      console.log('Mock: Would open customer portal at:', data.url);
      toast({
        title: "Customer Portal",
        description: "Redirecting to billing portal...",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to open customer portal: " + error.message,
        variant: "destructive",
      });
    }
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      organizationId: string;
      planId: string;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
    }) => {
      console.log('Mock: Creating subscription:', data);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['company-subscription'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create subscription: " + error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      subscriptionId: string;
      planId: string;
    }) => {
      console.log('Mock: Updating subscription:', data);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['company-subscription'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update subscription: " + error.message,
        variant: "destructive",
      });
    }
  });
};
