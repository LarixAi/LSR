
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          role: string;
          avatar_url: string | null;
          employment_status: string | null;
          onboarding_status: string | null;
          hire_date: string | null;
          created_at: string | null;
          updated_at: string | null;
          employee_id: string | null;
          is_active: boolean;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          termination_date: string | null;
          cdl_number: string | null;
          medical_card_expiry: string | null;
          must_change_password: boolean | null;
          password_changed_at: string | null;
          organization_id: string | null;
          terms_accepted: boolean | null;
          terms_accepted_date: string | null;
          terms_version: string | null;
          privacy_policy_accepted: boolean | null;
          privacy_policy_accepted_date: string | null;
          privacy_policy_version: string | null;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: string;
          avatar_url?: string | null;
          employment_status?: string | null;
          onboarding_status?: string | null;
          hire_date?: string | null;
          employee_id?: string | null;
          is_active?: boolean;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          termination_date?: string | null;
          cdl_number?: string | null;
          medical_card_expiry?: string | null;
          must_change_password?: boolean | null;
          password_changed_at?: string | null;
          organization_id?: string | null;
          terms_accepted?: boolean | null;
          terms_accepted_date?: string | null;
          terms_version?: string | null;
          privacy_policy_accepted?: boolean | null;
          privacy_policy_accepted_date?: string | null;
          privacy_policy_version?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: string;
          avatar_url?: string | null;
          employment_status?: string | null;
          onboarding_status?: string | null;
          hire_date?: string | null;
          employee_id?: string | null;
          is_active?: boolean;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          termination_date?: string | null;
          cdl_number?: string | null;
          medical_card_expiry?: string | null;
          must_change_password?: boolean | null;
          password_changed_at?: string | null;
          organization_id?: string | null;
          terms_accepted?: boolean | null;
          terms_accepted_date?: string | null;
          terms_version?: string | null;
          privacy_policy_accepted?: boolean | null;
          privacy_policy_accepted_date?: string | null;
          privacy_policy_version?: string | null;
        };
      };
      fuel_purchases: {
        Row: {
          id: string;
          driver_id: string;
          vehicle_id: string;
          organization_id: string;
          purchase_date: string;
          fuel_type: string;
          quantity: number;
          unit_price: number;
          total_cost: number;
          location: string | null;
          odometer_reading: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          vehicle_id: string;
          organization_id: string;
          purchase_date?: string;
          fuel_type?: string;
          quantity: number;
          unit_price: number;
          total_cost: number;
          location?: string | null;
          odometer_reading?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          vehicle_id?: string;
          organization_id?: string;
          purchase_date?: string;
          fuel_type?: string;
          quantity?: number;
          unit_price?: number;
          total_cost?: number;
          location?: string | null;
          odometer_reading?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          vehicle_number: string | null;
          license_plate: string | null;
          make: string | null;
          model: string | null;
          year: number | null;
          fuel_type: string | null;
          status: string | null;
          organization_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          vehicle_number?: string | null;
          license_plate?: string | null;
          make?: string | null;
          model?: string | null;
          year?: number | null;
          fuel_type?: string | null;
          status?: string | null;
          organization_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          vehicle_number?: string | null;
          license_plate?: string | null;
          make?: string | null;
          model?: string | null;
          year?: number | null;
          fuel_type?: string | null;
          status?: string | null;
          organization_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string | null;
          slug: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          slug?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          slug?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
