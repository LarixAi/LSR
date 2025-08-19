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
 * Check if user has mechanic role
 */
export const isMechanic = (userRole?: string | null): boolean => {
  return userRole === 'mechanic';
};

/**
 * Check if user has admin or council privileges
 */
export const hasAdminPrivileges = (userRole?: string | null): boolean => {
  return isAdmin(userRole) || isCouncil(userRole);
};

/**
 * Check if user has mechanic privileges (can access vehicle and maintenance features)
 */
export const hasMechanicPrivileges = (userRole?: string | null): boolean => {
  return isMechanic(userRole) || hasAdminPrivileges(userRole);
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
 * Check if user can access vehicle and maintenance features
 */
export const canAccessVehicleFeatures = (userRole?: string | null): boolean => {
  return hasMechanicPrivileges(userRole);
};

/**
 * Hook for admin access control
 */
export const useAdminAccess = () => {
  const { user, profile, loading } = useAuth();
  
  const userRole = profile?.role;
  const organizationId = profile?.organization_id;
  
  const adminAccess: AdminAccess = {
    isAdmin: isAdmin(userRole),
    isSuperAdmin: isAdmin(userRole), // For future expansion
    canAccessEverything: isAdmin(userRole),
    bypassAllRestrictions: isAdmin(userRole)
  };

  return {
    ...adminAccess,
    userRole,
    organizationId,
    loading,
    hasAdminPrivileges: hasAdminPrivileges(userRole),
    hasMechanicPrivileges: hasMechanicPrivileges(userRole),
    isMechanic: isMechanic(userRole),
    canManageOrganization: canManageOrganization(userRole),
    hasUnrestrictedAccess: hasUnrestrictedAccess(userRole),
    canAccessVehicleFeatures: canAccessVehicleFeatures(userRole),
    // Convenience methods
    canAccess: (feature: string) => {
      // Admins can access everything
      if (adminAccess.isAdmin) return true;
      
      // Mechanics can access vehicle and maintenance features
      if (isMechanic(userRole)) {
        const mechanicFeatures = [
          'vehicles', 'vehicle-management', 'vehicle-inspections', 
          'work-orders', 'defect-reports', 'parts-supplies', 'inventory',
          'documents', 'incident-reports', 'vehicle-details', 'vehicle-service',
          'notifications', 'dashboard'
        ];
        return mechanicFeatures.includes(feature);
      }
      
      return false;
    },
    canManage: (resource: string) => {
      // Admins can manage everything
      if (adminAccess.isAdmin) return true;
      
      // Mechanics can manage vehicle and maintenance resources
      if (isMechanic(userRole)) {
        const mechanicResources = [
          'vehicles', 'work-orders', 'defect-reports', 'parts-supplies',
          'vehicle-inspections', 'vehicle-service'
        ];
        return mechanicResources.includes(resource);
      }
      
      return false;
    },
    canView: (content: string) => {
      return adminAccess.isAdmin || hasAdminPrivileges(userRole) || hasMechanicPrivileges(userRole);
    },
    // Override for specific checks
    overridePermission: (hasPermission: boolean) => adminAccess.isAdmin || hasPermission
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