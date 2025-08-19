
export interface VehicleCheckData {
  selectedVehicle: string;
  mileage: string;
  fuelLevel: string;
  engineCondition: string;
  engineOilLevel: string;
  coolantLevel: string;
  brakeFluidLevel: string;
  powerSteeringFluid: string;
  windshieldWasherFluid: string;
  brakesCondition: string;
  brakePedal: string;
  handbrake: string;
  tiresCondition: string;
  tireDepth: string;
  wheelCondition: string;
  spareWheel: string;
  headlights: string;
  taillights: string;
  indicators: string;
  hazardLights: string;
  interiorLights: string;
  battery: string;
  alternator: string;
  horn: string;
  radio: string;
  seatbelts: string;
  mirrors: string;
  firstAidKit: string;
  fireExtinguisher: string;
  emergencyTriangle: string;
  seatsCondition: string;
  dashboardCondition: string;
  airConditioning: string;
  heater: string;
  wipers: string;
  bodyCondition: string;
  windowsCondition: string;
  doorsCondition: string;
  registration: string;
  insurance: string;
  roadworthiness: string;
  issuesReported: string[];
  notes: string;
  requiresMaintenance: boolean;
  maintenancePriority: string;
}

export interface ConditionOption {
  value: string;
  label: string;
  color: string;
}

export interface CheckStep {
  title: string;
  icon: any;
}
