import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ParentScheduleItem {
  id: string;
  childName: string;
  type: 'pickup' | 'dropoff';
  time: string;
  location: string;
  driverName: string;
  vehicleNumber: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  childId: number;
  routeId?: string;
  routeName?: string;
  assignmentDate: string;
}

export const useParentSchedules = (selectedDate?: Date) => {
  const { user } = useAuth();
  const date = selectedDate || new Date();
  const dateString = date.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['parent-schedules', user?.id, dateString],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('Fetching parent schedules for date:', dateString);

      try {
        // First, get the parent's children
        const { data: children, error: childrenError } = await supabase
          .from('child_profiles')
          .select('*')
          .eq('parent_id', user.id)
          .eq('is_active', true);

        if (childrenError) {
          console.error('Error fetching children:', childrenError);
          throw childrenError;
        }

        if (!children || children.length === 0) {
          console.log('No children found for parent');
          return [];
        }

        // Get route assignments for today
        const { data: routeAssignments, error: routeError } = await supabase
          .from('route_assignments')
          .select('*')
          .eq('assignment_date', dateString)
          .eq('status', 'active')
          .eq('is_active', true);

        if (routeError) {
          console.error('Error fetching route assignments:', routeError);
          throw routeError;
        }

        // Get route details
        const routeIds = routeAssignments?.map(ra => ra.route_id).filter(Boolean) || [];
        const { data: routes } = routeIds.length > 0 ? await supabase
          .from('routes')
          .select('id, name, start_location, end_location')
          .in('id', routeIds) : { data: [] };

        // Get driver details
        const driverIds = routeAssignments?.map(ra => ra.driver_id).filter(Boolean) || [];
        const { data: drivers } = driverIds.length > 0 ? await supabase
          .from('profiles')
          .select('id, first_name, last_name, phone')
          .in('id', driverIds) : { data: [] };

        // Get vehicle details
        const vehicleIds = routeAssignments?.map(ra => ra.vehicle_id).filter(Boolean) || [];
        const { data: vehicles } = vehicleIds.length > 0 ? await supabase
          .from('vehicles')
          .select('id, vehicle_number, license_plate')
          .in('id', vehicleIds) : { data: [] };

        // Build schedule items
        const scheduleItems: ParentScheduleItem[] = [];

        for (const child of children) {
          // Find route assignment for this child's route
          const childRouteAssignment = routeAssignments?.find(ra => ra.route_id === child.route_id);
          
          if (childRouteAssignment) {
            const route = routes?.find(r => r.id === childRouteAssignment.route_id);
            const driver = drivers?.find(d => d.id === childRouteAssignment.driver_id);
            const vehicle = vehicles?.find(v => v.id === childRouteAssignment.vehicle_id);

            if (route && driver && vehicle) {
              // Add pickup schedule
              if (child.pickup_time) {
                scheduleItems.push({
                  id: `pickup-${child.id}-${childRouteAssignment.id}`,
                  childName: `${child.first_name} ${child.last_name}`,
                  type: 'pickup',
                  time: child.pickup_time,
                  location: child.pickup_location || route.start_location || 'Pickup Location',
                  driverName: `${driver.first_name || 'Unknown'} ${driver.last_name || 'Driver'}`,
                  vehicleNumber: vehicle.vehicle_number,
                  status: 'scheduled', // You can enhance this with real-time tracking
                  childId: child.id,
                  routeId: child.route_id,
                  routeName: route.name,
                  assignmentDate: dateString
                });
              }

              // Add dropoff schedule
              if (child.dropoff_time) {
                scheduleItems.push({
                  id: `dropoff-${child.id}-${childRouteAssignment.id}`,
                  childName: `${child.first_name} ${child.last_name}`,
                  type: 'dropoff',
                  time: child.dropoff_time,
                  location: child.dropoff_location || route.end_location || 'Dropoff Location',
                  driverName: `${driver.first_name || 'Unknown'} ${driver.last_name || 'Driver'}`,
                  vehicleNumber: vehicle.vehicle_number,
                  status: 'scheduled', // You can enhance this with real-time tracking
                  childId: child.id,
                  routeId: child.route_id,
                  routeName: route.name,
                  assignmentDate: dateString
                });
              }
            }
          }
        }

        // Sort by time
        scheduleItems.sort((a, b) => {
          const timeA = new Date(`2000-01-01T${a.time}`);
          const timeB = new Date(`2000-01-01T${b.time}`);
          return timeA.getTime() - timeB.getTime();
        });

        console.log('Generated parent schedule items:', scheduleItems);
        return scheduleItems;

      } catch (error) {
        console.error('Error in useParentSchedules:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
};

export const useParentScheduleStats = (selectedDate?: Date) => {
  const { data: schedules = [] } = useParentSchedules(selectedDate);

  return {
    totalTrips: schedules.length,
    pickups: schedules.filter(item => item.type === 'pickup').length,
    dropoffs: schedules.filter(item => item.type === 'dropoff').length,
    completed: schedules.filter(item => item.status === 'completed').length,
    inProgress: schedules.filter(item => item.status === 'in_progress').length,
    delayed: schedules.filter(item => item.status === 'delayed').length,
  };
};
