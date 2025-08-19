import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isYesterday, isThisWeek } from 'date-fns';

export interface DailyRest {
  id: string;
  driver_id: string;
  rest_date: string;
  rest_type: 'daily_rest' | 'weekly_rest' | 'reduced_rest';
  duration_hours: number;
  start_time?: string;
  end_time?: string;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface DailyRestWithDetails extends DailyRest {
  driver?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export const useDailyRest = (startDate?: Date, endDate?: Date) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['daily-rest', profile?.id, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      let query = supabase
        .from('daily_rest')
        .select('*')
        .eq('driver_id', profile.id)
        .order('rest_date', { ascending: false });

      if (startDate) {
        query = query.gte('rest_date', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
        query = query.lte('rest_date', format(endDate, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching daily rest:', error);
        // If table doesn't exist yet, return empty array
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.warn('daily_rest table not found, returning empty data');
          return [];
        }
        throw error;
      }

      return (data || []) as DailyRest[];
    },
    enabled: !!profile?.id,
  });
};

export const useCreateDailyRest = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restData: Partial<DailyRest>) => {
      if (!profile?.id || !profile?.organization_id) {
        throw new Error('User profile and organization information required');
      }

      const { data, error } = await supabase
        .from('daily_rest')
        .insert({
          ...restData,
          driver_id: profile.id,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist yet, log warning and throw error
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.warn('daily_rest table not found, cannot create rest record');
          throw new Error('Daily rest table not found. Please ensure the database is properly set up.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-rest'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Daily rest recorded successfully');
    },
    onError: (error: any) => {
      console.error('Error creating daily rest:', error);
      toast.error('Failed to record daily rest: ' + error.message);
    }
  });
};

export const useUpdateDailyRest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DailyRest> }) => {
      const { data, error } = await supabase
        .from('daily_rest')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // If table doesn't exist yet, log warning and throw error
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.warn('daily_rest table not found, cannot update rest record');
          throw new Error('Daily rest table not found. Please ensure the database is properly set up.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-rest'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Daily rest updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating daily rest:', error);
      toast.error('Failed to update daily rest: ' + error.message);
    }
  });
};

export const useDeleteDailyRest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('daily_rest')
        .delete()
        .eq('id', id);

      if (error) {
        // If table doesn't exist yet, log warning and throw error
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.warn('daily_rest table not found, cannot delete rest record');
          throw new Error('Daily rest table not found. Please ensure the database is properly set up.');
        }
        throw error;
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-rest'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Daily rest deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting daily rest:', error);
      toast.error('Failed to delete daily rest: ' + error.message);
    }
  });
};

// Function to automatically record rest days for days without work
export const useAutoRecordRestDays = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const createDailyRest = useCreateDailyRest();

  return useMutation({
    mutationFn: async (dateRange: { startDate: Date; endDate: Date }) => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      // Get all days in the range
      const daysInRange = eachDayOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate
      });

      // Get existing time entries for this period
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('entry_date')
        .eq('driver_id', profile.id)
        .gte('entry_date', format(dateRange.startDate, 'yyyy-MM-dd'))
        .lte('entry_date', format(dateRange.endDate, 'yyyy-MM-dd'));

      // If time_entries table has issues, treat as no time entries
      if (timeError) {
        console.warn('Error fetching time entries:', timeError);
      }

      // Get existing rest records for this period
      const { data: existingRest, error: restError } = await supabase
        .from('daily_rest')
        .select('rest_date')
        .eq('driver_id', profile.id)
        .gte('rest_date', format(dateRange.startDate, 'yyyy-MM-dd'))
        .lte('rest_date', format(dateRange.endDate, 'yyyy-MM-dd'));

      // If table doesn't exist, treat as no existing rest records
      if (restError && (restError.code === 'PGRST205' || restError.code === '42P01')) {
        console.warn('daily_rest table not found, treating as no existing rest records');
      }

      const workedDays = new Set(timeEntries?.map(entry => entry.entry_date) || []);
      const restDays = new Set(existingRest?.map(rest => rest.rest_date) || []);

      // Find days that need rest records (no work, no existing rest)
      const daysNeedingRest = daysInRange.filter(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return !workedDays.has(dateStr) && !restDays.has(dateStr);
      });

      // Create rest records for these days
      const restPromises = daysNeedingRest.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return createDailyRest.mutateAsync({
          rest_date: dateStr,
          rest_type: 'daily_rest',
          duration_hours: 24, // Full day rest
          notes: 'Automatically recorded rest day - no work activity'
        });
      });

      await Promise.all(restPromises);

      return {
        daysProcessed: daysInRange.length,
        restDaysCreated: daysNeedingRest.length,
        workedDays: workedDays.size,
        existingRestDays: restDays.size
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['daily-rest'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      
      if (result.restDaysCreated > 0) {
        toast.success(`Automatically recorded ${result.restDaysCreated} rest days`);
      } else {
        toast.info('No new rest days to record');
      }
    },
    onError: (error: any) => {
      console.error('Error auto-recording rest days:', error);
      toast.error('Failed to auto-record rest days: ' + error.message);
    }
  });
};

// Hook to get weekly rest summary
export const useWeeklyRestSummary = (weekStart: Date) => {
  const { profile } = useAuth();
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  return useQuery({
    queryKey: ['weekly-rest-summary', profile?.id, weekStart.toISOString()],
    queryFn: async () => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');

      // Get time entries for the week
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('entry_date, total_hours')
        .eq('driver_id', profile.id)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate);

      // If time_entries table has issues, treat as no time entries
      if (timeError) {
        console.warn('Error fetching time entries for weekly summary:', timeError);
      }

      // Get rest records for the week
      const { data: restRecords, error: restError } = await supabase
        .from('daily_rest')
        .select('rest_date, rest_type, duration_hours')
        .eq('driver_id', profile.id)
        .gte('rest_date', startDate)
        .lte('rest_date', endDate);

      // If table doesn't exist, treat as no rest records
      if (restError && (restError.code === 'PGRST205' || restError.code === '42P01')) {
        console.warn('daily_rest table not found, treating as no rest records');
      }

      const workedDays = timeEntries?.length || 0;
      const restDays = restRecords?.length || 0;
      const totalWorkHours = timeEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;
      const totalRestHours = restRecords?.reduce((sum, record) => sum + (record.duration_hours || 0), 0) || 0;

      return {
        weekStart,
        weekEnd,
        workedDays,
        restDays,
        totalWorkHours,
        totalRestHours,
        averageWorkHoursPerDay: workedDays > 0 ? totalWorkHours / workedDays : 0,
        averageRestHoursPerDay: restDays > 0 ? totalRestHours / restDays : 0
      };
    },
    enabled: !!profile?.id,
  });
};

// Hook to get current week's rest status
export const useCurrentWeekRest = () => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return useWeeklyRestSummary(weekStart);
};
