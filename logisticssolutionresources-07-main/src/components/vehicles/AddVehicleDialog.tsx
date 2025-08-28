import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateVehicle } from '@/hooks/useVehicles';
import { Loader2, Car } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VehicleFormData {
  vehicle_number: string;
  license_plate: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  vehicle_type: 'Bus' | 'Coach' | 'HGV' | 'Minibus' | 'Van';
  fuel_type?: string;
  color?: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'out_of_service';
  purchase_date?: string;
  registration_expiry?: string;
  insurance_expiry?: string;
  service_interval_months?: number;
  notes?: string;
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
      vehicle_type: 'Bus',
      fuel_type: 'Diesel',
      color: '',
      capacity: 1,
      status: 'active',
      purchase_date: '',
      registration_expiry: '',
      insurance_expiry: '',
      service_interval_months: 6,
      notes: '',
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
        vin: data.vin || null,
        type: data.vehicle_type,
        fuel_type: data.fuel_type || null,
        color: data.color || null,
        capacity: data.capacity,
        status: data.status,
        purchase_date: data.purchase_date || null,
        registration_expiry: data.registration_expiry || null,
        insurance_expiry: data.insurance_expiry || null,
        service_interval_months: data.service_interval_months || null,
        notes: data.notes || null,
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