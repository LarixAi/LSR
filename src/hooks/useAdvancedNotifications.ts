import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface NotificationMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  recipient_id?: string;
  recipient_role?: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  category: 'general' | 'safety' | 'schedule' | 'maintenance' | 'emergency';
  channels: ('in_app' | 'push' | 'email' | 'sms')[];
  scheduled_for?: string;
  sent_at?: string;
  read_at?: string;
  delivered_at?: string;
  metadata?: Record<string, any>;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  category: 'general' | 'safety' | 'schedule' | 'maintenance' | 'emergency';
  is_default: boolean;
  organization_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  organization_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  categories: Record<string, Record<string, boolean>>;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationParams {
  recipientType: 'specific' | 'role' | 'all';
  recipientId?: string;
  recipientRole?: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  category: 'general' | 'safety' | 'schedule' | 'maintenance' | 'emergency';
  channels: ('in_app' | 'push' | 'email' | 'sms')[];
  scheduledFor?: string;
  isScheduled: boolean;
}

// Hook for fetching sent notifications
export const useSentNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sent-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notification_messages')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as NotificationMessage[] || [];
    },
    enabled: !!user?.id
  });
};

// Hook for fetching received notifications
export const useReceivedNotifications = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['received-notifications', user?.id],
    queryFn: async () => {
      // Early return if user or profile is not available
      if (!user?.id) {
        console.log('User not authenticated, returning empty array for received notifications');
        return [];
      }
      
      if (!profile?.organization_id) {
        console.log('Profile or organization not available, returning empty array for received notifications');
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('notification_messages')
          .select('*')
          .or(`recipient_id.eq.${user.id},and(recipient_role.eq.${profile.role},organization_id.eq.${profile.organization_id})`)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching received notifications:', error);
          
          // If table doesn't exist, return empty array
          if (error.code === '42P01' || error.message.includes('does not exist')) {
            console.warn('Notification messages table may not exist, returning empty array');
            return [];
          }
          
          throw error;
        }
        
        return data as NotificationMessage[] || [];
      } catch (err) {
        console.error('Unexpected error in useReceivedNotifications:', err);
        return [];
      }
    },
    enabled: !!user?.id && !!profile?.organization_id,
    retry: 2,
    retryDelay: 1000,
    // Add staleTime to prevent unnecessary refetches
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
};

// Hook for fetching notification templates
export const useNotificationTemplates = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['notification-templates', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .or(`organization_id.eq.${profile.organization_id},is_default.eq.true`)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as NotificationTemplate[] || [];
    },
    enabled: !!profile?.organization_id
  });
};

// Hook for fetching notification settings
export const useNotificationSettings = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['notification-settings', user?.id, profile?.organization_id],
    queryFn: async () => {
      if (!user?.id || !profile?.organization_id) return null;
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', profile.organization_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data as NotificationSettings | null;
    },
    enabled: !!user?.id && !!profile?.organization_id
  });
};

// Hook for sending notifications
export const useSendNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (params: CreateNotificationParams) => {
      if (!user?.id || !profile?.organization_id) {
        throw new Error('User not authenticated or organization not found');
      }

      const notificationData = {
        sender_id: user.id,
        sender_name: `${profile.first_name} ${profile.last_name}`,
        sender_role: profile.role,
        recipient_id: params.recipientType === 'specific' ? params.recipientId : null,
        recipient_role: params.recipientType === 'role' ? params.recipientRole : null,
        title: params.title,
        body: params.body,
        type: params.type,
        priority: params.priority,
        category: params.category,
        channels: params.channels,
        scheduled_for: params.isScheduled && params.scheduledFor ? params.scheduledFor : null,
        organization_id: profile.organization_id,
        metadata: {
          sent_via: 'advanced_notification_system',
          recipient_type: params.recipientType
        }
      };

      const { data, error } = await supabase
        .from('notification_messages')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;
      return data as NotificationMessage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sent-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['received-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      
      toast({
        title: "Notification Sent",
        description: "Your notification has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send notification: " + error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for marking notifications as read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notification_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
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

// Hook for updating notification settings
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      if (!user?.id || !profile?.organization_id) {
        throw new Error('User not authenticated or organization not found');
      }

      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          organization_id: profile.organization_id,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as NotificationSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast({
        title: "Settings Updated",
        description: "Your notification settings have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update settings: " + error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for notification statistics
export const useNotificationStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['notification-stats', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      
      const { data, error } = await supabase
        .from('notification_stats')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile?.organization_id
  });
};

// Hook for real-time notifications
export const useRealTimeNotifications = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id || !profile?.organization_id) return;

    const channel = supabase
      .channel('notification-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificationMessage;
          
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
          } else {
            toast({
              title: newNotification.title,
              description: newNotification.body,
              duration: 3000,
            });
          }
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['received-notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notification_messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['received-notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, profile?.organization_id, queryClient, toast]);
};

// Hook for getting unread notification count
export const useUnreadNotificationCount = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['unread-notification-count', user?.id, profile?.organization_id],
    queryFn: async () => {
      // Early return if user or profile is not available
      if (!user?.id) {
        console.log('User not authenticated, returning 0 for unread notifications');
        return 0;
      }
      
      if (!profile?.organization_id) {
        console.log('Profile or organization not available, returning 0 for unread notifications');
        return 0;
      }
      
      try {
        console.log('Fetching unread notifications for user:', user.id);
        
        // Check if notification_messages table exists by trying a simple query first
        const { data, error } = await supabase
          .from('notification_messages')
          .select('id')
          .eq('recipient_id', user.id)
          .is('read_at', null)
          .limit(1);

        if (error) {
          console.error('Error fetching unread notifications:', error);
          
          // If table doesn't exist or other database error, return 0
          if (error.code === '42P01' || error.message.includes('does not exist')) {
            console.warn('Notification messages table may not exist, returning 0');
            return 0;
          }
          
          // For other errors, still return 0 but log the error
          return 0;
        }
        
        // Get the full count
        const { data: countData, error: countError } = await supabase
          .from('notification_messages')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .is('read_at', null);

        if (countError) {
          console.error('Error getting unread notification count:', countError);
          return data?.length || 0;
        }
        
        return countData?.length || 0;
      } catch (err) {
        console.error('Unexpected error in useUnreadNotificationCount:', err);
        return 0;
      }
    },
    enabled: !!user?.id && !!profile?.organization_id,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2, // Retry up to 2 times
    retryDelay: 1000, // Wait 1 second between retries
    // Add staleTime to prevent unnecessary refetches
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
};

// Hook for bulk operations
export const useBulkNotificationOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notification_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read: " + error.message,
        variant: "destructive",
      });
    }
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notification_messages')
        .delete()
        .eq('id', notificationId)
        .eq('sender_id', user.id); // Only allow deleting own sent notifications

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      
      toast({
        title: "Success",
        description: "Notification deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete notification: " + error.message,
        variant: "destructive",
      });
    }
  });

  return {
    markAllAsRead,
    deleteNotification
  };
};


