import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SecurityProvider } from "./contexts/SecurityContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PasswordChangeWrapper from "./components/auth/PasswordChangeWrapper";
import { lazy, Suspense } from "react";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VehicleManagement = lazy(() => import("./pages/VehicleManagement"));
const VehicleManagementSettings = lazy(() => import("./pages/VehicleManagementSettings"));
const JobManagement = lazy(() => import("./pages/JobManagement"));
const AIAssistants = lazy(() => import("./pages/AIAssistants"));
const TimeManagement = lazy(() => import("./pages/TimeManagement"));
const LicenseManagement = lazy(() => import("./pages/LicenseManagement"));
const DriverManagement = lazy(() => import("./pages/DriverManagement"));
const Documents = lazy(() => import("./pages/Documents"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const IncidentReports = lazy(() => import("./pages/IncidentReports"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
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
const NotificationCenterPage = lazy(() => import("./pages/NotificationCenter"));
const VehicleDetails = lazy(() => import("./pages/VehicleDetails"));
const VehicleServicePage = lazy(() => import("./pages/VehicleServicePage"));
const FuelManagement = lazy(() => import("./pages/FuelManagement"));
const Mechanics = lazy(() => import("./pages/Mechanics"));

// New pages - Mechanic specific
const MechanicDashboard = lazy(() => import("./pages/MechanicDashboard"));

// New pages - Admin specific
const TireManagement = lazy(() => import("./pages/TireManagement"));
const InfringementManagement = lazy(() => import("./pages/InfringementManagement"));
const AdminSchedule = lazy(() => import("./pages/AdminSchedule"));
const AdminInventoryDashboard = lazy(() => import("./pages/AdminInventoryDashboard"));
const AdminMechanicRequests = lazy(() => import("./pages/AdminMechanicRequests"));
const AdminTrainingManagement = lazy(() => import("./pages/AdminTrainingManagement"));

// New pages - Driver specific
const DriverDashboard = lazy(() => import("./pages/DriverDashboard"));
const DriverJobs = lazy(() => import("./pages/DriverJobs"));
const DriverSchedule = lazy(() => import("./pages/DriverSchedule"));
const DriverIncidents = lazy(() => import("./pages/DriverIncidents"));
const DriverCompliance = lazy(() => import("./pages/DriverCompliance"));
const VehicleChecks = lazy(() => import("./pages/VehicleChecks"));
const DriverFuelSystem = lazy(() => import("./pages/DriverFuelSystem"));
const DriverSettings = lazy(() => import("./pages/DriverSettings"));
const DriverMore = lazy(() => import("./pages/DriverMore"));
const VehicleCheckTemplates = lazy(() => import("./pages/admin/VehicleCheckTemplates"));

// New pages - Parent specific
const ChildManagement = lazy(() => import("./pages/ChildManagement"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const ParentLayout = lazy(() => import("./components/layout/ParentLayout"));
const ParentRouteTracker = lazy(() => import("./components/parent/ParentRouteTracker"));
const ParentCommunicationCenter = lazy(() => import("./components/parent/ParentCommunicationCenter"));
const ParentNotificationCenter = lazy(() => import("./components/parent/NotificationCenter"));
const ParentSchedule = lazy(() => import("./pages/ParentSchedule"));

// New pages - General
const DataProtection = lazy(() => import("./pages/DataProtection"));

// New admin management pages
const RoutePlanning = lazy(() => import("./pages/RoutePlanning"));
const InvoiceManagement = lazy(() => import("./pages/InvoiceManagement"));
const QuotationManagement = lazy(() => import("./pages/QuotationManagement"));
const EmailManagement = lazy(() => import("./pages/EmailManagement"));
const ComplianceDashboard = lazy(() => import("./pages/ComplianceDashboard"));
const TachographManager = lazy(() => import("./pages/TachographManager"));
const APIManagement = lazy(() => import("./pages/APIManagement"));
// const TrialTestPage = lazy(() => import("./pages/TrialTestPage")); // Hidden - no longer needed
const SystemDiagnostic = lazy(() => import("./pages/SystemDiagnostic"));
const TestPage = lazy(() => import("./pages/TestPage"));

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
        console.error('App-level error:', error, errorInfo);
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
                  
                  {/* Parent-specific routes with admin layout */}
                  <Route path="/parent/*" element={
                    <ProtectedRoute allowedRoles={['parent']}>
                      <AppLayout>
                        <Routes>
                          <Route path="dashboard" element={<ParentDashboard />} />
                          <Route path="tracking" element={<ParentRouteTracker />} />
                          <Route path="schedule" element={<ParentSchedule />} />
                          <Route path="children" element={<ChildManagement />} />
                          <Route path="communication" element={<ParentCommunicationCenter />} />
                          <Route path="notifications" element={<ParentNotificationCenter />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Legacy parent routes for backward compatibility */}
                  <Route path="/parent-dashboard" element={
                    <ProtectedRoute allowedRoles={['parent']}>
                      <Navigate to="/parent/dashboard" replace />
                    </ProtectedRoute>
                  } />
                  <Route path="/child-management" element={
                    <ProtectedRoute allowedRoles={['parent']}>
                      <Navigate to="/parent/children" replace />
                    </ProtectedRoute>
                  } />
                  <Route path="/children" element={
                    <ProtectedRoute allowedRoles={['parent']}>
                      <Navigate to="/parent/children" replace />
                    </ProtectedRoute>
                  } />
                  
                  {/* All other routes wrapped in AppLayout */}
                  <Route path="/*" element={
                    <OrganizationProvider>
                      <AppLayout>
                        <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/dashboard" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <Dashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/mechanic-dashboard" element={
                          <ProtectedRoute allowedRoles={['mechanic']}>
                            <MechanicDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/work-orders" element={
                          <ProtectedRoute allowedRoles={['mechanic', 'driver']}>
                            <WorkOrders />
                          </ProtectedRoute>
                        } />
                        <Route path="/defect-reports" element={
                          <ProtectedRoute allowedRoles={['mechanic', 'admin', 'council', 'driver']}>
                            <DefectReports />
                          </ProtectedRoute>
                        } />
                        <Route path="/parts-supplies" element={
                          <ProtectedRoute allowedRoles={['mechanic', 'driver']}>
                            <PartsSupplies />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <Dashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicles" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <VehicleManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicle-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <VehicleManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicle-settings" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <VehicleManagementSettings />
                          </ProtectedRoute>
                        } />
                        <Route path="/jobs" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <JobManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/ai-assistants" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <AIAssistants />
                          </ProtectedRoute>
                        } />
                        <Route path="/time-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <TimeManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/licenses" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <LicenseManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/license-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <LicenseManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/drivers" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <DriverManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <DriverManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/documents" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <Documents />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver/documents" element={
                          <ProtectedRoute allowedRoles={['driver', 'admin', 'council', 'mechanic']}>
                            <Documents />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver-documents" element={
                          <ProtectedRoute allowedRoles={['driver', 'admin', 'council', 'mechanic']}>
                            <Documents />
                          </ProtectedRoute>
                        } />
                        <Route path="/user-profile" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <UserProfile />
                          </ProtectedRoute>
                        } />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/subscriptions" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <Subscriptions />
                          </ProtectedRoute>
                        } />
                        <Route path="/incident-reports" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <IncidentReports />
                          </ProtectedRoute>
                        } />
                        <Route path="/routes" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <RoutesPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/support-ticket" element={<SupportTicket />} />
                        <Route path="/staff-directory" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <StaffDirectory />
                          </ProtectedRoute>
                        } />
                        <Route path="/compliance" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <ComplianceReportsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicle-inspections" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <VehicleInspections />
                          </ProtectedRoute>
                        } />
                        <Route path="/reports/compliance" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <ComplianceReportsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/reports/fleet" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <Dashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/customer-dashboard" element={<div>Customer Dashboard - Under Construction</div>} />
                        <Route path="/driver-mobile" element={
                          <ProtectedRoute allowedRoles={['driver', 'admin', 'council']}>
                            <DriverMobile />
                          </ProtectedRoute>
                        } />
                        <Route path="/tracking/:bookingId" element={<RealTimeTracking />} />
                        <Route path="/analytics" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AnalyticsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/work-orders" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <WorkOrders />
                          </ProtectedRoute>
                        } />
                        <Route path="/defect-reports" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <DefectReports />
                          </ProtectedRoute>
                        } />
                        <Route path="/defects" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <DefectReports />
                          </ProtectedRoute>
                        } />
                        <Route path="/parts-supplies" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <PartsSupplies />
                          </ProtectedRoute>
                        } />
                        <Route path="/inventory" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <PartsSupplies />
                          </ProtectedRoute>
                        } />
                        <Route path="/notifications" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <NotificationCenterPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicle-details/:vehicleId" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <VehicleDetails />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicle-service/:vehicleId" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <VehicleServicePage />
                          </ProtectedRoute>
                        } />
                        <Route path="/fuel-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <FuelManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/mechanics" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <Mechanics />
                          </ProtectedRoute>
                        } />

                        {/* Admin-specific routes */}
                        <Route path="/admin/tire-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <TireManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/infringement-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <InfringementManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin-schedule" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AdminSchedule />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/mechanic-requests" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AdminMechanicRequests />
                          </ProtectedRoute>
                        } />

                        {/* Driver-specific routes */}
                        <Route path="/driver-dashboard" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <DriverDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver-jobs" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <DriverJobs />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver-schedule" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <DriverSchedule />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver-incidents" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <DriverIncidents />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver-compliance" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <DriverCompliance />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver/vehicle-checks" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <VehicleChecks />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver/fuel" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <DriverFuelSystem />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver/settings" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <DriverSettings />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver/more" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <DriverMore />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver/dashboard" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <DriverDashboard />
                          </ProtectedRoute>
                        } />

                        {/* General routes */}
                        <Route path="/data-protection" element={<DataProtection />} />

                        {/* Admin management routes */}
                        <Route path="/route-planning" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <RoutePlanning />
                          </ProtectedRoute>
                        } />
                        <Route path="/invoice-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <InvoiceManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/quotation-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <QuotationManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/email-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <EmailManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/compliance-dashboard" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <ComplianceDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/tachograph-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <TachographManager />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/api-management" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <APIManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/vehicle-check-templates" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <VehicleCheckTemplates />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/inventory" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AdminInventoryDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/training-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AdminTrainingManagement />
                          </ProtectedRoute>
                        } />

                        {/* Trial Management Test Route - Hidden */}
                        {/* <Route path="/trial-test" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <TrialTestPage />
                          </ProtectedRoute>
                        } /> */}

                        {/* System Diagnostic Route */}
                        <Route path="/system-diagnostic" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <SystemDiagnostic />
                          </ProtectedRoute>
                        } />

                        {/* Test Page Route */}
                        <Route path="/test" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'driver']}>
                            <TestPage />
                          </ProtectedRoute>
                        } />

                        {/* Fix route inconsistencies */}
                        <Route path="/staff" element={<StaffDirectory />} />
                        <Route path="/incidents" element={<IncidentReports />} />

                        <Route path="/unauthorized" element={<Unauthorized />} />
                      </Routes>
                    </AppLayout>
                    </OrganizationProvider>
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