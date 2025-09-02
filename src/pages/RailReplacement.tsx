import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Train, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  MapPin,
  Navigation,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  BarChart3,
  Route,
  Bus,
  Phone,
  Mail
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

interface RailReplacementService {
  id: string;
  serviceName: string;
  serviceNumber: string;
  routeName: string;
  startStation: string;
  endStation: string;
  status: 'active' | 'scheduled' | 'completed' | 'cancelled';
  serviceType: 'bus' | 'coach' | 'minibus' | 'taxi';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  frequency: 'hourly' | 'every_30min' | 'every_15min' | 'custom';
  assignedVehicleId: string;
  assignedDriverId: string;
  vehicleRegistration: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  currentPassengers: number;
  estimatedDuration: number;
  distance: number;
  hourlyRate: number;
  totalCost: number;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function RailReplacement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('services');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<RailReplacementService | null>(null);

  // Mock data - replace with actual API calls
  const railServices: RailReplacementService[] = [
    {
      id: '1',
      serviceName: 'London Victoria to Gatwick Express',
      serviceNumber: 'RR-001',
      routeName: 'Victoria - Gatwick Airport',
      startStation: 'London Victoria',
      endStation: 'Gatwick Airport',
      status: 'active',
      serviceType: 'coach',
      startDate: '2024-08-28',
      endDate: '2024-08-30',
      startTime: '06:00',
      endTime: '23:00',
      frequency: 'hourly',
      assignedVehicleId: 'V001',
      assignedDriverId: 'D001',
      vehicleRegistration: 'AB12 CDE',
      driverName: 'John Smith',
      driverPhone: '+44 7700 900123',
      capacity: 50,
      currentPassengers: 35,
      estimatedDuration: 90,
      distance: 45.2,
      hourlyRate: 85,
      totalCost: 2040,
      contactPerson: 'Mr. Johnson',
      contactPhone: '+44 20 7123 4567',
      contactEmail: 'rail@transport.co.uk',
      notes: 'Replacing Southern Railway service due to track maintenance',
      createdAt: '2024-08-27T10:00:00Z',
      updatedAt: '2024-08-27T10:00:00Z'
    },
    {
      id: '2',
      serviceName: 'Manchester Piccadilly to Airport',
      serviceNumber: 'RR-002',
      routeName: 'Piccadilly - Manchester Airport',
      startStation: 'Manchester Piccadilly',
      endStation: 'Manchester Airport',
      status: 'scheduled',
      serviceType: 'bus',
      startDate: '2024-09-01',
      endDate: '2024-09-03',
      startTime: '05:30',
      endTime: '00:30',
      frequency: 'every_30min',
      assignedVehicleId: 'V002',
      assignedDriverId: 'D002',
      vehicleRegistration: 'XY34 FGH',
      driverName: 'Sarah Wilson',
      driverPhone: '+44 7700 900456',
      capacity: 40,
      currentPassengers: 0,
      estimatedDuration: 45,
      distance: 15.8,
      hourlyRate: 65,
      totalCost: 1170,
      contactPerson: 'Ms. Davis',
      contactPhone: '+44 161 234 5678',
      contactEmail: 'airport@transport.co.uk',
      notes: 'Scheduled replacement for TransPennine Express service',
      createdAt: '2024-08-26T15:00:00Z',
      updatedAt: '2024-08-26T15:00:00Z'
    },
    {
      id: '3',
      serviceName: 'Birmingham New Street to International',
      serviceNumber: 'RR-003',
      routeName: 'New Street - Birmingham International',
      startStation: 'Birmingham New Street',
      endStation: 'Birmingham International',
      status: 'completed',
      serviceType: 'minibus',
      startDate: '2024-08-20',
      endDate: '2024-08-22',
      startTime: '07:00',
      endTime: '22:00',
      frequency: 'every_15min',
      assignedVehicleId: 'V003',
      assignedDriverId: 'D003',
      vehicleRegistration: 'MN56 PQR',
      driverName: 'Mike Johnson',
      driverPhone: '+44 7700 900789',
      capacity: 20,
      currentPassengers: 0,
      estimatedDuration: 25,
      distance: 12.5,
      hourlyRate: 45,
      totalCost: 540,
      contactPerson: 'Mr. Thompson',
      contactPhone: '+44 121 345 6789',
      contactEmail: 'birmingham@transport.co.uk',
      notes: 'Completed replacement service for Avanti West Coast',
      createdAt: '2024-08-19T09:00:00Z',
      updatedAt: '2024-08-22T18:00:00Z'
    }
  ];

