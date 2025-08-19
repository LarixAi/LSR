
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BasicInfoStepProps {
  mileage: string;
  setMileage: (value: string) => void;
  fuelLevel: string;
  setFuelLevel: (value: string) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  mileage,
  setMileage,
  fuelLevel,
  setFuelLevel
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mileage">Current Mileage/Odometer Reading</Label>
          <Input
            id="mileage"
            type="number"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder="Enter current mileage"
            required
          />
        </div>
        <div>
          <Label htmlFor="fuel">Fuel Level (%)</Label>
          <Input
            id="fuel"
            type="number"
            min="0"
            max="100"
            value={fuelLevel}
            onChange={(e) => setFuelLevel(e.target.value)}
            placeholder="Enter fuel percentage"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
