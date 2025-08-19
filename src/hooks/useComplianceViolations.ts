
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useComplianceViolations = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['compliance-violations', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      try {
        const { data, error } = await supabase
          .from('compliance_violations')
          .select(`
            *,
            driver:profiles!compliance_violations_driver_id_fkey(id, first_name, last_name, email),
            vehicle:vehicles!compliance_violations_vehicle_id_fkey(id, vehicle_number, make, model)
          `)
          .eq('organization_id', profile.organization_id)
          .order('violation_date', { ascending: false });

        if (error) {
          console.warn('Error fetching compliance violations:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.warn('Error fetching compliance violations:', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id
  });
};

export const useCreateComplianceViolation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (violation: any) => {
      try {
        const { data, error } = await supabase
          .from('compliance_violations')
          .insert([violation])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.warn('compliance_violations table not found, operation skipped');
        throw new Error('Compliance violations feature not available');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-violations'] });
      toast({
        title: 'Success',
        description: 'Compliance violation recorded successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record compliance violation',
        variant: 'destructive',
      });
    }
  });
};
