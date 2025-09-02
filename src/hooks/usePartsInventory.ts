import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Part {
  id: string;
  part_number: string;
  name: string;
  description?: string;
  category: 'engine' | 'brakes' | 'electrical' | 'tires' | 'fluids' | 'body' | 'interior' | 'other';
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
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
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
  notes?: string;
  moved_by: string;
  movement_date: string;
  part?: {
    part_number: string;
    name: string;
  };
}

export interface StockOrder {
  id: string;
  order_number: string;
  part_id: string;
  supplier?: string;
  supplier_contact?: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  total_cost: number;
  order_status: 'pending' | 'ordered' | 'shipped' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery?: string;
  actual_delivery?: string;
  notes?: string;
  ordered_by: string;
  received_by?: string;
}

export interface JobPart {
  id: string;
  job_id: string;
  part_id: string;
  quantity_used: number;
  unit_price: number;
  total_cost: number;
  usage_date: string;
  notes?: string;
  used_by: string;
  part?: {
    part_number: string;
    name: string;
  };
}

export interface PartsRequest {
  id: string;
  defect_id: string;
  part_id: string;
  quantity_requested: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  requested_by: string;
  requested_at: string;
  ordered_at?: string;
  received_at?: string;
  installed_at?: string;
  notes?: string;
  part?: {
    part_number: string;
    name: string;
  };
}

export interface InventoryStats {
  total: number;
  byStatus: {
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
    on_order: number;
  };
  byCategory: {
    engine: number;
    brakes: number;
    electrical: number;
    tires: number;
    fluids: number;
    body: number;
    interior: number;
    other: number;
  };
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentMovements: number;
}

export interface CreatePartData {
  part_number: string;
  name: string;
  description?: string;
  category: Part['category'];
  quantity: number;
  min_quantity: number;
  max_quantity?: number;
  unit_price: number;
  supplier?: string;
  supplier_contact?: string;
  location?: string;
}

export interface UpdatePartData {
  name?: string;
  description?: string;
  category?: Part['category'];
  min_quantity?: number;
  max_quantity?: number;
  unit_price?: number;
  supplier?: string;
  supplier_contact?: string;
  location?: string;
}

export interface StockMovementData {
  part_id: string;
  movement_type: StockMovement['movement_type'];
  quantity: number;
  unit_price?: number;
  reference_type: StockMovement['reference_type'];
  reference_number: string;
  notes?: string;
}

