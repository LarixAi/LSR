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
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface NotificationRecipient {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  category: 'general' | 'safety' | 'schedule' | 'maintenance' | 'emergency';
}

interface NotificationMessage {
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
  created_at: string;
  metadata?: Record<string, any>;
}

const AdvancedNotificationSystem: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('compose');
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

  // Get available recipients based on user role
  const getAvailableRecipients = (): NotificationRecipient[] => {
    if (!profile?.organization_id) return [];

    const baseRecipients: NotificationRecipient[] = [];
    
    switch (profile.role) {
      case 'admin':
      case 'council':
        // Admins can send to everyone
        return [
          { id: 'all_drivers', name: 'All Drivers', role: 'driver' },
          { id: 'all_mechanics', name: 'All Mechanics', role: 'mechanic' },
          { id: 'all_parents', name: 'All Parents', role: 'parent' },
          { id: 'all_admins', name: 'All Administrators', role: 'admin' }
        ];
      
      case 'driver':
        // Drivers can send to admins, parents, and mechanics
        return [
          { id: 'all_admins', name: 'All Administrators', role: 'admin' },
          { id: 'all_mechanics', name: 'All Mechanics', role: 'mechanic' },
          { id: 'all_parents', name: 'All Parents', role: 'parent' }
        ];
      
      case 'parent':
        // Parents can send to drivers
        return [
          { id: 'all_drivers', name: 'All Drivers', role: 'driver' },
          { id: 'all_admins', name: 'All Administrators', role: 'admin' }
        ];
      
      case 'mechanic':
        // Mechanics can send to admins and drivers
        return [
          { id: 'all_admins', name: 'All Administrators', role: 'admin' },
          { id: 'all_drivers', name: 'All Drivers', role: 'driver' }
        ];
      
      default:
        return [];
    }
  };

  // Notification templates
  const notificationTemplates: NotificationTemplate[] = [
    {
      id: 'safety_alert',
      name: 'Safety Alert',
      title: 'Safety Alert - Immediate Action Required',
      body: 'Please review and acknowledge this safety alert. Your immediate attention is required.',
      type: 'warning',
      priority: 'high',
      category: 'safety'
    },
    {
      id: 'schedule_change',
      name: 'Schedule Change',
      title: 'Schedule Update',
      body: 'There has been a change to your schedule. Please review the updated details.',
      type: 'info',
      priority: 'normal',
      category: 'schedule'
    },
    {
      id: 'maintenance_reminder',
      name: 'Maintenance Reminder',
      title: 'Vehicle Maintenance Due',
      body: 'Your vehicle is due for maintenance. Please schedule an appointment.',
      type: 'warning',
      priority: 'normal',
      category: 'maintenance'
    },
    {
      id: 'emergency_notice',
      name: 'Emergency Notice',
      title: 'EMERGENCY - Immediate Response Required',
      body: 'This is an emergency notification requiring immediate attention.',
      type: 'error',
      priority: 'emergency',
      category: 'emergency'
    }
  ];

  // Fetch sent notifications
  const { data: sentNotifications = [], isLoading: sentLoading } = useQuery({
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
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch received notifications
  const { data: receivedNotifications = [], isLoading: receivedLoading } = useQuery({
    queryKey: ['received-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notification_messages')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData: any) => {
      const { data, error } = await supabase
        .from('notification_messages')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['received-notifications'] });
      toast({
        title: "Notification Sent",
        description: "Your notification has been sent successfully.",
      });
      setIsComposeOpen(false);
      resetComposeForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send notification: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notification_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-notifications'] });
    }
  });

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

  const handleTemplateSelect = (template: NotificationTemplate) => {
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

    const notificationData = {
      sender_id: user?.id,
      sender_name: `${profile?.first_name} ${profile?.last_name}`,
      sender_role: profile?.role,
      recipient_id: composeForm.recipientType === 'specific' ? composeForm.recipientId : null,
      recipient_role: composeForm.recipientType === 'role' ? composeForm.recipientRole : null,
      title: composeForm.title,
      body: composeForm.body,
      type: composeForm.type,
      priority: composeForm.priority,
      category: composeForm.category,
      channels: composeForm.channels,
      scheduled_for: composeForm.isScheduled && composeForm.scheduledFor ? composeForm.scheduledFor : null,
      metadata: {
        organization_id: profile?.organization_id,
        sent_via: 'advanced_notification_system'
      }
    };

    await sendNotificationMutation.mutateAsync(notificationData);
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Please log in to access notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Notification System</h1>
          <p className="text-gray-600">Send and manage notifications across your organization</p>
        </div>
        <Button onClick={() => setIsComposeOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Compose Notification
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sentNotifications.length})</TabsTrigger>
          <TabsTrigger value="received">Received ({receivedNotifications.length})</TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Notification Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notificationTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline" className={getPriorityColor(template.priority)}>
                        {template.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{template.title}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{sentNotifications.length}</div>
                    <div className="text-sm text-gray-600">Sent Today</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {receivedNotifications.filter(n => !n.read_at).length}
                    </div>
                    <div className="text-sm text-gray-600">Unread</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>High Priority</span>
                    <span className="font-medium">
                      {sentNotifications.filter(n => n.priority === 'high' || n.priority === 'emergency').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Emergency</span>
                    <span className="font-medium text-red-600">
                      {sentNotifications.filter(n => n.priority === 'emergency').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
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
              <SelectTrigger className="w-32">
                <SelectValue />
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

          {/* Sent Notifications List */}
          <div className="space-y-3">
            {filteredSentNotifications.map((notification) => (
              <Card key={notification.id} className={getCategoryColor(notification.category)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getNotificationIcon(notification.type)}
                        <h4 className="font-medium">{notification.title}</h4>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        <Badge variant="outline">{notification.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.body}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>To: {notification.recipient_role || 'Specific User'}</span>
                        <span>Sent: {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        <span>Channels: {notification.channels.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Received Tab */}
        <TabsContent value="received" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
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
              <SelectTrigger className="w-32">
                <SelectValue />
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

          {/* Received Notifications List */}
          <div className="space-y-3">
            {filteredReceivedNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`${getCategoryColor(notification.category)} ${!notification.read_at ? 'ring-2 ring-blue-200' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getNotificationIcon(notification.type)}
                        <h4 className="font-medium">{notification.title}</h4>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        <Badge variant="outline">{notification.category}</Badge>
                        {!notification.read_at && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.body}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>From: {notification.sender_name} ({notification.sender_role})</span>
                        <span>Received: {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        {notification.read_at && (
                          <span>Read: {format(new Date(notification.read_at), 'MMM dd, yyyy HH:mm')}</span>
                        )}
                      </div>
                    </div>
                    {!notification.read_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Compose Notification Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Notification</DialogTitle>
            <DialogDescription>
              Send notifications to users in your organization. Choose recipients, priority, and delivery channels.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Recipient Selection */}
            <div className="space-y-2">
              <Label>Recipient Type</Label>
              <Select 
                value={composeForm.recipientType} 
                onValueChange={(value: any) => setComposeForm(prev => ({ ...prev, recipientType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specific">Specific User</SelectItem>
                  <SelectItem value="role">All Users by Role</SelectItem>
                  <SelectItem value="all">All Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {composeForm.recipientType === 'role' && (
              <div className="space-y-2">
                <Label>Recipient Role</Label>
                <Select 
                  value={composeForm.recipientRole} 
                  onValueChange={(value) => setComposeForm(prev => ({ ...prev, recipientRole: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
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
            )}

            {/* Notification Content */}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={composeForm.title}
                onChange={(e) => setComposeForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter notification title"
              />
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={composeForm.body}
                onChange={(e) => setComposeForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Enter notification message"
                rows={4}
              />
            </div>

            {/* Notification Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={composeForm.type} 
                  onValueChange={(value: any) => setComposeForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
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
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={composeForm.category} 
                onValueChange={(value: any) => setComposeForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Channels */}
            <div className="space-y-2">
              <Label>Delivery Channels</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="in_app"
                    checked={composeForm.channels.includes('in_app')}
                    onCheckedChange={(checked) => {
                      setComposeForm(prev => ({
                        ...prev,
                        channels: checked 
                          ? [...prev.channels, 'in_app']
                          : prev.channels.filter(c => c !== 'in_app')
                      }))
                    }}
                  />
                  <Label htmlFor="in_app" className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    In-App Notification
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="push"
                    checked={composeForm.channels.includes('push')}
                    onCheckedChange={(checked) => {
                      setComposeForm(prev => ({
                        ...prev,
                        channels: checked 
                          ? [...prev.channels, 'push']
                          : prev.channels.filter(c => c !== 'push')
                      }))
                    }}
                  />
                  <Label htmlFor="push" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Push Notification
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email"
                    checked={composeForm.channels.includes('email')}
                    onCheckedChange={(checked) => {
                      setComposeForm(prev => ({
                        ...prev,
                        channels: checked 
                          ? [...prev.channels, 'email']
                          : prev.channels.filter(c => c !== 'email')
                      }))
                    }}
                  />
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sms"
                    checked={composeForm.channels.includes('sms')}
                    onCheckedChange={(checked) => {
                      setComposeForm(prev => ({
                        ...prev,
                        channels: checked 
                          ? [...prev.channels, 'sms']
                          : prev.channels.filter(c => c !== 'sms')
                      }))
                    }}
                  />
                  <Label htmlFor="sms" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    SMS
                  </Label>
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduled"
                  checked={composeForm.isScheduled}
                  onCheckedChange={(checked) => setComposeForm(prev => ({ ...prev, isScheduled: checked }))}
                />
                <Label htmlFor="scheduled">Schedule for later</Label>
              </div>
              {composeForm.isScheduled && (
                <Input
                  type="datetime-local"
                  value={composeForm.scheduledFor}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, scheduledFor: e.target.value }))}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendNotification}
                disabled={sendNotificationMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sendNotificationMutation.isPending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
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

export default AdvancedNotificationSystem;

