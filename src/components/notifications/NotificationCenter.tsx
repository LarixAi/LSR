import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { LoadingState } from '@/components/ui/loading-state';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id, filter],
    queryFn: async () => {
      if (!user) return [];

      // Mock notifications since table doesn't exist yet
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'info',
          title: 'Welcome to the platform',
          message: 'Your account has been successfully set up.',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'success',
          title: 'Profile updated',
          message: 'Your profile information has been updated successfully.',
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      return filter === 'unread' 
        ? mockNotifications.filter(n => !n.read)
        : mockNotifications;
    },
    enabled: !!user
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Mock implementation
      console.log('Marking notification as read:', notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // Mock implementation
      console.log('Marking all notifications as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Mock implementation
      console.log('Deleting notification:', notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-primary" />
            <CardTitle>Notification Center</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" onClick={() => setFilter('all')}>
              All ({notifications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="unread" onClick={() => setFilter('unread')}>
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <NotificationList 
              notifications={notifications || []}
              onMarkAsRead={markAsReadMutation.mutate}
              onDelete={deleteNotificationMutation.mutate}
              getIcon={getNotificationIcon}
            />
          </TabsContent>
          
          <TabsContent value="unread" className="mt-4">
            <NotificationList 
              notifications={notifications?.filter(n => !n.read) || []}
              onMarkAsRead={markAsReadMutation.mutate}
              onDelete={deleteNotificationMutation.mutate}
              getIcon={getNotificationIcon}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getIcon: (type: string) => React.ReactNode;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  getIcon
}) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No notifications to display
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start space-x-3 p-4 rounded-lg border ${
            notification.read ? 'bg-background' : 'bg-muted/50'
          }`}
        >
          <div className="mt-1">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    Mark Read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(notification.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;