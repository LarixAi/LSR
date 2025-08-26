import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Fuel,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Calendar,
  MapPin,
  Activity,
  Users,
  DollarSign,
  Settings,
  RefreshCw,
  Filter,
  Eye,
  Printer
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FleetStats {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  totalDrivers: number;
  totalMileage: number;
  averageFuelEfficiency: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  complianceRate: number;
  incidentsThisMonth: number;
}

interface VehicleReport {
  id: string;
  vehicleNumber: string;
  make: string;
  model: string;
  licensePlate: string;
  status: string;
  mileage: number;
  fuelEfficiency: number;
  lastMaintenance: string;
  nextMaintenance: string;
  driver: string;
  complianceStatus: string;
}

const FleetReportsPage = () => {
  const { user, profile, loading } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [selectedReportType, setSelectedReportType] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading fleet reports...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins and council can access fleet reports
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Fetch fleet statistics
  const { data: fleetStats, isLoading: statsLoading } = useQuery({
    queryKey: ['fleet-stats', profile.organization_id],
    queryFn: async () => {
      try {
        // Fetch vehicles
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('organization_id', profile.organization_id);

        if (vehiclesError) {
          console.error('Error fetching vehicles:', vehiclesError);
          return null;
        }

        // Fetch drivers
        const { data: drivers, error: driversError } = await supabase
          .from('profiles')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .eq('role', 'driver');

        if (driversError) {
          console.error('Error fetching drivers:', driversError);
          return null;
        }

        // Fetch fuel purchases for cost calculation
        const { data: fuelPurchases, error: fuelError } = await supabase
          .from('fuel_purchases')
          .select('*')
          .eq('organization_id', profile.organization_id);

        if (fuelError) {
          console.error('Error fetching fuel purchases:', fuelError);
        }

        // Calculate statistics
        const totalVehicles = vehicles?.length || 0;
        const activeVehicles = vehicles?.filter(v => v.status === 'active').length || 0;
        const maintenanceVehicles = vehicles?.filter(v => v.status === 'maintenance').length || 0;
        const totalDrivers = drivers?.length || 0;
        
        const totalMileage = vehicles?.reduce((sum, v) => sum + (v.mileage || 0), 0) || 0;
        const averageFuelEfficiency = vehicles?.length > 0 ? 
          vehicles.reduce((sum, v) => sum + (v.fuel_efficiency || 0), 0) / vehicles.length : 0;
        
        const totalFuelCost = fuelPurchases?.reduce((sum, f) => sum + (f.total_cost || 0), 0) || 0;
        const totalMaintenanceCost = vehicles?.reduce((sum, v) => sum + (v.maintenance_cost || 0), 0) || 0;
        
        const complianceRate = vehicles?.length > 0 ? 
          (vehicles.filter(v => v.compliance_status === 'compliant').length / vehicles.length) * 100 : 100;

        return {
          totalVehicles,
          activeVehicles,
          maintenanceVehicles,
          totalDrivers,
          totalMileage,
          averageFuelEfficiency,
          totalFuelCost,
          totalMaintenanceCost,
          complianceRate,
          incidentsThisMonth: 0 // Would need incidents table
        } as FleetStats;
      } catch (error) {
        console.error('Error calculating fleet stats:', error);
        return null;
      }
    },
    enabled: !!profile?.organization_id
  });

  // Fetch detailed vehicle reports
  const { data: vehicleReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['vehicle-reports', profile.organization_id],
    queryFn: async () => {
      try {
        // First get vehicles
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('organization_id', profile.organization_id);

        if (vehiclesError) {
          console.error('Error fetching vehicles:', vehiclesError);
          return [];
        }

        // Try to get driver assignments, but don't fail if table doesn't exist
        let driverMap = new Map();
        try {
          // First get assignments without the join
          const { data: assignments, error: assignmentsError } = await supabase
            .from('driver_vehicle_assignments')
            .select('vehicle_id, driver_id, status')
            .eq('organization_id', profile.organization_id)
            .eq('status', 'active');

          if (!assignmentsError && assignments && assignments.length > 0) {
            // Then get driver profiles separately
            const driverIds = [...new Set(assignments.map(a => a.driver_id))];
            const { data: drivers, error: driversError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name')
              .in('id', driverIds);

            if (!driversError && drivers) {
              // Create a map of driver_id to driver info
              const driverInfoMap = new Map();
              drivers.forEach(driver => {
                driverInfoMap.set(driver.id, driver);
              });

              // Map vehicle_id to driver info
              assignments.forEach(assignment => {
                const driverInfo = driverInfoMap.get(assignment.driver_id);
                if (driverInfo) {
                  driverMap.set(assignment.vehicle_id, driverInfo);
                }
              });
            }
          } else if (assignmentsError) {
            console.warn('Driver assignments table not available:', assignmentsError.message);
          }
        } catch (error) {
          console.warn('Driver assignments table not available, showing vehicles without driver info');
        }

        if (vehiclesError) {
          console.error('Error fetching vehicle reports:', vehiclesError);
          return [];
        }

        return vehicles?.map(vehicle => {
          const driverInfo = driverMap.get(vehicle.id);
          const driverName = driverInfo ? 
            `${driverInfo.first_name || ''} ${driverInfo.last_name || ''}`.trim() : 'Unassigned';
          
          return {
            id: vehicle.id,
            vehicleNumber: vehicle.vehicle_number || 'N/A',
            make: vehicle.make || 'N/A',
            model: vehicle.model || 'N/A',
            licensePlate: vehicle.license_plate || 'N/A',
            status: vehicle.status || 'unknown',
            mileage: vehicle.mileage || 0,
            fuelEfficiency: vehicle.fuel_efficiency || 0,
            lastMaintenance: vehicle.last_maintenance_date ? 
              new Date(vehicle.last_maintenance_date).toLocaleDateString() : 'N/A',
            nextMaintenance: vehicle.next_maintenance_date ? 
              new Date(vehicle.next_maintenance_date).toLocaleDateString() : 'N/A',
            driver: driverName,
            complianceStatus: vehicle.compliance_status || 'unknown'
          };
        }) || [];
      } catch (error) {
        console.error('Error fetching vehicle reports:', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id
  });

  const isLoading = statsLoading || reportsLoading;

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      compliant: 'bg-green-100 text-green-800 border-green-200',
      non_compliant: 'bg-red-100 text-red-800 border-red-200',
      unknown: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return variants[status as keyof typeof variants] || variants.unknown;
  };

  const filteredVehicleReports = vehicleReports?.filter(vehicle => 
    !searchTerm || 
    vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-8 h-8 text-blue-600" />
            Fleet Reports
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive fleet analytics and reporting</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold">{fleetStats?.totalVehicles || 0}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {fleetStats?.activeVehicles || 0} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold">{fleetStats?.totalDrivers || 0}</p>
                <p className="text-xs text-blue-600">Assigned to vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Fuel className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Fuel Efficiency</p>
                <p className="text-2xl font-bold">{fleetStats?.averageFuelEfficiency.toFixed(1) || 0} mpg</p>
                <p className="text-xs text-orange-600">Average across fleet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold">{fleetStats?.complianceRate.toFixed(1) || 100}%</p>
                <p className="text-xs text-green-600">All vehicles compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Fleet Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Vehicles</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{fleetStats?.activeVehicles || 0}</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Operational
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Maintenance</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{fleetStats?.maintenanceVehicles || 0}</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Service
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Mileage</span>
                    <span className="font-medium">{fleetStats?.totalMileage.toLocaleString() || 0} miles</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fuel Costs</span>
                    <span className="font-medium">£{fleetStats?.totalFuelCost.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Maintenance Costs</span>
                    <span className="font-medium">£{fleetStats?.totalMaintenanceCost.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Operating Cost</span>
                    <span className="font-medium text-lg">
                      £{((fleetStats?.totalFuelCost || 0) + (fleetStats?.totalMaintenanceCost || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedReportType} onValueChange={setSelectedReportType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="maintenance">In Maintenance</SelectItem>
                <SelectItem value="non_compliant">Non-Compliant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle List */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredVehicleReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No vehicles found</p>
                    <p>Try adjusting your search criteria</p>
                  </div>
                ) : (
                  filteredVehicleReports.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{vehicle.vehicleNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.make} {vehicle.model} • {vehicle.licensePlate}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Driver: {vehicle.driver} • Mileage: {vehicle.mileage.toLocaleString()} miles
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(vehicle.status)}>
                          {vehicle.status}
                        </Badge>
                        <Badge className={getStatusBadge(vehicle.complianceStatus)}>
                          {vehicle.complianceStatus}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fuel Efficiency Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Fuel efficiency analytics chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Maintenance schedule chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Fleet Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive fleet summary with vehicle status and performance metrics.
                </p>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="w-5 h-5" />
                  Fuel Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed fuel consumption analysis and cost breakdown.
                </p>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Maintenance Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Maintenance history and upcoming service schedules.
                </p>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default FleetReportsPage;
