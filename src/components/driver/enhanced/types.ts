export interface Job {
  id: string;
  title?: string;
  status: string;
  pickup_datetime?: string;
  start_date?: string;
  end_date?: string;
  dropoff_datetime?: string;
  pickup_location?: string;
  dropoff_location?: string;
  created_at: string;
  routes?: {
    id: string;
    name: string;
    start_location: string;
    end_location: string;
    estimated_distance?: number;
    estimated_duration?: number;
  } | null;
  vehicles?: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
    type?: string;
  } | null;
}

export interface Vehicle {
  id: string;
  vehicle_number: string;
  make: string;
  model: string;
  license_plate: string;
  mot_expiry?: string;
  type?: string;
}

export interface VehicleCheck {
  id: string;
  check_date: string;
  compliance_status?: string;
  issues_found?: boolean;
  defects_reported?: any;
}