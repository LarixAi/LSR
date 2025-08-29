
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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

export const useVehicleChecks = (vehicleId?: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['vehicle-checks', vehicleId, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return [];
      }
      
      try {
        // Simplified query without complex joins to avoid 400 errors
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
          console.warn('Vehicle checks query failed:', checksError.message);
          return [];
        }

        if (!checks || checks.length === 0) {
          return [];
        }

        // Fetch related data separately to avoid join issues
        const vehicleIds = [...new Set(checks.map(check => check.vehicle_id).filter(Boolean))];
        const driverIds = [...new Set(checks.map(check => check.driver_id).filter(Boolean))];

        const [vehiclesData, driversData] = await Promise.all([
          vehicleIds.length > 0 ? supabase
            .from('vehicles')
            .select('id, vehicle_number, license_plate, make, model, organization_id')
            .in('id', vehicleIds)
            .eq('organization_id', profile.organization_id) : Promise.resolve({ data: [], error: null }),
          
          driverIds.length > 0 ? supabase
            .from('profiles')
            .select('id, first_name, last_name, employee_id, organization_id')
            .in('id', driverIds)
            .eq('organization_id', profile.organization_id) : Promise.resolve({ data: [], error: null })
        ]);

        // Create lookup maps
        const vehicleMap = new Map((vehiclesData.data || []).map(v => [v.id, v]));
        const driverMap = new Map((driversData.data || []).map(d => [d.id, d]));

        // Combine data
        const enrichedChecks = checks.map(check => ({
          ...check,
          vehicles: check.vehicle_id ? vehicleMap.get(check.vehicle_id) : undefined,
          driver_profile: check.driver_id ? driverMap.get(check.driver_id) : undefined
        }));

        // Filter for organization security
        return enrichedChecks.filter(check => 
          !check.vehicles || check.vehicles.organization_id === profile.organization_id
        ) as VehicleCheck[];

      } catch (error) {
        console.warn('Vehicle checks fetch failed:', error instanceof Error ? error.message : 'Unknown error');
        return [];
      }
    },
    enabled: !!profile?.organization_id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useCreateVehicleCheck = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (checkData: Omit<Tables<'vehicle_checks'>, 'id' | 'created_at' | 'updated_at'>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required to create vehicle check');
      }
      
      // Verify the vehicle belongs to the user's organization
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('organization_id')
        .eq('id', checkData.vehicle_id)
        .single();
        
      if (vehicleError || !vehicle || vehicle.organization_id !== profile.organization_id) {
        throw new Error('Vehicle not found or access denied');
      }
      
      // Verify the driver belongs to the user's organization
      const { data: driver, error: driverError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', checkData.driver_id)
        .single();
        
      if (driverError || !driver || driver.organization_id !== profile.organization_id) {
        throw new Error('Driver not found or access denied');
      }
      
      const { data, error } = await supabase
        .from('vehicle_checks')
        .insert([checkData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create vehicle check: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-checks'] });
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
