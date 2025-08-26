import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useRoutes, useRouteStats } from '@/hooks/useRoutes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { 
  Route, 
  Plus, 
  MapPin, 
  Navigation,
  Clock,
  DollarSign,
  Users,
  Settings,
  Eye,
  Edit,
  Target
} from 'lucide-react';

interface RouteData {
  id: string;
  name: string;
  status: string;
  distance: string;
  passengers: number;
  revenue: number;
  efficiency: number;
}

const RoutePlanning: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [isCreateRouteDialogOpen, setIsCreateRouteDialogOpen] = useState<boolean>(false);
  
  // Fetch real data from backend
  const { data: routes = [], isLoading: routesLoading } = useRoutes();
  const routeStats = useRouteStats();

  if (loading || routesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading route planning...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins and council can access
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Transform real routes data for display compatibility
  const routesForDisplay: RouteData[] = routes.map(route => ({
    id: route.id,
    name: route.name || `${route.start_location} → ${route.end_location}`,
    status: route.status || 'active',
    distance: `${(route.distance || 0).toFixed(1)} km`,
    passengers: 0, // Not available in current schema
    revenue: 0, // Not available in current schema
    efficiency: 0 // Not available in current schema
  }));

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 75) return 'text-yellow-600';
    if (efficiency === 0) return 'text-gray-500';
    return 'text-red-600';
  };

  // Use real route stats from hook (already declared above)
  const routeStatsData = {
    totalRoutes: routeStats.total,
    activeRoutes: routeStats.active,
    totalPassengers: 0, // Not available in current schema
    totalRevenue: 0 // Not available in current schema
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Route className="w-8 h-8 text-blue-600" />
            Route Planning & Optimization
          </h1>
          <p className="text-gray-600 mt-1">Plan, optimize, and manage transport routes</p>
        </div>
        <Dialog open={isCreateRouteDialogOpen} onOpenChange={setIsCreateRouteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" aria-describedby="create-route-description">
            <DialogHeader>
              <DialogTitle>Create New Route</DialogTitle>
              <DialogDescription id="create-route-description">
                Add a new transport route to your fleet.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="route-name">Route Name</Label>
                <Input id="route-name" placeholder="Enter route name" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="route-type">Route Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school_transport">School Transport</SelectItem>
                      <SelectItem value="medical">Medical Transport</SelectItem>
                      <SelectItem value="charter">Charter Service</SelectItem>
                      <SelectItem value="regular">Regular Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max-passengers">Max Passengers</Label>
                  <Input id="max-passengers" type="number" placeholder="0" />
                </div>
              </div>

              <div>
                <Label htmlFor="start-location">Start Location</Label>
                <Input id="start-location" placeholder="Enter start address" />
              </div>

              <div>
                <Label htmlFor="end-location">End Location</Label>
                <Input id="end-location" placeholder="Enter end address" />
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Create Route
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Route className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Routes</p>
                <p className="text-2xl font-bold">{routeStatsData.totalRoutes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Navigation className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Routes</p>
                <p className="text-2xl font-bold text-green-600">{routeStatsData.activeRoutes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Passengers</p>
                <p className="text-2xl font-bold">{routeStatsData.totalPassengers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">£{routeStatsData.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            Route Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routesForDisplay.map((route) => (
              <div key={route.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{route.name}</h3>
                      {getStatusBadge(route.status)}
                      {route.efficiency > 0 && (
                        <Badge variant="outline" className={getEfficiencyColor(route.efficiency)}>
                          {route.efficiency}% Efficient
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Target className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Distance:</span>
                    <p className="font-medium">{route.distance}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Passengers:</span>
                    <p className="font-medium">{route.passengers}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Revenue:</span>
                    <p className="font-medium text-green-600">£{route.revenue.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Efficiency:</span>
                    <p className={`font-medium ${getEfficiencyColor(route.efficiency)}`}>
                      {route.efficiency > 0 ? `${route.efficiency}%` : 'Not optimized'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Navigation className="w-4 h-4 mr-1" />
                      Optimize
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoutePlanning;