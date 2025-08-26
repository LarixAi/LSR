import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wrench, 
  Car, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  FileText,
  Calendar,
  Plus,
  Search,
  Filter,
  Loader2,
  MapPin,
  User,
  Phone,
  MessageSquare,
  Settings,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import ResponsiveScaffold from './ResponsiveScaffold';

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  vehicle: string;
  assignedTo: string;
  createdAt: string;
  estimatedTime: string;
  parts: string[];
}

const MobileWorkOrders = () => {
  const { user, profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Mock work orders data - replace with real data from backend
  const workOrders: WorkOrder[] = [
    {
      id: 'WO-001',
      title: 'Brake System Inspection',
      description: 'Routine brake system check and maintenance',
      status: 'in_progress',
      priority: 'high',
      vehicle: 'Bus #123',
      assignedTo: 'John Smith',
      createdAt: '2024-01-15',
      estimatedTime: '2 hours',
      parts: ['Brake pads', 'Brake fluid']
    },
    {
      id: 'WO-002',
      title: 'Engine Oil Change',
      description: 'Scheduled oil change and filter replacement',
      status: 'pending',
      priority: 'medium',
      vehicle: 'Bus #124',
      assignedTo: 'Mike Johnson',
      createdAt: '2024-01-15',
      estimatedTime: '1 hour',
      parts: ['Oil filter', 'Engine oil']
    },
    {
      id: 'WO-003',
      title: 'Tire Replacement',
      description: 'Replace worn tires on front axle',
      status: 'urgent',
      priority: 'urgent',
      vehicle: 'Bus #125',
      assignedTo: 'Sarah Wilson',
      createdAt: '2024-01-15',
      estimatedTime: '3 hours',
      parts: ['Tires', 'Wheel nuts']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-muted text-muted-foreground';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Wrench className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredOrders = workOrders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  return (
    <ResponsiveScaffold
      className="bg-gradient-to-br from-gray-50 via-white to-blue-50"
      scrollable={true}
      padding="medium"
    >
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mobile-text-xl">Work Orders</h1>
            <p className="text-gray-600 mobile-text-responsive">
              Manage vehicle maintenance tasks
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mobile-button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="mobile-card">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-semibold text-blue-600">{workOrders.filter(o => o.status === 'pending').length}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </CardContent>
          </Card>
          
          <Card className="mobile-card">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-semibold text-orange-600">{workOrders.filter(o => o.status === 'in_progress').length}</p>
              <p className="text-xs text-gray-600">In Progress</p>
            </CardContent>
          </Card>
          
          <Card className="mobile-card">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-semibold text-red-600">{workOrders.filter(o => o.status === 'urgent').length}</p>
              <p className="text-xs text-gray-600">Urgent</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['all', 'pending', 'in_progress', 'urgent', 'completed'].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="mobile-button whitespace-nowrap"
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Work Orders</h2>
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card 
              key={order.id} 
              className={`mobile-card cursor-pointer transition-all duration-200 ${
                selectedOrder === order.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedOrder(order.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium mobile-text-responsive">{order.title}</p>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{order.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Car className="w-3 h-3" />
                          <span>{order.vehicle}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{order.estimatedTime}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span className="text-xs">{order.status.replace('_', ' ')}</span>
                    </div>
                  </Badge>
                </div>

                {/* Expanded Details */}
                {selectedOrder === order.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Assigned To</p>
                        <p className="text-sm font-medium">{order.assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm font-medium">{order.createdAt}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Required Parts</p>
                      <div className="flex flex-wrap gap-1">
                        {order.parts.map((part, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 mobile-button"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Update
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 mobile-button"
                        onClick={() => window.open('tel:+1234567890')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 mobile-button"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm">New Order</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 mobile-button"
          >
            <Search className="w-6 h-6" />
            <span className="text-sm">Search Parts</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 mobile-button"
          >
            <Package className="w-6 h-6" />
            <span className="text-sm">Inventory</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 mobile-button"
          >
            <Zap className="w-6 h-6" />
            <span className="text-sm">Quick Fix</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Recent Activity</h2>
        <Card className="mobile-card">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Work Order WO-001 completed</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New work order assigned</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Urgent repair needed</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveScaffold>
  );
};

export default MobileWorkOrders;
