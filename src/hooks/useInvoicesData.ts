import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useInvoicesData = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch invoices from database
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices-data', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Clear all invoices mutation
  const clearAllInvoices = useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) return;
      
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('organization_id', profile.organization_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices-data'] });
    }
  });

  // Calculate statistics from real data
  const calculateStats = () => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
    const overdueInvoices = invoices.filter(inv => {
      if (inv.due_date && inv.status !== 'paid') {
        return new Date(inv.due_date) < new Date();
      }
      return false;
    }).length;
    const draftInvoices = invoices.filter(inv => inv.status === 'draft').length;
    const cancelledInvoices = invoices.filter(inv => inv.status === 'cancelled').length;
    const averageValue = totalInvoices > 0 ? totalAmount / totalInvoices : 0;

    return {
      totalInvoices,
      totalAmount,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      draftInvoices,
      cancelledInvoices,
      averageValue,
      paidPercentage: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
      pendingAmount: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
      overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    };
  };

  const stats = calculateStats();

  return {
    invoices,
    isLoading,
    clearAllInvoices,
    stats,
    hasData: invoices.length > 0
  };
};
