
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, vehicle_number, license_plate, make, model')
        .eq('status', 'active')
        .order('vehicle_number');

      if (error) {
        console.error('Error fetching vehicles:', error);
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
      // Submit vehicle check to database
      const { data: vehicleCheck, error: checkError } = await supabase
        .from('vehicle_checks')
        .insert({
          organization_id: user.user_metadata?.organization_id,
          vehicle_id: formData.selectedVehicle,
          driver_id: user.id,
          check_type: 'comprehensive',
          status: 'completed',
          check_date: new Date().toISOString().split('T')[0],
          completed_at: new Date().toISOString(),
          defects_found: formData.issuesReported ? 1 : 0,
          critical_issues: formData.issuesReported ? 1 : 0,
          pass_fail: !formData.issuesReported,
          overall_condition: formData.issuesReported ? 'poor' : 'good',
          compliance_status: formData.issuesReported ? 'failed' : 'passed',
          notes: formData.notes,
          issues_found: formData.issuesReported ? ['Defects reported during check'] : [],
          score: formData.issuesReported ? 65 : 95,
          next_check_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        })
        .select()
        .single();

      if (checkError) throw checkError;

      // Send notification to admin
      const { error: notificationError } = await supabase.functions.invoke('notification-sender', {
        body: {
          title: `Vehicle Check ${formData.issuesReported ? 'Failed' : 'Passed'}`,
          body: `Driver ${user.user_metadata?.first_name || 'Unknown'} ${user.user_metadata?.last_name || ''} completed a vehicle check${formData.issuesReported ? ' with defects found' : ' successfully'}.`,
          type: formData.issuesReported ? 'warning' : 'success',
          priority: formData.issuesReported ? 'high' : 'normal',
          recipient_role: 'admin',
          action_url: '/vehicle-inspections',
          metadata: {
            vehicle_id: formData.selectedVehicle,
            check_id: vehicleCheck.id,
            has_defects: formData.issuesReported,
            driver_id: user.id
          }
        }
      });

      // If defects found, also notify mechanics
      if (formData.issuesReported) {
        await supabase.functions.invoke('notification-sender', {
          body: {
            title: 'Vehicle Defects Reported',
            body: `Vehicle check revealed defects requiring attention. Driver: ${user.user_metadata?.first_name || 'Unknown'} ${user.user_metadata?.last_name || ''}`,
            type: 'warning',
            priority: 'high',
            recipient_role: 'mechanic',
            action_url: '/defect-reports',
            metadata: {
              vehicle_id: formData.selectedVehicle,
              check_id: vehicleCheck.id,
              driver_id: user.id
            }
          }
        });
      }

      toast({
        title: "Success",
        description: `Vehicle check completed successfully! ${formData.issuesReported ? 'Defects have been reported to admin and mechanics.' : 'All systems normal.'}`,
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
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
};

export default ComprehensiveVehicleCheck;
