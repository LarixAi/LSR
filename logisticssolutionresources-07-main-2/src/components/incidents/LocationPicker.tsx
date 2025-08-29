
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import GoogleMap from '@/components/GoogleMap';

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  open,
  onOpenChange,
  onLocationSelect,
  initialLocation = { lat: -25.7479, lng: 28.2293 },
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const handleConfirm = () => {
    onLocationSelect(selectedLocation);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pick Location</DialogTitle>
        </DialogHeader>
        <div className="h-96">
          <GoogleMap
            center={selectedLocation}
            zoom={13}
            markers={[
              {
                position: selectedLocation,
                title: 'Selected Location',
                type: 'stop',
              },
            ]}
            showApiKeyInput={true}
          />
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker;
