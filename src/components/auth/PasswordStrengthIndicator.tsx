
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { getPasswordStrength } from '@/utils/securePasswordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  if (!password) return null;

  const { score, label, color } = getPasswordStrength(password);
  const percentage = (score / 7) * 100;

  const getColorClass = () => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Password strength:</span>
        <span className={`text-sm font-medium text-${color}-600`}>{label}</span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2"
        style={{
          '--progress-background': color === 'red' ? '#ef4444' : 
                                 color === 'orange' ? '#f97316' : 
                                 color === 'yellow' ? '#eab308' : '#22c55e'
        } as React.CSSProperties}
      />
    </div>
  );
};

export default PasswordStrengthIndicator;
