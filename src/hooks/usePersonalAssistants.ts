import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PersonalAssistant {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  qualifications?: string[];
  certifications?: string[];
  experience_years: number;
  specializations?: string[];
  availability_schedule?: any;
  hourly_rate?: number;
  status: 'active' | 'inactive' | 'on_leave';
  background_check_date?: string;
  background_check_status: 'pending' | 'passed' | 'failed';
  training_completed?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RouteStop {
  id: string;
  route_id: string;
  stop_name: string;
  stop_type: 'pickup' | 'dropoff' | 'both';
  address: string;
  coordinates?: any;
  estimated_time?: string;
  actual_time?: string;
  stop_order: number;
  passenger_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RoutePersonalAssistant {
  id: string;
  route_id: string;
  personal_assistant_id: string;
  assignment_date: string;
  start_time?: string;
  end_time?: string;
  status: 'assigned' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Personal Assistants hooks
export const usePersonalAssistants = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['personal-assistants', profile?.organization_id],
    queryFn: async (): Promise<PersonalAssistant[]> => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('personal_assistants')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('last_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};

export const usePersonalAssistant = (id: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['personal-assistant', id],
    queryFn: async (): Promise<PersonalAssistant | null> => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('personal_assistants')
        .select('*')
        .eq('id', id)
        .eq('organization_id', profile.organization_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!profile?.organization_id,
  });
};

export const useCreatePersonalAssistant = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (personalAssistant: Partial<PersonalAssistant>): Promise<PersonalAssistant> => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('personal_assistants')
        .insert({
          ...personalAssistant,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-assistants'] });
    },
  });
};

export const useUpdatePersonalAssistant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PersonalAssistant> & { id: string }): Promise<PersonalAssistant> => {
      const { data, error } = await supabase
        .from('personal_assistants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['personal-assistants'] });
      queryClient.invalidateQueries({ queryKey: ['personal-assistant', data.id] });
    },
  });
};

export const useDeletePersonalAssistant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('personal_assistants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-assistants'] });
    },
  });
};

// Route Stops hooks
export const useRouteStops = (routeId: string) => {
  return useQuery({
    queryKey: ['route-stops', routeId],
    queryFn: async (): Promise<RouteStop[]> => {
      const { data, error } = await supabase
        .from('route_stops')
        .select('*')
        .eq('route_id', routeId)
        .order('stop_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!routeId,
  });
};

export const useCreateRouteStop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (routeStop: Partial<RouteStop>): Promise<RouteStop> => {
      const { data, error } = await supabase
        .from('route_stops')
        .insert(routeStop)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['route-stops', data.route_id] });
    },
  });
};

export const useUpdateRouteStop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RouteStop> & { id: string }): Promise<RouteStop> => {
      const { data, error } = await supabase
        .from('route_stops')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['route-stops', data.route_id] });
    },
  });
};

export const useDeleteRouteStop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, route_id }: { id: string; route_id: string }): Promise<void> => {
      const { error } = await supabase
        .from('route_stops')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { route_id }) => {
      queryClient.invalidateQueries({ queryKey: ['route-stops', route_id] });
    },
  });
};

// Route Personal Assistants hooks
export const useRoutePersonalAssistants = (routeId: string) => {
  return useQuery({
    queryKey: ['route-personal-assistants', routeId],
    queryFn: async (): Promise<RoutePersonalAssistant[]> => {
      const { data, error } = await supabase
        .from('route_personal_assistants')
        .select(`
          *,
          personal_assistants (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('route_id', routeId)
        .order('assignment_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!routeId,
  });
};

export const useCreateRoutePersonalAssistant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assignment: Partial<RoutePersonalAssistant>): Promise<RoutePersonalAssistant> => {
      const { data, error } = await supabase
        .from('route_personal_assistants')
        .insert(assignment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['route-personal-assistants', data.route_id] });
    },
  });
};

export const useUpdateRoutePersonalAssistant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RoutePersonalAssistant> & { id: string }): Promise<RoutePersonalAssistant> => {
      const { data, error } = await supabase
        .from('route_personal_assistants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['route-personal-assistants', data.route_id] });
    },
  });
};

export const useDeleteRoutePersonalAssistant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, route_id }: { id: string; route_id: string }): Promise<void> => {
      const { error } = await supabase
        .from('route_personal_assistants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { route_id }) => {
      queryClient.invalidateQueries({ queryKey: ['route-personal-assistants', route_id] });
    },
  });
};
