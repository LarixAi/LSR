import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Coffee,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { 
  useTodayTimeEntry, 
  useClockIn, 
  useClockOut, 
  useStartBreak, 
  useEndBreak 
} from '@/hooks/useTimeEntries';

interface TimeClockProps {
  compact?: boolean;
  showLocation?: boolean;
}

export default function TimeClock({ compact = false, showLocation = true }: TimeClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<string | null>(null);

  // Hooks
  const { data: todayEntry, isLoading } = useTodayTimeEntry();
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();
  const startBreakMutation = useStartBreak();
  const endBreakMutation = useEndBreak();

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get current location
  useEffect(() => {
    if (showLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        () => {
          setLocation('Location unavailable');
        }
      );
    }
  }, [showLocation]);

  // Calculate current session time
  const getCurrentSessionTime = () => {
    if (!todayEntry?.clock_in_time) return 0;
    
    const clockInTime = parseISO(todayEntry.clock_in_time);
    const totalMinutes = differenceInMinutes(currentTime, clockInTime);
    
    // Subtract break time if on break
    if (todayEntry.break_start_time && !todayEntry.break_end_time) {
      const breakStart = parseISO(todayEntry.break_start_time);
      const breakMinutes = differenceInMinutes(currentTime, breakStart);
      return Math.max(0, totalMinutes - breakMinutes);
    }
    
    return totalMinutes;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleClockIn = async () => {
    try {
      await clockInMutation.mutateAsync(location || undefined);
    } catch (error) {
      console.error('Clock in failed:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync(location || undefined);
    } catch (error) {
      console.error('Clock out failed:', error);
    }
  };

  const handleStartBreak = () => {
    startBreakMutation.mutate();
  };

  const handleEndBreak = () => {
    endBreakMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (compact) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Clock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Time */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-sm text-gray-600">
              {format(currentTime, 'EEEE, MMMM do, yyyy')}
            </div>
          </div>

          {/* Status */}
          {!isLoading && todayEntry && (
            <div className="text-center">
              {getStatusBadge(todayEntry.status)}
              {todayEntry.clock_in_time && (
                <div className="text-sm text-gray-600 mt-1">
                  Started at {format(parseISO(todayEntry.clock_in_time), 'HH:mm')}
                </div>
              )}
            </div>
          )}

          {/* Session Time */}
          {todayEntry?.clock_in_time && !todayEntry?.clock_out_time && (
            <div className="text-center bg-blue-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {formatTime(getCurrentSessionTime())}
              </div>
              <div className="text-xs text-gray-600">Session Time</div>
            </div>
          )}

          {/* Break Status */}
          {todayEntry?.break_start_time && !todayEntry?.break_end_time && (
            <div className="text-center bg-yellow-50 p-3 rounded-lg">
              <div className="text-sm font-semibold text-yellow-800">On Break</div>
              <div className="text-xs text-yellow-600">
                Started at {format(parseISO(todayEntry.break_start_time), 'HH:mm')}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!todayEntry?.clock_in_time && (
              <Button 
                onClick={handleClockIn} 
                disabled={clockInMutation.isPending}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Clock In
              </Button>
            )}
            {todayEntry?.clock_in_time && !todayEntry?.clock_out_time && (
              <>
                {!todayEntry?.break_start_time || todayEntry?.break_end_time ? (
                  <Button 
                    variant="outline" 
                    onClick={handleStartBreak} 
                    disabled={startBreakMutation.isPending}
                    className="flex-1"
                  >
                    <Coffee className="w-4 h-4 mr-2" />
                    Break
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={handleEndBreak} 
                    disabled={endBreakMutation.isPending}
                    className="flex-1"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    End Break
                  </Button>
                )}
                <Button 
                  onClick={handleClockOut} 
                  disabled={clockOutMutation.isPending}
                  className="flex-1"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              </>
            )}
          </div>

          {/* Location */}
          {showLocation && location && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Time Clock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Time Display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <div className="text-lg text-gray-600">
            {format(currentTime, 'EEEE, MMMM do, yyyy')}
          </div>
        </div>

        {/* Status and Session Info */}
        {!isLoading && todayEntry ? (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusBadge(todayEntry.status)}
                {todayEntry.clock_in_time && (
                  <span className="text-sm text-gray-600">
                    Started at {format(parseISO(todayEntry.clock_in_time), 'HH:mm')}
                  </span>
                )}
              </div>
            </div>

            {/* Session Time */}
            {todayEntry.clock_in_time && !todayEntry.clock_out_time && (
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatTime(getCurrentSessionTime())}
                </div>
                <div className="text-sm text-gray-600">Current Session Time</div>
              </div>
            )}

            {/* Break Status */}
            {todayEntry.break_start_time && !todayEntry.break_end_time && (
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-lg font-semibold text-yellow-800 mb-1">On Break</div>
                <div className="text-sm text-yellow-600">
                  Started at {format(parseISO(todayEntry.break_start_time), 'HH:mm')}
                </div>
              </div>
            )}

            {/* Location Info */}
            {showLocation && (todayEntry.location_clock_in || todayEntry.location_clock_out) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayEntry.location_clock_in && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Clock In: {todayEntry.location_clock_in}</span>
                  </div>
                )}
                {todayEntry.location_clock_out && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Clock Out: {todayEntry.location_clock_out}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start</h3>
            <p className="text-gray-600">Click "Clock In" to begin your shift</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!todayEntry?.clock_in_time && (
            <Button 
              onClick={handleClockIn} 
              disabled={clockInMutation.isPending}
              size="lg"
              className="flex-1"
            >
              <Play className="w-5 h-5 mr-2" />
              Clock In
            </Button>
          )}
          {todayEntry?.clock_in_time && !todayEntry?.clock_out_time && (
            <>
              {!todayEntry?.break_start_time || todayEntry?.break_end_time ? (
                <Button 
                  variant="outline" 
                  onClick={handleStartBreak} 
                  disabled={startBreakMutation.isPending}
                  size="lg"
                  className="flex-1"
                >
                  <Coffee className="w-5 h-5 mr-2" />
                  Start Break
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleEndBreak} 
                  disabled={endBreakMutation.isPending}
                  size="lg"
                  className="flex-1"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  End Break
                </Button>
              )}
              <Button 
                onClick={handleClockOut} 
                disabled={clockOutMutation.isPending}
                size="lg"
                className="flex-1"
              >
                <Square className="w-5 h-5 mr-2" />
                Clock Out
              </Button>
            </>
          )}
        </div>

        {/* Current Location */}
        {showLocation && location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Current Location: {location}</span>
          </div>
        )}

        {/* Compliance Warning */}
        {todayEntry?.clock_in_time && !todayEntry?.clock_out_time && getCurrentSessionTime() > 660 && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Warning: You've been working for over 11 hours. Consider taking a break.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
