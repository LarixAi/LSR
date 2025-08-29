import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  AlertTriangle, 
  Search,
  Plus,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  Truck,
  BarChart3
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

const PartsSupplies = () => {
  const { user, profile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("inventory");

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

  const stats = {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  };

  return (
    <PageLayout
      title="Parts & Supplies"
      description="Manage inventory, track stock levels, and monitor supplies"
      actionButton={{
        label: "Add Item",
        onClick: () => {},
        icon: <Plus className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Total Items",
          value: stats.total,
          icon: <Package className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "Low Stock",
          value: stats.lowStock,
          icon: <TrendingDown className="h-4 w-4" />,
          color: "text-yellow-600"
        },
        {
          title: "Out of Stock",
          value: stats.outOfStock,
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "text-red-600"
        },
        {
          title: "Total Value",
          value: `£${stats.totalValue.toLocaleString()}`,
          icon: <BarChart3 className="h-4 w-4" />,
          color: "text-green-600"
        }
      ]}
      searchPlaceholder="Search parts and supplies..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "All Categories",
          value: categoryFilter,
          options: [
            { value: "all", label: "All Categories" }
          ],
          onChange: setCategoryFilter
        },
        {
          label: "All Stock",
          value: statusFilter,
          options: [
            { value: "all", label: "All Stock" },
            { value: "in_stock", label: "In Stock" },
            { value: "low_stock", label: "Low Stock" },
            { value: "out_of_stock", label: "Out of Stock" }
          ],
          onChange: setStatusFilter
        }
      ]}
      tabs={[
        { value: "inventory", label: "Inventory" },
        { value: "transactions", label: "Transactions" },
        { value: "orders", label: "Orders" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={false}
    >
      {/* Content based on active tab */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-full text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No inventory items found</p>
            <p className="text-sm text-gray-500 mt-2">
              Add your first inventory item to get started
            </p>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Track inventory movements and adjustments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>Manage supplier orders and deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No orders found</p>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default PartsSupplies;