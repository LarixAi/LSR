
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Shield, Calendar, AlertTriangle } from 'lucide-react';

interface LicenseDetailsDialogProps {
  license: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LicenseDetailsDialog: React.FC<LicenseDetailsDialogProps> = ({
  license,
  open,
  onOpenChange
}) => {
  if (!license) return null;

  const getLicenseStatusColor = (license: any) => {
    const expiryDate = new Date(license.expiry_date);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (expiryDate < today) return 'bg-red-100 text-red-800';
    if (expiryDate <= thirtyDaysFromNow) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getLicenseStatusText = (license: any) => {
    const expiryDate = new Date(license.expiry_date);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (expiryDate < today) return 'Expired';
    if (expiryDate <= thirtyDaysFromNow) return 'Expiring Soon';
    return 'Valid';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>License Details</span>
          </DialogTitle>
          <DialogDescription>
            Complete information for driver license
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Driver Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> 
                {license.profiles ? ` ${license.profiles.first_name} ${license.profiles.last_name}` : ' Unknown'}
              </div>
              <div>
                <span className="font-medium">Email:</span> 
                {license.profiles?.email || ' Not available'}
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">License Information</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge className={getLicenseStatusColor(license)}>
                  {getLicenseStatusText(license)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">License Number:</span> {license.license_number}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {license.license_type}
                </div>
                <div>
                  <span className="font-medium">Class:</span> {license.license_class || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Issuing Authority:</span> {license.issuing_authority}
                </div>
                <div>
                  <span className="font-medium">Issue Date:</span> {format(new Date(license.issue_date), 'MMM dd, yyyy')}
                </div>
                <div>
                  <span className="font-medium">Expiry Date:</span> {format(new Date(license.expiry_date), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Verification Status</h3>
            <div className="flex items-center justify-between">
              <span className="font-medium">Verification:</span>
              <Badge variant={license.verification_status === 'verified' ? 'default' : 'secondary'}>
                {license.verification_status}
              </Badge>
            </div>
            {license.verified_date && (
              <div className="mt-2 text-sm text-gray-600">
                Verified on: {format(new Date(license.verified_date), 'MMM dd, yyyy')}
              </div>
            )}
          </div>

          {/* Restrictions & Endorsements */}
          {(license.restrictions?.length > 0 || license.endorsements?.length > 0) && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Restrictions & Endorsements</h3>
              {license.restrictions?.length > 0 && (
                <div className="mb-3">
                  <span className="font-medium">Restrictions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {license.restrictions.map((restriction: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {license.endorsements?.length > 0 && (
                <div>
                  <span className="font-medium">Endorsements:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {license.endorsements.map((endorsement: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs bg-blue-100">
                        {endorsement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Penalty Points */}
          {license.points_balance > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                Penalty Points
              </h3>
              <div className="text-lg font-bold text-red-600">
                {license.points_balance} points
              </div>
            </div>
          )}

          {/* Notes */}
          {license.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-gray-700">{license.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LicenseDetailsDialog;
