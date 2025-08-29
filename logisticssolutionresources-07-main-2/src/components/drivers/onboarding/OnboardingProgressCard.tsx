
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface OnboardingProgressCardProps {
  completedTasks: number;
  totalTasks: number;
  progress: number;
}

const OnboardingProgressCard = ({ completedTasks, totalTasks, progress }: OnboardingProgressCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Overall Progress</CardTitle>
        <CardDescription>
          {completedTasks} of {totalTasks} tasks completed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm font-medium">{progress}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingProgressCard;
