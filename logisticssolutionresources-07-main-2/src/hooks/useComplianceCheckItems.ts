
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ComplianceCheckItem = {
  id: string;
  organization_id?: string | null;
  category: string;
  item_name: string;
  description?: string | null;
  is_mandatory: boolean;
  points_value: number;
  regulatory_reference?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export const useComplianceCheckItems = () => {
  return useQuery({
    queryKey: ['compliance-check-items'],
    queryFn: async () => {
      return [] as ComplianceCheckItem[];
    },
  });
};

export const useCreateComplianceCheckItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (itemData: Omit<ComplianceCheckItem, 'id' | 'created_at' | 'updated_at'>) => {
      throw new Error('Compliance check items creation not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-check-items'] });
    },
  });
};
