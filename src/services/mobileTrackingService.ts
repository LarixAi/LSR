import { supabase } from '@/integrations/supabase/client';

// GPS Location Interface
export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

// Driver Tracking Status
export interface DriverTrackingStatus {
  driverId: string;
  vehicleId?: string;
  routeId?: string;
  status: 'active' | 'break' | 'offline' | 'maintenance';
  currentLocation: GPSLocation;
  lastUpdate: string;
  batteryLevel: number;
  networkStatus: 'excellent' | 'good' | 'fair' | 'poor';
  isTracking: boolean;
}

// Vehicle Tracking Data
export interface VehicleTrackingData {
  vehicleId: string;
  driverId: string;
  routeId?: string;
  currentLocation: GPSLocation;
  vehicleStatus: {
    speed: number;
    fuelLevel?: number;
    engineStatus: 'running' | 'stopped' | 'maintenance';
    odometer: number;
    lastMaintenance: string;
  };
  driverBehavior: {
    harshBraking: number;
    harshAcceleration: number;
    harshCornering: number;
    idlingTime: number;
    speedingEvents: number;
  };
  lastUpdate: string;
}

// Route Progress Tracking
export interface RouteProgress {
  routeId: string;
  driverId: string;
  vehicleId: string;
  startTime: string;
  estimatedEndTime: string;
  currentProgress: number; // 0-100
  completedStops: string[];
  remainingStops: string[];
  currentStop?: string;
  nextStop?: string;
  delays: number; // minutes
  fuelConsumption: number;
}

// Mobile Tracking Service Class
export class MobileTrackingService {
  private static instance: MobileTrackingService;
  private trackingInterval: NodeJS.Timeout | null = null;
  private isTracking = false;
  private currentDriverId: string | null = null;

  // Singleton pattern
  public static getInstance(): MobileTrackingService {
    if (!MobileTrackingService.instance) {
      MobileTrackingService.instance = new MobileTrackingService();
    }
    return MobileTrackingService.instance;
  }

