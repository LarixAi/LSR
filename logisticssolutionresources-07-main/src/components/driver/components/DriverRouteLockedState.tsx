
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Route, Lock } from 'lucide-react';

const DriverRouteLockedState = () => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-xl">
          <Route className="w-6 h-6 text-primary" />
          <span>Today's Route</span>
        </CardTitle>
        <CardDescription className="text-base">Your assigned route for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Check Required</h3>
          <p className="text-gray-600">Complete your daily vehicle check to access route information.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverRouteLockedState;
