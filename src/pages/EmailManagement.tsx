import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Mail, 
  Send, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Search,
  Loader2,
  Settings,
  Download,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StandardPageLayout, { 
  MetricCard,
  NavigationTab, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';
  sent_at: string;
  template_used: string | null;
  organization_id: string;
  sent_by: string;
  error_message: string | null;
  metadata: any;
}

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export const EmailManagement: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [recipients, setRecipients] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general'
  });

  const [composeForm, setComposeForm] = useState({
    recipients: [] as string[],
    recipientType: 'custom',
    subject: '',
    content: '',
    templateId: ''
  });

  const { toast } = useToast();

  // StandardPageLayout Configuration
  const pageTitle = "Email Management";
  const pageDescription = "Manage email templates, compose messages, and track email delivery status";

  const primaryAction: ActionButton = {
    label: "Compose Email",
    onClick: () => setShowCompose(true),
    icon: <Send className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
    {
      label: "New Template",
      onClick: () => setShowNewTemplate(true),
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
      title: "Total Templates",
      value: templates.length.toString(),
      subtitle: "Email templates",
      icon: <FileText className="w-5 h-5" />,
      bgColor: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      title: "Emails Sent",
      value: emailLogs.filter(log => log.status === 'sent' || log.status === 'delivered').length.toString(),
      subtitle: "Successfully delivered",
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: "bg-green-100",
      color: "text-green-600"
    },
    {
      title: "Pending",
      value: emailLogs.filter(log => log.status === 'pending').length.toString(),
      subtitle: "Awaiting delivery",
      icon: <Clock className="w-5 h-5" />,
      bgColor: "bg-yellow-100",
      color: "text-yellow-600"
    },
    {
      title: "Failed",
      value: emailLogs.filter(log => log.status === 'failed' || log.status === 'bounced').length.toString(),
      subtitle: "Delivery issues",
      icon: <XCircle className="w-5 h-5" />,
      bgColor: "bg-red-100",
      color: "text-red-600"
    }
  ];

  const navigationTabs: NavigationTab[] = [
    { value: "overview", label: "Overview" },
    { value: "templates", label: "Email Templates", badge: templates.length },
    { value: "compose", label: "Compose" },
    { value: "logs", label: "Email Logs", badge: emailLogs.length },
    { value: "recipients", label: "Recipients", badge: recipients.length }
  ];

  const searchConfig = {
    placeholder: "Search templates, emails, or recipients...",
    value: searchTerm,
    onChange: setSearchTerm,
    showSearch: true
  };

  const filters: FilterOption[] = [
    {
      label: "Status",
      value: "",
      options: [
        { value: "all", label: "All Status" },
        { value: "sent", label: "Sent" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" }
      ],
      placeholder: "Filter by status"
    },
    {
      label: "Category",
      value: "",
      options: [
        { value: "all", label: "All Categories" },
        { value: "general", label: "General" },
        { value: "notifications", label: "Notifications" },
        { value: "alerts", label: "Alerts" }
      ],
      placeholder: "Filter by category"
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    // Handle filter changes
    console.log('Filter changed:', filterKey, value);
  };

  useEffect(() => {
    loadCurrentUser();
    loadData();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load templates
      const { data: templatesData } = await supabase
        .from('email_templates')
        .select('*')
        .eq('organization_id', currentUser?.organization_id);

      // Load email logs
      const { data: logsData } = await supabase
        .from('email_logs')
        .select('*')
        .eq('organization_id', currentUser?.organization_id);

      // Load recipients
      const { data: recipientsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', currentUser?.organization_id);

      setTemplates(templatesData || []);
      setEmailLogs(logsData || []);
      setRecipients(recipientsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([{
          ...newTemplate,
          organization_id: currentUser?.organization_id,
          created_by: currentUser?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [...prev, data]);
      setShowNewTemplate(false);
      setNewTemplate({ name: '', subject: '', content: '', category: 'general' });
      
      toast({
        title: "Success",
        description: "Email template created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create template.",
        variant: "destructive",
      });
    }
  };

  const getRecipientsForType = (type: string) => {
    switch (type) {
      case 'drivers':
        return recipients.filter(r => r.role === 'driver');
      case 'parents':
        return recipients.filter(r => r.role === 'parent');
      case 'staff':
        return recipients.filter(r => ['admin', 'council', 'mechanic'].includes(r.role));
      case 'all':
        return recipients;
      default:
        return [];
    }
  };

  const filteredLogs = emailLogs.filter(log => {
    const matchesSearch = log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (!currentUser) return;

  return (
    <StandardPageLayout
      title={pageTitle}
      description={pageDescription}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab="overview"
      onTabChange={() => {}}
      searchConfig={searchConfig}
      filters={filters}
      onFilterChange={handleFilterChange}
    >
      {/* Overview Tab */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Overview</CardTitle>
            <CardDescription>Quick overview of your email management system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Templates</h3>
                    <p className="text-sm text-gray-600">{templates.length} email templates</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Emails Sent</h3>
                    <p className="text-sm text-gray-600">{emailLogs.filter(log => log.status === 'sent' || log.status === 'delivered').length} successful</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Recipients</h3>
                    <p className="text-sm text-gray-600">{recipients.length} total recipients</p>
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
            <CardDescription>Common email management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setShowNewTemplate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
              <Button onClick={() => setShowCompose(true)} variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Compose Email
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  placeholder="Welcome Email"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="notifications">Notifications</SelectItem>
                    <SelectItem value="invoices">Invoices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Email subject"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="Email content..."
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={createTemplate}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Recipient Type</label>
                <Select 
                  value={composeForm.recipientType} 
                  onValueChange={(value) => {
                    setComposeForm(prev => ({ 
                      ...prev, 
                      recipientType: value,
                      recipients: value === 'custom' ? [] : getRecipientsForType(value).map(r => r.email)
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Recipients</SelectItem>
                    <SelectItem value="drivers">All Drivers</SelectItem>
                    <SelectItem value="parents">All Parents</SelectItem>
                    <SelectItem value="staff">All Staff</SelectItem>
                    <SelectItem value="all">Everyone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Email subject"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="Email content..."
                value={composeForm.content}
                onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
};

export default EmailManagement;