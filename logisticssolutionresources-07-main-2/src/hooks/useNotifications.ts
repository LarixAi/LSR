// @ts-nocheck
import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Notification = Tables<'enhanced_notifications'>;
type LegacyNotification = Tables<'notifications'>;

interface CreateNotificationParams {
  userId: string;
  title: string;
  body: string;
  type?: 'schedule' | 'vehicle' | 'incident' | 'feedback' | 'emergency' | 'compliance' | 'maintenance' | 'info';
  priority?: 'low' | 'normal' | 'high' | 'emergency';
  linkedJobId?: string;
  linkedVehicleId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const useNotifications = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user notifications (enhanced)
  const { data: notifications = [], isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['enhanced-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id || !profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('enhanced_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!profile?.organization_id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch legacy notifications for backward compatibility
  const { data: legacyNotifications = [] } = useQuery({
    queryKey: ['notifications', user?.id, profile?.organization_id],
    queryFn: async () => {
      if (!user?.id || !profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LegacyNotification[];
    },
    enabled: !!user?.id && !!profile?.organization_id
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async (params: CreateNotificationParams) => {
      if (!profile?.organization_id) {
        throw new Error('Organization not found');
      }

      const { data, error } = await supabase
        .from('enhanced_notifications')
        .insert({
          user_id: params.userId,
          sender_id: user?.id || null,
          organization_id: profile.organization_id,
          title: params.title,
          body: params.body,
          type: params.type || 'info',
          priority: params.priority || 'normal',
          linked_job_id: params.linkedJobId || null,
          linked_vehicle_id: params.linkedVehicleId || null,
          action_url: params.actionUrl || null,
          metadata: params.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] });
      toast({
        title: 'Notification sent',
        description: 'Notification has been sent successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send notification',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('enhanced_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] });
    },
  });

  // Legacy notification mutation for backward compatibility
  const markLegacyAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Real-time subscription for notifications
  useEffect(() => {
    if (!user?.id || !profile?.organization_id) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enhanced_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Show toast for new notifications
          if (newNotification.priority === 'emergency') {
            toast({
              title: `🚨 ${newNotification.title}`,
              description: newNotification.body,
              variant: 'destructive',
              duration: 10000,
            });
          } else if (newNotification.priority === 'high') {
            toast({
              title: newNotification.title,
              description: newNotification.body,
              duration: 5000,
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ['enhanced-notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, profile?.organization_id, queryClient, toast]);

  // Get unread notification count
  const unreadCount = notifications.filter(n => !n.is_read).length + 
                     legacyNotifications.filter(n => !n.is_read).length;

  // Helper functions
  const createNotification = useCallback(
    (params: CreateNotificationParams) => createNotificationMutation.mutate(params),
    [createNotificationMutation]
  );

  const markAsRead = useCallback(
    (notificationId: string) => markAsReadMutation.mutate(notificationId),
    [markAsReadMutation]
  );

  const markLegacyAsRead = useCallback(
    (notificationId: string) => markLegacyAsReadMutation.mutate(notificationId),
    [markLegacyAsReadMutation]
  );

  return {
    notifications,
    legacyNotifications,
    unreadCount,
    isLoadingNotifications,
    createNotification,
    markAsRead,
    markLegacyAsRead,
    isCreating: createNotificationMutation.isPending,
  };
};

// Legacy exports for backward compatibility
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read: " + error.message,
        variant: "destructive",
      });
    }
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (notificationData: Omit<LegacyNotification, 'id' | 'created_at' | 'updated_at' | 'is_read'>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required to create notification');
      }

      const dataWithDefaults = {
        ...notificationData,
        organization_id: profile.organization_id,
        is_read: false
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([dataWithDefaults])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "Notification created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create notification: " + error.message,
        variant: "destructive",
      });
    }
  });
};