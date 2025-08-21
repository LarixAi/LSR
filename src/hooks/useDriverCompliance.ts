import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Debug configuration
const DEBUG_CONFIG = {
  ENABLED: true,
  LOG_LEVEL: 'verbose', // 'basic', 'verbose', 'debug'
  TIMEOUT_WARNING_THRESHOLD: 3000, // 3 seconds
  TIMEOUT_ERROR_THRESHOLD: 8000, // 8 seconds
  PERFORMANCE_MONITORING: true,
  NETWORK_MONITORING: true,
  ERROR_TRACKING: true
};

// Debug logger utility
const debugLog = (level: string, message: string, data?: any) => {
  if (!DEBUG_CONFIG.ENABLED) return;
  
  const timestamp = new Date().toISOString();
  const logLevel = DEBUG_CONFIG.LOG_LEVEL;
  
  if (level === 'error' || level === 'warn' || 
      (logLevel === 'verbose' && level === 'info') ||
      (logLevel === 'debug' && level === 'debug')) {
    
    const prefix = `[DriverCompliance:${level.toUpperCase()}]`;
    const logMessage = `${timestamp} ${prefix} ${message}`;
    
    if (level === 'error') {
      console.error(logMessage, data);
    } else if (level === 'warn') {
      console.warn(logMessage, data);
    } else {
      console.log(logMessage, data);
    }
  }
};

