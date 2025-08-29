import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types
export interface Vehicle {
  id: string;
  vehicle_number: string;
  license_plate: string;
  make?: string;
  model?: string;
  year?: number;
  capacity: number;
  fuel_type?: string;
  mileage?: number;
  is_active?: boolean;
  status?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  type?: "bus" | "coach" | "hgv" | "minibus" | "double_decker_bus";
  seating_capacity?: number;
  requires_maintenance?: boolean;
  last_maintenance?: string;
  next_maintenance?: string;
  mot_expiry?: string;
  next_service_date?: string;
  service_interval_months?: number;
  vin?: string;
  color?: string;
  engine_size?: string;
  transmission?: string;
  fuel_efficiency?: number;
  insurance_expiry?: string;
  tax_expiry?: string;
  registration_expiry?: string;
  avatar_url?: string;
  
  // PSV Specific Information
  laden_weight?: number;
  mam?: number;
  body_type?: string;
  engine_type?: string;
  number_of_axles?: number;
  manufacturer_name?: string;
  chassis_number?: string;
  engine_number?: string;
  fuel_tank_capacity?: number;
  max_speed?: number;
  wheelbase?: number;
  overall_length?: number;
  overall_width?: number;
  overall_height?: number;
  unladen_weight?: number;
  gross_vehicle_weight?: number;
  axle_weights?: any;
  tyre_sizes?: any;
  brake_type?: string;
  suspension_type?: string;
  emission_standard?: string;
  euro_emission_standard?: string;
  co2_emissions?: number;
  noise_level?: number;
  first_registration_date?: string;
  last_v5_issue_date?: string;
  keeper_changes?: number;
  previous_keepers?: number;
  export_marker?: boolean;
  vehicle_status?: string;
  vehicle_identity_check?: string;
  vehicle_use_code?: string;
  vehicle_body_type_code?: string;
  vehicle_colour?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_engine_size?: string;
  vehicle_fuel_type?: string;
  vehicle_transmission?: string;
  vehicle_door_plan?: string;
  vehicle_seat_capacity?: number;
  vehicle_standing_capacity?: number;
  vehicle_wheelplan?: string;
  vehicle_revenue_weight?: number;
  vehicle_real_driving_emissions?: string;
  vehicle_euro_status?: string;
  vehicle_particulate_trap?: string;
  vehicle_nox_control?: string;
  vehicle_modification_type?: string;
  vehicle_modification_type_extended?: string;
}

