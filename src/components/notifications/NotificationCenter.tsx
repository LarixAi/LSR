import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  Settings, 
  MessageSquare, 
  UserPlus, 
  Mail, 
  FileText, 
  Download,
  MoreHorizontal,
  Clock,
  Circle
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'comment' | 'follow' | 'invitation' | 'file_share';
  user: {
    name: string;
    avatar: string;
    status: 'online' | 'away' | 'offline';
  };
  title: string;
  content?: string;
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  project?: string;
  actions?: {
    label: string;
    variant: 'default' | 'outline';
    action: () => void;
  }[];
  file?: {
    name: string;
    type: string;
    size: string;
  };
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'comment',
      user: {
        name: 'Amélie',
        avatar: '/avatars/amelie.jpg',
        status: 'online'
      },
      title: 'Amélie commented in Dashboard 2.0',
      content: 'Really love this approach. I think this is the best solution for the document sync UX issue.',
      timestamp: 'Friday 3:12 PM',
      timeAgo: '2 hours ago',
      isRead: false,
      project: 'Dashboard 2.0'
    },
    {
      id: '2',
      type: 'follow',
      user: {
        name: 'Sienna',
        avatar: '/avatars/sienna.jpg',
        status: 'away'
      },
      title: 'Sienna followed you',
      timestamp: 'Friday 3:04 PM',
      timeAgo: '2 hours ago',
      isRead: false
    },
    {
      id: '3',
      type: 'invitation',
      user: {
        name: 'Ammar',
        avatar: '/avatars/ammar.jpg',
        status: 'offline'
      },
      title: 'Ammar invited you to Blog design',
      timestamp: 'Friday 2:22 PM',
      timeAgo: '3 hours ago',
      isRead: true,
      project: 'Blog design',
      actions: [
        {
          label: 'Decline',
          variant: 'outline',
          action: () => handleInvitationAction('3', 'decline')
        },
        {
          label: 'Accept',
          variant: 'default',
          action: () => handleInvitationAction('3', 'accept')
        }
      ]
    },
    {
      id: '4',
      type: 'file_share',
      user: {
        name: 'Mathilde',
        avatar: '/avatars/mathilde.jpg',
        status: 'online'
      },
      title: 'Mathilde shared a file in Dashboard 2.0',
      timestamp: 'Friday 1:40 PM',
      timeAgo: '4 hours ago',
      isRead: true,
      project: 'Dashboard 2.0',
      file: {
        name: 'Prototype recording 01.mp4',
        type: 'MP4',
        size: '14 MB'
      }
    }
  ]);

  const handleInvitationAction = (notificationId: string, action: 'accept' | 'decline') => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ));
    
    // Handle the action
    if (action === 'accept') {
      console.log('Accepted invitation for notification:', notificationId);
    } else {
      console.log('Declined invitation for notification:', notificationId);
    }
  };

  const handleFileDownload = (notificationId: string) => {
    console.log('Downloading file for notification:', notificationId);
    // Add download logic here
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      isRead: true
    })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'follow':
        return <UserPlus className="w-4 h-4" />;
      case 'invitation':
        return <Mail className="w-4 h-4" />;
      case 'file_share':
        return <FileText className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'verified') return notification.user.status === 'online';
    if (activeTab === 'mentions') return notification.type === 'comment';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
      <Card className="w-96 max-h-[600px] shadow-xl">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Your notifications</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-50">
            <TabsTrigger value="all" className="flex items-center gap-2">
              View all
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-0">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar with status indicator */}
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                          <AvatarFallback className="bg-gray-200 text-gray-600">
                            {notification.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(notification.user.status)}`} />
                      </div>

                      {/* Notification content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 leading-relaxed">
                              {notification.title.split('**').map((part, index) => 
                                index % 2 === 1 ? (
                                  <strong key={index}>{part}</strong>
                                ) : (
                                  part
                                )
                              )}
                            </p>
                            
                            {/* Comment content */}
                            {notification.content && (
                              <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                                <p className="text-sm text-gray-700">{notification.content}</p>
                              </div>
                            )}

                            {/* File attachment */}
                            {notification.file && (
                              <div className="mt-2 flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">{notification.file.type}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">{notification.file.size}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFileDownload(notification.id)}
                                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            )}

                            {/* Action buttons */}
                            {notification.actions && (
                              <div className="mt-3 flex items-center gap-2">
                                {notification.actions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant={action.variant as any}
                                    size="sm"
                                    onClick={action.action}
                                    className="text-xs"
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Timestamps and read indicator */}
                          <div className="flex flex-col items-end gap-1 ml-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{notification.timestamp}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{notification.timeAgo}</span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};