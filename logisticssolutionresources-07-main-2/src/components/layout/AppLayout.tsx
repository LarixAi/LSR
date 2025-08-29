
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TransportSidebar } from '@/components/layout/TransportSidebar';
import Header from '@/components/Header';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import MobileOptimizedLayout from '@/components/mobile/MobileOptimizedLayout';

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
    return (
      <MobileOptimizedLayout>
        <Header />
        <main className="flex-1 overflow-auto mobile-nav-padding">
          <div className="w-full h-full p-3">
            <div className="max-w-full mx-auto">
              {children}
            </div>
          </div>
        </main>
        <MobileNavigation />
      </MobileOptimizedLayout>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full overflow-hidden">
        <TransportSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <div className="w-full h-full p-3 sm:p-4 lg:p-6">
              <div className="max-w-full mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
