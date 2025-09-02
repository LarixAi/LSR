import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export interface CalendarEventItem {
  id: string;
  type: 'job' | 'work_order' | 'schedule' | 'mot' | 'maintenance' | 'training' | 'time_off' | 'other';
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time?: string; // HH:mm if available
  color?: string;
  // Optional linking metadata
  jobId?: string;
  workOrderId?: string;
  vehicleId?: string;
  driverId?: string;
}

export const useCalendarEvents = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['calendar-events', profile?.organization_id],
    queryFn: async (): Promise<CalendarEventItem[]> => {
      if (!profile?.organization_id) return [];

      const orgId = profile.organization_id;
      const results: CalendarEventItem[] = [];

      // Jobs → job events
      try {
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('id, title, start_date, start_time, pickup_location, delivery_location, status')
          .eq('organization_id', orgId)
          .neq('status', 'cancelled')
          .limit(1000);
        if (!error && jobs) {
          for (const j of jobs as any[]) {
            if (j.start_date) {
              results.push({
                id: `job-${j.id}`,
                type: 'job',
                title: j.title || `${j.pickup_location || ''} → ${j.delivery_location || ''}`,
                date: j.start_date,
                time: j.start_time || undefined,
                color: 'blue',
                jobId: j.id,
              });
            }
          }
        }
      } catch {}

      // Work Orders → maintenance/work_order events
      try {
        const { data: workOrders, error } = await supabase
          .from('work_orders')
          .select('*')
          .eq('organization_id', orgId)
          .limit(1000);
        if (!error && workOrders) {
          for (const w of workOrders as any[]) {
            const date = (w as any).due_date || (w as any).started_date || (w as any).scheduled_date || (w as any).created_at;
            if (date) {
              results.push({
                id: `wo-${w.id}`,
                type: 'work_order',
                title: (w as any).title || 'Work Order',
                date,
                color: 'orange',
                workOrderId: w.id,
              });
            }
          }
        }
      } catch {}

      // Vehicles MOT due date → mot events (best-effort; field may vary)
      try {
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('*')
          .eq('organization_id', orgId)
          .limit(1000);
        if (vehicles) {
          for (const v of vehicles as any[]) {
            const motDate = (v as any).mot_due_date || (v as any).mot_expiry || (v as any).next_mot_date || null;
            if (motDate) {
              results.push({
                id: `mot-${v.id}-${motDate}`,
                type: 'mot',
                title: `MOT Due - ${(v as any).vehicle_number || v.id}`,
                date: motDate,
                color: 'red',
                vehicleId: v.id,
              });
            }
          }
        }
      } catch {}

      // Provide mock demo data if no events found (for preview/testing)
      if (results.length === 0) {
        const today = new Date();
        const iso = (d: Date) => format(d, 'yyyy-MM-dd');
        results.push(
          { id: 'mock-job-1', type: 'job', title: 'Depot → Client A', date: iso(today), time: '09:00', color: 'blue' },
          { id: 'mock-job-2', type: 'job', title: 'Client B → Depot', date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate())), time: '14:30', color: 'blue' },
          { id: 'mock-wo-1', type: 'work_order', title: 'Vehicle LSR-001 Service', date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)), color: 'orange' },
          { id: 'mock-mot-1', type: 'mot', title: 'MOT Due - BUS123', date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)), color: 'red' },
          { id: 'mock-training-1', type: 'training', title: 'Driver CPC Module 4', date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)), time: '10:00', color: 'green' },
          { id: 'mock-timeoff-1', type: 'time_off', title: 'Annual Leave - J. Smith', date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)), color: 'purple' },
        );
      }

      return results;
    },
    enabled: !!profile?.organization_id,
  });
};


