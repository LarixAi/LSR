
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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
  return useQuery({
    queryKey: ['job-bids', jobId],
    queryFn: async () => {
      return [];
    },
    enabled: !!jobId,
  });
};

export const useCreateJobBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (bidData: {
      job_id: string;
      bid_amount: number;
      message?: string;
    }) => {
      throw new Error('Job bid creation not available');
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
      throw new Error('Job bid update not available');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-bids', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
