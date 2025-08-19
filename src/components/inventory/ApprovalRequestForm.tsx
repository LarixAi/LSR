import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  Package,
  DollarSign,
  Plus,
  Minus,
  Settings,
  X
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ApprovalRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  partId?: string;
  partData?: any;
  requestType?: 'new_part' | 'quantity_increase' | 'price_change' | 'supplier_change' | 'discontinue_part';
}

const ApprovalRequestForm = ({ 
  isOpen, 
  onClose, 
  partId, 
  partData, 
  requestType = 'new_part' 
}: ApprovalRequestFormProps) => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    request_type: requestType,
    quantity_requested: 0,
    reason: '',
    current_value: '',
    requested_value: ''
  });

  // Create approval request mutation
  const createApprovalRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const enrichedRequestData = {
        ...requestData,
        organization_id: profile?.organization_id,
        requester_id: user?.id,
        part_id: partId,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('parts_approval_requests' as any)
        .insert([enrichedRequestData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      toast({
        title: 'Success',
        description: 'Approval request submitted successfully',
      });
      onClose();
      setFormData({
        request_type: requestType,
        quantity_requested: 0,
        reason: '',
        current_value: '',
        requested_value: ''
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit approval request',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for the request',
        variant: 'destructive',
      });
      return;
    }

    // Prepare current and requested values based on request type
    let currentValue = '';
    let requestedValue = '';

    if (requestType === 'new_part') {
      currentValue = JSON.stringify({});
      requestedValue = JSON.stringify(partData);
    } else if (partData) {
      currentValue = JSON.stringify({
        quantity: partData.quantity,
        unit_price: partData.unit_price,
        supplier: partData.supplier,
        min_quantity: partData.min_quantity
      });

      if (requestType === 'quantity_increase') {
        requestedValue = JSON.stringify({
          quantity: partData.quantity + formData.quantity_requested,
          unit_price: partData.unit_price,
          supplier: partData.supplier,
          min_quantity: partData.min_quantity
        });
      } else if (requestType === 'price_change') {
        requestedValue = JSON.stringify({
          quantity: partData.quantity,
          unit_price: partData.unit_price * 1.1, // Example: 10% increase
          supplier: partData.supplier,
          min_quantity: partData.min_quantity
        });
      }
    }

    createApprovalRequestMutation.mutate({
      ...formData,
      current_value: currentValue,
      requested_value: requestedValue
    });
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'new_part':
        return <Package className="w-4 h-4" />;
      case 'quantity_increase':
        return <Plus className="w-4 h-4" />;
      case 'price_change':
        return <DollarSign className="w-4 h-4" />;
      case 'supplier_change':
        return <Settings className="w-4 h-4" />;
      case 'discontinue_part':
        return <X className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getRequestTypeDescription = (type: string) => {
    switch (type) {
      case 'new_part':
        return 'Request to add a new part to inventory';
      case 'quantity_increase':
        return 'Request to increase stock quantity';
      case 'price_change':
        return 'Request to change unit price';
      case 'supplier_change':
        return 'Request to change supplier information';
      case 'discontinue_part':
        return 'Request to discontinue a part';
      default:
        return 'Request for inventory change';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getRequestTypeIcon(requestType)}
            Approval Request
          </DialogTitle>
          <DialogDescription>
            {getRequestTypeDescription(requestType)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Request Type */}
          <div>
            <Label>Request Type</Label>
            <div className="mt-1">
              <Badge className="capitalize">
                {requestType.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Part Information (if applicable) */}
          {partData && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <Label className="text-sm font-medium">Part Details</Label>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {partData.name}</p>
                <p><span className="font-medium">Part Number:</span> {partData.part_number}</p>
                <p><span className="font-medium">Current Quantity:</span> {partData.quantity}</p>
                <p><span className="font-medium">Unit Price:</span> £{partData.unit_price}</p>
              </div>
            </div>
          )}

          {/* Quantity Requested (for quantity increase) */}
          {requestType === 'quantity_increase' && (
            <div>
              <Label htmlFor="quantity">Quantity to Add</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity_requested}
                onChange={(e) => setFormData({
                  ...formData,
                  quantity_requested: parseInt(e.target.value) || 0
                })}
                placeholder="Enter quantity"
              />
              {formData.quantity_requested > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  New total: {partData?.quantity + formData.quantity_requested}
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason for Request *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({
                ...formData,
                reason: e.target.value
              })}
              placeholder="Explain why this change is needed..."
              rows={3}
              required
            />
          </div>

          {/* Approval Notice */}
          <div className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Approval Required</p>
                <p className="text-yellow-700">
                  This request will be reviewed by an administrator before being processed.
                </p>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={createApprovalRequestMutation.isPending || !formData.reason.trim()}
          >
            {createApprovalRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalRequestForm;
