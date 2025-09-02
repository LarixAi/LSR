import React from 'react';
import { Wrench, Users, ClipboardList, TrendingUp, Plus, UserCheck, UserX, Clock, Building2, FileText } from 'lucide-react';
import { useMechanicStats } from '@/hooks/useMechanics';
import MechanicsManagement from '@/components/mechanics/MechanicsManagement';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useMechanicDocuments, useUploadMechanicDocument } from '@/hooks/useMechanicDocuments';

const Mechanics = () => {
  const mechanicStats = useMechanicStats();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  // State for mechanic request management
  const [selectedRequest, setSelectedRequest] = React.useState<any>(null);
  const [responseMessage, setResponseMessage] = React.useState('');
  const [isResponseDialogOpen, setIsResponseDialogOpen] = React.useState(false);
  const { data: mechanicDocs = [], isLoading: docsLoading } = useMechanicDocuments();
  const uploadDocMutation = useUploadMechanicDocument();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadDocMutation.mutate(file);
    e.target.value = '';
  };

  // Fetch pending mechanic requests for admin's organization
  const { data: pendingRequests = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-pending-requests', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data: requests, error } = await supabase
        .from('mechanic_organization_requests')
        .select(`
          *,
          mechanic:profiles!mechanic_id(id, first_name, last_name, email),
          organization:organizations(id, name)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending requests:', error);
        return [];
      }

      return requests || [];
    },
    enabled: !!profile?.organization_id && profile?.role === 'admin',
  });

  // Fetch active mechanic relationships
  const { data: activeMechanics = [], isLoading: activeLoading } = useQuery({
    queryKey: ['admin-active-mechanics', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data: requests, error } = await supabase
        .from('mechanic_organization_requests')
        .select(`
          *,
          mechanic:profiles!mechanic_id(id, first_name, last_name, email),
          organization:organizations(id, name)
        `)
        .eq('organization_id', profile.organization_id)
        .in('status', ['active', 'approved'])
        .order('created_at', { ascending: false });

      return requests || [];
    },
    enabled: !!profile?.organization_id && profile?.role === 'admin',
  });

  const queryClient = useQueryClient();

  // Approve request mutation
  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, responseMessage }: { requestId: string; responseMessage: string }) => {
      const { error } = await supabase
        .from('mechanic_organization_requests')
        .update({
          status: 'approved',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
          response_message: responseMessage.trim() || null,
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Request Approved',
        description: 'The mechanic has been approved to work with your organization.',
      });
      setIsResponseDialogOpen(false);
      setSelectedRequest(null);
      setResponseMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-active-mechanics'] });
    },
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, responseMessage }: { requestId: string; responseMessage: string }) => {
      const { error } = await supabase
        .from('mechanic_organization_requests')
        .update({
          status: 'rejected',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
          response_message: responseMessage.trim() || null,
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Request Rejected',
        description: 'The request has been rejected.',
      });
      setIsResponseDialogOpen(false);
      setSelectedRequest(null);
      setResponseMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-requests'] });
    },
  });

  const primaryAction = {
    label: 'Add Mechanic',
    onClick: () => navigate('/mechanics/add'),
    icon: <Plus className="w-4 h-4" />
  };

  const secondaryActions = [
    {
      label: 'Contracts Overview',
      onClick: () => navigate('/mechanics/contracts'),
      icon: <FileText className="w-4 h-4" />,
      variant: 'outline' as const
    },
    {
      label: 'Standard Contract',
      onClick: () => navigate('/mechanics/contract'),
      icon: <Wrench className="w-4 h-4" />,
      variant: 'outline' as const
    },
    {
      label: 'Transport Contract',
      onClick: () => navigate('/mechanics/transport-contract'),
      icon: <Wrench className="w-4 h-4" />,
      variant: 'outline' as const
    },
    {
      label: 'Export',
      onClick: () => navigate('/mechanics/export'),
      icon: <Wrench className="w-4 h-4" />,
      variant: 'outline' as const
    }
  ];

  // Helper functions for request management
  const handleApproveRequest = (request: any) => {
    setSelectedRequest(request);
    setIsResponseDialogOpen(true);
  };

  const handleRejectRequest = (request: any) => {
    setSelectedRequest(request);
    setIsResponseDialogOpen(true);
  };

  const handleResponseSubmit = (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;
    
    if (action === 'approve') {
      approveRequestMutation.mutate({
        requestId: selectedRequest.id,
        responseMessage: responseMessage
      });
    } else {
      rejectRequestMutation.mutate({
        requestId: selectedRequest.id,
        responseMessage: responseMessage
      });
    }
  };

  const metricsCards = [
    {
      title: 'Active Mechanics',
      value: activeMechanics.length.toString(),
      subtitle: `${activeMechanics.length} working with your organization`,
      icon: <Users className="w-5 h-5" />
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length.toString(),
      subtitle: `${pendingRequests.length} waiting for approval`,
      icon: <ClipboardList className="w-5 h-5" />
    },
    {
      title: 'Total Mechanics',
      value: (activeMechanics.length + pendingRequests.length).toString(),
      subtitle: 'All mechanic relationships',
      icon: <Wrench className="w-5 h-5" />
    },
    {
      title: 'Organization',
      value: profile?.organization_id ? 'Connected' : 'Not Set',
      subtitle: 'Current organization status',
      icon: <Building2 className="w-5 h-5" />
    }
  ];

  // Navigation tabs for the page
  const navigationTabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'documents', label: 'Documents' },
  ];

  const [activeTab, setActiveTab] = React.useState<string>('overview');

  return (
    <StandardPageLayout
      title="Mechanics Dashboard"
      description="Manage mechanics, assignments, and maintenance requests"
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      showSearch={false}
      showFilters={false}
      showTable={false}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tableColumns={[]}
      tableData={[]}
    >
      {activeTab === 'overview' && (
        <>
        {/* Mechanic Request Management for Admins */}
        {profile?.role === 'admin' && (
        <div className="space-y-6 mb-8">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span>Pending Mechanic Requests ({pendingRequests.length})</span>
                </CardTitle>
                <CardDescription>
                  Review and approve mechanic requests to join your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <UserCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {request.mechanic?.first_name} {request.mechanic?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{request.mechanic?.email}</p>
                          <p className="text-sm text-gray-500">
                            Requested {new Date(request.created_at).toLocaleDateString()}
                          </p>
                          {request.message && (
                            <p className="text-sm text-gray-700 mt-1">"{request.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request)}
                          disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectRequest(request)}
                          disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Mechanics */}
          {activeMechanics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span>Active Mechanics ({activeMechanics.length})</span>
                </CardTitle>
                <CardDescription>
                  Mechanics currently working with your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeMechanics.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {request.mechanic?.first_name} {request.mechanic?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{request.mechanic?.email}</p>
                          <p className="text-sm text-gray-500">
                            Joined {new Date(request.created_at).toLocaleDateString()}
                          </p>
                          {request.response_message && (
                            <p className="text-sm text-gray-700 mt-1">"{request.response_message}"</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Requests Message */}
          {pendingRequests.length === 0 && activeMechanics.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Mechanic Requests</h3>
                <p className="text-gray-600">
                  No mechanics have requested to join your organization yet. 
                  Mechanics can request to join through their dashboard.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        )}

        <MechanicsManagement />

        {/* Response Dialog */}
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent aria-describedby="mechanic-response-desc">
            <DialogHeader>
              <DialogTitle>
                {approveRequestMutation.isPending || rejectRequestMutation.isPending 
                  ? 'Processing...' 
                  : 'Respond to Request'
                }
              </DialogTitle>
              <DialogDescription id="mechanic-response-desc">
                {selectedRequest && (
                  <>
                    Respond to {selectedRequest.mechanic?.first_name} {selectedRequest.mechanic?.last_name}'s 
                    request to join your organization.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Response Message (Optional)</label>
                <Textarea
                  placeholder="Add a personal message..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsResponseDialogOpen(false)}
                disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleResponseSubmit('reject')}
                disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
              >
                <UserX className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button
                onClick={() => handleResponseSubmit('approve')}
                disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Contracts & Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Upload generated PDFs to store them centrally for your organization.</div>
                <div className="flex items-center space-x-2">
                  <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                  <Button size="sm" variant="outline" onClick={handleUploadClick} disabled={uploadDocMutation.isPending}>
                    {uploadDocMutation.isPending ? 'Uploading...' : 'Upload PDF'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Standard Mechanic Employment Contract</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">Fill the form and generate a professional PDF.</p>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => navigate('/mechanics/contract')}>
                        Open Form
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Transport Company Mechanic Contract</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">Specialized transport contract with DVSA/O-License support.</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => navigate('/mechanics/transport-contract')}>
                        Open Form
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Stored PDFs</CardTitle>
                  <CardDescription>Mechanics & Maintenance Management documents saved in Supabase Storage</CardDescription>
                </CardHeader>
                <CardContent>
                  {docsLoading ? (
                    <div className="text-sm text-gray-600">Loading documents...</div>
                  ) : mechanicDocs.length === 0 ? (
                    <div className="text-sm text-gray-600">No PDFs uploaded yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {mechanicDocs.map((doc) => (
                        <div key={doc.path} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                              <div className="text-xs text-gray-500">{new Date(doc.created_at || doc.updated_at || Date.now()).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a href={doc.publicUrl} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="outline">View</Button>
                            </a>
                            <a href={doc.publicUrl} download>
                              <Button size="sm">Download</Button>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}
    </StandardPageLayout>
  );
};

export default Mechanics;