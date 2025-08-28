import { useAuth } from '@/contexts/AuthContext';

export const useSecurityChecks = () => {
  const { profile } = useAuth();

  const verifyOrganizationAccess = (targetOrgId?: string) => {
    if (!profile?.organization_id) {
      throw new Error('❌ SECURITY: No organization ID - blocking data access');
    }
    
    if (targetOrgId && targetOrgId !== profile.organization_id) {
      throw new Error('❌ SECURITY: Organization mismatch - access denied');
    }
    
    return profile.organization_id;
  };

  const verifyRoleAccess = (allowedRoles: string[]) => {
    if (!profile?.role) {
      throw new Error('❌ SECURITY: No user role - access denied');
    }
    
    if (!allowedRoles.includes(profile.role)) {
      throw new Error(`❌ SECURITY: Role ${profile.role} not allowed - access denied`);
    }
    
    return profile.role;
  };

  const verifyOwnership = (resourceUserId?: string) => {
    if (!profile?.id) {
      throw new Error('❌ SECURITY: No user ID - access denied');
    }
    
    if (resourceUserId && resourceUserId !== profile.id) {
      throw new Error('❌ SECURITY: Resource ownership mismatch - access denied');
    }
    
    return profile.id;
  };

  const isDriver = () => profile?.role === 'driver';
  const isParent = () => profile?.role === 'parent';
  const isMechanic = () => profile?.role === 'mechanic';
  const isAdmin = () => profile?.role === 'admin' || profile?.role === 'council' || profile?.role === 'super_admin';

  return {
    verifyOrganizationAccess,
    verifyRoleAccess,
    verifyOwnership,
    organizationId: profile?.organization_id,
    userRole: profile?.role,
    userId: profile?.id,
    isDriver,
    isParent,
    isMechanic,
    isAdmin
  };
};





