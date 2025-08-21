import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DriverLicense {
  id: string;
  driver_id: string;
  license_number: string;
  license_type: 
    // Commercial Driver Licenses (CDL)
    | 'CDL-A' | 'CDL-B' | 'CDL-C'
    // Regular Driver Licenses
    | 'Regular' | 'Provisional' | 'Learner'
    // International Licenses
    | 'International' | 'International-Permit'
    // Specialized Licenses
    | 'Motorcycle' | 'Motorcycle-A' | 'Motorcycle-A1' | 'Motorcycle-A2'
    // Heavy Vehicle Licenses
    | 'Heavy-Vehicle' | 'Heavy-Vehicle-C1' | 'Heavy-Vehicle-C' | 'Heavy-Vehicle-C+E'
    // Bus and Coach Licenses
    | 'Bus-D1' | 'Bus-D' | 'Bus-D+E' | 'Coach' | 'School-Bus'
    // Specialized Transport
    | 'Hazmat' | 'Tanker' | 'Passenger' | 'Chauffeur' | 'Taxi' | 'Private-Hire'
    // Agricultural and Specialized
    | 'Agricultural' | 'Tractor' | 'Forklift' | 'Crane'
    // Military and Emergency
    | 'Military' | 'Emergency' | 'Police' | 'Fire' | 'Ambulance'
    // Other Specialized
    | 'Disabled' | 'Student' | 'Temporary' | 'Replacement' | 'Duplicate';
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  license_class: string;
  endorsements: string[];
  restrictions: string[];
  points_balance: number;
  medical_certificate_expiry?: string;
  background_check_expiry?: string;
  drug_test_expiry?: string;
  training_expiry?: string;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Driver information (joined)
  driver_name?: string;
  driver_email?: string;
}

export interface CreateLicenseData {
  driver_id: string;
  license_number: string;
  license_type: DriverLicense['license_type'];
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  license_class: string;
  endorsements?: string[];
  restrictions?: string[];
  medical_certificate_expiry?: string;
  background_check_expiry?: string;
  drug_test_expiry?: string;
  training_expiry?: string;
  notes?: string;
}

export interface UpdateLicenseData extends Partial<CreateLicenseData> {
  id: string;
  status?: DriverLicense['status'];
  points_balance?: number;
}

// Hook to fetch all licenses for an organization
export const useLicenses = (organizationId?: string) => {
  return useQuery({
    queryKey: ['licenses', organizationId],
    queryFn: async (): Promise<DriverLicense[]> => {
      if (!organizationId) return [];

      console.log('🔍 Fetching licenses for organization:', organizationId);

      try {
        // Use the database function we created
        const { data, error } = await supabase
          .rpc('get_licenses_with_drivers', { org_id: organizationId });

        if (error) {
          console.error('Error fetching licenses:', error);
          return [];
        }

        console.log('📋 Licenses data from RPC:', data);
        return (data || []).map((license: any) => ({
          ...license,
          driver_name: license.driver_name || 'Unknown Driver',
          driver_email: license.driver_email || ''
        }));
      } catch (error) {
        console.error('Exception in useLicenses:', error);
        return [];
      }
    },
    enabled: !!organizationId,
  });
};

// Hook to fetch a single license
export const useLicense = (licenseId?: string) => {
  return useQuery({
    queryKey: ['license', licenseId],
    queryFn: async (): Promise<DriverLicense | null> => {
      if (!licenseId) return null;

      const { data, error } = await supabase
        .from('driver_licenses')
        .select(`
          *,
          profiles:driver_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', licenseId)
        .single();

      if (error) {
        console.error('Error fetching license:', error);
        return null;
      }

      return data ? {
        ...data,
        driver_name: data.profiles 
          ? `${data.profiles.first_name} ${data.profiles.last_name}`
          : 'Unknown Driver',
        driver_email: data.profiles?.email || ''
      } : null;
    },
    enabled: !!licenseId,
  });
};

// Hook to fetch licenses by driver
export const useDriverLicenses = (driverId?: string) => {
  return useQuery({
    queryKey: ['driver-licenses', driverId],
    queryFn: async (): Promise<DriverLicense[]> => {
      if (!driverId) return [];

      const { data, error } = await supabase
        .from('driver_licenses')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching driver licenses:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!driverId,
  });
};

// Hook to create a new license
export const useCreateLicense = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (licenseData: CreateLicenseData): Promise<DriverLicense> => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('driver_licenses')
        .insert({
          ...licenseData,
          organization_id: profile.organization_id,
          status: 'active',
          points_balance: 0,
          endorsements: licenseData.endorsements || [],
          restrictions: licenseData.restrictions || []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['driver-licenses'] });
      toast.success('License created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating license:', error);
      toast.error('Failed to create license: ' + error.message);
    }
  });
};

// Hook to update a license
export const useUpdateLicense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (licenseData: UpdateLicenseData): Promise<DriverLicense> => {
      const { id, ...updateData } = licenseData;

      const { data, error } = await supabase
        .from('driver_licenses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license'] });
      queryClient.invalidateQueries({ queryKey: ['driver-licenses'] });
      toast.success('License updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating license:', error);
      toast.error('Failed to update license: ' + error.message);
    }
  });
};

// Hook to delete a license
export const useDeleteLicense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (licenseId: string): Promise<void> => {
      const { error } = await supabase
        .from('driver_licenses')
        .delete()
        .eq('id', licenseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['driver-licenses'] });
      toast.success('License deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting license:', error);
      toast.error('Failed to delete license: ' + error.message);
    }
  });
};

// Hook to get license statistics
export const useLicenseStats = (organizationId?: string) => {
  return useQuery({
    queryKey: ['license-stats', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data: licenses, error } = await supabase
        .from('driver_licenses')
        .select('status, expiry_date')
        .eq('organization_id', organizationId);

      if (error) {
        console.error('Error fetching license stats:', error);
        return null;
      }

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const stats = {
        total: licenses?.length || 0,
        active: licenses?.filter(l => l.status === 'active').length || 0,
        expired: licenses?.filter(l => l.status === 'expired').length || 0,
        suspended: licenses?.filter(l => l.status === 'suspended').length || 0,
        revoked: licenses?.filter(l => l.status === 'revoked').length || 0,
        expiringSoon: licenses?.filter(l => {
          const expiryDate = new Date(l.expiry_date);
          return expiryDate <= thirtyDaysFromNow && expiryDate > now && l.status === 'active';
        }).length || 0
      };

      return stats;
    },
    enabled: !!organizationId,
  });
};

// Hook to get expiring licenses
export const useExpiringLicenses = (organizationId?: string, daysThreshold: number = 30) => {
  return useQuery({
    queryKey: ['expiring-licenses', organizationId, daysThreshold],
    queryFn: async (): Promise<DriverLicense[]> => {
      if (!organizationId) return [];

      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      const { data, error } = await supabase
        .from('driver_licenses')
        .select(`
          *,
          profiles:driver_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .lte('expiry_date', thresholdDate.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .order('expiry_date', { ascending: true });

      if (error) {
        console.error('Error fetching expiring licenses:', error);
        return [];
      }

      return (data || []).map(license => ({
        ...license,
        driver_name: license.profiles 
          ? `${license.profiles.first_name} ${license.profiles.last_name}`
          : 'Unknown Driver',
        driver_email: license.profiles?.email || ''
      }));
    },
    enabled: !!organizationId,
  });
};
