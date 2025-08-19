import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EmergencyContact {
  id: string;
  child_id: number;
  contact_name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  child_profiles?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export const useEmergencyContacts = (childId?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['emergency-contacts', user?.id, childId],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('Fetching emergency contacts for child:', childId);

      try {
        let query = supabase
          .from('emergency_contacts')
          .select(`
            *,
            child_profiles:child_profiles(
              id,
              first_name,
              last_name
            )
          `)
          .eq('is_active', true)
          .order('is_primary', { ascending: false })
          .order('contact_name');

        if (childId) {
          query = query.eq('child_id', childId);
        } else {
          // Get all emergency contacts for parent's children
          query = query.in('child_id', 
            supabase
              .from('child_profiles')
              .select('id')
              .eq('parent_id', user.id)
              .eq('is_active', true)
          );
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching emergency contacts:', error);
          throw error;
        }

        console.log('Fetched emergency contacts:', data);
        return data as EmergencyContact[] || [];
      } catch (error) {
        console.error('Error in useEmergencyContacts:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
};

export const useCreateEmergencyContact = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactData: {
      child_id: number;
      contact_name: string;
      relationship: string;
      phone: string;
      email?: string;
      address?: string;
      is_primary?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert(contactData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      toast({
        title: "Emergency Contact Added",
        description: "The emergency contact has been added successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating emergency contact:', error);
      toast({
        title: "Error",
        description: "Failed to add emergency contact. Please try again.",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateEmergencyContact = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updateData 
    }: {
      id: string;
      contact_name?: string;
      relationship?: string;
      phone?: string;
      email?: string;
      address?: string;
      is_primary?: boolean;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      toast({
        title: "Emergency Contact Updated",
        description: "The emergency contact has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating emergency contact:', error);
      toast({
        title: "Error",
        description: "Failed to update emergency contact. Please try again.",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteEmergencyContact = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      toast({
        title: "Emergency Contact Removed",
        description: "The emergency contact has been removed successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting emergency contact:', error);
      toast({
        title: "Error",
        description: "Failed to remove emergency contact. Please try again.",
        variant: "destructive",
      });
    }
  });
};
