import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import StandardPageLayout, { MetricCard, NavigationTab, ActionButton, FilterOption, TableColumn } from '@/components/layout/StandardPageLayout';
import { useSendNotification } from '@/hooks/useAdvancedNotifications';
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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreateJobDialogOpen, setIsCreateJobDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const sendNotification = useSendNotification();
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

  const filteredJobs = jobs
    .filter(job =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(job => (statusFilter === 'all' ? true : (job.status || 'pending') === statusFilter));

  // Use real job statistics from the hook

  // Layout mappings
  const navigationTabs: NavigationTab[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'bidding', label: 'Bidding' }
  ];

  const metricsCards: MetricCard[] = [
    { title: 'Total Jobs', value: jobStats.total, icon: <FileText className="w-5 h-5" /> },
    { title: 'In Progress', value: jobStats.in_progress, icon: <CheckCircle className="w-5 h-5" /> },
    { title: 'Pending', value: jobStats.pending, icon: <Clock className="w-5 h-5" /> },
    { title: 'Completed', value: jobStats.completed, icon: <DollarSign className="w-5 h-5" /> }
  ];

  const searchConfig = {
    placeholder: 'Search jobs...',
    value: searchTerm,
    onChange: setSearchTerm,
    showSearch: true
  };

  const filters: FilterOption[] = [
    {
      label: 'Status',
      value: statusFilter,
      options: [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      placeholder: 'Filter by status'
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === 'Status') setStatusFilter(value);
  };

  const tableColumns: TableColumn[] = [
    { key: 'job_number', label: 'Job Number', render: (item: any) => item.job_number || item.id?.slice(0, 8) },
    { key: 'title', label: 'Title' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'priority', label: 'Priority', render: (item: any) => getPriorityBadge(item.priority || 'medium') },
    { key: 'status', label: 'Status', render: (item: any) => getStatusBadge(item.status || 'pending') },
    { key: 'created_at', label: 'Created', render: (item: any) => new Date(item.created_at).toLocaleDateString() },
    { key: 'actions', label: 'Actions', render: () => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    ) }
  ];

  const openJobForBids = async (job: any) => {
    try {
      await updateJobMutation.mutateAsync({ id: job.id, updates: { status: 'open_for_bidding', bidding_enabled: true } as any });
      await sendNotification.mutateAsync({
        recipientType: 'role',
        recipientRole: 'driver',
        title: 'New Job Available for Bidding',
        body: `${job.title} – From ${job.pickup_location || '-'} to ${job.delivery_location || '-'}. Submit your bid in the app.`,
        type: 'info',
        priority: 'normal',
        category: 'schedule',
        channels: ['in_app'],
        isScheduled: false,
      });
    } catch (e) {
      console.error('Failed to open job for bidding:', e);
    }
  };

  const primaryAction: ActionButton = {
    label: 'Create Job',
    onClick: () => navigate('/jobs/create'),
    icon: <Plus className="w-4 h-4" />
  };

  return (
    <StandardPageLayout
      title="Job Management"
      description="Create, assign, and track transport jobs"
      primaryAction={primaryAction}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={(val: string) => {
        setActiveTab(val);
        setStatusFilter(val === 'all' ? 'all' : val);
      }}
      searchConfig={searchConfig}
      filters={filters}
      onFilterChange={handleFilterChange}
      showTable={true}
      tableData={activeTab === 'bidding' ? filteredJobs.filter(j => j.status === 'open_for_bidding' || j.bidding_enabled) : filteredJobs}
      tableColumns={tableColumns}
    >
      {activeTab === 'bidding' && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-700 mb-3">Open jobs for bidding and broadcast to all drivers. Offered pay (optional) helps drivers decide.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {jobs.filter((j: any) => j.status !== 'open_for_bidding').slice(0,6).map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{job.title || job.id.slice(0,8)}</div>
                    <div className="text-xs text-gray-500 truncate">{job.pickup_location || '-'} → {job.delivery_location || '-'}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openJobForBids(job)}>Open for Bids</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={isCreateJobDialogOpen} onOpenChange={setIsCreateJobDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="create-job-desc">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
            <p id="create-job-desc" className="sr-only">Fill out the fields below to create a new job.</p>
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
      <div></div>
    </StandardPageLayout>
  );
};

export default JobManagement;