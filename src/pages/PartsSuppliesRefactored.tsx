import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus,
  Search,
  Edit,
  Eye,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  ShoppingCart,
  Minus,
  BarChart3,
  FileText,
  MapPin,
  Phone,
  Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Import the new tab components
import { InventoryTab } from '@/components/parts/InventoryTab';

interface Part {
  id: string;
  part_number: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_price: number;
  supplier: string;
  supplier_contact: string;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order';
  last_ordered: string;
  next_order_date: string;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: string;
  movement_number: string;
  part_id: string;
  movement_type: 'stock_in' | 'stock_out' | 'adjustment' | 'return';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  unit_price: number;
  total_value: number;
  reference_type: 'order' | 'job' | 'adjustment' | 'return' | 'manual';
  reference_number: string;
  notes: string;
  moved_by: string;
  movement_date: string;
  part?: {
    part_number: string;
    name: string;
  };
}

interface StockOrder {
  id: string;
  order_number: string;
  part_id: string;
  supplier: string;
  supplier_contact: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  total_cost: number;
  order_status: 'pending' | 'ordered' | 'shipped' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery: string;
  actual_delivery: string;
  notes: string;
  ordered_by: string;
  received_by: string;
}

const PartsSuppliesRefactored = () => {
  const { user, profile, loading } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isStockInDialogOpen, setIsStockInDialogOpen] = useState<boolean>(false);
  const [isStockOutDialogOpen, setIsStockOutDialogOpen] = useState<boolean>(false);

  // Data fetching
  const { data: parts = [], isLoading, refetch } = useQuery({
    queryKey: ['parts', profile?.organization_id],
    queryFn: async () => {
      console.log('🔍 Fetching parts from backend...');
      console.log('👤 Current user profile:', profile);
      console.log('🏢 User organization:', profile?.organization_id);

      if (!profile?.organization_id) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('parts_inventory')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching parts inventory:', error);
        throw error;
      }

      console.log('📊 Backend returned parts:', data);
      console.log('📊 Parts count:', data?.length || 0);
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: stockMovements = [] } = useQuery({
    queryKey: ['stock-movements', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          part:parts_inventory(part_number, name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('movement_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching stock movements:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: stockOrders = [] } = useQuery({
    queryKey: ['stock-orders', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('stock_orders')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('order_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching stock orders:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Mutations
  const createPartMutation = useMutation({
    mutationFn: async (newPart: Partial<Part>) => {
      const { data, error } = await supabase
        .from('parts_inventory')
        .insert([{ ...newPart, organization_id: profile?.organization_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Part created successfully');
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create part');
      console.error('Error creating part:', error);
    },
  });

  const updatePartMutation = useMutation({
    mutationFn: async (updatedPart: Partial<Part> & { id: string }) => {
      const { data, error } = await supabase
        .from('parts_inventory')
        .update(updatedPart)
        .eq('id', updatedPart.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Part updated successfully');
      setIsEditDialogOpen(false);
      setSelectedPart(null);
    },
    onError: (error) => {
      toast.error('Failed to update part');
      console.error('Error updating part:', error);
    },
  });

  // Event handlers
  const handleForceRefresh = async () => {
    console.log('🔄 Force refreshing data...');
    try {
      await refetch();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
    console.log('✅ Force refresh completed');
  };

  const handleCreatePart = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditPart = (part: Part) => {
    setSelectedPart(part);
    setIsEditDialogOpen(true);
  };

  const handleViewPart = (part: Part) => {
    setSelectedPart(part);
    setIsViewDialogOpen(true);
  };

  const handleStockIn = (part: Part) => {
    setSelectedPart(part);
    setIsStockInDialogOpen(true);
  };

  const handleStockOut = (part: Part) => {
    setSelectedPart(part);
    setIsStockOutDialogOpen(true);
  };

  // Filter parts based on active tab
  const getFilteredParts = () => {
    switch (activeTab) {
      case 'low_stock':
        return parts.filter(part => part.status === 'low_stock');
      case 'out_of_stock':
        return parts.filter(part => part.status === 'out_of_stock');
      case 'on_order':
        return parts.filter(part => part.status === 'on_order');
      default:
        return parts;
    }
  };

  const filteredParts = getFilteredParts();

  // Loading and auth checks
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading parts and supplies...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            Parts & Supplies Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage vehicle parts inventory, track stock movements, and handle orders
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleForceRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreatePart}>
            <Plus className="w-4 h-4 mr-2" />
            Add Part
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory">All Inventory</TabsTrigger>
          <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
          <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
          <TabsTrigger value="on_order">On Order</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryTab 
            parts={parts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddPart={handleCreatePart}
            onEditPart={handleEditPart}
            onViewPart={handleViewPart}
            onStockIn={handleStockIn}
            onStockOut={handleStockOut}
            onRefresh={handleForceRefresh}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="low_stock" className="space-y-6">
          <InventoryTab 
            parts={parts.filter(part => part.status === 'low_stock')}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddPart={handleCreatePart}
            onEditPart={handleEditPart}
            onViewPart={handleViewPart}
            onStockIn={handleStockIn}
            onStockOut={handleStockOut}
            onRefresh={handleForceRefresh}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="out_of_stock" className="space-y-6">
          <InventoryTab 
            parts={parts.filter(part => part.status === 'out_of_stock')}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddPart={handleCreatePart}
            onEditPart={handleEditPart}
            onViewPart={handleViewPart}
            onStockIn={handleStockIn}
            onStockOut={handleStockOut}
            onRefresh={handleForceRefresh}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="on_order" className="space-y-6">
          <InventoryTab 
            parts={parts.filter(part => part.status === 'on_order')}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddPart={handleCreatePart}
            onEditPart={handleEditPart}
            onViewPart={handleViewPart}
            onStockIn={handleStockIn}
            onStockOut={handleStockOut}
            onRefresh={handleForceRefresh}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Create Part Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
            <DialogDescription>
              Add a new part to your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Part creation form will be implemented</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Part Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Part</DialogTitle>
            <DialogDescription>
              Update part information
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Edit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Part editing form will be implemented</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Part Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Part Details</DialogTitle>
            <DialogDescription>
              View detailed part information
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Part details view will be implemented</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock In Dialog */}
      <Dialog open={isStockInDialogOpen} onOpenChange={setIsStockInDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stock In</DialogTitle>
            <DialogDescription>
              Add stock to inventory
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Stock in form will be implemented</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Out Dialog */}
      <Dialog open={isStockOutDialogOpen} onOpenChange={setIsStockOutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stock Out</DialogTitle>
            <DialogDescription>
              Remove stock from inventory
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Minus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Stock out form will be implemented</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartsSuppliesRefactored;
