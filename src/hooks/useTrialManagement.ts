import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TrialStatus {
  isActive: boolean;
  daysLeft: number;
  trialEndDate: string;
  maxDrivers: number;
  currentDrivers: number;
  organizationId: string;
}

export interface TrialSubscription {
  id: string;
  organizationId: string;
  trialStartDate: string;
  trialEndDate: string;
  trialStatus: 'active' | 'expired' | 'converted';
  maxDrivers: number;
  features: string;
}

// Get trial status for current organization
export const useTrialStatus = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['trial-status', profile?.organization_id],
    queryFn: async (): Promise<TrialStatus> => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID found');
      }

      try {
        // Check if organization has a trial
        const { data: trials, error: trialError } = await supabase
          .from('organization_trials')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Handle table doesn't exist (406 error) or no records found
        if (trialError) {
          if (trialError.code === 'PGRST116' || 
              trialError.code === '406' || 
              trialError.message?.includes('relation "organization_trials" does not exist') ||
              trialError.message?.includes('Cannot coerce the result to a single JSON object')) {
            console.warn('organization_trials table does not exist or is not accessible:', trialError.message);
            // Continue with default values
          } else {
            throw trialError;
          }
        }

        // Get the most recent trial record
        const trial = trials && trials.length > 0 ? trials[0] : null;

        // Get current driver count
        const { data: drivers, error: driversError } = await supabase
          .from('profiles')
          .select('id')
          .eq('organization_id', profile.organization_id)
          .eq('role', 'driver');

        if (driversError) {
          throw driversError;
        }

        const currentDrivers = drivers?.length || 0;
        const trialEndDate = trial?.trial_end_date || new Date().toISOString();
        const trialStartDate = trial?.trial_start_date || new Date().toISOString();
        
        // Calculate days left
        const endDate = new Date(trialEndDate);
        const now = new Date();
        const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        const isActive = trial?.trial_status === 'active' && daysLeft > 0;
        const maxDrivers = trial?.max_drivers || 10;

        return {
          isActive,
          daysLeft,
          trialEndDate,
          maxDrivers,
          currentDrivers,
          organizationId: profile.organization_id
        };
      } catch (error) {
        console.warn('Trial status check failed:', error);
        // Return default trial status if table doesn't exist
        return {
          isActive: false,
          daysLeft: 0,
          trialEndDate: new Date().toISOString(),
          maxDrivers: 10,
          currentDrivers: 0,
          organizationId: profile?.organization_id || ''
        };
      }
    },
    enabled: !!profile?.organization_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Create a new trial for an organization
export const useCreateTrial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days trial

      try {
        const { data, error } = await supabase
          .from('organization_trials')
          .insert({
            organization_id: organizationId,
            trial_start_date: trialStartDate.toISOString(),
            trial_end_date: trialEndDate.toISOString(),
            trial_status: 'active',
            max_drivers: 10,
            features: 'professional'
          })
          .select()
          .single();

        if (error) {
          // Handle table doesn't exist
          if (error.code === '406' || error.message?.includes('relation "organization_trials" does not exist')) {
            throw new Error('Trial management tables not set up. Please run the database migration first.');
          }
          throw error;
        }

        return data;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Trial management tables not set up')) {
          throw error;
        }
        throw new Error('Failed to create trial. Please try again.');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-status'] });
      toast({
        title: 'Trial Started',
        description: 'Your 14-day free trial has been activated!',
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error && error.message.includes('Trial management tables not set up')
        ? 'Trial management tables not set up. Please run the database migration first.'
        : 'Failed to start trial. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// Check if organization can add more drivers
export const useCheckDriverLimit = () => {
  const { profile } = useAuth();
  const { data: trialStatus } = useTrialStatus();
  
  return useQuery({
    queryKey: ['driver-limit-check', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID found');
      }

      try {
        // Get current driver count
        const { data: drivers, error: driversError } = await supabase
          .from('profiles')
          .select('id')
          .eq('organization_id', profile.organization_id)
          .eq('role', 'driver');

        if (driversError) {
          throw driversError;
        }

        const currentDrivers = drivers?.length || 0;
        const maxDrivers = trialStatus?.maxDrivers || 10;
        
        return {
          canAddDriver: currentDrivers < maxDrivers,
          currentDrivers,
          maxDrivers,
          remainingSlots: Math.max(0, maxDrivers - currentDrivers)
        };
      } catch (error) {
        console.warn('Driver limit check failed:', error);
        return {
          canAddDriver: true,
          currentDrivers: 0,
          maxDrivers: 10,
          remainingSlots: 10
        };
      }
    },
    enabled: !!profile?.organization_id && !!trialStatus,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Convert trial to paid subscription
export const useConvertTrial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ organizationId, planId }: { organizationId: string; planId: string }) => {
      const { data, error } = await supabase
        .from('organization_trials')
        .update({ trial_status: 'converted' })
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Here you would typically also create a subscription record
      // For now, we'll just update the trial status
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-status'] });
      toast({
        title: 'Trial Converted',
        description: 'Your trial has been successfully converted to a paid plan!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to convert trial. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Handle trial expiration
export const useHandleTrialExpiration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const { data, error } = await supabase
        .from('organization_trials')
        .update({ trial_status: 'expired' })
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-status'] });
      toast({
        title: 'Trial Expired',
        description: 'Your trial has expired. Please upgrade to continue using the service.',
        variant: 'destructive',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to handle trial expiration.',
        variant: 'destructive',
      });
    },
  });
};
