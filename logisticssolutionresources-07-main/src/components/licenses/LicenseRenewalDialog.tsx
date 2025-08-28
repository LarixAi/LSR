
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useCreateLicenseRenewal } from '@/hooks/useLicenseRenewals';

interface LicenseRenewalDialogProps {
  license: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LicenseRenewalDialog: React.FC<LicenseRenewalDialogProps> = ({
  license,
  open,
  onOpenChange
}) => {
  const [formData, setFormData] = useState({
    new_expiry_date: '',
    renewal_cost: '',
    notes: ''
  });

  const createRenewal = useCreateLicenseRenewal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!license) return;

    const renewalData = {
      license_id: license.id,
      previous_expiry_date: license.expiry_date,
      new_expiry_date: formData.new_expiry_date,
      renewal_cost: formData.renewal_cost ? parseFloat(formData.renewal_cost) : null,
      notes: formData.notes
    };

    createRenewal.mutate(renewalData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          new_expiry_date: '',
          renewal_cost: '',
          notes: ''
        });
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!license) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Renew License</DialogTitle>
          <DialogDescription>
            Record license renewal for {license.license_number}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Driver:</span> {license.profiles ? `${license.profiles.first_name} ${license.profiles.last_name}` : 'Unknown'}</div>
            <div><span className="font-medium">Current Expiry:</span> {format(new Date(license.expiry_date), 'MMM dd, yyyy')}</div>
            <div><span className="font-medium">License Type:</span> {license.license_type}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="new_expiry_date">New Expiry Date</Label>
            <Input
              id="new_expiry_date"
              type="date"
              value={formData.new_expiry_date}
              onChange={(e) => handleInputChange('new_expiry_date', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="renewal_cost">Renewal Cost</Label>
            <Input
              id="renewal_cost"
              type="number"
              step="0.01"
              value={formData.renewal_cost}
              onChange={(e) => handleInputChange('renewal_cost', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Any additional notes about the renewal..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRenewal.isPending}>
              {createRenewal.isPending ? 'Recording...' : 'Record Renewal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LicenseRenewalDialog;
