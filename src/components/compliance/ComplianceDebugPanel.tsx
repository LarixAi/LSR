import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bug, 
  Activity, 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Database,
  Server,
  Zap,
  XCircle,
  Info
} from 'lucide-react';
import { useDriverCompliance } from '@/hooks/useDriverCompliance';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DebugMetrics {
  fetchAttempts: number;
  lastFetchTime: number;
  averageResponseTime: number;
  networkLatency: number;
  supabaseLatency: number;
  errorCount: number;
  timeoutCount: number;
  activeConnections: number;
}

const ComplianceDebugPanel: React.FC = () => {
  const { user, profile } = useAuth();
  const { 
    complianceData, 
    trainingModules, 
    violations, 
    complianceHistory, 
    recentActivity, 
    driverLicenses,
    loading, 
    error, 
    refreshData 
  } = useDriverCompliance();

  const [debugMetrics, setDebugMetrics] = useState<DebugMetrics>({
    fetchAttempts: 0,
    lastFetchTime: 0,
    averageResponseTime: 0,
    networkLatency: 0,
    supabaseLatency: 0,
    errorCount: 0,
    timeoutCount: 0,
    activeConnections: 0
  });

  const [isVisible, setIsVisible] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    supabaseConnected: false,
    lastCheck: Date.now()
  });

  const [performanceData, setPerformanceData] = useState<Array<{
    timestamp: number;
    operation: string;
    duration: number;
    success: boolean;
  }>>([]);

  // Monitor network status
  useEffect(() => {
    const checkNetworkStatus = async () => {
      const online = navigator.onLine;
      
      // Check Supabase connection
      let supabaseConnected = false;
      try {
        const start = performance.now();
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        const duration = performance.now() - start;
        
        supabaseConnected = !error;
        setDebugMetrics(prev => ({
          ...prev,
          supabaseLatency: duration
        }));
      } catch (err) {
        supabaseConnected = false;
      }

      setNetworkStatus({
        online,
        supabaseConnected,
        lastCheck: Date.now()
      });
    };

    const interval = setInterval(checkNetworkStatus, 5000);
    checkNetworkStatus();

    return () => clearInterval(interval);
  }, []);

  // Monitor performance data from console logs
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const performanceRegex = /⏱️ Checkpoint \[([^\]]+)\]: ([\d.]+)ms/;
    const errorRegex = /❌ Compliance data fetch #(\d+) failed/;
    const timeoutRegex = /⏰ Timeout triggered: (compliance_fetch_timeout)/;

    console.log = (...args) => {
      originalLog.apply(console, args);
      
      const message = args.join(' ');
      
      // Extract performance data
      const perfMatch = message.match(performanceRegex);
      if (perfMatch) {
        const [, operation, duration] = perfMatch;
        setPerformanceData(prev => [...prev.slice(-9), {
          timestamp: Date.now(),
          operation,
          duration: parseFloat(duration),
          success: true
        }]);
      }

      // Extract error data
      if (message.includes('❌ Compliance data fetch')) {
        setDebugMetrics(prev => ({
          ...prev,
          errorCount: prev.errorCount + 1
        }));
      }

      // Extract timeout data
      if (message.includes('⏰ Timeout triggered: compliance_fetch_timeout')) {
        setDebugMetrics(prev => ({
          ...prev,
          timeoutCount: prev.timeoutCount + 1
        }));
      }
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  const getStatusColor = (status: boolean) => status ? 'text-green-500' : 'text-red-500';
  const getStatusIcon = (status: boolean) => status ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;

  const averageResponseTime = performanceData.length > 0 
    ? performanceData.reduce((sum, p) => sum + p.duration, 0) / performanceData.length 
    : 0;

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto">
      <Card className="bg-background/95 backdrop-blur-sm border-2 border-orange-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Bug className="w-4 h-4 mr-2" />
              Compliance Debug Panel
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 text-xs">
          {/* Network Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Network Status</span>
              <div className="flex items-center space-x-2">
                <span className={getStatusColor(networkStatus.online)}>
                  {networkStatus.online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                </span>
                <span className={getStatusColor(networkStatus.supabaseConnected)}>
                  {getStatusIcon(networkStatus.supabaseConnected)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Network Latency:</span>
                <span className="ml-1">{debugMetrics.networkLatency.toFixed(0)}ms</span>
              </div>
              <div>
                <span className="text-muted-foreground">Supabase Latency:</span>
                <span className="ml-1">{debugMetrics.supabaseLatency.toFixed(0)}ms</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Performance</span>
              <Button
                onClick={refreshData}
                size="sm"
                variant="outline"
                className="h-6 px-2"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Avg Response Time:</span>
                <span className={averageResponseTime > 3000 ? 'text-orange-500' : 'text-green-500'}>
                  {averageResponseTime.toFixed(0)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fetch Attempts:</span>
                <span>{debugMetrics.fetchAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span>Errors:</span>
                <span className="text-red-500">{debugMetrics.errorCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Timeouts:</span>
                <span className="text-orange-500">{debugMetrics.timeoutCount}</span>
              </div>
            </div>
          </div>

          {/* Current State */}
          <div className="space-y-2">
            <span className="font-medium">Current State</span>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Loading:</span>
                <Badge variant={loading ? "destructive" : "secondary"} className="text-xs">
                  {loading ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Has Data:</span>
                <Badge variant={complianceData ? "default" : "secondary"} className="text-xs">
                  {complianceData ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Error:</span>
                <span className="text-red-500 max-w-32 truncate">
                  {error || "None"}
                </span>
              </div>
            </div>
          </div>

          {/* Data Counts */}
          <div className="space-y-2">
            <span className="font-medium">Data Counts</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Licenses: {driverLicenses.length}</div>
              <div>Training: {trainingModules.length}</div>
              <div>Violations: {violations.length}</div>
              <div>History: {complianceHistory.length}</div>
              <div>Activity: {recentActivity.length}</div>
            </div>
          </div>

          {/* Recent Performance */}
          {performanceData.length > 0 && (
            <div className="space-y-2">
              <span className="font-medium">Recent Operations</span>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {performanceData.slice(-3).map((perf, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="truncate max-w-24">{perf.operation}</span>
                    <span className={perf.duration > 3000 ? 'text-orange-500' : 'text-green-500'}>
                      {perf.duration.toFixed(0)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="space-y-2">
            <span className="font-medium">User Info</span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="font-mono text-xs truncate max-w-24">
                  {user?.id?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span>Profile ID:</span>
                <span className="font-mono text-xs truncate max-w-24">
                  {profile?.id?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span>Role:</span>
                <span>{profile?.role || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceDebugPanel;

