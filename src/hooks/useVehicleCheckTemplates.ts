import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VehicleCheckTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  version: string;
  is_active: boolean;
  is_default: boolean;
  category: 'pre_trip' | 'post_trip' | 'weekly' | 'monthly' | 'custom';
  vehicle_types: string[];
  required_checks: number;
  optional_checks: number;
  estimated_completion_time_minutes?: number;
  safety_critical: boolean;
  compliance_required: boolean;
  compliance_standards: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  created_by_profile?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  question_count?: number;
}

export interface CreateVehicleCheckTemplateData {
  name: string;
  description?: string;
  version?: string;
  is_active?: boolean;
  is_default?: boolean;
  category: 'pre_trip' | 'post_trip' | 'weekly' | 'monthly' | 'custom';
  vehicle_types: string[];
  required_checks?: number;
  optional_checks?: number;
  estimated_completion_time_minutes?: number;
  safety_critical?: boolean;
  compliance_required?: boolean;
  compliance_standards?: string[];
}

export interface UpdateVehicleCheckTemplateData {
  name?: string;
  description?: string;
  version?: string;
  is_active?: boolean;
  is_default?: boolean;
  category?: 'pre_trip' | 'post_trip' | 'weekly' | 'monthly' | 'custom';
  vehicle_types?: string[];
  required_checks?: number;
  optional_checks?: number;
  estimated_completion_time_minutes?: number;
  safety_critical?: boolean;
  compliance_required?: boolean;
  compliance_standards?: string[];
}

export const useVehicleCheckTemplates = (
  organizationId?: string,
  category?: string,
  isActive?: boolean
) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['vehicle-check-templates', organizationId, category, isActive],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return [];
      }

      try {
        let query = supabase
          .from('vehicle_check_templates')
          .select(`
            *,
            created_by_profile:profiles!vehicle_check_templates_created_by_fkey(
              id,
              first_name,
              last_name
            )
          `)
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (category) {
          query = query.eq('category', category);
        }

        if (isActive !== undefined) {
          query = query.eq('is_active', isActive);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching vehicle check templates:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Error in useVehicleCheckTemplates:', error);
        throw error;
      }
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useVehicleCheckTemplate = (templateId: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['vehicle-check-template', templateId],
    queryFn: async () => {
      if (!templateId || !profile?.organization_id) {
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('vehicle_check_templates')
          .select(`
            *,
            created_by_profile:profiles!vehicle_check_templates_created_by_fkey(
              id,
              first_name,
              last_name
            )
          `)
          .eq('id', templateId)
          .eq('organization_id', profile.organization_id)
          .single();

        if (error) {
          console.error('Error fetching vehicle check template:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in useVehicleCheckTemplate:', error);
        throw error;
      }
    },
    enabled: !!templateId && !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useCreateVehicleCheckTemplate = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateData: CreateVehicleCheckTemplateData) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      try {
        const { data, error } = await supabase
          .from('vehicle_check_templates')
          .insert({
            ...templateData,
            organization_id: profile.organization_id,
            created_by: profile.id,
            version: templateData.version || '1.0',
            is_active: templateData.is_active ?? true,
            is_default: templateData.is_default ?? false,
            required_checks: templateData.required_checks || 0,
            optional_checks: templateData.optional_checks || 0,
            safety_critical: templateData.safety_critical ?? false,
            compliance_required: templateData.compliance_required ?? false,
            compliance_standards: templateData.compliance_standards || []
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating vehicle check template:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in useCreateVehicleCheckTemplate:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-templates'] });
    }
  });
};

export const useUpdateVehicleCheckTemplate = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      templateData 
    }: { 
      templateId: string; 
      templateData: UpdateVehicleCheckTemplateData 
    }) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      try {
        const { data, error } = await supabase
          .from('vehicle_check_templates')
          .update({
            ...templateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId)
          .eq('organization_id', profile.organization_id)
          .select()
          .single();

        if (error) {
          console.error('Error updating vehicle check template:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in useUpdateVehicleCheckTemplate:', error);
        throw error;
      }
    },
    onSuccess: (_, { templateId }) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-templates'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-template', templateId] });
    }
  });
};

export const useDeleteVehicleCheckTemplate = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      try {
        const { error } = await supabase
          .from('vehicle_check_templates')
          .delete()
          .eq('id', templateId)
          .eq('organization_id', profile.organization_id);

        if (error) {
          console.error('Error deleting vehicle check template:', error);
          throw error;
        }

        return { success: true };
      } catch (error) {
        console.error('Error in useDeleteVehicleCheckTemplate:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-templates'] });
    }
  });
};

export const useVehicleCheckTemplateStats = (organizationId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['vehicle-check-template-stats', organizationId],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return {
          total: 0,
          active: 0,
          inactive: 0,
          byCategory: {},
          defaultTemplates: 0
        };
      }

      try {
        const { data, error } = await supabase
          .from('vehicle_check_templates')
          .select('is_active, category, is_default')
          .eq('organization_id', profile.organization_id);

        if (error) {
          console.error('Error fetching vehicle check template stats:', error);
          throw error;
        }

        const templates = data || [];
        const stats = {
          total: templates.length,
          active: templates.filter(t => t.is_active).length,
          inactive: templates.filter(t => !t.is_active).length,
          byCategory: templates.reduce((acc, template) => {
            acc[template.category] = (acc[template.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          defaultTemplates: templates.filter(t => t.is_default).length
        };

        return stats;
      } catch (error) {
        console.error('Error in useVehicleCheckTemplateStats:', error);
        throw error;
      }
    },
    enabled: !!profile?.organization_id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });
};
