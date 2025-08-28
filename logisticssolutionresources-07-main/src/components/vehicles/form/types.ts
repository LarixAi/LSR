
export interface VehicleFormData {
  vehicle_number: string;
  license_plate: string;
  make?: string;
  model?: string;
  year?: number;
  capacity: number;
  fuel_type?: string;
  vin?: string;
  assigned_driver_id?: string;
  type: "bus" | "coach" | "hgv" | "minibus" | "double_decker_bus";
  service_interval_months?: number; // Added for OCRS compliance management
}
