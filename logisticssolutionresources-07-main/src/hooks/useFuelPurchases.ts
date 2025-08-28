import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useFuelPurchases = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['fuel-purchases', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for fuel purchases fetch');
        return [];
      }

      console.log('Fetching fuel purchases from database...');
      
      const { data, error } = await supabase
        .from('fuel_purchases')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching fuel purchases:', error);
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

export const useDriverFuelPurchases = (driverId?: string) => {
  const { user } = useAuth();
  const targetDriverId = driverId || user?.id;

  return useQuery({
    queryKey: ['driver-fuel-purchases', targetDriverId],
    queryFn: async () => {
      if (!targetDriverId) {
        console.log('No driver ID available for fuel purchases fetch');
        return [];
      }

      console.log('Fetching driver fuel purchases from database...');
      
      const { data, error } = await supabase
        .from('fuel_purchases')
        .select('*')
        .eq('driver_id', targetDriverId)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching driver fuel purchases:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!targetDriverId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};