export interface DailyRunningCost {
  id: string;
  vehicle_id: string;
  date: string;
  fuel_cost: number;
  maintenance_cost: number;
  insurance_cost: number;
  tax_cost: number;
  depreciation_cost: number;
  other_costs: number;
  total_cost: number;
  mileage_start: number;
  mileage_end: number;
  distance_traveled: number;
  fuel_consumed: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Tyre {
  id: string;
  vehicle_id: string;
  position: string;
  brand: string;
  model: string;
  size: string;
  load_index: string;
  speed_rating: string;
  manufacture_date: string;
  installation_date: string;
  tread_depth_new: number;
  tread_depth_current: number;
  pressure_recommended: number;
  pressure_current: number;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'replace';
  replacement_date?: string;
  cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleAssignment {
  id: string;
  vehicle_id: string;
  driver_id: string;
  assignment_type: 'permanent' | 'temporary' | 'job' | 'school_route';
  start_date: string;
  end_date?: string;
  job_id?: string;
  route_id?: string;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface WalkAroundCheck {
  id: string;
  vehicle_id: string;
  driver_id: string;
  check_date: string;
  check_time: string;
  overall_status: 'pass' | 'fail' | 'warning';
  location: string;
  weather_conditions: string;
  mileage: number;
  notes: string;
  defects_found: number;
  photos_taken: number;
  check_items: any;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export interface ServiceRecord {
  id: string;
  vehicle_id: string;
  service_date: string;
  service_type: string;
  description: string;
  cost: number;
  mileage: number;
  vendor: string;
  next_service_date: string;
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: string;
  vehicle_id: string;
  inspection_date: string;
  inspection_type: string;
  result: string;
  inspector: string;
  notes: string;
  next_inspection_date: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrder {
  id: string;
  organization_id: string;
  vehicle_id: string;
  assigned_mechanic_id?: string;
  work_order_number: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  work_type?: 'preventive' | 'corrective' | 'emergency' | 'inspection' | 'modification' | 'other';
  estimated_hours?: number;
  actual_hours?: number;
  parts_required?: string[];
  labor_cost?: number;
  parts_cost?: number;
  total_cost?: number;
  scheduled_date?: string;
  started_date?: string;
  completed_date?: string;
  due_date?: string;
  location?: string;
  work_area?: string;
  tools_required?: string[];
  safety_requirements?: string[];
  quality_check_required?: boolean;
  quality_check_completed?: boolean;
  quality_check_by?: string;
  quality_check_date?: string;
  customer_approval_required?: boolean;
  customer_approval_received?: boolean;
  customer_approval_date?: string;
  warranty_work?: boolean;
  warranty_details?: string;
  photos_before?: string[];
  photos_after?: string[];
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  frequency_months: number;
  last_performed: string;
  next_due: string;
  estimated_cost: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  expiry_date?: string;
  status: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

// Vehicle Management Hooks

export const useVehicle = (vehicleId: string) => {
  return useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async (): Promise<Vehicle> => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!vehicleId,
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vehicleId, updates }: { vehicleId: string; updates: Partial<Vehicle> }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

// Daily Running Costs Hooks

export const useDailyRunningCosts = (vehicleId: string) => {
  return useQuery({
    queryKey: ['daily-running-costs', vehicleId],
    queryFn: async (): Promise<DailyRunningCost[]> => {
      const { data, error } = await supabase
        .from('daily_running_costs')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
};

export const useCreateDailyRunningCost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cost: Omit<DailyRunningCost, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('daily_running_costs')
        .insert(cost)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['daily-running-costs', data.vehicle_id] });
    },
  });
};

export const useUpdateDailyRunningCost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ costId, updates }: { costId: string; updates: Partial<DailyRunningCost> }) => {
      const { data, error } = await supabase
        .from('daily_running_costs')
        .update(updates)
        .eq('id', costId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['daily-running-costs', data.vehicle_id] });
    },
  });
};

export const useDeleteDailyRunningCost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (costId: string) => {
      const { error } = await supabase
        .from('daily_running_costs')
        .delete()
        .eq('id', costId);

      if (error) throw error;
      return costId;
    },
    onSuccess: (costId) => {
      // Invalidate all daily running costs queries since we don't know the vehicle_id
      queryClient.invalidateQueries({ queryKey: ['daily-running-costs'] });
    },
  });
};

// Tyres Hooks

export const useTyres = (vehicleId: string) => {
  return useQuery({
    queryKey: ['tyres', vehicleId],
    queryFn: async (): Promise<Tyre[]> => {
      const { data, error } = await supabase
        .from('tyres')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
};

export const useCreateTyre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tyre: Omit<Tyre, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tyres')
        .insert(tyre)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tyres', data.vehicle_id] });
    },
  });
};

export const useUpdateTyre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tyreId, updates }: { tyreId: string; updates: Partial<Tyre> }) => {
      const { data, error } = await supabase
        .from('tyres')
        .update(updates)
        .eq('id', tyreId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tyres', data.vehicle_id] });
    },
  });
};

export const useDeleteTyre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tyreId: string) => {
      const { error } = await supabase
        .from('tyres')
        .delete()
        .eq('id', tyreId);

      if (error) throw error;
      return tyreId;
    },
    onSuccess: (tyreId) => {
      queryClient.invalidateQueries({ queryKey: ['tyres'] });
    },
  });
};

// Vehicle Assignments Hooks

