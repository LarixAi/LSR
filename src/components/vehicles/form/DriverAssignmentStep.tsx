// @ts-nocheck
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDrivers } from '@/hooks/useDrivers';
import { VehicleFormData } from './types';

interface DriverAssignmentStepProps {
  form: UseFormReturn<VehicleFormData>;
}

const DriverAssignmentStep = ({ form }: DriverAssignmentStepProps) => {
  const { data: drivers = [], isLoading } = useDrivers();

  // Filter to get only active drivers who are signed up users (have email and are active employees)
  const activeDrivers = drivers.filter(driver => 
    driver.employment_status === 'active' &&
    driver.email && // Must have email (signed up user)
    driver.role === 'driver' // Must have driver role
  );

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="assigned_driver_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned Driver (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "unassigned"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver to assign to this vehicle" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="unassigned">No driver assigned</SelectItem>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading drivers...</SelectItem>
                ) : (
                  activeDrivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.first_name} {driver.last_name} - {driver.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="text-sm text-gray-600">
        <p>You can assign a driver to this vehicle now or leave it unassigned and assign later.</p>
        <p>Only active drivers with employment status "active" who have signed up to the app are shown.</p>
        <p>Showing {activeDrivers.length} available drivers.</p>
      </div>
    </div>
  );
};

export default DriverAssignmentStep;
