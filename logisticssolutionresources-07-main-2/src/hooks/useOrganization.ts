
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOrganization = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['organization', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for organization fetch');
        return null;
      }
      
      console.log('Fetching organization for user:', user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }
      
      if (!profile?.organization_id) {
        console.log('No organization_id found for user');
        return null;
      }

      console.log('User profile organization_id:', profile.organization_id);

      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        throw orgError;
      }
      
      console.log('Fetched organization:', organization);
      return organization;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error instanceof Error && error.message.includes('organization')) {
        return false;
      }
      return failureCount < 2;
    }
  });
};
