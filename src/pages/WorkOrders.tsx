import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import PageLayout from '@/components/layout/PageLayout';

const WorkOrders = () => {
  const { user, profile, loading } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [defectTypeFilter, setDefectTypeFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [expandedWorkOrder, setExpandedWorkOrder] = useState<string | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateWorkOrderData>({
    title: '',
    description: '',
    vehicle_id: '',
    work_order_number: '',
    work_type: 'preventive',
    priority: 'medium',
    status: 'open',
    location: '',
    estimated_hours: 0,
    scheduled_date: '',
    due_date: '',
    notes: ''
  });

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
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'on_hold':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'urgent':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'corrective':
        return 'bg-blue-100 text-blue-800';
      case 'preventive':
        return 'bg-green-100 text-green-800';
      case 'inspection':
        return 'bg-gray-100 text-gray-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateWorkOrder = () => {
    if (!formData.title || !formData.vehicle_id) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createWorkOrder.mutate(formData, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Work order created successfully',
        });
        setShowCreateDialog(false);
        setFormData({
          title: '',
          description: '',
          vehicle_id: '',
          work_order_number: '',
          work_type: 'preventive',
          priority: 'medium',
          status: 'open',
          location: '',
          estimated_hours: 0,
          scheduled_date: '',
          due_date: '',
          notes: ''
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: 'Failed to create work order',
          variant: 'destructive',
        });
      }
    });
  };

  const handleUpdateWorkOrder = () => {
    if (!selectedWorkOrder) return;

    updateWorkOrder.mutate({
      id: selectedWorkOrder.id,
      ...formData
    }, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Work order updated successfully',
        });
        setShowEditDialog(false);
        setSelectedWorkOrder(null);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: 'Failed to update work order',
          variant: 'destructive',
        });
      }
    });
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

  const openEditDialog = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setFormData({
      title: workOrder.title,
      description: workOrder.description || '',
      vehicle_id: workOrder.vehicle_id,
      work_order_number: workOrder.work_order_number,
      work_type: workOrder.work_type,
      priority: workOrder.priority || 'medium',
      status: workOrder.status || 'open',
      location: workOrder.location || '',
      estimated_hours: workOrder.estimated_hours || 0,
      scheduled_date: workOrder.scheduled_date || '',
      due_date: workOrder.due_date || '',
      notes: workOrder.notes || ''
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setShowViewDialog(true);
  };

  return (
    <PageLayout
      title="Work Orders"
      description="Manage vehicle defects and repairs"
      actionButton={{
        label: "New Work Order",
        onClick: () => setShowCreateDialog(true),
        icon: <Plus className="h-4 w-4 mr-2" />
      }}
      summaryCards={workOrderStats ? [
        {
          title: "Total Work Orders",
          value: workOrderStats.total,
          subtitle: "All time",
          icon: <FileText className="h-4 w-4" />
        },
        {
          title: "In Progress",
          value: workOrderStats.byStatus.in_progress + workOrderStats.byStatus.assigned,
          subtitle: "In Progress & Assigned",
          icon: <Wrench className="h-4 w-4" />
        },
        {
          title: "Critical Issues",
          value: workOrderStats.byPriority.critical,
          subtitle: "Critical priority",
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "text-red-600"
        },
        {
          title: "Total Cost",
          value: `£${workOrderStats.totalCost.toFixed(2)}`,
          subtitle: "Total cost",
          icon: <DollarSign className="h-4 w-4" />,
          color: "text-green-600"
        }
      ] : []}
      searchPlaceholder="Search work orders..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "All Priorities",
          value: severityFilter,
          options: [
            { value: "all", label: "All Priorities" },
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
            { value: "critical", label: "Critical" }
          ],
          onChange: setSeverityFilter
        },
        {
          label: "All Statuses",
          value: statusFilter,
          options: [
            { value: "all", label: "All Statuses" },
            { value: "open", label: "Open" },
            { value: "assigned", label: "Assigned" },
            { value: "in_progress", label: "In Progress" },
            { value: "on_hold", label: "On Hold" },
            { value: "completed", label: "Completed" }
          ],
          onChange: setStatusFilter
        },
        {
          label: "All Types",
          value: defectTypeFilter,
          options: [
            { value: "all", label: "All Types" },
            { value: "preventive", label: "Preventive" },
            { value: "corrective", label: "Corrective" },
            { value: "emergency", label: "Emergency" },
            { value: "inspection", label: "Inspection" },
            { value: "other", label: "Other" }
          ],
          onChange: setDefectTypeFilter
        }
      ]}
      tabs={[
        { value: "all", label: "All Work Orders" },
        { value: "open", label: "Open" },
        { value: "assigned", label: "Assigned" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={isLoading}
    >

      {/* Work Orders Content */}

      {/* Work Orders List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p>Loading work orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">Error loading work orders</p>
            </div>
          ) : getTabWorkOrders(activeTab).length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Orders</h3>
              <p className="text-gray-600">
                {searchTerm || severityFilter !== 'all' || statusFilter !== 'all' || defectTypeFilter !== 'all'
                  ? 'No work orders match your current filters'
                  : 'No work orders found. Create your first work order to get started.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getTabWorkOrders(activeTab).map((workOrder) => (
                <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{workOrder.title}</h3>
                          <Badge className={getStatusColor(workOrder.status)}>
                            {workOrder.status}
                          </Badge>
                          <Badge className={getPriorityColor(workOrder.priority)}>
                            {workOrder.priority}
                          </Badge>
                          <Badge className={getWorkTypeColor(workOrder.work_type)}>
                            {workOrder.work_type}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Work Order #:</span> {workOrder.work_order_number}
                          </div>
                          <div>
                            <span className="font-medium">Vehicle:</span> {workOrder.vehicle?.vehicle_number || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {new Date(workOrder.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {workOrder.description && (
                          <p className="text-gray-700 mb-4">{workOrder.description}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Estimated Hours:</span> {workOrder.estimated_hours || 0} hrs
                          </div>
                          <div>
                            <span className="font-medium">Scheduled Date:</span> {workOrder.scheduled_date ? new Date(workOrder.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                          </div>
                          <div>
                            <span className="font-medium">Due Date:</span> {workOrder.due_date ? new Date(workOrder.due_date).toLocaleDateString() : 'Not set'}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {workOrder.location || 'Not specified'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(workOrder)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(workOrder)}
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      {/* End of Work Orders List */}

      {/* Create Work Order Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Work Order</DialogTitle>
            <DialogDescription>
              Report a new vehicle defect or maintenance issue
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of the issue"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the problem"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="vehicle">Vehicle *</Label>
              <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number} - {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="defectType">Defect Type</Label>
              <Select value={formData.defect_type} onValueChange={(value: any) => setFormData({ ...formData, defect_type: value })}>
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
              <Select value={formData.severity} onValueChange={(value: any) => setFormData({ ...formData, severity: value })}>
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
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where is the issue located?"
              />
            </div>
            <div>
              <Label htmlFor="estimatedCost">Estimated Cost (£)</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
                placeholder="0.0"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="workNotes">Work Notes</Label>
              <Textarea
                id="workNotes"
                value={formData.work_notes}
                onChange={(e) => setFormData({ ...formData, work_notes: e.target.value })}
                placeholder="Additional notes for mechanics"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkOrder} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Work Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Work Order Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
            <DialogDescription>
              Update work order details
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of the issue"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the problem"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-vehicle">Vehicle *</Label>
              <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number} - {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-defectType">Defect Type</Label>
              <Select value={formData.defect_type} onValueChange={(value: any) => setFormData({ ...formData, defect_type: value })}>
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
              <Label htmlFor="edit-severity">Severity</Label>
              <Select value={formData.severity} onValueChange={(value: any) => setFormData({ ...formData, severity: value })}>
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
            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where is the issue located?"
              />
            </div>
            <div>
              <Label htmlFor="edit-estimatedCost">Estimated Cost (£)</Label>
              <Input
                id="edit-estimatedCost"
                type="number"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="edit-estimatedHours">Estimated Hours</Label>
              <Input
                id="edit-estimatedHours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
                placeholder="0.0"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit-workNotes">Work Notes</Label>
              <Textarea
                id="edit-workNotes"
                value={formData.work_notes}
                onChange={(e) => setFormData({ ...formData, work_notes: e.target.value })}
                placeholder="Additional notes for mechanics"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWorkOrder} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Work Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Work Order Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Work Order Details</DialogTitle>
            <DialogDescription>
              View complete work order information
            </DialogDescription>
          </DialogHeader>
          {selectedWorkOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Title</Label>
                  <p className="text-gray-700">{selectedWorkOrder.title}</p>
                </div>
                <div>
                  <Label className="font-medium">Defect Number</Label>
                  <p className="text-gray-700">{selectedWorkOrder.defect_number}</p>
                </div>
                <div>
                  <Label className="font-medium">Vehicle</Label>
                  <p className="text-gray-700">
                    {selectedWorkOrder.vehicle?.vehicle_number} - {selectedWorkOrder.vehicle?.make} {selectedWorkOrder.vehicle?.model}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedWorkOrder.status)}>
                    {selectedWorkOrder.status}
                  </Badge>
                </div>
                <div>
                  <Label className="font-medium">Severity</Label>
                  <Badge className={getSeverityColor(selectedWorkOrder.severity)}>
                    {selectedWorkOrder.severity}
                  </Badge>
                </div>
                <div>
                  <Label className="font-medium">Defect Type</Label>
                  <Badge className={getDefectTypeColor(selectedWorkOrder.defect_type)}>
                    {selectedWorkOrder.defect_type}
                  </Badge>
                </div>
                <div>
                  <Label className="font-medium">Reported Date</Label>
                  <p className="text-gray-700">{new Date(selectedWorkOrder.reported_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-medium">Reported By</Label>
                  <p className="text-gray-700">
                    {selectedWorkOrder.reported_by_profile?.first_name} {selectedWorkOrder.reported_by_profile?.last_name}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Assigned To</Label>
                  <p className="text-gray-700">
                    {selectedWorkOrder.assigned_mechanic?.first_name} {selectedWorkOrder.assigned_mechanic?.last_name} || 'Unassigned'
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Location</Label>
                  <p className="text-gray-700">{selectedWorkOrder.location || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="font-medium">Estimated Cost</Label>
                  <p className="text-gray-700">£{selectedWorkOrder.estimated_cost.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="font-medium">Actual Cost</Label>
                  <p className="text-gray-700">£{selectedWorkOrder.actual_cost.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="font-medium">Estimated Hours</Label>
                  <p className="text-gray-700">{selectedWorkOrder.estimated_hours || 0} hours</p>
                </div>
                <div>
                  <Label className="font-medium">Actual Hours</Label>
                  <p className="text-gray-700">{selectedWorkOrder.actual_hours || 0} hours</p>
                </div>
              </div>
              
              {selectedWorkOrder.description && (
                <div>
                  <Label className="font-medium">Description</Label>
                  <p className="text-gray-700">{selectedWorkOrder.description}</p>
                </div>
              )}
              
              {selectedWorkOrder.work_notes && (
                <div>
                  <Label className="font-medium">Work Notes</Label>
                  <p className="text-gray-700">{selectedWorkOrder.work_notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedWorkOrder && (
              <Button onClick={() => {
                setShowViewDialog(false);
                openEditDialog(selectedWorkOrder);
              }}>
                Edit Work Order
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default WorkOrders;