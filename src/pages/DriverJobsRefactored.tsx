import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, MapPin, Clock, DollarSign, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';

export default function DriverJobs() {
  const { user, profile } = useAuth();
  const [selectedTab, setSelectedTab] = useState("active");

  // Fetch driver invoices (jobs) for the current driver
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['driver-own-jobs', user?.id, selectedTab],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('driver_invoices')
        .select('*')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedTab === "active") {
        query = query.in('status', ['draft', 'pending']);
      } else if (selectedTab === "completed") {
        query = query.eq('status', 'paid');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch driver assignments (route assignments)
  const { data: assignments = [] } = useQuery({
    queryKey: ['driver-route-assignments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: assignmentData, error } = await supabase
        .from('driver_assignments')
        .select('*')
        .eq('driver_id', user.id)
        .eq('status', 'active')
        .order('assigned_date', { ascending: false })
        .limit(10);

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

  // Calculate statistics
  const stats = {
    totalJobs: jobs.length,
    totalEarnings: jobs.reduce((sum, job) => sum + (job.total_amount || 0), 0),
    activeAssignments: assignments.length,
    pendingPayments: jobs.filter(job => job.status === 'pending').length
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      pending: { label: 'Pending Payment', variant: 'default' as const },
      paid: { label: 'Paid', variant: 'outline' as const },
      active: { label: 'Active', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'outline' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const },
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
          <p className="text-lg">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  const navigationTabs = [
    { value: 'active', label: 'Active Jobs' },
    { value: 'completed', label: 'Completed' },
    { value: 'assignments', label: 'Route Assignments' },
    { value: 'all', label: 'All Jobs' }
  ];

  return (
    <StandardPageLayout
      title="My Jobs"
      description="View your job assignments, invoices, and earnings"
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={selectedTab}
      onTabChange={setSelectedTab}
    >
      <div className="space-y-6">

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">£{stats.totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Routes</p>
                <p className="text-2xl font-bold">{stats.activeAssignments}</p>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsContent value={selectedTab} className="space-y-4">
          {selectedTab === "assignments" ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Route Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No active assignments</h3>
                    <p className="text-muted-foreground">
                      Contact dispatch to get assigned to routes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <MapPin className="w-4 h-4 text-primary" />
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
                            Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}
                          </div>
                          {assignment.routes?.estimated_time && (
                            <div className="text-sm text-muted-foreground">
                              Est. {assignment.routes.estimated_time} min
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedTab === "active" ? "Active Jobs & Invoices" : 
                   selectedTab === "completed" ? "Completed Jobs" : "All Jobs"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No {selectedTab === "active" ? "active" : selectedTab} jobs found
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedTab === "active" 
                        ? "New jobs will appear here when assigned."
                        : "Completed jobs will show up here once processed."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Briefcase className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Job #{job.invoice_number}</span>
                              {getStatusBadge(job.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Created: {new Date(job.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                Due: {new Date(job.due_date).toLocaleDateString()}
                              </span>
                            </div>
                            {job.notes && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {job.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">£{job.total_amount?.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </StandardPageLayout>
  );
}