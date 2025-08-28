import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';
import type { Tables } from '@/integrations/supabase/types';

export interface VehicleCheck extends Tables<'vehicle_checks'> {
  vehicles?: {
    vehicle_number: string;
    license_plate: string;
    make: string;
    model: string;
  };
  driver_profile?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

export const useOptimizedVehicleChecks = (vehicleId?: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['vehicle-checks-optimized', vehicleId, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return [];
      }
      
      try {
        // Use the optimized organization data hook approach
        let baseQuery = supabase
          .from('vehicle_checks')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('check_date', { ascending: false });

        if (vehicleId) {
          baseQuery = baseQuery.eq('vehicle_id', vehicleId);
        }

        const { data: checks, error: checksError } = await baseQuery;

        if (checksError) {
          logger.warn('Vehicle checks query failed, returning empty array', checksError.message);
          return [];
        }

        return checks || [];

      } catch (error) {
        logger.error('Vehicle checks fetch completely failed', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

export const useOptimizedCreateVehicleCheck = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (checkData: Omit<Tables<'vehicle_checks'>, 'id' | 'created_at' | 'updated_at'>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required to create vehicle check');
      }
      
      const { data, error } = await supabase
        .from('vehicle_checks')
        .insert([{ ...checkData, organization_id: profile.organization_id }])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create vehicle check', error.message);
        throw new Error(`Failed to create vehicle check: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-checks'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-checks-optimized'] });
      toast({
        title: "Success",
        description: "Vehicle check submitted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to submit vehicle check: " + error.message,
        variant: "destructive",
      });
    }
  });
};