import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

const ParentNotifications = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Emma safely dropped off</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">Delivered</Badge>
                    <span className="text-sm text-muted-foreground">3:35 PM</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Emma has been safely dropped off at home. Driver confirmed arrival.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Vehicle approaching pickup location</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-600">En Route</Badge>
                    <span className="text-sm text-muted-foreground">7:40 AM</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">The school bus is 2 minutes away from Emma's pickup point.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Schedule change notification</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">Updated</Badge>
                    <span className="text-sm text-muted-foreground">Yesterday</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Tomorrow's pickup time has been adjusted to 7:50 AM due to route optimization.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Weather alert</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-orange-600 border-orange-600">Alert</Badge>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Heavy rain expected tomorrow morning. Additional safety measures will be in place.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Bell className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Weekly summary available</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Info</Badge>
                    <span className="text-sm text-muted-foreground">3 days ago</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Your child's transport summary for this week is now available in the reports section.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentNotifications;