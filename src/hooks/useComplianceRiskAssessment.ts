import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RiskFactor {
  id: string;
  category: 'safety' | 'regulatory' | 'operational' | 'financial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  probability: number; // 0-1
  mitigation: string;
  status: 'open' | 'mitigating' | 'resolved';
  assignedTo?: string;
  dueDate?: string;
  cost?: number;
}

export interface RiskAssessment {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleName: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  lastAssessment: string;
  nextAssessment: string;
  mitigationStatus: 'none' | 'in_progress' | 'completed';
  assignedTo?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'risk' | 'expiry' | 'violation' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  vehicleId: string;
  vehicleNumber: string;
  dueDate: string;
  status: 'open' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  createdAt: string;
  organizationId: string;
}

export interface RiskMetrics {
  totalVehicles: number;
  highRiskVehicles: number;
  averageRiskScore: number;
  openAlerts: number;
  criticalAlerts: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceRate: number;
  riskTrend: 'improving' | 'stable' | 'worsening';
}

export interface MitigationAction {
  id: string;
  riskFactorId: string;
  action: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completionDate?: string;
  notes?: string;
  cost?: number;
}

// Risk scoring algorithm
const calculateRiskScore = (factors: RiskFactor[]): number => {
  if (factors.length === 0) return 0;
  
  const severityWeights = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };

  const totalScore = factors.reduce((sum, factor) => {
    const severityWeight = severityWeights[factor.severity];
    const probabilityWeight = factor.probability;
    const statusWeight = factor.status === 'resolved' ? 0.1 : 1;
    
    return sum + (severityWeight * probabilityWeight * statusWeight);
  }, 0);

  // Normalize to 0-100 scale
  const maxPossibleScore = factors.length * 4 * 1 * 1;
  return Math.round((totalScore / maxPossibleScore) * 100);
};

// Risk level determination
const determineRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score <= 25) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
};

