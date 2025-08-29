
import React from 'react';
import { Check } from 'lucide-react';
import { Steps, STEP_NAMES } from './AddVehicleSteps';

interface StepIndicatorProps {
  currentStep: Steps;
  steps: typeof STEP_NAMES;
}

const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((stepName, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isCurrent ? 'text-primary' : 'text-gray-600'
              }`}>
                {stepName}
              </span>
            </div>
            {stepNumber < steps.length && (
              <div className={`w-12 h-0.5 ml-4 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
