import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useCreateLicense } from '@/hooks/useLicenses';
import { useDrivers } from '@/hooks/useDrivers';
import { DriverLicense } from '@/hooks/useLicenses';
import { useNavigate } from 'react-router-dom';

interface AddLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LICENSE_TYPES = [
  // Commercial Driver Licenses (CDL)
  { value: 'CDL-A', label: 'CDL-A (Commercial Driver License - Class A)' },
  { value: 'CDL-B', label: 'CDL-B (Commercial Driver License - Class B)' },
  { value: 'CDL-C', label: 'CDL-C (Commercial Driver License - Class C)' },
  
  // Regular Driver Licenses
  { value: 'Regular', label: 'Regular Driver License' },
  { value: 'Provisional', label: 'Provisional Driver License' },
  { value: 'Learner', label: 'Learner Driver License' },
  
  // International Licenses
  { value: 'International', label: 'International Driver License' },
  { value: 'International-Permit', label: 'International Driving Permit' },
  
  // Specialized Licenses
  { value: 'Motorcycle', label: 'Motorcycle License' },
  { value: 'Motorcycle-A', label: 'Motorcycle License - Class A' },
  { value: 'Motorcycle-A1', label: 'Motorcycle License - Class A1' },
  { value: 'Motorcycle-A2', label: 'Motorcycle License - Class A2' },
  
  // Heavy Vehicle Licenses
  { value: 'Heavy-Vehicle', label: 'Heavy Vehicle License' },
  { value: 'Heavy-Vehicle-C1', label: 'Heavy Vehicle License - Class C1' },
  { value: 'Heavy-Vehicle-C', label: 'Heavy Vehicle License - Class C' },
  { value: 'Heavy-Vehicle-C+E', label: 'Heavy Vehicle License - Class C+E' },
  
  // Bus and Coach Licenses
  { value: 'Bus-D1', label: 'Bus License - Class D1' },
  { value: 'Bus-D', label: 'Bus License - Class D' },
  { value: 'Bus-D+E', label: 'Bus License - Class D+E' },
  { value: 'Coach', label: 'Coach License' },
  { value: 'School-Bus', label: 'School Bus License' },
  
  // Specialized Transport
  { value: 'Hazmat', label: 'Hazardous Materials License' },
  { value: 'Tanker', label: 'Tanker Vehicle License' },
  { value: 'Passenger', label: 'Passenger Transport License' },
  { value: 'Chauffeur', label: 'Chauffeur License' },
  { value: 'Taxi', label: 'Taxi License' },
  { value: 'Private-Hire', label: 'Private Hire License' },
  
  // Agricultural and Specialized
  { value: 'Agricultural', label: 'Agricultural Vehicle License' },
  { value: 'Tractor', label: 'Tractor License' },
  { value: 'Forklift', label: 'Forklift License' },
  { value: 'Crane', label: 'Crane Operator License' },
  
  // Military and Emergency
  { value: 'Military', label: 'Military Driver License' },
  { value: 'Emergency', label: 'Emergency Vehicle License' },
  { value: 'Police', label: 'Police Vehicle License' },
  { value: 'Fire', label: 'Fire Service Vehicle License' },
  { value: 'Ambulance', label: 'Ambulance Driver License' },
  
  // Other Specialized
  { value: 'Disabled', label: 'Disabled Driver License' },
  { value: 'Student', label: 'Student Driver License' },
  { value: 'Temporary', label: 'Temporary Driver License' },
  { value: 'Replacement', label: 'Replacement Driver License' },
  { value: 'Duplicate', label: 'Duplicate Driver License' }
];

const ENDORSEMENTS = [
  'Hazmat', 'Tanker', 'Passenger', 'School Bus', 'Double/Triple', 'Air Brakes'
];

const RESTRICTIONS = [
  'Corrective Lenses', 'Prosthetic Aid', 'Automatic Transmission', 'Outside Mirror', 'Daylight Only'
];

