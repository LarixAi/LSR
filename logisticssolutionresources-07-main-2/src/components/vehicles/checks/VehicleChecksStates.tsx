
import React from 'react';
import { AlertTriangle, Car } from 'lucide-react';

export const LoadingState = () => (
  <div className="text-center py-8">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <p className="mt-2 text-gray-500">Loading vehicle checks...</p>
  </div>
);

export const EmptyState = ({ vehicleSpecific = false }: { vehicleSpecific?: boolean }) => (
  <div className="text-center py-8">
    <Car className="w-12 h-12 text-gray-400 mx-auto mb-2" />
    <p className="text-gray-500">
      {vehicleSpecific ? 'No inspections found for this vehicle' : 'No vehicle checks found'}
    </p>
  </div>
);

export const ErrorState = ({ error }: { error: any }) => (
  <div className="text-center py-8">
    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
    <p className="text-red-600">
      Error loading vehicle checks: {error instanceof Error ? error.message : 'Unknown error'}
    </p>
  </div>
);
