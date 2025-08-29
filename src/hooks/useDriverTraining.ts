import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TrainingModule {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number; // in minutes
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingAssignment {
  id: string;
  driver_id: string;
  training_module_id: string;
  assigned_by: string;
  assigned_at: string;
  due_date: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  progress: number; // 0-100
  completed_at?: string;
  training_modules?: TrainingModule;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export interface TrainingCompletion {
  id: string;
  driver_id: string;
  training_module_id: string;
  completed_at: string;
  score?: number;
  certificate_url?: string;
  training_modules?: TrainingModule;
}

export const useDriverTraining = (driverId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['driver-training', driverId, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const targetDriverId = driverId || profile?.id;
      if (!targetDriverId) {
        throw new Error('Driver ID is required');
      }

      // Fetch training assignments for this driver
      let assignments = [];
      try {
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('training_assignments')
          .select(`
            *,
            training_modules (*),
            profiles!assigned_by (first_name, last_name)
          `)
          .eq('driver_id', targetDriverId)
          .eq('organization_id', profile.organization_id)
          .order('assigned_at', { ascending: false });

        if (assignmentsError) {
          console.warn('Training assignments table may not exist:', assignmentsError);
          assignments = [];
        } else {
          assignments = assignmentsData || [];
        }
      } catch (error) {
        console.warn('Error fetching training assignments:', error);
        assignments = [];
      }

      // Fetch training completions for this driver
      let completions = [];
      try {
        const { data: completionsData, error: completionsError } = await supabase
          .from('training_completions')
          .select(`
            *,
            training_modules (*)
          `)
          .eq('driver_id', targetDriverId)
          .eq('organization_id', profile.organization_id)
          .order('completed_at', { ascending: false });

        if (completionsError) {
          console.warn('Training completions table may not exist:', completionsError);
          completions = [];
        } else {
          completions = completionsData || [];
        }
      } catch (error) {
        console.warn('Error fetching training completions:', error);
        completions = [];
      }

      return {
        assignments: assignments || [],
        completions: completions || []
      };
    },
    enabled: !!profile?.organization_id && !!(driverId || profile?.id),
  });
};

export const useAvailableTrainingModules = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['available-training-modules', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      try {
        const { data, error } = await supabase
          .from('training_modules')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('name', { ascending: true });

        if (error) {
          console.warn('Training modules table may not exist:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.warn('Error fetching training modules:', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id,
  });
};

export const useAssignTraining = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (assignmentData: {
      driver_id: string;
      training_module_id: string;
      due_date: string;
    }) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('Organization and user information required');
      }

      const { data, error } = await supabase
        .from('training_assignments')
        .insert({
          ...assignmentData,
          organization_id: profile.organization_id,
          assigned_by: profile.id,
          status: 'assigned',
          progress: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-training'] });
      toast.success('Training assigned successfully');
    },
    onError: (error: any) => {
      console.error('Error assigning training:', error);
      toast.error('Failed to assign training: ' + error.message);
    }
  });
};

export const useUpdateTrainingProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, progress }: { assignmentId: string; progress: number }) => {
      const updateData: any = { progress };
      
      if (progress === 100) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      } else if (progress > 0) {
        updateData.status = 'in_progress';
      }

      const { data, error } = await supabase
        .from('training_assignments')
        .update(updateData)
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-training'] });
      toast.success('Training progress updated');
    },
    onError: (error: any) => {
      console.error('Error updating training progress:', error);
      toast.error('Failed to update training progress: ' + error.message);
    }
  });
};
