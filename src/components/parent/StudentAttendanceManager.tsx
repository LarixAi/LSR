
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarDays, UserX, Clock, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

const StudentAttendanceManager = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [absenceReason, setAbsenceReason] = useState('');
  const [absenceType, setAbsenceType] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Mock data for upcoming absences
  const upcomingAbsences = [
    {
      id: '1',
      date: '2025-01-15',
      reason: 'Doctor appointment',
      type: 'medical',
      status: 'approved'
    },
    {
      id: '2',
      date: '2025-01-20',
      reason: 'Family vacation',
      type: 'personal',
      status: 'pending'
    }
  ];

  const handleSubmitAbsence = () => {
    if (!selectedDate || !absenceReason.trim() || !absenceType) return;
    
    console.log('Submitting absence:', {
      date: selectedDate,
      reason: absenceReason,
      type: absenceType
    });
    
    setAbsenceReason('');
    setAbsenceType('');
    setIsDialogOpen(false);
  };

  const getAbsenceTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return 'bg-blue-100 text-blue-800';
      case 'personal': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
      <Card>
        <CardHeader className={isMobile ? 'pb-3' : ''}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
                <CalendarDays className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span>Attendance Management</span>
              </CardTitle>
              <CardDescription className={isMobile ? 'text-sm' : ''}>
                Manage your child's school transport attendance
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size={isMobile ? 'sm' : 'default'} className={isMobile ? 'text-xs' : ''}>
                  <UserX className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
                  {isMobile ? 'Report' : 'Report Absence'}
                </Button>
              </DialogTrigger>
              <DialogContent className={isMobile ? 'w-[95vw] max-w-none mx-2 max-h-[90vh] overflow-y-auto' : ''}>
                <DialogHeader>
                  <DialogTitle className={isMobile ? 'text-lg' : ''}>Report Student Absence</DialogTitle>
                  <DialogDescription className={isMobile ? 'text-sm' : ''}>
                    Let the driver know your child won't be taking the bus
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className={isMobile ? 'text-sm' : ''}>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className={`rounded-md border ${isMobile ? 'text-sm' : ''}`}
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="absenceType" className={isMobile ? 'text-sm' : ''}>Absence Type</Label>
                    <Select value={absenceType} onValueChange={setAbsenceType}>
                      <SelectTrigger className={isMobile ? 'h-12' : ''}>
                        <SelectValue placeholder="Select absence type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="medical">Medical Appointment</SelectItem>
                        <SelectItem value="personal">Personal/Family</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reason" className={isMobile ? 'text-sm' : ''}>Reason</Label>
                    <Textarea
                      id="reason"
                      value={absenceReason}
                      onChange={(e) => setAbsenceReason(e.target.value)}
                      placeholder="Please provide details about the absence..."
                      rows={isMobile ? 3 : 3}
                      className={isMobile ? 'text-base' : ''}
                    />
                  </div>
                  <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-end'} space-x-2`}>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className={isMobile ? 'w-full h-12' : ''}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmitAbsence}
                      className={isMobile ? 'w-full h-12' : ''}
                    >
                      Submit Absence
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          <div className="space-y-4">
            <div className={`${isMobile ? 'p-3' : 'p-4'} bg-green-50 border border-green-200 rounded-lg`}>
              <div className={`flex items-center space-x-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                <Clock className="w-4 h-4 text-green-600" />
                <span className={`font-medium text-green-800 ${isMobile ? 'text-sm' : ''}`}>Today's Status</span>
              </div>
              <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-green-700`}>
                Emma is scheduled for pickup at 7:30 AM
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <MapPin className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">123 Main Street</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className={isMobile ? 'pb-3' : ''}>
          <CardTitle className={isMobile ? 'text-lg' : ''}>Upcoming Absences</CardTitle>
          <CardDescription className={isMobile ? 'text-sm' : ''}>
            Your reported absences and their status
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          <div className="space-y-3">
            {upcomingAbsences.map((absence) => (
              <div key={absence.id} className={`${isMobile ? 'p-3' : 'p-3'} border rounded-lg`}>
                <div className={`flex items-center justify-between ${isMobile ? 'mb-1' : 'mb-2'}`}>
                  <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                    {new Date(absence.date).toLocaleDateString()}
                  </span>
                  <div className={`flex ${isMobile ? 'flex-col gap-1' : 'space-x-2'}`}>
                    <Badge variant="outline" className={`${getAbsenceTypeColor(absence.type)} text-xs`}>
                      {absence.type}
                    </Badge>
                    <Badge variant="outline" className={`${getStatusColor(absence.status)} text-xs`}>
                      {absence.status}
                    </Badge>
                  </div>
                </div>
                <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-600`}>
                  {absence.reason}
                </p>
              </div>
            ))}
            {upcomingAbsences.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <CalendarDays className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} mx-auto mb-2 opacity-50`} />
                <p className={`${isMobile ? 'text-sm' : 'text-sm'}`}>No upcoming absences</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAttendanceManager;
