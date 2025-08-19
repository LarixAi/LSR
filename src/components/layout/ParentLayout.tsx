import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MapPin, 
  Bell, 
  MessageSquare, 
  Users, 
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Car,
  Phone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ParentLayout = () => {
  const { signOut, profile } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/parent-dashboard', icon: Home },
    { name: 'Live Tracking', href: '/parent-tracking', icon: MapPin },
    { name: 'Schedule', href: '/parent-schedule', icon: Calendar },
    { name: 'Children', href: '/parent-children', icon: Users },
    { name: 'Communication', href: '/parent-communication', icon: MessageSquare },
    { name: 'Notifications', href: '/parent-notifications', icon: Bell },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Parent Portal</h1>
                <p className="text-xs text-gray-500">Transport Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.email}
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  Parent
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">
                  Welcome back, {profile?.first_name || 'Parent'}!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Emergency Contact
              </Button>
              
              {/* Notifications */}
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
