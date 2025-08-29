
import React from 'react';
import { Separator } from '@/components/ui/separator';
import VehicleSelectionStep from './VehicleSelectionStep';
import VehicleInfoStep from './VehicleInfoStep';
import BasicInfoStep from './BasicInfoStep';
import ConditionRadioGroup from './ConditionRadioGroup';
import IssuesReviewStep from './IssuesReviewStep';
import { VehicleCheckData } from './types';

interface StepRendererProps {
  currentStep: number;
  formData: VehicleCheckData;
  updateFormData: (updates: Partial<VehicleCheckData>) => void;
  handleIssueToggle: (issue: string, checked: boolean) => void;
  activeVehicles: any[];
  vehiclesLoading: boolean;
}

const StepRenderer: React.FC<StepRendererProps> = ({
  currentStep,
  formData,
  updateFormData,
  handleIssueToggle,
  activeVehicles,
  vehiclesLoading
}) => {
  const selectedVehicleData = activeVehicles.find(v => v.id === formData.selectedVehicle);

  switch (currentStep) {
    case 0:
      return (
        <VehicleSelectionStep
          assignedVehicles={activeVehicles}
          selectedVehicle={formData.selectedVehicle}
          setSelectedVehicle={(value) => updateFormData({ selectedVehicle: value })}
          vehiclesLoading={vehiclesLoading}
        />
      );

    case 1:
      return <VehicleInfoStep selectedVehicleData={selectedVehicleData} />;

    case 2:
      return (
        <BasicInfoStep
          mileage={formData.mileage}
          setMileage={(value) => updateFormData({ mileage: value })}
          fuelLevel={formData.fuelLevel}
          setFuelLevel={(value) => updateFormData({ fuelLevel: value })}
        />
      );

    case 3:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Engine and Fluid Levels</h3>
          <ConditionRadioGroup value={formData.engineCondition} onChange={(value) => updateFormData({ engineCondition: value })} label="Engine Condition" />
          <Separator />
          <ConditionRadioGroup value={formData.engineOilLevel} onChange={(value) => updateFormData({ engineOilLevel: value })} label="Engine Oil Level" />
          <Separator />
          <ConditionRadioGroup value={formData.coolantLevel} onChange={(value) => updateFormData({ coolantLevel: value })} label="Coolant Level" />
          <Separator />
          <ConditionRadioGroup value={formData.brakeFluidLevel} onChange={(value) => updateFormData({ brakeFluidLevel: value })} label="Brake Fluid Level" />
          <Separator />
          <ConditionRadioGroup value={formData.powerSteeringFluid} onChange={(value) => updateFormData({ powerSteeringFluid: value })} label="Power Steering Fluid" />
          <Separator />
          <ConditionRadioGroup value={formData.windshieldWasherFluid} onChange={(value) => updateFormData({ windshieldWasherFluid: value })} label="Windshield Washer Fluid" />
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Brakes and Tires</h3>
          <ConditionRadioGroup value={formData.brakesCondition} onChange={(value) => updateFormData({ brakesCondition: value })} label="Brake System" />
          <Separator />
          <ConditionRadioGroup value={formData.brakePedal} onChange={(value) => updateFormData({ brakePedal: value })} label="Brake Pedal Feel" />
          <Separator />
          <ConditionRadioGroup value={formData.handbrake} onChange={(value) => updateFormData({ handbrake: value })} label="Handbrake/Parking Brake" />
          <Separator />
          <ConditionRadioGroup value={formData.tiresCondition} onChange={(value) => updateFormData({ tiresCondition: value })} label="Tire Condition" />
          <Separator />
          <ConditionRadioGroup value={formData.tireDepth} onChange={(value) => updateFormData({ tireDepth: value })} label="Tire Tread Depth" />
          <Separator />
          <ConditionRadioGroup value={formData.wheelCondition} onChange={(value) => updateFormData({ wheelCondition: value })} label="Wheel Condition" />
          <Separator />
          <ConditionRadioGroup value={formData.spareWheel} onChange={(value) => updateFormData({ spareWheel: value })} label="Spare Wheel" />
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Lighting and Electrical Systems</h3>
          <ConditionRadioGroup value={formData.headlights} onChange={(value) => updateFormData({ headlights: value })} label="Headlights (High/Low Beam)" />
          <Separator />
          <ConditionRadioGroup value={formData.taillights} onChange={(value) => updateFormData({ taillights: value })} label="Taillights/Brake Lights" />
          <Separator />
          <ConditionRadioGroup value={formData.indicators} onChange={(value) => updateFormData({ indicators: value })} label="Turn Indicators" />
          <Separator />
          <ConditionRadioGroup value={formData.hazardLights} onChange={(value) => updateFormData({ hazardLights: value })} label="Hazard Lights" />
          <Separator />
          <ConditionRadioGroup value={formData.interiorLights} onChange={(value) => updateFormData({ interiorLights: value })} label="Interior Lights" />
          <Separator />
          <ConditionRadioGroup value={formData.battery} onChange={(value) => updateFormData({ battery: value })} label="Battery Condition" />
          <Separator />
          <ConditionRadioGroup value={formData.horn} onChange={(value) => updateFormData({ horn: value })} label="Horn" />
          <Separator />
          <ConditionRadioGroup value={formData.radio} onChange={(value) => updateFormData({ radio: value })} label="Radio/Communication System" />
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Safety Equipment and Interior</h3>
          <ConditionRadioGroup value={formData.seatbelts} onChange={(value) => updateFormData({ seatbelts: value })} label="Seatbelts (All)" />
          <Separator />
          <ConditionRadioGroup value={formData.mirrors} onChange={(value) => updateFormData({ mirrors: value })} label="Mirrors (Side/Rear)" />
          <Separator />
          <ConditionRadioGroup value={formData.firstAidKit} onChange={(value) => updateFormData({ firstAidKit: value })} label="First Aid Kit" />
          <Separator />
          <ConditionRadioGroup value={formData.fireExtinguisher} onChange={(value) => updateFormData({ fireExtinguisher: value })} label="Fire Extinguisher" />
          <Separator />
          <ConditionRadioGroup value={formData.emergencyTriangle} onChange={(value) => updateFormData({ emergencyTriangle: value })} label="Emergency Triangle" />
          <Separator />
          <ConditionRadioGroup value={formData.seatsCondition} onChange={(value) => updateFormData({ seatsCondition: value })} label="Seats Condition" />
          <Separator />
          <ConditionRadioGroup value={formData.dashboardCondition} onChange={(value) => updateFormData({ dashboardCondition: value })} label="Dashboard/Instruments" />
          <Separator />
          <ConditionRadioGroup value={formData.airConditioning} onChange={(value) => updateFormData({ airConditioning: value })} label="Air Conditioning" />
          <Separator />
          <ConditionRadioGroup value={formData.heater} onChange={(value) => updateFormData({ heater: value })} label="Heater" />
          <Separator />
          <ConditionRadioGroup value={formData.wipers} onChange={(value) => updateFormData({ wipers: value })} label="Windshield Wipers" />
        </div>
      );

    case 7:
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Exterior and Documentation</h3>
          <ConditionRadioGroup value={formData.bodyCondition} onChange={(value) => updateFormData({ bodyCondition: value })} label="Body Condition" />
          <Separator />
          <ConditionRadioGroup value={formData.windowsCondition} onChange={(value) => updateFormData({ windowsCondition: value })} label="Windows (All)" />
          <Separator />
          <ConditionRadioGroup value={formData.doorsCondition} onChange={(value) => updateFormData({ doorsCondition: value })} label="Doors and Locks" />
          <Separator />
          <h4 className="text-md font-semibold">Vehicle Documentation</h4>
          <ConditionRadioGroup value={formData.registration} onChange={(value) => updateFormData({ registration: value })} label="Vehicle Registration" />
          <Separator />
          <ConditionRadioGroup value={formData.insurance} onChange={(value) => updateFormData({ insurance: value })} label="Insurance Certificate" />
          <Separator />
          <ConditionRadioGroup value={formData.roadworthiness} onChange={(value) => updateFormData({ roadworthiness: value })} label="Roadworthiness Certificate" />
        </div>
      );

    case 8:
      return (
        <IssuesReviewStep
          issuesReported={formData.issuesReported}
          onIssueToggle={handleIssueToggle}
          requiresMaintenance={formData.requiresMaintenance}
          setRequiresMaintenance={(value) => updateFormData({ requiresMaintenance: value })}
          maintenancePriority={formData.maintenancePriority}
          setMaintenancePriority={(value) => updateFormData({ maintenancePriority: value })}
          notes={formData.notes}
          setNotes={(value) => updateFormData({ notes: value })}
          assignedVehicles={activeVehicles}
          selectedVehicle={formData.selectedVehicle}
          mileage={formData.mileage}
          fuelLevel={formData.fuelLevel}
        />
      );

    default:
      return null;
  }
};

export default StepRenderer;
