import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ComplianceData {
  overallScore: number;
  riskLevel: string;
  lastAssessment: string;
  trainingProgress: number;
  certificationsCount: number;
  infringementsCount: number;
  nextTrainingDue: string;
}

export interface TrainingModule {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'not_started';
  progress: number;
  dueDate?: string;
}

export interface Violation {
  id: string;
  violationType: string;
  description: string;
  severity: string;
  violationDate: string;
  status: string;
  resolvedDate?: string;
}

export interface ComplianceHistory {
  id: string;
  type: string;
  date: string;
  status: string;
  description: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export interface DriverLicense {
  id: string;
  license_number: string;
  license_type: string;
  expiry_date: string;
  status: string;
  issuing_authority: string;
  created_at: string;
}

export const useDriverCompliance = () => {
  const { user, profile } = useAuth();
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [complianceHistory, setComplianceHistory] = useState<ComplianceHistory[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [driverLicenses, setDriverLicenses] = useState<DriverLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const lastProfileIdRef = useRef<string | null>(null);

  const fetchComplianceData = useCallback(async () => {
    if (!user?.id || !profile?.id) {
      console.log('❌ No user or profile found, skipping compliance data fetch');
      setLoading(false);
      return;
    }

    console.log('🔄 Fetching compliance data for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      // Fetch driver licenses (table may not exist)
      let licensesData: any[] = [];
      try {
        const { data, error: licensesError } = await supabase
          .from('driver_licenses' as any)
          .select('*')
          .eq('driver_id', user.id)
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (licensesError) {
          console.warn('driver_licenses table not found, using empty data');
          licensesData = [];
        } else {
          licensesData = data || [];
        }
      } catch (error) {
        console.warn('driver_licenses table not accessible, using empty data');
        licensesData = [];
      }

      // Fetch training completions (table may not exist)
      let trainingData: any[] = [];
      try {
        const { data, error: trainingError } = await supabase
          .from('training_completions' as any)
          .select('*')
          .eq('driver_id', user.id)
          .eq('organization_id', profile.organization_id)
          .order('completion_date', { ascending: false });

        if (trainingError) {
          console.warn('training_completions table not found, using empty data');
          trainingData = [];
        } else {
          trainingData = data || [];
        }
      } catch (error) {
        console.warn('training_completions table not accessible, using empty data');
        trainingData = [];
      }

      // Fetch compliance violations (table may not exist)
      let violationsData: any[] = [];
      try {
        const { data, error: violationsError } = await supabase
          .from('compliance_violations')
          .select('*')
          .eq('driver_id', user.id)
          .eq('organization_id', profile.organization_id)
          .order('violation_date', { ascending: false });

        if (violationsError) {
          console.warn('compliance_violations table not found, using empty data');
          violationsData = [];
        } else {
          violationsData = data || [];
        }
      } catch (error) {
        console.warn('compliance_violations table not accessible, using empty data');
        violationsData = [];
      }

      // Fetch driver compliance scores (table may not exist)
      let complianceScoresData: any[] = [];
      try {
        const { data, error: scoresError } = await supabase
          .from('driver_compliance_scores' as any)
          .select('*')
          .eq('driver_id', user.id)
          .eq('organization_id', profile.organization_id)
          .order('last_assessment_date', { ascending: false });

        if (scoresError) {
          console.warn('driver_compliance_scores table not found, using empty data');
          complianceScoresData = [];
        } else {
          complianceScoresData = data || [];
        }
      } catch (error) {
        console.warn('driver_compliance_scores table not accessible, using empty data');
        complianceScoresData = [];
      }

      // Process driver licenses
      const validLicenses = licensesData?.filter((license: any) => 
        license.status === 'valid' && new Date(license.expiry_date) > new Date()
      ) || [];
      
      const expiredLicenses = licensesData?.filter((license: any) => 
        new Date(license.expiry_date) <= new Date()
      ) || [];

      // Process training data (empty since table doesn't exist)
      const completedTraining: any[] = [];
      const inProgressTraining: any[] = [];

      // Process violations
      const activeViolations = violationsData?.filter(violation => 
        violation.status === 'active' || violation.status === 'pending'
      ) || [];

      const resolvedViolations = violationsData?.filter(violation => 
        violation.status === 'resolved' || violation.status === 'closed'
      ) || [];

      // Calculate overall compliance score
      let overallScore = 0; // Start from 0
      
      // Use existing compliance score if available
      if (complianceScoresData.length > 0) {
        overallScore = complianceScoresData[0].overall_score;
      } else {
        // Calculate score based on REAL data only - no mock data
        
        // Add points for valid licenses (up to 40 points)
        const maxLicensePoints = 40;
        const licensePoints = Math.min(validLicenses.length * 8, maxLicensePoints);
        overallScore += licensePoints;
        
        // Add points for completed training (up to 30 points) - ONLY if real training data exists
        if (trainingData.length > 0) {
          const totalRequiredTraining = 5; // Assuming 5 required training modules
          const completedTrainingCount = completedTraining.length;
          const trainingCompletionRate = (completedTrainingCount / totalRequiredTraining) * 100;
          const trainingPoints = Math.round((trainingCompletionRate / 100) * 30);
          overallScore += trainingPoints;
        }
        // No points for training if no real training data exists
        
        // Add points for no active violations (up to 20 points)
        const noViolationsBonus = activeViolations.length === 0 ? 20 : 0;
        overallScore += noViolationsBonus;
        
        // Add points for resolved violations (up to 10 points)
        const resolvedViolationPoints = Math.min(resolvedViolations.length * 2, 10);
        overallScore += resolvedViolationPoints;
        
        // Ensure score doesn't exceed 100
        overallScore = Math.min(overallScore, 100);
      }

      // Determine risk level
      let riskLevel = 'low';
      if (expiredLicenses.length > 0 || activeViolations.length > 2) {
        riskLevel = 'high';
      } else if (activeViolations.length > 0 || expiredLicenses.length > 0) {
        riskLevel = 'medium';
      }

      // Calculate next training due date
      const nextTrainingDue = trainingData?.length > 0 
        ? new Date(Math.max(...trainingData.map((t: any) => new Date(t.completion_date).getTime())))
        : new Date();

      // Set compliance data
      setComplianceData({
        overallScore: Math.round(overallScore),
        riskLevel: riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1),
        lastAssessment: new Date().toISOString(),
        trainingProgress: trainingData.length > 0 ? Math.round((completedTraining.length / 5) * 100) : 0, // 0% if no real training data
        certificationsCount: validLicenses.length,
        infringementsCount: activeViolations.length,
        nextTrainingDue: nextTrainingDue.toISOString().split('T')[0]
      });

      // Set driver licenses
      setDriverLicenses(licensesData || []);

      // Process violations
      setViolations((violationsData || []).map(v => ({
        id: v.id,
        violationType: v.violation_type || 'Unknown',
        description: v.description || 'No description provided',
        severity: v.severity || 'moderate',
        violationDate: v.violation_date || v.created_at,
        status: v.status || 'pending',
        resolvedDate: v.resolved_at
      })));

      // Generate training modules from real data only
      const moduleNames = {
        'driver-safety-fundamentals': 'Driver Safety Fundamentals',
        'vehicle-inspection-training': 'Daily Vehicle Inspection Procedures',
        'emergency-procedures': 'Emergency Response Procedures',
        'legal-compliance': 'Legal Compliance and Documentation',
        'passenger-assistance': 'Passenger Assistance Training',
        'defensive-driving': 'Defensive Driving Techniques',
        'first-aid': 'First Aid Training',
        'customer-service': 'Customer Service Excellence'
      };

      let allTrainingModules: any[] = [];

      if (trainingData.length > 0) {
        // Use real training data only
        allTrainingModules = Object.entries(moduleNames).map(([moduleId, moduleName]) => {
          const trainingRecord = trainingData?.find((t: any) => t.training_type === moduleId);
          
          if (trainingRecord) {
            return {
              id: moduleId,
              name: moduleName,
              status: trainingRecord.status as 'completed' | 'in_progress' | 'not_started',
              progress: trainingRecord.progress || (trainingRecord.status === 'completed' ? 100 : 0),
              dueDate: trainingRecord.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
          } else {
            return {
              id: moduleId,
              name: moduleName,
              status: 'not_started' as const,
              progress: 0,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
          }
        });
      }
      // If no real training data exists, allTrainingModules remains empty array

      setTrainingModules(allTrainingModules);

      // Generate recent activity from real data only
      const activityFromLicenses = (licensesData || []).slice(0, 2).map((license: any) => ({
        id: `license_${license.id}`,
        type: 'license',
        description: `License ${license.license_number} ${license.status === 'valid' ? 'verified' : 'expired'}`,
        timestamp: license.created_at,
        status: license.status === 'valid' ? 'success' as const : 'warning' as const
      }));

      const activityFromTraining = (trainingData || []).slice(0, 2).map((training: any) => ({
        id: `training_${training.id}`,
        type: 'training',
        description: `Training ${training.training_type} ${training.status}`,
        timestamp: training.completion_date || training.created_at,
        status: training.status === 'completed' ? 'success' as const : 'info' as const
      }));

      const activityFromViolations = (violationsData || []).slice(0, 2).map(violation => ({
        id: `violation_${violation.id}`,
        type: 'violation',
        description: `Compliance violation: ${violation.violation_type}`,
        timestamp: violation.violation_date || violation.created_at,
        status: 'warning' as const
      }));

      const combinedActivity = [...activityFromLicenses, ...activityFromTraining, ...activityFromViolations]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setRecentActivity(combinedActivity);

      // Generate compliance history from real data only
      const historyFromLicenses = (licensesData || []).map((license: any) => ({
        id: `license_${license.id}`,
        type: 'License Verification',
        date: license.created_at,
        status: license.status === 'valid' ? 'Verified' : 'Expired',
        description: `${license.license_type} License: ${license.license_number}`
      }));

      const historyFromTraining = (trainingData || []).map((training: any) => ({
        id: `training_${training.id}`,
        type: 'Training Completion',
        date: training.completion_date || training.created_at,
        status: training.status === 'completed' ? 'Completed' : 'In Progress',
        description: `Training: ${training.training_type}`
      }));

      const historyFromViolations = (violationsData || []).map(violation => ({
        id: `violation_${violation.id}`,
        type: 'Compliance Review',
        date: violation.violation_date || violation.created_at,
        status: violation.status === 'active' ? 'Under Review' : 'Resolved',
        description: `${violation.violation_type}: ${violation.description}`
      }));

      const combinedHistory = [...historyFromLicenses, ...historyFromTraining, ...historyFromViolations]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      setComplianceHistory(combinedHistory);

    } catch (error: any) {
      console.error('Error fetching compliance data:', error);
      setError(error.message || 'Failed to load compliance data');
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile?.id]); // Only depend on the IDs, not the full objects

  useEffect(() => {
    console.log('🔄 useDriverCompliance effect triggered, user ID:', user?.id, 'profile ID:', profile?.id);
    
    // Check if user or profile has actually changed
    const currentUserId = user?.id;
    const currentProfileId = profile?.id;
    
    if (currentUserId !== lastUserIdRef.current || currentProfileId !== lastProfileIdRef.current) {
      console.log('🔄 User or profile changed, updating refs and fetching data');
      lastUserIdRef.current = currentUserId;
      lastProfileIdRef.current = currentProfileId;
      hasFetchedRef.current = false;
    }
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Compliance data fetch timeout, setting loading to false');
        setLoading(false);
        setError('Failed to load compliance data: timeout');
      }
    }, 5000); // 5 second timeout - reduced from 10 seconds

    if (currentUserId && currentProfileId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchComplianceData();
    } else if (!currentUserId) {
      // If no user after a short delay, stop loading
      const noUserTimeoutId = setTimeout(() => {
        if (!user?.id) {
          console.log('❌ No user found after delay, stopping loading');
          setLoading(false);
        }
      }, 2000);
      
      return () => clearTimeout(noUserTimeoutId);
    }

    return () => clearTimeout(timeoutId);
  }, [user?.id, profile?.id]); // Only depend on the IDs

  const refreshData = useCallback(() => {
    fetchComplianceData();
  }, [fetchComplianceData]);

  return {
    complianceData,
    trainingModules,
    violations,
    complianceHistory,
    recentActivity,
    driverLicenses,
    loading,
    error,
    refreshData
  };
};