const AddLicenseDialog: React.FC<AddLicenseDialogProps> = ({ open, onOpenChange }) => {
  const createLicense = useCreateLicense();
  const { data: drivers, isLoading: driversLoading, error: driversError } = useDrivers();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('🔍 AddLicenseDialog - Drivers data:', {
    drivers,
    driversLoading,
    driversError,
    driversCount: drivers?.length || 0
  });
  
  const [formData, setFormData] = useState({
    driver_id: '',
    license_number: '',
    license_type: '' as DriverLicense['license_type'],
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
    license_class: '',
    endorsements: [] as string[],
    restrictions: [] as string[],
    medical_certificate_expiry: '',
    background_check_expiry: '',
    drug_test_expiry: '',
    training_expiry: '',
    notes: ''
  });

  const [newEndorsement, setNewEndorsement] = useState('');
  const [newRestriction, setNewRestriction] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.driver_id || !formData.license_number || !formData.license_type || 
        !formData.issuing_authority || !formData.issue_date || !formData.expiry_date) {
      return;
    }

    try {
      await createLicense.mutateAsync(formData);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating license:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      driver_id: '',
      license_number: '',
      license_type: '' as DriverLicense['license_type'],
      issuing_authority: '',
      issue_date: '',
      expiry_date: '',
      license_class: '',
      endorsements: [],
      restrictions: [],
      medical_certificate_expiry: '',
      background_check_expiry: '',
      drug_test_expiry: '',
      training_expiry: '',
      notes: ''
    });
    setNewEndorsement('');
    setNewRestriction('');
  };

  const addEndorsement = () => {
    if (newEndorsement.trim() && !formData.endorsements.includes(newEndorsement.trim())) {
      setFormData(prev => ({
        ...prev,
        endorsements: [...prev.endorsements, newEndorsement.trim()]
      }));
      setNewEndorsement('');
    }
  };

  const removeEndorsement = (endorsement: string) => {
    setFormData(prev => ({
      ...prev,
      endorsements: prev.endorsements.filter(e => e !== endorsement)
    }));
  };

  const addRestriction = () => {
    if (newRestriction.trim() && !formData.restrictions.includes(newRestriction.trim())) {
      setFormData(prev => ({
        ...prev,
        restrictions: [...prev.restrictions, newRestriction.trim()]
      }));
      setNewRestriction('');
    }
  };

  const removeRestriction = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      restrictions: prev.restrictions.filter(r => r !== restriction)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="add-license-desc">
        <DialogHeader>
          <DialogTitle>Add New Driver License</DialogTitle>
          <DialogDescription id="add-license-desc">
            Enter all required license information for the driver.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driver_id">Driver *</Label>
              <Select value={formData.driver_id} onValueChange={(value) => setFormData(prev => ({ ...prev, driver_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={driversLoading ? "Loading drivers..." : "Select driver"} />
                </SelectTrigger>
                <SelectContent>
                  {driversLoading ? (
                    <SelectItem value="" disabled>
                      Loading drivers...
                    </SelectItem>
                  ) : driversError ? (
                    <SelectItem value="" disabled>
                      Error loading drivers
                    </SelectItem>
                  ) : drivers && drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No drivers found in organization
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {driversError && (
                <p className="text-sm text-red-500">
                  Error loading drivers: {driversError.message}
                </p>
              )}
              {!driversLoading && !driversError && drivers && drivers.length === 0 && (
                <div className="text-sm text-yellow-600 space-y-2">
                  <p>No drivers found in your organization.</p>
                  <p>To add a license, you need to:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Go to <strong>Driver Management</strong> page</li>
                    <li>Add drivers to your organization</li>
                    <li>Return here to add licenses for those drivers</li>
                  </ol>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/drivers');
                    }}
                    className="mt-2"
                  >
                    Go to Driver Management
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                placeholder="Enter license number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_type">License Type *</Label>
              <Select value={formData.license_type} onValueChange={(value: DriverLicense['license_type']) => setFormData(prev => ({ ...prev, license_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select license type" />
                </SelectTrigger>
                <SelectContent>
                  {LICENSE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuing_authority">Issuing Authority *</Label>
              <Input
                id="issuing_authority"
                value={formData.issuing_authority}
                onChange={(e) => setFormData(prev => ({ ...prev, issuing_authority: e.target.value }))}
                placeholder="e.g., DMV, DVLA"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue_date">Issue Date *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_class">License Class</Label>
              <Input
                id="license_class"
                value={formData.license_class}
                onChange={(e) => setFormData(prev => ({ ...prev, license_class: e.target.value }))}
                placeholder="e.g., Class 1, Class 2"
              />
            </div>
          </div>

          {/* Endorsements */}
          <div className="space-y-3">
            <Label>Endorsements</Label>
            <div className="flex gap-2">
              <Input
                value={newEndorsement}
                onChange={(e) => setNewEndorsement(e.target.value)}
                placeholder="Add endorsement"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEndorsement())}
              />
              <Button type="button" onClick={addEndorsement} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.endorsements.map((endorsement) => (
                <Badge key={endorsement} variant="secondary" className="flex items-center gap-1">
                  {endorsement}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeEndorsement(endorsement)}
                  />
                </Badge>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              Common endorsements: {ENDORSEMENTS.join(', ')}
            </div>
          </div>

          {/* Restrictions */}
          <div className="space-y-3">
            <Label>Restrictions</Label>
            <div className="flex gap-2">
              <Input
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
                placeholder="Add restriction"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRestriction())}
              />
              <Button type="button" onClick={addRestriction} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.restrictions.map((restriction) => (
                <Badge key={restriction} variant="destructive" className="flex items-center gap-1">
                  {restriction}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeRestriction(restriction)}
                  />
                </Badge>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              Common restrictions: {RESTRICTIONS.join(', ')}
            </div>
          </div>

          {/* Additional Expiry Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medical_certificate_expiry">Medical Certificate Expiry</Label>
              <Input
                id="medical_certificate_expiry"
                type="date"
                value={formData.medical_certificate_expiry}
                onChange={(e) => setFormData(prev => ({ ...prev, medical_certificate_expiry: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="background_check_expiry">Background Check Expiry</Label>
              <Input
                id="background_check_expiry"
                type="date"
                value={formData.background_check_expiry}
                onChange={(e) => setFormData(prev => ({ ...prev, background_check_expiry: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="drug_test_expiry">Drug Test Expiry</Label>
              <Input
                id="drug_test_expiry"
                type="date"
                value={formData.drug_test_expiry}
                onChange={(e) => setFormData(prev => ({ ...prev, drug_test_expiry: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training_expiry">Training Expiry</Label>
              <Input
                id="training_expiry"
                type="date"
                value={formData.training_expiry}
                onChange={(e) => setFormData(prev => ({ ...prev, training_expiry: e.target.value }))}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about the license..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLicense.isPending}>
              {createLicense.isPending ? 'Creating...' : 'Create License'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLicenseDialog;
