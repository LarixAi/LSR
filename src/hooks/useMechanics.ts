import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Mechanic {
  id: string;
  profile_id?: string;
  mechanic_name?: string;
  mechanic_license_number?: string;
  specializations?: string[];
  certification_level?: 'apprentice' | 'journeyman' | 'master' | 'certified_technician';
  hourly_rate?: number;
  availability_schedule?: any;
  is_available?: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  profile?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export interface MaintenanceRequest {
  id: string;
  vehicle_id: string;
  mechanic_id?: string;
  requested_by: string;
  title?: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  estimated_hours?: number;
  actual_hours?: number;
  estimated_cost?: number;
  actual_cost?: number;
  parts_needed?: string[];
  scheduled_date?: string;
  completed_date?: string;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  vehicle?: {
    id: string;
    vehicle_number: string;
    make?: string;
    model?: string;
  };
  mechanic?: {
    id: string;
    mechanic_name?: string;
  };
  requester?: {
    id: string;
    first_name?: string;
    last_name?: string;
  };
}

export const useMechanics = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['mechanics', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching mechanics from database...');
      
      try {
        // First, get mechanics data
        const { data: mechanicsData, error: mechanicsError } = await supabase
          .from('mechanics')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (mechanicsError) {
          console.error('Error fetching mechanics:', mechanicsError);
          if (mechanicsError.code === '42P01') {
            console.warn('mechanics table not found, returning empty data');
            return [];
          }
          throw mechanicsError;
        }

        // If no mechanics found, return empty array
        if (!mechanicsData || mechanicsData.length === 0) {
          return [];
        }

        // Get profile IDs for mechanics that have profile_id
        const profileIds = mechanicsData
          .filter(mechanic => mechanic.profile_id)
          .map(mechanic => mechanic.profile_id);

        // Fetch profiles data if there are profile IDs
        let profilesData: any[] = [];
        if (profileIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .in('id', profileIds);

          if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
          } else {
            profilesData = profiles || [];
          }
        }

        // Combine mechanics with their profile data
        const mechanicsWithProfiles = mechanicsData.map(mechanic => {
          const profile = profilesData.find(p => p.id === mechanic.profile_id);
          return {
            ...mechanic,
            profile: profile || null
          };
        });

        console.log('Fetched mechanics with profiles:', mechanicsWithProfiles);
        return mechanicsWithProfiles as Mechanic[] || [];
      } catch (error) {
        console.error('Error in useMechanics:', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id,
  });
};

export const useMaintenanceRequests = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['maintenance_requests', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching maintenance requests from database...');
      
      try {
        // First, get maintenance requests data
        const { data: requestsData, error: requestsError } = await supabase
          .from('maintenance_requests')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (requestsError) {
          console.error('Error fetching maintenance requests:', requestsError);
          if (requestsError.code === '42P01') {
            console.warn('maintenance_requests table not found, returning empty data');
            return [];
          }
          throw requestsError;
        }

        // If no requests found, return empty array
        if (!requestsData || requestsData.length === 0) {
          return [];
        }

        // Get unique IDs for related data
        const vehicleIds = requestsData
          .filter(request => request.vehicle_id)
          .map(request => request.vehicle_id);
        const mechanicIds = requestsData
          .filter(request => request.mechanic_id)
          .map(request => request.mechanic_id);
        const requesterIds = requestsData
          .filter(request => request.requested_by)
          .map(request => request.requested_by);

        // Fetch related data
        const [vehiclesData, mechanicsData, requestersData] = await Promise.all([
          vehicleIds.length > 0 ? supabase
            .from('vehicles')
            .select('id, vehicle_number, make, model')
            .in('id', vehicleIds) : Promise.resolve({ data: [], error: null }),
          mechanicIds.length > 0 ? supabase
            .from('mechanics')
            .select('id, mechanic_name')
            .in('id', mechanicIds) : Promise.resolve({ data: [], error: null }),
          requesterIds.length > 0 ? supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', requesterIds) : Promise.resolve({ data: [], error: null })
        ]);

        // Combine maintenance requests with related data
        const requestsWithRelations = requestsData.map(request => {
          const vehicle = vehiclesData.data?.find(v => v.id === request.vehicle_id);
          const mechanic = mechanicsData.data?.find(m => m.id === request.mechanic_id);
          const requester = requestersData.data?.find(r => r.id === request.requested_by);

          return {
            ...request,
            vehicle: vehicle || null,
            mechanic: mechanic || null,
            requester: requester || null
          };
        });

        console.log('Fetched maintenance requests with relations:', requestsWithRelations);
        return requestsWithRelations as MaintenanceRequest[] || [];
      } catch (error) {
        console.error('Error in useMaintenanceRequests:', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateMechanic = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mechanicData: Partial<Mechanic>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('mechanics')
        .insert({
          ...mechanicData,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mechanics'] });
      toast.success('Mechanic created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating mechanic:', error);
      toast.error('Failed to create mechanic: ' + error.message);
    }
  });
};

export const useCreateMaintenanceRequest = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: Partial<MaintenanceRequest>) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('Organization and user information required');
      }

      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          ...requestData,
          organization_id: profile.organization_id,
          requested_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
      toast.success('Maintenance request created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating maintenance request:', error);
      toast.error('Failed to create maintenance request: ' + error.message);
    }
  });
};

export const useUpdateMaintenanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaintenanceRequest> }) => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
      toast.success('Maintenance request updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating maintenance request:', error);
      toast.error('Failed to update maintenance request: ' + error.message);
    }
  });
};

export const useMechanicStats = () => {
  const { data: mechanics = [] } = useMechanics();
  const { data: maintenanceRequests = [] } = useMaintenanceRequests();

  const stats = {
    total_mechanics: mechanics.length,
    active_mechanics: mechanics.filter(m => m.is_available !== false).length,
    total_requests: maintenanceRequests.length,
    pending_requests: maintenanceRequests.filter(r => r.status === 'pending').length,
    in_progress_requests: maintenanceRequests.filter(r => r.status === 'in_progress').length,
    completed_requests: maintenanceRequests.filter(r => r.status === 'completed').length,
    by_priority: maintenanceRequests.reduce((acc, request) => {
      const priority = request.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return stats;
};