import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingStatusBadge, EmploymentStatusBadge } from '@/components/drivers/DriverStatusBadges';
import DocumentStatusIcons from '@/components/drivers/DocumentStatusIcons';

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
      // Fetch jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, status')
        .eq('driver_id', driverId)
        .eq('organization_id', profile?.organization_id);

      // Fetch time entries
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('hours_worked, miles_driven')
        .eq('driver_id', driverId)
        .eq('organization_id', profile?.organization_id);

      // Fetch incidents
      const { data: incidents } = await supabase
        .from('incident_reports')
        .select('id')
        .eq('driver_id', driverId)
        .eq('organization_id', profile?.organization_id);

      // Fetch violations
      const { data: violations } = await supabase
        .from('compliance_violations')
        .select('id')
        .eq('driver_id', driverId)
        .eq('organization_id', profile?.organization_id);

      // Fetch inspections
      const { data: inspections } = await supabase
        .from('vehicle_inspections')
        .select('id')
        .eq('driver_id', driverId)
        .eq('organization_id', profile?.organization_id);

      // Fetch fuel purchases
      const { data: fuelPurchases } = await supabase
        .from('fuel_purchases')
        .select('id')
        .eq('driver_id', driverId)
        .eq('organization_id', profile?.organization_id);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/drivers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Drivers
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {driver.first_name} {driver.last_name}
            </h1>
            <p className="text-muted-foreground">Driver Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Driver
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employment Status</CardTitle>
            <EmploymentStatusBadge status={driver.employment_status || 'applicant'} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {driver.employment_status === 'active' ? 'Active' : 
               driver.employment_status === 'inactive' ? 'Inactive' : 
               driver.employment_status === 'terminated' ? 'Terminated' : 'Applicant'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding Status</CardTitle>
            <OnboardingStatusBadge status={driver.onboarding_status || 'pending'} />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {driver.onboarding_progress || 0}%
              </div>
              <Progress value={driver.onboarding_progress || 0} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {driver.completed_tasks || 0} of {driver.total_tasks || 0} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <Badge variant={driver.is_active ? "default" : "secondary"}>
              {driver.is_active ? "Active" : "Inactive"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {driver.is_active ? "Active" : "Inactive"}
            </div>
            <p className="text-xs text-muted-foreground">
              Account is {driver.is_active ? "active" : "inactive"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {driver.role}
            </div>
            <p className="text-xs text-muted-foreground">
              System role
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-sm">{driver.first_name} {driver.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {driver.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {driver.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CDL Number</label>
                    <p className="text-sm">{driver.cdl_number || 'Not provided'}</p>
                  </div>
                </div>
                
                {driver.address && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {driver.address}
                      {driver.city && `, ${driver.city}`}
                      {driver.state && `, ${driver.state}`}
                      {driver.zip_code && ` ${driver.zip_code}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hire Date</label>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {driver.hire_date ? format(new Date(driver.hire_date), 'MMM dd, yyyy') : 'Not hired'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Medical Card Expiry</label>
                    <p className="text-sm">
                      {driver.medical_card_expiry ? format(new Date(driver.medical_card_expiry), 'MMM dd, yyyy') : 'Not provided'}
                    </p>
                  </div>
                  {driver.termination_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Termination Date</label>
                      <p className="text-sm">
                        {format(new Date(driver.termination_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          {/* Document Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(driver.completed_documents?.length || 0) + (driver.missing_documents?.length || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Required documents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {driver.completed_documents?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {driver.completed_documents?.length || 0} of {(driver.completed_documents?.length || 0) + (driver.missing_documents?.length || 0)} complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missing</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {driver.missing_documents?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Documents required</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {driver.completed_documents?.length && driver.missing_documents?.length ? 
                    Math.round((driver.completed_documents.length / (driver.completed_documents.length + driver.missing_documents.length)) * 100) : 100}%
                </div>
                <p className="text-xs text-muted-foreground">Compliance rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Document Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Required Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Required Documents
                </CardTitle>
                <CardDescription>
                  Essential documents for driver compliance and employment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Driver License */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Driver License</p>
                      <p className="text-xs text-muted-foreground">Class C or higher</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {driver.completed_documents?.includes('Driver License') ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Missing
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Medical Certificate */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Medical Certificate</p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {driver.medical_card_expiry ? format(new Date(driver.medical_card_expiry), 'MMM dd, yyyy') : 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {driver.completed_documents?.includes('Medical Certificate') ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Valid
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Missing
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* CDL Certificate */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">CDL Certificate</p>
                      <p className="text-xs text-muted-foreground">Commercial Driver License</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {driver.completed_documents?.includes('CDL Certificate') ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Missing
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Background Check */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Background Check</p>
                      <p className="text-xs text-muted-foreground">Criminal record check</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {driver.completed_documents?.includes('Background Check') ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Clear
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Missing
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-gray-600" />
                  Additional Documents
                </CardTitle>
                <CardDescription>
                  Supporting documents and certifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Training Certificates */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Training Certificates</p>
                      <p className="text-xs text-muted-foreground">Safety and compliance training</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {driver.completed_documents?.includes('Training Certificates') ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Vehicle Inspection Cert */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Vehicle Inspection Cert</p>
                      <p className="text-xs text-muted-foreground">Vehicle safety certification</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {driver.completed_documents?.includes('Vehicle Inspection Cert') ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Valid
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Insurance Documents */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Insurance Documents</p>
                      <p className="text-xs text-muted-foreground">Personal insurance coverage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {driver.completed_documents?.includes('Insurance Documents') ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Emergency Contact</p>
                      <p className="text-xs text-muted-foreground">Emergency contact information</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {driver.completed_documents?.includes('Emergency Contact') ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Document Management
              </CardTitle>
              <CardDescription>
                Manage driver documents and compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download All
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Documents
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh Status
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Send Reminders
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Compliance Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Document History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Document History
              </CardTitle>
              <CardDescription>
                Recent document activities and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Driver License verified</p>
                    <p className="text-xs text-muted-foreground">Document was approved by admin</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Medical Certificate uploaded</p>
                    <p className="text-xs text-muted-foreground">New document submitted for review</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 week ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Background Check expired</p>
                    <p className="text-xs text-muted-foreground">Document needs renewal</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 weeks ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.completedJobs || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalHours || 0}</div>
                <p className="text-xs text-muted-foreground">Hours worked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Miles</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMiles || 0}</div>
                <p className="text-xs text-muted-foreground">Miles driven</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fuel Purchases</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.fuelPurchases || 0}</div>
                <p className="text-xs text-muted-foreground">Total purchases</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inspections</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.inspections || 0}</div>
                <p className="text-xs text-muted-foreground">Vehicle inspections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incidents</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.incidents || 0}</div>
                <p className="text-xs text-muted-foreground">Reported incidents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Violations</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.violations || 0}</div>
                <p className="text-xs text-muted-foreground">Compliance violations</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Account History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                  <p className="text-sm">
                    {format(new Date(driver.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">
                    {format(new Date(driver.updated_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
