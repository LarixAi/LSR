import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Clock, AlertTriangle, CheckCircle, Wrench, FileText, Plus } from 'lucide-react';
import { useVehicles } from '@/hooks/useVehicles';
import { useToast } from '@/hooks/use-toast';
import PageLoader from '@/components/common/PageLoader';

const VehicleServicePage = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { vehicles, loading } = useVehicles();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  console.log('VehicleServicePage component loaded with vehicleId:', vehicleId);

  if (loading) {
    return <PageLoader />;
  }

  const vehicle = vehicles.find(v => v.id === vehicleId);

  if (!vehicle) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/vehicles')}>
            Back to Vehicles
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      out_of_service: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.inactive;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const handleScheduleMaintenance = () => {
    toast({
      title: "Maintenance Scheduled",
      description: "Maintenance has been scheduled for this vehicle.",
    });
  };

  const handleUpdateService = () => {
    toast({
      title: "Service Updated",
      description: "Vehicle service information has been updated.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/vehicles')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Service: {vehicle.license_plate}</h1>
            <p className="text-gray-600">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusBadge(vehicle.status)}>
            {vehicle.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Button 
            variant="outline"
            onClick={() => navigate(`/vehicle-details/${vehicleId}`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Details
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Service</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Next Service</p>
                    <p className="font-semibold">{formatDate(vehicle.next_service_date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Wrench className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Service Interval</p>
                    <p className="font-semibold">{vehicle.service_interval_months || 6} months</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Current Mileage</p>
                    <p className="font-semibold">{vehicle.mileage?.toLocaleString() || 0} miles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">MOT Status</p>
                    <p className="font-semibold">
                      {vehicle.mot_expiry ? 
                        (new Date(vehicle.mot_expiry) > new Date() ? 'Valid' : 'Expired') : 
                        'Not Set'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Service Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicle.next_service_date && new Date(vehicle.next_service_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Service Due Soon</p>
                      <p className="text-sm text-yellow-700">Next service is due on {formatDate(vehicle.next_service_date)}</p>
                    </div>
                  </div>
                )}

                {vehicle.mot_expiry && new Date(vehicle.mot_expiry) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">MOT Expiring Soon</p>
                      <p className="text-sm text-red-700">MOT expires on {formatDate(vehicle.mot_expiry)}</p>
                    </div>
                  </div>
                )}

                {(!vehicle.next_service_date || new Date(vehicle.next_service_date) > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) &&
                 (!vehicle.mot_expiry || new Date(vehicle.mot_expiry) > new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)) && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">All Good</p>
                      <p className="text-sm text-green-700">No immediate service requirements</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Maintenance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Last Maintenance Date</Label>
                  <p className="text-lg mt-1">{formatDate(vehicle.last_maintenance)}</p>
                </div>
                <div>
                  <Label>Next Maintenance Date</Label>
                  <p className="text-lg mt-1">{formatDate(vehicle.next_maintenance)}</p>
                </div>
                <div>
                  <Label>Current Mileage</Label>
                  <p className="text-lg mt-1">{vehicle.mileage?.toLocaleString() || 0} miles</p>
                </div>
                <div>
                  <Label>Service Interval</Label>
                  <p className="text-lg mt-1">{vehicle.service_interval_months || 6} months</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleScheduleMaintenance} className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  View Service Records
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Service Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Schedule New Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine Maintenance</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="mot">MOT Test</SelectItem>
                      <SelectItem value="emergency">Emergency Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduleDate">Scheduled Date</Label>
                  <Input type="date" id="scheduleDate" />
                </div>
                <div>
                  <Label htmlFor="currentMileage">Current Mileage</Label>
                  <Input 
                    type="number" 
                    id="currentMileage" 
                    placeholder="Enter current mileage"
                    defaultValue={vehicle.mileage || 0}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Service Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the service requirements..."
                  rows={4}
                />
              </div>
              <Button onClick={handleUpdateService} className="w-full md:w-auto">
                Schedule Service
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder for service history */}
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No service history available</p>
                  <p className="text-sm">Service records will appear here once maintenance is performed.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleServicePage;