import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function ParentSchedule() {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch attendance data for parent's children
  const { data: attendanceData = [], isLoading } = useQuery({
    queryKey: ['parent-schedule', user?.id, selectedDate],
    queryFn: async () => {
      if (!user?.id || profile?.role !== 'parent') return [];
      
      // Get parent's children first
      const { data: children, error: childError } = await supabase
        .from('child_profiles')
        .select('id, first_name, last_name, pickup_time, dropoff_time, pickup_location, dropoff_location, school_name')
        .eq('parent_id', user.id)
        .eq('is_active', true);

      if (childError) {
        console.error('Child fetch error:', childError);
        return [];
      }
      if (!children?.length) return [];

      // Get attendance for selected date
      const { data: attendance, error } = await supabase
        .from('daily_attendance')
        .select('*')
        .in('child_id', (children || []).map(c => String(c.id)))
        .eq('attendance_date', selectedDate);

      if (error) {
        console.error('Attendance fetch error:', error);
        // Return children without attendance if query fails
        return (children || []).map(child => ({ ...child, attendance: null }));
      }

      return (children || []).map(child => {
        const childAttendance = (attendance || []).find(a => String(a.child_id) === String(child.id));
        return {
          ...child,
          attendance: childAttendance
        };
      });
    },
    enabled: !!user?.id && profile?.role === 'parent'
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      attending: { label: 'Attending', variant: 'default' as const },
      absent: { label: 'Absent', variant: 'secondary' as const },
      late: { label: 'Late', variant: 'destructive' as const },
      pending: { label: 'Pending', variant: 'outline' as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const 
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">
            View your children's transportation schedule and attendance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md"
          />
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-4">
        {attendanceData.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No schedule data for {selectedDate}</h3>
              <p className="text-muted-foreground">
                Schedule information will appear here when available.
              </p>
            </CardContent>
          </Card>
        ) : (
          attendanceData.map((child) => (
            <Card key={child.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {child.first_name} {child.last_name}
                  </div>
                  {child.attendance && getStatusBadge(child.attendance.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Morning Pickup */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Morning Pickup</span>
                      {child.attendance?.pickup_status && (
                        <Badge variant="outline">
                          {child.attendance.pickup_status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Scheduled: {child.pickup_time || 'Not set'}</div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {child.pickup_location || 'Pickup location TBD'}
                      </div>
                      <div>School: {child.school_name || 'Not specified'}</div>
                    </div>
                  </div>

                  {/* Afternoon Dropoff */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Afternoon Dropoff</span>
                      {child.attendance?.dropoff_status && (
                        <Badge variant="outline">
                          {child.attendance.dropoff_status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Scheduled: {child.dropoff_time || 'Not set'}</div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {child.dropoff_location || 'Dropoff location TBD'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {(child.attendance?.parent_notes || child.attendance?.driver_notes) && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Notes</h4>
                    {child.attendance.parent_notes && (
                      <div className="text-sm mb-2">
                        <strong>Parent:</strong> {child.attendance.parent_notes}
                      </div>
                    )}
                    {child.attendance.driver_notes && (
                      <div className="text-sm">
                        <strong>Driver:</strong> {child.attendance.driver_notes}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}