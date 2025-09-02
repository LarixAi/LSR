import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiresAuth?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [],
  requiresAuth = true 
}: ProtectedRouteProps) => {
  const { user, profile, loading, forceRefreshProfile } = useAuth();
  const location = useLocation();

  // Add role validation debugging
  useEffect(() => {
    if (profile && allowedRoles.length > 0) {
      const hasValidRole = allowedRoles.includes(profile.role);
      console.log('🛡️ ProtectedRoute validation:', {
        path: location.pathname,
        userRole: profile.role,
        allowedRoles,
        hasValidRole,
        userId: profile.id,
        userEmail: user?.email
      });

      // If role doesn't match, try refreshing profile once
      if (!hasValidRole && user) {
        console.log('⚠️ Role mismatch detected, refreshing profile...');
        forceRefreshProfile();
      }
    }
  }, [profile, allowedRoles, location.pathname, user, forceRefreshProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (requiresAuth && !user) {
    console.log('🔒 No user, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiresAuth && user && !profile) {
    console.log('⏳ User exists but no profile, showing loader');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Enhanced role validation
  if (allowedRoles.length > 0 && profile) {
    const hasValidRole = allowedRoles.includes(profile.role);
    
    if (!hasValidRole) {
      console.log('🚫 Role access denied:', {
        userRole: profile.role,
        allowedRoles,
        path: location.pathname
      });
      return <Navigate to="/unauthorized" replace />;
    }
    
    console.log('✅ Role access granted:', {
      userRole: profile.role,
      path: location.pathname
    });
  }

  return <>{children}</>;
};

export default ProtectedRoute;