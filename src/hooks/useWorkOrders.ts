import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WorkOrder {
  id: string;
  organization_id: string;
  vehicle_id: string;
  assigned_mechanic_id?: string;
  work_order_number: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  work_type: 'preventive' | 'corrective' | 'emergency' | 'inspection' | 'modification' | 'other';
  estimated_hours?: number;
  actual_hours?: number;
  parts_required?: string[];
  labor_cost?: number;
  parts_cost?: number;
  total_cost?: number;
  scheduled_date?: string;
  started_date?: string;
  completed_date?: string;
  due_date?: string;
  location?: string;
  work_area?: string;
  tools_required?: string[];
  safety_requirements?: string[];
  quality_check_required?: boolean;
  quality_check_completed?: boolean;
  quality_check_by?: string;
  quality_check_date?: string;
  customer_approval_required?: boolean;
  customer_approval_received?: boolean;
  customer_approval_date?: string;
  warranty_work?: boolean;
  warranty_details?: string;
  photos_before?: string[];
  photos_after?: string[];
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
    license_plate: string;
  };
  assigned_mechanic?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_by_profile?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateWorkOrderData {
  vehicle_id: string;
  assigned_mechanic_id?: string;
  work_order_number: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status?: 'open' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  work_type: 'preventive' | 'corrective' | 'emergency' | 'inspection' | 'modification' | 'other';
  estimated_hours?: number;
  parts_required?: string[];
  scheduled_date?: string;
  due_date?: string;
  location?: string;
  work_area?: string;
  tools_required?: string[];
  safety_requirements?: string[];
  notes?: string;
}

export interface UpdateWorkOrderData {
  assigned_mechanic_id?: string;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status?: 'open' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  work_type?: 'preventive' | 'corrective' | 'emergency' | 'inspection' | 'modification' | 'other';
  estimated_hours?: number;
  actual_hours?: number;
  parts_required?: string[];
  labor_cost?: number;
  parts_cost?: number;
  total_cost?: number;
  scheduled_date?: string;
  started_date?: string;
  completed_date?: string;
  due_date?: string;
  location?: string;
  work_area?: string;
  tools_required?: string[];
  safety_requirements?: string[];
  notes?: string;
}

export const useWorkOrders = (organizationId?: string, status?: string, priority?: string) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch work orders with related data
  const { data: workOrders = [], isLoading, error } = useQuery({
    queryKey: ['work-orders', organizationId, status, priority],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        let query = supabase
          .from('work_orders')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false });

        // Filter by status if specified
        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        // Filter by priority if specified
        if (priority && priority !== 'all') {
          query = query.eq('priority', priority);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error('Error fetching work orders:', fetchError);
          // Return mock data if table doesn't exist
          if (fetchError.code === 'PGRST205' || fetchError.code === '42P01') {
            console.warn('work_orders table not found, returning mock data');
            return [
              {
                id: 'mock-wo-1',
                work_order_number: 'WO-001',
                vehicle_id: 'mock-vehicle-1',
                title: 'Engine Maintenance',
                description: 'Regular engine maintenance and oil change',
                priority: 'medium',
                status: 'open',
                work_type: 'preventive',
                estimated_hours: 4,
                scheduled_date: new Date().toISOString(),
                organization_id: organizationId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ];
          }
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in work orders query:', error);
        return [];
      }
    },
    enabled: !!organizationId,
  });

  // Calculate statistics
  const calculateStats = () => {
    if (!workOrders || workOrders.length === 0) {
      return {
        total: 0,
        byStatus: {
          open: 0,
          assigned: 0,
          in_progress: 0,
          on_hold: 0,
          completed: 0,
          cancelled: 0,
        },
        byPriority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0,
          critical: 0,
        },
        byType: {
          preventive: 0,
          corrective: 0,
          emergency: 0,
          inspection: 0,
          modification: 0,
          other: 0,
        },
        totalCost: 0,
        totalHours: 0,
        overdue: 0,
      };
    }

    const stats = {
      total: workOrders.length,
      byStatus: {
        open: 0,
        assigned: 0,
        in_progress: 0,
        on_hold: 0,
        completed: 0,
        cancelled: 0,
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
        critical: 0,
      },
      byType: {
        preventive: 0,
        corrective: 0,
        emergency: 0,
        inspection: 0,
        modification: 0,
        other: 0,
      },
      totalCost: 0,
      totalHours: 0,
      overdue: 0,
    };

    const today = new Date();

    workOrders.forEach(order => {
      // Count by status
      if (order.status) {
        stats.byStatus[order.status as keyof typeof stats.byStatus]++;
      }

      // Count by priority
      if (order.priority) {
        stats.byPriority[order.priority as keyof typeof stats.byPriority]++;
      }

      // Count by type
      if (order.work_type) {
        stats.byType[order.work_type as keyof typeof stats.byType]++;
      }

      // Sum costs
      if (order.total_cost) {
        stats.totalCost += order.total_cost;
      }

      // Sum hours
      if (order.actual_hours) {
        stats.totalHours += order.actual_hours;
      }

      // Count overdue
      if (order.due_date && order.status !== 'completed' && order.status !== 'cancelled') {
        const dueDate = new Date(order.due_date);
        if (dueDate < today) {
          stats.overdue++;
        }
      }
    });

    return stats;
  };

  const stats = calculateStats();

  return {
    workOrders,
    isLoading,
    error,
    stats,
    hasData: workOrders.length > 0,
  };
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (workOrder: CreateWorkOrderData) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('work_orders')
        .insert([{
          ...workOrder,
          organization_id: profile.organization_id,
          created_by: profile.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
};

export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateWorkOrderData & { id: string }) => {
      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
};

export const useDeleteWorkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
};