export const useComplianceRiskAssessment = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Get risk assessments for organization
  const riskAssessments = useQuery({
    queryKey: ['compliance-risk-assessments', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      // For now, return mock data since the table doesn't exist yet
      // In production, this would query the risk_assessments table
      const mockAssessments: RiskAssessment[] = [
        {
          id: 'risk-1',
          vehicleId: 'v1',
          vehicleNumber: 'BUS001',
          vehicleName: '2016 Ford F-150',
          riskScore: 25,
          riskLevel: 'low',
          riskFactors: [
            {
              id: 'rf-1',
              category: 'safety',
              severity: 'low',
              description: 'Minor wear on brake pads',
              impact: 'Reduced braking efficiency',
              probability: 0.3,
              mitigation: 'Schedule brake pad replacement',
              status: 'open',
              dueDate: '2024-09-15',
              cost: 150
            }
          ],
          lastAssessment: '2024-08-15',
          nextAssessment: '2024-09-15',
          mitigationStatus: 'none',
          organizationId: profile.organization_id,
          createdAt: '2024-08-15T00:00:00Z',
          updatedAt: '2024-08-15T00:00:00Z'
        },
        {
          id: 'risk-2',
          vehicleId: 'v2',
          vehicleNumber: 'NBG-001',
          vehicleName: '2014 Chevrolet Express Cargo',
          riskScore: 75,
          riskLevel: 'high',
          riskFactors: [
            {
              id: 'rf-2',
              category: 'regulatory',
              severity: 'high',
              description: 'Insurance expiring in 30 days',
              impact: 'Vehicle operation illegal after expiry',
              probability: 1.0,
              mitigation: 'Renew insurance immediately',
              status: 'mitigating',
              assignedTo: 'John Smith',
              dueDate: '2024-12-01',
              cost: 500
            },
            {
              id: 'rf-3',
              category: 'operational',
              severity: 'medium',
              description: 'Unplanned maintenance required',
              impact: 'Vehicle unavailable for operations',
              probability: 0.8,
              mitigation: 'Complete repairs and safety checks',
              status: 'open',
              dueDate: '2024-08-25',
              cost: 850
            }
          ],
          lastAssessment: '2024-08-20',
          nextAssessment: '2024-08-27',
          mitigationStatus: 'in_progress',
          assignedTo: 'John Smith',
          organizationId: profile.organization_id,
          createdAt: '2024-08-20T00:00:00Z',
          updatedAt: '2024-08-20T00:00:00Z'
        }
      ];

      return mockAssessments;
    },
    enabled: !!profile?.organization_id
  });

  // Get compliance alerts
  const complianceAlerts = useQuery({
    queryKey: ['compliance-alerts', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      // Mock alerts data
      const mockAlerts: ComplianceAlert[] = [
        {
          id: 'alert-1',
          type: 'expiry',
          severity: 'high',
          title: 'Insurance Expiry Warning',
          description: 'Vehicle NBG-001 insurance expires in 30 days',
          vehicleId: 'v2',
          vehicleNumber: 'NBG-001',
          dueDate: '2024-12-01',
          status: 'open',
          organizationId: profile.organization_id,
          createdAt: '2024-08-20T00:00:00Z'
        },
        {
          id: 'alert-2',
          type: 'maintenance',
          severity: 'medium',
          title: 'Maintenance Overdue',
          description: 'Vehicle NBG-001 requires scheduled maintenance',
          vehicleId: 'v2',
          vehicleNumber: 'NBG-001',
          dueDate: '2024-08-25',
          status: 'acknowledged',
          assignedTo: 'John Smith',
          organizationId: profile.organization_id,
          createdAt: '2024-08-18T00:00:00Z'
        }
      ];

      return mockAlerts;
    },
    enabled: !!profile?.organization_id
  });

  // Calculate comprehensive risk metrics
  const riskMetrics = useQuery({
    queryKey: ['compliance-risk-metrics', profile?.organization_id],
    queryFn: async (): Promise<RiskMetrics> => {
      if (!profile?.organization_id) {
        return {
          totalVehicles: 0,
          highRiskVehicles: 0,
          averageRiskScore: 0,
          openAlerts: 0,
          criticalAlerts: 0,
          riskLevel: 'low',
          complianceRate: 100,
          riskTrend: 'stable'
        };
      }

      const assessments = await riskAssessments.refetch();
      const alerts = await complianceAlerts.refetch();

      const totalVehicles = assessments.data?.length || 0;
      const highRiskVehicles = assessments.data?.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length || 0;
      const averageRiskScore = assessments.data?.length > 0 
        ? Math.round(assessments.data.reduce((sum, r) => sum + r.riskScore, 0) / assessments.data.length)
        : 0;
      const openAlerts = alerts.data?.filter(a => a.status === 'open').length || 0;
      const criticalAlerts = alerts.data?.filter(a => a.severity === 'critical').length || 0;
      const complianceRate = totalVehicles > 0 ? Math.round(((totalVehicles - highRiskVehicles) / totalVehicles) * 100) : 100;

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (highRiskVehicles > 0) {
        riskLevel = 'high';
      } else if (averageRiskScore > 50) {
        riskLevel = 'medium';
      }

      // Determine risk trend (simplified - in production would compare historical data)
      const riskTrend: 'improving' | 'stable' | 'worsening' = 'stable';

      return {
        totalVehicles,
        highRiskVehicles,
        averageRiskScore,
        openAlerts,
        criticalAlerts,
        riskLevel,
        complianceRate,
        riskTrend
      };
    },
    enabled: !!profile?.organization_id
  });

  // Create new risk assessment
  const createRiskAssessment = useMutation({
    mutationFn: async (assessment: Omit<RiskAssessment, 'id' | 'createdAt' | 'updatedAt'>) => {
      // In production, this would insert into the risk_assessments table
      console.log('Creating risk assessment:', assessment);
      return { success: true, id: 'new-risk-assessment-id' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-risk-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-risk-metrics'] });
    }
  });

  // Update risk assessment
  const updateRiskAssessment = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RiskAssessment> }) => {
      // In production, this would update the risk_assessments table
      console.log('Updating risk assessment:', id, updates);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-risk-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-risk-metrics'] });
    }
  });

  // Acknowledge alert
  const acknowledgeAlert = useMutation({
    mutationFn: async ({ alertId, assignedTo }: { alertId: string; assignedTo: string }) => {
      // In production, this would update the compliance_alerts table
      console.log('Acknowledging alert:', alertId, assignedTo);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-alerts'] });
    }
  });

  // Resolve alert
  const resolveAlert = useMutation({
    mutationFn: async ({ alertId, resolutionNotes }: { alertId: string; resolutionNotes?: string }) => {
      // In production, this would update the compliance_alerts table
      console.log('Resolving alert:', alertId, resolutionNotes);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-risk-metrics'] });
    }
  });

  return {
    // Data
    riskAssessments: riskAssessments.data || [],
    complianceAlerts: complianceAlerts.data || [],
    riskMetrics: riskMetrics.data,
    
    // Loading states
    isLoading: riskAssessments.isLoading || complianceAlerts.isLoading || riskMetrics.isLoading,
    
    // Error states
    error: riskAssessments.error || complianceAlerts.error || riskMetrics.error,
    
    // Mutations
    createRiskAssessment,
    updateRiskAssessment,
    acknowledgeAlert,
    resolveAlert,
    
    // Utilities
    calculateRiskScore,
    determineRiskLevel
  };
};