// Performance monitoring utility
const performanceMonitor = {
  startTime: 0,
  checkpoints: new Map<string, number>(),
  
  start(label: string) {
    this.startTime = performance.now();
    this.checkpoints.set(label, this.startTime);
    debugLog('debug', `⏱️ Performance monitoring started: ${label}`);
  },
  
  checkpoint(label: string) {
    const now = performance.now();
    const start = this.checkpoints.get(label) || this.startTime;
    const duration = now - start;
    
    debugLog('debug', `⏱️ Checkpoint [${label}]: ${duration.toFixed(2)}ms`);
    
    if (duration > DEBUG_CONFIG.TIMEOUT_WARNING_THRESHOLD) {
      debugLog('warn', `⚠️ Slow operation detected [${label}]: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  },
  
  end(label: string) {
    const duration = this.checkpoint(label);
    debugLog('info', `✅ Operation completed [${label}]: ${duration.toFixed(2)}ms`);
    
    if (duration > DEBUG_CONFIG.TIMEOUT_ERROR_THRESHOLD) {
      debugLog('error', `❌ Operation timeout [${label}]: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
};

// Network monitoring utility
const networkMonitor = {
  async checkConnection() {
    try {
      const start = performance.now();
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const duration = performance.now() - start;
      
      debugLog('debug', `🌐 Network check: ${duration.toFixed(2)}ms, status: ${response.status}`);
      return { connected: response.ok, latency: duration };
    } catch (error) {
      debugLog('warn', '🌐 Network check failed:', error);
      return { connected: false, latency: 0 };
    }
  },
  
  async checkSupabaseConnection() {
    try {
      const start = performance.now();
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      const duration = performance.now() - start;
      
      debugLog('debug', `🔗 Supabase connection check: ${duration.toFixed(2)}ms, error: ${error?.message || 'none'}`);
      return { connected: !error, latency: duration, error };
    } catch (error) {
      debugLog('warn', '🔗 Supabase connection check failed:', error);
      return { connected: false, latency: 0, error };
    }
  }
};

// Request deduplication utility
const requestDeduplicator = {
  activeRequests: new Map<string, Promise<any>>(),
  
  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If there's already an active request with this key, return it
    if (this.activeRequests.has(key)) {
      debugLog('debug', `🔄 Request deduplicated: ${key}`);
      return this.activeRequests.get(key)!;
    }
    
    // Create new request
    const requestPromise = requestFn().finally(() => {
      // Clean up when request completes
      this.activeRequests.delete(key);
      debugLog('debug', `🧹 Request cleaned up: ${key}`);
    });
    
    // Store the request
    this.activeRequests.set(key, requestPromise);
    debugLog('debug', `🆕 New request started: ${key}`);
    
    return requestPromise;
  },
  
  clear() {
    this.activeRequests.clear();
    debugLog('debug', '🧹 All requests cleared');
  }
};

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
  
  // Refs for tracking state
  const hasFetchedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const lastProfileIdRef = useRef<string | null>(null);
  const fetchAttemptsRef = useRef(0);
  const lastFetchTimeRef = useRef<number>(0);
  const timeoutRefsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function for timeouts
  const clearAllTimeouts = () => {
    timeoutRefsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefsRef.current.clear();
  };

  // Add timeout with tracking
  const addTimeout = (callback: () => void, delay: number, label: string) => {
    const timeoutId = setTimeout(() => {
      debugLog('warn', `⏰ Timeout triggered: ${label}`);
      timeoutRefsRef.current.delete(timeoutId);
      callback();
    }, delay);
    timeoutRefsRef.current.add(timeoutId);
    return timeoutId;
  };

  const fetchComplianceData = useCallback(async () => {
    // Prevent multiple concurrent fetches
    if (isFetchingRef.current) {
      debugLog('warn', '🔄 Fetch already in progress, skipping duplicate request');
      return;
    }

    const fetchId = ++fetchAttemptsRef.current;
    const startTime = Date.now();
    
    debugLog('info', `🔄 Starting compliance data fetch #${fetchId}`, {
      userId: user?.id,
      profileId: profile?.id,
      timestamp: new Date().toISOString()
    });

    if (!user?.id || !profile?.id) {
      debugLog('warn', '❌ No user or profile found, skipping compliance data fetch', {
        userId: user?.id,
        profileId: profile?.id,
        fetchId
      });
      setLoading(false);
      return;
    }

    // Create abort controller for this fetch
    abortControllerRef.current = new AbortController();
    isFetchingRef.current = true;

    try {
      // Check network connectivity
      if (DEBUG_CONFIG.NETWORK_MONITORING) {
        debugLog('debug', '🌐 Checking network connectivity...');
        const networkStatus = await networkMonitor.checkConnection();
        const supabaseStatus = await networkMonitor.checkSupabaseConnection();
        
        debugLog('info', '🌐 Network status:', { networkStatus, supabaseStatus });
        
        if (!networkStatus.connected || !supabaseStatus.connected) {
          debugLog('error', '❌ Network connectivity issues detected', { networkStatus, supabaseStatus });
          setError('Network connectivity issues detected');
          setLoading(false);
          return;
        }
      }

      performanceMonitor.start(`fetch_compliance_data_${fetchId}`);
      setLoading(true);
      setError(null);
      lastFetchTimeRef.current = startTime;

      // Use request deduplication for the main fetch
      await requestDeduplicator.deduplicate(
        `compliance_fetch_${user.id}_${profile.id}`,
        async () => {
          debugLog('debug', '📊 Fetching driver licenses...');
          performanceMonitor.start('fetch_licenses');
          
          // Fetch driver licenses (table may not exist)
          let licensesData: any[] = [];
          try {
            const { data, error: licensesError } = await supabase
              .from('driver_licenses' as any)
              .select('*')
              .eq('driver_id', user.id)
              .eq('organization_id', profile.organization_id)
              .order('created_at', { ascending: false });

            performanceMonitor.end('fetch_licenses');

            if (licensesError) {
              debugLog('warn', 'driver_licenses table not found, using empty data', { error: licensesError });
              licensesData = [];
            } else {
              debugLog('debug', `✅ Fetched ${data?.length || 0} driver licenses`);
              licensesData = data || [];
            }
          } catch (error) {
            performanceMonitor.end('fetch_licenses');
            debugLog('warn', 'driver_licenses table not accessible, using empty data', { error });
            licensesData = [];
          }

          debugLog('debug', '📚 Fetching training completions...');
          performanceMonitor.start('fetch_training');
          
          // Fetch training completions (table may not exist)
          let trainingData: any[] = [];
          try {
            const { data, error: trainingError } = await supabase
              .from('training_completions' as any)
              .select('*')
              .eq('driver_id', user.id)
              .eq('organization_id', profile.organization_id)
              .order('completion_date', { ascending: false });

            performanceMonitor.end('fetch_training');

            if (trainingError) {
              debugLog('warn', 'training_completions table not found, using empty data', { error: trainingError });
              trainingData = [];
            } else {
              debugLog('debug', `✅ Fetched ${data?.length || 0} training records`);
              trainingData = data || [];
            }
          } catch (error) {
            performanceMonitor.end('fetch_training');
            debugLog('warn', 'training_completions table not accessible, using empty data', { error });
            trainingData = [];
          }

          debugLog('debug', '⚠️ Fetching compliance violations...');
          performanceMonitor.start('fetch_violations');
          
          // Fetch compliance violations (table may not exist)
          let violationsData: any[] = [];
          try {
            const { data, error: violationsError } = await supabase
              .from('compliance_violations')
              .select('*')
              .eq('driver_id', user.id)
              .eq('organization_id', profile.organization_id)
              .order('violation_date', { ascending: false });

            performanceMonitor.end('fetch_violations');

            if (violationsError) {
              debugLog('warn', 'compliance_violations table not found, using empty data', { error: violationsError });
              violationsData = [];
            } else {
              debugLog('debug', `✅ Fetched ${data?.length || 0} violation records`);
              violationsData = data || [];
            }
          } catch (error) {
            performanceMonitor.end('fetch_violations');
            debugLog('warn', 'compliance_violations table not accessible, using empty data', { error });
            violationsData = [];
          }

          debugLog('debug', '📈 Fetching compliance scores...');
          performanceMonitor.start('fetch_scores');
          
          // Fetch driver compliance scores (table may not exist)
          let complianceScoresData: any[] = [];
          try {
            const { data, error: scoresError } = await supabase
              .from('driver_compliance_scores' as any)
              .select('*')
              .eq('driver_id', user.id)
              .eq('organization_id', profile.organization_id)
              .order('last_assessment_date', { ascending: false });

            performanceMonitor.end('fetch_scores');

            if (scoresError) {
              debugLog('warn', 'driver_compliance_scores table not found, using empty data', { error: scoresError });
              complianceScoresData = [];
            } else {
              debugLog('debug', `✅ Fetched ${data?.length || 0} compliance score records`);
              complianceScoresData = data || [];
            }
          } catch (error) {
            performanceMonitor.end('fetch_scores');
            debugLog('warn', 'driver_compliance_scores table not accessible, using empty data', { error });
            complianceScoresData = [];
          }

          debugLog('debug', '🧮 Processing data...');
          performanceMonitor.start('process_data');

          // Process driver licenses
          const validLicenses = licensesData?.filter((license: any) => 
            license.status === 'valid' && new Date(license.expiry_date) > new Date()
          ) || [];
          
          const expiredLicenses = licensesData?.filter((license: any) => 
            new Date(license.expiry_date) <= new Date()
          ) || [];

          debugLog('debug', `📋 License processing: ${validLicenses.length} valid, ${expiredLicenses.length} expired`);

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

          debugLog('debug', `⚠️ Violation processing: ${activeViolations.length} active, ${resolvedViolations.length} resolved`);

          // Calculate overall compliance score
          let overallScore = 0; // Start from 0
          
          // Use existing compliance score if available
          if (complianceScoresData.length > 0) {
            overallScore = complianceScoresData[0].overall_score;
            debugLog('debug', `📊 Using existing compliance score: ${overallScore}`);
          } else {
            debugLog('debug', '📊 Calculating new compliance score...');
            
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
            
            debugLog('debug', `📊 Calculated compliance score: ${overallScore}`, {
              licensePoints,
              trainingPoints: trainingData.length > 0 ? Math.round((completedTraining.length / 5) * 30) : 0,
              noViolationsBonus,
              resolvedViolationPoints
            });
          }

          // Determine risk level
          let riskLevel = 'low';
          if (expiredLicenses.length > 0 || activeViolations.length > 2) {
            riskLevel = 'high';
          } else if (activeViolations.length > 0 || expiredLicenses.length > 0) {
            riskLevel = 'medium';
          }

          debugLog('debug', `⚠️ Risk level determined: ${riskLevel}`, {
            expiredLicenses: expiredLicenses.length,
            activeViolations: activeViolations.length
          });

          // Calculate next training due date
          const nextTrainingDue = trainingData?.length > 0 
            ? new Date(Math.max(...trainingData.map((t: any) => new Date(t.completion_date).getTime())))
            : new Date();

          // Set compliance data
          const finalComplianceData = {
            overallScore: Math.round(overallScore),
            riskLevel: riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1),
            lastAssessment: new Date().toISOString(),
            trainingProgress: trainingData.length > 0 ? Math.round((completedTraining.length / 5) * 100) : 0, // 0% if no real training data
            certificationsCount: validLicenses.length,
            infringementsCount: activeViolations.length,
            nextTrainingDue: nextTrainingDue.toISOString().split('T')[0]
          };

          setComplianceData(finalComplianceData);
          debugLog('debug', '✅ Compliance data set:', finalComplianceData);

          // Set driver licenses
          setDriverLicenses(licensesData || []);

          // Process violations
          const processedViolations = (violationsData || []).map(v => ({
            id: v.id,
            violationType: v.violation_type || 'Unknown',
            description: v.description || 'No description provided',
            severity: v.severity || 'moderate',
            violationDate: v.violation_date || v.created_at,
            status: v.status || 'pending',
            resolvedDate: v.resolved_at
          }));

          setViolations(processedViolations);
          debugLog('debug', `✅ Processed ${processedViolations.length} violations`);

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
          debugLog('debug', `✅ Generated ${allTrainingModules.length} training modules`);

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
          debugLog('debug', `✅ Generated ${combinedActivity.length} recent activities`);

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
          debugLog('debug', `✅ Generated ${combinedHistory.length} compliance history records`);

          performanceMonitor.end('process_data');
          performanceMonitor.end(`fetch_compliance_data_${fetchId}`);

          const totalDuration = Date.now() - startTime;
          debugLog('info', `✅ Compliance data fetch #${fetchId} completed successfully`, {
            duration: `${totalDuration}ms`,
            fetchId,
            timestamp: new Date().toISOString()
          });

          return { success: true };
        }
      );

    } catch (error: any) {
      const totalDuration = Date.now() - startTime;
      debugLog('error', `❌ Compliance data fetch #${fetchId} failed`, {
        error: error.message,
        stack: error.stack,
        duration: `${totalDuration}ms`,
        fetchId,
        timestamp: new Date().toISOString()
      });
      
      setError(error.message || 'Failed to load compliance data');
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [user?.id, profile?.id]); // Only depend on the IDs, not the full objects

  useEffect(() => {
    debugLog('info', '🔄 useDriverCompliance effect triggered', {
      userId: user?.id,
      profileId: profile?.id,
      timestamp: new Date().toISOString()
    });
    
    // Check if user or profile has actually changed
    const currentUserId = user?.id;
    const currentProfileId = profile?.id;
    
    if (currentUserId !== lastUserIdRef.current || currentProfileId !== lastProfileIdRef.current) {
      debugLog('info', '🔄 User or profile changed, updating refs and fetching data', {
        oldUserId: lastUserIdRef.current,
        newUserId: currentUserId,
        oldProfileId: lastProfileIdRef.current,
        newProfileId: currentProfileId
      });
      lastUserIdRef.current = currentUserId;
      lastProfileIdRef.current = currentProfileId;
      hasFetchedRef.current = false;
      
      // Clear any existing requests when user/profile changes
      requestDeduplicator.clear();
    }
    
    // Set a timeout to prevent infinite loading
    const timeoutId = addTimeout(() => {
      if (loading && isFetchingRef.current) {
        debugLog('warn', '⚠️ Compliance data fetch timeout, aborting request', {
          fetchAttempts: fetchAttemptsRef.current,
          lastFetchTime: lastFetchTimeRef.current,
          currentTime: Date.now()
        });
        
        // Abort the current request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        setLoading(false);
        setError('Failed to load compliance data: timeout');
        isFetchingRef.current = false;
      }
    }, 15000, 'compliance_fetch_timeout'); // 15 second timeout

    if (currentUserId && currentProfileId && !hasFetchedRef.current && !isFetchingRef.current) {
      hasFetchedRef.current = true;
      fetchComplianceData();
    } else if (!currentUserId) {
      // If no user after a short delay, stop loading
      const noUserTimeoutId = addTimeout(() => {
        if (!user?.id) {
          debugLog('warn', '❌ No user found after delay, stopping loading');
          setLoading(false);
        }
      }, 2000, 'no_user_timeout');
    }

    return () => {
      clearTimeout(timeoutId);
      timeoutRefsRef.current.delete(timeoutId);
    };
  }, [user?.id, profile?.id]); // Only depend on the IDs

  const refreshData = useCallback(() => {
    debugLog('info', '🔄 Manual refresh triggered');
    hasFetchedRef.current = false;
    isFetchingRef.current = false;
    
    // Clear any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    requestDeduplicator.clear();
    
    fetchComplianceData();
  }, [fetchComplianceData]);

  // Debug information for development
  if (DEBUG_CONFIG.ENABLED) {
    debugLog('debug', '📊 Current compliance state', {
      loading,
      error,
      hasData: !!complianceData,
      fetchAttempts: fetchAttemptsRef.current,
      lastFetchTime: lastFetchTimeRef.current,
      activeTimeouts: timeoutRefsRef.current.size,
      isFetching: isFetchingRef.current,
      activeRequests: requestDeduplicator.activeRequests.size
    });
  }

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