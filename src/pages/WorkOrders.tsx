import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, 
  Car, 
  Clock, 
  AlertTriangle, 
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
  Package,
  Settings,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  X,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder, useDeleteWorkOrder, WorkOrder, CreateWorkOrderData, UpdateWorkOrderData } from '@/hooks/useWorkOrders';
import StandardPageLayout, { 
  MetricCard,
  NavigationTab, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';

const WorkOrders = () => {
  const { user, profile, loading } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [defectTypeFilter, setDefectTypeFilter] = useState<string>('all');

  // Use the work orders hooks
  const {
    workOrders,
    isLoading,
    error,
    stats: workOrderStats
  } = useWorkOrders(selectedOrganizationId);

  const createWorkOrder = useCreateWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();
  const deleteWorkOrder = useDeleteWorkOrder();

  // Extract loading states from mutation hooks
  const isCreating = createWorkOrder.isPending;
  const isUpdating = updateWorkOrder.isPending;
  const isDeleting = deleteWorkOrder.isPending;

  // Fetch vehicles for dropdown
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) return [];

      const { data, error } = await supabase
        .from('vehicles')
        .select('id, vehicle_number, make, model, license_plate')
        .eq('organization_id', selectedOrganizationId)
        .order('vehicle_number');

      if (error) {
        console.error('Error fetching vehicles:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!selectedOrganizationId
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading work orders...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile.role !== 'mechanic' && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter work orders based on search and filters
  const filteredWorkOrders = workOrders.filter(workOrder => {
    const matchesSearch = workOrder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workOrder.work_order_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = severityFilter === 'all' || workOrder.priority === severityFilter;
    const matchesStatus = statusFilter === 'all' || workOrder.status === statusFilter;
    const matchesWorkType = defectTypeFilter === 'all' || workOrder.work_type === defectTypeFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesWorkType;
  });

  // Filter by tab
  const getTabWorkOrders = (tab: string) => {
    switch (tab) {
      case 'open':
        return filteredWorkOrders.filter(wo => wo.status === 'open');
      case 'assigned':
        return filteredWorkOrders.filter(wo => wo.status === 'assigned');
      case 'in_progress':
        return filteredWorkOrders.filter(wo => wo.status === 'in_progress');
      case 'on_hold':
        return filteredWorkOrders.filter(wo => wo.status === 'on_hold');
      case 'completed':
        return filteredWorkOrders.filter(wo => wo.status === 'completed');
      case 'cancelled':
        return filteredWorkOrders.filter(wo => wo.status === 'cancelled');
      default:
        return filteredWorkOrders;
    }
  };

  const getStatusColor = (status: string) => {
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getWorkTypeColor = (type: string) => {
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const handleDeleteWorkOrder = (id: string) => {
    if (confirm('Are you sure you want to delete this work order?')) {
      deleteWorkOrder.mutate(id, {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Work order deleted successfully',
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: 'Failed to delete work order',
            variant: 'destructive',
          });
        }
      });
    }
  };

  // Navigation tabs
  const navigationTabs: NavigationTab[] = [
    { value: 'all', label: 'All Work Orders' },
    { value: 'open', label: 'Open' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  // Primary action
  const primaryAction: ActionButton = {
    label: 'New Work Order',
    onClick: () => navigate('/work-orders/create'),
    icon: <Plus className="w-4 h-4" />
  };

  // Secondary actions
  const secondaryActions: ActionButton[] = [
    {
      label: 'Export',
      onClick: () => console.log('Export clicked'),
      icon: <Download className="w-4 h-4" />,
      variant: 'outline'
    },
    {
      label: 'Settings',
      onClick: () => console.log('Settings clicked'),
      icon: <Settings className="w-4 h-4" />,
      variant: 'outline'
    }
  ];

  // Metrics cards
  const metricsCards: MetricCard[] = workOrderStats ? [
    {
      title: 'Total Work Orders',
      value: workOrderStats.total.toString(),
      subtitle: 'All time',
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: 'In Progress',
      value: (workOrderStats.byStatus.in_progress + workOrderStats.byStatus.assigned).toString(),
      subtitle: 'In Progress & Assigned',
      icon: <Wrench className="w-5 h-5" />
    },
    {
      title: 'Critical Issues',
      value: workOrderStats.byPriority.critical.toString(),
      subtitle: 'Critical priority',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      title: 'Total Cost',
          value: `£${workOrderStats.totalCost.toFixed(2)}`,
      subtitle: 'Total cost',
      icon: <DollarSign className="w-5 h-5" />
    }
  ] : [];

  // Search configuration
  const searchConfig = {
    placeholder: 'Search work orders...',
    value: searchTerm,
    onChange: setSearchTerm,
    showSearch: true
  };

  // Filters
  const filters: FilterOption[] = [
    {
      label: 'Priority',
          value: severityFilter,
          options: [
        { value: 'all', label: 'All Priorities' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
        { value: 'critical', label: 'Critical' }
      ],
      placeholder: 'Filter by priority'
    },
    {
      label: 'Status',
          value: statusFilter,
          options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'open', label: 'Open' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'completed', label: 'Completed' }
      ],
      placeholder: 'Filter by status'
    },
    {
      label: 'Work Type',
          value: defectTypeFilter,
          options: [
        { value: 'all', label: 'All Types' },
        { value: 'preventive', label: 'Preventive' },
        { value: 'corrective', label: 'Corrective' },
        { value: 'emergency', label: 'Emergency' },
        { value: 'inspection', label: 'Inspection' },
        { value: 'other', label: 'Other' }
      ],
      placeholder: 'Filter by work type'
    }
  ];

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'Priority') {
      setSeverityFilter(value);
    } else if (filterType === 'Status') {
      setStatusFilter(value);
    } else if (filterType === 'Work Type') {
      setDefectTypeFilter(value);
    }
  };

  // Table columns for work orders
  const tableColumns: TableColumn[] = [
    { key: 'work_order_number', label: 'Work Order #' },
    { key: 'title', label: 'Title' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'work_type', label: 'Work Type' },
    { key: 'created_at', label: 'Created' },
    { key: 'actions', label: 'Actions' }
  ];

  // Transform work orders data for table
  const tableData = getTabWorkOrders(activeTab).map(workOrder => ({
    ...workOrder,
    vehicle: workOrder.vehicle?.vehicle_number || 'N/A',
    created_at: new Date(workOrder.created_at).toLocaleDateString(),
    status: (
                          <Badge className={getStatusColor(workOrder.status)}>
                            {workOrder.status}
                          </Badge>
    ),
    priority: (
                          <Badge className={getPriorityColor(workOrder.priority)}>
                            {workOrder.priority}
                          </Badge>
    ),
    work_type: (
                          <Badge className={getWorkTypeColor(workOrder.work_type)}>
                            {workOrder.work_type}
                          </Badge>
    ),
    actions: (
      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
          onClick={() => navigate(`/work-orders/${workOrder.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
          onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWorkOrder(workOrder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
    )
  }));

  return (
    <StandardPageLayout
      title="Work Orders"
      description="Manage vehicle defects and repairs"
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchConfig={searchConfig}
      filters={filters}
      onFilterChange={handleFilterChange}
      showTable={true}
      tableData={tableData}
      tableColumns={tableColumns}
    >
      <div></div>
    </StandardPageLayout>
  );
};

export default WorkOrders;