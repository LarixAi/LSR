import React from 'react';
import { Progress } from '@/components/ui/progress';
import { getPasswordStrength } from '@/utils/securePasswordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showDetails = true,
}) => {
  const strength = getPasswordStrength(password);
  const percentage = (strength.score / strength.maxScore) * 100;

  const getColorClass = (color: string) => {
    const colorMap = {
      red: 'text-red-600 dark:text-red-400',
      orange: 'text-orange-600 dark:text-orange-400', 
      yellow: 'text-yellow-600 dark:text-yellow-400',
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600';
  };

  const getProgressColorClass = (color: string) => {
    const colorMap = {
      red: '[&>div]:bg-red-500',
      orange: '[&>div]:bg-orange-500',
      yellow: '[&>div]:bg-yellow-500', 
      blue: '[&>div]:bg-blue-500',
      green: '[&>div]:bg-green-500',
    };
    return colorMap[color as keyof typeof colorMap] || '[&>div]:bg-gray-500';
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password Strength</span>
        <span className={`text-sm font-medium ${getColorClass(strength.color)}`}>
          {strength.label}
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className={`h-2 ${getProgressColorClass(strength.color)}`}
      />
      
      {showDetails && (
        <div className="text-xs text-muted-foreground">
          Score: {strength.score}/{strength.maxScore} ({Math.round(percentage)}%)
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;