
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { IncidentFormData } from '@/types/incident';
import { useOrganizationContext } from '@/hooks/useOrganizationContext';

export interface Incident {
  id: string;
  incident_type: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  incident_date?: string;
  incident_time?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  people_involved?: string[];
  witnesses?: string[];
  vehicle_id?: string;
  driver_id?: string;
  reported_by: string;
  attachments?: any[];
  additional_data?: any;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  vehicles?: {
    vehicle_number?: string;
    make?: string;
    model?: string;
  };
}

export const useIncidents = () => {
  const { organizationId } = useOrganizationContext();
  
  return useQuery({
    queryKey: ['incidents', organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return [];
      }
      
      console.log('Fetching incidents from database for organization:', organizationId);
      
      // Fetch incidents
      const { data: incidents, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (incidentsError) {
        console.error('Error fetching incidents:', incidentsError);
        throw incidentsError;
      }

      // Get unique user IDs and vehicle IDs for fetching related data
      const userIds = [...new Set(incidents?.filter(i => i.reported_by).map(i => i.reported_by) || [])];
      const vehicleIds = [...new Set(incidents?.filter(i => i.vehicle_id).map(i => i.vehicle_id) || [])];

      let profiles: any[] = [];
      let vehicles: any[] = [];

      // Fetch profiles (users who reported incidents)
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
        profiles = profilesData || [];
      }

      // Fetch vehicles
      if (vehicleIds.length > 0) {
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('id, vehicle_number, make, model')
          .in('id', vehicleIds);
        vehicles = vehiclesData || [];
      }

      // Create lookup maps
      const profileMap = new Map(profiles.map(p => [p.id, p]));
      const vehicleMap = new Map(vehicles.map(v => [v.id, v]));

      // Transform incidents to include joined data
      return incidents?.map(incident => ({
        ...incident,
        profiles: incident.reported_by && profileMap.has(incident.reported_by) ? 
          profileMap.get(incident.reported_by) : null,
        vehicles: incident.vehicle_id && vehicleMap.has(incident.vehicle_id) ? 
          vehicleMap.get(incident.vehicle_id) : null
      })) as Incident[];
    },
    enabled: !!organizationId
  });
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { getOrganizationId } = useOrganizationContext();

  return useMutation({
    mutationFn: async (incidentData: IncidentFormData & { incident_type: string; reported_by: string }) => {
      const incident = {
        incident_type: incidentData.incident_type,
        title: incidentData.title,
        description: incidentData.description,
        severity: incidentData.severity,
        status: incidentData.status || 'open',
        organization_id: getOrganizationId(),
        incident_date: incidentData.date ? incidentData.date.toISOString().split('T')[0] : null,
        incident_time: incidentData.time || null,
        location_lat: incidentData.location?.lat || null,
        location_lng: incidentData.location?.lng || null,
        location_address: incidentData.location?.address || null,
        people_involved: incidentData.peopleInvolved || [],
        witnesses: incidentData.witnesses || [],
        vehicle_id: incidentData.vehicleId || null,
        driver_id: incidentData.driverId || null,
        reported_by: incidentData.reported_by,
        attachments: incidentData.attachments?.map(file => ({ name: file.name, size: file.size })) || [],
        additional_data: incidentData
      };

      const { data, error } = await supabase
        .from('incidents')
        .insert(incident)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast({
        title: 'Success',
        description: 'Incident reported successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to report incident',
        variant: 'destructive',
      });
    }
  });
};

export const useUpdateIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Incident> & { id: string }) => {
      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast({
        title: 'Success',
        description: 'Incident updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update incident',
        variant: 'destructive',
      });
    }
  });
};
