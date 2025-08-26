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

// Import the new tab components
import { TimeOverviewTab } from '@/components/time/TimeOverviewTab';

export default function TimeManagementRefactored() {
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

  // Event handlers
  const handleClockIn = async () => {
    try {
      await clockInMutation.mutateAsync();
    } catch (error) {
      console.error('Error clocking in:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync();
    } catch (error) {
      console.error('Error clocking out:', error);
    }
  };

  const handleStartBreak = async () => {
    try {
      await startBreakMutation.mutateAsync();
    } catch (error) {
      console.error('Error starting break:', error);
    }
  };

  const handleEndBreak = async () => {
    try {
      await endBreakMutation.mutateAsync();
    } catch (error) {
      console.error('Error ending break:', error);
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
      console.error('Error creating time off request:', error);
    }
  };

  // Loading and auth checks
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading time management...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Use mobile component if on mobile
  if (isMobile) {
    return <MobileTimeManagement />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Clock className="w-8 h-8 text-blue-600" />
            Time Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Track work hours, manage breaks, and ensure WTD compliance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setTimeOffDialogOpen(true)}>
            <CalendarDays className="w-4 h-4 mr-2" />
            Request Time Off
          </Button>
          <Button variant="outline" onClick={() => setSignOffDialogOpen(true)}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Off
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="compliance">WTD Compliance</TabsTrigger>
          <TabsTrigger value="time-off">Time Off</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TimeOverviewTab 
            todayEntry={todayEntry}
            timeStats={stats}
            wtdCompliance={wtdAnalysis}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onStartBreak={handleStartBreak}
            onEndBreak={handleEndBreak}
            isLoading={todayLoading}
          />
        </TabsContent>

        <TabsContent value="time-tracking" className="space-y-6">
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Time tracking management will be implemented</p>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">WTD compliance management will be implemented</p>
          </div>
        </TabsContent>

        <TabsContent value="time-off" className="space-y-6">
          <div className="text-center py-8">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Time off management will be implemented</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Time Off Request Dialog */}
      <Dialog open={timeOffDialogOpen} onOpenChange={setTimeOffDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Time Off</DialogTitle>
            <DialogDescription>
              Submit a request for time off
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Time off request form will be implemented</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Off Dialog */}
      <Dialog open={signOffDialogOpen} onOpenChange={setSignOffDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Off</DialogTitle>
            <DialogDescription>
              Sign off for the day
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <LogOut className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Sign off form will be implemented</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
