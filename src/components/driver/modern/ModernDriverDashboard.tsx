import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, AlertTriangle } from 'lucide-react';

const ModernDriverDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Driver Dashboard
          </CardTitle>
          <CardDescription>
            Welcome back! Here's your dashboard overview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm font-medium">Today's Schedule</p>
                <p className="text-xs text-gray-500">No assignments</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">Active Routes</p>
                <p className="text-xs text-gray-500">0 routes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm font-medium">Vehicle Status</p>
                <p className="text-xs text-gray-500">No vehicle assigned</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm font-medium">Next Inspection</p>
                <p className="text-xs text-gray-500">Not scheduled</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and actions you can perform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-16 flex-col">
              <Clock className="h-5 w-5 mb-1" />
              Clock In
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <MapPin className="h-5 w-5 mb-1" />
              View Routes
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <AlertTriangle className="h-5 w-5 mb-1" />
              Report Issue
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Calendar className="h-5 w-5 mb-1" />
              My Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your recent tasks and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity to display</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernDriverDashboard;