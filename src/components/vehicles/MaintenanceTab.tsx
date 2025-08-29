import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CalendarDays,
  DollarSign,
  Users,
  Gauge,
  Zap,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface MaintenanceData {
  // Maintenance Schedules
  maintenanceSchedules: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    maintenanceType: 'scheduled' | 'preventive' | 'corrective' | 'emergency';
    description: string;
    scheduledDate: string;
    estimatedDuration: number; // hours
    estimatedCost: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
    assignedMechanic?: string;
    partsRequired: string[];
    notes: string;
  }[];
  
  // Service History
  serviceHistory: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
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
  }[];
  
  // Work Orders
  workOrders: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
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
  }[];
  
  // Inspections
  inspections: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    inspectionType: 'daily' | 'weekly' | 'monthly' | 'annual' | 'pre_trip' | 'post_trip';
    inspectionDate: string;
    inspector: string;
    status: 'pass' | 'fail' | 'conditional_pass';
    score: number; // percentage
    defects: {
      id: string;
      description: string;
      severity: 'minor' | 'major' | 'critical';
      rectified: boolean;
      rectificationDate?: string;
    }[];
    notes: string;
    nextInspectionDate: string;
  }[];
  
  // Maintenance Statistics
  stats: {
    totalVehicles: number;
    vehiclesInMaintenance: number;
    scheduledMaintenance: number;
    overdueMaintenance: number;
    completedThisMonth: number;
    totalCostThisMonth: number;
    averageRepairTime: number; // hours
    maintenanceEfficiency: number; // percentage
  };
}

const MaintenanceTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Mock maintenance data
  const maintenanceData: MaintenanceData = {
    maintenanceSchedules: [
      {
        id: 'ms-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        maintenanceType: 'scheduled',
        description: 'Annual service and MOT preparation',
        scheduledDate: '2024-09-15',
        estimatedDuration: 8,
        estimatedCost: 1200,
        priority: 'high',
        status: 'scheduled',
        assignedMechanic: 'John Smith',
        partsRequired: ['Oil filter', 'Air filter', 'Brake pads'],
        notes: 'Include full brake system inspection'
      },
      {
        id: 'ms-2',
        vehicleId: 'v2',
        vehicleNumber: 'BUS002',
        maintenanceType: 'corrective',
        description: 'Engine fault diagnosis and repair',
        scheduledDate: '2024-08-30',
        estimatedDuration: 12,
        estimatedCost: 2500,
        priority: 'urgent',
        status: 'in_progress',
        assignedMechanic: 'Mike Johnson',
        partsRequired: ['Engine sensors', 'ECU module'],
        notes: 'Engine warning light investigation required'
      },
      {
        id: 'ms-3',
        vehicleId: 'v3',
        vehicleNumber: 'BUS003',
        maintenanceType: 'preventive',
        description: 'Brake system maintenance',
        scheduledDate: '2024-09-20',
        estimatedDuration: 6,
        estimatedCost: 800,
        priority: 'medium',
        status: 'scheduled',
        partsRequired: ['Brake fluid', 'Brake pads'],
        notes: 'Routine brake system check'
      }
    ],
    
    serviceHistory: [
      {
        id: 'sh-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        serviceType: 'Annual Service',
        serviceDate: '2024-07-15',
        mileage: 45000,
        mechanic: 'John Smith',
        cost: 1100,
        description: 'Full annual service including oil change, filters, and safety checks',
        partsUsed: ['Oil filter', 'Air filter', 'Fuel filter', 'Brake fluid'],
        nextServiceDate: '2025-07-15',
        nextServiceMileage: 55000,
        status: 'completed'
      },
      {
        id: 'sh-2',
        vehicleId: 'v2',
        vehicleNumber: 'BUS002',
        serviceType: 'Brake Repair',
        serviceDate: '2024-08-10',
        mileage: 38000,
        mechanic: 'Mike Johnson',
        cost: 650,
        description: 'Replaced front brake pads and discs',
        partsUsed: ['Front brake pads', 'Front brake discs', 'Brake fluid'],
        nextServiceDate: '2024-11-10',
        nextServiceMileage: 43000,
        status: 'completed'
      },
      {
        id: 'sh-3',
        vehicleId: 'v3',
        vehicleNumber: 'BUS003',
        serviceType: 'Preventive Maintenance',
        serviceDate: '2024-08-25',
        mileage: 52000,
        mechanic: 'Sarah Wilson',
        cost: 450,
        description: 'Routine maintenance check and minor adjustments',
        partsUsed: ['Oil filter', 'Air filter'],
        nextServiceDate: '2024-11-25',
        nextServiceMileage: 57000,
        status: 'completed'
      }
    ],
    
    workOrders: [
      {
        id: 'wo-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        workOrderNumber: 'WO-2024-001',
        title: 'Engine Performance Issue',
        description: 'Engine running rough, needs diagnostic and repair',
        priority: 'high',
        status: 'in_progress',
        workType: 'corrective',
        estimatedHours: 8,
        actualHours: 6,
        estimatedCost: 1500,
        actualCost: 1200,
        scheduledDate: '2024-08-28',
        startedDate: '2024-08-28',
        assignedMechanic: 'John Smith',
        location: 'Main Workshop',
        partsRequired: ['Spark plugs', 'Ignition coils'],
        notes: 'Engine diagnostic completed, replacing ignition components'
      },
      {
        id: 'wo-2',
        vehicleId: 'v2',
        vehicleNumber: 'BUS002',
        workOrderNumber: 'WO-2024-002',
        title: 'Air Conditioning Repair',
        description: 'AC not cooling properly, needs refrigerant check and repair',
        priority: 'medium',
        status: 'open',
        workType: 'corrective',
        estimatedHours: 4,
        estimatedCost: 800,
        scheduledDate: '2024-09-05',
        assignedMechanic: 'Mike Johnson',
        location: 'Main Workshop',
        partsRequired: ['Refrigerant', 'AC filter'],
        notes: 'Customer reported AC not working effectively'
      },
      {
        id: 'wo-3',
        vehicleId: 'v3',
        vehicleNumber: 'BUS003',
        workOrderNumber: 'WO-2024-003',
        title: 'Scheduled Inspection',
        description: 'Monthly safety inspection and maintenance check',
        priority: 'low',
        status: 'scheduled',
        workType: 'preventive',
        estimatedHours: 2,
        estimatedCost: 200,
        scheduledDate: '2024-09-10',
        assignedMechanic: 'Sarah Wilson',
        location: 'Main Workshop',
        partsRequired: [],
        notes: 'Routine monthly inspection'
      }
    ],
    
    inspections: [
      {
        id: 'insp-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        inspectionType: 'annual',
        inspectionDate: '2024-07-20',
        inspector: 'David Brown',
        status: 'pass',
        score: 95,
        defects: [
          {
            id: 'def-1',
            description: 'Minor wear on brake pads',
            severity: 'minor',
            rectified: true,
            rectificationDate: '2024-07-21'
          }
        ],
        notes: 'Vehicle passed annual inspection with minor brake pad replacement',
        nextInspectionDate: '2025-07-20'
      },
      {
        id: 'insp-2',
        vehicleId: 'v2',
        vehicleNumber: 'BUS002',
        inspectionType: 'monthly',
        inspectionDate: '2024-08-15',
        inspector: 'Sarah Wilson',
        status: 'conditional_pass',
        score: 85,
        defects: [
          {
            id: 'def-2',
            description: 'Engine warning light on',
            severity: 'major',
            rectified: false
          },
          {
            id: 'def-3',
            description: 'Wiper blade needs replacement',
            severity: 'minor',
            rectified: true,
            rectificationDate: '2024-08-16'
          }
        ],
        notes: 'Engine issue needs investigation, wiper blade replaced',
        nextInspectionDate: '2024-09-15'
      },
      {
        id: 'insp-3',
        vehicleId: 'v3',
        vehicleNumber: 'BUS003',
        inspectionType: 'daily',
        inspectionDate: '2024-08-28',
        inspector: 'Mike Johnson',
        status: 'pass',
        score: 100,
        defects: [],
        notes: 'All systems functioning correctly',
        nextInspectionDate: '2024-08-29'
      }
    ],
    
    stats: {
      totalVehicles: 15,
      vehiclesInMaintenance: 3,
      scheduledMaintenance: 8,
      overdueMaintenance: 2,
      completedThisMonth: 12,
      totalCostThisMonth: 8500,
      averageRepairTime: 6.5,
      maintenanceEfficiency: 88
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'pass':
      case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
      case 'conditional_pass':
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
      case 'fail':
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'open':
      case 'on_hold':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'major':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Maintenance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{maintenanceData.stats.vehiclesInMaintenance}</p>
              </div>
              <Wrench className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {maintenanceData.stats.vehiclesInMaintenance} of {maintenanceData.stats.totalVehicles} vehicles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{maintenanceData.stats.scheduledMaintenance}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {maintenanceData.stats.overdueMaintenance} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-bold text-green-600">£{maintenanceData.stats.totalCostThisMonth.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {maintenanceData.stats.completedThisMonth} jobs completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-purple-600">{maintenanceData.stats.maintenanceEfficiency}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <Progress value={maintenanceData.stats.maintenanceEfficiency} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="workorders" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="inspections" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Inspections
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceData.maintenanceSchedules
                    .filter(ms => ms.status === 'scheduled')
                    .slice(0, 3)
                    .map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{schedule.vehicleNumber}</p>
                        <p className="text-sm text-gray-600">{schedule.description}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(schedule.scheduledDate), 'MMM dd, yyyy')} • {schedule.estimatedDuration}h
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getPriorityColor(schedule.priority)}>
                          {schedule.priority}
                        </Badge>
                        <p className="text-sm font-medium mt-1">£{schedule.estimatedCost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Work Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Active Work Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceData.workOrders
                    .filter(wo => ['open', 'assigned', 'in_progress'].includes(wo.status))
                    .slice(0, 3)
                    .map((workOrder) => (
                    <div key={workOrder.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{workOrder.workOrderNumber}</p>
                        <p className="text-sm text-gray-600">{workOrder.title}</p>
                        <p className="text-xs text-gray-500">
                          {workOrder.vehicleNumber} • {workOrder.assignedMechanic}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(workOrder.status)}>
                          {workOrder.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm font-medium mt-1">£{workOrder.estimatedCost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Inspections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Recent Inspections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Defects</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceData.inspections.slice(0, 5).map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell className="font-medium">{inspection.vehicleNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {inspection.inspectionType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(inspection.inspectionDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{inspection.inspector}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{inspection.score}%</span>
                          <Progress value={inspection.score} className="w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(inspection.status)}>
                          {inspection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={inspection.defects.length > 0 ? 'text-red-600' : 'text-green-600'}>
                          {inspection.defects.length} {inspection.defects.length === 1 ? 'defect' : 'defects'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Maintenance Schedules</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Schedule
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mechanic</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceData.maintenanceSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.vehicleNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {schedule.maintenanceType}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{schedule.description}</TableCell>
                      <TableCell>{format(new Date(schedule.scheduledDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{schedule.estimatedDuration}h</TableCell>
                      <TableCell>£{schedule.estimatedCost}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(schedule.priority)}>
                          {schedule.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(schedule.status)}>
                          {schedule.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{schedule.assignedMechanic || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Orders Tab */}
        <TabsContent value="workorders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Work Orders</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Work Order
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceData.workOrders.map((workOrder) => (
                    <TableRow key={workOrder.id}>
                      <TableCell className="font-medium">{workOrder.workOrderNumber}</TableCell>
                      <TableCell>{workOrder.vehicleNumber}</TableCell>
                      <TableCell className="max-w-xs truncate">{workOrder.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {workOrder.workType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(workOrder.priority)}>
                          {workOrder.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(workOrder.status)}>
                          {workOrder.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{workOrder.assignedMechanic || '-'}</TableCell>
                      <TableCell>
                        {workOrder.actualHours ? `${workOrder.actualHours}/${workOrder.estimatedHours}h` : `${workOrder.estimatedHours}h`}
                      </TableCell>
                      <TableCell>
                        {workOrder.actualCost ? `£${workOrder.actualCost}` : `£${workOrder.estimatedCost}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Vehicle Inspections</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Inspection
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Defects</TableHead>
                    <TableHead>Next Inspection</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceData.inspections.map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell className="font-medium">{inspection.vehicleNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {inspection.inspectionType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(inspection.inspectionDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{inspection.inspector}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{inspection.score}%</span>
                          <Progress value={inspection.score} className="w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(inspection.status)}>
                          {inspection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {inspection.defects.map((defect) => (
                            <Badge key={defect.id} className={getSeverityColor(defect.severity)} variant="outline">
                              {defect.severity}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(inspection.nextInspectionDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Service History</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Service Record
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Mechanic</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Next Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceData.serviceHistory.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.vehicleNumber}</TableCell>
                      <TableCell>{service.serviceType}</TableCell>
                      <TableCell>{format(new Date(service.serviceDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{service.mileage.toLocaleString()} mi</TableCell>
                      <TableCell>{service.mechanic}</TableCell>
                      <TableCell>£{service.cost}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(service.nextServiceDate), 'MMM dd, yyyy')}</div>
                          <div className="text-gray-500">{service.nextServiceMileage.toLocaleString()} mi</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenanceTab;
