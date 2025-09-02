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

interface JobPart {
  id: string;
  job_id: string;
  part_id: string;
  quantity_used: number;
  unit_price: number;
  total_cost: number;
  usage_date: string;
  notes: string;
  used_by: string;
}

const PartsSupplies = () => {
  const { user, profile, loading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showStockInDialog, setShowStockInDialog] = useState(false);
  const [showStockOutDialog, setShowStockOutDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showMovementsDialog, setShowMovementsDialog] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    part_number: '',
    name: '',
    description: '',
    category: 'engine' as string,
    quantity: 0,
    min_quantity: 0,
    unit_price: 0,
    supplier: '',
    supplier_contact: '',
    location: '',
    notes: ''
  });

  // Stock management form states
  const [stockInData, setStockInData] = useState({
    quantity: 0,
    unit_price: 0,
    reference_type: 'manual' as string,
    reference_number: '',
    notes: ''
  });

  const [stockOutData, setStockOutData] = useState({
    quantity: 0,
    reference_type: 'job' as string,
    reference_number: '',
    notes: ''
  });

  const [orderData, setOrderData] = useState({
    quantity: 0,
    unit_price: 0,
    supplier: '',
    supplier_contact: '',
    expected_delivery: '',
    notes: ''
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading parts inventory...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile.role !== 'mechanic') {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch parts inventory
  const { data: parts = [], isLoading, refetch } = useQuery({
    queryKey: ['parts-inventory'],
    queryFn: async () => {
      console.log('🔍 Fetching parts from backend...');
      console.log('👤 Current user profile:', profile);
      console.log('🏢 User organization:', profile?.organization_id);
      
      const { data, error } = await supabase
        .from('parts_inventory' as any)
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .order('name');

      if (error) {
        console.error('Error fetching parts inventory:', error);
        return [];
      }
      
      console.log('📊 Backend returned parts:', data);
      console.log('📊 Parts count:', data?.length || 0);
      
      return (data || []) as unknown as Part[];
    },
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data (React Query v4+)
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
  });

  // Force refresh function
  const handleForceRefresh = async () => {
    console.log('🔄 Force refreshing data...');
    
    // Clear all possible caches
    queryClient.clear(); // Clear all React Query cache
    localStorage.clear(); // Clear localStorage
    sessionStorage.clear(); // Clear sessionStorage
    
    // Invalidate all related queries
    await queryClient.invalidateQueries({ queryKey: ['parts-inventory'] });
    await queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    await queryClient.invalidateQueries({ queryKey: ['stock-orders'] });
    
    // Force refetch
    await refetch();
    console.log('✅ Force refresh completed');
  };

  // Force refresh on component mount to clear any cached data
  useEffect(() => {
    handleForceRefresh();
  }, []);

  // Fetch stock movements
  const { data: stockMovements = [] } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements' as any)
        .select(`
          *,
          part:parts_inventory(part_number, name)
        `)
        .order('movement_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching stock movements:', error);
        return [];
      }
      return (data || []) as unknown as StockMovement[];
    }
  });

  // Fetch stock orders
  const { data: stockOrders = [] } = useQuery({
    queryKey: ['stock-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_orders' as any)
        .select(`
          *,
          part:parts_inventory(part_number, name)
        `)
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error fetching stock orders:', error);
        return [];
      }
      return (data || []) as unknown as StockOrder[];
    }
  });

  // Create part mutation
  const createPartMutation = useMutation({
    mutationFn: async (partData: any) => {
      // Add organization_id and created_by to the part data
      const enrichedPartData = {
        ...partData,
        organization_id: profile?.organization_id,
        created_by: user?.id,
        status: 'in_stock'
      };

      const { data, error } = await supabase
        .from('parts_inventory' as any)
        .insert([enrichedPartData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-inventory'] });
      toast({
        title: 'Success',
        description: 'Part added successfully',
      });
      setShowCreateDialog(false);
      setFormData({
        part_number: '',
        name: '',
        description: '',
        category: 'engine',
        quantity: 0,
        min_quantity: 0,
        unit_price: 0,
        supplier: '',
        supplier_contact: '',
        location: '',
        notes: ''
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add part',
        variant: 'destructive',
      });
    }
  });

  // Update part mutation
  const updatePartMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await supabase
        .from('parts_inventory' as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-inventory'] });
      toast({
        title: 'Success',
        description: 'Part updated successfully',
      });
      setShowEditDialog(false);
      setSelectedPart(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update part',
        variant: 'destructive',
      });
    }
  });

  // Stock movement mutations
  const createStockMovementMutation = useMutation({
    mutationFn: async (movementData: any) => {
      const { data, error } = await supabase
        .from('stock_movements' as any)
        .insert([movementData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-inventory', 'stock-movements'] });
      toast({
        title: 'Success',
        description: 'Stock movement recorded successfully',
      });
      setShowStockInDialog(false);
      setShowStockOutDialog(false);
      setStockInData({ quantity: 0, unit_price: 0, reference_type: 'manual', reference_number: '', notes: '' });
      setStockOutData({ quantity: 0, reference_type: 'job', reference_number: '', notes: '' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to record stock movement',
        variant: 'destructive',
      });
    }
  });

  // Stock order mutations
  const createStockOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const { data, error } = await supabase
        .from('stock_orders' as any)
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-orders'] });
      toast({
        title: 'Success',
        description: 'Stock order created successfully',
      });
      setShowOrderDialog(false);
      setOrderData({ quantity: 0, unit_price: 0, supplier: '', supplier_contact: '', expected_delivery: '', notes: '' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create stock order',
        variant: 'destructive',
      });
    }
  });

  // Filter parts based on active tab and filters
  const filteredParts = parts.filter((part: Part) => {
    // Tab filter
    if (activeTab === 'low_stock' && part.quantity > part.min_quantity) return false;
    if (activeTab === 'out_of_stock' && part.quantity > 0) return false;
    if (activeTab === 'on_order' && part.status !== 'on_order') return false;
    
    // Search filter
    if (searchTerm && !part.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !part.part_number.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all' && part.category !== categoryFilter) return false;
    
    // Status filter
    if (statusFilter !== 'all' && part.status !== statusFilter) return false;
    
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800 border-green-200';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out_of_stock': return 'bg-red-100 text-red-800 border-red-200';
      case 'on_order': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle className="w-4 h-4" />;
      case 'low_stock': return <AlertTriangle className="w-4 h-4" />;
      case 'out_of_stock': return <Minus className="w-4 h-4" />;
      case 'on_order': return <Clock className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const handleCreatePart = () => {
    createPartMutation.mutate({
      part_number: formData.part_number,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      quantity: formData.quantity,
      min_quantity: formData.min_quantity,
      unit_price: formData.unit_price,
      supplier: formData.supplier,
      supplier_contact: formData.supplier_contact,
      location: formData.location,
      status: formData.quantity > formData.min_quantity ? 'in_stock' : 'low_stock'
    });
  };

  const handleUpdatePart = () => {
    if (!selectedPart) return;
    
    updatePartMutation.mutate({
      id: selectedPart.id,
      data: {
        part_number: formData.part_number,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        quantity: formData.quantity,
        min_quantity: formData.min_quantity,
        unit_price: formData.unit_price,
        supplier: formData.supplier,
        supplier_contact: formData.supplier_contact,
        location: formData.location,
        status: formData.quantity > formData.min_quantity ? 'in_stock' : 'low_stock'
      }
    });
  };

  const handleEditPart = (part: Part) => {
    setSelectedPart(part);
    setFormData({
      part_number: part.part_number,
      name: part.name,
      description: part.description,
      category: part.category,
      quantity: part.quantity,
      min_quantity: part.min_quantity,
      unit_price: part.unit_price,
      supplier: part.supplier,
      supplier_contact: part.supplier_contact,
      location: part.location,
      notes: ''
    });
    setShowEditDialog(true);
  };

  const handleViewPart = (part: Part) => {
    setSelectedPart(part);
    setShowViewDialog(true);
  };

  const handleStockIn = (part: Part) => {
    setSelectedPart(part);
    setStockInData({
      quantity: 0,
      unit_price: part.unit_price,
      reference_type: 'manual',
      reference_number: '',
      notes: ''
    });
    setShowStockInDialog(true);
  };

  const handleStockOut = (part: Part) => {
    setSelectedPart(part);
    setStockOutData({
      quantity: 0,
      reference_type: 'job',
      reference_number: '',
      notes: ''
    });
    setShowStockOutDialog(true);
  };

  const handleCreateOrder = (part: Part) => {
    setSelectedPart(part);
    setOrderData({
      quantity: part.min_quantity * 2,
      unit_price: part.unit_price,
      supplier: part.supplier,
      supplier_contact: part.supplier_contact,
      expected_delivery: '',
      notes: ''
    });
    setShowOrderDialog(true);
  };

  const handleViewMovements = () => {
    setShowMovementsDialog(true);
  };

  const handleStockInSubmit = () => {
    if (!selectedPart) return;
    
    createStockMovementMutation.mutate({
      part_id: selectedPart.id,
      movement_type: 'stock_in',
      quantity: stockInData.quantity,
      previous_quantity: selectedPart.quantity,
      new_quantity: selectedPart.quantity + stockInData.quantity,
      unit_price: stockInData.unit_price,
      total_value: stockInData.quantity * stockInData.unit_price,
      reference_type: stockInData.reference_type,
      reference_number: stockInData.reference_number,
      notes: stockInData.notes,
      moved_by: profile.id
    });
  };

  const handleStockOutSubmit = () => {
    if (!selectedPart) return;
    
    if (stockOutData.quantity > selectedPart.quantity) {
      toast({
        title: 'Error',
        description: 'Insufficient stock available',
        variant: 'destructive',
      });
      return;
    }
    
    createStockMovementMutation.mutate({
      part_id: selectedPart.id,
      movement_type: 'stock_out',
      quantity: stockOutData.quantity,
      previous_quantity: selectedPart.quantity,
      new_quantity: selectedPart.quantity - stockOutData.quantity,
      unit_price: selectedPart.unit_price,
      total_value: stockOutData.quantity * selectedPart.unit_price,
      reference_type: stockOutData.reference_type,
      reference_number: stockOutData.reference_number,
      notes: stockOutData.notes,
      moved_by: profile.id
    });
  };

  const handleOrderSubmit = () => {
    if (!selectedPart) return;
    
    createStockOrderMutation.mutate({
      part_id: selectedPart.id,
      supplier: orderData.supplier,
      supplier_contact: orderData.supplier_contact,
      quantity_ordered: orderData.quantity,
      unit_price: orderData.unit_price,
      total_cost: orderData.quantity * orderData.unit_price,
      expected_delivery: orderData.expected_delivery,
      notes: orderData.notes,
      ordered_by: profile.id
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Parts & Supplies
          </h1>
          <p className="text-gray-600 mt-1">Manage inventory, track supplies, and handle orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleViewMovements}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Stock Movements
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Part
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts.length}</div>
            <p className="text-xs text-muted-foreground">
              {parts.filter((p: Part) => p.status === 'in_stock').length} in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parts.filter((p: Part) => p.status === 'low_stock').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Minus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parts.filter((p: Part) => p.status === 'out_of_stock').length}
            </div>
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
            <div className="text-2xl font-bold">
              £{parts.reduce((acc: number, p: Part) => acc + (p.quantity * p.unit_price), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search parts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="engine">Engine</SelectItem>
                  <SelectItem value="brakes">Brakes</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="tires">Tires</SelectItem>
                  <SelectItem value="fluids">Fluids</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="on_order">On Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={handleForceRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Parts Inventory List */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="inventory">All Inventory</TabsTrigger>
              <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
              <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
              <TabsTrigger value="on_order">On Order</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No parts found</h3>
              <p className="text-gray-500 mb-4">Add your first part to get started</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Part
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredParts.map((part: Part) => (
                <div key={part.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{part.part_number}</h4>
                        <Badge className={getStatusColor(part.status)}>
                          {getStatusIcon(part.status)}
                          {part.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {part.category}
                        </Badge>
                      </div>
                      <h5 className="font-medium text-lg mb-1">{part.name}</h5>
                      <p className="text-gray-600 text-sm mb-2">{part.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <p className="font-medium">{part.quantity} / {part.min_quantity}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Unit Price:</span>
                          <p className="font-medium">£{part.unit_price}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Supplier:</span>
                          <p className="font-medium">{part.supplier}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p className="font-medium">{part.location}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPart(part)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPart(part)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockIn(part)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockOut(part)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      {(part.status === 'low_stock' || part.status === 'out_of_stock') && (
                        <Button
                          size="sm"
                          onClick={() => handleCreateOrder(part)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Order
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Part Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="create-part-desc">
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
            <DialogDescription id="create-part-desc">
              Add a new part to the inventory
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="part_number">Part Number</Label>
                <Input
                  id="part_number"
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  placeholder="e.g., BRK-001"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engine">Engine</SelectItem>
                    <SelectItem value="brakes">Brakes</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="tires">Tires</SelectItem>
                    <SelectItem value="fluids">Fluids</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="name">Part Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Brake Pad Set"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the part..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Current Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="min_quantity">Min Quantity</Label>
                <Input
                  id="min_quantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="unit_price">Unit Price (£)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>
              <div>
                <Label htmlFor="supplier_contact">Supplier Contact</Label>
                <Input
                  id="supplier_contact"
                  value={formData.supplier_contact}
                  onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })}
                  placeholder="Phone or email"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Shelf A1, Bin 3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePart} disabled={createPartMutation.isPending}>
              {createPartMutation.isPending ? 'Adding...' : 'Add Part'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Part Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="edit-part-desc">
          <DialogHeader>
            <DialogTitle>Edit Part</DialogTitle>
            <DialogDescription id="edit-part-desc">
              Update part information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-part_number">Part Number</Label>
                <Input
                  id="edit-part_number"
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engine">Engine</SelectItem>
                    <SelectItem value="brakes">Brakes</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="tires">Tires</SelectItem>
                    <SelectItem value="fluids">Fluids</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-name">Part Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-quantity">Current Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-min_quantity">Min Quantity</Label>
                <Input
                  id="edit-min_quantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-unit_price">Unit Price (£)</Label>
                <Input
                  id="edit-unit_price"
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-supplier">Supplier</Label>
                <Input
                  id="edit-supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-supplier_contact">Supplier Contact</Label>
                <Input
                  id="edit-supplier_contact"
                  value={formData.supplier_contact}
                  onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-location">Storage Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePart} disabled={updatePartMutation.isPending}>
              {updatePartMutation.isPending ? 'Updating...' : 'Update Part'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Part Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" aria-describedby="view-part-desc">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {selectedPart?.name}
                </DialogTitle>
                <DialogDescription id="view-part-desc" className="text-sm text-muted-foreground mt-1">
                  Part Number: {selectedPart?.part_number}
                </DialogDescription>
              </div>
              {selectedPart && (
                <Badge className={getStatusColor(selectedPart.status)}>
                  {getStatusIcon(selectedPart.status)}
                  {selectedPart.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          {selectedPart && (
            <div className="space-y-6 py-4">
              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Description</Label>
                    <p className="text-gray-900 mt-1">{selectedPart.description || 'No description available'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Category</Label>
                    <Badge variant="outline" className="mt-1">
                      {selectedPart.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stock Information Section */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Stock Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Label className="text-sm font-medium text-gray-600">Current Stock</Label>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{selectedPart.quantity}</p>
                    <p className="text-xs text-gray-500">units available</p>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm font-medium text-gray-600">Minimum Stock</Label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{selectedPart.min_quantity}</p>
                    <p className="text-xs text-gray-500">reorder level</p>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm font-medium text-gray-600">Stock Level</Label>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            selectedPart.quantity > selectedPart.min_quantity ? 'bg-green-500' : 
                            selectedPart.quantity > 0 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min((selectedPart.quantity / selectedPart.min_quantity) * 50, 100)}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedPart.quantity / selectedPart.min_quantity).toFixed(1)}x minimum
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information Section */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Label className="text-sm font-medium text-gray-600">Unit Price</Label>
                    <p className="text-xl font-bold text-green-600 mt-1">£{selectedPart.unit_price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">per unit</p>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm font-medium text-gray-600">Total Value</Label>
                    <p className="text-xl font-bold text-blue-600 mt-1">£{(selectedPart.quantity * selectedPart.unit_price).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">current inventory</p>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm font-medium text-gray-600">Reorder Value</Label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">£{(selectedPart.min_quantity * selectedPart.unit_price).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">minimum order</p>
                  </div>
                </div>
              </div>

              {/* Location & Supplier Section */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location & Supplier
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Storage Location</Label>
                    <p className="text-gray-900 mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {selectedPart.location || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Supplier</Label>
                    <p className="text-gray-900 mt-1 font-medium">{selectedPart.supplier || 'Not specified'}</p>
                    {selectedPart.supplier_contact && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedPart.supplier_contact}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => {
                    setShowViewDialog(false);
                    handleEditPart(selectedPart);
                  }} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Part
                  </Button>
                  <Button onClick={() => {
                    setShowViewDialog(false);
                    handleStockIn(selectedPart);
                  }} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Stock In
                  </Button>
                  <Button onClick={() => {
                    setShowViewDialog(false);
                    handleStockOut(selectedPart);
                  }} variant="outline" size="sm">
                    <Minus className="w-4 h-4 mr-2" />
                    Stock Out
                  </Button>
                  {(selectedPart.status === 'low_stock' || selectedPart.status === 'out_of_stock') && (
                    <Button onClick={() => {
                      setShowViewDialog(false);
                      handleCreateOrder(selectedPart);
                    }} size="sm">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Order More
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock In Dialog */}
      <Dialog open={showStockInDialog} onOpenChange={setShowStockInDialog}>
        <DialogContent className="max-w-md" aria-describedby="stock-in-desc">
          <DialogHeader>
            <DialogTitle>Stock In</DialogTitle>
            <DialogDescription id="stock-in-desc">
              Add stock for {selectedPart?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="stock-in-quantity">Quantity</Label>
              <Input
                id="stock-in-quantity"
                type="number"
                value={stockInData.quantity}
                onChange={(e) => setStockInData({ ...stockInData, quantity: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="stock-in-price">Unit Price (£)</Label>
              <Input
                id="stock-in-price"
                type="number"
                step="0.01"
                value={stockInData.unit_price}
                onChange={(e) => setStockInData({ ...stockInData, unit_price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="stock-in-reference">Reference Type</Label>
              <Select value={stockInData.reference_type} onValueChange={(value) => setStockInData({ ...stockInData, reference_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock-in-reference-number">Reference Number</Label>
              <Input
                id="stock-in-reference-number"
                value={stockInData.reference_number}
                onChange={(e) => setStockInData({ ...stockInData, reference_number: e.target.value })}
                placeholder="e.g., ORD-001, Return-001"
              />
            </div>
            <div>
              <Label htmlFor="stock-in-notes">Notes</Label>
              <Textarea
                id="stock-in-notes"
                value={stockInData.notes}
                onChange={(e) => setStockInData({ ...stockInData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockInDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockInSubmit} disabled={createStockMovementMutation.isPending}>
              {createStockMovementMutation.isPending ? 'Adding...' : 'Add Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Out Dialog */}
      <Dialog open={showStockOutDialog} onOpenChange={setShowStockOutDialog}>
        <DialogContent className="max-w-md" aria-describedby="stock-out-desc">
          <DialogHeader>
            <DialogTitle>Stock Out</DialogTitle>
            <DialogDescription id="stock-out-desc">
              Remove stock for {selectedPart?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="stock-out-quantity">Quantity</Label>
              <Input
                id="stock-out-quantity"
                type="number"
                value={stockOutData.quantity}
                onChange={(e) => setStockOutData({ ...stockOutData, quantity: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="stock-out-reference">Reference Type</Label>
              <Select value={stockOutData.reference_type} onValueChange={(value) => setStockOutData({ ...stockOutData, reference_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock-out-reference-number">Reference Number</Label>
              <Input
                id="stock-out-reference-number"
                value={stockOutData.reference_number}
                onChange={(e) => setStockOutData({ ...stockOutData, reference_number: e.target.value })}
                placeholder="e.g., JOB-001, ADJ-001"
              />
            </div>
            <div>
              <Label htmlFor="stock-out-notes">Notes</Label>
              <Textarea
                id="stock-out-notes"
                value={stockOutData.notes}
                onChange={(e) => setStockOutData({ ...stockOutData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockOutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockOutSubmit} disabled={createStockMovementMutation.isPending}>
              {createStockMovementMutation.isPending ? 'Removing...' : 'Remove Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-md" aria-describedby="create-order-desc">
          <DialogHeader>
            <DialogTitle>Create Order</DialogTitle>
            <DialogDescription id="create-order-desc">
              Order {selectedPart?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="order-quantity">Quantity</Label>
              <Input
                id="order-quantity"
                type="number"
                value={orderData.quantity}
                onChange={(e) => setOrderData({ ...orderData, quantity: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="order-price">Unit Price (£)</Label>
              <Input
                id="order-price"
                type="number"
                step="0.01"
                value={orderData.unit_price}
                onChange={(e) => setOrderData({ ...orderData, unit_price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="order-supplier">Supplier</Label>
              <Input
                id="order-supplier"
                value={orderData.supplier}
                onChange={(e) => setOrderData({ ...orderData, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
            <div>
              <Label htmlFor="order-contact">Supplier Contact</Label>
              <Input
                id="order-contact"
                value={orderData.supplier_contact}
                onChange={(e) => setOrderData({ ...orderData, supplier_contact: e.target.value })}
                placeholder="Phone or email"
              />
            </div>
            <div>
              <Label htmlFor="order-delivery">Expected Delivery</Label>
              <Input
                id="order-delivery"
                type="date"
                value={orderData.expected_delivery}
                onChange={(e) => setOrderData({ ...orderData, expected_delivery: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="order-notes">Notes</Label>
              <Textarea
                id="order-notes"
                value={orderData.notes}
                onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleOrderSubmit} disabled={createStockOrderMutation.isPending}>
              {createStockOrderMutation.isPending ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Movements Dialog */}
      <Dialog open={showMovementsDialog} onOpenChange={setShowMovementsDialog}>
        <DialogContent className="max-w-4xl" aria-describedby="stock-movements-desc">
          <DialogHeader>
            <DialogTitle>Stock Movements</DialogTitle>
            <DialogDescription id="stock-movements-desc">
              Recent stock movements and audit trail
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {stockMovements.map((movement: StockMovement) => (
                <div key={movement.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{movement.movement_number}</h4>
                    <Badge className={movement.movement_type === 'stock_in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {movement.movement_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Part:</span>
                      <p className="font-medium">{movement.part?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <p className="font-medium">{movement.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Reference:</span>
                      <p className="font-medium">{movement.reference_number || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-medium">{new Date(movement.movement_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {movement.notes && (
                    <div className="mt-2">
                      <span className="text-gray-500 text-sm">Notes:</span>
                      <p className="text-sm">{movement.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovementsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartsSupplies;