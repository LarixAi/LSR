import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useCreateVehicle } from '@/hooks/useVehicles';
import { Loader2, Car, Shield, Scale, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VehicleFormData {
  vehicle_number: string;
  license_plate: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  vehicle_type: 'bus' | 'coach' | 'hgv' | 'minibus' | 'double_decker_bus';
  fuel_type?: string;
  color?: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'out_of_service';
  purchase_date?: string;
  registration_expiry?: string;
  insurance_expiry?: string;
  service_interval_months?: number;
  notes?: string;
  
  // ORV (Off-Road Vehicle) Fields
  orv_off_road_reason?: string;
  orv_expected_return_date?: string;
  orv_location?: string;
  orv_responsible_person?: string;
  orv_insurance_status?: 'covered' | 'suspended' | 'expired';
  orv_maintenance_type?: 'planned' | 'unplanned' | 'operational' | 'regulatory';
  
  // BOR (Back On Road) Fields
  bor_return_ready?: boolean;
  bor_safety_inspection_complete?: boolean;
  bor_documentation_verified?: boolean;
  bor_driver_assigned?: boolean;
  bor_quality_assurance_complete?: boolean;
  bor_return_authorization?: 'pending' | 'approved' | 'rejected';
}

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddVehicleDialog = ({ open, onOpenChange, onSuccess }: AddVehicleDialogProps) => {
  const createVehicle = useCreateVehicle();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<VehicleFormData>({
    defaultValues: {
      vehicle_number: '',
      license_plate: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      vehicle_type: 'bus',
      fuel_type: 'Diesel',
      color: '',
      capacity: 1,
      status: 'active',
      purchase_date: '',
      registration_expiry: '',
      insurance_expiry: '',
      service_interval_months: 6,
      notes: '',
      
      // ORV (Off-Road Vehicle) Fields
      orv_off_road_reason: '',
      orv_expected_return_date: '',
      orv_location: '',
      orv_responsible_person: '',
      orv_insurance_status: 'covered',
      orv_maintenance_type: 'planned',
      
      // BOR (Back On Road) Fields
      bor_return_ready: false,
      bor_safety_inspection_complete: false,
      bor_documentation_verified: false,
      bor_driver_assigned: false,
      bor_quality_assurance_complete: false,
      bor_return_authorization: 'pending',
    },
  });

  const onSubmit = async (data: VehicleFormData) => {
    // Basic validation
    if (!data.vehicle_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Vehicle number is required",
        variant: "destructive",
      });
      return;
    }

    if (!data.license_plate.trim()) {
      toast({
        title: "Validation Error",
        description: "License plate is required",
        variant: "destructive",
      });
      return;
    }

    if (data.capacity < 1) {
      toast({
        title: "Validation Error",
        description: "Capacity must be at least 1",
        variant: "destructive",
      });
      return;
    }

    try {
      await createVehicle.mutateAsync({
        vehicle_number: data.vehicle_number,
        license_plate: data.license_plate,
        make: data.make || null,
        model: data.model || null,
        year: data.year || null,
        // vin: data.vin || null, // VIN field not supported in current Vehicle type
        type: data.vehicle_type,
        fuel_type: data.fuel_type || null,
        // color: data.color || null, // Color field not supported in current Vehicle type
        capacity: data.capacity,
        status: data.status,
        // purchase_date: data.purchase_date || null, // Purchase date field not supported in current Vehicle type
        // registration_expiry: data.registration_expiry || null, // Registration expiry field not supported in current Vehicle type
        // insurance_expiry: data.insurance_expiry || null, // Insurance expiry field not supported in current Vehicle type
        // service_interval_months: data.service_interval_months || null, // Service interval field not supported in current Vehicle type
        // notes: data.notes || null, // Notes field not supported in current Vehicle type
        
        // ORV (Off-Road Vehicle) Fields - Not supported in current Vehicle type
        // orv_off_road_reason: data.orv_off_road_reason || null,
        // orv_expected_return_date: data.orv_expected_return_date || null,
        // orv_location: data.orv_location || null,
        // orv_responsible_person: data.orv_responsible_person || null,
        // orv_insurance_status: data.orv_insurance_status || null,
        // orv_maintenance_type: data.orv_maintenance_type || null,
        
        // BOR (Back On Road) Fields - Not supported in current Vehicle type
        // bor_return_ready: data.bor_return_ready || null,
        // bor_safety_inspection_complete: data.bor_safety_inspection_complete || null,
        // bor_documentation_verified: data.bor_documentation_verified || null,
        // bor_driver_assigned: data.bor_driver_assigned || null,
        // bor_quality_assurance_complete: data.bor_quality_assurance_complete || null,
        // bor_return_authorization: data.bor_return_authorization || null,
      });

      toast({
        title: "Success",
        description: "Vehicle added successfully!",
      });

      onOpenChange(false);
      onSuccess?.();
      reset();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Add New Vehicle
          </DialogTitle>
          <DialogDescription>
            Register a new vehicle in your fleet management system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicle_number">Vehicle Number *</Label>
                <Input 
                  id="vehicle_number"
                  placeholder="e.g., BUS001" 
                  {...register('vehicle_number', { required: true })}
                />
                {errors.vehicle_number && (
                  <p className="text-sm text-destructive mt-1">Vehicle number is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="license_plate">License Plate *</Label>
                <Input 
                  id="license_plate"
                  placeholder="e.g., LDN 001A" 
                  {...register('license_plate', { required: true })}
                />
                {errors.license_plate && (
                  <p className="text-sm text-destructive mt-1">License plate is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="capacity">Passenger Capacity *</Label>
                <Input 
                  id="capacity"
                  type="number" 
                  placeholder="Number of seats"
                  {...register('capacity', { 
                    required: true,
                    valueAsNumber: true,
                    min: 1
                  })}
                />
                {errors.capacity && (
                  <p className="text-sm text-destructive mt-1">Valid capacity is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="vehicle_type">Vehicle Type *</Label>
                <Select 
                  onValueChange={(value) => setValue('vehicle_type', value as any)}
                  defaultValue={watch('vehicle_type')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bus">Bus</SelectItem>
                    <SelectItem value="Coach">Coach</SelectItem>
                    <SelectItem value="HGV">HGV</SelectItem>
                    <SelectItem value="Minibus">Minibus</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Vehicle Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vehicle Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make</Label>
                <Input 
                  id="make"
                  placeholder="e.g., Mercedes" 
                  {...register('make')}
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input 
                  id="model"
                  placeholder="e.g., Citaro" 
                  {...register('model')}
                />
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Input 
                  id="year"
                  type="number" 
                  placeholder="e.g., 2023"
                  {...register('year', { 
                    valueAsNumber: true,
                    min: 1900,
                    max: new Date().getFullYear() + 1
                  })}
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input 
                  id="color"
                  placeholder="e.g., White" 
                  {...register('color')}
                />
              </div>

              <div>
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select 
                  onValueChange={(value) => setValue('fuel_type', value)}
                  defaultValue={watch('fuel_type')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="CNG">CNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                <Input 
                  id="vin"
                  placeholder="17-character VIN" 
                  {...register('vin')}
                />
              </div>
            </div>
          </div>

          {/* Compliance & Registration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Compliance & Registration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input 
                  id="purchase_date"
                  type="date" 
                  {...register('purchase_date')}
                />
              </div>

              <div>
                <Label htmlFor="registration_expiry">Registration Expiry</Label>
                <Input 
                  id="registration_expiry"
                  type="date" 
                  {...register('registration_expiry')}
                />
              </div>

              <div>
                <Label htmlFor="insurance_expiry">Insurance Expiry</Label>
                <Input 
                  id="insurance_expiry"
                  type="date" 
                  {...register('insurance_expiry')}
                />
              </div>

              <div>
                <Label htmlFor="service_interval_months">Service Interval (Months)</Label>
                <Input 
                  id="service_interval_months"
                  type="number" 
                  placeholder="e.g., 6"
                  {...register('service_interval_months', { 
                    valueAsNumber: true,
                    min: 1
                  })}
                />
              </div>

              <div>
                <Label htmlFor="status">Initial Status</Label>
                <Select 
                  onValueChange={(value) => setValue('status', value as any)}
                  defaultValue={watch('status')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out_of_service">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ORV (Off-Road Vehicle) Compliance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Off-Road Vehicle Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orv_off_road_reason">Reason for Off-Road Usage</Label>
                <Textarea 
                  id="orv_off_road_reason"
                  placeholder="e.g., Construction site access, Emergency response, Site survey" 
                  {...register('orv_off_road_reason')}
                />
              </div>

              <div>
                <Label htmlFor="orv_expected_return_date">Expected Return Date</Label>
                <Input 
                  id="orv_expected_return_date"
                  type="date" 
                  {...register('orv_expected_return_date')}
                />
              </div>

              <div>
                <Label htmlFor="orv_location">Location of Off-Road Usage</Label>
                <Input 
                  id="orv_location"
                  placeholder="e.g., 123 Main St, City, Country" 
                  {...register('orv_location')}
                />
              </div>

              <div>
                <Label htmlFor="orv_responsible_person">Responsible Person</Label>
                <Input 
                  id="orv_responsible_person"
                  placeholder="e.g., John Doe, Manager" 
                  {...register('orv_responsible_person')}
                />
              </div>

              <div>
                <Label htmlFor="orv_insurance_status">Insurance Status</Label>
                <Select 
                  onValueChange={(value) => setValue('orv_insurance_status', value as any)}
                  defaultValue={watch('orv_insurance_status')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="covered">Covered</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="orv_maintenance_type">Maintenance Type</Label>
                <Select 
                  onValueChange={(value) => setValue('orv_maintenance_type', value as any)}
                  defaultValue={watch('orv_maintenance_type')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maintenance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="unplanned">Unplanned</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* BOR (Back On Road) Compliance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Back On Road Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bor_return_ready">Return Ready</Label>
                                 <div className="flex items-center space-x-2">
                   <Checkbox 
                     id="bor_return_ready"
                     checked={watch('bor_return_ready')}
                     onCheckedChange={(checked) => setValue('bor_return_ready', checked as boolean)}
                   />
                   <Label htmlFor="bor_return_ready">Return Ready</Label>
                 </div>
              </div>

                             <div>
                 <div className="flex items-center space-x-2">
                   <Checkbox 
                     id="bor_safety_inspection_complete"
                     checked={watch('bor_safety_inspection_complete')}
                     onCheckedChange={(checked) => setValue('bor_safety_inspection_complete', checked as boolean)}
                   />
                   <Label htmlFor="bor_safety_inspection_complete">Safety Inspection Complete</Label>
                 </div>
               </div>

               <div>
                 <div className="flex items-center space-x-2">
                   <Checkbox 
                     id="bor_documentation_verified"
                     checked={watch('bor_documentation_verified')}
                     onCheckedChange={(checked) => setValue('bor_documentation_verified', checked as boolean)}
                   />
                   <Label htmlFor="bor_documentation_verified">Documentation Verified</Label>
                 </div>
               </div>

               <div>
                 <div className="flex items-center space-x-2">
                   <Checkbox 
                     id="bor_driver_assigned"
                     checked={watch('bor_driver_assigned')}
                     onCheckedChange={(checked) => setValue('bor_driver_assigned', checked as boolean)}
                   />
                   <Label htmlFor="bor_driver_assigned">Driver Assigned</Label>
                 </div>
               </div>

               <div>
                 <div className="flex items-center space-x-2">
                   <Checkbox 
                     id="bor_quality_assurance_complete"
                     checked={watch('bor_quality_assurance_complete')}
                     onCheckedChange={(checked) => setValue('bor_quality_assurance_complete', checked as boolean)}
                   />
                   <Label htmlFor="bor_quality_assurance_complete">Quality Assurance Complete</Label>
                 </div>
               </div>

              <div>
                <Label htmlFor="bor_return_authorization">Return Authorization</Label>
                <Select 
                  onValueChange={(value) => setValue('bor_return_authorization', value as any)}
                  defaultValue={watch('bor_return_authorization')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select return authorization status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes"
              placeholder="Any additional information about the vehicle..." 
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Vehicle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog;