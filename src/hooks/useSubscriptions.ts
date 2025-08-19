
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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
      console.log('Mock: Fetching subscription plans');
      
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 'basic',
          name: 'Basic Plan',
          tier: 'basic',
          max_drivers: 5,
          monthly_price: 99,
          annual_price: 990,
          description: 'Perfect for small transport companies',
          features: ['Up to 5 drivers', 'Basic reporting', 'Email support'],
          is_active: true
        },
        {
          id: 'pro',
          name: 'Premium Plan',
          tier: 'premium',
          max_drivers: 15,
          monthly_price: 199,
          annual_price: 1990,
          description: 'Ideal for growing transport businesses',
          features: ['Up to 15 drivers', 'Advanced reporting', 'Priority support', 'API access'],
          is_active: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise Plan',
          tier: 'enterprise',
          max_drivers: 50,
          monthly_price: 499,
          annual_price: 4990,
          description: 'For large-scale transport operations',
          features: ['Up to 50 drivers', 'Custom reporting', '24/7 support', 'Full API access', 'Custom integrations'],
          is_active: true
        }
      ];
      
      return mockPlans;
    }
  });
};

export const useCompanySubscription = (organizationId?: string) => {
  return useQuery({
    queryKey: ['company-subscription', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      console.log('Mock: Fetching company subscription for:', organizationId);
      
      const mockSubscription: CompanySubscription = {
        id: 'sub-1',
        organization_id: organizationId,
        plan_id: 'basic',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_plans: {
          id: 'basic',
          name: 'Basic Plan',
          tier: 'basic',
          max_drivers: 5,
          monthly_price: 99,
          annual_price: 990,
          description: 'Perfect for small transport companies',
          features: ['Up to 5 drivers', 'Basic reporting', 'Email support'],
          is_active: true
        }
      };
      
      return mockSubscription;
    },
    enabled: !!organizationId
  });
};

export const useCheckSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('Mock: Checking subscription status');
      return { status: 'active' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-subscription'] });
    },
    onError: (error: any) => {
      console.error('Failed to check subscription:', error);
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
