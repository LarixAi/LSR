import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isAfter, isBefore, differenceInHours } from 'date-fns';

export interface WeeklyRest {
  id: string;
  driver_id: string;
  week_start_date: string;
  week_end_date: string;
  rest_start_time?: string;
  rest_end_time?: string;
  total_rest_hours: number;
  rest_type: 'full_weekly_rest' | 'reduced_weekly_rest' | 'compensated_rest';
  compensation_required: boolean;
  compensation_date?: string;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyRestWithDetails extends WeeklyRest {
  driver?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export interface WeeklyRestAnalysis {
  weekStart: Date;
  weekEnd: Date;
  totalWorkHours: number;
  totalRestHours: number;
  requiredWeeklyRest: number;
  actualRestHours: number;
  restCompliance: boolean;
  restType: 'full' | 'reduced' | 'missing';
  compensationRequired: boolean;
  compensationDate?: Date;
  warnings: string[];
  violations: string[];
}

// WTD Weekly Rest Requirements
export const WTD_WEEKLY_REST = {
  FULL_WEEKLY_REST: 45, // hours minimum weekly rest
  REDUCED_WEEKLY_REST: 24, // hours minimum (can be reduced once per week)
  COMPENSATION_REQUIRED: true, // compensation required for reduced rest
  COMPENSATION_PERIOD: 3, // weeks to provide compensation
} as const;

export const useWeeklyRest = (weekStart?: Date) => {
  const { profile } = useAuth();
  const startDate = weekStart ? format(weekStart, 'yyyy-MM-dd') : format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const endDate = weekStart ? format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd') : format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['weekly-rest', profile?.id, startDate, endDate],
    queryFn: async () => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      const { data, error } = await supabase
        .from('weekly_rest')
        .select('*')
        .eq('driver_id', profile.id)
        .gte('week_start_date', startDate)
        .lte('week_end_date', endDate)
        .order('week_start_date', { ascending: false });

      if (error) {
        console.error('Error fetching weekly rest:', error);
        // If table doesn't exist yet, return empty array
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.warn('weekly_rest table not found, returning empty data');
          return [];
        }
        throw error;
      }

      return (data || []) as WeeklyRestWithDetails[];
    },
    enabled: !!profile?.id,
  });
};

export const useCreateWeeklyRest = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restData: Partial<WeeklyRest>) => {
      if (!profile?.id || !profile?.organization_id) {
        throw new Error('User profile and organization information required');
      }

      const { data, error } = await supabase
        .from('weekly_rest')
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
          console.warn('weekly_rest table not found, cannot create weekly rest record');
          throw new Error('Weekly rest table not found. Please ensure the database is properly set up.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-rest'] });
      queryClient.invalidateQueries({ queryKey: ['daily-rest'] });
      toast.success('Weekly rest recorded successfully');
    },
    onError: (error: any) => {
      console.error('Error creating weekly rest:', error);
      toast.error('Failed to record weekly rest: ' + error.message);
    }
  });
};

export const useUpdateWeeklyRest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WeeklyRest> }) => {
      const { data, error } = await supabase
        .from('weekly_rest')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-rest'] });
      queryClient.invalidateQueries({ queryKey: ['daily-rest'] });
      toast.success('Weekly rest updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating weekly rest:', error);
      toast.error('Failed to update weekly rest: ' + error.message);
    }
  });
};

export const useDeleteWeeklyRest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('weekly_rest')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-rest'] });
      queryClient.invalidateQueries({ queryKey: ['daily-rest'] });
      toast.success('Weekly rest deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting weekly rest:', error);
      toast.error('Failed to delete weekly rest: ' + error.message);
    }
  });
};

