
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { conditionOptions } from './constants';

interface ConditionRadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const ConditionRadioGroup: React.FC<ConditionRadioGroupProps> = ({ value, onChange, label }) => (
  <div className="space-y-3">
    <Label>{label}</Label>
    <RadioGroup value={value} onValueChange={onChange}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {conditionOptions.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${label}-${option.value}`} />
            <Label htmlFor={`${label}-${option.value}`} className="cursor-pointer">
              <Badge className={option.color} variant="outline">{option.label}</Badge>
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  </div>
);

export default ConditionRadioGroup;
