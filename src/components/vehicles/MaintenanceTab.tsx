import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Car,
  Tool,
  Settings,
  FileText,
  Eye,
  Download,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Lock,
  DollarSign,
  Users,
  Gauge,
  Zap,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface MaintenanceData {
  maintenanceSchedules: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    vehicleName: string;
    vehicleImage?: string;
    maintenanceType: 'scheduled' | 'preventive' | 'corrective' | 'emergency';
    description: string;
    scheduledDate: string;
    estimatedDuration: number;
    estimatedCost: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
    assignedMechanic?: string;
    partsRequired: string[];
    notes: string;
    watchers?: string[];
    totalCost?: number;
    isLocked?: boolean;
  }[];
  serviceHistory: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    vehicleName: string;
    vehicleImage?: string;
    serviceType: string;
    serviceDate: string;
    mileage: number;
    mechanic: string;
    cost: number;
    description: string;
    partsUsed: string[];
    nextServiceDate: string;
    nextServiceMileage: number;
    status: 'completed' | 'in_progress' | 'scheduled';
    watchers?: string[];
    priority?: string;
    totalCost?: number;
    isLocked?: boolean;
  }[];
  workOrders: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    vehicleName: string;
    vehicleImage?: string;
    workOrderNumber: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
    workType: 'preventive' | 'corrective' | 'emergency' | 'inspection' | 'modification';
    estimatedHours: number;
    actualHours?: number;
    estimatedCost: number;
    actualCost?: number;
    scheduledDate: string;
    startedDate?: string;
    completedDate?: string;
    assignedMechanic?: string;
    location: string;
    partsRequired: string[];
    notes: string;
    watchers?: string[];
    totalCost?: number;
    isLocked?: boolean;
  }[];
  inspections: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    vehicleName: string;
    vehicleImage?: string;
    inspectionType: 'daily' | 'weekly' | 'monthly' | 'annual' | 'pre_trip' | 'post_trip';
    inspectionDate: string;
    inspector: string;
    status: 'pass' | 'fail' | 'conditional_pass';
    score: number;
    defects: { id: string; description: string; severity: 'minor' | 'major' | 'critical'; rectified: boolean; rectificationDate?: string; }[];
    notes: string;
    nextInspectionDate: string;
    watchers?: string[];
    priority?: string;
    totalCost?: number;
    isLocked?: boolean;
  }[];
}

const MaintenanceTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Mock maintenance data
  const maintenanceData: MaintenanceData = {
    maintenanceSchedules: [
      {
        id: 'ms-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        vehicleName: '2016 Ford F-150',
        maintenanceType: 'scheduled',
        description: 'Engine Oil & Filter Replacement',
        scheduledDate: '2024-09-15',
        estimatedDuration: 2,
        estimatedCost: 150.00,
        priority: 'medium',
        status: 'scheduled',
        assignedMechanic: 'John Smith',
        partsRequired: ['Oil Filter', 'Engine Oil'],
        notes: 'Regular maintenance schedule',
        totalCost: 150.00
      },
      {
        id: 'ms-2',
        vehicleId: 'v2',
        vehicleNumber: 'NBG-001',
        vehicleName: '2014 Chevrolet Express Cargo',
        maintenanceType: 'preventive',
        description: 'Brake Inspection & Service',
        scheduledDate: '2024-09-20',
        estimatedDuration: 4,
        estimatedCost: 300.00,
        priority: 'high',
        status: 'scheduled',
        assignedMechanic: 'Mike Johnson',
        partsRequired: ['Brake Pads', 'Brake Fluid'],
        notes: 'Preventive maintenance',
        totalCost: 300.00
      }
    ],
    serviceHistory: [
      {
        id: 'sh-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        vehicleName: '2016 Ford F-150',
        serviceType: 'Engine Oil & Filter Replacement',
        serviceDate: '2024-08-10',
        mileage: 55208,
        mechanic: 'John Smith',
        cost: 360.94,
        description: 'Regular oil change and filter replacement',
        partsUsed: ['Oil Filter', 'Engine Oil', 'Drain Plug Gasket'],
        nextServiceDate: '2024-11-10',
        nextServiceMileage: 60208,
        status: 'completed',
        totalCost: 360.94
      },
      {
        id: 'sh-2',
        vehicleId: 'v2',
        vehicleNumber: 'NBG-001',
        vehicleName: '2014 Chevrolet Express Cargo',
        serviceType: 'Transmission Fluid Drain & Refill',
        serviceDate: '2024-07-26',
        mileage: 134358,
        mechanic: 'Mike Johnson',
        cost: 243.77,
        description: 'Transmission fluid service',
        partsUsed: ['Transmission Fluid', 'Filter'],
        nextServiceDate: '2024-10-26',
        nextServiceMileage: 139358,
        status: 'completed',
        totalCost: 243.77
      }
    ],
    workOrders: [
      {
        id: 'wo-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        vehicleName: '2016 Ford F-150',
        workOrderNumber: 'WO-2024-001',
        title: 'Engine Oil & Filter Replacement',
        description: 'Regular maintenance service',
        priority: 'medium',
        status: 'completed',
        workType: 'preventive',
        estimatedHours: 2,
        actualHours: 1.5,
        estimatedCost: 200.00,
        actualCost: 360.94,
        scheduledDate: '2024-08-10',
        startedDate: '2024-08-10T08:00:00Z',
        completedDate: '2024-08-10T09:30:00Z',
        assignedMechanic: 'John Smith',
        location: 'Main Garage',
        partsRequired: ['Oil Filter', 'Engine Oil'],
        notes: 'Service completed successfully',
        totalCost: 360.94
      },
      {
        id: 'wo-2',
        vehicleId: 'v2',
        vehicleNumber: 'NBG-001',
        vehicleName: '2014 Chevrolet Express Cargo',
        workOrderNumber: 'WO-2024-002',
        title: 'Tire Replacement',
        description: 'Replace worn tires',
        priority: 'high',
        status: 'completed',
        workType: 'corrective',
        estimatedHours: 3,
        actualHours: 2.5,
        estimatedCost: 500.00,
        actualCost: 534.00,
        scheduledDate: '2024-07-15',
        startedDate: '2024-07-15T10:00:00Z',
        completedDate: '2024-07-15T12:30:00Z',
        assignedMechanic: 'Mike Johnson',
        location: 'Main Garage',
        partsRequired: ['Tires', 'Wheel Balance'],
        notes: 'All four tires replaced',
        totalCost: 534.00
      }
    ],
    inspections: [
      {
        id: 'insp-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        vehicleName: '2016 Ford F-150',
        inspectionType: 'annual',
        inspectionDate: '2024-08-10',
        inspector: 'John Smith',
        status: 'pass',
        score: 95,
        defects: [],
        notes: 'Vehicle passed annual inspection',
        nextInspectionDate: '2025-08-10',
        totalCost: 150.00
      },
      {
        id: 'insp-2',
        vehicleId: 'v2',
        vehicleNumber: 'NBG-001',
        vehicleName: '2014 Chevrolet Express Cargo',
        inspectionType: 'pre_trip',
        inspectionDate: '2024-08-15',
        inspector: 'Mike Johnson',
        status: 'conditional_pass',
        score: 85,
        defects: [
          {
            id: 'def-1',
            description: 'Minor brake wear',
            severity: 'minor',
            rectified: false
          }
        ],
        notes: 'Minor issues found, safe to operate',
        nextInspectionDate: '2024-08-16',
        totalCost: 0
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'pass':
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'assigned':
      case 'conditional_pass':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
      case 'fail':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderVehicleCell = (item: any) => (
    <div className="flex items-center space-x-3">
      <Checkbox />
      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
        <Car className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex items-center space-x-2">
        <span className="font-medium">{item.vehicleNumber}</span>
        <span className="text-gray-500">[{item.vehicleName}]</span>
        {item.isLocked && <Lock className="w-3 h-3 text-gray-400" />}
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    </div>
  );

  const renderTable = (data: any[], columns: any[]) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              <SelectItem value="bus001">BUS001</SelectItem>
              <SelectItem value="nbg001">NBG-001</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          <Select defaultValue="save-view">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="save-view">Save View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Maintenance Records</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>1 - {data.length} of {data.length}</span>
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const scheduleColumns = [
    { key: 'vehicle', label: 'Vehicle', render: renderVehicleCell },
    { key: 'scheduledDate', label: 'Scheduled Date', render: (item: any) => format(new Date(item.scheduledDate), 'MM/dd/yyyy h:mm a') },
    { key: 'watchers', label: 'Watchers', render: () => '-' },
    { key: 'priority', label: 'Priority', render: (item: any) => (
      <Badge className={getPriorityColor(item.priority)}>
        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
      </Badge>
    )},
    { key: 'maintenanceType', label: 'Maintenance Type', render: (item: any) => item.maintenanceType.charAt(0).toUpperCase() + item.maintenanceType.slice(1) },
    { key: 'description', label: 'Description', render: (item: any) => item.description },
    { key: 'status', label: 'Status', render: (item: any) => (
      <Badge className={getStatusColor(item.status)}>
        {item.status.replace('_', ' ')}
      </Badge>
    )},
    { key: 'totalCost', label: 'Total', render: (item: any) => item.totalCost ? `$${item.totalCost.toFixed(2)}` : '-' }
  ];

  const serviceColumns = [
    { key: 'vehicle', label: 'Vehicle', render: renderVehicleCell },
    { key: 'serviceDate', label: 'Service Date', render: (item: any) => format(new Date(item.serviceDate), 'MM/dd/yyyy h:mm a') },
    { key: 'watchers', label: 'Watchers', render: () => '-' },
    { key: 'priority', label: 'Priority', render: () => '-' },
    { key: 'mileage', label: 'Meter', render: (item: any) => `${item.mileage.toLocaleString()} mi` },
    { key: 'serviceType', label: 'Service Tasks', render: (item: any) => item.serviceType },
    { key: 'issues', label: 'Issues', render: () => '-' },
    { key: 'mechanic', label: 'Vendor', render: (item: any) => item.mechanic },
    { key: 'totalCost', label: 'Total', render: (item: any) => `$${item.totalCost.toFixed(2)}` }
  ];

  const workOrderColumns = [
    { key: 'vehicle', label: 'Vehicle', render: renderVehicleCell },
    { key: 'scheduledDate', label: 'Scheduled Date', render: (item: any) => format(new Date(item.scheduledDate), 'MM/dd/yyyy h:mm a') },
    { key: 'watchers', label: 'Watchers', render: () => '-' },
    { key: 'priority', label: 'Priority', render: (item: any) => (
      <Badge className={getPriorityColor(item.priority)}>
        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
      </Badge>
    )},
    { key: 'workOrderNumber', label: 'Work Order', render: (item: any) => item.workOrderNumber },
    { key: 'title', label: 'Title', render: (item: any) => item.title },
    { key: 'status', label: 'Status', render: (item: any) => (
      <Badge className={getStatusColor(item.status)}>
        {item.status.replace('_', ' ')}
      </Badge>
    )},
    { key: 'totalCost', label: 'Total', render: (item: any) => `$${item.totalCost.toFixed(2)}` }
  ];

  const inspectionColumns = [
    { key: 'vehicle', label: 'Vehicle', render: renderVehicleCell },
    { key: 'inspectionDate', label: 'Inspection Date', render: (item: any) => format(new Date(item.inspectionDate), 'MM/dd/yyyy h:mm a') },
    { key: 'watchers', label: 'Watchers', render: () => '-' },
    { key: 'priority', label: 'Priority', render: () => '-' },
    { key: 'inspectionType', label: 'Inspection Type', render: (item: any) => item.inspectionType.replace('_', ' ').charAt(0).toUpperCase() + item.inspectionType.replace('_', ' ').slice(1) },
    { key: 'inspector', label: 'Inspector', render: (item: any) => item.inspector },
    { key: 'status', label: 'Status', render: (item: any) => (
      <Badge className={getStatusColor(item.status)}>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Badge>
    )},
    { key: 'totalCost', label: 'Total', render: (item: any) => item.totalCost ? `$${item.totalCost.toFixed(2)}` : '-' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Maintenance</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Service Entry
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-4 border-b">
        <Button variant="ghost" className={activeSubTab === 'overview' ? 'border-b-2 border-blue-600' : ''} onClick={() => setActiveSubTab('overview')}>
          All
        </Button>
        <Button variant="ghost" className={activeSubTab === 'schedules' ? 'border-b-2 border-blue-600' : ''} onClick={() => setActiveSubTab('schedules')}>
          Schedules
        </Button>
        <Button variant="ghost" className={activeSubTab === 'workorders' ? 'border-b-2 border-blue-600' : ''} onClick={() => setActiveSubTab('workorders')}>
          Work Orders
        </Button>
        <Button variant="ghost" className={activeSubTab === 'inspections' ? 'border-b-2 border-blue-600' : ''} onClick={() => setActiveSubTab('inspections')}>
          Inspections
        </Button>
        <Button variant="ghost" className={activeSubTab === 'history' ? 'border-b-2 border-blue-600' : ''} onClick={() => setActiveSubTab('history')}>
          History
        </Button>
      </div>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Service History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Service History</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable(maintenanceData.serviceHistory, serviceColumns)}
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === 'schedules' && renderTable(maintenanceData.maintenanceSchedules, scheduleColumns)}
      {activeSubTab === 'workorders' && renderTable(maintenanceData.workOrders, workOrderColumns)}
      {activeSubTab === 'inspections' && renderTable(maintenanceData.inspections, inspectionColumns)}
      {activeSubTab === 'history' && renderTable(maintenanceData.serviceHistory, serviceColumns)}
    </div>
  );
};

export default MaintenanceTab;
