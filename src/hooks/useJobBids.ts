
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type JobBid = {
  id: string;
  job_id: string;
  driver_id: string;
  bid_amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  driver_profile?: { first_name: string; last_name: string; employee_id: string };
};

export const useJobBids = (jobId?: string) => {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['job-bids', jobId],
    queryFn: async () => {
      if (!jobId || !profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('job_bids')
        .select('*, driver_profile:first_name, driver_profile:last_name')
        .eq('job_id', jobId)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as any as JobBid[];
    },
    enabled: !!jobId && !!profile?.organization_id,
  });
};

export const useCreateJobBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (bidData: {
      job_id: string;
      bid_amount: number;
      message?: string;
    }) => {
      if (!profile?.id || !profile.organization_id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('job_bids')
        .insert({
          job_id: bidData.job_id,
          driver_id: profile.id,
          organization_id: profile.organization_id,
          bid_amount: bidData.bid_amount,
          message: bidData.message || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as JobBid;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-bids', variables.job_id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Bid Submitted",
        description: "Your bid has been submitted successfully.",
      });
    },
  });
};

export const useUpdateJobBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      jobId, 
      ...bidData 
    }: { 
      id: string; 
      jobId: string; 
      status?: 'pending' | 'accepted' | 'rejected';
    }) => {
      if (!profile?.organization_id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('job_bids')
        .update(bidData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as JobBid;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-bids', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
