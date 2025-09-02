import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Plus,
  Settings,
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Activity,
  Shield,
  Wrench
} from 'lucide-react';
import StandardPageLayout, { 
  MetricCard,
  NavigationTab, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';

// Example 1: Fleet Management Dashboard
export const FleetManagementExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const navigationTabs: NavigationTab[] = [
    { value: "overview", label: "Overview" },
    { value: "vehicles", label: "Vehicles", badge: 24 },
    { value: "drivers", label: "Drivers", badge: 18 },
    { value: "maintenance", label: "Maintenance", badge: 4 },
    { value: "analytics", label: "Analytics" }
  ];

  const primaryAction: ActionButton = {
    label: "Add Vehicle",
    onClick: () => console.log("Add vehicle clicked"),
    icon: <Plus className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
    {
      label: "Export",
      onClick: () => console.log("Export clicked"),
      icon: <Download className="w-4 h-4" />,
      variant: "outline"
    },
    {
      label: "Settings",
      onClick: () => console.log("Settings clicked"),
      icon: <Settings className="w-4 h-4" />,
      variant: "outline"
    }
  ];

  const searchConfig = {
    placeholder: "Search vehicles, drivers, or maintenance records...",
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
        { value: "available", label: "Available" },
        { value: "maintenance", label: "In Maintenance" },
        { value: "out_of_service", label: "Out of Service" }
      ],
      placeholder: "Filter by status"
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "Status") setStatusFilter(value);
  };

  // Metrics cards for the dashboard
  const metricsCards: MetricCard[] = [
    {
      title: "Total Vehicles",
      value: "6",
      subtitle: "Fleet size",
      icon: <Car className="w-5 h-5" />,
      bgColor: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      title: "Active",
      value: "4",
      subtitle: "67% of fleet",
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: "bg-green-100",
      color: "text-green-600"
    },
    {
      title: "In Maintenance",
      value: "1",
      subtitle: "ORV: Planned/Unplanned",
      icon: <Wrench className="w-5 h-5" />,
      bgColor: "bg-yellow-100",
      color: "text-yellow-600"
    },
    {
      title: "Out of Service",
      value: "2",
      subtitle: "ORV: Regulatory/Operational",
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: "bg-red-100",
      color: "text-red-600"
    }
  ];

  return (
    <StandardPageLayout
      title="Fleet Management Dashboard"
      description="Monitor your entire fleet, track vehicle status, and manage maintenance schedules"
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
      {/* Custom content for each tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Vehicle BUS001 returned to service</p>
                      <p className="text-sm text-gray-600">Maintenance completed successfully</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Vehicle NBG-001 scheduled for maintenance</p>
                      <p className="text-sm text-gray-600">Annual inspection due</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Vehicle list content would go here...</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'drivers' && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Driver management content would go here...</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'maintenance' && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Maintenance schedule content would go here...</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Fleet Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Analytics content would go here...</p>
          </CardContent>
        </Card>
      )}
    </StandardPageLayout>
  );
};

// Example 2: Financial Dashboard
export const FinancialDashboardExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const navigationTabs: NavigationTab[] = [
    { value: "overview", label: "Overview" },
    { value: "revenue", label: "Revenue" },
    { value: "costs", label: "Costs" },
    { value: "profitability", label: "Profitability" },
    { value: "forecasting", label: "Forecasting" }
  ];

  const primaryAction: ActionButton = {
    label: "Generate Report",
    onClick: () => console.log("Generate report clicked"),
    icon: <Download className="w-4 h-4" />
  };

  const searchConfig = {
    placeholder: "Search financial records, invoices, or transactions...",
    value: searchTerm,
    onChange: setSearchTerm,
    showSearch: true
  };

  return (
    <StandardPageLayout
      title="Financial Dashboard"
      description="Track revenue, costs, and profitability across your operations"
      primaryAction={primaryAction}
      showMetricsDashboard={false}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchConfig={searchConfig}
    >
      {/* Financial content would go here */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Financial dashboard content would go here...</p>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
};

// Example 3: Simple Content Page
export const SimpleContentExample: React.FC = () => {
  const primaryAction: ActionButton = {
    label: "Create New",
    onClick: () => console.log("Create new clicked"),
    icon: <Plus className="w-4 h-4" />
  };

  return (
    <StandardPageLayout
      title="Simple Content Page"
      description="A basic page without complex metrics or navigation"
      primaryAction={primaryAction}
      showMetricsDashboard={false}
    >
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This is a simple content page that demonstrates the flexibility of the StandardPageLayout.
            You can use it for any type of content without requiring complex configurations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Feature 1</h3>
              <p className="text-sm text-gray-600">Description of the first feature</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Feature 2</h3>
              <p className="text-sm text-gray-600">Description of the second feature</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
};

// Example 4: Table-Focused Page
export const TableFocusedExample: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', role: 'Driver' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', role: 'Manager' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active', role: 'Driver' }
  ];

  const tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => (
        <Badge className={item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {item.status}
        </Badge>
      )
    }
  ];

  const searchConfig = {
    placeholder: "Search users...",
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
        { value: "inactive", label: "Inactive" }
      ]
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "Status") setStatusFilter(value);
  };

  return (
    <StandardPageLayout
      title="User Management"
      description="Manage system users and their permissions"
      primaryAction={{
        label: "Add User",
        onClick: () => console.log("Add user clicked"),
        icon: <Plus className="w-4 h-4" />
      }}
      showMetricsDashboard={false}
      showTable={true}
      tableData={tableData}
      tableColumns={tableColumns}
      searchConfig={searchConfig}
      filters={filters}
      onFilterChange={handleFilterChange}
    >
      <div></div>
    </StandardPageLayout>
  );
};

// Main export for the examples
const StandardPageLayoutExample: React.FC = () => {
  const [currentExample, setCurrentExample] = useState('fleet');

  const examples = [
    { key: 'fleet', label: 'Fleet Management', component: <FleetManagementExample /> },
    { key: 'financial', label: 'Financial Dashboard', component: <FinancialDashboardExample /> },
    { key: 'simple', label: 'Simple Content', component: <SimpleContentExample /> },
    { key: 'table', label: 'Table Focused', component: <TableFocusedExample /> }
  ];

  return (
    <div className="space-y-6">
      {/* Example selector – mobile friendly */}
      <div className="border-b">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap py-1">
          {examples.map((example) => (
            <button
              key={example.key}
              onClick={() => setCurrentExample(example.key)}
              className={`px-3 py-2 text-sm border-b-2 transition-colors shrink-0 ${
                currentExample === example.key 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2 text-base sm:text-lg">StandardPageLayout Examples</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">
          This demonstrates how the StandardPageLayout can be used for different types of pages.
          Each example shows different configurations and use cases.
        </p>
        <div className="text-xs text-gray-500">
          <strong>Current Example:</strong> {examples.find(e => e.key === currentExample)?.label}
        </div>
      </div>

      {examples.find(e => e.key === currentExample)?.component}
    </div>
  );
};

export default StandardPageLayoutExample;
