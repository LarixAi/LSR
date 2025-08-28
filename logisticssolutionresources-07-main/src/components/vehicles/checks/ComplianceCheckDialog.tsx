
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ComplianceCheckDialogProps {
  check: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (checkId: string, notes: string) => void;
  onReject?: (checkId: string, notes: string) => void;
}

const ComplianceCheckDialog: React.FC<ComplianceCheckDialogProps> = ({
  check,
  open,
  onOpenChange,
  onApprove,
  onReject
}) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsSubmitting(true);
    try {
      await onApprove(check.id, reviewNotes);
      onOpenChange(false);
      setReviewNotes('');
    } catch (error) {
      console.error('Error approving check:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsSubmitting(true);
    try {
      await onReject(check.id, reviewNotes);
      onOpenChange(false);
      setReviewNotes('');
    } catch (error) {
      console.error('Error rejecting check:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!check) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Compliance Review - Vehicle Check</span>
          </DialogTitle>
          <DialogDescription>
            Review and approve or reject this vehicle inspection for compliance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Inspection Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Date:</span> {format(new Date(check.check_date), 'MMM dd, yyyy')}
              </div>
              <div>
                <span className="font-medium">Time:</span> {check.check_time}
              </div>
              <div>
                <span className="font-medium">Driver:</span> 
                {check.driver_profile ? ` ${check.driver_profile.first_name} ${check.driver_profile.last_name}` : ' Unknown'}
              </div>
              <div>
                <span className="font-medium">Vehicle:</span> 
                {check.vehicles ? ` ${check.vehicles.vehicle_number}` : ' Unknown'}
              </div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Compliance Assessment</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Compliance Status:</span>
                <Badge className={getComplianceStatusColor(check.compliance_status)}>
                  {check.compliance_status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Compliance Score:</span>
                <span className="text-lg font-bold">{check.compliance_score || 'N/A'}/100</span>
              </div>
              {check.regulatory_notes && (
                <div>
                  <span className="font-medium">Regulatory Notes:</span>
                  <p className="text-sm text-gray-600 mt-1">{check.regulatory_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Conditions */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Vehicle Condition Assessment</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Engine:</span> 
                <Badge variant="outline" className="ml-2">{check.engine_condition}</Badge>
              </div>
              <div>
                <span className="font-medium">Brakes:</span> 
                <Badge variant="outline" className="ml-2">{check.brakes_condition}</Badge>
              </div>
              <div>
                <span className="font-medium">Tires:</span> 
                <Badge variant="outline" className="ml-2">{check.tires_condition}</Badge>
              </div>
              <div>
                <span className="font-medium">Lights:</span> 
                <Badge variant="outline" className="ml-2">{check.lights_condition}</Badge>
              </div>
              <div>
                <span className="font-medium">Interior:</span> 
                <Badge variant="outline" className="ml-2">{check.interior_condition}</Badge>
              </div>
              <div>
                <span className="font-medium">Exterior:</span> 
                <Badge variant="outline" className="ml-2">{check.exterior_condition}</Badge>
              </div>
            </div>
          </div>

          {/* Issues and Maintenance */}
          {(check.issues_reported?.length > 0 || check.requires_maintenance) && (
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Issues & Maintenance</h3>
              {check.issues_reported?.length > 0 && (
                <div className="mb-3">
                  <span className="font-medium">Issues Reported:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {check.issues_reported.map((issue: string, index: number) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {check.requires_maintenance && (
                <div>
                  <span className="font-medium">Maintenance Required:</span>
                  <Badge variant="destructive" className="ml-2">
                    {check.maintenance_priority} Priority
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Driver Notes */}
          {check.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Driver Notes</h3>
              <p className="text-sm text-gray-700">{check.notes}</p>
            </div>
          )}

          {/* Review Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Compliance Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your compliance review notes here..."
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Check
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Check
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceCheckDialog;
