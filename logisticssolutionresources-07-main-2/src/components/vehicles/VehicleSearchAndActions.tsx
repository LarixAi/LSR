
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

interface VehicleSearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddVehicle: () => void;
  canAddVehicle: boolean;
  isLoading: boolean;
}

const VehicleSearchAndActions = ({ 
  searchTerm, 
  onSearchChange, 
  onAddVehicle, 
  canAddVehicle, 
  isLoading 
}: VehicleSearchAndActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search vehicles..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          disabled={isLoading}
        />
      </div>
      
      {canAddVehicle && (
        <Button 
          className="flex items-center space-x-2" 
          disabled={isLoading}
          onClick={onAddVehicle}
        >
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </Button>
      )}
    </div>
  );
};

export default VehicleSearchAndActions;
