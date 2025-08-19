import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Child {
  id: number;
  parent_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade_level?: string;
  pickup_location?: string;
  dropoff_location?: string;
  pickup_time?: string;
  dropoff_time?: string;
  route_id?: string;
  school_id?: string;
  is_active: boolean;
  emergency_contacts?: any;
  medical_conditions?: string;
  special_requirements?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ParentNotification {
  id: string;
  parent_id: string;
  child_id?: number;
  type: 'info' | 'alert' | 'pickup' | 'dropoff' | 'delay' | 'emergency';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

export interface ChildTracking {
  id: string;
  child_id: number;
  event_type: 'pickup' | 'dropoff' | 'boarding' | 'alighting' | 'absent';
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  timestamp: string;
  notes?: string;
  vehicle_id?: string;
  driver_id?: string;
}

export interface ParentStats {
  totalChildren: number;
  childrenOnRoute: number;
  unreadNotifications: number;
  todaysPickups: number;
}

export const useParentData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch children
  const {
    data: children = [],
    isLoading: childrenLoading,
    error: childrenError,
    refetch: refetchChildren
  } = useQuery({
    queryKey: ['parent-children', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', user.id)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['parent-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('parent_notifications')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch child tracking for today
  const {
    data: trackingData = [],
    isLoading: trackingLoading,
    error: trackingError,
    refetch: refetchTracking
  } = useQuery({
    queryKey: ['parent-tracking', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('child_tracking')
        .select(`
          *,
          child_profiles!inner(parent_id)
        `)
        .eq('child_profiles.parent_id', user.id)
        .gte('timestamp', `${today}T00:00:00`)
        .lte('timestamp', `${today}T23:59:59`)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Calculate stats
  const stats: ParentStats = {
    totalChildren: children.length,
    childrenOnRoute: trackingData.filter(t => 
      t.event_type === 'pickup' || t.event_type === 'boarding'
    ).length,
    unreadNotifications: notifications.filter(n => !n.is_read).length,
    todaysPickups: children.filter(c => c.pickup_time).length
  };

  // Mark notification as read
  const markNotificationRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('parent_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-notifications'] });
      toast({
        title: "Notification marked as read",
        description: "The notification has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  });

  // Refresh all data
  const refreshAllData = async () => {
    await Promise.all([
      refetchChildren(),
      refetchNotifications(),
      refetchTracking()
    ]);
    
    toast({
      title: "Data refreshed",
      description: "All information has been updated.",
    });
  };

  // Get child status based on tracking data
  const getChildStatus = (childId: number): 'on_route' | 'at_school' | 'at_home' | 'pickup_scheduled' => {
    const childTracking = trackingData.filter(t => t.child_id === childId);
    
    if (childTracking.length === 0) return 'pickup_scheduled';
    
    const latestEvent = childTracking[0];
    
    switch (latestEvent.event_type) {
      case 'pickup':
      case 'boarding':
        return 'on_route';
      case 'dropoff':
      case 'alighting':
        return 'at_school';
      default:
        return 'at_home';
    }
  };

  return {
    // Data
    children,
    notifications,
    trackingData,
    stats,
    
    // Loading states
    childrenLoading,
    notificationsLoading,
    trackingLoading,
    isLoading: childrenLoading || notificationsLoading || trackingLoading,
    
    // Errors
    childrenError,
    notificationsError,
    trackingError,
    
    // Actions
    markNotificationRead,
    refreshAllData,
    getChildStatus,
    
    // Refetch functions
    refetchChildren,
    refetchNotifications,
    refetchTracking
  };
};
