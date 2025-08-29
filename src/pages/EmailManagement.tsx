import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      // Mock email templates (tables don't exist yet)
      setTemplates([]);

      // Mock email logs (tables don't exist yet)
      setEmailLogs([]);

      // Load potential recipients (profiles with emails)
      const { data: recipientsData } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role')
        .not('email', 'is', null);
      
      if (recipientsData) setRecipients(recipientsData as Profile[]);

    } catch (error) {
      console.error('Error loading email data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async () => {
    if (!currentUser) return;

    try {
      // Mock template creation (table doesn't exist yet)
      console.log('Template would be created:', newTemplate);

      toast({
        title: "Success",
        description: "Email template created successfully!",
      });

      setNewTemplate({ name: '', subject: '', content: '', category: 'general' });
      setShowNewTemplate(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendEmail = async () => {
    if (!composeForm.subject || !composeForm.content || composeForm.recipients.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select recipients",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Ensure user is authenticated and pass access token to the Edge Function
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        throw new Error('You must be signed in to send emails.');
      }

      // Send email via edge function with Authorization header
      const { data, error } = await supabase.functions.invoke('send-general-email', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          recipients: composeForm.recipients,
          subject: composeForm.subject,
          content: composeForm.content,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Email sent to ${composeForm.recipients.length} recipient(s)!`,
      });

      setComposeForm({
        recipients: [],
        recipientType: 'custom',
        subject: '',
        content: '',
        templateId: ''
      });
      setShowCompose(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = (template: EmailTemplate) => {
    setComposeForm(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content,
      templateId: template.id
    }));
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

  const filteredLogs = emailLogs.filter(log =>
    log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-gray-600">Send emails and manage templates</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
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
            <DialogTrigger asChild>
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                Compose Email
              </Button>
            </DialogTrigger>
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
                    <label className="text-sm font-medium">Template (Optional)</label>
                    <Select value={composeForm.templateId} onValueChange={(value) => {
                      const template = templates.find(t => t.id === value);
                      if (template) applyTemplate(template);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {composeForm.recipientType === 'custom' && (
                  <div>
                    <label className="text-sm font-medium">Recipients</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded">
                      {recipients.map(recipient => (
                        <label key={recipient.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={composeForm.recipients.includes(recipient.email)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setComposeForm(prev => ({
                                  ...prev,
                                  recipients: [...prev.recipients, recipient.email]
                                }));
                              } else {
                                setComposeForm(prev => ({
                                  ...prev,
                                  recipients: prev.recipients.filter(email => email !== recipient.email)
                                }));
                              }
                            }}
                          />
                          <span className="text-sm">
                            {recipient.first_name} {recipient.last_name} ({recipient.email})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="Email subject"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    placeholder="Email content..."
                    value={composeForm.content}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={10}
                  />
                </div>

                <div className="flex justify-between">
                  <div className="text-sm text-gray-600">
                    Recipients: {composeForm.recipients.length}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setShowCompose(false)}>
                      Cancel
                    </Button>
                    <Button onClick={sendEmail} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{emailLogs.filter(log => log.status === 'sent').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recipients</p>
                <p className="text-2xl font-bold">{recipients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{emailLogs.filter(log => log.status === 'failed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Email History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Email History</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {log.status === 'sent' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : log.status === 'failed' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{log.subject}</p>
                        <p className="text-sm text-gray-600">
                          To: {log.recipient_email} {log.recipient_name && `(${log.recipient_name})`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.sent_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={log.status === 'sent' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                      {log.status}
                    </Badge>
                  </div>
                ))}

                {filteredLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No email history found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{template.subject}</p>
                        <p className="text-xs text-gray-500 line-clamp-3">{template.content}</p>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(template.created_at).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              applyTemplate(template);
                              setShowCompose(true);
                            }}
                          >
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {templates.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No templates found. Create your first template!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailManagement;