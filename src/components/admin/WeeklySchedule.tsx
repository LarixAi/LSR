
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, AlertTriangle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, addWeeks, subWeeks } from 'date-fns';

const WeeklySchedule = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Get system logs for the week (replacing compliance_violations which doesn't exist)
  const { data: weeklyEvents = [], isLoading } = useQuery({
    queryKey: ['weekly-events', selectedWeek],
    queryFn: async () => {
      const weekStart = startOfWeek(selectedWeek);
      const weekEnd = endOfWeek(selectedWeek);

      // Mock system logs (table doesn't exist yet)
      return [];
    }
  });

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedWeek),
    end: endOfWeek(selectedWeek)
  });

  const getEventsForDay = (day: Date) => {
    return weeklyEvents.filter(event => {
      const eventDate = new Date(event.created_at);
      return eventDate.toDateString() === day.toDateString();
    });
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'user_created':
        return <User className="w-3 h-3" />;
      case 'security_event':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getEventTypeBadge = (eventType: string) => {
    switch (eventType) {
      case 'user_created':
        return 'default';
      case 'security_event':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle>Weekly Schedule</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading schedule...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Weekly Schedule</CardTitle>
                <CardDescription className="text-sm">
                  {format(startOfWeek(selectedWeek), 'MMMM dd')} - {format(endOfWeek(selectedWeek), 'MMMM dd, yyyy')}
                </CardDescription>
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateWeek('prev')}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToCurrentWeek}
                className="px-3"
              >
                Today
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateWeek('next')}
                className="flex items-center space-x-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button size="sm" className="flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Event</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isDayToday = isToday(day);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md min-h-[200px]
                    ${isDayToday 
                      ? 'bg-primary/5 border-primary/20 shadow-sm' 
                      : isWeekend 
                        ? 'bg-muted/30 border-muted' 
                        : 'bg-background border-border hover:border-primary/30'
                    }
                  `}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`
                        text-sm font-medium
                        ${isDayToday ? 'text-primary' : 'text-foreground'}
                      `}>
                        {format(day, 'EEE')}
                      </div>
                      <div className={`
                        text-lg font-semibold
                        ${isDayToday ? 'text-primary' : 'text-foreground'}
                      `}>
                        {format(day, 'dd')}
                      </div>
                    </div>
                    
                    {isDayToday && (
                      <Badge variant="default" className="text-xs px-2 py-1">
                        Today
                      </Badge>
                    )}
                  </div>

                  {/* Events List */}
                  <div className="space-y-2">
                    {dayEvents.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">No events</p>
                      </div>
                    ) : (
                      dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 bg-card rounded-md border shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="p-1 bg-primary/10 rounded">
                                {getEventTypeIcon(event.event_type)}
                              </div>
                              <span className="text-xs font-medium text-foreground">
                                System Event
                              </span>
                            </div>
                            <Badge 
                              variant={getEventTypeBadge(event.event_type)}
                              className="text-xs"
                            >
                              {event.event_type.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                              ID: #{event.id.toString().slice(-6)}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{format(new Date(event.created_at), 'HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {weeklyEvents.length === 0 && (
            <div className="text-center py-12 lg:col-span-7">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Events This Week</h3>
              <p className="text-sm text-muted-foreground mb-4">
                There are no scheduled events for this week.
              </p>
              <Button size="sm" className="flex items-center space-x-2 mx-auto">
                <Plus className="w-4 h-4" />
                <span>Schedule Event</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Total Events</p>
                <p className="text-2xl font-bold text-foreground">{weeklyEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">User Events</p>
                <p className="text-2xl font-bold text-foreground">
                  {weeklyEvents.filter(e => e.event_type === 'user_created').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Security Events</p>
                <p className="text-2xl font-bold text-foreground">
                  {weeklyEvents.filter(e => e.event_type === 'security_event').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklySchedule;
