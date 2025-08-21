
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProgressIndicator } from './ProgressIndicator';
import { StepRenderer } from './StepRenderer';
import { NavigationButtons } from './NavigationButtons';
import { VehicleCheckData, getInitialFormData, validateStep } from './vehicleCheckUtils';

interface ComprehensiveVehicleCheckProps {
  onComplete?: () => void;
}

const ComprehensiveVehicleCheck: React.FC<ComprehensiveVehicleCheckProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch real vehicles data from backend
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('vehicles')
        .select('id, vehicle_number, license_plate, make, model, status')
        .eq('status', 'active')
        .order('vehicle_number');

      if (error) {
        console.error('Error fetching vehicles:', error);
        toast({
          title: "Error",
          description: "Failed to load vehicles",
          variant: "destructive"
        });
        return [];
      }

      return data || [];
    },
    enabled: !!user
  });

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
      // Submit to vehicle_checks table
      const { error } = await supabase
        .from('vehicle_checks')
        .insert({
          driver_id: user.id,
          vehicle_id: formData.selectedVehicle,
          check_date: new Date().toISOString().split('T')[0],
          status: 'completed',
          issues_found: formData.issuesReported.join(', '),
          notes: formData.notes,
          created_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

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

  const isStepValid = () => validateStep(currentStep, formData, vehicles);

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
            activeVehicles={vehicles}
            vehiclesLoading={vehiclesLoading}
          />
        </div>
        
        <NavigationButtons
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isStepValid={isStepValid}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
};

export default ComprehensiveVehicleCheck;
