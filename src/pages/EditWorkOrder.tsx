import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Car, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft,
  Save,
  Settings,
  FileText,
  User,
  MapPin,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import DefaultViewPageLayout from '@/components/layout/DefaultViewPageLayout';

interface UpdateWorkOrderData {
  title?: string;
  description?: string;
  vehicle_id?: string;
  work_order_number?: string;
  work_type?: 'preventive' | 'corrective' | 'emergency' | 'inspection' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status?: 'open' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  location?: string;
  estimated_hours?: number;
  estimated_cost?: number;
  scheduled_date?: string;
  due_date?: string;
  notes?: string;
}

const EditWorkOrder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const { workOrders, updateWorkOrder, isUpdating } = useWorkOrders(selectedOrganizationId);

  // Find the specific work order
  const workOrder = workOrders.find(wo => wo.id === id);

  const [formData, setFormData] = useState<UpdateWorkOrderData>({});

  // Initialize form data when work order is loaded
  useEffect(() => {
    if (workOrder) {
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
        estimated_cost: workOrder.estimated_cost || 0,
        scheduled_date: workOrder.scheduled_date || '',
        due_date: workOrder.due_date || '',
        notes: workOrder.notes || ''
      });
    }
  }, [workOrder]);

  if (!workOrder) {
    return (
      <DefaultViewPageLayout
        title="Work Order Not Found"
        description="The requested work order could not be found"
        onBack={() => navigate('/work-orders')}
      >
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Work order not found</p>
        </div>
      </DefaultViewPageLayout>
    );
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.vehicle_id) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    updateWorkOrder.mutate({
      id: workOrder.id,
      ...formData
    }, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Work order updated successfully',
        });
        navigate(`/work-orders/${workOrder.id}`);
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

  const handleInputChange = (field: keyof UpdateWorkOrderData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const navigationItems = [
    {
      label: 'Work Orders',
      href: '/work-orders',
      icon: <Wrench className="w-4 h-4" />
    },
    {
      label: 'Vehicles',
      href: '/vehicles',
      icon: <Car className="w-4 h-4" />
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <FileText className="w-4 h-4" />
    }
  ];

  const getWorkTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5" />;
      case 'corrective':
        return <Wrench className="w-5 h-5" />;
      case 'preventive':
        return <CheckCircle className="w-5 h-5" />;
      case 'inspection':
        return <FileText className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  return (
    <DefaultViewPageLayout
      title={`Edit Work Order #${workOrder.work_order_number}`}
      description="Update work order details"
      navigationItems={navigationItems}
      backUrl={`/work-orders/${workOrder.id}`}
      backLabel="Back to Work Order"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the problem"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="work_order_number">Work Order Number</Label>
                <Input
                  id="work_order_number"
                  value={formData.work_order_number || ''}
                  onChange={(e) => handleInputChange('work_order_number', e.target.value)}
                  placeholder="Work order number"
                />
              </div>
              <div>
                <Label htmlFor="vehicle">Vehicle *</Label>
                <Select value={formData.vehicle_id || ''} onValueChange={(value) => handleInputChange('vehicle_id', value)}>
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
            </div>
          </CardContent>
        </Card>

        {/* Work Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="w-5 h-5" />
              <span>Work Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="work_type">Work Type</Label>
                <Select value={formData.work_type || 'preventive'} onValueChange={(value: any) => handleInputChange('work_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority || 'medium'} onValueChange={(value: any) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || 'open'} onValueChange={(value: any) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Where is the issue located?"
                />
              </div>
              <div>
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  value={formData.estimated_hours || 0}
                  onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduling & Cost */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Scheduling & Cost</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date || ''}
                  onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estimated_cost">Estimated Cost (£)</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  value={formData.estimated_cost || 0}
                  onChange={(e) => handleInputChange('estimated_cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Additional Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="notes">Work Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes for mechanics, special instructions, etc."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/work-orders/${workOrder.id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            <Save className="w-4 h-4 mr-2" />
            {isUpdating ? 'Updating...' : 'Update Work Order'}
          </Button>
        </div>
      </form>
    </DefaultViewPageLayout>
  );
};

export default EditWorkOrder;
