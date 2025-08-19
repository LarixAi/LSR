import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useParentData, type Child, type ParentNotification } from '@/hooks/useParentData';

// Import parent components
import ParentWelcomeCard from '@/components/parent/ParentWelcomeCard';
import ParentRouteTracker from '@/components/parent/ParentRouteTracker';
import ParentCommunicationCenter from '@/components/parent/ParentCommunicationCenter';
import ParentNotificationCenter from '@/components/parent/NotificationCenter';
import ChildManagementDialog from '@/components/parent/ChildManagementDialog';
import DailyAttendanceDialog from '@/components/parent/DailyAttendanceDialog';
import ParentBookingRequest from '@/components/parent/ParentBookingRequest';
import WeeklySchedule from '@/components/parent/WeeklySchedule';
import EmergencyContacts from '@/components/parent/EmergencyContacts';

// Child and Notification interfaces are now imported from useParentData hook

const ParentDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // SECURITY CHECK: Verify user is a parent
  if (profile?.role !== 'parent') {
    return <Navigate to="/dashboard" replace />;
  }
  
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

  // Explicitly type children to fix TypeScript errors
  const typedChildren = children as Child[];

  const [showChildManagement, setShowChildManagement] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (childrenError || notificationsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data. Please try again.</p>
          <Button onClick={refreshAllData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
            <p className="text-gray-600 mt-1">
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
        <ParentWelcomeCard />

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="notifications">Notifications ({stats.unreadNotifications})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Children</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalChildren}</div>
                  <p className="text-xs text-muted-foreground">Active registrations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Route</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.childrenOnRoute}</div>
                  <p className="text-xs text-muted-foreground">Currently traveling</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unreadNotifications}</div>
                  <p className="text-xs text-muted-foreground">Unread messages</p>
                </CardContent>
              </Card>

              <Card>
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Children Status</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowChildManagement(true)}
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
                            <h3 className="font-semibold">{child.first_name} {child.last_name}</h3>
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
                              <span>{getStatusText(childStatus)}</span>
                            </div>
                          </Badge>
                          <Button variant="ghost" size="sm">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowAttendance(true)}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    View Attendance
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowBooking(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Booking
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('communication')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Transport
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Recent Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => handleMarkNotificationRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => setActiveTab('notifications')}
                  >
                    View All Notifications
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Today's Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {typedChildren.map((child) => (
                      <div key={child.id} className="space-y-2">
                        <h4 className="font-medium text-sm">{child.first_name} {child.last_name}</h4>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Pickup:</span>
                            <span className="font-medium">{child.pickup_time || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Dropoff:</span>
                            <span className="font-medium">{child.dropoff_time || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <ParentRouteTracker />
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <WeeklySchedule />
          </TabsContent>

          {/* Emergency Contacts Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <EmergencyContacts />
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <ParentCommunicationCenter />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <ParentNotificationCenter />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {showChildManagement && <ChildManagementDialog />}
        {showAttendance && <DailyAttendanceDialog />}
        {showBooking && <ParentBookingRequest />}
      </div>
    </div>
  );
};

export default ParentDashboard;