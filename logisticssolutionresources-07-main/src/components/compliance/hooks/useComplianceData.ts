
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useComplianceData = () => {
  // Get real compliance violations
  const complianceViolations = useQuery({
    queryKey: ['compliance-violations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_violations')
        .select(`
          *,
          profiles!driver_id (
            first_name,
            last_name,
            employee_id
          )
        `)
        .order('occurred_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Get driver risk scores (aligned to driver_risk_scores)
  const driverRiskScores = useQuery({
    queryKey: ['driver-risk-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_risk_scores')
        .select('*')
        .order('calculated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Get real driver licenses from database
  const driverLicenses = useQuery({
    queryKey: ['driver-licenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Get real incident reports
  const incidentReports = useQuery({
    queryKey: ['incident-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          profiles!driver_id (
            first_name,
            last_name
          ),
          vehicles (
            vehicle_number,
            make,
            model
          )
        `)
        .order('incident_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Get compliance summary from real data
  const complianceSummary = useQuery({
    queryKey: ['compliance-summary'],
    queryFn: async () => {
      const violations = complianceViolations.data || [];
      const scores = driverRiskScores.data || [];
      
      // Group violations by driver
      const driverSummaries = new Map();
      
      violations.forEach((violation: any) => {
        const driverId = violation.driver_id;
        if (!driverSummaries.has(driverId)) {
          driverSummaries.set(driverId, {
            driver_id: driverId,
            total_violations: 0,
            avg_risk_score: 0,
            last_violation_date: null,
            vehicles: []
          });
        }
        
        const summary = driverSummaries.get(driverId);
        summary.total_violations += 1;
        
        if (!summary.last_violation_date || new Date(violation.occurred_at) > new Date(summary.last_violation_date)) {
          summary.last_violation_date = violation.occurred_at;
        }
      });
      
      // Add risk scores
      scores.forEach((score: any) => {
        if (driverSummaries.has(score.driver_id)) {
          driverSummaries.get(score.driver_id).avg_risk_score = score.score;
        }
      });
      
      return Array.from(driverSummaries.values());
    },
    enabled: !complianceViolations.isLoading && !driverRiskScores.isLoading
  });

  return {
    complianceViolations,
    driverRiskScores,
    driverLicenses,
    incidentReports,
    complianceSummary
  };
};
