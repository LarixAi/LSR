
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useComplianceViolations = () => {
  return useQuery({
    queryKey: ['compliance-violations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_violations')
        .select(`
          *,
          profiles:driver_id(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });
};

export const useCreateComplianceViolation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (violation: any) => {
      const { data, error } = await supabase
        .from('compliance_violations')
        .insert([violation])
        .select()
        .single();

      if (error) throw error;
      return data;
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
