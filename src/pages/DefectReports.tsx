import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  AlertTriangle, 
  Car, 
  Clock, 
  CheckCircle, 
  Plus,
  Search,
  Filter,
  User,
  FileText,
  Wrench,
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import OrganizationSelector from '@/components/OrganizationSelector';
import StandardPageLayout, { NavigationTab, MetricCard, FilterOption, TableColumn } from '@/components/layout/StandardPageLayout';

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
  
  // State hooks
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [defectTypeFilter, setDefectTypeFilter] = useState<string>('all');

  const navigate = useNavigate();

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
          .from('defect_reports' as any)
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
            reported_date,
            estimated_cost,
            actual_cost,
            created_at,
            updated_at,
            organization_id
          `)
          .order('created_at', { ascending: false });

        // Use the determined organization ID
        query = query.eq('organization_id', organizationIdToUse);

        const { data: defectData, error: defectError } = await query;

        if (defectError) {
          console.error('Error fetching defect reports:', defectError);
          // Return mock data if table doesn't exist
          if (defectError.code === 'PGRST205' || defectError.code === '42P01') {
            console.warn('defect_reports table not found, returning mock data');
            return [
              {
                id: 'mock-1',
                defect_number: 'DEF-001',
                vehicle_id: 'mock-vehicle-1',
                reported_by: 'John Driver',
                title: 'Brake System Issue',
                description: 'Brake pedal feels soft and requires more pressure',
                defect_type: 'safety',
                severity: 'high',
                status: 'open',
                location: 'Front brakes',
                defect_date: new Date().toISOString(),
                estimated_cost: 500,
                actual_cost: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                organization_id: organizationIdToUse,
                source_type: 'defect_report'
              }
            ] as DefectReport[];
          }
          return [];
        }

        // Transform defect reports to match DefectReport interface
        const transformedData = (defectData || []).map((defect: any) => ({
          ...defect,
          defect_date: defect.reported_date,
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





  const navigationTabs: NavigationTab[] = [
    { value: 'all', label: 'All Reports' },
    { value: 'reported', label: 'Reported' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'repairing', label: 'Repairing' },
    { value: 'resolved', label: 'Resolved' }
  ];

  const metricsCards: MetricCard[] = [
    { title: 'Total Defects', value: defectReports.length.toString() },
    { title: 'Critical Issues', value: defectReports.filter(d => d.severity === 'critical').length.toString() },
    { title: 'In Progress', value: defectReports.filter(d => d.status === 'investigating' || d.status === 'repairing').length.toString() },
    { title: 'Total Cost', value: `£${defectReports.reduce((sum, d) => sum + (d.actual_cost || 0), 0).toLocaleString()}` }
  ];

  const filters: FilterOption[] = [
    { label: 'Severity', value: severityFilter, options: [
      { value: 'all', label: 'All Severity' },
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ], placeholder: 'Filter severity' },
    { label: 'Status', value: statusFilter, options: [
      { value: 'all', label: 'All Status' },
      { value: 'reported', label: 'Reported' },
      { value: 'investigating', label: 'Investigating' },
      { value: 'repairing', label: 'Repairing' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'closed', label: 'Closed' },
    ], placeholder: 'Filter status' },
    { label: 'Type', value: defectTypeFilter, options: [
      { value: 'all', label: 'All Types' },
      { value: 'safety', label: 'Safety' },
      { value: 'mechanical', label: 'Mechanical' },
      { value: 'electrical', label: 'Electrical' },
      { value: 'cosmetic', label: 'Cosmetic' },
      { value: 'other', label: 'Other' },
    ], placeholder: 'Filter type' },
  ];

  return (
    <StandardPageLayout
      title="Defect Reports"
      description="Manage and track vehicle defects and issues"
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      primaryAction={{ label: 'Create Defect Report', onClick: () => navigate('/defect-reports/create'), icon: <Plus className="w-4 h-4" /> }}
      searchConfig={{ placeholder: 'Search defect...', value: searchTerm, onChange: setSearchTerm, showSearch: true }}
      filters={filters}
      onFilterChange={(k,v)=>{
        if(k==='Severity') setSeverityFilter(v);
        if(k==='Status') setStatusFilter(v);
        if(k==='Type') setDefectTypeFilter(v);
      }}
      showTable={true}
      tableData={tabFilteredReports}
      tableColumns={[
        { key: 'vehicle', label: 'Vehicle', render: (d: any) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
              <Car className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <div className="font-medium underline decoration-dotted">{d.vehicle?.make} {d.vehicle?.model}</div>
              <div className="text-xs text-muted-foreground">{d.defect_number}</div>
            </div>
          </div>
        ) },
        { key: 'vehicle_group', label: 'Vehicle Group', render: (_: any) => <span className="text-muted-foreground">—</span> },
        { key: 'reported_date', label: 'Submitted', render: (d: any) => new Date(d.defect_date).toLocaleString() },
        { key: 'duration', label: 'Duration', render: (_: any) => <span className="text-muted-foreground">—</span> },
        { key: 'form', label: 'Inspection Form', render: (_: any) => 'Defect Report' },
        { key: 'user', label: 'User', render: (_: any) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <span className="underline decoration-dotted">{profile?.first_name} {profile?.last_name}</span>
          </div>
        ) },
        { key: 'location', label: 'Location Exception', render: (_: any) => <AlertTriangle className="w-4 h-4 text-amber-500" /> },
        { key: 'failed_items', label: 'Failed Items', render: (d: any) => d.description?.slice(0, 32) || '—' },
      ] as TableColumn[]}
      onRowClick={(item: any) => {
        navigate(`/defect-reports/${item.id}`);
      }}
    >
          {/* Table-only view (old card layout removed) */}
        
      




    </StandardPageLayout>
  );
};

export default DefectReports;
