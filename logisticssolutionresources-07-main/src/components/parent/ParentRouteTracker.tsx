import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ParentRouteTracker = () => {
  const { data: activeRoutes, isLoading } = useQuery({
    queryKey: ['active-routes-tracking'],
    queryFn: async () => {
      try {
        // Fetch schedules with real data from database
        const { data: schedules, error } = await supabase
          .from('schedules')
          .select('id, status, start_date, created_at')
          .eq('status', 'active')
          .gte('start_date', new Date().toISOString().split('T')[0]);

        if (error) throw error;
        return schedules || [];
      } catch (error) {
        console.error('Route tracking error:', error);
        return [];
      }
    }
  });

  if (isLoading) {
    return <div className="text-center">Loading active routes...</div>;
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
            {activeRoutes.map((route: any) => (
              <div key={route.id} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">Active Route</h4>
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
                      <p className="font-medium text-sm">Status</p>
                      <p className="text-gray-600 text-sm">{route.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Created</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(route.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Connected to live database</p>
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