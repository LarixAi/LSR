import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';
import { startOfWeek, endOfWeek, differenceInHours, differenceInMinutes, addDays, parseISO, format } from 'date-fns';

export type TimeEntry = Tables<'time_entries'>;
export type TimeOffRequest = Tables<'time_off_requests'>;

// Working Time Directive (WTD) Constants for Transport Industry
export const WTD_LIMITS = {
  // Daily limits
  MAX_DAILY_WORKING_TIME: 13, // hours per day
  MAX_DAILY_DRIVING_TIME: 9, // hours per day (can be extended to 10 twice per week)
  MAX_DAILY_DRIVING_TIME_EXTENDED: 10, // hours per day (max 2 times per week)
  
  // Weekly limits
  MAX_WEEKLY_WORKING_TIME: 60, // hours per week
  MAX_WEEKLY_DRIVING_TIME: 56, // hours per week
  
  // Break requirements
  BREAK_AFTER_4_5_HOURS: 45, // minutes break after 4.5 hours
  BREAK_AFTER_6_HOURS: 30, // minutes break after 6 hours
  BREAK_AFTER_9_HOURS: 45, // minutes break after 9 hours
  
  // Rest periods
  DAILY_REST: 11, // hours minimum rest between shifts
  REDUCED_DAILY_REST: 9, // hours minimum (can be reduced 3 times per week)
  WEEKLY_REST: 45, // hours minimum weekly rest (can be reduced to 24 hours once per week)
  
  // Fortnightly limits
  MAX_FORTNIGHTLY_DRIVING_TIME: 90, // hours per fortnight
} as const;

export interface WTDAnalysis {
  // Daily analysis
  dailyWorkingTime: number;
  dailyDrivingTime: number;
  dailyBreaks: number;
  dailyRest: number;
  dailyCompliance: boolean;
  dailyWarnings: string[];
  
  // Weekly analysis
  weeklyWorkingTime: number;
  weeklyDrivingTime: number;
  weeklyRest: number;
  weeklyCompliance: boolean;
  weeklyWarnings: string[];
  
  // Break analysis
  breakCompliance: boolean;
  requiredBreaks: number;
  takenBreaks: number;
  breakWarnings: string[];
  
  // Rest analysis
  restCompliance: boolean;
  restWarnings: string[];
  
  // Overall compliance
  overallCompliance: boolean;
  complianceScore: number; // 0-100
  criticalViolations: string[];
  warnings: string[];
}

export const useTodayTimeEntry = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['today-time-entry', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('driver_id', profile.id)
        .eq('entry_date', today)
        .maybeSingle();

      if (error) {
        console.warn('time_entries not available or RLS prevented access (today entry)', error);
        return null;
      }

      return data;
    },
    enabled: !!profile?.id,
  });
};

export const useTimeEntries = (startDate?: string, endDate?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['time-entries', profile?.id, startDate, endDate],
    queryFn: async () => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('driver_id', profile.id)
        .order('entry_date', { ascending: false });

      if (startDate) {
        query = query.gte('entry_date', startDate);
      }
      if (endDate) {
        query = query.lte('entry_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('time_entries not available or RLS prevented access (list)', error);
        return [] as any[];
      }
      return data || [];
    },
    enabled: !!profile?.id,
  });
};

export const useClockIn = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location?: string) => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0]; // Format as HH:MM:SS

      // Check if already clocked in today
      const { data: existingEntry } = await supabase
        .from('time_entries')
        .select('id')
        .eq('driver_id', profile.id)
        .eq('entry_date', today)
        .maybeSingle();

      if (existingEntry) {
        throw new Error('Already clocked in today');
      }

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          driver_id: profile.id,
          entry_date: today,
          clock_in_time: timeString,
          location_clock_in: location || 'Unknown',
          status: 'active'
        })
        .select()
        .maybeSingle();

      if (error) {
        if ((error as any).code === '42P01') {
          throw new Error('Time entries feature is not enabled on this workspace');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-time-entry'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Successfully clocked in');
    },
    onError: (error: any) => {
      toast.error('Failed to clock in: ' + error.message);
    }
  });
};

