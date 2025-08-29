import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SecurityProvider } from "./contexts/SecurityContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import PasswordChangeWrapper from "./components/auth/PasswordChangeWrapper";
import { lazy, Suspense, useEffect } from "react";
import { isPlatform } from "@/utils/platform";
import PlatformRouting from "@/components/routing/PlatformRouting";
import MobileOptimizedLayout from "@/components/mobile/MobileOptimizedLayout";
import PageLoader from "./components/common/PageLoader";

// Lazy load mobile-optimized components
const DriverMobile = lazy(() => import("./pages/DriverMobile"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Documents = lazy(() => import("./pages/Documents"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const VehicleInspections = lazy(() => import("./pages/VehicleInspections"));
const IncidentReports = lazy(() => import("./pages/IncidentReports"));
const RealTimeTracking = lazy(() => import("./pages/RealTimeTracking"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes cache
      refetchOnWindowFocus: false,
      retry: 1,
      // Mobile-specific: reduce background refetch
      refetchOnMount: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const MobileApp = () => {
  useEffect(() => {
    // Mobile-specific optimizations
    if (isPlatform.mobile()) {
      // Prevent zoom on inputs
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }

      // Add mobile-specific classes
      document.documentElement.classList.add('mobile-app');
      document.body.classList.add('mobile-body');

      // Handle safe areas
      const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top');
      if (safeAreaTop) {
        document.documentElement.style.setProperty('--mobile-safe-top', safeAreaTop);
      }
    }
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Mobile app error:', error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <PasswordChangeWrapper>
                <SecurityProvider>
                  <PlatformRouting>
                    <MobileOptimizedLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          {/* Auth routes - full screen */}
                          <Route path="/auth/callback" element={<AuthCallback />} />
                          <Route path="/auth" element={<AuthPage />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          
                          {/* Mobile-optimized routes */}
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/driver-dashboard" element={<DriverMobile />} />
                          <Route path="/driver-mobile" element={<DriverMobile />} />
                          <Route path="/documents" element={<Documents />} />
                          <Route path="/driver-documents" element={<Documents />} />
                          <Route path="/profile" element={<UserProfile />} />
                          <Route path="/user-profile" element={<UserProfile />} />
                          <Route path="/vehicle-inspections" element={<VehicleInspections />} />
                          <Route path="/incident-reports" element={<IncidentReports />} />
                          <Route path="/tracking/:bookingId" element={<RealTimeTracking />} />
                          
                          {/* Fallback route */}
                          <Route path="*" element={<Dashboard />} />
                        </Routes>
                      </Suspense>
                    </MobileOptimizedLayout>
                  </PlatformRouting>
                </SecurityProvider>
              </PasswordChangeWrapper>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default MobileApp;