import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VehicleType } from './DVSAInspectionData';

interface DVSAVehicleTypeSelectorProps {
  selectedType: VehicleType | null;
  onTypeSelect: (type: VehicleType) => void;
}

const vehicleTypes = [
  {
    type: 'bus' as VehicleType,
    name: 'Bus',
    description: 'Single or double-deck passenger bus',
    icon: '🚌',
    color: 'bg-blue-500 text-white',
    requirements: ['Emergency exits', 'Fire extinguisher', 'First aid kit', 'Emergency buzzer']
  },
  {
    type: 'minibus' as VehicleType,
    name: 'Minibus',
    description: 'Small passenger vehicle (9-16 seats)',
    icon: '🚐',
    color: 'bg-green-500 text-white',
    requirements: ['Passenger seatbelts', 'Emergency equipment', 'Door safety systems']
  },
  {
    type: 'coach' as VehicleType,
    name: 'Coach',
    description: 'Long-distance passenger coach',
    icon: '🚍',
    color: 'bg-purple-500 text-white',
    requirements: ['Tachograph', 'Emergency exits', 'Fire safety', 'Comfort facilities']
  },
  {
    type: 'truck' as VehicleType,
    name: 'Truck/Lorry',
    description: 'Goods vehicle up to 7.5 tonnes',
    icon: '🚚',
    color: 'bg-orange-500 text-white',
    requirements: ['Load security', 'Spray suppression', 'Reflective markings']
  },
  {
    type: 'hgv' as VehicleType,
    name: 'HGV',
    description: 'Heavy goods vehicle over 7.5 tonnes',
    icon: '🚛',
    color: 'bg-red-500 text-white',
    requirements: ['Tachograph', 'Load restraints', 'Underrun protection', 'ADR compliance']
  }
];

const DVSAVehicleTypeSelector: React.FC<DVSAVehicleTypeSelectorProps> = ({
  selectedType,
  onTypeSelect
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Select Vehicle Type
        </h2>
        <p className="text-gray-600">
          Choose your vehicle type to load the correct DVSA inspection checklist
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicleTypes.map((vehicle) => {
          const isSelected = selectedType === vehicle.type;
          
          return (
            <Card 
              key={vehicle.type}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => onTypeSelect(vehicle.type)}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {/* Vehicle Icon */}
                  <div className="text-4xl">{vehicle.icon}</div>
                  
                  {/* Vehicle Name and Type */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vehicle.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {vehicle.description}
                    </p>
                  </div>

                  {/* Requirements Preview */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">
                      Key Requirements:
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {vehicle.requirements.slice(0, 3).map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {vehicle.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{vehicle.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Selection Button */}
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    className={`w-full ${isSelected ? vehicle.color : ''}`}
                    size="sm"
                  >
                    {isSelected ? 'Selected ✓' : 'Select Vehicle Type'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legal Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <div className="text-yellow-600 text-lg">⚠️</div>
          <div className="text-sm text-yellow-800">
            <div className="font-semibold mb-1">Legal Requirement</div>
            <div>
              Under DVSA regulations, you must complete a vehicle-specific safety inspection before operating any commercial vehicle. 
              Selecting the correct vehicle type ensures compliance with all applicable standards.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DVSAVehicleTypeSelector;