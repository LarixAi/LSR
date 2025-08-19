
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AddRouteFormData } from '../types';

interface CapacityStepProps {
  formData: AddRouteFormData;
  errors: Record<string, string>;
  onUpdateField: (field: keyof AddRouteFormData, value: string) => void;
}

const CapacityStep: React.FC<CapacityStepProps> = ({
  formData,
  errors,
  onUpdateField,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Capacity & Safety</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxCapacity">Max Capacity</Label>
          <Input
            id="maxCapacity"
            type="number"
            value={formData.maxCapacity}
            onChange={(e) => onUpdateField('maxCapacity', e.target.value)}
            className={errors.maxCapacity ? 'border-red-500' : ''}
          />
          {errors.maxCapacity && <p className="text-red-500 text-sm mt-1">{errors.maxCapacity}</p>}
        </div>
        <div>
          <Label htmlFor="assignedStudents">Current Assigned Students</Label>
          <Input
            id="assignedStudents"
            type="number"
            value={formData.assignedStudents}
            onChange={(e) => onUpdateField('assignedStudents', e.target.value)}
            className={errors.assignedStudents ? 'border-red-500' : ''}
          />
          {errors.assignedStudents && <p className="text-red-500 text-sm mt-1">{errors.assignedStudents}</p>}
        </div>
        <div>
          <Label htmlFor="maxWalkingDistance">Max Walking Distance (meters)</Label>
          <Input
            id="maxWalkingDistance"
            type="number"
            value={formData.maxWalkingDistance}
            onChange={(e) => onUpdateField('maxWalkingDistance', e.target.value)}
            className={errors.maxWalkingDistance ? 'border-red-500' : ''}
          />
          {errors.maxWalkingDistance && <p className="text-red-500 text-sm mt-1">{errors.maxWalkingDistance}</p>}
        </div>
        <div>
          <Label htmlFor="estDuration">Estimated Duration (minutes)</Label>
          <Input
            id="estDuration"
            type="number"
            value={formData.estDuration}
            onChange={(e) => onUpdateField('estDuration', e.target.value)}
            className={errors.estDuration ? 'border-red-500' : ''}
          />
          {errors.estDuration && <p className="text-red-500 text-sm mt-1">{errors.estDuration}</p>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="estDistance">Estimated Distance (km)</Label>
          <Input
            id="estDistance"
            type="number"
            step="0.1"
            value={formData.estDistance}
            onChange={(e) => onUpdateField('estDistance', e.target.value)}
            className={errors.estDistance ? 'border-red-500' : ''}
          />
          {errors.estDistance && <p className="text-red-500 text-sm mt-1">{errors.estDistance}</p>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="dangerZones">Danger Zones (optional)</Label>
          <Textarea
            id="dangerZones"
            value={formData.dangerZones}
            onChange={(e) => onUpdateField('dangerZones', e.target.value)}
            placeholder="Describe any danger zones or safety concerns"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => onUpdateField('notes', e.target.value)}
            placeholder="Additional notes about the route"
          />
        </div>
      </div>
    </div>
  );
};

export default CapacityStep;
