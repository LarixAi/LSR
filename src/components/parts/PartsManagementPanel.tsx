import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Eye,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { usePartsInventory, PartsRequest } from '@/hooks/usePartsInventory';
import { useOrganization } from '@/contexts/OrganizationContext';
import PartsRequestDialog from './PartsRequestDialog';
import { format } from 'date-fns';

interface PartsManagementPanelProps {
  defectId: string;
  defectType: string;
  defectTitle: string;
}

const PartsManagementPanel: React.FC<PartsManagementPanelProps> = ({
  defectId,
  defectType,
  defectTitle
}) => {
  const { selectedOrganizationId } = useOrganization();
  const [showPartsRequestDialog, setShowPartsRequestDialog] = useState(false);
  const [showPartsDetailsDialog, setShowPartsDetailsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PartsRequest | null>(null);

  const {
    partsRequests,
    inventoryStats,
    updatePartsRequest,
    isUpdatingRequest
  } = usePartsInventory(selectedOrganizationId);

  // Filter parts requests for this specific defect
  const defectPartsRequests = partsRequests.filter(request => request.defect_id === defectId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'fulfilled':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4" />;
      case 'fulfilled':
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleRequestCreated = (request: PartsRequest) => {
    // The request will be automatically added to the list via React Query
    console.log('Parts request created:', request);
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await updatePartsRequest({
        id: requestId,
        status: 'approved',
        notes: 'Approved by mechanic'
      });
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updatePartsRequest({
        id: requestId,
        status: 'rejected',
        notes: 'Rejected by mechanic'
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleViewRequest = (request: PartsRequest) => {
    setSelectedRequest(request);
    setShowPartsDetailsDialog(true);
  };

  // Calculate total parts cost for this defect
  const totalPartsCost = defectPartsRequests.reduce((total, request) => {
    // This would need to be calculated based on actual part prices
    // For now, we'll use a placeholder
    return total + (request.quantity_requested * 50); // Assuming £50 per part
  }, 0);

  return (
    <div className="space-y-6">
      {/* Parts Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Parts Management</span>
            </CardTitle>
            <Button
              onClick={() => setShowPartsRequestDialog(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Parts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {defectPartsRequests.length}
              </div>
              <div className="text-sm text-gray-600">Parts Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {defectPartsRequests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {defectPartsRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                £{totalPartsCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parts Requests Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({defectPartsRequests.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({defectPartsRequests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({defectPartsRequests.filter(r => r.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="fulfilled">
            Fulfilled ({defectPartsRequests.filter(r => r.status === 'fulfilled').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {defectPartsRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Parts Requests</h3>
                <p className="text-gray-600 mb-4">
                  No parts have been requested for this repair yet.
                </p>
                <Button onClick={() => setShowPartsRequestDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Parts
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {defectPartsRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{request.part?.name || 'Unknown Part'}</h4>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Part Number:</span> {request.part?.part_number || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span> {request.quantity_requested}
                          </div>
                          <div>
                            <span className="font-medium">Requested:</span> {format(new Date(request.requested_date), 'MMM dd, yyyy')}
                          </div>
                          <div>
                            <span className="font-medium">Estimated Cost:</span> £{(request.quantity_requested * 50).toFixed(2)}
                          </div>
                        </div>

                        {request.notes && (
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {request.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={isUpdatingRequest}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={isUpdatingRequest}
                              className="text-red-600 hover:text-red-700"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {defectPartsRequests.filter(r => r.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">All parts requests have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {defectPartsRequests
                .filter(r => r.status === 'pending')
                .map((request) => (
                  <Card key={request.id} className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{request.part?.name || 'Unknown Part'}</h4>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              {request.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Part Number:</span> {request.part?.part_number || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span> {request.quantity_requested}
                            </div>
                            <div>
                              <span className="font-medium">Requested:</span> {format(new Date(request.requested_date), 'MMM dd, yyyy')}
                            </div>
                          </div>

                          {request.notes && (
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                              {request.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={isUpdatingRequest}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={isUpdatingRequest}
                            className="text-red-600 hover:text-red-700"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {defectPartsRequests.filter(r => r.status === 'approved').length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Requests</h3>
                <p className="text-gray-600">No parts requests have been approved yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {defectPartsRequests
                .filter(r => r.status === 'approved')
                .map((request) => (
                  <Card key={request.id} className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{request.part?.name || 'Unknown Part'}</h4>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              {request.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Part Number:</span> {request.part?.part_number || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span> {request.quantity_requested}
                            </div>
                            <div>
                              <span className="font-medium">Approved:</span> {request.approved_date ? format(new Date(request.approved_date), 'MMM dd, yyyy') : 'N/A'}
                            </div>
                          </div>

                          {request.notes && (
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                              {request.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fulfilled" className="space-y-4">
          {defectPartsRequests.filter(r => r.status === 'fulfilled').length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Fulfilled Requests</h3>
                <p className="text-gray-600">No parts requests have been fulfilled yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {defectPartsRequests
                .filter(r => r.status === 'fulfilled')
                .map((request) => (
                  <Card key={request.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{request.part?.name || 'Unknown Part'}</h4>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              {request.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Part Number:</span> {request.part?.part_number || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span> {request.quantity_requested}
                            </div>
                            <div>
                              <span className="font-medium">Fulfilled:</span> {request.approved_date ? format(new Date(request.approved_date), 'MMM dd, yyyy') : 'N/A'}
                            </div>
                          </div>

                          {request.notes && (
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                              {request.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Parts Request Dialog */}
      <PartsRequestDialog
        open={showPartsRequestDialog}
        onOpenChange={setShowPartsRequestDialog}
        defectId={defectId}
        defectType={defectType}
        onRequestCreated={handleRequestCreated}
      />

      {/* Parts Details Dialog */}
      <Dialog open={showPartsDetailsDialog} onOpenChange={setShowPartsDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Parts Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about this parts request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Part Name</label>
                  <p className="text-lg font-medium">{selectedRequest.part?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Part Number</label>
                  <p className="text-lg font-medium">{selectedRequest.part?.part_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity Requested</label>
                  <p className="text-lg font-medium">{selectedRequest.quantity_requested}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <Badge className={getPriorityColor(selectedRequest.priority)}>
                    {selectedRequest.priority}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested Date</label>
                  <p className="text-lg font-medium">
                    {format(new Date(selectedRequest.requested_date), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded border">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPartsDetailsDialog(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartsManagementPanel;
