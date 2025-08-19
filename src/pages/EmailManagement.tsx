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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Settings
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  recipients: number;
  opened: number;
  clicked: number;
  subject: string;
  sentDate: string | null;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  used: number;
  lastModified: string;
}

const EmailManagement: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState<boolean>(false);

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

  // Mock data for demonstration
  const emailCampaigns: EmailCampaign[] = [
    {
      id: 'CAM-001',
      name: 'Monthly Service Update - January',
      type: 'newsletter',
      status: 'sent',
      recipients: 245,
      opened: 198,
      clicked: 42,
      subject: 'LSR Logistics - January Service Updates',
      sentDate: '2024-01-15'
    },
    {
      id: 'CAM-002',
      name: 'New Route Announcement',
      type: 'announcement',
      status: 'scheduled',
      recipients: 180,
      opened: 0,
      clicked: 0,
      subject: 'Exciting News: New Route Service Available',
      sentDate: null
    },
    {
      id: 'CAM-003',
      name: 'Payment Reminder - Overdue Invoices',
      type: 'reminder',
      status: 'draft',
      recipients: 15,
      opened: 0,
      clicked: 0,
      subject: 'Payment Reminder - Invoice Due',
      sentDate: null
    }
  ];

  const emailTemplates: EmailTemplate[] = [
    {
      id: 'TEMP-001',
      name: 'Service Update Template',
      type: 'newsletter',
      description: 'Monthly service updates and company news',
      lastModified: '2024-01-10',
      used: 12
    },
    {
      id: 'TEMP-002',
      name: 'Invoice Template',
      type: 'billing',
      description: 'Professional invoice email template',
      lastModified: '2024-01-08',
      used: 45
    },
    {
      id: 'TEMP-003',
      name: 'Welcome Email',
      type: 'onboarding',
      description: 'Welcome new customers to our service',
      lastModified: '2024-01-05',
      used: 8
    }
  ];

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
    totalCampaigns: emailCampaigns.length,
    totalRecipients: emailCampaigns.reduce((sum, camp) => sum + camp.recipients, 0),
    totalOpened: emailCampaigns.reduce((sum, camp) => sum + camp.opened, 0),
    totalClicked: emailCampaigns.reduce((sum, camp) => sum + camp.clicked, 0)
  };

  const openRate = emailStats.totalRecipients > 0 ? (emailStats.totalOpened / emailStats.totalRecipients * 100) : 0;

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
              <DialogTitle>Compose New Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input id="campaign-name" placeholder="Internal campaign name" />
                </div>
                <div>
                  <Label htmlFor="email-type">Email Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="recipients">Recipients</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-customers">All Customers</SelectItem>
                    <SelectItem value="school-customers">School Transport Customers</SelectItem>
                    <SelectItem value="medical-customers">Medical Transport Customers</SelectItem>
                    <SelectItem value="charter-customers">Charter Service Customers</SelectItem>
                    <SelectItem value="overdue-invoices">Customers with Overdue Invoices</SelectItem>
                    <SelectItem value="custom">Custom List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input id="subject" placeholder="Email subject line" />
              </div>

              <div>
                <Label htmlFor="content">Email Content</Label>
                <Textarea id="content" placeholder="Compose your email message..." rows={8} />
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="flex-1">
                  Save Draft
                </Button>
                <Button variant="outline">
                  Preview
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
                  {emailCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-gray-600">{campaign.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{campaign.type}</TableCell>
                      <TableCell>{campaign.recipients}</TableCell>
                      <TableCell>{campaign.opened}</TableCell>
                      <TableCell>{campaign.clicked}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>{campaign.sentDate || 'Not sent'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{template.type}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Used {template.used} times</span>
                      <span>Modified: {template.lastModified}</span>
                    </div>
                  </div>
                ))}
              </div>
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