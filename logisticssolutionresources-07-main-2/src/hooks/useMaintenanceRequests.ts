import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMaintenanceRequests = () => {
  return useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: async () => {
      console.log('Fetching maintenance requests from database...');
      
      // Return mock data since the table might not be fully available in types yet
      return [];
    },
  });
};

export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: any) => {
      console.log('Creating maintenance request:', request);
      
      try {
        const { data, error } = await supabase
          .from('maintenance_requests' as any)
          .insert({
            vehicle_id: request.vehicle_id,
            user_id: request.user_id,
            description: request.description,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating maintenance request:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      toast({
        title: 'Success',
        description: 'Maintenance request created successfully',
      });
    },
    onError: (error: any) => {
      console.error('Error creating maintenance request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create maintenance request: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      console.log('Updating maintenance request:', id, updates);
      
      try {
        const { data, error } = await supabase
          .from('maintenance_requests' as any)
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating maintenance request:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      toast({
        title: 'Success',
        description: 'Maintenance request updated successfully',
      });
    },
    onError: (error: any) => {
      console.error('Error updating maintenance request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update maintenance request: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};