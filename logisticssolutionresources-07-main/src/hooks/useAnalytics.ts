
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalDrivers: number;
  activeDrivers: number;
  totalVehicles: number;
  activeVehicles: number;
  totalIncidents: number;
  openIncidents: number;
  totalRoutes: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('Fetching dashboard statistics');

      // Try aggregated edge function first for speed
      try {
        const { data, error } = await supabase.functions.invoke('admin-overview', { body: {} });
        if (!error && data) {
          return data as DashboardStats;
        }
      } catch (e) {
        // Fallback to direct queries below
      }

      // Use lightweight count queries and handle optional tables gracefully
      // Jobs: total and active
      const [jobsTotalRes, jobsActiveRes] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).in('status', ['active', 'in_progress'])
      ]);

      const totalJobs = jobsTotalRes.count || 0;
      const activeJobs = jobsActiveRes.count || 0;

      // Drivers: total and active (role = driver)
      const [driversTotalRes, driversActiveRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'driver'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'driver')
          .eq('is_active', true)
      ]);

      const totalDrivers = driversTotalRes.count || 0;
      const activeDrivers = driversActiveRes.count || 0;

      // Incidents: total and open
      const [incidentsTotalRes, incidentsOpenRes] = await Promise.all([
        supabase.from('incidents').select('id', { count: 'exact', head: true }),
        supabase.from('incidents').select('id', { count: 'exact', head: true }).eq('status', 'open')
      ]);

      const totalIncidents = incidentsTotalRes.count || 0;
      const openIncidents = incidentsOpenRes.count || 0;

      // Vehicles: Optional (table may not exist)
      let totalVehicles = 0;
      let activeVehicles = 0;
      try {
        const [vehiclesTotalRes, vehiclesActiveRes] = await Promise.all([
          supabase.from('vehicles').select('id', { count: 'exact', head: true }),
          supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('status', 'active')
        ]);
        if (!vehiclesTotalRes.error) totalVehicles = vehiclesTotalRes.count || 0;
        if (!vehiclesActiveRes.error) activeVehicles = vehiclesActiveRes.count || 0;
      } catch (err) {
        console.warn('Vehicles table not available, defaulting to 0');
      }

      // Routes: Optional (table may not exist)
      let totalRoutes = 0;
      try {
        const routesRes = await supabase.from('routes').select('id', { count: 'exact', head: true });
        if (!routesRes.error) totalRoutes = routesRes.count || 0;
      } catch (err) {
        console.warn('Routes table not available, defaulting to 0');
      }

      const stats: DashboardStats = {
        totalJobs,
        activeJobs,
        totalDrivers,
        activeDrivers,
        totalVehicles,
        activeVehicles,
        totalIncidents,
        openIncidents,
        totalRoutes
      };

      return stats;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useJobsAnalytics = () => {
  return useQuery({
    queryKey: ['jobs-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by status
      const statusCounts = data.reduce((acc: Record<string, number>, job: any) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Types and revenue not available in current schema
      const typeCounts = {} as Record<string, number>;
      const monthlyRevenue = 0;

      return {
        statusCounts,
        typeCounts,
        monthlyRevenue,
        totalJobs: data.length
      };
    }
  });
};