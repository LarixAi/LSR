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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Calendar,
  Repeat,
  Zap,
  Target,
  BarChart3,
  Download,
  Upload,
  Copy,
  Edit,
  Archive,
  Star,
  Tag,
  Hash,
  Globe,
  Shield,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  Square,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, addHours } from 'date-fns';

interface NotificationRecipient {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  avatar?: string;
  isSelected?: boolean;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  category: 'general' | 'safety' | 'schedule' | 'maintenance' | 'emergency';
  tags?: string[];
  usage_count?: number;
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
  delivered_at?: string;
  created_at: string;
  metadata?: Record<string, any>;
  is_read?: boolean;
  delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed';
}

interface NotificationStats {
  total_sent: number;
  total_received: number;
  unread_count: number;
  delivery_rate: number;
  avg_response_time: number;
  top_categories: Array<{ category: string; count: number }>;
  recent_activity: Array<{ date: string; count: number }>;
}

const EnhancedNotificationSystem: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('compose');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    recipientType: 'specific' as 'specific' | 'role' | 'all' | 'bulk',
    recipientId: '',
    recipientRole: '',
    selectedRecipients: [] as string[],
    title: '',
    body: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'emergency',
    category: 'general' as 'general' | 'safety' | 'schedule' | 'maintenance' | 'emergency',
    channels: ['in_app'] as ('in_app' | 'push' | 'email' | 'sms')[],
    scheduledFor: '',
    isScheduled: false,
    isRecurring: false,
    recurrencePattern: 'once' as 'once' | 'daily' | 'weekly' | 'monthly',
    tags: [] as string[],
    templateId: ''
  });

  // Get available recipients based on user role
  const getAvailableRecipients = (): NotificationRecipient[] => {
    if (!profile?.organization_id) return [];

    const baseRecipients: NotificationRecipient[] = [];
    
    switch (profile.role) {
      case 'admin':
      case 'council':
        return [
          { id: 'all_drivers', name: 'All Drivers', role: 'driver' },
          { id: 'all_mechanics', name: 'All Mechanics', role: 'mechanic' },
          { id: 'all_parents', name: 'All Parents', role: 'parent' },
          { id: 'all_admins', name: 'All Administrators', role: 'admin' },
          { id: 'all_users', name: 'All Users', role: 'all' }
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

  // Enhanced notification templates
  const notificationTemplates: NotificationTemplate[] = [
    {
      id: 'safety_alert',
      name: 'Safety Alert',
      title: '🚨 Safety Alert - Immediate Action Required',
      body: 'Please review and acknowledge this safety alert. Your immediate attention is required for compliance and safety.',
      type: 'warning',
      priority: 'high',
      category: 'safety',
      tags: ['safety', 'urgent', 'compliance'],
      usage_count: 45
    },
    {
      id: 'schedule_change',
      name: 'Schedule Change',
      title: '📅 Schedule Update Notification',
      body: 'There has been a change to your schedule. Please review the updated details and confirm your availability.',
      type: 'info',
      priority: 'normal',
      category: 'schedule',
      tags: ['schedule', 'update', 'availability'],
      usage_count: 128
    },
    {
      id: 'maintenance_reminder',
      name: 'Maintenance Reminder',
      title: '🔧 Vehicle Maintenance Due',
      body: 'Your vehicle is due for scheduled maintenance. Please contact the maintenance team to schedule an appointment.',
      type: 'warning',
      priority: 'normal',
      category: 'maintenance',
      tags: ['maintenance', 'vehicle', 'scheduled'],
      usage_count: 67
    },
    {
      id: 'emergency_notice',
      name: 'Emergency Notice',
      title: '🚨 EMERGENCY - Immediate Response Required',
      body: 'This is an emergency notification requiring immediate attention. Please respond as soon as possible.',
      type: 'error',
      priority: 'emergency',
      category: 'emergency',
      tags: ['emergency', 'urgent', 'response'],
      usage_count: 12
    },
    {
      id: 'training_reminder',
      name: 'Training Reminder',
      title: '📚 Training Session Reminder',
      body: 'You have a training session scheduled. Please ensure you attend as this is mandatory for compliance.',
      type: 'info',
      priority: 'normal',
      category: 'general',
      tags: ['training', 'compliance', 'mandatory'],
      usage_count: 89
    },
    {
      id: 'weather_alert',
      name: 'Weather Alert',
      title: '🌦️ Weather Alert - Route Changes',
      body: 'Severe weather conditions detected. Please review route changes and safety guidelines before departure.',
      type: 'warning',
      priority: 'high',
      category: 'safety',
      tags: ['weather', 'safety', 'route'],
      usage_count: 34
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
        .limit(100);

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
        .or(`recipient_id.eq.${user.id},recipient_role.eq.${profile?.role}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch notification statistics
  const { data: notificationStats } = useQuery({
    queryKey: ['notification-stats', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      
      // Calculate stats from notifications
      const allNotifications = [...sentNotifications, ...receivedNotifications];
      const unreadCount = receivedNotifications.filter(n => !n.read_at).length;
      const deliveryRate = sentNotifications.length > 0 ? 
        (sentNotifications.filter(n => n.delivered_at).length / sentNotifications.length) * 100 : 0;
      
      const categoryCounts = allNotifications.reduce((acc, n) => {
        acc[n.category] = (acc[n.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        total_sent: sentNotifications.length,
        total_received: receivedNotifications.length,
        unread_count: unreadCount,
        delivery_rate: Math.round(deliveryRate),
        avg_response_time: 2.5, // Mock data
        top_categories: topCategories,
        recent_activity: [] // Would calculate from actual data
      } as NotificationStats;
    },
    enabled: !!profile?.organization_id && !sentLoading && !receivedLoading
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
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    }
  });

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async ({ action, notificationIds }: { action: string; notificationIds: string[] }) => {
      if (action === 'mark_read') {
        const { error } = await supabase
          .from('notification_messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', notificationIds);

        if (error) throw error;
      } else if (action === 'delete') {
        const { error } = await supabase
          .from('notification_messages')
          .delete()
          .in('id', notificationIds);

        if (error) throw error;
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['sent-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['received-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      setSelectedNotifications([]);
      toast({
        title: "Bulk Operation Complete",
        description: `Successfully ${action === 'mark_read' ? 'marked as read' : 'deleted'} selected notifications.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to perform bulk operation: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const resetComposeForm = () => {
    setComposeForm({
      recipientType: 'specific',
      recipientId: '',
      recipientRole: '',
      selectedRecipients: [],
      title: '',
      body: '',
      type: 'info',
      priority: 'normal',
      category: 'general',
      channels: ['in_app'],
      scheduledFor: '',
      isScheduled: false,
      isRecurring: false,
      recurrencePattern: 'once',
      tags: [],
      templateId: ''
    });
  };

  const handleSendNotification = () => {
    if (!composeForm.title || !composeForm.body) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and body fields.",
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
      organization_id: profile?.organization_id,
      metadata: {
        sent_via: 'enhanced_notification_system',
        recipient_type: composeForm.recipientType,
        tags: composeForm.tags,
        template_id: composeForm.templateId
      }
    };

    sendNotificationMutation.mutate(notificationData);
  };

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setComposeForm(prev => ({
      ...prev,
      title: template.title,
      body: template.body,
      type: template.type,
      priority: template.priority,
      category: template.category,
      templateId: template.id,
      tags: template.tags || []
    }));
    setIsTemplateOpen(false);
  };

  const handleBulkOperation = (action: string) => {
    if (selectedNotifications.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select notifications to perform bulk operations.",
        variant: "destructive",
      });
      return;
    }

    bulkOperationMutation.mutate({ action, notificationIds: selectedNotifications });
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    const allIds = receivedNotifications.map(n => n.id);
    setSelectedNotifications(allIds);
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = receivedNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    
    return matchesSearch && matchesType && matchesPriority && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{notificationStats?.total_sent || 0}</p>
              </div>
              <Send className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold">{notificationStats?.unread_count || 0}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold">{notificationStats?.delivery_rate || 0}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold">{notificationStats?.avg_response_time || 0}h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Enhanced Notifications
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsTemplateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button variant="outline" onClick={() => setIsBulkOpen(true)}>
                <CheckSquare className="w-4 h-4 mr-2" />
                Bulk Operations
              </Button>
              <Button onClick={() => setIsComposeOpen(true)}>
                <Send className="w-4 h-4 mr-2" />
                Compose
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="received">Received ({notificationStats?.unread_count || 0})</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              <div className="text-center py-8">
                <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Compose New Notification</h3>
                <p className="text-gray-600 mb-4">Create and send notifications to your team members</p>
                <Button onClick={() => setIsComposeOpen(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Start Composing
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="received" className="space-y-4">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
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
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="schedule">Schedule</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedNotifications.length > 0 && (
                <Alert>
                  <AlertDescription className="flex items-center justify-between">
                    <span>{selectedNotifications.length} notification(s) selected</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkOperation('mark_read')}
                      >
                        Mark as Read
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkOperation('delete')}
                      >
                        Delete
                      </Button>
                      <Button size="sm" variant="outline" onClick={clearSelection}>
                        Clear
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Notifications List */}
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                      !notification.read_at ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onCheckedChange={() => toggleNotificationSelection(notification.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(notification.type)}
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          <Badge variant="outline">{notification.category}</Badge>
                          {!notification.read_at && (
                            <Badge className="bg-blue-100 text-blue-800">New</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{notification.body}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>From: {notification.sender_name}</span>
                          <span>•</span>
                          <span>{format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}</span>
                          {notification.channels.length > 0 && (
                            <>
                              <span>•</span>
                              <span>Via: {notification.channels.join(', ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read_at && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredNotifications.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No notifications found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              <div className="space-y-2">
                {sentNotifications.map((notification) => (
                  <div key={notification.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(notification.type)}
                      <h4 className="font-medium">{notification.title}</h4>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      <Badge variant="outline">{notification.category}</Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{notification.body}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>To: {notification.recipient_role || 'Specific User'}</span>
                      <span>•</span>
                      <span>{format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}</span>
                      {notification.sent_at && (
                        <>
                          <span>•</span>
                          <span>Sent: {format(new Date(notification.sent_at), 'MMM dd, yyyy HH:mm')}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Compose Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Notification</DialogTitle>
            <DialogDescription>
              Create and send notifications to your team members
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Quick Templates</Label>
              <div className="grid grid-cols-2 gap-2">
                {notificationTemplates.slice(0, 4).map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateSelect(template)}
                    className="justify-start"
                  >
                    <div className="text-left">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.usage_count} uses</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Recipient Selection */}
            <div className="space-y-2">
              <Label>Recipients</Label>
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
              
              {composeForm.recipientType === 'role' && (
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
              )}
            </div>

            {/* Notification Content */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={composeForm.title}
                onChange={(e) => setComposeForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter notification title"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
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
                    In-App
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

      {/* Templates Dialog */}
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notification Templates</DialogTitle>
            <DialogDescription>
              Use pre-built templates for common notifications
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notificationTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.type)}
                      <h4 className="font-medium">{template.name}</h4>
                    </div>
                    <Badge className={getPriorityColor(template.priority)}>
                      {template.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.body}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {template.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Operations Dialog */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Operations</DialogTitle>
            <DialogDescription>
              Perform actions on multiple notifications at once
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  selectAllNotifications();
                  setIsBulkOpen(false);
                }}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Select All Notifications
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  clearSelection();
                  setIsBulkOpen(false);
                }}
              >
                <Square className="w-4 h-4 mr-2" />
                Clear Selection
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Selected: {selectedNotifications.length} notification(s)</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedNotificationSystem;

