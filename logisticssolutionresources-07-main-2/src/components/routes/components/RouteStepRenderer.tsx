import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Plus, Trash2, Clock, Users } from 'lucide-react';

interface Stop {
  address: string;
  time: string;
  role: 'PA' | 'Student';
  passengerName: string;
  pickupOrder: number;
}

interface AddRouteFormData {
  routeName: string;
  schoolName: string;
  schoolAddress: string;
  selectedVehicleId: string;
  selectedDriverId: string;
  driverName: string;
  driverContact: string;
  stops: Stop[];
  startTime: string;
  endTime: string;
  days: boolean[];
  maxCapacity: string;
  assignedStudents: string;
  dangerZones: string;
  maxWalkingDistance: string;
  estDuration: string;
  estDistance: string;
  notes: string;
  transportCompany?: string;
  routeNumber?: string;
  morningPayment?: string;
  afternoonPayment?: string;
  afternoonIsReverse?: boolean;
}

interface RouteStepRendererProps {
  currentStep: number;
  formData: AddRouteFormData;
  errors: Record<string, string>;
  onUpdateField: (field: keyof AddRouteFormData, value: any) => void;
  onUpdateDays: (days: boolean[]) => void;
  onAddStop: () => void;
  onRemoveStop: (index: number) => void;
  onUpdateStop: (index: number, field: keyof Stop, value: any) => void;
}

const RouteStepRenderer: React.FC<RouteStepRendererProps> = ({
  currentStep,
  formData,
  errors,
  onUpdateField,
  onUpdateDays,
  onAddStop,
  onRemoveStop,
  onUpdateStop,
}) => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
              <CardDescription>Basic route details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="routeName">Route Name</Label>
                <Input
                  id="routeName"
                  value={formData.routeName}
                  onChange={(e) => onUpdateField('routeName', e.target.value)}
                  placeholder="Enter route name"
                />
                {errors.routeName && <p className="text-red-500 text-sm mt-1">{errors.routeName}</p>}
              </div>
              
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => onUpdateField('schoolName', e.target.value)}
                  placeholder="Enter school name"
                />
              </div>
              
              <div>
                <Label htmlFor="schoolAddress">School Address</Label>
                <Input
                  id="schoolAddress"
                  value={formData.schoolAddress}
                  onChange={(e) => onUpdateField('schoolAddress', e.target.value)}
                  placeholder="Enter school address"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Route Stops</CardTitle>
              <CardDescription>Add stops along the route</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.stops.map((stop, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Stop {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveStop(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={stop.address}
                        onChange={(e) => onUpdateStop(index, 'address', e.target.value)}
                        placeholder="Stop address"
                      />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={stop.time}
                        onChange={(e) => onUpdateStop(index, 'time', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={onAddStop}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stop
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Set operating days and times</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Operating Days</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {dayNames.map((day, index) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${index}`}
                        checked={formData.days[index] || false}
                        onCheckedChange={(checked) => {
                          const newDays = [...formData.days];
                          newDays[index] = checked as boolean;
                          onUpdateDays(newDays);
                        }}
                      />
                      <Label htmlFor={`day-${index}`} className="text-sm">
                        {day.substring(0, 3)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => onUpdateField('startTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => onUpdateField('endTime', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Capacity & Students</CardTitle>
              <CardDescription>Vehicle capacity and student assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxCapacity">Maximum Capacity</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => onUpdateField('maxCapacity', e.target.value)}
                  placeholder="Maximum number of passengers"
                />
              </div>
              
              <div>
                <Label htmlFor="assignedStudents">Assigned Students</Label>
                <Textarea
                  id="assignedStudents"
                  value={formData.assignedStudents}
                  onChange={(e) => onUpdateField('assignedStudents', e.target.value)}
                  placeholder="List assigned students (one per line)"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Safety & Zones</CardTitle>
              <CardDescription>Safety considerations and danger zones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dangerZones">Danger Zones</Label>
                <Textarea
                  id="dangerZones"
                  value={formData.dangerZones}
                  onChange={(e) => onUpdateField('dangerZones', e.target.value)}
                  placeholder="Describe any danger zones or safety concerns"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="maxWalkingDistance">Max Walking Distance (meters)</Label>
                <Input
                  id="maxWalkingDistance"
                  type="number"
                  value={formData.maxWalkingDistance}
                  onChange={(e) => onUpdateField('maxWalkingDistance', e.target.value)}
                  placeholder="Maximum walking distance from stop"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Final Details</CardTitle>
              <CardDescription>Route estimates and additional notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estDuration">Estimated Duration (minutes)</Label>
                  <Input
                    id="estDuration"
                    type="number"
                    value={formData.estDuration}
                    onChange={(e) => onUpdateField('estDuration', e.target.value)}
                    placeholder="Duration in minutes"
                  />
                </div>
                <div>
                  <Label htmlFor="estDistance">Estimated Distance (km)</Label>
                  <Input
                    id="estDistance"
                    type="number"
                    value={formData.estDistance}
                    onChange={(e) => onUpdateField('estDistance', e.target.value)}
                    placeholder="Distance in kilometers"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => onUpdateField('notes', e.target.value)}
                  placeholder="Any additional notes or special instructions"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return <div className="space-y-6">{renderStep()}</div>;
};

export default RouteStepRenderer;