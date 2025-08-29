
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface IncidentLocationSectionProps {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationPickerOpen: () => void;
}

const IncidentLocationSection: React.FC<IncidentLocationSectionProps> = ({
  selectedLocation,
  onLocationPickerOpen,
}) => {
  return (
    <div className="space-y-4">
      <Label className="flex items-center space-x-2">
        <MapPin className="w-4 h-4" />
        <span>Location</span>
      </Label>
      {selectedLocation ? (
        <div className="p-4 border rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600">
            Latitude: {selectedLocation.lat.toFixed(6)}, Longitude: {selectedLocation.lng.toFixed(6)}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={onLocationPickerOpen}
          >
            Change Location
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={onLocationPickerOpen}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Pick Location
        </Button>
      )}
    </div>
  );
};

export default IncidentLocationSection;
