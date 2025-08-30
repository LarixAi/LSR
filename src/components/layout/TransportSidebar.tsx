import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Users,
  Truck,
  FileText,
  Settings,
  MapPin,
  AlertTriangle,
  Fuel,
  HelpCircle,
  Bell,
  Package,
  ClipboardList,
  Zap,
  UserCheck,
  CircleCheck,
  ChevronRight,
  MoreHorizontal,
  Wrench,
  Clock,
  FileCheck,
  ArrowUpRight,
  Calendar,
  School,
  Train,
  Briefcase,
  DollarSign,
  Shield,
  ClipboardCheck,
  CheckSquare,
  AlertCircle,
  Mail,
  Warehouse,
  BarChart,
  Activity,
  Bot,
  Ticket,
  BookOpen,
  Code,
  Cloud,
  TrendingUp,
  Route,
  LayoutDashboard,
  MessageSquare,
  Building2,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TransportSidebar = () => {
  const { profile, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error && !error.message?.includes('session')) {
        toast({
          title: 'Error',
          description: 'Failed to sign out',
          variant: 'destructive',
        });
      } else {
        navigate('/auth');
      }
    } catch (err) {
      navigate('/auth');
    }
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const getUserName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`.toLowerCase();
    }
    return user?.email?.split('@')[0] || 'user';
  };

  // Organized navigation items with collapsible groups - UPDATED TO MATCH ACTUAL ROUTES
  const navigationItems = [
    { title: 'Dashboard', icon: LayoutDashboard, url: '/dashboard' },
    { title: 'Fleet Overview', icon: Truck, url: '/fleet-management' },
    
    // Fleet Management Group
    {
      title: 'Fleet Management',
      icon: Truck,
      hasArrow: true,
      items: [
        { title: 'Vehicles', url: '/vehicles', icon: Truck },
        { title: 'Drivers', url: '/drivers', icon: Users },
        { title: 'Mechanics', url: '/mechanics', icon: Wrench },
        { title: 'Tire Management', url: '/admin/tire-management', icon: Settings },
        { title: 'Fuel Management', url: '/fuel-management', icon: Fuel },
        { title: 'Defect Reports', url: '/defect-reports', icon: AlertTriangle },
        { title: 'Parts & Supplies', url: '/parts-supplies', icon: Package },
        { title: 'Work Orders', url: '/work-orders', icon: ClipboardList },
      ]
    },
    
    // Operations Group
    {
      title: 'Operations',
      icon: Route,
      hasArrow: true,
      items: [
        { title: 'Jobs', url: '/jobs', icon: Briefcase },
        { title: 'Schedule', url: '/schedule', icon: Calendar },
        { title: 'Route Planning', url: '/route-planning', icon: MapPin },
        { title: 'School Routes', url: '/school-routes', icon: School },
        { title: 'Rail Replacement', url: '/rail-replacement', icon: Train },
        { title: 'Personal Assistants', url: '/personal-assistants', icon: Users },
        { title: 'Time Management', url: '/time-management', icon: Clock },
      ]
    },
    
    // Finance Group
    {
      title: 'Finance',
      icon: DollarSign,
      hasArrow: true,
      items: [
        { title: 'Invoice Management', url: '/invoice-management', icon: FileText },
        { title: 'Quotation Management', url: '/quotation-management', icon: FileText },
        { title: 'Inventory Management', url: '/inventory-management', icon: Package },
        { title: 'Subscriptions', url: '/subscriptions', icon: DollarSign },
      ]
    },
    
    // Compliance Group
    {
      title: 'Compliance',
      icon: Shield,
      hasArrow: true,
      items: [
        { title: 'Compliance Dashboard', url: '/compliance-dashboard', icon: Shield },
        { title: 'Infringement Management', url: '/admin/infringement-management', icon: AlertTriangle },
        { title: 'Tachograph Manager', url: '/tachograph-manager', icon: Activity },
        { title: 'Inspections', url: '/inspections', icon: ClipboardCheck },
        { title: 'Vehicle Check Questions', url: '/vehicle-check-questions', icon: CheckSquare },
        { title: 'Licenses', url: '/licenses', icon: FileText },
      
        { title: 'Incident Reports', url: '/incident-reports', icon: AlertTriangle },
      ]
    },
    
    // Communication Group
    {
      title: 'Communication',
      icon: MessageSquare,
      hasArrow: true,
      items: [
        { title: 'Email Management', url: '/email-management', icon: Mail },
        { title: 'Advanced Notifications', url: '/notifications', icon: Bell },
        { title: 'Support Tickets', url: '/support-tickets', icon: Ticket },

      ]
    },
    
    // Reports Group
    {
      title: 'Reports',
      icon: BarChart,
      hasArrow: true,
      items: [
        { title: 'Fleet Reports', url: '/fleet-reports', icon: BarChart },
        { title: 'Compliance Reports', url: '/compliance-reports', icon: FileText },
        { title: 'Analytics', url: '/analytics', icon: Activity },
        { title: 'System Diagnostic', url: '/system-diagnostic', icon: Activity },
      ]
    },
    
    // Support & Tools
    {
      title: 'Support & Tools',
      icon: HelpCircle,
      hasArrow: true,
      items: [
        { title: 'AI Assistants', url: '/ai-assistants', icon: Bot },
        { title: 'Help & Documentation', url: '/help-documentation', icon: BookOpen },
        { title: 'Staff Directory', url: '/staff-directory', icon: Users },
        { title: 'API Management', url: '/api-management', icon: Code },
        { title: 'Documents', url: '/documents', icon: FileText },
        { title: 'Admin Driver Documents', url: '/admin-driver-documents', icon: FileText },
      ]
    },
  ];

  const isActiveRoute = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  return (
    <Sidebar 
      className="bg-sidebar text-sidebar-foreground border-0"
    >
      <SidebarHeader className="px-4 py-3 border-b border-sidebar-border">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-semibold">Logistics Solution Resources</span>
              <ChevronRight className="h-4 w-4 text-sidebar-accent-foreground" />
            </div>
            <div className="text-sm text-sidebar-accent-foreground">{getUserName()}</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isExpanded = expandedItems.has(item.title);
                const hasSubItems = item.items && item.items.length > 0;
                const isActive = item.url ? isActiveRoute(item.url) : false;
                
                if (hasSubItems) {
                  // Render group with sub-items
                  return (
                    <SidebarMenuItem key={item.title}>
                      <div>
                        <button
                          onClick={() => toggleExpanded(item.title)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent",
                            isExpanded && "bg-sidebar-accent/50"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0 text-sidebar-accent-foreground" />
                          <span className="flex-1 text-sm text-left">{item.title}</span>
                          <ChevronRight className={cn(
                            "h-3 w-3 text-sidebar-accent-foreground transition-transform",
                            isExpanded && "rotate-90"
                          )} />
                        </button>
                        
                        {isExpanded && (
                          <div className="ml-3 pl-3 mt-1 border-l border-sidebar-border">
                            {item.items.map((subItem) => {
                              const isSubActive = isActiveRoute(subItem.url);
                              return (
                                <Link
                                  key={subItem.title}
                                  to={subItem.url}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent",
                                    isSubActive && "bg-sidebar-accent"
                                  )}
                                >
                                  <subItem.icon className={cn(
                                    "h-3.5 w-3.5 shrink-0",
                                    isSubActive ? "text-sidebar-foreground" : "text-sidebar-accent-foreground"
                                  )} />
                                  <span className="text-sm">{subItem.title}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </SidebarMenuItem>
                  );
                } else {
                  // Render single item
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent",
                          isActive && "bg-sidebar-accent"
                        )}
                      >
                        <Link to={item.url} className="flex items-center gap-3 w-full">
                          <item.icon className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-sidebar-foreground" : "text-sidebar-accent-foreground"
                          )} />
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 mt-auto">
        <div className="space-y-1">
          <SidebarMenuButton
            asChild
            className="text-sidebar-foreground hover:bg-sidebar-accent rounded-lg px-3 py-2"
          >
            <Link to="/settings" className="flex items-center gap-3">
              <Settings className="h-4 w-4 text-sidebar-accent-foreground" />
              <span className="text-sm">Settings</span>
            </Link>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export { TransportSidebar };