  // Calculate statistics
  const totalServices = railServices.length;
  const activeServices = railServices.filter(service => service.status === 'active').length;
  const totalPassengers = railServices.reduce((sum, service) => sum + service.currentPassengers, 0);
  const totalRevenue = railServices.reduce((sum, service) => sum + service.totalCost, 0);

  // Filter services based on search and filters
  const filteredServices = railServices.filter(service => {
    const matchesSearch = searchTerm === '' || 
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.serviceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesType = serviceTypeFilter === 'all' || service.serviceType === serviceTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getServiceTypeBadge = (type: string) => {
    switch (type) {
      case 'bus':
        return <Badge className="bg-blue-100 text-blue-800">Bus</Badge>;
      case 'coach':
        return <Badge className="bg-green-100 text-green-800">Coach</Badge>;
      case 'minibus':
        return <Badge className="bg-purple-100 text-purple-800">Minibus</Badge>;
      case 'taxi':
        return <Badge className="bg-orange-100 text-orange-800">Taxi</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <PageLayout
      title="Rail Replacement"
      description="Manage rail replacement services and alternative transportation during rail disruptions"
      actionButton={{
        label: "Create Service",
        onClick: () => setShowCreateDialog(true),
        icon: <Plus className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Total Services",
          value: totalServices,
          icon: <Train className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "Active Services",
          value: activeServices,
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-green-600"
        },
        {
          title: "Passengers",
          value: totalPassengers,
          icon: <Users className="h-4 w-4" />,
          color: "text-purple-600"
        },
        {
          title: "Total Revenue",
          value: `£${totalRevenue.toLocaleString()}`,
          icon: <DollarSign className="h-4 w-4" />,
          color: "text-green-600"
        }
      ]}
      searchPlaceholder="Search rail replacement services..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "All Statuses",
          value: statusFilter,
          options: [
            { value: "all", label: "All Statuses" },
            { value: "active", label: "Active" },
            { value: "scheduled", label: "Scheduled" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" }
          ],
          onChange: setStatusFilter
        },
        {
          label: "All Types",
          value: serviceTypeFilter,
          options: [
            { value: "all", label: "All Types" },
            { value: "bus", label: "Bus" },
            { value: "coach", label: "Coach" },
            { value: "minibus", label: "Minibus" },
            { value: "taxi", label: "Taxi" }
          ],
          onChange: setServiceTypeFilter
        }
      ]}
      tabs={[
        { value: "services", label: "Services" },
        { value: "routes", label: "Routes" },
        { value: "analytics", label: "Analytics" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={false}
    >
      {/* Content based on active tab */}
      {activeTab === 'services' && (
        <Card>
          <CardHeader>
            <CardTitle>Rail Replacement Services</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.serviceName}</p>
                        <p className="text-sm text-gray-500">{service.serviceNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.startStation} → {service.endStation}</p>
                        <p className="text-sm text-gray-500">{service.distance}km</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.driverName}</p>
                        <p className="text-sm text-gray-500">{service.driverPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.vehicleRegistration}</p>
                        <p className="text-sm text-gray-500">Capacity: {service.capacity}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getServiceTypeBadge(service.serviceType)}</TableCell>
                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.startTime} - {service.endTime}</p>
                        <p className="text-sm text-gray-500">{service.frequency.replace('_', ' ')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {service.currentPassengers}/{service.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
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

      {activeTab === 'routes' && (
        <Card>
          <CardHeader>
            <CardTitle>Route Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Route className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Route management features coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Manage route planning, stops, and scheduling for rail replacement services
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Service Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Service analytics features coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Performance metrics, passenger analytics, and service optimization insights
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Service Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="create-rail-service-desc">
          <DialogHeader>
            <DialogTitle>Create New Rail Replacement Service</DialogTitle>
            <DialogDescription id="create-rail-service-desc">
              Create a new rail replacement service with all necessary details and configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Rail replacement service creation form will be implemented here.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                Create Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}