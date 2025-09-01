import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { generateSimpleContractPdfBlob } from '@/services/pdfService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingStatusBadge, EmploymentStatusBadge } from '@/components/drivers/DriverStatusBadges';
import DocumentStatusIcons from '@/components/drivers/DocumentStatusIcons';
import PageLayout from '@/components/layout/PageLayout';
import { useDriverDocuments, useDriverDocumentStats, useCreateStandardAgreementDocs } from '@/hooks/useDriverDocuments';
import { useIncidents } from '@/hooks/useIncidents';
import { useVehicleInspections } from '@/hooks/useVehicleInspections';
import { useDriverCompliance } from '@/hooks/useDriverCompliance';
import { useDriverTraining, useAvailableTrainingModules, useAssignTraining } from '@/hooks/useDriverTraining';
import { useRenewalReminders, useRenewalReminderStats } from '@/hooks/useRenewalReminders';
import { useCreateDriverDocumentRequest, useUploadDriverDocument } from '@/hooks/useDriverDocuments';
import { useUpdateDriver } from '@/hooks/useDrivers';
import { toast } from 'sonner';

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
  date_of_birth?: string;
  national_insurance_number?: string;
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
  // Add Driver form extended fields (optional)
  employment_type?: string;
  probation_period_months?: number;
  notice_period_days?: number;
  working_hours_per_week?: number;
  holiday_entitlement_days?: number;
  salary_amount?: number;
  salary_frequency?: string;
  training_budget?: number;
  performance_review_frequency?: string;
  // Compliance flags
  right_to_work_verified?: boolean;
  driver_license_verified?: boolean;
  dqc_card_verified?: boolean;
  tacho_card_verified?: boolean;
  medical_card_verified?: boolean;
  cpc_card_verified?: boolean;
  all_documents_verified?: boolean;
  verification_notes?: string;
  // Benefits
  pension_scheme?: boolean;
  health_insurance?: boolean;
  vehicle_allowance?: boolean;
  fuel_card?: boolean;
  uniform_provided?: boolean;
  // Emergency contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  // Banking
  bank_account_name?: string;
  bank_account_number?: string;
  bank_sort_code?: string;
  tax_code?: string;
  // Availability (summary booleans and times)
  monday_available?: boolean; monday_start_time?: string; monday_end_time?: string;
  tuesday_available?: boolean; tuesday_start_time?: string; tuesday_end_time?: string;
  wednesday_available?: boolean; wednesday_start_time?: string; wednesday_end_time?: string;
  thursday_available?: boolean; thursday_start_time?: string; thursday_end_time?: string;
  friday_available?: boolean; friday_start_time?: string; friday_end_time?: string;
  saturday_available?: boolean; saturday_start_time?: string; saturday_end_time?: string;
  sunday_available?: boolean; sunday_start_time?: string; sunday_end_time?: string;
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
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showProfileImageUpload, setShowProfileImageUpload] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false); // legacy dialog (unused when inline editing)
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [editData, setEditData] = useState<Partial<Driver>>({});
  const { mutateAsync: updateDriver } = useUpdateDriver();
  const createAgreements = useCreateStandardAgreementDocs();
  const [viewInspection, setViewInspection] = useState<any>(null);

  const openPreview = async (doc: any) => {
    try {
      setPreviewLoading(true);
      setPreviewDoc(doc);
      setPreviewOpen(true);
      if (doc?.file_url) {
        setPreviewUrl(doc.file_url);
      } else if (doc?.file_path) {
        const { data, error } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 60 * 30);
        if (!error) setPreviewUrl(data?.signedUrl || null);
      } else {
        setPreviewUrl(null);
      }
    } finally {
      setPreviewLoading(false);
    }
  };
  
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

  // Handle URL parameters for tab and license focus
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const licenseIdParam = urlParams.get('licenseId');
    
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    // If licenseId is provided, we'll handle it in the license section
    if (licenseIdParam) {
      // Store the license ID to highlight it in the license section
      setSelectedLicenseId(licenseIdParam);
    }
  }, []);

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
                <span>Location: {driver.location || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
              </Button>
          <Button variant="outline" size="sm" onClick={() => {
            setEditData({
              first_name: driver.first_name,
              last_name: driver.last_name,
              email: driver.email,
              phone: driver.phone,
              date_of_birth: driver.date_of_birth,
              address: driver.address,
              national_insurance_number: driver.national_insurance_number,
              employment_type: driver.employment_type,
              probation_period_months: driver.probation_period_months,
              notice_period_days: driver.notice_period_days,
              working_hours_per_week: driver.working_hours_per_week,
              holiday_entitlement_days: driver.holiday_entitlement_days,
              salary_amount: driver.salary_amount,
              salary_frequency: driver.salary_frequency,
              // Benefits
              pension_scheme: driver.pension_scheme,
              health_insurance: driver.health_insurance,
              vehicle_allowance: driver.vehicle_allowance,
              fuel_card: driver.fuel_card,
              uniform_provided: driver.uniform_provided,
              // Emergency contact
              emergency_contact_name: driver.emergency_contact_name,
              emergency_contact_phone: driver.emergency_contact_phone,
              emergency_contact_relationship: driver.emergency_contact_relationship,
              // Banking
              bank_account_name: driver.bank_account_name,
              bank_account_number: driver.bank_account_number,
              bank_sort_code: driver.bank_sort_code,
              tax_code: driver.tax_code,
              // Availability
              monday_available: driver.monday_available,
              monday_start_time: driver.monday_start_time,
              monday_end_time: driver.monday_end_time,
              tuesday_available: driver.tuesday_available,
              tuesday_start_time: driver.tuesday_start_time,
              tuesday_end_time: driver.tuesday_end_time,
              wednesday_available: driver.wednesday_available,
              wednesday_start_time: driver.wednesday_start_time,
              wednesday_end_time: driver.wednesday_end_time,
              thursday_available: driver.thursday_available,
              thursday_start_time: driver.thursday_start_time,
              thursday_end_time: driver.thursday_end_time,
              friday_available: driver.friday_available,
              friday_start_time: driver.friday_start_time,
              friday_end_time: driver.friday_end_time,
              saturday_available: driver.saturday_available,
              saturday_start_time: driver.saturday_start_time,
              saturday_end_time: driver.saturday_end_time,
              sunday_available: driver.sunday_available,
              sunday_start_time: driver.sunday_start_time,
              sunday_end_time: driver.sunday_end_time,
              // Compliance
              right_to_work_verified: driver.right_to_work_verified,
              driver_license_verified: driver.driver_license_verified,
              dqc_card_verified: driver.dqc_card_verified,
              tacho_card_verified: driver.tacho_card_verified,
              medical_card_verified: driver.medical_card_verified,
              cpc_card_verified: driver.cpc_card_verified,
              verification_notes: driver.verification_notes,
            });
            setIsEditingOverview(true);
          }}>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Details</CardTitle>
                  <CardDescription>All Fields</CardDescription>
                </div>
                {isEditingOverview && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={()=>{ setIsEditingOverview(false); setEditData({}); }}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={async ()=>{
                      try {
                        await updateDriver({ id: driver.id, updates: editData });
                        toast.success('Driver updated');
                        setDriver(prev => prev ? ({ ...prev, ...editData }) as Driver : prev);
                        setIsEditingOverview(false);
                      } catch (e) {
                        toast.error('Failed to update driver');
                      }
                    }}>Save</Button>
                  </div>
                )}
              </div>
              </CardHeader>
              <CardContent>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">First Name</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600">{driver.first_name}</span>
                      ) : (
                        <Input value={editData.first_name || ''} onChange={(e)=>setEditData(p=>({...p, first_name: e.target.value}))} />
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Middle Name</span>
                        <span className="text-gray-600">-</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Last Name</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600">{driver.last_name}</span>
                      ) : (
                        <Input value={editData.last_name || ''} onChange={(e)=>setEditData(p=>({...p, last_name: e.target.value}))} />
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Email</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600">{driver.email || '-'}</span>
                      ) : (
                        <Input type="email" value={editData.email || ''} onChange={(e)=>setEditData(p=>({...p, email: e.target.value}))} />
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Phone</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600">{driver.phone || '-'}</span>
                      ) : (
                        <Input value={editData.phone || ''} onChange={(e)=>setEditData(p=>({...p, phone: e.target.value}))} />
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Date of Birth</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600">{driver.date_of_birth || '-'}</span>
                      ) : (
                        <Input type="date" value={editData.date_of_birth || ''} onChange={(e)=>setEditData(p=>({...p, date_of_birth: e.target.value}))} />
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Address</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600 truncate max-w-[55%] text-right">{driver.address || '-'}</span>
                      ) : (
                        <Input value={editData.address || ''} onChange={(e)=>setEditData(p=>({...p, address: e.target.value}))} />
                      )}
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
                      <span className="font-medium">NI/SSN</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600">{driver.national_insurance_number || '-'}</span>
                      ) : (
                        <Input value={editData.national_insurance_number || ''} onChange={(e)=>setEditData(p=>({...p, national_insurance_number: e.target.value}))} />
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Employment Type</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600 capitalize">{driver.employment_type || '-'}</span>
                      ) : (
                        <select
                          value={editData.employment_type || ''}
                          onChange={(e)=>setEditData(p=>({...p, employment_type: e.target.value}))}
                          className="w-48 px-3 py-2 border rounded-md"
                        >
                          <option value="">-</option>
                          <option value="full_time">Full Time</option>
                          <option value="part_time">Part Time</option>
                          <option value="casual">Casual</option>
                          <option value="fixed_term">Fixed Term</option>
                          <option value="apprenticeship">Apprenticeship</option>
                          <option value="internship">Internship</option>
                        </select>
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Probation</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600">{driver.probation_period_months ?? '-'} months</span>
                      ) : (
                        <Input type="number" value={editData.probation_period_months ?? ''} onChange={(e)=>setEditData(p=>({...p, probation_period_months: Number(e.target.value)}))} className="w-32" />
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Notice Period</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600">{driver.notice_period_days ?? '-'} days</span>
                      ) : (
                        <Input type="number" value={editData.notice_period_days ?? ''} onChange={(e)=>setEditData(p=>({...p, notice_period_days: Number(e.target.value)}))} className="w-32" />
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Hours / Week</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600">{driver.working_hours_per_week ?? '-'}</span>
                      ) : (
                        <Input type="number" value={editData.working_hours_per_week ?? ''} onChange={(e)=>setEditData(p=>({...p, working_hours_per_week: Number(e.target.value)}))} className="w-32" />
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Holiday Entitlement</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600">{driver.holiday_entitlement_days ?? '-'} days</span>
                      ) : (
                        <Input type="number" value={editData.holiday_entitlement_days ?? ''} onChange={(e)=>setEditData(p=>({...p, holiday_entitlement_days: Number(e.target.value)}))} className="w-32" />
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Salary</span>
                      {!isEditingOverview ? (
                        <span className="text-gray-600">{driver.salary_amount ? `${driver.salary_amount} ${driver.salary_frequency || ''}` : '-'}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input type="number" value={editData.salary_amount ?? ''} onChange={(e)=>setEditData(p=>({...p, salary_amount: Number(e.target.value)}))} className="w-32" />
                          <select value={editData.salary_frequency || ''} onChange={(e)=>setEditData(p=>({...p, salary_frequency: e.target.value}))} className="px-3 py-2 border rounded-md">
                            <option value="">-</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="annually">Annually</option>
                          </select>
                    </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Compliance Summary</span>
                      <span className="text-gray-600">
                        {(driver.all_documents_verified || false) ? 'All verified' : 'Pending'}
                      </span>
                    </div>
                    </div>
                    </div>

                {/* Benefits */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Benefits</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex justify-between border-b py-2"><span>Pension Scheme</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.pension_scheme ? 'Yes' : 'No'}</span>) : (<input type="checkbox" checked={!!editData.pension_scheme} onChange={(e)=>setEditData(p=>({...p, pension_scheme: e.target.checked}))} />)}</div>
                    <div className="flex justify-between border-b py-2"><span>Health Insurance</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.health_insurance ? 'Yes' : 'No'}</span>) : (<input type="checkbox" checked={!!editData.health_insurance} onChange={(e)=>setEditData(p=>({...p, health_insurance: e.target.checked}))} />)}</div>
                    <div className="flex justify-between border-b py-2"><span>Vehicle Allowance</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.vehicle_allowance ? 'Yes' : 'No'}</span>) : (<input type="checkbox" checked={!!editData.vehicle_allowance} onChange={(e)=>setEditData(p=>({...p, vehicle_allowance: e.target.checked}))} />)}</div>
                    <div className="flex justify-between border-b py-2"><span>Fuel Card</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.fuel_card ? 'Yes' : 'No'}</span>) : (<input type="checkbox" checked={!!editData.fuel_card} onChange={(e)=>setEditData(p=>({...p, fuel_card: e.target.checked}))} />)}</div>
                    <div className="flex justify-between border-b py-2"><span>Uniform Provided</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.uniform_provided ? 'Yes' : 'No'}</span>) : (<input type="checkbox" checked={!!editData.uniform_provided} onChange={(e)=>setEditData(p=>({...p, uniform_provided: e.target.checked}))} />)}</div>
                    </div>
                  </div>

                {/* Emergency contact */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-2 border-b"><span className="font-medium">Name</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.emergency_contact_name || '-'}</span>) : (<Input value={editData.emergency_contact_name || ''} onChange={(e)=>setEditData(p=>({...p, emergency_contact_name: e.target.value}))} />)}</div>
                    <div className="flex justify-between items-center py-2 border-b"><span className="font-medium">Phone</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.emergency_contact_phone || '-'}</span>) : (<Input value={editData.emergency_contact_phone || ''} onChange={(e)=>setEditData(p=>({...p, emergency_contact_phone: e.target.value}))} />)}</div>
                    <div className="flex justify-between items-center py-2 border-b"><span className="font-medium">Relationship</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.emergency_contact_relationship || '-'}</span>) : (<Input value={editData.emergency_contact_relationship || ''} onChange={(e)=>setEditData(p=>({...p, emergency_contact_relationship: e.target.value}))} />)}</div>
                    </div>
                    </div>

                {/* Banking */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Banking</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-2 border-b"><span className="font-medium">Account Name</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.bank_account_name || '-'}</span>) : (<Input value={editData.bank_account_name || ''} onChange={(e)=>setEditData(p=>({...p, bank_account_name: e.target.value}))} />)}</div>
                    <div className="flex justify-between items-center py-2 border-b"><span className="font-medium">Account Number</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.bank_account_number || '-'}</span>) : (<Input value={editData.bank_account_number || ''} onChange={(e)=>setEditData(p=>({...p, bank_account_number: e.target.value}))} />)}</div>
                    <div className="flex justify-between items-center py-2 border-b"><span className="font-medium">Sort Code</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.bank_sort_code || '-'}</span>) : (<Input value={editData.bank_sort_code || ''} onChange={(e)=>setEditData(p=>({...p, bank_sort_code: e.target.value}))} />)}</div>
                    <div className="flex justify-between items-center py-2 border-b"><span className="font-medium">Tax Code</span>{!isEditingOverview ? (<span className="text-gray-600">{driver.tax_code || '-'}</span>) : (<Input value={editData.tax_code || ''} onChange={(e)=>setEditData(p=>({...p, tax_code: e.target.value}))} />)}</div>
                    </div>
                    </div>

                {/* Availability Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Availability Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    {([
                      ['Monday','monday'],
                      ['Tuesday','tuesday'],
                      ['Wednesday','wednesday'],
                      ['Thursday','thursday'],
                      ['Friday','friday'],
                      ['Saturday','saturday'],
                      ['Sunday','sunday']
                    ] as const).map(([label, key]) => (
                      <div key={key} className="flex justify-between border-b py-2 items-center gap-2">
                        <span>{label}</span>
                        {!isEditingOverview ? (
                          <span className="text-gray-600">{(driver as any)[`${key}_available`] ? `${(driver as any)[`${key}_start_time`]} - ${(driver as any)[`${key}_end_time`]}` : 'Unavailable'}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={!!(editData as any)[`${key}_available`]} onChange={(e)=>setEditData(p=>({...p, [`${key}_available`]: e.target.checked }))} />
                            <Input type="time" className="w-28" value={(editData as any)[`${key}_start_time`] || ''} onChange={(e)=>setEditData(p=>({...p, [`${key}_start_time`]: e.target.value }))} />
                            <span>-</span>
                            <Input type="time" className="w-28" value={(editData as any)[`${key}_end_time`] || ''} onChange={(e)=>setEditData(p=>({...p, [`${key}_end_time`]: e.target.value }))} />
                    </div>
                        )}
                    </div>
                    ))}
                  </div>
                    </div>

                {/* Compliance summary */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Compliance Summary</h3>
                  {!isEditingOverview ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <Badge variant={driver.right_to_work_verified ? 'default' : 'secondary'}>Right to Work {driver.right_to_work_verified ? '✓' : '–'}</Badge>
                        <Badge variant={driver.driver_license_verified ? 'default' : 'secondary'}>License {driver.driver_license_verified ? '✓' : '–'}</Badge>
                        <Badge variant={driver.dqc_card_verified ? 'default' : 'secondary'}>DQC {driver.dqc_card_verified ? '✓' : '–'}</Badge>
                        <Badge variant={driver.tacho_card_verified ? 'default' : 'secondary'}>Tacho {driver.tacho_card_verified ? '✓' : '–'}</Badge>
                        <Badge variant={driver.medical_card_verified ? 'default' : 'secondary'}>Medical {driver.medical_card_verified ? '✓' : '–'}</Badge>
                        <Badge variant={driver.cpc_card_verified ? 'default' : 'secondary'}>CPC {driver.cpc_card_verified ? '✓' : '–'}</Badge>
                    </div>
                      {driver.verification_notes && (
                        <p className="text-sm text-muted-foreground mt-2">Notes: {driver.verification_notes}</p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs items-center">
                        <label className="flex items-center gap-2"><input type="checkbox" checked={!!editData.right_to_work_verified} onChange={(e)=>setEditData(p=>({...p, right_to_work_verified: e.target.checked}))} /> Right to Work</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={!!editData.driver_license_verified} onChange={(e)=>setEditData(p=>({...p, driver_license_verified: e.target.checked}))} /> License</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={!!editData.dqc_card_verified} onChange={(e)=>setEditData(p=>({...p, dqc_card_verified: e.target.checked}))} /> DQC</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={!!editData.tacho_card_verified} onChange={(e)=>setEditData(p=>({...p, tacho_card_verified: e.target.checked}))} /> Tacho</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={!!editData.medical_card_verified} onChange={(e)=>setEditData(p=>({...p, medical_card_verified: e.target.checked}))} /> Medical</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={!!editData.cpc_card_verified} onChange={(e)=>setEditData(p=>({...p, cpc_card_verified: e.target.checked}))} /> CPC</label>
                    </div>
                      <Textarea rows={3} placeholder="Verification notes" value={editData.verification_notes || ''} onChange={(e)=>setEditData(p=>({...p, verification_notes: e.target.value}))} />
                    </div>
                  )}
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Inline Inspection Viewer */}
        {viewInspection && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inspection Detail</CardTitle>
                  <CardDescription>
                    {format(parseISO(viewInspection.created_at), 'MMM dd, yyyy HH:mm')} • {viewInspection.inspection_type}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={()=>setViewInspection(null)}>Close</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium capitalize">{viewInspection.overall_status}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Defects Found</div>
                  <div className={`font-medium ${viewInspection.defects_found ? 'text-red-600' : 'text-green-600'}`}>{viewInspection.defects_found ? 'Yes' : 'No'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Vehicle</div>
                  <div className="font-medium">{viewInspection.vehicle?.vehicle_number || '-'} {viewInspection.vehicle?.make && viewInspection.vehicle?.model ? `• ${viewInspection.vehicle.make} ${viewInspection.vehicle.model}` : ''}</div>
                </div>
              </div>
              {viewInspection.notes && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-1">Notes</div>
                  <div className="text-sm">{viewInspection.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "renewal" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
              <CardTitle>Renewal Reminders</CardTitle>
                  <CardDescription>Upcoming expiries for this driver</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">Total {renewalStats.total}</Badge>
                    <Badge variant="destructive">Critical {renewalStats.critical}</Badge>
                    <Badge variant="outline">High {renewalStats.high}</Badge>
                    <Badge>Completed {renewalStats.completed}</Badge>
                          </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {renewalReminders.map((r) => (
                          <TableRow key={r.id} className={r.priority === 'critical' ? 'border-l-4 border-l-red-500' : ''}>
                            <TableCell className="font-medium">{r.document_name}</TableCell>
                            <TableCell>{r.document_type}</TableCell>
                            <TableCell>{r.submitted_at ? format(parseISO(r.submitted_at), 'EEE, MMM d, yyyy p') : '-'}</TableCell>
                            <TableCell>{format(parseISO(r.expiry_date), 'EEE, MMM d, yyyy')}</TableCell>
                            <TableCell>
                              <Badge variant={r.priority === 'critical' ? 'destructive' : 'secondary'}>{r.priority}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={r.status === 'completed' ? 'default' : 'outline'}>{r.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                        </div>
                          </div>
              )}
                      </CardContent>
                    </Card>
        )}

        {activeTab === "documents" && (
                    <Card>
            <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                  <CardTitle>Driver Documents</CardTitle>
                  <CardDescription>Onboarding and compliance documents</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                  <Button 
                    onClick={async () => {
                      if (!driver?.id) return;
                      try {
                        await createAgreements.mutateAsync({ driver_id: driver.id, clearExisting: true });
                      } catch (e) {
                        // handled by toast in hook
                      }
                    }}
                    size="sm"
                    variant="secondary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Standard Agreements
                              </Button>
                            </div>
                          </div>
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
                        <Button 
                          onClick={async () => {
                            if (!driver?.id) return;
                            try {
                              await createAgreements.mutateAsync({ driver_id: driver.id, clearExisting: true });
                            } catch (e) {
                              // handled by toast in hook
                            }
                          }}
                          size="sm"
                          variant="secondary"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Standard Agreements
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
                              <Button variant="outline" size="sm" onClick={() => {
                                const params = new URLSearchParams({
                                  name: document.name || '',
                                  type: document.file_type || '',
                                  fileName: document.file_name || '',
                                  url: document.file_url || '',
                                  path: document.file_path || '',
                                });
                                navigate(`/drivers/${driverId}/documents/preview?${params.toString()}`);
                              }}>
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
                              {(document.file_url || document.file_path) ? (
                                <Button variant="outline" size="sm" onClick={async ()=>{
                                  if (document.file_url) { window.open(document.file_url, '_blank'); return; }
                                  if (document.file_path) {
                                    const { data } = await supabase.storage.from('documents').createSignedUrl(document.file_path, 60*10);
                                    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                                  }
                                }}>
                                  <Download className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button variant="secondary" size="sm" onClick={async ()=>{
                                  if (!driver) return;
                                  const blob = await generateSimpleContractPdfBlob({
                                    title: document.name || 'Employment Agreement',
                                    employerName: 'Logistics Solution Resources',
                                    employeeName: `${driver.first_name} ${driver.last_name}`,
                                    effectiveDate: new Date().toISOString().slice(0,10),
                                    body: 'Auto-generated agreement placeholder. Replace with finalized content.'
                                  });
                                  const fileName = `${(document.name||'agreement').toLowerCase().replace(/\s+/g,'-')}-${Date.now()}.pdf`;
                                  const path = `driver-documents/${fileName}`;
                                  const { error: upErr } = await supabase.storage.from('documents').upload(path, blob, { contentType: 'application/pdf' });
                                  if (!upErr) {
                                    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
                                    await supabase.from('driver_documents').update({ file_name: fileName, file_path: path, file_url: urlData.publicUrl, file_type: 'application/pdf', status: 'uploaded' }).eq('id', document.id);
                                    window.location.reload();
                                  }
                                }}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Generate PDF
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* License Information Section - Shows when licenseId is provided */}
                  {selectedLicenseId && driverLicenses && driverLicenses.length > 0 && (
                    <div className="space-y-4 mt-8 pt-8 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">License Information</h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <Eye className="w-3 h-3 mr-1" />
                          Selected License
                        </Badge>
                      </div>
                      
                      {driverLicenses.map((license) => {
                        const isSelected = selectedLicenseId === license.id;
                        if (!isSelected) return null;
                        
                        const expiryDate = new Date(license.expiry_date);
                        const isExpired = expiryDate < new Date();
                        const daysUntilExpiry = differenceInDays(expiryDate, new Date());
                        
                        return (
                          <Card key={license.id} className="border-l-4 border-l-blue-500 ring-2 ring-blue-500">
                            <CardContent className="p-6">
                              {/* License Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-lg font-semibold">{license.license_type}</h4>
                                    <Badge variant={isExpired ? 'destructive' : daysUntilExpiry <= 30 ? 'secondary' : 'default'}>
                                      {isExpired ? 'Expired' : daysUntilExpiry <= 30 ? 'Expiring Soon' : 'Active'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    License Number: <span className="font-mono font-medium">{license.license_number}</span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* License Images Section */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Front of License */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Front of License</Label>
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                                    {license.photo_url ? (
                                      <img 
                                        src={license.photo_url} 
                                        alt="Front of license" 
                                        className="max-w-full max-h-[180px] object-contain rounded"
                                      />
                                    ) : (
                                      <div className="text-center text-gray-500">
                                        <FileText className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">No front image uploaded</p>
                                        <Button variant="outline" size="sm" className="mt-2">
                                          <Upload className="w-4 h-4 mr-1" />
                                          Upload
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Back of License */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Back of License</Label>
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                                    {license.document_url ? (
                                      <img 
                                        src={license.document_url} 
                                        alt="Back of license" 
                                        className="max-w-full max-h-[180px] object-contain rounded"
                                      />
                                    ) : (
                                      <div className="text-center text-gray-500">
                                        <FileText className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">No back image uploaded</p>
                                        <Button variant="outline" size="sm" className="mt-2">
                                          <Upload className="w-4 h-4 mr-1" />
                                          Upload
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* License Details Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <Label className="text-xs font-medium text-gray-500">Issuing Authority</Label>
                                  <p className="text-sm font-medium">{license.issuing_authority || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-gray-500">License Class</Label>
                                  <p className="text-sm font-medium">{license.license_class || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-gray-500">Issue Date</Label>
                                  <p className="text-sm font-medium">{format(new Date(license.issue_date), 'MMM dd, yyyy')}</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-gray-500">Expiry Date</Label>
                                  <p className={`text-sm font-medium ${
                                    isExpired ? 'text-red-600' : daysUntilExpiry <= 30 ? 'text-orange-600' : 'text-green-600'
                                  }`}>
                                    {format(expiryDate, 'MMM dd, yyyy')}
                                    {!isExpired && ` (${daysUntilExpiry} days)`}
                                    {isExpired && ` (Expired ${Math.abs(daysUntilExpiry)} days ago)`}
                                  </p>
                                </div>
                              </div>

                              {/* Endorsements and Restrictions */}
                              {(license.endorsements && license.endorsements.length > 0) || 
                               (license.restrictions && license.restrictions.length > 0) ? (
                                <div className="space-y-3">
                                  {license.endorsements && license.endorsements.length > 0 && (
                                    <div>
                                      <Label className="text-xs font-medium text-gray-500">Endorsements</Label>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {license.endorsements.map((endorsement) => (
                                          <Badge key={endorsement} variant="secondary" className="text-xs">
                                            {endorsement}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {license.restrictions && license.restrictions.length > 0 && (
                                    <div>
                                      <Label className="text-xs font-medium text-gray-500">Restrictions</Label>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {license.restrictions.map((restriction) => (
                                          <Badge key={restriction} variant="destructive" className="text-xs">
                                            {restriction}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : null}

                              {/* Additional Expiry Information */}
                              {(license.medical_certificate_expiry || license.background_check_expiry || 
                                license.drug_test_expiry || license.training_expiry) && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <h5 className="text-sm font-medium text-gray-700 mb-3">Additional Certifications</h5>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {license.medical_certificate_expiry && (
                                      <div>
                                        <Label className="text-xs font-medium text-gray-500">Medical Certificate</Label>
                                        <p className="text-xs">{format(new Date(license.medical_certificate_expiry), 'MMM dd, yyyy')}</p>
                                      </div>
                                    )}
                                    {license.background_check_expiry && (
                                      <div>
                                        <Label className="text-xs font-medium text-gray-500">Background Check</Label>
                                        <p className="text-xs">{format(new Date(license.background_check_expiry), 'MMM dd, yyyy')}</p>
                                      </div>
                                    )}
                                    {license.drug_test_expiry && (
                                      <div>
                                        <Label className="text-xs font-medium text-gray-500">Drug Test</Label>
                                        <p className="text-xs">{format(new Date(license.drug_test_expiry), 'MMM dd, yyyy')}</p>
                                      </div>
                                    )}
                                    {license.training_expiry && (
                                      <div>
                                        <Label className="text-xs font-medium text-gray-500">Training</Label>
                                        <p className="text-xs">{format(new Date(license.training_expiry), 'MMM dd, yyyy')}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {license.notes && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <Label className="text-xs font-medium text-gray-500">Notes</Label>
                                  <p className="text-sm text-gray-600 mt-1">{license.notes}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Document Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewDoc?.name || 'Document Preview'}</DialogTitle>
              <DialogDescription>
                {(previewDoc?.file_type || '').toUpperCase()} {previewDoc?.file_name ? `• ${previewDoc.file_name}` : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-[400px]">
              {previewLoading ? (
                <div className="flex items-center justify-center h-[400px]">Loading…</div>
              ) : previewUrl ? (
                previewDoc?.file_type?.includes('pdf') ? (
                  <iframe src={previewUrl} className="w-full h-[70vh]" />
                ) : (
                  <img src={previewUrl} alt={previewDoc?.name} className="max-h-[70vh] object-contain mx-auto" />
                )
              ) : (
                <div className="text-sm text-gray-600">No preview available. Use Download to view this file.</div>
              )}
        </div>
            <DialogFooter>
              <div className="flex w-full justify-between">
                <Button variant="outline" onClick={()=>setPreviewOpen(false)}>Close</Button>
                {(previewDoc?.file_url || previewDoc?.file_path) && (
                  <Button onClick={async ()=>{
                    if (previewDoc?.file_url) { window.open(previewDoc.file_url, '_blank'); return; }
                    if (previewDoc?.file_path) {
                      const { data } = await supabase.storage.from('documents').createSignedUrl(previewDoc.file_path, 60*10);
                      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                    }
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                              {inspections.filter(i => i.overall_status === 'passed').length}
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
                            <p className="text-sm font-medium text-gray-600">Failed/Flagged</p>
                            <p className="text-2xl font-bold text-red-600">
                              {inspections.filter(i => i.overall_status === 'failed' || i.overall_status === 'flagged').length}
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
                        inspection.overall_status === 'passed' ? 'border-l-green-500' : 
                        (inspection.overall_status === 'failed' || inspection.overall_status === 'flagged') ? 'border-l-red-500' : 'border-l-blue-500'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">Vehicle Inspection</h4>
                                <Badge variant={inspection.overall_status === 'passed' ? 'default' : 'destructive'}>
                                  {inspection.overall_status}
                                </Badge>
                                {inspection.defects_found && (
                                  <Badge variant="destructive">Defects</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {inspection.vehicle?.vehicle_number && `Vehicle: ${inspection.vehicle.vehicle_number}`}
                                {inspection.vehicle?.make && inspection.vehicle?.model && 
                                  ` • ${inspection.vehicle.make} ${inspection.vehicle.model}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {format(parseISO(inspection.created_at), 'MMM dd, yyyy HH:mm')}
                                {inspection.inspection_type && ` • Type: ${inspection.inspection_type}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={()=>setViewInspection(inspection)}>
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
                            <p className="text-2xl font-bold">{complianceData ? `${complianceData.overallScore}%` : '-'}</p>
                            <p className="text-xs text-gray-500">Risk: {complianceData?.riskLevel || '—'}</p>
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

                  {/* Infringements Table */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Infringements</h3>
                    {violations && violations.length > 0 ? (
                      <div className="overflow-x-auto border rounded-md">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left">Date</th>
                              <th className="px-3 py-2 text-left">Type</th>
                              <th className="px-3 py-2 text-left">Severity</th>
                              <th className="px-3 py-2 text-left">Status</th>
                              <th className="px-3 py-2 text-left">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {violations.map((v) => (
                              <tr key={v.id} className="border-t">
                                <td className="px-3 py-2 whitespace-nowrap">{format(new Date(v.violationDate), 'MMM dd, yyyy')}</td>
                                <td className="px-3 py-2">{v.violationType}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-1 rounded text-xs ${v.severity==='high'?'bg-red-100 text-red-700':v.severity==='moderate'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{v.severity}</span>
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-1 rounded text-xs ${v.status==='resolved'?'bg-green-100 text-green-700':v.status==='active'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{v.status}</span>
                                </td>
                                <td className="px-3 py-2 max-w-[480px] truncate" title={v.description}>{v.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No infringements recorded.</div>
                    )}
                  </div>

                  {/* Enhanced License & Certification Status */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">License & Certification Status</h3>
                    {driverLicenses && driverLicenses.length > 0 ? (
                      <div className="space-y-6">
                        {driverLicenses.map((license) => {
                          const expiryDate = new Date(license.expiry_date);
                          const isExpired = expiryDate < new Date();
                          const daysUntilExpiry = differenceInDays(expiryDate, new Date());
                          const isSelected = selectedLicenseId === license.id;
                          
                          return (
                            <Card key={license.id} className={`border-l-4 ${
                              isSelected ? 'ring-2 ring-blue-500' : ''
                            } ${
                              isExpired ? 'border-l-red-500' : 
                              daysUntilExpiry <= 30 ? 'border-l-orange-500' : 'border-l-green-500'
                            }`}>
                              <CardContent className="p-6">
                                {/* License Header */}
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="text-lg font-semibold">{license.license_type}</h4>
                                      <Badge variant={isExpired ? 'destructive' : daysUntilExpiry <= 30 ? 'secondary' : 'default'}>
                                        {isExpired ? 'Expired' : daysUntilExpiry <= 30 ? 'Expiring Soon' : 'Active'}
                                      </Badge>
                                      {isSelected && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                          <Eye className="w-3 h-3 mr-1" />
                                          Selected
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      License Number: <span className="font-mono font-medium">{license.license_number}</span>
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* License Images Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                  {/* Front of License */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Front of License</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                                      {license.photo_url ? (
                                        <img 
                                          src={license.photo_url} 
                                          alt="Front of license" 
                                          className="max-w-full max-h-[180px] object-contain rounded"
                                        />
                                      ) : (
                                        <div className="text-center text-gray-500">
                                          <FileText className="w-8 h-8 mx-auto mb-2" />
                                          <p className="text-sm">No front image uploaded</p>
                                          <Button variant="outline" size="sm" className="mt-2">
                                            <Upload className="w-4 h-4 mr-1" />
                                            Upload
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Back of License */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Back of License</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                                      {license.document_url ? (
                                        <img 
                                          src={license.document_url} 
                                          alt="Back of license" 
                                          className="max-w-full max-h-[180px] object-contain rounded"
                                        />
                                      ) : (
                                        <div className="text-center text-gray-500">
                                          <FileText className="w-8 h-8 mx-auto mb-2" />
                                          <p className="text-sm">No back image uploaded</p>
                                          <Button variant="outline" size="sm" className="mt-2">
                                            <Upload className="w-4 h-4 mr-1" />
                                            Upload
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* License Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <Label className="text-xs font-medium text-gray-500">Issuing Authority</Label>
                                    <p className="text-sm font-medium">{license.issuing_authority || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-gray-500">License Class</Label>
                                    <p className="text-sm font-medium">{license.license_class || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-gray-500">Issue Date</Label>
                                    <p className="text-sm font-medium">{format(new Date(license.issue_date), 'MMM dd, yyyy')}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-gray-500">Expiry Date</Label>
                                    <p className={`text-sm font-medium ${
                                      isExpired ? 'text-red-600' : daysUntilExpiry <= 30 ? 'text-orange-600' : 'text-green-600'
                                    }`}>
                                      {format(expiryDate, 'MMM dd, yyyy')}
                                      {!isExpired && ` (${daysUntilExpiry} days)`}
                                      {isExpired && ` (Expired ${Math.abs(daysUntilExpiry)} days ago)`}
                                    </p>
                                  </div>
                                </div>

                                {/* Endorsements and Restrictions */}
                                {(license.endorsements && license.endorsements.length > 0) || 
                                 (license.restrictions && license.restrictions.length > 0) ? (
                                  <div className="space-y-3">
                                    {license.endorsements && license.endorsements.length > 0 && (
                                      <div>
                                        <Label className="text-xs font-medium text-gray-500">Endorsements</Label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {license.endorsements.map((endorsement) => (
                                            <Badge key={endorsement} variant="secondary" className="text-xs">
                                              {endorsement}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {license.restrictions && license.restrictions.length > 0 && (
                                      <div>
                                        <Label className="text-xs font-medium text-gray-500">Restrictions</Label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {license.restrictions.map((restriction) => (
                                            <Badge key={restriction} variant="destructive" className="text-xs">
                                              {restriction}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : null}

                                {/* Additional Expiry Information */}
                                {(license.medical_certificate_expiry || license.background_check_expiry || 
                                  license.drug_test_expiry || license.training_expiry) && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h5 className="text-sm font-medium text-gray-700 mb-3">Additional Certifications</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      {license.medical_certificate_expiry && (
                                        <div>
                                          <Label className="text-xs font-medium text-gray-500">Medical Certificate</Label>
                                          <p className="text-xs">{format(new Date(license.medical_certificate_expiry), 'MMM dd, yyyy')}</p>
                                        </div>
                                      )}
                                      {license.background_check_expiry && (
                                        <div>
                                          <Label className="text-xs font-medium text-gray-500">Background Check</Label>
                                          <p className="text-xs">{format(new Date(license.background_check_expiry), 'MMM dd, yyyy')}</p>
                                        </div>
                                      )}
                                      {license.drug_test_expiry && (
                                        <div>
                                          <Label className="text-xs font-medium text-gray-500">Drug Test</Label>
                                          <p className="text-xs">{format(new Date(license.drug_test_expiry), 'MMM dd, yyyy')}</p>
                                        </div>
                                      )}
                                      {license.training_expiry && (
                                        <div>
                                          <Label className="text-xs font-medium text-gray-500">Training</Label>
                                          <p className="text-xs">{format(new Date(license.training_expiry), 'MMM dd, yyyy')}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Notes */}
                                {license.notes && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <Label className="text-xs font-medium text-gray-500">Notes</Label>
                                    <p className="text-sm text-gray-600 mt-1">{license.notes}</p>
                                  </div>
                                )}
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

      {/* Edit Driver Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>Update key driver information.</DialogDescription>
            </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" value={editData.first_name || ''} onChange={(e)=>setEditData(p=>({...p, first_name: e.target.value}))} />
                </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" value={editData.last_name || ''} onChange={(e)=>setEditData(p=>({...p, last_name: e.target.value}))} />
              </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={editData.email || ''} onChange={(e)=>setEditData(p=>({...p, email: e.target.value}))} />
                </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={editData.phone || ''} onChange={(e)=>setEditData(p=>({...p, phone: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input id="date_of_birth" type="date" value={editData.date_of_birth || ''} onChange={(e)=>setEditData(p=>({...p, date_of_birth: e.target.value}))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={editData.address || ''} onChange={(e)=>setEditData(p=>({...p, address: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <select
                id="employment_type"
                value={editData.employment_type || ''}
                onChange={(e)=>setEditData(p=>({...p, employment_type: e.target.value}))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">-</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="casual">Casual</option>
                <option value="fixed_term">Fixed Term</option>
                <option value="apprenticeship">Apprenticeship</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="probation">Probation (months)</Label>
              <Input id="probation" type="number" value={editData.probation_period_months ?? ''} onChange={(e)=>setEditData(p=>({...p, probation_period_months: Number(e.target.value)}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice">Notice Period (days)</Label>
              <Input id="notice" type="number" value={editData.notice_period_days ?? ''} onChange={(e)=>setEditData(p=>({...p, notice_period_days: Number(e.target.value)}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Hours / Week</Label>
              <Input id="hours" type="number" value={editData.working_hours_per_week ?? ''} onChange={(e)=>setEditData(p=>({...p, working_hours_per_week: Number(e.target.value)}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holiday">Holiday (days)</Label>
              <Input id="holiday" type="number" value={editData.holiday_entitlement_days ?? ''} onChange={(e)=>setEditData(p=>({...p, holiday_entitlement_days: Number(e.target.value)}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Amount</Label>
              <Input id="salary" type="number" value={editData.salary_amount ?? ''} onChange={(e)=>setEditData(p=>({...p, salary_amount: Number(e.target.value)}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_freq">Salary Frequency</Label>
              <select id="salary_freq" value={editData.salary_frequency || ''} onChange={(e)=>setEditData(p=>({...p, salary_frequency: e.target.value}))} className="w-full px-3 py-2 border rounded-md">
                <option value="">-</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
              </div>
            </div>
            <DialogFooter>
            <Button variant="outline" onClick={()=>setEditOpen(false)}>Cancel</Button>
              <Button 
              onClick={async ()=>{
                try {
                  await updateDriver({ id: driver.id, updates: editData });
                  toast.success('Driver updated');
                  setEditOpen(false);
                  setDriver(prev => prev ? ({ ...prev, ...editData }) as Driver : prev);
                } catch (e) {
                  toast.error('Failed to update driver');
                }
              }}
            >
              Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
