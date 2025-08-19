
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type ComplianceViolation = Tables<'compliance_violations'>;
export type TimeComplianceViolation = ComplianceViolation; // Alias for backward compatibility

export const useTimeComplianceViolations = (driverId?: string) => {
  return useQuery({
    queryKey: ['compliance-violations', driverId],
    queryFn: async () => {
      // Table doesn't exist yet, return empty array
      console.warn('compliance_violations feature disabled - table not created yet');
      return [];
    },
    enabled: false // Disable this query completely until table is created
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
