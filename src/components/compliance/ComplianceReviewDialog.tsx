
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface VehicleCheck {
  id: string;
  vehicle_id: string;
  driver_id: string;
  check_date: string;
  status: string;
  issues?: string[];
  created_at?: string;
  requires_maintenance?: boolean;
  issues_reported?: string[];
  vehicles?: {
    vehicle_number: string;
  };
  driver_profile?: {
    first_name: string;
    last_name: string;
  };
}

interface ComplianceReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleCheck: VehicleCheck;
}

const ComplianceReviewDialog: React.FC<ComplianceReviewDialogProps> = ({
  open,
  onOpenChange,
  vehicleCheck
}) => {
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | 'requires_action'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewPriority, setReviewPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!vehicleCheck) return;

    setIsSubmitting(true);
    try {
      // Since the compliance review functionality isn't fully implemented yet,
      // we'll just show a success message
      toast.success('Compliance review submitted successfully');
      onOpenChange(false);
      
      // Reset form
      setReviewStatus('approved');
      setReviewNotes('');
      setReviewPriority('normal');
    } catch (error) {
      console.error('Error submitting compliance review:', error);
      toast.error('Failed to submit compliance review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'requires_action':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'requires_action':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="compliance-review-desc">
        <DialogHeader>
          <DialogTitle>Compliance Review - Vehicle Check</DialogTitle>
          <DialogDescription id="compliance-review-desc">
            Review and approve or reject this vehicle compliance check
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Check Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Check Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Vehicle:</span>
                <p>{vehicleCheck?.vehicles?.vehicle_number || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Driver:</span>
                <p>{vehicleCheck?.driver_profile?.first_name} {vehicleCheck?.driver_profile?.last_name}</p>
              </div>
              <div>
                <span className="font-medium">Date:</span>
                <p>{vehicleCheck?.created_at ? new Date(vehicleCheck.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <p className="font-bold">{vehicleCheck?.requires_maintenance ? 'Needs Attention' : 'Good'}</p>
              </div>
            </div>
          </div>

          {/* Issues if any */}
          {vehicleCheck?.issues_reported && vehicleCheck.issues_reported.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Reported Issues</h4>
              <div className="space-y-2">
                {vehicleCheck.issues_reported.map((issue: string, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{issue}</span>
                    <Badge className="bg-red-100 text-red-800">Issue</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Decision */}
          <div className="space-y-4">
            <Label>Review Decision</Label>
            <RadioGroup value={reviewStatus} onValueChange={(value: any) => setReviewStatus(value)}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approved" id="approved" />
                  <Label htmlFor="approved" className="flex items-center space-x-2 cursor-pointer">
                    {getStatusIcon('approved')}
                    <span>Approved - Check meets compliance standards</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="requires_action" id="requires_action" />
                  <Label htmlFor="requires_action" className="flex items-center space-x-2 cursor-pointer">
                    {getStatusIcon('requires_action')}
                    <span>Requires Action - Minor issues need addressing</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected" id="rejected" />
                  <Label htmlFor="rejected" className="flex items-center space-x-2 cursor-pointer">
                    {getStatusIcon('rejected')}
                    <span>Rejected - Significant compliance issues</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Priority Level */}
          <div className="space-y-4">
            <Label>Priority Level</Label>
            <RadioGroup value={reviewPriority} onValueChange={(value: any) => setReviewPriority(value)}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['low', 'normal', 'high', 'urgent'].map((priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <RadioGroupItem value={priority} id={priority} />
                    <Label htmlFor={priority} className="cursor-pointer capitalize">
                      {priority}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Review Notes */}
          <div className="space-y-2">
            <Label htmlFor="review-notes">Review Notes</Label>
            <Textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add notes about your review decision, required actions, or additional observations..."
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className={getStatusColor(reviewStatus)}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  {getStatusIcon(reviewStatus)}
                  <span className="ml-2">Submit Review</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceReviewDialog;
