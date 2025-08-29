import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  FileText, 
  Shield, 
  Car, 
  Clock,
  Edit,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Share2,
  RefreshCw,
  Bell,
  BarChart3,
  Settings,
  Folder,
  Award,
  MoreHorizontal,
  Plus,
  ChevronDown,
  History,
  Link,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingStatusBadge, EmploymentStatusBadge } from '@/components/drivers/DriverStatusBadges';
import DocumentStatusIcons from '@/components/drivers/DocumentStatusIcons';
import PageLayout from '@/components/layout/PageLayout';
import { useDriverDocuments, useDriverDocumentStats } from '@/hooks/useDriverDocuments';
import { useIncidents } from '@/hooks/useIncidents';
import { useVehicleInspections } from '@/hooks/useVehicleInspections';
import { useDriverCompliance } from '@/hooks/useDriverCompliance';
import { useDriverTraining, useAvailableTrainingModules, useAssignTraining } from '@/hooks/useDriverTraining';
import { useRenewalReminders, useRenewalReminderStats } from '@/hooks/useRenewalReminders';
import { useCreateDriverDocumentRequest, useUploadDriverDocument } from '@/hooks/useDriverDocuments';

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  organization_id?: string;
  employment_status?: string;
  onboarding_status?: string;
  onboarding_progress?: number;
  completed_tasks?: number;
  total_tasks?: number;
  hire_date?: string;
  termination_date?: string;
  cdl_number?: string;
  medical_card_expiry?: string;
  missing_documents?: string[];
  completed_documents?: string[];
  avatar_url?: string;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

interface DriverStats {
  totalJobs: number;
  completedJobs: number;
  totalHours: number;
  totalMiles: number;
  incidents: number;
  violations: number;
  inspections: number;
  fuelPurchases: number;
}

