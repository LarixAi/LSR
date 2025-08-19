import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LicenseFolder {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export const useLicenseFolders = (organizationId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const foldersQuery = useQuery({
    queryKey: ['license-folders', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('license_folders')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId,
  });

  const createFolder = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data, error } = await supabase
        .from('license_folders')
        .insert({
          name,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-folders', organizationId] });
      toast({
        title: 'Success',
        description: 'Folder created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from('license_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-folders', organizationId] });
      toast({
        title: 'Success',
        description: 'Folder deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    folders: foldersQuery.data || [],
    isLoading: foldersQuery.isLoading,
    error: foldersQuery.error,
    createFolder: createFolder.mutateAsync,
    deleteFolder: deleteFolder.mutateAsync,
    isCreating: createFolder.isPending,
    isDeleting: deleteFolder.isPending,
  };
};

export const useCreateDriverFolder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverName, organizationId }: { driverName: string; organizationId: string }) => {
      const { data, error } = await supabase
        .from('license_folders')
        .insert({
          name: driverName,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-folders'] });
      toast({
        title: 'Success',
        description: 'Driver folder created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};