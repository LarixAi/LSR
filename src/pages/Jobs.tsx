import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Briefcase, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  MapPin,
  Calendar,
  Truck,
  Package,
  TrendingUp,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

interface Job {
  id: string;
  job_number: string;
  title: string;
  description: string;
  client_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  job_type: 'delivery' | 'pickup' | 'transport' | 'maintenance' | 'inspection';
  location: string;
  assigned_driver?: string;
  assigned_vehicle?: string;
  scheduled_date: string;
  estimated_duration: number;
  actual_duration?: number;
  estimated_cost: number;
  actual_cost?: number;
  created_at: string;
  updated_at: string;
}

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Mock data - replace with actual API calls
  const jobs: Job[] = [
    {
      id: '1',
      job_number: 'JOB-2024-001',
      title: 'Express Delivery to Manchester',
      description: 'Urgent delivery of medical supplies to Manchester General Hospital',
      client_name: 'MediSupply Ltd',
      status: 'in_progress',
      priority: 'urgent',
      job_type: 'delivery',
      location: 'Manchester, UK',
      assigned_driver: 'John Smith',
      assigned_vehicle: 'TRK-001',
      scheduled_date: '2024-08-28',
      estimated_duration: 4,
      actual_duration: 3.5,
      estimated_cost: 250,
      actual_cost: 220,
      created_at: '2024-08-27T10:00:00Z',
      updated_at: '2024-08-28T14:30:00Z'
    },
    {
      id: '2',
      job_number: 'JOB-2024-002',
      title: 'Vehicle Maintenance Check',
      description: 'Routine maintenance check for fleet vehicle TRK-002',
      client_name: 'Internal Fleet',
      status: 'pending',
      priority: 'medium',
      job_type: 'maintenance',
      location: 'London Depot',
      scheduled_date: '2024-08-29',
      estimated_duration: 2,
      estimated_cost: 150,
      created_at: '2024-08-27T15:00:00Z',
      updated_at: '2024-08-27T15:00:00Z'
    },
    {
      id: '3',
      job_number: 'JOB-2024-003',
      title: 'Equipment Pickup from Birmingham',
      description: 'Pickup of construction equipment from Birmingham site',
      client_name: 'BuildCorp Ltd',
      status: 'completed',
      priority: 'high',
      job_type: 'pickup',
      location: 'Birmingham, UK',
      assigned_driver: 'Sarah Johnson',
      assigned_vehicle: 'TRK-003',
      scheduled_date: '2024-08-26',
      estimated_duration: 6,
      actual_duration: 5.5,
      estimated_cost: 400,
      actual_cost: 380,
      created_at: '2024-08-25T09:00:00Z',
      updated_at: '2024-08-26T16:00:00Z'
    }
  ];

  // Calculate statistics
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(job => job.status === 'pending').length;
  const inProgressJobs = jobs.filter(job => job.status === 'in_progress').length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const urgentJobs = jobs.filter(job => job.priority === 'urgent').length;
  const totalRevenue = jobs.reduce((sum, job) => sum + (job.actual_cost || job.estimated_cost), 0);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    const matchesType = jobTypeFilter === 'all' || job.job_type === jobTypeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  // Filter by active tab
  const getTabJobs = () => {
    switch (activeTab) {
      case 'pending':
        return filteredJobs.filter(job => job.status === 'pending');
      case 'in_progress':
        return filteredJobs.filter(job => job.status === 'in_progress');
      case 'completed':
        return filteredJobs.filter(job => job.status === 'completed');
      case 'cancelled':
        return filteredJobs.filter(job => job.status === 'cancelled');
      default:
        return filteredJobs;
    }
  };

  const tabJobs = getTabJobs();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
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
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getJobTypeBadge = (type: string) => {
    switch (type) {
      case 'delivery':
        return <Badge className="bg-blue-100 text-blue-800">Delivery</Badge>;
      case 'pickup':
        return <Badge className="bg-purple-100 text-purple-800">Pickup</Badge>;
      case 'transport':
        return <Badge className="bg-indigo-100 text-indigo-800">Transport</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-800">Maintenance</Badge>;
      case 'inspection':
        return <Badge className="bg-teal-100 text-teal-800">Inspection</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <PageLayout
      title="Jobs"
      description="Manage and track all transportation jobs and assignments"
      actionButton={{
        label: "Create Job",
        onClick: () => setShowCreateDialog(true),
        icon: <Plus className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Total Jobs",
          value: totalJobs,
          icon: <Briefcase className="h-4 w-4" />
        },
        {
          title: "In Progress",
          value: inProgressJobs,
          icon: <Clock className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "Urgent Jobs",
          value: urgentJobs,
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "text-red-600"
        },
        {
          title: "Total Revenue",
          value: `£${totalRevenue.toLocaleString()}`,
          icon: <DollarSign className="h-4 w-4" />,
          color: "text-green-600"
        }
      ]}
      searchPlaceholder="Search jobs..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "All Statuses",
          value: statusFilter,
          options: [
            { value: "all", label: "All Statuses" },
            { value: "pending", label: "Pending" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" }
          ],
          onChange: setStatusFilter
        },
        {
          label: "All Priorities",
          value: priorityFilter,
          options: [
            { value: "all", label: "All Priorities" },
            { value: "urgent", label: "Urgent" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" }
          ],
          onChange: setPriorityFilter
        },
        {
          label: "All Types",
          value: jobTypeFilter,
          options: [
            { value: "all", label: "All Types" },
            { value: "delivery", label: "Delivery" },
            { value: "pickup", label: "Pickup" },
            { value: "transport", label: "Transport" },
            { value: "maintenance", label: "Maintenance" },
            { value: "inspection", label: "Inspection" }
          ],
          onChange: setJobTypeFilter
        }
      ]}
      tabs={[
        { value: "all", label: "All Jobs" },
        { value: "pending", label: "Pending" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={false}
    >
      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.job_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{job.client_name}</TableCell>
                  <TableCell>{getJobTypeBadge(job.job_type)}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>{getPriorityBadge(job.priority)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </div>
                  </TableCell>
                  <TableCell>{job.assigned_driver || '-'}</TableCell>
                  <TableCell>{job.assigned_vehicle || '-'}</TableCell>
                  <TableCell>{new Date(job.scheduled_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {job.actual_duration ? (
                      <span className="text-green-600">{job.actual_duration}h</span>
                    ) : (
                      <span>{job.estimated_duration}h</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.actual_cost ? (
                      <span className="text-green-600">£{job.actual_cost}</span>
                    ) : (
                      <span>£{job.estimated_cost}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Job Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="jobs-create-desc">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
            <p id="jobs-create-desc" className="sr-only">Fill out the job details to create a new job.</p>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Job creation form will be implemented here.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                Create Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
