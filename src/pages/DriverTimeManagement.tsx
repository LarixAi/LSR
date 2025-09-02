import React, { useMemo, useState } from 'react';
import StandardPageLayout, { ActionButton, NavigationTab, MetricCard } from '@/components/layout/StandardPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Clock, Play, Square, Coffee, CoffeeIcon, CalendarDays, Download, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useTodayTimeEntry, useTimeEntries, useClockIn, useClockOut, useStartBreak, useEndBreak, useTimeStats } from '@/hooks/useTimeEntries';
import { format, parseISO, differenceInMinutes } from 'date-fns';

const DriverTimeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('today');

  const { data: today } = useTodayTimeEntry();
  const { data: entries = [] } = useTimeEntries();
  const stats = useTimeStats();

  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const startBreak = useStartBreak();
  const endBreak = useEndBreak();

  const metrics: MetricCard[] = [
    { title: 'Total Hours', value: `${stats.totalHours.toFixed(1)}h`, subtitle: 'All time', icon: <Clock className="w-4 h-4" /> },
    { title: 'Overtime', value: `${stats.totalOvertime.toFixed(1)}h`, subtitle: 'All time', icon: <Clock className="w-4 h-4" /> },
    { title: 'Breaks', value: `${stats.totalBreaks.toFixed(1)}h`, subtitle: 'All time', icon: <Coffee className="w-4 h-4" /> },
    { title: 'Average/Day', value: `${stats.averageHoursPerDay.toFixed(1)}h`, subtitle: `${stats.totalDays} days`, icon: <CalendarDays className="w-4 h-4" /> },
  ];

  const todayLabel = useMemo(() => {
    if (!today) return 'Not clocked in';
    if (today?.clock_out_time) return 'Completed';
    if (today?.break_start_time && !today?.break_end_time) return 'On Break';
    return 'Working';
  }, [today]);

  const workedMins = useMemo(() => {
    if (!today?.clock_in_time) return 0;
    const start = parseISO(`${new Date().toISOString().split('T')[0]}T${today.clock_in_time}`);
    const end = today?.clock_out_time
      ? parseISO(`${new Date().toISOString().split('T')[0]}T${today.clock_out_time}`)
      : new Date();
    return Math.max(0, differenceInMinutes(end, start));
  }, [today]);

  const workedStr = `${Math.floor(workedMins / 60)}h ${workedMins % 60}m`;

  const actions: ActionButton[] = [
    { label: 'Export', onClick: () => {}, icon: <Download className="w-4 h-4" />, variant: 'outline', size: 'sm' },
  ];

  const tabs: NavigationTab[] = [
    { value: 'today', label: 'Today' },
    { value: 'history', label: 'History' },
  ];

  return (
    <StandardPageLayout
      title="Time Management"
      description="Clock in/out and view your time history"
      secondaryActions={actions}
      metricsCards={metrics}
      navigationTabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsContent value="today" className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {todayLabel === 'Working' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {todayLabel === 'On Break' && <Coffee className="w-5 h-5 text-yellow-600" />}
                  {todayLabel === 'Completed' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                  {todayLabel === 'Not clocked in' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  Status: {todayLabel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Clock In</p>
                    <p className="font-medium">{today?.clock_in_time || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Break</p>
                    <p className="font-medium">{today?.break_start_time ? `${today.break_start_time} - ${today.break_end_time || '...'}` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Clock Out</p>
                    <p className="font-medium">{today?.clock_out_time || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Worked</p>
                    <p className="font-medium">{today?.clock_in_time ? workedStr : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={() => clockIn.mutate()} disabled={!!today || clockIn.isPending}>
                  <Play className="w-4 h-4 mr-2" /> Clock In
                </Button>
                <Button className="w-full" variant="outline" onClick={() => startBreak.mutate()} disabled={!today || !!today.break_start_time || startBreak.isPending}>
                  <CoffeeIcon className="w-4 h-4 mr-2" /> Start Break
                </Button>
                <Button className="w-full" variant="outline" onClick={() => endBreak.mutate()} disabled={!today || !today.break_start_time || !!today.break_end_time || endBreak.isPending}>
                  <Coffee className="w-4 h-4 mr-2" /> End Break
                </Button>
                <Button className="w-full" variant="destructive" onClick={() => clockOut.mutate()} disabled={!today || !!today.clock_out_time || clockOut.isPending}>
                  <Square className="w-4 h-4 mr-2" /> Clock Out
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline">{todayLabel}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Worked</p>
                  <p className="font-medium">{today?.clock_in_time ? workedStr : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Recent Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Break</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.slice(0, 20).map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.entry_date ? format(parseISO(e.entry_date), 'MMM dd, yyyy') : '-'}</TableCell>
                      <TableCell>{e.clock_in_time || '-'}</TableCell>
                      <TableCell>{e.clock_out_time || '-'}</TableCell>
                      <TableCell>{e.break_start_time ? `${e.break_start_time} - ${e.break_end_time || '...'}` : '-'}</TableCell>
                      <TableCell>{e.total_hours ? `${e.total_hours.toFixed(1)}h` : '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{e.status || 'N/A'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StandardPageLayout>
  );
};

export default DriverTimeManagement;


