import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  ChevronRight,
  Tool,
  Gauge,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ResponsiveScaffold from './ResponsiveScaffold';

const MobileMechanicDashboard = () => {
  const { user, profile, loading } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const [activeSection, setActiveSection] = useState('overview');

  // Fetch mechanic dashboard data
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

        const totalVehicles = vehicles?.length || 0;
        const activeDrivers = drivers?.length || 0;
        
        // Mock data for now - replace with real data when tables are created
        return {
          activeWorkOrders: 5,
          completedToday: 3,
          totalDefects: 12,
          pendingRepairs: 8,
          partsNeeded: 15,
          urgentIssues: 2,
          totalVehicles,
          activeDrivers
        };
      } catch (error) {
        console.error('Error in dashboard stats query:', error);
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

  if (loading || statsLoading) {
    return (
      <ResponsiveScaffold>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 mobile-text-responsive">Loading mechanic dashboard...</p>
          </div>
        </div>
      </ResponsiveScaffold>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900 mobile-text-xl">Mechanic Dashboard</h1>
            <p className="text-gray-600 mobile-text-responsive">
              Welcome back, {profile?.first_name || 'Mechanic'}!
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mobile-button"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="mobile-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-lg font-semibold">{dashboardStats?.activeWorkOrders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mobile-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-lg font-semibold">{dashboardStats?.completedToday || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mobile-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Urgent Issues</p>
                  <p className="text-lg font-semibold">{dashboardStats?.urgentIssues || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mobile-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Parts Needed</p>
                  <p className="text-lg font-semibold">{dashboardStats?.partsNeeded || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 mobile-button"
            onClick={() => setActiveSection('work-orders')}
          >
            <FileText className="w-6 h-6" />
            <span className="text-sm">Work Orders</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 mobile-button"
            onClick={() => setActiveSection('fleet')}
          >
            <Car className="w-6 h-6" />
            <span className="text-sm">Fleet</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 mobile-button"
            onClick={() => setActiveSection('inventory')}
          >
            <Package className="w-6 h-6" />
            <span className="text-sm">Inventory</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 mobile-button"
            onClick={() => setActiveSection('defects')}
          >
            <AlertTriangle className="w-6 h-6" />
            <span className="text-sm">Defects</span>
          </Button>
        </div>
      </div>

      {/* Fleet Overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Fleet Overview</h2>
        <Card className="mobile-card">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  <span className="font-medium mobile-text-responsive">Total Vehicles</span>
                </div>
                <Badge variant="secondary">{dashboardStats?.totalVehicles || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-medium mobile-text-responsive">Active Drivers</span>
                </div>
                <Badge variant="secondary">{dashboardStats?.activeDrivers || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-medium mobile-text-responsive">Pending Repairs</span>
                </div>
                <Badge variant="destructive">{dashboardStats?.pendingRepairs || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Work Orders */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Recent Work Orders</h2>
        <div className="space-y-3">
          {/* Mock work orders - replace with real data */}
          {[1, 2, 3].map((order) => (
            <Card key={order} className="mobile-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium mobile-text-responsive">Work Order #{order}</p>
                      <p className="text-sm text-gray-600">Vehicle Maintenance</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    In Progress
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Performance</h2>
        <Card className="mobile-card">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-sm text-gray-600">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm text-gray-600">2.3 hrs</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Quality Score</span>
                  <span className="text-sm text-gray-600">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tools */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Quick Tools</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 flex items-center justify-center space-x-2 mobile-button"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search Parts</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-12 flex items-center justify-center space-x-2 mobile-button"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Order</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-12 flex items-center justify-center space-x-2 mobile-button"
          >
            <Gauge className="w-4 h-4" />
            <span className="text-sm">Diagnostics</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-12 flex items-center justify-center space-x-2 mobile-button"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm">Quick Fix</span>
          </Button>
        </div>
      </div>
    </ResponsiveScaffold>
  );
};

export default MobileMechanicDashboard;

