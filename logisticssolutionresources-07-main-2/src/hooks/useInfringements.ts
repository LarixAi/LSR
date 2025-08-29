import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useInfringements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['infringements', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for infringements fetch');
        return [];
      }

      console.log('Fetching infringements from database...');
      
      const { data, error } = await supabase
        .from('infringements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching infringements:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('relationship')) {
        return false;
      }
      return failureCount < 2;
    }
  });
};

export const useDriverPointsHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['driver-points-history', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for driver points history fetch');
        return [];
      }

      console.log('Fetching driver points history from database...');
      
      const { data, error } = await supabase
        .from('driver_points_history')
        .select('*')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching driver points history:', error);
        throw error;
      }

      console.log('Fetched driver points history:', data);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};