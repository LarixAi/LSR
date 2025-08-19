import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Quotation = Tables<'quotations'>;

export interface QuotationWithRelations extends Quotation {
  customer?: Tables<'customer_profiles'>;
}

export const useQuotations = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['quotations', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching quotations from database...');
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customer:customer_profiles(*)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotations:', error);
        throw error;
      }

      console.log('Fetched quotations:', data);
      return data as QuotationWithRelations[] || [];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateQuotation = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationData: Partial<Quotation>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization information required');
      }

      const { data, error } = await supabase
        .from('quotations')
        .insert({
          ...quotationData,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating quotation:', error);
      toast.error('Failed to create quotation: ' + error.message);
    }
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Quotation> }) => {
      const { data, error } = await supabase
        .from('quotations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating quotation:', error);
      toast.error('Failed to update quotation: ' + error.message);
    }
  });
};

export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting quotation:', error);
      toast.error('Failed to delete quotation: ' + error.message);
    }
  });
};

export const useQuotationStats = () => {
  const { data: quotations = [] } = useQuotations();

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
    rejected: quotations.filter(q => q.status === 'rejected').length,
    expired: quotations.filter(q => 
      q.expires_at && 
      new Date(q.expires_at) < today &&
      q.status === 'sent'
    ).length,
    total_value: quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0),
    accepted_value: quotations
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + (q.total_amount || 0), 0),
    pending_value: quotations
      .filter(q => q.status === 'sent')
      .reduce((sum, q) => sum + (q.total_amount || 0), 0),
    conversion_rate: quotations.length > 0 
      ? (quotations.filter(q => q.status === 'accepted').length / quotations.length) * 100 
      : 0,
    recent_count: quotations.filter(q => 
      new Date(q.created_at) >= thirtyDaysAgo
    ).length,
  };

  return stats;
};