export const usePartsInventory = (organizationId?: string) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch parts inventory with related data
  const { data: parts = [], isLoading, error } = useQuery({
    queryKey: ['parts-inventory', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        const { data: partsData, error: partsError } = await supabase
          .from('parts_inventory')
          .select('*')
          .eq('organization_id', organizationId)
          .order('name');

        if (partsError) {
          console.error('Error fetching parts inventory:', partsError);
          return [];
        }

        return partsData || [];
      } catch (error) {
        console.error('Error in parts inventory query:', error);
        return [];
      }
    },
    enabled: !!organizationId && !!profile?.id
  });

  // Get inventory statistics
  const { data: inventoryStats } = useQuery({
    queryKey: ['parts-inventory-stats', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      try {
        const { data: partsData, error } = await supabase
          .from('parts_inventory')
          .select('quantity, status, category, unit_price')
          .eq('organization_id', organizationId);

        if (error) {
          console.error('Error fetching inventory stats:', error);
          return null;
        }

        const stats: InventoryStats = {
          total: partsData?.length || 0,
          byStatus: {
            in_stock: partsData?.filter(p => p.status === 'in_stock').length || 0,
            low_stock: partsData?.filter(p => p.status === 'low_stock').length || 0,
            out_of_stock: partsData?.filter(p => p.status === 'out_of_stock').length || 0,
            on_order: partsData?.filter(p => p.status === 'on_order').length || 0
          },
          byCategory: {
            engine: partsData?.filter(p => p.category === 'engine').length || 0,
            brakes: partsData?.filter(p => p.category === 'brakes').length || 0,
            electrical: partsData?.filter(p => p.category === 'electrical').length || 0,
            tires: partsData?.filter(p => p.category === 'tires').length || 0,
            fluids: partsData?.filter(p => p.category === 'fluids').length || 0,
            body: partsData?.filter(p => p.category === 'body').length || 0,
            interior: partsData?.filter(p => p.category === 'interior').length || 0,
            other: partsData?.filter(p => p.category === 'other').length || 0
          },
          totalValue: partsData?.reduce((sum, part) => sum + (part.quantity * (part.unit_price || 0)), 0) || 0,
          lowStockItems: partsData?.filter(p => p.status === 'low_stock').length || 0,
          outOfStockItems: partsData?.filter(p => p.status === 'out_of_stock').length || 0,
          recentMovements: 0 // Will be calculated separately
        };

        return stats;
      } catch (error) {
        console.error('Error calculating inventory stats:', error);
        return null;
      }
    },
    enabled: !!organizationId
  });

  // Fetch stock movements
  const { data: stockMovements = [] } = useQuery({
    queryKey: ['stock-movements', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        const { data: movementsData, error } = await supabase
          .from('stock_movements')
          .select('*')
          .eq('organization_id', organizationId)
          .order('movement_date', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching stock movements:', error);
          return [];
        }

        return movementsData || [];
      } catch (error) {
        console.error('Error in stock movements query:', error);
        return [];
      }
    },
    enabled: !!organizationId
  });

  // Fetch parts requests for work orders
  const { data: partsRequests = [] } = useQuery({
    queryKey: ['parts-requests', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        const { data: requestsData, error } = await supabase
          .from('parts_requests')
          .select('*')
          .eq('organization_id', organizationId)
          .order('requested_at', { ascending: false });

        if (error) {
          console.error('Error fetching parts requests:', error);
          return [];
        }

        return requestsData || [];
      } catch (error) {
        console.error('Error in parts requests query:', error);
        return [];
      }
    },
    enabled: !!organizationId
  });

  // Create part mutation
  const createPartMutation = useMutation({
    mutationFn: async (partData: CreatePartData) => {
      const { data, error } = await supabase
        .from('parts_inventory')
        .insert([{
          ...partData,
          organization_id: organizationId,
          status: partData.quantity > partData.min_quantity ? 'in_stock' : 'low_stock'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['parts-inventory-stats'] });
      toast.success('Part created successfully');
    },
    onError: (error) => {
      console.error('Error creating part:', error);
      toast.error('Failed to create part');
    }
  });

  // Update part mutation
  const updatePartMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePartData }) => {
      const { data: result, error } = await supabase
        .from('parts_inventory')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['parts-inventory-stats'] });
      toast.success('Part updated successfully');
    },
    onError: (error) => {
      console.error('Error updating part:', error);
      toast.error('Failed to update part');
    }
  });

  // Delete part mutation
  const deletePartMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('parts_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['parts-inventory-stats'] });
      toast.success('Part deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  });

  // Stock movement mutation
  const createStockMovementMutation = useMutation({
    mutationFn: async (movementData: StockMovementData) => {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert([{
          ...movementData,
          organization_id: organizationId,
          moved_by: profile?.id,
          movement_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['parts-inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      toast.success('Stock movement recorded successfully');
    },
    onError: (error) => {
      console.error('Error creating stock movement:', error);
      toast.error('Failed to record stock movement');
    }
  });

  // Create parts request mutation
  const createPartsRequestMutation = useMutation({
    mutationFn: async (requestData: {
      defect_id: string;
      part_id: string;
      quantity_requested: number;
      priority: PartsRequest['priority'];
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('parts_requests')
        .insert([{
          ...requestData,
          organization_id: organizationId,
          requested_by: profile?.id,
          status: 'pending',
          requested_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-requests'] });
      toast.success('Parts request created successfully');
    },
    onError: (error) => {
      console.error('Error creating parts request:', error);
      toast.error('Failed to create parts request');
    }
  });

  // Approve/reject parts request mutation
  const updatePartsRequestMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: PartsRequest['status']; notes?: string }) => {
      const { data, error } = await supabase
        .from('parts_requests')
        .update({
          status,
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
          notes: notes || ''
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-requests'] });
      toast.success('Parts request updated successfully');
    },
    onError: (error) => {
      console.error('Error updating parts request:', error);
      toast.error('Failed to update parts request');
    }
  });

  // Get parts by category for recommendations
  const getPartsByCategory = (category: Part['category']) => {
    return parts.filter(part => part.category === category && part.status !== 'out_of_stock');
  };

  // Get low stock parts
  const getLowStockParts = () => {
    return parts.filter(part => part.status === 'low_stock' || part.status === 'out_of_stock');
  };

  // Get parts for work order recommendations
  const getPartsForWorkOrder = (defectType: string) => {
    const categoryMap: Record<string, Part['category']> = {
      'mechanical': 'engine',
      'electrical': 'electrical',
      'safety': 'brakes',
      'cosmetic': 'body'
    };

    const category = categoryMap[defectType] || 'other';
    return getPartsByCategory(category);
  };

  return {
    parts,
    isLoading,
    error,
    inventoryStats,
    stockMovements,
    partsRequests,
    createPart: createPartMutation.mutate,
    updatePart: updatePartMutation.mutate,
    deletePart: deletePartMutation.mutate,
    createStockMovement: createStockMovementMutation.mutate,
    createPartsRequest: createPartsRequestMutation.mutate,
    updatePartsRequest: updatePartsRequestMutation.mutate,
    isCreating: createPartMutation.isPending,
    isUpdating: updatePartMutation.isPending,
    isDeleting: deletePartMutation.isPending,
    isCreatingMovement: createStockMovementMutation.isPending,
    isCreatingRequest: createPartsRequestMutation.isPending,
    isUpdatingRequest: updatePartsRequestMutation.isPending,
    getPartsByCategory,
    getLowStockParts,
    getPartsForWorkOrder
  };
};
