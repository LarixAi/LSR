import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAppConfig, isRouteAllowed } from '@/config/app-config';
import { isPlatform } from '@/utils/platform';

interface PlatformRoutingProps {
  children: React.ReactNode;
}

const PlatformRouting: React.FC<PlatformRoutingProps> = ({ children }) => {
  const config = getAppConfig();
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if current route is allowed for this platform
  if (!isRouteAllowed(currentPath)) {
    // Redirect to appropriate home page
    return <Navigate to={config.routes.defaultHome} replace />;
  }

  // Hide admin routes on mobile platforms
  if (isPlatform.mobile() && currentPath.startsWith('/admin')) {
    return <Navigate to={config.routes.defaultHome} replace />;
  }

  // Hide certain mobile-only routes on web
  if (isPlatform.web() && currentPath.includes('mobile-only')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PlatformRouting;