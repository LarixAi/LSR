import React, { useState, useEffect, useRef } from 'react';
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
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMobileTracking } from '@/hooks/useMobileTracking';
import { GPSLocation, DriverTrackingStatus } from '@/services/mobileTrackingService';

interface LiveTrackingMapProps {
  driverId?: string;
  routeId?: string;
  className?: string;
}

interface MapMarker {
  id: string;
  type: 'driver' | 'vehicle' | 'stop';
  location: GPSLocation;
  label: string;
  status: string;
  color: string;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  driverId,
  routeId,
  className = ''
}) => {
  // State
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mapZoom, setMapZoom] = useState(12);
  const [showLayer, setShowLayer] = useState<'tracking' | 'routes' | 'stops'>('tracking');
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapCenter, setMapCenter] = useState<GPSLocation>({
    latitude: 51.5074,
    longitude: -0.1278,
    accuracy: 0,
    timestamp: new Date().toISOString()
  });

  // Tracking hook
  const {
    isTracking,
    isTrackingActive,
    currentLocation,
    trackingStatus,
    routeProgress,
    activeDrivers,
    nearbyDrivers,
    startTracking,
    stopTracking,
    refreshLocation,
    isLoading,
    error,
    permissionStatus,
    formatSpeed,
    formatDistance
  } = useMobileTracking({
    driverId,
    routeId,
    autoStart: false,
    updateInterval: 5000,
    enableBackground: true,
    highAccuracy: true
  });

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Update map center when current location changes
  useEffect(() => {
    if (currentLocation) {
      setMapCenter(currentLocation);
    }
  }, [currentLocation]);

  // Generate map markers
  const generateMarkers = (): MapMarker[] => {
    const markers: MapMarker[] = [];

    // Current driver marker
    if (currentLocation && driverId) {
      markers.push({
        id: 'current-driver',
        type: 'driver',
        location: currentLocation,
        label: 'You',
        status: isTracking ? 'active' : 'inactive',
        color: isTracking ? '#10B981' : '#6B7280'
      });
    }

    // Active drivers markers
    activeDrivers.forEach((driver, index) => {
      if (driver.currentLocation && driver.driverId !== driverId) {
        markers.push({
          id: `driver-${driver.driverId}`,
          type: 'driver',
          location: driver.currentLocation,
          label: `Driver ${index + 1}`,
          status: driver.status,
          color: driver.status === 'active' ? '#3B82F6' : '#F59E0B'
        });
      }
    });

    // Route stops markers (if route is active)
    if (routeProgress && routeProgress.currentStop) {
      // This would typically come from route data
      // For now, we'll create mock stops around the current location
      const mockStops = [
        { name: 'Current Stop', offset: { lat: 0.001, lng: 0.001 } },
        { name: 'Next Stop', offset: { lat: 0.002, lng: 0.002 } }
      ];

      mockStops.forEach((stop, index) => {
        markers.push({
          id: `stop-${index}`,
          type: 'stop',
          location: {
            latitude: currentLocation ? currentLocation.latitude + stop.offset.lat : mapCenter.latitude,
            longitude: currentLocation ? currentLocation.longitude + stop.offset.lng : mapCenter.longitude,
            accuracy: 0,
            timestamp: new Date().toISOString()
          },
          label: stop.name,
          status: 'pending',
          color: '#EF4444'
        });
      });
    }

    return markers;
  };

  // Map controls
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1));
  };

  const resetMapView = () => {
    if (currentLocation) {
      setMapCenter(currentLocation);
      setMapZoom(12);
    }
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
  };

  // Tracking controls
  const handleStartTracking = async () => {
    if (driverId) {
      await startTracking();
    }
  };

  const handleStopTracking = async () => {
    await stopTracking();
  };

  const handleRefreshLocation = async () => {
    await refreshLocation();
  };

  // Generate markers
  const markers = generateMarkers();

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapContainerRef}
        className={`
          relative bg-gradient-to-br from-blue-50 to-indigo-100 
          border border-gray-200 rounded-lg overflow-hidden
          ${isFullScreen ? 'fixed inset-0 z-50' : 'h-[600px]'}
        `}
      >
        {/* Map Placeholder with Enhanced UI */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="flex justify-center space-x-2">
                <MapPin className="h-8 w-8 text-blue-600" />
                <Navigation className="h-8 w-8 text-green-600" />
                <Car className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Live GPS Tracking Map
              </h3>
              <p className="text-gray-600 max-w-md">
                Real-time vehicle and driver tracking with GPS coordinates, 
                route optimization, and live status updates
              </p>
            </div>

            {/* Map Legend */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 max-w-sm mx-auto">
              <h4 className="font-medium text-gray-800 mb-3">Map Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Live Tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Route Path</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Stops</span>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center">
                <Car className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h5 className="font-medium text-sm">Vehicle Tracking</h5>
                <p className="text-xs text-gray-600">Real-time GPS coordinates</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center">
                <Navigation className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <h5 className="font-medium text-sm">Route Planning</h5>
                <p className="text-xs text-gray-600">Optimized navigation</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center">
                <Layers className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <h5 className="font-medium text-sm">Multi-Layer</h5>
                <p className="text-xs text-gray-600">Advanced mapping</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullScreen}
            className="bg-white/90 hover:bg-white"
          >
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomIn}
            className="bg-white/90 hover:bg-white"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomOut}
            className="bg-white/90 hover:bg-white"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={resetMapView}
            className="bg-white/90 hover:bg-white"
          >
            <Compass className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom Level Display */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-sm font-medium">Zoom: {mapZoom}x</span>
        </div>

        {/* Layer Toggle */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
            <div className="flex space-x-1">
              {(['tracking', 'routes', 'stops'] as const).map((layer) => (
                <Button
                  key={layer}
                  size="sm"
                  variant={showLayer === layer ? "default" : "ghost"}
                  onClick={() => setShowLayer(layer)}
                  className="text-xs px-2 py-1 h-8"
                >
                  {layer.charAt(0).toUpperCase() + layer.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* GPS Markers Overlay */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${50 + (marker.location.longitude - mapCenter.longitude) * 100000}%`,
              top: `${50 - (marker.location.latitude - mapCenter.latitude) * 100000}%`
            }}
            onClick={() => handleMarkerClick(marker)}
          >
            <div className="relative">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: marker.color }}
              />
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium whitespace-nowrap">
                  {marker.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tracking Controls Panel */}
      <div className="mt-4 space-y-4">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Signal className="h-4 w-4" />
                <span>Tracking Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={isTracking ? "default" : "secondary"}>
                  {isTracking ? 'Active' : 'Inactive'}
                </Badge>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Permission</p>
                  <p className="text-sm font-medium">
                    {permissionStatus === 'granted' ? 'Granted' : 
                     permissionStatus === 'denied' ? 'Denied' : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Last Update</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {currentLocation ? 
                    new Date(currentLocation.timestamp).toLocaleTimeString() : 
                    'Never'
                  }
                </p>
                <p className="text-xs text-gray-600">
                  {currentLocation ? 
                    `${currentLocation.accuracy.toFixed(1)}m accuracy` : 
                    'No location data'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Active Drivers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {activeDrivers.length}
                </p>
                <p className="text-xs text-gray-600">
                  {nearbyDrivers.length} nearby
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            onClick={handleStartTracking}
            disabled={isLoading || isTracking || !driverId}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Tracking
          </Button>

          <Button
            onClick={handleStopTracking}
            disabled={isLoading || !isTracking}
            variant="destructive"
          >
            <Pause className="h-4 w-4 mr-2" />
            Stop Tracking
          </Button>

          <Button
            onClick={handleRefreshLocation}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Location
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Processing...</span>
          </div>
        )}
      </div>

      {/* Marker Details Modal */}
      {selectedMarker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedMarker.label}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMarker(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{selectedMarker.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant="outline">{selectedMarker.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Latitude:</span>
                <span className="font-mono text-sm">{selectedMarker.location.latitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Longitude:</span>
                <span className="font-mono text-sm">{selectedMarker.location.longitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-medium">{selectedMarker.location.accuracy.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated:</span>
                <span className="text-sm">
                  {new Date(selectedMarker.location.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
