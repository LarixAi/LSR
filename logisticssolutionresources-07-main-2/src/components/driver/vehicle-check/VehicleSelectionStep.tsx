
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, AlertCircle } from 'lucide-react';

interface VehicleSelectionStepProps {
  assignedVehicles: any[];
  selectedVehicle: string;
  setSelectedVehicle: (vehicleId: string) => void;
  vehiclesLoading: boolean;
}

const VehicleSelectionStep: React.FC<VehicleSelectionStepProps> = ({
  assignedVehicles,
  selectedVehicle,
  setSelectedVehicle,
  vehiclesLoading
}) => {
  if (vehiclesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center mb-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Vehicle Selection</h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Select any vehicle from the fleet for inspection. You can use any available vehicle, not just your assigned one.
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="vehicle-select" className="text-sm sm:text-base font-medium">
          Select Vehicle from Fleet
        </Label>
        
        {assignedVehicles.length === 0 ? (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <AlertDescription className="text-yellow-800 text-sm leading-relaxed">
              No active vehicles available in the fleet. Please contact your supervisor.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="w-full h-12 text-sm sm:text-base">
                <SelectValue placeholder="Choose a vehicle from the fleet..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {assignedVehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id} className="text-sm sm:text-base">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {vehicle.vehicle_number} - {vehicle.license_plate}
                      </span>
                      <span className="text-xs text-gray-500">
                        {vehicle.make} {vehicle.model}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              All active vehicles in the fleet are available for selection.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleSelectionStep;
