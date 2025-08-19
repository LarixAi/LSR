import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AttendanceRecord {
  id: string;
  child_id: number;
  route_id?: string;
  attendance_date: string;
  status: 'attending' | 'absent' | 'late_pickup' | 'early_pickup' | 'sick' | 'holiday';
  pickup_status: 'pending' | 'picked_up' | 'missed' | 'cancelled';
  dropoff_status: 'pending' | 'dropped_off' | 'no_show';
  parent_notes?: string;
  driver_notes?: string;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  child_profiles?: {
    id: number;
    first_name: string;
    last_name: string;
    pickup_location?: string;
    dropoff_location?: string;
  };
  routes?: {
    id: string;
    name?: string;
    start_location?: string;
    end_location?: string;
  };
}

export const useAttendance = (selectedDate?: Date) => {
  const { user } = useAuth();
  const date = selectedDate || new Date();
  const dateString = date.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['attendance', user?.id, dateString],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('Fetching attendance for date:', dateString);

      try {
        const { data, error } = await supabase
          .from('daily_attendance')
          .select(`
            *,
            child_profiles:child_profiles(
              id,
              first_name,
              last_name,
              pickup_location,
              dropoff_location
            ),
            routes:routes(
              id,
              name,
              start_location,
              end_location
            )
          `)
          .eq('attendance_date', dateString)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching attendance:', error);
          throw error;
        }

        console.log('Fetched attendance records:', data);
        return data as AttendanceRecord[] || [];
      } catch (error) {
        console.error('Error in useAttendance:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
};

export const useUpdateAttendance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      pickup_status, 
      dropoff_status, 
      parent_notes, 
      driver_notes 
    }: {
      id: string;
      status?: AttendanceRecord['status'];
      pickup_status?: AttendanceRecord['pickup_status'];
      dropoff_status?: AttendanceRecord['dropoff_status'];
      parent_notes?: string;
      driver_notes?: string;
    }) => {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (pickup_status) updateData.pickup_status = pickup_status;
      if (dropoff_status) updateData.dropoff_status = dropoff_status;
      if (parent_notes !== undefined) updateData.parent_notes = parent_notes;
      if (driver_notes !== undefined) updateData.driver_notes = driver_notes;

      const { data, error } = await supabase
        .from('daily_attendance')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Attendance Updated",
        description: "The attendance record has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
      });
    }
  });
};

export const useCreateAttendance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceData: {
      child_id: number;
      route_id?: string;
      attendance_date: string;
      status?: AttendanceRecord['status'];
      pickup_status?: AttendanceRecord['pickup_status'];
      dropoff_status?: AttendanceRecord['dropoff_status'];
      parent_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('daily_attendance')
        .insert(attendanceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Attendance Created",
        description: "The attendance record has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to create attendance record. Please try again.",
        variant: "destructive",
      });
    }
  });
};
