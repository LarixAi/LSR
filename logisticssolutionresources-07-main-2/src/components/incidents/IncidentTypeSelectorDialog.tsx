
import React from 'react';
import { IncidentType } from '@/types/incident';
import { getIncidentTypeLabel, getIncidentTypeIcon } from '@/utils/incidentUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import * as LucideIcons from 'lucide-react';

interface IncidentTypeSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: IncidentType) => void;
}

const IncidentTypeSelectorDialog: React.FC<IncidentTypeSelectorDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
}) => {
  const types = Object.values(IncidentType);

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      directions_bus: LucideIcons.Bus,
      school: LucideIcons.GraduationCap,
      favorite: LucideIcons.Heart,
      flight_takeoff: LucideIcons.Plane,
      build: LucideIcons.Wrench,
    };
    const IconComponent = iconMap[iconName] || LucideIcons.HelpCircle;
    return <IconComponent className="w-8 h-8" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Incident Type</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4">
          {types.map((type) => (
            <Button
              key={type}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                onSelect(type);
                onOpenChange(false);
              }}
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                {getIconComponent(getIncidentTypeIcon(type))}
              </div>
              <span className="text-sm font-medium text-center">
                {getIncidentTypeLabel(type)}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentTypeSelectorDialog;
