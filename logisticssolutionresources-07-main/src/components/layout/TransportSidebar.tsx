import React, { useState } from 'react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Wrench,
  LogOut,
  CheckSquare,
  TrendingUp,
  BarChart3,
  Route,
  Briefcase,
  Building2,
  Activity,
  Database,
  Network,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Mail,
  CircleDot,
  Scale,
  Fuel
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const TransportSidebar = () => {
  const { profile, user } = useAuth();
  const { isAdmin, hasAdminPrivileges } = useAdminAccess();
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Only show error if it's not a session-related issue
      if (error && !error.message?.includes('session')) {
        toast({
          title: 'Error',
          description: 'Failed to sign out',
          variant: 'destructive',
        });
      } else {
        // Success or session-related issue (which is okay)
        navigate('/auth');
      }
    } catch (err) {
      // Always navigate even on error to prevent being stuck
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

  // Transport-focused navigation based on role
  const getNavigationSections = () => {
    if (!profile) return [];

    const baseOverview = [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        description: 'Main overview'
      }
    ];

    switch (profile.role) {
      case 'admin':
      case 'council':
        return [
          {
            title: 'Overview',
            items: [
              ...baseOverview,
              {
                title: 'Analytics',
                url: '/analytics',
                icon: TrendingUp,
                description: 'Performance metrics'
              }
            ]
          },
          {
            title: 'Fleet Management',
            items: [
              {
                title: 'Vehicles',
                url: '/vehicles',
                icon: Truck,
                description: 'Fleet management',
                badge: { text: 'MOT Due', variant: 'destructive' } // Example badge
              },
              {
                title: 'Drivers',
                url: '/drivers',
                icon: Users,
                description: 'Driver management'
              },
              {
                title: 'Mechanics',
                url: '/mechanics',
                icon: Wrench,
                description: 'Maintenance staff'
              },
              {
                title: 'Tire Management',
                url: '/admin/tire-management',
                icon: CircleDot,
                description: 'Tire inventory and tracking'
              },
              {
                title: 'Infringement Management',
                url: '/admin/infringement-management',
                icon: Scale,
                description: 'Driver infringement tracking'
              },
              {
                title: 'Fuel Management',
                url: '/fuel-management',
                icon: Fuel,
                description: 'Fuel tracking and analytics'
              }
            ]
          },
          {
            title: 'Operations',
            items: [
              {
                title: 'Jobs',
                url: '/jobs',
                icon: Briefcase,
                description: 'Job assignments'
              },
              {
                title: 'Schedule',
                url: '/admin-schedule',
                icon: Calendar,
                description: 'Resource scheduling'
              },
              {
                title: 'Routes',
                url: '/routes',
                icon: Route,
                description: 'Route management'
              },
              {
                title: 'Route Planning',
                url: '/admin/route-management',
                icon: MapPin,
                description: 'Advanced route planning & pricing'
              }
            ]
          },
          {
            title: 'Financial',
            items: [
              {
                title: 'Invoice Management',
                url: '/admin/invoices',
                icon: FileText,
                description: 'Create and manage invoices'
              },
              {
                title: 'Quotation Management',
                url: '/admin/quotations',
                icon: DollarSign,
                description: 'View and manage customer quotations'
              }
            ]
          },
          {
            title: 'Communication',
            items: [
              {
                title: 'Email Management',
                url: '/admin/emails',
                icon: Mail,
                description: 'Send emails and manage templates'
              }
            ]
          },
          {
            title: 'Compliance',
            items: [
              {
                title: 'Compliance Dashboard',
                url: '/admin/compliance-dashboard',
                icon: Activity,
                description: 'Real-time compliance monitoring'
              },
              {
                title: 'Tachograph Manager',
                url: '/admin/tachograph-management',
                icon: Clock,
                description: 'Digital & analogue tachograph management'
              },
              {
                title: 'Inspections',
                url: '/compliance',
                icon: CheckSquare,
                description: 'Vehicle inspections'
              },
              {
                title: 'Smart Inspections',
                url: '/vehicle-inspections',
                icon: CheckSquare,
                description: 'Advanced inspection system'
              },
              {
                title: 'Licenses',
                url: '/licenses',
                icon: Shield,
                description: 'License tracking'
              },
              {
                title: 'Documents',
                url: '/documents',
                icon: FileText,
                description: 'Document management'
              },
              {
                title: 'Incidents',
                url: '/incident-reports',
                icon: AlertTriangle,
                description: 'Incident reports'
              }
            ]
          },
          {
            title: 'Reports',
            items: [
              {
                title: 'Fleet Reports',
                url: '/reports/fleet',
                icon: BarChart3,
                description: 'Fleet analytics'
              },
              {
                title: 'Compliance Reports',
                url: '/reports/compliance',
                icon: Shield,
                description: 'Compliance analytics'
              }
            ]
          }
        ];

      case 'driver':
        return [
          {
            title: 'My Dashboard',
            items: baseOverview
          },
          {
            title: 'My Work',
            items: [
              {
                title: 'My Jobs',
                url: '/driver-jobs',
                icon: Briefcase,
                description: 'Current assignments'
              },
              {
                title: 'My Schedule',
                url: '/driver-schedule',
                icon: Calendar,
                description: 'Today\'s schedule'
              },
              {
                title: 'Time Clock',
                url: '/time-management',
                icon: Clock,
                description: 'Clock in/out'
              }
            ]
          },
          {
            title: 'Vehicle & Compliance',
            items: [
              {
                title: 'Vehicle Checks',
                url: '/driver/vehicle-checks',
                icon: CheckSquare,
                description: 'Daily inspections'
              },
              {
                title: 'Vehicle Inspections',
                url: '/vehicle-inspections',
                icon: CheckSquare,
                description: 'Smart inspection system'
              },
              {
                title: 'My Compliance',
                url: '/driver-compliance',
                icon: Shield,
                description: 'License status'
              },
              {
                title: 'Documents',
                url: '/driver/documents',
                icon: FileText,
                description: 'My documents'
              },
              {
                title: 'Fuel System',
                url: '/driver/fuel',
                icon: Fuel,
                description: 'Record fuel purchases'
              }
            ]
          }
        ];

      case 'parent':
        return [
          {
            title: 'My Family',
            items: [
              ...baseOverview,
              {
                title: 'Parent Dashboard',
                url: '/parent-dashboard',
                icon: LayoutDashboard,
                description: 'Track your children\'s transportation'
              },
              {
                title: 'Child Management',
                url: '/child-management',
                icon: Users,
                description: 'Manage children information'
              }
            ]
          },
          {
            title: 'Transportation',
            items: [
              {
                title: 'Live Tracking',
                url: '/live-tracking',
                icon: MapPin,
                description: 'Track bus in real-time'
              },
              {
                title: 'Notifications',
                url: '/parent-notifications',
                icon: CheckSquare,
                description: 'Important updates'
              },
              {
                title: 'Schedule',
                url: '/parent-schedule',
                icon: Calendar,
                description: 'Transport timetable'
              }
            ]
          }
        ];

      case 'mechanic':
        return [
          {
            title: 'Workshop',
            items: [
              ...baseOverview,
              {
                title: 'Work Orders',
                url: '/work-orders',
                icon: Wrench,
                description: 'Assigned tasks'
              }
            ]
          },
          {
            title: 'Inspections',
            items: [
              {
                title: 'Vehicle Inspections',
                url: '/vehicle-inspections',
                icon: CheckSquare,
                description: 'Inspection reports'
              },
              {
                title: 'Defect Reports',
                url: '/defects',
                icon: AlertTriangle,
                description: 'Defect tracking'
              }
            ]
          },
          {
            title: 'Inventory',
            items: [
              {
                title: 'Parts & Supplies',
                url: '/inventory',
                icon: FileText,
                description: 'Parts management'
              }
            ]
          }
        ];

      default:
        return [{ title: 'Overview', items: baseOverview }];
    }
  };

  const navigationSections = getNavigationSections();

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const isCurrentSectionActive = (items: any[]) => {
    return items.some(item => location.pathname === item.url.split('?')[0]);
  };

  return (
    <Sidebar 
      className="border-r"
      collapsible="offcanvas"
    >
      <SidebarHeader className="p-3 border-b border-border/50">
        <Link to="/dashboard" className="flex items-center space-x-2 group-data-[collapsible=icon]:justify-center">
          <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-foreground">TransManager</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto py-2">
        {/* User Profile Section - Compact */}
        {profile && (
          <div className="px-2 mb-3">
            <div className="flex items-center space-x-2 p-2 bg-accent/30 rounded-lg group-data-[collapsible=icon]:px-1">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarImage src={profile?.avatar_url || ''} alt={getFullName()} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-medium text-foreground truncate">{getFullName()}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Sections with Dropdowns */}
        <div className="space-y-1 px-2">
          {navigationSections.map((section) => {
            const isOpen = openSections[section.title] ?? isCurrentSectionActive(section.items);
            const hasActiveItem = isCurrentSectionActive(section.items);
            
            return (
              <Collapsible key={section.title} open={isOpen} onOpenChange={() => toggleSection(section.title)}>
                <CollapsibleTrigger asChild>
                  <button className={`
                    w-full flex items-center justify-between px-2 py-2 rounded-md text-left transition-colors
                    ${hasActiveItem ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50 text-foreground'}
                    group-data-[collapsible=icon]:justify-center
                  `}>
                    <span className="text-xs font-medium group-data-[collapsible=icon]:hidden">{section.title}</span>
                    <div className="group-data-[collapsible=icon]:hidden">
                      {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-0.5 mt-1 group-data-[collapsible=icon]:hidden">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.url.split('?')[0];
                    return (
                      <Link
                        key={item.title}
                        to={item.url}
                        className={`
                          flex items-center space-x-2 px-3 py-1.5 ml-2 rounded-md transition-colors text-xs
                          ${isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge variant={item.badge.variant as any} className="text-xs h-4">
                            {item.badge.text}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Admin & Account Quick Links */}
        <div className="mt-4 px-2 space-y-1">
          <AdminOnly>
            <div className="space-y-0.5">
              <Link 
                to="/staff-directory" 
                className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                  location.pathname === '/staff-directory' ? 'bg-orange-100 text-orange-700' : 'hover:bg-accent text-muted-foreground'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="group-data-[collapsible=icon]:hidden">Staff Directory</span>
              </Link>
              <Link 
                to="/admin/api-management" 
                className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                  location.pathname === '/admin/api-management' ? 'bg-orange-100 text-orange-700' : 'hover:bg-accent text-muted-foreground'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span className="group-data-[collapsible=icon]:hidden">API Management</span>
              </Link>
            </div>
          </AdminOnly>
          
          <div className="border-t pt-2 space-y-0.5">
            <Link 
              to="/profile" 
              className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                location.pathname === '/profile' ? 'bg-accent text-foreground' : 'hover:bg-accent text-muted-foreground'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="group-data-[collapsible=icon]:hidden">Profile</span>
            </Link>
            <Link 
              to="/settings" 
              className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                location.pathname === '/settings' ? 'bg-accent text-foreground' : 'hover:bg-accent text-muted-foreground'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </Link>
          </div>
        </div>
      </SidebarContent>

      {/* Sign Out Footer */}
      <SidebarFooter className="p-2 border-t border-border/50">
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center space-x-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 h-8 text-xs"
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export { TransportSidebar };