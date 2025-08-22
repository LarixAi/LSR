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
            foreignKeyName: "child_transport_status_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
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
          distance_km: number | null
          dropoff_times: string[] | null
          end_location: string | null
          estimated_duration: number | null
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
          distance_km?: number | null
          dropoff_times?: string[] | null
          end_location?: string | null
          estimated_duration?: number | null
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
          distance_km?: number | null
          dropoff_times?: string[] | null
          end_location?: string | null
          estimated_duration?: number | null
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

