import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomerProfile {
  id: string;
  organization_id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  customer_type: 'individual' | 'corporate' | 'school' | 'healthcare' | 'government';
  company_name?: string;
  company_registration_number?: string;
  vat_number?: string;
  preferred_contact_method?: 'email' | 'phone' | 'sms' | 'post';
  preferred_language: string;
  accessibility_requirements?: string[];
  medical_conditions?: string[];
  allergies?: string[];
  dietary_restrictions?: string[];
  loyalty_points: number;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_bookings: number;
  total_spent: number;
  average_rating?: number;
  last_booking_date?: string;
  marketing_consent: boolean;
  marketing_consent_date?: string;
  data_protection_consent: boolean;
  data_protection_consent_date?: string;
  terms_accepted: boolean;
  terms_accepted_date?: string;
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  created_by_profile?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateCustomerProfileData {
  customer_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  customer_type?: 'individual' | 'corporate' | 'school' | 'healthcare' | 'government';
  company_name?: string;
  company_registration_number?: string;
  vat_number?: string;
  preferred_contact_method?: 'email' | 'phone' | 'sms' | 'post';
  preferred_language?: string;
  accessibility_requirements?: string[];
  medical_conditions?: string[];
  allergies?: string[];
  dietary_restrictions?: string[];
  marketing_consent?: boolean;
  data_protection_consent?: boolean;
  terms_accepted?: boolean;
  notes?: string;
}

export interface UpdateCustomerProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  customer_type?: 'individual' | 'corporate' | 'school' | 'healthcare' | 'government';
  company_name?: string;
  company_registration_number?: string;
  vat_number?: string;
  preferred_contact_method?: 'email' | 'phone' | 'sms' | 'post';
  preferred_language?: string;
  accessibility_requirements?: string[];
  medical_conditions?: string[];
  allergies?: string[];
  dietary_restrictions?: string[];
  loyalty_points?: number;
  loyalty_tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  marketing_consent?: boolean;
  data_protection_consent?: boolean;
  terms_accepted?: boolean;
  status?: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  notes?: string;
}

export const useCustomerProfiles = (organizationId?: string, customerType?: string, status?: string, loyaltyTier?: string) => {
  const { profile } = useAuth();

  // Fetch customer profiles with related data
  const { data: customerProfiles = [], isLoading, error } = useQuery({
    queryKey: ['customer-profiles', organizationId, customerType, status, loyaltyTier],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        let query = supabase
          .from('customer_profiles')
          .select(`
            *,
            created_by_profile:profiles!customer_profiles_created_by_fkey(id, first_name, last_name)
          `)
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false });

        // Filter by customer type if specified
        if (customerType && customerType !== 'all') {
          query = query.eq('customer_type', customerType);
        }

        // Filter by status if specified
        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        // Filter by loyalty tier if specified
        if (loyaltyTier && loyaltyTier !== 'all') {
          query = query.eq('loyalty_tier', loyaltyTier);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error('Error fetching customer profiles:', fetchError);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in customer profiles query:', error);
        return [];
      }
    },
    enabled: !!organizationId,
  });

  // Calculate statistics
  const calculateStats = () => {
    if (!customerProfiles || customerProfiles.length === 0) {
      return {
        total: 0,
        byType: {
          individual: 0,
          corporate: 0,
          school: 0,
          healthcare: 0,
          government: 0,
        },
        byStatus: {
          active: 0,
          inactive: 0,
          suspended: 0,
          blacklisted: 0,
        },
        byLoyaltyTier: {
          bronze: 0,
          silver: 0,
          gold: 0,
          platinum: 0,
        },
        totalRevenue: 0,
        averageRevenue: 0,
        averageRating: 0,
        totalBookings: 0,
        averageBookings: 0,
        marketingConsent: 0,
        dataProtectionConsent: 0,
        termsAccepted: 0,
        newThisMonth: 0,
        newThisYear: 0,
      };
    }

    const stats = {
      total: customerProfiles.length,
      byType: {
        individual: 0,
        corporate: 0,
        school: 0,
        healthcare: 0,
        government: 0,
      },
      byStatus: {
        active: 0,
        inactive: 0,
        suspended: 0,
        blacklisted: 0,
      },
      byLoyaltyTier: {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
      },
      totalRevenue: 0,
      averageRevenue: 0,
      averageRating: 0,
      totalBookings: 0,
      averageBookings: 0,
      marketingConsent: 0,
      dataProtectionConsent: 0,
      termsAccepted: 0,
      newThisMonth: 0,
      newThisYear: 0,
    };

    let totalRating = 0;
    let ratingCount = 0;
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    customerProfiles.forEach(profile => {
      // Count by type
      if (profile.customer_type) {
        stats.byType[profile.customer_type as keyof typeof stats.byType]++;
      }

      // Count by status
      if (profile.status) {
        stats.byStatus[profile.status as keyof typeof stats.byStatus]++;
      }

      // Count by loyalty tier
      if (profile.loyalty_tier) {
        stats.byLoyaltyTier[profile.loyalty_tier as keyof typeof stats.byLoyaltyTier]++;
      }

      // Sum revenue and bookings
      stats.totalRevenue += profile.total_spent;
      stats.totalBookings += profile.total_bookings;

      // Calculate rating
      if (profile.average_rating) {
        totalRating += profile.average_rating;
        ratingCount++;
      }

      // Count consents
      if (profile.marketing_consent) stats.marketingConsent++;
      if (profile.data_protection_consent) stats.dataProtectionConsent++;
      if (profile.terms_accepted) stats.termsAccepted++;

      // Count new customers
      const createdDate = new Date(profile.created_at);
      if (createdDate >= thisMonth) stats.newThisMonth++;
      if (createdDate >= thisYear) stats.newThisYear++;
    });

    stats.averageRevenue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;
    stats.averageBookings = stats.total > 0 ? stats.totalBookings / stats.total : 0;
    stats.averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    return stats;
  };

  const stats = calculateStats();

  return {
    customerProfiles,
    isLoading,
    error,
    stats,
    hasData: customerProfiles.length > 0,
  };
};

export const useCreateCustomerProfile = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (customerProfile: CreateCustomerProfileData) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('customer_profiles')
        .insert([{
          ...customerProfile,
          organization_id: profile.organization_id,
          created_by: profile.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profiles'] });
    },
  });
};

export const useUpdateCustomerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateCustomerProfileData & { id: string }) => {
      const { data, error } = await supabase
        .from('customer_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profiles'] });
    },
  });
};

export const useDeleteCustomerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customer_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profiles'] });
    },
  });
};
