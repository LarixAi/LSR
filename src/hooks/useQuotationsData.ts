import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useQuotationsData = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch quotations from database
  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ['quotations-data', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching quotations:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Clear all quotations mutation
  const clearAllQuotations = useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) return;
      
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('organization_id', profile.organization_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations-data'] });
    }
  });

  // Calculate statistics from real data
  const calculateStats = () => {
    const totalQuotations = quotations.length;
    const totalValue = quotations.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);
    const acceptedQuotes = quotations.filter(q => q.status === 'accepted').length;
    const pendingQuotes = quotations.filter(q => q.status === 'pending').length;
    const rejectedQuotes = quotations.filter(q => q.status === 'rejected').length;
    const draftQuotes = quotations.filter(q => q.status === 'draft').length;
    const expiredQuotes = quotations.filter(q => {
      if (q.valid_until) {
        return new Date(q.valid_until) < new Date();
      }
      return false;
    }).length;
    const averageValue = totalQuotations > 0 ? totalValue / totalQuotations : 0;
    
    // Win rate calculation
    const convertedQuotes = acceptedQuotes;
    const totalNonDraftQuotes = totalQuotations - draftQuotes;
    const winRate = totalNonDraftQuotes > 0 ? (convertedQuotes / totalNonDraftQuotes) * 100 : 0;

    return {
      totalQuotations,
      totalValue,
      acceptedQuotes,
      pendingQuotes,
      rejectedQuotes,
      draftQuotes,
      expiredQuotes,
      averageValue,
      winRate,
      pendingValue: quotations.filter(q => q.status === 'pending').reduce((sum, q) => sum + (q.total_amount || 0), 0),
      acceptedValue: quotations.filter(q => q.status === 'accepted').reduce((sum, q) => sum + (q.total_amount || 0), 0),
    };
  };

  const stats = calculateStats();

  return {
    quotations,
    isLoading,
    clearAllQuotations,
    stats,
    hasData: quotations.length > 0
  };
};
