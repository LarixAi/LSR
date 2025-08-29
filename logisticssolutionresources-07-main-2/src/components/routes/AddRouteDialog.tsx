
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StepNavigation from './form/StepNavigation';
import RouteStepRenderer from './components/RouteStepRenderer';
import { useRouteForm } from './hooks/useRouteForm';
import { useRouteStops } from './hooks/useRouteStops';
import { useCreateRoute } from './hooks/useCreateRoute';
import { useStepNavigation } from './hooks/useStepNavigation';
import type { AddRouteDialogProps } from './types';

const AddRouteDialog: React.FC<AddRouteDialogProps> = ({ open, onOpenChange }) => {
  const { formData, errors, setErrors, updateField, updateDays, resetForm } = useRouteForm();
  
  // Create a specialized updateStops function for the useRouteStops hook
  const updateStops = (field: 'stops', value: typeof formData.stops) => {
    updateField(field, value);
  };
  
  const { addStop, removeStop, updateStop } = useRouteStops(formData.stops, updateStops);
  const { currentStep, nextStep, prevStep } = useStepNavigation(formData, setErrors);
  
  const createRouteMutation = useCreateRoute(() => onOpenChange(false), resetForm);

  const handleSubmit = () => {
    console.log('Submitting route:', formData);
    createRouteMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Route - Step {currentStep + 1} of 6</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1">
          <RouteStepRenderer
            currentStep={currentStep}
            formData={formData}
            errors={errors}
            onUpdateField={updateField}
            onUpdateDays={updateDays}
            onAddStop={addStop}
            onRemoveStop={removeStop}
            onUpdateStop={updateStop}
          />
        </div>

        <StepNavigation
          currentStep={currentStep}
          totalSteps={6}
          isLoading={createRouteMutation.isPending}
          onNext={nextStep}
          onPrevious={prevStep}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddRouteDialog;
