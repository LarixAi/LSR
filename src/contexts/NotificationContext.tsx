import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = async () => {
    if (!user?.id || !profile?.organization_id) {
      setUnreadCount(0);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Import supabase dynamically to avoid SSR issues
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error: queryError } = await supabase
        .from('notification_messages')
        .select('id')
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (queryError) {
        console.error('Error fetching unread notifications:', queryError);
        setError('Failed to fetch notifications');
        setUnreadCount(0);
      } else {
        setUnreadCount(data?.length || 0);
        setError(null);
      }
    } catch (err) {
      console.error('Unexpected error in notification context:', err);
      setError('Unexpected error occurred');
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotifications = () => {
    fetchUnreadCount();
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [user?.id, profile?.organization_id]);

  // Set up polling for notifications
  useEffect(() => {
    if (!user?.id || !profile?.organization_id) return;

    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id, profile?.organization_id]);

  const value: NotificationContextType = {
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};


