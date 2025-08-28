
import { useState } from 'react';
import { validateStep } from '../form/validation';
import type { AddRouteFormData } from '../types';

export const useStepNavigation = (
  formData: AddRouteFormData,
  setErrors: (errors: Record<string, string>) => void
) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    const stepErrors = validateStep(currentStep, formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  };

  return {
    currentStep,
    nextStep,
    prevStep,
  };
};
