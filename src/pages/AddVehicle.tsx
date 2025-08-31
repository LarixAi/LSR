import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateVehicle } from '@/hooks/useVehicles';
import { useNavigate } from 'react-router-dom';
import { Loader2, Car, Shield, Scale, AlertTriangle, CheckCircle, ArrowLeft, Home, Save } from 'lucide-react';
import { toast } from 'sonner';

interface VehicleFormData {
  vehicle_number: string;
  license_plate: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  vehicle_type: 'bus' | 'coach' | 'hgv' | 'minibus' | 'double_decker_bus';
  fuel_type?: string;
  color?: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'out_of_service';
  purchase_date?: string;
  registration_expiry?: string;
  insurance_expiry?: string;
  service_interval_months?: number;
  notes?: string;
  
  // ORV (Off-Road Vehicle) Fields
  orv_off_road_reason?: string;
  orv_expected_return_date?: string;
  orv_location?: string;
  orv_responsible_person?: string;
  orv_insurance_status?: 'covered' | 'suspended' | 'expired';
  orv_maintenance_type?: 'planned' | 'unplanned' | 'operational' | 'regulatory';
  
  // BOR (Back On Road) Fields
  bor_return_ready?: boolean;
  bor_safety_inspection_complete?: boolean;
  bor_documentation_verified?: boolean;
  bor_driver_assigned?: boolean;
  bor_quality_assurance_complete?: boolean;
  bor_return_authorization?: 'pending' | 'approved' | 'rejected';
}

const AddVehicle = () => {
  const createVehicle = useCreateVehicle();
  const navigate = useNavigate();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<VehicleFormData>({
    defaultValues: {
      vehicle_number: '',
      license_plate: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      vehicle_type: 'bus',
      fuel_type: 'Diesel',
      color: '',
      capacity: 1,
      status: 'active',
      purchase_date: '',
      registration_expiry: '',
      insurance_expiry: '',
      service_interval_months: 6,
      notes: '',
      
      // ORV (Off-Road Vehicle) Fields
      orv_off_road_reason: '',
      orv_expected_return_date: '',
      orv_location: '',
      orv_responsible_person: '',
      orv_insurance_status: 'covered',
      orv_maintenance_type: 'planned',
      
      // BOR (Back On Road) Fields
      bor_return_ready: false,
      bor_safety_inspection_complete: false,
      bor_documentation_verified: false,
      bor_driver_assigned: false,
      bor_quality_assurance_complete: false,
      bor_return_authorization: 'pending',
    },
  });

  const onSubmit = async (data: VehicleFormData) => {
    // Basic validation
    if (!data.vehicle_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Vehicle number is required",
        variant: "destructive",
      });
      return;
    }

    if (!data.license_plate.trim()) {
      toast({
        title: "Validation Error",
        description: "License plate is required",
        variant: "destructive",
      });
      return;
    }

    if (data.capacity < 1) {
      toast({
        title: "Validation Error",
        description: "Capacity must be at least 1",
        variant: "destructive",
      });
      return;
    }

    try {
      await createVehicle.mutateAsync({
        vehicle_number: data.vehicle_number,
        license_plate: data.license_plate,
        make: data.make || null,
        model: data.model || null,
        year: data.year || null,
        // vin: data.vin || null, // VIN field not supported in current Vehicle type
        type: data.vehicle_type,
        fuel_type: data.fuel_type || null,
        // color: data.color || null, // Color field not supported in current Vehicle type
        capacity: data.capacity,
        status: data.status,
        // purchase_date: data.purchase_date || null, // Purchase date field not supported in current Vehicle type
        // registration_expiry: data.registration_expiry || null, // Registration expiry field not supported in current Vehicle type
        // insurance_expiry: data.insurance_expiry || null, // Insurance expiry field not supported in current Vehicle type
        // service_interval_months: data.service_interval_months || null, // Service interval field not supported in current Vehicle type
        // notes: data.notes || null, // Notes field not supported in current Vehicle type
        
        // ORV (Off-Road Vehicle) Fields - Not supported in current Vehicle type
        // orv_off_road_reason: data.orv_off_road_reason || null,
        // orv_expected_return_date: data.orv_expected_return_date || null,
        // orv_location: data.orv_location || null,
        // orv_responsible_person: data.orv_responsible_person || null,
        // orv_insurance_status: data.orv_insurance_status || null,
        // orv_maintenance_type: data.orv_maintenance_type || null,
        
        // BOR (Back On Road) Fields - Not supported in current Vehicle type
        // bor_return_ready: data.bor_return_ready || null,
        // bor_safety_inspection_complete: data.bor_safety_inspection_complete || null,
        // bor_documentation_verified: data.bor_documentation_verified || null,
        // bor_driver_assigned: data.bor_driver_assigned || null,
        // bor_quality_assurance_complete: data.bor_quality_assurance_complete || null,
        // bor_return_authorization: data.bor_return_authorization || null,
      });

      toast({
        title: "Success",
        description: "Vehicle added successfully!",
      });

      navigate('/vehicle-management');
      reset();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    reset();
    navigate('/vehicle-management');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/vehicle-management')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Vehicle Management
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Vehicle</h1>
                    <p className="text-gray-600">Register a new vehicle in your fleet management system</p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="orv" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                ORV Status
              </TabsTrigger>
              <TabsTrigger value="bor" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                BOR Process
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Provide the essential details for the new vehicle
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_number">Vehicle Number *</Label>
                      <Input
                        id="vehicle_number"
                        {...register('vehicle_number')}
                        placeholder="e.g., BUS001"
                        className={errors.vehicle_number ? 'border-red-500' : ''}
                      />
                      {errors.vehicle_number && (
                        <p className="text-sm text-red-500">{errors.vehicle_number.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license_plate">License Plate *</Label>
                      <Input
                        id="license_plate"
                        {...register('license_plate')}
                        placeholder="e.g., AB12 CDE"
                        className={errors.license_plate ? 'border-red-500' : ''}
                      />
                      {errors.license_plate && (
                        <p className="text-sm text-red-500">{errors.license_plate.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        {...register('make')}
                        placeholder="e.g., Ford, Mercedes"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        {...register('model')}
                        placeholder="e.g., Transit, Sprinter"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        {...register('year', { valueAsNumber: true })}
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_type">Vehicle Type *</Label>
                      <Select onValueChange={(value) => setValue('vehicle_type', value as any)} defaultValue="bus">
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bus">Bus</SelectItem>
                          <SelectItem value="coach">Coach</SelectItem>
                          <SelectItem value="hgv">HGV</SelectItem>
                          <SelectItem value="minibus">Minibus</SelectItem>
                          <SelectItem value="double_decker_bus">Double Decker Bus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity">Passenger Capacity *</Label>
                      <Input
                        id="capacity"
                        type="number"
                        {...register('capacity', { valueAsNumber: true, min: 1 })}
                        placeholder="e.g., 50"
                        className={errors.capacity ? 'border-red-500' : ''}
                      />
                      {errors.capacity && (
                        <p className="text-sm text-red-500">{errors.capacity.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Additional notes about the vehicle..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Information Tab */}
            <TabsContent value="technical" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Technical Information
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Technical specifications and maintenance details
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="vin">VIN Number</Label>
                      <Input
                        id="vin"
                        {...register('vin')}
                        placeholder="Vehicle Identification Number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fuel_type">Fuel Type</Label>
                      <Select onValueChange={(value) => setValue('fuel_type', value)} defaultValue="Diesel">
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Petrol">Petrol</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="LPG">LPG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        {...register('color')}
                        placeholder="e.g., White, Blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select onValueChange={(value) => setValue('status', value as any)} defaultValue="active">
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="out_of_service">Out of Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="purchase_date">Purchase Date</Label>
                      <Input
                        id="purchase_date"
                        type="date"
                        {...register('purchase_date')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registration_expiry">Registration Expiry</Label>
                      <Input
                        id="registration_expiry"
                        type="date"
                        {...register('registration_expiry')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurance_expiry">Insurance Expiry</Label>
                      <Input
                        id="insurance_expiry"
                        type="date"
                        {...register('insurance_expiry')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service_interval_months">Service Interval (Months)</Label>
                    <Input
                      id="service_interval_months"
                      type="number"
                      {...register('service_interval_months', { valueAsNumber: true })}
                      placeholder="6"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ORV Status Tab */}
            <TabsContent value="orv" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Off-Road Vehicle (ORV) Status
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Track off-road vehicle status and maintenance
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="orv_off_road_reason">Off-Road Reason</Label>
                      <Input
                        id="orv_off_road_reason"
                        {...register('orv_off_road_reason')}
                        placeholder="e.g., Scheduled maintenance, repairs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orv_expected_return_date">Expected Return Date</Label>
                      <Input
                        id="orv_expected_return_date"
                        type="date"
                        {...register('orv_expected_return_date')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="orv_location">Current Location</Label>
                      <Input
                        id="orv_location"
                        {...register('orv_location')}
                        placeholder="e.g., Depot Yard A, Maintenance Bay 3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orv_responsible_person">Responsible Person</Label>
                      <Input
                        id="orv_responsible_person"
                        {...register('orv_responsible_person')}
                        placeholder="e.g., John Smith, Maintenance Team"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="orv_insurance_status">Insurance Status</Label>
                      <Select onValueChange={(value) => setValue('orv_insurance_status', value as any)} defaultValue="covered">
                        <SelectTrigger>
                          <SelectValue placeholder="Select insurance status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="covered">Covered</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orv_maintenance_type">Maintenance Type</Label>
                      <Select onValueChange={(value) => setValue('orv_maintenance_type', value as any)} defaultValue="planned">
                        <SelectTrigger>
                          <SelectValue placeholder="Select maintenance type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="unplanned">Unplanned</SelectItem>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="regulatory">Regulatory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* BOR Process Tab */}
            <TabsContent value="bor" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Back On Road (BOR) Process
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Track the process of bringing vehicles back into service
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bor_return_ready"
                        {...register('bor_return_ready')}
                      />
                      <Label htmlFor="bor_return_ready">Return Ready</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bor_safety_inspection_complete"
                        {...register('bor_safety_inspection_complete')}
                      />
                      <Label htmlFor="bor_safety_inspection_complete">Safety Inspection Complete</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bor_documentation_verified"
                        {...register('bor_documentation_verified')}
                      />
                      <Label htmlFor="bor_documentation_verified">Documentation Verified</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bor_driver_assigned"
                        {...register('bor_driver_assigned')}
                      />
                      <Label htmlFor="bor_driver_assigned">Driver Assigned</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bor_quality_assurance_complete"
                        {...register('bor_quality_assurance_complete')}
                      />
                      <Label htmlFor="bor_quality_assurance_complete">Quality Assurance Complete</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bor_return_authorization">Return Authorization</Label>
                      <Select onValueChange={(value) => setValue('bor_return_authorization', value as any)} defaultValue="pending">
                        <SelectTrigger>
                          <SelectValue placeholder="Select authorization status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Car className="w-4 h-4" />
                <span>Vehicle will be added to your fleet management system</span>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding Vehicle...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
