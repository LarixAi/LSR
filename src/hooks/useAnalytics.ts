import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAnalyticsData = () => {
  const { profile } = useAuth();

  // Fetch vehicles for vehicle-related metrics
  const { data: vehicles = [] } = useQuery({
    queryKey: ['analytics-vehicles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('organization_id', profile.organization_id);
      
      if (error) {
        console.error('Error fetching vehicles for analytics:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch drivers for driver-related metrics
  const { data: drivers = [] } = useQuery({
    queryKey: ['analytics-drivers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .eq('organization_id', profile.organization_id);
      
      if (error) {
        console.error('Error fetching drivers for analytics:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch jobs for trip/revenue metrics
  const { data: jobs = [] } = useQuery({
    queryKey: ['analytics-jobs', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('jobs' as any)
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(1000); // Get recent jobs for analytics
      
      if (error) {
        console.error('Error fetching jobs for analytics:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch routes for route metrics
  const { data: routes = [] } = useQuery({
    queryKey: ['analytics-routes', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('organization_id', profile.organization_id);
      
      if (error) {
        console.error('Error fetching routes for analytics:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Calculate real metrics from database data
  const calculateMetrics = () => {
    // Revenue calculation - only use real revenue data if available
    const completedJobs = (jobs as any[]).filter(job => (job as any).status === 'completed');
    const realRevenue = completedJobs.reduce((sum, job) => sum + ((job as any).total_amount || 0), 0);
    
    // Trip/Job metrics
    const totalTrips = jobs.length;
    const recentTrips = (jobs as any[]).filter(job => {
      const jobDate = new Date((job as any).created_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return jobDate >= monthAgo;
    }).length;

    // Fleet efficiency (based on vehicle utilization)
    const activeVehicles = vehicles.filter(v => (v as any).status === 'active' || (v as any).is_active).length;
    const totalVehicles = vehicles.length;
    const fleetEfficiency = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

    // Active drivers
    const activeDrivers = drivers.filter(d => (d as any).is_active).length;

    // Fuel costs - only use real fuel purchase data if available
    const realFuelCosts = 0; // Will be calculated from fuel_purchases table if needed
    
    // Maintenance costs - only use real maintenance data if available
    const realMaintenanceCosts = 0; // Will be calculated from maintenance records if needed
    
    // Compliance score (based on active vs total drivers and vehicles)
    const driverCompliance = drivers.length > 0 ? (activeDrivers / drivers.length) * 100 : 0;
    const vehicleCompliance = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;
    const complianceScore = (driverCompliance + vehicleCompliance) / 2;

    return {
      revenue: {
        value: `£${realRevenue.toLocaleString()}`,
        change: 0, // No change calculation without historical data
        changeType: 'neutral' as const
      },
      trips: {
        value: totalTrips.toString(),
        change: 0, // No change calculation without historical data
        changeType: 'neutral' as const
      },
      efficiency: {
        value: `${fleetEfficiency.toFixed(1)}%`,
        change: 0, // No change calculation without historical data
        changeType: 'neutral' as const
      },
      drivers: {
        value: activeDrivers.toString(),
        change: 0, // No change calculation without historical data
        changeType: 'neutral' as const
      },
      routes: {
        value: routes.length.toString(),
        change: 0, // No change calculation without historical data
        changeType: 'neutral' as const
      },
      vehicles: {
        value: totalVehicles.toString(),
        change: 0, // No change calculation without historical data
        changeType: 'neutral' as const
      },
      fuel: {
        value: `£${realFuelCosts.toLocaleString()}`,
        change: 0, // No change calculation without historical data
        changeType: 'neutral' as const
      },
      maintenance: {
        value: `£${realMaintenanceCosts.toLocaleString()}`,
        change: 0, // No change calculation without historical data
        changeType: 'neutral' as const
      },
      compliance: {
        value: `${complianceScore.toFixed(1)}%`,
        change: 0, // No change calculation without historical data
        changeType: 'neutral' as const
      }
    };
  };

  const metrics = calculateMetrics();

  // Revenue trend data - empty when no real data exists
  const revenueData = [
    { name: 'This Month', value: parseInt(metrics.revenue.value.replace(/[£,]/g, '')), trend: 'neutral' as const },
    { name: 'Last Month', value: 0, trend: 'neutral' as const },
    { name: '2 Months Ago', value: 0, trend: 'neutral' as const },
    { name: '3 Months Ago', value: 0, trend: 'neutral' as const },
  ];

  // Service distribution based on actual data only
  const serviceData = [
    { name: 'School Runs', value: (jobs as any[]).filter(j => (j as any).job_type === 'school_run').length, color: 'bg-blue-500' },
    { name: 'Regular Routes', value: routes.filter(r => (r as any).status === 'active').length, color: 'bg-green-500' },
    { name: 'Special Events', value: (jobs as any[]).filter(j => (j as any).job_type === 'special_event').length, color: 'bg-purple-500' },
    { name: 'Maintenance', value: vehicles.filter(v => (v as any).status === 'maintenance').length, color: 'bg-orange-500' },
  ];

  // Performance metrics calculations - using real data only
  const calculatePerformanceMetrics = () => {
    const activeDrivers = drivers.filter(d => (d as any).is_active).length;
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => (v as any).status === 'active' || (v as any).is_active).length;
    const maintenanceVehicles = vehicles.filter(v => (v as any).status === 'maintenance').length;
    const completedJobs = (jobs as any[]).filter(j => (j as any).status === 'completed').length;
    
    // Real performance calculations based on actual data
    const averageUtilization = totalVehicles > 0 ? (activeVehicles / totalVehicles * 100) : 0;
    const downtime = totalVehicles > 0 ? (maintenanceVehicles / totalVehicles * 100) : 0;
    const availability = totalVehicles > 0 ? ((totalVehicles - maintenanceVehicles) / totalVehicles * 100) : 100;
    
    // Default values when no real data exists
    const defaultRating = '0.0/5';
    const defaultPercentage = '0.0%';
    
    return {
      driverPerformance: {
        averageRating: defaultRating, // Will be calculated from real ratings when available
        punctuality: defaultPercentage, // Will be calculated from real data when available
        safetyScore: defaultPercentage, // Will be calculated from real data when available
        fuelEfficiency: defaultPercentage // Will be calculated from real data when available
      },
      vehicleUtilization: {
        averageUtilization: `${averageUtilization.toFixed(1)}%`,
        downtime: `${downtime.toFixed(1)}%`,
        maintenanceSchedule: defaultPercentage, // Will be calculated from real data when available
        availability: `${availability.toFixed(1)}%`
      },
      customerSatisfaction: {
        overallRating: defaultRating, // Will be calculated from real ratings when available
        onTimePerformance: defaultPercentage, // Will be calculated from real data when available
        complaintResolution: defaultPercentage, // Will be calculated from real data when available
        repeatCustomers: defaultPercentage // Will be calculated from real data when available
      },
      quickStats: {
        activeDrivers: activeDrivers,
        fleetVehicles: totalVehicles,
        onTimeRate: defaultPercentage, // Will be calculated from real data when available
        targetAchievement: `${Math.min((completedJobs / Math.max(jobs.length, 1)) * 100, 100).toFixed(1)}%`
      }
    };
  };

  const performanceMetrics = calculatePerformanceMetrics();

  return {
    metrics,
    revenueData,
    serviceData,
    performanceMetrics,
    rawData: {
      vehicles,
      drivers, 
      jobs,
      routes
    },
    isLoading: false, // All queries handle their own loading states
  };
};

export default useAnalyticsData;