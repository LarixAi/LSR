import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface VehicleInspection {
  id: string;
  driver_id: string;
  vehicle_id: string;
  inspection_type: string;
  notes?: string;
  signature_data?: string;
  walkaround_data: any;
  location_data: any;
  defects_found: boolean;
  overall_status: 'pending' | 'passed' | 'flagged' | 'failed';
  inspection_date: string;
  start_time: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
    license_plate: string;
  };
  driver?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface InspectionSubmissionData {
  vehicle_id: string;
  inspection_type: string;
  notes?: string;
  defects_found?: boolean;
  overall_status?: string;
  walkaround_data?: any;
  location_data?: any;
  signature_data?: string;
}

export interface InspectionStats {
  total: number;
  byStatus: {
    pending: number;
    passed: number;
    flagged: number;
    failed: number;
  };
  byType: {
    daily_check: number;
    pre_trip: number;
    post_trip: number;
    weekly: number;
    monthly: number;
    initial: number;
    recheck: number;
    breakdown: number;
  };
  defectsFound: number;
  recentInspections: number; // Last 7 days
}

export const useVehicleInspections = (organizationId?: string, driverId?: string) => {
  const { profile } = useAuth();

  // Fetch vehicle inspections with related data
  const { data: inspections = [], isLoading, error } = useQuery({
    queryKey: ['vehicle-inspections', organizationId, driverId],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        // First, get the vehicle inspections
        let query = supabase
          .from('vehicle_inspections')
          .select('*')
          .order('created_at', { ascending: false });

        // Filter by driver if specified
        if (driverId) {
          query = query.eq('driver_id', driverId);
        }

        const { data: inspectionData, error: inspectionError } = await query;

        if (inspectionError) {
          console.error('Error fetching vehicle inspections:', inspectionError);
          return [];
        }

        if (!inspectionData || inspectionData.length === 0) {
          return [];
        }

        // Extract unique IDs for related data
        const vehicleIds = [...new Set(inspectionData.map(vi => vi.vehicle_id).filter(Boolean))];
        const driverIds = [...new Set(inspectionData.map(vi => vi.driver_id).filter(Boolean))];

        // Fetch related data in parallel
        const [vehiclesData, driversData] = await Promise.all([
          vehicleIds.length > 0 ? supabase
            .from('vehicles')
            .select('id, vehicle_number, make, model, license_plate')
            .in('id', vehicleIds)
            .eq('organization_id', organizationId) : { data: [] },
          driverIds.length > 0 ? supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', driverIds)
            .eq('organization_id', organizationId) : { data: [] }
        ]);

        // Create maps for efficient lookup
        const vehiclesMap = new Map(
          (vehiclesData.data || []).map(v => [v.id, v])
        );
        const driversMap = new Map(
          (driversData.data || []).map(d => [d.id, d])
        );

        // Combine the data
        const inspectionsWithRelations = inspectionData.map(inspection => ({
          ...inspection,
          vehicle: vehiclesMap.get(inspection.vehicle_id),
          driver: driversMap.get(inspection.driver_id)
        }));

        return inspectionsWithRelations as VehicleInspection[];
      } catch (error) {
        console.error('Error in vehicle inspections query:', error);
        return [];
      }
    },
    enabled: !!organizationId && !!profile?.id
  });

  // Get inspection statistics
  const { data: inspectionStats } = useQuery({
    queryKey: ['vehicle-inspection-stats', organizationId, driverId],
    queryFn: async () => {
      if (!organizationId) return null;

      try {
        let query = supabase
          .from('vehicle_inspections')
          .select('status, inspection_type, defects_found, created_at');

        if (driverId) {
          query = query.eq('driver_id', driverId);
        }

        const { data: inspectionData, error } = await query;

        if (error) {
          console.error('Error fetching inspection stats:', error);
          return null;
        }

        const stats: InspectionStats = {
          total: inspectionData?.length || 0,
          byStatus: {
            pending: inspectionData?.filter(vi => vi.status === 'pending').length || 0,
            passed: inspectionData?.filter(vi => vi.status === 'passed').length || 0,
            flagged: inspectionData?.filter(vi => vi.status === 'flagged').length || 0,
            failed: inspectionData?.filter(vi => vi.status === 'failed').length || 0
          },
          byType: {
            daily_check: inspectionData?.filter(vi => vi.inspection_type === 'daily_check').length || 0,
            pre_trip: inspectionData?.filter(vi => vi.inspection_type === 'pre_trip').length || 0,
            post_trip: inspectionData?.filter(vi => vi.inspection_type === 'post_trip').length || 0,
            weekly: inspectionData?.filter(vi => vi.inspection_type === 'weekly').length || 0,
            monthly: inspectionData?.filter(vi => vi.inspection_type === 'monthly').length || 0,
            initial: inspectionData?.filter(vi => vi.inspection_type === 'initial').length || 0,
            recheck: inspectionData?.filter(vi => vi.inspection_type === 'recheck').length || 0,
            breakdown: inspectionData?.filter(vi => vi.inspection_type === 'breakdown').length || 0
          },
          defectsFound: inspectionData?.filter(vi => vi.defects_found).length || 0,
          recentInspections: inspectionData?.filter(vi => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return new Date(vi.created_at) >= sevenDaysAgo;
          }).length || 0
        };

        return stats;
      } catch (error) {
        console.error('Error calculating inspection stats:', error);
        return null;
      }
    },
    enabled: !!organizationId
  });

  return {
    inspections,
    isLoading,
    error,
    inspectionStats
  };
};

