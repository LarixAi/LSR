
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobBids, useUpdateJobBid } from '@/hooks/useJobBids';
import { useUpdateJob } from '@/hooks/useJobs';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import type { JobWithBids } from './types';

interface JobBidsDialogProps {
  job: JobWithBids | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobBidsDialog: React.FC<JobBidsDialogProps> = ({ job, open, onOpenChange }) => {
  const { data: bids = [], isLoading } = useJobBids(job?.id || '');
  const updateBid = useUpdateJobBid();
  const updateJob = useUpdateJob();
  const { toast } = useToast();

  const handleAcceptBid = async (bidId: string, driverId: string) => {
    if (!job) return;

    try {
      // Accept the bid
      await updateBid.mutateAsync({
        id: bidId,
        jobId: job.id,
        status: 'accepted',
      });

      // Update job to assign driver and close bidding
      await updateJob.mutateAsync({
        id: job.id,
        assigned_driver_id: driverId,
        status: 'scheduled',
      });

      // Reject all other bids
      const otherBids = bids.filter(bid => bid.id !== bidId && bid.status === 'pending');
      await Promise.all(
        otherBids.map(bid =>
          updateBid.mutateAsync({
            id: bid.id,
            jobId: job.id,
            status: 'rejected',
          })
        )
      );

      toast({
        title: "Bid Accepted",
        description: "The bid has been accepted and the job has been assigned.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error accepting bid:', error);
      toast({
        title: "Error",
        description: "Failed to accept bid. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectBid = async (bidId: string) => {
    if (!job) return;

    try {
      await updateBid.mutateAsync({
        id: bidId,
        jobId: job.id,
        status: 'rejected',
      });

      toast({
        title: "Bid Rejected",
        description: "The bid has been rejected.",
      });
    } catch (error) {
      console.error('Error rejecting bid:', error);
      toast({
        title: "Error",
        description: "Failed to reject bid. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Bids - {job.title}</DialogTitle>
          <DialogDescription>
            Review and manage bids for this job. Maximum bid amount: {formatCurrency(job.max_bid_amount || 0)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">Loading bids...</div>
          ) : bids.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bids received yet</p>
            </div>
          ) : (
            bids.map((bid) => (
              <Card key={bid.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {bid.driver_profile ? 
                        `${bid.driver_profile.first_name} ${bid.driver_profile.last_name}` : 
                        'Unknown Driver'
                      }
                      {bid.driver_profile?.employee_id && (
                        <span className="text-sm text-gray-500 ml-2">
                          (ID: {bid.driver_profile.employee_id})
                        </span>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(bid.status)}>
                        {getStatusIcon(bid.status)}
                        <span className="ml-1 capitalize">{bid.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Bid Amount:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(bid.bid_amount)}
                      </span>
                    </div>
                    
                    {bid.message && (
                      <div>
                        <span className="font-semibold">Message:</span>
                        <p className="text-gray-600 mt-1">{bid.message}</p>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Submitted: {new Date(bid.created_at).toLocaleString()}
                    </div>

                    {bid.status === 'pending' && job.status === 'open_for_bidding' && (
                      <div className="flex space-x-2 pt-2">
                        <Button
                          onClick={() => handleAcceptBid(bid.id, bid.driver_id)}
                          disabled={updateBid.isPending || updateJob.isPending}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept Bid
                        </Button>
                        <Button
                          onClick={() => handleRejectBid(bid.id)}
                          disabled={updateBid.isPending}
                          size="sm"
                          variant="outline"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobBidsDialog;
