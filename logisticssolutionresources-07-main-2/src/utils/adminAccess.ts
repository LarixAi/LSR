import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Global admin access utilities and helpers
 * Ensures admins have unrestricted access to all app features
 */

export interface AdminAccess {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canAccessEverything: boolean;
  bypassAllRestrictions: boolean;
}

/**
 * Check if user has admin role
 */
export const isAdmin = (userRole?: string | null): boolean => {
  return userRole === 'admin';
};

/**
 * Check if user has council (sub-admin) role
 */
export const isCouncil = (userRole?: string | null): boolean => {
  return userRole === 'council';
};

/**
 * Check if user has admin or council privileges
 */
export const hasAdminPrivileges = (userRole?: string | null): boolean => {
  return isAdmin(userRole) || isCouncil(userRole);
};

/**
 * Check if user can manage organization-wide settings
 */
export const canManageOrganization = (userRole?: string | null): boolean => {
  return hasAdminPrivileges(userRole);
};

/**
 * Check if user has unrestricted access (admin only)
 */
export const hasUnrestrictedAccess = (userRole?: string | null): boolean => {
  return isAdmin(userRole);
};

/**
 * Hook for admin access control with enhanced error handling
 */
export const useAdminAccess = () => {
  const { user, profile, loading } = useAuth();
  
  const userRole = profile?.role;
  const organizationId = profile?.organization_id;
  
  // Enhanced admin detection with fallbacks
  const isUserAdmin = React.useMemo(() => {
    if (!profile) return false;
    
    // Check profile role
    if (isAdmin(userRole) || isCouncil(userRole)) return true;
    
    // Fallback: check user metadata if profile is incomplete
    if (user?.user_metadata?.role) {
      return isAdmin(user.user_metadata.role) || isCouncil(user.user_metadata.role);
    }
    
    return false;
  }, [profile, userRole, user?.user_metadata?.role]);
  
  const adminAccess: AdminAccess = {
    isAdmin: isUserAdmin && isAdmin(userRole),
    isSuperAdmin: isUserAdmin && isAdmin(userRole), // For future expansion
    canAccessEverything: isUserAdmin,
    bypassAllRestrictions: isUserAdmin
  };

  return {
    ...adminAccess,
    userRole,
    organizationId,
    loading,
    hasAdminPrivileges: isUserAdmin,
    canManageOrganization: isUserAdmin,
    hasUnrestrictedAccess: isUserAdmin && isAdmin(userRole),
    // Enhanced convenience methods with better error handling
    canAccess: (feature: string) => {
      if (loading) return false; // Don't allow access while loading
      return isUserAdmin; // Admins can access everything
    },
    canManage: (resource: string) => {
      if (loading) return false;
      if (!organizationId && isUserAdmin) {
        console.warn(`Admin user missing organization_id for resource: ${resource}`);
      }
      return isUserAdmin; // Admins can manage everything
    },
    canView: (content: string) => {
      if (loading) return false;
      return isUserAdmin;
    },
    // Enhanced override with logging
    overridePermission: (hasPermission: boolean) => {
      if (isUserAdmin) {
        console.log('🔑 Admin override granted');
        return true;
      }
      return hasPermission;
    },
    // New diagnostic method for troubleshooting
    getDiagnostics: () => ({
      hasUser: !!user,
      hasProfile: !!profile,
      userRole,
      organizationId,
      userMetadataRole: user?.user_metadata?.role,
      isUserAdmin,
      loading
    })
  };
};

/**
 * Higher-order component for admin-only features
 */
export const withAdminAccess = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => {
    const { isAdmin: userIsAdmin, loading } = useAdminAccess();
    
    if (loading) {
      return React.createElement('div', { className: 'animate-pulse bg-muted rounded h-8 w-32' });
    }
    
    if (!userIsAdmin) {
      return fallback || null;
    }
    
    return React.createElement(Component, props);
  };
};

/**
 * Component for conditionally rendering admin-only content
 */
interface AdminOnlyProps {
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  requireFullAdmin?: boolean; // If true, only 'admin' role, not 'council'
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ 
  children, 
  fallback = null, 
  requireFullAdmin = false 
}) => {
  const { isAdmin: userIsAdmin, hasAdminPrivileges: hasPrivileges, loading } = useAdminAccess();
  
  if (loading) {
    return React.createElement('div', { className: 'animate-pulse bg-muted rounded h-4 w-24' });
  }
  
  const hasAccess = requireFullAdmin ? userIsAdmin : hasPrivileges;
  
  return hasAccess ? React.createElement(React.Fragment, null, children) : React.createElement(React.Fragment, null, fallback);
};

/**
 * Enhanced role-based access that always allows admin override
 */
export const useEnhancedRoleAccess = () => {
  const { isAdmin: userIsAdmin, userRole } = useAdminAccess();
  
  const checkPermission = (
    allowedRoles: string[],
    overrideForAdmin: boolean = true
  ): boolean => {
    // Admins always have access unless explicitly disabled
    if (overrideForAdmin && userIsAdmin) {
      return true;
    }
    
    // Check normal role permissions
    return allowedRoles.includes(userRole || '');
  };
  
  const canPerformAction = (
    action: string,
    context?: Record<string, any>
  ): boolean => {
    // Log admin override for audit purposes
    if (userIsAdmin && context?.logOverride !== false) {
      console.log(`🔑 Admin override granted for action: ${action}`);
    }
    
    return userIsAdmin; // Admins can perform any action
  };
  
  return {
    checkPermission,
    canPerformAction,
    isAdmin: userIsAdmin,
    userRole,
    // Convenience methods for common checks
    canViewAll: () => userIsAdmin,
    canManageAll: () => userIsAdmin,
    canDeleteAll: () => userIsAdmin,
    canCreateAll: () => userIsAdmin,
  };
};