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

  // Clear all dashboard data mutation
  const clearAllDataMutation = useMutation({
    mutationFn: async () => {
      const results = [];
      
      try {
        // Clear vehicles - delete each one individually to avoid foreign key issues
        if (vehicles.length > 0) {
          console.log(`Deleting ${vehicles.length} vehicles...`);
          for (const vehicle of vehicles) {
            const { error } = await supabase
              .from('vehicles')
              .delete()
              .eq('id', vehicle.id);
            if (error) {
              console.error(`Error deleting vehicle ${vehicle.id}:`, error);
              results.push(`Vehicle ${vehicle.id}: ${error.message}`);
            }
          }
        }
        
        // Clear incidents - delete each one individually
        if (incidents.length > 0) {
          console.log(`Deleting ${incidents.length} incidents...`);
          for (const incident of incidents) {
            const { error } = await supabase
              .from('incidents')
              .delete()
              .eq('id', incident.id);
            if (error) {
              console.error(`Error deleting incident ${incident.id}:`, error);
              results.push(`Incident ${incident.id}: ${error.message}`);
            }
          }
        }
        
        // Clear maintenance requests - delete each one individually
        if (maintenanceRequests.length > 0) {
          console.log(`Deleting ${maintenanceRequests.length} maintenance requests...`);
          for (const request of maintenanceRequests) {
            const { error } = await supabase
              .from('maintenance_requests')
              .delete()
              .eq('id', request.id);
            if (error) {
              console.error(`Error deleting maintenance request ${request.id}:`, error);
              results.push(`Maintenance ${request.id}: ${error.message}`);
            }
          }
        }
        
        // DON'T delete driver profiles - they are user accounts
        // Just log how many drivers we found
        if (drivers.length > 0) {
          console.log(`Found ${drivers.length} drivers - keeping user profiles intact`);
        }
        
      } catch (error) {
        console.error('Unexpected error during deletion:', error);
        throw new Error(`Unexpected error: ${error.message}`);
      }
      
      if (results.length > 0) {
        console.warn('Some deletions failed:', results);
        throw new Error(`Some deletions failed: ${results.join(', ')}`);
      }
      
      console.log('✅ All dashboard data cleared successfully');
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate all queries to refetch data
      queryClient.invalidateQueries();
      toast({
        title: "Success!",
        description: "All dashboard data has been cleared.",
      });
    },
    onError: (error: any) => {
      console.error('Error clearing dashboard data:', error);
      toast({
        title: "Error",
        description: `Failed to clear all data: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleClearAllData = async () => {
    const totalRecords = vehicles.length + incidents.length + maintenanceRequests.length;
    
    if (totalRecords === 0) {
      toast({
        title: "No Data",
        description: "There is no data to clear.",
      });
      return;
    }
    
    const confirmed = confirm(
      `Are you sure you want to clear dashboard data?\n\nThis will permanently delete:\n- ${vehicles.length} vehicles\n- ${incidents.length} incidents\n- ${maintenanceRequests.length} maintenance requests\n\nDriver profiles will be kept intact.\n\nThis action cannot be undone.`
    );
    
    if (confirmed) {
      clearAllDataMutation.mutate();
    }
  };

  // Add sample data mutation
  const addSampleDataMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID found');
      }

      const results = [];
      
      try {
        // Add sample vehicles
        const sampleVehicles = [
          {
            organization_id: profile.organization_id,
            vehicle_number: 'BUS001',
            license_plate: 'LDN 001A',
            make: 'Mercedes',
            model: 'Citaro',
            year: 2022,
            vehicle_type: 'Bus',
            status: 'active'
          },
          {
            organization_id: profile.organization_id,
            vehicle_number: 'BUS002',
            license_plate: 'LDN 002B',
            make: 'Volvo',
            model: 'B8RLE',
            year: 2021,
            vehicle_type: 'Bus',
            status: 'active'
          },
          {
            organization_id: profile.organization_id,
            vehicle_number: 'VAN001',
            license_plate: 'LDN 101V',
            make: 'Ford',
            model: 'Transit',
            year: 2022,
            vehicle_type: 'Van',
            status: 'active'
          }
        ];

        for (const vehicle of sampleVehicles) {
          const { error } = await supabase
            .from('vehicles')
            .insert(vehicle);
          if (error) {
            console.error(`Error adding vehicle ${vehicle.vehicle_number}:`, error);
            results.push(`Vehicle ${vehicle.vehicle_number}: ${error.message}`);
          }
        }

        // Add sample incidents
        const sampleIncidents = [
          {
            organization_id: profile.organization_id,
            title: 'Minor Traffic Incident',
            description: 'Vehicle BUS001 experienced a minor bump in the depot parking area. No injuries reported.',
            incident_type: 'accident',
            severity: 'low',
            status: 'open',
            reported_by: profile.id,
            incident_date: new Date().toISOString().split('T')[0]
          }
        ];

        for (const incident of sampleIncidents) {
          const { error } = await supabase
            .from('incidents')
            .insert(incident);
          if (error) {
            console.error(`Error adding incident:`, error);
            results.push(`Incident: ${error.message}`);
          }
        }

        // Add sample maintenance requests
        const sampleMaintenance = [
          {
            organization_id: profile.organization_id,
            description: 'Routine brake inspection required',
            status: 'pending',
            user_id: profile.id
          },
          {
            organization_id: profile.organization_id,
            description: 'Air conditioning system making unusual noises',
            status: 'pending',
            user_id: profile.id
          }
        ];

        for (const maintenance of sampleMaintenance) {
          const { error } = await supabase
            .from('maintenance_requests')
            .insert(maintenance);
          if (error) {
            console.error(`Error adding maintenance request:`, error);
            results.push(`Maintenance: ${error.message}`);
          }
        }
        
      } catch (error) {
        console.error('Unexpected error during sample data creation:', error);
        throw new Error(`Unexpected error: ${error.message}`);
      }
      
      if (results.length > 0) {
        console.warn('Some sample data creation failed:', results);
        throw new Error(`Some operations failed: ${results.join(', ')}`);
      }
      
      console.log('✅ Sample data added successfully');
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate all queries to refetch data
      queryClient.invalidateQueries();
      toast({
        title: "Success!",
        description: "Sample data has been added to your dashboard.",
      });
    },
    onError: (error: any) => {
      console.error('Error adding sample data:', error);
      toast({
        title: "Error",
        description: `Failed to add sample data: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleAddSampleData = async () => {
    const confirmed = confirm(
      `Add sample data to your dashboard?\n\nThis will add:\n- 3 sample vehicles\n- 1 sample incident\n- 2 sample maintenance requests\n\nThis will help you see how the dashboard works with real data.`
    );
    
    if (confirmed) {
      addSampleDataMutation.mutate();
    }
  };

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
          {(vehicles.length === 0 && incidents.length === 0 && maintenanceRequests.length === 0) && (
            <Button 
              onClick={handleAddSampleData} 
              variant="outline" 
              className="inline-flex items-center"
              disabled={addSampleDataMutation.isPending}
              size={isMobile ? "sm" : "default"}
            >
              <Database className={`${isMobile ? 'mr-1' : 'mr-2'} h-4 w-4`} />
              {addSampleDataMutation.isPending ? 'Adding...' : (isMobile ? 'Add Sample' : 'Add Sample Data')}
            </Button>
          )}
          {(vehicles.length > 0 || incidents.length > 0 || maintenanceRequests.length > 0) && (
            <Button 
              onClick={handleClearAllData} 
              variant="destructive" 
              className="inline-flex items-center"
              disabled={clearAllDataMutation.isPending}
              size={isMobile ? "sm" : "default"}
            >
              <Database className={`${isMobile ? 'mr-1' : 'mr-2'} h-4 w-4`} />
              {clearAllDataMutation.isPending ? 'Clearing...' : (isMobile ? 'Clear Data' : 'Clear All Data')}
            </Button>
          )}
        </div>
      </div>

      {/* Admin Management Cards */}
      {profile?.role === 'admin' && (
        <div className="space-y-4">
          {/* Training Management */}
          <Card className="border-purple-200 bg-purple-50">
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
                  className={`border-purple-300 text-purple-700 hover:bg-purple-100 ${isMobile ? 'w-full' : ''}`}
                >
                  <Award className={`${isMobile ? 'mr-1' : 'mr-2'} h-4 w-4`} />
                  {isMobile ? 'Manage' : 'Manage Training'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mechanic Request Management */}
          <Card className="border-blue-200 bg-blue-50">
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
                  className={`border-blue-300 text-blue-700 hover:bg-blue-100 ${isMobile ? 'w-full' : ''}`}
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
        <Card>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeVehicles} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{activeDrivers}</div>
            <p className="text-xs text-muted-foreground">
              of {drivers.length} total drivers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Pending Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{pendingMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              requests awaiting attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Recent Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{recentIncidents}</div>
            <p className="text-xs text-muted-foreground">
              in the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className={`grid ${isMobile ? 'gap-4' : 'gap-6 md:grid-cols-2 lg:grid-cols-7'}`}>
        {/* Recent Activity */}
        <Card className={isMobile ? '' : 'col-span-4'}>
          <CardHeader className={isMobile ? 'pb-3' : ''}>
            <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
              <Activity className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="incidents" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
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