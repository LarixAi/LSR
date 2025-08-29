import { useAuth } from '@/contexts/AuthContext';

export const useOrganizationContext = () => {
  const { profile } = useAuth();
  
  const getOrganizationId = () => {
    if (!profile?.organization_id) {
      throw new Error('User must belong to an organization');
    }
    return profile.organization_id;
  };
  
  const ensureOrganizationAccess = (targetOrgId?: string) => {
    const userOrgId = getOrganizationId();
    if (targetOrgId && targetOrgId !== userOrgId) {
      throw new Error('Access denied: Different organization');
    }
    return userOrgId;
  };
  
  return {
    organizationId: profile?.organization_id,
    getOrganizationId,
    ensureOrganizationAccess
  };
};