export const useClockOut = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location?: string) => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0]; // Format as HH:MM:SS

      const { data, error } = await supabase
        .from('time_entries')
        .update({
          clock_out_time: timeString,
          location_clock_out: location || 'Unknown',
          status: 'completed'
        })
        .eq('driver_id', profile.id)
        .eq('entry_date', today)
        .eq('status', 'active')
        .select()
        .maybeSingle();

      if (error) {
        if ((error as any).code === '42P01') {
          throw new Error('Time entries feature is not enabled on this workspace');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-time-entry'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Successfully clocked out');
    },
    onError: (error: any) => {
      toast.error('Failed to clock out: ' + error.message);
    }
  });
};

export const useStartBreak = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0]; // Format as HH:MM:SS

      const { data, error } = await supabase
        .from('time_entries')
        .update({
          break_start_time: timeString
        })
        .eq('driver_id', profile.id)
        .eq('entry_date', today)
        .eq('status', 'active')
        .select()
        .maybeSingle();

      if (error) {
        if ((error as any).code === '42P01') {
          throw new Error('Time entries feature is not enabled on this workspace');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-time-entry'] });
      toast.success('Break started');
    },
    onError: (error: any) => {
      toast.error('Failed to start break: ' + error.message);
    }
  });
};

export const useEndBreak = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0]; // Format as HH:MM:SS

      const { data, error } = await supabase
        .from('time_entries')
        .update({
          break_end_time: timeString
        })
        .eq('driver_id', profile.id)
        .eq('entry_date', today)
        .eq('status', 'active')
        .select()
        .maybeSingle();

      if (error) {
        if ((error as any).code === '42P01') {
          throw new Error('Time entries feature is not enabled on this workspace');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-time-entry'] });
      toast.success('Break ended');
    },
    onError: (error: any) => {
      toast.error('Failed to end break: ' + error.message);
    }
  });
};

export const useTimeStats = () => {
  const { data: timeEntries = [] } = useTimeEntries();

  const calculateStats = () => {
    const totalHours = timeEntries.reduce((sum, entry) => {
      if (entry.total_hours) {
        return sum + entry.total_hours;
      }
      return sum;
    }, 0);

    const totalOvertime = timeEntries.reduce((sum, entry) => {
      if (entry.overtime_hours) {
        return sum + entry.overtime_hours;
      }
      return sum;
    }, 0);

    const totalBreaks = timeEntries.reduce((sum, entry) => {
      if (entry.break_hours) {
        return sum + entry.break_hours;
      }
      return sum;
    }, 0);

    return {
      totalHours,
      totalOvertime,
      totalBreaks,
      averageHoursPerDay: timeEntries.length > 0 ? totalHours / timeEntries.length : 0,
      totalDays: timeEntries.length
    };
  };

  return calculateStats();
};

export const useTimeOffRequests = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['time-off-requests', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('driver_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });
};

export const useCreateTimeOffRequest = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: Partial<TimeOffRequest>) => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      const { data, error } = await supabase
        .from('time_off_requests')
        .insert({
          ...requestData,
          driver_id: profile.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast.success('Time off request submitted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to submit time off request: ' + error.message);
    }
  });
};

