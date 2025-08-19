import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Car, Phone } from 'lucide-react';
import { useParentSchedules, useParentScheduleStats, ParentScheduleItem } from '@/hooks/useParentSchedules';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ParentSchedule = () => {
  const { user, profile, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch real data from backend
  const { data: scheduleItems = [], isLoading: schedulesLoading, error: schedulesError } = useParentSchedules(selectedDate);
  const stats = useParentScheduleStats(selectedDate);

  if (loading || schedulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading schedule...</p>
        </div>
      </div>
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-1">
            View and manage your children's transport schedule
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Export Schedule
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrips}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
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

        <Card>
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

        <Card>
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

      {/* Schedule List */}
      <Card>
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
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(item.type)} bg-opacity-10`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{item.childName}</h3>
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
                          <span>{item.location}</span>
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
                      {getStatusText(item.status)}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center">
                <div className="font-medium text-sm mb-2">{day}</div>
                <div className="space-y-1">
                  {scheduleItems.slice(0, 2).map((item) => (
                    <div key={`${day}-${item.id}`} className="text-xs p-2 bg-gray-100 rounded">
                      <div className="font-medium">{item.childName}</div>
                      <div className="text-gray-600">{formatTime(item.time)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentSchedule;
