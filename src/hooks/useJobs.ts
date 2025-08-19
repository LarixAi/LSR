import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Job = Tables<'jobs'>;

export interface JobWithRelations extends Job {
  assigned_driver?: Tables<'profiles'>;
  assigned_vehicle?: Tables<'vehicles'>;
  creator?: Tables<'profiles'>;
}

export const useJobs = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['jobs', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching jobs from database...');
      
      try {
        // First, get jobs data
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (jobsError) {
          console.error('Error fetching jobs:', jobsError);
          if (jobsError.code === '42P01' || jobsError.code === 'PGRST200') {
            console.warn('jobs table not found or foreign key relationship issue, returning empty data');
            return [];
          }
          throw jobsError;
        }

        // If no jobs found, return empty array
        if (!jobsData || jobsData.length === 0) {
          return [];
        }

        // Get unique IDs for related data
        const driverIds = jobsData
          .filter(job => job.assigned_driver_id)
          .map(job => job.assigned_driver_id);
        const vehicleIds = jobsData
          .filter(job => job.assigned_vehicle_id)
          .map(job => job.assigned_vehicle_id);
        const creatorIds = jobsData
          .filter(job => job.created_by)
          .map(job => job.created_by);

        // Fetch related data
        const [driversData, vehiclesData, creatorsData] = await Promise.all([
          driverIds.length > 0 ? supabase
            .from('profiles')
            .select('*')
            .in('id', driverIds) : Promise.resolve({ data: [], error: null }),
          vehicleIds.length > 0 ? supabase
            .from('vehicles')
            .select('*')
            .in('id', vehicleIds) : Promise.resolve({ data: [], error: null }),
          creatorIds.length > 0 ? supabase
            .from('profiles')
            .select('*')
            .in('id', creatorIds) : Promise.resolve({ data: [], error: null })
        ]);

        // Combine jobs with related data
        const jobsWithRelations = jobsData.map(job => {
          const assignedDriver = driversData.data?.find(d => d.id === job.assigned_driver_id);
          const assignedVehicle = vehiclesData.data?.find(v => v.id === job.assigned_vehicle_id);
          const creator = creatorsData.data?.find(c => c.id === job.created_by);

          return {
            ...job,
            assigned_driver: assignedDriver || null,
            assigned_vehicle: assignedVehicle || null,
            creator: creator || null
          };
        });

        console.log('Fetched jobs with relations:', jobsWithRelations);
        return jobsWithRelations as JobWithRelations[] || [];
      } catch (error) {
        console.error('Error in useJobs:', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateJob = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: Partial<Job>) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('Organization and user information required');
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          organization_id: profile.organization_id,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating job:', error);
      toast.error('Failed to create job: ' + error.message);
    }
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Job> }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating job:', error);
      toast.error('Failed to update job: ' + error.message);
    }
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job: ' + error.message);
    }
  });
};

export const useJobStats = () => {
  const { data: jobs = [] } = useJobs();

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === 'pending').length,
    assigned: jobs.filter(job => job.status === 'assigned').length,
    in_progress: jobs.filter(job => job.status === 'in_progress').length,
    completed: jobs.filter(job => job.status === 'completed').length,
    cancelled: jobs.filter(job => job.status === 'cancelled').length,
    high_priority: jobs.filter(job => job.priority === 'high' || job.priority === 'urgent').length,
  };

  return stats;
};