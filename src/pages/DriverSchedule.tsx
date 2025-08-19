import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertTriangle,
  AlertCircle,
  Users,
  Route,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Moon,
  Sun,
  Coffee,
  RefreshCw,
  Play,
  Pause,
  LogOut,
  Home,
  Shield,
  TrendingUp,
  BarChart3,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isYesterday, isThisWeek } from 'date-fns';
import { useSchedules } from '@/hooks/useSchedules';
import { useDailyRest, useAutoRecordRestDays, useCurrentWeekRest } from '@/hooks/useDailyRest';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useWTDCompliance } from '@/hooks/useTimeEntries';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileSchedule from '@/components/driver/MobileSchedule';

const DriverSchedule = () => {
  const { user, profile, loading } = useAuth();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [calendarOpen, setCalendarOpen] = useState(false);

  // TEMPORARILY DISABLED: Use mobile-optimized component on mobile devices
  // if (isMobile) {
  //   return <MobileSchedule />;
  // }

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading schedule...</p>
        </div>
      </div>
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
    
    // Check if there's a time entry for this day
    const hasWork = safeTimeEntries.some(entry => entry.entry_date === dateStr);
    
    // Check if there's a rest record for this day
    const hasRest = safeDailyRest.some(rest => rest.rest_date === dateStr);
    
    // Check if there's a schedule for this day
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground">
            View your work schedule and rest periods
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleAutoRecordRest}
            disabled={autoRecordRest.isPending}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRecordRest.isPending ? 'animate-spin' : ''}`} />
            {autoRecordRest.isPending ? 'Recording Rest...' : 'Record Rest Days'}
          </Button>
        </div>
      </div>

      {/* Weekly Rest Summary */}
      {weeklyRest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Weekly Rest Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{weeklyRest.workedDays}</div>
                <p className="text-sm text-muted-foreground">Work Days</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{weeklyRest.restDays}</div>
                <p className="text-sm text-muted-foreground">Rest Days</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{weeklyRest.totalWorkHours.toFixed(1)}h</div>
                <p className="text-sm text-muted-foreground">Total Work Hours</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{weeklyRest.totalRestHours.toFixed(1)}h</div>
                <p className="text-sm text-muted-foreground">Total Rest Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}



      {/* WTD Compliance Alert */}
      {wtdAnalysis.criticalViolations.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>WTD Compliance Issues:</strong> {wtdAnalysis.criticalViolations[0]}
          </AlertDescription>
        </Alert>
      )}

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(subDays(selectedDate, 7))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                </h2>
                <p className="text-sm text-muted-foreground">Week of {format(weekStart, 'MMMM yyyy')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Select Week
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
      </Card>

      {/* Weekly Schedule Grid */}
      <div className="grid gap-4 md:grid-cols-7">
        {weekDays.map((day) => {
          const status = getDayStatus(day);
          const activities = getDayActivities(day);
          const statusDisplay = getStatusDisplay(status);
          const StatusIcon = statusDisplay.icon;
          const isTodayDay = isToday(day);
          const isYesterdayDay = isYesterday(day);

          return (
            <Card key={day.toISOString()} className={cn(
              "min-h-[200px]",
              isTodayDay && "ring-2 ring-blue-500",
              isYesterdayDay && "ring-1 ring-gray-300"
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {format(day, 'EEE')}
                    </p>
                    <p className={cn(
                      "text-lg font-bold",
                      isTodayDay && "text-blue-600",
                      isYesterdayDay && "text-gray-600"
                    )}>
                      {format(day, 'dd')}
                    </p>
                  </div>
                  <div className={cn(
                    "p-2 rounded-full",
                    statusDisplay.bgColor
                  )}>
                    <StatusIcon className={cn("w-4 h-4", statusDisplay.color)} />
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {statusDisplay.label}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {/* Work Status */}
                  {activities.timeEntry && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Sun className="w-3 h-3 text-green-600" />
                      <span className="text-green-700">
                        Worked: {activities.timeEntry.total_hours?.toFixed(1) || '0.0'}h
                      </span>
                    </div>
                  )}

                  {/* Rest Status */}
                  {activities.rest && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Moon className="w-3 h-3 text-blue-600" />
                      <span className="text-blue-700">
                        Rest: {activities.rest.duration_hours}h
                      </span>
                    </div>
                  )}

                  {/* Scheduled Activities */}
                  {activities.schedules.map((schedule) => (
                    <div key={schedule.id} className="text-xs p-2 bg-orange-50 rounded border-l-2 border-orange-300">
                      <div className="font-medium text-orange-800">
                        {format(new Date(schedule.start_time), 'HH:mm')} - {schedule.job_type}
                      </div>
                      {schedule.notes && (
                        <div className="text-orange-600 mt-1">{schedule.notes}</div>
                      )}
                    </div>
                  ))}

                  {/* No Activity Message */}
                  {status === 'off' && !activities.schedules.length && (
                    <div className="text-xs text-gray-500 italic">
                      No scheduled activities
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rest Day Recording Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="w-5 h-5 text-blue-600" />
            <span>Daily Rest Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Sun className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Work Days</h4>
                  <p className="text-sm text-muted-foreground">
                    Days when you clocked in and worked
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Moon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Rest Days</h4>
                  <p className="text-sm text-muted-foreground">
                    Days automatically recorded as rest when no work activity
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium">Scheduled</h4>
                  <p className="text-sm text-muted-foreground">
                    Days with scheduled activities but no work recorded
                  </p>
                </div>
              </div>
            </div>
            
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Automatic Rest Recording:</strong> Days without work activity are automatically recorded as rest days for WTD compliance. 
                Use the "Record Rest Days" button to manually process rest days for the current week.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverSchedule;
