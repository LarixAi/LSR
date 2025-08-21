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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
  Map
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  emergencyContact: string;
  medicalInfo: string;
  specialNeeds: string[];
  pickupTime: string;
  dropoffTime: string;
  isActive: boolean;
}



const SchoolRoutesEnhanced: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStopsDialogOpen, setIsStopsDialogOpen] = useState(false);
  const [isPADialogOpen, setIsPADialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<SchoolRoute | null>(null);
  const [editingRoute, setEditingRoute] = useState<Partial<SchoolRoute>>({});
  
  // Real database data
  const { data: dbRoutes = [], isLoading: routesLoading } = useRoutes();
  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();
  const deleteRouteMutation = useDeleteRoute();
  
  // Transform database routes to SchoolRoute format
  const routes: SchoolRoute[] = dbRoutes.map(dbRoute => ({
    id: dbRoute.id,
    routeName: dbRoute.name || 'Unnamed Route',
    routeNumber: dbRoute.name || 'N/A',
    schoolName: dbRoute.school_name || 'N/A',
    schoolAddress: 'N/A', // Not in database
    routeType: 'both' as const, // Default
    status: (dbRoute.status as any) || 'planned',
    assignedVehicleId: dbRoute.assigned_vehicle_id || '',
    assignedDriverId: dbRoute.assigned_driver_id || '',
    vehicleRegistration: 'N/A', // Not in database
    driverName: 'N/A', // Not in database
    driverPhone: 'N/A', // Not in database
    capacity: 0, // Not in database
    currentPassengers: 0, // Not in database
    stops: [], // Will be populated from routeStops
    pickupTimes: [], // Not in database
    dropoffTimes: [], // Not in database
    daysOfWeek: [1, 2, 3, 4, 5], // Default
    estimatedDuration: 0, // Not in database
    distance: 0, // Not in database
    fuelConsumption: 0, // Not in database
    monthlyCost: 0, // Not in database
    monthlyRevenue: 0, // Not in database
    contactPerson: dbRoute.contact_person || 'N/A',
    contactPhone: dbRoute.contact_phone || 'N/A',
    contactEmail: dbRoute.contact_email || 'N/A',
    specialRequirements: [], // Not in database
    notes: dbRoute.notes || '',
    createdAt: dbRoute.created_at,
    updatedAt: dbRoute.updated_at
  }));
  
  // Personal Assistants and Stops management
  const { data: personalAssistants = [] } = usePersonalAssistants();
  const { data: routeStops = [] } = useRouteStops(selectedRoute?.id || '');
  const { data: routePAs = [] } = useRoutePersonalAssistants(selectedRoute?.id || '');
  
  // Students management
  const { data: students = [] } = useStudents();
  const { data: routeStudents = [] } = useRouteStudents(selectedRoute?.id || '');
  
  const createStopMutation = useCreateRouteStop();
  const updateStopMutation = useUpdateRouteStop();
  const deleteStopMutation = useDeleteRouteStop();
  
  const createPAMutation = useCreateRoutePersonalAssistant();
  const updatePAMutation = useUpdateRoutePersonalAssistant();
  const deletePAMutation = useDeleteRoutePersonalAssistant();
  
  const createStudentMutation = useCreateRouteStudent();
  const updateStudentMutation = useUpdateRouteStudent();
  const deleteStudentMutation = useDeleteRouteStudent();
  
  // Stops form state
  const [stopFormData, setStopFormData] = useState({
    stop_name: '',
    stop_type: 'pickup' as 'pickup' | 'dropoff' | 'both',
    address: '',
    estimated_time: '',
    stop_order: 1,
    passenger_count: 0,
    notes: ''
  });
  
  // PA assignment form state
  const [paFormData, setPaFormData] = useState({
    personal_assistant_id: '',
    assignment_date: '',
    start_time: '',
    end_time: '',
    status: 'assigned' as 'assigned' | 'confirmed' | 'completed' | 'cancelled',
    notes: ''
  });
  
  // Student assignment form state
  const [studentFormData, setStudentFormData] = useState({
    student_id: '',
    pickup_stop_id: '',
    dropoff_stop_id: '',
    pickup_time: '',
    dropoff_time: '',
    days_of_week: [1, 2, 3, 4, 5] as number[],
    is_active: true,
    notes: ''
  });
  
  // Form state for creating new route
  const [newRoute, setNewRoute] = useState<Partial<SchoolRoute>>({
    routeName: '',
    routeNumber: '',
    schoolName: '',
    schoolAddress: '',
    routeType: 'both',
    status: 'planned',
    capacity: 0,
    currentPassengers: 0,
    stops: [],
    pickupTimes: [],
    dropoffTimes: [],
    daysOfWeek: [1, 2, 3, 4, 5],
    estimatedDuration: 0,
    distance: 0,
    fuelConsumption: 0,
    monthlyCost: 0,
    monthlyRevenue: 0,
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    specialRequirements: [],
    notes: ''
  });

  if (loading || routesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading school routes management...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has access (admin or council only)
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Filter routes based on search and filters
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.routeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    const matchesSchool = schoolFilter === 'all' || route.schoolName === schoolFilter;
    return matchesSearch && matchesStatus && matchesSchool;
  });

  // Calculate statistics
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter(r => r.status === 'active').length;
  const totalStudents = routes.reduce((sum, r) => sum + r.currentPassengers, 0);
  const totalRevenue = routes.reduce((sum, r) => sum + r.monthlyRevenue, 0);
  const totalCost = routes.reduce((sum, r) => sum + r.monthlyCost, 0);
  const profit = totalRevenue - totalCost;
  const utilizationRate = totalStudents / routes.reduce((sum, r) => sum + r.capacity, 0) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'planned': return <Clock className="w-4 h-4" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleCreateRoute = async () => {
    try {
      await createRouteMutation.mutateAsync({
        name: newRoute.routeName || 'New School Route',
        route_type: 'school',
        school_name: newRoute.schoolName || '',
        grade_levels: newRoute.schoolName ? [newRoute.schoolName] : [],
        contact_person: newRoute.contactPerson || '',
        contact_phone: newRoute.contactPhone || '',
        contact_email: newRoute.contactEmail || '',
        notes: newRoute.notes || '',
        status: 'active',
        stops: [],
        schedule: {},
        pickup_times: [],
        dropoff_times: [],
        days_of_week: [1, 2, 3, 4, 5]
      });
      
      setIsCreateDialogOpen(false);
      setNewRoute({
        routeName: '',
        routeNumber: '',
        schoolName: '',
        schoolAddress: '',
        routeType: 'both',
        status: 'planned',
        capacity: 0,
        currentPassengers: 0,
        stops: [],
        pickupTimes: [],
        dropoffTimes: [],
        daysOfWeek: [1, 2, 3, 4, 5],
        estimatedDuration: 0,
        distance: 0,
        fuelConsumption: 0,
        monthlyCost: 0,
        monthlyRevenue: 0,
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        specialRequirements: [],
        notes: ''
      });
      
      toast({
        title: "Success",
        description: "School route created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create school route.",
        variant: "destructive",
      });
    }
  };

  const handleEditRoute = (route: SchoolRoute) => {
    setEditingRoute({
      id: route.id,
      routeName: route.routeName,
      routeNumber: route.routeNumber,
      schoolName: route.schoolName,
      schoolAddress: route.schoolAddress,
      routeType: route.routeType,
      status: route.status,
      assignedVehicleId: route.assignedVehicleId,
      assignedDriverId: route.assignedDriverId,
      capacity: route.capacity,
      currentPassengers: route.currentPassengers,
      contactPerson: route.contactPerson,
      contactPhone: route.contactPhone,
      contactEmail: route.contactEmail,
      notes: route.notes
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRoute = async () => {
    if (!editingRoute.id) return;
    
    try {
      await updateRouteMutation.mutateAsync({
        id: editingRoute.id,
        updates: {
          name: editingRoute.routeName || 'Unnamed Route',
          school_name: editingRoute.schoolName || '',
          grade_levels: editingRoute.schoolName ? [editingRoute.schoolName] : [],
          contact_person: editingRoute.contactPerson || '',
          contact_phone: editingRoute.contactPhone || '',
          contact_email: editingRoute.contactEmail || '',
          notes: editingRoute.notes || '',
          status: editingRoute.status || 'active'
        }
      });
      
      setIsEditDialogOpen(false);
      setEditingRoute({});
      
      toast({
        title: "Success",
        description: "School route updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update school route.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    const routeToDelete = routes.find(r => r.id === routeId);
    const routeName = routeToDelete?.routeName || 'this route';
    
    if (!confirm(`Are you sure you want to delete "${routeName}"? This will also delete all associated stops, student assignments, and personal assistant assignments. This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteRouteMutation.mutateAsync(routeId);
      
      toast({
        title: "Success",
        description: "School route deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete school route.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (route: SchoolRoute) => {
    setSelectedRoute(route);
    setIsDetailDialogOpen(true);
  };

  // Stops management handlers
  const handleCreateStop = async () => {
    if (!selectedRoute) return;
    
    try {
      await createStopMutation.mutateAsync({
        ...stopFormData,
        route_id: selectedRoute.id
      });
      
      toast({
        title: "Success",
        description: "Stop added successfully",
      });
      
      setIsStopsDialogOpen(false);
      setStopFormData({
        stop_name: '',
        stop_type: 'pickup',
        address: '',
        estimated_time: '',
        stop_order: 1,
        passenger_count: 0,
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stop",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStop = async (stopId: string) => {
    try {
      await updateStopMutation.mutateAsync({
        id: stopId,
        ...stopFormData
      });
      
      toast({
        title: "Success",
        description: "Stop updated successfully",
      });
      
      setIsStopsDialogOpen(false);
      setStopFormData({
        stop_name: '',
        stop_type: 'pickup',
        address: '',
        estimated_time: '',
        stop_order: 1,
        passenger_count: 0,
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stop",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!selectedRoute) return;
    
    if (!confirm('Are you sure you want to delete this stop?')) return;
    
    try {
      await deleteStopMutation.mutateAsync({ id: stopId, route_id: selectedRoute.id });
      
      toast({
        title: "Success",
        description: "Stop deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete stop",
        variant: "destructive",
      });
    }
  };

  // Personal Assistant assignment handlers
  const handleCreatePA = async () => {
    if (!selectedRoute) return;
    
    try {
      await createPAMutation.mutateAsync({
        ...paFormData,
        route_id: selectedRoute.id
      });
      
      toast({
        title: "Success",
        description: "Personal Assistant assigned successfully",
      });
      
      setIsPADialogOpen(false);
      setPaFormData({
        personal_assistant_id: '',
        assignment_date: '',
        start_time: '',
        end_time: '',
        status: 'assigned',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign Personal Assistant",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePA = async (paId: string) => {
    try {
      await updatePAMutation.mutateAsync({
        id: paId,
        ...paFormData
      });
      
      toast({
        title: "Success",
        description: "Personal Assistant assignment updated successfully",
      });
      
      setIsPADialogOpen(false);
      setPaFormData({
        personal_assistant_id: '',
        assignment_date: '',
        start_time: '',
        end_time: '',
        status: 'assigned',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update Personal Assistant assignment",
        variant: "destructive",
      });
    }
  };

  const handleDeletePA = async (paId: string) => {
    if (!selectedRoute) return;
    
    if (!confirm('Are you sure you want to remove this Personal Assistant assignment?')) return;
    
    try {
      await deletePAMutation.mutateAsync({ id: paId, route_id: selectedRoute.id });
      
      toast({
        title: "Success",
        description: "Personal Assistant assignment removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove Personal Assistant assignment",
        variant: "destructive",
      });
    }
  };

  // Student assignment handlers
  const handleCreateStudent = async () => {
    if (!selectedRoute) return;
    
    try {
      await createStudentMutation.mutateAsync({
        ...studentFormData,
        route_id: selectedRoute.id
      });
      
      toast({
        title: "Success",
        description: "Student assigned to route successfully",
      });
      
      setStudentFormData({
        student_id: '',
        pickup_stop_id: '',
        dropoff_stop_id: '',
        pickup_time: '',
        dropoff_time: '',
        days_of_week: [1, 2, 3, 4, 5],
        is_active: true,
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign student to route",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStudent = async (studentId: string) => {
    try {
      await updateStudentMutation.mutateAsync({
        id: studentId,
        ...studentFormData
      });
      
      toast({
        title: "Success",
        description: "Student assignment updated successfully",
      });
      
      setStudentFormData({
        student_id: '',
        pickup_stop_id: '',
        dropoff_stop_id: '',
        pickup_time: '',
        dropoff_time: '',
        days_of_week: [1, 2, 3, 4, 5],
        is_active: true,
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student assignment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!selectedRoute) return;
    
    if (!confirm('Are you sure you want to remove this student from the route?')) return;
    
    try {
      await deleteStudentMutation.mutateAsync({ id: studentId, route_id: selectedRoute.id });
      
      toast({
        title: "Success",
        description: "Student removed from route successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove student from route",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bus className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">School Routes Management</h1>
              <p className="text-muted-foreground">Comprehensive school transportation route management</p>
            </div>
          </div>
        </div>
                <Button 
          className="flex items-center space-x-2"
          onClick={() => setIsCreateWizardOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>New Route</span>
        </Button>




      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bus className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalRoutes}</p>
                <p className="text-xs text-muted-foreground">Total Routes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeRoutes}</p>
                <p className="text-xs text-muted-foreground">Active Routes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Utilization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">£{(totalRevenue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">£{(profit / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search by route name, school, or route number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="School" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                <SelectItem value="Lincoln Elementary School">Lincoln Elementary</SelectItem>
                <SelectItem value="Washington High School">Washington High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>School Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Info</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Driver/Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Financial</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{route.routeName}</p>
                      <p className="text-sm text-muted-foreground">{route.routeNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{route.schoolName}</p>
                      <p className="text-sm text-muted-foreground">{route.schoolAddress}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <p className="font-medium">{route.currentPassengers}/{route.capacity}</p>
                      <p className="text-xs text-muted-foreground">
                        {((route.currentPassengers / route.capacity) * 100).toFixed(1)}% full
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{route.routeType}</p>
                      <p className="text-muted-foreground">
                        {route.daysOfWeek.length} days/week
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{route.driverName}</p>
                      <p className="text-muted-foreground">{route.vehicleRegistration}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(route.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(route.status)}
                        <span className="capitalize">{route.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">£{route.monthlyRevenue.toLocaleString()}</p>
                      <p className="text-muted-foreground">
                        Profit: £{(route.monthlyRevenue - route.monthlyCost).toLocaleString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(route)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRoute(route)}
                        title="Edit Route"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRoute(route.id)}
                        title="Delete Route"
                        className="text-red-600 hover:text-red-700"
                      >
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

      {/* Route Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bus className="w-5 h-5" />
              <span>{selectedRoute?.routeName}</span>
            </DialogTitle>
            <DialogDescription>
              View and manage detailed information about this school route including stops, students, and personal assistants.
            </DialogDescription>
          </DialogHeader>
          {selectedRoute && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stops">Stops</TabsTrigger>
                <TabsTrigger value="personal-assistants">Personal Assistants</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Route Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Route Number:</strong> {selectedRoute.routeNumber}</div>
                        <div><strong>School:</strong> {selectedRoute.schoolName}</div>
                        <div><strong>Type:</strong> {selectedRoute.routeType}</div>
                        <div><strong>Status:</strong> 
                          <Badge className={`ml-2 ${getStatusColor(selectedRoute.status)}`}>
                            {selectedRoute.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Contact Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{selectedRoute.contactPerson}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{selectedRoute.contactPhone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{selectedRoute.contactEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Service Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-3">
                            <div className="text-center">
                              <Users className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                              <div className="text-lg font-bold">{selectedRoute.currentPassengers}/{selectedRoute.capacity}</div>
                              <div className="text-xs text-muted-foreground">Students</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <div className="text-center">
                              <Navigation className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                              <div className="text-lg font-bold">{selectedRoute.distance} km</div>
                              <div className="text-xs text-muted-foreground">Distance</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <div className="text-center">
                              <Clock className="w-6 h-6 mx-auto mb-1 text-green-600" />
                              <div className="text-lg font-bold">{selectedRoute.estimatedDuration} min</div>
                              <div className="text-xs text-muted-foreground">Duration</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <div className="text-center">
                              <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-600" />
                              <div className="text-lg font-bold">£{(selectedRoute.monthlyRevenue - selectedRoute.monthlyCost).toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Monthly Profit</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRoute.specialRequirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Special Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoute.specialRequirements.map((req, index) => (
                        <Badge key={index} variant="secondary">{req}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRoute.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <div className="p-3 bg-gray-50 rounded border text-sm">
                      {selectedRoute.notes}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stops" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Route Stops</h3>
                  <Button onClick={() => setIsStopsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stop
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {routeStops.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No stops configured for this route</p>
                      <p className="text-sm text-gray-500">Add stops to define pickup and dropoff points</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {routeStops.map((stop, index) => (
                        <Card key={stop.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                                  {stop.stop_order}
                                </div>
                                <div>
                                  <h4 className="font-medium">{stop.stop_name}</h4>
                                  <p className="text-sm text-gray-600">{stop.address}</p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <Badge variant={stop.stop_type === 'pickup' ? 'default' : stop.stop_type === 'dropoff' ? 'secondary' : 'outline'}>
                                      {stop.stop_type}
                                    </Badge>
                                    {stop.estimated_time && (
                                      <span className="text-sm text-gray-500">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {stop.estimated_time}
                                      </span>
                                    )}
                                    <span className="text-sm text-gray-500">
                                      <Users className="w-3 h-3 inline mr-1" />
                                      {stop.passenger_count} passengers
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setStopFormData({
                                      stop_name: stop.stop_name,
                                      stop_type: stop.stop_type,
                                      address: stop.address,
                                      estimated_time: stop.estimated_time || '',
                                      stop_order: stop.stop_order,
                                      passenger_count: stop.passenger_count,
                                      notes: stop.notes || ''
                                    });
                                    setIsStopsDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteStop(stop.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Route Students</h3>
                  <Button onClick={() => setIsStudentDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {routeStudents.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No students assigned to this route</p>
                      <p className="text-sm text-gray-500">Add students to assign them to this school route</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {routeStudents.map((routeStudent) => (
                        <Card key={routeStudent.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full">
                                  <Users className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-medium">
                                    {routeStudent.students?.first_name} {routeStudent.students?.last_name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Grade: {routeStudent.students?.grade_level} | 
                                    Parent: {routeStudent.students?.parent_name}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <Badge variant={routeStudent.is_active ? 'default' : 'secondary'}>
                                      {routeStudent.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {routeStudent.pickup_time && (
                                      <span className="text-sm text-gray-500">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        Pickup: {routeStudent.pickup_time}
                                      </span>
                                    )}
                                    {routeStudent.dropoff_time && (
                                      <span className="text-sm text-gray-500">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        Dropoff: {routeStudent.dropoff_time}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setStudentFormData({
                                      student_id: routeStudent.student_id,
                                      pickup_stop_id: routeStudent.pickup_stop_id || '',
                                      dropoff_stop_id: routeStudent.dropoff_stop_id || '',
                                      pickup_time: routeStudent.pickup_time || '',
                                      dropoff_time: routeStudent.dropoff_time || '',
                                      days_of_week: routeStudent.days_of_week || [1, 2, 3, 4, 5],
                                      is_active: routeStudent.is_active,
                                      notes: routeStudent.notes || ''
                                    });
                                    setIsStudentDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteStudent(routeStudent.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Schedule management interface will be implemented here</p>
                  <p className="text-sm text-gray-500">Manage pickup/dropoff times and route scheduling</p>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Financial management interface will be implemented here</p>
                  <p className="text-sm text-gray-500">Track costs, revenue, and profitability metrics</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Stops Management Dialog */}
      <Dialog open={isStopsDialogOpen} onOpenChange={setIsStopsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Route Stop</DialogTitle>
            <DialogDescription>
              Add or edit a stop for this school route. Stops can be pickup points, dropoff points, or both.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stop_name">Stop Name *</Label>
                <Input
                  id="stop_name"
                  value={stopFormData.stop_name}
                  onChange={(e) => setStopFormData({ ...stopFormData, stop_name: e.target.value })}
                  placeholder="e.g., Central Park Pickup"
                />
              </div>
              <div>
                <Label htmlFor="stop_type">Stop Type *</Label>
                <Select value={stopFormData.stop_type} onValueChange={(value: any) => setStopFormData({ ...stopFormData, stop_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="dropoff">Dropoff</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="stop_address">Address *</Label>
              <Input
                id="stop_address"
                value={stopFormData.address}
                onChange={(e) => setStopFormData({ ...stopFormData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="estimated_time">Estimated Time</Label>
                <Input
                  id="estimated_time"
                  type="time"
                  value={stopFormData.estimated_time}
                  onChange={(e) => setStopFormData({ ...stopFormData, estimated_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="stop_order">Stop Order *</Label>
                <Input
                  id="stop_order"
                  type="number"
                  value={stopFormData.stop_order}
                  onChange={(e) => setStopFormData({ ...stopFormData, stop_order: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="passenger_count">Passenger Count</Label>
                <Input
                  id="passenger_count"
                  type="number"
                  value={stopFormData.passenger_count}
                  onChange={(e) => setStopFormData({ ...stopFormData, passenger_count: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="stop_notes">Notes</Label>
              <Textarea
                id="stop_notes"
                value={stopFormData.notes}
                onChange={(e) => setStopFormData({ ...stopFormData, notes: e.target.value })}
                placeholder="Additional notes about this stop"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsStopsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateStop} disabled={createStopMutation.isPending}>
                {createStopMutation.isPending ? 'Creating...' : 'Create Stop'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Personal Assistant Assignment Dialog */}
      <Dialog open={isPADialogOpen} onOpenChange={setIsPADialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Personal Assistant</DialogTitle>
            <DialogDescription>
              Assign a personal assistant to this school route with specific dates, times, and responsibilities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pa_select">Personal Assistant *</Label>
              <Select value={paFormData.personal_assistant_id} onValueChange={(value) => setPaFormData({ ...paFormData, personal_assistant_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Personal Assistant" />
                </SelectTrigger>
                <SelectContent>
                  {personalAssistants
                    .filter(pa => pa.status === 'active')
                    .map((pa) => (
                      <SelectItem key={pa.id} value={pa.id}>
                        {pa.first_name} {pa.last_name} - {pa.email}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignment_date">Assignment Date *</Label>
                <Input
                  id="assignment_date"
                  type="date"
                  value={paFormData.assignment_date}
                  onChange={(e) => setPaFormData({ ...paFormData, assignment_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pa_status">Status</Label>
                <Select value={paFormData.status} onValueChange={(value: any) => setPaFormData({ ...paFormData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={paFormData.start_time}
                  onChange={(e) => setPaFormData({ ...paFormData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={paFormData.end_time}
                  onChange={(e) => setPaFormData({ ...paFormData, end_time: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="pa_notes">Notes</Label>
              <Textarea
                id="pa_notes"
                value={paFormData.notes}
                onChange={(e) => setPaFormData({ ...paFormData, notes: e.target.value })}
                placeholder="Additional notes about this assignment"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPADialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePA} disabled={createPAMutation.isPending}>
                {createPAMutation.isPending ? 'Assigning...' : 'Assign PA'}
              </Button>
            </div>
          </div>
                 </DialogContent>
       </Dialog>

       {/* Student Assignment Dialog */}
       <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Assign Student to Route</DialogTitle>
             <DialogDescription>
               Assign a student to this school route with pickup/dropoff times and days of operation.
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label htmlFor="student_select">Student *</Label>
               <Select value={studentFormData.student_id} onValueChange={(value) => setStudentFormData({ ...studentFormData, student_id: value })}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select a Student" />
                 </SelectTrigger>
                 <SelectContent>
                   {students
                     .filter(student => student.is_active)
                     .map((student) => (
                       <SelectItem key={student.id} value={student.id}>
                         {student.first_name} {student.last_name} - Grade {student.grade_level}
                       </SelectItem>
                     ))}
                 </SelectContent>
               </Select>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="pickup_time">Pickup Time</Label>
                 <Input
                   id="pickup_time"
                   type="time"
                   value={studentFormData.pickup_time}
                   onChange={(e) => setStudentFormData({ ...studentFormData, pickup_time: e.target.value })}
                 />
               </div>
               <div>
                 <Label htmlFor="dropoff_time">Dropoff Time</Label>
                 <Input
                   id="dropoff_time"
                   type="time"
                   value={studentFormData.dropoff_time}
                   onChange={(e) => setStudentFormData({ ...studentFormData, dropoff_time: e.target.value })}
                 />
               </div>
             </div>
             
             <div>
               <Label>Days of Week</Label>
               <div className="flex space-x-2 mt-2">
                 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                   <Button
                     key={day}
                     variant={studentFormData.days_of_week.includes(index + 1) ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => {
                       const newDays = studentFormData.days_of_week.includes(index + 1)
                         ? studentFormData.days_of_week.filter(d => d !== index + 1)
                         : [...studentFormData.days_of_week, index + 1];
                       setStudentFormData({ ...studentFormData, days_of_week: newDays });
                     }}
                   >
                     {day}
                   </Button>
                 ))}
               </div>
             </div>
             
             <div>
               <Label htmlFor="student_notes">Notes</Label>
               <Textarea
                 id="student_notes"
                 value={studentFormData.notes}
                 onChange={(e) => setStudentFormData({ ...studentFormData, notes: e.target.value })}
                 placeholder="Additional notes about this student assignment"
               />
             </div>
             
             <div className="flex justify-end space-x-2">
               <Button variant="outline" onClick={() => setIsStudentDialogOpen(false)}>
                 Cancel
               </Button>
               <Button onClick={handleCreateStudent} disabled={createStudentMutation.isPending}>
                 {createStudentMutation.isPending ? 'Assigning...' : 'Assign Student'}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Edit Route Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Edit School Route</DialogTitle>
             <DialogDescription>
               Update the details of this school route including basic information, contact details, and status.
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="edit_route_name">Route Name *</Label>
                 <Input
                   id="edit_route_name"
                   value={editingRoute.routeName || ''}
                   onChange={(e) => setEditingRoute({ ...editingRoute, routeName: e.target.value })}
                   placeholder="e.g., Lincoln Elementary - North Route"
                 />
               </div>
               <div>
                 <Label htmlFor="edit_route_number">Route Number</Label>
                 <Input
                   id="edit_route_number"
                   value={editingRoute.routeNumber || ''}
                   onChange={(e) => setEditingRoute({ ...editingRoute, routeNumber: e.target.value })}
                   placeholder="e.g., SR001"
                 />
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="edit_school_name">School Name *</Label>
                 <Input
                   id="edit_school_name"
                   value={editingRoute.schoolName || ''}
                   onChange={(e) => setEditingRoute({ ...editingRoute, schoolName: e.target.value })}
                   placeholder="e.g., Lincoln Elementary School"
                 />
               </div>
               <div>
                 <Label htmlFor="edit_school_address">School Address</Label>
                 <Input
                   id="edit_school_address"
                   value={editingRoute.schoolAddress || ''}
                   onChange={(e) => setEditingRoute({ ...editingRoute, schoolAddress: e.target.value })}
                   placeholder="Full school address"
                 />
               </div>
             </div>
             
             <div className="grid grid-cols-3 gap-4">
               <div>
                 <Label htmlFor="edit_route_type">Route Type</Label>
                 <Select value={editingRoute.routeType} onValueChange={(value) => setEditingRoute({ ...editingRoute, routeType: value as any })}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="morning">Morning Only</SelectItem>
                     <SelectItem value="afternoon">Afternoon Only</SelectItem>
                     <SelectItem value="both">Both</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label htmlFor="edit_status">Status</Label>
                 <Select value={editingRoute.status} onValueChange={(value) => setEditingRoute({ ...editingRoute, status: value as any })}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="active">Active</SelectItem>
                     <SelectItem value="inactive">Inactive</SelectItem>
                     <SelectItem value="planned">Planned</SelectItem>
                     <SelectItem value="suspended">Suspended</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label htmlFor="edit_capacity">Capacity</Label>
                 <Input
                   id="edit_capacity"
                   type="number"
                   value={editingRoute.capacity || 0}
                   onChange={(e) => setEditingRoute({ ...editingRoute, capacity: parseInt(e.target.value) || 0 })}
                   placeholder="0"
                 />
               </div>
             </div>
             
             <div className="grid grid-cols-3 gap-4">
               <div>
                 <Label htmlFor="edit_contact_person">Contact Person</Label>
                 <Input
                   id="edit_contact_person"
                   value={editingRoute.contactPerson || ''}
                   onChange={(e) => setEditingRoute({ ...editingRoute, contactPerson: e.target.value })}
                   placeholder="Contact person name"
                 />
               </div>
               <div>
                 <Label htmlFor="edit_contact_phone">Contact Phone</Label>
                 <Input
                   id="edit_contact_phone"
                   value={editingRoute.contactPhone || ''}
                   onChange={(e) => setEditingRoute({ ...editingRoute, contactPhone: e.target.value })}
                   placeholder="+44 20 7946 0958"
                 />
               </div>
               <div>
                 <Label htmlFor="edit_contact_email">Contact Email</Label>
                 <Input
                   id="edit_contact_email"
                   type="email"
                   value={editingRoute.contactEmail || ''}
                   onChange={(e) => setEditingRoute({ ...editingRoute, contactEmail: e.target.value })}
                   placeholder="contact@school.com"
                 />
               </div>
             </div>
             
             <div>
               <Label htmlFor="edit_notes">Notes</Label>
               <Textarea
                 id="edit_notes"
                 value={editingRoute.notes || ''}
                 onChange={(e) => setEditingRoute({ ...editingRoute, notes: e.target.value })}
                 placeholder="Additional notes about this route"
                 rows={3}
               />
             </div>
             
             <div className="flex justify-end space-x-2">
               <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                 Cancel
               </Button>
               <Button onClick={handleUpdateRoute} disabled={updateRouteMutation.isPending}>
                 {updateRouteMutation.isPending ? 'Updating...' : 'Update Route'}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Create School Route Wizard */}
       {isCreateWizardOpen && (
         <CreateSchoolRouteWizard onClose={() => setIsCreateWizardOpen(false)} />
       )}
     </div>
   );
 };

 export default SchoolRoutesEnhanced;
