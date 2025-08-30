import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Truck, 
  Users, 
  Wrench, 
  Settings, 
  Fuel, 
  AlertTriangle, 
  Package, 
  ClipboardList,
  Plus,
  Settings as SettingsIcon,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import StandardPageLayout, { 
  MetricCard, 
  NavigationTab, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function FleetOverview() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch fleet data
  const { data: vehicles = [] } = useQuery({
    queryKey: ['fleet-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .limit(100);
      
      if (error) {
        console.error('Error fetching vehicles:', error);
        return [];
      }
      return data || [];
    }
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['fleet-drivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .limit(100);
      
      if (error) {
        console.error('Error fetching drivers:', error);
        return [];
      }
      return data || [];
    }
  });

  const { data: mechanics = [] } = useQuery({
    queryKey: ['fleet-mechanics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mechanic')
        .limit(100);
      
      if (error) {
        console.error('Error fetching mechanics:', error);
        return [];
      }
      return data || [];
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading fleet overview...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins and council can access fleet management
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Calculate fleet metrics
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.is_active).length;
  const totalMechanics = mechanics.length;

  // StandardPageLayout Configuration
  const pageTitle = "Fleet Overview";
  const pageDescription = "Comprehensive fleet management system for vehicles, drivers, mechanics, and operations";

  const primaryAction: ActionButton = {
    label: "Add Vehicle",
    onClick: () => window.location.href = "/vehicles",
    icon: <Plus className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
    {
      label: "Export Report",
      onClick: () => console.log("Export report clicked"),
      icon: <Download className="w-4 h-4" />,
      variant: "outline"
    },
    {
      label: "Settings",
      onClick: () => console.log("Settings clicked"),
      icon: <SettingsIcon className="w-4 h-4" />,
      variant: "outline"
    }
  ];

  const metricsCards: MetricCard[] = [
    {
      title: "Total Vehicles",
      value: totalVehicles,
      subtitle: `${activeVehicles} active`,
      icon: <Truck className="w-5 h-5" />,
      bgColor: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      title: "Active Drivers",
      value: activeDrivers,
      subtitle: `of ${totalDrivers} total drivers`,
      icon: <Users className="w-5 h-5" />,
      bgColor: "bg-green-100",
      color: "text-green-600"
    },
    {
      title: "In Maintenance",
      value: maintenanceVehicles,
      subtitle: "vehicles under service",
      icon: <Wrench className="w-5 h-5" />,
      bgColor: "bg-yellow-100",
      color: "text-yellow-600"
    },
    {
      title: "Mechanics",
      value: totalMechanics,
      subtitle: "available technicians",
      icon: <Wrench className="w-5 h-5" />,
      bgColor: "bg-purple-100",
      color: "text-purple-600"
    }
  ];

  const navigationTabs: NavigationTab[] = [
    { value: "overview", label: "Overview" },
    { value: "vehicles", label: "Vehicles", badge: totalVehicles },
    { value: "drivers", label: "Drivers", badge: totalDrivers },
    { value: "mechanics", label: "Mechanics", badge: totalMechanics },
    { value: "tire-management", label: "Tire Management" },
    { value: "fuel-management", label: "Fuel Management" },
    { value: "defect-reports", label: "Defect Reports" },
    { value: "parts-supplies", label: "Parts & Supplies" },
    { value: "work-orders", label: "Work Orders" }
  ];

  const searchConfig = {
    placeholder: "Search fleet records, vehicles, drivers, or maintenance...",
    value: searchTerm,
    onChange: setSearchTerm,
    showSearch: true
  };

  const filters: FilterOption[] = [
    {
      label: "Status",
      value: statusFilter,
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "maintenance", label: "In Maintenance" },
        { value: "out_of_service", label: "Out of Service" }
      ],
      placeholder: "Filter by status"
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "Status") setStatusFilter(value);
  };

  // Table data for different tabs
  const vehicleTableData = vehicles.map(vehicle => ({
    id: vehicle.id,
    vehicleNumber: vehicle.vehicle_number || 'N/A',
    make: vehicle.make || 'N/A',
    model: vehicle.model || 'N/A',
    status: vehicle.status || 'unknown',
    driver: vehicle.driver_id || 'Unassigned',
    lastMaintenance: vehicle.last_maintenance || 'N/A'
  }));

  const vehicleColumns: TableColumn[] = [
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => (
        <Badge className={
          item.status === 'active' ? 'bg-green-100 text-green-800' : 
          item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }>
          {item.status}
        </Badge>
      )
    },
    { key: 'driver', label: 'Driver' },
    { key: 'lastMaintenance', label: 'Last Maintenance' }
  ];

  const driverTableData = drivers.map(driver => ({
    id: driver.id,
    name: `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Unknown',
    email: driver.email || 'N/A',
    phone: driver.phone || 'N/A',
    status: driver.is_active ? 'active' : 'inactive',
    license: driver.license_number || 'N/A'
  }));

  const driverColumns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => (
        <Badge className={item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {item.status}
        </Badge>
      )
    },
    { key: 'license', label: 'License Number' }
  ];

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = "/vehicles"}>
                        <Truck className="w-4 h-4 mr-2" />
                        Manage Vehicles
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = "/drivers"}>
                        <Users className="w-4 h-4 mr-2" />
                        Manage Drivers
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = "/work-orders"}>
                        <ClipboardList className="w-4 h-4 mr-2" />
                        View Work Orders
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Recent Activity</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Vehicle BUS001 maintenance completed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span>Driver John Doe route assigned</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span>New defect report submitted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'vehicles':
        return (
          <StandardPageLayout
            title="Vehicle Management"
            showMetricsDashboard={false}
            showTable={true}
            tableData={vehicleTableData}
            tableColumns={vehicleColumns}
            searchConfig={searchConfig}
            filters={filters}
            onFilterChange={handleFilterChange}
          >
            <div></div>
          </StandardPageLayout>
        );

      case 'drivers':
        return (
          <StandardPageLayout
            title="Driver Management"
            showMetricsDashboard={false}
            showTable={true}
            tableData={driverTableData}
            tableColumns={driverColumns}
            searchConfig={searchConfig}
            filters={filters}
            onFilterChange={handleFilterChange}
          >
            <div></div>
          </StandardPageLayout>
        );

      case 'mechanics':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Mechanics Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Mechanics management content would go here...</p>
            </CardContent>
          </Card>
        );

      case 'tire-management':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tire Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Tire management content would go here...</p>
            </CardContent>
          </Card>
        );

      case 'fuel-management':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Fuel Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Fuel management content would go here...</p>
            </CardContent>
          </Card>
        );

      case 'defect-reports':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Defect Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Defect reports content would go here...</p>
            </CardContent>
          </Card>
        );

      case 'parts-supplies':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Parts & Supplies</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Parts and supplies content would go here...</p>
            </CardContent>
          </Card>
        );

      case 'work-orders':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Work orders content would go here...</p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <StandardPageLayout
      title={pageTitle}
      description={pageDescription}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchConfig={searchConfig}
      filters={filters}
      onFilterChange={handleFilterChange}
    >
      {renderTabContent()}
    </StandardPageLayout>
  );
}
