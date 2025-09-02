
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Plus, 
  Search, 
  Route, 
  Clock, 
  Navigation,
  TrendingUp,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Car,
  Users,
  Calendar,
  Satellite,
  Radio,
  Signal,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Play,
  Pause,
  Square,
  RefreshCw,
  Download,
  Settings,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Compass
} from 'lucide-react';
import { LiveTrackingMap } from '@/components/tracking/LiveTrackingMap';
import { TrackingDashboard } from '@/components/tracking/TrackingDashboard';
import StandardPageLayout, { 
  MetricCard,
  NavigationTab, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';

interface Route {
  id: string;
  name: string;
  description: string;
  start_location: string;
  end_location: string;
  estimated_duration: number;
  distance_km: number;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
  assigned_vehicle_id?: string;
  assigned_driver_id?: string;
  current_location?: {
    lat: number;
    lng: number;
    timestamp: string;
    speed: number;
    heading: number;
  };
}

interface TrackingData {
  route_id: string;
  vehicle_id: string;
  driver_id: string;
  current_location: {
    lat: number;
    lng: number;
    timestamp: string;
    speed: number;
    heading: number;
    accuracy: number;
  };
  status: 'en_route' | 'at_stop' | 'delayed' | 'completed' | 'offline';
  estimated_arrival: string;
  next_stop: string;
  progress_percentage: number;
  last_update: string;
}

export default function RoutePlanning() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('routes');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  // Tracking state is now managed by the tracking components
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [mapZoom, setMapZoom] = useState(12);

  // Mock data - replace with actual API calls
  const routes: Route[] = [
    {
      id: '1',
      name: 'London to Manchester Express',
      description: 'High-speed route between London and Manchester',
      start_location: 'London, UK',
      end_location: 'Manchester, UK',
      estimated_duration: 240,
      distance_km: 320,
      status: 'active',
      created_at: '2024-08-27T10:00:00Z',
      updated_at: '2024-08-27T10:00:00Z',
      assigned_vehicle_id: 'V001',
      assigned_driver_id: 'D001',
      current_location: {
        lat: 51.5074,
        lng: -0.1278,
        timestamp: new Date().toISOString(),
        speed: 65,
        heading: 315
      }
    },
    {
      id: '2',
      name: 'Birmingham to Leeds',
      description: 'Regular service route through the Midlands',
      start_location: 'Birmingham, UK',
      end_location: 'Leeds, UK',
      estimated_duration: 180,
      distance_km: 240,
      status: 'active',
      created_at: '2024-08-26T15:00:00Z',
      updated_at: '2024-08-26T15:00:00Z',
      assigned_vehicle_id: 'V002',
      assigned_driver_id: 'D002',
      current_location: {
        lat: 52.4862,
        lng: -1.8904,
        timestamp: new Date().toISOString(),
        speed: 45,
        heading: 45
      }
    },
    {
      id: '3',
      name: 'Liverpool to Sheffield',
      description: 'Cross-country route with multiple stops',
      start_location: 'Liverpool, UK',
      end_location: 'Sheffield, UK',
      estimated_duration: 150,
      distance_km: 200,
      status: 'maintenance',
      created_at: '2024-08-25T09:00:00Z',
      updated_at: '2024-08-27T14:00:00Z'
    }
  ];

  // Mock tracking data
  const trackingData: TrackingData[] = [
    {
      route_id: '1',
      vehicle_id: 'V001',
      driver_id: 'D001',
      current_location: {
        lat: 51.5074,
        lng: -0.1278,
        timestamp: new Date().toISOString(),
        speed: 65,
        heading: 315,
        accuracy: 5
      },
      status: 'en_route',
      estimated_arrival: '2024-08-27T14:00:00Z',
      next_stop: 'Birmingham Central',
      progress_percentage: 35,
      last_update: new Date().toISOString()
    },
    {
      route_id: '2',
      vehicle_id: 'V002',
      driver_id: 'D002',
      current_location: {
        lat: 52.4862,
        lng: -1.8904,
        timestamp: new Date().toISOString(),
        speed: 45,
        heading: 45,
        accuracy: 3
      },
      status: 'at_stop',
      estimated_arrival: '2024-08-27T16:30:00Z',
      next_stop: 'Leeds Station',
      progress_percentage: 60,
      last_update: new Date().toISOString()
    }
  ];

  // Calculate statistics
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter(route => route.status === 'active').length;
  const totalDistance = routes.reduce((sum, route) => sum + route.distance_km, 0);
  const averageDuration = routes.reduce((sum, route) => sum + route.estimated_duration, 0) / routes.length;
  const activeTracking = trackingData.filter(track => track.status === 'en_route').length;

  // Filter routes based on search and filters
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = searchTerm === '' || 
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.start_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.end_location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTrackingStatusBadge = (status: string) => {
    switch (status) {
      case 'en_route':
        return <Badge className="bg-blue-100 text-blue-800">En Route</Badge>;
      case 'at_stop':
        return <Badge className="bg-yellow-100 text-yellow-800">At Stop</Badge>;
      case 'delayed':
        return <Badge className="bg-red-100 text-red-800">Delayed</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'offline':
        return <Badge className="bg-gray-100 text-gray-800">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Tracking functions are now handled by the tracking components

  const toggleFullScreen = () => {
    setIsMapFullScreen(!isMapFullScreen);
  };

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1));
  };

  const resetMapView = () => {
    setMapZoom(12);
  };

  // StandardPageLayout configuration
  const navigationTabs: NavigationTab[] = [
    { value: "routes", label: "Routes" },
    { value: "tracking", label: "Live Tracking" },
    { value: "optimization", label: "Optimization" },
    { value: "analytics", label: "Analytics" }
  ];

  const primaryAction: ActionButton = {
    label: "Create Route",
    onClick: () => setShowCreateDialog(true),
    icon: <Plus className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
    {
      label: "Export Routes",
      onClick: () => console.log("Export routes clicked"),
      icon: <Download className="w-4 h-4" />,
      variant: "outline"
    },
    {
      label: "Settings",
      onClick: () => console.log("Settings clicked"),
      icon: <Settings className="w-4 h-4" />,
      variant: "outline"
    }
  ];

  const metricsCards: MetricCard[] = [
    {
      title: "Total Routes",
      value: totalRoutes.toString(),
      subtitle: "Fleet routes",
      icon: <Route className="w-5 h-5" />,
      bgColor: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      title: "Active Routes",
      value: activeRoutes.toString(),
      subtitle: `${Math.round((activeRoutes / totalRoutes) * 100)}% of fleet`,
      icon: <Navigation className="w-5 h-5" />,
      bgColor: "bg-green-100",
      color: "text-green-600"
    },
    {
      title: "Total Distance",
      value: `${totalDistance.toFixed(0)}km`,
      subtitle: "Combined distance",
      icon: <MapPin className="w-5 h-5" />,
      bgColor: "bg-purple-100",
      color: "text-purple-600"
    },
    {
      title: "Active Tracking",
      value: activeTracking.toString(),
      subtitle: "Live monitoring",
      icon: <Satellite className="w-5 h-5" />,
      bgColor: "bg-orange-100",
      color: "text-orange-600"
    }
  ];

  const searchConfig = {
    placeholder: "Search routes...",
    value: searchTerm,
    onChange: setSearchTerm,
    showSearch: true
  };

  const filters: FilterOption[] = [
    {
      label: "Status",
      value: statusFilter,
      options: [
        { value: "all", label: "All Statuses" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "maintenance", label: "Maintenance" }
      ],
      placeholder: "Filter by status"
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "Status") setStatusFilter(value);
  };

  // Enhanced Map Component
  const MapComponent = () => (
    <div className={`relative ${isMapFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Map Controls */}
      <div className={`absolute top-4 right-4 z-10 flex flex-col gap-2 ${isMapFullScreen ? 'bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg' : ''}`}>
        <Button
          onClick={toggleFullScreen}
          variant="outline"
          size="sm"
          className="bg-white/90 hover:bg-white shadow-md"
        >
          {isMapFullScreen ? (
            <>
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Full Screen
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 mr-2" />
              Full Screen
            </>
          )}
        </Button>
        
        {isMapFullScreen && (
          <>
            <Button
              onClick={handleZoomIn}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white shadow-md"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleZoomOut}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white shadow-md"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              onClick={resetMapView}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white shadow-md"
            >
              <Compass className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Map Content */}
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-blue-300 ${
        isMapFullScreen 
          ? 'w-full h-full' 
          : 'w-full h-[600px]' // Much larger map size
      }`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              {isMapFullScreen ? 'Full-Screen Interactive Map' : 'Interactive Map Coming Soon'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {isMapFullScreen 
                ? 'Real-time map showing vehicle locations, route progress, and live updates in full-screen mode'
                : 'Real-time map showing vehicle locations, route progress, and live updates'
              }
            </p>
            
            {/* Map Legend */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Route Path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Stops</span>
              </div>
            </div>

            {/* Zoom Level Display */}
            {isMapFullScreen && (
              <div className="mt-6 p-3 bg-white/80 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-gray-600">
                  <strong>Zoom Level:</strong> {mapZoom}x
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Use zoom controls or scroll to navigate
                </p>
              </div>
            )}

            {/* Map Features Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Car className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-800">Vehicle Tracking</h4>
                <p className="text-xs text-gray-600">Real-time GPS locations</p>
              </div>
              <div className="p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Route className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-800">Route Planning</h4>
                <p className="text-xs text-gray-600">Optimized paths</p>
              </div>
              <div className="p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-800">Multi-Layer</h4>
                <p className="text-xs text-gray-600">Traffic & weather</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen close button */}
      {isMapFullScreen && (
        <Button
          onClick={toggleFullScreen}
          variant="outline"
          size="lg"
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 hover:bg-white shadow-lg"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Exit Full Screen
        </Button>
      )}
    </div>
  );

  return (
    <StandardPageLayout
      title="Route Planning and Tracking"
      description="Plan, manage, and track transportation routes in real-time with advanced optimization and monitoring capabilities"
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchConfig={searchConfig}
      filters={filters}
      onFilterChange={handleFilterChange}
    >
      {/* Content based on active tab */}
      {activeTab === 'routes' && (
        <Card>
          <CardHeader>
            <CardTitle>Route Overview</CardTitle>
            <CardDescription>Manage and monitor all transportation routes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Start Location</TableHead>
                  <TableHead>End Location</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-gray-500">{route.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {route.start_location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {route.end_location}
                      </div>
                    </TableCell>
                    <TableCell>{route.distance_km}km</TableCell>
                    <TableCell>{route.estimated_duration}min</TableCell>
                    <TableCell>{getStatusBadge(route.status)}</TableCell>
                    <TableCell>
                      {route.current_location ? (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600">Live</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-xs text-gray-500">Offline</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {/* Tracking Dashboard */}
          <TrackingDashboard />
          
          {/* Live Tracking Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Live GPS Tracking Map
              </CardTitle>
              <CardDescription>Real-time location and status of all active vehicles and drivers</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LiveTrackingMap 
                driverId={undefined}
                routeId={undefined}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'optimization' && (
        <Card>
          <CardHeader>
            <CardTitle>Route Optimization</CardTitle>
            <CardDescription>Optimize routes for efficiency and cost savings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Route optimization features coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Advanced algorithms to optimize delivery routes and reduce costs
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Route Analytics</CardTitle>
            <CardDescription>Performance metrics and route analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Route analytics features coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Detailed analytics and performance metrics for route optimization
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </StandardPageLayout>
  );
}
