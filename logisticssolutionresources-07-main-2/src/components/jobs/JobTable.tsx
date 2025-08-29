
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Calendar, Clock, User, Car, Gavel } from 'lucide-react';
import JobBidsDialog from './JobBidsDialog';
import type { JobWithBids } from './types';

interface JobTableProps {
  jobs: JobWithBids[];
}

const JobTable: React.FC<JobTableProps> = ({ jobs }) => {
  const [selectedJob, setSelectedJob] = useState<JobWithBids | null>(null);
  const [bidsDialogOpen, setBidsDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'open_for_bidding':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDriverName = (profile: any) => {
    if (!profile) return 'Unassigned';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Driver';
  };

  const handleViewBids = (job: JobWithBids) => {
    setSelectedJob(job);
    setBidsDialogOpen(true);
  };

  const getBidSummary = (job: JobWithBids) => {
    if (!job.is_bidding_enabled) return null;
    
    const bidCount = job.bids?.length || 0;
    const acceptedBids = job.bids?.filter(bid => bid.status === 'accepted').length || 0;
    
    return { bidCount, acceptedBids };
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Jobs Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Details</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bidding</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => {
                  const bidSummary = getBidSummary(job);
                  
                  return (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{job.title}</div>
                          {job.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {job.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span className="text-sm">
                              {job.start_date ? new Date(job.start_date).toLocaleDateString() : 'No date'}
                            </span>
                          </div>
                          {job.start_time && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span className="text-sm">
                                {job.start_time}
                                {job.end_time && ` - ${job.end_time}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span className="text-sm">
                              {formatDriverName(job.profiles)}
                            </span>
                          </div>
                          {job.routes?.name && (
                            <div className="text-sm text-gray-500">
                              Route: {job.routes.name}
                            </div>
                          )}
                          {job.vehicles?.vehicle_number && (
                            <div className="flex items-center space-x-1">
                              <Car className="w-3 h-3" />
                              <span className="text-sm">
                                {job.vehicles.vehicle_number}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(job.status || 'scheduled')}>
                          {job.status?.replace('_', ' ') || 'Scheduled'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.is_bidding_enabled ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <Gavel className="w-3 h-3" />
                              <span className="text-sm">
                                {bidSummary?.bidCount || 0} bid(s)
                              </span>
                            </div>
                            {job.max_bid_amount && (
                              <div className="text-sm text-gray-500">
                                Max: R{job.max_bid_amount.toFixed(2)}
                              </div>
                            )}
                            {job.bidding_deadline && (
                              <div className="text-xs text-gray-500">
                                Deadline: {new Date(job.bidding_deadline).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Direct Assignment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-x-2">
                          {job.is_bidding_enabled && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewBids(job)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Bids
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <JobBidsDialog
        job={selectedJob}
        open={bidsDialogOpen}
        onOpenChange={setBidsDialogOpen}
      />
    </>
  );
};

export default JobTable;
