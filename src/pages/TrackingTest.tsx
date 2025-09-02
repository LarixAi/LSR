import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMobileTracking } from '@/hooks/useMobileTracking';
import { useAuth } from '@/contexts/AuthContext';
import { useDrivers } from '@/hooks/useDrivers';
import { 
  MapPin, 
  Play, 
  Pause, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  User
} from 'lucide-react';

export default function TrackingTest() {
  const { profile } = useAuth();
  const { data: drivers, isLoading: driversLoading } = useDrivers();
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  // Use current user if they're a driver, otherwise use first available driver
  const effectiveDriverId = profile?.role === 'driver' ? profile.id : selectedDriverId;

  const {
    isTracking,
    isTrackingActive,
    currentLocation,
    startTracking,
    stopTracking,
    refreshLocation,
    isLoading,
    error,
    permissionStatus
  } = useMobileTracking({
    driverId: effectiveDriverId,
    autoStart: false,
    updateInterval: 10000
  });

  // Set first driver as default when drivers load
  React.useEffect(() => {
    if (drivers && drivers.length > 0 && !selectedDriverId && profile?.role !== 'driver') {
      setSelectedDriverId(drivers[0].id);
    }
  }, [drivers, selectedDriverId, profile?.role]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const handleStartTracking = async () => {
    try {
      addTestResult('Starting GPS tracking...');
      const success = await startTracking();
      if (success) {
        addTestResult('✅ GPS tracking started successfully');
      } else {
        addTestResult('❌ Failed to start GPS tracking');
      }
    } catch (err) {
      addTestResult(`❌ Error starting tracking: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleStopTracking = async () => {
    try {
      addTestResult('Stopping GPS tracking...');
      const success = await stopTracking();
      if (success) {
        addTestResult('✅ GPS tracking stopped successfully');
      } else {
        addTestResult('❌ Failed to stop GPS tracking');
      }
    } catch (err) {
      addTestResult(`❌ Error stopping tracking: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRefreshLocation = async () => {
    try {
      addTestResult('Refreshing location...');
      const location = await refreshLocation();
      if (location) {
        addTestResult(`✅ Location refreshed: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
      } else {
        addTestResult('❌ Failed to refresh location');
      }
    } catch (err) {
      addTestResult(`❌ Error refreshing location: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      addTestResult('Testing database connection...');
      // This will test if the tracking tables exist
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('driver_tracking_status')
        .select('*')
        .limit(1);
      
      if (error) {
        addTestResult(`❌ Database error: ${error.message}`);
      } else {
        addTestResult(`✅ Database connection successful. Found ${data?.length || 0} tracking records.`);
      }

      // Test if we can access profiles table (our driver source)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('role', 'driver')
        .limit(1);
      
      if (profileError) {
        addTestResult(`❌ Profiles table error: ${profileError.message}`);
      } else {
        addTestResult(`✅ Profiles table accessible. Found ${profileData?.length || 0} drivers.`);
      }
    } catch (err) {
      addTestResult(`❌ Database connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">GPS Tracking System Test</h1>
        <p className="text-lg text-gray-600">
          Test the mobile GPS tracking system step by step
        </p>
      </div>

      {/* Driver Selection */}
      {profile?.role !== 'driver' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Select Driver for Testing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driversLoading ? (
              <p>Loading drivers...</p>
            ) : drivers && drivers.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => setSelectedDriverId(driver.id)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedDriverId === driver.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">
                        {driver.first_name} {driver.last_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {driver.id.slice(0, 8)}...
                      </div>
                      <div className="text-sm text-gray-600">
                        Role: {driver.role}
                      </div>
                    </button>
                  ))}
                </div>
                {selectedDriverId && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Selected driver: {drivers.find(d => d.id === selectedDriverId)?.first_name} {drivers.find(d => d.id === selectedDriverId)?.last_name}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No drivers found in your organization.</p>
                <p className="text-sm text-gray-400">Make sure there are profiles with role 'driver'.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current User Info (if driver) */}
      {profile?.role === 'driver' && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                Testing with your driver profile: {profile.first_name} {profile.last_name}
              </p>
              <p className="text-xs text-green-600">
                ID: {profile.id}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Display */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Tracking Status</div>
              <Badge variant={isTracking ? "default" : "secondary"}>
                {isTracking ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">GPS Permission</div>
              <Badge variant={permissionStatus === 'granted' ? "default" : "secondary"}>
                {permissionStatus || 'Unknown'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Loading</div>
              <Badge variant={isLoading ? "default" : "secondary"}>
                {isLoading ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Has Location</div>
              <Badge variant={currentLocation ? "default" : "secondary"}>
                {currentLocation ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          {currentLocation && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Current GPS Location</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Latitude:</span>
                  <span className="ml-2 font-mono">{currentLocation.latitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Longitude:</span>
                  <span className="ml-2 font-mono">{currentLocation.longitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Accuracy:</span>
                  <span className="ml-2">{currentLocation.accuracy.toFixed(1)}m</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Updated:</span>
                  <span className="ml-2">{new Date(currentLocation.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleStartTracking}
              disabled={isLoading || isTracking || !effectiveDriverId}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start GPS Tracking
            </Button>

            <Button
              onClick={handleStopTracking}
              disabled={isLoading || !isTracking}
              variant="destructive"
              size="lg"
            >
              <Pause className="w-5 h-5 mr-2" />
              Stop Tracking
            </Button>

            <Button
              onClick={handleRefreshLocation}
              disabled={isLoading}
              variant="outline"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Location
            </Button>

            <Button
              onClick={testDatabaseConnection}
              variant="outline"
              size="lg"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Test Database
            </Button>
          </div>

          {!effectiveDriverId && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">No Driver Selected</span>
              </div>
              <p className="text-yellow-700 mt-1">
                {profile?.role === 'driver' 
                  ? 'Your profile role is not set as "driver"' 
                  : 'Please select a driver from the list above to test GPS tracking.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No test results yet. Start testing to see results here.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
          {testResults.length > 0 && (
            <div className="mt-4 text-center">
              <Button
                onClick={() => setTestResults([])}
                variant="outline"
                size="sm"
              >
                Clear Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <strong>1. Test Database:</strong> First click "Test Database" to verify the tracking tables exist
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <strong>2. Start Tracking:</strong> Click "Start GPS Tracking" to begin location monitoring
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <strong>3. Grant Permission:</strong> Allow location access when prompted by your browser
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <strong>4. Verify Location:</strong> Check if GPS coordinates appear in the status section
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <strong>5. Test Refresh:</strong> Use "Refresh Location" to get updated coordinates
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
