import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Clock, 
  Bell, 
  Users, 
  Car, 
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Settings,
  RefreshCw,
  Loader2,
  Home,
  Navigation
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useParentData, type Child, type ParentNotification } from '@/hooks/useParentData';
import ResponsiveScaffold from './ResponsiveScaffold';
import MobileForm from './MobileForm';

const MobileParentDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use the custom hook to fetch data from backend
  const {
    children,
    notifications,
    stats,
    isLoading,
    childrenError,
    notificationsError,
    markNotificationRead,
    refreshAllData,
    getChildStatus
  } = useParentData();

  const typedChildren = children as Child[];

  const getStatusColor = (status: 'on_route' | 'at_school' | 'at_home' | 'pickup_scheduled') => {
    switch (status) {
      case 'on_route': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'at_school': return 'text-green-600 bg-green-50 border-green-200';
      case 'at_home': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'pickup_scheduled': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: 'on_route' | 'at_school' | 'at_home' | 'pickup_scheduled') => {
    switch (status) {
      case 'on_route': return 'On Route';
      case 'at_school': return 'At School';
      case 'at_home': return 'At Home';
      case 'pickup_scheduled': return 'Pickup Scheduled';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: 'on_route' | 'at_school' | 'at_home' | 'pickup_scheduled') => {
    switch (status) {
      case 'on_route': return <Car className="w-4 h-4" />;
      case 'at_school': return <CheckCircle className="w-4 h-4" />;
      case 'at_home': return <Users className="w-4 h-4" />;
      case 'pickup_scheduled': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    markNotificationRead.mutate(notificationId);
  };

  // Show loading state
  if (isLoading) {
    return (
      <ResponsiveScaffold className="bg-gradient-to-br from-violet-50 via-blue-50 via-cyan-50 via-emerald-50 to-teal-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </ResponsiveScaffold>
    );
  }

  // Show error state
  if (childrenError || notificationsError) {
    return (
      <ResponsiveScaffold className="bg-gradient-to-br from-violet-50 via-blue-50 via-cyan-50 via-emerald-50 to-teal-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load dashboard data. Please try again.</p>
            <Button onClick={refreshAllData} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </ResponsiveScaffold>
    );
  }

  return (
    <ResponsiveScaffold
      className="bg-gradient-to-br from-violet-50 via-blue-50 via-cyan-50 via-emerald-50 to-teal-50 relative overflow-hidden"
      scrollable={true}
      padding="medium"
    >
      {/* Animated background elements to match landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '6s' }}></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>
              {/* Header */}
        <div className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mobile-text-xl">Parent Dashboard</h1>
            <p className="text-gray-600 mt-1 mobile-text-responsive">
              Welcome back, {profile?.first_name || 'Parent'}! Here's what's happening with your children today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={refreshAllData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Welcome Card */}
        <Card className="mobile-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Home className="w-5 h-5 text-blue-600" />
              <span>Welcome Back!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You have {typedChildren.length} children registered for transport services. 
              {typedChildren.length > 0 && ` ${typedChildren.filter(child => getChildStatus(child.id) === 'on_route').length} are currently on route.`}
            </p>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mobile-tabs">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Overview</TabsTrigger>
            <TabsTrigger value="tracking" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Tracking</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Alerts ({stats.unreadNotifications})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Children</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalChildren}</div>
                  <p className="text-xs text-muted-foreground">Active registrations</p>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Route</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.childrenOnRoute}</div>
                  <p className="text-xs text-muted-foreground">Currently traveling</p>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unreadNotifications}</div>
                  <p className="text-xs text-muted-foreground">Unread messages</p>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Pickups</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todaysPickups}</div>
                  <p className="text-xs text-muted-foreground">Scheduled today</p>
                </CardContent>
              </Card>
            </div>

            {/* Children Status */}
            <Card className="mobile-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Children Status</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mobile-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Manage Children
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {typedChildren.map((child) => {
                    const childStatus = getChildStatus(child.id);
                    const age = child.date_of_birth ? 
                      new Date().getFullYear() - new Date(child.date_of_birth).getFullYear() : 
                      'N/A';
                    
                    return (
                      <div key={child.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold mobile-text-responsive">{child.first_name} {child.last_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {child.grade_level || 'N/A'} • Age {age}
                            </p>
                            {child.pickup_location && (
                              <p className="text-xs text-muted-foreground">
                                Pickup: {child.pickup_location}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(childStatus)}
                          >
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(childStatus)}
                              <span className="text-xs">{getStatusText(childStatus)}</span>
                            </div>
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start mobile-button"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  View Attendance
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start mobile-button"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Changes
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start mobile-button"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Driver
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  <span>Live Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {typedChildren.map((child) => {
                    const childStatus = getChildStatus(child.id);
                    return (
                      <div key={child.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold mobile-text-responsive">{child.first_name} {child.last_name}</h3>
                            <p className="text-sm text-muted-foreground">{child.school_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(childStatus)}
                          >
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(childStatus)}
                              <span className="text-xs">{getStatusText(childStatus)}</span>
                            </div>
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            ETA: {childStatus === 'on_route' ? '15 min' : 'N/A'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <span>Recent Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mobile-text-responsive">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkNotificationRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveScaffold>
  );
};

export default MobileParentDashboard;
