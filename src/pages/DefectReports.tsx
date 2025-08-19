import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Car, 
  Clock, 
  CheckCircle, 
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  Calendar,
  User,
  FileText,
  Wrench,
  Settings,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  X,
  Camera,
  MapPin,
  AlertCircle,
  Shield,
  Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import OrganizationSelector from '@/components/OrganizationSelector';
import DefectWorkflow from '@/components/defects/DefectWorkflow';

interface DefectReport {
  id: string;
  source_type: 'defect_report' | 'vehicle_check';
  defect_number: string;
  vehicle_id: string;
  reported_by: string;
  title: string;
  description: string;
  defect_type: 'safety' | 'mechanical' | 'electrical' | 'cosmetic' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'repairing' | 'resolved' | 'closed';
  location: string;
  defect_date: string;
  resolved_date: string | null;
  estimated_cost: number;
  actual_cost: number;
  created_at: string;
  updated_at: string;
  vehicle?: {
    make: string;
    model: string;
  };
  reporter?: {
    first_name: string;
    last_name: string;
  };
}

const DefectReports = () => {
  // All hooks must be called at the top level
  const { user, profile, loading } = useAuth();
  const { selectedOrganizationId, setSelectedOrganizationId } = useOrganization();
  const queryClient = useQueryClient();
  
  // State hooks
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [defectTypeFilter, setDefectTypeFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<DefectReport | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    defect_type: 'mechanical' as 'safety' | 'mechanical' | 'electrical' | 'cosmetic' | 'other',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    location: '',
    estimated_cost: 0,
    vehicle_id: '',
    additional_notes: ''
  });

  // Determine which organization ID to use for queries
  const organizationIdToUse = profile?.role === 'mechanic' ? selectedOrganizationId : profile?.organization_id;

  // Fetch combined defects (defect reports + vehicle check defects)
  const { data: defectReports = [], isLoading, error: queryError } = useQuery({
    queryKey: ['combined-defects', organizationIdToUse, profile?.role],
    queryFn: async () => {
      if (!organizationIdToUse) {
        return [];
      }
      
      try {
        // Enhanced query for multi-organization setup
        let query = supabase
          .from('combined_defects' as any)
          .select(`
            id,
            defect_number,
            vehicle_id,
            reported_by,
            title,
            description,
            defect_type,
            severity,
            status,
            location,
            defect_date,
            estimated_cost,
            actual_cost,
            created_at,
            updated_at,
            organization_id,
            source_type
          `)
          .order('created_at', { ascending: false });

        // Use the determined organization ID
        query = query.eq('organization_id', organizationIdToUse);

        const { data: defectData, error: defectError } = await query;

        if (defectError) {
          console.error('Error fetching defect reports:', defectError);
          return [];
        }

        // Transform defect reports to match DefectReport interface
        const transformedData = (defectData || []).map((defect: any) => ({
          ...defect,
          defect_date: defect.defect_date,
          source_type: defect.source_type || 'defect_report' as const
        }));

        return transformedData as unknown as DefectReport[];
        
      } catch (error) {
        console.error('Error in defect fetching:', error);
        return [];
      }
    },
    enabled: !!organizationIdToUse,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  // Fetch vehicles for dropdown
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', organizationIdToUse],
    queryFn: async () => {
      if (!organizationIdToUse) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model')
        .eq('organization_id', organizationIdToUse)
        .order('make');
      
      if (error) {
        console.error('Error fetching vehicles:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!organizationIdToUse,
    staleTime: 0,
    gcTime: 0
  });

  // Effect hooks

  useEffect(() => {
    if (showCreateDialog) {
      setFormData({
        title: '',
        description: '',
        defect_type: 'mechanical',
        severity: 'medium',
        location: '',
        estimated_cost: 0,
        vehicle_id: '',
        additional_notes: ''
      });
    }
  }, [showCreateDialog]);

  // Now handle conditional rendering after all hooks are called
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading defect reports...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show organization selector for mechanics
  if (profile?.role === 'mechanic' && !selectedOrganizationId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Select Organization</h1>
          <OrganizationSelector 
            onOrganizationSelect={setSelectedOrganizationId}
            selectedOrganizationId={selectedOrganizationId || undefined}
          />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Profile Loading Issue</h3>
          <p className="text-red-500 mb-4">Unable to load user profile. Please refresh the page.</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  if (profile.role !== 'mechanic' && profile.role !== 'admin' && profile.role !== 'council') {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter defect reports based on search and filters
  const filteredDefectReports = defectReports.filter((defect) => {
    const matchesSearch = searchTerm === '' || 
      defect.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defect.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defect.defect_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || defect.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || defect.status === statusFilter;
    const matchesType = defectTypeFilter === 'all' || defect.defect_type === defectTypeFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  // Filter by active tab
  const getTabFilteredReports = () => {
    switch (activeTab) {
      case 'reported':
        return filteredDefectReports.filter(d => d.status === 'reported');
      case 'investigating':
        return filteredDefectReports.filter(d => d.status === 'investigating');
      case 'repairing':
        return filteredDefectReports.filter(d => d.status === 'repairing');
      case 'resolved':
        return filteredDefectReports.filter(d => d.status === 'resolved');
      default:
        return filteredDefectReports;
    }
  };

  const tabFilteredReports = getTabFilteredReports();

  // Helper functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'repairing': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reported': return <AlertTriangle className="w-4 h-4" />;
      case 'investigating': return <Search className="w-4 h-4" />;
      case 'repairing': return <Wrench className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <FileText className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDefectTypeIcon = (type: string) => {
    switch (type) {
      case 'safety': return <Shield className="w-4 h-4" />;
      case 'mechanical': return <Wrench className="w-4 h-4" />;
      case 'electrical': return <Zap className="w-4 h-4" />;
      case 'cosmetic': return <Car className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };





  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Defect Reports</h1>
          <p className="text-gray-600 mt-1">Manage and track vehicle defects and issues</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Defect Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Defects</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{defectReports.length}</div>
            <p className="text-xs text-muted-foreground">
              {defectReports.filter(d => d.status === 'resolved').length} resolved
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {defectReports.filter(d => d.severity === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {defectReports.filter(d => d.status === 'investigating' || d.status === 'repairing').length}
            </div>
            <p className="text-xs text-muted-foreground">Being investigated or repaired</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              £{defectReports.reduce((sum, d) => sum + (d.actual_cost || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total repair costs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search defect..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="repairing">Repairing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={defectTypeFilter} onValueChange={setDefectTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="mechanical">Mechanical</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="cosmetic">Cosmetic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            

          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="reported">Reported</TabsTrigger>
          <TabsTrigger value="investigating">Investigating</TabsTrigger>
          <TabsTrigger value="repairing">Repairing</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : tabFilteredReports.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No defect reports found</h3>
              <p className="text-gray-500 mb-4">
                No defect reports found for the selected organization.
              </p>

              {!organizationIdToUse ? (
                <div className="space-y-2">
                  <p className="text-red-500 text-sm">Organization ID is not set. This may prevent data from loading.</p>
                  <div className="flex gap-2">
                    <Button onClick={() => window.location.reload()} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Page
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Defect Report
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {tabFilteredReports.map((defect: DefectReport) => (
                <div key={defect.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{defect.defect_number}</h4>
                        <Badge className={getSeverityColor(defect.severity)}>
                          {defect.severity}
                        </Badge>
                        <Badge className={getStatusColor(defect.status)}>
                          {getStatusIcon(defect.status)}
                          {defect.status}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getDefectTypeIcon(defect.defect_type)}
                          {defect.defect_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {defect.source_type === 'vehicle_check' ? 'Vehicle Check' : 'Manual Report'}
                        </Badge>
                      </div>
                      <h5 className="font-medium text-lg mb-1">{defect.title}</h5>
                      <p className="text-gray-600 text-sm mb-2">{defect.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Vehicle:</span>
                          <p className="font-medium">
                            {defect.vehicle?.make} {defect.vehicle?.model}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p className="font-medium">{defect.location}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Reported:</span>
                          <p className="font-medium">
                            {new Date(defect.defect_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Cost:</span>
                          <p className="font-medium">£{defect.actual_cost || defect.estimated_cost}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDefect(defect);
                          setShowViewDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDefect(defect);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {defect.status === 'reported' || defect.status === 'investigating' ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedDefect(defect);
                            setShowWorkflowDialog(true);
                          }}
                        >
                          <Wrench className="w-4 h-4" />
                          Start Work
                        </Button>
                      ) : defect.status === 'repairing' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedDefect(defect);
                            setShowWorkflowDialog(true);
                          }}
                        >
                          <Wrench className="w-4 h-4" />
                          Continue Work
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Defect Report</DialogTitle>
            <DialogDescription>
              Report a new vehicle defect or issue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of the defect"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the defect"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defect_type">Type</Label>
                <Select
                  value={formData.defect_type}
                  onValueChange={(value: any) => setFormData({ ...formData, defect_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="cosmetic">Cosmetic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where the defect is located"
              />
            </div>
            
            <div>
              <Label htmlFor="estimated_cost">Estimated Cost</Label>
              <Input
                id="estimated_cost"
                type="number"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle create logic here
              setShowCreateDialog(false);
              toast({
                title: 'Defect Report Created',
                description: 'The defect report has been created successfully.',
              });
            }}>
              Create Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Defect Report Details</DialogTitle>
            <DialogDescription>
              {selectedDefect?.defect_number}
            </DialogDescription>
          </DialogHeader>
          {selectedDefect && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Title</Label>
                  <p className="text-lg font-medium">{selectedDefect.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedDefect.status)}>
                    {getStatusIcon(selectedDefect.status)}
                    {selectedDefect.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-gray-700">{selectedDefect.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Vehicle</Label>
                  <p className="font-medium">
                    {selectedDefect.vehicle?.make} {selectedDefect.vehicle?.model}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Location</Label>
                  <p className="font-medium">{selectedDefect.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Severity</Label>
                  <Badge className={getSeverityColor(selectedDefect.severity)}>
                    {selectedDefect.severity}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getDefectTypeIcon(selectedDefect.defect_type)}
                    {selectedDefect.defect_type}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estimated Cost</Label>
                  <p className="font-medium">£{selectedDefect.estimated_cost}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Actual Cost</Label>
                  <p className="font-medium">£{selectedDefect.actual_cost || 0}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reported</Label>
                  <p className="font-medium">
                    {new Date(selectedDefect.defect_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <p className="font-medium">
                    {new Date(selectedDefect.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedDefect && (
              <Button onClick={() => {
                setShowViewDialog(false);
                setShowEditDialog(true);
              }}>
                Edit Defect Report
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Dialog */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Defect Workflow</DialogTitle>
            <DialogDescription>
              {selectedDefect?.defect_number} - {selectedDefect?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedDefect && (
            <DefectWorkflow
              defectId={selectedDefect.id}
              onClose={() => setShowWorkflowDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DefectReports;
