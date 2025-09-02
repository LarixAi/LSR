import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultViewPageLayout from '@/components/layout/DefaultViewPageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Users, Truck, MapPin, ClipboardList } from 'lucide-react';
import { useCreateSchedule } from '@/hooks/useSchedules';
import { useDrivers } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';
import { useRoutes } from '@/hooks/useRoutes';

const CreateSchedule: React.FC = () => {
  const navigate = useNavigate();
  const createSchedule = useCreateSchedule();
  const { data: drivers = [] } = useDrivers();
  const { data: vehicles = [] } = useVehicles();
  const { data: routes = [] } = useRoutes();

  const [date, setDate] = useState<string>('');
  const [form, setForm] = useState({
    job_type: '',
    title: '',
    start_time: '09:00',
    end_time: '17:00',
    driver_id: '',
    vehicle_id: '',
    route_id: '',
    status: 'scheduled',
    notes: ''
  });
  const [maintenanceType, setMaintenanceType] = useState<'service' | 'pmi' | 'mot' | ''>('');
  const [trainingTitle, setTrainingTitle] = useState<string>('');

  const handle = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const toIsoDateTime = (d: string, t: string) => {
    if (!d || !t) return '';
    return new Date(`${d}T${t}:00`).toISOString();
  };

  const handleSubmit = async () => {
    if (!date) {
      alert('Please select a date');
      return;
    }
    if (!form.job_type) {
      alert('Please select an event type');
      return;
    }
    try {
      // Build sensible defaults for title/notes based on type
      let title = form.title;
      let notes = form.notes;
      if (!title) {
        if (form.job_type === 'route') {
          const route = routes.find((r: any) => r.id === form.route_id);
          title = route?.name || 'Route Assignment';
        } else if (form.job_type === 'maintenance') {
          const veh = vehicles.find((v: any) => v.id === form.vehicle_id);
          const tag = maintenanceType ? maintenanceType.toUpperCase() : 'MAINTENANCE';
          title = `${tag} - ${veh?.vehicle_number || 'Vehicle'}`;
        } else if (form.job_type === 'training') {
          title = trainingTitle || 'Training Session';
        } else {
          title = 'Scheduled Event';
        }
      }
      if (form.job_type === 'maintenance' && maintenanceType) {
        notes = notes ? `${notes} | Type: ${maintenanceType}` : `Type: ${maintenanceType}`;
      }
      if (form.job_type === 'training' && trainingTitle) {
        notes = notes ? `${notes} | Module: ${trainingTitle}` : `Module: ${trainingTitle}`;
      }
      await createSchedule.mutateAsync({
        driver_id: form.driver_id || undefined as any,
        vehicle_id: form.vehicle_id || undefined as any,
        route_id: form.route_id || undefined as any,
        start_time: toIsoDateTime(date, form.start_time),
        end_time: toIsoDateTime(date, form.end_time),
        job_type: form.job_type,
        status: form.status,
        notes,
        // store title if your schedules table supports it; if not, it will be ignored safely
        // @ts-ignore
        title,
      });
      navigate('/schedule');
    } catch (e) {
      console.error(e);
      alert('Failed to create schedule');
    }
  };

  const nav = [
    { id: 'type', label: 'Event Type' },
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' },
    { id: 'assignment', label: 'Assignment' },
    { id: 'notes', label: 'Notes' },
    { id: 'submit', label: 'Create' },
  ];

  return (
    <DefaultViewPageLayout
      title="Schedule New Event"
      subtitle="Create a schedule for drivers, vehicles, routes and maintenance"
      backUrl="/schedule"
      backLabel="Back to Scheduling"
      navigationItems={nav}
    >
      <div className="space-y-6">
        <Card id="type">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Event Type
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={form.job_type} onValueChange={(v) => handle('job_type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="route">Route Assignment</SelectItem>
                  <SelectItem value="maintenance">Vehicle Maintenance</SelectItem>
                  <SelectItem value="training">Driver Training</SelectItem>
                  <SelectItem value="meeting">Team Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card id="overview">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">Define the event type, date and times, then assign a driver, vehicle and route as needed.</p>
          </CardContent>
        </Card>

        <Card id="details">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={form.start_time} onChange={(e) => handle('start_time', e.target.value)} />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value={form.end_time} onChange={(e) => handle('end_time', e.target.value)} />
            </div>
            <div className="md:col-span-3">
              <Label>Title (optional)</Label>
              <Input value={form.title} onChange={(e) => handle('title', e.target.value)} placeholder="Optional title for the event" />
            </div>
            {form.job_type === 'maintenance' && (
              <div>
                <Label>Maintenance Type</Label>
                <Select value={maintenanceType} onValueChange={(v) => setMaintenanceType(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="pmi">PMI Inspection</SelectItem>
                    <SelectItem value="mot">MOT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {form.job_type === 'training' && (
              <div className="md:col-span-3">
                <Label>Training Module/Title</Label>
                <Input value={trainingTitle} onChange={(e) => setTrainingTitle(e.target.value)} placeholder="e.g., CPC Module 4" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="assignment">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Assign Driver</Label>
              <Select value={form.driver_id} onValueChange={(v) => handle('driver_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.first_name ? `${d.first_name} ${d.last_name || ''}` : (d.name || d.email)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(form.job_type === 'route' || form.job_type === 'maintenance') && (
              <div>
                <Label>Assign Vehicle</Label>
                <Select value={form.vehicle_id} onValueChange={(v) => handle('vehicle_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v: any) => (
                      <SelectItem key={v.id} value={v.id}>{v.vehicle_number || v.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {form.job_type === 'route' && (
              <div>
                <Label>Assign Route</Label>
                <Select value={form.route_id} onValueChange={(v) => handle('route_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>{r.name || `${r.start_location || ''} → ${r.end_location || ''}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="notes">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Notes & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => handle('notes', e.target.value)} placeholder="Optional notes" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => handle('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card id="submit">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Button onClick={handleSubmit} disabled={createSchedule.isPending || !date} className="px-8 py-3">
                {createSchedule.isPending ? 'Creating…' : 'Create Schedule'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DefaultViewPageLayout>
  );
};

export default CreateSchedule;


