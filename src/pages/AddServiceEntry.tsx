import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVehicles } from '@/hooks/useVehicles';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Car, 
  Clock, 
  Shield, 
  ArrowLeft, 
  Home, 
  Save,
  Plus,
  Trash2,
  FileText,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceEntryFormData {
  serviceId: string;
  vehicleId: string;
  serviceType: string;
  serviceDate: string;
  serviceLocation: string;
  technicianName: string;
  currentMileage: number;
  serviceDescription: string;
  workPerformed: string;
  serviceCategory: string;
  laborHours: number;
  workOrderNumber: string;
  partsCost: number;
  laborCost: number;
  totalServiceCost: number;
  warrantyInfo: string;
  invoiceNumber: string;
  serviceQualityCheck: boolean;
  safetyChecksCompleted: boolean;
  complianceNotes: string;
  nextServiceDue: string;
  serviceInterval: number;
  notes: string;
  supervisorApproval: boolean;
  supervisorName: string;
  approvalDate: string;
}

const AddServiceEntry = () => {
  const { data: vehicles = [] } = useVehicles();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceEntryFormData>({
    defaultValues: {
      serviceId: `SVC-${Date.now()}`,
      serviceType: 'routine',
      serviceDate: new Date().toISOString().split('T')[0],
      serviceCategory: 'engine',
      laborHours: 1,
      partsCost: 0,
      laborCost: 0,
      totalServiceCost: 0,
      serviceQualityCheck: false,
      safetyChecksCompleted: false,
      supervisorApproval: false,
    },
  });

  const calculateTotalCost = () => {
    const partsCost = form.getValues('partsCost') || 0;
    const laborCost = (form.getValues('laborHours') || 0) * 50;
    const total = partsCost + laborCost;
    form.setValue('totalServiceCost', total);
    form.setValue('laborCost', laborCost);
  };

  const onSubmit = async (data: ServiceEntryFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Service Entry Data:', data);
      
      toast({
        title: "Success",
        description: "Service entry created successfully",
      });
      
      navigate('/vehicle-management');
    } catch (error) {
      console.error('Error creating service entry:', error);
      toast({
        title: "Error",
        description: "Failed to create service entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                    <Wrench className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add Service Entry</h1>
                    <p className="text-gray-600">Record vehicle maintenance and service activities</p>
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="service" className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Service Details
              </TabsTrigger>
              <TabsTrigger value="parts" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Parts & Costs
              </TabsTrigger>
              <TabsTrigger value="quality" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Quality & Compliance
              </TabsTrigger>
              <TabsTrigger value="additional" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Additional
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
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="serviceId">Service ID</Label>
                      <Input
                        id="serviceId"
                        {...form.register('serviceId')}
                        placeholder="Auto-generated"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleId">Vehicle *</Label>
                      <Select onValueChange={(value) => form.setValue('vehicleId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Service Type *</Label>
                      <Select onValueChange={(value) => form.setValue('serviceType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine Maintenance</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="inspection">Inspection</SelectItem>
                          <SelectItem value="emergency">Emergency Service</SelectItem>
                          <SelectItem value="scheduled">Scheduled Service</SelectItem>
                          <SelectItem value="breakdown">Breakdown Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceDate">Service Date *</Label>
                      <Input
                        id="serviceDate"
                        type="date"
                        {...form.register('serviceDate')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="serviceLocation">Service Location</Label>
                      <Input
                        id="serviceLocation"
                        {...form.register('serviceLocation')}
                        placeholder="e.g., Main Depot, Workshop A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="technicianName">Technician Name</Label>
                      <Input
                        id="technicianName"
                        {...form.register('technicianName')}
                        placeholder="e.g., John Smith"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentMileage">Current Mileage</Label>
                    <Input
                      id="currentMileage"
                      type="number"
                      {...form.register('currentMileage', { valueAsNumber: true })}
                      placeholder="e.g., 125000"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service Details Tab */}
            <TabsContent value="service" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Service Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="serviceCategory">Service Category</Label>
                      <Select onValueChange={(value) => form.setValue('serviceCategory', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engine">Engine</SelectItem>
                          <SelectItem value="transmission">Transmission</SelectItem>
                          <SelectItem value="brakes">Brakes</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="suspension">Suspension</SelectItem>
                          <SelectItem value="body">Body</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="laborHours">Labor Hours</Label>
                      <Input
                        id="laborHours"
                        type="number"
                        step="0.5"
                        {...form.register('laborHours', { valueAsNumber: true })}
                        placeholder="e.g., 2.5"
                        onChange={(e) => {
                          form.setValue('laborHours', parseFloat(e.target.value) || 0);
                          calculateTotalCost();
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workOrderNumber">Work Order Number</Label>
                    <Input
                      id="workOrderNumber"
                      {...form.register('workOrderNumber')}
                      placeholder="e.g., WO-2024-001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceDescription">Service Description *</Label>
                    <Textarea
                      id="serviceDescription"
                      {...form.register('serviceDescription')}
                      placeholder="Brief description of the service required..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workPerformed">Work Performed</Label>
                    <Textarea
                      id="workPerformed"
                      {...form.register('workPerformed')}
                      placeholder="Detailed description of work completed..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Parts & Costs Tab */}
            <TabsContent value="parts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Parts & Costs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="partsCost">Parts Cost (£)</Label>
                      <Input
                        id="partsCost"
                        type="number"
                        step="0.01"
                        {...form.register('partsCost', { valueAsNumber: true })}
                        placeholder="0.00"
                        onChange={(e) => {
                          form.setValue('partsCost', parseFloat(e.target.value) || 0);
                          calculateTotalCost();
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="laborCost">Labor Cost (£)</Label>
                      <Input
                        id="laborCost"
                        value={form.watch('laborCost').toFixed(2)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Total Service Cost (£)</Label>
                    <Input
                      value={form.watch('totalServiceCost').toFixed(2)}
                      readOnly
                      className="bg-blue-50 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="warrantyInfo">Warranty Information</Label>
                      <Input
                        id="warrantyInfo"
                        {...form.register('warrantyInfo')}
                        placeholder="e.g., 12 months parts, 6 months labor"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input
                        id="invoiceNumber"
                        {...form.register('invoiceNumber')}
                        placeholder="e.g., INV-2024-001"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quality & Compliance Tab */}
            <TabsContent value="quality" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Quality & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="serviceQualityCheck"
                        checked={form.watch('serviceQualityCheck')}
                        onCheckedChange={(checked) => form.setValue('serviceQualityCheck', checked as boolean)}
                      />
                      <Label htmlFor="serviceQualityCheck">Service Quality Check Completed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="safetyChecksCompleted"
                        checked={form.watch('safetyChecksCompleted')}
                        onCheckedChange={(checked) => form.setValue('safetyChecksCompleted', checked as boolean)}
                      />
                      <Label htmlFor="safetyChecksCompleted">Safety Checks Completed</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nextServiceDue">Next Service Due</Label>
                      <Input
                        id="nextServiceDue"
                        type="date"
                        {...form.register('nextServiceDue')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceInterval">Service Interval (miles)</Label>
                      <Input
                        id="serviceInterval"
                        type="number"
                        {...form.register('serviceInterval', { valueAsNumber: true })}
                        placeholder="e.g., 10000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complianceNotes">Compliance Notes</Label>
                    <Textarea
                      id="complianceNotes"
                      {...form.register('complianceNotes')}
                      placeholder="Notes about regulatory compliance, safety standards, etc..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional Information Tab */}
            <TabsContent value="additional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      {...form.register('notes')}
                      placeholder="Any additional information about the service..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="supervisorName">Supervisor Name</Label>
                      <Input
                        id="supervisorName"
                        {...form.register('supervisorName')}
                        placeholder="e.g., Manager Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="approvalDate">Approval Date</Label>
                      <Input
                        id="approvalDate"
                        type="date"
                        {...form.register('approvalDate')}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="supervisorApproval"
                      checked={form.watch('supervisorApproval')}
                      onCheckedChange={(checked) => form.setValue('supervisorApproval', checked as boolean)}
                    />
                    <Label htmlFor="supervisorApproval">Supervisor Approval Received</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wrench className="w-4 h-4" />
                <span>Service entry will be recorded in the system</span>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/vehicle-management')}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Service Entry
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

export default AddServiceEntry;
