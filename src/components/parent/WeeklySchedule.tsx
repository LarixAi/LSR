import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Car, Users, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { useParentSchedules, ParentScheduleItem } from '@/hooks/useParentSchedules';
import { useParentData } from '@/hooks/useParentData';

interface WeeklyScheduleProps {
  className?: string;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ className }) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const { children } = useParentData();
  
  // Get schedule data for the selected week
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Fetch schedule data for each day of the week
  const scheduleData: ParentScheduleItem[][] = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    const { data: daySchedules = [] } = useParentSchedules(dayDate);
    scheduleData.push(daySchedules);
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(direction === 'next' ? addWeeks(selectedWeek, 1) : subWeeks(selectedWeek, 1));
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

  const getTypeIcon = (type: 'pickup' | 'dropoff') => {
    return type === 'pickup' ? <Car className="w-3 h-3" /> : <Users className="w-3 h-3" />;
  };

  const getTypeColor = (type: 'pickup' | 'dropoff') => {
    return type === 'pickup' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'delayed': return 'Delayed';
      default: return 'Scheduled';
    }
  };

  const getScheduleForDay = (dayIndex: number) => {
    return scheduleData[dayIndex] || [];
  };

  const getUniqueChildrenForWeek = () => {
    const allSchedules = scheduleData.flat();
    const childNames = [...new Set(allSchedules.map(schedule => schedule.childName))];
    return childNames;
  };

  const getChildSchedulesForDay = (dayIndex: number, childName: string) => {
    return getScheduleForDay(dayIndex).filter(schedule => schedule.childName === childName);
  };

  const uniqueChildren = getUniqueChildrenForWeek();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Weekly Schedule</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(new Date())}
              >
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Weekly Calendar View */}
      <Card>
        <CardContent className="p-6">
          {uniqueChildren.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Data</h3>
              <p className="text-gray-600 mb-4">
                No children are assigned to routes for this week.
              </p>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Children to Routes
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-4 border-b pb-4">
                {weekDays.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-sm font-medium ${
                      isToday(day) ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-lg font-bold ${
                      isToday(day) ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Children Schedule Rows */}
              {uniqueChildren.map((childName) => (
                <div key={childName} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 text-gray-900">
                    {childName}
                  </h3>
                  <div className="grid grid-cols-7 gap-4">
                    {weekDays.map((day, dayIndex) => {
                      const daySchedules = getChildSchedulesForDay(dayIndex, childName);
                      
                      return (
                        <div key={dayIndex} className="min-h-[120px]">
                          {daySchedules.length === 0 ? (
                            <div className="text-center text-gray-400 text-xs py-8">
                              No schedule
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {daySchedules.map((schedule) => (
                                <div
                                  key={schedule.id}
                                  className={`p-2 rounded-lg border text-xs ${
                                    getTypeColor(schedule.type)
                                  }`}
                                >
                                  <div className="flex items-center space-x-1 mb-1">
                                    {getTypeIcon(schedule.type)}
                                    <span className="font-medium">
                                      {schedule.type === 'pickup' ? 'Pickup' : 'Dropoff'}
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{formatTime(schedule.time)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="w-3 h-3" />
                                      <span className="truncate" title={schedule.location}>
                                        {schedule.location}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {schedule.driverName}
                                    </div>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getStatusColor(schedule.status)}`}
                                    >
                                      {getStatusText(schedule.status)}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Trips This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduleData.flat().length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pickups and dropoffs combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Children with Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uniqueChildren.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {scheduleData.flat().filter(s => s.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklySchedule;
