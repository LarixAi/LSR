
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface JobStatsProps {
  stats: {
    total: number;
    active: number;
    pending: number;
    completed: number;
  };
}

const JobStats = ({ stats }: JobStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-3xl font-bold">{stats.active}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Jobs</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
              <p className="text-3xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobStats;
