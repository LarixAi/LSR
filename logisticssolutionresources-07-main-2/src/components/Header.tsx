import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import SafeSidebarTrigger from './layout/SafeSidebarTrigger';
import UserProfileDropdown from './header/UserProfileDropdown';
import { ThemeToggle } from './ui/theme-toggle';
import SubscriptionStatus from './header/SubscriptionStatus';


const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Don't show header if user is not authenticated
  if (!user) {
    return null;
  }

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    const routeTitles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/vehicles': 'Fleet Management',
      '/drivers': 'Driver Management',
      '/mechanics': 'Mechanics',
      '/jobs': 'Job Management',
      '/admin-schedule': 'Resource Scheduling',
      '/routes': 'Route Management',
      '/admin/route-management': 'Route Planning & Pricing',
      '/admin/compliance-dashboard': 'Compliance Dashboard',
      '/admin/tachograph-management': 'Tachograph Management',
      '/admin/api-management': 'API Management',
      '/compliance': 'Compliance',
      '/vehicle-inspections': 'Vehicle Inspections',
      '/licenses': 'License Management',
      '/documents': 'Document Management',
      '/incident-reports': 'Incident Reports',
      '/analytics': 'Analytics',
      '/profile': 'Profile',
      '/settings': 'Settings',
      '/staff-directory': 'Staff Directory',
      '/time-management': 'Time Management'
    };
    
    return routeTitles[path] || 'TransManager';
  };

  return (
    <header className="bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Left Section - Logo and Company Info */}
          <div className="flex items-center space-x-3 min-w-0">
            {!isMobile && <SafeSidebarTrigger className="h-8 w-8 sm:h-10 sm:w-10 touch-manipulation flex-shrink-0 hover:bg-muted rounded-md transition-colors duration-200" />}
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/c7fc78b4-c136-43b3-b47e-00e97017921c.png" 
                alt="LSR Logistics Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary block">LSR</span>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Logistics Solution Resources</p>
              </div>
            </div>
          </div>

          {/* Center Section - Page Title (Desktop only) */}
          {!isMobile && (
            <div className="hidden lg:flex items-center space-x-2 border-l border-border pl-6 mx-6">
              <div className="text-center">
                <h1 className="text-lg font-semibold text-foreground">{getPageTitle()}</h1>
                <p className="text-xs text-muted-foreground">Current Location</p>
              </div>
            </div>
          )}

          {/* Right Section - Subscription, Theme Toggle & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <SubscriptionStatus />
            <ThemeToggle />
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;