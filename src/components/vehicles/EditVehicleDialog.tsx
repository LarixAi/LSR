import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUpdateVehicle, type Vehicle } from '@/hooks/useVehicles';
import { useVehicleDocuments, useDeleteVehicleDocument, type VehicleDocument } from '@/hooks/useVehicleDocuments';
import { Loader2, Car, Shield, Scale, AlertTriangle, CheckCircle, Wrench, Clock, FileText, Upload, Download, Eye, Trash2, Calendar, Tag, Star, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import VehicleDocumentUploadDialog from './VehicleDocumentUploadDialog';

interface EditVehicleFormData {
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vehicle_number: string;
  vehicle_type: 'bus' | 'coach' | 'hgv' | 'minibus' | 'double_decker_bus';
  status: 'active' | 'maintenance' | 'out_of_service';
  vin?: string;
  capacity: number;
  fuel_type?: string;
  mileage?: number;
  
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

interface EditVehicleDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EditVehicleDialog = ({ vehicle, open, onOpenChange, onSuccess }: EditVehicleDialogProps) => {
  const updateVehicle = useUpdateVehicle();
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = React.useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<EditVehicleFormData>({
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      license_plate: '',
      vehicle_number: '',
      vehicle_type: 'bus',
      status: 'active',
      vin: '',
      capacity: 0,
      fuel_type: 'Diesel',
      mileage: 0,
      
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

  // Reset form when vehicle changes
  React.useEffect(() => {
    if (vehicle) {
      reset({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        license_plate: vehicle.license_plate || '',
        vehicle_number: vehicle.vehicle_number || '',
        vehicle_type: (vehicle.type as 'bus' | 'coach' | 'hgv' | 'minibus' | 'double_decker_bus') || 'bus',
        status: (vehicle.status as 'active' | 'maintenance' | 'out_of_service') || 'active',
        vin: vehicle.vin || '',
        capacity: vehicle.capacity || 0,
        fuel_type: vehicle.fuel_type || 'Diesel',
        mileage: vehicle.mileage || 0,
        
        // ORV (Off-Road Vehicle) Fields - Default values for now
        orv_off_road_reason: '',
        orv_expected_return_date: '',
        orv_location: '',
        orv_responsible_person: '',
        orv_insurance_status: 'covered',
        orv_maintenance_type: 'planned',
        
        // BOR (Back On Road) Fields - Default values for now
        bor_return_ready: false,
        bor_safety_inspection_complete: false,
        bor_documentation_verified: false,
        bor_driver_assigned: false,
        bor_quality_assurance_complete: false,
        bor_return_authorization: 'pending',
      });
    }
  }, [vehicle, reset]);

  const onSubmit = async (data: EditVehicleFormData) => {
    if (!vehicle) return;

    // Basic validation
    if (!data.make.trim()) {
      toast({
        title: "Validation Error",
        description: "Make is required",
        variant: "destructive",
      });
      return;
    }

    if (!data.model.trim()) {
      toast({
        title: "Validation Error", 
        description: "Model is required",
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

    if (!data.vehicle_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Vehicle number is required",
        variant: "destructive", 
      });
      return;
    }

    try {
      await updateVehicle.mutateAsync({
        id: vehicle.id,
        updates: {
          make: data.make,
          model: data.model,
          year: data.year,
          license_plate: data.license_plate,
          vehicle_number: data.vehicle_number,
          type: data.vehicle_type,
          status: data.status,
          // vin: data.vin || null, // VIN field not supported in current Vehicle type
          capacity: data.capacity,
          fuel_type: data.fuel_type,
          mileage: data.mileage,
          
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
        },
      });

      toast({
        title: "Success",
        description: "Vehicle updated successfully!",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const getComplianceStatus = () => {
    if (!vehicle) return { status: 'unknown', icon: <Car className="w-4 h-4 text-gray-400" />, color: 'gray' };
    
    switch (vehicle.status) {
      case 'active':
        return { status: 'Compliant', icon: <CheckCircle className="w-4 h-4 text-green-600" />, color: 'green' };
      case 'maintenance':
        return { status: 'ORV: Maintenance', icon: <Wrench className="w-4 h-4 text-yellow-600" />, color: 'yellow' };
      case 'out_of_service':
        return { status: 'ORV: Off Road', icon: <AlertTriangle className="w-4 h-4 text-red-600" />, color: 'red' };
      default:
        return { status: 'Unknown', icon: <Car className="w-4 h-4 text-gray-400" />, color: 'gray' };
    }
  };

  const complianceStatus = getComplianceStatus();

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Edit Vehicle - {vehicle.vehicle_number}
          </DialogTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            Update vehicle details and ORV & BOR compliance settings
            <Badge variant="outline" className={`text-${complianceStatus.color}-600 border-${complianceStatus.color}-200`}>
              {complianceStatus.icon}
              {complianceStatus.status}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="orv">ORV Status</TabsTrigger>
              <TabsTrigger value="bor">BOR Status</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle_number">Vehicle Number</Label>
                  <Input 
                    id="vehicle_number"
                    placeholder="e.g., BUS001" 
                    {...register('vehicle_number', { required: true })}
                  />
                  {errors.vehicle_number && (
                    <p className="text-sm text-destructive mt-1">Vehicle number is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="license_plate">License Plate</Label>
                  <Input 
                    id="license_plate"
                    placeholder="e.g., LDN 001A" 
                    {...register('license_plate', { required: true })}
                  />
                  {errors.license_plate && (
                    <p className="text-sm text-destructive mt-1">License plate is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input 
                    id="make"
                    placeholder="e.g., Mercedes" 
                    {...register('make', { required: true })}
                  />
                  {errors.make && (
                    <p className="text-sm text-destructive mt-1">Make is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input 
                    id="model"
                    placeholder="e.g., Citaro" 
                    {...register('model', { required: true })}
                  />
                  {errors.model && (
                    <p className="text-sm text-destructive mt-1">Model is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input 
                    id="year"
                    type="number" 
                    placeholder="e.g., 2023"
                    {...register('year', { 
                      required: true,
                      valueAsNumber: true,
                      min: 1900,
                      max: new Date().getFullYear() + 1
                    })}
                  />
                  {errors.year && (
                    <p className="text-sm text-destructive mt-1">Valid year is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input 
                    id="capacity"
                    type="number" 
                    placeholder="e.g., 50"
                    {...register('capacity', { 
                      valueAsNumber: true,
                      min: 1
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="vehicle_type">Vehicle Type</Label>
                  <Select 
                    onValueChange={(value) => setValue('vehicle_type', value as any)}
                    defaultValue={watch('vehicle_type')}
                  >
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

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    onValueChange={(value) => setValue('status', value as any)}
                    defaultValue={watch('status')}
                  >
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

                <div>
                  <Label htmlFor="fuel_type">Fuel Type</Label>
                  <Select 
                    onValueChange={(value) => setValue('fuel_type', value)}
                    defaultValue={watch('fuel_type')}
                  >
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

                <div>
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input 
                    id="mileage"
                    type="number" 
                    placeholder="e.g., 50000"
                    {...register('mileage', { 
                      valueAsNumber: true,
                      min: 0
                    })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="vin">VIN (Optional)</Label>
                  <Input 
                    id="vin"
                    placeholder="Vehicle Identification Number" 
                    {...register('vin')}
                  />
                </div>
              </div>
            </TabsContent>

            {/* ORV Status Tab */}
            <TabsContent value="orv" className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-orange-800">ORV (Off-Road Vehicle) Management</span>
                </div>
                <p className="text-sm text-orange-700">
                  Manage off-road vehicle status, documentation, and compliance requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orv_off_road_reason">Reason for Off-Road Usage</Label>
                  <Textarea 
                    id="orv_off_road_reason"
                    placeholder="e.g., Scheduled maintenance, Emergency repairs, Operational requirements" 
                    {...register('orv_off_road_reason')}
                  />
                </div>

                <div>
                  <Label htmlFor="orv_expected_return_date">Expected Return Date</Label>
                  <Input 
                    id="orv_expected_return_date"
                    type="date" 
                    {...register('orv_expected_return_date')}
                  />
                </div>

                <div>
                  <Label htmlFor="orv_location">Location of Off-Road Usage</Label>
                  <Input 
                    id="orv_location"
                    placeholder="e.g., Maintenance facility, Storage location" 
                    {...register('orv_location')}
                  />
                </div>

                <div>
                  <Label htmlFor="orv_responsible_person">Responsible Person</Label>
                  <Input 
                    id="orv_responsible_person"
                    placeholder="e.g., Fleet Manager, Maintenance Supervisor" 
                    {...register('orv_responsible_person')}
                  />
                </div>

                <div>
                  <Label htmlFor="orv_insurance_status">Insurance Status</Label>
                  <Select 
                    onValueChange={(value) => setValue('orv_insurance_status', value as any)}
                    defaultValue={watch('orv_insurance_status')}
                  >
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

                <div>
                  <Label htmlFor="orv_maintenance_type">Maintenance Type</Label>
                  <Select 
                    onValueChange={(value) => setValue('orv_maintenance_type', value as any)}
                    defaultValue={watch('orv_maintenance_type')}
                  >
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
            </TabsContent>

            {/* BOR Status Tab */}
            <TabsContent value="bor" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">BOR (Back On Road) Management</span>
                </div>
                <p className="text-sm text-blue-700">
                  Manage vehicle return to service process and compliance verification.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bor_return_ready"
                      checked={watch('bor_return_ready')}
                      onCheckedChange={(checked) => setValue('bor_return_ready', checked as boolean)}
                    />
                    <Label htmlFor="bor_return_ready">Return Ready</Label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bor_safety_inspection_complete"
                      checked={watch('bor_safety_inspection_complete')}
                      onCheckedChange={(checked) => setValue('bor_safety_inspection_complete', checked as boolean)}
                    />
                    <Label htmlFor="bor_safety_inspection_complete">Safety Inspection Complete</Label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bor_documentation_verified"
                      checked={watch('bor_documentation_verified')}
                      onCheckedChange={(checked) => setValue('bor_documentation_verified', checked as boolean)}
                    />
                    <Label htmlFor="bor_documentation_verified">Documentation Verified</Label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bor_driver_assigned"
                      checked={watch('bor_driver_assigned')}
                      onCheckedChange={(checked) => setValue('bor_driver_assigned', checked as boolean)}
                    />
                    <Label htmlFor="bor_driver_assigned">Driver Assigned</Label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bor_quality_assurance_complete"
                      checked={watch('bor_quality_assurance_complete')}
                      onCheckedChange={(checked) => setValue('bor_quality_assurance_complete', checked as boolean)}
                    />
                    <Label htmlFor="bor_quality_assurance_complete">Quality Assurance Complete</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bor_return_authorization">Return Authorization</Label>
                  <Select 
                    onValueChange={(value) => setValue('bor_return_authorization', value as any)}
                    defaultValue={watch('bor_return_authorization')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select return authorization status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">Compliance Overview</span>
                </div>
                <p className="text-sm text-green-700">
                  View and manage overall compliance status and requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{complianceStatus.icon}</div>
                  <div className="font-semibold mt-2">Current Status</div>
                  <div className="text-sm text-gray-600">{complianceStatus.status}</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Clock className="w-8 h-8 mx-auto text-orange-600" />
                  <div className="font-semibold mt-2">ORV Duration</div>
                  <div className="text-sm text-gray-600">
                    {vehicle.status === 'active' ? 'N/A' : 'Tracked'}
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <FileText className="w-8 h-8 mx-auto text-green-600" />
                  <div className="font-semibold mt-2">Documentation</div>
                  <div className="text-sm text-gray-600">
                    {vehicle.status === 'active' ? 'Complete' : 'Required'}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Compliance Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check1" checked={vehicle.status === 'active'} disabled />
                    <Label htmlFor="check1">Vehicle Roadworthy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check2" checked={vehicle.status === 'active'} disabled />
                    <Label htmlFor="check2">Documentation Current</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check3" checked={vehicle.status === 'active'} disabled />
                    <Label htmlFor="check3">Insurance Valid</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check4" checked={vehicle.status === 'active'} disabled />
                    <Label htmlFor="check4">Driver Assigned</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Vehicle Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage all documents related to this vehicle
                  </p>
                </div>
                <Button onClick={() => setIsDocumentUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>

              <VehicleDocumentsList vehicleId={vehicle.id} vehicleNumber={vehicle.vehicle_number} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Vehicle
            </Button>
          </div>
        </form>

        {/* Document Upload Dialog */}
        <VehicleDocumentUploadDialog
          open={isDocumentUploadOpen}
          onOpenChange={setIsDocumentUploadOpen}
          vehicleId={vehicle.id}
          vehicleNumber={vehicle.vehicle_number}
          allowVehicleSelection={false}
        />
      </DialogContent>
    </Dialog>
  );
};

// Vehicle Documents List Component
interface VehicleDocumentsListProps {
  vehicleId: string;
  vehicleNumber: string;
}

const VehicleDocumentsList = ({ vehicleId, vehicleNumber }: VehicleDocumentsListProps) => {
  const { data: documents = [], isLoading } = useVehicleDocuments(vehicleId);
  const deleteDocument = useDeleteVehicleDocument();

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument.mutateAsync({ id: documentId, vehicleId });
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleDownloadDocument = (document: VehicleDocument) => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    } else {
      toast.error('Download URL not available');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading documents...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
          <p className="text-gray-500 text-center mb-4">
            Upload documents like registration, insurance, MOT certificates, and maintenance records.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {document.is_favorite && <Star className="h-4 w-4 text-yellow-500" />}
                      {!document.is_public && <Lock className="h-4 w-4 text-red-500" />}
                      <div>
                        <div className="font-medium">{document.name}</div>
                        {document.description && (
                          <div className="text-sm text-gray-500">{document.description}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{document.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(document.status)}>
                      {document.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {document.priority && (
                      <Badge className={getPriorityColor(document.priority)}>
                        {document.priority}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(document.uploaded_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {document.expiry_date ? (
                      <div className="text-sm">
                        {new Date(document.expiry_date).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">No expiry</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(document)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(document.file_url, '_blank')}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{documents.length}</div>
                <div className="text-sm text-gray-600">Total Documents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'expired').length}
                </div>
                <div className="text-sm text-gray-600">Expired</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {documents.filter(d => !d.is_public).length}
                </div>
                <div className="text-sm text-gray-600">Confidential</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditVehicleDialog;