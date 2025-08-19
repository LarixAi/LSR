import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Route = Tables<'routes'>;

export interface RouteWithAssignments extends Route {
  assignments?: Tables<'route_assignments'>[];
}

export const useRoutes = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['routes', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching routes from database...');
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          assignments:route_assignments(*)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching routes:', error);
        throw error;
      }

      console.log('Fetched routes:', data);
      return data as RouteWithAssignments[] || [];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateRoute = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeData: Partial<Route>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization information required');
      }

      const { data, error } = await supabase
        .from('routes')
        .insert({
          ...routeData,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success('Route created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating route:', error);
      toast.error('Failed to create route: ' + error.message);
    }
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Route> }) => {
      const { data, error } = await supabase
        .from('routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success('Route updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating route:', error);
      toast.error('Failed to update route: ' + error.message);
    }
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success('Route deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting route:', error);
      toast.error('Failed to delete route: ' + error.message);
    }
  });
};

export const useRouteStats = () => {
  const { data: routes = [] } = useRoutes();

  const stats = {
    total: routes.length,
    active: routes.filter(route => route.status === 'active').length,
    inactive: routes.filter(route => route.status === 'inactive').length,
    total_distance: routes.reduce((sum, route) => sum + (route.distance || 0), 0),
    average_distance: routes.length > 0 
      ? routes.reduce((sum, route) => sum + (route.distance || 0), 0) / routes.length 
      : 0,
    total_estimated_time: routes.reduce((sum, route) => sum + (route.estimated_time || 0), 0),
    average_estimated_time: routes.length > 0 
      ? routes.reduce((sum, route) => sum + (route.estimated_time || 0), 0) / routes.length 
      : 0,
  };

  return stats;
};
