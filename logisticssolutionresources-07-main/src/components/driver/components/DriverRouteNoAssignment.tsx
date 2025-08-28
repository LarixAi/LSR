
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Route } from 'lucide-react';

interface DriverRouteNoAssignmentProps {
  userId?: string;
  assignmentError?: Error | null;
}

const DriverRouteNoAssignment: React.FC<DriverRouteNoAssignmentProps> = ({ userId, assignmentError }) => {
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
            <Route className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Route Assigned</h3>
          <p className="text-gray-600">You don't have a route assigned for today.</p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-sm text-gray-500"><strong>Debug Info:</strong></p>
            <p className="text-sm text-gray-500">User ID: {userId}</p>
            {assignmentError && (
              <p className="text-sm text-red-500 mt-1">Error: {assignmentError.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              If you should have a route assigned, please contact your administrator.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverRouteNoAssignment;
