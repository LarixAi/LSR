
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Steps } from './AddVehicleSteps';

interface StepNavigationProps {
  currentStep: Steps;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isStepValid: boolean;
  isSubmitting: boolean;
}

const StepNavigation = ({
  currentStep,
  onNext,
  onPrev,
  onSubmit,
  isStepValid,
  isSubmitting
}: StepNavigationProps) => {
  const isLastStep = currentStep === Steps.REVIEW;
  const isFirstStep = currentStep === Steps.BASIC_INFO;

  return (
    <div className="flex justify-between pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onPrev}
        disabled={isFirstStep || isSubmitting}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      {isLastStep ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!isStepValid || isSubmitting}
        >
          <Check className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Creating Vehicle...' : 'Create Vehicle'}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={!isStepValid || isSubmitting}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};

export default StepNavigation;
