import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  CheckCircle, 
  Phone
} from 'lucide-react';

interface Vehicle {
  id: string;
  vehicle_number: string;
  make: string;
  model: string;
  license_plate: string;
  mot_expiry?: string;
  type: string;
}

interface Assignment {
  assigned_vehicle: Vehicle;
}

interface DriverVehicleCardProps {
  assignment: Assignment | null;
  getVehicleTypeIcon: (type: string) => string;
  onVehicleCheck: () => void;
}

const DriverVehicleCard: React.FC<DriverVehicleCardProps> = ({ 
  assignment, 
  getVehicleTypeIcon, 
  onVehicleCheck 
}) => {
  return (
    <Card className="bg-glass border-primary/20 card-hover animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gradient">
          <Car className="w-6 h-6" />
          <span>My Assigned Vehicle</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assignment?.assigned_vehicle ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-float">
                {getVehicleTypeIcon(assignment.assigned_vehicle.type)}
              </div>
              <h3 className="text-3xl font-bold text-gradient mb-2">
                {assignment.assigned_vehicle.vehicle_number}
              </h3>
              <p className="text-lg text-muted-foreground">
                {assignment.assigned_vehicle.make} {assignment.assigned_vehicle.model}
              </p>
              <Badge className="mt-2 bg-primary/10 text-primary text-sm px-3 py-1">
                {assignment.assigned_vehicle.type}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">License Plate</p>
                <p className="text-xl font-bold">{assignment.assigned_vehicle.license_plate}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">MOT Expires</p>
                <p className="text-xl font-bold">{assignment.assigned_vehicle.mot_expiry || 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="button-modern" onClick={onVehicleCheck}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Start Inspection
              </Button>
              <Button variant="outline">
                <Car className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Car className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-xl text-muted-foreground mb-2">No vehicle assigned</p>
            <p className="text-sm text-muted-foreground">Contact your supervisor for vehicle assignment</p>
            <Button variant="outline" className="mt-4">
              <Phone className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverVehicleCard;