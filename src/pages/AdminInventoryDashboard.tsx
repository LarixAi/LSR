import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Users,
  FileText
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminApprovalPanel from '@/components/inventory/AdminApprovalPanel';

const AdminInventoryDashboard = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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

  // Fetch inventory statistics
  const { data: inventoryStats } = useQuery({
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
  const { data: approvalStats } = useQuery({
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-gray-600">Admin dashboard for inventory control and approvals</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{profile.role}</Badge>
          <span className="text-sm text-gray-500">
            {profile.full_name}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats?.totalParts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Parts in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inventoryStats?.lowStock || 0}</div>
            <p className="text-xs text-muted-foreground">
              Need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventoryStats?.outOfStock || 0}</div>
            <p className="text-xs text-muted-foreground">
              Urgent orders needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              £{(inventoryStats?.totalValue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Approval Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{approvalStats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvalStats?.approved || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{approvalStats?.rejected || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Approvals
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => setActiveTab('approvals')}
                >
                  <FileText className="w-6 h-6" />
                  <span>Review Approvals</span>
                  {approvalStats?.pending > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {approvalStats.pending}
                    </Badge>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => setActiveTab('inventory')}
                >
                  <Package className="w-6 h-6" />
                  <span>Manage Inventory</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Users className="w-6 h-6" />
                  <span>User Management</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New part added</p>
                    <p className="text-xs text-gray-500">Brake Pad Set (Front) - 2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Approval request submitted</p>
                    <p className="text-xs text-gray-500">Quantity increase for Oil Filter - 15 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-gray-500">Battery 12V 100Ah - 1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <AdminApprovalPanel />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Full inventory management interface will be implemented here.
                This will include part management, stock movements, and reporting.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Approval Thresholds</h4>
                  <p className="text-sm text-gray-600">
                    Configure automatic approval thresholds for different types of requests.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Notification Settings</h4>
                  <p className="text-sm text-gray-600">
                    Manage email and in-app notifications for inventory alerts.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">User Permissions</h4>
                  <p className="text-sm text-gray-600">
                    Configure what different user roles can do in the inventory system.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInventoryDashboard;
