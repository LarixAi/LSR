import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Shield, 
  Fuel, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Wrench,
  FileText,
  Clock,
  Activity
} from 'lucide-react';
import { Vehicle, VehicleCheck } from './types';

interface DriverVehicleCardProps {
  vehicle?: Vehicle;
  vehicleChecks: VehicleCheck[];
  isMobile: boolean;
  onStartInspection: () => void;
}


const DriverVehicleCard: React.FC<DriverVehicleCardProps> = ({ 
  vehicle, 
  vehicleChecks, 
  isMobile, 
  onStartInspection 
}) => {
  if (!vehicle) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Car className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No Vehicle Assigned</h3>
          <p className="text-sm text-gray-400 text-center">
            Contact your supervisor to get assigned to a vehicle
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMotExpiryStatus = () => {
    if (!vehicle.mot_expiry) return { status: 'unknown', color: 'gray' };
    
    const motDate = new Date(vehicle.mot_expiry);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((motDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'red' };
    if (daysUntilExpiry <= 30) return { status: 'expiring soon', color: 'yellow' };
    return { status: 'valid', color: 'green' };
  };

  // Mock service status since columns don't exist
  const getServiceStatus = () => {
    return { status: 'scheduled', color: 'green' };
  };

  const recentChecks = vehicleChecks.slice(0, 3);
  const lastCheck = recentChecks[0];
  const motStatus = getMotExpiryStatus();
  const serviceStatus = getServiceStatus();

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
      {/* Vehicle Information Card */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-blue-600" />
            <span>My Vehicle</span>
          </CardTitle>
          <CardDescription>Current assignment details</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Vehicle Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>
                {vehicle.vehicle_number}
              </h3>
              <Badge className="bg-blue-100 text-blue-800">
                {vehicle.type || 'Bus'}
              </Badge>
            </div>
            <p className="text-gray-600">{vehicle.make} {vehicle.model}</p>
            <p className="text-sm text-gray-500">License: {vehicle.license_plate}</p>
          </div>

          {/* Quick Status Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-3 gap-3'}`}>
            {/* MOT Status */}
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Shield className={`w-5 h-5 mx-auto mb-1 text-${motStatus.color}-500`} />
              <p className="text-xs font-medium text-gray-600">MOT</p>
              <p className={`text-xs text-${motStatus.color}-600 font-semibold`}>
                {motStatus.status}
              </p>
            </div>

            {/* Service Status */}
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Wrench className={`w-5 h-5 mx-auto mb-1 text-${serviceStatus.color}-500`} />
              <p className="text-xs font-medium text-gray-600">Service</p>
              <p className={`text-xs text-${serviceStatus.color}-600 font-semibold`}>
                {serviceStatus.status}
              </p>
            </div>

            {/* Mock fuel level since column doesn't exist */}
            {!isMobile && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Fuel className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xs font-medium text-gray-600">Fuel</p>
                <p className="text-xs text-blue-600 font-semibold">75%</p>
              </div>
            )}
          </div>

          {/* Simplified Status - remove non-existent fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">MOT Expiry:</span>
              <span className={`font-medium text-${motStatus.color}-600`}>
                {formatDate(vehicle.mot_expiry)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'} mt-4`}>
            <Button 
              onClick={onStartInspection}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Start Inspection
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Documents
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Checks History */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>Recent Inspections</span>
          </CardTitle>
          <CardDescription>
            {recentChecks.length > 0 
              ? `${recentChecks.length} checks in the last week`
              : "No recent inspections found"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {recentChecks.length > 0 ? (
            <>
              {/* Latest Check Highlight */}
              {lastCheck && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-800">Latest Check</h4>
                    <Badge className="bg-green-100 text-green-800">
                      {lastCheck.compliance_status || (lastCheck.issues_found ? 'Issues Found' : 'Passed')}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(lastCheck.check_date)}</span>
                  </div>
                  {lastCheck.defects_reported && (
                    <div className="mt-2 text-xs text-green-600 bg-white rounded p-2">
                      <strong>Issues:</strong> {lastCheck.issues_found ? 'Issues found' : 'No issues'}
                    </div>
                  )}
                </div>
              )}

              {/* Check History */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Check History</h4>
                {recentChecks.map((check, index) => (
                  <div key={check.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-2">
                      {check.compliance_status === 'passed' || !check.issues_found ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                        {formatDate(check.check_date)}
                      </span>
                    </div>
                    <Badge variant={check.compliance_status === 'passed' ? 'default' : 'secondary'} className="text-xs">
                      {check.compliance_status || (check.issues_found ? 'Issues' : 'Passed')}
                    </Badge>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                View All Inspections
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No recent inspections</p>
              <p className="text-sm text-gray-400 mb-4">Start your first vehicle check</p>
              <Button onClick={onStartInspection} className="bg-blue-600 hover:bg-blue-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Start Inspection Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverVehicleCard;