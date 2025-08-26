import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface VehicleDocument {
  id: string;
  name: string;
  category: string;
  description?: string;
  file_path?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  status: 'active' | 'expired' | 'pending' | 'archived';
  expiry_date?: string;
  uploaded_at: string;
  uploaded_by: string;
  organization_id: string;
  vehicle_id?: string;
  document_type?: string;
  is_public?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  version?: string;
  department?: string;
  is_favorite?: boolean;
  thumbnail_url?: string;
}

export const useVehicleDocuments = (vehicleId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['vehicle-documents', vehicleId, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id || !vehicleId) {
        return [];
      }

      console.log('Fetching vehicle documents for vehicle:', vehicleId);
      
      // Fetch only documents that are specifically linked to this vehicle
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicle documents:', error);
        return [];
      }

      console.log('Fetched vehicle documents:', data);
      return (data || []) as VehicleDocument[];
    },
    enabled: !!profile?.organization_id && !!vehicleId,
  });
};

export const useCreateVehicleDocument = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentData: Partial<VehicleDocument>) => {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-documents', variables.vehicle_id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Vehicle document uploaded successfully');
    },
    onError: (error: any) => {
      console.error('Error creating vehicle document:', error);
      toast.error('Failed to upload vehicle document: ' + error.message);
    }
  });
};

export const useDeleteVehicleDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, vehicleId }: { id: string; vehicleId: string }) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-documents', vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Vehicle document deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting vehicle document:', error);
      toast.error('Failed to delete vehicle document: ' + error.message);
    }
  });
};
