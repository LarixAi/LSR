import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TachographRecord {
  id: string;
  organization_id: string;
  driver_id: string;
  vehicle_id: string;
  record_date: string;
  start_time: string;
  end_time: string;
  activity_type: 'driving' | 'rest' | 'break' | 'other_work' | 'availability' | 'poa';
  distance_km: number;
  start_location: string;
  end_location: string;
  speed_data: any;
  violations: string[];
  card_type: 'driver' | 'company' | 'workshop' | 'control';
  card_number: string;
  download_method: 'manual' | 'automatic' | 'remote';
  download_timestamp: string;
  equipment_serial_number: string;
  calibration_date: string;
  next_calibration_date: string;
  data_quality_score: number;
  is_complete: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  driver?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  vehicle?: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
    license_plate: string;
  };
}

export const useTachographData = (driverId?: string, startDate?: string, endDate?: string) => {
  const { profile } = useAuth();

  // Fetch real tachograph records from database
  const { data: tachographRecords = [], isLoading, error } = useQuery({
    queryKey: ['tachograph-records', profile?.organization_id, driverId, startDate, endDate],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      try {
        let query = supabase
          .from('tachograph_records')
          .select(`
            *,
            driver:profiles!tachograph_records_driver_id_fkey(id, first_name, last_name, email),
            vehicle:vehicles!tachograph_records_vehicle_id_fkey(id, vehicle_number, make, model, license_plate)
          `)
          .eq('organization_id', profile.organization_id)
          .order('record_date', { ascending: false });

        // Filter by driver if specified
        if (driverId) {
          query = query.eq('driver_id', driverId);
        }

        // Filter by date range if specified
        if (startDate) {
          query = query.gte('record_date', startDate);
        }
        if (endDate) {
          query = query.lte('record_date', endDate);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error('Error fetching tachograph records:', fetchError);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in tachograph data query:', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id,
  });

  // Calculate statistics from real data
  const calculateStats = () => {
    if (!tachographRecords || tachographRecords.length === 0) {
      return {
        totalRecords: 0,
        totalDrivingTime: 0,
        totalDistance: 0,
        violations: 0,
        averageDataQuality: 0,
        drivers: new Set(),
        vehicles: new Set(),
      };
    }

    const stats = {
      totalRecords: tachographRecords.length,
      totalDrivingTime: 0,
      totalDistance: 0,
      violations: 0,
      averageDataQuality: 0,
      drivers: new Set<string>(),
      vehicles: new Set<string>(),
    };

    let totalQualityScore = 0;

    tachographRecords.forEach(record => {
      // Calculate driving time
      if (record.start_time && record.end_time) {
        const start = new Date(record.start_time);
        const end = new Date(record.end_time);
        const drivingHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        stats.totalDrivingTime += drivingHours;
      }

      // Sum distance
      if (record.distance_km) {
        stats.totalDistance += record.distance_km;
      }

      // Count violations
      if (record.violations && record.violations.length > 0) {
        stats.violations += record.violations.length;
      }

      // Track unique drivers and vehicles
      if (record.driver_id) stats.drivers.add(record.driver_id);
      if (record.vehicle_id) stats.vehicles.add(record.vehicle_id);

      // Sum quality scores
      if (record.data_quality_score) {
        totalQualityScore += record.data_quality_score;
      }
    });

    stats.averageDataQuality = stats.totalRecords > 0 ? totalQualityScore / stats.totalRecords : 0;

    return {
      ...stats,
      drivers: stats.drivers.size,
      vehicles: stats.vehicles.size,
    };
  };

  const stats = calculateStats();

  return {
    tachographRecords,
    isLoading,
    error,
    stats,
    hasData: tachographRecords.length > 0,
  };
};

export const useCreateTachographRecord = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: Partial<TachographRecord>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('tachograph_records')
        .insert([{
          ...record,
          organization_id: profile.organization_id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tachograph-records'] });
    },
  });
};

export const useUpdateTachographRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TachographRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('tachograph_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tachograph-records'] });
    },
  });
};

export const useDeleteTachographRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tachograph_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tachograph-records'] });
    },
  });
};
