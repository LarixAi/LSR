
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

interface ConditionCheckGridProps {
  conditions: {
    label: string;
    value: string;
    setter: (value: string) => void;
  }[];
}

const conditionOptions = [
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
  { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-800' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-800' },
];

const ConditionCheckGrid: React.FC<ConditionCheckGridProps> = ({ conditions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {conditions.map((item) => (
        <div key={item.label} className="space-y-3">
          <Label>{item.label} Condition</Label>
          <RadioGroup value={item.value} onValueChange={item.setter}>
            {conditionOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${item.label}-${option.value}`} />
                <Label htmlFor={`${item.label}-${option.value}`} className="cursor-pointer">
                  <Badge className={option.color}>{option.label}</Badge>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}
    </div>
  );
};

export default ConditionCheckGrid;
