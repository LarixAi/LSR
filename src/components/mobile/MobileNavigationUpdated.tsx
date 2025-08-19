import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/utils/adminAccess';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
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
  Wifi,
  Signal,
  RefreshCw,
  LogOut,
  Shield,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  roles?: string[];
  badge?: number;
  requiresOnline?: boolean;
}

const MobileNavigationUpdated: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { isAdmin, hasAdminPrivileges } = useAdminAccess();
  const { toast } = useToast();

  // State for connection and sync status
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [showStatusBar, setShowStatusBar] = useState(false);

  // Check connection status
  useEffect(() => {
    const checkConnection = () => {
      if (navigator.onLine) {
        setConnectionStatus('online');
        setShowStatusBar(false);
      } else {
        setConnectionStatus('offline');
        setShowStatusBar(true);
      }
    };

    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Check for pending syncs
  useEffect(() => {
    const checkPendingSyncs = () => {
      try {
        const offlineChecks = JSON.parse(localStorage.getItem('offlineVehicleChecks') || '[]');
        const offlineIncidents = JSON.parse(localStorage.getItem('offlineIncidents') || '[]');
        const totalPending = offlineChecks.length + offlineIncidents.length;
        setPendingSyncs(totalPending);
        
        if (totalPending > 0 && connectionStatus === 'online') {
          setShowStatusBar(true);
        }
      } catch (error) {
        console.error('Error checking pending syncs:', error);
      }
    };

    checkPendingSyncs();
    const interval = setInterval(checkPendingSyncs, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Sync offline data
  const syncOfflineData = async () => {
    if (connectionStatus !== 'online' || isSyncing) return;

    setIsSyncing(true);
    let syncedCount = 0;

    try {
      // Sync offline vehicle checks
      const offlineChecks = JSON.parse(localStorage.getItem('offlineVehicleChecks') || '[]');
      for (const check of offlineChecks) {
        const { error } = await supabase
          .from('vehicle_checks')
          .insert([check]);

        if (!error) {
          syncedCount++;
        }
      }

      // Sync offline incidents
      const offlineIncidents = JSON.parse(localStorage.getItem('offlineIncidents') || '[]');
      for (const incident of offlineIncidents) {
        const { error } = await supabase
          .from('incidents')
          .insert([incident]);

        if (!error) {
          syncedCount++;
        }
      }

      // Clear synced data
      if (syncedCount > 0) {
        localStorage.removeItem('offlineVehicleChecks');
        localStorage.removeItem('offlineIncidents');
        setPendingSyncs(0);
        setShowStatusBar(false);

        toast({
          title: "Data synced successfully",
          description: `${syncedCount} items have been synced to the server.`,
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: "There was an error syncing offline data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync when connection is restored
  useEffect(() => {
    if (connectionStatus === 'online' && pendingSyncs > 0) {
      syncOfflineData();
    }
  }, [connectionStatus, pendingSyncs]);

  if (!isMobile) return null;

  const getNavigationItems = (): NavigationItem[] => {
    const userRole = profile?.role;
    
    if (userRole === 'driver') {
      return [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: LayoutDashboard, 
          path: '/driver-dashboard',
          requiresOnline: false
        },
        { 
          id: 'vehicle-check', 
          label: 'Vehicle Check', 
          icon: CheckCircle, 
          path: '/driver/vehicle-checks',
          requiresOnline: false // Can work offline
        },
        { 
          id: 'jobs', 
          label: 'Jobs', 
          icon: Briefcase, 
          path: '/driver-jobs',
          requiresOnline: true
        },
        { 
          id: 'incidents', 
          label: 'Incidents', 
          icon: AlertTriangle, 
          path: '/driver-incidents',
          requiresOnline: false // Can work offline
        },
        { 
          id: 'more', 
          label: 'More', 
          icon: MoreHorizontal, 
          path: '/driver/more',
          requiresOnline: false
        },
      ];
    }
    
    if (userRole === 'parent') {
      return [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: Home, 
          path: '/parent/dashboard',
          requiresOnline: true
        },
        { 
          id: 'children', 
          label: 'Children', 
          icon: Users, 
          path: '/parent/children',
          requiresOnline: true
        },
        { 
          id: 'tracking', 
          label: 'Tracking', 
          icon: MapPin, 
          path: '/parent/tracking',
          requiresOnline: true
        },
        { 
          id: 'schedule', 
          label: 'Schedule', 
          icon: Calendar, 
          path: '/parent/schedule',
          requiresOnline: true
        },
        { 
          id: 'notifications', 
          label: 'Alerts', 
          icon: Bell, 
          path: '/parent/notifications',
          requiresOnline: true
        },
      ];
    }
    
    if (userRole === 'mechanic') {
      return [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: LayoutDashboard, 
          path: '/mechanic-dashboard',
          requiresOnline: true
        },
        { 
          id: 'fleet', 
          label: 'Fleet', 
          icon: Truck, 
          path: '/vehicles',
          requiresOnline: true
        },
        { 
          id: 'work-orders', 
          label: 'Orders', 
          icon: FileText, 
          path: '/work-orders',
          requiresOnline: true
        },
        { 
          id: 'inventory', 
          label: 'Inventory', 
          icon: Briefcase, 
          path: '/inventory',
          requiresOnline: true
        },
        { 
          id: 'profile', 
          label: 'Profile', 
          icon: User, 
          path: '/profile',
          requiresOnline: false
        },
      ];
    }
    
    // Admin/Default navigation
    return [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        path: '/dashboard',
        requiresOnline: true
      },
      { 
        id: 'vehicles', 
        label: 'Fleet', 
        icon: Truck, 
        path: '/vehicles',
        requiresOnline: true
      },
      { 
        id: 'drivers', 
        label: 'Drivers', 
        icon: Users, 
        path: '/drivers',
        requiresOnline: true
      },
      { 
        id: 'jobs', 
        label: 'Jobs', 
        icon: FileText, 
        path: '/jobs',
        requiresOnline: true
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings, 
        path: '/settings',
        requiresOnline: false
      },
    ];
  };

  const navigationItems = getNavigationItems();

  const isActiveRoute = (path: string) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/') ||
           location.pathname.startsWith(path);
  };

  const handleNavigation = (item: NavigationItem) => {
    if (item.requiresOnline && connectionStatus === 'offline') {
      toast({
        title: "Offline mode",
        description: "This feature requires an internet connection. Please check your connection and try again.",
        variant: "destructive"
      });
      return;
    }
    navigate(item.path);
  };

  return (
    <>
      {/* Status Bar for offline/sync status */}
      {showStatusBar && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 text-center text-sm">
          <div className="flex items-center justify-center space-x-2">
            {connectionStatus === 'offline' ? (
              <>
                <Signal className="w-4 h-4" />
                <span>You're offline. Some features may be limited.</span>
              </>
            ) : (
              <>
                <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                <span>
                  {isSyncing 
                    ? "Syncing offline data..." 
                    : `${pendingSyncs} items pending sync`
                  }
                </span>
                {!isSyncing && pendingSyncs > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={syncOfflineData}
                    className="ml-2 h-6 px-2 text-xs"
                  >
                    Sync Now
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-sm border-t border-gray-200 safe-area-bottom",
        showStatusBar && "top-12" // Add top margin if status bar is shown
      )}>
        <div className="flex justify-around items-center py-3 px-4 max-w-md mx-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            const isDisabled = item.requiresOnline && connectionStatus === 'offline';
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                disabled={isDisabled}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : isDisabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-primary hover:bg-gray-100"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {isDisabled && (
                    <Signal className="absolute -top-1 -right-1 w-3 h-3 text-gray-400" />
                  )}
                </div>
                <span className="text-xs font-medium truncate w-full text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Actions Bar */}
        <div className="border-t border-gray-100 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              {connectionStatus === 'online' ? (
                <Wifi className="w-3 h-3 text-green-500" />
              ) : (
                <Signal className="w-3 h-3 text-orange-500" />
              )}
              <span className="capitalize">{connectionStatus}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {pendingSyncs > 0 && (
                <div className="flex items-center space-x-1">
                  <Database className="w-3 h-3" />
                  <span>{pendingSyncs} pending</span>
                </div>
              )}
              
              <button
                onClick={signOut}
                className="flex items-center space-x-1 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileNavigationUpdated;
