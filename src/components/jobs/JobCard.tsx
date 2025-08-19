
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Truck } from 'lucide-react';

interface JobCardProps {
  job: any;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

const JobCard = ({ job, getStatusColor, getPriorityColor }: JobCardProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.description}</p>
        </div>
        <div className="flex space-x-2">
          <Badge className={getStatusColor(job.status)}>
            {job.status}
          </Badge>
          <Badge className={getPriorityColor(job.priority)}>
            {job.priority}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{job.start_date ? new Date(job.start_date).toLocaleDateString() : 'Not set'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>{job.start_time || 'Not set'} - {job.end_time || 'Not set'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span>{job.assigned_driver_id ? 'Assigned' : 'Unassigned'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-gray-500" />
          <span>{job.assigned_vehicle_id ? 'Vehicle Assigned' : 'No Vehicle'}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button size="sm" variant="outline">
          View Details
        </Button>
        <Button size="sm" variant="outline">
          Edit Job
        </Button>
        {job.status === 'pending' && (
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            Assign Driver
          </Button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
