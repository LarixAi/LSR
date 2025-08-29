
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VehicleDetailsProps {
  vehicle: any;
}

const VehicleDetails = ({ vehicle }: VehicleDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Vehicle ID</h3>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded">{vehicle.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
            <p>{new Date(vehicle.created_at).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
            <p>{new Date(vehicle.updated_at).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Organization ID</h3>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded">
              {vehicle.organization_id || 'Not assigned'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleDetails;
