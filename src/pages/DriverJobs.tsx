import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Receipt
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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

const DriverJobs = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoiceStep, setInvoiceStep] = useState<'select' | 'review' | 'confirm'>('select');
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    totalAmount: 0,
    jobsIncluded: [] as string[],
    notes: '',
    dueDate: '',
    specialRequests: '',
    paymentTerms: '30 days',
    contactInfo: ''
  });

  // Fetch jobs assigned to the current driver
  const { data: jobs = [], isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['driver-jobs', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No driver ID found');
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('assigned_driver_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile?.id
  });

  // Calculate payment data from jobs
  const calculatePayments = (): { payments: JobPayment[], summary: PaymentSummary } => {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const hourlyRate = 20; // Default hourly rate in GBP - could be fetched from driver profile
    
    const payments: JobPayment[] = completedJobs.map(job => {
      const hoursWorked = job.actual_duration ? job.actual_duration / 60 : 8; // Default to 8 hours if no duration
      const totalPayment = hoursWorked * hourlyRate;
      
      return {
        job_id: job.id,
        job_title: job.title,
        hours_worked: hoursWorked,
        hourly_rate: hourlyRate,
        total_payment: totalPayment,
        status: 'pending', // Default status
        job_date: job.start_date || job.created_at
      };
    });

    const totalHours = payments.reduce((sum, payment) => sum + payment.hours_worked, 0);
    const totalEarnings = payments.reduce((sum, payment) => sum + payment.total_payment, 0);
    const monthlyEarnings = payments
      .filter(payment => {
        const paymentDate = new Date(payment.job_date);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, payment) => sum + payment.total_payment, 0);

    const summary: PaymentSummary = {
      total_hours: totalHours,
      total_earnings: totalEarnings,
      jobs_count: payments.length,
      average_hourly_rate: hourlyRate,
      monthly_earnings: monthlyEarnings,
      pending_payments: payments.filter(p => p.status === 'pending').length
    };

    return { payments, summary };
  };

  const { payments, summary } = calculatePayments();

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: async (invoiceData: Partial<Invoice>) => {
      if (!profile?.id) throw new Error('No driver ID found');
      
      const { data, error } = await supabase
        .from('driver_invoices')
        .insert({
          ...invoiceData,
          driver_id: profile.id,
          organization_id: profile.organization_id,
          status: 'sent',
          created_at: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-invoices'] });
      toast({
        title: "Invoice Sent Successfully!",
        description: "Your invoice has been sent to management for review. You will be notified when payment is processed.",
      });
      resetInvoiceForm();
    },
    onError: (error) => {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to send invoice. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const driverId = profile?.id?.slice(0, 8) || 'DRIVER';
    return `INV-${timestamp}-${driverId}`;
  };

  // Handle invoice step navigation
  const handleNextStep = () => {
    if (invoiceStep === 'select') {
      if (selectedPayments.length === 0) {
        toast({
          title: "No Jobs Selected",
          description: "Please select at least one job to include in the invoice.",
          variant: "destructive",
        });
        return;
      }
      
      const selectedPaymentData = payments.filter(payment => 
        selectedPayments.includes(payment.job_id)
      );
      
      const totalAmount = selectedPaymentData.reduce((sum, payment) => 
        sum + payment.total_payment, 0
      );

      setInvoiceData({
        ...invoiceData,
        invoiceNumber: generateInvoiceNumber(),
        totalAmount,
        jobsIncluded: selectedPayments,
        notes: invoiceNotes,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      
      setInvoiceStep('review');
    } else if (invoiceStep === 'review') {
      setInvoiceStep('confirm');
    }
  };

  const handlePrevStep = () => {
    if (invoiceStep === 'review') {
      setInvoiceStep('select');
    } else if (invoiceStep === 'confirm') {
      setInvoiceStep('review');
    }
  };

  // Handle invoice creation
  const handleCreateInvoice = () => {
    createInvoice.mutate({
      invoice_number: invoiceData.invoiceNumber,
      total_amount: invoiceData.totalAmount,
      jobs_included: invoiceData.jobsIncluded,
      notes: invoiceData.notes,
      due_date: invoiceData.dueDate,
    });
  };

  // Reset invoice form
  const resetInvoiceForm = () => {
    setInvoiceStep('select');
    setSelectedPayments([]);
    setInvoiceNotes('');
    setInvoiceData({
      invoiceNumber: '',
      totalAmount: 0,
      jobsIncluded: [],
      notes: '',
      dueDate: '',
      specialRequests: '',
      paymentTerms: '30 days',
      contactInfo: ''
    });
  };

  // Update job status mutation
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
      queryClient.invalidateQueries({ queryKey: ['driver-jobs'] });
      toast({
        title: "Job Updated",
        description: "Job status updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p className="text-lg">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only drivers can access
  if (profile.role !== 'driver') {
    return <Navigate to="/dashboard" replace />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case 'assigned':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Assigned</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getTypeIcon = (job: Job) => {
    // Determine job type based on title or description
    const title = job.title?.toLowerCase() || '';
    const description = job.description?.toLowerCase() || '';
    
    if (title.includes('school') || description.includes('school')) {
      return <Users className="w-4 h-4" />;
    }
    if (title.includes('medical') || description.includes('medical')) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    if (title.includes('charter') || description.includes('charter')) {
      return <Route className="w-4 h-4" />;
    }
    return <MapPin className="w-4 h-4" />;
  };

  const formatJobDate = (dateString?: string) => {
    if (!dateString) return 'No date set';
    
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  };

  const formatJobTime = (timeString?: string) => {
    if (!timeString) return 'No time set';
    return timeString;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.delivery_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentJobs = filteredJobs.filter(job => 
    job.status === 'assigned' || job.status === 'in_progress'
  );
  
  const upcomingJobs = filteredJobs.filter(job => 
    job.status === 'pending'
  );
  
  const completedJobs = filteredJobs.filter(job => 
    job.status === 'completed'
  );

  const todayStats = {
    totalJobs: jobs.filter(j => j.start_date && isToday(parseISO(j.start_date))).length,
    completedJobs: jobs.filter(j => j.status === 'completed' && j.start_date && isToday(parseISO(j.start_date))).length,
    upcomingJobs: jobs.filter(j => j.status === 'pending' || j.status === 'assigned').length,
    inProgressJobs: jobs.filter(j => j.status === 'in_progress').length
  };

  const handleStartJob = (jobId: string) => {
    updateJobStatus.mutate({ jobId, status: 'in_progress' });
  };

  const handleCompleteJob = (jobId: string) => {
    updateJobStatus.mutate({ jobId, status: 'completed' });
  };

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p className="text-lg">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Jobs</h3>
          <p className="text-gray-600">Unable to load your jobs. Please try again later.</p>
          <Button 
            className="mt-4" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['driver-jobs'] })}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header - Mobile Optimized */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 sm:text-3xl">
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            My Jobs
          </h1>
          <p className="text-sm text-gray-600 mt-1 sm:text-base">View and manage your assigned transport jobs</p>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-4">
        <Card className="mobile-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Today's Jobs</p>
                <p className="text-xl sm:text-2xl font-bold">{todayStats.totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{todayStats.completedJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Upcoming</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{todayStats.upcomingJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Navigation className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">In Progress</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{todayStats.inProgressJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Mobile Optimized */}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Active & Today's Jobs
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {currentJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Current Jobs</h3>
                  <p className="text-gray-600">You don't have any active jobs at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(job)}
                          <div>
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-sm text-gray-600">
                              {job.start_date && formatJobDate(job.start_date)} • {job.start_time && formatJobTime(job.start_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(job.status)}
                          {getPriorityBadge(job.priority)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedJob(job)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{job.title}</DialogTitle>
                              </DialogHeader>
                              {selectedJob && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Job Details</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Status:</span>
                                          <span>{getStatusBadge(selectedJob.status)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Priority:</span>
                                          <span>{getPriorityBadge(selectedJob.priority)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Date:</span>
                                          <span>{formatJobDate(selectedJob.start_date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Time:</span>
                                          <span>{formatJobTime(selectedJob.start_time)}</span>
                                        </div>
                                        {selectedJob.estimated_duration && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span>{selectedJob.estimated_duration} minutes</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Customer Information</h4>
                                      <div className="space-y-2 text-sm">
                                        {selectedJob.customer_name && (
                                          <div>
                                            <span className="text-gray-600">Customer:</span>
                                            <p>{selectedJob.customer_name}</p>
                                          </div>
                                        )}
                                        {selectedJob.customer_contact && (
                                          <div>
                                            <span className="text-gray-600">Contact:</span>
                                            <p>{selectedJob.customer_contact}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Route Information</h4>
                                    <div className="bg-gray-50 p-3 rounded">
                                      {selectedJob.pickup_location && (
                                        <div className="flex items-center gap-2 mb-2">
                                          <MapPin className="w-4 h-4 text-green-600" />
                                          <span className="font-medium">Pickup:</span>
                                          <span>{selectedJob.pickup_location}</span>
                                        </div>
                                      )}
                                      {selectedJob.delivery_location && (
                                        <div className="flex items-center gap-2">
                                          <MapPin className="w-4 h-4 text-red-600" />
                                          <span className="font-medium">Destination:</span>
                                          <span>{selectedJob.delivery_location}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {selectedJob.description && (
                                    <div>
                                      <h4 className="font-medium mb-2">Description</h4>
                                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                        {selectedJob.description}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex gap-3 pt-4">
                                    {selectedJob.status === 'assigned' && (
                                      <Button 
                                        className="bg-blue-600 hover:bg-blue-700"
                                        onClick={() => handleStartJob(selectedJob.id)}
                                        disabled={updateJobStatus.isPending}
                                      >
                                        {updateJobStatus.isPending ? (
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                          <Navigation className="w-4 h-4 mr-2" />
                                        )}
                                        Start Job
                                      </Button>
                                    )}
                                    {selectedJob.status === 'in_progress' && (
                                      <Button 
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleCompleteJob(selectedJob.id)}
                                        disabled={updateJobStatus.isPending}
                                      >
                                        {updateJobStatus.isPending ? (
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                        )}
                                        Mark Complete
                                      </Button>
                                    )}
                                    {selectedJob.customer_contact && (
                                      <Button variant="outline">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Contact Customer
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        {job.pickup_location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span>From: {job.pickup_location}</span>
                          </div>
                        )}
                        {job.delivery_location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span>To: {job.delivery_location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {job.estimated_duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.estimated_duration} min
                            </span>
                          )}
                          {job.customer_name && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {job.customer_name}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {job.status === 'assigned' && (
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleStartJob(job.id)}
                              disabled={updateJobStatus.isPending}
                            >
                              {updateJobStatus.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Navigation className="w-4 h-4 mr-1" />
                              )}
                              Start
                            </Button>
                          )}
                          {job.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleCompleteJob(job.id)}
                              disabled={updateJobStatus.isPending}
                            >
                              {updateJobStatus.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Complete
                            </Button>
                          )}
                          {job.customer_contact && (
                            <Button variant="outline" size="sm">
                              <Phone className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Jobs</h3>
                  <p className="text-gray-600">You don't have any upcoming jobs scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <div className="flex gap-2">
                          {getStatusBadge(job.status)}
                          {getPriorityBadge(job.priority)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Date: {formatJobDate(job.start_date)} • Time: {formatJobTime(job.start_time)}</p>
                        {job.pickup_location && <p>Pickup: {job.pickup_location}</p>}
                        {job.delivery_location && <p>Destination: {job.delivery_location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Completed Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Jobs</h3>
                  <p className="text-gray-600">You haven't completed any jobs yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <div className="flex gap-2">
                          {getStatusBadge(job.status)}
                          {getPriorityBadge(job.priority)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Completed: {formatJobDate(job.updated_at)}</p>
                        {job.actual_duration && <p>Duration: {job.actual_duration} minutes</p>}
                        {job.pickup_location && <p>Pickup: {job.pickup_location}</p>}
                        {job.delivery_location && <p>Destination: {job.delivery_location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          {/* Payment Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_hours.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">
                  All completed jobs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{summary.total_earnings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime earnings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{summary.monthly_earnings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{summary.average_hourly_rate}/h</div>
                <p className="text-xs text-muted-foreground">
                  Average rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Records</h3>
                  <p className="text-gray-600">Complete some jobs to see your payment details.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.job_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={selectedPayments.includes(payment.job_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPayments([...selectedPayments, payment.job_id]);
                            } else {
                              setSelectedPayments(selectedPayments.filter(id => id !== payment.job_id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Include in invoice</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{payment.job_title}</h3>
                          <p className="text-sm text-gray-600">
                            {formatJobDate(payment.job_date)} • {payment.hours_worked.toFixed(1)} hours
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            £{payment.total_payment.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            @ £{payment.hourly_rate}/hour
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {payment.hours_worked.toFixed(1)}h worked
                          </Badge>
                          <Badge 
                            variant={payment.status === 'paid' ? 'default' : 
                                   payment.status === 'overdue' ? 'destructive' : 'secondary'}
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </div>
                        {payment.payment_date && (
                          <div className="text-sm text-gray-600">
                            Paid: {formatJobDate(payment.payment_date)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Send Invoice Button */}
              {payments.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <Button
                    onClick={() => setInvoiceDialogOpen(true)}
                    disabled={selectedPayments.length === 0}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Invoice to Management
                    {selectedPayments.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedPayments.length} selected
                      </Badge>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{summary.jobs_count}</div>
                  <p className="text-sm text-muted-foreground">Jobs Completed</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">£{summary.total_earnings.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{summary.pending_payments}</div>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Payment Information</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Payments are calculated based on actual hours worked</li>
                  <li>• Hourly rate: £{summary.average_hourly_rate}/hour</li>
                  <li>• Monthly earnings: £{summary.monthly_earnings.toFixed(2)}</li>
                  <li>• Contact HR for payment status updates</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-4">
          {/* Invoice Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {payments.filter(p => p.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  £{payments.reduce((sum, payment) => sum + payment.total_payment, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All completed jobs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ready to Invoice</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {payments.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available jobs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Create New Invoice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Create New Invoice
                {invoiceStep !== 'select' && (
                  <Badge variant="outline" className="ml-2">
                    Step {invoiceStep === 'review' ? '2' : '3'} of 3
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Available for Invoice</h3>
                  <p className="text-gray-600">Complete some jobs first to create invoices.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Step 1: Job Selection */}
                  {invoiceStep === 'select' && (
                    <>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Step 1: Select Jobs for Invoice</h4>
                        <p className="text-sm text-blue-800">
                          Choose the completed jobs you want to include in your invoice. You can select multiple jobs to create a single invoice.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Available Jobs</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {payments.map((payment) => (
                            <div key={payment.job_id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={selectedPayments.includes(payment.job_id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPayments([...selectedPayments, payment.job_id]);
                                  } else {
                                    setSelectedPayments(selectedPayments.filter(id => id !== payment.job_id));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{payment.job_title}</span>
                                  <span className="font-bold text-green-600">£{payment.total_payment.toFixed(2)}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatJobDate(payment.job_date)} • {payment.hours_worked.toFixed(1)} hours @ £{payment.hourly_rate}/hour
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Invoice Summary */}
                      {selectedPayments.length > 0 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Invoice Summary</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Selected Jobs:</span>
                              <span className="font-medium">{selectedPayments.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Amount:</span>
                              <span className="font-bold text-lg text-green-600">
                                £{payments
                                  .filter(payment => selectedPayments.includes(payment.job_id))
                                  .reduce((sum, payment) => sum + payment.total_payment, 0)
                                  .toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleNextStep}
                        disabled={selectedPayments.length === 0}
                        className="w-full"
                        size="lg"
                      >
                        Next: Review Invoice
                        <Send className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  )}

                  {/* Step 2: Review Invoice */}
                  {invoiceStep === 'review' && (
                    <>
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2">Step 2: Review Invoice Details</h4>
                        <p className="text-sm text-yellow-800">
                          Review your invoice details and add any additional information before sending to management.
                        </p>
                      </div>

                      {/* Invoice Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Invoice Number</label>
                            <Input value={invoiceData.invoiceNumber} readOnly className="bg-gray-50" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Due Date</label>
                            <Input 
                              type="date" 
                              value={invoiceData.dueDate}
                              onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Additional Notes</label>
                          <textarea
                            value={invoiceData.notes}
                            onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                            placeholder="Add any special requests, notes, or additional information..."
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Payment Terms</label>
                          <Select 
                            value={invoiceData.paymentTerms}
                            onValueChange={(value) => setInvoiceData({...invoiceData, paymentTerms: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7 days">7 days</SelectItem>
                              <SelectItem value="14 days">14 days</SelectItem>
                              <SelectItem value="30 days">30 days</SelectItem>
                              <SelectItem value="60 days">60 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Selected Jobs Review */}
                      <div>
                        <h4 className="font-medium mb-3">Selected Jobs</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {payments
                            .filter(payment => selectedPayments.includes(payment.job_id))
                            .map((payment) => (
                              <div key={payment.job_id} className="p-3 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{payment.job_title}</span>
                                  <span className="font-bold text-green-600">£{payment.total_payment.toFixed(2)}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatJobDate(payment.job_date)} • {payment.hours_worked.toFixed(1)} hours
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handlePrevStep}
                          variant="outline"
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleNextStep}
                          className="flex-1"
                        >
                          Next: Confirm & Send
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Step 3: Confirm & Send */}
                  {invoiceStep === 'confirm' && (
                    <>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Step 3: Confirm & Send Invoice</h4>
                        <p className="text-sm text-green-800">
                          Review your final invoice details and send to management for processing.
                        </p>
                      </div>

                      {/* Final Invoice Summary */}
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-3">Invoice Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Invoice Number:</span>
                            <span className="font-medium">{invoiceData.invoiceNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Amount:</span>
                            <span className="font-bold text-lg text-green-600">£{invoiceData.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Jobs Included:</span>
                            <span className="font-medium">{invoiceData.jobsIncluded.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Due Date:</span>
                            <span className="font-medium">{new Date(invoiceData.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Terms:</span>
                            <span className="font-medium">{invoiceData.paymentTerms}</span>
                          </div>
                        </div>
                      </div>

                      {invoiceData.notes && (
                        <div className="p-4 border rounded-lg bg-blue-50">
                          <h4 className="font-medium mb-2">Additional Notes</h4>
                          <p className="text-sm text-gray-700">{invoiceData.notes}</p>
                        </div>
                      )}

                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2">Important Information</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Invoice will be sent to management for review</li>
                          <li>• Payment processing typically takes 3-5 business days</li>
                          <li>• You will be notified when payment is processed</li>
                          <li>• Contact HR for any payment inquiries</li>
                        </ul>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handlePrevStep}
                          variant="outline"
                          className="flex-1"
                        >
                          Back to Review
                        </Button>
                        <Button
                          onClick={handleCreateInvoice}
                          disabled={createInvoice.isPending}
                          className="flex-1"
                          size="lg"
                        >
                          {createInvoice.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending Invoice...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Invoice to Management
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice History</h3>
                <p className="text-gray-600">View your sent invoices and payment status.</p>
                <Button className="mt-4" variant="outline">
                  View All Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Job History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Job History</h3>
                <p className="text-gray-600">View your complete job history, ratings, and performance metrics.</p>
                <Button className="mt-4" variant="outline">
                  View Full History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Send Invoice to Management
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Selected Payments Summary */}
            <div>
              <h4 className="font-medium mb-3">Selected Payments</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {payments
                  .filter(payment => selectedPayments.includes(payment.job_id))
                  .map((payment) => (
                    <div key={payment.job_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{payment.job_title}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {payment.hours_worked.toFixed(1)}h @ £{payment.hourly_rate}/h
                        </span>
                      </div>
                      <span className="font-bold">£{payment.total_payment.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Invoice Amount:</span>
                  <span className="text-xl font-bold text-blue-600">
                    £{payments
                      .filter(payment => selectedPayments.includes(payment.job_id))
                      .reduce((sum, payment) => sum + payment.total_payment, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Notes */}
            <div>
              <label htmlFor="invoice-notes" className="block text-sm font-medium mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="invoice-notes"
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="Add any additional notes or special requests..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Invoice Information */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-900 mb-2">Invoice Information</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Invoice will be sent to management for review</li>
                <li>• Payment terms: 30 days from invoice date</li>
                <li>• You will be notified when payment is processed</li>
                <li>• Contact HR for any payment inquiries</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setInvoiceDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={createInvoice.isPending || selectedPayments.length === 0}
              className="flex-1"
            >
              {createInvoice.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invoice
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverJobs;