export default function DriverDetail() {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAssignTrainingDialog, setShowAssignTrainingDialog] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<string>('');
  const [trainingDueDate, setTrainingDueDate] = useState<string>('');
  const [showRequestDocumentDialog, setShowRequestDocumentDialog] = useState(false);
  const [showUploadDocumentDialog, setShowUploadDocumentDialog] = useState(false);
  const [selectedDocumentForUpload, setSelectedDocumentForUpload] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [showProfileImageUpload, setShowProfileImageUpload] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  
  // Document request form state
  const [documentRequestForm, setDocumentRequestForm] = useState({
    name: '',
    category: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    description: ''
  });
  
  // Document upload form state
  const [documentUploadForm, setDocumentUploadForm] = useState({
    name: '',
    category: '',
    notes: ''
  });

  // Real data hooks
  const { data: documents = [], isLoading: documentsLoading } = useDriverDocuments(driverId);
  const { data: incidents = [], isLoading: incidentsLoading } = useIncidents();
  const { data: inspections = [], isLoading: inspectionsLoading } = useVehicleInspections(profile?.organization_id, driverId);
  const { 
    complianceData, 
    trainingModules, 
    violations, 
    driverLicenses,
    loading: complianceLoading 
  } = useDriverCompliance();
  const { data: trainingData, isLoading: trainingLoading } = useDriverTraining(driverId);
  const { data: availableTrainingModules = [] } = useAvailableTrainingModules();
  const { data: renewalReminders = [], isLoading: renewalLoading } = useRenewalReminders(driverId);
  
  const assignTrainingMutation = useAssignTraining();
  const createDocumentRequestMutation = useCreateDriverDocumentRequest();
  const uploadDocumentMutation = useUploadDriverDocument();
  
  // Document request handler
  const handleDocumentRequest = async () => {
    if (!driverId || !documentRequestForm.name || !documentRequestForm.category) {
      return;
    }
    
    try {
      await createDocumentRequestMutation.mutateAsync({
        name: documentRequestForm.name,
        category: documentRequestForm.category,
        description: documentRequestForm.description,
        driver_id: driverId,
        due_date: documentRequestForm.dueDate,
        priority: documentRequestForm.priority as 'low' | 'medium' | 'high' | 'critical',
        is_urgent: documentRequestForm.priority === 'critical'
      });
      
      setShowRequestDocumentDialog(false);
      setDocumentRequestForm({
        name: '',
        category: '',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium',
        description: ''
      });
    } catch (error) {
      console.error('Error requesting document:', error);
    }
  };
  
  // Document upload handler
  const handleDocumentUpload = async () => {
    if (!driverId || !uploadFile) {
      return;
    }
    
    try {
      const documentName = selectedDocumentForUpload?.name || documentUploadForm.name;
      const documentCategory = selectedDocumentForUpload?.category || documentUploadForm.category;
      
      await uploadDocumentMutation.mutateAsync({
        document_id: selectedDocumentForUpload?.id,
        file: uploadFile,
        name: documentName,
        category: documentCategory,
        description: documentUploadForm.notes,
        driver_id: driverId
      });
      
      setShowUploadDocumentDialog(false);
      setSelectedDocumentForUpload(null);
      setUploadFile(null);
      setDocumentUploadForm({
        name: '',
        category: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };
  
  // Filter incidents for this specific driver
  const driverIncidents = incidents.filter(incident => incident.driver_id === driverId);
  
  // Get stats
  const documentStats = useDriverDocumentStats(driverId);
  const renewalStats = useRenewalReminderStats(driverId);

  useEffect(() => {
    if (!driverId) {
      setError('Driver ID is required');
      setLoading(false);
      return;
    }

    const fetchDriverData = async () => {
      try {
        setLoading(true);
        
        // Fetch driver profile
        const { data: driverData, error: driverError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', driverId)
          .eq('organization_id', profile?.organization_id)
          .single();

        if (driverError) {
          throw new Error(`Failed to fetch driver: ${driverError.message}`);
        }

        setDriver(driverData);

        // Fetch driver statistics
        const statsData = await fetchDriverStats(driverId);
        setStats(statsData);

      } catch (err) {
        console.error('Error fetching driver data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch driver data');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [driverId, profile?.organization_id]);



  const fetchDriverStats = async (driverId: string): Promise<DriverStats> => {
    try {
      // Use Promise.allSettled to handle all API calls gracefully
      const results = await Promise.allSettled([
        // Fetch jobs - use assigned_driver_id instead of driver_id
        supabase
          .from('jobs')
          .select('id, status')
          .eq('assigned_driver_id', driverId)
          .eq('organization_id', profile?.organization_id),
        
        // Fetch time entries
        supabase
          .from('time_entries')
          .select('hours_worked, miles_driven')
          .eq('driver_id', driverId),
        
        // Fetch incidents - use correct table name
        supabase
          .from('incidents')
          .select('id')
          .eq('driver_id', driverId)
          .eq('organization_id', profile?.organization_id),
        
        // Fetch violations - this table might not exist
        supabase
          .from('compliance_violations')
          .select('id')
          .eq('driver_id', driverId)
          .eq('organization_id', profile?.organization_id),
        
        // Fetch inspections - this table might not exist
        supabase
          .from('vehicle_inspections')
          .select('id')
          .eq('driver_id', driverId)
          .eq('organization_id', profile?.organization_id),
        
        // Fetch fuel purchases - this table might not exist
        supabase
          .from('fuel_purchases')
          .select('id')
          .eq('driver_id', driverId)
          .eq('organization_id', profile?.organization_id)
      ]);

      // Extract data from results, handling both fulfilled and rejected promises
      const [jobsResult, timeEntriesResult, incidentsResult, violationsResult, inspectionsResult, fuelPurchasesResult] = results;

      const jobs = jobsResult.status === 'fulfilled' && !jobsResult.value.error ? jobsResult.value.data : [];
      const timeEntries = timeEntriesResult.status === 'fulfilled' && !timeEntriesResult.value.error ? timeEntriesResult.value.data : [];
      const incidents = incidentsResult.status === 'fulfilled' && !incidentsResult.value.error ? incidentsResult.value.data : [];
      const violations = violationsResult.status === 'fulfilled' && !violationsResult.value.error ? violationsResult.value.data : [];
      const inspections = inspectionsResult.status === 'fulfilled' && !inspectionsResult.value.error ? inspectionsResult.value.data : [];
      const fuelPurchases = fuelPurchasesResult.status === 'fulfilled' && !fuelPurchasesResult.value.error ? fuelPurchasesResult.value.data : [];

      return {
        totalJobs: jobs?.length || 0,
        completedJobs: jobs?.filter(job => job.status === 'completed').length || 0,
        totalHours: timeEntries?.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0) || 0,
        totalMiles: timeEntries?.reduce((sum, entry) => sum + (entry.miles_driven || 0), 0) || 0,
        incidents: incidents?.length || 0,
        violations: violations?.length || 0,
        inspections: inspections?.length || 0,
        fuelPurchases: fuelPurchases?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      return {
        totalJobs: 0,
        completedJobs: 0,
        totalHours: 0,
        totalMiles: 0,
        incidents: 0,
        violations: 0,
        inspections: 0,
        fuelPurchases: 0,
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading driver details...</p>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/drivers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Drivers
          </Button>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Driver Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error || 'The requested driver could not be found.'}
              </p>
              <Button onClick={() => navigate('/drivers')}>
                Return to Driver Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-400';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'No Access';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'driver':
        return <Car className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Account Owner';
      case 'driver':
        return 'Driver';
      default:
        return 'Employee';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  // Tab options
  const tabOptions = [
    { value: "overview", label: "Overview" },
    { value: "renewal", label: "Renewal Reminders" },
    { value: "documents", label: "Documents" },
    { value: "incidents", label: "Incidents" },
    { value: "inspections", label: "Inspections" },
    { value: "compliance", label: "Compliance" },
    { value: "training", label: "Training" }
  ];

  // Filter options
  const statusFilterOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/drivers')} className="p-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600">Drivers</span>
      </div>

      {/* Driver Profile Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="w-16 h-16 cursor-pointer transition-opacity group-hover:opacity-80">
              <AvatarImage 
                src={driver.avatar_url || ''} 
                alt={`${driver.first_name} ${driver.last_name}`} 
              />
              <AvatarFallback className="text-lg font-medium">
                {getInitials(driver.first_name, driver.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => setShowProfileImageUpload(true)}
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{driver.first_name} {driver.last_name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Group: London Office</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>Email: {driver.email || '-'}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Classifications: {driver.role === 'driver' ? 'Driver' : 'Employee'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {!driver.is_active && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 text-green-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">This Driver doesn't have user access.</span>
          </div>
        </div>
      )}

      <PageLayout
        title=""
        description=""
        summaryCards={[]}
        searchPlaceholder="Search driver records..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: "Status",
            value: statusFilter,
            options: statusFilterOptions,
            onChange: setStatusFilter
          }
        ]}
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {/* Tab Content */}
        {activeTab === "overview" && (
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>All Fields</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">First Name</span>
                      <span className="text-gray-600">{driver.first_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Middle Name</span>
                      <span className="text-gray-600">-</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Last Name</span>
                      <span className="text-gray-600">{driver.last_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Email</span>
                      <span className="text-gray-600">{driver.email || '-'}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Group</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">London Office</span>
                        <span className="text-xs text-gray-400">UK / England / London</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0">
                          <History className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Operator</span>
                      <span className="text-gray-600">{driver.role === 'driver' ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Employee</span>
                      <span className="text-gray-600">Yes</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Phone</span>
                      <span className="text-gray-600">{driver.phone || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "renewal" && (
          <Card>
            <CardHeader>
              <CardTitle>Renewal Reminders</CardTitle>
              <CardDescription>Document and license renewal tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {renewalLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading renewal reminders...</p>
                </div>
              ) : renewalReminders.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No renewal reminders found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Renewal reminders will appear here when documents are due for renewal
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-2xl font-bold">{renewalStats.total}</p>
                          </div>
                          <Bell className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Critical</p>
                            <p className="text-2xl font-bold text-red-600">{renewalStats.critical}</p>
                          </div>
                          <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">High Priority</p>
                            <p className="text-2xl font-bold text-orange-600">{renewalStats.high}</p>
                          </div>
                          <AlertCircle className="w-8 h-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-green-600">{renewalStats.completed}</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Renewal Reminders List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Active Reminders</h3>
                    {renewalReminders.map((reminder) => (
                      <Card key={reminder.id} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{reminder.document_name}</h4>
                                <Badge variant={reminder.priority === 'critical' ? 'destructive' : 'secondary'}>
                                  {reminder.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {reminder.document_type} • Expires: {format(parseISO(reminder.expiry_date), 'MMM dd, yyyy')}
                              </p>
                              <p className="text-sm text-gray-500">
                                {reminder.days_until_expiry > 0 
                                  ? `${reminder.days_until_expiry} days remaining`
                                  : `Expired ${Math.abs(reminder.days_until_expiry)} days ago`
                                }
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={reminder.status === 'completed' ? 'default' : 'outline'}>
                                {reminder.status}
                              </Badge>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "documents" && (
          <Card>
            <CardHeader>
              <CardTitle>Driver Documents</CardTitle>
              <CardDescription>Onboarding and compliance documents</CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No documents found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Driver documents and compliance information will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-2xl font-bold">{documentStats.total}</p>
                          </div>
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Required</p>
                            <p className="text-2xl font-bold text-orange-600">{documentStats.required}</p>
                          </div>
                          <AlertCircle className="w-8 h-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Approved</p>
                            <p className="text-2xl font-bold text-green-600">{documentStats.approved}</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Urgent</p>
                            <p className="text-2xl font-bold text-red-600">{documentStats.urgent}</p>
                          </div>
                          <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">All Documents</h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => setShowRequestDocumentDialog(true)}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Request Document
                        </Button>
                        <Button 
                          onClick={() => setShowUploadDocumentDialog(true)}
                          size="sm"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </Button>
                      </div>
                    </div>
                    {documents.map((document) => (
                      <Card key={document.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{document.name}</h4>
                                <Badge variant={document.priority === 'critical' ? 'destructive' : 'secondary'}>
                                  {document.priority}
                                </Badge>
                                {document.is_urgent && (
                                  <Badge variant="destructive">Urgent</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {document.category} • {document.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                Requested: {format(parseISO(document.requested_at), 'MMM dd, yyyy')}
                                {document.due_date && ` • Due: ${format(parseISO(document.due_date), 'MMM dd, yyyy')}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                document.status === 'approved' ? 'default' : 
                                document.status === 'rejected' ? 'destructive' : 
                                document.status === 'expired' ? 'destructive' : 'outline'
                              }>
                                {document.status}
                              </Badge>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {document.status === 'required' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDocumentForUpload(document);
                                    setShowUploadDocumentDialog(true);
                                  }}
                                >
                                  <Upload className="w-4 h-4" />
                                </Button>
                              )}
                              {document.file_url && (
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "incidents" && (
          <Card>
            <CardHeader>
              <CardTitle>Driver Incidents</CardTitle>
              <CardDescription>All incidents reported by this driver</CardDescription>
            </CardHeader>
            <CardContent>
              {incidentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading incidents...</p>
                </div>
              ) : driverIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No incidents found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Incidents reported by this driver will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-2xl font-bold">{driverIncidents.length}</p>
                          </div>
                          <AlertCircle className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Open</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {driverIncidents.filter(i => i.status === 'open').length}
                            </p>
                          </div>
                          <AlertCircle className="w-8 h-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Resolved</p>
                            <p className="text-2xl font-bold text-green-600">
                              {driverIncidents.filter(i => i.status === 'resolved').length}
                            </p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">High Severity</p>
                            <p className="text-2xl font-bold text-red-600">
                              {driverIncidents.filter(i => i.severity === 'high').length}
                            </p>
                          </div>
                          <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Incidents List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">All Incidents</h3>
                    {driverIncidents.map((incident) => (
                      <Card key={incident.id} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{incident.title}</h4>
                                <Badge variant={getSeverityColor(incident.severity)}>
                                  {incident.severity}
                                </Badge>
                                <Badge variant={getIncidentStatusColor(incident.status)}>
                                  {incident.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                              <p className="text-sm text-gray-500">
                                {incident.incident_date && `Date: ${format(parseISO(incident.incident_date), 'MMM dd, yyyy')}`}
                                {incident.location_address && ` • Location: ${incident.location_address}`}
                                {incident.vehicles && ` • Vehicle: ${incident.vehicles.vehicle_number}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "inspections" && (
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Inspections</CardTitle>
              <CardDescription>Vehicle inspections performed by this driver</CardDescription>
            </CardHeader>
            <CardContent>
              {inspectionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading inspections...</p>
                </div>
              ) : inspections.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No inspections found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Vehicle inspections performed by this driver will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-2xl font-bold">{inspections.length}</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Passed</p>
                            <p className="text-2xl font-bold text-green-600">
                              {inspections.filter(i => i.status === 'passed').length}
                            </p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Failed</p>
                            <p className="text-2xl font-bold text-red-600">
                              {inspections.filter(i => i.status === 'failed').length}
                            </p>
                          </div>
                          <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Recent</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {inspections.filter(i => {
                                const inspectionDate = new Date(i.created_at);
                                const sevenDaysAgo = new Date();
                                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                                return inspectionDate >= sevenDaysAgo;
                              }).length}
                            </p>
                          </div>
                          <Clock className="w-8 h-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Inspections List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">All Inspections</h3>
                    {inspections.map((inspection) => (
                      <Card key={inspection.id} className={`border-l-4 ${
                        inspection.status === 'passed' ? 'border-l-green-500' : 
                        inspection.status === 'failed' ? 'border-l-red-500' : 'border-l-blue-500'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">Vehicle Inspection</h4>
                                <Badge variant={inspection.status === 'passed' ? 'default' : 'destructive'}>
                                  {inspection.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {inspection.vehicles?.vehicle_number && `Vehicle: ${inspection.vehicles.vehicle_number}`}
                                {inspection.vehicles?.make && inspection.vehicles?.model && 
                                  ` • ${inspection.vehicles.make} ${inspection.vehicles.model}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {format(parseISO(inspection.created_at), 'MMM dd, yyyy HH:mm')}
                                {inspection.inspection_type && ` • Type: ${inspection.inspection_type}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "compliance" && (
          <Card>
            <CardHeader>
              <CardTitle>Driver Compliance</CardTitle>
              <CardDescription>Compliance status, violations, and regulatory requirements</CardDescription>
            </CardHeader>
            <CardContent>
              {complianceLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading compliance data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Compliance Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Overall Status</p>
                            <p className="text-2xl font-bold text-green-600">Compliant</p>
                          </div>
                          <Shield className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Licenses</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {driverLicenses?.filter(license => {
                                const expiryDate = new Date(license.expiry_date);
                                return expiryDate > new Date();
                              }).length || 0}
                            </p>
                          </div>
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Pending Renewals</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {driverLicenses?.filter(license => {
                                const expiryDate = new Date(license.expiry_date);
                                const thirtyDaysFromNow = new Date();
                                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                                return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
                              }).length || 0}
                            </p>
                          </div>
                          <AlertCircle className="w-8 h-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Violations</p>
                            <p className="text-2xl font-bold text-red-600">{violations?.length || 0}</p>
                          </div>
                          <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* License & Certification Status */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">License & Certification Status</h3>
                    {driverLicenses && driverLicenses.length > 0 ? (
                      <div className="space-y-3">
                        {driverLicenses.map((license) => {
                          const expiryDate = new Date(license.expiry_date);
                          const isExpired = expiryDate < new Date();
                          const daysUntilExpiry = differenceInDays(expiryDate, new Date());
                          
                          return (
                            <Card key={license.id} className={`border-l-4 ${
                              isExpired ? 'border-l-red-500' : 
                              daysUntilExpiry <= 30 ? 'border-l-orange-500' : 'border-l-green-500'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold">{license.license_type}</h4>
                                      <Badge variant={isExpired ? 'destructive' : daysUntilExpiry <= 30 ? 'secondary' : 'default'}>
                                        {isExpired ? 'Expired' : daysUntilExpiry <= 30 ? 'Expiring Soon' : 'Active'}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      License Number: {license.license_number}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Expires: {format(expiryDate, 'MMM dd, yyyy')}
                                      {!isExpired && ` • ${daysUntilExpiry} days remaining`}
                                      {isExpired && ` • Expired ${Math.abs(daysUntilExpiry)} days ago`}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No licenses found</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Driver license and certification information will appear here
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Recent Violations */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent Violations</h3>
                    {violations && violations.length > 0 ? (
                      <div className="space-y-3">
                        {violations.slice(0, 5).map((violation) => (
                          <Card key={violation.id} className="border-l-4 border-l-red-500">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{violation.violation_type}</h4>
                                    <Badge variant="destructive">{violation.severity}</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{violation.description}</p>
                                  <p className="text-sm text-gray-500">
                                    {format(parseISO(violation.occurred_at), 'MMM dd, yyyy')}
                                    {violation.penalty && ` • Penalty: ${violation.penalty}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No violations found</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Driver has a clean compliance record
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "training" && (
          <Card>
            <CardHeader>
              <CardTitle>Driver Training</CardTitle>
              <CardDescription>Assign, track, and manage driver training programs</CardDescription>
            </CardHeader>
            <CardContent>
              {trainingLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading training data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Training Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                            <p className="text-2xl font-bold">{trainingData?.assignments?.length || 0}</p>
                          </div>
                          <Award className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-green-600">
                              {trainingData?.assignments?.filter(a => a.status === 'completed').length || 0}
                            </p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {trainingData?.assignments?.filter(a => a.status === 'in_progress').length || 0}
                            </p>
                          </div>
                          <Clock className="w-8 h-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Overdue</p>
                            <p className="text-2xl font-bold text-red-600">
                              {trainingData?.assignments?.filter(a => {
                                const dueDate = new Date(a.due_date);
                                return dueDate < new Date() && a.status !== 'completed';
                              }).length || 0}
                            </p>
                          </div>
                          <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Assigned Training */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Assigned Training</h3>
                      <Button 
                        onClick={() => setShowAssignTrainingDialog(true)}
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Assign Training
                      </Button>
                    </div>
                    
                    {trainingData?.assignments && trainingData.assignments.length > 0 ? (
                      <div className="space-y-3">
                        {trainingData.assignments.map((assignment) => (
                          <Card key={assignment.id} className={`border-l-4 ${
                            assignment.status === 'completed' ? 'border-l-green-500' : 
                            assignment.status === 'overdue' ? 'border-l-red-500' : 'border-l-blue-500'
                          }`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{assignment.training_modules?.name}</h4>
                                    <Badge variant={
                                      assignment.status === 'completed' ? 'default' : 
                                      assignment.status === 'overdue' ? 'destructive' : 'secondary'
                                    }>
                                      {assignment.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {assignment.training_modules?.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>Due: {format(parseISO(assignment.due_date), 'MMM dd, yyyy')}</span>
                                    <span>Progress: {assignment.progress}%</span>
                                    {assignment.profiles && (
                                      <span>Assigned by: {assignment.profiles.first_name} {assignment.profiles.last_name}</span>
                                    )}
                                  </div>
                                  {assignment.progress > 0 && assignment.progress < 100 && (
                                    <Progress value={assignment.progress} className="mt-2" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No training assigned</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Assign training courses to this driver
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Available Training Courses */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Available Training Courses</h3>
                    {availableTrainingModules.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableTrainingModules.slice(0, 6).map((module) => (
                          <Card key={module.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{module.name}</h4>
                                <Badge variant={module.is_required ? 'destructive' : 'secondary'}>
                                  {module.is_required ? 'Required' : 'Optional'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  Duration: {module.duration} minutes
                                </span>
                                <Button 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTraining(module.id);
                                    setTrainingDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                                    setShowAssignTrainingDialog(true);
                                  }}
                                >
                                  Assign
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No training courses available</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Training courses will appear here when available
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Training History */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Training History</h3>
                    {trainingData?.completions && trainingData.completions.length > 0 ? (
                      <div className="space-y-3">
                        {trainingData.completions.slice(0, 5).map((completion) => (
                          <Card key={completion.id} className="border-l-4 border-l-green-500">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{completion.training_modules?.name}</h4>
                                    <Badge variant="default">Completed</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {completion.training_modules?.description}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Completed: {format(parseISO(completion.completed_at), 'MMM dd, yyyy')}
                                    {completion.score && ` • Score: ${completion.score}%`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {completion.certificate_url && (
                                    <Button variant="outline" size="sm">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No training history</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Completed training courses will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Request Document Dialog */}
        <Dialog open={showRequestDocumentDialog} onOpenChange={setShowRequestDocumentDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Document</DialogTitle>
              <DialogDescription>
                Request a document from this driver. They will be notified to upload the required document.
              </DialogDescription>
            </DialogHeader>
                          <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="documentName" className="text-right">
                    Document Name
                  </Label>
                  <Input
                    id="documentName"
                    placeholder="e.g., Driver License, Medical Certificate"
                    className="col-span-3"
                    value={documentRequestForm.name}
                    onChange={(e) => setDocumentRequestForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="documentCategory" className="text-right">
                    Category
                  </Label>
                  <Select value={documentRequestForm.category} onValueChange={(value) => setDocumentRequestForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="license">License</SelectItem>
                      <SelectItem value="medical">Medical Certificate</SelectItem>
                      <SelectItem value="training">Training Certificate</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    className="col-span-3"
                    value={documentRequestForm.dueDate}
                    onChange={(e) => setDocumentRequestForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select value={documentRequestForm.priority} onValueChange={(value) => setDocumentRequestForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about the document request"
                    className="col-span-3"
                    value={documentRequestForm.description}
                    onChange={(e) => setDocumentRequestForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRequestDocumentDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDocumentRequest}
                disabled={!documentRequestForm.name || !documentRequestForm.category || createDocumentRequestMutation.isPending}
              >
                {createDocumentRequestMutation.isPending ? 'Requesting...' : 'Request Document'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Document Dialog */}
        <Dialog open={showUploadDocumentDialog} onOpenChange={setShowUploadDocumentDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                {selectedDocumentForUpload 
                  ? `Upload document for: ${selectedDocumentForUpload.name}`
                  : 'Upload a new document for this driver'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {!selectedDocumentForUpload && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="uploadDocumentName" className="text-right">
                      Document Name
                    </Label>
                    <Input
                      id="uploadDocumentName"
                      placeholder="e.g., Driver License, Medical Certificate"
                      className="col-span-3"
                      value={documentUploadForm.name}
                      onChange={(e) => setDocumentUploadForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="uploadDocumentCategory" className="text-right">
                      Category
                    </Label>
                    <Select value={documentUploadForm.category} onValueChange={(value) => setDocumentUploadForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="license">License</SelectItem>
                        <SelectItem value="medical">Medical Certificate</SelectItem>
                        <SelectItem value="training">Training Certificate</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="uploadFile" className="text-right">
                  File
                </Label>
                <div className="col-span-3">
                  <Input
                    id="uploadFile"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="uploadDescription" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="uploadDescription"
                  placeholder="Additional notes about this document"
                  className="col-span-3"
                  value={documentUploadForm.notes}
                  onChange={(e) => setDocumentUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowUploadDocumentDialog(false);
                setSelectedDocumentForUpload(null);
                setUploadFile(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleDocumentUpload}
                disabled={!uploadFile || uploadDocumentMutation.isPending}
              >
                {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Profile Image Upload Dialog */}
        <Dialog open={showProfileImageUpload} onOpenChange={setShowProfileImageUpload}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Profile Image</DialogTitle>
              <DialogDescription>
                Upload a new profile image for {driver?.first_name} {driver?.last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profileImage" className="text-right">
                  Image
                </Label>
                <div className="col-span-3">
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Accepted formats: JPG, PNG, GIF (Max 5MB)
                  </p>
                </div>
              </div>
              {profileImageFile && (
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage 
                        src={URL.createObjectURL(profileImageFile)} 
                        alt="Preview" 
                      />
                      <AvatarFallback className="text-2xl font-medium">
                        {getInitials(driver?.first_name || '', driver?.last_name || '')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowProfileImageUpload(false);
                setProfileImageFile(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (!profileImageFile || !driverId) return;
                  
                  try {
                    // Upload the image to Supabase storage
                    const fileExt = profileImageFile.name.split('.').pop();
                    const fileName = `${driverId}/profile-image.${fileExt}`;
                    
                    const { data: uploadData, error: uploadError } = await supabase.storage
                      .from('driver-avatars')
                      .upload(fileName, profileImageFile, {
                        cacheControl: '3600',
                        upsert: true
                      });

                    if (uploadError) {
                      console.error('Error uploading image:', uploadError);
                      return;
                    }

                    // Get the public URL
                    const { data: { publicUrl } } = supabase.storage
                      .from('driver-avatars')
                      .getPublicUrl(fileName);

                    // Update the driver's profile with the new avatar URL
                    const { error: updateError } = await supabase
                      .from('profiles')
                      .update({ avatar_url: publicUrl })
                      .eq('id', driverId);

                    if (updateError) {
                      console.error('Error updating profile:', updateError);
                      return;
                    }

                    // Update local state
                    setDriver(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
                    
                    setShowProfileImageUpload(false);
                    setProfileImageFile(null);
                  } catch (error) {
                    console.error('Error updating profile image:', error);
                  }
                }}
                disabled={!profileImageFile}
              >
                Update Profile Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageLayout>
    </div>
  );
}
