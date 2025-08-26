import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Import the new tab components
import { CurrentJobsTab } from '@/components/jobs/CurrentJobsTab';

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

interface JobPayment {
  job_id: string;
  job_title: string;
  hours_worked: number;
  hourly_rate: number;
  total_payment: number;
  status: 'pending' | 'paid' | 'overdue';
  payment_date?: string;
  job_date: string;
}

interface PaymentSummary {
  total_hours: number;
  total_earnings: number;
  jobs_count: number;
  average_hourly_rate: number;
  monthly_earnings: number;
  pending_payments: number;
}

interface Invoice {
  id: string;
  driver_id: string;
  invoice_number: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  due_date: string;
  jobs_included: string[];
  notes?: string;
}

const DriverJobsRefactored = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Data fetching
  const { data: jobs = [], isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['jobs', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Mutations
  const createInvoice = useMutation({
    mutationFn: async (invoiceData: Partial<Invoice>) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{ ...invoiceData, organization_id: profile?.organization_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create invoice');
      console.error('Error creating invoice:', error);
    },
  });

  const updateJobStatus = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update job status');
      console.error('Error updating job status:', error);
    },
  });

  // Event handlers
  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    toast.info(`Viewing job: ${job.title}`);
  };

  const handleStartJob = (job: Job) => {
    updateJobStatus.mutate({ jobId: job.id, status: 'in_progress' });
  };

  const handleCompleteJob = (job: Job) => {
    updateJobStatus.mutate({ jobId: job.id, status: 'completed' });
  };

  // Filter jobs based on search and status
  const filteredJobs = jobs.filter(job => {
    const title = job.title?.toLowerCase() || '';
    const description = job.description?.toLowerCase() || '';
    const customer = job.customer_name?.toLowerCase() || '';
    const pickup = job.pickup_location?.toLowerCase() || '';
    const delivery = job.delivery_location?.toLowerCase() || '';
    
    const matchesSearch = title.includes(searchTerm.toLowerCase()) ||
                         description.includes(searchTerm.toLowerCase()) ||
                         customer.includes(searchTerm.toLowerCase()) ||
                         pickup.includes(searchTerm.toLowerCase()) ||
                         delivery.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Loading and auth checks
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading driver jobs...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Route className="w-8 h-8 text-blue-600" />
            Driver Jobs Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage driver assignments, track job progress, and handle payments
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="current" className="text-xs sm:text-sm">Current</TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed</TabsTrigger>
          <TabsTrigger value="payment" className="text-xs sm:text-sm hidden sm:block">Payment</TabsTrigger>
          <TabsTrigger value="invoice" className="text-xs sm:text-sm hidden sm:block">Invoice</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm hidden sm:block">History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <CurrentJobsTab 
            jobs={filteredJobs}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onViewJob={handleViewJob}
            onStartJob={handleStartJob}
            onCompleteJob={handleCompleteJob}
            isLoading={jobsLoading}
          />
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Upcoming jobs management will be implemented</p>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Completed jobs management will be implemented</p>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Payment management will be implemented</p>
          </div>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-4">
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Invoice management will be implemented</p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Job history will be implemented</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl" aria-describedby="job-details-description">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription id="job-details-description">
              View detailed information about the selected job including status, progress, and payment details.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Job details view will be implemented</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverJobsRefactored;
