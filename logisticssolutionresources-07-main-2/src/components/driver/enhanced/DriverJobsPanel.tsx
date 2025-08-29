import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Navigation, 
  CheckCircle, 
  AlertCircle,
  Route,
  ArrowRight,
  Timer
} from 'lucide-react';
import { Job } from './types';

interface DriverJobsPanelProps {
  jobs: Job[];
  isMobile: boolean;
  expanded?: boolean;
}

const DriverJobsPanel: React.FC<DriverJobsPanelProps> = ({ jobs, isMobile, expanded = false }) => {
  const todayJobs = jobs.filter(job => {
    const jobDate = job.pickup_datetime || job.start_date || job.created_at;
    return new Date(jobDate).toDateString() === new Date().toDateString();
  });

  const upcomingJobs = jobs.filter(job => {
    const jobDate = job.pickup_datetime || job.start_date || job.created_at;
    return new Date(jobDate) > new Date();
  }).slice(0, expanded ? 10 : 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Timer className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatTime = (datetime?: string) => {
    if (!datetime) return 'N/A';
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (datetime?: string) => {
    if (!datetime) return 'N/A';
    return new Date(datetime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className={isMobile ? 'pb-3' : ''}>
        <CardTitle className="flex items-center space-x-2">
          <Route className="w-5 h-5 text-blue-600" />
          <span>Today's Schedule</span>
          {todayJobs.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800 ml-2">
              {todayJobs.length} jobs
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {todayJobs.length === 0 
            ? "No jobs scheduled for today" 
            : `${todayJobs.filter(j => j.status === 'completed').length} of ${todayJobs.length} completed`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Today's Jobs */}
        {todayJobs.length > 0 && (
          <div className="space-y-3">
            <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 flex items-center`}>
              <Calendar className="w-4 h-4 mr-2" />
              Today's Jobs
            </h4>
            {todayJobs.map((job) => (
              <div 
                key={job.id} 
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(job.status)} flex items-center space-x-1`}>
                      {getStatusIcon(job.status)}
                      <span className={isMobile ? 'text-xs' : 'text-sm'}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </Badge>
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
                      {formatTime(job.pickup_datetime || job.start_date)}
                    </span>
                  </div>
                  {job.vehicles && (
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                      {job.vehicles.vehicle_number}
                    </span>
                  )}
                </div>
                
                {job.routes && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Navigation className="w-4 h-4 text-gray-400" />
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900`}>
                        {job.routes.name}
                      </span>
                    </div>
                    
                    <div className={`grid ${isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'}`}>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 text-green-500" />
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 truncate`}>
                          {job.routes.start_location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 truncate`}>
                          {job.routes.end_location}
                        </span>
                      </div>
                    </div>
                    
                    {job.routes?.estimated_duration && (
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Duration: {Math.round((job.routes.estimated_duration || 0) / 60)}h {(job.routes.estimated_duration || 0) % 60}m</span>
                        {job.routes.estimated_distance && (
                          <span>Distance: {job.routes.estimated_distance}km</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Jobs */}
        {upcomingJobs.length > 0 && (
          <div className="space-y-3">
            <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 flex items-center`}>
              <Clock className="w-4 h-4 mr-2" />
              Upcoming Jobs
            </h4>
            {upcomingJobs.map((job) => (
              <div 
                key={job.id} 
                className="border border-gray-200 rounded-lg p-3 bg-gradient-to-r from-blue-50 to-indigo-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-blue-600`}>
                      {formatDate(job.pickup_datetime || job.start_date)}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
                      {formatTime(job.pickup_datetime || job.start_date)}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-blue-200 text-blue-600">
                    {job.status}
                  </Badge>
                </div>
                
                {job.routes && (
                  <div className="space-y-1">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900`}>
                      {job.routes.name}
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <span>{job.routes.start_location}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{job.routes.end_location}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {todayJobs.length === 0 && upcomingJobs.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No jobs scheduled</p>
            <p className="text-sm text-gray-400">Enjoy your break!</p>
          </div>
        )}

        {jobs.length > 0 && !expanded && (
          <Button variant="outline" className="w-full mt-4">
            View All Jobs
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverJobsPanel;