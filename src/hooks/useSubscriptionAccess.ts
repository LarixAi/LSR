import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionAccess {
  canEditQuestions: boolean;
  canCreateQuestionSets: boolean;
  canReorderQuestions: boolean;
  canAccessAdvancedFeatures: boolean;
  currentPlan: string | null;
  isProfessionalOrHigher: boolean;
  isEnterprise: boolean;
  upgradeRequired: boolean;
  upgradeMessage: string;
}

export const useSubscriptionAccess = (): SubscriptionAccess => {
  const { profile } = useAuth();

  const { data: subscription } = useQuery({
    queryKey: ['subscription-access', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return {
          planName: null,
          planId: null
        };
      }

      // Get current subscription
      const { data: currentSubscription } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans(name)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('status', 'active')
        .maybeSingle();

      if (currentSubscription) {
        return {
          planName: currentSubscription.plan?.name || 'Unknown',
          planId: currentSubscription.plan_id
        };
      }

      // Check if organization has a trial
      const { data: trial } = await supabase
        .from('organization_trials')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('trial_status', 'active')
        .maybeSingle();

      if (trial) {
        return {
          planName: 'Trial',
          planId: 'trial'
        };
      }

      return {
        planName: 'Starter',
        planId: 'starter'
      };
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const planName = subscription?.planName || 'Starter';
  const isProfessionalOrHigher = ['Professional', 'Enterprise', 'Trial'].includes(planName);
  const isEnterprise = planName === 'Enterprise';
  const isTrial = planName === 'Trial';

  // Define access rules
  const canEditQuestions = isProfessionalOrHigher;
  const canCreateQuestionSets = isProfessionalOrHigher;
  const canReorderQuestions = isProfessionalOrHigher;
  const canAccessAdvancedFeatures = isProfessionalOrHigher;

  const upgradeRequired = !isProfessionalOrHigher;
  const upgradeMessage = upgradeRequired 
    ? 'Upgrade to Professional or Enterprise plan to edit and create custom question sets'
    : '';

  return {
    canEditQuestions,
    canCreateQuestionSets,
    canReorderQuestions,
    canAccessAdvancedFeatures,
    currentPlan: planName,
    isProfessionalOrHigher,
    isEnterprise,
    upgradeRequired,
    upgradeMessage
  };
};



