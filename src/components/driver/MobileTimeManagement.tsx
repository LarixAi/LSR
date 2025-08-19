import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Play, 
  Square, 
  Coffee, 
  CalendarDays, 
  AlertTriangle,
  CheckCircle,
  Plus,
  RefreshCw,
  Shield,
  Info,
  LogOut
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
import MobileOptimizedLayout from '@/components/mobile/MobileOptimizedLayout';

export default function MobileTimeManagement() {
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

  // Calculate current session time
  const getCurrentSessionTime = () => {
    if (!(todayEntry as any)?.clock_in_time) return 0;
    
    if ((todayEntry as any).status === 'completed') return 0;
    
    const today = new Date();
    const [hours, minutes, seconds] = (todayEntry as any).clock_in_time.split(':').map(Number);
    const clockInTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds);
    const now = new Date();
    const totalMinutes = differenceInMinutes(now, clockInTime);
    
    if ((todayEntry as any).break_start_time && !(todayEntry as any).break_end_time) {
      const [breakHours, breakMinutesFromTime, breakSeconds] = (todayEntry as any).break_start_time.split(':').map(Number);
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
      
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      try {
        await autoRecordRest.mutateAsync({
          startDate: weekStart,
          endDate: weekEnd
        });
      } catch (restError) {
        console.error('Error auto-recording rest days:', restError);
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

  const handleCreateTimeOff = async () => {
    try {
      await createTimeOffMutation.mutateAsync(timeOffForm);
      setTimeOffForm({
        start_date: '',
        end_date: '',
        request_type: 'annual_leave',
        reason: '',
        notes: ''
      });
      setTimeOffDialogOpen(false);
    } catch (error) {
      console.error('Create time off error:', error);
    }
  };

  const handleAutoRecordWeeklyRest = async () => {
    try {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      await autoRecordWeeklyRest.mutateAsync({
        startDate: weekStart,
        endDate: weekEnd
      });
    } catch (error) {
      console.error('Auto record weekly rest error:', error);
    }
  };

  if (todayLoading || entriesLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-lg">Loading time management...</p>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  // Handle case where there's no data or user not authenticated
  const hasAnyData = timeEntries.length > 0 || timeOffRequests.length > 0;
  const isAuthenticated = true; // We'll assume authenticated for now, but could check session

  if (!hasAnyData) {
    return (
      <MobileOptimizedLayout>
        <div className="space-y-4 p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Time Management</h1>
              <p className="text-sm text-muted-foreground">
                Track your work hours and breaks
              </p>
            </div>
          </div>

          {/* Empty State */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your time management is currently empty. This could be because:
                </p>
                <div className="text-left space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>You haven't clocked in yet today</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>No time entries have been recorded</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>No time off requests submitted</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start Actions */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Get Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={handleClockIn}
                  disabled={clockInMutation.isPending}
                  className="w-full h-12"
                >
                  {clockInMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {clockInMutation.isPending ? 'Clocking In...' : 'Clock In to Start'}
                </Button>
                
                <Button
                  onClick={() => setTimeOffDialogOpen(true)}
                  variant="outline"
                  className="w-full h-12"
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Request Time Off
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Info className="w-5 h-5" />
                <span>About Time Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Clock In/Out</p>
                    <p>Track your work hours with GPS location</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Coffee className="w-4 h-4 mt-0.5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Break Management</p>
                    <p>Record breaks to comply with WTD regulations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 mt-0.5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">WTD Compliance</p>
                    <p>Monitor your working time directive compliance</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Off Request Dialog */}
          <Dialog open={timeOffDialogOpen} onOpenChange={setTimeOffDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Time Off</DialogTitle>
                <DialogDescription>
                  Submit a request for time off.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={timeOffForm.start_date}
                      onChange={(e) => setTimeOffForm({ ...timeOffForm, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={timeOffForm.end_date}
                      onChange={(e) => setTimeOffForm({ ...timeOffForm, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="requestType">Request Type</Label>
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
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={timeOffForm.reason}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                    placeholder="Enter reason for time off request..."
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={timeOffForm.notes}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTimeOffDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTimeOff} disabled={createTimeOffMutation.isPending}>
                  {createTimeOffMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </MobileOptimizedLayout>
    );
  }

  const currentSessionTime = getCurrentSessionTime();
  const isClockedIn = (todayEntry as any)?.clock_in_time && (todayEntry as any).status !== 'completed';
  const isOnBreak = (todayEntry as any)?.break_start_time && !(todayEntry as any)?.break_end_time;

  return (
    <MobileOptimizedLayout>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Time Management</h1>
            <p className="text-sm text-muted-foreground">
              Track your work hours and breaks
            </p>
          </div>
        </div>

        {/* Current Status Card */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Clock className="w-5 h-5" />
              <span>Current Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status Indicator */}
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-4 h-4 rounded-full",
                  isClockedIn ? "bg-green-500" : "bg-gray-400"
                )} />
                <span className="font-medium">
                  {isClockedIn ? "Clocked In" : "Not Clocked In"}
                </span>
              </div>

              {/* Current Session Time */}
              {isClockedIn && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {formatTime(currentSessionTime)}
                  </div>
                  <p className="text-sm text-muted-foreground">Current Session</p>
                </div>
              )}

              {/* Break Status */}
              {isOnBreak && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Coffee className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">On Break</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {/* Clock In/Out Button */}
              <Button
                onClick={isClockedIn ? () => setSignOffDialogOpen(true) : handleClockIn}
                disabled={clockInMutation.isPending || clockOutMutation.isPending}
                variant={isClockedIn ? "destructive" : "default"}
                className="h-12"
              >
                {clockInMutation.isPending || clockOutMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isClockedIn ? (
                  <LogOut className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span className="ml-2">
                  {isClockedIn ? "Clock Out" : "Clock In"}
                </span>
              </Button>

              {/* Break Button */}
              <Button
                onClick={isOnBreak ? handleEndBreak : handleStartBreak}
                disabled={!isClockedIn || startBreakMutation.isPending || endBreakMutation.isPending}
                variant="outline"
                className="h-12"
              >
                {startBreakMutation.isPending || endBreakMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isOnBreak ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Coffee className="w-4 h-4" />
                )}
                <span className="ml-2">
                  {isOnBreak ? "End Break" : "Start Break"}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WTD Compliance */}
        {wtdAnalysis && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Shield className="w-5 h-5" />
                <span>WTD Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Daily Working Time */}
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

                {/* Weekly Working Time */}
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

                {/* Compliance Status */}
                <div className="flex items-center space-x-2">
                  {wtdAnalysis.overallCompliance ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    wtdAnalysis.overallCompliance ? "text-green-600" : "text-red-600"
                  )}>
                    {wtdAnalysis.overallCompliance ? "Compliant" : "Non-Compliant"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Off Requests */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Time Off Requests</CardTitle>
              <Button
                onClick={() => setTimeOffDialogOpen(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-1" />
                Request
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {timeOffRequests.length === 0 ? (
              <div className="text-center py-4">
                <CalendarDays className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No time off requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(timeOffRequests as any[]).slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{(request as any).request_type.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-600">
                        {format(parseISO((request as any).start_date), 'MMM dd')} - {format(parseISO((request as any).end_date), 'MMM dd')}
                      </p>
                    </div>
                    <Badge variant={
                      (request as any).status === 'approved' ? 'default' :
                      (request as any).status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {(request as any).status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Time Entries */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {timeEntries.length === 0 ? (
              <div className="text-center py-4">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No time entries</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(timeEntries as any[]).slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {format(parseISO((entry as any).entry_date), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {(entry as any).clock_in_time} - {(entry as any).clock_out_time || 'Active'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {(entry as any).total_hours?.toFixed(1) || '0.0'}h
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {(entry as any).status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clock Out Dialog */}
        <Dialog open={signOffDialogOpen} onOpenChange={setSignOffDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign Off</DialogTitle>
              <DialogDescription>
                Please provide a reason for signing off early.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="signOffReason">Reason</Label>
                <Textarea
                  id="signOffReason"
                  value={signOffReason}
                  onChange={(e) => setSignOffReason(e.target.value)}
                  placeholder="Enter reason for early sign off..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSignOffDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleClockOut} disabled={clockOutMutation.isPending}>
                {clockOutMutation.isPending ? 'Signing Off...' : 'Sign Off'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Time Off Request Dialog */}
        <Dialog open={timeOffDialogOpen} onOpenChange={setTimeOffDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
              <DialogDescription>
                Submit a request for time off.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={timeOffForm.start_date}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={timeOffForm.end_date}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="requestType">Request Type</Label>
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
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={timeOffForm.reason}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                  placeholder="Enter reason for time off request..."
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={timeOffForm.notes}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTimeOffDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTimeOff} disabled={createTimeOffMutation.isPending}>
                {createTimeOffMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MobileOptimizedLayout>
  );
}
