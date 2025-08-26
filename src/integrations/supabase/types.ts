export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      billing_history: {
        Row: {
          amount: number
          created_at: string | null
          date: string | null
          description: string
          discount_amount: number | null
          id: string
          invoice_url: string | null
          organization_id: string | null
          payment_method: string | null
          status: string
          stripe_invoice_id: string | null
          subscription_id: string | null
          tax_amount: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          date?: string | null
          description: string
          discount_amount?: number | null
          id?: string
          invoice_url?: string | null
          organization_id?: string | null
          payment_method?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tax_amount?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string | null
          description?: string
          discount_amount?: number | null
          id?: string
          invoice_url?: string | null
          organization_id?: string | null
          payment_method?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tax_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          allergies: string | null
          created_at: string | null
          date_of_birth: string
          dropoff_location: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          grade: string | null
          id: string
          is_active: boolean | null
          last_name: string
          medical_conditions: string | null
          parent_id: string | null
          pickup_location: string | null
          profile_image_url: string | null
          school: string | null
          special_instructions: string | null
          updated_at: string | null
        }
        Insert: {
          allergies?: string | null
          created_at?: string | null
          date_of_birth: string
          dropoff_location?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          grade?: string | null
          id?: string
          is_active?: boolean | null
          last_name: string
          medical_conditions?: string | null
          parent_id?: string | null
          pickup_location?: string | null
          profile_image_url?: string | null
          school?: string | null
          special_instructions?: string | null
          updated_at?: string | null
        }
        Update: {
          allergies?: string | null
          created_at?: string | null
          date_of_birth?: string
          dropoff_location?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          grade?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          medical_conditions?: string | null
          parent_id?: string | null
          pickup_location?: string | null
          profile_image_url?: string | null
          school?: string | null
          special_instructions?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      child_transport_status: {
        Row: {
          child_id: string | null
          created_at: string | null
          current_location: string | null
          driver_id: string | null
          estimated_arrival: string | null
          id: string
          last_updated: string | null
          route_id: string | null
          status: string
          vehicle_id: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          current_location?: string | null
          driver_id?: string | null
          estimated_arrival?: string | null
          id?: string
          last_updated?: string | null
          route_id?: string | null
          status: string
          vehicle_id?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          current_location?: string | null
          driver_id?: string | null
          estimated_arrival?: string | null
          id?: string
          last_updated?: string | null
          route_id?: string | null
          status?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_transport_status_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_transport_status_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_transport_status_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_transport_status_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_with_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_transport_status_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_with_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_transport_status_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_violations: {
        Row: {
          assigned_to: string | null
          case_number: string | null
          corrective_actions: string[] | null
          created_at: string | null
          created_by: string | null
          description: string
          driver_id: string | null
          evidence_files: string[] | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          impact_on_operations: string | null
          lessons_learned: string | null
          location: string | null
          organization_id: string | null
          penalty_amount: number | null
          penalty_currency: string | null
          regulatory_body: string | null
          resolution_date: string | null
          resolution_notes: string | null
          risk_assessment_score: number | null
          severity: string | null
          status: string | null
          updated_at: string | null
          vehicle_id: string | null
          violation_date: string
          violation_type: string
          witnesses: string[] | null
        }
        Insert: {
          assigned_to?: string | null
          case_number?: string | null
          corrective_actions?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description: string
          driver_id?: string | null
          evidence_files?: string[] | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          impact_on_operations?: string | null
          lessons_learned?: string | null
          location?: string | null
          organization_id?: string | null
          penalty_amount?: number | null
          penalty_currency?: string | null
          regulatory_body?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          risk_assessment_score?: number | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          violation_date: string
          violation_type: string
          witnesses?: string[] | null
        }
        Update: {
          assigned_to?: string | null
          case_number?: string | null
          corrective_actions?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          driver_id?: string | null
          evidence_files?: string[] | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          impact_on_operations?: string | null
          lessons_learned?: string | null
          location?: string | null
          organization_id?: string | null
          penalty_amount?: number | null
          penalty_currency?: string | null
          regulatory_body?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          risk_assessment_score?: number | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          violation_date?: string
          violation_type?: string
          witnesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_violations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_bookings: {
        Row: {
          actual_distance_km: number | null
          actual_dropoff_time: string | null
          actual_duration_minutes: number | null
          actual_pickup_time: string | null
          assigned_driver_id: string | null
          assigned_vehicle_id: string | null
          booking_date: string
          booking_number: string
          cancellation_date: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          created_at: string | null
          created_by: string | null
          customer_email: string | null
          customer_feedback: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          customer_rating: number | null
          driver_notes: string | null
          dropoff_location: string
          dropoff_time: string | null
          estimated_distance_km: number | null
          estimated_duration_minutes: number | null
          estimated_price: number | null
          final_price: number | null
          id: string
          organization_id: string | null
          passengers: number | null
          payment_method: string | null
          payment_status: string | null
          pickup_location: string
          pickup_time: string | null
          refund_amount: number | null
          refund_date: string | null
          service_type: string
          special_requirements: string | null
          status: string | null
          updated_at: string | null
          wheelchair_required: boolean | null
          wheelchair_type: string | null
        }
        Insert: {
          actual_distance_km?: number | null
          actual_dropoff_time?: string | null
          actual_duration_minutes?: number | null
          actual_pickup_time?: string | null
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          booking_date: string
          booking_number: string
          cancellation_date?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          customer_rating?: number | null
          driver_notes?: string | null
          dropoff_location: string
          dropoff_time?: string | null
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          organization_id?: string | null
          passengers?: number | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_location: string
          pickup_time?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          service_type: string
          special_requirements?: string | null
          status?: string | null
          updated_at?: string | null
          wheelchair_required?: boolean | null
          wheelchair_type?: string | null
        }
        Update: {
          actual_distance_km?: number | null
          actual_dropoff_time?: string | null
          actual_duration_minutes?: number | null
          actual_pickup_time?: string | null
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          booking_date?: string
          booking_number?: string
          cancellation_date?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          customer_rating?: number | null
          driver_notes?: string | null
          dropoff_location?: string
          dropoff_time?: string | null
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          organization_id?: string | null
          passengers?: number | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_location?: string
          pickup_time?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          service_type?: string
          special_requirements?: string | null
          status?: string | null
          updated_at?: string | null
          wheelchair_required?: boolean | null
          wheelchair_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_bookings_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_bookings_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_bookings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          accessibility_requirements: string[] | null
          address_line_1: string | null
          address_line_2: string | null
          allergies: string[] | null
          average_rating: number | null
          city: string | null
          company_name: string | null
          company_registration_number: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          customer_number: string
          customer_type: string | null
          data_protection_consent: boolean | null
          data_protection_consent_date: string | null
          date_of_birth: string | null
          dietary_restrictions: string[] | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string
          id: string
          last_booking_date: string | null
          last_name: string
          loyalty_points: number | null
          loyalty_tier: string | null
          marketing_consent: boolean | null
          marketing_consent_date: string | null
          medical_conditions: string[] | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          postal_code: string | null
          preferred_contact_method: string | null
          preferred_language: string | null
          state: string | null
          status: string | null
          terms_accepted: boolean | null
          terms_accepted_date: string | null
          total_bookings: number | null
          total_spent: number | null
          updated_at: string | null
          vat_number: string | null
        }
        Insert: {
          accessibility_requirements?: string[] | null
          address_line_1?: string | null
          address_line_2?: string | null
          allergies?: string[] | null
          average_rating?: number | null
          city?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_number: string
          customer_type?: string | null
          data_protection_consent?: boolean | null
          data_protection_consent_date?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name: string
          id?: string
          last_booking_date?: string | null
          last_name: string
          loyalty_points?: number | null
          loyalty_tier?: string | null
          marketing_consent?: boolean | null
          marketing_consent_date?: string | null
          medical_conditions?: string[] | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          preferred_language?: string | null
          state?: string | null
          status?: string | null
          terms_accepted?: boolean | null
          terms_accepted_date?: string | null
          total_bookings?: number | null
          total_spent?: number | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Update: {
          accessibility_requirements?: string[] | null
          address_line_1?: string | null
          address_line_2?: string | null
          allergies?: string[] | null
          average_rating?: number | null
          city?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_number?: string
          customer_type?: string | null
          data_protection_consent?: boolean | null
          data_protection_consent_date?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string
          id?: string
          last_booking_date?: string | null
          last_name?: string
          loyalty_points?: number | null
          loyalty_tier?: string | null
          marketing_consent?: boolean | null
          marketing_consent_date?: string | null
          medical_conditions?: string[] | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          preferred_language?: string | null
          state?: string | null
          status?: string | null
          terms_accepted?: boolean | null
          terms_accepted_date?: string | null
          total_bookings?: number | null
          total_spent?: number | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      defect_reports: {
        Row: {
          actual_repair_cost: number | null
          approved_by: string | null
          approved_date: string | null
          attachments: string[] | null
          component_affected: string | null
          created_at: string | null
          customer_notification_date: string | null
          customer_notified: boolean | null
          customer_response: string | null
          defect_type: string
          description: string
          estimated_repair_cost: number | null
          follow_up_date: string | null
          follow_up_notes: string | null
          follow_up_required: boolean | null
          id: string
          investigated_date: string | null
          investigation_by: string | null
          investigation_notes: string | null
          labor_hours: number | null
          location: string | null
          operational_impact: string | null
          organization_id: string | null
          parts_used: string[] | null
          photos: string[] | null
          reported_by: string | null
          reported_date: string
          resolution_method: string | null
          resolution_notes: string | null
          resolved_date: string | null
          safety_implications: boolean | null
          safety_implications_details: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
          vehicle_id: string | null
          warranty_claim: boolean | null
          warranty_claim_number: string | null
          warranty_claim_status: string | null
          work_order_id: string | null
        }
        Insert: {
          actual_repair_cost?: number | null
          approved_by?: string | null
          approved_date?: string | null
          attachments?: string[] | null
          component_affected?: string | null
          created_at?: string | null
          customer_notification_date?: string | null
          customer_notified?: boolean | null
          customer_response?: string | null
          defect_type: string
          description: string
          estimated_repair_cost?: number | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          investigated_date?: string | null
          investigation_by?: string | null
          investigation_notes?: string | null
          labor_hours?: number | null
          location?: string | null
          operational_impact?: string | null
          organization_id?: string | null
          parts_used?: string[] | null
          photos?: string[] | null
          reported_by?: string | null
          reported_date: string
          resolution_method?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          safety_implications?: boolean | null
          safety_implications_details?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          warranty_claim?: boolean | null
          warranty_claim_number?: string | null
          warranty_claim_status?: string | null
          work_order_id?: string | null
        }
        Update: {
          actual_repair_cost?: number | null
          approved_by?: string | null
          approved_date?: string | null
          attachments?: string[] | null
          component_affected?: string | null
          created_at?: string | null
          customer_notification_date?: string | null
          customer_notified?: boolean | null
          customer_response?: string | null
          defect_type?: string
          description?: string
          estimated_repair_cost?: number | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          investigated_date?: string | null
          investigation_by?: string | null
          investigation_notes?: string | null
          labor_hours?: number | null
          location?: string | null
          operational_impact?: string | null
          organization_id?: string | null
          parts_used?: string[] | null
          photos?: string[] | null
          reported_by?: string | null
          reported_date?: string
          resolution_method?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          safety_implications?: boolean | null
          safety_implications_details?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          warranty_claim?: boolean | null
          warranty_claim_number?: string | null
          warranty_claim_status?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defect_reports_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defect_reports_investigation_by_fkey"
            columns: ["investigation_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defect_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defect_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defect_reports_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defect_reports_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_purchases: {
        Row: {
          created_at: string | null
          driver_id: string
          fuel_type: string
          id: string
          location: string | null
          notes: string | null
          odometer_reading: number | null
          organization_id: string | null
          purchase_date: string
          quantity: number
          receipt_url: string | null
          total_cost: number
          unit_price: number
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          fuel_type: string
          id?: string
          location?: string | null
          notes?: string | null
          odometer_reading?: number | null
          organization_id?: string | null
          purchase_date?: string
          quantity: number
          receipt_url?: string | null
          total_cost: number
          unit_price: number
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          fuel_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          odometer_reading?: number | null
          organization_id?: string | null
          purchase_date?: string
          quantity?: number
          receipt_url?: string | null
          total_cost?: number
          unit_price?: number
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_purchases_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_purchases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_purchases_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          notes: string | null
          organization_id: string | null
          paid_date: string | null
          payment_method: string | null
          service_type: string | null
          status: string | null
          subtotal: number | null
          total_amount: number | null
          updated_at: string | null
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          notes?: string | null
          organization_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          service_type?: string | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          notes?: string | null
          organization_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          service_type?: string | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      license_renewals: {
        Row: {
          created_at: string | null
          id: string
          license_id: string
          new_expiry_date: string
          notes: string | null
          previous_expiry_date: string
          renewal_cost: number | null
          renewal_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          license_id: string
          new_expiry_date: string
          notes?: string | null
          previous_expiry_date: string
          renewal_cost?: number | null
          renewal_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          license_id?: string
          new_expiry_date?: string
          notes?: string | null
          previous_expiry_date?: string
          renewal_cost?: number | null
          renewal_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_renewals_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_logs: {
        Row: {
          channel: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          notification_id: string
          recipient_id: string
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id: string
          recipient_id: string
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id?: string
          recipient_id?: string
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_messages: {
        Row: {
          body: string
          category: string
          channels: string[]
          created_at: string | null
          delivered_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          priority: string
          read_at: string | null
          recipient_id: string | null
          recipient_role: string | null
          scheduled_for: string | null
          sender_id: string
          sender_name: string
          sender_role: string
          sent_at: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          body: string
          category?: string
          channels?: string[]
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string
          read_at?: string | null
          recipient_id?: string | null
          recipient_role?: string | null
          scheduled_for?: string | null
          sender_id: string
          sender_name: string
          sender_role: string
          sent_at?: string | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          category?: string
          channels?: string[]
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string
          read_at?: string | null
          recipient_id?: string | null
          recipient_role?: string | null
          scheduled_for?: string | null
          sender_id?: string
          sender_name?: string
          sender_role?: string
          sent_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          categories: Json | null
          created_at: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          organization_id: string | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_enabled: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categories?: Json | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          organization_id?: string | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categories?: Json | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          organization_id?: string | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body: string
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string | null
          priority: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          body: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id?: string | null
          priority?: string
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string | null
          priority?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          max_drivers: number | null
          name: string
          phone: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          max_drivers?: number | null
          name: string
          phone?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          max_drivers?: number | null
          name?: string
          phone?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      parent_communications: {
        Row: {
          child_id: string | null
          created_at: string | null
          driver_id: string | null
          id: string
          message: string
          message_type: string
          parent_id: string | null
          priority: string | null
          read_at: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          message: string
          message_type: string
          parent_id?: string | null
          priority?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          message?: string
          message_type?: string
          parent_id?: string | null
          priority?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_communications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_notifications: {
        Row: {
          child_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          parent_id: string | null
          priority: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          parent_id?: string | null
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type: string
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          parent_id?: string | null
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_notifications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_inventory: {
        Row: {
          batch_number: string | null
          bin_location: string | null
          category: string | null
          compatible_models: string[] | null
          compatible_vehicles: string[] | null
          condition: string | null
          created_at: string | null
          created_by: string | null
          current_stock: number | null
          description: string | null
          dimensions: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          last_restocked_date: string | null
          last_used_date: string | null
          location: string | null
          lot_number: string | null
          manufacturer: string | null
          maximum_stock: number | null
          minimum_stock: number | null
          notes: string | null
          organization_id: string | null
          part_name: string
          part_number: string
          reorder_point: number | null
          reorder_quantity: number | null
          serial_number: string | null
          shelf_life_months: number | null
          supplier: string | null
          supplier_part_number: string | null
          unit_cost: number | null
          unit_price: number | null
          updated_at: string | null
          usage_count: number | null
          warranty_expiry_date: string | null
          warranty_months: number | null
          weight_kg: number | null
        }
        Insert: {
          batch_number?: string | null
          bin_location?: string | null
          category?: string | null
          compatible_models?: string[] | null
          compatible_vehicles?: string[] | null
          condition?: string | null
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          dimensions?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          last_restocked_date?: string | null
          last_used_date?: string | null
          location?: string | null
          lot_number?: string | null
          manufacturer?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          notes?: string | null
          organization_id?: string | null
          part_name: string
          part_number: string
          reorder_point?: number | null
          reorder_quantity?: number | null
          serial_number?: string | null
          shelf_life_months?: number | null
          supplier?: string | null
          supplier_part_number?: string | null
          unit_cost?: number | null
          unit_price?: number | null
          updated_at?: string | null
          usage_count?: number | null
          warranty_expiry_date?: string | null
          warranty_months?: number | null
          weight_kg?: number | null
        }
        Update: {
          batch_number?: string | null
          bin_location?: string | null
          category?: string | null
          compatible_models?: string[] | null
          compatible_vehicles?: string[] | null
          condition?: string | null
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          dimensions?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          last_restocked_date?: string | null
          last_used_date?: string | null
          location?: string | null
          lot_number?: string | null
          manufacturer?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          notes?: string | null
          organization_id?: string | null
          part_name?: string
          part_number?: string
          reorder_point?: number | null
          reorder_quantity?: number | null
          serial_number?: string | null
          shelf_life_months?: number | null
          supplier?: string | null
          supplier_part_number?: string | null
          unit_cost?: number | null
          unit_price?: number | null
          updated_at?: string | null
          usage_count?: number | null
          warranty_expiry_date?: string | null
          warranty_months?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_inventory_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_inventory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_assistants: {
        Row: {
          address: string | null
          availability_schedule: Json | null
          background_check_date: string | null
          background_check_status: string | null
          certifications: string[] | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          experience_years: number | null
          first_name: string
          hourly_rate: number | null
          id: string
          last_name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          qualifications: string[] | null
          specializations: string[] | null
          status: string | null
          training_completed: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          availability_schedule?: Json | null
          background_check_date?: string | null
          background_check_status?: string | null
          certifications?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          experience_years?: number | null
          first_name: string
          hourly_rate?: number | null
          id?: string
          last_name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          qualifications?: string[] | null
          specializations?: string[] | null
          status?: string | null
          training_completed?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          availability_schedule?: Json | null
          background_check_date?: string | null
          background_check_status?: string | null
          certifications?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          experience_years?: number | null
          first_name?: string
          hourly_rate?: number | null
          id?: string
          last_name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          qualifications?: string[] | null
          specializations?: string[] | null
          status?: string | null
          training_completed?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_assistants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          license_expiry: string | null
          license_number: string | null
          organization_id: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          license_expiry?: string | null
          license_number?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          license_expiry?: string | null
          license_number?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quotations: {
        Row: {
          accepted_date: string | null
          base_amount: number | null
          contact_person: string | null
          converted_date: string | null
          created_at: string | null
          created_by: string | null
          created_date: string | null
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          description: string | null
          discount_amount: number | null
          duration: string | null
          expires_at: string | null
          frequency: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          organization_id: string | null
          passengers: number | null
          priority: string | null
          quote_number: string
          route_details: string | null
          service_type: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          valid_until: string | null
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          accepted_date?: string | null
          base_amount?: number | null
          contact_person?: string | null
          converted_date?: string | null
          created_at?: string | null
          created_by?: string | null
          created_date?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          description?: string | null
          discount_amount?: number | null
          duration?: string | null
          expires_at?: string | null
          frequency?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          organization_id?: string | null
          passengers?: number | null
          priority?: string | null
          quote_number: string
          route_details?: string | null
          service_type?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          accepted_date?: string | null
          base_amount?: number | null
          contact_person?: string | null
          converted_date?: string | null
          created_at?: string | null
          created_by?: string | null
          created_date?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          description?: string | null
          discount_amount?: number | null
          duration?: string | null
          expires_at?: string | null
          frequency?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          organization_id?: string | null
          passengers?: number | null
          priority?: string | null
          quote_number?: string
          route_details?: string | null
          service_type?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_replacement_incidents: {
        Row: {
          created_at: string | null
          description: string
          id: string
          incident_type: string
          location: string | null
          reported_at: string | null
          reported_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          service_id: string
          severity: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          incident_type: string
          location?: string | null
          reported_at?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          service_id: string
          severity?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          incident_type?: string
          location?: string | null
          reported_at?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          service_id?: string
          severity?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_replacement_incidents_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_replacement_incidents_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_replacement_incidents_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_with_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_replacement_schedules: {
        Row: {
          actual_passengers: number | null
          created_at: string | null
          date: string
          end_time: string
          expected_passengers: number | null
          frequency_minutes: number | null
          id: string
          notes: string | null
          service_id: string
          start_time: string
          status: string | null
          updated_at: string | null
          vehicle_count: number | null
        }
        Insert: {
          actual_passengers?: number | null
          created_at?: string | null
          date: string
          end_time: string
          expected_passengers?: number | null
          frequency_minutes?: number | null
          id?: string
          notes?: string | null
          service_id: string
          start_time: string
          status?: string | null
          updated_at?: string | null
          vehicle_count?: number | null
        }
        Update: {
          actual_passengers?: number | null
          created_at?: string | null
          date?: string
          end_time?: string
          expected_passengers?: number | null
          frequency_minutes?: number | null
          id?: string
          notes?: string | null
          service_id?: string
          start_time?: string
          status?: string | null
          updated_at?: string | null
          vehicle_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_replacement_schedules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_replacement_schedules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_replacement_schedules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_with_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_replacement_services: {
        Row: {
          affected_line: string
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          dropoff_points: string[] | null
          end_date: string
          estimated_cost: number | null
          frequency: string | null
          id: string
          notes: string | null
          organization_id: string | null
          passengers_affected: number | null
          pickup_points: string[] | null
          route_name: string
          start_date: string
          status: string
          updated_at: string | null
          vehicles_assigned: number | null
        }
        Insert: {
          affected_line: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          dropoff_points?: string[] | null
          end_date: string
          estimated_cost?: number | null
          frequency?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          passengers_affected?: number | null
          pickup_points?: string[] | null
          route_name: string
          start_date: string
          status?: string
          updated_at?: string | null
          vehicles_assigned?: number | null
        }
        Update: {
          affected_line?: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          dropoff_points?: string[] | null
          end_date?: string
          estimated_cost?: number | null
          frequency?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          passengers_affected?: number | null
          pickup_points?: string[] | null
          route_name?: string
          start_date?: string
          status?: string
          updated_at?: string | null
          vehicles_assigned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_replacement_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_replacement_stops: {
        Row: {
          actual_time: string | null
          address: string
          coordinates: unknown | null
          created_at: string | null
          estimated_time: string | null
          id: string
          notes: string | null
          passenger_count: number | null
          rail_line: string | null
          rail_station_name: string | null
          service_id: string | null
          stop_name: string
          stop_order: number
          stop_type: string
          updated_at: string | null
        }
        Insert: {
          actual_time?: string | null
          address: string
          coordinates?: unknown | null
          created_at?: string | null
          estimated_time?: string | null
          id?: string
          notes?: string | null
          passenger_count?: number | null
          rail_line?: string | null
          rail_station_name?: string | null
          service_id?: string | null
          stop_name: string
          stop_order: number
          stop_type: string
          updated_at?: string | null
        }
        Update: {
          actual_time?: string | null
          address?: string
          coordinates?: unknown | null
          created_at?: string | null
          estimated_time?: string | null
          id?: string
          notes?: string | null
          passenger_count?: number | null
          rail_line?: string | null
          rail_station_name?: string | null
          service_id?: string | null
          stop_name?: string
          stop_order?: number
          stop_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_replacement_stops_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_replacement_stops_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_replacement_stops_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_with_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_replacement_vehicles: {
        Row: {
          assigned_date: string
          created_at: string | null
          driver_id: string | null
          end_time: string | null
          id: string
          notes: string | null
          service_id: string
          start_time: string | null
          status: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          assigned_date: string
          created_at?: string | null
          driver_id?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          service_id: string
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          assigned_date?: string
          created_at?: string | null
          driver_id?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          service_id?: string
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rail_replacement_vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_replacement_vehicles_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_replacement_vehicles_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_replacement_vehicles_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rail_replacement_with_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_replacement_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          assessed_by: string | null
          assessment_date: string | null
          assessment_type: string
          child_id: string | null
          created_at: string | null
          description: string
          document_url: string | null
          id: string
          is_active: boolean | null
          required_equipment: string | null
          review_date: string | null
          risk_level: string
          updated_at: string | null
        }
        Insert: {
          assessed_by?: string | null
          assessment_date?: string | null
          assessment_type: string
          child_id?: string | null
          created_at?: string | null
          description: string
          document_url?: string | null
          id?: string
          is_active?: boolean | null
          required_equipment?: string | null
          review_date?: string | null
          risk_level: string
          updated_at?: string | null
        }
        Update: {
          assessed_by?: string | null
          assessment_date?: string | null
          assessment_type?: string
          child_id?: string | null
          created_at?: string | null
          description?: string
          document_url?: string | null
          id?: string
          is_active?: boolean | null
          required_equipment?: string | null
          review_date?: string | null
          risk_level?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      route_personal_assistants: {
        Row: {
          assignment_date: string
          created_at: string | null
          end_time: string | null
          id: string
          notes: string | null
          personal_assistant_id: string | null
          route_id: string | null
          start_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_date: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          personal_assistant_id?: string | null
          route_id?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_date?: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          personal_assistant_id?: string | null
          route_id?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_personal_assistants_personal_assistant_id_fkey"
            columns: ["personal_assistant_id"]
            isOneToOne: false
            referencedRelation: "personal_assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_personal_assistants_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_personal_assistants_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_personal_assistants_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_with_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_personal_assistants_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_with_students"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          actual_time: string | null
          address: string
          coordinates: unknown | null
          created_at: string | null
          estimated_time: string | null
          id: string
          notes: string | null
          passenger_count: number | null
          route_id: string | null
          stop_name: string
          stop_order: number
          stop_type: string
          updated_at: string | null
        }
        Insert: {
          actual_time?: string | null
          address: string
          coordinates?: unknown | null
          created_at?: string | null
          estimated_time?: string | null
          id?: string
          notes?: string | null
          passenger_count?: number | null
          route_id?: string | null
          stop_name: string
          stop_order: number
          stop_type: string
          updated_at?: string | null
        }
        Update: {
          actual_time?: string | null
          address?: string
          coordinates?: unknown | null
          created_at?: string | null
          estimated_time?: string | null
          id?: string
          notes?: string | null
          passenger_count?: number | null
          route_id?: string | null
          stop_name?: string
          stop_order?: number
          stop_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_with_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_with_students"
            referencedColumns: ["id"]
          },
        ]
      }
      route_students: {
        Row: {
          created_at: string | null
          days_of_week: number[] | null
          dropoff_stop_id: string | null
          dropoff_time: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          pickup_stop_id: string | null
          pickup_time: string | null
          route_id: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_of_week?: number[] | null
          dropoff_stop_id?: string | null
          dropoff_time?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          pickup_stop_id?: string | null
          pickup_time?: string | null
          route_id?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[] | null
          dropoff_stop_id?: string | null
          dropoff_time?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          pickup_stop_id?: string | null
          pickup_time?: string | null
          route_id?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_students_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_students_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_students_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_with_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_students_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_with_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          assigned_driver_id: string | null
          assigned_vehicle_id: string | null
          capacity: number | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          current_passengers: number | null
          days_of_week: number[] | null
          description: string | null
          distance_km: number | null
          dropoff_times: string[] | null
          end_location: string | null
          estimated_duration: number | null
          estimated_revenue: number | null
          grade_levels: string[] | null
          id: string
          name: string
          notes: string | null
          organization_id: string | null
          pickup_times: string[] | null
          route_type: string | null
          schedule: Json | null
          school_name: string | null
          start_location: string | null
          status: string | null
          stops: Json | null
          updated_at: string | null
        }
        Insert: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          capacity?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_passengers?: number | null
          days_of_week?: number[] | null
          description?: string | null
          distance_km?: number | null
          dropoff_times?: string[] | null
          end_location?: string | null
          estimated_duration?: number | null
          estimated_revenue?: number | null
          grade_levels?: string[] | null
          id?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          pickup_times?: string[] | null
          route_type?: string | null
          schedule?: Json | null
          school_name?: string | null
          start_location?: string | null
          status?: string | null
          stops?: Json | null
          updated_at?: string | null
        }
        Update: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          capacity?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_passengers?: number | null
          days_of_week?: number[] | null
          description?: string | null
          distance_km?: number | null
          dropoff_times?: string[] | null
          end_location?: string | null
          estimated_duration?: number | null
          estimated_revenue?: number | null
          grade_levels?: string[] | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          pickup_times?: string[] | null
          route_type?: string | null
          schedule?: Json | null
          school_name?: string | null
          start_location?: string | null
          status?: string | null
          stops?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attendance: {
        Row: {
          child_id: string | null
          created_at: string | null
          date: string
          driver_id: string | null
          dropoff_time: string | null
          id: string
          notes: string | null
          pickup_time: string | null
          status: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          date: string
          driver_id?: string | null
          dropoff_time?: string | null
          id?: string
          notes?: string | null
          pickup_time?: string | null
          status: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          date?: string
          driver_id?: string | null
          dropoff_time?: string | null
          id?: string
          notes?: string | null
          pickup_time?: string | null
          status?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          allergies: string[] | null
          created_at: string | null
          date_of_birth: string | null
          dropoff_address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string
          grade_level: string | null
          id: string
          is_active: boolean | null
          last_name: string
          medical_info: string | null
          medications: string[] | null
          notes: string | null
          organization_id: string | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          pickup_address: string | null
          school_name: string | null
          special_needs: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          dropoff_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name: string
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          last_name: string
          medical_info?: string | null
          medications?: string[] | null
          notes?: string | null
          organization_id?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          pickup_address?: string | null
          school_name?: string | null
          special_needs?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          dropoff_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          medical_info?: string | null
          medications?: string[] | null
          notes?: string | null
          organization_id?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          pickup_address?: string | null
          school_name?: string | null
          special_needs?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_cycle: string
          created_at: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          limits: Json | null
          name: string
          popular: boolean | null
          price: number
          savings: number | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle: string
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name: string
          popular?: boolean | null
          price: number
          savings?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name?: string
          popular?: boolean | null
          price?: number
          savings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          auto_renew: boolean | null
          created_at: string | null
          end_date: string | null
          id: string
          next_billing_date: string | null
          organization_id: string | null
          payment_method_id: string | null
          plan_id: string | null
          start_date: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          organization_id?: string | null
          payment_method_id?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          organization_id?: string | null
          payment_method_id?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          app_version: string | null
          assigned_date: string | null
          assigned_to: string | null
          attachments: string[] | null
          browser_info: string | null
          created_at: string | null
          created_by: string | null
          customer_feedback: string | null
          customer_satisfaction_rating: number | null
          description: string
          device_info: string | null
          escalated_to: string | null
          escalation_date: string | null
          escalation_level: number | null
          first_response_time: string | null
          id: string
          internal_notes: string | null
          operating_system: string | null
          organization_id: string | null
          priority: string | null
          related_tickets: string[] | null
          resolution: string | null
          resolution_date: string | null
          resolution_time: string | null
          sla_breach_hours: number | null
          sla_target_hours: number | null
          status: string | null
          subject: string
          tags: string[] | null
          ticket_id: string
          type: string
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          app_version?: string | null
          assigned_date?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          browser_info?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_feedback?: string | null
          customer_satisfaction_rating?: number | null
          description: string
          device_info?: string | null
          escalated_to?: string | null
          escalation_date?: string | null
          escalation_level?: number | null
          first_response_time?: string | null
          id?: string
          internal_notes?: string | null
          operating_system?: string | null
          organization_id?: string | null
          priority?: string | null
          related_tickets?: string[] | null
          resolution?: string | null
          resolution_date?: string | null
          resolution_time?: string | null
          sla_breach_hours?: number | null
          sla_target_hours?: number | null
          status?: string | null
          subject: string
          tags?: string[] | null
          ticket_id: string
          type: string
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          app_version?: string | null
          assigned_date?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          browser_info?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_feedback?: string | null
          customer_satisfaction_rating?: number | null
          description?: string
          device_info?: string | null
          escalated_to?: string | null
          escalation_date?: string | null
          escalation_level?: number | null
          first_response_time?: string | null
          id?: string
          internal_notes?: string | null
          operating_system?: string | null
          organization_id?: string | null
          priority?: string | null
          related_tickets?: string[] | null
          resolution?: string | null
          resolution_date?: string | null
          resolution_time?: string | null
          sla_breach_hours?: number | null
          sla_target_hours?: number | null
          status?: string | null
          subject?: string
          tags?: string[] | null
          ticket_id?: string
          type?: string
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_escalated_to_fkey"
            columns: ["escalated_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tachograph_folders: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          name: string
          organization_id: string
          parent_folder_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          organization_id: string
          parent_folder_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          organization_id?: string
          parent_folder_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tachograph_folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tachograph_folders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tachograph_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "tachograph_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      tachograph_records: {
        Row: {
          activity_type: string | null
          calibration_date: string | null
          card_number: string | null
          card_type: string | null
          created_at: string | null
          data_quality_score: number | null
          distance_km: number | null
          download_method: string | null
          download_timestamp: string | null
          driver_id: string | null
          end_location: string | null
          end_time: string | null
          equipment_serial_number: string | null
          id: string
          is_complete: boolean | null
          next_calibration_date: string | null
          notes: string | null
          organization_id: string | null
          record_date: string
          speed_data: Json | null
          start_location: string | null
          start_time: string | null
          updated_at: string | null
          vehicle_id: string | null
          violations: string[] | null
        }
        Insert: {
          activity_type?: string | null
          calibration_date?: string | null
          card_number?: string | null
          card_type?: string | null
          created_at?: string | null
          data_quality_score?: number | null
          distance_km?: number | null
          download_method?: string | null
          download_timestamp?: string | null
          driver_id?: string | null
          end_location?: string | null
          end_time?: string | null
          equipment_serial_number?: string | null
          id?: string
          is_complete?: boolean | null
          next_calibration_date?: string | null
          notes?: string | null
          organization_id?: string | null
          record_date: string
          speed_data?: Json | null
          start_location?: string | null
          start_time?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          violations?: string[] | null
        }
        Update: {
          activity_type?: string | null
          calibration_date?: string | null
          card_number?: string | null
          card_type?: string | null
          created_at?: string | null
          data_quality_score?: number | null
          distance_km?: number | null
          download_method?: string | null
          download_timestamp?: string | null
          driver_id?: string | null
          end_location?: string | null
          end_time?: string | null
          equipment_serial_number?: string | null
          id?: string
          is_complete?: boolean | null
          next_calibration_date?: string | null
          notes?: string | null
          organization_id?: string | null
          record_date?: string
          speed_data?: Json | null
          start_location?: string | null
          start_time?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          violations?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tachograph_records_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tachograph_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tachograph_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_schedules: {
        Row: {
          child_id: string | null
          created_at: string | null
          days_of_week: number[] | null
          dropoff_location: string
          dropoff_time: string
          end_date: string | null
          id: string
          is_active: boolean | null
          pickup_location: string
          pickup_time: string
          route_id: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          days_of_week?: number[] | null
          dropoff_location: string
          dropoff_time: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          pickup_location: string
          pickup_time: string
          route_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          days_of_week?: number[] | null
          dropoff_location?: string
          dropoff_time?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          pickup_location?: string
          pickup_time?: string
          route_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_schedules_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_with_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "school_routes_with_students"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_data: {
        Row: {
          api_calls: number | null
          created_at: string | null
          date: string | null
          drivers: number | null
          id: string
          organization_id: string | null
          storage: number | null
          vehicles: number | null
        }
        Insert: {
          api_calls?: number | null
          created_at?: string | null
          date?: string | null
          drivers?: number | null
          id?: string
          organization_id?: string | null
          storage?: number | null
          vehicles?: number | null
        }
        Update: {
          api_calls?: number | null
          created_at?: string | null
          date?: string | null
          drivers?: number | null
          id?: string
          organization_id?: string | null
          storage?: number | null
          vehicles?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_data_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_checks: {
        Row: {
          check_date: string
          created_at: string | null
          driver_id: string
          id: string
          issues_found: string | null
          notes: string | null
          status: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          check_date?: string
          created_at?: string | null
          driver_id: string
          id?: string
          issues_found?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          check_date?: string
          created_at?: string | null
          driver_id?: string
          id?: string
          issues_found?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_checks_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_checks_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_inspections: {
        Row: {
          brake_condition: string | null
          compliance_score: number | null
          created_at: string | null
          created_by: string | null
          defects_found: string[] | null
          driver_id: string | null
          emergency_equipment: string[] | null
          fuel_level: string | null
          id: string
          inspection_date: string
          inspection_location: string | null
          inspection_notes: string | null
          inspection_type: string
          inspector_id: string | null
          inspector_name: string | null
          lights_condition: string | null
          next_inspection_date: string | null
          oil_level: string | null
          organization_id: string | null
          photos: string[] | null
          signature_data: string | null
          status: string | null
          tire_condition: string | null
          updated_at: string | null
          vehicle_id: string | null
          vehicle_mileage: number | null
          weather_conditions: string | null
        }
        Insert: {
          brake_condition?: string | null
          compliance_score?: number | null
          created_at?: string | null
          created_by?: string | null
          defects_found?: string[] | null
          driver_id?: string | null
          emergency_equipment?: string[] | null
          fuel_level?: string | null
          id?: string
          inspection_date: string
          inspection_location?: string | null
          inspection_notes?: string | null
          inspection_type: string
          inspector_id?: string | null
          inspector_name?: string | null
          lights_condition?: string | null
          next_inspection_date?: string | null
          oil_level?: string | null
          organization_id?: string | null
          photos?: string[] | null
          signature_data?: string | null
          status?: string | null
          tire_condition?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          vehicle_mileage?: number | null
          weather_conditions?: string | null
        }
        Update: {
          brake_condition?: string | null
          compliance_score?: number | null
          created_at?: string | null
          created_by?: string | null
          defects_found?: string[] | null
          driver_id?: string | null
          emergency_equipment?: string[] | null
          fuel_level?: string | null
          id?: string
          inspection_date?: string
          inspection_location?: string | null
          inspection_notes?: string | null
          inspection_type?: string
          inspector_id?: string | null
          inspector_name?: string | null
          lights_condition?: string | null
          next_inspection_date?: string | null
          oil_level?: string | null
          organization_id?: string | null
          photos?: string[] | null
          signature_data?: string | null
          status?: string | null
          tire_condition?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          vehicle_mileage?: number | null
          weather_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          capacity: number | null
          created_at: string | null
          fuel_type: string | null
          id: string
          insurance_expiry: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          organization_id: string | null
          registration_expiry: string | null
          status: string | null
          updated_at: string | null
          vehicle_number: string
          vehicle_type: string | null
          year: number | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          organization_id?: string | null
          registration_expiry?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_number: string
          vehicle_type?: string | null
          year?: number | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          organization_id?: string | null
          registration_expiry?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_number?: string
          vehicle_type?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          actual_hours: number | null
          assigned_mechanic_id: string | null
          completed_date: string | null
          created_at: string | null
          created_by: string | null
          customer_approval_date: string | null
          customer_approval_received: boolean | null
          customer_approval_required: boolean | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          labor_cost: number | null
          location: string | null
          notes: string | null
          organization_id: string | null
          parts_cost: number | null
          parts_required: string[] | null
          photos_after: string[] | null
          photos_before: string[] | null
          priority: string | null
          quality_check_by: string | null
          quality_check_completed: boolean | null
          quality_check_date: string | null
          quality_check_required: boolean | null
          safety_requirements: string[] | null
          scheduled_date: string | null
          started_date: string | null
          status: string | null
          title: string
          tools_required: string[] | null
          total_cost: number | null
          updated_at: string | null
          vehicle_id: string | null
          warranty_details: string | null
          warranty_work: boolean | null
          work_area: string | null
          work_order_number: string
          work_type: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_mechanic_id?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_approval_date?: string | null
          customer_approval_received?: boolean | null
          customer_approval_required?: boolean | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          labor_cost?: number | null
          location?: string | null
          notes?: string | null
          organization_id?: string | null
          parts_cost?: number | null
          parts_required?: string[] | null
          photos_after?: string[] | null
          photos_before?: string[] | null
          priority?: string | null
          quality_check_by?: string | null
          quality_check_completed?: boolean | null
          quality_check_date?: string | null
          quality_check_required?: boolean | null
          safety_requirements?: string[] | null
          scheduled_date?: string | null
          started_date?: string | null
          status?: string | null
          title: string
          tools_required?: string[] | null
          total_cost?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          warranty_details?: string | null
          warranty_work?: boolean | null
          work_area?: string | null
          work_order_number: string
          work_type?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_mechanic_id?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_approval_date?: string | null
          customer_approval_received?: boolean | null
          customer_approval_required?: boolean | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          labor_cost?: number | null
          location?: string | null
          notes?: string | null
          organization_id?: string | null
          parts_cost?: number | null
          parts_required?: string[] | null
          photos_after?: string[] | null
          photos_before?: string[] | null
          priority?: string | null
          quality_check_by?: string | null
          quality_check_completed?: boolean | null
          quality_check_date?: string | null
          quality_check_required?: boolean | null
          safety_requirements?: string[] | null
          scheduled_date?: string | null
          started_date?: string | null
          status?: string | null
          title?: string
          tools_required?: string[] | null
          total_cost?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          warranty_details?: string | null
          warranty_work?: boolean | null
          work_area?: string | null
          work_order_number?: string
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_assigned_mechanic_id_fkey"
            columns: ["assigned_mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_quality_check_by_fkey"
            columns: ["quality_check_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      notification_stats: {
        Row: {
          emergency_category_notifications: number | null
          emergency_notifications: number | null
          high_priority_notifications: number | null
          organization_id: string | null
          safety_notifications: number | null
          total_notifications: number | null
          unread_notifications: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_replacement_summary: {
        Row: {
          affected_line: string | null
          assigned_vehicles_count: number | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          end_date: string | null
          estimated_cost: number | null
          frequency: string | null
          id: string | null
          incident_count: number | null
          passengers_affected: number | null
          route_name: string | null
          scheduled_runs: number | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          vehicles_assigned: number | null
        }
        Relationships: []
      }
      rail_replacement_with_stops: {
        Row: {
          affected_line: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          dropoff_points: string[] | null
          end_date: string | null
          estimated_cost: number | null
          frequency: string | null
          id: string | null
          notes: string | null
          organization_id: string | null
          passengers_affected: number | null
          pickup_points: string[] | null
          rail_stops_data: Json | null
          route_name: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          vehicles_assigned: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_replacement_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      school_routes_summary: {
        Row: {
          assigned_driver_id: string | null
          assigned_vehicle_id: string | null
          capacity: number | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          current_passengers: number | null
          days_of_week: number[] | null
          dropoff_times: string[] | null
          end_location: string | null
          grade_levels: string[] | null
          id: string | null
          name: string | null
          pickup_times: string[] | null
          route_type: string | null
          school_name: string | null
          start_location: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          capacity?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_passengers?: number | null
          days_of_week?: number[] | null
          dropoff_times?: string[] | null
          end_location?: string | null
          grade_levels?: string[] | null
          id?: string | null
          name?: string | null
          pickup_times?: string[] | null
          route_type?: string | null
          school_name?: string | null
          start_location?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          capacity?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_passengers?: number | null
          days_of_week?: number[] | null
          dropoff_times?: string[] | null
          end_location?: string | null
          grade_levels?: string[] | null
          id?: string | null
          name?: string | null
          pickup_times?: string[] | null
          route_type?: string | null
          school_name?: string | null
          start_location?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_routes_with_stops: {
        Row: {
          assigned_driver_id: string | null
          assigned_vehicle_id: string | null
          capacity: number | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          current_passengers: number | null
          days_of_week: number[] | null
          description: string | null
          distance_km: number | null
          dropoff_times: string[] | null
          end_location: string | null
          estimated_duration: number | null
          estimated_revenue: number | null
          grade_levels: string[] | null
          id: string | null
          name: string | null
          notes: string | null
          organization_id: string | null
          pickup_times: string[] | null
          route_stops_data: Json | null
          route_type: string | null
          schedule: Json | null
          school_name: string | null
          start_location: string | null
          status: string | null
          stops: Json | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      school_routes_with_students: {
        Row: {
          assigned_driver_id: string | null
          assigned_vehicle_id: string | null
          capacity: number | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          current_passengers: number | null
          days_of_week: number[] | null
          description: string | null
          distance_km: number | null
          dropoff_times: string[] | null
          end_location: string | null
          estimated_duration: number | null
          estimated_revenue: number | null
          grade_levels: string[] | null
          id: string | null
          name: string | null
          notes: string | null
          organization_id: string | null
          pickup_times: string[] | null
          route_type: string | null
          schedule: Json | null
          school_name: string | null
          start_location: string | null
          status: string | null
          stops: Json | null
          students: Json | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_unread_notification_count: {
        Args: { user_uuid: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

