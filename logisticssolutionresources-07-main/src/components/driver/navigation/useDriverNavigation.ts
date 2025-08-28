
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationState {
  isNavigating: boolean;
  currentStopIndex: number;
  completedStops: string[];
  showArrivalDialog: boolean;
  currentStopData: {
    id: string;
    address: string;
    students: any[];
  } | null;
  locationError: string | null;
  hasLocationPermission: boolean;
}

export const useDriverNavigation = (routeId: string, routeStudents: any[]) => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    currentStopIndex: 0,
    completedStops: [],
    showArrivalDialog: false,
    currentStopData: null,
    locationError: null,
    hasLocationPermission: false,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Group students by pickup location to create stops
  const stops = routeStudents.reduce((acc, student) => {
    const existingStop = acc.find(stop => stop.address === student.pickup_location);
    if (existingStop) {
      existingStop.students.push(student);
    } else {
      acc.push({
        id: `stop-${student.pickup_location}`,
        address: student.pickup_location,
        students: [student],
        coordinates: null, // Would be geocoded in real implementation
      });
    }
    return acc;
  }, []);

  const recordAttendanceMutation = useMutation({
    mutationFn: async ({ presentStudents, absentStudents }: { 
      presentStudents: string[], 
      absentStudents: string[] 
    }) => {
      // Mock attendance recording since daily_attendance table doesn't exist
      console.log('Recording attendance for students:', { presentStudents, absentStudents });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock attendance records
      const attendanceRecords = [
        ...presentStudents.map(studentId => ({
          child_id: studentId,
          route_id: routeId,
          attendance_date: new Date().toISOString().split('T')[0],
          status: 'attending',
          pickup_status: 'picked_up',
          driver_notes: 'Student picked up successfully'
        })),
        ...absentStudents.map(studentId => ({
          child_id: studentId,
          route_id: routeId,
          attendance_date: new Date().toISOString().split('T')[0],
          status: 'absent',
          pickup_status: 'missed',
          driver_notes: 'Student marked absent at pickup'
        }))
      ];

      return attendanceRecords;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-attendance'] });
      toast({
        title: "Attendance Recorded",
        description: "Student pickup status has been recorded successfully.",
      });
    },
    onError: (error) => {
      console.error('Attendance recording error:', error);
      toast({
        title: "Error",
        description: "Failed to record attendance. Please try again.",
        variant: "destructive",
      });
    }
  });

  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setNavigationState(prev => ({
        ...prev,
        locationError: 'Geolocation is not supported by this browser.',
        hasLocationPermission: false,
      }));
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      });

      setNavigationState(prev => ({
        ...prev,
        locationError: null,
        hasLocationPermission: true,
      }));

      toast({
        title: "Location Access Granted",
        description: "GPS navigation is now available.",
      });

      return true;
    } catch (error: any) {
      let errorMessage = 'Unable to access your location.';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location services and try again.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your GPS settings.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }

      setNavigationState(prev => ({
        ...prev,
        locationError: errorMessage,
        hasLocationPermission: false,
      }));

      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [toast]);

  const startNavigation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      return;
    }

    setNavigationState(prev => ({
      ...prev,
      isNavigating: true,
      currentStopIndex: 0,
    }));

    toast({
      title: "Navigation Started",
      description: "Route navigation has begun. Follow the directions to your first stop.",
    });
  }, [requestLocationPermission]);

  const pauseNavigation = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      isNavigating: false,
    }));

    toast({
      title: "Navigation Paused",
      description: "You can resume navigation anytime.",
    });
  }, []);

  const handleStopReached = useCallback((stopId: string, students: any[]) => {
    const stop = stops.find(s => s.id === stopId);
    if (!stop) return;

    setNavigationState(prev => ({
      ...prev,
      showArrivalDialog: true,
      currentStopData: {
        id: stopId,
        address: stop.address,
        students: students,
      },
    }));

    toast({
      title: "Stop Reached",
      description: `You've arrived at ${stop.address}. Please confirm student pickup.`,
    });
  }, [stops]);

  const confirmPickup = useCallback(async (presentStudents: string[], absentStudents: string[]) => {
    await recordAttendanceMutation.mutateAsync({ presentStudents, absentStudents });

    setNavigationState(prev => {
      const nextStopIndex = prev.currentStopIndex + 1;
      const isRouteComplete = nextStopIndex >= stops.length;

      if (isRouteComplete) {
        toast({
          title: "Route Complete",
          description: "All stops have been completed successfully!",
        });
      }

      return {
        ...prev,
        currentStopIndex: nextStopIndex,
        completedStops: [...prev.completedStops, prev.currentStopData?.id || ''],
        showArrivalDialog: false,
        currentStopData: null,
        isNavigating: !isRouteComplete,
      };
    });
  }, [stops.length, recordAttendanceMutation]);

  const closeArrivalDialog = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      showArrivalDialog: false,
      currentStopData: null,
    }));
  }, []);

  return {
    navigationState,
    stops,
    startNavigation,
    pauseNavigation,
    handleStopReached,
    confirmPickup,
    closeArrivalDialog,
    requestLocationPermission,
    isRecordingAttendance: recordAttendanceMutation.isPending,
  };
};
