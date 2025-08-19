import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Coffee, 
  CalendarDays, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  MapPin,
  Users,
  BarChart3,
  FileText,
  Settings,
  RefreshCw,
  Shield,
  AlertCircle,
  Info,
  Car,
  LogOut,
  Home,
  UserCheck,
  Timer,
  Calendar as CalendarIcon,
  Moon,
  Sun
} from 'lucide-react';
import { format, parseISO, differenceInHours, differenceInMinutes, addDays, startOfWeek, endOfWeek, isToday, isYesterday, isThisWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  useTodayTimeEntry, 
  useClockIn, 
  useClockOut, 
  useStartBreak, 
  useEndBreak,
  useTimeEntries,
  useTimeStats,
  useTimeOffRequests,
  useCreateTimeOffRequest,
  useWTDCompliance,
  WTD_LIMITS,
  type TimeEntry,
  type TimeOffRequest
} from '@/hooks/useTimeEntries';
import { useAutoRecordRestDays } from '@/hooks/useDailyRest';
import { useWeeklyRest, useAutoRecordWeeklyRest, useCurrentWeekRestAnalysis, WTD_WEEKLY_REST } from '@/hooks/useWeeklyRest';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileTimeManagement from '@/components/driver/MobileTimeManagement';

export default function TimeManagement() {
  const { user, profile, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeOffDialogOpen, setTimeOffDialogOpen] = useState(false);
  const [signOffDialogOpen, setSignOffDialogOpen] = useState(false);
  const [signOffReason, setSignOffReason] = useState('');
  const [timeOffForm, setTimeOffForm] = useState({
    start_date: '',
    end_date: '',
    request_type: 'annual_leave' as const,
    reason: '',
    notes: ''
  });

  // Hooks
  const { data: todayEntry, isLoading: todayLoading } = useTodayTimeEntry();
  const { data: timeEntries = [], isLoading: entriesLoading } = useTimeEntries();
  const { data: timeOffRequests = [] } = useTimeOffRequests();
  const stats = useTimeStats();
  const { analysis: wtdAnalysis, limits } = useWTDCompliance(selectedDate || new Date());
  
  // Weekly Rest Hooks
  const { data: weeklyRestRecords = [] } = useWeeklyRest(selectedDate);
  const { data: weeklyRestAnalysis } = useCurrentWeekRestAnalysis();
  const autoRecordWeeklyRest = useAutoRecordWeeklyRest();

  // Mutations
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();
  const startBreakMutation = useStartBreak();
  const endBreakMutation = useEndBreak();
  const createTimeOffMutation = useCreateTimeOffRequest();
  const autoRecordRest = useAutoRecordRestDays();

  // Loading state
  if (authLoading || todayLoading || entriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading time management...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // SECURITY CHECK: Verify user is a driver
  if (profile.role !== 'driver') {
    return <Navigate to="/dashboard" replace />;
  }

  // Use mobile-optimized component on mobile devices
  if (isMobile) {
    return <MobileTimeManagement />;
  }

  // Calculate current session time
  const getCurrentSessionTime = () => {
    if (!todayEntry?.clock_in_time) return 0;
    
    // If the user is signed off (status is 'completed'), return 0 for current session
    if (todayEntry.status === 'completed') return 0;
    
    // Since clock_in_time is now a time string (HH:MM:SS), we need to create a proper date
    const today = new Date();
    const [hours, minutes, seconds] = todayEntry.clock_in_time.split(':').map(Number);
    const clockInTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds);
    const now = new Date();
    const totalMinutes = differenceInMinutes(now, clockInTime);
    
    // Subtract break time if on break
    if (todayEntry.break_start_time && !todayEntry.break_end_time) {
      const [breakHours, breakMinutesFromTime, breakSeconds] = todayEntry.break_start_time.split(':').map(Number);
      const breakStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), breakHours, breakMinutesFromTime, breakSeconds);
      const breakMinutesElapsed = differenceInMinutes(now, breakStart);
      return Math.max(0, totalMinutes - breakMinutesElapsed);
    }
    
    return totalMinutes;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleClockIn = async () => {
    try {
      // Get current location if available
      let location = 'Unknown';
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          },
          () => {
            // Location not available, use default
          }
        );
      }
      
      await clockInMutation.mutateAsync(location);
    } catch (error) {
      console.error('Clock in error:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      let location = 'Unknown';
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          },
          () => {
            // Location not available, use default
          }
        );
      }
      
      await clockOutMutation.mutateAsync(location);
      
      // Automatically record rest days for the current week after signing off
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      try {
        await autoRecordRest.mutateAsync({
          startDate: weekStart,
          endDate: weekEnd
        });
      } catch (restError) {
        console.error('Error auto-recording rest days:', restError);
        // Don't fail the clock out if rest recording fails
      }
      
      setSignOffDialogOpen(false);
      setSignOffReason('');
    } catch (error) {
      console.error('Clock out error:', error);
    }
  };

  const handleStartBreak = async () => {
    try {
      await startBreakMutation.mutateAsync();
    } catch (error) {
      console.error('Start break error:', error);
    }
  };

  const handleEndBreak = async () => {
    try {
      await endBreakMutation.mutateAsync();
    } catch (error) {
      console.error('End break error:', error);
    }
  };

  const handleTimeOffSubmit = async () => {
    try {
      await createTimeOffMutation.mutateAsync(timeOffForm);
      setTimeOffDialogOpen(false);
      setTimeOffForm({
        start_date: '',
        end_date: '',
        request_type: 'annual_leave',
        reason: '',
        notes: ''
      });
    } catch (error) {
      console.error('Time off request error:', error);
    }
  };

  const getComplianceStatus = () => {
    if (wtdAnalysis.criticalViolations.length > 0) {
      return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
    if (wtdAnalysis.warnings.length > 0) {
      return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    }
    return { status: 'compliant', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const complianceStatus = getComplianceStatus();

  // Get current work status
  const getWorkStatus = () => {
    if (!todayEntry) return 'off_duty';
    if (todayEntry.status === 'completed') return 'signed_off';
    if (todayEntry.break_start_time && !todayEntry.break_end_time) return 'on_break';
    return 'on_duty';
  };

  const workStatus = getWorkStatus();

  // Get recent time off requests
  const getRecentTimeOff = () => {
    const today = new Date();
    return timeOffRequests.filter(request => {
      const startDate = parseISO(request.start_date);
      const endDate = parseISO(request.end_date);
      return startDate <= today && endDate >= today;
    });
  };

  const currentTimeOff = getRecentTimeOff();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Management</h1>
          <p className="text-muted-foreground">
            Track your working hours, manage breaks, and submit time off requests
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="compliance">WTD Compliance</TabsTrigger>
          <TabsTrigger value="time-off">Time Off</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Work Status Banner */}
      <Card className={cn(
        "border-2",
        workStatus === 'on_duty' && "border-green-200 bg-green-50",
        workStatus === 'on_break' && "border-yellow-200 bg-yellow-50",
        workStatus === 'signed_off' && "border-blue-200 bg-blue-50",
        workStatus === 'off_duty' && "border-gray-200 bg-gray-50"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={cn(
                "p-3 rounded-full",
                workStatus === 'on_duty' && "bg-green-100",
                workStatus === 'on_break' && "bg-yellow-100",
                workStatus === 'signed_off' && "bg-blue-100",
                workStatus === 'off_duty' && "bg-gray-100"
              )}>
                {workStatus === 'on_duty' && <Sun className="w-6 h-6 text-green-600" />}
                {workStatus === 'on_break' && <Coffee className="w-6 h-6 text-yellow-600" />}
                {workStatus === 'signed_off' && <LogOut className="w-6 h-6 text-blue-600" />}
                {workStatus === 'off_duty' && <Home className="w-6 h-6 text-gray-600" />}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {workStatus === 'on_duty' && 'Currently On Duty'}
                  {workStatus === 'on_break' && 'Currently On Break'}
                  {workStatus === 'signed_off' && 'Signed Off for the Day'}
                  {workStatus === 'off_duty' && 'Off Duty'}
                </h2>
                <p className="text-muted-foreground">
                  {workStatus === 'on_duty' && 'You are currently working. Remember to take breaks and monitor your WTD compliance.'}
                  {workStatus === 'on_break' && 'You are currently on break. Take your time to rest properly.'}
                  {workStatus === 'signed_off' && 'You have successfully signed off for the day. Have a good rest!'}
                  {workStatus === 'off_duty' && 'You are not currently on duty. Click "Clock In" to start your work day.'}
                </p>
              </div>
            </div>
            <div className="text-right">
              {workStatus === 'on_duty' && (
                <Button 
                  onClick={() => setSignOffDialogOpen(true)}
                  className="bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Off Work
                </Button>
              )}
              {workStatus === 'off_duty' && (
                <Button 
                  onClick={handleClockIn}
                  disabled={clockInMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {clockInMutation.isPending ? 'Clocking In...' : 'Clock In'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Off Status Alert */}
      {currentTimeOff.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <CalendarIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>You are currently on approved time off:</strong> {currentTimeOff[0].request_type.replace('_', ' ')} 
            from {format(parseISO(currentTimeOff[0].start_date), 'MMM dd')} to {format(parseISO(currentTimeOff[0].end_date), 'MMM dd')}
          </AlertDescription>
        </Alert>
      )}

      {/* WTD Compliance Alert */}
      {wtdAnalysis.criticalViolations.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Working Time Directive Violations</h3>
                <ul className="mt-1 text-sm text-red-700">
                  {wtdAnalysis.criticalViolations.map((violation, index) => (
                    <li key={index}>• {violation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {wtdAnalysis.warnings.length > 0 && wtdAnalysis.criticalViolations.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Working Time Directive Warnings</h3>
                <ul className="mt-1 text-sm text-yellow-700">
                  {wtdAnalysis.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WTD Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Working Time</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wtdAnalysis.dailyWorkingTime.toFixed(1)}h</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress 
                value={(wtdAnalysis.dailyWorkingTime / limits.MAX_DAILY_WORKING_TIME) * 100} 
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">
                {limits.MAX_DAILY_WORKING_TIME}h limit
              </span>
            </div>
            {wtdAnalysis.dailyWorkingTime > limits.MAX_DAILY_WORKING_TIME && (
              <p className="text-xs text-red-600 mt-1">Exceeds limit</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Driving Time</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wtdAnalysis.dailyDrivingTime.toFixed(1)}h</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress 
                value={(wtdAnalysis.dailyDrivingTime / limits.MAX_DAILY_DRIVING_TIME) * 100} 
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">
                {limits.MAX_DAILY_DRIVING_TIME}h limit
              </span>
            </div>
            {wtdAnalysis.dailyDrivingTime > limits.MAX_DAILY_DRIVING_TIME && (
              <p className="text-xs text-red-600 mt-1">Exceeds limit</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Working Time</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wtdAnalysis.weeklyWorkingTime.toFixed(1)}h</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress 
                value={(wtdAnalysis.weeklyWorkingTime / limits.MAX_WEEKLY_WORKING_TIME) * 100} 
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">
                {limits.MAX_WEEKLY_WORKING_TIME}h limit
              </span>
            </div>
            {wtdAnalysis.weeklyWorkingTime > limits.MAX_WEEKLY_WORKING_TIME && (
              <p className="text-xs text-red-600 mt-1">Exceeds limit</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wtdAnalysis.complianceScore}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={wtdAnalysis.complianceScore} className="flex-1" />
              <Badge variant={wtdAnalysis.overallCompliance ? "default" : "destructive"}>
                {wtdAnalysis.overallCompliance ? "Compliant" : "Non-Compliant"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Break Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coffee className="w-5 h-5" />
            <span>Break Compliance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{wtdAnalysis.takenBreaks.toFixed(1)}h</div>
              <p className="text-sm text-muted-foreground">Breaks Taken</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{wtdAnalysis.requiredBreaks.toFixed(1)}h</div>
              <p className="text-sm text-muted-foreground">Breaks Required</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {wtdAnalysis.breakCompliance ? (
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600 mx-auto" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">Compliance Status</p>
            </div>
          </div>
          {wtdAnalysis.breakWarnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Break Warnings:</h4>
              <ul className="text-sm text-yellow-700">
                {wtdAnalysis.breakWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="today">Today's Work</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="time-off">Time Off</TabsTrigger>
          <TabsTrigger value="weekly-rest">Weekly Rest</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {/* Current Session */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Current Session</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p>Loading current session...</p>
                </div>
              ) : todayEntry ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatTime(getCurrentSessionTime())}
                      </div>
                      <p className="text-sm text-muted-foreground">Current Session</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {todayEntry.total_hours ? formatTime(todayEntry.total_hours * 60) : '00:00'}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Today</p>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    {todayEntry.status === 'active' ? (
                      <>
                        <Button 
                          onClick={() => setSignOffDialogOpen(true)}
                          disabled={clockOutMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          {clockOutMutation.isPending ? 'Signing Off...' : 'Sign Off Work'}
                        </Button>
                        
                        {todayEntry.break_start_time && !todayEntry.break_end_time ? (
                          <Button 
                            onClick={handleEndBreak}
                            disabled={endBreakMutation.isPending}
                            variant="outline"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {endBreakMutation.isPending ? 'Ending Break...' : 'End Break'}
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleStartBreak}
                            disabled={startBreakMutation.isPending}
                            variant="outline"
                          >
                            <Coffee className="w-4 h-4 mr-2" />
                            {startBreakMutation.isPending ? 'Starting Break...' : 'Start Break'}
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <span className="text-lg font-medium text-green-600">Successfully Signed Off</span>
                        </div>
                        <p className="text-muted-foreground">
                          You have completed your work day. Have a good rest!
                        </p>
                      </div>
                    )}
                  </div>

                  {todayEntry.status === 'active' && (
                    <div className="text-center">
                      <Badge variant={todayEntry.break_start_time && !todayEntry.break_end_time ? "secondary" : "default"}>
                        {todayEntry.break_start_time && !todayEntry.break_end_time ? 'On Break' : 'Working'}
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">You are off duty</h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Clock In" to start your work day
                  </p>
                  <Button 
                    onClick={handleClockIn}
                    disabled={clockInMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {clockInMutation.isPending ? 'Clocking In...' : 'Clock In'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Entry History</CardTitle>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p>Loading time entries...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Break Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.entry_date ? format(parseISO(entry.entry_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                        <TableCell>
                          {entry.clock_in_time ? entry.clock_in_time : '-'}
                        </TableCell>
                        <TableCell>
                          {entry.clock_out_time ? entry.clock_out_time : '-'}
                        </TableCell>
                        <TableCell>{entry.total_hours?.toFixed(2) || '0.00'}h</TableCell>
                        <TableCell>{entry.break_hours?.toFixed(2) || '0.00'}h</TableCell>
                        <TableCell>
                          <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'}>
                            {entry.status === 'completed' ? 'Signed Off' : entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-off" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Time Off Requests</CardTitle>
                <Button onClick={() => setTimeOffDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Request Time Off
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeOffRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="capitalize">{request.request_type.replace('_', ' ')}</TableCell>
                      <TableCell>{format(parseISO(request.start_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(parseISO(request.end_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'default' : 
                            request.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">
                  This period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overtime</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOvertime.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">
                  Extra hours worked
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Break Time</CardTitle>
                <Coffee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBreaks.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">
                  Total breaks taken
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average/Day</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageHoursPerDay.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">
                  Daily average
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly-rest" className="space-y-4">
          {/* Weekly Rest Compliance Overview */}
          {weeklyRestAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Moon className="w-5 h-5" />
                  <span>Weekly Rest Compliance</span>
                  <Badge variant={weeklyRestAnalysis.restCompliance ? "default" : "destructive"}>
                    {weeklyRestAnalysis.restCompliance ? "Compliant" : "Non-Compliant"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{weeklyRestAnalysis.actualRestHours.toFixed(1)}h</div>
                      <p className="text-sm text-muted-foreground">Actual Rest</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{weeklyRestAnalysis.requiredWeeklyRest}h</div>
                      <p className="text-sm text-muted-foreground">Required Rest</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{weeklyRestAnalysis.totalWorkHours.toFixed(1)}h</div>
                      <p className="text-sm text-muted-foreground">Work Hours</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rest Type:</span>
                      <Badge variant="outline" className="capitalize">
                        {weeklyRestAnalysis.restType.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {weeklyRestAnalysis.compensationRequired && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Compensation Required:</span>
                        <Badge variant="destructive">Yes</Badge>
                      </div>
                    )}
                    
                    {weeklyRestAnalysis.compensationDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Compensation Date:</span>
                        <span className="text-sm text-muted-foreground">
                          {format(weeklyRestAnalysis.compensationDate, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Warnings and Violations */}
                  {weeklyRestAnalysis.violations.length > 0 && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Violations:</strong> {weeklyRestAnalysis.violations.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  {weeklyRestAnalysis.warnings.length > 0 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <strong>Warnings:</strong> {weeklyRestAnalysis.warnings.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => autoRecordWeeklyRest.mutate(selectedDate || new Date())}
                      disabled={autoRecordWeeklyRest.isPending}
                      className="flex-1"
                    >
                      {autoRecordWeeklyRest.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Recording...
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 mr-2" />
                          Record Weekly Rest
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly Rest Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5" />
                <span>Weekly Rest History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyRestRecords.length > 0 ? (
                <div className="space-y-4">
                  {weeklyRestRecords.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            Week of {format(new Date(record.week_start_date), 'MMM dd, yyyy')}
                          </span>
                          <Badge variant="outline" className="capitalize">
                            {record.rest_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.total_rest_hours}h rest
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Period:</span>
                          <div>
                            {format(new Date(record.week_start_date), 'MMM dd')} - {format(new Date(record.week_end_date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Compensation:</span>
                          <div>
                            {record.compensation_required ? (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            ) : (
                              <Badge variant="default" className="text-xs">Not Required</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {record.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Notes:</span> {record.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Moon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No weekly rest records found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click "Record Weekly Rest" to create your first rest record
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* WTD Weekly Rest Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>WTD Weekly Rest Requirements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Full Weekly Rest</h4>
                    <div className="text-2xl font-bold text-green-600">{WTD_WEEKLY_REST.FULL_WEEKLY_REST}h</div>
                    <p className="text-sm text-muted-foreground">Minimum uninterrupted rest</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Reduced Weekly Rest</h4>
                    <div className="text-2xl font-bold text-orange-600">{WTD_WEEKLY_REST.REDUCED_WEEKLY_REST}h</div>
                    <p className="text-sm text-muted-foreground">Once per week maximum</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Weekly rest must be taken every 6 x 24-hour periods</li>
                    <li>• Reduced rest requires compensation within 3 weeks</li>
                    <li>• Rest periods must be uninterrupted</li>
                    <li>• Compliance is monitored automatically</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sign Off Confirmation Dialog */}
      <Dialog open={signOffDialogOpen} onOpenChange={setSignOffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <LogOut className="w-5 h-5 text-red-600" />
              <span>Sign Off Work</span>
            </DialogTitle>
            <DialogDescription>
              You are about to sign off work for the day. This action will record your end time and complete your work session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Timer className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Session Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Current Session:</span>
                  <div className="font-semibold text-blue-900">{formatTime(getCurrentSessionTime())}</div>
                </div>
                <div>
                  <span className="text-blue-700">Total Today:</span>
                  <div className="font-semibold text-blue-900">
                    {todayEntry?.total_hours ? formatTime(todayEntry.total_hours * 60) : '00:00'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sign-off-reason">End of Day Notes (Optional)</Label>
              <Textarea
                id="sign-off-reason"
                placeholder="Any notes about your work day, issues encountered, or important information..."
                value={signOffReason}
                onChange={(e) => setSignOffReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignOffDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleClockOut}
              disabled={clockOutMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {clockOutMutation.isPending ? 'Signing Off...' : 'Confirm Sign Off'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Off Request Dialog */}
      <Dialog open={timeOffDialogOpen} onOpenChange={setTimeOffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Time Off</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={timeOffForm.start_date}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={timeOffForm.end_date}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-type">Request Type</Label>
              <Select 
                value={timeOffForm.request_type} 
                onValueChange={(value) => setTimeOffForm({ ...timeOffForm, request_type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual_leave">Annual Leave</SelectItem>
                  <SelectItem value="sick_leave">Sick Leave</SelectItem>
                  <SelectItem value="personal_leave">Personal Leave</SelectItem>
                  <SelectItem value="bereavement">Bereavement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for your time off request..."
                value={timeOffForm.reason}
                onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={timeOffForm.notes}
                onChange={(e) => setTimeOffForm({ ...timeOffForm, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setTimeOffDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleTimeOffSubmit}
                disabled={createTimeOffMutation.isPending}
              >
                {createTimeOffMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="time-tracking" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={workStatus === 'on_duty' ? () => setSignOffDialogOpen(true) : handleClockIn}
                    disabled={clockInMutation.isPending || clockOutMutation.isPending}
                    variant={workStatus === 'on_duty' ? "destructive" : "default"}
                    className="h-12"
                  >
                    {clockInMutation.isPending || clockOutMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : workStatus === 'on_duty' ? (
                      <LogOut className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="ml-2">
                      {workStatus === 'on_duty' ? "Clock Out" : "Clock In"}
                    </span>
                  </Button>

                  <Button
                    onClick={workStatus === 'on_break' ? handleEndBreak : handleStartBreak}
                    disabled={workStatus !== 'on_duty' || startBreakMutation.isPending || endBreakMutation.isPending}
                    variant="outline"
                    className="h-12"
                  >
                    {startBreakMutation.isPending || endBreakMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : workStatus === 'on_break' ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <Coffee className="w-4 h-4" />
                    )}
                    <span className="ml-2">
                      {workStatus === 'on_break' ? "End Break" : "Start Break"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Session */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="w-5 h-5" />
                  <span>Current Session</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workStatus === 'on_duty' && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {formatTime(getCurrentSessionTime())}
                    </div>
                    <p className="text-sm text-muted-foreground">Current Session Time</p>
                  </div>
                )}
                {workStatus !== 'on_duty' && (
                  <div className="text-center text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <p>Not currently working</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Time Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Recent Time Entries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No time entries found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.slice(0, 10).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{format(parseISO(entry.entry_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{entry.clock_in_time}</TableCell>
                        <TableCell>{entry.clock_out_time || 'Active'}</TableCell>
                        <TableCell>{entry.total_hours?.toFixed(1) || '0.0'}h</TableCell>
                        <TableCell>
                          <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WTD Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Compliance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>WTD Compliance Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {complianceStatus.status === 'compliant' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={cn("font-medium", complianceStatus.color)}>
                      {complianceStatus.status === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Daily Working Time</span>
                        <span>{wtdAnalysis.dailyWorkingTime.toFixed(1)}h / {WTD_LIMITS.MAX_DAILY_WORKING_TIME}h</span>
                      </div>
                      <Progress 
                        value={(wtdAnalysis.dailyWorkingTime / WTD_LIMITS.MAX_DAILY_WORKING_TIME) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Weekly Working Time</span>
                        <span>{wtdAnalysis.weeklyWorkingTime.toFixed(1)}h / {WTD_LIMITS.MAX_WEEKLY_WORKING_TIME}h</span>
                      </div>
                      <Progress 
                        value={(wtdAnalysis.weeklyWorkingTime / WTD_LIMITS.MAX_WEEKLY_WORKING_TIME) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warnings and Violations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Warnings & Violations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wtdAnalysis.criticalViolations.length === 0 && wtdAnalysis.warnings.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">No violations or warnings</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wtdAnalysis.criticalViolations.map((violation, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>{violation}</AlertDescription>
                      </Alert>
                    ))}
                    {wtdAnalysis.warnings.map((warning, index) => (
                      <Alert key={index}>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>{warning}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Time Off Tab */}
        <TabsContent value="time-off" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Time Off Management</h2>
            <Button onClick={() => setTimeOffDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Request Time Off
            </Button>
          </div>

          {/* Current Time Off */}
          {currentTimeOff.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="w-5 h-5" />
                  <span>Current Time Off</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentTimeOff.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">{request.request_type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(request.start_date), 'MMM dd')} - {format(parseISO(request.end_date), 'MMM dd')}
                        </p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Off Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Time Off Requests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeOffRequests.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No time off requests found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeOffRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="capitalize">{request.request_type.replace('_', ' ')}</TableCell>
                        <TableCell>{format(parseISO(request.start_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(parseISO(request.end_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}