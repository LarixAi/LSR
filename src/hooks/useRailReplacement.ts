import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RailReplacementService {
  id: string;
  organization_id: string;
  service_name: string;
  service_code?: string;
  affected_line: string;
  service_type: 'planned' | 'emergency' | 'maintenance' | 'strike' | 'weather' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'planned' | 'active' | 'completed' | 'cancelled' | 'suspended';
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  frequency?: string;
  vehicles_required?: number;
  vehicles_assigned?: number;
  passengers_affected?: number;
  estimated_cost?: number;
  actual_cost?: number;
  revenue?: number;
  rail_operator?: string;
  operator_contact?: string;
  operator_phone?: string;
  operator_email?: string;
  special_requirements?: string[];
  route_details?: string;
  pickup_locations?: string[];
  dropoff_locations?: string[];
  notes?: string;
  performance_metrics?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
  created_by_profile?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateRailReplacementServiceData {
  service_name: string;
  service_code?: string;
  affected_line: string;
  service_type: 'planned' | 'emergency' | 'maintenance' | 'strike' | 'weather' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status?: 'planned' | 'active' | 'completed' | 'cancelled' | 'suspended';
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  frequency?: string;
  vehicles_required?: number;
  vehicles_assigned?: number;
  passengers_affected?: number;
  estimated_cost?: number;
  actual_cost?: number;
  revenue?: number;
  rail_operator?: string;
  operator_contact?: string;
  operator_phone?: string;
  operator_email?: string;
  special_requirements?: string[];
  route_details?: string;
  pickup_locations?: string[];
  dropoff_locations?: string[];
  notes?: string;
  performance_metrics?: any;
}

export interface UpdateRailReplacementServiceData {
  service_name?: string;
  service_code?: string;
  affected_line?: string;
  service_type?: 'planned' | 'emergency' | 'maintenance' | 'strike' | 'weather' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status?: 'planned' | 'active' | 'completed' | 'cancelled' | 'suspended';
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  frequency?: string;
  vehicles_required?: number;
  vehicles_assigned?: number;
  passengers_affected?: number;
  estimated_cost?: number;
  actual_cost?: number;
  revenue?: number;
  rail_operator?: string;
  operator_contact?: string;
  operator_phone?: string;
  operator_email?: string;
  special_requirements?: string[];
  route_details?: string;
  pickup_locations?: string[];
  dropoff_locations?: string[];
  notes?: string;
  performance_metrics?: any;
}

export const useRailReplacementServices = (
  organizationId?: string,
  status?: string,
  serviceType?: string,
  priority?: string
) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['rail-replacement-services', organizationId, status, serviceType, priority],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return [];
      }

      try {
        let query = supabase
          .from('rail_replacement_services')
          .select(`
            *,
            created_by_profile:profiles!rail_replacement_services_created_by_fkey(
              id,
              first_name,
              last_name
            )
          `)
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('status', status);
        }

        if (serviceType) {
          query = query.eq('service_type', serviceType);
        }

        if (priority) {
          query = query.eq('priority', priority);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching rail replacement services:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Error in useRailReplacementServices:', error);
        throw error;
      }
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useRailReplacementService = (serviceId: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['rail-replacement-service', serviceId],
    queryFn: async () => {
      if (!serviceId || !profile?.organization_id) {
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('rail_replacement_services')
          .select(`
            *,
            created_by_profile:profiles!rail_replacement_services_created_by_fkey(
              id,
              first_name,
              last_name
            )
          `)
          .eq('id', serviceId)
          .eq('organization_id', profile.organization_id)
          .single();

        if (error) {
          console.error('Error fetching rail replacement service:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in useRailReplacementService:', error);
        throw error;
      }
    },
    enabled: !!serviceId && !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useCreateRailReplacementService = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: CreateRailReplacementServiceData) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      try {
        const { data, error } = await supabase
          .from('rail_replacement_services')
          .insert({
            ...serviceData,
            organization_id: profile.organization_id,
            created_by: profile.id,
            priority: serviceData.priority || 'medium',
            status: serviceData.status || 'planned',
            vehicles_assigned: serviceData.vehicles_assigned || 0,
            special_requirements: serviceData.special_requirements || [],
            pickup_locations: serviceData.pickup_locations || [],
            dropoff_locations: serviceData.dropoff_locations || []
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating rail replacement service:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in useCreateRailReplacementService:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rail-replacement-services'] });
    }
  });
};

export const useUpdateRailReplacementService = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      serviceId, 
      serviceData 
    }: { 
      serviceId: string; 
      serviceData: UpdateRailReplacementServiceData 
    }) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      try {
        const { data, error } = await supabase
          .from('rail_replacement_services')
          .update({
            ...serviceData,
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId)
          .eq('organization_id', profile.organization_id)
          .select()
          .single();

        if (error) {
          console.error('Error updating rail replacement service:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in useUpdateRailReplacementService:', error);
        throw error;
      }
    },
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['rail-replacement-services'] });
      queryClient.invalidateQueries({ queryKey: ['rail-replacement-service', serviceId] });
    }
  });
};

export const useDeleteRailReplacementService = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      try {
        const { error } = await supabase
          .from('rail_replacement_services')
          .delete()
          .eq('id', serviceId)
          .eq('organization_id', profile.organization_id);

        if (error) {
          console.error('Error deleting rail replacement service:', error);
          throw error;
        }

        return { success: true };
      } catch (error) {
        console.error('Error in useDeleteRailReplacementService:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rail-replacement-services'] });
    }
  });
};

export const useRailReplacementServiceStats = (organizationId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['rail-replacement-service-stats', organizationId],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return {
          total: 0,
          active: 0,
          completed: 0,
          cancelled: 0,
          byStatus: {},
          byType: {},
          byPriority: {},
          totalVehiclesRequired: 0,
          totalVehiclesAssigned: 0,
          totalPassengersAffected: 0,
          totalEstimatedCost: 0,
          totalActualCost: 0,
          totalRevenue: 0
        };
      }

      try {
        const { data, error } = await supabase
          .from('rail_replacement_services')
          .select('status, service_type, priority, vehicles_required, vehicles_assigned, passengers_affected, estimated_cost, actual_cost, revenue')
          .eq('organization_id', profile.organization_id);

        if (error) {
          console.error('Error fetching rail replacement service stats:', error);
          throw error;
        }

        const services = data || [];
        const stats = {
          total: services.length,
          active: services.filter(s => s.status === 'active').length,
          completed: services.filter(s => s.status === 'completed').length,
          cancelled: services.filter(s => s.status === 'cancelled').length,
          byStatus: services.reduce((acc, service) => {
            acc[service.status] = (acc[service.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byType: services.reduce((acc, service) => {
            acc[service.service_type] = (acc[service.service_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byPriority: services.reduce((acc, service) => {
            acc[service.priority] = (acc[service.priority] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          totalVehiclesRequired: services.reduce((sum, service) => sum + (service.vehicles_required || 0), 0),
          totalVehiclesAssigned: services.reduce((sum, service) => sum + (service.vehicles_assigned || 0), 0),
          totalPassengersAffected: services.reduce((sum, service) => sum + (service.passengers_affected || 0), 0),
          totalEstimatedCost: services.reduce((sum, service) => sum + (service.estimated_cost || 0), 0),
          totalActualCost: services.reduce((sum, service) => sum + (service.actual_cost || 0), 0),
          totalRevenue: services.reduce((sum, service) => sum + (service.revenue || 0), 0)
        };

        return stats;
      } catch (error) {
        console.error('Error in useRailReplacementServiceStats:', error);
        throw error;
      }
    },
    enabled: !!profile?.organization_id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });
};
