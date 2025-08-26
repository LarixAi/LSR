import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserAgreement {
  id: string;
  agreement_type: 'terms_of_service' | 'privacy_policy';
  version: string;
  title: string;
  content: string;
  effective_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgreementStatus {
  needs_terms_acceptance: boolean;
  needs_privacy_acceptance: boolean;
  latest_terms_version: string | null;
  latest_privacy_version: string | null;
}

export interface AcceptAgreementData {
  agreement_type: 'terms_of_service' | 'privacy_policy';
  version: string;
}

export const useUserAgreements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's agreement status
  const {
    data: agreementStatus,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['user-agreement-status', user?.id],
    queryFn: async (): Promise<AgreementStatus> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('check_user_agreement_status', { user_id_param: user.id });

      if (error) throw error;
      return data[0] || {
        needs_terms_acceptance: false,
        needs_privacy_acceptance: false,
        latest_terms_version: null,
        latest_privacy_version: null
      };
    },
    enabled: !!user?.id
  });

  // Get latest agreements
  const {
    data: agreements,
    isLoading: isLoadingAgreements,
    error: agreementsError
  } = useQuery({
    queryKey: ['user-agreements'],
    queryFn: async (): Promise<UserAgreement[]> => {
      const { data, error } = await supabase
        .from('user_agreements')
        .select('*')
        .eq('is_active', true)
        .order('effective_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Accept agreement mutation
  const acceptAgreementMutation = useMutation({
    mutationFn: async (data: AcceptAgreementData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get the agreement ID
      const { data: agreement, error: agreementError } = await supabase
        .from('user_agreements')
        .select('id')
        .eq('agreement_type', data.agreement_type)
        .eq('version', data.version)
        .single();

      if (agreementError || !agreement) {
        throw new Error('Agreement not found');
      }

      // Record the acceptance
      const { error: acceptanceError } = await supabase
        .from('user_agreement_acceptances')
        .insert({
          user_id: user.id,
          agreement_id: agreement.id,
          ip_address: '127.0.0.1', // In production, get from request
          user_agent: navigator.userAgent
        });

      if (acceptanceError) throw acceptanceError;

      // Update user profile
      const updateData: any = {};
      if (data.agreement_type === 'terms_of_service') {
        updateData.terms_accepted = true;
        updateData.terms_accepted_date = new Date().toISOString();
        updateData.terms_version = data.version;
      } else if (data.agreement_type === 'privacy_policy') {
        updateData.privacy_policy_accepted = true;
        updateData.privacy_policy_accepted_date = new Date().toISOString();
        updateData.privacy_policy_version = data.version;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Agreement Accepted",
        description: "Thank you for accepting the agreement.",
      });
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-agreement-status'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept agreement",
        variant: "destructive",
      });
    }
  });

  // Check if user needs to accept any agreements
  const needsAgreementAcceptance = agreementStatus && (
    agreementStatus.needs_terms_acceptance || 
    agreementStatus.needs_privacy_acceptance
  );

  // Get specific agreement by type
  const getAgreementByType = (type: 'terms_of_service' | 'privacy_policy') => {
    return agreements?.find(agreement => agreement.agreement_type === type);
  };

  // Accept terms of service
  const acceptTermsOfService = () => {
    if (agreementStatus?.latest_terms_version) {
      acceptAgreementMutation.mutate({
        agreement_type: 'terms_of_service',
        version: agreementStatus.latest_terms_version
      });
    }
  };

  // Accept privacy policy
  const acceptPrivacyPolicy = () => {
    if (agreementStatus?.latest_privacy_version) {
      acceptAgreementMutation.mutate({
        agreement_type: 'privacy_policy',
        version: agreementStatus.latest_privacy_version
      });
    }
  };

  return {
    // Data
    agreementStatus,
    agreements,
    needsAgreementAcceptance,
    
    // Loading states
    isLoadingStatus,
    isLoadingAgreements,
    isAccepting: acceptAgreementMutation.isPending,
    
    // Errors
    statusError,
    agreementsError,
    
    // Actions
    acceptTermsOfService,
    acceptPrivacyPolicy,
    refetchStatus,
    
    // Utilities
    getAgreementByType
  };
};
