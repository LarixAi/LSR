import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useAgreementNotifications, NotificationTemplate } from '@/hooks/useAgreementNotifications';
import { useUserAgreements } from '@/hooks/useUserAgreements';
import { useToast } from '@/hooks/use-toast';

interface TemplateFormData {
  name: string;
  subject: string;
  body: string;
  type: 'agreement_update' | 'reminder' | 'welcome';
}

const NotificationManager: React.FC = () => {
  const { toast } = useToast();
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showSendNotification, setShowSendNotification] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('templates');

  const {
    templates,
    notificationLogs,
    usersNeedingAcceptance,
    isLoadingTemplates,
    isLoadingLogs,
    isLoadingUsers,
    isSending,
    sendNotification,
    createTemplate,
    sendReminderNotifications,
    getLogsByStatus
  } = useAgreementNotifications();

  const { agreements } = useUserAgreements();

  const [templateForm, setTemplateForm] = useState<TemplateFormData>({
    name: '',
    subject: '',
    body: '',
    type: 'agreement_update'
  });

  const [notificationForm, setNotificationForm] = useState({
    agreement_id: '',
    template_id: '',
    custom_subject: '',
    custom_body: '',
    send_to_all: false,
    selected_users: [] as string[]
  });

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.body) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createTemplate(templateForm);
    setShowCreateTemplate(false);
    setTemplateForm({
      name: '',
      subject: '',
      body: '',
      type: 'agreement_update'
    });
  };

  const handleSendNotification = async () => {
    if (!notificationForm.agreement_id) {
      toast({
        title: "Validation Error",
        description: "Please select an agreement",
        variant: "destructive",
      });
      return;
    }

    sendNotification({
      agreement_id: notificationForm.agreement_id,
      notification_type: 'agreement_update',
      template_id: notificationForm.template_id || undefined,
      custom_subject: notificationForm.custom_subject || undefined,
      custom_body: notificationForm.custom_body || undefined,
      user_ids: notificationForm.send_to_all ? undefined : notificationForm.selected_users,
      send_to_all: notificationForm.send_to_all
    });

    setShowSendNotification(false);
    setNotificationForm({
      agreement_id: '',
      template_id: '',
      custom_subject: '',
      custom_body: '',
      send_to_all: false,
      selected_users: []
    });
  };

  const handleSendReminders = async () => {
    await sendReminderNotifications();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const sentLogs = getLogsByStatus('sent');
  const failedLogs = getLogsByStatus('failed');
  const pendingLogs = getLogsByStatus('pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notification Management</h2>
          <p className="text-muted-foreground">Manage email templates and send notifications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateTemplate(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
          <Button onClick={() => setShowSendNotification(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Notification Logs</TabsTrigger>
          <TabsTrigger value="users">Users Needing Acceptance</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates?.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="outline">{template.type.replace('_', ' ')}</Badge>
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Subject:</strong> {template.subject}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Body:</strong> {template.body.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTemplateForm({
                              name: template.name,
                              subject: template.subject,
                              body: template.body,
                              type: template.type
                            });
                            setShowCreateTemplate(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sent</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sentLogs.length}</div>
                <p className="text-xs text-muted-foreground">Successfully delivered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{failedLogs.length}</div>
                <p className="text-xs text-muted-foreground">Delivery failed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingLogs.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting delivery</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {notificationLogs?.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <p className="font-medium">{log.user_email}</p>
                          <p className="text-sm text-muted-foreground">{log.agreement_title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(log.status)}
                          <Badge variant="outline">{log.notification_type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users Needing Agreement Acceptance
                <Badge variant="outline">{usersNeedingAcceptance?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {usersNeedingAcceptance?.map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.needs_terms && (
                          <Badge variant="destructive">Needs Terms</Badge>
                        )}
                        {user.needs_privacy && (
                          <Badge variant="destructive">Needs Privacy</Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Reminder Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Send reminder notifications to users who haven't accepted the latest agreements. 
                  This will send emails to all users who need to accept agreements.
                </AlertDescription>
              </Alert>

              <div className="mt-4">
                <Button 
                  onClick={handleSendReminders}
                  disabled={isSending || (usersNeedingAcceptance?.length || 0) === 0}
                  className="w-full"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending Reminders...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reminders to {usersNeedingAcceptance?.length || 0} Users
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template_name">Template Name</Label>
              <Input
                id="template_name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="e.g., Agreement Update Notification"
              />
            </div>
            <div>
              <Label htmlFor="template_type">Type</Label>
              <Select
                value={templateForm.type}
                onValueChange={(value: 'agreement_update' | 'reminder' | 'welcome') => 
                  setTemplateForm({ ...templateForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agreement_update">Agreement Update</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="welcome">Welcome</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="template_subject">Subject</Label>
              <Input
                id="template_subject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                placeholder="Email subject line"
              />
            </div>
            <div>
              <Label htmlFor="template_body">Body</Label>
              <Textarea
                id="template_body"
                value={templateForm.body}
                onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                placeholder="Email body content..."
                className="min-h-[200px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>
                {selectedTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={showSendNotification} onOpenChange={setShowSendNotification}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notification_agreement">Agreement</Label>
              <Select
                value={notificationForm.agreement_id}
                onValueChange={(value) => setNotificationForm({ ...notificationForm, agreement_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an agreement" />
                </SelectTrigger>
                <SelectContent>
                  {agreements?.map((agreement) => (
                    <SelectItem key={agreement.id} value={agreement.id}>
                      {agreement.title} v{agreement.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notification_template">Template (Optional)</Label>
              <Select
                value={notificationForm.template_id}
                onValueChange={(value) => setNotificationForm({ ...notificationForm, template_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send_to_all"
                checked={notificationForm.send_to_all}
                onCheckedChange={(checked) => 
                  setNotificationForm({ ...notificationForm, send_to_all: checked as boolean })
                }
              />
              <Label htmlFor="send_to_all">Send to all users needing acceptance</Label>
            </div>
            {!notificationForm.send_to_all && (
              <div>
                <Label>Select Users</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {usersNeedingAcceptance?.map((user) => (
                    <div key={user.user_id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`user-${user.user_id}`}
                        checked={notificationForm.selected_users.includes(user.user_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNotificationForm({
                              ...notificationForm,
                              selected_users: [...notificationForm.selected_users, user.user_id]
                            });
                          } else {
                            setNotificationForm({
                              ...notificationForm,
                              selected_users: notificationForm.selected_users.filter(id => id !== user.user_id)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`user-${user.user_id}`} className="text-sm">
                        {user.first_name} {user.last_name} ({user.email})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSendNotification(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendNotification} disabled={isSending}>
                {isSending ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationManager;
