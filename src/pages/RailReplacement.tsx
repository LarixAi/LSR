import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Train, 
  Bus, 
  MapPin, 
  Clock, 
  Users, 
  AlertTriangle, 
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Navigation,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface RailReplacementService {
  id: string;
  routeName: string;
  affectedLine: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'planned' | 'completed' | 'cancelled';
  vehiclesAssigned: number;
  passengersAffected: number;
  pickupPoints: string[];
  dropoffPoints: string[];
  frequency: string;
  estimatedCost: number;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for rail replacement services
const mockRailServices: RailReplacementService[] = [
  {
    id: '1',
    routeName: 'Northern Line Replacement',
    affectedLine: 'Northern Line (King\'s Cross to Finchley Central)',
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    status: 'active',
    vehiclesAssigned: 12,
    passengersAffected: 850,
    pickupPoints: ['King\'s Cross Station', 'Camden Town', 'Kentish Town', 'Tufnell Park'],
    dropoffPoints: ['Archway', 'Highgate', 'East Finchley', 'Finchley Central'],
    frequency: 'Every 10 minutes',
    estimatedCost: 125000,
    contactPerson: 'Sarah Mitchell',
    contactPhone: '+44 20 7946 0958',
    contactEmail: 'sarah.mitchell@lsr.co.uk',
    notes: 'Major track upgrade works requiring full line closure',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    routeName: 'Victoria Line Weekend Service',
    affectedLine: 'Victoria Line (Tottenham Hale to Brixton)',
    startDate: '2024-02-03',
    endDate: '2024-02-04',
    status: 'planned',
    vehiclesAssigned: 8,
    passengersAffected: 420,
    pickupPoints: ['Tottenham Hale', 'Seven Sisters', 'Finsbury Park', 'Highbury & Islington'],
    dropoffPoints: ['King\'s Cross', 'Oxford Circus', 'Victoria', 'Brixton'],
    frequency: 'Every 15 minutes',
    estimatedCost: 45000,
    contactPerson: 'James Rodriguez',
    contactPhone: '+44 20 7946 0723',
    contactEmail: 'james.rodriguez@lsr.co.uk',
    notes: 'Weekend engineering works - signalling system upgrade',
    createdAt: '2024-01-20T11:15:00Z',
    updatedAt: '2024-01-25T16:45:00Z'
  },
  {
    id: '3',
    routeName: 'Central Line Emergency Replacement',
    affectedLine: 'Central Line (Liverpool Street to Stratford)',
    startDate: '2024-01-28',
    endDate: '2024-01-28',
    status: 'completed',
    vehiclesAssigned: 6,
    passengersAffected: 320,
    pickupPoints: ['Liverpool Street', 'Bethnal Green', 'Mile End'],
    dropoffPoints: ['Stratford', 'West Ham', 'Plaistow'],
    frequency: 'Every 8 minutes',
    estimatedCost: 18500,
    contactPerson: 'Emma Thompson',
    contactPhone: '+44 20 7946 0634',
    contactEmail: 'emma.thompson@lsr.co.uk',
    notes: 'Emergency service due to signal failure - resolved same day',
    createdAt: '2024-01-28T06:30:00Z',
    updatedAt: '2024-01-28T20:15:00Z'
  }
];

const RailReplacement: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [services, setServices] = useState<RailReplacementService[]>(mockRailServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<RailReplacementService | null>(null);
  
  // Form state for creating new service
  const [newService, setNewService] = useState<Partial<RailReplacementService>>({
    routeName: '',
    affectedLine: '',
    startDate: '',
    endDate: '',
    status: 'planned',
    vehiclesAssigned: 0,
    passengersAffected: 0,
    pickupPoints: [],
    dropoffPoints: [],
    frequency: '',
    estimatedCost: 0,
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
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

  // Check if user has access (admin or council only)
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Filter services based on search and status
  const filteredServices = services.filter(service => {
    const matchesSearch = service.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.affectedLine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalServices = services.length;
  const activeServices = services.filter(s => s.status === 'active').length;
  const plannedServices = services.filter(s => s.status === 'planned').length;
  const totalVehicles = services.reduce((sum, s) => sum + s.vehiclesAssigned, 0);
  const totalPassengers = services.reduce((sum, s) => sum + s.passengersAffected, 0);
  const totalCost = services.reduce((sum, s) => sum + s.estimatedCost, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'planned': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleCreateService = () => {
    const service: RailReplacementService = {
      ...newService as RailReplacementService,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setServices([...services, service]);
    setIsCreateDialogOpen(false);
    setNewService({
      routeName: '',
      affectedLine: '',
      startDate: '',
      endDate: '',
      status: 'planned',
      vehiclesAssigned: 0,
      passengersAffected: 0,
      pickupPoints: [],
      dropoffPoints: [],
      frequency: '',
      estimatedCost: 0,
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Train className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Rail Replacement Services</h1>
              <p className="text-muted-foreground">Manage bus replacement services for rail disruptions</p>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Rail Replacement Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Route Name</label>
                  <Input
                    value={newService.routeName || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, routeName: e.target.value }))}
                    placeholder="Enter route name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Affected Line</label>
                  <Input
                    value={newService.affectedLine || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, affectedLine: e.target.value }))}
                    placeholder="Enter affected rail line"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={newService.startDate || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={newService.endDate || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicles Required</label>
                  <Input
                    type="number"
                    value={newService.vehiclesAssigned || 0}
                    onChange={(e) => setNewService(prev => ({ ...prev, vehiclesAssigned: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Passengers Affected</label>
                  <Input
                    type="number"
                    value={newService.passengersAffected || 0}
                    onChange={(e) => setNewService(prev => ({ ...prev, passengersAffected: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Cost (£)</label>
                  <Input
                    type="number"
                    value={newService.estimatedCost || 0}
                    onChange={(e) => setNewService(prev => ({ ...prev, estimatedCost: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service Frequency</label>
                <Input
                  value={newService.frequency || ''}
                  onChange={(e) => setNewService(prev => ({ ...prev, frequency: e.target.value }))}
                  placeholder="e.g., Every 10 minutes"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Person</label>
                  <Input
                    value={newService.contactPerson || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Phone</label>
                  <Input
                    value={newService.contactPhone || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+44 20 ..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Email</label>
                  <Input
                    type="email"
                    value={newService.contactEmail || ''}
                    onChange={(e) => setNewService(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="email@lsr.co.uk"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
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
              <CheckCircle className="h-8 w-8 text-green-600" />
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
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{plannedServices}</p>
                <p className="text-xs text-muted-foreground">Planned Services</p>
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
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">£{(totalCost / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Total Cost</p>
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
              placeholder="Search by route name or affected line..."
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
                <TableHead>Route Name</TableHead>
                <TableHead>Affected Line</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Passengers</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.routeName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{service.affectedLine}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(service.startDate), 'MMM dd')} - {format(new Date(service.endDate), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(service.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(service.status)}
                        <span className="capitalize">{service.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>{service.vehiclesAssigned}</TableCell>
                  <TableCell>{service.passengersAffected.toLocaleString()}</TableCell>
                  <TableCell>£{(service.estimatedCost / 1000).toFixed(0)}k</TableCell>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Train className="w-5 h-5" />
              <span>{selectedService?.routeName}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Service Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Affected Line:</strong> {selectedService.affectedLine}</div>
                      <div><strong>Period:</strong> {format(new Date(selectedService.startDate), 'MMM dd, yyyy')} - {format(new Date(selectedService.endDate), 'MMM dd, yyyy')}</div>
                      <div><strong>Frequency:</strong> {selectedService.frequency}</div>
                      <div><strong>Status:</strong> 
                        <Badge className={`ml-2 ${getStatusColor(selectedService.status)}`}>
                          {selectedService.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{selectedService.contactPerson}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{selectedService.contactPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{selectedService.contactEmail}</span>
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
                            <Bus className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                            <div className="text-lg font-bold">{selectedService.vehiclesAssigned}</div>
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
                      <Card className="col-span-2">
                        <CardContent className="p-3">
                          <div className="text-center">
                            <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-600" />
                            <div className="text-lg font-bold">£{selectedService.estimatedCost.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Estimated Cost</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pickup and Dropoff Points */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span>Pickup Points</span>
                  </h3>
                  <div className="space-y-1">
                    {selectedService.pickupPoints.map((point, index) => (
                      <div key={index} className="text-sm p-2 bg-green-50 rounded border-l-4 border-green-200">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>Dropoff Points</span>
                  </h3>
                  <div className="space-y-1">
                    {selectedService.dropoffPoints.map((point, index) => (
                      <div key={index} className="text-sm p-2 bg-red-50 rounded border-l-4 border-red-200">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedService.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <div className="p-3 bg-gray-50 rounded border text-sm">
                    {selectedService.notes}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-muted-foreground border-t pt-4">
                <div>Created: {format(new Date(selectedService.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                <div>Updated: {format(new Date(selectedService.updatedAt), 'MMM dd, yyyy HH:mm')}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RailReplacement;

