import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Bell, 
  Send, 
  Users, 
  User, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Search,
  X,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  useSentNotifications, 
  useReceivedNotifications, 
  useSendNotification, 
  useMarkNotificationRead,
  useUnreadNotificationCount,
  useRealTimeNotifications,
  type CreateNotificationParams
} from '@/hooks/useAdvancedNotifications';

interface NotificationRecipient {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

const HeaderNotificationSystem: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('received');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    recipientType: 'specific' as 'specific' | 'role' | 'all',
    recipientId: '',
    recipientRole: '',
    title: '',
    body: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'emergency',
    category: 'general' as 'general' | 'safety' | 'schedule' | 'maintenance' | 'emergency',
    channels: ['in_app'] as ('in_app' | 'push' | 'email' | 'sms')[],
    scheduledFor: '',
    isScheduled: false
  });

  // Hooks
  const { data: sentNotifications = [], isLoading: sentLoading } = useSentNotifications();
  const { data: receivedNotifications = [], isLoading: receivedLoading } = useReceivedNotifications();
  const sendNotificationMutation = useSendNotification();
  const markAsReadMutation = useMarkNotificationRead();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  // Enable real-time notifications
  useRealTimeNotifications();

  // Get available recipients based on user role
  const getAvailableRecipients = (): NotificationRecipient[] => {
    if (!profile?.organization_id) return [];

    switch (profile.role) {
      case 'admin':
      case 'council':
        return [
          { id: 'all_drivers', name: 'All Drivers', role: 'driver' },
          { id: 'all_mechanics', name: 'All Mechanics', role: 'mechanic' },
          { id: 'all_parents', name: 'All Parents', role: 'parent' },
          { id: 'all_admins', name: 'All Administrators', role: 'admin' }
        ];
      
      case 'driver':
        return [
          { id: 'all_admins', name: 'All Administrators', role: 'admin' },
          { id: 'all_mechanics', name: 'All Mechanics', role: 'mechanic' },
          { id: 'all_parents', name: 'All Parents', role: 'parent' }
        ];
      
      case 'parent':
        return [
          { id: 'all_drivers', name: 'All Drivers', role: 'driver' },
          { id: 'all_admins', name: 'All Administrators', role: 'admin' }
        ];
      
      case 'mechanic':
        return [
          { id: 'all_admins', name: 'All Administrators', role: 'admin' },
          { id: 'all_drivers', name: 'All Drivers', role: 'driver' }
        ];
      
      default:
        return [];
    }
  };

  // Notification templates
  const notificationTemplates = [
    {
      id: 'safety_alert',
      name: 'Safety Alert',
      title: 'Safety Alert - Immediate Action Required',
      body: 'Please review and acknowledge this safety alert. Your immediate attention is required.',
      type: 'warning' as const,
      priority: 'high' as const,
      category: 'safety' as const
    },
    {
      id: 'schedule_change',
      name: 'Schedule Change',
      title: 'Schedule Update',
      body: 'There has been a change to your schedule. Please review the updated details.',
      type: 'info' as const,
      priority: 'normal' as const,
      category: 'schedule' as const
    },
    {
      id: 'maintenance_reminder',
      name: 'Maintenance Reminder',
      title: 'Vehicle Maintenance Due',
      body: 'Your vehicle is due for maintenance. Please schedule an appointment.',
      type: 'warning' as const,
      priority: 'normal' as const,
      category: 'maintenance' as const
    },
    {
      id: 'emergency_notice',
      name: 'Emergency Notice',
      title: 'EMERGENCY - Immediate Response Required',
      body: 'This is an emergency notification requiring immediate attention.',
      type: 'error' as const,
      priority: 'emergency' as const,
      category: 'emergency' as const
    }
  ];

  // Helper functions
  const resetComposeForm = () => {
    setComposeForm({
      recipientType: 'specific',
      recipientId: '',
      recipientRole: '',
      title: '',
      body: '',
      type: 'info',
      priority: 'normal',
      category: 'general',
      channels: ['in_app'],
      scheduledFor: '',
      isScheduled: false
    });
  };

  const handleTemplateSelect = (template: any) => {
    setComposeForm(prev => ({
      ...prev,
      title: template.title,
      body: template.body,
      type: template.type,
      priority: template.priority,
      category: template.category
    }));
  };

  const handleSendNotification = async () => {
    if (!composeForm.title.trim() || !composeForm.body.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const notificationData: CreateNotificationParams = {
      recipientType: composeForm.recipientType,
      recipientId: composeForm.recipientId,
      recipientRole: composeForm.recipientRole,
      title: composeForm.title,
      body: composeForm.body,
      type: composeForm.type,
      priority: composeForm.priority,
      category: composeForm.category,
      channels: composeForm.channels,
      scheduledFor: composeForm.scheduledFor,
      isScheduled: composeForm.isScheduled
    };

    await sendNotificationMutation.mutateAsync(notificationData);
    setIsComposeOpen(false);
    resetComposeForm();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'bg-red-50 border-red-200';
      case 'safety': return 'bg-yellow-50 border-yellow-200';
      case 'maintenance': return 'bg-orange-50 border-orange-200';
      case 'schedule': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Filter notifications
  const filteredSentNotifications = sentNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

  const filteredReceivedNotifications = receivedNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

  if (!user || !profile) {
    return null;
  }

  return (
    <>
      {/* Header Notification Bell */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 hover:bg-accent"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsComposeOpen(true)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 rounded-none">
                <TabsTrigger value="received" className="rounded-none">
                  Received ({receivedNotifications.length})
                </TabsTrigger>
                <TabsTrigger value="sent" className="rounded-none">
                  Sent ({sentNotifications.length})
                </TabsTrigger>
              </TabsList>

              {/* Search and Filters */}
              <div className="p-3 border-b space-y-2">
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8"
                />
                <div className="flex space-x-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="received" className="m-0 p-0 h-full">
                  <div className="space-y-1 p-2">
                    {filteredReceivedNotifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      filteredReceivedNotifications.slice(0, 10).map((notification) => (
                        <Card 
                          key={notification.id} 
                          className={`${getCategoryColor(notification.category)} ${!notification.read_at ? 'ring-2 ring-blue-200' : ''} cursor-pointer hover:shadow-sm transition-shadow`}
                          onClick={() => {
                            if (!notification.read_at) {
                              markAsReadMutation.mutate(notification.id);
                            }
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {getNotificationIcon(notification.type)}
                                  <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                                  <Badge className={`${getPriorityColor(notification.priority)} text-xs`}>
                                    {notification.priority}
                                  </Badge>
                                  {!notification.read_at && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                  {notification.body}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>From: {notification.sender_name}</span>
                                  <span>{format(new Date(notification.created_at), 'MMM dd, HH:mm')}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="sent" className="m-0 p-0 h-full">
                  <div className="space-y-1 p-2">
                    {filteredSentNotifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No sent notifications</p>
                      </div>
                    ) : (
                      filteredSentNotifications.slice(0, 10).map((notification) => (
                        <Card key={notification.id} className={`${getCategoryColor(notification.category)} cursor-pointer hover:shadow-sm transition-shadow`}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {getNotificationIcon(notification.type)}
                                  <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                                  <Badge className={`${getPriorityColor(notification.priority)} text-xs`}>
                                    {notification.priority}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                  {notification.body}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>To: {notification.recipient_role || 'Specific User'}</span>
                                  <span>{format(new Date(notification.created_at), 'MMM dd, HH:mm')}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </div>

              {/* Footer */}
              <div className="p-3 border-t bg-muted/50">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to full notification page
                    window.location.href = '/notifications';
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            </Tabs>
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick Compose Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Message</DialogTitle>
            <DialogDescription>
              Send a quick notification to your team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Templates */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Templates</Label>
              <div className="grid grid-cols-2 gap-2">
                {notificationTemplates.slice(0, 4).map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 text-left"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="text-xs font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{template.title}</div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Send to</Label>
              <Select 
                value={composeForm.recipientRole} 
                onValueChange={(value) => setComposeForm(prev => ({ ...prev, recipientRole: value, recipientType: 'role' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRecipients().map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.role}>
                      {recipient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Message</Label>
              <Textarea
                value={composeForm.body}
                onChange={(e) => setComposeForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Enter your message..."
                rows={3}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select 
                value={composeForm.priority} 
                onValueChange={(value: any) => setComposeForm(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsComposeOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendNotification}
                disabled={sendNotificationMutation.isPending || !composeForm.body.trim() || !composeForm.recipientRole}
                className="flex-1"
              >
                {sendNotificationMutation.isPending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeaderNotificationSystem;

