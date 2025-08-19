
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getInitialFormData, validateStep } from './vehicle-check/utils';
import { VehicleCheckData } from './vehicle-check/types';
import StepRenderer from './vehicle-check/StepRenderer';
import ProgressIndicator from './vehicle-check/ProgressIndicator';
import NavigationButtons from './vehicle-check/NavigationButtons';

interface ComprehensiveVehicleCheckProps {
  onComplete?: () => void;
}

const ComprehensiveVehicleCheck: React.FC<ComprehensiveVehicleCheckProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock vehicles data since vehicles table doesn't exist
  const mockVehicles = [
    { id: '1', vehicle_number: 'BUS001', license_plate: 'ABC123', make: 'Blue Bird', model: 'Vision' },
    { id: '2', vehicle_number: 'BUS002', license_plate: 'DEF456', make: 'Thomas', model: 'Saf-T-Liner' },
    { id: '3', vehicle_number: 'BUS003', license_plate: 'GHI789', make: 'IC Bus', model: 'CE Series' }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<VehicleCheckData>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (updates: Partial<VehicleCheckData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleIssueToggle = (issue: string, checked: boolean) => {
    if (checked) {
      updateFormData({ issuesReported: [...formData.issuesReported, issue] });
    } else {
      updateFormData({ issuesReported: formData.issuesReported.filter(i => i !== issue) });
    }
  };

  const handleSubmit = async () => {
    if (!user || !formData.selectedVehicle) {
      toast({
        title: "Error",
        description: "Please select a vehicle",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock submission - just log the data since we don't have vehicle_checks table
      console.log('Vehicle check submitted:', {
        driver_id: user.id,
        vehicle_id: formData.selectedVehicle,
        check_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        issues_found: formData.issuesReported.join(', '),
        notes: formData.notes,
        created_at: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Comprehensive vehicle check completed successfully!",
      });
      onComplete?.();
    } catch (error) {
      console.error('Error submitting vehicle check:', error);
      toast({
        title: "Error",
        description: "Failed to submit vehicle check",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => validateStep(currentStep, formData, mockVehicles);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="w-6 h-6" />
          <span>Comprehensive Vehicle Inspection</span>
        </CardTitle>
        <CardDescription>
          Complete daily safety inspection checklist - Step {currentStep + 1} of 9
        </CardDescription>
        
        <ProgressIndicator currentStep={currentStep} />
      </CardHeader>
      
      <CardContent>
        <div className="min-h-[400px]">
          <StepRenderer
            currentStep={currentStep}
            formData={formData}
            updateFormData={updateFormData}
            handleIssueToggle={handleIssueToggle}
            activeVehicles={mockVehicles}
            vehiclesLoading={false}
          />
        </div>
        
        <NavigationButtons
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isStepValid={isStepValid}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
};

export default ComprehensiveVehicleCheck;
