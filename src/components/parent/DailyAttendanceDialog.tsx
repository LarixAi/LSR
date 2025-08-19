
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useAttendance, useUpdateAttendance, type AttendanceRecord } from '@/hooks/useAttendance';

const DailyAttendanceDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [notes, setNotes] = useState('');

  // Fetch real attendance data
  const { data: todayAttendance = [], isLoading } = useAttendance();
  const updateAttendanceMutation = useUpdateAttendance();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attending':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late_pickup':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'sick':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'holiday':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attending': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late_pickup': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sick': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'holiday': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'attending': return 'Attending';
      case 'absent': return 'Absent';
      case 'late_pickup': return 'Late Pickup';
      case 'sick': return 'Sick';
      case 'holiday': return 'Holiday';
      default: return 'Unknown';
    }
  };

  const getPickupStatusColor = (status: string) => {
    switch (status) {
      case 'picked_up': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missed': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPickupStatusText = (status: string) => {
    switch (status) {
      case 'picked_up': return 'Picked Up';
      case 'pending': return 'Pending';
      case 'missed': return 'Missed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const handleUpdateAttendance = async (id: string, status: AttendanceRecord['status']) => {
    try {
      await updateAttendanceMutation.mutateAsync({
        id,
        status,
        parent_notes: notes
      });
      setNotes('');
      setSelectedAttendance(null);
    } catch (error) {
      console.error('Failed to update attendance:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedAttendance(null);
      setNotes('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          View Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily Attendance</DialogTitle>
          <DialogDescription>
            View and update attendance records for today
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading attendance data...</span>
          </div>
        ) : todayAttendance.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
            <p className="text-gray-600">
              No attendance records found for today. Attendance records are created automatically when children are assigned to routes.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {todayAttendance.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {record.child_profiles?.first_name} {record.child_profiles?.last_name}
                      </CardTitle>
                      <CardDescription>
                        Route: {record.routes?.name || 'No route assigned'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <Badge variant="outline" className={getStatusColor(record.status)}>
                        {getStatusText(record.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Pickup Status</Label>
                      <Badge variant="outline" className={getPickupStatusColor(record.pickup_status)}>
                        {getPickupStatusText(record.pickup_status)}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Dropoff Status</Label>
                      <Badge variant="outline" className={getPickupStatusColor(record.dropoff_status)}>
                        {getPickupStatusText(record.dropoff_status)}
                      </Badge>
                    </div>
                  </div>

                  {record.parent_notes && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium">Parent Notes</Label>
                      <p className="text-sm text-gray-600 mt-1">{record.parent_notes}</p>
                    </div>
                  )}

                  {record.driver_notes && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium">Driver Notes</Label>
                      <p className="text-sm text-gray-600 mt-1">{record.driver_notes}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`notes-${record.id}`} className="text-sm font-medium">
                        Add/Update Notes
                      </Label>
                      <Textarea
                        id={`notes-${record.id}`}
                        placeholder="Add any notes about today's attendance..."
                        value={selectedAttendance?.id === record.id ? notes : ''}
                        onChange={(e) => {
                          if (selectedAttendance?.id === record.id) {
                            setNotes(e.target.value);
                          } else {
                            setSelectedAttendance(record);
                            setNotes(e.target.value);
                          }
                        }}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateAttendance(record.id, 'attending')}
                        disabled={updateAttendanceMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Attending
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateAttendance(record.id, 'absent')}
                        disabled={updateAttendanceMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Mark Absent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateAttendance(record.id, 'sick')}
                        disabled={updateAttendanceMutation.isPending}
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Mark Sick
                      </Button>
                      {updateAttendanceMutation.isPending && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DailyAttendanceDialog;