// WTD Compliance Analysis Functions
export const analyzeWTDCompliance = (timeEntries: TimeEntry[], date: Date = new Date()): WTDAnalysis => {
  const warnings: string[] = [];
  const criticalViolations: string[] = [];
  
  // Get entries for the specific date
  const dateStr = format(date, 'yyyy-MM-dd');
  const dailyEntries = timeEntries.filter(entry => entry.entry_date && entry.entry_date === dateStr);
  
  // Get entries for the current week
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const weeklyEntries = timeEntries.filter(entry => {
    if (!entry.entry_date) return false;
    try {
      const entryDate = parseISO(entry.entry_date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    } catch (error) {
      console.warn('Invalid entry_date format:', entry.entry_date);
      return false;
    }
  });

  // Daily analysis
  const dailyWorkingTime = dailyEntries.reduce((sum, entry) => {
    return sum + (entry.total_hours || 0);
  }, 0);

  const dailyDrivingTime = dailyEntries.reduce((sum, entry) => {
    return sum + (entry.driving_hours || 0);
  }, 0);

  const dailyBreaks = dailyEntries.reduce((sum, entry) => {
    return sum + (entry.break_hours || 0);
  }, 0);

  // Check daily limits
  if (dailyWorkingTime > WTD_LIMITS.MAX_DAILY_WORKING_TIME) {
    criticalViolations.push(`Daily working time (${dailyWorkingTime}h) exceeds limit (${WTD_LIMITS.MAX_DAILY_WORKING_TIME}h)`);
  } else if (dailyWorkingTime > WTD_LIMITS.MAX_DAILY_WORKING_TIME - 1) {
    warnings.push(`Daily working time (${dailyWorkingTime}h) approaching limit (${WTD_LIMITS.MAX_DAILY_WORKING_TIME}h)`);
  }

  if (dailyDrivingTime > WTD_LIMITS.MAX_DAILY_DRIVING_TIME) {
    criticalViolations.push(`Daily driving time (${dailyDrivingTime}h) exceeds limit (${WTD_LIMITS.MAX_DAILY_DRIVING_TIME}h)`);
  } else if (dailyDrivingTime > WTD_LIMITS.MAX_DAILY_DRIVING_TIME - 0.5) {
    warnings.push(`Daily driving time (${dailyDrivingTime}h) approaching limit (${WTD_LIMITS.MAX_DAILY_DRIVING_TIME}h)`);
  }

  // Weekly analysis
  const weeklyWorkingTime = weeklyEntries.reduce((sum, entry) => {
    return sum + (entry.total_hours || 0);
  }, 0);

  const weeklyDrivingTime = weeklyEntries.reduce((sum, entry) => {
    return sum + (entry.driving_hours || 0);
  }, 0);

  if (weeklyWorkingTime > WTD_LIMITS.MAX_WEEKLY_WORKING_TIME) {
    criticalViolations.push(`Weekly working time (${weeklyWorkingTime}h) exceeds limit (${WTD_LIMITS.MAX_WEEKLY_WORKING_TIME}h)`);
  } else if (weeklyWorkingTime > WTD_LIMITS.MAX_WEEKLY_WORKING_TIME - 2) {
    warnings.push(`Weekly working time (${weeklyWorkingTime}h) approaching limit (${WTD_LIMITS.MAX_WEEKLY_WORKING_TIME}h)`);
  }

  if (weeklyDrivingTime > WTD_LIMITS.MAX_WEEKLY_DRIVING_TIME) {
    criticalViolations.push(`Weekly driving time (${weeklyDrivingTime}h) exceeds limit (${WTD_LIMITS.MAX_WEEKLY_DRIVING_TIME}h)`);
  } else if (weeklyDrivingTime > WTD_LIMITS.MAX_WEEKLY_DRIVING_TIME - 2) {
    warnings.push(`Weekly driving time (${weeklyDrivingTime}h) approaching limit (${WTD_LIMITS.MAX_WEEKLY_DRIVING_TIME}h)`);
  }

  // Break analysis
  const breakCompliance = checkBreakCompliance(dailyWorkingTime, dailyBreaks);
  const breakWarnings = getBreakWarnings(dailyWorkingTime, dailyBreaks);

  // Rest analysis
  const restCompliance = checkRestCompliance(timeEntries, date);
  const restWarnings = getRestWarnings(timeEntries, date);

  // Calculate compliance score
  const complianceScore = calculateComplianceScore({
    dailyWorkingTime,
    dailyDrivingTime,
    weeklyWorkingTime,
    weeklyDrivingTime,
    breakCompliance,
    restCompliance
  });

  return {
    // Daily analysis
    dailyWorkingTime,
    dailyDrivingTime,
    dailyBreaks,
    dailyRest: 0, // Would need to calculate from previous day's end
    dailyCompliance: dailyWorkingTime <= WTD_LIMITS.MAX_DAILY_WORKING_TIME && dailyDrivingTime <= WTD_LIMITS.MAX_DAILY_DRIVING_TIME,
    dailyWarnings: warnings.filter(w => w.includes('Daily')),
    
    // Weekly analysis
    weeklyWorkingTime,
    weeklyDrivingTime,
    weeklyRest: 0, // Would need to calculate from previous week
    weeklyCompliance: weeklyWorkingTime <= WTD_LIMITS.MAX_WEEKLY_WORKING_TIME && weeklyDrivingTime <= WTD_LIMITS.MAX_WEEKLY_DRIVING_TIME,
    weeklyWarnings: warnings.filter(w => w.includes('Weekly')),
    
    // Break analysis
    breakCompliance,
    requiredBreaks: calculateRequiredBreaks(dailyWorkingTime),
    takenBreaks: dailyBreaks,
    breakWarnings,
    
    // Rest analysis
    restCompliance,
    restWarnings,
    
    // Overall compliance
    overallCompliance: criticalViolations.length === 0,
    complianceScore,
    criticalViolations,
    warnings
  };
};

const checkBreakCompliance = (workingTime: number, breakTime: number): boolean => {
  const requiredBreaks = calculateRequiredBreaks(workingTime);
  return breakTime >= requiredBreaks;
};

const calculateRequiredBreaks = (workingTime: number): number => {
  if (workingTime <= 4.5) return 0;
  if (workingTime <= 6) return WTD_LIMITS.BREAK_AFTER_4_5_HOURS / 60;
  if (workingTime <= 9) return WTD_LIMITS.BREAK_AFTER_6_HOURS / 60;
  return WTD_LIMITS.BREAK_AFTER_9_HOURS / 60;
};

const getBreakWarnings = (workingTime: number, breakTime: number): string[] => {
  const warnings: string[] = [];
  const requiredBreaks = calculateRequiredBreaks(workingTime);
  
  if (workingTime > 4.5 && breakTime < requiredBreaks) {
    warnings.push(`Break time (${breakTime}h) is less than required (${requiredBreaks}h) for ${workingTime}h of work`);
  }
  
  if (workingTime > 6 && breakTime < WTD_LIMITS.BREAK_AFTER_6_HOURS / 60) {
    warnings.push(`Additional break required after 6 hours of work`);
  }
  
  return warnings;
};

const checkRestCompliance = (timeEntries: TimeEntry[], date: Date): boolean => {
  // This would need more complex logic to check rest periods between shifts
  // For now, return true as a placeholder
  return true;
};

const getRestWarnings = (timeEntries: TimeEntry[], date: Date): string[] => {
  // This would need more complex logic to check rest periods
  // For now, return empty array as a placeholder
  return [];
};

const calculateComplianceScore = (metrics: {
  dailyWorkingTime: number;
  dailyDrivingTime: number;
  weeklyWorkingTime: number;
  weeklyDrivingTime: number;
  breakCompliance: boolean;
  restCompliance: boolean;
}): number => {
  let score = 100;
  
  // Daily working time penalty
  if (metrics.dailyWorkingTime > WTD_LIMITS.MAX_DAILY_WORKING_TIME) {
    score -= 20;
  } else if (metrics.dailyWorkingTime > WTD_LIMITS.MAX_DAILY_WORKING_TIME - 1) {
    score -= 5;
  }
  
  // Daily driving time penalty
  if (metrics.dailyDrivingTime > WTD_LIMITS.MAX_DAILY_DRIVING_TIME) {
    score -= 20;
  } else if (metrics.dailyDrivingTime > WTD_LIMITS.MAX_DAILY_DRIVING_TIME - 0.5) {
    score -= 5;
  }
  
  // Weekly working time penalty
  if (metrics.weeklyWorkingTime > WTD_LIMITS.MAX_WEEKLY_WORKING_TIME) {
    score -= 15;
  } else if (metrics.weeklyWorkingTime > WTD_LIMITS.MAX_WEEKLY_WORKING_TIME - 2) {
    score -= 5;
  }
  
  // Weekly driving time penalty
  if (metrics.weeklyDrivingTime > WTD_LIMITS.MAX_WEEKLY_DRIVING_TIME) {
    score -= 15;
  } else if (metrics.weeklyDrivingTime > WTD_LIMITS.MAX_WEEKLY_DRIVING_TIME - 2) {
    score -= 5;
  }
  
  // Break compliance penalty
  if (!metrics.breakCompliance) {
    score -= 10;
  }
  
  // Rest compliance penalty
  if (!metrics.restCompliance) {
    score -= 10;
  }
  
  return Math.max(0, score);
};

export const useWTDCompliance = (date: Date = new Date()) => {
  const { data: timeEntries = [] } = useTimeEntries();
  
  return {
    analysis: analyzeWTDCompliance(timeEntries, date),
    limits: WTD_LIMITS
  };
};
