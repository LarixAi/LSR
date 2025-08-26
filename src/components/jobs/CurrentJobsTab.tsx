import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  MapPin, 
  Clock, 
  Navigation, 
  CheckCircle, 
  AlertTriangle,
  Route,
  Users,
  FileText,
  Phone,
  Star,
  Search,
  Filter,
  Calendar,
  Eye,
  Loader2,
  DollarSign,
  TrendingUp,
  Wallet,
  Send,
  Receipt,
  Play
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';

interface Job {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_driver_id?: string;
  assigned_vehicle_id?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  pickup_location?: string;
  delivery_location?: string;
  customer_name?: string;
  customer_contact?: string;
  estimated_duration?: number;
  actual_duration?: number;
  created_at: string;
  updated_at: string;
  organization_id: string;
  created_by: string;
}

interface CurrentJobsTabProps {
  jobs: Job[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onViewJob: (job: Job) => void;
  onStartJob: (job: Job) => void;
  onCompleteJob: (job: Job) => void;
  isLoading: boolean;
}

export const CurrentJobsTab: React.FC<CurrentJobsTabProps> = ({
  jobs,
  searchTerm,
  onSearchChange,
  onViewJob,
  onStartJob,
  onCompleteJob,
  isLoading
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-100 text-blue-800">Assigned</Badge>;
      case 'in_progress':
        return <Badge className="bg-green-100 text-green-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Not set';
    return timeString;
  };

  const filteredJobs = jobs.filter(job => {
    const title = job.title?.toLowerCase() || '';
    const description = job.description?.toLowerCase() || '';
    const customer = job.customer_name?.toLowerCase() || '';
    const pickup = job.pickup_location?.toLowerCase() || '';
    const delivery = job.delivery_location?.toLowerCase() || '';
    
    return title.includes(searchTerm.toLowerCase()) ||
           description.includes(searchTerm.toLowerCase()) ||
           customer.includes(searchTerm.toLowerCase()) ||
           pickup.includes(searchTerm.toLowerCase()) ||
           delivery.includes(searchTerm.toLowerCase());
  });

  const currentJobs = filteredJobs.filter(job => 
    job.status === 'assigned' || job.status === 'in_progress'
  );

  const pendingJobs = filteredJobs.filter(job => job.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, customer, or location..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Current Jobs</p>
                <p className="text-2xl font-bold">{currentJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Jobs</p>
                <p className="text-2xl font-bold">{pendingJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {currentJobs.filter(job => job.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">
                  {filteredJobs.filter(job => job.priority === 'high' || job.priority === 'urgent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            Current Jobs ({currentJobs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading current jobs...</p>
            </div>
          ) : currentJobs.length === 0 ? (
            <div className="text-center py-8">
              <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No current jobs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{job.title}</p>
                        {job.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {job.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{job.customer_name || 'N/A'}</p>
                        {job.customer_contact && (
                          <p className="text-sm text-muted-foreground">{job.customer_contact}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatDate(job.start_date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(job.start_time)} - {formatTime(job.end_time)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs font-medium">Pickup:</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {job.pickup_location || 'Not set'}
                        </p>
                        <div className="flex items-center gap-1 mb-1 mt-2">
                          <Navigation className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs font-medium">Delivery:</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {job.delivery_location || 'Not set'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(job.status)}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(job.priority)}
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium">
                          {job.estimated_duration ? `${job.estimated_duration}h` : 'N/A'}
                        </p>
                        {job.actual_duration && (
                          <p className="text-xs text-muted-foreground">
                            Actual: {job.actual_duration}h
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewJob(job)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {job.status === 'assigned' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onStartJob(job)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {job.status === 'in_progress' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCompleteJob(job)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Jobs */}
      {pendingJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Jobs ({pendingJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingJobs.map((job) => (
                <Card key={job.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{job.title}</h4>
                      {getPriorityBadge(job.priority)}
                    </div>
                    
                    {job.customer_name && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{job.customer_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(job.start_date)}</span>
                    </div>
                    
                    {job.pickup_location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm truncate">{job.pickup_location}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewJob(job)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
