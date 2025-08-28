// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useComplianceAlerts = () => {
  return useQuery({
    queryKey: ['compliance-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    }
  });
};

export const useComplianceAuditLogs = () => {
  return useQuery({
    queryKey: ['compliance-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_audit_logs')
        .select('*')
        .order('audit_date', { ascending: false })
        .limit(10);

      if (error) return [];
      return data || [];
    }
  });
};

export const useComplianceStats = () => {
  return useQuery({
    queryKey: ['compliance-stats'],
    queryFn: async () => {
      // Get total drivers
      let totalDrivers = 0;
      try {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'driver');
        totalDrivers = count || 0;
      } catch {}

      // Get total vehicles
      let totalVehicles = 0;
      try {
        const { count } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true });
        totalVehicles = count || 0;
      } catch {}

      // Get active violations (use resolved = false instead of missing status)
      let activeViolations = 0;
      try {
        const { count } = await supabase
          .from('compliance_violations')
          .select('*', { count: 'exact', head: true })
          .eq('resolved', false);
        activeViolations = count || 0;
      } catch {}

      // Get critical alerts (table may not exist)
      let criticalAlerts = 0;
      try {
        const { count } = await supabase
          .from('compliance_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('severity', 'critical')
          .eq('status', 'active');
        criticalAlerts = count || 0;
      } catch {}

      // Get drivers with recent compliance scores (table may not exist)
      let overallScore = 0;
      try {
        const { data: complianceScores } = await supabase
          .from('driver_compliance_scores')
          .select('overall_score')
          .order('score_date', { ascending: false });
        overallScore = complianceScores?.length 
          ? Math.round(complianceScores.reduce((sum: number, score: any) => sum + score.overall_score, 0) / complianceScores.length)
          : 0;
      } catch {}

      return {
        totalDrivers,
        totalVehicles,
        activeViolations,
        criticalAlerts,
        overallScore,
        driversCompliant: Math.max(0, totalDrivers - activeViolations),
        vehiclesCompliant: Math.max(0, totalVehicles - Math.floor(criticalAlerts / 2))
      };
    }
  });
};

export const useUpcomingDeadlines = () => {
  return useQuery({
    queryKey: ['upcoming-deadlines'],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Get driver license expirations
      const { data: licenseDeadlines } = await supabase
        .from('driver_licenses')
        .select(`
          expiry_date,
          profiles!driver_id (
            first_name,
            last_name
          )
        `)
        .gte('expiry_date', today.toISOString().split('T')[0])
        .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .order('expiry_date', { ascending: true });

      // Get compliance alerts with due dates (table may not exist)
      let alertDeadlines: any[] = [];
      try {
        const { data } = await supabase
          .from('compliance_alerts')
          .select('*')
          .not('due_date', 'is', null)
          .gte('due_date', today.toISOString().split('T')[0])
          .lte('due_date', thirtyDaysFromNow.toISOString().split('T')[0])
          .eq('status', 'active')
          .order('due_date', { ascending: true });
        alertDeadlines = data || [];
      } catch {}

      const deadlines = [];

      // Add license deadlines
      licenseDeadlines?.forEach(license => {
        if (license.profiles) {
          const daysUntil = Math.ceil((new Date(license.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          deadlines.push({
            type: 'Driver License',
            entity: `${license.profiles.first_name} ${license.profiles.last_name}`,
            date: license.expiry_date,
            days: daysUntil,
            severity: daysUntil <= 7 ? 'critical' : daysUntil <= 14 ? 'high' : 'medium'
          });
        }
      });

      // Add alert deadlines
      alertDeadlines?.forEach(alert => {
        const daysUntil = Math.ceil((new Date(alert.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        deadlines.push({
          type: alert.alert_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          entity: alert.title,
          date: alert.due_date,
          days: daysUntil,
          severity: alert.severity || (daysUntil <= 7 ? 'critical' : daysUntil <= 14 ? 'high' : 'medium')
        });
      });

      return deadlines.sort((a, b) => a.days - b.days);
    }
  });
};