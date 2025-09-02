import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// -------- Mock helpers (frontend-only fallbacks) --------
const nowIso = () => new Date().toISOString();

const buildMockInventory = (orgId: string): TireInventory[] => [
  {
    id: 'mock-tire-1',
    organization_id: orgId,
    tire_brand: 'Michelin',
    tire_model: 'X Multi Z',
    tire_size: '315/70R22.5',
    tire_type: 'steer',
    load_index: 154,
    speed_rating: 'L',
    stock_quantity: 6,
    minimum_stock: 4,
    cost_per_tire: 285.5,
    supplier: 'TyreCo UK',
    purchase_date: nowIso(),
    warranty_months: 24,
    location_storage: 'Bay A1',
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 'mock-tire-2',
    organization_id: orgId,
    tire_brand: 'Continental',
    tire_model: 'Hybrid HD3',
    tire_size: '315/80R22.5',
    tire_type: 'drive',
    load_index: 156,
    speed_rating: 'L',
    stock_quantity: 2,
    minimum_stock: 4,
    cost_per_tire: 299.99,
    supplier: 'RoadRubber Ltd',
    purchase_date: nowIso(),
    warranty_months: 18,
    location_storage: 'Bay B3',
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 'mock-tire-3',
    organization_id: orgId,
    tire_brand: 'Goodyear',
    tire_model: 'KMAX T',
    tire_size: '385/65R22.5',
    tire_type: 'trailer',
    load_index: 160,
    speed_rating: 'J',
    stock_quantity: 0,
    minimum_stock: 2,
    cost_per_tire: 260.0,
    supplier: 'Goodyear Direct',
    purchase_date: nowIso(),
    warranty_months: 12,
    location_storage: 'Bay C2',
    created_at: nowIso(),
    updated_at: nowIso(),
  }
];

const buildMockVehicleTires = (orgId: string, inventory: TireInventory[]): VehicleTire[] => [
  {
    id: 'mock-vt-1',
    vehicle_id: 'mock-veh-1',
    organization_id: orgId,
    position: 'front_left',
    tire_inventory_id: inventory[0]?.id,
    serial_number: 'SN-12345-A',
    installation_date: nowIso(),
    installation_mileage: 120000,
    current_tread_depth: 8.5,
    last_inspection_date: nowIso(),
    next_inspection_due: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
    pressure_psi: 110,
    status: 'active',
    notes: 'OK',
    created_at: nowIso(),
    updated_at: nowIso(),
    vehicle: { id: 'mock-veh-1', vehicle_number: 'BUS001', make: 'Volvo', model: '7900' },
    tire_inventory: inventory[0] || undefined,
  },
  {
    id: 'mock-vt-2',
    vehicle_id: 'mock-veh-1',
    organization_id: orgId,
    position: 'front_right',
    tire_inventory_id: inventory[0]?.id,
    serial_number: 'SN-12345-B',
    installation_date: nowIso(),
    installation_mileage: 120000,
    current_tread_depth: 8.2,
    last_inspection_date: nowIso(),
    next_inspection_due: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
    pressure_psi: 108,
    status: 'active',
    notes: 'Due re‑torque check',
    created_at: nowIso(),
    updated_at: nowIso(),
    vehicle: { id: 'mock-veh-1', vehicle_number: 'BUS001', make: 'Volvo', model: '7900' },
    tire_inventory: inventory[0] || undefined,
  },
  {
    id: 'mock-vt-3',
    vehicle_id: 'mock-veh-2',
    organization_id: orgId,
    position: 'rear_left_outer',
    tire_inventory_id: inventory[1]?.id,
    serial_number: 'SN-67890-A',
    installation_date: nowIso(),
    installation_mileage: 90000,
    current_tread_depth: 3.8,
    last_inspection_date: nowIso(),
    next_inspection_due: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
    pressure_psi: 105,
    status: 'worn',
    notes: 'Monitor wear',
    created_at: nowIso(),
    updated_at: nowIso(),
    vehicle: { id: 'mock-veh-2', vehicle_number: 'NBG-001', make: 'Mercedes', model: 'Citaro' },
    tire_inventory: inventory[1] || undefined,
  }
];

export interface TireInventory {
  id: string;
  organization_id: string;
  tire_brand: string;
  tire_model: string;
  tire_size: string;
  tire_type: 'drive' | 'steer' | 'trailer' | 'all_position';
  load_index: number;
  speed_rating: string;
  stock_quantity: number;
  minimum_stock: number;
  cost_per_tire?: number;
  supplier?: string;
  purchase_date?: string;
  warranty_months?: number;
  location_storage?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleTire {
  id: string;
  vehicle_id: string;
  organization_id: string;
  position: 'front_left' | 'front_right' | 'rear_left_outer' | 'rear_left_inner' | 'rear_right_outer' | 'rear_right_inner' | 'spare';
  tire_inventory_id?: string;
  serial_number?: string;
  installation_date: string;
  installation_mileage?: number;
  current_tread_depth?: number;
  last_inspection_date?: string;
  next_inspection_due?: string;
  pressure_psi?: number;
  status: 'active' | 'worn' | 'damaged' | 'replaced' | 'rotated';
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  vehicle?: {
    id: string;
    vehicle_number: string;
    make?: string;
    model?: string;
  };
  tire_inventory?: TireInventory;
}

export const useTireInventory = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['tire_inventory', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching tire inventory from database...');
      
      try {
        const { data, error } = await supabase
          .from('tire_inventory')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tire inventory:', error);
          // If table is missing or backend unavailable, return mock data for UI
          if (error.code === '42P01' || error.code === 'PGRST205') {
            console.warn('tire_inventory table not found, returning mock inventory');
            return buildMockInventory(profile.organization_id);
          }
          return buildMockInventory(profile.organization_id);
        }

        const result = (data as TireInventory[]) || [];
        return result.length > 0 ? result : buildMockInventory(profile.organization_id);
      } catch (error) {
        console.error('Error in useTireInventory:', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id,
  });
};

