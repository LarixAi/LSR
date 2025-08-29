import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateDriverAssignmentData {
  driverId: string;
  vehicleId: string;
}

interface UpdateDriverAssignmentData {
  id: string;
  is_active: boolean;
}

export const useCreateDriverAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDriverAssignmentData) => {
      const { data: assignment, error } = await supabase
        .from('driver_assignments')
        .insert({
          driver_id: data.driverId,
          vehicle_id: data.vehicleId,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error) => {
      console.error('Error creating driver assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create driver assignment',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateDriverAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateDriverAssignmentData) => {
      const { data: assignment, error } = await supabase
        .from('driver_assignments')
        .update({ status: data.is_active ? 'active' : 'inactive' })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error) => {
      console.error('Error updating driver assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update driver assignment',
        variant: 'destructive',
      });
    },
  });
};