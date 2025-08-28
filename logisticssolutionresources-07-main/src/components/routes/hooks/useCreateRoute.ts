import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateRouteData {
  name?: string;
  startLocation?: string;
  endLocation?: string;
  distance?: number;
  estimatedTime?: number;
  status?: string;
  [key: string]: any; // Allow any additional properties
}

export const useCreateRoute = (onSuccess?: () => void, resetForm?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeData: CreateRouteData) => {
      const { data, error } = await supabase
        .from('routes')
        .insert([{
          name: routeData.name || routeData.routeName || 'New Route',
          start_location: routeData.start_location || routeData.startLocation || '',
          end_location: routeData.end_location || routeData.endLocation || '',
          distance: routeData.distance,
          estimated_time: routeData.estimated_time || routeData.estimatedTime,
          status: routeData.status || 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Route created successfully');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      onSuccess?.();
      resetForm?.();
    },
    onError: (error: any) => {
      console.error('Error creating route:', error);
      toast.error('Failed to create route');
    },
  });
};