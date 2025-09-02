import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultViewPageLayout from '@/components/layout/DefaultViewPageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, User, MapPin, Clock, Truck, ClipboardList } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useSendNotification } from '@/hooks/useAdvancedNotifications';
import AdvancedEmailService from '@/services/advancedEmailService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs, useCreateJob } from '@/hooks/useJobs';
import { useDrivers } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';

interface StopItem {
  id: string;
  type: 'pickup' | 'dropoff' | 'stop';
  name: string;
  address: string;
  time?: string;
  notes?: string;
}

interface CreateJobFormData {
  title: string;
  description: string;
  priority: string;
  job_category: 'LGV' | 'PSV';
  booking_type: string;
  pickup_location: string;
  delivery_location: string;
  customer_name: string;
  customer_contact: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  assigned_driver_id: string;
  assigned_vehicle_id: string;
  stops: StopItem[];
  // Bidding & pay
  bidding_enabled?: boolean;
  bidding_deadline?: string;
  pay_rate_type?: 'hourly' | 'fixed';
  offered_pay?: string;
  min_bid_amount?: string;
  max_bid_amount?: string;
  // LGV specific
  cargo_weight_kg?: string;
  pallets?: string;
  load_type?: string;
  adr_required?: boolean;
  adr_class?: string;
  adr_un_number?: string;
  temperature_control?: boolean;
  temperature_c?: string;
  lgv_time_window_start?: string;
  lgv_time_window_end?: string;
  // PSV specific
  passengers?: string;
  wheelchair_access?: boolean;
  service_type?: string;
  route_stops?: string; // legacy
  pickup_time?: string;
  return_time?: string;
  // Event/Wedding extras
  wedding?: boolean;
  wedding_drinks?: boolean;
  wedding_food?: boolean;
  wedding_decorations?: boolean;
  wedding_notes?: string;
  // Shuttle specifics
  shuttle_frequency_mins?: string;
  shuttle_loop?: boolean;
  shuttle_loops_count?: string;
  // Rail replacement specifics
  rail_line?: string;
  rail_disruption_start?: string;
  rail_disruption_end?: string;
  // School run specifics
  school_name?: string;
  year_group?: string;
}

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const createJobMutation = useCreateJob();
  const { data: drivers = [] } = useDrivers();
  const { data: vehicles = [] } = useVehicles();
  const sendNotification = useSendNotification();
  const { profile } = useAuth();

  const [formData, setFormData] = useState<CreateJobFormData>({
    title: '',
    description: '',
    priority: 'medium',
    job_category: 'LGV',
    booking_type: '',
    pickup_location: '',
    delivery_location: '',
    customer_name: '',
    customer_contact: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    assigned_driver_id: '',
    assigned_vehicle_id: '',
    stops: [],
    bidding_enabled: false,
    pay_rate_type: 'fixed',
    offered_pay: '',
  });

  const handleChange = (key: keyof CreateJobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addStop = (type: 'pickup' | 'dropoff' | 'stop') => {
    const newStop: StopItem = { id: `${Date.now()}_${Math.random()}`, type, name: '', address: '', time: '', notes: '' };
    setFormData(prev => ({ ...prev, stops: [...prev.stops, newStop] }));
  };

  const updateStop = (id: string, key: keyof StopItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.map(s => s.id === id ? { ...s, [key]: value } : s)
    }));
  };

  const removeStop = (id: string) => {
    setFormData(prev => ({ ...prev, stops: prev.stops.filter(s => s.id !== id) }));
  };

  const buildEnhancedDescription = (): string => {
    const lines: string[] = [];
    lines.push(`Category: ${formData.job_category}`);
    if (formData.booking_type) lines.push(`Booking: ${formData.booking_type}`);
    if (formData.job_category === 'LGV') {
      if (formData.cargo_weight_kg) lines.push(`Cargo: ${formData.cargo_weight_kg} kg`);
      if (formData.pallets) lines.push(`Pallets: ${formData.pallets}`);
      if (formData.load_type) lines.push(`Load: ${formData.load_type}`);
      if (formData.adr_required) lines.push(`ADR: Yes${formData.adr_class ? ` (Class ${formData.adr_class})` : ''}${formData.adr_un_number ? ` UN ${formData.adr_un_number}` : ''}`);
      if (formData.temperature_control) lines.push(`Temp: ${formData.temperature_c || 'controlled'}`);
      if (formData.lgv_time_window_start || formData.lgv_time_window_end) {
        lines.push(`Window: ${formData.lgv_time_window_start || ''} - ${formData.lgv_time_window_end || ''}`);
      }
    } else {
      if (formData.passengers) lines.push(`Passengers: ${formData.passengers}`);
      if (formData.wheelchair_access) lines.push('Wheelchair Access: Yes');
      if (formData.service_type) lines.push(`Service: ${formData.service_type}`);
      if (formData.pickup_time || formData.return_time) lines.push(`Times: ${formData.pickup_time || ''} / ${formData.return_time || ''}`);
      if (formData.route_stops) lines.push(`Stops: ${formData.route_stops.split('\n').length} stops`);
    }
    if (formData.stops && formData.stops.length > 0) {
      lines.push('Itinerary:');
      formData.stops.forEach((s, idx) => {
        lines.push(`  ${idx + 1}. [${s.type}] ${s.name || ''} - ${s.address || ''} ${s.time ? `@ ${s.time}` : ''}`.trim());
      });
    }
    if (formData.booking_type === 'wedding') {
      const extras: string[] = [];
      if (formData.wedding_drinks) extras.push('drinks');
      if (formData.wedding_food) extras.push('food');
      if (formData.wedding_decorations) extras.push('decorations');
      if (extras.length) lines.push(`Wedding extras: ${extras.join(', ')}`);
      if (formData.wedding_notes) lines.push(`Wedding notes: ${formData.wedding_notes}`);
    }
    if (formData.booking_type === 'shuttle') {
      if (formData.shuttle_frequency_mins) lines.push(`Shuttle every ${formData.shuttle_frequency_mins} mins`);
      if (formData.shuttle_loop) lines.push('Loop route: Yes');
      if (formData.shuttle_loops_count) lines.push(`Loops: ${formData.shuttle_loops_count}`);
    }
    if (formData.booking_type === 'rail_replacement') {
      if (formData.rail_line) lines.push(`Rail line: ${formData.rail_line}`);
      if (formData.rail_disruption_start || formData.rail_disruption_end) lines.push(`Disruption: ${formData.rail_disruption_start || ''} - ${formData.rail_disruption_end || ''}`);
    }
    if (formData.booking_type === 'school_run') {
      if (formData.school_name) lines.push(`School: ${formData.school_name}`);
      if (formData.year_group) lines.push(`Year group: ${formData.year_group}`);
    }
    return `${formData.description || ''}${formData.description ? '\n' : ''}${lines.join('\n')}`.trim();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.customer_name) {
      alert('Title and Customer Name are required');
      return;
    }
    try {
      const payload = {
        title: formData.title,
        description: buildEnhancedDescription(),
        priority: formData.priority,
        pickup_location: formData.pickup_location,
        delivery_location: formData.delivery_location,
        customer_name: formData.customer_name,
        customer_contact: formData.customer_contact,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        assigned_driver_id: formData.bidding_enabled ? null : (formData.assigned_driver_id || null),
        assigned_vehicle_id: formData.assigned_vehicle_id || null,
        bidding_enabled: !!formData.bidding_enabled,
        bidding_deadline: formData.bidding_deadline || null,
        offered_pay: formData.offered_pay ? Number(formData.offered_pay) : null,
        min_bid_amount: formData.min_bid_amount ? Number(formData.min_bid_amount) : null,
        max_bid_amount: formData.max_bid_amount ? Number(formData.max_bid_amount) : null,
        status: formData.bidding_enabled ? 'open_for_bidding' : undefined,
      } as any;
      const job = await createJobMutation.mutateAsync(payload);

      // Notify assigned driver if present and not bidding
      if (!formData.bidding_enabled && formData.assigned_driver_id) {
        const title = 'New Job Assigned';
        const body = `${formData.title}\nWhen: ${formData.start_date || ''} ${formData.start_time || ''}${formData.end_date ? ` - ${formData.end_date}` : ''}\nFrom: ${formData.pickup_location || '-'}\nTo: ${formData.delivery_location || '-'}`.trim();
        try {
          const notification = await sendNotification.mutateAsync({
            recipientType: 'specific',
            recipientId: formData.assigned_driver_id,
            title,
            body,
            type: 'info',
            priority: 'high',
            category: 'schedule',
            channels: ['in_app', 'push', 'sms', 'email'],
            isScheduled: false,
          });
          // Try push/SMS delivery via edge function if recipient has tokens/phone
          try {
            const { data: driverProfile } = await supabase
              .from('profiles')
              .select('id, organization_id, email, phone, push_token, first_name')
              .eq('id', formData.assigned_driver_id)
              .single();
            if (driverProfile?.organization_id) {
              // Push
              if (driverProfile.push_token) {
                await supabase.functions.invoke('notification-delivery', {
                  body: {
                    notification_id: (notification as any).id,
                    channel: 'push',
                    recipient_id: formData.assigned_driver_id,
                    organization_id: driverProfile.organization_id,
                  }
                });
              }
              // SMS
              if (driverProfile.phone) {
                await supabase.functions.invoke('notification-delivery', {
                  body: {
                    notification_id: (notification as any).id,
                    channel: 'sms',
                    recipient_id: formData.assigned_driver_id,
                    organization_id: driverProfile.organization_id,
                  }
                });
              }
            }
          } catch (e) {
            console.warn('Push/SMS delivery skipped or failed:', e);
          }
        } catch (e) {
          console.error('Failed to send in-app notification:', e);
        }

        // Best-effort email to driver
        try {
          const { data: driverProfile } = await supabase
            .from('profiles')
            .select('email, first_name')
            .eq('id', formData.assigned_driver_id)
            .single();
          if (driverProfile?.email) {
            await AdvancedEmailService.sendEmail({
              from: undefined as any,
              to: [driverProfile.email],
              subject: 'New Job Assigned',
              html: `
                <p>Hi ${driverProfile.first_name || 'Driver'},</p>
                <p>You have been assigned a new job: <strong>${formData.title}</strong>.</p>
                <p><strong>When:</strong> ${formData.start_date || ''} ${formData.start_time || ''} ${formData.end_date ? `- ${formData.end_date}` : ''}</p>
                <p><strong>From:</strong> ${formData.pickup_location || '-'}<br/>
                <strong>To:</strong> ${formData.delivery_location || '-'}</p>
                <p>Please check your app for full details.</p>
              `,
            });
          }
        } catch (e) {
          console.warn('Email notification skipped or failed:', e);
        }
      }

      // If bidding is enabled, broadcast to drivers about open bidding
      if (formData.bidding_enabled) {
        try {
          const broadcast = await sendNotification.mutateAsync({
            recipientType: 'role',
            recipientRole: 'driver',
            title: 'New Job Available for Bidding',
            body: `${formData.title} – ${formData.pickup_location || '-'} → ${formData.delivery_location || '-'}${formData.offered_pay ? ` | Offered ${formData.pay_rate_type === 'hourly' ? 'Hourly' : 'Fixed'}: £${formData.offered_pay}` : ''}`,
            type: 'info',
            priority: 'normal',
            category: 'schedule',
            channels: ['in_app'],
            isScheduled: false,
          });
          // Push/SMS broadcast to all drivers in org
          if (profile?.organization_id && (broadcast as any)?.id) {
            const { data: orgDrivers } = await supabase
              .from('profiles')
              .select('id, organization_id, phone, push_token')
              .eq('organization_id', profile.organization_id)
              .eq('role', 'driver');
            if (orgDrivers && orgDrivers.length > 0) {
              for (const d of orgDrivers) {
                if (d.push_token) {
                  try {
                    await supabase.functions.invoke('notification-delivery', {
                      body: {
                        notification_id: (broadcast as any).id,
                        channel: 'push',
                        recipient_id: d.id,
                        organization_id: profile.organization_id,
                      }
                    });
                  } catch {}
                }
                if (d.phone) {
                  try {
                    await supabase.functions.invoke('notification-delivery', {
                      body: {
                        notification_id: (broadcast as any).id,
                        channel: 'sms',
                        recipient_id: d.id,
                        organization_id: profile.organization_id,
                      }
                    });
                  } catch {}
                }
              }
            }
          }
        } catch (e) {
          console.warn('Broadcast bidding notification failed:', e);
        }
      }
      navigate('/jobs');
    } catch (error) {
      console.error('Failed to create job', error);
      alert('Failed to create job.');
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'category', label: 'Category' },
    { id: 'job-basics', label: 'Job Basics' },
    { id: 'locations', label: 'Locations' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'assignment', label: 'Assignment' },
    ...(formData.job_category === 'LGV' ? [{ id: 'lgv-details', label: 'LGV Details' }] : [{ id: 'psv-details', label: 'PSV Details' }]),
    ...(formData.booking_type ? [{ id: 'booking-details', label: 'Booking Details' }] : []),
    { id: 'submit', label: 'Create Job' },
  ];

  return (
    <DefaultViewPageLayout
      title="Create New Job"
      description="Add a new transport job with details and assignment"
      backUrl="/jobs"
      backLabel="Back to Jobs"
      navigationItems={navigationItems}
    >
      <div className="space-y-6">
        <Card id="overview">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">Fill in the required fields to create a new job. Title and customer name are mandatory. You can assign a driver and vehicle now or later.</p>
          </CardContent>
        </Card>

        <Card id="job-basics">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Job Basics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="e.g., Depot to Client Delivery" />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Short job description" />
              </div>
              <div>
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input id="customer_name" value={formData.customer_name} onChange={(e) => handleChange('customer_name', e.target.value)} placeholder="e.g., Acme Ltd" />
              </div>
              <div>
                <Label htmlFor="customer_contact">Customer Contact</Label>
                <Input id="customer_contact" value={formData.customer_contact} onChange={(e) => handleChange('customer_contact', e.target.value)} placeholder="email or phone" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="category">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Category & Booking Type
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Job Category</Label>
              <Select value={formData.job_category} onValueChange={(v) => handleChange('job_category', v as 'LGV' | 'PSV')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LGV">LGV / HGV</SelectItem>
                  <SelectItem value="PSV">PSV / Bus & Coach</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Booking Type</Label>
              <Select value={formData.booking_type} onValueChange={(v) => handleChange('booking_type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select booking type" />
                </SelectTrigger>
                <SelectContent>
                  {formData.job_category === 'LGV' ? (
                    <>
                      <SelectItem value="general_haulage">General Haulage</SelectItem>
                      <SelectItem value="pallet_network">Pallet Network</SelectItem>
                      <SelectItem value="multidrop">Multi-drop</SelectItem>
                      <SelectItem value="adr_hazardous">ADR / Hazardous</SelectItem>
                      <SelectItem value="refrigerated">Refrigerated</SelectItem>
                      <SelectItem value="full_load">Full Load</SelectItem>
                      <SelectItem value="part_load">Part Load</SelectItem>
                      <SelectItem value="time_critical">Time Critical</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="school_run">School Run</SelectItem>
                      <SelectItem value="private_hire">Private Hire</SelectItem>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="rail_replacement">Rail Replacement</SelectItem>
                      <SelectItem value="shuttle">Shuttle Service</SelectItem>
                      <SelectItem value="event_transport">Event Transport</SelectItem>
                      <SelectItem value="tour">Tour / Excursion</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card id="locations">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickup">Pickup Location</Label>
              <Input id="pickup" value={formData.pickup_location} onChange={(e) => handleChange('pickup_location', e.target.value)} placeholder="Address or site" />
            </div>
            <div>
              <Label htmlFor="delivery">Delivery Location</Label>
              <Input id="delivery" value={formData.delivery_location} onChange={(e) => handleChange('delivery_location', e.target.value)} placeholder="Address or site" />
            </div>
          </CardContent>
        </Card>

        <Card id="schedule">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => handleChange('start_date', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => handleChange('end_date', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input id="start_time" type="time" value={formData.start_time} onChange={(e) => handleChange('start_time', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input id="end_time" type="time" value={formData.end_time} onChange={(e) => handleChange('end_time', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card id="assignment">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label>Open to Bids?</Label>
                <div className="flex items-center gap-2 py-2">
                  <Switch checked={!!formData.bidding_enabled} onCheckedChange={(v) => handleChange('bidding_enabled', v)} />
                  <span className="text-sm text-gray-600">Enable driver bidding</span>
                </div>
              </div>
              {!formData.bidding_enabled && (
                <>
                  <div>
                    <Label>Assigned Driver</Label>
                    <Select value={formData.assigned_driver_id} onValueChange={(v) => handleChange('assigned_driver_id', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>{d.name || d.full_name || d.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Assigned Vehicle</Label>
                    <Select value={formData.assigned_vehicle_id} onValueChange={(v) => handleChange('assigned_vehicle_id', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v: any) => (
                          <SelectItem key={v.id} value={v.id}>{v.registration_number || v.name || v.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {formData.bidding_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Pay Type</Label>
                  <Select value={formData.pay_rate_type || 'fixed'} onValueChange={(v) => handleChange('pay_rate_type', v as 'hourly' | 'fixed')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{formData.pay_rate_type === 'hourly' ? 'Offered Hourly (£/h)' : 'Offered Fixed (£)'}</Label>
                  <Input value={formData.offered_pay || ''} onChange={(e) => handleChange('offered_pay', e.target.value)} placeholder={formData.pay_rate_type === 'hourly' ? 'e.g., 18.50' : 'e.g., 120.00'} />
                </div>
                <div>
                  <Label>Bidding Deadline</Label>
                  <Input type="datetime-local" value={formData.bidding_deadline || ''} onChange={(e) => handleChange('bidding_deadline', e.target.value)} />
                </div>
                <div>
                  <Label>Min Bid (£)</Label>
                  <Input value={formData.min_bid_amount || ''} onChange={(e) => handleChange('min_bid_amount', e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <Label>Max Bid (£)</Label>
                  <Input value={formData.max_bid_amount || ''} onChange={(e) => handleChange('max_bid_amount', e.target.value)} placeholder="Optional" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {formData.job_category === 'LGV' ? (
          <Card id="lgv-details">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                LGV / HGV Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cargo_weight_kg">Cargo Weight (kg)</Label>
                <Input id="cargo_weight_kg" value={formData.cargo_weight_kg || ''} onChange={(e) => handleChange('cargo_weight_kg', e.target.value)} placeholder="e.g., 1200" />
              </div>
              <div>
                <Label htmlFor="pallets">Pallets</Label>
                <Input id="pallets" value={formData.pallets || ''} onChange={(e) => handleChange('pallets', e.target.value)} placeholder="e.g., 4" />
              </div>
              <div>
                <Label htmlFor="load_type">Load Type</Label>
                <Input id="load_type" value={formData.load_type || ''} onChange={(e) => handleChange('load_type', e.target.value)} placeholder="e.g., pallets, bulk, cage" />
              </div>
              <div className="md:col-span-1">
                <Label>ADR Required</Label>
                <div className="flex items-center gap-2 py-2">
                  <Switch checked={!!formData.adr_required} onCheckedChange={(v) => handleChange('adr_required', v)} />
                  <span className="text-sm text-gray-600">ADR</span>
                </div>
              </div>
              {formData.adr_required && (
                <>
                  <div>
                    <Label htmlFor="adr_class">ADR Class</Label>
                    <Input id="adr_class" value={formData.adr_class || ''} onChange={(e) => handleChange('adr_class', e.target.value)} placeholder="e.g., 3" />
                  </div>
                  <div>
                    <Label htmlFor="adr_un_number">UN Number</Label>
                    <Input id="adr_un_number" value={formData.adr_un_number || ''} onChange={(e) => handleChange('adr_un_number', e.target.value)} placeholder="e.g., UN1203" />
                  </div>
                </>
              )}
              <div className="md:col-span-1">
                <Label>Temperature Control</Label>
                <div className="flex items-center gap-2 py-2">
                  <Switch checked={!!formData.temperature_control} onCheckedChange={(v) => handleChange('temperature_control', v)} />
                  <span className="text-sm text-gray-600">Refrigerated</span>
                </div>
              </div>
              <div>
                <Label htmlFor="temperature_c">Temperature (°C)</Label>
                <Input id="temperature_c" value={formData.temperature_c || ''} onChange={(e) => handleChange('temperature_c', e.target.value)} placeholder="e.g., 2-5" />
              </div>
              <div>
                <Label htmlFor="lgv_time_window_start">Time Window Start</Label>
                <Input id="lgv_time_window_start" type="time" value={formData.lgv_time_window_start || ''} onChange={(e) => handleChange('lgv_time_window_start', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="lgv_time_window_end">Time Window End</Label>
                <Input id="lgv_time_window_end" type="time" value={formData.lgv_time_window_end || ''} onChange={(e) => handleChange('lgv_time_window_end', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card id="psv-details">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                PSV / Bus & Coach Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="passengers">Passengers</Label>
                <Input id="passengers" type="number" value={formData.passengers || ''} onChange={(e) => handleChange('passengers', e.target.value)} placeholder="e.g., 45" />
              </div>
              <div>
                <Label>Wheelchair Access</Label>
                <div className="flex items-center gap-2 py-2">
                  <Switch checked={!!formData.wheelchair_access} onCheckedChange={(v) => handleChange('wheelchair_access', v)} />
                  <span className="text-sm text-gray-600">Accessible vehicle required</span>
                </div>
              </div>
              <div>
                <Label htmlFor="service_type">Service Type</Label>
                <Input id="service_type" value={formData.service_type || ''} onChange={(e) => handleChange('service_type', e.target.value)} placeholder="e.g., private hire" />
              </div>
              <div>
                <Label htmlFor="pickup_time">Pickup Time</Label>
                <Input id="pickup_time" type="time" value={formData.pickup_time || ''} onChange={(e) => handleChange('pickup_time', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="return_time">Return Time</Label>
                <Input id="return_time" type="time" value={formData.return_time || ''} onChange={(e) => handleChange('return_time', e.target.value)} />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="route_stops">Route Stops (one per line)</Label>
                <Textarea id="route_stops" value={formData.route_stops || ''} onChange={(e) => handleChange('route_stops', e.target.value)} placeholder={"Stop 1\nStop 2\nStop 3"} />
              </div>
            </CardContent>
          </Card>
        )}

        {formData.booking_type && (
          <Card id="booking-details">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Booking-specific Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(formData.booking_type === 'multidrop' || formData.booking_type === 'shuttle' || formData.booking_type === 'rail_replacement' || formData.booking_type === 'school_run' || formData.booking_type === 'tour' || formData.booking_type === 'event_transport' || formData.booking_type === 'wedding') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Stops / Itinerary</Label>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => addStop('pickup')}>Add Pickup</Button>
                      <Button type="button" variant="outline" onClick={() => addStop('stop')}>Add Stop</Button>
                      <Button type="button" variant="outline" onClick={() => addStop('dropoff')}>Add Drop-off</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {formData.stops.map((s) => (
                      <div key={s.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                        <div className="md:col-span-2">
                          <Label>Type</Label>
                          <Select value={s.type} onValueChange={(v) => updateStop(s.id, 'type', v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pickup">Pickup</SelectItem>
                              <SelectItem value="stop">Stop</SelectItem>
                              <SelectItem value="dropoff">Drop-off</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-3">
                          <Label>Name</Label>
                          <Input value={s.name} onChange={(e) => updateStop(s.id, 'name', e.target.value)} placeholder="e.g., Church / Depot" />
                        </div>
                        <div className="md:col-span-4">
                          <Label>Address</Label>
                          <Input value={s.address} onChange={(e) => updateStop(s.id, 'address', e.target.value)} placeholder="Address" />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Time</Label>
                          <Input type="time" value={s.time || ''} onChange={(e) => updateStop(s.id, 'time', e.target.value)} />
                        </div>
                        <div className="md:col-span-1">
                          <Button type="button" variant="outline" onClick={() => removeStop(s.id)}>Remove</Button>
                        </div>
                        <div className="md:col-span-12">
                          <Label>Notes</Label>
                          <Input value={s.notes || ''} onChange={(e) => updateStop(s.id, 'notes', e.target.value)} placeholder="Optional notes for this stop" />
                        </div>
                      </div>
                    ))}
                    {formData.stops.length === 0 && (
                      <p className="text-sm text-gray-600">No stops added yet.</p>
                    )}
                  </div>
                </div>
              )}

              {formData.booking_type === 'wedding' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <Label>Include Drinks</Label>
                      <p className="text-xs text-gray-600">Soft drinks / champagne service</p>
                    </div>
                    <Switch checked={!!formData.wedding_drinks} onCheckedChange={(v) => handleChange('wedding_drinks', v)} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <Label>Include Food</Label>
                      <p className="text-xs text-gray-600">Catering / snacks on board</p>
                    </div>
                    <Switch checked={!!formData.wedding_food} onCheckedChange={(v) => handleChange('wedding_food', v)} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <Label>Include Decorations</Label>
                      <p className="text-xs text-gray-600">Ribbons / signage / interior decor</p>
                    </div>
                    <Switch checked={!!formData.wedding_decorations} onCheckedChange={(v) => handleChange('wedding_decorations', v)} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Wedding Notes</Label>
                    <Textarea value={formData.wedding_notes || ''} onChange={(e) => handleChange('wedding_notes', e.target.value)} placeholder="Any special requirements for the wedding party" />
                  </div>
                </div>
              )}

              {formData.booking_type === 'shuttle' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shuttle_frequency_mins">Frequency (mins)</Label>
                    <Input id="shuttle_frequency_mins" type="number" value={formData.shuttle_frequency_mins || ''} onChange={(e) => handleChange('shuttle_frequency_mins', e.target.value)} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <Label>Loop Route</Label>
                      <p className="text-xs text-gray-600">Return to start after last stop</p>
                    </div>
                    <Switch checked={!!formData.shuttle_loop} onCheckedChange={(v) => handleChange('shuttle_loop', v)} />
                  </div>
                  <div>
                    <Label htmlFor="shuttle_loops_count">Number of Loops</Label>
                    <Input id="shuttle_loops_count" type="number" value={formData.shuttle_loops_count || ''} onChange={(e) => handleChange('shuttle_loops_count', e.target.value)} />
                  </div>
                </div>
              )}

              {formData.booking_type === 'rail_replacement' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rail_line">Rail Line</Label>
                    <Input id="rail_line" value={formData.rail_line || ''} onChange={(e) => handleChange('rail_line', e.target.value)} placeholder="e.g., Great Western" />
                  </div>
                  <div>
                    <Label htmlFor="rail_disruption_start">Disruption Start</Label>
                    <Input id="rail_disruption_start" type="datetime-local" value={formData.rail_disruption_start || ''} onChange={(e) => handleChange('rail_disruption_start', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="rail_disruption_end">Disruption End</Label>
                    <Input id="rail_disruption_end" type="datetime-local" value={formData.rail_disruption_end || ''} onChange={(e) => handleChange('rail_disruption_end', e.target.value)} />
                  </div>
                </div>
              )}

              {formData.booking_type === 'school_run' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="school_name">School Name</Label>
                    <Input id="school_name" value={formData.school_name || ''} onChange={(e) => handleChange('school_name', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="year_group">Year Group</Label>
                    <Input id="year_group" value={formData.year_group || ''} onChange={(e) => handleChange('year_group', e.target.value)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card id="submit">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Button onClick={handleSubmit} disabled={createJobMutation.isPending || !formData.title || !formData.customer_name} size="lg" className="px-8 py-3">
                {createJobMutation.isPending ? 'Creating…' : 'Create Job'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DefaultViewPageLayout>
  );
};

export default CreateJob;


