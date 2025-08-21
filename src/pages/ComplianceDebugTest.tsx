import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  Database, 
  Wifi, 
  WifiOff,
  Zap,
  TestTube,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useDriverCompliance } from '@/hooks/useDriverCompliance';
import { useAuth } from '@/contexts/AuthContext';
import ComplianceDebugPanel from '@/components/compliance/ComplianceDebugPanel';
import { toast } from 'sonner';

const ComplianceDebugTest: React.FC = () => {
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

  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'running' | 'success' | 'error';
    duration?: number;
    error?: string;
  }>>([]);

  const runNetworkTest = async () => {
    const testId = 'network-connectivity';
    setTestResults(prev => [...prev, { test: testId, status: 'running' }]);
    
    const startTime = Date.now();
    
    try {
      // Test basic network connectivity
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        setTestResults(prev => prev.map(t => 
          t.test === testId 
            ? { ...t, status: 'success', duration }
            : t
        ));
        toast.success(`Network test passed: ${duration}ms`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults(prev => prev.map(t => 
        t.test === testId 
          ? { ...t, status: 'error', duration, error: error instanceof Error ? error.message : 'Unknown error' }
          : t
      ));
      toast.error(`Network test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runSupabaseTest = async () => {
    const testId = 'supabase-connection';
    setTestResults(prev => [...prev, { test: testId, status: 'running' }]);
    
    const startTime = Date.now();
    
    try {
      const { data, error } = await fetch('/api/supabase-test').then(r => r.json());
      
      const duration = Date.now() - startTime;
      
      if (!error) {
        setTestResults(prev => prev.map(t => 
          t.test === testId 
            ? { ...t, status: 'success', duration }
            : t
        ));
        toast.success(`Supabase test passed: ${duration}ms`);
      } else {
        throw new Error(error);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults(prev => prev.map(t => 
        t.test === testId 
          ? { ...t, status: 'error', duration, error: error instanceof Error ? error.message : 'Unknown error' }
          : t
      ));
      toast.error(`Supabase test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runTimeoutTest = async () => {
    const testId = 'timeout-simulation';
    setTestResults(prev => [...prev, { test: testId, status: 'running' }]);
    
    const startTime = Date.now();
    
    try {
      // Simulate a slow operation that might timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Operation timed out'));
        }, 15000); // 15 second timeout
        
        // Simulate work
        setTimeout(() => {
          clearTimeout(timeout);
          resolve(true);
        }, 5000); // 5 seconds of work
      });
      
      const duration = Date.now() - startTime;
      setTestResults(prev => prev.map(t => 
        t.test === testId 
          ? { ...t, status: 'success', duration }
          : t
      ));
      toast.success(`Timeout test completed: ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults(prev => prev.map(t => 
        t.test === testId 
          ? { ...t, status: 'error', duration, error: error instanceof Error ? error.message : 'Unknown error' }
          : t
      ));
      toast.error(`Timeout test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await Promise.all([
      runNetworkTest(),
      runSupabaseTest(),
      runTimeoutTest()
    ]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bug className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Compliance Debug Test Suite</h1>
          </div>
          <p className="text-gray-600">
            Test the Driver Compliance system with various scenarios to identify timeout issues
          </p>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="w-5 h-5" />
              <span>Test Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={runAllTests} className="bg-blue-600 hover:bg-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                Run All Tests
              </Button>
              <Button onClick={runNetworkTest} variant="outline">
                <Wifi className="w-4 h-4 mr-2" />
                Network Test
              </Button>
              <Button onClick={runSupabaseTest} variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Supabase Test
              </Button>
              <Button onClick={runTimeoutTest} variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Timeout Test
              </Button>
              <Button onClick={refreshData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Compliance
              </Button>
              <Button onClick={clearResults} variant="outline">
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <span className="font-medium">{result.test}</span>
                        {result.error && (
                          <p className="text-sm text-red-600">{result.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.duration && (
                        <Badge variant="outline" className="text-xs">
                          {result.duration}ms
                        </Badge>
                      )}
                      <Badge 
                        variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bug className="w-5 h-5" />
              <span>Current Compliance State</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{loading ? '...' : complianceData?.overallScore || 0}</div>
                <div className="text-sm text-gray-600">Compliance Score</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{driverLicenses.length}</div>
                <div className="text-sm text-gray-600">Licenses</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{trainingModules.length}</div>
                <div className="text-sm text-gray-600">Training Modules</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{violations.length}</div>
                <div className="text-sm text-gray-600">Violations</div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span>Loading State:</span>
                <Badge variant={loading ? "destructive" : "secondary"}>
                  {loading ? "Loading..." : "Ready"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Error State:</span>
                <span className="text-red-600 max-w-64 truncate">
                  {error || "None"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>User ID:</span>
                <span className="font-mono text-sm">
                  {user?.id?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Profile Role:</span>
                <span>{profile?.role || 'Unknown'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800">
            <p>1. <strong>Network Test:</strong> Tests basic network connectivity and latency</p>
            <p>2. <strong>Supabase Test:</strong> Tests database connection and response time</p>
            <p>3. <strong>Timeout Test:</strong> Simulates slow operations to test timeout handling</p>
            <p>4. <strong>Refresh Compliance:</strong> Manually triggers compliance data fetch</p>
            <p>5. <strong>Debug Panel:</strong> Click the "Debug" button in the bottom-right corner for real-time monitoring</p>
            <p>6. <strong>Console Logs:</strong> Check browser console for detailed debugging information</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Debug Panel */}
      <ComplianceDebugPanel />
    </div>
  );
};

export default ComplianceDebugTest;

