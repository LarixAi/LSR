import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'basic' | 'premium' | 'enterprise';
  max_drivers: number;
  monthly_price: number;
  annual_price?: number;
  description?: string;
  features: string[];
  is_active: boolean;
}

interface CompanySubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  subscription_plans: SubscriptionPlan;
}

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      console.log('Fetching subscription plans');
      
      // Return hardcoded plans for now since we're not using a plans table
      const plans: SubscriptionPlan[] = [
        {
          id: 'basic',
          name: 'Basic Plan',
          tier: 'basic',
          max_drivers: 5,
          monthly_price: 9.99,
          annual_price: 99.90,
          description: 'Perfect for small transport companies',
          features: ['Up to 5 drivers', 'Basic reporting', 'Email support'],
          is_active: true
        },
        {
          id: 'pro',
          name: 'Premium Plan',
          tier: 'premium',
          max_drivers: 15,
          monthly_price: 19.99,
          annual_price: 199.90,
          description: 'Ideal for growing transport businesses',
          features: ['Up to 15 drivers', 'Advanced reporting', 'Priority support', 'API access'],
          is_active: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise Plan',
          tier: 'enterprise',
          max_drivers: 50,
          monthly_price: 49.99,
          annual_price: 499.90,
          description: 'For large-scale transport operations',
          features: ['Up to 50 drivers', 'Custom reporting', '24/7 support', 'Full API access', 'Custom integrations'],
          is_active: true
        }
      ];
      
      return plans;
    }
  });
};

export const useCompanySubscription = (organizationId?: string) => {
  return useQuery({
    queryKey: ['company-subscription', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      console.log('Fetching company subscription for:', organizationId);
      
      // Get the current user's subscription status from the subscribers table
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return null;
      
      const { data: subscription, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();
      
      if (error || !subscription) return null;
      
      // Map subscription data to expected format
      const planMap: Record<string, SubscriptionPlan> = {
        'Basic': {
          id: 'basic',
          name: 'Basic Plan',
          tier: 'basic',
          max_drivers: 5,
          monthly_price: 9.99,
          annual_price: 99.90,
          description: 'Perfect for small transport companies',
          features: ['Up to 5 drivers', 'Basic reporting', 'Email support'],
          is_active: true
        },
        'Premium': {
          id: 'pro',
          name: 'Premium Plan',
          tier: 'premium',
          max_drivers: 15,
          monthly_price: 19.99,
          annual_price: 199.90,
          description: 'Ideal for growing transport businesses',
          features: ['Up to 15 drivers', 'Advanced reporting', 'Priority support', 'API access'],
          is_active: true
        },
        'Enterprise': {
          id: 'enterprise',
          name: 'Enterprise Plan',
          tier: 'enterprise',
          max_drivers: 50,
          monthly_price: 49.99,
          annual_price: 499.90,
          description: 'For large-scale transport operations',
          features: ['Up to 50 drivers', 'Custom reporting', '24/7 support', 'Full API access', 'Custom integrations'],
          is_active: true
        }
      };
      
      if (!subscription.subscribed || !subscription.subscription_tier) return null;
      
      const plan = planMap[subscription.subscription_tier] || planMap['Basic'];
      
      return {
        id: subscription.id,
        organization_id: organizationId,
        plan_id: plan.id,
        status: subscription.subscribed ? 'active' : 'inactive',
        current_period_start: subscription.created_at,
        current_period_end: subscription.subscription_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_plans: plan
      };
    },
    enabled: !!organizationId
  });
};

export const useCheckSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('Checking subscription status');
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['company-subscription'] });
      console.log('Subscription status checked:', data);
    },
    onError: (error: any) => {
      console.error('Failed to check subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    }
  });
};

export const useCreateCheckout = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ planName, monthlyPrice, isAnnual }: { 
      planName: string; 
      monthlyPrice: number;
      isAnnual: boolean;
    }) => {
      console.log('Creating checkout session for plan:', planName);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planName, monthlyPrice, isAnnual, planDescription: `${planName} subscription` }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Checkout Session Created",
          description: "Redirecting to payment page...",
        });
      }
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
      console.log('Opening customer portal');
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Customer Portal",
          description: "Redirecting to billing portal...",
        });
      }
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

export const useCreatePayment = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      productName, 
      productDescription, 
      amount, 
      currency = 'usd' 
    }: { 
      productName: string;
      productDescription?: string;
      amount: number;
      currency?: string;
    }) => {
      console.log('Creating one-time payment:', { productName, amount });
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { productName, productDescription, amount, currency }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Payment Session Created",
          description: "Redirecting to payment page...",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create payment session: " + error.message,
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
      console.log('Creating subscription:', data);
      // This is handled by Stripe webhooks or check-subscription function
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
      console.log('Updating subscription:', data);
      // This would be handled through Stripe customer portal
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