export const useVehicleAssignments = (vehicleId: string) => {
  return useQuery({
    queryKey: ['vehicle-assignments', vehicleId],
    queryFn: async (): Promise<VehicleAssignment[]> => {
      const { data, error } = await supabase
        .from('vehicle_assignments')
        .select(`
          *,
          profiles:driver_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('vehicle_id', vehicleId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
};

export const useCreateVehicleAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assignment: Omit<VehicleAssignment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vehicle_assignments')
        .insert(assignment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignments', data.vehicle_id] });
    },
  });
};

export const useUpdateVehicleAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ assignmentId, updates }: { assignmentId: string; updates: Partial<VehicleAssignment> }) => {
      const { data, error } = await supabase
        .from('vehicle_assignments')
        .update(updates)
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignments', data.vehicle_id] });
    },
  });
};

export const useDeleteVehicleAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('vehicle_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      return assignmentId;
    },
    onSuccess: (assignmentId) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignments'] });
    },
  });
};

// Walk Around Checks Hooks

export const useWalkAroundChecks = (vehicleId: string) => {
  return useQuery({
    queryKey: ['walk-around-checks', vehicleId],
    queryFn: async (): Promise<WalkAroundCheck[]> => {
      const { data, error } = await supabase
        .from('walk_around_checks')
        .select(`
          *,
          profiles:driver_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('vehicle_id', vehicleId)
        .order('check_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
};

export const useWalkAroundCheck = (checkId: string) => {
  return useQuery({
    queryKey: ['walk-around-check', checkId],
    queryFn: async (): Promise<WalkAroundCheck> => {
      const { data, error } = await supabase
        .from('walk_around_checks')
        .select(`
          *,
          profiles:driver_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', checkId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!checkId,
  });
};

export const useCreateWalkAroundCheck = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (check: Omit<WalkAroundCheck, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('walk_around_checks')
        .insert(check)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['walk-around-checks', data.vehicle_id] });
    },
  });
};

export const useUpdateWalkAroundCheck = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ checkId, updates }: { checkId: string; updates: Partial<WalkAroundCheck> }) => {
      const { data, error } = await supabase
        .from('walk_around_checks')
        .update(updates)
        .eq('id', checkId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['walk-around-checks', data.vehicle_id] });
      queryClient.invalidateQueries({ queryKey: ['walk-around-check', data.id] });
    },
  });
};

export const useDeleteWalkAroundCheck = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checkId: string) => {
      const { error } = await supabase
        .from('walk_around_checks')
        .delete()
        .eq('id', checkId);

      if (error) throw error;
      return checkId;
    },
    onSuccess: (checkId) => {
      queryClient.invalidateQueries({ queryKey: ['walk-around-checks'] });
    },
  });
};

// Service Records Hooks

export const useServiceRecords = (vehicleId: string) => {
  return useQuery({
    queryKey: ['service-records', vehicleId],
    queryFn: async (): Promise<ServiceRecord[]> => {
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('service_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
};

export const useCreateServiceRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceRecord: Omit<ServiceRecord, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('service_records')
        .insert(serviceRecord)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-records', data.vehicle_id] });
    },
  });
};

export const useUpdateServiceRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ recordId, updates }: { recordId: string; updates: Partial<ServiceRecord> }) => {
      const { data, error } = await supabase
        .from('service_records')
        .update(updates)
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-records', data.vehicle_id] });
    },
  });
};

export const useDeleteServiceRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await supabase
        .from('service_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
      return recordId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-records'] });
    },
  });
};

// Inspections Hooks

export const useInspections = (vehicleId: string) => {
  return useQuery({
    queryKey: ['inspections', vehicleId],
    queryFn: async (): Promise<Inspection[]> => {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('inspection_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
};

export const useCreateInspection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inspection: Omit<Inspection, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('inspections')
        .insert(inspection)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', data.vehicle_id] });
    },
  });
};

export const useUpdateInspection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ inspectionId, updates }: { inspectionId: string; updates: Partial<Inspection> }) => {
      const { data, error } = await supabase
        .from('inspections')
        .update(updates)
        .eq('id', inspectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', data.vehicle_id] });
    },
  });
};

export const useDeleteInspection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inspectionId: string) => {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', inspectionId);

      if (error) throw error;
      return inspectionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });
};

// Work Orders Hooks

export const useWorkOrders = (vehicleId: string) => {
  return useQuery({
    queryKey: ['work-orders', vehicleId],
    queryFn: async (): Promise<WorkOrder[]> => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workOrder: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('work_orders')
        .insert(workOrder)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', data.vehicle_id] });
    },
  });
};

export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ workOrderId, updates }: { workOrderId: string; updates: Partial<WorkOrder> }) => {
      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', workOrderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', data.vehicle_id] });
    },
  });
};

export const useDeleteWorkOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workOrderId: string) => {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', workOrderId);

      if (error) throw error;
      return workOrderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
};

// Maintenance Schedule Hooks

export const useMaintenanceSchedule = (vehicleId: string) => {
  return useQuery({
    queryKey: ['maintenance-schedule', vehicleId],
    queryFn: async (): Promise<MaintenanceSchedule[]> => {
      const { data, error } = await supabase
        .from('maintenance_schedule')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('next_due', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
};

export const useCreateMaintenanceSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (maintenance: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('maintenance_schedule')
        .insert(maintenance)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedule', data.vehicle_id] });
    },
  });
};

export const useUpdateMaintenanceSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ maintenanceId, updates }: { maintenanceId: string; updates: Partial<MaintenanceSchedule> }) => {
      const { data, error } = await supabase
        .from('maintenance_schedule')
        .update(updates)
        .eq('id', maintenanceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedule', data.vehicle_id] });
    },
  });
};

export const useDeleteMaintenanceSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (maintenanceId: string) => {
      const { error } = await supabase
        .from('maintenance_schedule')
        .delete()
        .eq('id', maintenanceId);

      if (error) throw error;
      return maintenanceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedule'] });
    },
  });
};

// Vehicle Documents Hooks

export const useVehicleDocuments = (vehicleId: string) => {
  return useQuery({
    queryKey: ['vehicle-documents', vehicleId],
    queryFn: async (): Promise<VehicleDocument[]> => {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
};

export const useCreateVehicleDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (document: Omit<VehicleDocument, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .insert(document)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-documents', data.vehicle_id] });
    },
  });
};

export const useUpdateVehicleDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, updates }: { documentId: string; updates: Partial<VehicleDocument> }) => {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-documents', data.vehicle_id] });
    },
  });
};

export const useDeleteVehicleDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('vehicle_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      return documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-documents'] });
    },
  });
};

// Statistics Hooks

export const useVehicleStatistics = (vehicleId: string) => {
  return useQuery({
    queryKey: ['vehicle-statistics', vehicleId],
    queryFn: async () => {
      // Get daily running costs statistics
      const { data: costsData, error: costsError } = await supabase
        .from('daily_running_costs')
        .select('total_cost, date, distance_traveled')
        .eq('vehicle_id', vehicleId)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (costsError) throw costsError;

      // Get tyre statistics
      const { data: tyresData, error: tyresError } = await supabase
        .from('tyres')
        .select('condition, cost')
        .eq('vehicle_id', vehicleId);

      if (tyresError) throw tyresError;

      // Get walk around checks statistics
      const { data: checksData, error: checksError } = await supabase
        .from('walk_around_checks')
        .select('overall_status, defects_found')
        .eq('vehicle_id', vehicleId)
        .gte('check_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (checksError) throw checksError;

      return {
        totalCosts: costsData?.reduce((sum, cost) => sum + cost.total_cost, 0) || 0,
        averageDailyCost: costsData?.length ? costsData.reduce((sum, cost) => sum + cost.total_cost, 0) / costsData.length : 0,
        totalDistance: costsData?.reduce((sum, cost) => sum + (cost.distance_traveled || 0), 0) || 0,
        tyreValue: tyresData?.reduce((sum, tyre) => sum + tyre.cost, 0) || 0,
        tyresNeedingReplacement: tyresData?.filter(tyre => tyre.condition === 'poor' || tyre.condition === 'replace').length || 0,
        totalChecks: checksData?.length || 0,
        failedChecks: checksData?.filter(check => check.overall_status === 'fail').length || 0,
        totalDefects: checksData?.reduce((sum, check) => sum + check.defects_found, 0) || 0,
      };
    },
    enabled: !!vehicleId,
  });
};
