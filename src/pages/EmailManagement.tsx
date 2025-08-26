import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Plus, 
  Search,
  Send,
  Edit,
  Eye,
  Copy,
  Users,
  FileText,
  CheckCircle,
  TrendingUp,
  Settings,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  useEmailCampaigns,
  useEmailTemplates,
  useCreateEmailCampaign,
  useUpdateEmailCampaign,
  useDeleteEmailCampaign,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  useSendEmailCampaign,
  type EmailCampaign,
  type EmailTemplate
} from '@/hooks/useEmailManagement';

// Remove old interfaces as we're using the ones from the hook

const EmailManagement: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState<boolean>(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Hooks for data fetching and mutations
  const { data: campaigns = [], isLoading: campaignsLoading } = useEmailCampaigns();
  const { data: templates = [], isLoading: templatesLoading } = useEmailTemplates();
  const createCampaign = useCreateEmailCampaign();
  const updateCampaign = useUpdateEmailCampaign();
  const deleteCampaign = useDeleteEmailCampaign();
  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();
  const deleteTemplate = useDeleteEmailTemplate();
  const sendCampaign = useSendEmailCampaign();

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'newsletter' as const,
    status: 'draft' as const,
    recipients_count: 0
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'newsletter' as const,
    description: ''
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading email management...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins and council can access
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Filter data based on search term
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
      sending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const emailStats = {
    totalCampaigns: campaigns.length,
    totalRecipients: campaigns.reduce((sum, camp) => sum + camp.recipients_count, 0),
    totalOpened: campaigns.reduce((sum, camp) => sum + camp.opened_count, 0),
    totalClicked: campaigns.reduce((sum, camp) => sum + camp.clicked_count, 0)
  };

  const openRate = emailStats.totalRecipients > 0 ? (emailStats.totalOpened / emailStats.totalRecipients * 100) : 0;

  // Handler functions
  const handleCreateCampaign = async () => {
    if (!profile?.organization_id) return;
    
    await createCampaign.mutateAsync({
      ...campaignForm,
      organization_id: profile.organization_id,
      created_by: profile.id
    });
    
    setCampaignForm({
      name: '',
      subject: '',
      content: '',
      type: 'newsletter',
      status: 'draft',
      recipients_count: 0
    });
    setIsComposeDialogOpen(false);
  };

  const handleCreateTemplate = async () => {
    if (!profile?.organization_id) return;
    
    await createTemplate.mutateAsync({
      ...templateForm,
      organization_id: profile.organization_id,
      created_by: profile.id,
      is_default: false,
      used_count: 0
    });
    
    setTemplateForm({
      name: '',
      subject: '',
      content: '',
      type: 'newsletter',
      description: ''
    });
    setIsTemplateDialogOpen(false);
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      type: campaign.type,
      status: campaign.status,
      recipients_count: campaign.recipients_count
    });
    setIsComposeDialogOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      description: template.description || ''
    });
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign.mutateAsync(id);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate.mutateAsync(id);
    }
  };

  const handleSendCampaign = async (id: string) => {
    if (confirm('Are you sure you want to send this campaign?')) {
      await sendCampaign.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-600" />
            Email Management
          </h1>
          <p className="text-gray-600 mt-1">Manage email campaigns, templates, and communications</p>
        </div>
        <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Compose Email
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCampaign ? 'Edit Email Campaign' : 'Compose New Email'}
              </DialogTitle>
              <DialogDescription>
                {selectedCampaign ? 'Edit your email campaign.' : 'Create and send email campaigns to your customers and stakeholders.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input 
                    id="campaign-name" 
                    placeholder="Internal campaign name"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email-type">Email Type</Label>
                  <Select 
                    value={campaignForm.type}
                    onValueChange={(value) => setCampaignForm(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="recipients-count">Recipients Count</Label>
                <Input 
                  id="recipients-count" 
                  type="number"
                  placeholder="Number of recipients"
                  value={campaignForm.recipients_count}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, recipients_count: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input 
                  id="subject" 
                  placeholder="Email subject line"
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="content">Email Content</Label>
                <Textarea 
                  id="content" 
                  placeholder="Compose your email message..." 
                  rows={8}
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleCreateCampaign}
                  disabled={createCampaign.isPending}
                >
                  {createCampaign.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {selectedCampaign ? 'Update Campaign' : 'Create Campaign'}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsComposeDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold">{emailStats.totalCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold">{emailStats.totalRecipients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Emails Opened</p>
                <p className="text-2xl font-bold text-green-600">{emailStats.totalOpened}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Links Clicked</p>
                <p className="text-2xl font-bold">{emailStats.totalClicked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-blue-600">{openRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Campaigns
              </CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Clicked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p>Loading campaigns...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredCampaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No campaigns found</p>
                        <p className="text-sm text-gray-400">Create your first email campaign to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-gray-600">{campaign.subject}</p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{campaign.type}</TableCell>
                        <TableCell>{campaign.recipients_count}</TableCell>
                        <TableCell>{campaign.opened_count}</TableCell>
                        <TableCell>{campaign.clicked_count}</TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>{campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : 'Not sent'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditCampaign(campaign)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {campaign.status === 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleSendCampaign(campaign.id)}
                                disabled={sendCampaign.isPending}
                              >
                                {sendCampaign.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              disabled={deleteCampaign.isPending}
                            >
                              {deleteCampaign.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Email Templates
              </CardTitle>
              <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedTemplate ? 'Edit Email Template' : 'Create New Template'}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedTemplate ? 'Edit your email template.' : 'Create a reusable email template for your campaigns.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input 
                          id="template-name" 
                          placeholder="Template name"
                          value={templateForm.name}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-type">Template Type</Label>
                        <Select 
                          value={templateForm.type}
                          onValueChange={(value) => setTemplateForm(prev => ({ ...prev, type: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newsletter">Newsletter</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="onboarding">Onboarding</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                            <SelectItem value="promotional">Promotional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="template-subject">Subject Line</Label>
                      <Input 
                        id="template-subject" 
                        placeholder="Email subject line"
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-description">Description</Label>
                      <Input 
                        id="template-description" 
                        placeholder="Template description"
                        value={templateForm.description}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-content">Email Content</Label>
                      <Textarea 
                        id="template-content" 
                        placeholder="Write your email template content..."
                        className="min-h-[200px]"
                        value={templateForm.content}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {
                        setIsTemplateDialogOpen(false);
                        setSelectedTemplate(null);
                        setTemplateForm({
                          name: '',
                          subject: '',
                          content: '',
                          type: 'newsletter',
                          description: ''
                        });
                      }}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleCreateTemplate}
                        disabled={createTemplate.isPending}
                      >
                        {createTemplate.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4 mr-2" />
                        )}
                        {selectedTemplate ? 'Update Template' : 'Create Template'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p>Loading templates...</p>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No templates found</p>
                  <p className="text-sm text-gray-400">Create your first email template to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{template.type}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteTemplate(template.id)}
                            disabled={deleteTemplate.isPending}
                          >
                            {deleteTemplate.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Used {template.used_count} times</span>
                        <span>Modified: {new Date(template.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Configuration</h3>
                <p className="text-gray-600 mb-6">
                  Configure SMTP settings, sender information, and email delivery options.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Configure Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailManagement;