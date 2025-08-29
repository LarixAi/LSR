
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface ChildProfile {
  id: string;
  first_name: string;
  last_name: string;
  pickup_location: string;
}

interface AttendanceRecord {
  id: string;
  child_id: string;
  route_id: string;
  status: string;
  parent_notes?: string;
  child_profiles: ChildProfile;
}

const DailyAttendanceDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const { data: todayAttendance, isLoading } = useQuery({
    queryKey: ['daily-attendance', user?.id, today],
    queryFn: async () => {
      console.log('Fetching daily attendance for user:', user?.id, 'date:', today);
      
      // Mock attendance data since the tables don't exist
      const mockAttendance: AttendanceRecord[] = [
        {
          id: 'attendance-1',
          child_id: 'child-1',
          route_id: 'route-1',
          status: 'attending',
          parent_notes: '',
          child_profiles: {
            id: 'child-1',
            first_name: 'Emma',
            last_name: 'Johnson',
            pickup_location: '123 Main Street'
          }
        },
        {
          id: 'attendance-2',
          child_id: 'child-2',
          route_id: 'route-1',
          status: 'attending',
          parent_notes: '',
          child_profiles: {
            id: 'child-2',
            first_name: 'Noah',
            last_name: 'Johnson',
            pickup_location: '123 Main Street'
          }
        }
      ];

      return mockAttendance;
    },
    enabled: !!user?.id && open
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, status, parentNotes }: { id: string; status: string; parentNotes?: string }) => {
      console.log('Updating attendance:', { id, status, parentNotes });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the attendance record to update
      const attendanceRecord = todayAttendance?.find(record => record.id === id);
      if (!attendanceRecord) {
        throw new Error('Attendance record not found');
      }

      // Return updated record
      const updatedRecord = {
        ...attendanceRecord,
        status,
        parent_notes: parentNotes,
        updated_at: new Date().toISOString()
      };

      console.log('Mock notification would be sent for:', status);
      
      return updatedRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['daily-attendance'] });
      toast({
        title: "Attendance Updated",
        description: `${data.child_profiles.first_name}'s attendance has been updated.`,
      });
      setNotes('');
      setSelectedAttendance(null);
    },
    onError: (error) => {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attending':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late_pickup':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attending':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late_pickup':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
          <Calendar className="w-4 h-4 mr-2" />
          Today's Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Daily Attendance - {new Date().toLocaleDateString()}
          </DialogTitle>
          <DialogDescription>
            Update your children's attendance for today's transport service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">Loading attendance records...</div>
          ) : todayAttendance && todayAttendance.length > 0 ? (
            todayAttendance.map((record) => (
              <Card key={record.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {record.child_profiles.first_name} {record.child_profiles.last_name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Pickup: {record.child_profiles.pickup_location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {record.parent_notes && (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Notes:</strong> {record.parent_notes}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={record.status === 'attending' ? 'default' : 'outline'}
                      onClick={() => updateAttendanceMutation.mutate({ 
                        id: record.id, 
                        status: 'attending' 
                      })}
                      disabled={updateAttendanceMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Attending
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={record.status === 'absent' ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedAttendance(record);
                        setNotes(record.parent_notes || '');
                      }}
                      disabled={updateAttendanceMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Absent
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={record.status === 'late_pickup' ? 'default' : 'outline'}
                      onClick={() => updateAttendanceMutation.mutate({ 
                        id: record.id, 
                        status: 'late_pickup' 
                      })}
                      disabled={updateAttendanceMutation.isPending}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Late Pickup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Children Found</h3>
              <p className="text-gray-600">Add children to your profile to manage daily attendance.</p>
            </div>
          )}
        </div>

        {/* Absence Notes Dialog */}
        {selectedAttendance && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-2">
              Mark {selectedAttendance.child_profiles.first_name} as Absent
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="absence_notes">Reason for Absence (Optional)</Label>
                <Textarea
                  id="absence_notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., sick, family emergency, school event..."
                  rows={2}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => updateAttendanceMutation.mutate({
                    id: selectedAttendance.id,
                    status: 'absent',
                    parentNotes: notes
                  })}
                  disabled={updateAttendanceMutation.isPending}
                >
                  Confirm Absence
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedAttendance(null);
                    setNotes('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DailyAttendanceDialog;
