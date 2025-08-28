import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Navigation, Clock, Truck, User, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function RealTimeTracking() {
  const { profile } = useAuth();
  const [selectedTab, setSelectedTab] = useState("active");

  // Fetch driver locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['driver-locations', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data: locationData, error } = await supabase
        .from('driver_locations')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!locationData?.length) return [];

      // Get driver and vehicle details separately
      const driverIds = [...new Set(locationData.map(loc => loc.driver_id))];
      const vehicleIds = [...new Set(locationData.map(loc => loc.vehicle_id).filter(Boolean))];
      
      const [driversData, vehiclesData] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', driverIds),
        vehicleIds.length > 0 ? supabase
          .from('vehicles')
          .select('id, vehicle_number, make, model, license_plate')
          .in('id', vehicleIds) : Promise.resolve({ data: [] })
      ]);

      const driverMap = new Map(driversData.data?.map(d => [d.id, d] as const) || []);
      const vehicleMap = new Map(vehiclesData.data?.map(v => [v.id, v] as const) || []);

      return locationData.map(location => ({
        ...location,
        profiles: driverMap.get(location.driver_id),
        vehicles: vehicleMap.get(location.vehicle_id)
      }));
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch child tracking data
  const { data: childTracking = [] } = useQuery({
    queryKey: ['child-tracking', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('child_tracking')
        .select(`
          *,
          child_profiles:child_id (
            first_name,
            last_name
          ),
          profiles:driver_id (
            first_name,
            last_name
          ),
          vehicles:vehicle_id (
            vehicle_number,
            make,
            model
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching child tracking:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 30000
  });

  // Get unique active drivers from recent locations (last 5 minutes)
  const activeDrivers = locations.filter(loc => {
    const locationTime = new Date(loc.recorded_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return locationTime > fiveMinutesAgo;
  }).reduce((unique, loc) => {
    if (!unique.find(u => u.driver_id === loc.driver_id)) {
      unique.push(loc);
    }
    return unique;
  }, [] as typeof locations);

  const getEventBadge = (eventType: string) => {
    const eventMap = {
      pickup: { label: 'Pickup', variant: 'default' as const },
      dropoff: { label: 'Drop-off', variant: 'secondary' as const },
      transit: { label: 'In Transit', variant: 'outline' as const },
      arrived: { label: 'Arrived', variant: 'destructive' as const },
    };
    
    const config = eventMap[eventType as keyof typeof eventMap] || { label: eventType, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real Time Tracking</h1>
          <p className="text-muted-foreground">
            Monitor vehicle locations and child transportation in real-time
          </p>
        </div>
        <Button variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Live View
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Drivers</p>
                <p className="text-2xl font-bold">{activeDrivers.length}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tracked Vehicles</p>
                <p className="text-2xl font-bold">{new Set(locations.map(l => l.vehicle_id)).size}</p>
              </div>
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Events</p>
                <p className="text-2xl font-bold">{childTracking.length}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location Updates</p>
                <p className="text-2xl font-bold">{locations.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Drivers</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="locations">All Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currently Active Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              {activeDrivers.length === 0 ? (
                <div className="text-center py-8">
                  <Navigation className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active drivers</h3>
                  <p className="text-muted-foreground">
                    Driver locations will appear here when they're actively reporting their position.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeDrivers.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Navigation className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {location.profiles?.first_name} {location.profiles?.last_name}
                            </span>
                            <Badge variant="outline" className="bg-green-50 text-green-700">Live</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {location.vehicles?.vehicle_number} - {location.vehicles?.make} {location.vehicles?.model}
                            </span>
                            {location.speed_kmh && (
                              <span>{location.speed_kmh.toFixed(0)} km/h</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(location.recorded_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tracking Events</CardTitle>
            </CardHeader>
            <CardContent>
              {childTracking.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recent events</h3>
                  <p className="text-muted-foreground">child tracking events will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {childTracking.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {(event as any)?.child_profiles?.first_name || 'Unknown'} {(event as any)?.child_profiles?.last_name || 'Child'}
                            </span>
                            {getEventBadge(event.event_type)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Driver: {(event as any)?.profiles?.first_name || 'Unknown'} {(event as any)?.profiles?.last_name || 'Driver'}
                          </div>
                          {event.location_address && (
                            <div className="text-sm text-muted-foreground">
                              Location: {event.location_address}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{new Date(event.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Location Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {locations.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No location data</h3>
                  <p className="text-muted-foreground">Location updates will appear here when drivers start tracking.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-3 border rounded text-sm">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">
                            {location.profiles?.first_name} {location.profiles?.last_name}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                          </span>
                        </div>
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(location.recorded_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}