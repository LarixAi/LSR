import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Document = Tables<'documents'>;

export const useDocuments = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['documents', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching documents from database...');
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      console.log('Fetched documents:', data);
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateDocument = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentData: Partial<Document>) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('Organization and user information required');
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...documentData,
          organization_id: profile.organization_id,
          uploaded_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating document:', error);
      toast.error('Failed to create document: ' + error.message);
    }
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Document> }) => {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating document:', error);
      toast.error('Failed to update document: ' + error.message);
    }
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document: ' + error.message);
    }
  });
};

export const useDocumentStats = () => {
  const { data: documents = [] } = useDocuments();

  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: documents.length,
    active: documents.filter(doc => doc.status === 'active').length,
    expired: documents.filter(doc => 
      doc.expiry_date && 
      new Date(doc.expiry_date) < today
    ).length,
    expiring_soon: documents.filter(doc => 
      doc.expiry_date && 
      new Date(doc.expiry_date) <= thirtyDaysFromNow &&
      new Date(doc.expiry_date) >= today
    ).length,
    by_category: documents.reduce((acc, doc) => {
      const category = doc.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    by_type: documents.reduce((acc, doc) => {
      const type = doc.document_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return stats;
};
