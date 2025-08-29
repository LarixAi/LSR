
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
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
