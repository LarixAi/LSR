// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFleetAnalytics = () => {
  return useQuery({
    queryKey: ['fleet-analytics'],
    queryFn: async () => {
      console.log('Fetching fleet analytics from database...');
      
      // Fetch vehicles data
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*');

      if (vehiclesError) throw vehiclesError;

      // Fetch active driver assignments
       const { data: activeDrivers, error: driversError } = await supabase
         .from('driver_assignments')
         .select('driver_id')
         .eq('active', true);

      if (driversError) throw driversError;

      // Fetch active routes
      const { data: routes, error: routesError } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true);

      if (routesError) throw routesError;

      // Fetch maintenance alerts (vehicle checks requiring maintenance)
      const { data: maintenanceAlerts, error: alertsError } = await supabase
        .from('vehicle_checks')
        .select('*')
        .eq('requires_maintenance', true);

      if (alertsError) throw alertsError;

      // Fetch recent incidents
      const { data: incidents, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (incidentsError) throw incidentsError;

      return {
        totalVehicles: vehicles?.length || 0,
        activeDrivers: activeDrivers?.length || 0,
        activeRoutes: routes?.length || 0,
        maintenanceAlerts: maintenanceAlerts?.length || 0,
        recentIncidents: incidents || [],
        vehicles: vehicles || [],
        routes: routes || []
      };
    }
  });
};

export const useVehicleUtilization = () => {
  return useQuery({
    queryKey: ['vehicle-utilization'],
    queryFn: async () => {
      console.log('Fetching vehicle utilization data...');
      
      const { data: assignments, error } = await supabase
        .from('driver_assignments')
        .select(`
          *,
          vehicles (
            vehicle_number,
            make,
            model
          )
        `)
        .eq('active', true);

      if (error) throw error;

      // Calculate real utilization based on actual assignments and schedules
      const utilizationData = assignments?.map(assignment => {
        // Calculate utilization based on active assignments vs total possible time
        const totalHours = 24 * 7; // 168 hours per week
        const assignedHours = assignment.hours_per_week || 40; // Default to 40 hours if not specified
        const utilization = Math.round((assignedHours / totalHours) * 100);
        
        return {
          vehicle: assignment.vehicles?.vehicle_number || 'Unknown',
          utilization: Math.min(utilization, 100), // Cap at 100%
          status: assignment.active ? 'active' : 'inactive'
        };
      }) || [];

      return utilizationData;
    }
  });
};

export const useMaintenanceTrends = () => {
  return useQuery({
    queryKey: ['maintenance-trends'],
    queryFn: async () => {
      console.log('Fetching maintenance trends...');
      
      const { data: checks, error } = await supabase
        .from('vehicle_checks')
        .select('*')
        .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by month for trend analysis
      const monthlyData = checks?.reduce((acc, check) => {
        const month = new Date(check.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { total: 0, maintenance: 0 };
        }
        acc[month].total++;
        if (check.requires_maintenance) {
          acc[month].maintenance++;
        }
        return acc;
      }, {} as Record<string, { total: number; maintenance: number }>) || {};

      const trendData = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        total: data.total,
        maintenance: data.maintenance,
        percentage: Math.round((data.maintenance / data.total) * 100)
      }));

      return trendData;
    }
  });
};
