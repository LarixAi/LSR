import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, AlertCircle, UserCheck, GraduationCap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Stop } from '../types';

interface PassengerStopsStepProps {
  stops: Stop[];
  onAddStop: () => void;
  onRemoveStop: (index: number) => void;
  onUpdateStop: (index: number, field: keyof Stop, value: string | number) => void;
  errors?: Record<string, string>;
}

const PassengerStopsStep: React.FC<PassengerStopsStepProps> = ({
  stops,
  onAddStop,
  onRemoveStop,
  onUpdateStop,
  errors,
}) => {
  const hasPA = stops.some(stop => stop.role === 'PA');
  const firstStopIsPA = stops.length > 0 && stops[0].role === 'PA';

  const validateStopOrder = () => {
    if (stops.length === 0) return null;
    if (!hasPA) {
      return "Please assign a PA as the first pickup before adding students.";
    }
    if (!firstStopIsPA) {
      return "The first pickup must be a Personal Assistant (PA).";
    }
    return null;
  };

  const validationError = validateStopOrder();

  const getRoleIcon = (role: string) => {
    return role === 'PA' ? <UserCheck className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />;
  };

  const isRoleDisabled = (index: number, role: string) => {
    // First stop must be PA
    if (index === 0 && role === 'Student') return true;
    // Can't add students if no PA exists
    if (role === 'Student' && !hasPA) return true;
    return false;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-2">Passenger Pickups</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add passengers in pickup order. The first pickup must be a Personal Assistant (PA), followed by students.
        </p>
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {stops.map((stop, index) => (
          <Card key={index} className={`${stop.role === 'PA' ? 'border-blue-200 bg-blue-50/50' : 'border-green-200 bg-green-50/50'}`}>
            <CardContent className="p-4">
              <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="flex items-center gap-2">
                        Role
                        {getRoleIcon(stop.role)}
                      </Label>
                      <Select
                        value={stop.role}
                        onValueChange={(value) => onUpdateStop(index, 'role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem 
                            value="PA" 
                            disabled={isRoleDisabled(index, 'PA')}
                          >
                            Personal Assistant
                          </SelectItem>
                          <SelectItem 
                            value="Student" 
                            disabled={isRoleDisabled(index, 'Student')}
                          >
                            Student
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Passenger Name</Label>
                      <Input
                        value={stop.passengerName}
                        onChange={(e) => onUpdateStop(index, 'passengerName', e.target.value)}
                        placeholder={stop.role === 'PA' ? 'PA name' : 'Student name'}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Pickup Address</Label>
                    <Input
                      value={stop.address}
                      onChange={(e) => onUpdateStop(index, 'address', e.target.value)}
                      placeholder="Enter pickup address with postcode"
                    />
                  </div>
                  
                  <div>
                    <Label>Pickup Time</Label>
                    <Input
                      type="time"
                      value={stop.time}
                      onChange={(e) => onUpdateStop(index, 'time', e.target.value)}
                    />
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveStop(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={index === 0 && stops.length === 1} // Prevent removing the only stop
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Button 
        onClick={onAddStop} 
        variant="outline" 
        className="w-full"
        disabled={stops.length === 0 ? false : !hasPA} // Can always add first stop, but need PA before adding more
      >
        <Plus className="w-4 h-4 mr-2" />
        {stops.length === 0 ? 'Add PA (Required First)' : hasPA ? 'Add Student' : 'Add PA First'}
      </Button>
      
      {stops.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Pickup Order: {stops.map((stop, i) => `${i + 1}. ${stop.role} - ${stop.passengerName || 'Unnamed'}`).join(' → ')} → School
        </div>
      )}
    </div>
  );
};

export default PassengerStopsStep;