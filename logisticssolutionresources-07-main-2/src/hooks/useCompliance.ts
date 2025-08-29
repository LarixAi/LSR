
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ComplianceStandard {
  id: string;
  category: string;
  requirement_name: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  points_deduction: number;
  is_mandatory: boolean;
  regulation_reference?: string;
  organization_id?: string;
}

export interface DriverComplianceScore {
  id: string;
  driver_id: string;
  organization_id?: string;
  score_date: string;
  overall_score: number;
  vehicle_check_score: number;
  safety_score: number;
  documentation_score: number;
  incident_count: number;
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
      console.log('Mock: Fetching compliance standards');
      
      // Mock data since compliance_standards table doesn't exist yet
      const mockStandards: ComplianceStandard[] = [
        {
          id: '1',
          category: 'Vehicle Safety',
          requirement_name: 'Daily Vehicle Check',
          description: 'Complete daily vehicle inspection',
          severity: 'high',
          points_deduction: 10,
          is_mandatory: true,
          regulation_reference: 'DOT-001'
        },
        {
          id: '2', 
          category: 'Documentation',
          requirement_name: 'Valid Driver License',
          description: 'Maintain valid commercial driver license',
          severity: 'critical',
          points_deduction: 25,
          is_mandatory: true,
          regulation_reference: 'DOT-002'
        }
      ];
      
      return mockStandards;
    },
  });
};

export const useDriverComplianceScore = (driverId?: string) => {
  return useQuery({
    queryKey: ['driver-compliance-score', driverId],
    queryFn: async () => {
      if (!driverId) return null;
      
      console.log('Mock: Fetching driver compliance score for:', driverId);
      
      // Mock data since driver_compliance_scores table doesn't exist yet
      const mockScore: DriverComplianceScore = {
        id: '1',
        driver_id: driverId,
        score_date: new Date().toISOString().split('T')[0],
        overall_score: 85,
        vehicle_check_score: 90,
        safety_score: 80,
        documentation_score: 85,
        incident_count: 0,
        risk_level: 'low',
        created_at: new Date().toISOString()
      };
      
      return mockScore;
    },
    enabled: !!driverId,
  });
};

export const useUpdateDriverComplianceScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (scoreData: DriverComplianceScoreInsert) => {
      console.log('Mock: Updating driver compliance score:', scoreData);
      
      // Mock implementation
      return {
        ...scoreData,
        id: '1',
        created_at: new Date().toISOString()
      } as DriverComplianceScore;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['driver-compliance-score', data.driver_id] });
    },
  });
};
