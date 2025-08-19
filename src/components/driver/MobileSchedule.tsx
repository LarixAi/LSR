import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  MapPin, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Moon,
  Sun,
  RefreshCw,
  Home,
  Shield,
  Info,
  CheckCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isYesterday } from 'date-fns';
import { useSchedules } from '@/hooks/useSchedules';
import { useDailyRest, useAutoRecordRestDays, useCurrentWeekRest } from '@/hooks/useDailyRest';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useWTDCompliance } from '@/hooks/useTimeEntries';
import MobileOptimizedLayout from '@/components/mobile/MobileOptimizedLayout';

const MobileSchedule = () => {
  const { user, profile, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Hooks
  const { data: schedules = [], isLoading: schedulesLoading } = useSchedules();
  const { data: dailyRest = [], isLoading: restLoading } = useDailyRest();
  const { data: timeEntries = [] } = useTimeEntries();
  const { analysis: wtdAnalysis } = useWTDCompliance(selectedDate);
  const { data: weeklyRest } = useCurrentWeekRest();
  const autoRecordRest = useAutoRecordRestDays();

  // Fallback data in case of errors
  const safeTimeEntries = timeEntries || [];
  const safeDailyRest = dailyRest || [];
  const safeSchedules = schedules || [];

  if (loading || schedulesLoading || restLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-lg">Loading schedule...</p>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  // Handle case where there's no data
  if (!safeSchedules.length && !safeTimeEntries.length && !safeDailyRest.length) {
    return (
      <MobileOptimizedLayout>
        <div className="space-y-4 p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
              <p className="text-sm text-muted-foreground">
                View your work schedule and rest periods
              </p>
            </div>
          </div>

          {/* Empty State */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your schedule is currently empty. This could be because:
                </p>
                <div className="text-left space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>No schedules have been assigned yet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>No work hours have been recorded</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>No rest periods have been logged</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly View Placeholder */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CalendarDays className="w-5 h-5" />
                <span>This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">{day}</p>
                    <div className="w-6 h-6 bg-gray-200 rounded-full mx-auto"></div>
                    <p className="text-xs text-gray-400 mt-1">No data</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileOptimizedLayout>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only drivers can access
  if (profile.role !== 'driver') {
    return <Navigate to="/dashboard" replace />;
  }

  // Get current week dates
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Function to get day status
  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const hasWork = safeTimeEntries.some(entry => entry.entry_date === dateStr);
    const hasRest = safeDailyRest.some(rest => rest.rest_date === dateStr);
    const hasSchedule = safeSchedules.some(schedule => 
      format(new Date(schedule.start_time), 'yyyy-MM-dd') === dateStr
    );

    if (hasWork) return 'worked';
    if (hasRest) return 'rest';
    if (hasSchedule) return 'scheduled';
    return 'off';
  };

  // Function to get day activities
  const getDayActivities = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const daySchedules = safeSchedules.filter(schedule => 
      format(new Date(schedule.start_time), 'yyyy-MM-dd') === dateStr
    );
    
    const dayRest = safeDailyRest.find(rest => rest.rest_date === dateStr);
    const dayTimeEntry = safeTimeEntries.find(entry => entry.entry_date === dateStr);

    return {
      schedules: daySchedules,
      rest: dayRest,
      timeEntry: dayTimeEntry
    };
  };

  // Function to handle auto-recording rest days
  const handleAutoRecordRest = async () => {
    try {
      await autoRecordRest.mutateAsync({
        startDate: weekStart,
        endDate: weekEnd
      });
    } catch (error) {
      console.error('Error auto-recording rest days:', error);
    }
  };

  // Function to get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'worked':
        return { icon: Sun, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Worked' };
      case 'rest':
        return { icon: Moon, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Rest' };
      case 'scheduled':
        return { icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Scheduled' };
      default:
        return { icon: Home, color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Off' };
    }
  };

  return (
    <MobileOptimizedLayout>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
            <p className="text-sm text-muted-foreground">
              View your work schedule and rest periods
            </p>
          </div>
          <Button 
            onClick={handleAutoRecordRest}
            disabled={autoRecordRest.isPending}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${autoRecordRest.isPending ? 'animate-spin' : ''}`} />
            {autoRecordRest.isPending ? 'Recording...' : 'Record Rest'}
          </Button>
        </div>

        {/* Weekly Rest Summary - Mobile Optimized */}
        {weeklyRest && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Shield className="w-5 h-5" />
                <span>Weekly Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{weeklyRest.workedDays}</div>
                  <p className="text-xs text-muted-foreground">Work Days</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{weeklyRest.restDays}</div>
                  <p className="text-xs text-muted-foreground">Rest Days</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">{weeklyRest.totalWorkHours.toFixed(1)}h</div>
                  <p className="text-xs text-muted-foreground">Work Hours</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">{weeklyRest.totalRestHours.toFixed(1)}h</div>
                  <p className="text-xs text-muted-foreground">Rest Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* WTD Compliance Alert */}
        {wtdAnalysis.criticalViolations.length > 0 && (
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              <strong>WTD Compliance Issues:</strong> {wtdAnalysis.criticalViolations[0]}
            </AlertDescription>
          </Alert>
        )}

        {/* Week Navigation - Mobile Optimized */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(subDays(selectedDate, 7))}
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center flex-1">
                <h2 className="text-base font-semibold">
                  {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd')}
                </h2>
                <p className="text-xs text-muted-foreground">{format(weekStart, 'MMMM yyyy')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                className="p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Weekly Schedule - Mobile Optimized Horizontal Scroll */}
        <div className="mb-4">
          <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4">
            {weekDays.map((day) => {
              const status = getDayStatus(day);
              const statusDisplay = getStatusDisplay(status);
              const StatusIcon = statusDisplay.icon;
              const isTodayDay = isToday(day);
              const isYesterdayDay = isYesterday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex-shrink-0 w-20 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    "flex flex-col items-center justify-center",
                    isTodayDay && "border-blue-500 bg-blue-50",
                    isYesterdayDay && "border-gray-300 bg-gray-50",
                    !isTodayDay && !isYesterdayDay && "border-gray-200 bg-white",
                    selectedDay && format(selectedDay, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && "ring-2 ring-primary"
                  )}
                >
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {format(day, 'EEE')}
                  </p>
                  <p className={cn(
                    "text-lg font-bold mb-2",
                    isTodayDay && "text-blue-600",
                    isYesterdayDay && "text-gray-600"
                  )}>
                    {format(day, 'dd')}
                  </p>
                  <div className={cn(
                    "p-2 rounded-full",
                    statusDisplay.bgColor
                  )}>
                    <StatusIcon className={cn("w-4 h-4", statusDisplay.color)} />
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {statusDisplay.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">
                  {format(selectedDay, 'EEEE, MMMM dd')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDay(null)}
                  className="p-1"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DayDetails 
                date={selectedDay}
                activities={getDayActivities(selectedDay)}
                status={getDayStatus(selectedDay)}
              />
            </CardContent>
          </Card>
        )}

        {/* Rest Day Recording Info - Mobile Optimized */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Moon className="w-5 h-5 text-blue-600" />
              <span>Daily Rest Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Sun className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Work Days</h4>
                    <p className="text-xs text-muted-foreground">
                      Days when you clocked in and worked
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Moon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Rest Days</h4>
                    <p className="text-xs text-muted-foreground">
                      Days automatically recorded as rest when no work activity
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Scheduled</h4>
                    <p className="text-xs text-muted-foreground">
                      Days with scheduled activities but no work recorded
                    </p>
                  </div>
                </div>
              </div>
              
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Automatic Rest Recording:</strong> Days without work activity are automatically recorded as rest days for WTD compliance.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileOptimizedLayout>
  );
};

// Day Details Component
const DayDetails: React.FC<{
  date: Date;
  activities: any;
  status: string;
}> = ({ date, activities, status }) => {
  const statusDisplay = getStatusDisplay(status);
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="space-y-4">
      {/* Status Summary */}
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <div className={cn("p-2 rounded-full", statusDisplay.bgColor)}>
          <StatusIcon className={cn("w-5 h-5", statusDisplay.color)} />
        </div>
        <div>
          <h3 className="font-medium">{statusDisplay.label}</h3>
          <p className="text-sm text-muted-foreground">
            {format(date, 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
      </div>

      {/* Work Status */}
      {activities.timeEntry && (
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <Sun className="w-5 h-5 text-green-600" />
          <div>
            <h4 className="font-medium text-green-800">Worked</h4>
            <p className="text-sm text-green-700">
              {activities.timeEntry.total_hours?.toFixed(1) || '0.0'} hours
            </p>
          </div>
        </div>
      )}

      {/* Rest Status */}
      {activities.rest && (
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <Moon className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-800">Rest Period</h4>
            <p className="text-sm text-blue-700">
              {activities.rest.duration_hours} hours
            </p>
          </div>
        </div>
      )}

      {/* Scheduled Activities */}
      {activities.schedules.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Scheduled Activities</h4>
          {activities.schedules.map((schedule: any) => (
            <div key={schedule.id} className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-300">
              <div className="flex items-center space-x-2 mb-1">
                <PlayCircle className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800">
                  {format(new Date(schedule.start_time), 'HH:mm')} - {schedule.job_type || 'Scheduled'}
                </span>
              </div>
              {schedule.notes && (
                <p className="text-sm text-orange-700">{schedule.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Activity Message */}
      {status === 'off' && !activities.schedules.length && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Home className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No scheduled activities</p>
        </div>
      )}
    </div>
  );
};

// Helper function for status display
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'worked':
      return { icon: Sun, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Worked' };
    case 'rest':
      return { icon: Moon, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Rest' };
    case 'scheduled':
      return { icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Scheduled' };
    default:
      return { icon: Home, color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Off' };
  }
};

export default MobileSchedule;
