import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Driver = Tables<'profiles'>;

export const useDrivers = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['drivers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        console.log('No organization ID available');
        throw new Error('Organization ID is required');
      }

      console.log('🚗 Fetching drivers for organization:', profile.organization_id);
      
      // SECURE: Only query drivers from current organization
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('role', 'driver')
        .order('created_at', { ascending: false });

      console.log('✅ Drivers query result:', { data, error });

      if (error) {
        console.error('Error fetching drivers:', error);
        throw error;
      }

      console.log('Fetched drivers:', data);
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Driver> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver updated successfully');
    },
    onError: (error) => {
      console.error('Error updating driver:', error);
      toast.error('Failed to update driver');
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver deactivated successfully');
    },
    onError: (error) => {
      console.error('Error deactivating driver:', error);
      toast.error('Failed to deactivate driver');
    },
  });
};