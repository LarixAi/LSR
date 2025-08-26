import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, 
  Users, 
  Route, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Calendar,
  MapPin,
  Wrench,
  FileText,
  TrendingUp,
  Database,
  Trash2,
  UserCheck,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TrialBanner, TrialExpiredBanner, DriverLimitBanner } from "@/components/subscription/TrialBanner";
import { Navigate } from "react-router-dom";
import { useIsMobile } from '@/hooks/use-mobile';
// import { TrialTestComponent } from "@/components/subscription/TrialTestComponent"; // Removed - no longer needed

export default function Dashboard() {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Redirect drivers to their specific dashboard
  if (profile?.role === 'driver') {
    return <Navigate to="/driver-dashboard" replace />;
  }

  // Redirect mechanics to their specific dashboard
  if (profile?.role === 'mechanic') {
    return <Navigate to="/mechanic-dashboard" replace />;
  }

  // Fetch real data from database
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .limit(100);
      
      if (error) {
        console.error('Error fetching vehicles:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .eq('organization_id', profile.organization_id)
        .limit(100);
      
      if (error) {
        console.error('Error fetching drivers:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['recent-incidents', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching incidents:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id
  });



  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['maintenance-requests', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching maintenance requests:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Clear All Data functionality removed



  // Calculate stats
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const activeDrivers = drivers.filter(d => d.is_active).length;
  const pendingMaintenance = maintenanceRequests.filter(r => r.status === 'pending').length;
  const recentIncidents = incidents.length;

  const quickActions = [
    { label: "Add Vehicle", icon: Truck, href: "/vehicles" },
    { label: "Add Driver", icon: Users, href: "/drivers" },
    { label: "Create Route", icon: Route, href: "/routes" },
    { label: "View Reports", icon: FileText, href: "/analytics" },
  ];

  return (
    <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      {/* Trial Status Banners */}
      <TrialBanner />
      <TrialExpiredBanner />
      <DriverLimitBanner />
      
      {/* Trial Test Component - Remove after testing */}
              {/* TrialTestComponent removed - no longer needed */}
      
      {/* Welcome Header */}
      <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>Dashboard</h1>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            Welcome back, {profile?.first_name || 'User'}! Here's your fleet overview.
          </p>
        </div>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'}`}>
          {/* Clear All Data button removed */}
        </div>
      </div>

      {/* Admin Management Cards */}
      {profile?.role === 'admin' && (
        <div className="space-y-4">
          {/* Training Management */}
          <Card className="border-purple-200 bg-purple-50 action-card">
            <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
              <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
                <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                  <Award className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-600`} />
                  <div>
                    <h3 className={`font-medium text-purple-900 ${isMobile ? 'text-sm' : ''}`}>Driver Training Management</h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-purple-700`}>
                      Assign training modules to drivers and track their completion progress.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/admin/training-management'}
                  className={`border-purple-300 text-purple-700 hover:bg-purple-100 admin-button-secondary ${isMobile ? 'w-full' : ''}`}
                >
                  <Award className={`${isMobile ? 'mr-1' : 'mr-2'} h-4 w-4`} />
                  {isMobile ? 'Manage' : 'Manage Training'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mechanic Request Management */}
          <Card className="border-blue-200 bg-blue-50 action-card">
            <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
              <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
                <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                  <UserCheck className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
                  <div>
                    <h3 className={`font-medium text-blue-900 ${isMobile ? 'text-sm' : ''}`}>Mechanic Request Management</h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-700`}>
                      Manage mechanic requests and working relationships for your organization.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/admin/mechanic-requests'}
                  className={`border-blue-300 text-blue-700 hover:bg-blue-100 admin-button-secondary ${isMobile ? 'w-full' : ''}`}
                >
                  <UserCheck className={`${isMobile ? 'mr-1' : 'mr-2'} h-4 w-4`} />
                  {isMobile ? 'Manage' : 'Manage Requests'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Metrics */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'gap-4 md:grid-cols-2 lg:grid-cols-4'}`}>
        <Card className="stats-card">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium stats-label`}>Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold stats-number`}>{vehicles.length}</div>
            <p className="text-xs text-muted-foreground stats-label">
              {activeVehicles} active
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium stats-label`}>Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold stats-number`}>{activeDrivers}</div>
            <p className="text-xs text-muted-foreground stats-label">
              of {drivers.length} total drivers
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium stats-label`}>Pending Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold stats-number`}>{pendingMaintenance}</div>
            <p className="text-xs text-muted-foreground stats-label">
              requests awaiting attention
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium stats-label`}>Recent Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold stats-number`}>{recentIncidents}</div>
            <p className="text-xs text-muted-foreground stats-label">
              in the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className={`grid ${isMobile ? 'gap-4' : 'gap-6 md:grid-cols-2 lg:grid-cols-7'}`}>
        {/* Recent Activity */}
        <Card className={`${isMobile ? '' : 'col-span-4'} dashboard-card`}>
          <CardHeader className={isMobile ? 'pb-3' : ''}>
            <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
              <Activity className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="incidents" className="w-full">
              <TabsList className="grid w-full grid-cols-2 tabs-list">
                <TabsTrigger value="incidents" className="tabs-trigger">Recent Incidents</TabsTrigger>
                <TabsTrigger value="maintenance" className="tabs-trigger">Maintenance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="incidents" className="space-y-4">
                {incidents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No recent incidents - Great job!</p>
                  </div>
                ) : (
                  incidents.slice(0, 5).map((incident, index) => (
                    <div key={incident.id || index} className="flex items-center space-x-4 rounded-lg border p-3">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{incident.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {incident.description?.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(incident.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          incident.severity === 'high' ? 'destructive' : 
                          incident.severity === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {incident.severity}
                      </Badge>
                    </div>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="maintenance" className="space-y-4">
                {maintenanceRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No pending maintenance requests</p>
                  </div>
                ) : (
                  maintenanceRequests.slice(0, 5).map((request, index) => (
                    <div key={request.id || index} className="flex items-center space-x-4 rounded-lg border p-3">
                      <div className="flex-shrink-0">
                        <Wrench className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Maintenance Request
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.description?.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          request.status === 'pending' ? 'default' : 
                          request.status === 'in_progress' ? 'secondary' : 'outline'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = action.href}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
            </div>

            {/* Fleet Status Summary */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Fleet Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vehicles Active</span>
                  <Badge variant="secondary">{activeVehicles}/{vehicles.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Drivers Available</span>
                  <Badge variant="secondary">{activeDrivers}/{drivers.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Maintenance Due</span>
                  <Badge variant={pendingMaintenance > 0 ? "destructive" : "secondary"}>
                    {pendingMaintenance}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Today's Summary</span>
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Active Routes</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Jobs</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span>New Incidents</span>
                  <span className="font-medium">{recentIncidents}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}