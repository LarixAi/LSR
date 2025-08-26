import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomerBooking {
  id: string;
  organization_id: string;
  booking_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_id?: string;
  pickup_location: string;
  dropoff_location: string;
  service_type: 'school_transport' | 'medical_transport' | 'corporate_transport' | 'event_transport' | 'airport_transfer' | 'charter' | 'other';
  passengers?: number;
  wheelchair_required?: boolean;
  wheelchair_type?: string;
  special_requirements?: string;
  booking_date: string;
  pickup_time?: string;
  dropoff_time?: string;
  estimated_duration_minutes?: number;
  estimated_distance_km?: number;
  estimated_price?: number;
  final_price?: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded';
  payment_method?: string;
  assigned_vehicle_id?: string;
  assigned_driver_id?: string;
  actual_pickup_time?: string;
  actual_dropoff_time?: string;
  actual_duration_minutes?: number;
  actual_distance_km?: number;
  driver_notes?: string;
  customer_rating?: number;
  customer_feedback?: string;
  cancellation_reason?: string;
  cancellation_date?: string;
  cancelled_by?: string;
  refund_amount?: number;
  refund_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  assigned_vehicle?: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
    license_plate: string;
  };
  assigned_driver?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  customer_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  created_by_profile?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateCustomerBookingData {
  booking_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_id?: string;
  pickup_location: string;
  dropoff_location: string;
  service_type: 'school_transport' | 'medical_transport' | 'corporate_transport' | 'event_transport' | 'airport_transfer' | 'charter' | 'other';
  passengers?: number;
  wheelchair_required?: boolean;
  wheelchair_type?: string;
  special_requirements?: string;
  booking_date: string;
  pickup_time?: string;
  dropoff_time?: string;
  estimated_duration_minutes?: number;
  estimated_distance_km?: number;
  estimated_price?: number;
}

export interface UpdateCustomerBookingData {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  pickup_location?: string;
  dropoff_location?: string;
  service_type?: 'school_transport' | 'medical_transport' | 'corporate_transport' | 'event_transport' | 'airport_transfer' | 'charter' | 'other';
  passengers?: number;
  wheelchair_required?: boolean;
  wheelchair_type?: string;
  special_requirements?: string;
  pickup_time?: string;
  dropoff_time?: string;
  estimated_duration_minutes?: number;
  estimated_distance_km?: number;
  estimated_price?: number;
  final_price?: number;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  payment_status?: 'pending' | 'paid' | 'partially_paid' | 'refunded';
  payment_method?: string;
  assigned_vehicle_id?: string;
  assigned_driver_id?: string;
  actual_pickup_time?: string;
  actual_dropoff_time?: string;
  actual_duration_minutes?: number;
  actual_distance_km?: number;
  driver_notes?: string;
  customer_rating?: number;
  customer_feedback?: string;
  cancellation_reason?: string;
  refund_amount?: number;
}

export const useCustomerBookings = (organizationId?: string, status?: string, serviceType?: string, dateRange?: { start: string; end: string }) => {
  const { profile } = useAuth();

  // Fetch customer bookings with related data
  const { data: customerBookings = [], isLoading, error } = useQuery({
    queryKey: ['customer-bookings', organizationId, status, serviceType, dateRange],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        let query = supabase
          .from('customer_bookings')
          .select(`
            *,
            assigned_vehicle:vehicles!customer_bookings_assigned_vehicle_id_fkey(id, vehicle_number, make, model, license_plate),
            assigned_driver:profiles!customer_bookings_assigned_driver_id_fkey(id, first_name, last_name, email),
            customer_profile:customer_profiles!customer_bookings_customer_id_fkey(id, first_name, last_name, email, phone),
            created_by_profile:profiles!customer_bookings_created_by_fkey(id, first_name, last_name)
          `)
          .eq('organization_id', organizationId)
          .order('booking_date', { ascending: false });

        // Filter by status if specified
        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        // Filter by service type if specified
        if (serviceType && serviceType !== 'all') {
          query = query.eq('service_type', serviceType);
        }

        // Filter by date range if specified
        if (dateRange?.start) {
          query = query.gte('booking_date', dateRange.start);
        }
        if (dateRange?.end) {
          query = query.lte('booking_date', dateRange.end);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error('Error fetching customer bookings:', fetchError);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in customer bookings query:', error);
        return [];
      }
    },
    enabled: !!organizationId,
  });

  // Calculate statistics
  const calculateStats = () => {
    if (!customerBookings || customerBookings.length === 0) {
      return {
        total: 0,
        byStatus: {
          pending: 0,
          confirmed: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0,
          no_show: 0,
        },
        byServiceType: {
          school_transport: 0,
          medical_transport: 0,
          corporate_transport: 0,
          event_transport: 0,
          airport_transfer: 0,
          charter: 0,
          other: 0,
        },
        byPaymentStatus: {
          pending: 0,
          paid: 0,
          partially_paid: 0,
          refunded: 0,
        },
        totalRevenue: 0,
        totalEstimatedRevenue: 0,
        averageRating: 0,
        wheelchairBookings: 0,
        averagePassengers: 0,
        totalDistance: 0,
        totalDuration: 0,
      };
    }

    const stats = {
      total: customerBookings.length,
      byStatus: {
        pending: 0,
        confirmed: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
      },
      byServiceType: {
        school_transport: 0,
        medical_transport: 0,
        corporate_transport: 0,
        event_transport: 0,
        airport_transfer: 0,
        charter: 0,
        other: 0,
      },
      byPaymentStatus: {
        pending: 0,
        paid: 0,
        partially_paid: 0,
        refunded: 0,
      },
      totalRevenue: 0,
      totalEstimatedRevenue: 0,
      averageRating: 0,
      wheelchairBookings: 0,
      averagePassengers: 0,
      totalDistance: 0,
      totalDuration: 0,
    };

    let totalRating = 0;
    let ratingCount = 0;
    let totalPassengers = 0;
    let passengerCount = 0;

    customerBookings.forEach(booking => {
      // Count by status
      if (booking.status) {
        stats.byStatus[booking.status as keyof typeof stats.byStatus]++;
      }

      // Count by service type
      if (booking.service_type) {
        stats.byServiceType[booking.service_type as keyof typeof stats.byServiceType]++;
      }

      // Count by payment status
      if (booking.payment_status) {
        stats.byPaymentStatus[booking.payment_status as keyof typeof stats.byPaymentStatus]++;
      }

      // Sum revenue
      if (booking.final_price) {
        stats.totalRevenue += booking.final_price;
      }
      if (booking.estimated_price) {
        stats.totalEstimatedRevenue += booking.estimated_price;
      }

      // Calculate rating
      if (booking.customer_rating) {
        totalRating += booking.customer_rating;
        ratingCount++;
      }

      // Count wheelchair bookings
      if (booking.wheelchair_required) {
        stats.wheelchairBookings++;
      }

      // Calculate passengers
      if (booking.passengers) {
        totalPassengers += booking.passengers;
        passengerCount++;
      }

      // Sum distance and duration
      if (booking.actual_distance_km) {
        stats.totalDistance += booking.actual_distance_km;
      }
      if (booking.actual_duration_minutes) {
        stats.totalDuration += booking.actual_duration_minutes;
      }
    });

    stats.averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
    stats.averagePassengers = passengerCount > 0 ? totalPassengers / passengerCount : 0;

    return stats;
  };

  const stats = calculateStats();

  return {
    customerBookings,
    isLoading,
    error,
    stats,
    hasData: customerBookings.length > 0,
  };
};

export const useCreateCustomerBooking = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (customerBooking: CreateCustomerBookingData) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('customer_bookings')
        .insert([{
          ...customerBooking,
          organization_id: profile.organization_id,
          created_by: profile.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
    },
  });
};

export const useUpdateCustomerBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateCustomerBookingData & { id: string }) => {
      const { data, error } = await supabase
        .from('customer_bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
    },
  });
};

export const useDeleteCustomerBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customer_bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
    },
  });
};
