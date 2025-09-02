import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseRoleValidationOptions {
  requiredRole?: string;
  requiredRoles?: string[];
  redirectTo?: string;
  onRoleMismatch?: () => void;
}

export const useRoleValidation = (options: UseRoleValidationOptions = {}) => {
  const { profile, user, forceRefreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    requiredRole,
    requiredRoles,
    redirectTo = '/unauthorized',
    onRoleMismatch
  } = options;

  const validateRole = useCallback(() => {
    if (!profile || !user) return { isValid: false, reason: 'No profile or user' };

    // Determine what roles are allowed
    let allowedRoles: string[] = [];
    if (requiredRole) allowedRoles = [requiredRole];
    if (requiredRoles) allowedRoles = requiredRoles;
    
    if (allowedRoles.length === 0) {
      return { isValid: true, reason: 'No role restrictions' };
    }

    const hasValidRole = allowedRoles.includes(profile.role);
    
    console.log('🔍 Role validation check:', {
      currentPath: location.pathname,
      userRole: profile.role,
      allowedRoles,
      hasValidRole,
      userId: profile.id,
      userEmail: user.email
    });

    return {
      isValid: hasValidRole,
      reason: hasValidRole ? 'Valid role' : `Role ${profile.role} not in allowed roles: ${allowedRoles.join(', ')}`
    };
  }, [profile, user, requiredRole, requiredRoles, location.pathname]);

  const handleRoleMismatch = useCallback(async () => {
    console.log('⚠️ Role mismatch detected, attempting profile refresh...');
    
    // Try refreshing profile first
    await forceRefreshProfile();
    
    // Re-validate after refresh
    const validation = validateRole();
    if (!validation.isValid) {
      console.log('🚫 Role still invalid after refresh:', validation.reason);
      
      if (onRoleMismatch) {
        onRoleMismatch();
      } else {
        navigate(redirectTo, { replace: true });
      }
    } else {
      console.log('✅ Role is now valid after profile refresh');
    }
  }, [forceRefreshProfile, validateRole, onRoleMismatch, navigate, redirectTo]);

  useEffect(() => {
    if (profile && user) {
      const validation = validateRole();
      
      if (!validation.isValid) {
        console.log('❌ Role validation failed:', validation.reason);
        handleRoleMismatch();
      }
    }
  }, [profile, user, validateRole, handleRoleMismatch]);

  return {
    isValidRole: validateRole().isValid,
    currentRole: profile?.role,
    validateRole,
    refreshAndValidate: handleRoleMismatch
  };
};