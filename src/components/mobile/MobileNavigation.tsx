import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
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
  Settings
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
  const { isAdmin, hasAdminPrivileges } = useAdminAccess();

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
        { id: 'children', label: 'Children', icon: Users, path: '/parent/children' },
        { id: 'tracking', label: 'Tracking', icon: MapPin, path: '/parent/tracking' },
        { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/parent/schedule' },
        { id: 'notifications', label: 'Alerts', icon: Bell, path: '/parent/notifications' },
      ];
    }
    
    if (userRole === 'mechanic') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/mechanic-dashboard' },
        { id: 'fleet', label: 'Fleet', icon: Truck, path: '/vehicles' },
        { id: 'work-orders', label: 'Orders', icon: FileText, path: '/work-orders' },
        { id: 'inventory', label: 'Inventory', icon: Briefcase, path: '/inventory' },
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
                onClick={() => navigate(item.path)}
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
        </div>
      </div>
    </nav>
  );
};

export default MobileNavigation;