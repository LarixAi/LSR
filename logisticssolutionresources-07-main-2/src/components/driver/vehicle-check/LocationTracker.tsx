
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin } from 'lucide-react';

interface LocationTrackerProps {
  inspectionStarted: boolean;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ inspectionStarted }) => {
  if (!inspectionStarted) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
      <AlertDescription className="text-blue-800 text-sm leading-relaxed">
        <strong>Walk-Around Tracking Active:</strong> Your location is being recorded to ensure proper DVLA-compliant inspection. 
        Take your time and walk around the entire vehicle for each check.
      </AlertDescription>
    </Alert>
  );
};

export default LocationTracker;
