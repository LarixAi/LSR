
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ComplianceStandard {
  id: string;
  category: string;
  requirement_name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  points_deduction: number;
  is_mandatory: boolean;
  regulation_reference: string;
  created_at: string;
}

export interface DriverComplianceScore {
  id: string;
  driver_id: string;
  organization_id?: string;
  score_date: string;
  overall_score: number;
  vehicle_check_score?: number;
  safety_score?: number;
  documentation_score?: number;
  incident_count?: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  created_at: string;
}

export interface DriverComplianceScoreInsert {
  driver_id: string;
  organization_id?: string;
  score_date: string;
  overall_score: number;
  vehicle_check_score?: number;
  safety_score?: number;
  documentation_score?: number;
  incident_count?: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

export const useComplianceStandards = () => {
  return useQuery({
    queryKey: ['compliance-standards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_standards')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching compliance standards:', error);
        return [];
      }

      return data || [];
    },
  });
};

export const useDriverComplianceScore = (driverId?: string) => {
  return useQuery({
    queryKey: ['driver-compliance-score', driverId],
    queryFn: async () => {
      if (!driverId) return null;
      
      const { data, error } = await supabase
        .from('driver_compliance_scores')
        .select('*')
        .eq('driver_id', driverId)
        .order('score_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching driver compliance score:', error);
        return null;
      }

      return data;
    },
    enabled: !!driverId,
  });
};

export const useUpdateDriverComplianceScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (scoreData: DriverComplianceScoreInsert) => {
      const { data, error } = await supabase
        .from('driver_compliance_scores')
        .upsert(scoreData, { 
          onConflict: 'driver_id,score_date',
          returning: true 
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update compliance score: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['driver-compliance-score', data.driver_id] });
    },
  });
};
