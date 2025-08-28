
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { checkSteps } from './constants';

interface NavigationButtonsProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isStepValid: () => boolean;
  handleSubmit: () => void;
  isSubmitting: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  setCurrentStep,
  isStepValid,
  handleSubmit,
  isSubmitting
}) => {
  return (
    <div className="flex justify-between mt-8 pt-4 border-t">
      <Button
        variant="outline"
        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
        disabled={currentStep === 0}
      >
        Previous
      </Button>
      
      <div className="flex space-x-2">
        {currentStep < checkSteps.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!isStepValid()}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isStepValid()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Inspection
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavigationButtons;
