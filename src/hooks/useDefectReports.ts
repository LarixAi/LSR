import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DefectReport {
  id: string;
  organization_id: string;
  vehicle_id: string;
  reported_by: string;
  defect_type: 'mechanical' | 'electrical' | 'body' | 'interior' | 'safety' | 'cosmetic' | 'performance' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'approved' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  location?: string;
  component_affected?: string;
  estimated_repair_cost?: number;
  actual_repair_cost?: number;
  reported_date: string;
  investigated_date?: string;
  investigation_notes?: string;
  investigation_by?: string;
  approved_date?: string;
  approved_by?: string;
  work_order_id?: string;
  resolved_date?: string;
  resolution_notes?: string;
  resolution_method?: string;
  parts_used?: string[];
  labor_hours?: number;
  warranty_claim?: boolean;
  warranty_claim_number?: string;
  warranty_claim_status?: string;
  photos?: string[];
  attachments?: string[];
  safety_implications?: boolean;
  safety_implications_details?: string;
  operational_impact?: string;
  customer_notified?: boolean;
  customer_notification_date?: string;
  customer_response?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
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
    email: string;
  };
  investigation_by_profile?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  approved_by_profile?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  work_order?: {
    id: string;
    work_order_number: string;
    title: string;
  };
}

export interface CreateDefectReportData {
  vehicle_id: string;
  defect_type: 'mechanical' | 'electrical' | 'body' | 'interior' | 'safety' | 'cosmetic' | 'performance' | 'other';
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  component_affected?: string;
  estimated_repair_cost?: number;
  reported_date?: string;
  safety_implications?: boolean;
  safety_implications_details?: string;
  operational_impact?: string;
}

export interface UpdateDefectReportData {
  defect_type?: 'mechanical' | 'electrical' | 'body' | 'interior' | 'safety' | 'cosmetic' | 'performance' | 'other';
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'reported' | 'investigating' | 'approved' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  location?: string;
  component_affected?: string;
  estimated_repair_cost?: number;
  actual_repair_cost?: number;
  investigation_notes?: string;
  investigation_by?: string;
  approved_by?: string;
  work_order_id?: string;
  resolution_notes?: string;
  resolution_method?: string;
  parts_used?: string[];
  labor_hours?: number;
  notes?: string;
}

export const useDefectReports = (organizationId?: string, status?: string, severity?: string) => {
  const { profile } = useAuth();

  // Fetch defect reports with related data
  const { data: defectReports = [], isLoading, error } = useQuery({
    queryKey: ['defect-reports', organizationId, status, severity],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        let query = supabase
          .from('defect_reports')
          .select(`
            *,
            vehicle:vehicles!defect_reports_vehicle_id_fkey(id, vehicle_number, make, model, license_plate),
            reported_by_profile:profiles!defect_reports_reported_by_fkey(id, first_name, last_name, email),
            investigation_by_profile:profiles!defect_reports_investigation_by_fkey(id, first_name, last_name),
            approved_by_profile:profiles!defect_reports_approved_by_fkey(id, first_name, last_name),
            work_order:work_orders!defect_reports_work_order_id_fkey(id, work_order_number, title)
          `)
          .eq('organization_id', organizationId)
          .order('reported_date', { ascending: false });

        // Filter by status if specified
        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        // Filter by severity if specified
        if (severity && severity !== 'all') {
          query = query.eq('severity', severity);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error('Error fetching defect reports:', fetchError);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in defect reports query:', error);
        return [];
      }
    },
    enabled: !!organizationId,
  });

  // Calculate statistics
  const calculateStats = () => {
    if (!defectReports || defectReports.length === 0) {
      return {
        total: 0,
        byStatus: {
          reported: 0,
          investigating: 0,
          approved: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0,
          rejected: 0,
        },
        bySeverity: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
        },
        byType: {
          mechanical: 0,
          electrical: 0,
          body: 0,
          interior: 0,
          safety: 0,
          cosmetic: 0,
          performance: 0,
          other: 0,
        },
        totalEstimatedCost: 0,
        totalActualCost: 0,
        safetyIssues: 0,
        warrantyClaims: 0,
      };
    }

    const stats = {
      total: defectReports.length,
      byStatus: {
        reported: 0,
        investigating: 0,
        approved: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        rejected: 0,
      },
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      byType: {
        mechanical: 0,
        electrical: 0,
        body: 0,
        interior: 0,
        safety: 0,
        cosmetic: 0,
        performance: 0,
        other: 0,
      },
      totalEstimatedCost: 0,
      totalActualCost: 0,
      safetyIssues: 0,
      warrantyClaims: 0,
    };

    defectReports.forEach(report => {
      // Count by status
      if (report.status) {
        stats.byStatus[report.status as keyof typeof stats.byStatus]++;
      }

      // Count by severity
      if (report.severity) {
        stats.bySeverity[report.severity as keyof typeof stats.bySeverity]++;
      }

      // Count by type
      if (report.defect_type) {
        stats.byType[report.defect_type as keyof typeof stats.byType]++;
      }

      // Sum costs
      if (report.estimated_repair_cost) {
        stats.totalEstimatedCost += report.estimated_repair_cost;
      }
      if (report.actual_repair_cost) {
        stats.totalActualCost += report.actual_repair_cost;
      }

      // Count safety issues
      if (report.safety_implications) {
        stats.safetyIssues++;
      }

      // Count warranty claims
      if (report.warranty_claim) {
        stats.warrantyClaims++;
      }
    });

    return stats;
  };

  const stats = calculateStats();

  return {
    defectReports,
    isLoading,
    error,
    stats,
    hasData: defectReports.length > 0,
  };
};

export const useCreateDefectReport = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (defectReport: CreateDefectReportData) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('defect_reports')
        .insert([{
          ...defectReport,
          organization_id: profile.organization_id,
          reported_by: profile.id,
          reported_date: defectReport.reported_date || new Date().toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defect-reports'] });
    },
  });
};

export const useUpdateDefectReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateDefectReportData & { id: string }) => {
      const { data, error } = await supabase
        .from('defect_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defect-reports'] });
    },
  });
};

export const useDeleteDefectReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('defect_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defect-reports'] });
    },
  });
};
