import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit, MapPin, Clock } from 'lucide-react';

const ChildManagement = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Child Management
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
              Manage your children's information and transportation details
            </p>
          </div>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Emma Johnson</span>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <p>8 years old</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Grade</label>
                <p>Year 3</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">School</label>
              <p>Greenfield Primary School</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Transport Schedule</label>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Pickup: 07:45 AM</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Dropoff: 03:30 PM</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>James Johnson</span>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <p>11 years old</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Grade</label>
                <p>Year 6</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">School</label>
              <p>Greenfield Primary School</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Transport Schedule</label>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Pickup: 07:45 AM</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Dropoff: 03:30 PM</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default ChildManagement;