
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { AddRouteFormData } from '../types';

interface ScheduleStepProps {
  formData: AddRouteFormData;
  errors: Record<string, string>;
  onUpdateField: (field: keyof AddRouteFormData, value: string) => void;
  onUpdateDays: (days: boolean[]) => void;
}

const ScheduleStep: React.FC<ScheduleStepProps> = ({
  formData,
  errors,
  onUpdateField,
  onUpdateDays,
}) => {
  const toggleDay = (index: number) => {
    const newDays = [...formData.days];
    newDays[index] = !newDays[index];
    onUpdateDays(newDays);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Schedule</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => onUpdateField('startTime', e.target.value)}
            className={errors.startTime ? 'border-red-500' : ''}
          />
          {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => onUpdateField('endTime', e.target.value)}
            className={errors.endTime ? 'border-red-500' : ''}
          />
          {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
        </div>
      </div>
      <div>
        <Label>Days of Operation</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <Badge
              key={day}
              variant={formData.days[index] ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleDay(index)}
            >
              {day}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleStep;
