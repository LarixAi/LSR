import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WorkOrder {
  id: string;
  defect_number: string;
  work_order_number?: string;
  vehicle_id: string;
  reported_by: string;
  assigned_mechanic_id?: string;
  title: string;
  description?: string;
  defect_type: 'safety' | 'mechanical' | 'electrical' | 'cosmetic' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'repairing' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  reported_date: string;
  resolved_date?: string;
  start_date?: string;
  completion_date?: string;
  estimated_cost: number;
  actual_cost: number;
  estimated_hours?: number;
  actual_hours?: number;
  work_notes?: string;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
    license_plate: string;
  };
  reported_by_profile?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  assigned_mechanic?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateWorkOrderData {
  title: string;
  description?: string;
  vehicle_id: string;
  defect_type: 'safety' | 'mechanical' | 'electrical' | 'cosmetic' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  estimated_cost?: number;
  estimated_hours?: number;
  work_notes?: string;
}

export interface UpdateWorkOrderData {
  title?: string;
  description?: string;
  defect_type?: 'safety' | 'mechanical' | 'electrical' | 'cosmetic' | 'other';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'reported' | 'investigating' | 'repairing' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_mechanic_id?: string;
  location?: string;
  estimated_cost?: number;
  actual_cost?: number;
  estimated_hours?: number;
  actual_hours?: number;
  work_notes?: string;
  start_date?: string;
  completion_date?: string;
  resolved_date?: string;
}

export const useWorkOrders = (organizationId?: string) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch work orders with related data
  const { data: workOrders = [], isLoading, error } = useQuery({
    queryKey: ['work-orders', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        // First, get the defect reports (work orders)
        const { data: defectReports, error: defectError } = await supabase
          .from('defect_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (defectError) {
          console.error('Error fetching defect reports:', defectError);
          return [];
        }

        if (!defectReports || defectReports.length === 0) {
          return [];
        }

        // Extract unique IDs for related data
        const vehicleIds = [...new Set(defectReports.map(dr => dr.vehicle_id).filter(Boolean))];
        const reportedByIds = [...new Set(defectReports.map(dr => dr.reported_by).filter(Boolean))];
        const assignedMechanicIds = [...new Set(defectReports.map(dr => dr.assigned_mechanic_id).filter(Boolean))];

        // Fetch related data in parallel
        const [vehiclesData, reportedByData, assignedMechanicsData] = await Promise.all([
          vehicleIds.length > 0 ? supabase
            .from('vehicles')
            .select('id, vehicle_number, make, model, license_plate')
            .in('id', vehicleIds)
            .eq('organization_id', organizationId) : { data: [] },
          reportedByIds.length > 0 ? supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', reportedByIds) : { data: [] },
          assignedMechanicIds.length > 0 ? supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', assignedMechanicIds) : { data: [] }
        ]);

        // Create maps for efficient lookup
        const vehiclesMap = new Map(
          (vehiclesData.data || []).map(v => [v.id, v])
        );
        const reportedByMap = new Map(
          (reportedByData.data || []).map(p => [p.id, p])
        );
        const assignedMechanicsMap = new Map(
          (assignedMechanicsData.data || []).map(p => [p.id, p])
        );

        // Combine the data
        const workOrdersWithRelations = defectReports.map(defect => ({
          ...defect,
          vehicle: vehiclesMap.get(defect.vehicle_id),
          reported_by_profile: reportedByMap.get(defect.reported_by),
          assigned_mechanic: assignedMechanicsMap.get(defect.assigned_mechanic_id)
        }));

        return workOrdersWithRelations as WorkOrder[];
      } catch (error) {
        console.error('Error in work orders query:', error);
        return [];
      }
    },
    enabled: !!organizationId && !!profile?.id
  });

  // Create work order mutation
  const createWorkOrderMutation = useMutation({
    mutationFn: async (workOrderData: CreateWorkOrderData) => {
      const { data, error } = await supabase
        .from('defect_reports')
        .insert([{
          ...workOrderData,
          reported_by: profile?.id,
          defect_number: `DEF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
          reported_date: new Date().toISOString(),
          estimated_cost: workOrderData.estimated_cost || 0,
          actual_cost: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    }
  });

  // Update work order mutation
  const updateWorkOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWorkOrderData }) => {
      const { data: result, error } = await supabase
        .from('defect_reports')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    }
  });

  // Delete work order mutation
  const deleteWorkOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('defect_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    }
  });

  // Get work order statistics
  const { data: workOrderStats } = useQuery({
    queryKey: ['work-order-stats', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      try {
        const { data: defectReports, error } = await supabase
          .from('defect_reports')
          .select('status, severity, estimated_cost, actual_cost');

        if (error) {
          console.error('Error fetching work order stats:', error);
          return null;
        }

        const stats = {
          total: defectReports?.length || 0,
          byStatus: {
            reported: defectReports?.filter(dr => dr.status === 'reported').length || 0,
            investigating: defectReports?.filter(dr => dr.status === 'investigating').length || 0,
            repairing: defectReports?.filter(dr => dr.status === 'repairing').length || 0,
            resolved: defectReports?.filter(dr => dr.status === 'resolved').length || 0,
            closed: defectReports?.filter(dr => dr.status === 'closed').length || 0
          },
          bySeverity: {
            low: defectReports?.filter(dr => dr.severity === 'low').length || 0,
            medium: defectReports?.filter(dr => dr.severity === 'medium').length || 0,
            high: defectReports?.filter(dr => dr.severity === 'high').length || 0,
            critical: defectReports?.filter(dr => dr.severity === 'critical').length || 0
          },
          totalEstimatedCost: defectReports?.reduce((sum, dr) => sum + (dr.estimated_cost || 0), 0) || 0,
          totalActualCost: defectReports?.reduce((sum, dr) => sum + (dr.actual_cost || 0), 0) || 0
        };

        return stats;
      } catch (error) {
        console.error('Error calculating work order stats:', error);
        return null;
      }
    },
    enabled: !!organizationId
  });

  return {
    workOrders,
    isLoading,
    error,
    createWorkOrder: createWorkOrderMutation.mutate,
    updateWorkOrder: updateWorkOrderMutation.mutate,
    deleteWorkOrder: deleteWorkOrderMutation.mutate,
    isCreating: createWorkOrderMutation.isPending,
    isUpdating: updateWorkOrderMutation.isPending,
    isDeleting: deleteWorkOrderMutation.isPending,
    workOrderStats
  };
};
