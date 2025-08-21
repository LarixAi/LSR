import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Student {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade_level: string;
  school_name: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  address: string;
  pickup_address: string;
  dropoff_address: string;
  medical_info: string;
  special_needs: string[];
  allergies: string[];
  medications: string[];
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface RouteStudent {
  id: string;
  route_id: string;
  student_id: string;
  pickup_stop_id: string;
  dropoff_stop_id: string;
  pickup_time: string;
  dropoff_time: string;
  days_of_week: number[];
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Students hooks
export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async (): Promise<Student[]> => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async (): Promise<Student | null> => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (student: Partial<Student>): Promise<Student> => {
      const { data, error } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Student> & { id: string }): Promise<Student> => {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', data.id] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

// Route Students hooks
export const useRouteStudents = (routeId: string) => {
  return useQuery({
    queryKey: ['route-students', routeId],
    queryFn: async (): Promise<RouteStudent[]> => {
      const { data, error } = await supabase
        .from('route_students')
        .select(`
          *,
          students (
            id,
            first_name,
            last_name,
            grade_level,
            parent_name,
            parent_phone,
            parent_email
          )
        `)
        .eq('route_id', routeId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!routeId,
  });
};

export const useCreateRouteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (routeStudent: Partial<RouteStudent>): Promise<RouteStudent> => {
      const { data, error } = await supabase
        .from('route_students')
        .insert(routeStudent)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['route-students', data.route_id] });
    },
  });
};

export const useUpdateRouteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RouteStudent> & { id: string }): Promise<RouteStudent> => {
      const { data, error } = await supabase
        .from('route_students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['route-students', data.route_id] });
    },
  });
};

export const useDeleteRouteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, route_id }: { id: string; route_id: string }): Promise<void> => {
      const { error } = await supabase
        .from('route_students')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { route_id }) => {
      queryClient.invalidateQueries({ queryKey: ['route-students', route_id] });
    },
  });
};

