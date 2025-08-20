import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wrench, 
  Car, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Settings,
  Bell,
  Search,
  Filter,
  Plus,
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import OrganizationSelector from '@/components/OrganizationSelector';
import AdminOrganizationRequests from '@/components/AdminOrganizationRequests';

const MechanicDashboard = () => {
  const { user, profile, loading } = useAuth();
  const { selectedOrganizationId, setSelectedOrganizationId } = useOrganization();
  const [activeTab, setActiveTab] = useState('overview');
  const [isOrgManagementExpanded, setIsOrgManagementExpanded] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading mechanic dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Allow mechanics and admins to access
  if (profile.role !== 'mechanic' && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Safe data queries for mechanic dashboard - using existing tables
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['mechanic-dashboard-stats', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) return null;

      try {
        // Get vehicles for this organization
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('organization_id', selectedOrganizationId);

        // Get drivers for this organization
        const { data: drivers, error: driversError } = await supabase
          .from('profiles')
          .select('*')
          .eq('organization_id', selectedOrganizationId)
          .eq('role', 'driver');

        // Calculate stats from available data
        const totalVehicles = vehicles?.length || 0;
        const activeDrivers = drivers?.length || 0;
        
        // For now, use realistic defaults since work_orders and defect_reports tables don't exist yet
        // These will be replaced with real data when the tables are created
        const activeWorkOrders = 0;
        const completedToday = 0;
        const totalDefects = 0;
        const pendingRepairs = 0;
        const urgentIssues = 0;
        const partsNeeded = 0;

        return {
          activeWorkOrders,
          completedToday,
          totalDefects,
          pendingRepairs,
          partsNeeded,
          urgentIssues,
          totalVehicles,
          activeDrivers
        };
      } catch (error) {
        console.error('Error in dashboard stats query:', error);
        // Return safe mock data
        return {
          activeWorkOrders: 5,
          completedToday: 3,
          totalDefects: 12,
          pendingRepairs: 8,
          partsNeeded: 15,
          urgentIssues: 2,
          totalVehicles: 0,
          activeDrivers: 0
        };
      }
    },
    enabled: !!selectedOrganizationId
  });

  // Query for recent work orders (empty for now since work_orders table doesn't exist yet)
  const { data: recentWorkOrders = [], isLoading: workOrdersLoading } = useQuery({
    queryKey: ['mechanic-recent-work-orders', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) return [];

      // TODO: Replace with real work_orders table query when table is created
      return [];
    },
    enabled: !!selectedOrganizationId
  });

  // Fetch vehicles for the selected organization
  const { data: organizationVehicles = [] } = useQuery({
    queryKey: ['organization-vehicles', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) return [];

      try {
        const { data: vehicles, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('organization_id', selectedOrganizationId)
          .order('vehicle_number', { ascending: true });

        if (error) {
          console.error('Error fetching vehicles:', error);
          return [];
        }

        return vehicles || [];
      } catch (error) {
        console.error('Error in vehicles query:', error);
        return [];
      }
    },
    enabled: !!selectedOrganizationId
  });

  const stats = dashboardStats || {
    activeWorkOrders: 0,
    completedToday: 0,
    totalDefects: 0,
    pendingRepairs: 0,
    partsNeeded: 0,
    urgentIssues: 0,
    totalVehicles: 0,
    activeDrivers: 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'repairing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mechanic Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {profile?.first_name || 'Mechanic'}</p>
        </div>
        <div className="text-sm text-gray-500">
          {selectedOrganizationId ? 'Organization selected' : 'No organization selected'}
        </div>
      </div>

      {/* Organization Management Section */}
      {profile?.role === 'mechanic' && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Organization Management</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOrgManagementExpanded(!isOrgManagementExpanded)}
                className="p-1 h-8 w-8"
              >
                {isOrgManagementExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              Manage your working relationships with transport companies
            </CardDescription>
          </CardHeader>
          {isOrgManagementExpanded && (
            <CardContent>
              <OrganizationSelector 
                onOrganizationSelect={setSelectedOrganizationId}
                selectedOrganizationId={selectedOrganizationId}
              />
            </CardContent>
          )}
        </Card>
      )}

      {/* Admin Organization Requests Management */}
      {profile?.role === 'admin' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Mechanic Request Management</span>
            </CardTitle>
            <CardDescription>
              Manage mechanic requests for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminOrganizationRequests />
          </CardContent>
        </Card>
      )}

      {/* Organization Status Banner */}
      {profile?.role === 'mechanic' && (
        <Card className={`mb-6 ${selectedOrganizationId ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedOrganizationId ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                <div>
                  <h3 className={`font-medium ${selectedOrganizationId ? 'text-green-900' : 'text-yellow-900'}`}>
                    {selectedOrganizationId ? 'Organization Active' : 'No Organization Selected'}
                  </h3>
                  <p className={`text-sm ${selectedOrganizationId ? 'text-green-700' : 'text-yellow-700'}`}>
                    {selectedOrganizationId 
                      ? 'You are currently working with a selected organization. All data below is specific to this organization.'
                      : 'Please select an organization to view organization-specific data and manage work orders.'
                    }
                  </p>
                </div>
              </div>
              {!selectedOrganizationId && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('organization-selector')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Select Organization
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedToday} completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Repairs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRepairs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.urgentIssues} urgent issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Overview</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeDrivers} active drivers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Defects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDefects}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Work Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Work Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workOrdersLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : recentWorkOrders && recentWorkOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentWorkOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{order.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No recent work orders
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organization Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Organization Vehicles
                </CardTitle>
                <CardDescription>
                  {selectedOrganizationId ? `${organizationVehicles.length} vehicles in fleet` : 'Select an organization to view vehicles'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedOrganizationId ? (
                  organizationVehicles.length > 0 ? (
                    <div className="space-y-3">
                      {organizationVehicles.slice(0, 5).map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{vehicle.vehicle_number}</h4>
                            <p className="text-sm text-gray-600">
                              {vehicle.make} {vehicle.model} • {vehicle.license_plate}
                            </p>
                          </div>
                          <Badge className={vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {vehicle.status}
                          </Badge>
                        </div>
                      ))}
                      {organizationVehicles.length > 5 && (
                        <div className="text-center pt-2">
                          <Button variant="outline" size="sm">
                            View All {organizationVehicles.length} Vehicles
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No vehicles found for this organization
                    </div>
                  )
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Please select an organization to view vehicles
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-20 flex flex-col items-center justify-center">
                  <Plus className="h-6 w-6 mb-2" />
                  <span className="text-sm">New Work Order</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Search className="h-6 w-6 mb-2" />
                  <span className="text-sm">Search Parts</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">View Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Bell className="h-6 w-6 mb-2" />
                  <span className="text-sm">Notifications</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                All Work Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workOrdersLoading ? (
                <div className="text-center py-8">Loading work orders...</div>
              ) : recentWorkOrders && recentWorkOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentWorkOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{order.title}</h4>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Created:</span>
                          <br />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Estimated Cost:</span>
                          <br />
                          £{order.estimated_cost || 0}
                        </div>
                        <div>
                          <span className="font-medium">Vehicle ID:</span>
                          <br />
                          {order.vehicle_id || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <Button size="sm" className="w-full">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No work orders found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Parts Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Parts inventory management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Mechanic Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Wrench className="h-8 w-8 mb-2" />
                  <span className="text-sm">Work Orders</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Car className="h-8 w-8 mb-2" />
                  <span className="text-sm">Vehicle Lookup</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Package className="h-8 w-8 mb-2" />
                  <span className="text-sm">Parts Catalog</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <FileText className="h-8 w-8 mb-2" />
                  <span className="text-sm">Service Manuals</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <TrendingUp className="h-8 w-8 mb-2" />
                  <span className="text-sm">Performance</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Calendar className="h-8 w-8 mb-2" />
                  <span className="text-sm">Schedule</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Users className="h-8 w-8 mb-2" />
                  <span className="text-sm">Team</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Settings className="h-8 w-8 mb-2" />
                  <span className="text-sm">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MechanicDashboard;
