
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Car } from 'lucide-react';
import InspectionTimer from './InspectionTimer';

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  startTime: Date | null;
  walkAroundTime: number;
  inspectionStarted: boolean;
}

const WizardHeader: React.FC<WizardHeaderProps> = ({
  currentStep,
  totalSteps,
  startTime,
  walkAroundTime,
  inspectionStarted
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <CardHeader className="p-6 sm:p-8 pb-4 sm:pb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <Car className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 text-primary" />
            <span className="leading-tight">DVSA Vehicle Inspection</span>
          </CardTitle>
          
          <InspectionTimer
            startTime={startTime}
            walkAroundTime={walkAroundTime}
            inspectionStarted={inspectionStarted}
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Safety Check Progress: {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full h-3" />
        </div>
      </div>
    </CardHeader>
  );
};

export default WizardHeader;
