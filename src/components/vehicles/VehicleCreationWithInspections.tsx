import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Car, 
  Calendar, 
  Settings, 
  Plus, 
  AlertCircle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface InspectionTemplate {
  id: string;
  name: string;
  description: string;
  inspection_type: string;
  frequency_days: number;
  is_active: boolean;
}

interface VehicleFormData {
  vehicle_number: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
  vin: string;
  fuel_type: string;
  transmission: string;
  color: string;
  mileage: string;
  notes: string;
}

interface InspectionSchedule {
  template_id: string;
  frequency_days: number;
  next_inspection_date: string;
  assigned_driver_id?: string;
  notes?: string;
}

const VehicleCreationWithInspections = () => {
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicleData, setVehicleData] = useState<VehicleFormData>({
    vehicle_number: '',
    make: '',
    model: '',
    year: '',
    license_plate: '',
    vin: '',
    fuel_type: '',
    transmission: '',
    color: '',
    mileage: '',
    notes: ''
  });

  const [inspectionSchedules, setInspectionSchedules] = useState<InspectionSchedule[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  // Fetch inspection templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['inspection-templates', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) return [];
      
      const { data, error } = await supabase
        .from('inspection_templates')
        .select('*')
        .eq('organization_id', selectedOrganizationId)
        .eq('is_active', true)
        .order('frequency_days', { ascending: true });

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return data as InspectionTemplate[];
    },
    enabled: !!selectedOrganizationId
  });

  // Fetch drivers for assignment
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('organization_id', selectedOrganizationId)
        .eq('role', 'driver')
        .order('first_name');

      if (error) {
        console.error('Error fetching drivers:', error);
        return [];
      }

      return data;
    },
    enabled: !!selectedOrganizationId
  });

  // Create vehicle with inspections mutation
  const createVehicleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrganizationId || !profile?.id) {
        throw new Error('Missing organization or user data');
      }

      // Start a transaction
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          ...vehicleData,
          organization_id: selectedOrganizationId,
          created_by: profile.id,
          status: 'active'
        })
        .select()
        .single();

      if (vehicleError) {
        throw vehicleError;
      }

      // Create inspection schedules for the vehicle
      const schedulePromises = inspectionSchedules.map(schedule => 
        supabase
          .from('inspection_schedules')
          .insert({
            vehicle_id: vehicle.id,
            template_id: schedule.template_id,
            scheduled_date: schedule.next_inspection_date,
            assigned_driver_id: schedule.assigned_driver_id,
            notes: schedule.notes,
            organization_id: selectedOrganizationId,
            status: 'scheduled'
          })
      );

      const scheduleResults = await Promise.all(schedulePromises);
      const scheduleErrors = scheduleResults.filter(result => result.error);
      
      if (scheduleErrors.length > 0) {
        // Rollback vehicle creation if schedules fail
        await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicle.id);
        
        throw new Error('Failed to create inspection schedules');
      }

      return vehicle;
    },
    onSuccess: () => {
      toast.success('Vehicle created successfully with inspection schedules!');
      queryClient.invalidateQueries(['vehicles']);
      queryClient.invalidateQueries(['inspection-schedules']);
      // Reset form
      setVehicleData({
        vehicle_number: '',
        make: '',
        model: '',
        year: '',
        license_plate: '',
        vin: '',
        fuel_type: '',
        transmission: '',
        color: '',
        mileage: '',
        notes: ''
      });
      setInspectionSchedules([]);
      setSelectedTemplates([]);
      setCurrentStep(1);
    },
    onError: (error) => {
      toast.error(`Failed to create vehicle: ${error.message}`);
    }
  });

  const handleVehicleDataChange = (field: keyof VehicleFormData, value: string) => {
    setVehicleData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev => {
      const isSelected = prev.includes(templateId);
      if (isSelected) {
        // Remove template
        setInspectionSchedules(prevSchedules => 
          prevSchedules.filter(schedule => schedule.template_id !== templateId)
        );
        return prev.filter(id => id !== templateId);
      } else {
        // Add template
        const template = templates.find(t => t.id === templateId);
        if (template) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + template.frequency_days);
          
          setInspectionSchedules(prevSchedules => [
            ...prevSchedules,
            {
              template_id: templateId,
              frequency_days: template.frequency_days,
              next_inspection_date: nextDate.toISOString().split('T')[0],
              notes: `Initial ${template.name} schedule`
            }
          ]);
        }
        return [...prev, templateId];
      }
    });
  };

  const handleScheduleUpdate = (templateId: string, field: keyof InspectionSchedule, value: any) => {
    setInspectionSchedules(prev => 
      prev.map(schedule => 
        schedule.template_id === templateId 
          ? { ...schedule, [field]: value }
          : schedule
      )
    );
  };

  const getTemplateName = (templateId: string) => {
    return templates.find(t => t.id === templateId)?.name || 'Unknown Template';
  };

  const getFrequencyText = (days: number) => {
    if (days === 1) return 'Daily';
    if (days === 7) return 'Weekly';
    if (days === 28) return '4-Weekly';
    if (days === 42) return '6-Weekly';
    return `Every ${days} days`;
  };

  const isStep1Valid = () => {
    return vehicleData.vehicle_number && vehicleData.make && vehicleData.model && vehicleData.license_plate;
  };

  const isStep2Valid = () => {
    return selectedTemplates.length > 0 && inspectionSchedules.every(schedule => schedule.next_inspection_date);
  };

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = () => {
    if (isStep2Valid()) {
      createVehicleMutation.mutate();
    }
  };

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading inspection templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Vehicle</h1>
        <p className="text-gray-600">Create a new vehicle and set up its inspection schedules</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep >= 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-gray-100 border-gray-300'
          }`}>
            <Car className="w-5 h-5" />
          </div>
          <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep >= 2 ? 'bg-primary text-primary-foreground border-primary' : 'bg-gray-100 border-gray-300'
          }`}>
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Step 1: Vehicle Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="w-5 h-5" />
              <span>Vehicle Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vehicle_number">Vehicle Number *</Label>
                <Input
                  id="vehicle_number"
                  value={vehicleData.vehicle_number}
                  onChange={(e) => handleVehicleDataChange('vehicle_number', e.target.value)}
                  placeholder="e.g., V001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="license_plate">License Plate *</Label>
                <Input
                  id="license_plate"
                  value={vehicleData.license_plate}
                  onChange={(e) => handleVehicleDataChange('license_plate', e.target.value)}
                  placeholder="e.g., ABC123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={vehicleData.make}
                  onChange={(e) => handleVehicleDataChange('make', e.target.value)}
                  placeholder="e.g., Ford"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={vehicleData.model}
                  onChange={(e) => handleVehicleDataChange('model', e.target.value)}
                  placeholder="e.g., Transit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={vehicleData.year}
                  onChange={(e) => handleVehicleDataChange('year', e.target.value)}
                  placeholder="e.g., 2023"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  value={vehicleData.vin}
                  onChange={(e) => handleVehicleDataChange('vin', e.target.value)}
                  placeholder="Vehicle Identification Number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select value={vehicleData.fuel_type} onValueChange={(value) => handleVehicleDataChange('fuel_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="lpg">LPG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select value={vehicleData.transmission} onValueChange={(value) => handleVehicleDataChange('transmission', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={vehicleData.color}
                  onChange={(e) => handleVehicleDataChange('color', e.target.value)}
                  placeholder="e.g., White"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Current Mileage</Label>
                <Input
                  id="mileage"
                  value={vehicleData.mileage}
                  onChange={(e) => handleVehicleDataChange('mileage', e.target.value)}
                  placeholder="e.g., 50000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={vehicleData.notes}
                onChange={(e) => handleVehicleDataChange('notes', e.target.value)}
                placeholder="Additional notes about the vehicle..."
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleNext}
                disabled={!isStep1Valid()}
                className="bg-primary hover:bg-primary/90"
              >
                Next: Setup Inspections
                <Shield className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Inspection Setup */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Inspection Schedule Setup</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Select the inspection types that apply to this vehicle and set up their schedules
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Available Templates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Inspection Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedTemplates.includes(template.id)}
                        onCheckedChange={() => handleTemplateToggle(template.id)}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {getFrequencyText(template.frequency_days)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Selected Schedules */}
            {selectedTemplates.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Inspection Schedules</h3>
                <div className="space-y-4">
                  {inspectionSchedules.map((schedule) => {
                    const template = templates.find(t => t.id === schedule.template_id);
                    return (
                      <Card key={schedule.template_id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Inspection Type</Label>
                            <p className="text-sm text-gray-600">{template?.name}</p>
                          </div>
                          
                          <div>
                            <Label htmlFor={`date-${schedule.template_id}`} className="text-sm font-medium">
                              Next Inspection Date *
                            </Label>
                            <Input
                              id={`date-${schedule.template_id}`}
                              type="date"
                              value={schedule.next_inspection_date}
                              onChange={(e) => handleScheduleUpdate(schedule.template_id, 'next_inspection_date', e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`driver-${schedule.template_id}`} className="text-sm font-medium">
                              Assigned Driver
                            </Label>
                            <Select 
                              value={schedule.assigned_driver_id || ''} 
                              onValueChange={(value) => handleScheduleUpdate(schedule.template_id, 'assigned_driver_id', value || null)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select driver" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No driver assigned</SelectItem>
                                {drivers.map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    {driver.first_name} {driver.last_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Label htmlFor={`notes-${schedule.template_id}`} className="text-sm font-medium">
                            Notes
                          </Label>
                          <Textarea
                            id={`notes-${schedule.template_id}`}
                            value={schedule.notes || ''}
                            onChange={(e) => handleScheduleUpdate(schedule.template_id, 'notes', e.target.value)}
                            placeholder="Additional notes for this inspection schedule..."
                            rows={2}
                          />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTemplates.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Inspection Types Selected</h3>
                <p className="text-gray-600">Please select at least one inspection type above to continue.</p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back to Vehicle Info
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isStep2Valid() || createVehicleMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createVehicleMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Vehicle...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Vehicle with Inspections
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleCreationWithInspections;


