import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMaintenanceRequests = () => {
  return useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: async () => {
      console.log('Fetching maintenance requests from database...');
      
      try {
        // First, get maintenance requests data
        const { data: requestsData, error: requestsError } = await supabase
          .from('maintenance_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (requestsError) {
          console.error('Error fetching maintenance requests:', requestsError);
          if (requestsError.code === '42P01') {
            console.warn('maintenance_requests table not found, returning empty data');
            return [];
          }
          throw requestsError;
        }

        // If no requests found, return empty array
        if (!requestsData || requestsData.length === 0) {
          return [];
        }

        // Get unique IDs for related data
        const vehicleIds = requestsData
          .filter(request => request.vehicle_id)
          .map(request => request.vehicle_id);
        const mechanicIds = requestsData
          .filter(request => request.mechanic_id)
          .map(request => request.mechanic_id);
        const requesterIds = requestsData
          .filter(request => request.requested_by)
          .map(request => request.requested_by);

        // Fetch related data
        const [vehiclesData, mechanicsData, requestersData] = await Promise.all([
          vehicleIds.length > 0 ? supabase
            .from('vehicles')
            .select('id, vehicle_number, make, model')
            .in('id', vehicleIds) : Promise.resolve({ data: [], error: null }),
          mechanicIds.length > 0 ? supabase
            .from('mechanics')
            .select('id, mechanic_name')
            .in('id', mechanicIds) : Promise.resolve({ data: [], error: null }),
          requesterIds.length > 0 ? supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', requesterIds) : Promise.resolve({ data: [], error: null })
        ]);

        // Combine maintenance requests with related data
        const requestsWithRelations = requestsData.map(request => {
          const vehicle = vehiclesData.data?.find(v => v.id === request.vehicle_id);
          const mechanic = mechanicsData.data?.find(m => m.id === request.mechanic_id);
          const requester = requestersData.data?.find(r => r.id === request.requested_by);

          return {
            ...request,
            vehicle: vehicle || null,
            mechanic: mechanic || null,
            requester: requester || null
          };
        });

        return requestsWithRelations || [];
      } catch (error) {
        console.error('Error in useMaintenanceRequests:', error);
        return [];
      }
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
          .from('maintenance_requests')
          .insert({
            vehicle_id: request.vehicle_id,
            requested_by: request.user_id,
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
          .from('maintenance_requests')
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