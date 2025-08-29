
import React from 'react';
import { Button } from '@/components/ui/button';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  isLoading,
  onNext,
  onPrevious,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="flex justify-between items-center pt-4 border-t">
      <div className="flex space-x-2">
        {currentStep > 0 && (
          <Button variant="outline" onClick={onPrevious}>
            Back
          </Button>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {currentStep < totalSteps - 1 ? (
          <Button onClick={onNext}>
            Next
          </Button>
        ) : (
          <Button 
            onClick={onSubmit} 
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Add Route'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StepNavigation;
