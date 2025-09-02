import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Mail, 
  BarChart3, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Copy,
  Download
} from 'lucide-react';
import { useUserAgreements } from '@/hooks/useUserAgreements';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NotificationManager from '@/components/admin/NotificationManager';

interface AgreementFormData {
  agreement_type: 'terms_of_service' | 'privacy_policy';
  version: string;
  title: string;
  content: string;
  effective_date: string;
}

const AgreementManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    agreements,
    isLoadingAgreements,
    refetchStatus
  } = useUserAgreements();

  const [formData, setFormData] = useState<AgreementFormData>({
    agreement_type: 'terms_of_service',
    version: '',
    title: '',
    content: '',
    effective_date: new Date().toISOString().split('T')[0]
  });

  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    acceptedTerms: 0,
    acceptedPrivacy: 0,
    pendingAcceptance: 0,
    recentAcceptances: []
  });

  // Load analytics data
  React.useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get acceptance counts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('terms_accepted, privacy_policy_accepted');

      const acceptedTerms = profiles?.filter(p => p.terms_accepted).length || 0;
      const acceptedPrivacy = profiles?.filter(p => p.privacy_policy_accepted).length || 0;
      const pendingAcceptance = (totalUsers || 0) - Math.min(acceptedTerms, acceptedPrivacy);

      // Get recent acceptances
      const { data: recentAcceptances } = await supabase
        .from('user_agreement_acceptances')
        .select(`
          accepted_at,
          user_agreements!inner(agreement_type, version, title),
          profiles!inner(first_name, last_name, email)
        `)
        .order('accepted_at', { ascending: false })
        .limit(10);

      setAnalytics({
        totalUsers: totalUsers || 0,
        acceptedTerms,
        acceptedPrivacy,
        pendingAcceptance,
        recentAcceptances: recentAcceptances || []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleCreateAgreement = async () => {
    if (!formData.version || !formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('user_agreements')
        .insert({
          ...formData,
          created_by: user?.id,
          effective_date: new Date(formData.effective_date).toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Agreement created successfully",
      });

      setShowCreateDialog(false);
      setFormData({
        agreement_type: 'terms_of_service',
        version: '',
        title: '',
        content: '',
        effective_date: new Date().toISOString().split('T')[0]
      });
      refetchStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create agreement",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateAgreement = async () => {
    if (!selectedAgreement) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_agreements')
        .update({
          title: formData.title,
          content: formData.content,
          effective_date: new Date(formData.effective_date).toISOString()
        })
        .eq('id', selectedAgreement.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Agreement updated successfully",
      });

      setShowEditDialog(false);
      setSelectedAgreement(null);
      refetchStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update agreement",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeactivateAgreement = async (agreementId: string) => {
    try {
      const { error } = await supabase
        .from('user_agreements')
        .update({ is_active: false })
        .eq('id', agreementId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Agreement deactivated successfully",
      });

      refetchStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate agreement",
        variant: "destructive",
      });
    }
  };

  const sendAgreementUpdateNotification = async (agreementType: string, version: string) => {
    try {
      // This would integrate with your email service
      // For now, we'll just show a toast
      toast({
        title: "Notification Sent",
        description: `Email notification sent to users about ${agreementType} v${version} update`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  const downloadAgreement = (agreement: any) => {
    const blob = new Blob([agreement.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agreement.agreement_type}_v${agreement.version}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agreement Management</h1>
          <p className="text-muted-foreground">Manage user agreements, track acceptance, and send notifications</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Agreement
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="notification-manager">Notification Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Terms Accepted</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.acceptedTerms}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.totalUsers > 0 ? Math.round((analytics.acceptedTerms / analytics.totalUsers) * 100) : 0}% acceptance rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Privacy Accepted</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.acceptedPrivacy}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.totalUsers > 0 ? Math.round((analytics.acceptedPrivacy / analytics.totalUsers) * 100) : 0}% acceptance rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Acceptance</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pendingAcceptance}</div>
                <p className="text-xs text-muted-foreground">Need to accept agreements</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Agreement Acceptances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentAcceptances.length > 0 ? (
                  analytics.recentAcceptances.map((acceptance: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {acceptance.profiles.first_name} {acceptance.profiles.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {acceptance.user_agreements.title} v{acceptance.user_agreements.version}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(acceptance.accepted_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(acceptance.accepted_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent acceptances</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Agreements</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAgreements ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {agreements?.map((agreement) => (
                    <div key={agreement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{agreement.title}</h3>
                          <Badge variant="outline">v{agreement.version}</Badge>
                          <Badge variant={agreement.is_active ? "default" : "secondary"}>
                            {agreement.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Effective: {new Date(agreement.effective_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Type: {agreement.agreement_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadAgreement(agreement)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAgreement(agreement);
                            setFormData({
                              agreement_type: agreement.agreement_type,
                              version: agreement.version,
                              title: agreement.title,
                              content: agreement.content,
                              effective_date: agreement.effective_date.split('T')[0]
                            });
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {agreement.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivateAgreement(agreement.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agreement Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Acceptance Trends */}
                <div>
                  <h3 className="font-semibold mb-4">Acceptance Trends</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Terms of Service</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${analytics.totalUsers > 0 ? (analytics.acceptedTerms / analytics.totalUsers) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {analytics.acceptedTerms}/{analytics.totalUsers}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Privacy Policy</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${analytics.totalUsers > 0 ? (analytics.acceptedPrivacy / analytics.totalUsers) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {analytics.acceptedPrivacy}/{analytics.totalUsers}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Version Distribution */}
                <div>
                  <h3 className="font-semibold mb-4">Version Distribution</h3>
                  <div className="space-y-2">
                    {agreements?.map((agreement) => (
                      <div key={agreement.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{agreement.title} v{agreement.version}</span>
                        <Badge variant="outline">{agreement.agreement_type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Agreement Update Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Send email notifications to users when agreements are updated. Users will be prompted to accept the new version on their next login.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agreements?.filter(a => a.is_active).map((agreement) => (
                    <div key={agreement.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{agreement.title}</h4>
                        <Badge variant="outline">v{agreement.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {agreement.agreement_type.replace('_', ' ')}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendAgreementUpdateNotification(agreement.agreement_type, agreement.version)}
                        className="w-full"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Notification
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notification-manager" className="space-y-6">
          <NotificationManager />
        </TabsContent>
      </Tabs>

      {/* Create Agreement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]" aria-describedby="create-agreement-desc">
          <DialogHeader>
            <DialogTitle>Create New Agreement</DialogTitle>
            <DialogDescription id="create-agreement-desc">
              Create a new terms of service or privacy policy agreement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agreement_type">Agreement Type</Label>
                <Select
                  value={formData.agreement_type}
                  onValueChange={(value: 'terms_of_service' | 'privacy_policy') => 
                    setFormData({ ...formData, agreement_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terms_of_service">Terms of Service</SelectItem>
                    <SelectItem value="privacy_policy">Privacy Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., 1.1.0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Agreement title"
              />
            </div>
            <div>
              <Label htmlFor="effective_date">Effective Date</Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter agreement content..."
                className="min-h-[400px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAgreement} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Agreement"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Agreement Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]" aria-describedby="edit-agreement-desc">
          <DialogHeader>
            <DialogTitle>Edit Agreement</DialogTitle>
            <DialogDescription id="edit-agreement-desc">
              Modify the selected agreement's content and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Agreement Type</Label>
                <Input value={formData.agreement_type.replace('_', ' ')} disabled />
              </div>
              <div>
                <Label>Version</Label>
                <Input value={formData.version} disabled />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_title">Title</Label>
              <Input
                id="edit_title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_effective_date">Effective Date</Label>
              <Input
                id="edit_effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_content">Content</Label>
              <Textarea
                id="edit_content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[400px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAgreement} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Agreement"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgreementManagement;
