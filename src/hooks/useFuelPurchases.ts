import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type FuelPurchase = Tables<'fuel_purchases'>;

export interface CreateFuelPurchaseData {
  vehicle_id: string;
  fuel_type: 'diesel' | 'petrol' | 'electric';
  quantity: number;
  unit_price: number;
  total_cost: number;
  location?: string;
  odometer_reading?: number;
  purchase_date?: string;
  notes?: string;
}

export interface FuelPurchaseWithDetails {
  id: string;
  driver_id: string;
  vehicle_id: string;
  fuel_type: 'diesel' | 'petrol' | 'electric';
  quantity: number;
  unit_price: number;
  total_cost: number;
  location?: string;
  odometer_reading?: number;
  purchase_date: string;
  notes?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  // Frontend-added fields for display
  vehicle_number?: string;
  license_plate?: string;
  make?: string;
  model?: string;
  driver_name?: string;
}

export const useFuelPurchases = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['fuel-purchases', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        throw new Error('User profile is required');
      }

      console.log('Fetching fuel purchases from database...');
      
      // Fetch fuel purchases without joins (since foreign keys might not be set up)
      const { data, error } = await supabase
        .from('fuel_purchases')
        .select('*')
        .eq('driver_id', profile.id)
        .order('purchase_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fuel purchases:', error);
        throw error;
      }

      // Transform the data to include vehicle and driver details
      // Since we don't have joins, we'll provide default values or fetch separately if needed
      const transformedData: FuelPurchaseWithDetails[] = (data || []).map(purchase => ({
        ...purchase,
        vehicle_number: purchase.vehicle_number || 'Unknown',
        license_plate: purchase.license_plate || 'Unknown',
        make: purchase.make || 'Unknown',
        model: purchase.model || 'Unknown',
        driver_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Driver'
      }));

      console.log('Fetched fuel purchases:', transformedData);
      return transformedData;
    },
    enabled: !!profile?.id,
  });
};

export const useCreateFuelPurchase = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseData: CreateFuelPurchaseData) => {
      if (!profile?.id || !profile?.organization_id) {
        throw new Error('User profile and organization information required');
      }

      // Ensure we have a valid vehicle_id (required field)
      if (!purchaseData.vehicle_id) {
        throw new Error('Vehicle ID is required for fuel purchase');
      }

      const { data, error } = await supabase
        .from('fuel_purchases')
        .insert({
          ...purchaseData,
          driver_id: profile.id,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-purchases'] });
      toast.success('Fuel purchase recorded successfully');
    },
    onError: (error: any) => {
      console.error('Error creating fuel purchase:', error);
      toast.error('Failed to record fuel purchase: ' + error.message);
    }
  });
};

export const useUpdateFuelPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FuelPurchase> }) => {
      const { data, error } = await supabase
        .from('fuel_purchases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-purchases'] });
      toast.success('Fuel purchase updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating fuel purchase:', error);
      toast.error('Failed to update fuel purchase: ' + error.message);
    }
  });
};

export const useDeleteFuelPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fuel_purchases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-purchases'] });
      toast.success('Fuel purchase deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting fuel purchase:', error);
      toast.error('Failed to delete fuel purchase: ' + error.message);
    }
  });
};

export const useFuelStatistics = () => {
  const { data: fuelPurchases = [] } = useFuelPurchases();

  const calculateStatistics = () => {
    const totalSpent = fuelPurchases.reduce((sum, purchase) => sum + Number(purchase.total_cost), 0);
    const totalQuantity = fuelPurchases.reduce((sum, purchase) => sum + Number(purchase.quantity), 0);
    const averagePrice = totalQuantity > 0 ? totalSpent / totalQuantity : 0;

    // Calculate by fuel type
    const byFuelType = fuelPurchases.reduce((acc, purchase) => {
      const type = purchase.fuel_type;
      if (!acc[type]) {
        acc[type] = { quantity: 0, cost: 0, count: 0 };
      }
      acc[type].quantity += Number(purchase.quantity);
      acc[type].cost += Number(purchase.total_cost);
      acc[type].count += 1;
      return acc;
    }, {} as Record<string, { quantity: number; cost: number; count: number }>);

    // Calculate monthly trends
    const monthlyData = fuelPurchases.reduce((acc, purchase) => {
      const month = new Date(purchase.purchase_date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { quantity: 0, cost: 0, count: 0 };
      }
      acc[month].quantity += Number(purchase.quantity);
      acc[month].cost += Number(purchase.total_cost);
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, { quantity: number; cost: number; count: number }>);

    return {
      totalSpent,
      totalQuantity,
      averagePrice,
      byFuelType,
      monthlyData,
      purchaseCount: fuelPurchases.length
    };
  };

  return {
    statistics: calculateStatistics(),
    isLoading: false
  };
};
