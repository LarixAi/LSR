import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface VehicleInspection {
  id: string;
  driver_id: string;
  vehicle_id: string;
  schedule_id?: string;
  inspection_type: string;
  inspection_category: string;
  notes?: string;
  signature_data?: string;
  walkaround_data: any;
  location_data: any;
  defects_found: boolean;
  defects_details?: any;
  overall_status: 'pending' | 'passed' | 'flagged' | 'failed';
  inspection_date: string;
  start_time: string;
  end_time?: string;
  next_inspection_date?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
    license_plate: string;
  };
  driver?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  schedule?: {
    id: string;
    scheduled_date: string;
    status: string;
  };
}

export interface InspectionSchedule {
  id: string;
  vehicle_id: string;
  template_id: string;
  scheduled_date: string;
  assigned_driver_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
    license_plate: string;
  };
  driver?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  template?: {
    id: string;
    name: string;
    description: string;
    inspection_type: string;
    frequency_days: number;
  };
}

export interface InspectionTemplate {
  id: string;
  name: string;
  description: string;
  inspection_type: string;
  frequency_days: number;
  is_active: boolean;
  organization_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EnhancedInspectionStats {
  total: number;
  byStatus: {
    pending: number;
    passed: number;
    flagged: number;
    failed: number;
  };
  byCategory: {
    daily: number;
    weekly: number;
    '4_weekly': number;
    '6_weekly': number;
    pre_trip: number;
    post_trip: number;
    breakdown: number;
  };
  byType: {
    daily_check: number;
    weekly: number;
    '4_weekly': number;
    '6_weekly': number;
    pre_trip: number;
    post_trip: number;
    breakdown: number;
  };
  defectsFound: number;
  recentInspections: number;
  upcomingSchedules: number;
  overdueSchedules: number;
}

export const useEnhancedVehicleInspections = (organizationId?: string, driverId?: string) => {
  const { profile } = useAuth();

  // Fetch all vehicle inspections with related data
  const { data: inspections = [], isLoading, error } = useQuery({
    queryKey: ['enhanced-vehicle-inspections', organizationId, driverId],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        let query = supabase
          .from('vehicle_inspections')
          .select('*')
          .order('created_at', { ascending: false });

        if (driverId) {
          query = query.eq('driver_id', driverId);
        }

        const { data: inspectionData, error: inspectionError } = await query;

        if (inspectionError) {
          console.error('Error fetching vehicle inspections:', inspectionError);
          return [];
        }

        if (!inspectionData || inspectionData.length === 0) {
          return [];
        }

        // Extract unique IDs for related data
        const vehicleIds = [...new Set(inspectionData.map(vi => vi.vehicle_id).filter(Boolean))];
        const driverIds = [...new Set(inspectionData.map(vi => vi.driver_id).filter(Boolean))];
        const scheduleIds = [...new Set(inspectionData.map(vi => vi.schedule_id).filter(Boolean))];

        // Fetch related data in parallel
        const [vehiclesData, driversData, schedulesData] = await Promise.all([
          vehicleIds.length > 0 ? supabase
            .from('vehicles')
            .select('id, vehicle_number, make, model, license_plate')
            .in('id', vehicleIds)
            .eq('organization_id', organizationId) : { data: [] },
          driverIds.length > 0 ? supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', driverIds)
            .eq('organization_id', organizationId) : { data: [] },
          scheduleIds.length > 0 ? supabase
            .from('inspection_schedules')
            .select('id, scheduled_date, status')
            .in('id', scheduleIds) : { data: [] }
        ]);

        // Create maps for efficient lookup
        const vehiclesMap = new Map((vehiclesData.data || []).map(v => [v.id, v]));
        const driversMap = new Map((driversData.data || []).map(d => [d.id, d]));
        const schedulesMap = new Map((schedulesData.data || []).map(s => [s.id, s]));

        // Combine the data
        const inspectionsWithRelations = inspectionData.map(inspection => ({
          ...inspection,
          vehicle: vehiclesMap.get(inspection.vehicle_id),
          driver: driversMap.get(inspection.driver_id),
          schedule: schedulesMap.get(inspection.schedule_id)
        }));

        return inspectionsWithRelations as VehicleInspection[];
      } catch (error) {
        console.error('Error in vehicle inspections query:', error);
        return [];
      }
    },
    enabled: !!organizationId && !!profile?.id
  });

  // Fetch inspection schedules
  const { data: schedules = [] } = useQuery({
    queryKey: ['inspection-schedules', organizationId, driverId],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        let query = supabase
          .from('inspection_schedules')
          .select('*')
          .order('scheduled_date', { ascending: true });

        if (driverId) {
          query = query.eq('assigned_driver_id', driverId);
        }

        const { data: scheduleData, error: scheduleError } = await query;

        if (scheduleError) {
          console.error('Error fetching inspection schedules:', scheduleError);
          return [];
        }

        if (!scheduleData || scheduleData.length === 0) {
          return [];
        }

        // Extract unique IDs for related data
        const vehicleIds = [...new Set(scheduleData.map(s => s.vehicle_id).filter(Boolean))];
        const driverIds = [...new Set(scheduleData.map(s => s.assigned_driver_id).filter(Boolean))];
        const templateIds = [...new Set(scheduleData.map(s => s.template_id).filter(Boolean))];

        // Fetch related data in parallel
        const [vehiclesData, driversData, templatesData] = await Promise.all([
          vehicleIds.length > 0 ? supabase
            .from('vehicles')
            .select('id, vehicle_number, make, model, license_plate')
            .in('id', vehicleIds)
            .eq('organization_id', organizationId) : { data: [] },
          driverIds.length > 0 ? supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', driverIds)
            .eq('organization_id', organizationId) : { data: [] },
          templateIds.length > 0 ? supabase
            .from('inspection_templates')
            .select('id, name, description, inspection_type, frequency_days')
            .in('id', templateIds) : { data: [] }
        ]);

        // Create maps for efficient lookup
        const vehiclesMap = new Map((vehiclesData.data || []).map(v => [v.id, v]));
        const driversMap = new Map((driversData.data || []).map(d => [d.id, d]));
        const templatesMap = new Map((templatesData.data || []).map(t => [t.id, t]));

        // Combine the data
        const schedulesWithRelations = scheduleData.map(schedule => ({
          ...schedule,
          vehicle: vehiclesMap.get(schedule.vehicle_id),
          driver: driversMap.get(schedule.assigned_driver_id),
          template: templatesMap.get(schedule.template_id)
        }));

        return schedulesWithRelations as InspectionSchedule[];
      } catch (error) {
        console.error('Error in inspection schedules query:', error);
        return [];
      }
    },
    enabled: !!organizationId && !!profile?.id
  });

  // Fetch inspection templates
  const { data: templates = [] } = useQuery({
    queryKey: ['inspection-templates', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        const { data: templateData, error: templateError } = await supabase
          .from('inspection_templates')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .order('frequency_days', { ascending: true });

        if (templateError) {
          console.error('Error fetching inspection templates:', templateError);
          return [];
        }

        return templateData as InspectionTemplate[] || [];
      } catch (error) {
        console.error('Error in inspection templates query:', error);
        return [];
      }
    },
    enabled: !!organizationId && !!profile?.id
  });

  // Get enhanced inspection statistics
  const { data: inspectionStats } = useQuery({
    queryKey: ['enhanced-inspection-stats', organizationId, driverId],
    queryFn: async () => {
      if (!organizationId) return null;

      try {
        const [inspectionsQuery, schedulesQuery] = await Promise.all([
          supabase
            .from('vehicle_inspections')
            .select('overall_status, inspection_category, inspection_type, defects_found, created_at')
            .eq('organization_id', organizationId)
            .then(result => result.data || []),
          supabase
            .from('inspection_schedules')
            .select('scheduled_date, status')
            .eq('organization_id', organizationId)
            .then(result => result.data || [])
        ]);

        const stats: EnhancedInspectionStats = {
          total: inspectionsQuery.length,
          byStatus: {
            pending: inspectionsQuery.filter(vi => vi.overall_status === 'pending').length,
            passed: inspectionsQuery.filter(vi => vi.overall_status === 'passed').length,
            flagged: inspectionsQuery.filter(vi => vi.overall_status === 'flagged').length,
            failed: inspectionsQuery.filter(vi => vi.overall_status === 'failed').length
          },
          byCategory: {
            daily: inspectionsQuery.filter(vi => vi.inspection_category === 'daily').length,
            weekly: inspectionsQuery.filter(vi => vi.inspection_category === 'weekly').length,
            '4_weekly': inspectionsQuery.filter(vi => vi.inspection_category === '4_weekly').length,
            '6_weekly': inspectionsQuery.filter(vi => vi.inspection_category === '6_weekly').length,
            pre_trip: inspectionsQuery.filter(vi => vi.inspection_category === 'pre_trip').length,
            post_trip: inspectionsQuery.filter(vi => vi.inspection_category === 'post_trip').length,
            breakdown: inspectionsQuery.filter(vi => vi.inspection_category === 'breakdown').length
          },
          byType: {
            daily_check: inspectionsQuery.filter(vi => vi.inspection_type === 'daily_check').length,
            weekly: inspectionsQuery.filter(vi => vi.inspection_type === 'weekly').length,
            '4_weekly': inspectionsQuery.filter(vi => vi.inspection_type === '4_weekly').length,
            '6_weekly': inspectionsQuery.filter(vi => vi.inspection_type === '6_weekly').length,
            pre_trip: inspectionsQuery.filter(vi => vi.inspection_type === 'pre_trip').length,
            post_trip: inspectionsQuery.filter(vi => vi.inspection_type === 'post_trip').length,
            breakdown: inspectionsQuery.filter(vi => vi.inspection_type === 'breakdown').length
          },
          defectsFound: inspectionsQuery.filter(vi => vi.defects_found).length,
          recentInspections: inspectionsQuery.filter(vi => {
            const inspectionDate = new Date(vi.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return inspectionDate >= weekAgo;
          }).length,
          upcomingSchedules: schedulesQuery.filter(s => {
            const scheduledDate = new Date(s.scheduled_date);
            const today = new Date();
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return scheduledDate >= today && scheduledDate <= weekFromNow && s.status === 'scheduled';
          }).length,
          overdueSchedules: schedulesQuery.filter(s => {
            const scheduledDate = new Date(s.scheduled_date);
            const today = new Date();
            return scheduledDate < today && s.status === 'scheduled';
          }).length
        };

        return stats;
      } catch (error) {
        console.error('Error fetching enhanced inspection stats:', error);
        return null;
      }
    },
    enabled: !!organizationId && !!profile?.id
  });

  return {
    inspections,
    schedules,
    templates,
    inspectionStats,
    isLoading,
    error
  };
};


