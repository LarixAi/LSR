
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  pickup_location: string;
  pickup_time?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

interface StopArrivalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stopAddress: string;
  students: Student[];
  onConfirmPickup: (presentStudents: string[], absentStudents: string[]) => void;
}

const StopArrivalDialog: React.FC<StopArrivalDialogProps> = ({
  open,
  onOpenChange,
  stopAddress,
  students,
  onConfirmPickup
}) => {
  const [studentStatus, setStudentStatus] = useState<{ [key: string]: boolean }>({});

  const handleStudentToggle = (studentId: string, isPresent: boolean) => {
    setStudentStatus(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleConfirm = () => {
    const presentStudents = students
      .filter(student => studentStatus[student.id] === true)
      .map(student => student.id);
    
    const absentStudents = students
      .filter(student => studentStatus[student.id] === false)
      .map(student => student.id);

    onConfirmPickup(presentStudents, absentStudents);
    onOpenChange(false);
    setStudentStatus({});
  };

  const allStudentsChecked = students.every(student => 
    studentStatus[student.id] !== undefined
  );

  const presentCount = Object.values(studentStatus).filter(Boolean).length;
  const absentCount = Object.values(studentStatus).filter(status => status === false).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-500" />
            <span>You've Arrived!</span>
          </DialogTitle>
          <DialogDescription>
            Confirm student pickup at: <strong>{stopAddress}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Students at this stop</span>
              </div>
              <Badge variant="outline">
                {students.length} student{students.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </h4>
                      {student.profiles && (
                        <p className="text-sm text-gray-600">
                          Parent: {student.profiles.first_name} {student.profiles.last_name}
                        </p>
                      )}
                      {student.pickup_time && (
                        <p className="text-xs text-gray-500">
                          Scheduled: {student.pickup_time}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={studentStatus[student.id] === true ? "default" : "outline"}
                        onClick={() => handleStudentToggle(student.id, true)}
                        className={studentStatus[student.id] === true ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={studentStatus[student.id] === false ? "destructive" : "outline"}
                        onClick={() => handleStudentToggle(student.id, false)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Absent
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {Object.keys(studentStatus).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Present: {presentCount}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Absent: {absentCount}</span>
                </span>
              </div>
            </div>
          )}

          {!allStudentsChecked && (
            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Please mark all students as present or absent</span>
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!allStudentsChecked}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Confirm Pickup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StopArrivalDialog;