// Function to analyze weekly rest compliance
export const analyzeWeeklyRest = async (driverId: string, weekStart: Date): Promise<WeeklyRestAnalysis> => {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const startDate = format(weekStart, 'yyyy-MM-dd');
  const endDate = format(weekEnd, 'yyyy-MM-dd');

  // Get time entries for the week
  const { data: timeEntries, error: timeError } = await supabase
    .from('time_entries')
    .select('entry_date, total_hours')
    .eq('driver_id', driverId)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate);

  if (timeError) {
    console.warn('Error fetching time entries for weekly rest analysis:', timeError);
  }

  // Get daily rest records for the week
  const { data: dailyRest, error: restError } = await supabase
    .from('daily_rest')
    .select('rest_date, duration_hours')
    .eq('driver_id', driverId)
    .gte('rest_date', startDate)
    .lte('rest_date', endDate);

  if (restError && (restError.code === 'PGRST205' || restError.code === '42P01')) {
    console.warn('daily_rest table not found for weekly rest analysis');
  }

  // Get weekly rest record
  const { data: weeklyRestData, error: weeklyRestError } = await supabase
    .from('weekly_rest')
    .select('*')
    .eq('driver_id', driverId)
    .gte('week_start_date', startDate)
    .lte('week_end_date', endDate)
    .order('week_start_date', { ascending: false })
    .limit(1);

  const weeklyRest = weeklyRestData?.[0] || null;

  if (weeklyRestError && (weeklyRestError.code === 'PGRST205' || weeklyRestError.code === '42P01')) {
    console.warn('weekly_rest table not found for weekly rest analysis');
  }

  // Calculate totals
  const totalWorkHours = timeEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;
  const totalRestHours = dailyRest?.reduce((sum, record) => sum + (record.duration_hours || 0), 0) || 0;
  const weeklyRestHours = weeklyRest?.total_rest_hours || 0;

  // Determine rest type and compliance
  let restType: 'full' | 'reduced' | 'missing' = 'missing';
  let restCompliance = false;
  let compensationRequired = false;
  let compensationDate: Date | undefined;

  if (weeklyRestHours >= WTD_WEEKLY_REST.FULL_WEEKLY_REST) {
    restType = 'full';
    restCompliance = true;
  } else if (weeklyRestHours >= WTD_WEEKLY_REST.REDUCED_WEEKLY_REST) {
    restType = 'reduced';
    restCompliance = true;
    compensationRequired = true;
    if (weeklyRest?.compensation_date) {
      compensationDate = new Date(weeklyRest.compensation_date);
    }
  }

  // Generate warnings and violations
  const warnings: string[] = [];
  const violations: string[] = [];

  if (totalWorkHours > 60) {
    violations.push(`Weekly working time (${totalWorkHours}h) exceeds WTD limit (60h)`);
  } else if (totalWorkHours > 55) {
    warnings.push(`Weekly working time (${totalWorkHours}h) approaching WTD limit (60h)`);
  }

  if (restType === 'missing') {
    violations.push('No weekly rest period recorded');
  } else if (restType === 'reduced' && !compensationRequired) {
    warnings.push('Reduced weekly rest requires compensation');
  }

  if (compensationRequired && !compensationDate) {
    warnings.push('Compensation for reduced weekly rest not scheduled');
  }

  return {
    weekStart,
    weekEnd,
    totalWorkHours,
    totalRestHours,
    requiredWeeklyRest: WTD_WEEKLY_REST.FULL_WEEKLY_REST,
    actualRestHours: weeklyRestHours,
    restCompliance,
    restType,
    compensationRequired,
    compensationDate,
    warnings,
    violations
  };
};

// Hook to get weekly rest analysis
export const useWeeklyRestAnalysis = (weekStart: Date) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['weekly-rest-analysis', profile?.id, weekStart.toISOString()],
    queryFn: async () => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      return analyzeWeeklyRest(profile.id, weekStart);
    },
    enabled: !!profile?.id,
  });
};

// Function to automatically detect and record weekly rest
export const useAutoRecordWeeklyRest = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const createWeeklyRest = useCreateWeeklyRest();

  return useMutation({
    mutationFn: async (weekStart: Date) => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      const analysis = await analyzeWeeklyRest(profile.id, weekStart);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      // Check if weekly rest already exists
      const { data: existingRestData } = await supabase
        .from('weekly_rest')
        .select('id')
        .eq('driver_id', profile.id)
        .gte('week_start_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('week_end_date', format(weekEnd, 'yyyy-MM-dd'))
        .limit(1);

      const existingRest = existingRestData?.[0];

      if (existingRest) {
        return { message: 'Weekly rest already recorded for this week', analysis };
      }

      // Determine rest type based on analysis
      let restType: 'full_weekly_rest' | 'reduced_weekly_rest' | 'compensated_rest' = 'full_weekly_rest';
      let compensationRequired = false;

      if (analysis.totalWorkHours > 60) {
        restType = 'reduced_weekly_rest';
        compensationRequired = true;
      }

      // Create weekly rest record
      await createWeeklyRest.mutateAsync({
        week_start_date: format(weekStart, 'yyyy-MM-dd'),
        week_end_date: format(weekEnd, 'yyyy-MM-dd'),
        total_rest_hours: analysis.actualRestHours || WTD_WEEKLY_REST.FULL_WEEKLY_REST,
        rest_type: restType,
        compensation_required: compensationRequired,
        notes: 'Automatically recorded weekly rest period'
      });

      return { message: 'Weekly rest recorded successfully', analysis };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['weekly-rest'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-rest-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['daily-rest'] });
      
      if (result.message.includes('already recorded')) {
        toast.info(result.message);
      } else {
        toast.success(result.message);
      }
    },
    onError: (error: any) => {
      console.error('Error auto-recording weekly rest:', error);
      toast.error('Failed to auto-record weekly rest: ' + error.message);
    }
  });
};

// Hook to get current week's rest analysis
export const useCurrentWeekRestAnalysis = () => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return useWeeklyRestAnalysis(weekStart);
};
