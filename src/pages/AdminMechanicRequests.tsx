import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Building2, 
  Users, 
  AlertCircle, 
  Search, 
  Filter,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Trash2
} from 'lucide-react';
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
    phone?: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  approver?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

const AdminMechanicRequests = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<OrganizationRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch all requests for admin's organization
  const { data: allRequests = [], isLoading } = useQuery({
    queryKey: ['admin-all-requests', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data: requests, error } = await supabase
        .from('mechanic_organization_requests')
        .select(`
          *,
          mechanic:profiles!mechanic_id(id, first_name, last_name, email, phone),
          organization:organizations(id, name),
          approver:profiles!approved_by(id, first_name, last_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        return [];
      }

      return requests || [];
    },
    enabled: !!profile?.organization_id && profile.role === 'admin',
  });

  // Filter requests based on search and status
  const filteredRequests = allRequests.filter((request: OrganizationRequest) => {
    const matchesSearch = searchTerm === '' || 
      request.mechanic?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.mechanic?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.mechanic?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Separate requests by status
  const pendingRequests = filteredRequests.filter((req: OrganizationRequest) => req.status === 'pending');
  const activeRequests = filteredRequests.filter((req: OrganizationRequest) => req.status === 'active' || req.status === 'approved');
  const rejectedRequests = filteredRequests.filter((req: OrganizationRequest) => req.status === 'rejected');
  const terminatedRequests = filteredRequests.filter((req: OrganizationRequest) => req.status === 'terminated');

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
      queryClient.invalidateQueries({ queryKey: ['admin-all-requests'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-all-requests'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-all-requests'] });
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'terminated':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><XCircle className="h-3 w-3 mr-1" />Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const RequestCard = ({ request }: { request: OrganizationRequest }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-medium">
                  {request.mechanic?.first_name} {request.mechanic?.last_name}
                </h3>
                {getStatusBadge(request.status)}
              </div>
              <p className="text-sm text-gray-600 mb-1">{request.mechanic?.email}</p>
              {request.mechanic?.phone && (
                <p className="text-sm text-gray-600 mb-2">{request.mechanic.phone}</p>
              )}
              <p className="text-xs text-gray-500 mb-2">
                Requested {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
              </p>
              {request.message && (
                <div className="bg-gray-50 p-2 rounded text-sm mb-2">
                  <p className="text-gray-700">"{request.message}"</p>
                </div>
              )}
              {request.response_message && (
                <div className="bg-blue-50 p-2 rounded text-sm">
                  <p className="text-blue-700 font-medium">Response:</p>
                  <p className="text-blue-600">"{request.response_message}"</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {request.status === 'pending' && (
              <>
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
              </>
            )}
            {(request.status === 'active' || request.status === 'approved') && (
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
                <Trash2 className="h-4 w-4 mr-1" />
                Terminate
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Only administrators can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mechanic Request Management</h1>
        <p className="text-gray-600">Manage mechanic requests and working relationships</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{activeRequests.length}</p>
                <p className="text-sm text-gray-600">Active Mechanics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{rejectedRequests.length}</p>
                <p className="text-sm text-gray-600">Rejected Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{terminatedRequests.length}</p>
                <p className="text-sm text-gray-600">Terminated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by mechanic name, email, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending ({pendingRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Active ({activeRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center space-x-2">
            <XCircle className="h-4 w-4" />
            <span>Rejected ({rejectedRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="terminated" className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Terminated ({terminatedRequests.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p>Loading requests...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">All mechanic requests have been reviewed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Mechanics</h3>
                <p className="text-gray-600">No mechanics are currently working with your organization.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Rejected Requests</h3>
                <p className="text-gray-600">No requests have been rejected.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rejectedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="terminated" className="space-y-4">
          {terminatedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Terminated Relationships</h3>
                <p className="text-gray-600">No mechanic relationships have been terminated.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {terminatedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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

export default AdminMechanicRequests;
