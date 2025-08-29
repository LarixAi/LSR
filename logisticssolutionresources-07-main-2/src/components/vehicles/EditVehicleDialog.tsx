import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateVehicle, type Vehicle } from '@/hooks/useVehicles';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EditVehicleFormData {
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vehicle_number: string;
  vehicle_type: 'Bus' | 'Coach' | 'HGV' | 'Minibus' | 'Van';
  status: 'active' | 'maintenance' | 'out_of_service';
  vin?: string;
}

interface EditVehicleDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EditVehicleDialog = ({ vehicle, open, onOpenChange, onSuccess }: EditVehicleDialogProps) => {
  const updateVehicle = useUpdateVehicle();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<EditVehicleFormData>({
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      license_plate: '',
      vehicle_number: '',
      vehicle_type: 'Bus',
      status: 'active',
      vin: '',
    },
  });

  // Reset form when vehicle changes
  React.useEffect(() => {
    if (vehicle) {
      reset({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        license_plate: vehicle.license_plate || '',
        vehicle_number: vehicle.vehicle_number || '',
        vehicle_type: (vehicle.type as 'Bus' | 'Coach' | 'HGV' | 'Minibus' | 'Van') || 'Bus',
        status: (vehicle.status as 'active' | 'maintenance' | 'out_of_service') || 'active',
        vin: vehicle.vin || '',
      });
    }
  }, [vehicle, reset]);

  const onSubmit = async (data: EditVehicleFormData) => {
    if (!vehicle) return;

    // Basic validation
    if (!data.make.trim()) {
      toast({
        title: "Validation Error",
        description: "Make is required",
        variant: "destructive",
      });
      return;
    }

    if (!data.model.trim()) {
      toast({
        title: "Validation Error", 
        description: "Model is required",
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

    if (!data.vehicle_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Vehicle number is required",
        variant: "destructive", 
      });
      return;
    }

    try {
      await updateVehicle.mutateAsync({
        id: vehicle.id,
        updates: {
          make: data.make,
          model: data.model,
          year: data.year,
          license_plate: data.license_plate,
          vehicle_number: data.vehicle_number,
          vehicle_type: data.vehicle_type,
          status: data.status,
          vin: data.vin || null,
        },
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogDescription>
            Update vehicle details and settings for {vehicle.vehicle_number}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle_number">Vehicle Number</Label>
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
              <Label htmlFor="license_plate">License Plate</Label>
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
              <Label htmlFor="make">Make</Label>
              <Input 
                id="make"
                placeholder="e.g., Mercedes" 
                {...register('make', { required: true })}
              />
              {errors.make && (
                <p className="text-sm text-destructive mt-1">Make is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="model">Model</Label>
              <Input 
                id="model"
                placeholder="e.g., Citaro" 
                {...register('model', { required: true })}
              />
              {errors.model && (
                <p className="text-sm text-destructive mt-1">Model is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="year">Year</Label>
              <Input 
                id="year"
                type="number" 
                placeholder="e.g., 2023"
                {...register('year', { 
                  required: true,
                  valueAsNumber: true,
                  min: 1900,
                  max: new Date().getFullYear() + 1
                })}
              />
              {errors.year && (
                <p className="text-sm text-destructive mt-1">Valid year is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
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

            <div>
              <Label htmlFor="status">Status</Label>
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

            <div className="md:col-span-2">
              <Label htmlFor="vin">VIN (Optional)</Label>
              <Input 
                id="vin"
                placeholder="Vehicle Identification Number" 
                {...register('vin')}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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
              Update Vehicle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVehicleDialog;