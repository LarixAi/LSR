import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useJobs, useJobStats, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/useJobs';
import { useDrivers } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';
import { 
  FileText, 
  Plus, 
  Search,
  Users,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';

const JobManagement: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreateJobDialogOpen, setIsCreateJobDialogOpen] = useState<boolean>(false);
  const [newJobData, setNewJobData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    pickup_location: '',
    delivery_location: '',
    customer_name: '',
    customer_contact: '',
    start_date: '',
    end_date: '',
    assigned_driver_id: '',
    assigned_vehicle_id: ''
  });

  // Fetch real data from backend
  const { data: jobs = [], isLoading: jobsLoading, error: jobsError } = useJobs();
  const jobStats = useJobStats();
  const { data: drivers = [] } = useDrivers();
  const { data: vehicles = [] } = useVehicles();
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();

  if (loading || jobsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading job management...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins and council can access
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Handle creation of new job
  const handleCreateJob = async () => {
    try {
      await createJobMutation.mutateAsync(newJobData);
      setIsCreateJobDialogOpen(false);
      setNewJobData({
        title: '',
        description: '',
        priority: 'medium',
        pickup_location: '',
        delivery_location: '',
        customer_name: '',
        customer_contact: '',
        start_date: '',
        end_date: '',
        assigned_driver_id: '',
        assigned_vehicle_id: ''
      });
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}>
        {status?.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || 'bg-gray-100 text-gray-800'}>
        {priority}
      </Badge>
    );
  };

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Use real job statistics from the hook

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Job Management
          </h1>
          <p className="text-gray-600 mt-1">Create, assign, and track transport jobs</p>
        </div>
        <Dialog open={isCreateJobDialogOpen} onOpenChange={setIsCreateJobDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job-title">Job Title *</Label>
                <Input 
                  id="job-title" 
                  placeholder="Enter job title" 
                  value={newJobData.title}
                  onChange={(e) => setNewJobData({...newJobData, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="customer">Customer Name *</Label>
                <Input 
                  id="customer" 
                  placeholder="Customer name" 
                  value={newJobData.customer_name}
                  onChange={(e) => setNewJobData({...newJobData, customer_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="pickup">Pickup Location</Label>
                <Input 
                  id="pickup" 
                  placeholder="Pickup address" 
                  value={newJobData.pickup_location}
                  onChange={(e) => setNewJobData({...newJobData, pickup_location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="delivery">Delivery Location</Label>
                <Input 
                  id="delivery" 
                  placeholder="Delivery address" 
                  value={newJobData.delivery_location}
                  onChange={(e) => setNewJobData({...newJobData, delivery_location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input 
                  id="start-date" 
                  type="date" 
                  value={newJobData.start_date}
                  onChange={(e) => setNewJobData({...newJobData, start_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newJobData.priority} 
                  onValueChange={(value) => setNewJobData({...newJobData, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  placeholder="Job description" 
                  value={newJobData.description}
                  onChange={(e) => setNewJobData({...newJobData, description: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={handleCreateJob}
                  disabled={createJobMutation.isPending || !newJobData.title || !newJobData.customer_name}
                >
                  {createJobMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Job'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{jobStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-green-600">{jobStats.in_progress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{jobStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{jobStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Job List
          </CardTitle>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {jobs.length === 0 ? 'No jobs found. Create your first job to get started.' : 'No jobs match your search criteria.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.job_number || job.id.slice(0, 8)}</TableCell>
                    <TableCell>{job.title || 'Untitled Job'}</TableCell>
                    <TableCell>{job.customer_name || 'No customer'}</TableCell>
                    <TableCell>{getPriorityBadge(job.priority || 'medium')}</TableCell>
                    <TableCell>{getStatusBadge(job.status || 'pending')}</TableCell>
                    <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobManagement;