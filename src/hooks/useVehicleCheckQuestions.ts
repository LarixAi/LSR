import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VehicleCheckQuestion {
  id: string;
  question_text: string;
  question_type: 'yes_no' | 'multiple_choice' | 'text' | 'number' | 'photo';
  is_required: boolean;
  is_critical: boolean;
  order_index: number;
  category: 'exterior' | 'interior' | 'engine' | 'safety' | 'documentation';
  options?: string[];
  guidance?: string;
  template_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useVehicleCheckQuestions = (templateId?: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['vehicle-check-questions', templateId, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return [];
      }
      
      try {
        // Try to fetch from vehicle_check_questions table
        const { data, error } = await supabase
          .from('vehicle_check_questions')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('order_index', { ascending: true });

        if (error) {
          // If table doesn't exist, return empty array
          if (error.code === '42P01' || error.code === 'PGRST205') {
            console.warn('vehicle_check_questions table not found, returning empty array');
            return [];
          }
          throw error;
        }

        return data || [];
      } catch (error) {
        console.warn('Error fetching vehicle check questions:', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};
