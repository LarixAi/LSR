import React from 'react';
import { useAdminAccess } from '@/utils/adminAccess';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requireFullAdmin?: boolean; // If true, only 'admin' role, not 'council'
  fallbackPath?: string;
}

/**
 * Route protection component that ensures only admins can access certain pages
 */
export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  requireFullAdmin = false,
  fallbackPath = '/unauthorized'
}) => {
  const { 
    isAdmin, 
    hasAdminPrivileges, 
    loading,
    userRole 
  } = useAdminAccess();

  // Show loading state while checking admin status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Check admin access
  const hasAccess = requireFullAdmin ? isAdmin : hasAdminPrivileges;

  if (!hasAccess) {
    console.warn(`🚫 Admin access denied for user role: ${userRole}`);
    return <Navigate to={fallbackPath} replace />;
  }

  // Log admin access for audit purposes
  console.log(`🔑 Admin access granted for user role: ${userRole}`);

  return <>{children}</>;
};

/**
 * Higher-order component for admin route protection
 */
export const withAdminProtection = (
  Component: React.ComponentType,
  options: { requireFullAdmin?: boolean; fallbackPath?: string } = {}
) => {
  return () => (
    <AdminProtectedRoute {...options}>
      <Component />
    </AdminProtectedRoute>
  );
};