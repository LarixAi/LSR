import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Plus, 
  ArrowRight, 
  Send, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Info,
  Mail,
  MessageSquare,
  Phone
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  category: string;
  content: string;
}

interface NotificationStats {
  sentToday: number;
  unread: number;
  highPriority: number;
  emergency: number;
}

const AdvancedNotifications = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    priority: 'normal',
    recipients: '',
    category: 'general'
  });

  const notificationTemplates: NotificationTemplate[] = [
    {
      id: '1',
      title: 'Safety Alert',
      description: 'Safety Alert - Immediate Action Required',
      priority: 'high',
      category: 'safety',
      content: 'URGENT: Safety protocol violation detected. All drivers must review safety guidelines immediately.'
    },
    {
      id: '2',
      title: 'Schedule Change',
      description: 'Schedule Update',
      priority: 'normal',
      category: 'schedule',
      content: 'Important schedule changes for tomorrow. Please check your updated routes.'
    },
    {
      id: '3',
      title: 'Maintenance Reminder',
      description: 'Vehicle Maintenance Due',
      priority: 'normal',
      category: 'maintenance',
      content: 'Vehicle maintenance is due. Please schedule service appointment.'
    },
    {
      id: '4',
      title: 'Emergency Notice',
      description: 'EMERGENCY - Immediate Response Required',
      priority: 'emergency',
      category: 'emergency',
      content: 'EMERGENCY: Immediate response required. Contact dispatch immediately.'
    }
  ];

  const notificationStats: NotificationStats = {
    sentToday: 2,
    unread: 0,
    highPriority: 1,
    emergency: 1
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'emergency';
      case 'high':
        return 'high';
      case 'normal':
        return 'normal';
      case 'low':
        return 'low';
      default:
        return 'normal';
    }
  };

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setNotificationForm({
      title: template.title,
      message: template.content,
      priority: template.priority,
      recipients: '',
      category: template.category
    });
  };

  const handleSendNotification = () => {
    // Handle sending notification
    console.log('Sending notification:', notificationForm);
    // Reset form
    setNotificationForm({
      title: '',
      message: '',
      priority: 'normal',
      recipients: '',
      category: 'general'
    });
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Notification System</h1>
          <p className="text-gray-600 mt-1">Send and manage notifications across your organization</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Compose Notification
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({notificationStats.sentToday})
          </TabsTrigger>
          <TabsTrigger value="received">
            Received ({notificationStats.unread})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Notification Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Notification Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notificationTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{template.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${getPriorityColor(template.priority)}`}
                        >
                          {getPriorityLabel(template.priority)}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Right Column - Notification Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Notification Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{notificationStats.sentToday}</div>
                    <div className="text-sm text-blue-800">Sent Today</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{notificationStats.unread}</div>
                    <div className="text-sm text-green-800">Unread</div>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <span className="text-sm text-orange-800">High Priority</span>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                      {notificationStats.highPriority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm text-red-800">Emergency</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      {notificationStats.emergency}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compose Form */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Compose Notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                      placeholder="Notification title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={notificationForm.priority} 
                      onValueChange={(value) => setNotificationForm({...notificationForm, priority: value})}
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

                <div>
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select 
                    value={notificationForm.recipients} 
                    onValueChange={(value) => setNotificationForm({...notificationForm, recipients: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                      <SelectItem value="drivers">Drivers Only</SelectItem>
                      <SelectItem value="mechanics">Mechanics Only</SelectItem>
                      <SelectItem value="admin">Administrators Only</SelectItem>
                      <SelectItem value="custom">Custom Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                    placeholder="Enter your notification message..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleSendNotification}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setNotificationForm({
                        title: '',
                        message: '',
                        priority: 'normal',
                        recipients: '',
                        category: 'general'
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Safety Alert</h3>
                    <p className="text-sm text-gray-600">Sent to all drivers</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Schedule Update</h3>
                    <p className="text-sm text-gray-600">Sent to all staff</p>
                    <p className="text-xs text-gray-500 mt-1">4 hours ago</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Normal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Received Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No unread notifications</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedNotifications;
