import React from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredOrganizationId?: string;
  fallback?: React.ReactNode;
}

// Enhanced authentication guard with role-based access control
export const AuthGuard = ({ 
  children, 
  requiredRole, 
  requiredOrganizationId,
  fallback 
}: AuthGuardProps) => {
  const { 
    isAuthenticated, 
    profile, 
    requireAuth, 
    requireRole, 
    requireOrganizationAccess 
  } = useSecureAuth();

  // Default fallback component
  const DefaultFallback = ({ message, actionText, onAction }: {
    message: string;
    actionText?: string;
    onAction?: () => void;
  }) => (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardContent className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p className="text-muted-foreground mb-4">{message}</p>
        {actionText && onAction && (
          <Button onClick={onAction} variant="outline">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Check authentication
  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <DefaultFallback 
        message="You must be logged in to access this page."
        actionText="Go to Login"
        onAction={() => window.location.href = '/auth'}
      />
    );
  }

  // Check role requirements
  if (requiredRole) {
    try {
      requireRole(requiredRole);
    } catch (error) {
      if (fallback) return <>{fallback}</>;
      
      const roles = Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole;
      return (
        <DefaultFallback 
          message={`This page requires ${roles} privileges. Your current role: ${profile?.role || 'Unknown'}`}
        />
      );
    }
  }

  // Check organization access
  if (requiredOrganizationId) {
    try {
      requireOrganizationAccess(requiredOrganizationId);
    } catch (error) {
      if (fallback) return <>{fallback}</>;
      
      return (
        <DefaultFallback 
          message="You don't have access to this organization's data."
        />
      );
    }
  }

  return <>{children}</>;
};

// Higher-order component for route protection
export const withAuthGuard = (
  Component: React.ComponentType,
  options?: {
    requiredRole?: string | string[];
    requiredOrganizationId?: string;
    fallback?: React.ReactNode;
  }
) => {
  return function AuthGuardedComponent(props: any) {
    return (
      <AuthGuard 
        requiredRole={options?.requiredRole}
        requiredOrganizationId={options?.requiredOrganizationId}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };
};

// Admin-only guard
export const AdminGuard = ({ children, fallback }: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <AuthGuard 
    requiredRole={['admin', 'council', 'super_admin']}
    fallback={fallback}
  >
    {children}
  </AuthGuard>
);

// Organization-specific guard
export const OrganizationGuard = ({ 
  children, 
  organizationId, 
  fallback 
}: {
  children: React.ReactNode;
  organizationId: string;
  fallback?: React.ReactNode;
}) => (
  <AuthGuard 
    requiredOrganizationId={organizationId}
    fallback={fallback}
  >
    {children}
  </AuthGuard>
);