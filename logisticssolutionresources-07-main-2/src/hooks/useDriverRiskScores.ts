
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DriverRiskScore {
  id: string;
  driver_id: string;
  score: number;
  calculated_at: string;
  factors: any;
  organization_id?: string | null;
}

export const useDriverRiskScores = () => {
  return useQuery({
    queryKey: ['driver-risk-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_risk_scores')
        .select('*')
        .order('calculated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as DriverRiskScore[];
    },
  });
};

export const useDriverRiskScore = (driverId: string) => {
  return useQuery({
    queryKey: ['driver-risk-score', driverId],
    queryFn: async () => {
      if (!driverId) return null;
      const { data, error } = await supabase
        .from('driver_risk_scores')
        .select('*')
        .eq('driver_id', driverId)
        .order('calculated_at', { ascending: false })
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as DriverRiskScore | null;
    },
    enabled: !!driverId,
  });
};
