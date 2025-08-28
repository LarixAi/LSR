import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Truck, Clock, DollarSign, User, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function JobsManagement() {
  const { profile } = useAuth();
  const [selectedTab, setSelectedTab] = useState("active");

  // Fetch driver invoices as "jobs"
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['driver-jobs', profile?.organization_id, selectedTab],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      let query = supabase
        .from('driver_invoices')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (selectedTab === "active") {
        query = query.in('status', ['draft', 'pending']);
      } else if (selectedTab === "completed") {
        query = query.eq('status', 'paid');
      }

      const { data: invoices, error } = await query;
      if (error) throw error;
      
      if (!invoices?.length) return [];

      // Get driver details separately
      const driverIds = [...new Set(invoices.map(inv => inv.driver_id))];
      const { data: drivers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone')
        .in('id', driverIds);

      const driverMap = new Map(drivers?.map(d => [d.id, d]) || []);

      return invoices.map(invoice => ({
        ...invoice,
        profiles: driverMap.get(invoice.driver_id)
      }));
    },
    enabled: !!profile?.organization_id
  });

  // Calculate statistics
  const stats = {
    totalJobs: jobs.length,
    totalValue: jobs.reduce((sum, job) => sum + (job.total_amount || 0), 0),
    activeJobs: jobs.filter(job => ['draft', 'pending'].includes(job.status)).length,
    completedJobs: jobs.filter(job => job.status === 'paid').length
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      pending: { label: 'Active', variant: 'default' as const },
      paid: { label: 'Completed', variant: 'outline' as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs Management</h1>
          <p className="text-muted-foreground">
            Manage driver jobs, schedules, and invoicing
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedJobs}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">£{stats.totalValue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Driver Jobs & Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">
                    Create your first job to get started with job management.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Truck className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Job #{job.invoice_number}</span>
                            {getStatusBadge(job.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {job.profiles?.first_name} {job.profiles?.last_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(job.created_at).toLocaleDateString()}
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
                        <div className="text-sm text-muted-foreground">
                          Due: {new Date(job.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}