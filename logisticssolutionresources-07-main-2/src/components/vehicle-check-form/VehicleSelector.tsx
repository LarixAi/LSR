
import React from 'react';
import { Label } from '@/components/ui/label';

interface VehicleSelectorProps {
  vehicles: any[];
  selectedVehicle: string;
  onVehicleChange: (vehicleId: string) => void;
  isLoading: boolean;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  selectedVehicle,
  onVehicleChange,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor="vehicle">Select Vehicle from Fleet</Label>
      {vehicles.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-2">
          <p className="text-yellow-800 text-sm">
            No active vehicles available in the fleet. Please contact your supervisor.
          </p>
        </div>
      ) : (
        <select
          id="vehicle"
          value={selectedVehicle}
          onChange={(e) => onVehicleChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2"
          required
        >
          <option value="">Choose a vehicle from the fleet...</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.vehicle_number} - {vehicle.license_plate} ({vehicle.model})
            </option>
          ))}
        </select>
      )}
      <p className="text-sm text-gray-600 mt-1">
        You can select any active vehicle from the fleet for inspection.
      </p>
    </div>
  );
};

export default VehicleSelector;
