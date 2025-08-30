import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react'; // Added missing import for React.useMemo

export interface TachographRecord {
  id: string;
  organization_id: string;
  driver_id: string;
  vehicle_id: string;
  record_date: string;
  start_time: string;
  end_time: string;
  activity_type: string; // Changed from union type to string for database compatibility
  distance_km: number;
  start_location: string;
  end_location: string;
  speed_data: any;
  violations: string[];
  card_type: string; // Changed from union type to string for database compatibility
  card_number: string;
  download_method: string; // Changed from union type to string for database compatibility
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
    avatar_url?: string;
  };
  vehicle?: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
    license_plate: string;
  };
}

export interface TachographStats {
  totalRecords: number;
  totalDrivingTime: number;
  totalDistance: number;
  violations: number;
  averageDataQuality: number;
  drivers: number;
  vehicles: number;
}

// Separate function for calculating stats to avoid recalculation on every render
const calculateTachographStats = (records: TachographRecord[]): TachographStats => {
  if (!records || records.length === 0) {
    return {
      totalRecords: 0,
      totalDrivingTime: 0,
      totalDistance: 0,
      violations: 0,
      averageDataQuality: 0,
      drivers: 0,
      vehicles: 0,
    };
  }

  const uniqueDrivers = new Set<string>();
  const uniqueVehicles = new Set<string>();
  let totalDrivingTime = 0;
  let totalDistance = 0;
  let totalViolations = 0;
  let totalQualityScore = 0;

  records.forEach(record => {
    // Track unique drivers and vehicles
    if (record.driver_id) uniqueDrivers.add(record.driver_id);
    if (record.vehicle_id) uniqueVehicles.add(record.vehicle_id);

    // Calculate driving time
    if (record.start_time && record.end_time) {
      try {
        const start = new Date(record.start_time);
        const end = new Date(record.end_time);
        const drivingHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (!isNaN(drivingHours) && drivingHours > 0) {
          totalDrivingTime += drivingHours;
        }
      } catch (error) {
        console.warn('Invalid date format for driving time calculation:', record.start_time, record.end_time);
      }
    }

    // Sum distance
    if (record.distance_km && !isNaN(record.distance_km)) {
      totalDistance += record.distance_km;
    }

    // Count violations
    if (record.violations && Array.isArray(record.violations)) {
      totalViolations += record.violations.length;
    }

    // Sum quality scores
    if (record.data_quality_score && !isNaN(record.data_quality_score)) {
      totalQualityScore += record.data_quality_score;
    }
  });

  return {
    totalRecords: records.length,
    totalDrivingTime: Math.round(totalDrivingTime * 100) / 100, // Round to 2 decimal places
    totalDistance: Math.round(totalDistance * 100) / 100,
    violations: totalViolations,
    averageDataQuality: records.length > 0 ? Math.round(totalQualityScore / records.length) : 0,
    drivers: uniqueDrivers.size,
    vehicles: uniqueVehicles.size,
  };
};

// Separate function for fetching data to improve testability and reusability
const fetchTachographRecords = async (
  organizationId: string,
  driverId?: string,
  startDate?: string,
  endDate?: string
): Promise<TachographRecord[]> => {
  if (!organizationId) {
    throw new Error('Organization ID is required');
  }

  try {
    // Build the query with explicit foreign key hints
    let query = supabase
      .from('tachograph_records')
      .select(`
        *,
        driver:profiles!fk_tachograph_records_driver(id, first_name, last_name, email, avatar_url),
        vehicle:vehicles!fk_tachograph_records_vehicle(id, vehicle_number, make, model, license_plate)
      `)
      .eq('organization_id', organizationId)
      .order('record_date', { ascending: false });

    // Apply filters
    if (driverId) {
      query = query.eq('driver_id', driverId);
    }
    if (startDate) {
      query = query.gte('record_date', startDate);
    }
    if (endDate) {
      query = query.lte('record_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tachograph records with joins:', error);
      
      // Fallback to simple query if foreign key relationships don't exist
      if (error.code === 'PGRST200') {
        console.log('Foreign key relationships not found, fetching without joins...');
        
        let simpleQuery = supabase
          .from('tachograph_records')
          .select('*')
          .eq('organization_id', organizationId)
          .order('record_date', { ascending: false });

        if (driverId) {
          simpleQuery = simpleQuery.eq('driver_id', driverId);
        }
        if (startDate) {
          simpleQuery = simpleQuery.gte('record_date', startDate);
        }
        if (endDate) {
          simpleQuery = simpleQuery.lte('record_date', endDate);
        }

        const { data: simpleData, error: simpleError } = await simpleQuery;
        
        if (simpleError) {
          console.error('Error fetching tachograph records without joins:', simpleError);
          throw new Error(`Failed to fetch tachograph records: ${simpleError.message}`);
        }

        return simpleData || [];
      }
      
      throw new Error(`Failed to fetch tachograph records: ${error.message}`);
    }

    return (data as unknown as TachographRecord[]) || [];
  } catch (error) {
    console.error('Error in tachograph data query:', error);
    throw error;
  }
};

export const useTachographData = (driverId?: string, startDate?: string, endDate?: string) => {
  const { profile } = useAuth();

  const {
    data: tachographRecords = [],
    isLoading,
    error,
    isError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['tachograph-records', profile?.organization_id, driverId, startDate, endDate],
    queryFn: () => fetchTachographRecords(profile?.organization_id!, driverId, startDate, endDate),
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaced cacheTime with gcTime)
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Memoize stats calculation to prevent unnecessary recalculations
  const stats = React.useMemo(() => calculateTachographStats(tachographRecords), [tachographRecords]);

  // Enhanced return object with more detailed information
  return {
    tachographRecords,
    stats,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    hasData: tachographRecords.length > 0,
    isEmpty: tachographRecords.length === 0,
    // Additional computed values for convenience
    totalRecords: stats.totalRecords,
    totalDrivingTime: stats.totalDrivingTime,
    totalDistance: stats.totalDistance,
    violations: stats.violations,
    averageDataQuality: stats.averageDataQuality,
    drivers: stats.drivers,
    vehicles: stats.vehicles,
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

      // Validate required fields
      if (!record.record_date) {
        throw new Error('Record date is required');
      }

      const recordData = {
        ...record,
        organization_id: profile.organization_id,
        record_date: record.record_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('tachograph_records')
        .insert([recordData])
        .select()
        .single();

      if (error) {
        console.error('Error creating tachograph record:', error);
        throw new Error(`Failed to create tachograph record: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['tachograph-records'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });
};

export const useUpdateTachographRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TachographRecord> & { id: string }) => {
      if (!id) {
        throw new Error('Record ID is required for updates');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('tachograph_records')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating tachograph record:', error);
        throw new Error(`Failed to update tachograph record: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tachograph-records'] });
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
    },
  });
};

export const useDeleteTachographRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error('Record ID is required for deletion');
      }

      const { error } = await supabase
        .from('tachograph_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tachograph record:', error);
        throw new Error(`Failed to delete tachograph record: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tachograph-records'] });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
    },
  });
};
