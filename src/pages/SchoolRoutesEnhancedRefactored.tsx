import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { usePersonalAssistants } from '@/hooks/usePersonalAssistants';
import { useRouteStops, useCreateRouteStop, useUpdateRouteStop, useDeleteRouteStop } from '@/hooks/usePersonalAssistants';
import { useRoutePersonalAssistants, useCreateRoutePersonalAssistant, useUpdateRoutePersonalAssistant, useDeleteRoutePersonalAssistant } from '@/hooks/usePersonalAssistants';
import { useStudents, useRouteStudents, useCreateRouteStudent, useUpdateRouteStudent, useDeleteRouteStudent } from '@/hooks/useStudents';
import { useRoutes, useCreateRoute, useUpdateRoute, useDeleteRoute } from '@/hooks/useRoutes';
import CreateSchoolRouteWizard from '@/components/school-routes/CreateSchoolRouteWizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bus, 
  Users, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  AlertTriangle, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Navigation,
  DollarSign,
  Shield,
  FileText,
  Settings,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  Star,
  UserPlus,
  Route,
  Map,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import the new tab components
import { RouteOverviewTab } from '@/components/school-routes/RouteOverviewTab';
import { RouteStopsTab } from '@/components/school-routes/RouteStopsTab';

interface SchoolRoute {
  id: string;
  routeName: string;
  routeNumber: string;
  schoolName: string;
  schoolAddress: string;
  routeType: 'morning' | 'afternoon' | 'both';
  status: 'active' | 'inactive' | 'planned' | 'suspended';
  assignedVehicleId: string;
  assignedDriverId: string;
  vehicleRegistration: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  currentPassengers: number;
  stops: RouteStop[];
  pickupTimes: string[];
  dropoffTimes: string[];
  daysOfWeek: number[];
  estimatedDuration: number;
  distance: number;
  fuelConsumption: number;
  monthlyCost: number;
  monthlyRevenue: number;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  specialRequirements: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface RouteStop {
  id: string;
  name: string;
  address: string;
  type: 'pickup' | 'dropoff' | 'both';
  order: number;
  estimatedTime: string;
  students: StudentInfo[];
  coordinates: { lat: number; lng: number };
}

interface StudentInfo {
  id: string;
  name: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
}

const SchoolRoutesEnhancedRefactored: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  // State management
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<SchoolRoute | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);

  // Data fetching
  const { data: dbRoutes = [], isLoading: routesLoading } = useRoutes();
  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();
  const deleteRouteMutation = useDeleteRoute();

  // Personal Assistants data
  const { data: personalAssistants = [] } = usePersonalAssistants();

  // Students data
  const { data: students = [] } = useStudents();

  // Route stops mutations
  const createStopMutation = useCreateRouteStop();
  const updateStopMutation = useUpdateRouteStop();
  const deleteStopMutation = useDeleteRouteStop();

  // Route personal assistants mutations
  const createPAMutation = useCreateRoutePersonalAssistant();
  const updatePAMutation = useUpdateRoutePersonalAssistant();
  const deletePAMutation = useDeleteRoutePersonalAssistant();

  // Route students mutations
  const createStudentMutation = useCreateRouteStudent();
  const updateStudentMutation = useUpdateRouteStudent();
  const deleteStudentMutation = useDeleteRouteStudent();

  // Transform database routes to SchoolRoute format
  const routes: SchoolRoute[] = dbRoutes.map(route => ({
    id: route.id,
    routeName: route.route_name || 'Unnamed Route',
    routeNumber: route.route_number || 'N/A',
    schoolName: route.school_name || 'Unknown School',
    schoolAddress: route.school_address || 'No address',
    routeType: (route.route_type as 'morning' | 'afternoon' | 'both') || 'both',
    status: (route.status as 'active' | 'inactive' | 'planned' | 'suspended') || 'inactive',
    assignedVehicleId: route.assigned_vehicle_id || '',
    assignedDriverId: route.assigned_driver_id || '',
    vehicleRegistration: route.vehicle_registration || 'Not assigned',
    driverName: route.driver_name || 'Not assigned',
    driverPhone: route.driver_phone || 'N/A',
    capacity: route.capacity || 0,
    currentPassengers: route.current_passengers || 0,
    stops: route.stops || [],
    pickupTimes: route.pickup_times || [],
    dropoffTimes: route.dropoff_times || [],
    daysOfWeek: route.days_of_week || [],
    estimatedDuration: route.estimated_duration || 0,
    distance: route.distance || 0,
    fuelConsumption: route.fuel_consumption || 0,
    monthlyCost: route.monthly_cost || 0,
    monthlyRevenue: route.monthly_revenue || 0,
    contactPerson: route.contact_person || 'N/A',
    contactPhone: route.contact_phone || 'N/A',
    contactEmail: route.contact_email || 'N/A',
    specialRequirements: route.special_requirements || [],
    notes: route.notes || '',
    createdAt: route.created_at || '',
    updatedAt: route.updated_at || ''
  }));

  // Filter routes based on search and filters
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.routeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    const matchesSchool = schoolFilter === 'all' || route.schoolName === schoolFilter;

    return matchesSearch && matchesStatus && matchesSchool;
  });

  // Get unique schools for filter
  const uniqueSchools = Array.from(new Set(routes.map(route => route.schoolName)));

  // Event handlers
  const handleCreateRoute = async () => {
    setIsCreateDialogOpen(false);
    toast.success('Route creation dialog opened');
  };

  const handleEditRoute = (route: SchoolRoute) => {
    setSelectedRoute(route);
    setIsEditDialogOpen(true);
  };

  const handleViewRoute = (route: SchoolRoute) => {
    setSelectedRoute(route);
    setIsViewDialogOpen(true);
  };

  const handleDeleteRoute = (route: SchoolRoute) => {
    setSelectedRoute(route);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRoute) return;

    try {
      await deleteRouteMutation.mutateAsync(selectedRoute.id);
      toast.success('Route deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedRoute(null);
    } catch (error) {
      toast.error('Failed to delete route');
    }
  };

  const handleAddStop = () => {
    toast.info('Add stop functionality will be implemented');
  };

  const handleEditStop = (stop: RouteStop) => {
    toast.info(`Edit stop: ${stop.name}`);
  };

  const handleDeleteStop = (stopId: string) => {
    toast.info(`Delete stop: ${stopId}`);
  };

  const handleMoveStopUp = (stopId: string) => {
    toast.info(`Move stop up: ${stopId}`);
  };

  const handleMoveStopDown = (stopId: string) => {
    toast.info(`Move stop down: ${stopId}`);
  };

  // Loading and auth checks
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading school routes...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bus className="w-8 h-8 text-blue-600" />
            School Routes Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage school transportation routes, stops, and student assignments
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="create-route-desc">
            <DialogHeader>
              <DialogTitle>Create New School Route</DialogTitle>
              <DialogDescription id="create-route-desc">
                Set up a new school transportation route with stops and assignments
              </DialogDescription>
            </DialogHeader>
            <CreateSchoolRouteWizard onComplete={handleCreateRoute} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by route name, number, or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="planned">Planned</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Schools</option>
              {uniqueSchools.map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSchoolFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Routes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            School Routes ({filteredRoutes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {routesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading routes...</p>
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="text-center py-8">
              <Bus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No routes found</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create First Route
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{route.routeName}</p>
                        <p className="text-sm text-muted-foreground">#{route.routeNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{route.schoolName}</p>
                        <p className="text-sm text-muted-foreground">{route.schoolAddress}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {route.routeType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={route.status === 'active' ? 'default' : 'secondary'}
                        className={route.status === 'suspended' ? 'bg-red-100 text-red-800' : ''}
                      >
                        {route.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium">{route.currentPassengers}/{route.capacity}</p>
                        <p className="text-xs text-muted-foreground">
                          {route.capacity > 0 ? ((route.currentPassengers / route.capacity) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{route.stops.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRoute(route)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRoute(route)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRoute(route)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Route Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="route-details-desc">
          <DialogHeader>
            <DialogTitle>Route Details</DialogTitle>
            <DialogDescription id="route-details-desc">
              View and manage route information, stops, and assignments
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoute && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stops">Stops</TabsTrigger>
                <TabsTrigger value="personal-assistants">Personal Assistants</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <RouteOverviewTab 
                  route={selectedRoute}
                  onEdit={() => {
                    setIsViewDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                  onViewDetails={() => {}}
                  onDelete={() => {
                    setIsViewDialogOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="stops" className="space-y-4">
                <RouteStopsTab 
                  stops={selectedRoute.stops}
                  onAddStop={handleAddStop}
                  onEditStop={handleEditStop}
                  onDeleteStop={handleDeleteStop}
                  onMoveStopUp={handleMoveStopUp}
                  onMoveStopDown={handleMoveStopDown}
                />
              </TabsContent>

              <TabsContent value="personal-assistants" className="space-y-4">
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Personal Assistants management will be implemented</p>
                </div>
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Students management will be implemented</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent aria-describedby="delete-route-desc">
          <DialogHeader>
            <DialogTitle>Delete Route</DialogTitle>
            <DialogDescription id="delete-route-desc">
              Are you sure you want to delete "{selectedRoute?.routeName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Route
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolRoutesEnhancedRefactored;
