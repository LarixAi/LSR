import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MechanicStorageFile {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, any>;
  size?: number;
  publicUrl?: string;
  path: string;
}

const getOrgFolder = (organizationId: string) => `mechanics/${organizationId}`;

export const useMechanicDocuments = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['mechanic-documents', profile?.organization_id],
    queryFn: async (): Promise<MechanicStorageFile[]> => {
      if (!profile?.organization_id) return [];
      const folder = getOrgFolder(profile.organization_id);

      const { data, error } = await supabase.storage
        .from('documents')
        .list(folder, { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      const files: MechanicStorageFile[] = (data || []).filter((f) => f.name.toLowerCase().endsWith('.pdf')).map((f) => {
        const path = `${folder}/${f.name}`;
        const { data: url } = supabase.storage.from('documents').getPublicUrl(path);
        return {
          name: f.name,
          id: (f as any).id,
          created_at: (f as any).created_at,
          updated_at: (f as any).updated_at,
          last_accessed_at: (f as any).last_accessed_at,
          metadata: f.metadata,
          size: (f as any).size,
          publicUrl: url.publicUrl,
          path,
        };
      });

      return files;
    },
    enabled: !!profile?.organization_id,
  });
};

export const useUploadMechanicDocument = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!profile?.organization_id) throw new Error('Organization required');
      const folder = getOrgFolder(profile.organization_id);
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const path = `${folder}/${fileName}`;

      const { error } = await supabase.storage.from('documents').upload(path, file, {
        contentType: file.type || 'application/pdf',
        upsert: false,
      });
      if (error) throw error;
      return path;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mechanic-documents'] });
    },
  });
};


