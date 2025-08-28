
import { VehicleCheckData } from './types';
import { useAuth } from '@/contexts/AuthContext';

export const getInitialFormData = (): VehicleCheckData => ({
  selectedVehicle: '',
  mileage: '',
  fuelLevel: '',
  engineCondition: 'good',
  engineOilLevel: 'good',
  coolantLevel: 'good',
  brakeFluidLevel: 'good',
  powerSteeringFluid: 'good',
  windshieldWasherFluid: 'good',
  brakesCondition: 'good',
  brakePedal: 'good',
  handbrake: 'good',
  tiresCondition: 'good',
  tireDepth: 'good',
  wheelCondition: 'good',
  spareWheel: 'good',
  headlights: 'good',
  taillights: 'good',
  indicators: 'good',
  hazardLights: 'good',
  interiorLights: 'good',
  battery: 'good',
  alternator: 'good',
  horn: 'good',
  radio: 'good',
  seatbelts: 'good',
  mirrors: 'good',
  firstAidKit: 'good',
  fireExtinguisher: 'good',
  emergencyTriangle: 'good',
  seatsCondition: 'good',
  dashboardCondition: 'good',
  airConditioning: 'good',
  heater: 'good',
  wipers: 'good',
  bodyCondition: 'good',
  windowsCondition: 'good',
  doorsCondition: 'good',
  registration: 'good',
  insurance: 'good',
  roadworthiness: 'good',
  issuesReported: [],
  notes: '',
  requiresMaintenance: false,
  maintenancePriority: 'low',
});

interface AssignedVehicle {
  id: string;
  vehicle_number: string;
  make?: string;
  model: string;
  license_plate: string;
  organization_id?: string;
  capacity?: number;
  is_active?: boolean;
}

export const validateStep = (step: number, formData: VehicleCheckData, assignedVehicles: AssignedVehicle[]): boolean => {
  switch (step) {
    case 0:
      return formData.selectedVehicle !== '' && assignedVehicles.length > 0;
    case 1:
      return formData.selectedVehicle !== '';
    case 2:
      return formData.mileage !== '' && formData.fuelLevel !== '';
    default:
      return true;
  }
};

interface User {
  id: string;
  email?: string;
}

export const formatCheckDataForSubmission = (formData: VehicleCheckData, user: User, assignedVehicles: AssignedVehicle[]) => {
  const selectedVehicleData = assignedVehicles.find(v => v.id === formData.selectedVehicle);
  
  return {
    driver_id: user.id,
    vehicle_id: formData.selectedVehicle,
    organization_id: selectedVehicleData?.organization_id || null,
    engine_condition: formData.engineCondition,
    brakes_condition: formData.brakesCondition,
    tires_condition: formData.tiresCondition,
    lights_condition: formData.headlights,
    interior_condition: formData.seatsCondition,
    exterior_condition: formData.bodyCondition,
    fuel_level: formData.fuelLevel ? parseInt(formData.fuelLevel) : null,
    mileage: formData.mileage ? parseInt(formData.mileage) : null,
    notes: formData.notes || null,
    issues_reported: formData.issuesReported.length > 0 ? formData.issuesReported : null,
    requires_maintenance: formData.requiresMaintenance,
    maintenance_priority: formData.requiresMaintenance ? formData.maintenancePriority : 'low',
  };
};
