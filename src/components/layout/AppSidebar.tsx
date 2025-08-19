
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { useAdminAccess, AdminOnly } from '@/utils/adminAccess';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Settings,
  User,
  MapPin,
  AlertTriangle,
  Shield,
  Calendar,
  Clock,
  MessageSquare,
  Bell,
  Navigation,
  UserCheck,
  Bot,
  Wrench,
  LogOut,
  Phone,
  BookOpen,
  CircleDot,
  Scale,
  Fuel,
  Package
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AppSidebar = () => {
  const { profile, user } = useAuth();
  const { isAdmin, hasAdminPrivileges } = useAdminAccess();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    } else {
      navigate('/auth');
    }
  };

  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    if (profile?.first_name) {
      return profile.first_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return user?.email || 'User';
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (!profile) return [];

    const baseItems = [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
      },
    ];

    switch (profile.role) {
      case 'admin':
        return [
          ...baseItems,
          {
            title: 'AI Assistants',
            url: '/ai-assistants',
            icon: Bot,
          },
          {
            title: 'Vehicles',
            url: '/vehicles',
            icon: Truck,
          },
          {
            title: 'Drivers',
            url: '/drivers',
            icon: Users,
          },
          {
            title: 'Mechanics',
            url: '/mechanics',
            icon: Wrench,
          },
          {
            title: 'Jobs',
            url: '/jobs',
            icon: MapPin,
          },
          {
            title: 'Incidents',
            url: '/incidents',
            icon: AlertTriangle,
          },
          {
            title: 'Licenses',
            url: '/licenses',
            icon: Shield,
          },
          {
            title: 'Documents',
            url: '/documents',
            icon: FileText,
          },
          {
            title: 'Time Management',
            url: '/time-management',
            icon: Clock,
          },
          {
            title: 'Admin Schedule',
            url: '/admin-schedule',
            icon: Calendar,
          },
          {
            title: 'Inventory Management',
            url: '/admin/inventory',
            icon: Package,
          },
          {
            title: 'Mechanic Requests',
            url: '/admin/mechanic-requests',
            icon: UserCheck,
          },
        ];

      case 'council':
        return [
          ...baseItems,
          {
            title: 'AI Assistants',
            url: '/ai-assistants',
            icon: Bot,
          },
          {
            title: 'Vehicles',
            url: '/vehicles',
            icon: Truck,
          },
          {
            title: 'Drivers',
            url: '/drivers',
            icon: Users,
          },
          {
            title: 'Mechanics',
            url: '/mechanics',
            icon: Wrench,
          },
          {
            title: 'Jobs',
            url: '/jobs',
            icon: MapPin,
          },
          {
            title: 'Incidents',
            url: '/incidents',
            icon: AlertTriangle,
          },
          {
            title: 'Licenses',
            url: '/licenses',
            icon: Shield,
          },
          {
            title: 'Documents',
            url: '/documents',
            icon: FileText,
          },
          {
            title: 'Time Management',
            url: '/time-management',
            icon: Clock,
          },
          {
            title: 'Admin Schedule',
            url: '/admin-schedule',
            icon: Calendar,
          },
          {
            title: 'Inventory Management',
            url: '/admin/inventory',
            icon: Package,
          },
          {
            title: 'Mechanic Requests',
            url: '/admin/mechanic-requests',
            icon: UserCheck,
          },
        ];

      case 'driver':
        return [
          ...baseItems,
          {
            title: 'My Jobs',
            url: '/driver-jobs',
            icon: MapPin,
          },
          {
            title: 'My Schedule',
            url: '/driver-schedule',
            icon: Calendar,
          },
          {
            title: 'Incident Reports',
            url: '/driver-incidents',
            icon: AlertTriangle,
          },
          {
            title: 'Time Management',
            url: '/time-management',
            icon: Clock,
          },
          {
            title: 'Driver Compliance',
            url: '/driver-compliance',
            icon: UserCheck,
          },
          {
            title: 'Documents',
            url: '/documents',
            icon: FileText,
          },
        ];

      case 'mechanic':
        return [
          {
            title: 'Dashboard',
            url: '/mechanic-dashboard',
            icon: LayoutDashboard,
          },
          {
            title: 'Work Orders',
            url: '/work-orders',
            icon: Wrench,
          },
          {
            title: 'Vehicle Inspections',
            url: '/vehicles',
            icon: Truck,
          },
          {
            title: 'Defect Reports',
            url: '/defect-reports',
            icon: AlertTriangle,
          },
          {
            title: 'Parts Inventory',
            url: '/inventory',
            icon: Package,
          },
          {
            title: 'My Schedule',
            url: '/mechanics?tab=schedule',
            icon: Calendar,
          },
          {
            title: 'Time Tracking',
            url: '/time-management',
            icon: Clock,
          },
          {
            title: 'Documents',
            url: '/documents',
            icon: FileText,
          },
        ];

      case 'parent':
        return [
          ...baseItems,
          {
            title: 'Live Tracking',
            url: '/dashboard?tab=tracking',
            icon: Navigation,
          },
          {
            title: 'My Children',
            url: '/children',
            icon: Users,
          },
          {
            title: 'Transport Schedule',
            url: '/schedule',
            icon: Calendar,
          },
          {
            title: 'Messages',
            url: '/messages',
            icon: MessageSquare,
          },
          {
            title: 'Notifications',
            url: '/notifications',
            icon: Bell,
          },
          {
            title: 'Emergency Contact',
            url: '/emergency',
            icon: Phone,
          },
          {
            title: 'School Info',
            url: '/school-info',
            icon: BookOpen,
          },
        ];

      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <Sidebar className="w-64 md:w-64 transition-all duration-300 data-[state=collapsed]:w-16"
      collapsible="icon"
    >
      <SidebarHeader className="p-2 md:p-4 border-b">
        <Link to="/dashboard" className="flex items-center space-x-3 group-data-[collapsible=icon]:justify-center">
          <img 
            src="/lovable-uploads/c7fc78b4-c136-43b3-b47e-00e97017921c.png" 
            alt="LSR Logistics Logo" 
            className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0"
          />
          <div className="group-data-[collapsible=icon]:hidden min-w-0">
            <span className="text-lg md:text-xl font-bold text-red-600 truncate block">LSR</span>
            <p className="text-xs text-gray-500 truncate">Logistics Solution Resources</p>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="overflow-y-auto">
        {/* User Profile Section */}
        {profile && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex items-center space-x-3 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg mx-2 mb-4 group-data-[collapsible=icon]:mx-1 group-data-[collapsible=icon]:p-2">
                <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                  <AvatarImage src={profile?.avatar_url || ''} alt={getFullName()} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-xs md:text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">{getFullName()}</p>
                  <p className="text-xs text-gray-600 capitalize">{profile.role}</p>
                  {profile.role === 'parent' && (
                    <p className="text-xs text-green-600 font-medium">2 Children Enrolled</p>
                  )}
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 md:px-4 text-gray-600 font-medium text-xs md:text-sm group-data-[collapsible=icon]:hidden">
            {profile?.role === 'parent' ? 'School Transport' : 
             profile?.role === 'mechanic' ? 'Maintenance Hub' : 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url.split('?')[0] || location.pathname + location.search === item.url}
                    className="h-10 w-full justify-start hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <Link to={item.url} className="flex items-center space-x-3 w-full">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin-Only Section */}
        <AdminOnly>
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 md:px-4 text-red-600 font-medium text-xs md:text-sm group-data-[collapsible=icon]:hidden">
              Fleet Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === '/admin/tire-management'}
                    className="h-10 w-full justify-start hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <Link to="/admin/tire-management" className="flex items-center space-x-3 w-full">
                      <CircleDot className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">Tire Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === '/admin/infringement-management'}
                    className="h-10 w-full justify-start hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <Link to="/admin/infringement-management" className="flex items-center space-x-3 w-full">
                      <Scale className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">Infringement Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="h-10 w-full justify-start hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <Link to="/fuel-management" className="flex items-center space-x-3 w-full">
                      <Fuel className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">Fuel Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 md:px-4 text-red-600 font-medium text-xs md:text-sm group-data-[collapsible=icon]:hidden">
              Admin Controls
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === '/routes'}
                    className="h-10 w-full justify-start hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <Link to="/routes" className="flex items-center space-x-3 w-full">
                      <MapPin className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">Routes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === '/staff'}
                    className="h-10 w-full justify-start hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <Link to="/staff" className="flex items-center space-x-3 w-full">
                      <Users className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">Staff Directory</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === '/subscriptions'}
                    className="h-10 w-full justify-start hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <Link to="/subscriptions" className="flex items-center space-x-3 w-full">
                      <Settings className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">Subscriptions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </AdminOnly>

        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 md:px-4 text-gray-600 font-medium text-xs md:text-sm group-data-[collapsible=icon]:hidden">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === '/profile'}
                  className="h-10 w-full justify-start hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <Link to="/profile" className="flex items-center space-x-3 w-full">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === '/settings'}
                  className="h-10 w-full justify-start hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <Link to="/settings" className="flex items-center space-x-3 w-full">
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === '/data-protection'}
                  className="h-10 w-full justify-start hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <Link to="/data-protection" className="flex items-center space-x-3 w-full">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Privacy</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sign Out Footer */}
      <SidebarFooter className="p-2 md:p-4 border-t">
        <Button 
          onClick={handleSignOut}
          variant="outline"
          className="w-full flex items-center justify-center md:justify-start space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-10"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
