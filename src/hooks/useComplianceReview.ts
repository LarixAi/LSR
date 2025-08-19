
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ComplianceReviewData = {
  vehicle_check_id: string;
  compliance_review_status: 'approved' | 'rejected' | 'requires_action';
  compliance_review_notes?: string;
  review_priority?: 'low' | 'normal' | 'high' | 'urgent';
};

export const useUpdateComplianceReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewData: ComplianceReviewData) => {
      const { data, error } = await supabase
        .from('vehicle_checks')
        .update({
          compliance_status: reviewData.compliance_review_status,
          notes: reviewData.compliance_review_notes,
        })
        .eq('id', reviewData.vehicle_check_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-checks'] });
    },
  });
};
