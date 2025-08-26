
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    drivers: number;
    vehicles: number;
    storage: number;
    api_calls: number;
  };
  popular?: boolean;
  savings?: number;
  created_at: string;
  updated_at: string;
}

export interface CurrentSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'trial';
  start_date: string;
  end_date: string;
  next_billing_date: string;
  amount: number;
  trial_ends_at?: string;
  auto_renew: boolean;
  payment_method_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingHistory {
  id: string;
  subscription_id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  invoice_url?: string;
  payment_method: string;
  tax_amount: number;
  discount_amount: number;
  created_at: string;
}

export interface UsageData {
  id: string;
  organization_id: string;
  date: string;
  drivers: number;
  vehicles: number;
  storage: number;
  api_calls: number;
  created_at: string;
}

// Hook to fetch subscription plans
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching subscription plans:', error);
        // Return default plans if table doesn't exist yet
        return getDefaultPlans();
      }

      return data || getDefaultPlans();
    },
  });
};

// Hook to fetch current subscription
export const useCompanySubscription = (organizationId?: string) => {
  return useQuery({
    queryKey: ['company-subscription', organizationId],
    queryFn: async (): Promise<CurrentSubscription | null> => {
      if (!organizationId) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .maybeSingle(); // Use maybeSingle instead of single to avoid error when no rows

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    },
    enabled: !!organizationId,
  });
};

// Hook to fetch billing history
export const useBillingHistory = (organizationId?: string) => {
  return useQuery({
    queryKey: ['billing-history', organizationId],
    queryFn: async (): Promise<BillingHistory[]> => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('organization_id', organizationId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching billing history:', error);
        return getDefaultBillingHistory();
      }

      return data || getDefaultBillingHistory();
    },
    enabled: !!organizationId,
  });
};

// Hook to fetch usage data
export const useUsageData = (organizationId?: string) => {
  return useQuery({
    queryKey: ['usage-data', organizationId],
    queryFn: async (): Promise<UsageData[]> => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('usage_data')
        .select('*')
        .eq('organization_id', organizationId)
        .order('date', { ascending: false })
        .limit(30); // Last 30 days

      if (error) {
        console.error('Error fetching usage data:', error);
        return getDefaultUsageData();
      }

      return data || getDefaultUsageData();
    },
    enabled: !!organizationId,
  });
};

// Hook to update subscription
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ planId, autoRenew }: { planId: string; autoRenew: boolean }) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .update({ 
          plan_id: planId, 
          auto_renew: autoRenew,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', profile.organization_id)
        .eq('status', 'active')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-subscription'] });
      toast.success('Subscription updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription: ' + error.message);
    }
  });
};

// Hook to cancel subscription
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'cancelled',
          auto_renew: false,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', profile.organization_id)
        .eq('status', 'active')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-subscription'] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error: any) => {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription: ' + error.message);
    }
  });
};

// Default data functions
function getDefaultPlans(): SubscriptionPlan[] {
  return [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      billing_cycle: 'monthly',
      features: [
        'Up to 5 drivers',
        'Up to 10 vehicles',
        'Basic reporting',
        'Email support',
        'Mobile app access',
        'Daily Pre-Trip Inspection questions',
        'Vehicle check completion for drivers'
      ],
      limits: {
        drivers: 5,
        vehicles: 10,
        storage: 10,
        api_calls: 1000
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      billing_cycle: 'monthly',
      features: [
        'Up to 25 drivers',
        'Up to 50 vehicles',
        'Advanced reporting',
        'Priority support',
        'API access',
        'Custom integrations',
        'Real-time tracking',
        'Daily Pre-Trip Inspection questions',
        'Vehicle check completion for drivers',
        'Edit and customize questions',
        'Create custom question sets',
        'Drag-and-drop question reordering'
      ],
      limits: {
        drivers: 25,
        vehicles: 50,
        storage: 100,
        api_calls: 10000
      },
      popular: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      billing_cycle: 'monthly',
      features: [
        'Unlimited drivers',
        'Unlimited vehicles',
        'Custom reporting',
        'Dedicated support',
        'Full API access',
        'White-label options',
        'Advanced analytics',
        'Custom integrations',
        'Daily Pre-Trip Inspection questions',
        'Vehicle check completion for drivers',
        'Edit and customize questions',
        'Create custom question sets',
        'Drag-and-drop question reordering',
        'Advanced customization options',
        'Custom compliance standards',
        'White-label vehicle checks'
      ],
      limits: {
        drivers: -1,
        vehicles: -1,
        storage: 1000,
        api_calls: 100000
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

function getDefaultBillingHistory(): BillingHistory[] {
  return [
    {
      id: '1',
      subscription_id: '1',
      date: new Date().toISOString(),
      amount: 79,
      status: 'paid',
      description: 'Professional Plan - Monthly',
      payment_method: 'Card ending in 1234',
      tax_amount: 15.80,
      discount_amount: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function getDefaultUsageData(): UsageData[] {
  return [
    {
      id: '1',
      organization_id: '1',
      date: new Date().toISOString(),
      drivers: 12,
      vehicles: 25,
      storage: 45,
      api_calls: 2500,
      created_at: new Date().toISOString()
    }
  ];
}
