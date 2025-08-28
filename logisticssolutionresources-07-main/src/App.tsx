import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SecurityProvider } from "./contexts/SecurityContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PasswordChangeWrapper from "./components/auth/PasswordChangeWrapper";
import { lazy, Suspense } from "react";
import { Logger } from "./utils/logger";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VehicleManagement = lazy(() => import("./pages/VehicleManagement"));
const JobManagement = lazy(() => import("./pages/JobManagement"));
const AIAssistants = lazy(() => import("./pages/AIAssistants"));
const TimeManagement = lazy(() => import("./pages/TimeManagement"));
const LicenseManagement = lazy(() => import("./pages/LicenseManagement"));
const DriverManagement = lazy(() => import("./pages/DriverManagement"));
const Documents = lazy(() => import("./pages/Documents"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const IncidentReports = lazy(() => import("./pages/IncidentReports"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const SupportTicket = lazy(() => import("./pages/SupportTicket"));
const StaffDirectory = lazy(() => import("./pages/StaffDirectory"));
const ComplianceReportsPage = lazy(() => import("./pages/ComplianceReportsPage"));
const VehicleInspections = lazy(() => import("./pages/VehicleInspections"));
const CustomerAuth = lazy(() => import("./pages/CustomerAuth"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const DriverMobile = lazy(() => import("./pages/DriverMobile"));
const RealTimeTracking = lazy(() => import("./pages/RealTimeTracking"));
const RoutesPage = lazy(() => import("./pages/Routes"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const WorkOrders = lazy(() => import("./pages/WorkOrders"));
const DefectReports = lazy(() => import("./pages/DefectReports"));
const PartsSupplies = lazy(() => import("./pages/PartsSupplies"));
const NotificationCenter = lazy(() => import("./pages/NotificationCenter"));
const VehicleDetails = lazy(() => import("./pages/VehicleDetails"));
const VehicleServicePage = lazy(() => import("./pages/VehicleServicePage"));
const FuelManagement = lazy(() => import("./pages/FuelManagement"));
const Mechanics = lazy(() => import("./pages/Mechanics"));
// Added driver-specific pages
const DriverJobs = lazy(() => import("./pages/DriverJobs"));
const DriverSchedule = lazy(() => import("./pages/DriverSchedule"));
import PageLoader from "./components/common/PageLoader";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Use proper logging instead of console.error
        const logger = new Logger('App');
        logger.error('App-level error', { 
          message: error.message, 
          stack: error.stack,
          componentStack: errorInfo.componentStack 
        });
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
                <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Auth routes - full screen without AppLayout */}
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/customer-auth" element={<CustomerAuth />} />
                  
                  {/* All other routes wrapped in AppLayout */}
                  <Route path="/*" element={
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/driver-dashboard" element={<DriverMobile />} />
                        <Route path="/driver-mobile" element={<DriverMobile />} />
                        <Route path="/vehicles" element={<VehicleManagement />} />
                        <Route path="/vehicle-management" element={<VehicleManagement />} />
                        <Route path="/jobs" element={<JobManagement />} />
                        <Route path="/ai-assistants" element={<AIAssistants />} />
                        <Route path="/time-management" element={<TimeManagement />} />
                        <Route path="/licenses" element={<LicenseManagement />} />
                        <Route path="/license-management" element={<LicenseManagement />} />
                        <Route path="/drivers" element={<DriverManagement />} />
                        <Route path="/driver-management" element={<DriverManagement />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/driver/documents" element={
                          <ProtectedRoute allowedRoles={['driver', 'admin', 'council']}>
                            <Documents />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver-documents" element={
                          <ProtectedRoute allowedRoles={['driver', 'admin', 'council']}>
                            <Documents />
                          </ProtectedRoute>
                        } />
                        {/* Driver-specific aliases to prevent blank pages */}
                        <Route path="/profile" element={<UserProfile />} />
                        <Route path="/user-profile" element={<UserProfile />} />
                        <Route path="/driver-incidents" element={<IncidentReports />} />
                        <Route path="/incident-reports" element={<IncidentReports />} />
                        <Route path="/driver-schedule" element={<DriverSchedule />} />
                        <Route path="/driver-jobs" element={<DriverJobs />} />

                        <Route path="/subscriptions" element={<Subscriptions />} />
                        <Route path="/routes" element={<RoutesPage />} />
                        <Route path="/support-ticket" element={<SupportTicket />} />
                        <Route path="/staff-directory" element={<StaffDirectory />} />
                        <Route path="/compliance" element={<ComplianceReportsPage />} />
                        <Route path="/vehicle-inspections" element={<VehicleInspections />} />
                        <Route path="/reports/compliance" element={<ComplianceReportsPage />} />
                        <Route path="/reports/fleet" element={<Dashboard />} />
                        <Route path="/customer-dashboard" element={<div>Customer Dashboard - Under Construction</div>} />
                        <Route path="/tracking/:bookingId" element={<RealTimeTracking />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/work-orders" element={<WorkOrders />} />
                        <Route path="/defect-reports" element={<DefectReports />} />
                        <Route path="/defects" element={<DefectReports />} />
                        <Route path="/parts-supplies" element={<PartsSupplies />} />
                        <Route path="/inventory" element={<PartsSupplies />} />
                        <Route path="/notifications" element={<NotificationCenter />} />
                        <Route path="/vehicle-details/:vehicleId" element={<VehicleDetails />} />
                        <Route path="/vehicle-service/:vehicleId" element={<VehicleServicePage />} />
                        <Route path="/fuel-management" element={<FuelManagement />} />
                        <Route path="/mechanics" element={<Mechanics />} />

                        <Route path="/unauthorized" element={<Unauthorized />} />
                        {/* Fallback inside layout to avoid blank pages */}
                        <Route path="*" element={<Dashboard />} />
                      </Routes>
                    </AppLayout>
                  } />
                </Routes>
              </Suspense>
              </SecurityProvider>
            </PasswordChangeWrapper>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;