
import React from 'react';

interface VehicleInfoStepProps {
  selectedVehicleData: any;
}

const VehicleInfoStep: React.FC<VehicleInfoStepProps> = ({ selectedVehicleData }) => {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-green-900 mb-2">Vehicle Information Confirmation</h4>
        <p className="text-sm text-green-800">
          Please confirm the vehicle details before proceeding with the inspection.
        </p>
      </div>
      {selectedVehicleData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Vehicle Number:</span>
              <p className="text-gray-700">{selectedVehicleData.vehicle_number}</p>
            </div>
            <div>
              <span className="font-medium">License Plate:</span>
              <p className="text-gray-700">{selectedVehicleData.license_plate}</p>
            </div>
            <div>
              <span className="font-medium">Model:</span>
              <p className="text-gray-700">{selectedVehicleData.model || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium">Capacity:</span>
              <p className="text-gray-700">{selectedVehicleData.capacity} passengers</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> Ensure you are inspecting the correct vehicle. 
              If this information is incorrect, contact your supervisor immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleInfoStep;
