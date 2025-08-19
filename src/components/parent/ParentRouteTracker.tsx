
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ActiveRoute {
  id: string;
  status: string;
  assignment_date: string;
  start_time: string;
  end_time: string;
  route_name: string;
  start_location?: string;
  end_location?: string;
  driver_name: string;
  driver_phone?: string;
  vehicle_number: string;
  license_plate?: string;
}

const ParentRouteTracker = () => {
  const { user } = useAuth();
  
  const { data: activeRoutes, isLoading, error } = useQuery({
    queryKey: ['active-routes-tracking', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching active routes for tracking');
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch active route assignments for today with separate queries
      const { data: routeAssignments, error: routeError } = await supabase
        .from('route_assignments')
        .select('*')
        .eq('assignment_date', today)
        .eq('status', 'active')
        .eq('is_active', true);

      if (routeError) {
        console.error('Error fetching route assignments:', routeError);
        throw routeError;
      }

      // Fetch related data separately
      const combinedRoutes: ActiveRoute[] = [];

      if (routeAssignments && routeAssignments.length > 0) {
        for (const assignment of routeAssignments) {
          // Get route details
          const { data: routeData } = await supabase
            .from('routes')
            .select('name, start_location, end_location')
            .eq('id', assignment.route_id)
            .single();

          // Get driver details
          const { data: driverData } = await supabase
            .from('profiles')
            .select('first_name, last_name, phone')
            .eq('id', assignment.driver_id)
            .single();

          // Get vehicle details
          const { data: vehicleData } = await supabase
            .from('vehicles')
            .select('vehicle_number, license_plate')
            .eq('id', assignment.vehicle_id)
            .single();

          if (routeData && driverData && vehicleData) {
            combinedRoutes.push({
              id: assignment.id,
              status: assignment.status || 'active',
              assignment_date: assignment.assignment_date,
              start_time: assignment.start_time || 'N/A',
              end_time: assignment.end_time || 'N/A',
              route_name: routeData.name,
              start_location: routeData.start_location,
              end_location: routeData.end_location,
              driver_name: `${driverData.first_name || 'Unknown'} ${driverData.last_name || 'Driver'}`,
              driver_phone: driverData.phone,
              vehicle_number: vehicleData.vehicle_number,
              license_plate: vehicleData.license_plate
            });
          }
        }
      }

      console.log('Active routes found:', combinedRoutes.length);
      return combinedRoutes;
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-500" />
            <span>Live Route Tracking</span>
          </CardTitle>
          <CardDescription>Currently active transport routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading active routes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <span>Live Route Tracking</span>
          </CardTitle>
          <CardDescription>Currently active transport routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Error loading routes</p>
            <p className="text-gray-600 text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-green-500" />
          <span>Live Route Tracking</span>
        </CardTitle>
        <CardDescription>Currently active transport routes</CardDescription>
      </CardHeader>
      <CardContent>
        {activeRoutes && activeRoutes.length > 0 ? (
          <div className="space-y-4">
            {activeRoutes.map((route) => (
              <div key={route.id} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{route.route_name}</h4>
                  <Badge className="bg-green-500 text-white">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Route</p>
                      <p className="text-gray-600 text-sm">
                        {route.start_location} → {route.end_location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Time</p>
                      <p className="text-gray-600 text-sm">
                        {route.start_time} - {route.end_time}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Driver:</span>
                      <span className="text-sm text-gray-600">{route.driver_name}</span>
                    </div>
                    {route.driver_phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{route.driver_phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Vehicle:</span>
                    <span className="text-sm text-gray-600">
                      {route.vehicle_number} ({route.license_plate})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Routes</h3>
            <p className="text-gray-600">There are currently no active transport routes.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParentRouteTracker;