  // UUID validation helper
  private isValidUuid(value: string | null | undefined): boolean {
    if (!value) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  // Start GPS tracking for a driver
  public async startTracking(driverId: string, options: {
    updateInterval?: number; // milliseconds
    enableBackground?: boolean;
    highAccuracy?: boolean;
  } = {}): Promise<boolean> {
    try {
      const {
        updateInterval = 10000, // 10 seconds default
        enableBackground = true,
        highAccuracy = true
      } = options;

      // Check if GPS is available
      if (!navigator.geolocation) {
        throw new Error('GPS not available on this device');
      }

      // Check location permissions
      const permission = await this.requestLocationPermission();
      if (permission === 'denied') {
        throw new Error('Location permission denied. Please enable location access in your browser settings.');
      }
      
      // If permission is 'prompt', we'll try to get location anyway
      // This will trigger the browser's permission prompt

      this.currentDriverId = driverId;
      this.isTracking = true;

      // Start tracking interval
      this.trackingInterval = setInterval(async () => {
        await this.updateDriverLocation(driverId);
      }, updateInterval);

      // Initial location update (only if UUID)
      if (this.isValidUuid(driverId)) {
        await this.updateDriverLocation(driverId);
      }

      // Update tracking status in database
      if (this.isValidUuid(driverId)) {
        await this.updateTrackingStatus(driverId, true);
      }

      console.log(`GPS tracking started for driver ${driverId}`);
      return true;

    } catch (error) {
      console.error('Failed to start GPS tracking:', error);
      return false;
    }
  }

  // Stop GPS tracking
  public async stopTracking(): Promise<boolean> {
    try {
      if (this.trackingInterval) {
        clearInterval(this.trackingInterval);
        this.trackingInterval = null;
      }

      this.isTracking = false;

      if (this.currentDriverId) {
        // Update tracking status in database
        await this.updateTrackingStatus(this.currentDriverId, false);
        this.currentDriverId = null;
      }

      console.log('GPS tracking stopped');
      return true;

    } catch (error) {
      console.error('Failed to stop GPS tracking:', error);
      return false;
    }
  }

  // Get current driver location
  public async getCurrentLocation(): Promise<GPSLocation | null> {
    try {
      // Block on insecure origins with clearer message
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        throw new Error('Geolocation requires HTTPS. Open the app over https:// (not http://).');
      }

      return new Promise((resolve, reject) => {
        const options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: GPSLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude || undefined,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined,
              timestamp: new Date(position.timestamp).toISOString()
            };
            resolve(location);
          },
          (error) => {
            reject(new Error(`GPS error: ${error.message}`));
          },
          options
        );
      });
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  // Update driver location in database
  private async updateDriverLocation(driverId: string): Promise<void> {
    try {
      if (!this.isValidUuid(driverId)) {
        console.warn('Skipping location update: driverId is not a valid UUID');
        return;
      }
      const location = await this.getCurrentLocation();
      if (!location) return;

      // Get device information
      const deviceInfo = await this.getDeviceInfo();

      // Update location in database (align with existing column names)
      const { error } = await supabase
        .from('driver_locations')
        .insert({
          driver_id: driverId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy_meters: location.accuracy ?? null,
          altitude_meters: location.altitude ?? null,
          heading_degrees: location.heading ?? null,
          speed_kmh: location.speed ? location.speed * 3.6 : null, // m/s -> km/h
          recorded_at: location.timestamp
        });

      if (error) {
        console.error('Failed to update driver location:', error);
      }

    } catch (error) {
      console.error('Failed to update driver location:', error);
    }
  }

  // Update tracking status in database
  private async updateTrackingStatus(driverId: string, isTracking: boolean): Promise<void> {
    try {
      if (!this.isValidUuid(driverId)) {
        console.warn('Skipping tracking status update: driverId is not a valid UUID');
        return;
      }
      const { error } = await supabase
        .from('driver_tracking_status')
        .upsert({
          driver_id: driverId,
          is_tracking: isTracking,
          last_update: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to update tracking status:', error);
      }

    } catch (error) {
      console.error('Failed to update tracking status:', error);
    }
  }

  // Request location permission
  private async requestLocationPermission(): Promise<PermissionState> {
    try {
      // First, try to get current permission status
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          return permission.state;
        } catch (permError) {
          console.log('Permissions API not supported, will request location directly');
        }
      }
      
      // If permissions API is not available or fails, we'll request location directly
      // This will trigger the browser's permission prompt
      return 'prompt';
    } catch (error) {
      console.error('Failed to request location permission:', error);
      return 'prompt';
    }
  }

  // Get device information
  private async getDeviceInfo(): Promise<any> {
    try {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        batteryLevel: await this.getBatteryLevel(),
        networkType: await this.getNetworkType(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get device info:', error);
      return {};
    }
  }

  // Get battery level
  private async getBatteryLevel(): Promise<number | null> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return battery.level;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Get network type
  private async getNetworkType(): Promise<string | null> {
    try {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        return connection.effectiveType || connection.type;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Get real-time tracking data for a driver
  public async getDriverTrackingData(driverId: string): Promise<DriverTrackingStatus | null> {
    try {
      if (!this.isValidUuid(driverId)) {
        return null;
      }
      const { data, error } = await supabase
        .from('driver_locations')
        .select('*')
        .eq('driver_id', driverId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      // Get tracking status
      const { data: statusData } = await supabase
        .from('driver_tracking_status')
        .select('*')
        .eq('driver_id', driverId)
        .single();

      const location: GPSLocation = {
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        accuracy: data.accuracy_meters != null ? Number(data.accuracy_meters) : 0,
        altitude: data.altitude_meters != null ? Number(data.altitude_meters) : undefined,
        heading: data.heading_degrees != null ? Number(data.heading_degrees) : undefined,
        speed: data.speed_kmh != null ? Number(data.speed_kmh) : undefined,
        timestamp: data.recorded_at
      };

      return {
        driverId,
        vehicleId: data.vehicle_id || undefined,
        routeId: data.route_id || undefined,
        status: statusData?.status || 'offline',
        currentLocation: location,
        lastUpdate: data.updated_at,
        batteryLevel: await this.getBatteryLevel() || 0,
        networkStatus: await this.getNetworkQuality(),
        isTracking: statusData?.is_tracking || false
      };

    } catch (error) {
      console.error('Failed to get driver tracking data:', error);
      return null;
    }
  }

  // Get network quality
  private async getNetworkQuality(): Promise<'excellent' | 'good' | 'fair' | 'poor'> {
    try {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection.effectiveType;
        
        switch (effectiveType) {
          case '4g':
            return 'excellent';
          case '3g':
            return 'good';
          case '2g':
            return 'fair';
          default:
            return 'poor';
        }
      }
      return 'good'; // Default assumption
    } catch (error) {
      return 'good';
    }
  }

  // Get all active drivers
  public async getActiveDrivers(): Promise<DriverTrackingStatus[]> {
    try {
      const { data, error } = await supabase
        .from('driver_tracking_status')
        .select('*')
        .eq('is_tracking', true);

      if (error || !data) {
        return [];
      }

      // Get latest location for each active driver
      const activeDrivers: DriverTrackingStatus[] = [];
      
      for (const status of data) {
        const trackingData = await this.getDriverTrackingData(status.driver_id);
        if (trackingData) {
          activeDrivers.push(trackingData);
        }
      }

      return activeDrivers;

    } catch (error) {
      console.error('Failed to get active drivers:', error);
      return [];
    }
  }

  // Get route progress for a driver
  public async getRouteProgress(driverId: string, routeId: string): Promise<RouteProgress | null> {
    try {
      if (!this.isValidUuid(driverId) || !this.isValidUuid(routeId)) {
        return null;
      }
      const { data, error } = await supabase
        .from('route_progress')
        .select('*')
        .eq('driver_id', driverId)
        .eq('route_id', routeId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        routeId: data.route_id,
        driverId: data.driver_id,
        vehicleId: data.vehicle_id,
        startTime: data.start_time,
        estimatedEndTime: data.estimated_end_time,
        currentProgress: data.current_progress,
        completedStops: data.completed_stops || [],
        remainingStops: data.remaining_stops || [],
        currentStop: data.current_stop,
        nextStop: data.next_stop,
        delays: data.delays || 0,
        fuelConsumption: data.fuel_consumption || 0
      };

    } catch (error) {
      console.error('Failed to get route progress:', error);
      return null;
    }
  }

  // Check if tracking is active
  public isTrackingActive(): boolean {
    return this.isTracking;
  }

  // Get current driver ID
  public getCurrentDriverId(): string | null {
    return this.currentDriverId;
  }
}

// Export singleton instance
export const mobileTrackingService = MobileTrackingService.getInstance();

// Utility functions for external use
export const startDriverTracking = (driverId: string, options?: any) => 
  mobileTrackingService.startTracking(driverId, options);

export const stopDriverTracking = () => 
  mobileTrackingService.stopTracking();

export const getDriverLocation = () => 
  mobileTrackingService.getCurrentLocation();

export const getActiveDrivers = () => 
  mobileTrackingService.getActiveDrivers();
