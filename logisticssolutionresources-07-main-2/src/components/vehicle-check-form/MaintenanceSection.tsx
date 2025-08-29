
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MaintenanceSectionProps {
  requiresMaintenance: boolean;
  onRequiresMaintenanceChange: (value: boolean) => void;
  maintenancePriority: string;
  onMaintenancePriorityChange: (value: string) => void;
}

const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({
  requiresMaintenance,
  onRequiresMaintenanceChange,
  maintenancePriority,
  onMaintenancePriorityChange
}) => {
  return (
    <>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="maintenance"
          checked={requiresMaintenance}
          onCheckedChange={(checked) => onRequiresMaintenanceChange(checked as boolean)}
        />
        <Label htmlFor="maintenance" className="cursor-pointer">
          This vehicle requires maintenance
        </Label>
      </div>

      {requiresMaintenance && (
        <div>
          <Label>Maintenance Priority</Label>
          <RadioGroup value={maintenancePriority} onValueChange={onMaintenancePriorityChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low" className="cursor-pointer">Low - Can wait</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="cursor-pointer">Medium - Schedule soon</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high" className="cursor-pointer">High - Schedule ASAP</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="urgent" id="urgent" />
              <Label htmlFor="urgent" className="cursor-pointer">Urgent - Do not use vehicle</Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </>
  );
};

export default MaintenanceSection;
