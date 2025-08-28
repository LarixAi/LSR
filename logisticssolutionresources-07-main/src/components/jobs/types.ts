
export interface JobType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: JobField[];
}

export interface JobField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'time' | 'number' | 'checkbox';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface JobFormData {
  title: string;
  description?: string;
  jobType: string;
  jobDate: string;
  startTime?: string;
  endTime?: string;
  routeId?: string;
  driverId?: string;
  vehicleId?: string;
  paymentType?: 'daily' | 'hourly' | 'set_price';
  paymentAmount?: number;
  [key: string]: any;
}

export interface JobBid {
  id: string;
  job_id: string;
  driver_id: string;
  bid_amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  driver_profile?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

export interface JobWithBids {
  id: string;
  title: string;
  description?: string;
  job_type: string;
  status: string;
  priority: string;
  assigned_driver_id?: string;
  assigned_vehicle_id?: string;
  route_id?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  payment_amount?: number;
  payment_status?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_bidding_enabled?: boolean;
  max_bid_amount?: number;
  bidding_deadline?: string;
  organization_id?: string;
  bids?: JobBid[];
  routes?: { name?: string; start_location?: string; end_location?: string; };
  profiles?: { first_name?: string; last_name?: string; email?: string; };
  vehicles?: { vehicle_number?: string; make?: string; model?: string; };
}
