import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  Search,
  Plus,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  Truck,
  BarChart3,
  Wrench,
  Settings,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  MapPin,
  Phone
} from 'lucide-react';
import StandardPageLayout, { 
  NavigationTab,
  MetricCard, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';
import { usePartsInventory } from '@/hooks/usePartsInventory';

interface Part {
  id: string;
  part_number: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  min_quantity: number;
  max_quantity?: number;
  unit_price: number;
  supplier?: string;
  supplier_contact?: string;
  location?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order' | 'discontinued';
  last_ordered?: string;
  next_order_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

const PartsSuppliesRefactored = () => {
  const { user, profile, loading } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const organizationIdToUse = profile?.role === 'mechanic' ? selectedOrganizationId : profile?.organization_id;
  const { parts, inventoryStats, isLoading } = usePartsInventory(organizationIdToUse);

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'category') {
      setCategoryFilter(value);
    } else if (filterType === 'status') {
      setStatusFilter(value);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile.organization_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Organization Required</h2>
          <p className="text-gray-600">You must be assigned to an organization to view inventory.</p>
        </div>
      </div>
    );
  }

  // Use real backend data from the backend
  const realParts = parts || [];

  // Use real inventory stats if available, otherwise calculate from parts
  const stats = inventoryStats ? {
    total: inventoryStats.total,
    lowStock: inventoryStats.lowStockItems,
    outOfStock: inventoryStats.outOfStockItems,
    totalValue: inventoryStats.totalValue
  } : {
    total: realParts.length,
    lowStock: realParts.filter(part => part.status === 'low_stock').length,
    outOfStock: realParts.filter(part => part.status === 'out_of_stock').length,
    totalValue: realParts.reduce((sum, part) => sum + (part.quantity * (part.unit_price || 0)), 0)
  };

  const navigationTabs: NavigationTab[] = [
    { value: 'inventory', label: 'Inventory' },
    { value: 'transactions', label: 'Transactions' },
    { value: 'orders', label: 'Orders' },
    { value: 'suppliers', label: 'Suppliers' }
  ];

  const primaryAction: ActionButton = {
    label: 'Add Part',
    onClick: () => navigate('/parts-supplies/add'),
    icon: <Plus className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
    {
      label: 'Export',
      onClick: () => console.log('Export clicked'),
      icon: <Download className="w-4 h-4" />,
      variant: 'outline'
    },
    {
      label: 'Settings',
      onClick: () => console.log('Settings clicked'),
      icon: <Settings className="w-4 h-4" />,
      variant: 'outline'
    }
  ];

  const metricsCards: MetricCard[] = [
    {
      title: 'Total Items',
      value: stats.total.toString(),
      subtitle: 'Inventory items',
      icon: <Package className="w-5 h-5" />
    },
    {
      title: 'Low Stock',
      value: stats.lowStock.toString(),
      subtitle: 'Need reordering',
      icon: <TrendingDown className="w-5 h-5" />
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStock.toString(),
      subtitle: 'Critical items',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      title: 'Total Value',
      value: `£${stats.totalValue.toLocaleString()}`,
      subtitle: 'Inventory worth',
      icon: <DollarSign className="w-5 h-5" />
    }
  ];

  const searchConfig = {
    placeholder: 'Search parts and supplies...',
    value: searchTerm,
    onChange: setSearchTerm,
    showSearch: true
  };

  const filters: FilterOption[] = [
    {
      label: 'Category',
      value: categoryFilter,
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'engine', label: 'Engine' },
        { value: 'brakes', label: 'Brakes' },
        { value: 'tires', label: 'Tires' },
        { value: 'electrical', label: 'Electrical' },
        { value: 'fluids', label: 'Fluids' },
        { value: 'body', label: 'Body' },
        { value: 'interior', label: 'Interior' },
        { value: 'other', label: 'Other' }
      ],
      placeholder: 'Filter by category'
    },
    {
      label: 'Status',
      value: statusFilter,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'in_stock', label: 'In Stock' },
        { value: 'low_stock', label: 'Low Stock' },
        { value: 'out_of_stock', label: 'Out of Stock' },
        { value: 'on_order', label: 'On Order' },
        { value: 'discontinued', label: 'Discontinued' }
      ],
      placeholder: 'Filter by status'
    }
  ];

  const tableColumns: TableColumn[] = [
    {
      key: 'part_info',
      label: 'Part Information',
      render: (item: Part) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.part_number}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (item: Part) => (
        <Badge variant="outline" className="text-xs">
          {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Unknown'}
        </Badge>
      )
    },
    {
      key: 'quantity',
      label: 'Stock Level',
      render: (item: Part) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.quantity}</span>
          <Badge variant="outline" className="text-xs">
            {item.status ? item.status.replace('_', ' ') : 'Unknown'}
          </Badge>
        </div>
      )
    },
    {
      key: 'unit_price',
      label: 'Unit Price',
      render: (item: Part) => `£${(item.unit_price || 0).toFixed(2)}`
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (item: Part) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-sm">{item.supplier || 'Not specified'}</span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (item: Part) => (
        <div className="text-sm text-muted-foreground">
          {item.location || 'Not specified'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Part) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('View part:', item.id)}
          >
            <Eye className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Edit part:', item.id)}
          >
            <Edit className="w-3 h-3" />
          </Button>
        </div>
      )
    }
  ];

  // Filter parts based on search and filters
  const filteredParts = realParts.filter((part) => {
    const matchesSearch = searchTerm === '' || 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (part.description && part.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || part.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <StandardPageLayout
      title="Parts & Supplies"
      description="Manage inventory, track stock levels, and monitor supplies"
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
      showTable={activeTab === 'inventory'}
      tableData={activeTab === 'inventory' ? filteredParts : []}
      tableColumns={activeTab === 'inventory' ? tableColumns : []}
      onRowClick={(item: Part) => {
        console.log('View part details:', item.id);
        // Navigate to part detail page when implemented
      }}
    >
      {/* Custom content for each tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Track inventory movements and adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No transactions found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Stock movements and adjustments will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>Manage supplier orders and deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Purchase orders and deliveries will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Management</CardTitle>
              <CardDescription>Manage supplier contacts and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No suppliers found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Supplier information will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </StandardPageLayout>
  );
};

export default PartsSuppliesRefactored;