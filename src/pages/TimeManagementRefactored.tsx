import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PageLayout from "@/components/layout/PageLayout";
import { 
  Clock, 
  Calendar as CalendarIcon,
  Search, 
  Filter, 
  Download, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  BarChart3,
  CalendarDays,
  UserCheck,
  UserX,
  Clock4,
  FileText,
  Plus,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface TimeEntry {
  id: string;
  driver_id: string;
  driver_name: string;
  organization_id: string;
  entry_date: string;
  clock_in_time?: string;
  clock_out_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  total_hours: number;
  overtime_hours: number;
  break_hours: number;
  driving_hours: number;
  status: string;
  entry_type: string;
  location_clock_in?: string;
  location_clock_out?: string;
  notes?: string;
  created_at: string;
}

interface TimeOffRequest {
  id: string;
  driver_id: string;
  driver_name: string;
  organization_id: string;
  start_date: string;
  end_date: string;
  request_type: string;
  reason: string;
  total_days: number;
  status: string;
  notes?: string;
  review_notes?: string;
  requested_at: string;
}

interface DriverShiftPattern {
  id: string;
  driver_id: string;
  driver_name: string;
  organization_id: string;
  pattern_name: string;
  monday_start?: string;
  monday_end?: string;
  tuesday_start?: string;
  tuesday_end?: string;
  wednesday_start?: string;
  wednesday_end?: string;
  thursday_start?: string;
  thursday_end?: string;
  friday_start?: string;
  friday_end?: string;
  saturday_start?: string;
  saturday_end?: string;
  sunday_start?: string;
  sunday_end?: string;
  is_active: boolean;
}

interface TimeStats {
  totalDrivers: number;
  activeDrivers: number;
  totalHours: number;
  overtimeHours: number;
  averageHoursPerDriver: number;
  complianceRate: number;
  pendingTimeOffRequests: number;
  approvedTimeOffRequests: number;
}

export default function TimeManagement() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('time-logs');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  // Fetch all time entries for the organization
  const { data: timeEntries = [], isLoading: timeEntriesLoading } = useQuery({
    queryKey: ['admin-time-entries', profile?.organization_id, dateRange],
    queryFn: async (): Promise<TimeEntry[]> => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID found');
      }

      let query = supabase
        .from('time_entries')
        .select(`
          *,
          profiles!time_entries_driver_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('entry_date', { ascending: false });

      if (dateRange.from) {
        query = query.gte('entry_date', format(dateRange.from, 'yyyy-MM-dd'));
      }
      if (dateRange.to) {
        query = query.lte('entry_date', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(entry => ({
        ...entry,
        driver_name: `${entry.profiles?.first_name || ''} ${entry.profiles?.last_name || ''}`.trim() || `Driver ${entry.driver_id?.slice(0, 8) || 'Unknown'}`
      }));
    },
    enabled: !!profile?.organization_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch time off requests
  const { data: timeOffRequests = [], isLoading: timeOffLoading } = useQuery({
    queryKey: ['time-off-requests', profile?.organization_id],
    queryFn: async (): Promise<TimeOffRequest[]> => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('time_off_requests')
        .select(`
          *,
          profiles!time_off_requests_driver_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('requested_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(request => ({
        ...request,
        driver_name: `${request.profiles?.first_name || ''} ${request.profiles?.last_name || ''}`.trim() || `Driver ${request.driver_id?.slice(0, 8) || 'Unknown'}`
      }));
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch driver shift patterns
  const { data: shiftPatterns = [], isLoading: shiftPatternsLoading } = useQuery({
    queryKey: ['driver-shift-patterns', profile?.organization_id],
    queryFn: async (): Promise<DriverShiftPattern[]> => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('driver_shift_patterns')
        .select(`
          *,
          profiles!driver_shift_patterns_driver_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(pattern => ({
        ...pattern,
        driver_name: `${pattern.profiles?.first_name || ''} ${pattern.profiles?.last_name || ''}`.trim() || `Driver ${pattern.driver_id?.slice(0, 8) || 'Unknown'}`
      }));
    },
    enabled: !!profile?.organization_id,
  });

  // Calculate statistics
  const stats: TimeStats = {
    totalDrivers: 0,
    activeDrivers: 0,
    totalHours: 0,
    overtimeHours: 0,
    averageHoursPerDriver: 0,
    complianceRate: 100,
    pendingTimeOffRequests: 0,
    approvedTimeOffRequests: 0
  };

  if (timeEntries.length > 0) {
    const uniqueDrivers = new Set(timeEntries.map(entry => entry.driver_id));
    const activeEntries = timeEntries.filter(entry => entry.status === 'active');
    const activeDrivers = new Set(activeEntries.map(entry => entry.driver_id));
    
    stats.totalDrivers = uniqueDrivers.size;
    stats.activeDrivers = activeDrivers.size;
    stats.totalHours = timeEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
    stats.overtimeHours = timeEntries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);
    stats.averageHoursPerDriver = stats.totalDrivers > 0 ? stats.totalHours / stats.totalDrivers : 0;
    
    // Calculate compliance rate (hours within legal limits)
    const compliantEntries = timeEntries.filter(entry => (entry.total_hours || 0) <= 11); // UK driving limit
    stats.complianceRate = timeEntries.length > 0 ? (compliantEntries.length / timeEntries.length) * 100 : 100;
  }

  if (timeOffRequests.length > 0) {
    stats.pendingTimeOffRequests = timeOffRequests.filter(req => req.status === 'pending').length;
    stats.approvedTimeOffRequests = timeOffRequests.filter(req => req.status === 'approved').length;
  }

  // Filter entries based on search and filters
  const filteredTimeEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.driver_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesDriver = driverFilter === 'all' || entry.driver_id === driverFilter;
    return matchesSearch && matchesStatus && matchesDriver;
  });

  const filteredTimeOffRequests = timeOffRequests.filter(request => {
    const matchesSearch = request.driver_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get unique drivers for filter
  const uniqueDrivers = Array.from(new Set(timeEntries.map(entry => entry.driver_id)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getComplianceStatus = (hours: number) => {
    if (hours <= 9) return { status: 'good', icon: <CheckCircle className="w-4 h-4 text-green-600" /> };
    if (hours <= 11) return { status: 'warning', icon: <AlertTriangle className="w-4 h-4 text-yellow-600" /> };
    return { status: 'violation', icon: <XCircle className="w-4 h-4 text-red-600" /> };
  };

  const getRequestTypeBadge = (type: string) => {
    switch (type) {
      case 'annual_leave':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Annual Leave</Badge>;
      case 'sick_leave':
        return <Badge variant="destructive">Sick Leave</Badge>;
      case 'personal_leave':
        return <Badge variant="outline" className="text-purple-600">Personal Leave</Badge>;
      case 'bereavement':
        return <Badge variant="secondary">Bereavement</Badge>;
      default:
        return <Badge variant="outline">{type.replace('_', ' ')}</Badge>;
    }
  };

  // Approve/Reject time off request mutations
  const approveTimeOffMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('time_off_requests')
        .update({ 
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast.success('Time off request approved');
    },
    onError: (error: any) => {
      toast.error('Failed to approve request: ' + error.message);
    }
  });

  const rejectTimeOffMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('time_off_requests')
        .update({ 
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast.success('Time off request rejected');
    },
    onError: (error: any) => {
      toast.error('Failed to reject request: ' + error.message);
    }
  });

  const exportToCSV = () => {
    const headers = ['Driver', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Overtime', 'Break Time', 'Status', 'Location'];
    const csvData = filteredTimeEntries.map(entry => [
      entry.driver_name,
      format(parseISO(entry.entry_date), 'MMM dd, yyyy'),
      entry.clock_in_time || '',
      entry.clock_out_time || '',
      entry.total_hours.toFixed(1),
      entry.overtime_hours.toFixed(1),
      entry.break_hours.toFixed(1),
      entry.status,
      entry.location_clock_in || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-entries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (timeEntriesLoading || timeOffLoading || shiftPatternsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading time management data...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Time Management Admin"
      description="Monitor and manage driver time entries, time-off requests, and work schedules"
      actionButton={{
        label: "Export CSV",
        onClick: exportToCSV,
        icon: <Download className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Total Drivers",
          value: stats.totalDrivers,
          icon: <Users className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "Active Drivers",
          value: stats.activeDrivers,
          icon: <UserCheck className="h-4 w-4" />,
          color: "text-green-600"
        },
        {
          title: "Total Hours",
          value: `${stats.totalHours.toFixed(1)}h`,
          icon: <Clock4 className="h-4 w-4" />,
          color: "text-purple-600"
        },
        {
          title: "Compliance Rate",
          value: `${stats.complianceRate.toFixed(1)}%`,
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-green-600"
        }
      ]}
      searchPlaceholder="Search by driver name..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "All Statuses",
          value: statusFilter,
          options: [
            { value: "all", label: "All Statuses" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" }
          ],
          onChange: setStatusFilter
        }
      ]}
      tabs={[
        { value: "time-logs", label: "Time Logs" },
        { 
          value: "time-off", 
          label: "Time Off Requests",
          badge: stats.pendingTimeOffRequests
        },
        { value: "schedules", label: "Work Schedules" },
        { value: "compliance", label: "Compliance" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={timeEntriesLoading || timeOffLoading || shiftPatternsLoading}
    >

      {/* Content based on active tab */}
      {activeTab === 'time-logs' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Driver Time Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Break</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Compliance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimeEntries.map((entry) => {
                  const compliance = getComplianceStatus(entry.total_hours);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.driver_name}</TableCell>
                      <TableCell>{format(parseISO(entry.entry_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{entry.clock_in_time || '-'}</TableCell>
                      <TableCell>{entry.clock_out_time || '-'}</TableCell>
                      <TableCell>{entry.total_hours.toFixed(1)}h</TableCell>
                      <TableCell>{entry.overtime_hours.toFixed(1)}h</TableCell>
                      <TableCell>{entry.break_hours.toFixed(1)}h</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>{compliance.icon}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'time-off' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Time Off Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimeOffRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.driver_name}</TableCell>
                    <TableCell>{getRequestTypeBadge(request.request_type)}</TableCell>
                    <TableCell>{format(parseISO(request.start_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(parseISO(request.end_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{request.total_days} days</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveTimeOffMutation.mutate(request.id)}
                            disabled={approveTimeOffMutation.isPending}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectTimeOffMutation.mutate(request.id)}
                            disabled={rejectTimeOffMutation.isPending}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'schedules' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Driver Work Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Pattern Name</TableHead>
                  <TableHead>Monday</TableHead>
                  <TableHead>Tuesday</TableHead>
                  <TableHead>Wednesday</TableHead>
                  <TableHead>Thursday</TableHead>
                  <TableHead>Friday</TableHead>
                  <TableHead>Weekend</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shiftPatterns.map((pattern) => (
                  <TableRow key={pattern.id}>
                    <TableCell className="font-medium">{pattern.driver_name}</TableCell>
                    <TableCell>{pattern.pattern_name}</TableCell>
                    <TableCell>
                      {pattern.monday_start && pattern.monday_end ? (
                        `${pattern.monday_start} - ${pattern.monday_end}`
                      ) : 'Off'}
                    </TableCell>
                    <TableCell>
                      {pattern.tuesday_start && pattern.tuesday_end ? (
                        `${pattern.tuesday_start} - ${pattern.tuesday_end}`
                      ) : 'Off'}
                    </TableCell>
                    <TableCell>
                      {pattern.wednesday_start && pattern.wednesday_end ? (
                        `${pattern.wednesday_start} - ${pattern.wednesday_end}`
                      ) : 'Off'}
                    </TableCell>
                    <TableCell>
                      {pattern.thursday_start && pattern.thursday_end ? (
                        `${pattern.thursday_start} - ${pattern.thursday_end}`
                      ) : 'Off'}
                    </TableCell>
                    <TableCell>
                      {pattern.friday_start && pattern.friday_end ? (
                        `${pattern.friday_start} - ${pattern.friday_end}`
                      ) : 'Off'}
                    </TableCell>
                    <TableCell>
                      {pattern.saturday_start && pattern.saturday_end ? (
                        `${pattern.saturday_start} - ${pattern.saturday_end}`
                      ) : 'Off'}
                    </TableCell>
                    <TableCell>
                      {pattern.is_active ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'compliance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Compliance Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                    <p className="text-3xl font-bold text-green-600">{stats.complianceRate.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.overtimeHours.toFixed(1)}h</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Average Hours/Driver</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.averageHoursPerDriver.toFixed(1)}h</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Driving Hours</TableHead>
                  <TableHead>Break Hours</TableHead>
                  <TableHead>Compliance Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimeEntries.map((entry) => {
                  const compliance = getComplianceStatus(entry.total_hours);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.driver_name}</TableCell>
                      <TableCell>{format(parseISO(entry.entry_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{entry.total_hours.toFixed(1)}h</TableCell>
                      <TableCell>{entry.driving_hours.toFixed(1)}h</TableCell>
                      <TableCell>{entry.break_hours.toFixed(1)}h</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {compliance.icon}
                          <span className={cn(
                            "text-sm font-medium",
                            compliance.status === 'good' && "text-green-600",
                            compliance.status === 'warning' && "text-yellow-600",
                            compliance.status === 'violation' && "text-red-600"
                          )}>
                            {compliance.status === 'good' && 'Compliant'}
                            {compliance.status === 'warning' && 'Warning'}
                            {compliance.status === 'violation' && 'Violation'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{entry.notes || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}