export const useInspectionById = (inspectionId: string) => {
  return useQuery({
    queryKey: ['vehicle-inspection', inspectionId],
    queryFn: async () => {
      if (!inspectionId) return null;

      try {
        const { data: inspection, error } = await supabase
          .from('vehicle_inspections')
          .select('*')
          .eq('id', inspectionId)
          .single();

        if (error) {
          console.error('Error fetching inspection by ID:', error);
          return null;
        }

        if (!inspection) return null;

        // Fetch related data
        const [vehicleData, driverData] = await Promise.all([
          supabase
            .from('vehicles')
            .select('id, vehicle_number, make, model, license_plate')
            .eq('id', inspection.vehicle_id)
            .single(),
          supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .eq('id', inspection.driver_id)
            .single()
        ]);

        return {
          ...inspection,
          vehicle: vehicleData.data,
          driver: driverData.data
        } as VehicleInspection;
      } catch (error) {
        console.error('Error in inspection by ID query:', error);
        return null;
      }
    },
    enabled: !!inspectionId
  });
};

export const useSubmitInspection = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: InspectionSubmissionData) => {
      const inspectionData = {
        driver_id: profile?.id,
        vehicle_id: data.vehicle_id,
        inspection_type: data.inspection_type,
        inspection_date: new Date().toISOString().split('T')[0],
        start_time: new Date().toISOString(),
        overall_status: data.overall_status || 'pending',
        defects_found: data.defects_found || false,
        notes: data.notes || '',
        walkaround_data: data.walkaround_data || {},
        location_data: data.location_data || {},
        signature_data: data.signature_data || null
      };

      const { data: result, error } = await supabase
        .from('vehicle_inspections')
        .insert(inspectionData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-inspections'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-inspection-stats'] });
      toast.success('Inspection submitted successfully');
    },
    onError: (error) => {
      console.error('Error submitting inspection:', error);
      toast.error('Failed to submit inspection');
    },
  });
};

export const useUpdateInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InspectionSubmissionData> }) => {
      const { data: result, error } = await supabase
        .from('vehicle_inspections')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-inspections'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-inspection-stats'] });
      toast.success('Inspection updated successfully');
    },
    onError: (error) => {
      console.error('Error updating inspection:', error);
      toast.error('Failed to update inspection');
    },
  });
};

export const useDeleteInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehicle_inspections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-inspections'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-inspection-stats'] });
      toast.success('Inspection deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting inspection:', error);
      toast.error('Failed to delete inspection');
    },
  });
};