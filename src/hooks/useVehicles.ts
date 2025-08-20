import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Vehicle {
  id: string;
  vehicle_number: string;
  license_plate: string;
  make?: string;
  model?: string;
  year?: number;
  capacity: number;
  fuel_type?: string;
  mileage?: number;
  is_active?: boolean; // Made optional since it's computed from status
  status?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Compatibility fields
  type?: "bus" | "coach" | "hgv" | "minibus" | "double_decker_bus";
  seating_capacity?: number;
  requires_maintenance?: boolean;
  last_maintenance?: string;
  next_maintenance?: string;
  mot_expiry?: string;
  next_service_date?: string;
  service_interval_months?: number;
}

export const useVehicles = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['vehicles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        console.log('❌ No organization ID available');
        throw new Error('Organization ID is required');
      }

      console.log('🚗 Fetching vehicles from database...');
      console.log('🔍 Organization ID:', profile.organization_id);
      
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('vehicle_number', { ascending: true });

        if (error) {
          console.error('❌ Database error fetching vehicles:', error);
          throw error;
        }

        console.log('✅ Raw vehicles data from database:', data);
        console.log('📊 Number of vehicles found:', data?.length || 0);
        
        if (!data || data.length === 0) {
          console.log('⚠️ No vehicles found in database for organization:', profile.organization_id);
          console.log('💡 This is normal if you haven\'t added any vehicles yet');
          return [];
        }
        
        // Transform data to match expected interface
        const transformedVehicles = data.map(vehicle => {
          console.log('🔄 Transforming vehicle:', vehicle);
          return {
            ...vehicle,
            // Map database fields to interface
            status: vehicle.status || 'active',
            capacity: 0, // Not in current schema
            is_active: vehicle.status === 'active' || vehicle.status === null, // Consider null as active
            fuel_type: vehicle.fuel_type || 'unknown',
            mileage: 0, // Not in current schema
            // Compatibility fields with defaults
            type: 'bus' as const,
            seating_capacity: 0, // Not in current schema
            requires_maintenance: vehicle.status === 'maintenance',
            last_maintenance: vehicle.updated_at,
            next_maintenance: vehicle.updated_at,
            mot_expiry: vehicle.updated_at,
            next_service_date: vehicle.updated_at,
            service_interval_months: 6,
          };
        });

        console.log('✅ Transformed vehicles:', transformedVehicles);
        return transformedVehicles as Vehicle[];
      } catch (error) {
        console.error('💥 Error in useVehicles:', error);
        throw error;
      }
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateVehicle = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleData: Partial<Vehicle>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          ...vehicleData,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating vehicle:', error);
      toast.error('Failed to create vehicle: ' + error.message);
    }
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Vehicle> }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle: ' + error.message);
    }
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle: ' + error.message);
    }
  });
};

export const useVehicleStats = () => {
  const { data: vehicles = [] } = useVehicles();

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active' || v.is_active).length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    out_of_service: vehicles.filter(v => v.status === 'out_of_service' || !v.is_active).length,
    average_age: vehicles.length > 0 
      ? Math.round(vehicles.reduce((sum, v) => sum + (new Date().getFullYear() - (v.year || 2020)), 0) / vehicles.length)
      : 0,
    by_type: vehicles.reduce((acc, vehicle) => {
      const type = vehicle.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return stats;
};

// Legacy compatibility - keeping for backward compatibility
export { useVehicles as default };

// Additional legacy exports for components that might be using the old pattern
export const fetchVehicles = () => {
  console.warn('fetchVehicles is deprecated. Use useVehicles hook instead.');
};