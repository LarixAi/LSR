import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface TimeEntry {
  id: string;
  driver_id: string;
  clock_in: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  total_work_time?: number;
  total_break_time?: number;
  status: 'active' | 'completed' | 'break';
  created_at: string;
  updated_at: string;
}

interface TimeStats {
  totalWorkTime: number;
  totalBreakTime: number;
  averageWorkTime: number;
  totalDays: number;
  complianceRate: number;
}

interface WTDCompliance {
  dailyDriving: number;
  weeklyDriving: number;
  dailyRest: number;
  weeklyRest: number;
  isCompliant: boolean;
  warnings: string[];
}

interface TimeOverviewTabProps {
  todayEntry: TimeEntry | null;
  timeStats: TimeStats;
  wtdCompliance: WTDCompliance;
  onClockIn: () => void;
  onClockOut: () => void;
  onStartBreak: () => void;
  onEndBreak: () => void;
  isLoading: boolean;
}

export const TimeOverviewTab: React.FC<TimeOverviewTabProps> = ({
  todayEntry,
  timeStats,
  wtdCompliance,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
  isLoading
}) => {
  const getCurrentSessionTime = () => {
    if (!todayEntry || !todayEntry.clock_in) return 0;
    
    const clockInTime = parseISO(todayEntry.clock_in);
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, clockInTime);
    
    return Math.max(0, diffInMinutes);
  };

  const getCurrentBreakTime = () => {
    if (!todayEntry || !todayEntry.break_start) return 0;
    
    const breakStart = parseISO(todayEntry.break_start);
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, breakStart);
    
    return Math.max(0, diffInMinutes);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getWorkStatus = () => {
    if (!todayEntry) return 'not_started';
    if (todayEntry.status === 'break') return 'on_break';
    if (todayEntry.status === 'active') return 'working';
    return 'completed';
  };

  const workStatus = getWorkStatus();

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {workStatus === 'working' && <Play className="w-6 h-6 text-green-600 animate-pulse" />}
              {workStatus === 'on_break' && <Coffee className="w-6 h-6 text-orange-600" />}
              {workStatus === 'completed' && <CheckCircle className="w-6 h-6 text-blue-600" />}
              {workStatus === 'not_started' && <Timer className="w-6 h-6 text-gray-600" />}
              
              <div>
                <p className="text-lg font-semibold">
                  {workStatus === 'working' && 'Currently Working'}
                  {workStatus === 'on_break' && 'On Break'}
                  {workStatus === 'completed' && 'Work Completed'}
                  {workStatus === 'not_started' && 'Not Started'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {todayEntry?.clock_in && `Started at ${format(parseISO(todayEntry.clock_in), 'HH:mm')}`}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              {workStatus === 'working' && (
                <p className="text-2xl font-bold text-green-600">
                  {formatTime(getCurrentSessionTime())}
                </p>
              )}
              {workStatus === 'on_break' && (
                <p className="text-2xl font-bold text-orange-600">
                  {formatTime(getCurrentBreakTime())}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {workStatus === 'not_started' && (
              <Button onClick={onClockIn} className="flex-1" disabled={isLoading}>
                <Play className="w-4 h-4 mr-2" />
                Clock In
              </Button>
            )}
            
            {workStatus === 'working' && (
              <>
                <Button onClick={onStartBreak} variant="outline" className="flex-1" disabled={isLoading}>
                  <Coffee className="w-4 h-4 mr-2" />
                  Start Break
                </Button>
                <Button onClick={onClockOut} variant="destructive" className="flex-1" disabled={isLoading}>
                  <Square className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              </>
            )}
            
            {workStatus === 'on_break' && (
              <Button onClick={onEndBreak} className="flex-1" disabled={isLoading}>
                <Play className="w-4 h-4 mr-2" />
                End Break
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Work Time</p>
                <p className="text-2xl font-bold">{formatTime(timeStats.totalWorkTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Break Time</p>
                <p className="text-2xl font-bold">{formatTime(timeStats.totalBreakTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Average Daily</p>
                <p className="text-2xl font-bold">{formatTime(timeStats.averageWorkTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-2xl font-bold">{timeStats.complianceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WTD Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            WTD Compliance
            {wtdCompliance.isCompliant ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Daily Limits</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Driving Time:</span>
                  <span className="text-sm font-medium">{wtdCompliance.dailyDriving}/9h</span>
                </div>
                <Progress value={(wtdCompliance.dailyDriving / 9) * 100} className="h-2" />
                
                <div className="flex justify-between">
                  <span className="text-sm">Rest Period:</span>
                  <span className="text-sm font-medium">{wtdCompliance.dailyRest}/11h</span>
                </div>
                <Progress value={(wtdCompliance.dailyRest / 11) * 100} className="h-2" />
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Weekly Limits</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Driving Time:</span>
                  <span className="text-sm font-medium">{wtdCompliance.weeklyDriving}/56h</span>
                </div>
                <Progress value={(wtdCompliance.weeklyDriving / 56) * 100} className="h-2" />
                
                <div className="flex justify-between">
                  <span className="text-sm">Rest Period:</span>
                  <span className="text-sm font-medium">{wtdCompliance.weeklyRest}/45h</span>
                </div>
                <Progress value={(wtdCompliance.weeklyRest / 45) * 100} className="h-2" />
              </div>
            </div>
          </div>

          {wtdCompliance.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {wtdCompliance.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileText className="w-6 h-6" />
              <div className="text-center">
                <p className="font-medium">View History</p>
                <p className="text-sm text-muted-foreground">Past time entries</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <CalendarDays className="w-6 h-6" />
              <div className="text-center">
                <p className="font-medium">Time Off</p>
                <p className="text-sm text-muted-foreground">Request leave</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              <div className="text-center">
                <p className="font-medium">Reports</p>
                <p className="text-sm text-muted-foreground">Generate reports</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
