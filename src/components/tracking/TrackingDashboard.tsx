import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Car, 
  User, 
  Navigation, 
  Clock, 
  MapPin, 
  Signal, 
  Battery,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useMobileTracking } from '@/hooks/useMobileTracking';
import { useAuth } from '@/contexts/AuthContext';

interface TrackingDashboardProps {
  className?: string;
}

export const TrackingDashboard: React.FC<TrackingDashboardProps> = ({ className = '' }) => {
  const { profile } = useAuth();
  const {
    activeDrivers,
    nearbyDrivers,
    isLoading,
    error
  } = useMobileTracking({
    // Only auto-track if user is a driver
    autoStart: profile?.role === 'driver',
    driverId: profile?.role === 'driver' ? profile.id : undefined
  });

  const totalDrivers = activeDrivers.length;
  const onlineDrivers = activeDrivers.filter(d => d.isTracking).length;
  const offlineDrivers = totalDrivers - onlineDrivers;
  const nearbyCount = nearbyDrivers.length;

  // Calculate average response time (mock data for now)
  const avgResponseTime = '2.3s';
  const systemHealth = 'Excellent';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tracking Dashboard</h2>
          <p className="text-gray-600">Real-time monitoring of all active vehicles and drivers</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isLoading ? 'Updating...' : 'Live'}
          </span>
        </div>
      </div>

      {/* User Role Information */}
      {profile?.role === 'driver' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Driver Mode</span>
          </div>
          <p className="text-blue-700 mt-1">
            You are logged in as a driver. Your GPS tracking may start automatically.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Tracking Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{onlineDrivers}</div>
            <p className="text-xs text-muted-foreground">
              {totalDrivers} total drivers
            </p>
            <Progress value={(onlineDrivers / Math.max(totalDrivers, 1)) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles Tracked</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeDrivers.filter(d => d.vehicleId).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {nearbyCount} nearby
            </p>
            <Progress 
              value={(activeDrivers.filter(d => d.vehicleId).length / Math.max(totalDrivers, 1)) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              GPS update frequency
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">+12% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{systemHealth}</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">100% uptime</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Driver Status Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Online Drivers */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Online Drivers</p>
                  <p className="text-sm text-green-700">
                    {onlineDrivers} drivers actively tracking
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {onlineDrivers}
              </Badge>
            </div>

            {/* Offline Drivers */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Offline Drivers</p>
                  <p className="text-sm text-gray-700">
                    {offlineDrivers} drivers not tracking
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{offlineDrivers}</Badge>
            </div>

            {/* Nearby Drivers */}
            {nearbyCount > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Nearby Drivers</p>
                    <p className="text-sm text-blue-700">
                      {nearbyCount} drivers within 10km radius
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  {nearbyCount}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Signal className="h-5 w-5" />
            <span>Network & Device Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeDrivers.length > 0 ? (
              activeDrivers.slice(0, 3).map((driver, index) => (
                <div key={driver.driverId} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Driver {index + 1}</span>
                    <Badge 
                      variant={driver.networkStatus === 'excellent' ? 'default' : 'secondary'}
                      className={`
                        ${driver.networkStatus === 'excellent' ? 'bg-green-100 text-green-800' : ''}
                        ${driver.networkStatus === 'good' ? 'bg-blue-100 text-blue-800' : ''}
                        ${driver.networkStatus === 'fair' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${driver.networkStatus === 'poor' ? 'bg-red-100 text-red-800' : ''}
                      `}
                    >
                      {driver.networkStatus}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Battery:</span>
                      <span className="font-medium">{Math.round(driver.batteryLevel * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Update:</span>
                      <span className="font-medium">
                        {new Date(driver.lastUpdate).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No active drivers found.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Drivers need to start GPS tracking to appear here.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Navigation className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Start All Tracking</p>
                  <p className="text-sm text-gray-600">Enable GPS for all drivers</p>
                </div>
              </div>
            </button>

            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">View Map</p>
                  <p className="text-sm text-gray-600">Open full tracking map</p>
                </div>
              </div>
            </button>

            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-gray-600">View tracking reports</p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