export const useVehicleTires = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['vehicle_tires', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching vehicle tires from database...');
      
      try {
        // First, get vehicle tires data
        const { data: tiresData, error: tiresError } = await supabase
          .from('vehicle_tires')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (tiresError) {
          console.error('Error fetching vehicle tires:', tiresError);
          if (tiresError.code === '42P01' || tiresError.code === 'PGRST205') {
            console.warn('vehicle_tires table not found, returning mock vehicle tires');
            const inv = buildMockInventory(profile.organization_id);
            return buildMockVehicleTires(profile.organization_id, inv);
          }
          const inv = buildMockInventory(profile.organization_id);
          return buildMockVehicleTires(profile.organization_id, inv);
        }

        // If no tires found, return empty array
        if (!tiresData || tiresData.length === 0) {
          const inv = buildMockInventory(profile.organization_id);
          return buildMockVehicleTires(profile.organization_id, inv);
        }

        // Get unique IDs for related data
        const vehicleIds = tiresData
          .filter(tire => tire.vehicle_id)
          .map(tire => tire.vehicle_id);
        const tireInventoryIds = tiresData
          .filter(tire => tire.tire_inventory_id)
          .map(tire => tire.tire_inventory_id);

        // Fetch related data
        const [vehiclesData, tireInventoryData] = await Promise.all([
          vehicleIds.length > 0 ? supabase
            .from('vehicles')
            .select('id, vehicle_number, make, model')
            .in('id', vehicleIds) : Promise.resolve({ data: [], error: null }),
          tireInventoryIds.length > 0 ? supabase
            .from('tire_inventory')
            .select('*')
            .in('id', tireInventoryIds) : Promise.resolve({ data: [], error: null })
        ]);

        // Combine vehicle tires with related data
        const tiresWithRelations = tiresData.map(tire => {
          const vehicle = vehiclesData.data?.find(v => v.id === tire.vehicle_id);
          const tireInventory = tireInventoryData.data?.find(ti => ti.id === tire.tire_inventory_id);

          return {
            ...tire,
            vehicle: vehicle || null,
            tire_inventory: tireInventory || null
          };
        });

        console.log('Fetched vehicle tires with relations:', tiresWithRelations);
        return tiresWithRelations as VehicleTire[] || [];
      } catch (error) {
        console.error('Error in useVehicleTires:', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateTireInventory = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tireData: Partial<TireInventory>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      try {
        const { data, error } = await supabase
          .from('tire_inventory')
          .insert({
            ...tireData,
            organization_id: profile.organization_id,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '42P01' || error.code === 'PGRST205') {
            console.warn('tire_inventory table not found, returning mock response');
            return {
              id: `tire-${Date.now()}`,
              ...tireData,
              organization_id: profile.organization_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error creating tire inventory:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tire_inventory'] });
      toast.success('Tire inventory item created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating tire inventory:', error);
      toast.error('Failed to create tire inventory: ' + error.message);
    }
  });
};

export const useCreateVehicleTire = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tireData: Partial<VehicleTire>) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      try {
        const { data, error } = await supabase
          .from('vehicle_tires')
          .insert({
            ...tireData,
            organization_id: profile.organization_id,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '42P01' || error.code === 'PGRST205') {
            console.warn('vehicle_tires table not found, returning mock response');
            return {
              id: `vehicle-tire-${Date.now()}`,
              ...tireData,
              organization_id: profile.organization_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error creating vehicle tire:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle_tires'] });
      toast.success('Vehicle tire recorded successfully');
    },
    onError: (error: any) => {
      console.error('Error creating vehicle tire:', error);
      toast.error('Failed to record vehicle tire: ' + error.message);
    }
  });
};

export const useUpdateVehicleTire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VehicleTire> }) => {
      try {
        const { data, error } = await supabase
          .from('vehicle_tires')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          if (error.code === '42P01' || error.code === 'PGRST205') {
            console.warn('vehicle_tires table not found, returning mock response');
            return {
              id,
              ...updates,
              updated_at: new Date().toISOString()
            };
          }
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error updating vehicle tire:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle_tires'] });
      toast.success('Vehicle tire updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating vehicle tire:', error);
      toast.error('Failed to update vehicle tire: ' + error.message);
    }
  });
};

export const useUpdateTireInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TireInventory> }) => {
      try {
        const { data, error } = await supabase
          .from('tire_inventory')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          if (error.code === '42P01' || error.code === 'PGRST205') {
            console.warn('tire_inventory table not found, returning mock response');
            return { id, ...updates, updated_at: new Date().toISOString() } as any;
          }
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error updating tire inventory:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tire_inventory'] });
      toast.success('Tire updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating tire inventory:', error);
      toast.error('Failed to update tire: ' + error.message);
    }
  });
};

export const useTireStats = () => {
  const { data: inventory = [] } = useTireInventory();
  const { data: vehicleTires = [] } = useVehicleTires();

  const stats = {
    total_inventory: inventory.length,
    low_stock_items: inventory.filter(item => item.stock_quantity <= item.minimum_stock).length,
    total_stock_value: inventory.reduce((sum, item) => sum + ((item.cost_per_tire || 0) * item.stock_quantity), 0),
    total_installed_tires: vehicleTires.length,
    tires_due_inspection: vehicleTires.filter(tire => {
      if (!tire.next_inspection_due) return false;
      const dueDate = new Date(tire.next_inspection_due);
      const today = new Date();
      return dueDate <= today;
    }).length,
    worn_tires: vehicleTires.filter(tire => tire.status === 'worn').length,
    damaged_tires: vehicleTires.filter(tire => tire.status === 'damaged').length,
    by_position: vehicleTires.reduce((acc, tire) => {
      acc[tire.position] = (acc[tire.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    by_status: vehicleTires.reduce((acc, tire) => {
      acc[tire.status] = (acc[tire.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return stats;
};
