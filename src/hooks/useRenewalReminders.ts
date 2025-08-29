import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RenewalReminder {
  id: string;
  driver_id: string;
  document_type: string;
  document_name: string;
  expiry_date: string;
  reminder_date: string;
  status: 'pending' | 'sent' | 'acknowledged' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  days_until_expiry: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export const useRenewalReminders = (driverId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['renewal-reminders', driverId, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const targetDriverId = driverId || profile?.id;
      if (!targetDriverId) {
        throw new Error('Driver ID is required');
      }

      // Calculate days until expiry for each reminder
      try {
        const { data, error } = await supabase
          .from('license_renewals')
          .select(`
            *,
            profiles!driver_id (first_name, last_name)
          `)
          .eq('driver_id', targetDriverId)
          .eq('organization_id', profile.organization_id)
          .order('expiry_date', { ascending: true });

        if (error) {
          console.warn('License renewals table may not exist:', error);
          return [];
        }

        // Calculate days until expiry and add to each reminder
        const remindersWithDays = (data || []).map(reminder => {
          const expiryDate = new Date(reminder.expiry_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            ...reminder,
            days_until_expiry: daysUntilExpiry,
            priority: daysUntilExpiry <= 7 ? 'critical' : 
                     daysUntilExpiry <= 30 ? 'high' : 
                     daysUntilExpiry <= 90 ? 'medium' : 'low'
          };
        });

        return remindersWithDays;
      } catch (error) {
        console.warn('Error fetching renewal reminders:', error);
        return [];
      }


    },
    enabled: !!profile?.organization_id && !!(driverId || profile?.id),
  });
};

export const useCreateRenewalReminder = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (reminderData: {
      driver_id: string;
      document_type: string;
      document_name: string;
      expiry_date: string;
      reminder_date: string;
    }) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('license_renewals')
        .insert({
          ...reminderData,
          organization_id: profile.organization_id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renewal-reminders'] });
      toast.success('Renewal reminder created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating renewal reminder:', error);
      toast.error('Failed to create renewal reminder: ' + error.message);
    }
  });
};

export const useUpdateRenewalReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RenewalReminder> & { id: string }) => {
      const { data, error } = await supabase
        .from('license_renewals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renewal-reminders'] });
      toast.success('Renewal reminder updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating renewal reminder:', error);
      toast.error('Failed to update renewal reminder: ' + error.message);
    }
  });
};

export const useRenewalReminderStats = (driverId?: string) => {
  const { data: reminders = [] } = useRenewalReminders(driverId);

  const stats = {
    total: reminders.length,
    critical: reminders.filter(r => r.priority === 'critical').length,
    high: reminders.filter(r => r.priority === 'high').length,
    medium: reminders.filter(r => r.priority === 'medium').length,
    low: reminders.filter(r => r.priority === 'low').length,
    pending: reminders.filter(r => r.status === 'pending').length,
    sent: reminders.filter(r => r.status === 'sent').length,
    acknowledged: reminders.filter(r => r.status === 'acknowledged').length,
    completed: reminders.filter(r => r.status === 'completed').length,
  };

  return stats;
};
