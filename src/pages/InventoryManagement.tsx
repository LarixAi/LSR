import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  FileText,
  Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
// import AdminApprovalPanel from '@/components/inventory/AdminApprovalPanel';

const InventoryManagement = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - NO CONDITIONAL HOOKS
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('all');

  // Fetch inventory statistics
  const { data: inventoryStats, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async () => {
      const { data: parts, error: partsError } = await supabase
        .from('parts_inventory' as any)
        .select('*')
        .eq('organization_id', profile?.organization_id);

      if (partsError) {
        console.error('Error fetching parts:', partsError);
        return null;
      }

      const totalParts = parts?.length || 0;
      const lowStock = parts?.filter(p => p.status === 'low_stock').length || 0;
      const outOfStock = parts?.filter(p => p.status === 'out_of_stock').length || 0;
      const totalValue = parts?.reduce((sum, part) => sum + (part.quantity * part.unit_price), 0) || 0;

      return {
        totalParts,
        lowStock,
        outOfStock,
        totalValue
      };
    }
  });

  // Fetch approval requests count
  const { data: approvalStats, isLoading: approvalLoading } = useQuery({
    queryKey: ['approval-stats'],
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from('parts_approval_requests' as any)
        .select('status')
        .eq('organization_id', profile?.organization_id);

      if (error) {
        console.error('Error fetching approval requests:', error);
        return null;
      }

      const pending = requests?.filter(r => r.status === 'pending').length || 0;
      const approved = requests?.filter(r => r.status === 'approved').length || 0;
      const rejected = requests?.filter(r => r.status === 'rejected').length || 0;

      return { pending, approved, rejected };
    }
  });

  // CONDITIONAL RENDERING AFTER ALL HOOKS ARE CALLED
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins and council can access
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user has organization access
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

  // Check for query errors
  if (inventoryStats === null || approvalStats === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-gray-600">There was an error loading inventory data. Please try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Determine if we should show empty state
  const hasInventoryData = inventoryStats && inventoryStats.totalParts > 0;
  const hasApprovalData = approvalStats && (approvalStats.pending > 0 || approvalStats.approved > 0 || approvalStats.rejected > 0);
  const shouldShowEmptyState = !inventoryLoading && !approvalLoading && !hasInventoryData && !hasApprovalData;

  return (
    <PageLayout
      title="Inventory Management"
      description="Manage parts inventory, track stock levels, and handle approval requests"
      actionButton={{
        label: "Add Part",
        onClick: () => console.log("Add part clicked"),
        icon: <Plus className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Total Parts",
          value: inventoryStats?.totalParts || 0,
          icon: <Package className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "Low Stock",
          value: inventoryStats?.lowStock || 0,
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "text-yellow-600"
        },
        {
          title: "Out of Stock",
          value: inventoryStats?.outOfStock || 0,
          icon: <Clock className="h-4 w-4" />,
          color: "text-red-600"
        },
        {
          title: "Total Value",
          value: `$${(inventoryStats?.totalValue || 0).toLocaleString()}`,
          icon: <DollarSign className="h-4 w-4" />,
          color: "text-green-600"
        },
        {
          title: "Pending Approvals",
          value: approvalStats?.pending || 0,
          icon: <FileText className="h-4 w-4" />,
          color: "text-orange-600"
        },
        {
          title: "Approved Requests",
          value: approvalStats?.approved || 0,
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-green-600"
        }
      ]}
      searchPlaceholder="Search parts..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "Status",
          value: viewFilter,
          options: [
            { value: "all", label: "All Parts" },
            { value: "in_stock", label: "In Stock" },
            { value: "low_stock", label: "Low Stock" },
            { value: "out_of_stock", label: "Out of Stock" }
          ],
          onChange: setViewFilter
        }
      ]}
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "parts", label: "Parts List" },
        { value: "approvals", label: "Approval Requests" },
        { value: "analytics", label: "Analytics" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={inventoryLoading || approvalLoading}
      emptyState={shouldShowEmptyState ? {
        icon: <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />,
        title: "No Inventory Data",
        description: "No parts or approval requests found. Add your first part to get started.",
        action: {
          label: "Add Part",
          onClick: () => console.log("Add part clicked")
        }
      } : null}
    >
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Inventory Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="text-lg font-semibold">{inventoryStats?.totalParts || 0}</h3>
                  <p className="text-sm text-gray-600">Total Parts</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <h3 className="text-lg font-semibold">{inventoryStats?.lowStock || 0}</h3>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <h3 className="text-lg font-semibold">{inventoryStats?.outOfStock || 0}</h3>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-green-600">
                  ${(inventoryStats?.totalValue || 0).toLocaleString()}
                </h2>
                <p className="text-gray-600">Total Inventory Value</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Parts List Tab */}
      {activeTab === "parts" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Parts Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Parts Management</h3>
              <p className="text-gray-600 mb-6">
                View and manage your parts inventory, track stock levels, and update quantities.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Part
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Requests Tab */}
      {activeTab === "approvals" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Approval Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Approval Management</h3>
              <p className="text-gray-600 mb-6">
                Review and approve parts requests from your team members.
              </p>
              <div className="flex gap-4 justify-center">
                <Badge variant="outline" className="text-orange-600">
                  {approvalStats?.pending || 0} Pending
                </Badge>
                <Badge variant="outline" className="text-green-600">
                  {approvalStats?.approved || 0} Approved
                </Badge>
                <Badge variant="outline" className="text-red-600">
                  {approvalStats?.rejected || 0} Rejected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Inventory Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 mb-6">
                View detailed analytics about your inventory performance and trends.
              </p>
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Detailed Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default InventoryManagement;
