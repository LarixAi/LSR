import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Bus, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  MapPin,
  Navigation,
  Star,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  BarChart3,
  Route,
  School
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

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
  estimatedDuration: number;
  distance: number;
  monthlyCost: number;
  monthlyRevenue: number;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function SchoolRoutes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [routeTypeFilter, setRouteTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('routes');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<SchoolRoute | null>(null);

  // Mock data - replace with actual API calls
  const schoolRoutes: SchoolRoute[] = [
    {
      id: '1',
      routeName: 'St. Mary\'s Primary Route',
      routeNumber: 'SR-001',
      schoolName: 'St. Mary\'s Primary School',
      schoolAddress: '123 Church Street, London',
      routeType: 'both',
      status: 'active',
      assignedVehicleId: 'V001',
      assignedDriverId: 'D001',
      vehicleRegistration: 'AB12 CDE',
      driverName: 'John Smith',
      driverPhone: '+44 7700 900123',
      capacity: 25,
      currentPassengers: 18,
      estimatedDuration: 45,
      distance: 12.5,
      monthlyCost: 2500,
      monthlyRevenue: 3200,
      contactPerson: 'Mrs. Johnson',
      contactPhone: '+44 20 7123 4567',
      contactEmail: 'admin@stmarys.school.uk',
      notes: 'Route includes 5 pickup points and 3 drop-off locations',
      createdAt: '2024-08-27T10:00:00Z',
      updatedAt: '2024-08-27T10:00:00Z'
    },
    {
      id: '2',
      routeName: 'King\'s College Secondary',
      routeNumber: 'SR-002',
      schoolName: 'King\'s College Secondary',
      schoolAddress: '456 Kings Road, Manchester',
      routeType: 'morning',
      status: 'active',
      assignedVehicleId: 'V002',
      assignedDriverId: 'D002',
      vehicleRegistration: 'XY34 FGH',
      driverName: 'Sarah Wilson',
      driverPhone: '+44 7700 900456',
      capacity: 30,
      currentPassengers: 22,
      estimatedDuration: 35,
      distance: 8.2,
      monthlyCost: 2200,
      monthlyRevenue: 2800,
      contactPerson: 'Mr. Davis',
      contactPhone: '+44 161 234 5678',
      contactEmail: 'transport@kingscollege.edu.uk',
      notes: 'Morning route only, afternoon students use public transport',
      createdAt: '2024-08-26T15:00:00Z',
      updatedAt: '2024-08-26T15:00:00Z'
    },
    {
      id: '3',
      routeName: 'Birmingham Academy Express',
      routeNumber: 'SR-003',
      schoolName: 'Birmingham Academy',
      schoolAddress: '789 Academy Lane, Birmingham',
      routeType: 'afternoon',
      status: 'planned',
      assignedVehicleId: 'V003',
      assignedDriverId: 'D003',
      vehicleRegistration: 'MN56 PQR',
      driverName: 'Mike Johnson',
      driverPhone: '+44 7700 900789',
      capacity: 20,
      currentPassengers: 0,
      estimatedDuration: 25,
      distance: 6.8,
      monthlyCost: 1800,
      monthlyRevenue: 2400,
      contactPerson: 'Ms. Thompson',
      contactPhone: '+44 121 345 6789',
      contactEmail: 'admin@birminghamacademy.org.uk',
      notes: 'New route starting next month',
      createdAt: '2024-08-25T09:00:00Z',
      updatedAt: '2024-08-25T09:00:00Z'
    }
  ];

  // Calculate statistics
  const totalRoutes = schoolRoutes.length;
  const activeRoutes = schoolRoutes.filter(route => route.status === 'active').length;
  const totalStudents = schoolRoutes.reduce((sum, route) => sum + route.currentPassengers, 0);
  const totalCapacity = schoolRoutes.reduce((sum, route) => sum + route.capacity, 0);
  const totalRevenue = schoolRoutes.reduce((sum, route) => sum + route.monthlyRevenue, 0);
  const totalCost = schoolRoutes.reduce((sum, route) => sum + route.monthlyCost, 0);

  // Filter routes based on search and filters
  const filteredRoutes = schoolRoutes.filter(route => {
    const matchesSearch = searchTerm === '' || 
      route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.routeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    const matchesType = routeTypeFilter === 'all' || route.routeType === routeTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-800">Planned</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRouteTypeBadge = (type: string) => {
    switch (type) {
      case 'morning':
        return <Badge className="bg-orange-100 text-orange-800">Morning</Badge>;
      case 'afternoon':
        return <Badge className="bg-purple-100 text-purple-800">Afternoon</Badge>;
      case 'both':
        return <Badge className="bg-indigo-100 text-indigo-800">Both</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <PageLayout
      title="School Routes"
      description="Manage school transportation routes and student transportation services"
      actionButton={{
        label: "Create Route",
        onClick: () => setShowCreateDialog(true),
        icon: <Plus className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Total Routes",
          value: totalRoutes,
          icon: <Route className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "Active Routes",
          value: activeRoutes,
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-green-600"
        },
        {
          title: "Students",
          value: `${totalStudents}/${totalCapacity}`,
          icon: <Users className="h-4 w-4" />,
          color: "text-purple-600"
        },
        {
          title: "Monthly Profit",
          value: `£${(totalRevenue - totalCost).toLocaleString()}`,
          icon: <DollarSign className="h-4 w-4" />,
          color: "text-green-600"
        }
      ]}
      searchPlaceholder="Search school routes..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "All Statuses",
          value: statusFilter,
          options: [
            { value: "all", label: "All Statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "planned", label: "Planned" },
            { value: "suspended", label: "Suspended" }
          ],
          onChange: setStatusFilter
        },
        {
          label: "All Types",
          value: routeTypeFilter,
          options: [
            { value: "all", label: "All Types" },
            { value: "morning", label: "Morning" },
            { value: "afternoon", label: "Afternoon" },
            { value: "both", label: "Both" }
          ],
          onChange: setRouteTypeFilter
        }
      ]}
      tabs={[
        { value: "routes", label: "Routes" },
        { value: "students", label: "Students" },
        { value: "analytics", label: "Analytics" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={false}
    >
      {/* Content based on active tab */}
      {activeTab === 'routes' && (
        <Card>
          <CardHeader>
            <CardTitle>School Routes Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{route.routeName}</p>
                        <p className="text-sm text-gray-500">{route.routeNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{route.schoolName}</p>
                        <p className="text-sm text-gray-500">{route.schoolAddress}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{route.driverName}</p>
                        <p className="text-sm text-gray-500">{route.driverPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{route.vehicleRegistration}</p>
                        <p className="text-sm text-gray-500">Capacity: {route.capacity}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getRouteTypeBadge(route.routeType)}</TableCell>
                    <TableCell>{getStatusBadge(route.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {route.currentPassengers}/{route.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {route.estimatedDuration}min
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

      {activeTab === 'students' && (
        <Card>
          <CardHeader>
            <CardTitle>Student Transportation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Student management features coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Manage student assignments, track attendance, and handle special requirements
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Route Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Route analytics features coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Performance metrics, cost analysis, and route optimization insights
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Route Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New School Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">School route creation form will be implemented here.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                Create Route
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}