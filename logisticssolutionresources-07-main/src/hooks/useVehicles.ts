import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin?: string;
  fuel_type: string;
  seating_capacity?: number;
  capacity: number; // Required for compatibility
  status: string;
  is_active: boolean; // Required for compatibility
  requires_maintenance?: boolean;
  mileage: number;
  organization_id: string; // Standardized organization ID field
  service_interval_months: number;
  created_at: string;
  updated_at: string;
  last_maintenance?: string;
  next_maintenance?: string;
  mot_expiry: string; // Required for compatibility
  next_service_date: string; // Required for compatibility
  vehicle_number: string; // For backwards compatibility
  type: "bus" | "coach" | "hgv" | "minibus" | "double_decker_bus"; // Required for compatibility
}

export const useVehicles = () => {
  const { user, profile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      fetchVehicles();
    }
  }, [user, profile]);

  const fetchVehicles = async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('vehicles')
        .select('*');

      // For organization-based access
      if (profile.organization_id) {
        query = query.eq('organization_id', profile.organization_id);
      }

      const { data, error } = await query.order('vehicle_number', { ascending: true });

      if (error) {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load vehicles');
        return;
      }

      // Map data to include backwards compatibility fields
      const vehiclesWithCompat = (data || []).map(vehicle => ({
        ...vehicle,
        capacity: 0, // Not available in current schema
        seating_capacity: 0, // Not available in current schema
        is_active: vehicle.status === 'active',
        requires_maintenance: false, // Not available in current schema
        mileage: 0, // Not available in current schema
        fuel_type: 'unknown', // Not available in current schema
        vehicle_number: vehicle.vehicle_number || vehicle.license_plate,
        type: (vehicle.vehicle_type as "bus" | "coach" | "hgv" | "minibus" | "double_decker_bus") || 'bus',
        next_service_date: vehicle.updated_at,
        next_maintenance: vehicle.updated_at,
        mot_expiry: vehicle.updated_at,
        last_maintenance: vehicle.updated_at,
        service_interval_months: 6,
      }));
      setVehicles(vehiclesWithCompat);
    } catch (err) {
      console.error('Error in fetchVehicles:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Calculate vehicle statistics
  const vehicleStats = {
    total: vehicles.length,
    active: vehicles.filter(vehicle => vehicle.status === 'active').length,
    maintenance: vehicles.filter(vehicle => vehicle.status === 'maintenance').length,
    outOfService: vehicles.filter(vehicle => vehicle.status === 'out_of_service').length,
    averageAge: vehicles.length > 0 
      ? Math.round(vehicles.reduce((sum, v) => sum + (new Date().getFullYear() - v.year), 0) / vehicles.length)
      : 0,
  };

  return {
    vehicles,
    data: vehicles, // For backwards compatibility
    loading,
    isLoading: loading, // For backwards compatibility
    error,
    vehicleStats,
    fetchVehicles,
  };
};

export const useCreateVehicle = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleData: any) => {
      if (!profile?.organization_id) {
        throw new Error('Organization not found');
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
      toast.error('Failed to create vehicle: ' + error.message);
    }
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
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
      toast.error('Failed to delete vehicle: ' + error.message);
    }
  });
};