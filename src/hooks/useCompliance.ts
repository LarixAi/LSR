
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
      
      // Since the driver_compliance_scores table doesn't exist yet, return mock data directly
      // This avoids the 406/PGRST116 errors entirely
      console.log('Using mock compliance data - driver_compliance_scores table not implemented yet');
      
      return {
        id: 'mock-compliance-1',
        driver_id: driverId,
        organization_id: 'mock-org-1',
        overall_score: 95,
        vehicle_check_score: 100,
        safety_score: 90,
        documentation_score: 95,
        incident_count: 0,
        risk_level: 'low',
        notes: 'Mock compliance data - table not implemented yet',
        created_at: new Date().toISOString()
      };
    },
    enabled: !!driverId,
  });
};

export const useUpdateDriverComplianceScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (scoreData: DriverComplianceScoreInsert) => {
      // Since the driver_compliance_scores table doesn't exist yet, simulate a successful update
      console.log('Mock update compliance score - driver_compliance_scores table not implemented yet');
      
      // Return the input data as if it was successfully saved
      return {
        ...scoreData,
        id: 'mock-updated-compliance',
        created_at: new Date().toISOString()
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['driver-compliance-score', data.driver_id] });
    },
  });
};
