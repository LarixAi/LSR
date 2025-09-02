import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
// removed duplicate Dialog imports
import { useSchedules, useScheduleStats, useCreateSchedule } from '@/hooks/useSchedules';
import { useDrivers } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';
import { useRoutes } from '@/hooks/useRoutes';
import StandardPageLayout, { MetricCard, NavigationTab, ActionButton, FilterOption } from '@/components/layout/StandardPageLayout';

import { 
  CalendarDays, 
  Plus, 
  Clock, 
  Users, 
  Truck,
  MapPin,
  AlertCircle,
  CheckCircle,
  Filter,
  Eye
} from 'lucide-react';

import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

const AdminSchedule = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - NO CONDITIONAL HOOKS
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedView, setSelectedView] = useState('week');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingDate, setViewingDate] = useState<Date | null>(null);
  const [newScheduleData, setNewScheduleData] = useState({
    driver_id: '',
    vehicle_id: '',
    route_id: '',
    start_time: '',
    end_time: '',
    job_type: 'school_run',
    status: 'scheduled',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('timeline');
  const [viewFilter, setViewFilter] = useState('all');

  // Fetch real data from backend - ALL HOOKS MUST BE CALLED
  const { data: schedules = [], isLoading: schedulesLoading, error: schedulesError } = useSchedules();
  const scheduleStats = useScheduleStats();
  const { data: drivers = [] } = useDrivers();
  const { data: vehicles = [] } = useVehicles();
  const { data: routes = [] } = useRoutes();
  const createScheduleMutation = useCreateSchedule();
  const { data: calendarEvents = [] } = useCalendarEvents();
  const getUnifiedEventsForDate = (date: Date) => {
    const scheduleEvents = (schedules || []).filter((s: any) => {
      const dt = typeof s.start_time === 'string' ? parseISO(s.start_time) : new Date(s.start_time);
      return isSameDay(dt, date);
    }).map((s: any) => ({ id: `sch-${s.id}`, job_type: s.job_type, start_time: s.start_time, title: s.job_type || 'Schedule' }));
    const others = calendarEvents.filter((e) => e.date && isSameDay(new Date(e.date), date))
      .map((e) => ({ id: e.id, job_type: e.type, start_time: e.time, title: e.title }));
    return [...scheduleEvents, ...others];
  };


  // Handle creation of new schedule
  const handleCreateSchedule = async () => {
    try {
      await createScheduleMutation.mutateAsync(newScheduleData);
      setIsCreateDialogOpen(false);
      setNewScheduleData({
        driver_id: '',
        vehicle_id: '',
        route_id: '',
        start_time: '',
        end_time: '',
        job_type: 'school_run',
        status: 'scheduled',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  // Calculate today's stats from real data
  const todayStats = {
    totalRoutes: scheduleStats.total,
    completedRoutes: scheduleStats.completed,
    activeRoutes: scheduleStats.in_progress,
    scheduledMaintenance: scheduleStats.by_job_type.maintenance || 0,
    availableDrivers: drivers.filter(d => d.is_active).length,
    availableVehicles: vehicles.filter(v => v.status === 'active').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (jobType: string) => {
    switch (jobType) {
      case 'school_run':
      case 'route':
        return <MapPin className="w-4 h-4" />;
      case 'maintenance':
        return <Truck className="w-4 h-4" />;
      case 'training':
        return <Users className="w-4 h-4" />;
      default:
        return <CalendarDays className="w-4 h-4" />;
    }
  };

  const getTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'school_run':
      case 'route':
        return 'bg-blue-500';
      case 'maintenance':
        return 'bg-orange-500';
      case 'training':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // CONDITIONAL RENDERING AFTER ALL HOOKS ARE CALLED
  if (loading || schedulesLoading) {
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

  // Only admins and council can access
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  const metricsCards: MetricCard[] = [
    { title: 'Total Routes', value: todayStats.totalRoutes, icon: <MapPin className="h-4 w-4" /> },
    { title: 'Completed', value: todayStats.completedRoutes, icon: <CheckCircle className="h-4 w-4" /> },
    { title: 'Active', value: todayStats.activeRoutes, icon: <Clock className="h-4 w-4" /> },
    { title: 'Maintenance', value: todayStats.scheduledMaintenance, icon: <Truck className="h-4 w-4" /> },
    { title: 'Available Drivers', value: todayStats.availableDrivers, icon: <Users className="h-4 w-4" /> },
    { title: 'Available Vehicles', value: todayStats.availableVehicles, icon: <Truck className="h-4 w-4" /> },
  ];

  const navigationTabs: NavigationTab[] = [
    { value: 'timeline', label: 'Timeline View' },
    { value: 'calendar', label: 'Calendar View' },
    { value: 'resources', label: 'Resource Planning' },
    { value: 'conflicts', label: 'Conflict Resolution' },
  ];

  const primaryAction: ActionButton = {
    label: 'Schedule Event',
    onClick: () => navigate('/schedule/create'),
    icon: <Plus className="w-4 h-4 mr-2" />,
  };

  const filters: FilterOption[] = [
    {
      label: 'View',
      value: selectedView,
      options: [
        { value: 'day', label: 'Day View' },
        { value: 'week', label: 'Week View' },
        { value: 'month', label: 'Month View' },
      ],
      placeholder: 'Select view',
    },
    {
      label: 'Type',
      value: viewFilter,
      options: [
        { value: 'all', label: 'All Events' },
        { value: 'route', label: 'Routes Only' },
        { value: 'maintenance', label: 'Maintenance Only' },
        { value: 'training', label: 'Training Only' },
      ],
      placeholder: 'Filter by type',
    },
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === 'View') setSelectedView(value);
    if (filterKey === 'Type') setViewFilter(value);
  };

  return (
    <StandardPageLayout
      title="Resource Scheduling"
      description="Manage driver schedules, vehicle assignments, and maintenance"
      primaryAction={primaryAction}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchConfig={{ placeholder: 'Search schedules...', value: searchTerm, onChange: setSearchTerm, showSearch: true }}
      filters={filters}
      onFilterChange={handleFilterChange}
      isLoading={schedulesLoading}
    >
      {/* Timeline View */}
      {activeTab === "timeline" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Schedule - {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <Input
                  type="date"
                  value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-48"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className={`w-1 h-16 rounded ${getTypeColor(schedule.job_type)}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(schedule.job_type)}
                      <h3 className="font-medium">
                        {schedule.job_type === 'school_run' ? 'School Transport' : 
                         schedule.job_type === 'maintenance' ? 'Vehicle Maintenance' :
                         schedule.job_type === 'training' ? 'Driver Training' :
                         schedule.job_type}
                      </h3>
                      {getStatusBadge(schedule.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(schedule.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(schedule.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      {schedule.driver && (
                        <span>Driver: {schedule.driver.first_name} {schedule.driver.last_name}</span>
                      )}
                      {schedule.vehicle && (
                        <span>Vehicle: {schedule.vehicle.vehicle_number}</span>
                      )}
                      {schedule.route && (
                        <span>Route: {schedule.route.name || `${schedule.route.start_location} → ${schedule.route.end_location}`}</span>
                      )}
                      {schedule.notes && (
                        <span>Notes: {schedule.notes}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {activeTab === "calendar" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Calendar View
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(prev => subMonths(prev, 1))}>Prev</Button>
              <div className="text-sm font-medium w-40 text-center">{format(selectedDate, 'MMMM yyyy')}</div>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(prev => addMonths(prev, 1))}>Next</Button>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const monthStart = startOfMonth(selectedDate);
              const monthEnd = endOfMonth(selectedDate);
              const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
              const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
              const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
              const weekdays = eachDayOfInterval({ start: calendarStart, end: addMonths(calendarStart, 0) }).slice(0,7);

              const getDayEvents = (date: Date) => {
                const scheduleEvents = (schedules || []).filter((s: any) => {
                  const dt = typeof s.start_time === 'string' ? parseISO(s.start_time) : new Date(s.start_time);
                  return isSameDay(dt, date);
                }).map((s: any) => ({ id: `sch-${s.id}`, job_type: s.job_type, start_time: s.start_time }));
                const unified = [
                  ...scheduleEvents,
                  ...calendarEvents.filter((e) => e.date && isSameDay(typeof e.date === 'string' ? new Date(e.date) : e.date, date)).map(e => ({ id: e.id, job_type: e.type, start_time: e.time }))
                ];
                return unified.slice(0, 6);
              };

              return (
                <div className="h-[70vh] min-h-[560px]">
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 border-b text-xs font-medium text-gray-500">
                    {[0,1,2,3,4,5,6].map((i) => (
                      <div key={i} className="px-2 py-2 uppercase tracking-wide">{format(addMonths(calendarStart, 0).setDate(calendarStart.getDate()+i), 'EEE')}</div>
                    ))}
                  </div>
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 grid-rows-6 h-[calc(100%-2rem)]">
                    {days.map((day, idx) => (
                      <div key={idx} className={`border p-2 overflow-auto ${isSameMonth(day, monthStart) ? 'bg-white' : 'bg-gray-50'} cursor-pointer`} onClick={() => setViewingDate(day)}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-semibold ${isSameMonth(day, monthStart) ? 'text-gray-900' : 'text-gray-400'}`}>{format(day, 'd')}</span>
                        </div>
                        <div className="space-y-1">
                          {getDayEvents(day).map((ev: any) => (
                            <div key={ev.id} className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-gray-100">
                              <span className={`inline-block w-2 h-2 rounded-full ${getTypeColor(ev.job_type || 'route')}`}></span>
                              <span className="truncate capitalize">{String(ev.job_type || 'event').replace('_',' ')}</span>
                              {ev.start_time && (
                                <span className="text-gray-500 truncate">{ev.start_time}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Day Events Dialog */}
      <Dialog open={!!viewingDate} onOpenChange={(o) => !o && setViewingDate(null)}>
        <DialogContent aria-describedby="day-events-desc">
          <DialogHeader>
            <DialogTitle>Events - {viewingDate ? format(viewingDate, 'EEEE, MMM d, yyyy') : ''}</DialogTitle>
            <DialogDescription id="day-events-desc">All events scheduled for the selected day.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {viewingDate && getUnifiedEventsForDate(viewingDate).length === 0 && (
              <div className="text-sm text-gray-600">No events for this day.</div>
            )}
            {viewingDate && getUnifiedEventsForDate(viewingDate).map((ev: any) => (
              <div
                key={ev.id}
                className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  // Navigate based on event type
                  if (ev.id?.toString().startsWith('sch-')) {
                    // schedules may not have a dedicated detail page yet
                    setViewingDate(null);
                  } else if (ev.jobId) {
                    navigate('/jobs');
                    setViewingDate(null);
                  } else if (ev.workOrderId) {
                    navigate(`/work-orders/${ev.workOrderId}`);
                    setViewingDate(null);
                  } else if (ev.vehicleId) {
                    navigate(`/vehicles/${ev.vehicleId}`);
                    setViewingDate(null);
                  } else if (ev.driverId) {
                    navigate(`/drivers/${ev.driverId}`);
                    setViewingDate(null);
                  }
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`inline-block w-2 h-2 rounded-full ${getTypeColor(ev.job_type || 'route')}`}></span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate capitalize">{ev.title || ev.job_type || 'Event'}</div>
                    {ev.start_time && <div className="text-xs text-gray-500">{ev.start_time}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Resource Planning */}
      {activeTab === "resources" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Resource Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Resource Planning</h3>
              <p className="text-gray-600 mb-6">
                View driver and vehicle availability, manage assignments, and optimize resource allocation.
              </p>
              <Button className="bg-red-600 hover:bg-red-700">
                Manage Resources
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflict Resolution */}
      {activeTab === "conflicts" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Schedule Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Conflicts Detected</h3>
              <p className="text-gray-600 mb-6">
                All scheduled events are properly assigned without conflicts.
              </p>
              <Button variant="outline">
                Run Conflict Check
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Schedule Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby="dialog-description">
          <DialogHeader>
            <DialogTitle>Schedule New Event</DialogTitle>
            <DialogDescription id="dialog-description">
              Create a new schedule event for drivers, vehicles, or maintenance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-type">Event Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="route">Route Assignment</SelectItem>
                  <SelectItem value="maintenance">Vehicle Maintenance</SelectItem>
                  <SelectItem value="training">Driver Training</SelectItem>
                  <SelectItem value="meeting">Team Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Event title" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input id="start-time" type="time" />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input id="end-time" type="time" />
              </div>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" />
            </div>
            <div>
              <Label htmlFor="driver">Assign Driver</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john">John Smith</SelectItem>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="mike">Mike Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vehicle">Assign Vehicle</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LSR-001">LSR-001</SelectItem>
                  <SelectItem value="LSR-002">LSR-002</SelectItem>
                  <SelectItem value="LSR-003">LSR-003</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700">Create Event</Button>
          </div>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
};

export default AdminSchedule;
