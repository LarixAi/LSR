import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserCheck, UserX, Clock, Building2, Users, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OrganizationRequest {
  id: string;
  mechanic_id: string;
  organization_id: string;
  request_type: 'mechanic_to_org' | 'org_to_mechanic';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'terminated';
  requested_by: string;
  approved_by?: string;
  approved_at?: string;
  terminated_by?: string;
  terminated_at?: string;
  termination_reason?: string;
  message?: string;
  response_message?: string;
  created_at: string;
  mechanic?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
  };
}

const AdminOrganizationRequests = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<OrganizationRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);

  // Fetch pending requests for admin's organization
  const { data: pendingRequests = [], isLoading } = useQuery({
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
    enabled: !!profile?.organization_id && profile.role === 'admin',
  });

  // Fetch active mechanic relationships
  const { data: activeMechanics = [] } = useQuery({
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

      if (error) {
        console.error('Error fetching active mechanics:', error);
        return [];
      }

      return requests || [];
    },
    enabled: !!profile?.organization_id && profile.role === 'admin',
  });

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

  // Terminate relationship mutation
  const terminateRelationshipMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const { error } = await supabase
        .from('mechanic_organization_requests')
        .update({
          status: 'terminated',
          terminated_by: profile?.id,
          terminated_at: new Date().toISOString(),
          termination_reason: reason.trim() || 'Terminated by admin',
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Relationship Terminated',
        description: 'The mechanic relationship has been terminated.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-active-mechanics'] });
    },
  });

  const handleApprove = (request: OrganizationRequest) => {
    setSelectedRequest(request);
    setIsResponseDialogOpen(true);
  };

  const handleReject = (request: OrganizationRequest) => {
    setSelectedRequest(request);
    setIsResponseDialogOpen(true);
  };

  const handleResponse = (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    if (action === 'approve') {
      approveRequestMutation.mutate({
        requestId: selectedRequest.id,
        responseMessage
      });
    } else {
      rejectRequestMutation.mutate({
        requestId: selectedRequest.id,
        responseMessage
      });
    }
  };

  if (profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Mechanic Requests</span>
            {pendingRequests.length > 0 && (
              <Badge variant="destructive">{pendingRequests.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review and manage mechanic requests to join your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p>Loading requests...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-gray-600">
                All mechanic requests have been reviewed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request: OrganizationRequest) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
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
                      onClick={() => handleApprove(request)}
                      disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(request)}
                      disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Mechanics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Active Mechanics</span>
            <Badge variant="outline">{activeMechanics.length}</Badge>
          </CardTitle>
          <CardDescription>
            Mechanics currently working with your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeMechanics.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Mechanics</h3>
              <p className="text-gray-600">
                No mechanics are currently working with your organization.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMechanics.map((request: OrganizationRequest) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Users className="h-5 w-5 text-green-600" />
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to terminate this relationship?')) {
                        terminateRelationshipMutation.mutate({
                          requestId: request.id,
                          reason: 'Terminated by admin'
                        });
                      }
                    }}
                    disabled={terminateRelationshipMutation.isPending}
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Terminate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest && (
                <>
                  {approveRequestMutation.isPending || rejectRequestMutation.isPending ? 'Processing...' : 'Respond to Request'}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Respond to {selectedRequest.mechanic?.first_name} {selectedRequest.mechanic?.last_name}'s request to join your organization.
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
              onClick={() => handleResponse('reject')}
              disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
            >
              <UserX className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => handleResponse('approve')}
              disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrganizationRequests;
