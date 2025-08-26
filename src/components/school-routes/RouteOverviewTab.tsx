import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bus, 
  Users, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  AlertTriangle, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Navigation,
  DollarSign,
  Shield,
  FileText,
  Settings,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  Star,
  UserPlus,
  Route,
  Map
} from 'lucide-react';

interface SchoolRoute {
  id: string;
  routeName: string;
  routeNumber: string;
  schoolName: string;
  schoolAddress: string;
  routeType: 'morning' | 'afternoon' | 'both';
  status: 'active' | 'inactive' | 'planned' | 'suspended';
  assignedVehicleId: string;
  assignedDriverId: string;
  vehicleRegistration: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  currentPassengers: number;
  stops: RouteStop[];
  pickupTimes: string[];
  dropoffTimes: string[];
  daysOfWeek: number[];
  estimatedDuration: number;
  distance: number;
  fuelConsumption: number;
  monthlyCost: number;
  monthlyRevenue: number;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  specialRequirements: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface RouteStop {
  id: string;
  name: string;
  address: string;
  type: 'pickup' | 'dropoff' | 'both';
  order: number;
  estimatedTime: string;
  students: StudentInfo[];
  coordinates: { lat: number; lng: number };
}

interface StudentInfo {
  id: string;
  name: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
}

interface RouteOverviewTabProps {
  route: SchoolRoute;
  onEdit: () => void;
  onViewDetails: () => void;
  onDelete: () => void;
}

export const RouteOverviewTab: React.FC<RouteOverviewTabProps> = ({
  route,
  onEdit,
  onViewDetails,
  onDelete
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-800">Planned</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRouteTypeBadge = (type: string) => {
    switch (type) {
      case 'morning':
        return <Badge className="bg-orange-100 text-orange-800">Morning</Badge>;
      case 'afternoon':
        return <Badge className="bg-purple-100 text-purple-800">Afternoon</Badge>;
      case 'both':
        return <Badge className="bg-indigo-100 text-indigo-800">Both</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const occupancyRate = route.capacity > 0 ? (route.currentPassengers / route.capacity) * 100 : 0;
  const profit = route.monthlyRevenue - route.monthlyCost;

  return (
    <div className="space-y-6">
      {/* Route Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bus className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">{route.routeName}</CardTitle>
                <p className="text-muted-foreground">Route #{route.routeNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(route.status)}
              {getRouteTypeBadge(route.routeType)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{route.schoolName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{route.estimatedDuration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{route.distance} km</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Passengers</p>
                <p className="text-2xl font-bold">{route.currentPassengers}/{route.capacity}</p>
                <p className="text-xs text-muted-foreground">{occupancyRate.toFixed(1)}% occupancy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Stops</p>
                <p className="text-2xl font-bold">{route.stops.length}</p>
                <p className="text-xs text-muted-foreground">Total stops</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">£{route.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">£{route.monthlyCost.toLocaleString()} costs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Profit</p>
                <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{profit.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Monthly profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle & Driver Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="w-5 h-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Registration</span>
              <span className="font-medium">{route.vehicleRegistration || 'Not assigned'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Capacity</span>
              <span className="font-medium">{route.capacity} passengers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fuel Consumption</span>
              <span className="font-medium">{route.fuelConsumption} L/100km</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Driver</span>
              <span className="font-medium">{route.driverName || 'Not assigned'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="font-medium">{route.driverPhone || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="outline">Available</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* School Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            School Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{route.contactPerson}</p>
                <p className="text-xs text-muted-foreground">Contact Person</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{route.contactPhone}</p>
                <p className="text-xs text-muted-foreground">Phone</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{route.contactEmail}</p>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Requirements */}
      {route.specialRequirements && route.specialRequirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Special Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {route.specialRequirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{requirement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {route.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{route.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button onClick={onViewDetails} className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button variant="outline" onClick={onEdit} className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Edit Route
            </Button>
            <Button variant="destructive" onClick={onDelete} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Route
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
