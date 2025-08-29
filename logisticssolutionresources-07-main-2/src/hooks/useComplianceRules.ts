
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type ComplianceViolation = Tables<'compliance_violations'>;
export type TimeComplianceViolation = ComplianceViolation; // Alias for backward compatibility

export const useTimeComplianceViolations = (driverId?: string) => {
  return useQuery({
    queryKey: ['compliance-violations', driverId],
    queryFn: async () => {
      if (!driverId) return [];
      
      const { data, error } = await supabase
        .from('compliance_violations')
        .select('*')
        .eq('driver_id', driverId)
        .order('violation_date', { ascending: false });

      if (error) throw error;
      return data as ComplianceViolation[];
    },
    enabled: !!driverId
  });
};

export const useComplianceRules = () => {
  return useQuery({
    queryKey: ['compliance-rules'],
    queryFn: async () => {
      return [];
    }
  });
};
