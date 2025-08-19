import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface InfringementType {
  id: string;
  name: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  penalty_points: number;
  fine_amount: number;
  organization_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Infringement {
  id: string;
  infringement_number?: string;
  driver_id: string;
  vehicle_id?: string;
  infringement_type_id?: string;
  infringement_type?: string;
  organization_id: string;
  incident_date?: string;
  infringement_date?: string;
  location?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'under_review' | 'confirmed' | 'dismissed' | 'appealed' | 'resolved' | 'active';
  penalty_points?: number;
  points_deducted?: number;
  fine_amount?: number;
  due_date?: string;
  paid_date?: string;
  payment_date?: string;
  appeal_notes?: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolved_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  driver?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
  };
  vehicle?: {
    id: string;
    vehicle_number: string;
    make?: string;
    model?: string;
  };
  infringement_type_rel?: InfringementType;
}

export interface DriverPointsHistory {
  id: string;
  driver_id: string;
  organization_id: string;
  points_change: number;
  points_before: number;
  points_after: number;
  reason: string;
  reference_type?: 'infringement' | 'compliance_violation' | 'training' | 'manual_adjustment';
  reference_id?: string;
  recorded_by: string;
  recorded_date: string;
  notes?: string;
  created_at: string;
}

export const useInfringements = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['infringements', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching infringements from database...');
      
      try {
        const { data, error } = await supabase
          .from('infringements')
          .select(`
            *,
            driver:profiles!infringements_driver_id_fkey(id, first_name, last_name, email),
            vehicle:vehicles(id, vehicle_number, make, model),
            infringement_type_rel:infringement_types(*)
          `)
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching infringements:', error);
          // If table doesn't exist yet or column is missing, return empty array
          if (error.code === '42P01' || error.code === '42703') {
            console.warn('Infringements table or column not found, returning empty data');
            return [];
          }
          throw error;
        }

        console.log('Fetched infringements:', data);
        return data as Infringement[] || [];
      } catch (error) {
        console.error('Error in useInfringements:', error);
        // Return empty array for now if there are issues
        return [];
      }
    },
    enabled: !!profile?.organization_id,
  });
};

export const useInfringementTypes = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['infringement_types', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching infringement types from database...');
      
      try {
        const { data, error } = await supabase
          .from('infringement_types')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching infringement types:', error);
          // If table doesn't exist yet or column is missing, return empty array
          if (error.code === '42P01' || error.code === '42703') {
            console.warn('Infringement types table or column not found, returning empty data');
            return [];
          }
          throw error;
        }

        console.log('Fetched infringement types:', data);
        return data as InfringementType[] || [];
      } catch (error) {
        console.error('Error in useInfringementTypes:', error);
        // Return empty array for now if there are issues
        return [];
      }
    },
    enabled: !!profile?.organization_id,
  });
};

export const useDriverPointsHistory = (driverId?: string) => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['driver_points_history', profile?.organization_id, driverId],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching driver points history from database...');
      
      try {
        let query = supabase
          .from('driver_points_history')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('recorded_date', { ascending: false });

        if (driverId) {
          query = query.eq('driver_id', driverId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching driver points history:', error);
          // If table doesn't exist yet or column is missing, return empty array
          if (error.code === '42P01' || error.code === '42703') {
            console.warn('Driver points history table or column not found, returning empty data');
            return [];
          }
          throw error;
        }

        console.log('Fetched driver points history:', data);
        return data as DriverPointsHistory[] || [];
      } catch (error) {
        console.error('Error in useDriverPointsHistory:', error);
        // Return empty array for now if there are issues
        return [];
      }
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateInfringement = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (infringementData: Partial<Infringement>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('infringements')
        .insert({
          ...infringementData,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infringements'] });
      toast.success('Infringement created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating infringement:', error);
      toast.error('Failed to create infringement: ' + error.message);
    }
  });
};

export const useUpdateInfringement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Infringement> }) => {
      const { data, error } = await supabase
        .from('infringements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infringements'] });
      toast.success('Infringement updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating infringement:', error);
      toast.error('Failed to update infringement: ' + error.message);
    }
  });
};

export const useCreateInfringementType = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (typeData: Partial<InfringementType>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('infringement_types')
        .insert({
          ...typeData,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infringement_types'] });
      toast.success('Infringement type created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating infringement type:', error);
      toast.error('Failed to create infringement type: ' + error.message);
    }
  });
};

export const useInfringementStats = () => {
  const { data: infringements = [] } = useInfringements();
  const { data: pointsHistory = [] } = useDriverPointsHistory();

  const stats = {
    total_infringements: infringements.length,
    pending_infringements: infringements.filter(i => i.status === 'pending').length,
    confirmed_infringements: infringements.filter(i => i.status === 'confirmed').length,
    resolved_infringements: infringements.filter(i => i.status === 'resolved').length,
    total_fines: infringements.reduce((sum, inf) => sum + (inf.fine_amount || 0), 0),
    total_points: infringements.reduce((sum, inf) => sum + ((inf.penalty_points || inf.points_deducted) || 0), 0),
    by_severity: infringements.reduce((acc, inf) => {
      acc[inf.severity] = (acc[inf.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    by_status: infringements.reduce((acc, inf) => {
      acc[inf.status] = (acc[inf.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    monthly_trend: infringements.reduce((acc, inf) => {
      const month = new Date(inf.created_at).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return stats;
};
