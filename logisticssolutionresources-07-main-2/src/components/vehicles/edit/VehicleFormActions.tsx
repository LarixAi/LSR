
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

interface VehicleFormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
}

const VehicleFormActions = ({ onCancel, isLoading }: VehicleFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
      >
        <Save className="w-4 h-4 mr-2" />
        {isLoading ? 'Updating...' : 'Update Vehicle'}
      </Button>
    </div>
  );
};

export default VehicleFormActions;
