import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types
export interface ChildProfile {
  id: string;
  parent_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade?: string;
  school?: string;
  pickup_location?: string;
  dropoff_location?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  allergies?: string;
  special_instructions?: string;
  profile_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RiskAssessment {
  id: string;
  child_id: string;
  assessment_type: 'medical' | 'behavioral' | 'physical' | 'environmental';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  required_equipment?: string;
  document_url?: string;
  assessed_by?: string;
  assessment_date: string;
  review_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParentCommunication {
  id: string;
  parent_id: string;
  driver_id?: string;
  child_id?: string;
  message_type: 'general' | 'delay' | 'incident' | 'absence' | 'pickup' | 'emergency';
  subject?: string;
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sent_at: string;
  read_at?: string;
  created_at: string;
}

export interface StudentAttendance {
  id: string;
  child_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'unexcused';
  pickup_time?: string;
  dropoff_time?: string;
  driver_id?: string;
  vehicle_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TransportSchedule {
  id: string;
  child_id: string;
  route_id?: string;
  pickup_time: string;
  dropoff_time: string;
  pickup_location: string;
  dropoff_location: string;
  days_of_week: number[];
  is_active: boolean;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ParentNotification {
  id: string;
  parent_id: string;
  child_id?: string;
  type: 'pickup' | 'dropoff' | 'delay' | 'incident' | 'absence' | 'reminder' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_for?: string;
  sent_at: string;
  created_at: string;
}

export interface ChildTransportStatus {
  id: string;
  child_id: string;
  status: 'at_school' | 'on_transport' | 'at_home' | 'pickup_pending' | 'dropoff_pending';
  current_location?: string;
  driver_id?: string;
  vehicle_id?: string;
  route_id?: string;
  estimated_arrival?: string;
  last_updated: string;
  created_at: string;
}

// Child Profiles Hooks
export const useChildProfiles = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['child-profiles', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ChildProfile[];
    },
    enabled: !!user?.id
  });
};

export const useCreateChildProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (childData: Omit<ChildProfile, 'id' | 'parent_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('child_profiles')
        .insert({
          ...childData,
          parent_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as ChildProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-profiles', user?.id] });
    }
  });
};

export const useUpdateChildProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ChildProfile> & { id: string }) => {
      const { data, error } = await supabase
        .from('child_profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ChildProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-profiles', user?.id] });
    }
  });
};

// Risk Assessments Hooks
export const useRiskAssessments = (childId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['risk-assessments', childId],
    queryFn: async () => {
      if (!childId) return [];
      
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('child_id', childId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RiskAssessment[];
    },
    enabled: !!childId
  });
};

export const useCreateRiskAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assessmentData: Omit<RiskAssessment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (error) throw error;
      return data as RiskAssessment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments', data.child_id] });
    }
  });
};

// Parent Communications Hooks
export const useParentCommunications = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['parent-communications', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('parent_communications')
        .select(`
          *,
          child_profiles!inner(first_name, last_name),
          profiles!parent_communications_driver_id_fkey(first_name, last_name)
        `)
        .or(`parent_id.eq.${user.id},driver_id.eq.${user.id}`)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as (ParentCommunication & {
        child_profiles: { first_name: string; last_name: string };
        profiles: { first_name: string; last_name: string };
      })[];
    },
    enabled: !!user?.id
  });
};

export const useSendCommunication = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (communicationData: Omit<ParentCommunication, 'id' | 'parent_id' | 'sent_at' | 'created_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('parent_communications')
        .insert({
          ...communicationData,
          parent_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as ParentCommunication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-communications', user?.id] });
    }
  });
};

// Student Attendance Hooks
export const useStudentAttendance = (childId?: string, startDate?: string, endDate?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-attendance', childId, startDate, endDate],
    queryFn: async () => {
      if (!childId) return [];
      
      let query = supabase
        .from('student_attendance')
        .select('*')
        .eq('child_id', childId)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as StudentAttendance[];
    },
    enabled: !!childId
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<StudentAttendance> & { id: string }) => {
      const { data, error } = await supabase
        .from('student_attendance')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as StudentAttendance;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance', data.child_id] });
    }
  });
};

// Transport Schedules Hooks
export const useTransportSchedules = (childId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['transport-schedules', childId],
    queryFn: async () => {
      if (!childId) return [];
      
      const { data, error } = await supabase
        .from('transport_schedules')
        .select('*')
        .eq('child_id', childId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TransportSchedule[];
    },
    enabled: !!childId
  });
};

// Parent Notifications Hooks
export const useParentNotifications = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['parent-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('parent_notifications')
        .select('*')
        .eq('parent_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ParentNotification[];
    },
    enabled: !!user?.id
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('parent_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data as ParentNotification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-notifications', user?.id] });
    }
  });
};

// Child Transport Status Hooks
export const useChildTransportStatus = (childId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['child-transport-status', childId],
    queryFn: async () => {
      if (!childId) return null;
      
      const { data, error } = await supabase
        .from('child_transport_status')
        .select('*')
        .eq('child_id', childId)
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data as ChildTransportStatus | null;
    },
    enabled: !!childId,
    refetchInterval: 30000 // Refetch every 30 seconds for real-time updates
  });
};

// Utility function to calculate child age
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

