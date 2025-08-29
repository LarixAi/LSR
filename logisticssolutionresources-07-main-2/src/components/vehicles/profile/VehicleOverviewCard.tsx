
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck } from 'lucide-react';

interface VehicleOverviewCardProps {
  vehicle: any;
}

const VehicleOverviewCard = ({ vehicle }: VehicleOverviewCardProps) => {
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          {vehicle.vehicle_number}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">License Plate</h3>
            <p className="text-lg font-semibold">{vehicle.license_plate}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Model</h3>
            <p className="text-lg">{vehicle.model || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Year</h3>
            <p className="text-lg">{vehicle.year || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Capacity</h3>
            <p className="text-lg">{vehicle.capacity} seats</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <Badge className={getStatusColor(vehicle.is_active || false)}>
              {vehicle.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Added</h3>
            <p className="text-lg">{new Date(vehicle.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleOverviewCard;
