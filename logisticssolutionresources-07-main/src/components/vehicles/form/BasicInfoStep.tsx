
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { VehicleFormData } from './types';

interface BasicInfoStepProps {
  form: UseFormReturn<VehicleFormData>;
}

const BasicInfoStep = ({ form }: BasicInfoStepProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="vehicle_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vehicle Number *</FormLabel>
            <FormControl>
              <Input placeholder="e.g., BUS001" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="license_plate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>License Plate *</FormLabel>
            <FormControl>
              <Input placeholder="e.g., ABC 123D" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="capacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Passenger Capacity *</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Number of seats"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoStep;
