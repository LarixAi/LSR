import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  job_type: string;
  assigned_driver_id?: string;
  assigned_vehicle_id?: string;
  route_id?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  payment_amount?: number;
  payment_status?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useJobs = () => {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      fetchJobs();
    }
  }, [user, profile]);

  const fetchJobs = async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('jobs')
        .select('*');

      // For drivers, only show their assigned jobs
      if (profile.role === 'driver') {
        query = query.eq('assigned_to', user.id);
      } else if (profile.organization_id) {
        // For admins/council, show organization jobs
        query = query.eq('organization_id', profile.organization_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs');
        return;
      }

      // Map database data to Job interface format
      const mappedJobs = (data || []).map(job => ({
        ...job,
        job_type: 'transport' as const // Default job type since it's required but not in DB
      }));
      setJobs(mappedJobs);
    } catch (err) {
      console.error('Error in fetchJobs:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Calculate job statistics
  const jobStats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === 'pending').length,
    active: jobs.filter(job => job.status === 'active').length,
    completed: jobs.filter(job => job.status === 'completed').length,
    cancelled: jobs.filter(job => job.status === 'cancelled').length,
    assigned: jobs.filter(job => job.assigned_driver_id).length,
    unassigned: jobs.filter(job => !job.assigned_driver_id).length,
  };

  return {
    jobs,
    data: jobs, // For backwards compatibility
    loading,
    isLoading: loading, // For backwards compatibility
    error,
    jobStats,
    fetchJobs,
  };
};

export const useCreateJob = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: Partial<Job>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization not found');
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: jobData.title || 'Untitled Job',
          description: jobData.description,
          status: jobData.status || 'pending',
          priority: jobData.priority || 'medium',
          job_type: jobData.job_type || 'transport',
          organization_id: profile.organization_id,
          assigned_driver_id: jobData.assigned_driver_id,
          assigned_vehicle_id: jobData.assigned_vehicle_id,
          route_id: jobData.route_id,
          start_date: jobData.start_date,
          end_date: jobData.end_date,
          start_time: jobData.start_time,
          end_time: jobData.end_time,
          payment_amount: jobData.payment_amount,
          payment_status: jobData.payment_status,
          created_by: jobData.created_by,
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
      toast.error('Failed to create job: ' + error.message);
    }
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Job>) => {
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
      toast.error('Failed to update job: ' + error.message);
    }
  });
};