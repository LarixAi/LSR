import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wrench, 
  Car, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  User,
  MapPin,
  DollarSign,
  Calendar,
  Settings,
  Eye
} from 'lucide-react';
import DefaultViewPageLayout from '@/components/layout/DefaultViewPageLayout';

const WorkOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const { workOrders, deleteWorkOrder, isDeleting } = useWorkOrders(selectedOrganizationId);

  // Find the specific work order
  const workOrder = workOrders.find(wo => wo.id === id);

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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this work order?')) {
      deleteWorkOrder.mutate(workOrder.id, {
        onSuccess: () => {
          navigate('/work-orders');
        }
      });
    }
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

  return (
    <DefaultViewPageLayout
      title={`Work Order #${workOrder.work_order_number}`}
      description={workOrder.title}
      navigationItems={navigationItems}
      backUrl="/work-orders"
      backLabel="Back to Work Orders"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

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
              <div>
                <label className="text-sm font-medium text-gray-500">Title</label>
                <p className="text-gray-900">{workOrder.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Work Order Number</label>
                <p className="text-gray-900">{workOrder.work_order_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vehicle</label>
                <p className="text-gray-900">
                  {workOrder.vehicle?.vehicle_number} - {workOrder.vehicle?.make} {workOrder.vehicle?.model}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created Date</label>
                <p className="text-gray-900">
                  {new Date(workOrder.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {workOrder.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{workOrder.description}</p>
              </div>
            )}
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
                <label className="text-sm font-medium text-gray-500">Work Type</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getWorkTypeIcon(workOrder.work_type)}
                  <span className="text-gray-900 capitalize">{workOrder.work_type}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Priority</label>
                <p className="text-gray-900 capitalize">{workOrder.priority}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-gray-900 capitalize">{workOrder.status}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900">{workOrder.location || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estimated Hours</label>
                <p className="text-gray-900">{workOrder.estimated_hours || 0} hours</p>
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
                <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                <p className="text-gray-900">
                  {workOrder.scheduled_date 
                    ? new Date(workOrder.scheduled_date).toLocaleDateString() 
                    : 'Not scheduled'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Due Date</label>
                <p className="text-gray-900">
                  {workOrder.due_date 
                    ? new Date(workOrder.due_date).toLocaleDateString() 
                    : 'Not set'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estimated Cost</label>
                <p className="text-gray-900">£{workOrder.estimated_cost?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        {workOrder.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Additional Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900">{workOrder.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Work History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Work History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Work order created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(workOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {workOrder.updated_at && workOrder.updated_at !== workOrder.created_at && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Work order updated</p>
                    <p className="text-xs text-gray-500">
                      {new Date(workOrder.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DefaultViewPageLayout>
  );
};

export default WorkOrderDetail;
