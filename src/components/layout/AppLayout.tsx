
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TransportSidebar } from '@/components/layout/TransportSidebar';
import Header from '@/components/Header';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import MobileOptimizedLayout from '@/components/mobile/MobileOptimizedLayout';
import MobileParentDashboard from '@/components/mobile/MobileParentDashboard';
import MobileMechanicDashboard from '@/components/mobile/MobileMechanicDashboard';
import MobileParentTracking from '@/components/mobile/MobileParentTracking';
import MobileWorkOrders from '@/components/mobile/MobileWorkOrders';
import MobileDocuments from '@/components/mobile/MobileDocuments';
import MobileDriverDocuments from '@/components/mobile/MobileDriverDocuments';
import MobileChildManagement from '@/components/mobile/MobileChildManagement';
import MobileParentSchedule from '@/components/mobile/MobileParentSchedule';
import CookieConsent from '@/components/CookieConsent';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Pages that should not show the sidebar (authentication pages)
  const authPages = [
    '/', 
    '/auth', 
    '/driver-login', 
    '/mechanic-login',
    '/mechanic-auth',
    '/forgot-password', 
    '/reset-password', 
    '/auth/callback'
  ];

  const shouldShowSidebar = user && !authPages.includes(location.pathname);

  // Show loading state while auth is being determined - only for non-auth pages
  if (loading && !authPages.includes(location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users from auth pages using React Router
  if (user && authPages.includes(location.pathname) && location.pathname !== '/') {
    // Redirect to main dashboard, which will handle role-based routing
    return <Navigate to="/dashboard" replace />;
  }

  // Don't show sidebar for non-authenticated users or auth pages
  if (!shouldShowSidebar) {
    return (
      <div className="w-full h-full">
        {children}
      </div>
    );
  }

  if (isMobile) {
    const { profile } = useAuth();
    const userRole = profile?.role;
    
    // Security check: Redirect parents from admin routes on mobile
    if (userRole === 'parent') {
      const adminRoutes = [
        '/dashboard', '/admin', '/vehicles', '/drivers', '/jobs', '/settings',
        '/mechanic-dashboard', '/work-orders', '/defect-reports', '/parts-supplies',
        '/fuel-management', '/mechanics', '/route-planning', '/invoice-management',
        '/analytics', '/routes', '/staff-directory', '/compliance-reports'
      ];
      
      if (adminRoutes.some(route => location.pathname.startsWith(route))) {
        return <Navigate to="/parent/dashboard" replace />;
      }
    }
    
    // Conditionally render role-specific mobile components
    let mobileContent = children;
    
    if (userRole === 'parent' && location.pathname === '/parent/dashboard') {
      mobileContent = <MobileParentDashboard />;
    } else if (userRole === 'parent' && location.pathname === '/parent/tracking') {
      mobileContent = <MobileParentTracking />;
    } else if (userRole === 'parent' && location.pathname === '/parent/children') {
      mobileContent = <MobileChildManagement />;
    } else if (userRole === 'parent' && location.pathname === '/parent/schedule') {
      mobileContent = <MobileParentSchedule />;
    } else if (userRole === 'mechanic' && location.pathname === '/mechanic-dashboard') {
      mobileContent = <MobileMechanicDashboard />;
    } else if (userRole === 'mechanic' && location.pathname === '/work-orders') {
      mobileContent = <MobileWorkOrders />;
    } else if (location.pathname === '/documents') {
      mobileContent = <MobileDocuments />;
    } else if (location.pathname === '/driver/documents') {
      mobileContent = <MobileDriverDocuments />;
    }
    
    return (
      <MobileOptimizedLayout>
        <Header />
        <main className="mobile-content-area">
          <div className="max-w-full mx-auto">
            {mobileContent}
          </div>
        </main>
        <MobileNavigation />
        <CookieConsent />
      </MobileOptimizedLayout>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full overflow-hidden">
        <TransportSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-background">
            <div className="w-full h-full p-3 sm:p-4 lg:p-6">
              <div className="max-w-full mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
        <CookieConsent />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
