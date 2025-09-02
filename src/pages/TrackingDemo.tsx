import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveTrackingMap } from '@/components/tracking/LiveTrackingMap';
import { TrackingDashboard } from '@/components/tracking/TrackingDashboard';
import { useMobileTracking } from '@/hooks/useMobileTracking';
import { 
  MapPin, 
  Navigation, 
  Car, 
  User, 
  Clock, 
  Battery, 
  Signal, 
  Play, 
  Pause, 
  Square, 
  RefreshCw,
  Smartphone,
  Wifi,
  Satellite
} from 'lucide-react';

export default function TrackingDemo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [demoDriverId] = useState('demo-driver-001');

  // Use the tracking hook
  const {
    isTracking,
    isTrackingActive,
    currentLocation,
    trackingStatus,
    startTracking,
    stopTracking,
    refreshLocation,
    isLoading,
    error,
    permissionStatus
  } = useMobileTracking({
    driverId: demoDriverId,
    autoStart: false,
    updateInterval: 5000
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Satellite className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Mobile GPS Tracking Demo</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Experience real-time GPS tracking using your mobile device's location services. 
          This demo showcases mobile-first tracking capabilities for fleet management.
        </p>
        
        {/* Demo Status */}
        <div className="flex items-center justify-center space-x-4">
          <Badge variant={isTracking ? "default" : "secondary"} className="text-sm">
            {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
          </Badge>
          <Badge variant="outline" className="text-sm">
            GPS: {permissionStatus === 'granted' ? 'Granted' : permissionStatus || 'Unknown'}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Device: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
          </Badge>
        </div>
      </div>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Demo Controls
          </CardTitle>
          <CardDescription>
            Control the tracking demo and see real-time GPS data from your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => startTracking()}
              disabled={isLoading || isTracking}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start GPS Tracking
            </Button>

            <Button
              onClick={() => stopTracking()}
              disabled={isLoading || !isTracking}
              variant="destructive"
              size="lg"
            >
              <Pause className="w-5 h-5 mr-2" />
              Stop Tracking
            </Button>

            <Button
              onClick={() => refreshLocation()}
              disabled={isLoading}
              variant="outline"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Location
            </Button>
          </div>

          {/* Current Status */}
          {currentLocation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Current GPS Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Latitude:</span>
                  <span className="ml-2 font-mono">{currentLocation.latitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="font-medium">Longitude:</span>
                  <span className="ml-2 font-mono">{currentLocation.longitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="font-medium">Accuracy:</span>
                  <span className="ml-2">{currentLocation.accuracy.toFixed(1)}m</span>
                </div>
                {currentLocation.speed && (
                  <div>
                    <span className="font-medium">Speed:</span>
                    <span className="ml-2">{currentLocation.speed.toFixed(1)} m/s</span>
                  </div>
                )}
                {currentLocation.heading && (
                  <div>
                    <span className="font-medium">Heading:</span>
                    <span className="ml-2">{currentLocation.heading.toFixed(1)}°</span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Updated:</span>
                  <span className="ml-2">{new Date(currentLocation.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Signal className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Tracking Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-4 flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Processing GPS data...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="map">Live Map</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <TrackingDashboard />
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Live GPS Tracking Map
              </CardTitle>
              <CardDescription>
                Interactive map showing real-time location data from your device
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LiveTrackingMap 
                driverId={demoDriverId}
                className="w-full"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mobile-First Design */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  Mobile-First Design
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Built specifically for mobile devices with GPS capabilities, ensuring 
                  optimal performance on smartphones and tablets.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    GPS location services
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    Battery optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    Network efficiency
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Real-Time Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-green-600" />
                  Real-Time Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Live location updates with configurable intervals and real-time 
                  synchronization across all connected devices.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Configurable update intervals
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Live synchronization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Offline support
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Fleet Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-purple-600" />
                  Fleet Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive fleet tracking with driver management, route optimization, 
                  and performance analytics.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    Driver tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    Route optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    Performance analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Signal className="w-5 h-5 text-orange-600" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Enterprise-grade security with data encryption, user permissions, 
                  and compliance with privacy regulations.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    Data encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    User permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    GDPR compliance
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>
          This demo showcases the mobile GPS tracking capabilities of our logistics solution. 
          For production use, additional security measures and compliance features are implemented.
        </p>
      </div>
    </div>
  );
}
