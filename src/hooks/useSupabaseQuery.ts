
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useApiErrorHandler } from './useApiErrorHandler';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

interface QueryOptions {
  queryKey: string[];
  table: TableName;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  enabled?: boolean;
}

interface MutationOptions {
  table: TableName;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  invalidateQueries?: string[][];
}

export const useSupabaseQuery = (options: QueryOptions) => {
  const { handleError } = useApiErrorHandler();

  return useQuery({
    queryKey: options.queryKey,
    queryFn: async () => {
      let query = supabase.from(options.table as any).select(options.select || '*');

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }

      const { data, error } = await query;

      if (error) {
        handleError(error, `fetching ${options.table}`);
        throw error;
      }

      return data;
    },
    enabled: options.enabled,
  });
};

export const useSupabaseInsert = (options: MutationOptions) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useApiErrorHandler();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from(options.table as any)
        .insert(data)
        .select()
        .single();

      if (error) {
        handleError(error, `inserting into ${options.table}`);
        throw error;
      }

      return result;
    },
    onSuccess: (data) => {
      handleSuccess('Success', 'Record created successfully');
      
      // Invalidate related queries
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};

export const useSupabaseUpdate = (options: MutationOptions) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useApiErrorHandler();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await supabase
        .from(options.table as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleError(error, `updating ${options.table}`);
        throw error;
      }

      return result;
    },
    onSuccess: (data) => {
      handleSuccess('Success', 'Record updated successfully');
      
      // Invalidate related queries
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};

export const useSupabaseDelete = (options: MutationOptions) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useApiErrorHandler();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(options.table as any)
        .delete()
        .eq('id', id);

      if (error) {
        handleError(error, `deleting from ${options.table}`);
        throw error;
      }

      return { id };
    },
    onSuccess: (data) => {
      handleSuccess('Success', 'Record deleted successfully');
      
      // Invalidate related queries
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};
