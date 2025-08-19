import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Clock, 
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
  CalendarDays
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface AdminTimeEntry {
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
  status: string;
  entry_type: string;
  location_clock_in?: string;
  location_clock_out?: string;
  created_at: string;
}

interface AdminTimeStats {
  totalDrivers: number;
  activeDrivers: number;
  totalHours: number;
  overtimeHours: number;
  averageHoursPerDriver: number;
  complianceRate: number;
}

export default function TimeManagementAdmin() {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  // Fetch all time entries for the organization
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['admin-time-entries', profile?.organization_id, dateRange],
    queryFn: async (): Promise<AdminTimeEntry[]> => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID found');
      }

      let query = supabase
        .from('time_entries')
        .select('*')
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

      // Transform the data to include driver names (we'll fetch profiles separately if needed)
      return (data || []).map(entry => ({
        ...entry,
        driver_name: `Driver ${entry.driver_id?.slice(0, 8) || 'Unknown'}`
      }));
    },
    enabled: !!profile?.organization_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Calculate statistics
  const stats: AdminTimeStats = {
    totalDrivers: 0,
    activeDrivers: 0,
    totalHours: 0,
    overtimeHours: 0,
    averageHoursPerDriver: 0,
    complianceRate: 100
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

  // Filter entries based on search and filters
  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.driver_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'pending_approval':
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

  const exportToCSV = () => {
    const headers = ['Driver', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Overtime', 'Break Time', 'Status', 'Location'];
    const csvData = filteredEntries.map(entry => [
      entry.driver_name,
      format(parseISO(entry.entry_date), 'MMM dd, yyyy'),
      entry.clock_in_time ? format(parseISO(entry.clock_in_time), 'HH:mm') : '',
      entry.clock_out_time ? format(parseISO(entry.clock_out_time), 'HH:mm') : '',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            Time Management Admin
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage driver time entries across your organization</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold">{stats.totalDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold">{stats.activeDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold">{stats.complianceRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Drivers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by driver name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateRange({ from: undefined, to: undefined });
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Time Entries ({filteredEntries.length})</span>
            <div className="text-sm text-gray-600">
              Showing {filteredEntries.length} of {timeEntries.length} entries
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading time entries...</p>
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="overflow-x-auto">
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
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => {
                    const compliance = getComplianceStatus(entry.total_hours);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.driver_name}</TableCell>
                        <TableCell>{format(parseISO(entry.entry_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          {entry.clock_in_time ? format(parseISO(entry.clock_in_time), 'HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          {entry.clock_out_time ? format(parseISO(entry.clock_out_time), 'HH:mm') : '-'}
                        </TableCell>
                        <TableCell>{entry.total_hours.toFixed(1)}h</TableCell>
                        <TableCell>{entry.overtime_hours.toFixed(1)}h</TableCell>
                        <TableCell>{entry.break_hours.toFixed(1)}h</TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {compliance.icon}
                            <span className="text-xs capitalize">{compliance.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.location_clock_in ? (
                            <div className="text-xs text-gray-600 max-w-24 truncate" title={entry.location_clock_in}>
                              {entry.location_clock_in}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Entries Found</h3>
              <p className="text-gray-600">
                {timeEntries.length === 0 
                  ? 'No time entries have been recorded yet.' 
                  : 'No entries match your current filters.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
