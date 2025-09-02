import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useRailReplacementStops, useCreateRailReplacementStop, useUpdateRailReplacementStop, useDeleteRailReplacementStop } from '@/hooks/useRailReplacementStops';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Train, 
  Bus, 
  MapPin, 
  Clock, 
  Users, 
  AlertTriangle, 
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  Activity,
  BarChart3,
  DollarSign,
  Edit,
  Trash2,
  Route
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface RailReplacementService {
  id: string;
  serviceName: string;
  serviceCode: string;
  affectedLine: string;
  serviceType: 'emergency' | 'planned' | 'maintenance' | 'engineering';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'planned' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  frequency: string;
  vehiclesRequired: number;
  vehiclesAssigned: number;
  passengersAffected: number;
  estimatedCost: number;
  actualCost: number;
  revenue: number;
  railOperator: string;
  operatorContact: string;
  operatorPhone: string;
  specialRequirements: string[];
  notes: string;
  performanceMetrics: {
    onTimePerformance: number;
    passengerSatisfaction: number;
    responseTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock data for comprehensive rail replacement services
const mockRailServices: RailReplacementService[] = [
  {
    id: '1',
    serviceName: 'Northern Line Emergency Replacement',
    serviceCode: 'RR001',
    affectedLine: 'Northern Line',
    serviceType: 'emergency',
    priority: 'critical',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    frequency: 'Every 8 minutes',
    vehiclesRequired: 15,
    vehiclesAssigned: 12,
    passengersAffected: 2500,
    estimatedCost: 150000,
    actualCost: 125000,
    revenue: 45000,
    railOperator: 'Transport for London',
    operatorContact: 'Sarah Mitchell',
    operatorPhone: '+44 20 7946 0958',
    specialRequirements: ['Wheelchair accessible vehicles', 'Real-time tracking'],
    notes: 'Major signal failure requiring full line closure. Coordinating with TfL for passenger information.',
    performanceMetrics: {
      onTimePerformance: 92.5,
      passengerSatisfaction: 4.2,
      responseTime: 8.5
    },
    createdAt: '2024-01-15T04:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  }
];

const RailReplacementEnhanced: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  const [services, setServices] = useState<RailReplacementService[]>(mockRailServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<RailReplacementService | null>(null);
  const [isStopsDialogOpen, setIsStopsDialogOpen] = useState(false);
  
  // Rail replacement stops management
  const { data: railStops = [] } = useRailReplacementStops(selectedService?.id || '');
  const createStopMutation = useCreateRailReplacementStop();
  const updateStopMutation = useUpdateRailReplacementStop();
  const deleteStopMutation = useDeleteRailReplacementStop();
  
  // Stops form state
  const [stopFormData, setStopFormData] = useState({
    stop_name: '',
    stop_type: 'pickup' as 'pickup' | 'dropoff' | 'both',
    address: '',
    estimated_time: '',
    stop_order: 1,
    passenger_count: 0,
    rail_station_name: '',
    rail_line: '',
    notes: ''
  });
  
  const [newService, setNewService] = useState<Partial<RailReplacementService>>({
    serviceName: '',
    serviceCode: '',
    affectedLine: '',
    serviceType: 'planned',
    priority: 'medium',
    status: 'planned',
    startDate: '',
    endDate: '',
    frequency: '',
    vehiclesRequired: 0,
    vehiclesAssigned: 0,
    passengersAffected: 0,
    estimatedCost: 0,
    actualCost: 0,
    revenue: 0,
    railOperator: '',
    operatorContact: '',
    operatorPhone: '',
    specialRequirements: [],
    notes: ''
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading rail replacement services...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.affectedLine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesType = typeFilter === 'all' || service.serviceType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalServices = services.length;
  const activeServices = services.filter(s => s.status === 'active').length;
  const emergencyServices = services.filter(s => s.serviceType === 'emergency').length;
  const totalVehicles = services.reduce((sum, s) => sum + s.vehiclesAssigned, 0);
  const totalPassengers = services.reduce((sum, s) => sum + s.passengersAffected, 0);
  const totalCost = services.reduce((sum, s) => sum + s.actualCost, 0);
  const averagePerformance = services.reduce((sum, s) => sum + s.performanceMetrics.onTimePerformance, 0) / services.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-purple-100 text-purple-800';
      case 'engineering': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateService = () => {
    const service: RailReplacementService = {
      ...newService as RailReplacementService,
      id: Date.now().toString(),
      performanceMetrics: {
        onTimePerformance: 0,
        passengerSatisfaction: 0,
        responseTime: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setServices([...services, service]);
    setIsCreateDialogOpen(false);
    setNewService({
      serviceName: '',
      serviceCode: '',
      affectedLine: '',
      serviceType: 'planned',
      priority: 'medium',
      status: 'planned',
      startDate: '',
      endDate: '',
      frequency: '',
      vehiclesRequired: 0,
      vehiclesAssigned: 0,
      passengersAffected: 0,
      estimatedCost: 0,
      actualCost: 0,
      revenue: 0,
      railOperator: '',
      operatorContact: '',
      operatorPhone: '',
      specialRequirements: [],
      notes: ''
    });
    
    toast({
      title: "Success",
      description: "Rail replacement service created successfully.",
    });
  };

  const handleViewDetails = (service: RailReplacementService) => {
    setSelectedService(service);
    setIsDetailDialogOpen(true);
  };

  // Stops management handlers
  const handleCreateStop = async () => {
    if (!selectedService) return;
    
    try {
      await createStopMutation.mutateAsync({
        ...stopFormData,
        service_id: selectedService.id
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
        rail_station_name: '',
        rail_line: '',
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
        rail_station_name: '',
        rail_line: '',
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
    if (!selectedService) return;
    
    if (!confirm('Are you sure you want to delete this stop?')) return;
    
    try {
      await deleteStopMutation.mutateAsync({ id: stopId, service_id: selectedService.id });
      
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Train className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Rail Replacement Services</h1>
              <p className="text-muted-foreground">Comprehensive rail replacement service management</p>
            </div>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Service</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" aria-describedby="create-rail-service-desc">
            <DialogHeader>
              <DialogTitle>Create Rail Replacement Service</DialogTitle>
              <DialogDescription id="create-rail-service-desc">
                Create a new rail replacement service with all necessary details including schedule, resources, and requirements.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input
                    value={newService.serviceName || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, serviceName: e.target.value }))}
                    placeholder="e.g., Northern Line Emergency Replacement"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Code</Label>
                  <Input
                    value={newService.serviceCode || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, serviceCode: e.target.value }))}
                    placeholder="e.g., RR001"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Select value={newService.serviceType} onValueChange={(value) => setNewService(prev => ({ ...prev, serviceType: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newService.priority} onValueChange={(value) => setNewService(prev => ({ ...prev, priority: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newService.status} onValueChange={(value) => setNewService(prev => ({ ...prev, status: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Affected Line</Label>
                  <Input
                    value={newService.affectedLine || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, affectedLine: e.target.value }))}
                    placeholder="e.g., Northern Line"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Input
                    value={newService.frequency || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, frequency: e.target.value }))}
                    placeholder="e.g., Every 8 minutes"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newService.startDate || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={newService.endDate || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Vehicles Required</Label>
                  <Input
                    type="number"
                    value={newService.vehiclesRequired || 0}
                    onChange={(e) => setNewService(prev => ({ ...prev, vehiclesRequired: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passengers Affected</Label>
                  <Input
                    type="number"
                    value={newService.passengersAffected || 0}
                    onChange={(e) => setNewService(prev => ({ ...prev, passengersAffected: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Cost (£)</Label>
                  <Input
                    type="number"
                    value={newService.estimatedCost || 0}
                    onChange={(e) => setNewService(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={newService.notes || ''}
                  onChange={(e) => setNewService(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the replacement service"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateService} className="flex-1">
                  Create Service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Train className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalServices}</p>
                <p className="text-xs text-muted-foreground">Total Services</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeServices}</p>
                <p className="text-xs text-muted-foreground">Active Services</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{emergencyServices}</p>
                <p className="text-xs text-muted-foreground">Emergency Services</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bus className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{totalVehicles}</p>
                <p className="text-xs text-muted-foreground">Vehicles Deployed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{totalPassengers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Passengers Served</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{averagePerformance.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">On-Time Performance</p>
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
              placeholder="Search by service name, line, or code..."
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
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rail Replacement Services</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Info</TableHead>
                <TableHead>Affected Line</TableHead>
                <TableHead>Type & Priority</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{service.serviceName}</p>
                      <p className="text-sm text-muted-foreground">{service.serviceCode}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{service.affectedLine}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge className={getTypeColor(service.serviceType)}>
                        {service.serviceType}
                      </Badge>
                      <Badge className={getPriorityColor(service.priority)}>
                        {service.priority}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">
                        {service.startDate && service.endDate ? 
                          `${format(new Date(service.startDate), 'MMM dd')} - ${format(new Date(service.endDate), 'MMM dd')}` : 
                          'Date not set'
                        }
                      </p>
                      <p className="text-muted-foreground">{service.frequency}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{service.vehiclesAssigned}/{service.vehiclesRequired} vehicles</p>
                      <p className="text-muted-foreground">{service.passengersAffected.toLocaleString()} passengers</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(service.status)}>
                      <div className="flex items-center space-x-1">
                        {service.status === 'active' && <CheckCircle className="w-4 h-4" />}
                        {service.status === 'planned' && <Clock className="w-4 h-4" />}
                        {service.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                        {service.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                        <span className="capitalize">{service.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{service.performanceMetrics.onTimePerformance}%</p>
                      <p className="text-muted-foreground">On-time</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(service)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Service Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="service-details-desc">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Train className="w-5 h-5" />
              <span>{selectedService?.serviceName}</span>
            </DialogTitle>
            <DialogDescription id="service-details-desc">
              View detailed information about this rail replacement service including stops, performance metrics, and resource allocation.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stops">Stops</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Service Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Service Code:</strong> {selectedService.serviceCode}</div>
                        <div><strong>Affected Line:</strong> {selectedService.affectedLine}</div>
                        <div><strong>Type:</strong> 
                          <Badge className={`ml-2 ${getTypeColor(selectedService.serviceType)}`}>
                            {selectedService.serviceType}
                          </Badge>
                        </div>
                        <div><strong>Priority:</strong> 
                          <Badge className={`ml-2 ${getPriorityColor(selectedService.priority)}`}>
                            {selectedService.priority}
                          </Badge>
                        </div>
                        <div><strong>Status:</strong> 
                          <Badge className={`ml-2 ${getStatusColor(selectedService.status)}`}>
                            {selectedService.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Schedule</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Period:</strong> {selectedService.startDate && selectedService.endDate ? 
                          `${format(new Date(selectedService.startDate), 'MMM dd, yyyy')} - ${format(new Date(selectedService.endDate), 'MMM dd, yyyy')}` : 
                          'Date not set'
                        }</div>
                        <div><strong>Frequency:</strong> {selectedService.frequency}</div>
                        <div><strong>Passengers Affected:</strong> {selectedService.passengersAffected.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Resource Allocation</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-3">
                            <div className="text-center">
                              <Bus className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                              <div className="text-lg font-bold">{selectedService.vehiclesAssigned}/{selectedService.vehiclesRequired}</div>
                              <div className="text-xs text-muted-foreground">Vehicles</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <div className="text-center">
                              <Users className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                              <div className="text-lg font-bold">{selectedService.passengersAffected.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Passengers</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Performance Metrics</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>On-Time Performance:</strong> {selectedService.performanceMetrics.onTimePerformance}%</div>
                        <div><strong>Passenger Satisfaction:</strong> {selectedService.performanceMetrics.passengerSatisfaction}/5</div>
                        <div><strong>Response Time:</strong> {selectedService.performanceMetrics.responseTime} minutes</div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedService.specialRequirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Special Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.specialRequirements.map((req, index) => (
                        <Badge key={index} variant="secondary">{req}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedService.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <div className="p-3 bg-gray-50 rounded border text-sm">
                      {selectedService.notes}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stops" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Rail Replacement Stops</h3>
                  <Button onClick={() => setIsStopsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stop
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {railStops.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Route className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No stops configured for this rail replacement service</p>
                      <p className="text-sm text-gray-500">Add stops to define pickup and dropoff points</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {railStops.map((stop, index) => (
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
                                    {stop.rail_station_name && (
                                      <span className="text-sm text-gray-500">
                                        <Train className="w-3 h-3 inline mr-1" />
                                        {stop.rail_station_name}
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
                                    setStopFormData({
                                      stop_name: stop.stop_name,
                                      stop_type: stop.stop_type,
                                      address: stop.address,
                                      estimated_time: stop.estimated_time || '',
                                      stop_order: stop.stop_order,
                                      passenger_count: stop.passenger_count,
                                      rail_station_name: stop.rail_station_name || '',
                                      rail_line: stop.rail_line || '',
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

              <TabsContent value="performance" className="space-y-4">
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Performance analytics interface will be implemented here</p>
                  <p className="text-sm text-gray-500">Track service performance, passenger satisfaction, and operational metrics</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Stops Management Dialog */}
      <Dialog open={isStopsDialogOpen} onOpenChange={setIsStopsDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="stops-management-desc">
          <DialogHeader>
            <DialogTitle>Manage Rail Replacement Stop</DialogTitle>
            <DialogDescription id="stops-management-desc">
              Add or edit stops for this rail replacement service. Configure pickup and dropoff points with timing and passenger information.
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
                  placeholder="e.g., King's Cross Station"
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rail_station_name">Rail Station Name</Label>
                <Input
                  id="rail_station_name"
                  value={stopFormData.rail_station_name}
                  onChange={(e) => setStopFormData({ ...stopFormData, rail_station_name: e.target.value })}
                  placeholder="e.g., King's Cross"
                />
              </div>
              <div>
                <Label htmlFor="rail_line">Rail Line</Label>
                <Input
                  id="rail_line"
                  value={stopFormData.rail_line}
                  onChange={(e) => setStopFormData({ ...stopFormData, rail_line: e.target.value })}
                  placeholder="e.g., Northern Line"
                />
              </div>
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
    </div>
  );
};

export default RailReplacementEnhanced;
