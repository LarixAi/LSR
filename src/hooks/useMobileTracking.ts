import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  mobileTrackingService, 
  GPSLocation, 
  DriverTrackingStatus,
  RouteProgress 
} from '@/services/mobileTrackingService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseMobileTrackingOptions {
  driverId?: string;
  routeId?: string;
  autoStart?: boolean;
  updateInterval?: number;
  enableBackground?: boolean;
  highAccuracy?: boolean;
}

interface UseMobileTrackingReturn {
  // Tracking state
  isTracking: boolean;
  isTrackingActive: boolean;
  currentLocation: GPSLocation | null;
  trackingStatus: DriverTrackingStatus | null;
  routeProgress: RouteProgress | null;
  
  // Tracking controls
  startTracking: () => Promise<boolean>;
  stopTracking: () => Promise<boolean>;
  refreshLocation: () => Promise<GPSLocation | null>;
  
  // Data
  activeDrivers: DriverTrackingStatus[];
  nearbyDrivers: DriverTrackingStatus[];
  
  // Status
  isLoading: boolean;
  error: string | null;
  permissionStatus: PermissionState | null;
  
  // Utility functions
  getDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  formatSpeed: (speed: number) => string;
  formatDistance: (distance: number) => string;
}

export const useMobileTracking = (options: UseMobileTrackingOptions = {}): UseMobileTrackingReturn => {
  const { user, profile } = useAuth();
  const {
    driverId = profile?.id, // Default to current user's profile ID if they're a driver
    routeId,
    autoStart = false,
    updateInterval = 10000,
    enableBackground = true,
    highAccuracy = true
  } = options;

  // State
  const [isTracking, setIsTracking] = useState(false);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<DriverTrackingStatus | null>(null);
  const [routeProgress, setRouteProgress] = useState<RouteProgress | null>(null);
  const [activeDrivers, setActiveDrivers] = useState<DriverTrackingStatus[]>([]);
  const [nearbyDrivers, setNearbyDrivers] = useState<DriverTrackingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);

  // Refs
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if tracking is active
  useEffect(() => {
    const checkTrackingStatus = () => {
      const active = mobileTrackingService.isTrackingActive();
      setIsTrackingActive(active);
      
      if (active && driverId) {
        setIsTracking(true);
      }
    };

    checkTrackingStatus();
    const interval = setInterval(checkTrackingStatus, 5000);
    
    return () => clearInterval(interval);
  }, [driverId]);

  // Auto-start tracking if enabled and user is a driver
  useEffect(() => {
    if (autoStart && driverId && profile?.role === 'driver' && !isTracking) {
      startTracking();
    }
  }, [autoStart, driverId, profile?.role, isTracking]);

  // Start tracking
  const startTracking = useCallback(async (): Promise<boolean> => {
    if (!driverId) {
      const errorMsg = 'Driver ID is required to start tracking';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    if (profile?.role !== 'driver' && !profile?.role?.includes('admin')) {
      const errorMsg = 'Only drivers can start GPS tracking';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const success = await mobileTrackingService.startTracking(driverId, {
        updateInterval,
        enableBackground,
        highAccuracy
      });

      if (success) {
        setIsTracking(true);
        
        // Start location updates
        locationIntervalRef.current = setInterval(async () => {
          const location = await mobileTrackingService.getCurrentLocation();
          if (location) {
            setCurrentLocation(location);
          }
        }, updateInterval);

        // Start status updates
        statusIntervalRef.current = setInterval(async () => {
          if (driverId) {
            const status = await mobileTrackingService.getDriverTrackingData(driverId);
            if (status) {
              setTrackingStatus(status);
            }

            if (routeId) {
              const progress = await mobileTrackingService.getRouteProgress(driverId, routeId);
              if (progress) {
                setRouteProgress(progress);
              }
            }
          }
        }, 30000); // Update status every 30 seconds

        // Get initial data
        const initialStatus = await mobileTrackingService.getDriverTrackingData(driverId);
        if (initialStatus) {
          setTrackingStatus(initialStatus);
        }

        if (routeId) {
          const initialProgress = await mobileTrackingService.getRouteProgress(driverId, routeId);
          if (initialProgress) {
            setRouteProgress(initialProgress);
          }
        }

        console.log('Tracking started successfully');
        toast.success('GPS tracking started successfully');
        return true;
      } else {
        const errorMsg = 'Failed to start tracking';
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to start tracking: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [driverId, routeId, updateInterval, enableBackground, highAccuracy, profile?.role]);

  // Stop tracking
  const stopTracking = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await mobileTrackingService.stopTracking();

      if (success) {
        setIsTracking(false);
        
        // Clear intervals
        if (locationIntervalRef.current) {
          clearInterval(locationIntervalRef.current);
          locationIntervalRef.current = null;
        }
        
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }

        console.log('Tracking stopped successfully');
        toast.success('GPS tracking stopped');
        return true;
      } else {
        const errorMsg = 'Failed to stop tracking';
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to stop tracking: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh current location
  const refreshLocation = useCallback(async (): Promise<GPSLocation | null> => {
    try {
      const location = await mobileTrackingService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        setError(null);
      }
      return location;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    }
  }, []);

  // Get active drivers
  useEffect(() => {
    const fetchActiveDrivers = async () => {
      try {
        const drivers = await mobileTrackingService.getActiveDrivers();
        setActiveDrivers(drivers);
      } catch (err) {
        console.error('Failed to fetch active drivers:', err);
      }
    };

    fetchActiveDrivers();
    const interval = setInterval(fetchActiveDrivers, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Get nearby drivers when current location changes
  useEffect(() => {
    if (!currentLocation) return;

    const fetchNearbyDrivers = async () => {
      try {
        // This would typically call a backend API to get nearby drivers
        // For now, we'll filter from active drivers
        const nearby = activeDrivers.filter(driver => {
          if (!driver.currentLocation) return false;
          
          const distance = getDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            driver.currentLocation.latitude,
            driver.currentLocation.longitude
          );
          
          return distance <= 10; // Within 10km
        });
        
        setNearbyDrivers(nearby);
      } catch (err) {
        console.error('Failed to fetch nearby drivers:', err);
      }
    };

    fetchNearbyDrivers();
  }, [currentLocation, activeDrivers]);

  // Check permission status
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          setPermissionStatus(permission.state);
          
          permission.onchange = () => {
            setPermissionStatus(permission.state);
          };
        }
      } catch (err) {
        console.error('Failed to check permission status:', err);
      }
    };

    checkPermission();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);

  // Utility functions
  const getDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const formatSpeed = useCallback((speed: number): string => {
    if (speed < 1) return '0 km/h';
    return `${Math.round(speed)} km/h`;
  }, []);

  const formatDistance = useCallback((distance: number): string => {
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  }, []);

  return {
    // Tracking state
    isTracking,
    isTrackingActive,
    currentLocation,
    trackingStatus,
    routeProgress,
    
    // Tracking controls
    startTracking,
    stopTracking,
    refreshLocation,
    
    // Data
    activeDrivers,
    nearbyDrivers,
    
    // Status
    isLoading,
    error,
    permissionStatus,
    
    // Utility functions
    getDistance,
    formatSpeed,
    formatDistance
  };
};
