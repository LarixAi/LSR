
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, DollarSign, Users, Building } from 'lucide-react';

interface RouteData {
  id: string;
  name: string;
  start_location: string;
  end_location: string;
  estimated_duration?: number;
  distance_km?: number;
  is_active: boolean;
  transport_company?: string;
  route_number?: string;
  morning_run_payment?: number;
  afternoon_run_payment?: number;
  student_count?: number;
  description?: string;
}

interface RouteViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: RouteData;
}

const RouteViewDialog: React.FC<RouteViewDialogProps> = ({ open, onOpenChange, route }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Route Details: {route.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Route Name</label>
                  <p className="text-lg font-semibold">{route.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    route.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {route.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {route.transport_company && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Transport Company</label>
                      <p>{route.transport_company}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Route Number</label>
                    <p>{route.route_number}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Route</label>
                  <p>{route.start_location} → {route.end_location}</p>
                </div>
              </div>

              {route.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-800">{route.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Route Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Route Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {route.estimated_duration && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Duration</label>
                      <p>{route.estimated_duration} minutes</p>
                    </div>
                  </div>
                )}
                
                {route.distance_km && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Distance</label>
                      <p>{route.distance_km} km</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Students</label>
                    <p>{route.student_count || 0} assigned</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {(route.morning_run_payment || route.afternoon_run_payment) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {route.morning_run_payment && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-yellow-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">Morning Run</label>
                        <p className="text-lg font-semibold text-green-600">R {route.morning_run_payment.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  
                  {route.afternoon_run_payment && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">Afternoon Run</label>
                        <p className="text-lg font-semibold text-green-600">R {route.afternoon_run_payment.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RouteViewDialog;
