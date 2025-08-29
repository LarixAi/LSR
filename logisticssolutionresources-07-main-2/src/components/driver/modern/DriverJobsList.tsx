import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  Navigation, 
  MessageSquare,
  PlayCircle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  status: string;
  start_time?: string;
  end_time?: string;
  routes?: {
    id: string;
    name: string;
    start_location: string;
    end_location: string;
  };
  vehicles?: {
    id: string;
    vehicle_number: string;
    type: string;
  };
}

interface DriverJobsListProps {
  jobs: Job[];
  isLoading: boolean;
  getVehicleTypeIcon: (type: string) => string;
  getStatusColor: (status: string) => string;
}

const DriverJobsList: React.FC<DriverJobsListProps> = ({ 
  jobs, 
  isLoading, 
  getVehicleTypeIcon, 
  getStatusColor 
}) => {
  return (
    <Card className="bg-glass border-primary/20 card-hover animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gradient">
            <Calendar className="w-6 h-6" />
            <span>Today's Schedule ({jobs.length})</span>
          </div>
          <Button variant="outline" size="sm">
            <PlayCircle className="w-4 h-4 mr-2" />
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-shimmer w-8 h-8 bg-gradient-primary rounded-full mx-auto"></div>
            </div>
          ) : jobs.length > 0 ? (
            jobs.map((job, index) => (
              <div 
                key={job.id} 
                className="bg-muted/30 rounded-xl p-4 card-hover animate-fade-in" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{job.title}</h4>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{job.start_time || '08:00'} - {job.end_time || '17:00'}</span>
                  </div>
                  
                  {job.routes && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{job.routes.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-primary" />
                    <span>{job.vehicles?.vehicle_number || 'No Vehicle'}</span>
                    {job.vehicles?.type && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {getVehicleTypeIcon(job.vehicles.type)} {job.vehicles.type}
                      </span>
                    )}
                  </div>
                </div>
                
                {job.routes && (
                  <div className="mb-3 pt-3 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {job.routes.start_location} → {job.routes.end_location}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                  <Button size="sm" className="button-modern">
                    <Navigation className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-float" />
              <p className="text-xl text-muted-foreground">No jobs scheduled for today</p>
              <p className="text-sm text-muted-foreground mt-2">Enjoy your free time! 🎉</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverJobsList;