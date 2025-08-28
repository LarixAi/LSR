import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Truck, User, Route, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function DriverSchedule() {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch driver assignments for the current driver
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['driver-assignments', user?.id, selectedDate],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: assignmentData, error } = await supabase
        .from('driver_assignments')
        .select('*')
        .eq('driver_id', user.id)
        .eq('assigned_date', selectedDate)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!assignmentData?.length) return [];

      // Get routes and vehicles separately
      const routeIds = [...new Set(assignmentData.map(a => a.route_id).filter(Boolean))];
      const vehicleIds = [...new Set(assignmentData.map(a => a.vehicle_id).filter(Boolean))];
      
      const [routesData, vehiclesData] = await Promise.all([
        routeIds.length > 0 ? supabase
          .from('routes')
          .select('id, name, start_location, end_location, estimated_time, distance')
          .in('id', routeIds) : Promise.resolve({ data: [] }),
        vehicleIds.length > 0 ? supabase
          .from('vehicles')
          .select('id, vehicle_number, make, model, license_plate')
          .in('id', vehicleIds) : Promise.resolve({ data: [] })
      ]);

      const routeMap = new Map(routesData.data?.map(r => [r.id, r] as const) || []);
      const vehicleMap = new Map(vehiclesData.data?.map(v => [v.id, v] as const) || []);

      return assignmentData.map(assignment => ({
        ...assignment,
        routes: routeMap.get(assignment.route_id),
        vehicles: vehicleMap.get(assignment.vehicle_id)
      }));
    },
    enabled: !!user?.id
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['driver-time-entries', user?.id, selectedDate],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('id, driver_id, clock_in_time, clock_out_time, total_hours')
        .eq('driver_id', user.id)
        .order('clock_in_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Calculate today's statistics
  const todayStats = {
    totalHours: timeEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0),
    routes: assignments.length,
    completedRoutes: assignments.filter(a => a.status === 'completed').length,
    onTimePercentage: assignments.length > 0 
      ? Math.round((assignments.filter(a => a.status === 'completed').length / assignments.length) * 100)
      : 0
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Active', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'outline' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const },
      pending: { label: 'Pending', variant: 'secondary' as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const 
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground">
            View your daily assignments and track your progress
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hours Worked</p>
                <p className="text-2xl font-bold">{todayStats.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned Routes</p>
                <p className="text-2xl font-bold">{todayStats.routes}</p>
              </div>
              <Route className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{todayStats.completedRoutes}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Time Rate</p>
                <p className="text-2xl font-bold">{todayStats.onTimePercentage}%</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList>
          <TabsTrigger value="assignments">Today's Assignments</TabsTrigger>
          <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <Route className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No assignments for {selectedDate}</h3>
                  <p className="text-muted-foreground">
                    Check back later or contact dispatch for your schedule.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Route className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {assignment.routes?.name || `Route #${assignment.route_id}`}
                            </span>
                            {getStatusBadge(assignment.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {assignment.vehicles?.vehicle_number} - {assignment.vehicles?.make} {assignment.vehicles?.model}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {assignment.routes?.start_location} → {assignment.routes?.end_location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {assignment.routes?.estimated_time && (
                            <div>Est. {assignment.routes.estimated_time} min</div>
                          )}
                          {assignment.routes?.distance && (
                            <div>{assignment.routes.distance} km</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {timeEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No time entries for {selectedDate}</h3>
                  <p className="text-muted-foreground">Clock in to start tracking your time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {entry.clock_in_time ? new Date(`2000-01-01T${entry.clock_in_time}`).toLocaleTimeString() : 'Not clocked in'} - {' '}
                            {entry.clock_out_time ? new Date(`2000-01-01T${entry.clock_out_time}`).toLocaleTimeString() : 'In progress'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total: {entry.total_hours?.toFixed(2) || '0.00'} hours
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={entry.clock_out_time ? 'outline' : 'default'}>
                          {entry.clock_out_time ? 'Completed' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Schedule History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Schedule History</h3>
                <p className="text-muted-foreground">
                  Historical schedule data will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}