import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Invoice = Tables<'invoices'>;

export interface InvoiceWithRelations extends Invoice {
  customer?: Tables<'customer_profiles'>;
  job?: Tables<'jobs'>;
}

export const useInvoices = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['invoices', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching invoices from database...');
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customer_profiles(*),
          job:jobs(*)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }

      console.log('Fetched invoices:', data);
      return data as InvoiceWithRelations[] || [];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateInvoice = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceData: Partial<Invoice>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization information required');
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice: ' + error.message);
    }
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice: ' + error.message);
    }
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice: ' + error.message);
    }
  });
};

export const useInvoiceStats = () => {
  const { data: invoices = [] } = useInvoices();

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: invoices.length,
    draft: invoices.filter(inv => inv.status === 'draft').length,
    sent: invoices.filter(inv => inv.status === 'sent').length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => 
      inv.status === 'sent' && 
      inv.due_date && 
      new Date(inv.due_date) < today
    ).length,
    total_amount: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    paid_amount: invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    outstanding_amount: invoices
      .filter(inv => inv.status === 'sent')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    recent_count: invoices.filter(inv => 
      new Date(inv.created_at) >= thirtyDaysAgo
    ).length,
  };

  return stats;
};
