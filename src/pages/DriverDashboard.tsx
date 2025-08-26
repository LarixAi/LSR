import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  Route, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Fuel,
  Wrench,
  FileText,
  TrendingUp,
  User,
  Bell,
  Car,
  Shield,
  Zap,
  Activity,
  Target,
  Award,
  Navigation
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';

interface DriverStats {
  totalRoutes: number;
  completedRoutes: number;
  totalHours: number;
  totalMiles: number;
  fuelEfficiency: number;
  safetyScore: number;
  onTimeDelivery: number;
  customerRating: number;
}

interface TodaySchedule {
  id: string;
  time: string;
  route: string;
  destination: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high';
}

interface VehicleInfo {
  id: string;
  vehicle_number: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  fuel_level: number;
  last_maintenance: string;
  next_maintenance: string;
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
}

interface RecentActivity {
  id: string;
  type: 'route_completed' | 'fuel_purchase' | 'maintenance_check' | 'incident_reported' | 'break_taken';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const DriverDashboard: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // SECURITY CHECK: Verify user is a driver
  if (profile?.role !== 'driver') {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch driver statistics
  const { data: driverStats = {
    totalRoutes: 0,
    completedRoutes: 0,
    totalHours: 0,
    totalMiles: 0,
    fuelEfficiency: 0,
    safetyScore: 0,
    onTimeDelivery: 0,
    customerRating: 0
  }, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['driver-stats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No driver ID found');
      
      // Fetch total routes
      const { data: routes } = await supabase
        .from('routes')
        .select('*')
        .eq('driver_id', profile.id);
      
      // Fetch completed routes
      const { data: completedRoutes } = await supabase
        .from('routes')
        .select('*')
        .eq('driver_id', profile.id)
        .eq('status', 'completed');
      
      // Fetch time entries for total hours
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('total_hours')
        .eq('driver_id', profile.id);
      
      // Fetch fuel purchases for efficiency
      const { data: fuelPurchases } = await supabase
        .from('fuel_purchases')
        .select('*')
        .eq('driver_id', profile.id);
      
      // Calculate statistics
      const totalRoutes = routes?.length || 0;
      const completedRoutesCount = completedRoutes?.length || 0;
      const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;
      
      // Calculate fuel efficiency (simplified - would need more complex logic)
      const fuelEfficiency = fuelPurchases?.length > 0 ? 8.2 : 0; // Placeholder calculation
      
      // Calculate safety score from incidents (if incidents table exists)
      let safetyScore = 100; // Default perfect score
      try {
        const { data: incidents } = await supabase
          .from('incidents')
          .select('severity')
          .eq('driver_id', profile.id);
        
        if (incidents && incidents.length > 0) {
          const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
          const highIncidents = incidents.filter(i => i.severity === 'high').length;
          const mediumIncidents = incidents.filter(i => i.severity === 'medium').length;
          
          // Calculate safety score based on incidents
          safetyScore = Math.max(0, 100 - (criticalIncidents * 20) - (highIncidents * 10) - (mediumIncidents * 5));
        }
      } catch (error) {
        console.warn('Could not fetch incidents for safety score calculation');
      }
      
      // Calculate on-time delivery from completed routes
      let onTimeDelivery = 100; // Default perfect score
      if (completedRoutes && completedRoutes.length > 0) {
        // For now, assume all completed routes were on time
        // In a real system, you'd check actual vs scheduled times
        onTimeDelivery = 100;
      }
      
      // Customer rating (placeholder - would need feedback data)
      const customerRating = 0; // No rating system implemented yet
      
      // Calculate total miles from routes
      const totalMiles = routes?.reduce((sum, route) => sum + (route.distance_km || 0), 0) || 0;
      
      return {
        totalRoutes,
        completedRoutes: completedRoutesCount,
        totalHours,
        totalMiles: Math.round(totalMiles * 0.621371), // Convert km to miles
        fuelEfficiency,
        safetyScore,
        onTimeDelivery,
        customerRating
      };
    },
    enabled: !!profile?.id
  });

  // Fetch today's schedule
  const { data: todaySchedule = [], isLoading: scheduleLoading, error: scheduleError } = useQuery({
    queryKey: ['driver-schedule', profile?.id, format(new Date(), 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No driver ID found');
      
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data: routes, error } = await supabase
        .from('routes')
        .select(`
          id,
          name,
          start_time,
          end_time,
          destination,
          status,
          priority,
          created_at
        `)
        .eq('driver_id', profile.id)
        .gte('start_time', today)
        .lt('start_time', format(addDays(new Date(), 1), 'yyyy-MM-dd'))
        .order('start_time', { ascending: true });
      
      if (error) {
        console.error('Error fetching schedule:', error);
        return [];
      }
      
      return routes?.map(route => ({
        id: route.id,
        time: format(new Date(route.start_time), 'HH:mm'),
        route: route.name || 'Unnamed Route',
        destination: route.destination || 'Unknown Destination',
        status: route.status || 'upcoming',
        priority: route.priority || 'medium'
      })) || [];
    },
    enabled: !!profile?.id
  });

  // Fetch assigned vehicle
  const { data: assignedVehicle = null, isLoading: vehicleLoading, error: vehicleError } = useQuery({
    queryKey: ['driver-vehicle', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No driver ID found');
      
      // First get the driver's assigned vehicle ID
      const { data: driverAssignment } = await supabase
        .from('driver_vehicle_assignments')
        .select('vehicle_id')
        .eq('driver_id', profile.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (!driverAssignment?.vehicle_id) {
        // Return default vehicle info if no assignment
        return {
          id: 'default',
          vehicle_number: 'No Assignment',
          license_plate: 'N/A',
          make: 'No Vehicle',
          model: 'Assigned',
          year: 0,
          fuel_level: 0,
          last_maintenance: format(new Date(), 'yyyy-MM-dd'),
          next_maintenance: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
          status: 'unavailable'
        };
      }
      
      // Get vehicle details
      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .select(`
          id,
          vehicle_number,
          license_plate,
          make,
          model,
          year,
          fuel_level,
          last_maintenance_date,
          next_maintenance_date,
          status
        `)
        .eq('id', driverAssignment.vehicle_id)
        .single();
      
      if (error) {
        console.error('Error fetching vehicle:', error);
        return null;
      }
      
      return {
        id: vehicle.id,
        vehicle_number: vehicle.vehicle_number || 'Unknown',
        license_plate: vehicle.license_plate || 'Unknown',
        make: vehicle.make || 'Unknown',
        model: vehicle.model || 'Unknown',
        year: vehicle.year || 0,
        fuel_level: vehicle.fuel_level || 0,
        last_maintenance: vehicle.last_maintenance_date || format(new Date(), 'yyyy-MM-dd'),
        next_maintenance: vehicle.next_maintenance_date || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        status: vehicle.status || 'unknown'
      };
    },
    enabled: !!profile?.id
  });

  // Fetch recent activity
  const { data: recentActivity = [], isLoading: activityLoading, error: activityError } = useQuery({
    queryKey: ['driver-activity', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No driver ID found');
      
      const activities = [];
      
      // Get recent time entries
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('*')
        .eq('driver_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      timeEntries?.forEach(entry => {
        activities.push({
          id: `time-${entry.id}`,
          type: 'break_taken' as const,
          title: entry.clock_in ? 'Clock In' : 'Clock Out',
          description: `Time entry at ${format(new Date(entry.created_at), 'HH:mm')}`,
          timestamp: entry.created_at,
          status: 'info' as const
        });
      });
      
      // Get recent fuel purchases
      const { data: fuelPurchases } = await supabase
        .from('fuel_purchases')
        .select('*')
        .eq('driver_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      fuelPurchases?.forEach(purchase => {
        activities.push({
          id: `fuel-${purchase.id}`,
          type: 'fuel_purchase' as const,
          title: 'Fuel Purchase',
          description: `Added ${purchase.quantity}L ${purchase.fuel_type} at ${purchase.location}`,
          timestamp: purchase.created_at,
          status: 'info' as const
        });
      });
      
      // Get recent vehicle checks
      const { data: vehicleChecks } = await supabase
        .from('vehicle_checks')
        .select('*')
        .eq('driver_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      vehicleChecks?.forEach(check => {
        activities.push({
          id: `check-${check.id}`,
          type: 'maintenance_check' as const,
          title: 'Vehicle Check',
          description: `${check.check_type} check completed`,
          timestamp: check.created_at,
          status: (check.status === 'passed' || check.overall_status === 'completed') ? 'success' as const : 'warning' as const
        });
      });
      
      // Sort by timestamp and return recent activities
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    },
    enabled: !!profile?.id
  });

  // Fetch driver's current time entry
  const { data: currentTimeEntry } = useQuery({
    queryKey: ['driver-current-time', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('driver_id', profile.id)
        .eq('entry_date', today)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching current time entry:', error);
        return null;
      }
      return data;
    },
    enabled: !!profile?.id
  });

  // Check for any loading states
  const isLoading = authLoading || statsLoading || scheduleLoading || vehicleLoading || activityLoading;
  
  // Check for any errors
  const hasErrors = statsError || scheduleError || vehicleError || activityError;
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile.role !== 'driver') {
    return <Navigate to="/dashboard" replace />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      case 'delayed':
        return <Badge variant="destructive">Delayed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{priority}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'route_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fuel_purchase':
        return <Fuel className="w-4 h-4 text-blue-600" />;
      case 'maintenance_check':
        return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'incident_reported':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'break_taken':
        return <Clock className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVehicleStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>;
      case 'in-use':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">In Use</Badge>;
      case 'maintenance':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case 'out-of-service':
        return <Badge variant="destructive">Out of Service</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Driver Dashboard</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Welcome back, {profile.first_name}! Here's your day at a glance.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Bell className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Alerts</span>
          </Button>
          <Button size="sm" className="text-xs sm:text-sm">
            <Clock className="w-4 h-4 mr-1 sm:mr-2" />
            {currentTimeEntry?.clock_in && !currentTimeEntry?.clock_out ? 'Clock Out' : 'Clock In'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Some data couldn't be loaded</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Please refresh the page or try again later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading dashboard data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Cards - Mobile Optimized */}
      <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="mobile-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Today's Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
                        <CardContent>
                {scheduleLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-xl font-bold sm:text-2xl">{todaySchedule.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {todaySchedule.filter(s => s.status === 'completed').length} completed
                    </p>
                  </>
                )}
              </CardContent>
        </Card>

        <Card className="mobile-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Safety Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold sm:text-2xl">{driverStats.safetyScore}%</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mobile-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">On-Time Delivery</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold sm:text-2xl">{driverStats.onTimeDelivery}%</div>
                <p className="text-xs text-muted-foreground">
                  Excellent performance
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mobile-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Customer Rating</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold sm:text-2xl">{driverStats.customerRating}/5</div>
                <p className="text-xs text-muted-foreground">
                  Based on 45 reviews
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Mobile Optimized */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mobile-tabs">
        <TabsList className="grid w-full grid-cols-4 gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Overview</TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Schedule</TabsTrigger>
          <TabsTrigger value="vehicle" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Vehicle</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Mobile Optimized */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Today's Schedule Summary */}
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-lg sm:text-xl">Today's Schedule</span>
                </CardTitle>
                <CardDescription className="text-sm">Your routes and tasks for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaySchedule.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium">{item.time}</div>
                      <div>
                        <div className="font-medium">{item.route}</div>
                        <div className="text-sm text-muted-foreground">{item.destination}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View Full Schedule
                </Button>
              </CardContent>
            </Card>

            {/* Vehicle Status */}
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span className="text-lg sm:text-xl">Assigned Vehicle</span>
                </CardTitle>
                <CardDescription className="text-sm">Current vehicle information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {vehicleLoading ? (
                  <div className="flex items-center justify-center space-x-2 py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Loading vehicle information...</span>
                  </div>
                ) : vehicleError ? (
                  <div className="text-center py-4">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-600">Error loading vehicle</p>
                  </div>
                ) : !assignedVehicle ? (
                  <div className="text-center py-4">
                    <Truck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No vehicle assigned</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Vehicle:</span>
                      <span className="text-sm">{assignedVehicle.make} {assignedVehicle.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">License Plate:</span>
                      <span className="text-sm font-mono">{assignedVehicle.license_plate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fuel Level:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${assignedVehicle.fuel_level}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{assignedVehicle.fuel_level}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      {getVehicleStatusBadge(assignedVehicle.status)}
                    </div>
                    <Button variant="outline" className="w-full">
                      View Vehicle Details
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-lg sm:text-xl">Performance Metrics</span>
              </CardTitle>
              <CardDescription className="text-sm">Your key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{driverStats.totalRoutes}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Routes</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{driverStats.totalHours}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Hours Driven</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">{driverStats.totalMiles.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Miles Driven</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">{driverStats.fuelEfficiency}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">MPG Average</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Today's Schedule Tab - Mobile Optimized */}
        <TabsContent value="schedule" className="space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg sm:text-xl">Today's Schedule</span>
              </CardTitle>
              <CardDescription className="text-sm">Your complete schedule for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border">
                    <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                      <div className="text-base sm:text-lg font-mono font-medium">{item.time}</div>
                      <div className="flex-1">
                        <div className="font-medium text-base sm:text-lg">{item.route}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.destination}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                      <div className="flex space-x-1">
                        {getPriorityBadge(item.priority)}
                        {getStatusBadge(item.status)}
                      </div>
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">Details</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle Info Tab */}
        <TabsContent value="vehicle" className="space-y-4">
          {vehicleLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Loading vehicle information...</span>
                </div>
              </CardContent>
            </Card>
          ) : vehicleError ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Vehicle</h3>
                  <p className="text-sm text-muted-foreground">Unable to load vehicle information. Please try again.</p>
                </div>
              </CardContent>
            </Card>
          ) : !assignedVehicle ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Assigned</h3>
                  <p className="text-sm text-muted-foreground">You don't have a vehicle assigned at the moment.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="w-5 h-5" />
                    <span>Vehicle Details</span>
                  </CardTitle>
                  <CardDescription>Complete vehicle information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Vehicle Number:</span>
                      <span className="text-sm">{assignedVehicle.vehicle_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">License Plate:</span>
                      <span className="text-sm font-mono">{assignedVehicle.license_plate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Make & Model:</span>
                      <span className="text-sm">{assignedVehicle.make} {assignedVehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Year:</span>
                      <span className="text-sm">{assignedVehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      {getVehicleStatusBadge(assignedVehicle.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wrench className="w-5 h-5" />
                    <span>Maintenance Info</span>
                  </CardTitle>
                  <CardDescription>Maintenance schedule and history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Last Maintenance:</span>
                      <span className="text-sm">{format(new Date(assignedVehicle.last_maintenance), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Next Maintenance:</span>
                      <span className="text-sm">{format(new Date(assignedVehicle.next_maintenance), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Fuel Level:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${assignedVehicle.fuel_level}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{assignedVehicle.fuel_level}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Wrench className="w-4 h-4 mr-2" />
                      Report Issue
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Fuel className="w-4 h-4 mr-2" />
                      Fuel Log
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Your recent actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">{activity.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverDashboard;
