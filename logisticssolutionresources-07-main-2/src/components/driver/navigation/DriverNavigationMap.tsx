
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, Users, Play, Pause, AlertCircle, MapIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Stop {
  id: string;
  address: string;
  students: any[];
  coordinates?: { lat: number; lng: number };
}

interface DriverNavigationMapProps {
  stops: Stop[];
  onStopReached: (stopId: string, students: any[]) => void;
  isNavigating: boolean;
  onStartNavigation: () => void;
  onPauseNavigation: () => void;
  currentStopIndex: number;
}

const DriverNavigationMap: React.FC<DriverNavigationMapProps> = ({
  stops,
  onStopReached,
  isNavigating,
  onStartNavigation,
  onPauseNavigation,
  currentStopIndex
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Check if Google Maps is available
    if (!window.google || !window.google.maps) {
      setLocationError('Google Maps is not loaded. Please check your internet connection.');
      return;
    }

    try {
      const newMap = new google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: -26.2041, lng: 28.0473 }, // Default to Johannesburg
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      const newDirectionsService = new google.maps.DirectionsService();
      const newDirectionsRenderer = new google.maps.DirectionsRenderer({
        draggable: false,
        panel: null,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
        markerOptions: {
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(32, 32),
          }
        }
      });

      newDirectionsRenderer.setMap(newMap);

      setMap(newMap);
      setDirectionsService(newDirectionsService);
      setDirectionsRenderer(newDirectionsRenderer);
      setIsMapLoaded(true);
      setLocationError(null);

      // Get user's current location
      getUserLocation();
    } catch (error) {
      console.error('Map initialization error:', error);
      setLocationError('Failed to initialize map. Please refresh the page.');
    }
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        if (map) {
          map.setCenter(location);
          
          // Add user location marker
          new google.maps.Marker({
            position: location,
            map: map,
            title: 'Your Location',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new google.maps.Size(32, 32),
            }
          });
        }
        setLocationError(null);
      },
      (error) => {
        let errorMessage = 'Unable to access your location.';
        
        if (error.code === 1) {
          errorMessage = 'Location access denied. Please enable location services in your browser settings.';
        } else if (error.code === 2) {
          errorMessage = 'Location unavailable. Please check your GPS settings.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }

        setLocationError(errorMessage);
        console.error('Location error:', error);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 60000 
      }
    );
  };

  // Start location tracking
  useEffect(() => {
    if (isNavigating && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          
          // Check if driver is near current stop
          if (currentStopIndex < stops.length) {
            const currentStop = stops[currentStopIndex];
            if (currentStop.coordinates) {
              const distance = calculateDistance(newLocation, currentStop.coordinates);
              if (distance < 100) { // 100 meters threshold
                onStopReached(currentStop.id, currentStop.students);
              }
            }
          }
        },
        (error) => {
          console.error('Location tracking error:', error);
          setLocationError('Unable to track your location continuously.');
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setWatchId(id);
    } else if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isNavigating, currentStopIndex, stops]);

  // Calculate route when navigation starts
  useEffect(() => {
    if (isNavigating && directionsService && directionsRenderer && userLocation && stops.length > 0) {
      calculateRoute();
    }
  }, [isNavigating, userLocation, currentStopIndex]);

  const calculateDistance = (pos1: google.maps.LatLngLiteral, pos2: google.maps.LatLngLiteral): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = pos1.lat * Math.PI/180;
    const φ2 = pos2.lat * Math.PI/180;
    const Δφ = (pos2.lat-pos1.lat) * Math.PI/180;
    const Δλ = (pos2.lng-pos1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const calculateRoute = async () => {
    if (!directionsService || !directionsRenderer || !userLocation) return;

    const remainingStops = stops.slice(currentStopIndex);
    if (remainingStops.length === 0) return;

    try {
      // For demo purposes, use addresses for geocoding
      const destination = remainingStops[0].address;
      
      const request: google.maps.DirectionsRequest = {
        origin: userLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Directions request failed:', status);
          toast({
            title: "Navigation Error",
            description: "Could not calculate route. Please check the address.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error('Route calculation error:', error);
    }
  };

  const handleRetryLocation = () => {
    setLocationError(null);
    getUserLocation();
  };

  const nextStop = currentStopIndex < stops.length ? stops[currentStopIndex] : null;

  if (locationError) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>Location Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Location Access Required</h3>
            <p className="text-gray-600 mb-4 max-w-md">{locationError}</p>
            <Button onClick={handleRetryLocation} className="bg-blue-600 hover:bg-blue-700">
              <MapIcon className="w-4 h-4 mr-2" />
              Enable Location Access
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            <span>Route Navigation</span>
          </div>
          <div className="flex space-x-2">
            {!isNavigating ? (
              <Button 
                onClick={onStartNavigation} 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                disabled={!isMapLoaded || !!locationError}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Navigation
              </Button>
            ) : (
              <Button onClick={onPauseNavigation} variant="outline" className="border-orange-200 hover:bg-orange-50">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-96">
        {!isMapLoaded && (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full rounded-b-lg" />
        
        {nextStop && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Next Stop</p>
                  <p className="text-sm text-gray-600">{nextStop.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">{nextStop.students.length} students</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverNavigationMap;
