import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Play, Pause, Square, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TimeManagement() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch time entries
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['time-entries', user?.id, selectedDate],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('driver_id', user.id)
        .order('clock_in_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Get today's active time entry
  const todayEntry = timeEntries.find(entry => 
    !entry.clock_out_time && new Date(entry.created_at).toDateString() === new Date().toDateString()
  );

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS format
      
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          driver_id: user!.id,
          clock_in_time: timeString,
          organization_id: profile?.organization_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Clocked in successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to clock in: ' + error.message);
    }
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async () => {
      if (!todayEntry) throw new Error('No active time entry found');
      
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS format
      
      const { data, error } = await supabase
        .from('time_entries')
        .update({ clock_out_time: timeString })
        .eq('id', todayEntry.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Clocked out successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to clock out: ' + error.message);
    }
  });

  // Calculate total hours for selected date
  const selectedDateEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
    return entryDate === selectedDate;
  });

  const totalHours = selectedDateEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);

  // Weekly compliance check
  const { data: weeklyCompliance } = useQuery({
    queryKey: ['weekly-compliance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('total_hours')
        .eq('driver_id', user.id)
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;
      
      const weeklyHours = (data || []).reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
      return {
        weeklyHours,
        isCompliant: weeklyHours <= 60, // EU driving time regulations
        warningLevel: weeklyHours > 55 ? 'high' : weeklyHours > 48 ? 'medium' : 'low'
      };
    },
    enabled: !!user?.id
  });

  const getStatusDisplay = () => {
    if (todayEntry) {
      const clockInTime = new Date(`2000-01-01T${todayEntry.clock_in_time}`);
      return {
        status: 'on-duty',
        label: 'On Duty',
        time: clockInTime.toLocaleTimeString(),
        variant: 'default' as const
      };
    }
    return {
      status: 'off-duty',
      label: 'Off Duty',
      time: 'Not clocked in',
      variant: 'secondary' as const
    };
  };

  const statusInfo = getStatusDisplay();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading time management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Management</h1>
          <p className="text-muted-foreground">
            Track your working hours and manage compliance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={statusInfo.variant} className="px-3 py-1">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              statusInfo.status === 'on-duty' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Clock In/Out Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Time Clock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Current Status: {statusInfo.label}</p>
              <p className="text-muted-foreground">{statusInfo.time}</p>
              {todayEntry && (
                <p className="text-sm text-muted-foreground mt-1">
                  Started at {new Date(`2000-01-01T${todayEntry.clock_in_time}`).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {!todayEntry ? (
                <Button 
                  onClick={() => clockInMutation.mutate()}
                  disabled={clockInMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Clock In
                </Button>
              ) : (
                <Button 
                  onClick={() => clockOutMutation.mutate()}
                  disabled={clockOutMutation.isPending}
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Hours</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Hours</p>
                <p className="text-2xl font-bold">{weeklyCompliance?.weeklyHours?.toFixed(1) || '0.0'}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance</p>
                <div className="flex items-center gap-2">
                  {weeklyCompliance?.isCompliant ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {weeklyCompliance?.isCompliant ? 'Compliant' : 'Non-compliant'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">Daily Records</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Summary</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Time Entries</CardTitle>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              {selectedDateEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No time entries for {selectedDate}</h3>
                  <p className="text-muted-foreground">Clock in to start tracking your time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {entry.clock_in_time ? new Date(`2000-01-01T${entry.clock_in_time}`).toLocaleTimeString() : 'Not clocked in'} - {' '}
                            {entry.clock_out_time ? new Date(`2000-01-01T${entry.clock_out_time}`).toLocaleTimeString() : 'In progress'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total: {entry.total_hours?.toFixed(2) || '0.00'} hours
                          </div>
                        </div>
                      </div>
                      <Badge variant={entry.clock_out_time ? 'outline' : 'default'}>
                        {entry.clock_out_time ? 'Completed' : 'Active'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Total Hours This Week</h4>
                    <p className="text-2xl font-bold">{weeklyCompliance?.weeklyHours?.toFixed(1) || '0.0'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Remaining Hours</h4>
                    <p className="text-2xl font-bold">
                      {Math.max(0, 60 - (weeklyCompliance?.weeklyHours || 0)).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyCompliance && (
                  <div className={`p-4 rounded-lg border-l-4 ${
                    weeklyCompliance.isCompliant 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                      : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                  }`}>
                    <div className="flex items-center">
                      {weeklyCompliance.isCompliant ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <h4 className="font-semibold">
                        {weeklyCompliance.isCompliant ? 'Compliant' : 'Non-Compliant'}
                      </h4>
                    </div>
                    <p className="text-sm mt-1">
                      Weekly hours: {weeklyCompliance.weeklyHours.toFixed(1)}/60.0 hours
                    </p>
                    {!weeklyCompliance.isCompliant && (
                      <p className="text-sm text-red-600 mt-2">
                        You have exceeded the weekly driving time limit. Please contact your supervisor.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}