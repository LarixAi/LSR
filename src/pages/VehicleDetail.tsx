import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  MapPin, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Users,
  Fuel,
  Gauge,
  Settings,
  Edit,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  Tag,
  Shield,
  Scale,
  Truck,
  DollarSign
} from 'lucide-react';
import FinancialTab from '@/components/vehicles/FinancialTab';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import { format } from 'date-fns';
import { 
  useVehicle, 
  useDailyRunningCosts, 
  useTyres,
  useVehicleAssignments,
  useWalkAroundChecks,
  useVehicleStatistics,
  useServiceRecords,
  useInspections,
  useWorkOrders,
  useMaintenanceSchedule,
  useVehicleDocuments,
  type Vehicle,
  type DailyRunningCost,
  type Tyre,
  type VehicleAssignment,
  type WalkAroundCheck,
  type ServiceRecord,
  type Inspection,
  type WorkOrder,
  type MaintenanceSchedule,
  type VehicleDocument
} from '@/hooks/useVehicleManagement';

export default function VehicleDetail() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Data hooks
  const { data: vehicle, isLoading: loading, error: vehicleError } = useVehicle(vehicleId || '');
  const { data: dailyRunningCosts = [] } = useDailyRunningCosts(vehicleId || '');
  const { data: tyres = [] } = useTyres(vehicleId || '');
  const { data: vehicleAssignments = [] } = useVehicleAssignments(vehicleId || '');
  const { data: walkAroundChecks = [] } = useWalkAroundChecks(vehicleId || '');
  const { data: vehicleStats } = useVehicleStatistics(vehicleId || '');
  const { data: serviceRecords = [] } = useServiceRecords(vehicleId || '');
  const { data: inspections = [] } = useInspections(vehicleId || '');
  const { data: workOrders = [] } = useWorkOrders(vehicleId || '');
  const { data: maintenanceSchedule = [] } = useMaintenanceSchedule(vehicleId || '');
  const { data: documents = [] } = useVehicleDocuments(vehicleId || '');

  // Mock documents for demonstration
  const mockDocuments: VehicleDocument[] = [
    {
      id: 'doc-1',
      vehicle_id: vehicleId || '',
      document_type: 'Registration',
      document_name: 'Vehicle Registration Certificate',
      file_url: '/documents/registration.pdf',
      expiry_date: '2025-01-15',
      status: 'Valid',
      uploaded_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'doc-2',
      vehicle_id: vehicleId || '',
      document_type: 'Insurance',
      document_name: 'Motor Vehicle Insurance Certificate',
      file_url: '/documents/insurance.pdf',
      expiry_date: '2024-12-31',
      status: 'Valid',
      uploaded_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'doc-3',
      vehicle_id: vehicleId || '',
      document_type: 'MOT Certificate',
      document_name: 'MOT Test Certificate',
      file_url: '/documents/mot.pdf',
      expiry_date: '2024-06-15',
      status: 'Valid',
      uploaded_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'doc-4',
      vehicle_id: vehicleId || '',
      document_type: 'PSV License',
      document_name: 'Public Service Vehicle License',
      file_url: '/documents/psv-license.pdf',
      expiry_date: '2025-03-20',
      status: 'Valid',
      uploaded_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'doc-5',
      vehicle_id: vehicleId || '',
      document_type: 'Service History',
      document_name: 'Complete Service History',
      file_url: '/documents/service-history.pdf',
      expiry_date: null,
      status: 'Valid',
      uploaded_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'doc-6',
      vehicle_id: vehicleId || '',
      document_type: 'Tax Certificate',
      document_name: 'Vehicle Tax Certificate',
      file_url: '/documents/tax-certificate.pdf',
      expiry_date: '2024-08-31',
      status: 'Valid',
      uploaded_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'doc-7',
      vehicle_id: vehicleId || '',
      document_type: 'Operator License',
      document_name: 'Transport Operator License',
      file_url: '/documents/operator-license.pdf',
      expiry_date: '2026-05-10',
      status: 'Valid',
      uploaded_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'doc-8',
      vehicle_id: vehicleId || '',
      document_type: 'Safety Certificate',
      document_name: 'Vehicle Safety Inspection Certificate',
      file_url: '/documents/safety-certificate.pdf',
      expiry_date: '2024-09-30',
      status: 'Valid',
      uploaded_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ];

  // Use mock documents for demonstration (replace with real data when backend is ready)
  const displayDocuments = mockDocuments;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-yellow-600" />;
      case 'out_of_service':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Car className="w-4 h-4 text-gray-400" />;
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'bus':
        return <Users className="w-4 h-4" />;
      case 'coach':
        return <Users className="w-4 h-4" />;
      case 'hgv':
        return <Truck className="w-4 h-4" />;
      case 'minibus':
        return <Users className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const getWalkAroundStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWalkAroundStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Car className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (vehicleError || !vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{vehicleError?.message || 'Error loading vehicle details'}</p>
          <Button onClick={() => navigate('/vehicles')} className="mt-4">
            Back to Vehicles
          </Button>
        </div>
      </div>
    );
  }

  // Tab options
  const tabOptions = [
    { value: "overview", label: "Overview" },
    { value: "service", label: "Service History" },
    { value: "inspections", label: "Inspections" },
    { value: "workorders", label: "Work Orders" },
    { value: "maintenance", label: "Maintenance" },
    { value: "walkaround", label: "Walk Around Check" },
    { value: "costs", label: "Daily Costs" },
    { value: "documents", label: "Documents" },
    { value: "financial", label: "Financial" }
  ];

  // Filter options
  const statusFilterOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "maintenance", label: "Maintenance" },
    { value: "out_of_service", label: "Out of Service" }
  ];

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/vehicles')} className="p-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600">Vehicles</span>
      </div>

      {/* Vehicle Profile Header - Above Search Bar */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-6">
          {/* Vehicle Image Placeholder */}
          <div className="relative">
            <div className="w-24 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-300 overflow-hidden shadow-sm">
              {/* Vehicle Image or Placeholder */}
              <div className="w-full h-full flex items-center justify-center">
                {vehicle.avatar_url ? (
                  <img 
                    src={vehicle.avatar_url} 
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <div className="text-center">
                      <Car className="w-8 h-8 text-blue-400 mx-auto mb-1" />
                      <div className="text-xs text-blue-600 font-medium">
                        {vehicle.make?.charAt(0) || 'V'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Upload Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 w-6 rounded-full p-0 bg-white/80 hover:bg-white"
                  onClick={() => console.log('Upload vehicle image')}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Vehicle Information */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {vehicle.vehicle_number} [{vehicle.year} {vehicle.make} {vehicle.model}]
            </h1>
            <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span className="font-medium">{vehicle.type || 'Bus'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Car className="w-4 h-4" />
                <span>{vehicle.license_plate}</span>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(vehicle.status || 'active')}
                <Badge className={getStatusColor(vehicle.status || 'active')}>
                  {vehicle.status || 'Active'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="w-4 h-4" />
                <span>{vehicle.mileage?.toLocaleString() || '0'} mi</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Capacity: {vehicle.seating_capacity || vehicle.capacity || '0'} seats</span>
              </div>
              <div className="flex items-center gap-1">
                <Fuel className="w-4 h-4" />
                <span>Fuel: {vehicle.fuel_type || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/vehicles/${vehicleId}/assign-driver`)}
          >
            <Users className="w-4 h-4 mr-2" />
            Assign Driver
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => navigate(`/vehicles/${vehicleId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Vehicle
          </Button>
        </div>
      </div>

      {/* Page Layout */}
      <PageLayout
        title=""
        description=""
        summaryCards={[]}
        searchPlaceholder="Search vehicle records..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: statusFilterOptions
          }
        ]}
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >

        {/* Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Make:</span>
                    <p className="font-medium">{vehicle.make || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Model:</span>
                    <p className="font-medium">{vehicle.model || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Year:</span>
                    <p className="font-medium">{vehicle.year || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">VIN:</span>
                    <p className="font-medium">{vehicle.vin || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Color:</span>
                    <p className="font-medium">{vehicle.color || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fuel Type:</span>
                    <p className="font-medium">{vehicle.fuel_type || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Status & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(vehicle.status || 'active')}
                  <Badge className={getStatusColor(vehicle.status || 'active')}>
                    {vehicle.status || 'Active'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>MOT Expiry:</span>
                    <span className="font-medium">{vehicle.mot_expiry ? format(new Date(vehicle.mot_expiry), 'MMM dd, yyyy') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next Service:</span>
                    <span className="font-medium">{vehicle.next_service_date ? format(new Date(vehicle.next_service_date), 'MMM dd, yyyy') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Insurance Expiry:</span>
                    <span className="font-medium">{vehicle.insurance_expiry ? format(new Date(vehicle.insurance_expiry), 'MMM dd, yyyy') : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Service Records:</span>
                    <span className="font-medium">{serviceRecords.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Open Work Orders:</span>
                    <span className="font-medium">{workOrders.filter(wo => wo.status === 'Open').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Upcoming Inspections:</span>
                    <span className="font-medium">{inspections.filter(i => new Date(i.next_inspection_date) > new Date()).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Walk Around Checks:</span>
                    <span className="font-medium">{vehicleStats?.totalChecks || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Failed Checks:</span>
                    <span className="font-medium text-red-600">{vehicleStats?.failedChecks || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Daily Costs (30 days):</span>
                    <span className="font-medium">£{(vehicleStats?.totalCosts || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Distance:</span>
                    <span className="font-medium">{(vehicleStats?.totalDistance || 0).toLocaleString()} mi</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tyre Value:</span>
                    <span className="font-medium">£{(vehicleStats?.tyreValue || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tyres Needing Replacement:</span>
                    <span className="font-medium text-orange-600">{vehicleStats?.tyresNeedingReplacement || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="service" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Next Service</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.service_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{record.service_type}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell>{record.mileage?.toLocaleString()} mi</TableCell>
                      <TableCell>{record.vendor}</TableCell>
                      <TableCell>£{record.cost?.toFixed(2)}</TableCell>
                      <TableCell>{record.next_service_date ? format(new Date(record.next_service_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inspection History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Next Inspection</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspections.map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell>{format(new Date(inspection.inspection_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{inspection.inspection_type}</TableCell>
                      <TableCell>
                        <Badge variant={inspection.result === 'Passed' ? 'default' : 'destructive'}>
                          {inspection.result}
                        </Badge>
                      </TableCell>
                      <TableCell>{inspection.inspector}</TableCell>
                      <TableCell>{inspection.next_inspection_date ? format(new Date(inspection.next_inspection_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                      <TableCell>{inspection.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workorders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((workOrder) => (
                    <TableRow key={workOrder.id}>
                      <TableCell>{workOrder.title}</TableCell>
                      <TableCell>
                        <Badge variant={workOrder.status === 'Completed' ? 'default' : 'secondary'}>
                          {workOrder.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={workOrder.priority === 'High' ? 'destructive' : 'outline'}>
                          {workOrder.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{workOrder.assigned_to}</TableCell>
                      <TableCell>{workOrder.due_date ? format(new Date(workOrder.due_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                      <TableCell>£{workOrder.cost?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Maintenance Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Last Performed</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Estimated Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceSchedule.map((maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell>{maintenance.maintenance_type}</TableCell>
                      <TableCell>{maintenance.frequency_months} months</TableCell>
                      <TableCell>{maintenance.last_performed ? format(new Date(maintenance.last_performed), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                      <TableCell>{maintenance.next_due ? format(new Date(maintenance.next_due), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                      <TableCell>£{maintenance.estimated_cost?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="walkaround" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Walk Around Check History</CardTitle>
              <CardDescription>
                All vehicle walk-around checks performed by drivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {walkAroundChecks.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No walk-around checks</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No walk-around checks have been performed for this vehicle yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {walkAroundChecks.map((check) => (
                    <div 
                      key={check.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/walk-around-checks/${check.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getWalkAroundStatusIcon(check.overall_status)}
                            <Badge className={getWalkAroundStatusColor(check.overall_status)}>
                              {check.overall_status.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Walk Around Check - {format(new Date(check.check_date), 'MMM dd, yyyy')}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Performed by {check.profiles?.first_name} {check.profiles?.last_name} at {check.check_time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {check.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            {check.mileage.toLocaleString()} mi
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {check.defects_found} defects
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Summary */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {check.notes.length > 100 ? `${check.notes.substring(0, 100)}...` : check.notes}
                          </span>
                          <span className="text-blue-600 font-medium">Click to view details →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Daily Running Costs
              </CardTitle>
              <CardDescription>
                Track daily operational costs for this vehicle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Fuel Cost</TableHead>
                    <TableHead>Maintenance</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Depreciation</TableHead>
                    <TableHead>Other</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyRunningCosts.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell>{format(new Date(cost.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>£{cost.fuel_cost.toFixed(2)}</TableCell>
                      <TableCell>£{cost.maintenance_cost.toFixed(2)}</TableCell>
                      <TableCell>£{cost.insurance_cost.toFixed(2)}</TableCell>
                      <TableCell>£{cost.tax_cost.toFixed(2)}</TableCell>
                      <TableCell>£{cost.depreciation_cost.toFixed(2)}</TableCell>
                      <TableCell>£{cost.other_costs.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">£{cost.total_cost.toFixed(2)}</TableCell>
                      <TableCell>{cost.distance_traveled} mi</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total costs for {dailyRunningCosts.length} days: £{dailyRunningCosts.reduce((sum, cost) => sum + cost.total_cost, 0).toFixed(2)}
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Daily Cost
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayDocuments.map((doc) => (
                    <TableRow 
                      key={doc.id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => navigate(`/vehicles/${vehicleId}/documents/${doc.id}`)}
                    >
                      <TableCell>{doc.document_type}</TableCell>
                      <TableCell>{doc.document_name}</TableCell>
                      <TableCell>
                        <Badge variant={doc.status === 'Valid' ? 'default' : 'destructive'}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.expiry_date ? format(new Date(doc.expiry_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                      <TableCell>{format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/vehicles/${vehicleId}/documents/${doc.id}`);
                          }}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <FinancialTab />
        </TabsContent>
      </PageLayout>
    </div>
  );
}
