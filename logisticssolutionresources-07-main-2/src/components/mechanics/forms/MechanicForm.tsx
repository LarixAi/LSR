
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MechanicFormData } from './mechanicFormSchema';

interface MechanicFormProps {
  form: UseFormReturn<MechanicFormData>;
  onSubmit: (data: MechanicFormData) => void;
  children: React.ReactNode;
}

const MechanicForm = ({ form, onSubmit, children }: MechanicFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="profile_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter profile ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mechanic_license_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter license number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="certification_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certification Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select certification level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="apprentice">Apprentice</SelectItem>
                  <SelectItem value="journeyman">Journeyman</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="certified_technician">Certified Technician</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hourly_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Rate ($)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min="0" 
                  step="0.01"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  placeholder="Enter hourly rate" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specializations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specializations</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter specializations (comma-separated)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Available for Work</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {children}
      </form>
    </Form>
  );
};

export default MechanicForm;
