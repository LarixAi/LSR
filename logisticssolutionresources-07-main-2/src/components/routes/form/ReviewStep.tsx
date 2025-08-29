
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock } from 'lucide-react';
import { useVehicles } from '@/hooks/useVehicles';
import type { AddRouteFormData } from '../types';

interface ReviewStepProps {
  formData: AddRouteFormData;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const { data: vehicles } = useVehicles();
  const selectedVehicle = vehicles?.find(v => v.id === formData.selectedVehicleId);
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const selectedDays = daysOfWeek.filter((_, index) => formData.days[index]).join(', ');

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Review & Submit</h3>
      <Card className="bg-gray-50">
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Route Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Route Name:</strong> {formData.routeName}</p>
              <p><strong>School:</strong> {formData.schoolName}</p>
              <p><strong>Address:</strong> {formData.schoolAddress}</p>
              <p><strong>Vehicle:</strong> {selectedVehicle?.vehicle_number} - {selectedVehicle?.license_plate}</p>
              <p><strong>Driver:</strong> {formData.driverName} ({formData.driverContact})</p>
            </div>
          </div>

          {formData.stops.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Stops</h4>
              <div className="space-y-1 text-sm">
                {formData.stops.map((stop, index) => (
                  <p key={index}>
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {stop.passengerName} ({stop.role}) - {stop.address} at {stop.time}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Schedule</h4>
            <div className="space-y-1 text-sm">
              <p><Clock className="w-3 h-3 inline mr-1" /><strong>Start:</strong> {formData.startTime}</p>
              <p><Clock className="w-3 h-3 inline mr-1" /><strong>End:</strong> {formData.endTime}</p>
              <p><strong>Days:</strong> {selectedDays}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Capacity & Safety</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Max Capacity:</strong> {formData.maxCapacity}</p>
              <p><strong>Assigned:</strong> {formData.assignedStudents}</p>
              <p><strong>Max Walking Distance:</strong> {formData.maxWalkingDistance}m</p>
              <p><strong>Est. Duration:</strong> {formData.estDuration} min</p>
              <p><strong>Est. Distance:</strong> {formData.estDistance} km</p>
              {formData.dangerZones && <p><strong>Danger Zones:</strong> {formData.dangerZones}</p>}
              {formData.notes && <p><strong>Notes:</strong> {formData.notes}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewStep;
