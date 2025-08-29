
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { checkSteps } from './constants';

interface ProgressIndicatorProps {
  currentStep: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
  return (
    <>
      <div className="flex items-center space-x-2 mt-4">
        {checkSteps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-3 h-3 rounded-full flex items-center justify-center text-xs font-medium ${
              index < currentStep ? 'bg-green-500 text-white' :
              index === currentStep ? 'bg-blue-500 text-white' :
              'bg-gray-200 text-gray-600'
            }`}>
              {index < currentStep ? <CheckCircle className="w-1.5 h-1.5" /> : index + 1}
            </div>
            {index < checkSteps.length - 1 && (
              <div className={`w-3 h-0.5 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-600 mt-2">
        {checkSteps[currentStep].title}
      </div>
    </>
  );
};

export default ProgressIndicator;
