
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface VehicleMetricsFormProps {
  fuelLevel: string;
  onFuelLevelChange: (value: string) => void;
  mileage: string;
  onMileageChange: (value: string) => void;
}

const VehicleMetricsForm: React.FC<VehicleMetricsFormProps> = ({
  fuelLevel,
  onFuelLevelChange,
  mileage,
  onMileageChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="fuel">Fuel Level (%)</Label>
        <Input
          id="fuel"
          type="number"
          min="0"
          max="100"
          value={fuelLevel}
          onChange={(e) => onFuelLevelChange(e.target.value)}
          placeholder="Enter fuel percentage"
        />
      </div>
      <div>
        <Label htmlFor="mileage">Current Mileage</Label>
        <Input
          id="mileage"
          type="number"
          value={mileage}
          onChange={(e) => onMileageChange(e.target.value)}
          placeholder="Enter current mileage"
        />
      </div>
    </div>
  );
};

export default VehicleMetricsForm;
