import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VehicleInspection {
  id: string;
  vehicle_id: string;
  driver_id: string;
  inspection_date: string;
  start_time: string;
  end_time?: string;
  inspection_type: string;
  overall_status: 'passed' | 'failed' | 'flagged' | 'pending';
  defects_found: boolean;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  vehicles: {
    vehicle_number?: string;
    make?: string;
    model?: string;
    license_plate?: string;
  };
}

export interface InspectionSubmissionData {
  vehicle_id: string;
  inspection_type: string;
  notes?: string;
  defects_found?: boolean;
  overall_status?: string;
}

export const useVehicleInspections = (driverId?: string) => {
  return useQuery({
    queryKey: ['vehicle-inspections', driverId],
    queryFn: async () => {
      let query = supabase
        .from('vehicle_inspections' as any)
        .select(`
          *,
          vehicles:vehicle_id (
            vehicle_number,
            make,
            model,
            license_plate
          )
        `)
        .order('inspection_date', { ascending: false });

      if (driverId) {
        query = query.eq('driver_id', driverId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as any) || [];
    },
  });
};

export const useSubmitInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InspectionSubmissionData) => {
      const inspectionData = {
        vehicle_id: data.vehicle_id,
        inspection_type: data.inspection_type,
        inspection_date: new Date().toISOString().split('T')[0],
        start_time: new Date().toISOString(),
        overall_status: data.overall_status || 'pending',
        defects_found: data.defects_found || false,
        notes: data.notes || '',
      };

      const { data: result, error } = await supabase
        .from('vehicle_inspections' as any)
        .insert(inspectionData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-inspections'] });
      toast.success('Inspection submitted successfully');
    },
    onError: (error) => {
      console.error('Error submitting inspection:', error);
      toast.error('Failed to submit inspection');
    },
  });
};