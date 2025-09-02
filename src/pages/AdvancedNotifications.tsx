import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Search,
  Download,
  Activity,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import StandardPageLayout, { 
  MetricCard,
  NavigationTab, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';
import { toast } from 'sonner';

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
  const [selectedTab, setSelectedTab] = useState('overview');
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

  // Mock data for demonstration
  const notificationTemplates: NotificationTemplate[] = [
    {
      id: '1',
      name: 'Safety Alert',
      title: 'Safety Alert',
      body: 'Important safety information for all drivers',
      type: 'warning',
      priority: 'high',
      category: 'safety'
    },
    {
      id: '2',
      name: 'Schedule Update',
      title: 'Schedule Update',
      body: 'Your route schedule has been updated',
      type: 'info',
      priority: 'normal',
      category: 'schedule'
    }
  ];

  const sentNotifications: NotificationMessage[] = [];
  const receivedNotifications: NotificationMessage[] = [];

  // StandardPageLayout Configuration
  const pageTitle = "Advanced Notifications";
  const pageDescription = "Manage notification templates, send messages, and configure delivery channels";

  const primaryAction: ActionButton = {
    label: "Compose Notification",
    onClick: () => setIsComposeOpen(true),
    icon: <Send className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
    {
      label: "New Template",
      onClick: () => console.log("New template clicked"),
      icon: <Plus className="w-4 h-4" />,
      variant: "outline"
    },
    {
      label: "Export Logs",
      onClick: () => console.log("Export clicked"),
      icon: <Download className="w-4 h-4" />,
      variant: "outline"
    },
    {
      label: "Settings",
      onClick: () => console.log("Settings clicked"),
      icon: <Settings className="w-4 h-4" />,
      variant: "outline"
    }
  ];

  // Metrics cards for the dashboard
  const metricsCards: MetricCard[] = [
    {
      title: "Total Notifications",
      value: sentNotifications.length.toString(),
      subtitle: "All notifications sent",
      icon: <Bell className="w-5 h-5" />,
      bgColor: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      title: "Templates",
      value: notificationTemplates.length.toString(),
      subtitle: "Notification templates",
      icon: <FileText className="w-5 h-5" />,
      bgColor: "bg-green-100",
      color: "text-green-600"
    },
    {
      title: "Active Channels",
      value: "4",
      subtitle: "In-app, Push, Email, SMS",
      icon: <Smartphone className="w-5 h-5" />,
      bgColor: "bg-purple-100",
      color: "text-purple-600"
    },
    {
      title: "Recipients",
      value: receivedNotifications.length.toString(),
      subtitle: "Total recipients",
      icon: <Users className="w-5 h-5" />,
      bgColor: "bg-orange-100",
      color: "text-orange-600"
    }
  ];

  const navigationTabs: NavigationTab[] = [
    { value: "overview", label: "Overview" },
    { value: "compose", label: "Compose" },
    { value: "templates", label: "Templates" },
    { value: "history", label: "History" },
    { value: "settings", label: "Settings" }
  ];

  const searchConfig = {
    placeholder: "Search notifications, templates, or recipients...",
    value: searchTerm,
    onChange: setSearchTerm,
    showSearch: true
  };

  const filters: FilterOption[] = [
    {
      label: "Type",
      value: filterType,
      options: [
        { value: "all", label: "All Types" },
        { value: "info", label: "Info" },
        { value: "warning", label: "Warning" },
        { value: "success", label: "Success" },
        { value: "error", label: "Error" }
      ],
      placeholder: "Filter by type"
    },
    {
      label: "Priority",
      value: filterPriority,
      options: [
        { value: "all", label: "All Priorities" },
        { value: "low", label: "Low" },
        { value: "normal", label: "Normal" },
        { value: "high", label: "High" },
        { value: "emergency", label: "Emergency" }
      ],
      placeholder: "Filter by priority"
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "Type") setFilterType(value);
    if (filterKey === "Priority") setFilterPriority(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    setIsComposeOpen(true);
  };

  const getAvailableRecipients = (): NotificationRecipient[] => {
    return [
      { id: '1', name: 'All Drivers', role: 'driver' },
      { id: '2', name: 'All Parents', role: 'parent' },
      { id: '3', name: 'All Staff', role: 'staff' }
    ];
  };

  const handleSendNotification = () => {
    console.log('Sending notification:', composeForm);
    setIsComposeOpen(false);
    toast({
      title: "Success",
      description: "Notification sent successfully!",
    });
  };

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
    <StandardPageLayout
      title={pageTitle}
      description={pageDescription}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={selectedTab}
      onTabChange={setSelectedTab}
      searchConfig={searchConfig}
      filters={filters}
      onFilterChange={handleFilterChange}
    >
      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Overview</CardTitle>
              <CardDescription>Quick overview of your notification system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">Total Sent</h3>
                      <p className="text-sm text-gray-600">{sentNotifications.length} notifications</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Recipients</h3>
                      <p className="text-sm text-gray-600">{receivedNotifications.length} received</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings className="w-8 h-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">Templates</h3>
                      <p className="text-sm text-gray-600">{notificationTemplates.length} templates</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common notification tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => setIsComposeOpen(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Compose Notification
                </Button>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compose Tab */}
      {selectedTab === 'compose' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compose Notification</CardTitle>
              <CardDescription>Create and send notifications to your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={composeForm.type} onValueChange={(value: any) => setComposeForm(prev => ({ ...prev, type: value }))}>
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
                  <div>
                    <Label>Priority</Label>
                    <Select value={composeForm.priority} onValueChange={(value: any) => setComposeForm(prev => ({ ...prev, priority: value }))}>
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
                <div>
                  <Label>Title</Label>
                  <Input
                    value={composeForm.title}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter notification title"
                  />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={composeForm.body}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Enter notification message"
                    rows={4}
                  />
                </div>
                <Button onClick={handleSendNotification} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Manage your notification templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notificationTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline" className={getPriorityColor(template.priority)}>
                            {template.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{template.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-3">{template.body}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTemplateSelect(template)}
                          className="w-full"
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compose Notification Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="compose-notif-desc">
          <DialogHeader>
            <DialogTitle>Compose Notification</DialogTitle>
            <DialogDescription id="compose-notif-desc">
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

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendNotification} className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
};

export default AdvancedNotificationSystem;

