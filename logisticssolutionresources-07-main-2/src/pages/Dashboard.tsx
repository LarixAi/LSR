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
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { profile } = useAuth();

  // Fetch real data from database
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .limit(100);
      
      if (error) {
        console.error('Error fetching vehicles:', error);
        return [];
      }
      return data || [];
    }
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .limit(100);
      
      if (error) {
        console.error('Error fetching drivers:', error);
        return [];
      }
      return data || [];
    }
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['recent-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching incidents:', error);
        return [];
      }
      return data || [];
    }
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching maintenance requests:', error);
        return [];
      }
      return data || [];
    }
  });

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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 safe-area-inset">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back, {profile?.first_name || 'User'}!
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-primary/10 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-medium">{activeVehicles}</span> active
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDrivers}</div>
            <p className="text-xs text-muted-foreground">
              of {drivers.length} total drivers
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Maintenance</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              requests awaiting attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Incidents</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentIncidents}</div>
            <p className="text-xs text-muted-foreground">
              in the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-4 border-primary/10 hover:border-primary/20 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="incidents" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="incidents">Recent Incidents</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
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
        <Card className="lg:col-span-3 border-primary/10 hover:border-primary/20 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
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
                    className="w-full justify-start hover:bg-primary/5 hover:border-primary/30 transition-all group"
                    onClick={() => window.location.href = action.href}
                  >
                    <Icon className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
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