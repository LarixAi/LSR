import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';

import { useAdminAccess } from '@/utils/adminAccess';
import {
  LayoutDashboard,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  MoreHorizontal,
  Home,
  Users,
  MapPin,
  Calendar,
  Bell,
  Truck,
  FileText,
  User,
  Settings,
  Sun,
  Moon
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const MobileNavigation: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { theme, setTheme } = useTheme();

  const { isAdmin, hasAdminPrivileges } = useAdminAccess();

  const isDark = theme === 'dark';
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (!isMobile) return null;

  const getNavigationItems = (): NavigationItem[] => {
    const userRole = profile?.role;
    
    if (userRole === 'driver') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/driver-dashboard' },
        { id: 'vehicle-check', label: 'Vehicle Check', icon: CheckCircle, path: '/driver/vehicle-checks' },
        { id: 'jobs', label: 'Jobs', icon: Briefcase, path: '/driver-jobs' },
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle, path: '/driver-incidents' },
        { id: 'more', label: 'More', icon: MoreHorizontal, path: '/driver/more' },
      ];
    }
    
    if (userRole === 'parent') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/parent/dashboard' },
        { id: 'tracking', label: 'Tracking', icon: MapPin, path: '/parent/tracking' },
        { id: 'children', label: 'Children', icon: Users, path: '/parent/children' },
        { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/parent/schedule' },
        { id: 'notifications', label: 'Alerts', icon: Bell, path: '/parent/notifications' },
      ];
    }
    
    if (userRole === 'mechanic') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/mechanic-dashboard' },
        { id: 'work-orders', label: 'Orders', icon: FileText, path: '/work-orders' },
        { id: 'fleet', label: 'Fleet', icon: Truck, path: '/vehicles' },
        { id: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
        { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
      ];
    }
    
    // Admin/Default navigation
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { id: 'vehicles', label: 'Fleet', icon: Truck, path: '/vehicles' },
      { id: 'drivers', label: 'Drivers', icon: Users, path: '/drivers' },
      { id: 'jobs', label: 'Jobs', icon: FileText, path: '/jobs' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ];
  };

  const handleNavigation = (path: string) => {
    const userRole = profile?.role;
    
    // Security check: Prevent parents from accessing admin routes
    if (userRole === 'parent') {
      const adminRoutes = [
        '/dashboard', '/admin', '/vehicles', '/drivers', '/jobs', '/settings',
        '/mechanic-dashboard', '/work-orders', '/defect-reports', '/parts-supplies',
        '/fuel-management', '/mechanics', '/route-planning', '/invoice-management',
        '/analytics', '/routes', '/staff-directory', '/compliance-reports'
      ];
      
      if (adminRoutes.some(route => path.startsWith(route))) {
        // Redirect parents to their dashboard if they try to access admin routes
        navigate('/parent/dashboard');
        return;
      }
    }
    
    navigate(path);
  };

  const navigationItems = getNavigationItems();

  const isActiveRoute = (path: string) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/') ||
           location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 professional-nav-container safe-area-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-center items-center py-4 px-4">
        <div className="nav-container-white">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            const isVehicleCheck = item.id === 'vehicle-check';
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                data-vehicle-check={isVehicleCheck}
                title={`Go to ${item.label.toLowerCase()}`}
                className={cn(
                  "professional-nav-button inline-flex items-center mr-4 last-of-type:mr-0 p-2.5 text-sm",
                  isActive && "active",
                  isVehicleCheck && "vehicle-check-special"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors duration-200 nav-icon", 
                  isVehicleCheck && "vehicle-check",
                  isActive && "active"
                )} />
                
                {/* Badge for notifications */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </button>
            );
          })}
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={cn(
              "professional-nav-button inline-flex items-center p-2.5 text-sm",
              "theme-toggle-button"
            )}
          >
            {isDark ? (
              <Sun className="w-5 h-5 transition-colors duration-200 nav-icon" />
            ) : (
              <Moon className="w-5 h-5 transition-colors duration-200 nav-icon" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default MobileNavigation;