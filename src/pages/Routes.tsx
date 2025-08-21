import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRoutes, useRouteStats, useCreateRoute } from '@/hooks/useRoutes';
import { 
  Route as RouteIcon, 
  Plus, 
  Search,
  MapPin,
  Navigation,
  Truck,
  Eye,
  Edit,
  Copy,
  Users,
  DollarSign,
  Calendar,
  Activity,
  BarChart3,
  Settings
} from 'lucide-react';

interface RouteData {
  id: string;
  name: string;
  type: 'school' | 'medical' | 'charter' | 'corporate';
  origin: string;
  destination: string;
  distance: number;
  stops: number;
  assignedVehicle?: string;
  assignedDriver?: string;
  status: 'active' | 'inactive' | 'planned' | 'completed';
  students?: number;
  revenue: number;
}

const Routes: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [newRouteData, setNewRouteData] = useState({
    name: '',
    start_location: '',
    end_location: '',
    distance: 0,
    estimated_time: 0,
    status: 'active'
  });

  // Fetch real data from backend
  const { data: routes = [], isLoading: routesLoading, error: routesError } = useRoutes();
  const routeStats = useRouteStats();
  const createRouteMutation = useCreateRoute();

  if (loading || routesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading route management...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Handle creation of new route
  const handleCreateRoute = async () => {
    try {
      await createRouteMutation.mutateAsync(newRouteData);
      setIsCreateDialogOpen(false);
      setNewRouteData({
        name: '',
        start_location: '',
        end_location: '',
        distance: 0,
        estimated_time: 0,
        status: 'active'
      });
    } catch (error) {
      console.error('Failed to create route:', error);
    }
  };

  // Temporary mock routes data structure for compatibility - will use real data
  const routesData: RouteData[] = routes.map(route => ({
    id: route.id,
    name: route.name || `${route.start_location} → ${route.end_location}`,
    type: 'school' as const, // Default type
    origin: route.start_location || 'Unknown',
    destination: route.end_location || 'Unknown', 
    distance: route.distance || 0,
    stops: 0, // Not available in current schema
    assignedVehicle: undefined,
    assignedDriver: undefined,
    status: (route.status === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
    students: undefined,
    revenue: 0 // Not available in current schema
  }));

  // For backward compatibility, keep the routes variable as routesData instead of real routes
  const routesForDisplay = routesData;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      planned: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      school: 'bg-yellow-100 text-yellow-800',
      medical: 'bg-red-100 text-red-800',
      charter: 'bg-purple-100 text-purple-800',
      corporate: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={typeConfig[type as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  const filteredRoutes = routesForDisplay.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    const matchesType = typeFilter === 'all' || route.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Use real route stats from hook instead of calculated stats
  const routeStatsData = {
    totalRoutes: routeStats.total,
    activeRoutes: routeStats.active,
    totalRevenue: 0, // Not available in current schema
    totalDistance: routeStats.total_distance || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <RouteIcon className="w-8 h-8 text-blue-600" />
            School Routes Management
          </h1>
          <p className="text-gray-600 mt-1">Manage and optimize school transportation routes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Route</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="route-name">Route Name</Label>
                <Input id="route-name" placeholder="Enter route name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">Origin</Label>
                  <Input id="origin" placeholder="Starting location" />
                </div>
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input id="destination" placeholder="End location" />
                </div>
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
              <RouteIcon className="w-8 h-8 text-blue-600" />
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
              <Activity className="w-8 h-8 text-green-600" />
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
              <DollarSign className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">£{routeStatsData.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Navigation className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-purple-600">{routeStatsData.totalDistance.toFixed(1)} km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RouteIcon className="w-5 h-5" />
            School Routes Management
          </CardTitle>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="school">School Transport</SelectItem>
                <SelectItem value="medical">Medical Transport</SelectItem>
                <SelectItem value="charter">Charter Service</SelectItem>
                <SelectItem value="corporate">Corporate Shuttle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Stops</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{route.name}</p>
                      <p className="text-sm text-gray-500">{route.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(route.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{route.origin} → {route.destination}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-gray-400" />
                      <span>{route.distance} km</span>
                    </div>
                  </TableCell>
                  <TableCell>{route.stops}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {route.assignedVehicle && (
                        <div className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-gray-400" />
                          <span>{route.assignedVehicle}</span>
                        </div>
                      )}
                      {route.assignedDriver && (
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span>{route.assignedDriver}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(route.status)}</TableCell>
                  <TableCell>
                    <span className="font-medium">£{route.revenue}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Routes;
