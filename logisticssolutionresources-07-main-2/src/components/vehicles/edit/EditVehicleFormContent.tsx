import React, { useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import BasicInfoStep from '../form/BasicInfoStep';
import SpecificationsStep from '../form/SpecificationsStep';
import DriverAssignmentStep from '../form/DriverAssignmentStep';
import { VehicleFormData } from '../form/types';
import { useUpdateVehicle } from '@/hooks/useVehicles';
import { useCreateDriverAssignment, useUpdateDriverAssignment } from '@/hooks/useDriverAssignments';
import type { Tables } from '@/integrations/supabase/types';
import VehicleFormActions from './VehicleFormActions';

const vehicleFormSchema = z.object({
  vehicle_number: z.string().min(1, 'Vehicle number is required'),
  license_plate: z.string().min(1, 'License plate is required'),
  model: z.string().optional(),
  year: z.number().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  type: z.enum(["bus", "coach", "hgv", "minibus", "double_decker_bus"], {
    message: "Vehicle type is required.",
  }),
  assigned_driver_id: z.string().optional(),
});

interface EditVehicleFormContentProps {
  vehicle: Tables<'vehicles'>;
  currentAssignment: any;
  onClose: () => void;
}

const EditVehicleFormContent = ({ vehicle, currentAssignment, onClose }: EditVehicleFormContentProps) => {
  const { toast } = useToast();
  const updateVehicle = useUpdateVehicle();
  const createDriverAssignment = useCreateDriverAssignment();
  const updateDriverAssignment = useUpdateDriverAssignment();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      vehicle_number: '',
      license_plate: '',
      model: '',
      capacity: 1,
      type: 'bus',
      assigned_driver_id: 'unassigned',
    },
  });

  // Reset form with vehicle data when component mounts or vehicle/assignment changes
  useEffect(() => {
    if (vehicle) {
      form.reset({
        vehicle_number: vehicle.vehicle_number || '',
        license_plate: vehicle.license_plate || '',
        model: vehicle.model || '',
        year: vehicle.year || undefined,
        capacity: 50, // Default capacity since it's not in the current vehicles table
        type: 'bus', // Default type since it's not in the current vehicles table
        assigned_driver_id: currentAssignment?.driver_id || 'unassigned',
      });
    }
  }, [vehicle, currentAssignment, form]);

  const onSubmit = async (data: VehicleFormData) => {
    try {
      console.log('Updating vehicle with data:', data);
      
      // Update the vehicle - only include fields that exist in the vehicles table
      await updateVehicle.mutateAsync({
        id: vehicle.id,
        updates: {
          license_plate: data.license_plate,
          model: data.model || '',
          year: data.year || null,
          // Note: capacity and type are in the form but not stored in current vehicles table
          vehicle_number: data.vehicle_number,
        }
      });

      // Handle driver assignment changes
      const newDriverId = data.assigned_driver_id === 'unassigned' ? null : data.assigned_driver_id;
      const currentDriverId = currentAssignment?.driver_id;

      if (newDriverId && newDriverId !== currentDriverId) {
        if (currentAssignment) {
          await updateDriverAssignment.mutateAsync({
            id: currentAssignment.id,
            is_active: false,
          });
        }

        // Create new assignment
        await createDriverAssignment.mutateAsync({
          driverId: newDriverId,
          vehicleId: vehicle.id,
        });
      } else if (!newDriverId && currentAssignment) {
        // Remove current assignment
        await updateDriverAssignment.mutateAsync({
          id: currentAssignment.id,
          is_active: false,
        });
      }

      toast({
        title: 'Success',
        description: 'Vehicle updated successfully!',
      });

      onClose();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vehicle. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = updateVehicle.isPending || createDriverAssignment.isPending || updateDriverAssignment.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <BasicInfoStep form={form} />
          </div>

          <div>
            <h3 className="font-semibold mb-4">Specifications</h3>
            <SpecificationsStep form={form} />
          </div>

          <div>
            <h3 className="font-semibold mb-4">Driver Assignment</h3>
            <DriverAssignmentStep form={form} />
          </div>
        </div>

        <VehicleFormActions
          onCancel={onClose}
          isLoading={isLoading}
        />
      </form>
    </Form>
  );
};

export default EditVehicleFormContent;
