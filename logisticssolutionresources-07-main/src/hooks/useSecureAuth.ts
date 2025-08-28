import { useAuth } from '@/contexts/AuthContext';
import { ValidationError, AuthorizationError, AuthenticationError } from '@/utils/errorHandling';

// Enhanced authentication hook with security checks
export const useSecureAuth = () => {
  const { user, profile, session } = useAuth();

  // Check if user is authenticated
  const requireAuth = () => {
    if (!user || !session) {
      throw new AuthenticationError('Authentication required');
    }
    return { user, session };
  };

  // Check if user has specific role
  const requireRole = (allowedRoles: string | string[]) => {
    const { user: authUser } = requireAuth();
    
    if (!profile?.role) {
      throw new AuthorizationError('User role not found');
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(profile.role)) {
      throw new AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`);
    }

    return { user: authUser, profile };
  };

  // Check if user has admin privileges
  const requireAdmin = () => {
    return requireRole(['admin', 'council', 'super_admin']);
  };

  // Check organization context
  const requireOrganizationAccess = (targetOrgId: string) => {
    requireAuth();
    
    if (!profile?.organization_id) {
      throw new AuthorizationError('User organization not found');
    }

    if (profile.organization_id !== targetOrgId) {
      throw new AuthorizationError('Cross-organization access denied');
    }

    return profile;
  };

  // Safe operation wrapper
  const withSecurityCheck = async <T>(
    operation: () => Promise<T>,
    requiredRole?: string | string[],
    targetOrgId?: string
  ): Promise<T> => {
    // Authentication check
    requireAuth();

    // Role check if specified
    if (requiredRole) {
      requireRole(requiredRole);
    }

    // Organization check if specified
    if (targetOrgId) {
      requireOrganizationAccess(targetOrgId);
    }

    return await operation();
  };

  // Get current user context safely
  const getCurrentUserContext = () => {
    const authData = requireAuth();
    
    return {
      userId: authData.user.id,
      email: authData.user.email,
      role: profile?.role || null,
      organizationId: profile?.organization_id || null,
      isAdmin: profile?.role ? ['admin', 'council', 'super_admin'].includes(profile.role) : false
    };
  };

  return {
    user,
    profile,
    session,
    isAuthenticated: !!user && !!session,
    isAdmin: profile?.role ? ['admin', 'council', 'super_admin'].includes(profile.role) : false,
    requireAuth,
    requireRole,
    requireAdmin,
    requireOrganizationAccess,
    withSecurityCheck,
    getCurrentUserContext
  };
};