import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RailReplacementStop {
  id: string;
  service_id: string;
  stop_name: string;
  stop_type: 'pickup' | 'dropoff' | 'both';
  address: string;
  coordinates?: any;
  estimated_time?: string;
  actual_time?: string;
  stop_order: number;
  passenger_count: number;
  rail_station_name?: string;
  rail_line?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Rail Replacement Stops hooks
export const useRailReplacementStops = (serviceId: string) => {
  return useQuery({
    queryKey: ['rail-replacement-stops', serviceId],
    queryFn: async (): Promise<RailReplacementStop[]> => {
      const { data, error } = await supabase
        .from('rail_replacement_stops')
        .select('*')
        .eq('service_id', serviceId)
        .order('stop_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!serviceId,
  });
};

export const useCreateRailReplacementStop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (stop: Partial<RailReplacementStop>): Promise<RailReplacementStop> => {
      const { data, error } = await supabase
        .from('rail_replacement_stops')
        .insert(stop)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rail-replacement-stops', data.service_id] });
    },
  });
};

export const useUpdateRailReplacementStop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RailReplacementStop> & { id: string }): Promise<RailReplacementStop> => {
      const { data, error } = await supabase
        .from('rail_replacement_stops')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rail-replacement-stops', data.service_id] });
    },
  });
};

export const useDeleteRailReplacementStop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, service_id }: { id: string; service_id: string }): Promise<void> => {
      const { error } = await supabase
        .from('rail_replacement_stops')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { service_id }) => {
      queryClient.invalidateQueries({ queryKey: ['rail-replacement-stops', service_id] });
    },
  });
};

