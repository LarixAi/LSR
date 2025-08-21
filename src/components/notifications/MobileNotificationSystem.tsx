import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Send, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  Plus,
  X,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useSentNotifications, 
  useReceivedNotifications, 
  useSendNotification, 
  useMarkNotificationRead,
  useUnreadNotificationCount,
  useRealTimeNotifications,
  type CreateNotificationParams
} from '@/hooks/useAdvancedNotifications';
import { format } from 'date-fns';

interface NotificationRecipient {
  id: string;
  name: string;
  role: string;
}

const MobileNotificationSystem: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // State management
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
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setIsComposeOpen(true)}
            className="h-9 px-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-3 border-b bg-muted/30">
        <Input
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10"
        />
        <div className="flex space-x-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 text-sm">
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
            <SelectTrigger className="h-9 text-sm">
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

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-2 rounded-none">
          <TabsTrigger value="received" className="rounded-none">
            Received ({receivedNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="rounded-none">
            Sent ({sentNotifications.length})
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        <div className="p-4">
          <TabsContent value="received" className="m-0 space-y-3">
            {filteredReceivedNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              filteredReceivedNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`${getCategoryColor(notification.category)} ${!notification.read_at ? 'ring-2 ring-blue-200' : ''} cursor-pointer`}
                  onClick={() => {
                    if (!notification.read_at) {
                      markAsReadMutation.mutate(notification.id);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getNotificationIcon(notification.type)}
                          <h4 className="font-medium text-base">{notification.title}</h4>
                          <Badge className={`${getPriorityColor(notification.priority)} text-xs`}>
                            {notification.priority}
                          </Badge>
                          {!notification.read_at && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
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
          </TabsContent>

          <TabsContent value="sent" className="m-0 space-y-3">
            {filteredSentNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No sent notifications</p>
                <p className="text-sm">Start sending messages to your team!</p>
              </div>
            ) : (
              filteredSentNotifications.map((notification) => (
                <Card key={notification.id} className={`${getCategoryColor(notification.category)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getNotificationIcon(notification.type)}
                          <h4 className="font-medium text-base">{notification.title}</h4>
                          <Badge className={`${getPriorityColor(notification.priority)} text-xs`}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
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
          </TabsContent>
        </div>
      </Tabs>

      {/* Compose Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a notification to your team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Templates */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Templates</Label>
              <div className="grid grid-cols-2 gap-2">
                {notificationTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 text-left"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="text-sm font-medium">{template.name}</div>
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

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Title</Label>
              <Input
                value={composeForm.title}
                onChange={(e) => setComposeForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter message title..."
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Message</Label>
              <Textarea
                value={composeForm.body}
                onChange={(e) => setComposeForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Enter your message..."
                rows={4}
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
            <div className="flex space-x-2 pt-4">
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
    </div>
  );
};

export default MobileNotificationSystem;

