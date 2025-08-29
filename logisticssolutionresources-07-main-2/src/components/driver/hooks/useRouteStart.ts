
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface RouteAssignment {
  id: string;
  route_id: string;
  driver_id: string;
  vehicle_id?: string;
  status: string;
  routes?: {
    name: string;
    start_location: string;
    end_location: string;
  };
  vehicles?: {
    vehicle_number: string;
    make: string;
    model: string;
  };
}

interface RouteStudent {
  id: string;
  name: string;
  pickup_location: string;
  pickup_time: string;
  parent_id?: string;
}

export const useRouteStart = (assignment: RouteAssignment | null, routeStudents: RouteStudent[], userId: string) => {
  const [routeStarted, setRouteStarted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startRouteMutation = useMutation({
    mutationFn: async () => {
      if (!assignment?.routes || !routeStudents) return;

      // Mock the route start functionality since notifications and route_communications tables don't exist
      console.log('Route started for assignment:', assignment);
      console.log('Students on route:', routeStudents);
      console.log('Driver ID:', userId);

      // Simulate sending notifications to parents
      const mockNotifications = routeStudents.map(student => ({
        user_id: student.parent_id,
        title: 'School Transport Started',
        message: `Driver ${assignment.vehicles?.vehicle_number} has started the route. Your child will be picked up soon.`,
        type: 'route_started',
        route_id: assignment.route_id
      }));

      console.log('Mock notifications that would be sent:', mockNotifications);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      setRouteStarted(true);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Route Started",
        description: "Route has been started successfully.",
      });
    },
    onError: (error) => {
      console.error('Start route error:', error);
      toast({
        title: "Error",
        description: "Failed to start route. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    routeStarted,
    startRouteMutation
  };
};
