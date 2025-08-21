import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  FileText,
  User,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ApprovalRequest {
  id: string;
  organization_id: string;
  part_id?: string;
  requester_id: string;
  request_type: 'new_part' | 'quantity_increase' | 'price_change' | 'supplier_change' | 'discontinue_part';
  current_value: string;
  requested_value: string;
  quantity_requested: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  admin_notes?: string;
  created_at: string;
  requester?: {
    full_name: string;
    email: string;
  };
  part?: {
    part_number: string;
    name: string;
    current_quantity: number;
    unit_price: number;
  };
}

const AdminApprovalPanel = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch approval requests
  const { data: approvalRequests = [], isLoading } = useQuery({
    queryKey: ['approval-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parts_approval_requests' as any)
        .select(`
          *,
          part:parts_inventory!parts_approval_requests_part_id_fkey(part_number, name, quantity, unit_price)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approval requests:', error);
        return [];
      }

      // Fetch requester profiles separately since the foreign key relationship doesn't exist
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request: any) => {
          if (request.requester_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', request.requester_id)
              .single();
            
            return {
              ...request,
              requester: profileData || { full_name: 'Unknown User', email: 'unknown@example.com' }
            };
          }
          return {
            ...request,
            requester: { full_name: 'Unknown User', email: 'unknown@example.com' }
          };
        })
      );

      return requestsWithProfiles as unknown as ApprovalRequest[];
    }
  });

  // Approve request mutation
  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      const { data, error } = await supabase
        .from('parts_approval_requests' as any)
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['parts-inventory'] });
      toast({
        title: 'Success',
        description: 'Request approved successfully',
      });
      setShowDetailsDialog(false);
      setSelectedRequest(null);
      setAdminNotes('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to approve request',
        variant: 'destructive',
      });
    }
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      const { data, error } = await supabase
        .from('parts_approval_requests' as any)
        .update({
          status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      toast({
        title: 'Success',
        description: 'Request rejected successfully',
      });
      setShowDetailsDialog(false);
      setSelectedRequest(null);
      setAdminNotes('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  });

  const handleApprove = () => {
    if (selectedRequest) {
      approveRequestMutation.mutate({
        requestId: selectedRequest.id,
        notes: adminNotes
      });
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      rejectRequestMutation.mutate({
        requestId: selectedRequest.id,
        notes: adminNotes
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'new_part':
        return <Package className="w-4 h-4" />;
      case 'quantity_increase':
        return <AlertTriangle className="w-4 h-4" />;
      case 'price_change':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const pendingRequests = approvalRequests.filter(req => req.status === 'pending');
  const processedRequests = approvalRequests.filter(req => req.status !== 'pending');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p>Loading approval requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Pending Approval Requests ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No pending approval requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getRequestTypeIcon(request.request_type)}
                      <div>
                        <h4 className="font-semibold capitalize">
                          {request.request_type.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Requested by {request.requester?.full_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Part:</span>
                      <p className="text-gray-600">{request.part?.name || 'New Part'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Quantity:</span>
                      <p className="text-gray-600">{request.quantity_requested || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>
                      <p className="text-gray-600">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Reason:</span>
                      <p className="text-gray-600 truncate">{request.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Processed Requests ({processedRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No processed requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {processedRequests.slice(0, 10).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getRequestTypeIcon(request.request_type)}
                    <div>
                      <p className="font-medium capitalize">
                        {request.request_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.part?.name || 'New Part'} • {request.requester?.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <span className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Approval Request</DialogTitle>
            <DialogDescription>
              Review the details and approve or reject this request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Request Type</Label>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedRequest.request_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <Label className="font-medium">Requester</Label>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.requester?.full_name} ({selectedRequest.requester?.email})
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Date Requested</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedRequest.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Part Details */}
              {selectedRequest.part && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Part Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Part Number:</span>
                      <p className="text-gray-600">{selectedRequest.part.part_number}</p>
                    </div>
                    <div>
                      <span className="font-medium">Name:</span>
                      <p className="text-gray-600">{selectedRequest.part.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Current Quantity:</span>
                      <p className="text-gray-600">{selectedRequest.part.current_quantity}</p>
                    </div>
                    <div>
                      <span className="font-medium">Unit Price:</span>
                      <p className="text-gray-600">£{selectedRequest.part.unit_price}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Request Details */}
              <div>
                <Label className="font-medium">Reason for Request</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.quantity_requested && (
                <div>
                  <Label className="font-medium">Quantity Requested</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedRequest.quantity_requested}</p>
                </div>
              )}

              {/* Current vs Requested Values */}
              {selectedRequest.current_value && selectedRequest.requested_value && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Current Value</Label>
                    <pre className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                      {JSON.stringify(JSON.parse(selectedRequest.current_value), null, 2)}
                    </pre>
                  </div>
                  <div>
                    <Label className="font-medium">Requested Value</Label>
                    <pre className="text-sm text-gray-600 mt-1 bg-blue-50 p-2 rounded">
                      {JSON.stringify(JSON.parse(selectedRequest.requested_value), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApprovalPanel;
