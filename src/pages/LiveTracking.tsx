import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Navigation, Phone } from 'lucide-react';

const LiveTracking = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Live Tracking</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span>Vehicle Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Interactive map would be displayed here</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                <Badge variant="outline" className="text-green-600 border-green-600 mt-1">On Route</Badge>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">ETA</p>
                <p className="text-lg font-bold">8 minutes</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Speed</p>
                <p className="text-lg font-bold">25 mph</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Updates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Vehicle departed school</p>
                  <p className="text-sm text-muted-foreground">3:25 PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">All children boarded safely</p>
                  <p className="text-sm text-muted-foreground">3:20 PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Vehicle arrived at school</p>
                  <p className="text-sm text-muted-foreground">3:15 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Driver Contact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Sarah Williams</p>
                <p className="text-sm text-muted-foreground">Driver - Route 12</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Vehicle Information</p>
                <p>License Plate: BUS 123</p>
                <p>Vehicle Type: Minibus</p>
                <p>Capacity: 16 passengers</p>
              </div>
              
              <div>
                <Badge variant="outline" className="text-green-600 border-green-600">Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveTracking;