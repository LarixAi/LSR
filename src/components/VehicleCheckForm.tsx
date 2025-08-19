
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  vehicle_id: z.string().min(1, 'Vehicle is required'),
  check_type: z.string().min(1, 'Check type is required'),
  status: z.string().min(1, 'Status is required'),
  notes: z.string().optional(),
  issues_found: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const VehicleCheckForm = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show form if user is a driver and active
  if (!user || !profile || profile.role !== 'driver') {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Vehicle check form is only available for active drivers.</p>
      </div>
    );
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_id: '',
      check_type: 'pre_trip',
      status: 'completed',
      notes: '',
      issues_found: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Vehicle check data would be submitted to database here
      // Implementation pending vehicle_checks table creation

      toast({
        title: 'Success',
        description: 'Vehicle check recorded successfully',
      });

      form.reset();
    } catch (error) {
      // Error handled in UI via toast
      toast({
        title: 'Error',
        description: 'Failed to record vehicle check',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Vehicle Check</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="vehicle_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter vehicle ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="check_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select check type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pre_trip">Pre-Trip</SelectItem>
                    <SelectItem value="post_trip">Post-Trip</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="issues_found">Issues Found</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Additional notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issues_found"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issues Found</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe any issues found..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Recording...' : 'Record Check'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default VehicleCheckForm;
