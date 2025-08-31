import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SecurityProvider } from "./contexts/SecurityContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { DashboardSettingsProvider } from "./contexts/DashboardSettingsContext";
import { VehicleManagementSettingsProvider } from "./contexts/VehicleManagementSettingsContext";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PasswordChangeWrapper from "./components/auth/PasswordChangeWrapper";
import AgreementGuard from "./components/guards/AgreementGuard";
import { lazy, Suspense } from "react";
import { isMobile } from "@/utils/mobileDetection";
import MobileTest from "@/components/mobile/MobileTest";
import { StripeSuccessHandler } from "./components/subscription/StripeSuccessHandler";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VehicleManagement = lazy(() => import("./pages/VehicleManagement"));
const VehicleManagementSettings = lazy(() => import("./pages/VehicleManagementSettings"));
const JobManagement = lazy(() => import("./pages/JobManagement"));
const AIAssistants = lazy(() => import("./pages/AIAssistants"));
const TimeManagement = lazy(() => import("./pages/TimeManagementRefactored")); // Use refactored version
const LicenseManagement = lazy(() => import("./pages/LicenseManagement"));
const DriverManagement = lazy(() => import("./pages/DriverManagement"));
const DriverDetail = lazy(() => import("./pages/DriverDetail"));
const Documents = lazy(() => import("./pages/DocumentsEnhanced")); // Use enhanced version
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const IncidentReports = lazy(() => import("./pages/IncidentReports"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const SupportTicket = lazy(() => import("./pages/SupportTicket"));
const HelpSupport = lazy(() => import("./pages/HelpSupport"));

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
const PartsSupplies = lazy(() => import("./pages/PartsSuppliesRefactored")); // Use refactored version
const NotificationCenterPage = lazy(() => import("./pages/NotificationCenter"));
const VehicleDetail = lazy(() => import("./pages/VehicleDetail"));
const WalkAroundCheckDetail = lazy(() => import("./pages/WalkAroundCheckDetail"));
const AssignDriver = lazy(() => import("./pages/AssignDriver"));
const EditVehicle = lazy(() => import("./pages/EditVehicle"));
const DocumentViewer = lazy(() => import("./pages/DocumentViewer"));
const VehicleServicePage = lazy(() => import("./pages/VehicleServicePage"));
const FuelManagement = lazy(() => import("./pages/FuelManagement"));
const Mechanics = lazy(() => import("./pages/Mechanics"));
const FleetOverview = lazy(() => import("./pages/FleetOverview"));
const AddComplianceEntry = lazy(() => import("./pages/AddComplianceEntry"));
const AddVehicle = lazy(() => import("./pages/AddVehicle"));
const AddServiceEntry = lazy(() => import("./pages/AddServiceEntry"));
const AddDriver = lazy(() => import("./pages/AddDriver"));


// New pages - Mechanic specific
const MechanicDashboard = lazy(() => import("./pages/MechanicDashboard"));

// New pages - Admin specific
const TireManagement = lazy(() => import("./pages/TireManagement"));
const InfringementManagement = lazy(() => import("./pages/InfringementManagement"));
const AdminSchedule = lazy(() => import("./pages/AdminSchedule")); // Use AdminSchedule instead of Schedule
const AdminInventoryDashboard = lazy(() => import("./pages/AdminInventoryDashboard"));
const AdminMechanicRequests = lazy(() => import("./pages/AdminMechanicRequests"));
const AdminTrainingManagement = lazy(() => import("./pages/AdminTrainingManagement"));
const AdvancedNotifications = lazy(() => import("./pages/AdvancedNotifications"));
const MobileNotificationSystem = lazy(() => import("./components/notifications/MobileNotificationSystem"));
const MobileDriverDocuments = lazy(() => import("./components/mobile/MobileDriverDocuments"));
const AdminDriverDocuments = lazy(() => import("./pages/AdminDriverDocuments"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DataSubjectRights = lazy(() => import("./components/DataSubjectRights"));
const DPIA = lazy(() => import("./components/DPIA"));
const LocationConsent = lazy(() => import("./components/LocationConsent"));
const RailReplacement = lazy(() => import("./pages/RailReplacementEnhanced")); // Use enhanced version

// New pages - Driver specific
const DriverDashboard = lazy(() => import("./pages/DriverDashboard"));
const DriverJobs = lazy(() => import("./pages/DriverJobsRefactored")); // Use refactored version
const DriverSchedule = lazy(() => import("./pages/DriverSchedule"));
const DriverIncidents = lazy(() => import("./pages/DriverIncidents"));
const DriverCompliance = lazy(() => import("./pages/DriverCompliance"));
const VehicleChecks = lazy(() => import("./pages/VehicleChecks"));
const EnhancedVehicleCheckPage = lazy(() => import("./pages/EnhancedVehicleCheckPage"));
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

const VehicleCheckQuestions = lazy(() => import("./pages/VehicleCheckQuestions"));

const DriverAppDownload = lazy(() => import("./pages/DriverAppDownload"));
const ComplianceDashboard = lazy(() => import("./pages/ComplianceDashboard"));
const TachographManager = lazy(() => import("./pages/TachographManager"));
const APIManagement = lazy(() => import("./pages/APIManagement"));
const PersonalAssistants = lazy(() => import("./pages/PersonalAssistants"));
const FleetReportsPage = lazy(() => import("./pages/FleetReportsPage"));
const BookDemoPage = lazy(() => import("./pages/BookDemoPage"));
const SystemDiagnostic = lazy(() => import("./pages/SystemDiagnostic"));

// Additional pages from logisticssolutionresources-07-main-2 - Use functional versions
const Schedule = lazy(() => import("./pages/AdminSchedule")); // Use AdminSchedule instead of placeholder
const SchoolRoutes = lazy(() => import("./pages/SchoolRoutesEnhanced")); // Use enhanced version
const InventoryManagement = lazy(() => import("./pages/InventoryManagement"));
const Inspections = lazy(() => import("./pages/Inspections"));
const Licenses = lazy(() => import("./pages/Licenses"));
const Incidents = lazy(() => import("./pages/Incidents"));
const FleetReports = lazy(() => import("./pages/FleetReports"));
const ComplianceReports = lazy(() => import("./pages/ComplianceReports"));
const SupportTickets = lazy(() => import("./pages/SupportTickets"));
const HelpDocumentation = lazy(() => import("./pages/HelpDocumentation"));
const BookDemo = lazy(() => import("./pages/BookDemo"));

const AgreementManagement = lazy(() => import("./pages/admin/AgreementManagement"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const PasswordResetForm = lazy(() => import("./components/auth/PasswordResetForm"));

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
        <ThemeProvider defaultTheme="light" storageKey="transport-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <SettingsProvider>
            <AuthProvider>
                              <PasswordChangeWrapper>
                  <SecurityProvider>
                    <Suspense fallback={<PageLoader />}>
                    <Routes>
                  {/* Vehicle Check Questions - Main Route */}
                  <Route path="/vehicle-check-questions" element={
                    <OrganizationProvider>
                      <AppLayout>
                        <ProtectedRoute allowedRoles={['admin', 'council']}>
                          <VehicleCheckQuestions />
                        </ProtectedRoute>
                      </AppLayout>
                    </OrganizationProvider>
                  } />
                  

                  
                  {/* Auth routes - full screen without AppLayout */}
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/customer-auth" element={<CustomerAuth />} />
                  <Route path="/book-demo" element={<BookDemoPage />} />
                  

                  
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
                        <AgreementGuard>
                          <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/dashboard" element={
                            <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver', 'parent']}>
                              <DashboardSettingsProvider>
                                <Dashboard />
                              </DashboardSettingsProvider>
                            </ProtectedRoute>
                          } />

                        {/* Documents */}
                        <Route path="/documents" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <Documents />
                          </ProtectedRoute>
                        } />

                        <Route path="/mechanic-dashboard" element={
                          <ProtectedRoute allowedRoles={['mechanic']}>
                            <MechanicDashboard />
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
                        <Route path="/rail-replacement" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <RailReplacement />
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
                        <Route path="/driver/enhanced-vehicle-check" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <EnhancedVehicleCheckPage />
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
                        <Route path="/driver/documents" element={
                          <ProtectedRoute allowedRoles={['driver']}>
                            <MobileDriverDocuments />
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
                        <Route path="/compliance-dashboard" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <ComplianceDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/tachograph-manager" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <TachographManager />
                          </ProtectedRoute>
                        } />
                        <Route path="/api-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <APIManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/personal-assistants" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <PersonalAssistants />
                          </ProtectedRoute>
                        } />
                        
                        {/* Admin-specific routes to match sidebar navigation */}
                        <Route path="/admin/inventory" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AdminInventoryDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/emails" element={
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
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <APIManagement />
                          </ProtectedRoute>
                        } />
                        
                        {/* Reports Routes */}
                        <Route path="/reports/fleet" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <FleetReportsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/reports/compliance" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <ComplianceReportsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/system-diagnostic" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <SystemDiagnostic />
                          </ProtectedRoute>
                        } />


                        <Route path="/admin/agreements" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AgreementManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/verify-email" element={<EmailVerification />} />
                        <Route path="/reset-password" element={<PasswordResetForm />} />

                        {/* Vehicle Management */}
                        <Route path="/vehicles" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <VehicleManagement />
                          </ProtectedRoute>
                        } />
                                <Route path="/vehicle-management" element={
          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
            <VehicleManagement />
          </ProtectedRoute>
        } />
        <Route path="/add-compliance-entry" element={
          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
            <AddComplianceEntry />
          </ProtectedRoute>
        } />
        <Route path="/add-vehicle" element={
          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
            <AddVehicle />
          </ProtectedRoute>
        } />
        <Route path="/add-service-entry" element={
          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
            <AddServiceEntry />
          </ProtectedRoute>
        } />
                        <Route path="/vehicle-management-settings" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <VehicleManagementSettings />
                          </ProtectedRoute>
                        } />

                        {/* Fleet Overview */}
                        <Route path="/fleet-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <FleetOverview />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicle-details/:id" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <VehicleDetail />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicles/:vehicleId" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <VehicleDetail />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicles/:vehicleId/assign-driver" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AssignDriver />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicles/:vehicleId/edit" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <EditVehicle />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicles/:vehicleId/documents/:documentId" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <DocumentViewer />
                          </ProtectedRoute>
                        } />
                        <Route path="/walk-around-checks/:checkId" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <WalkAroundCheckDetail />
                          </ProtectedRoute>
                        } />
                        <Route path="/vehicle-service" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic']}>
                            <VehicleServicePage />
                          </ProtectedRoute>
                        } />

                        {/* Inspections - Place these routes early to avoid conflicts */}
                        <Route path="/inspections" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <Inspections />
                          </ProtectedRoute>
                        } />
                        
                        {/* Redirect /vehicle-inspections to /inspections for consistency */}
                        <Route path="/vehicle-inspections" element={
                          <Navigate to="/inspections" replace />
                        } />
                        
                        {/* Compliance route for backward compatibility */}
                        <Route path="/compliance" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <VehicleInspections />
                          </ProtectedRoute>
                        } />
                        



                        {/* Job Management */}
                        <Route path="/jobs" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <JobManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/job-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <JobManagement />
                          </ProtectedRoute>
                        } />

                        {/* Time Management */}
                        <Route path="/time-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <TimeManagement />
                          </ProtectedRoute>
                        } />

                        {/* License Management */}
                        <Route path="/licenses" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <LicenseManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/license-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <LicenseManagement />
                          </ProtectedRoute>
                        } />

                        {/* Driver Management */}
                        <Route path="/drivers" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <DriverManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/drivers/:driverId" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <DriverDetail />
                          </ProtectedRoute>
                        } />
                        <Route path="/driver-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <DriverManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/add-driver" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AddDriver />
                          </ProtectedRoute>
                        } />
                                <Route path="/admin-driver-documents" element={
          <ProtectedRoute allowedRoles={['admin', 'council']}>
            <AdminDriverDocuments />
          </ProtectedRoute>
        } />
        
        {/* Privacy Policy - Public Route */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        
        {/* Data Subject Rights - Public Route */}
        <Route path="/data-rights" element={<DataSubjectRights />} />
        
        {/* DPIA - Public Route */}
        <Route path="/dpia" element={<DPIA />} />
        
        {/* Location Consent - Public Route */}
        <Route path="/location-consent" element={<LocationConsent />} />

                        {/* Incident Reports */}
                        <Route path="/incidents" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <IncidentReports />
                          </ProtectedRoute>
                        } />
                        <Route path="/incident-reports" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver']}>
                            <IncidentReports />
                          </ProtectedRoute>
                        } />

                        {/* User Profile */}
                        <Route path="/profile" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver', 'parent']}>
                            <Profile />
                          </ProtectedRoute>
                        } />
                        <Route path="/user-profile" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver', 'parent']}>
                            <UserProfile />
                          </ProtectedRoute>
                        } />

                        {/* Settings */}
                        <Route path="/settings" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver', 'parent']}>
                            <DashboardSettingsProvider>
                              <VehicleManagementSettingsProvider>
                                <Settings />
                              </VehicleManagementSettingsProvider>
                            </DashboardSettingsProvider>
                          </ProtectedRoute>
                        } />



                        {/* Subscriptions */}
                        <Route path="/subscriptions" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <Subscriptions />
                          </ProtectedRoute>
                        } />

                        {/* Stripe Payment Success/Cancel Handler */}
                        <Route path="/payment-result" element={<StripeSuccessHandler />} />

                        {/* Support */}
                        <Route path="/support" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver', 'parent']}>
                            <SupportTicket />
                          </ProtectedRoute>
                        } />
                        <Route path="/help" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver', 'parent']}>
                            <HelpSupport />
                          </ProtectedRoute>
                        } />
                        <Route path="/help-support" element={
                          <ProtectedRoute allowedRoles={['admin', 'council', 'mechanic', 'driver', 'parent']}>
                            <HelpSupport />
                          </ProtectedRoute>
                        } />



                        {/* Staff Directory */}
                        <Route path="/staff-directory" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <StaffDirectory />
                          </ProtectedRoute>
                        } />

                        {/* Fleet Reports */}
                        <Route path="/fleet-reports" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <FleetReports />
                          </ProtectedRoute>
                        } />

                        {/* Compliance Reports */}
                        <Route path="/compliance-reports" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <ComplianceReportsPage />
                          </ProtectedRoute>
                        } />

                        {/* Customer Auth */}

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

                        {/* Routes */}
                        <Route path="/routes" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <RoutesPage />
                          </ProtectedRoute>
                        } />

                        {/* Schedule - Use AdminSchedule (functional) instead of placeholder */}
                        <Route path="/schedule" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AdminSchedule />
                          </ProtectedRoute>
                        } />

                        {/* School Routes - Use enhanced version */}
                        <Route path="/school-routes" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <SchoolRoutes />
                          </ProtectedRoute>
                        } />

                        {/* Route Planning */}
                        <Route path="/route-planning" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <RoutePlanning />
                          </ProtectedRoute>
                        } />

                        {/* Personal Assistants */}
                        <Route path="/personal-assistants" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <PersonalAssistants />
                          </ProtectedRoute>
                        } />

                        {/* Invoice Management */}
                        <Route path="/invoice-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <InvoiceManagement />
                          </ProtectedRoute>
                        } />

                        {/* Quotation Management */}
                        <Route path="/quotation-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <QuotationManagement />
                          </ProtectedRoute>
                        } />

                        {/* Inventory Management */}
                        <Route path="/inventory-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <InventoryManagement />
                          </ProtectedRoute>
                        } />

                        {/* Compliance Dashboard */}
                        <Route path="/compliance-dashboard" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <ComplianceDashboard />
                          </ProtectedRoute>
                        } />

                        {/* Infringement Management */}
                        <Route path="/admin/infringement-management" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <InfringementManagement />
                          </ProtectedRoute>
                        } />

                        {/* Tachograph Manager */}
                        <Route path="/tachograph-manager" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <TachographManager />
                          </ProtectedRoute>
                        } />

                        {/* Advanced Notifications */}
                        <Route path="/notifications" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AdvancedNotifications />
                          </ProtectedRoute>
                        } />

                        {/* Support Tickets */}
                        <Route path="/support-tickets" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <SupportTickets />
                          </ProtectedRoute>
                        } />

                        {/* Help Documentation */}
                        <Route path="/help-documentation" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <HelpDocumentation />
                          </ProtectedRoute>
                        } />

                        {/* AI Assistants */}
                        <Route path="/ai-assistants" element={
                          <ProtectedRoute allowedRoles={['admin', 'council']}>
                            <AIAssistants />
                          </ProtectedRoute>
                        } />



                        {/* Unauthorized */}
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                        </AgreementGuard>
                      </AppLayout>
                    </OrganizationProvider>
                  } />
                                  </Routes>
                      </Suspense>
                   </SecurityProvider>
                 </PasswordChangeWrapper>
            </AuthProvider>
            </SettingsProvider>
          </BrowserRouter>
        </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;