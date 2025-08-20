import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/utils/adminAccess';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Truck,
  Users,
  FileText,
  Calendar,
  Settings,
  User,
  Home,
  Bell,
  Briefcase,
  MapPin,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  roles?: string[];
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-sm border-t border-gray-200 safe-area-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center py-3 px-4 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 min-w-[72px] relative",
                "touch-manipulation active:scale-95",
                isActive 
                  ? "text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-7 h-7 mb-2 transition-colors duration-200", 
                  isActive ? "text-blue-600" : "text-gray-500"
                )} />
                
                {/* Professional active indicator */}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full" />
                )}
              </div>
              
              <span className={cn(
                "text-sm font-medium leading-tight text-center",
                isActive ? "text-blue-600" : "text-gray-500"
              )}>
                {item.label}
              </span>
              
              {/* Professional badge design */}
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-sm">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;