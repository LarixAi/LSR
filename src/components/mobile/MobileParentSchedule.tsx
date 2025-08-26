import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Users, Car, Phone, RefreshCw, Loader2 } from 'lucide-react';
import { useParentSchedules, useParentScheduleStats, ParentScheduleItem } from '@/hooks/useParentSchedules';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ResponsiveScaffold from './ResponsiveScaffold';

const MobileParentSchedule = () => {
  const { user, profile, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('today');

  // Fetch real data from backend
  const { data: scheduleItems = [], isLoading: schedulesLoading, error: schedulesError } = useParentSchedules(selectedDate);
  const stats = useParentScheduleStats(selectedDate);

  if (loading || schedulesLoading) {
    return (
      <ResponsiveScaffold className="bg-gradient-to-br from-violet-50 via-blue-50 via-cyan-50 via-emerald-50 to-teal-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading schedule...</p>
          </div>
        </div>
      </ResponsiveScaffold>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only parents can access
  if (profile.role !== 'parent') {
    return <Navigate to="/dashboard" replace />;
  }

  const getStatusColor = (status: ParentScheduleItem['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: ParentScheduleItem['status']) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'delayed': return 'Delayed';
      default: return 'Unknown';
    }
  };

  const getTypeIcon = (type: ParentScheduleItem['type']) => {
    return type === 'pickup' ? <Car className="w-4 h-4" /> : <Users className="w-4 h-4" />;
  };

  const getTypeColor = (type: ParentScheduleItem['type']) => {
    return type === 'pickup' ? 'text-blue-600' : 'text-green-600';
  };

  const getTypeText = (type: ParentScheduleItem['type']) => {
    return type === 'pickup' ? 'Pickup' : 'Dropoff';
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mobile-text-xl">Schedule</h1>
            <p className="text-gray-600 mt-1 mobile-text-responsive">
              View and manage your children's transport schedule
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Date Selector */}
        <Card className="mobile-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Select Date</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mobile-input"
              />
              <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                Today
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="mobile-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrips}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card className="mobile-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pickups</CardTitle>
              <Car className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.pickups}
              </div>
              <p className="text-xs text-muted-foreground">Morning pickups</p>
            </CardContent>
          </Card>

          <Card className="mobile-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dropoffs</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.dropoffs}
              </div>
              <p className="text-xs text-muted-foreground">Afternoon dropoffs</p>
            </CardContent>
          </Card>

          <Card className="mobile-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completed}
              </div>
              <p className="text-xs text-muted-foreground">Trips completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 mobile-tabs">
            <TabsTrigger value="today" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Today</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Weekly</TabsTrigger>
          </TabsList>

          {/* Today's Schedule Tab */}
          <TabsContent value="today" className="space-y-6">
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {scheduleItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No schedule items for today</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {schedulesError ? 'Error loading schedule data' : 'Your children may not be assigned to any routes today'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduleItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(item.type)} bg-opacity-10`}>
                            {getTypeIcon(item.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold mobile-text-responsive">{item.childName}</h3>
                              <Badge variant="outline" className={getTypeColor(item.type)}>
                                {getTypeText(item.type)}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(item.time)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{item.location}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Driver: {item.driverName} • Vehicle: {item.vehicleNumber}
                              {item.routeName && ` • Route: ${item.routeName}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            <span className="text-xs">{getStatusText(item.status)}</span>
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Schedule Tab */}
          <TabsContent value="weekly" className="space-y-6">
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center">
                      <div className="font-medium text-sm mb-2">{day}</div>
                      <div className="space-y-1">
                        {scheduleItems.slice(0, 2).map((item) => (
                          <div key={`${day}-${item.id}`} className="text-xs p-2 bg-gray-100 rounded">
                            <div className="font-medium truncate">{item.childName}</div>
                            <div className="text-gray-600">{formatTime(item.time)}</div>
                          </div>
                        ))}
                      </div>
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

export default MobileParentSchedule;
