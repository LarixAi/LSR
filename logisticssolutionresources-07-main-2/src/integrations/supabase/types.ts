export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_operation_logs: {
        Row: {
          admin_user_id: string
          created_at: string | null
          error_details: string | null
          id: string
          ip_address: unknown | null
          operation_details: Json | null
          operation_type: string
          organization_id: string
          success: boolean
          target_email: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          admin_user_id: string
          created_at?: string | null
          error_details?: string | null
          id?: string
          ip_address?: unknown | null
          operation_details?: Json | null
          operation_type: string
          organization_id: string
          success: boolean
          target_email?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          admin_user_id?: string
          created_at?: string | null
          error_details?: string | null
          id?: string
          ip_address?: unknown | null
          operation_details?: Json | null
          operation_type?: string
          organization_id?: string
          success?: boolean
          target_email?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_agent_configs: {
        Row: {
          agent_type: string
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          agent_type: string
          config: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          message: string
          model: string
          response: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          message: string
          model?: string
          response: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          message?: string
          model?: string
          response?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage_tracking: {
        Row: {
          cost: number | null
          id: string
          metadata: Json | null
          model: string
          request_type: string
          timestamp: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          cost?: number | null
          id?: string
          metadata?: Json | null
          model: string
          request_type: string
          timestamp?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          cost?: number | null
          id?: string
          metadata?: Json | null
          model?: string
          request_type?: string
          timestamp?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      analog_chart_analysis_sessions: {
        Row: {
          analysis_end_time: string | null
          analysis_method: string | null
          analysis_start_time: string | null
          analysis_status: string | null
          analyst_id: string | null
          chart_id: string
          confidence_score: number | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string
        }
        Insert: {
          analysis_end_time?: string | null
          analysis_method?: string | null
          analysis_start_time?: string | null
          analysis_status?: string | null
          analyst_id?: string | null
          chart_id: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
        }
        Update: {
          analysis_end_time?: string | null
          analysis_method?: string | null
          analysis_start_time?: string | null
          analysis_status?: string | null
          analyst_id?: string | null
          chart_id?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analog_chart_analysis_sessions_analyst_id_fkey"
            columns: ["analyst_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analog_chart_analysis_sessions_chart_id_fkey"
            columns: ["chart_id"]
            isOneToOne: false
            referencedRelation: "analog_tachograph_charts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analog_chart_analysis_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analog_chart_storage: {
        Row: {
          capacity_charts: number | null
          created_at: string | null
          current_usage: number | null
          humidity_controlled: boolean | null
          id: string
          organization_id: string
          retention_period_years: number | null
          security_level: string | null
          storage_location: string
          storage_type: string
          temperature_controlled: boolean | null
          updated_at: string | null
        }
        Insert: {
          capacity_charts?: number | null
          created_at?: string | null
          current_usage?: number | null
          humidity_controlled?: boolean | null
          id?: string
          organization_id: string
          retention_period_years?: number | null
          security_level?: string | null
          storage_location: string
          storage_type: string
          temperature_controlled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          capacity_charts?: number | null
          created_at?: string | null
          current_usage?: number | null
          humidity_controlled?: boolean | null
          id?: string
          organization_id?: string
          retention_period_years?: number | null
          security_level?: string | null
          storage_location?: string
          storage_type?: string
          temperature_controlled?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analog_chart_storage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analog_tachograph_charts: {
        Row: {
          analysis_notes: string | null
          analyzed_at: string | null
          analyzed_by: string | null
          availability_periods: Json | null
          break_periods: Json | null
          calibration_marks_visible: boolean | null
          chart_condition: string | null
          chart_date: string
          chart_format: string
          chart_image_url: string | null
          chart_number: string
          chart_pdf_url: string | null
          chart_size: string | null
          chart_type: string
          created_at: string | null
          driver_id: string | null
          driving_periods: Json | null
          end_time: string | null
          file_size_bytes: number | null
          id: string
          manual_analysis_completed: boolean | null
          organization_id: string
          rest_periods: Json | null
          start_time: string | null
          time_marks_clear: boolean | null
          total_distance_km: number | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          vehicle_id: string | null
          violations: Json | null
          work_periods: Json | null
        }
        Insert: {
          analysis_notes?: string | null
          analyzed_at?: string | null
          analyzed_by?: string | null
          availability_periods?: Json | null
          break_periods?: Json | null
          calibration_marks_visible?: boolean | null
          chart_condition?: string | null
          chart_date: string
          chart_format: string
          chart_image_url?: string | null
          chart_number: string
          chart_pdf_url?: string | null
          chart_size?: string | null
          chart_type: string
          created_at?: string | null
          driver_id?: string | null
          driving_periods?: Json | null
          end_time?: string | null
          file_size_bytes?: number | null
          id?: string
          manual_analysis_completed?: boolean | null
          organization_id: string
          rest_periods?: Json | null
          start_time?: string | null
          time_marks_clear?: boolean | null
          total_distance_km?: number | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          vehicle_id?: string | null
          violations?: Json | null
          work_periods?: Json | null
        }
        Update: {
          analysis_notes?: string | null
          analyzed_at?: string | null
          analyzed_by?: string | null
          availability_periods?: Json | null
          break_periods?: Json | null
          calibration_marks_visible?: boolean | null
          chart_condition?: string | null
          chart_date?: string
          chart_format?: string
          chart_image_url?: string | null
          chart_number?: string
          chart_pdf_url?: string | null
          chart_size?: string | null
          chart_type?: string
          created_at?: string | null
          driver_id?: string | null
          driving_periods?: Json | null
          end_time?: string | null
          file_size_bytes?: number | null
          id?: string
          manual_analysis_completed?: boolean | null
          organization_id?: string
          rest_periods?: Json | null
          start_time?: string | null
          time_marks_clear?: boolean | null
          total_distance_km?: number | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          vehicle_id?: string | null
          violations?: Json | null
          work_periods?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analog_tachograph_charts_analyzed_by_fkey"
            columns: ["analyzed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analog_tachograph_charts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analog_tachograph_charts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analog_tachograph_charts_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analog_tachograph_charts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          settings: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      appeals: {
        Row: {
          appeal_number: string
          assigned_to: string | null
          attachments: Json | null
          created_at: string | null
          created_by: string | null
          evidence_description: string | null
          fine_reduction_amount: number | null
          grounds: string
          hearing_date: string | null
          hearing_location: string | null
          id: string
          infringement_id: string | null
          notes: string | null
          organization_id: string | null
          outcome: string | null
          outcome_date: string | null
          outcome_reason: string | null
          points_reduction: number | null
          status: Database["public"]["Enums"]["appeal_status"] | null
          submitted_date: string
          updated_at: string | null
        }
        Insert: {
          appeal_number: string
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          created_by?: string | null
          evidence_description?: string | null
          fine_reduction_amount?: number | null
          grounds: string
          hearing_date?: string | null
          hearing_location?: string | null
          id?: string
          infringement_id?: string | null
          notes?: string | null
          organization_id?: string | null
          outcome?: string | null
          outcome_date?: string | null
          outcome_reason?: string | null
          points_reduction?: number | null
          status?: Database["public"]["Enums"]["appeal_status"] | null
          submitted_date?: string
          updated_at?: string | null
        }
        Update: {
          appeal_number?: string
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          created_by?: string | null
          evidence_description?: string | null
          fine_reduction_amount?: number | null
          grounds?: string
          hearing_date?: string | null
          hearing_location?: string | null
          id?: string
          infringement_id?: string | null
          notes?: string | null
          organization_id?: string | null
          outcome?: string | null
          outcome_date?: string | null
          outcome_reason?: string | null
          points_reduction?: number | null
          status?: Database["public"]["Enums"]["appeal_status"] | null
          submitted_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appeals_infringement_id_fkey"
            columns: ["infringement_id"]
            isOneToOne: false
            referencedRelation: "infringements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appeals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      child_documents: {
        Row: {
          child_id: number | null
          created_at: string | null
          document_name: string
          document_type: string
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          mime_type: string | null
          renewal_reminder_sent: boolean | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          child_id?: number | null
          created_at?: string | null
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          mime_type?: string | null
          renewal_reminder_sent?: boolean | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          child_id?: number | null
          created_at?: string | null
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          mime_type?: string | null
          renewal_reminder_sent?: boolean | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          dropoff_time: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          grade: string | null
          id: string
          is_active: boolean | null
          last_name: string
          medical_conditions: string | null
          organization_id: string
          parent_id: string | null
          pickup_location: string | null
          pickup_time: string | null
          profile_image_url: string | null
          school: string | null
          school_name: string | null
          special_instructions: string | null
          updated_at: string | null
        }
        Insert: {
          allergies?: string | null
          created_at?: string | null
          date_of_birth: string
          dropoff_location?: string | null
          dropoff_time?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          grade?: string | null
          id?: string
          is_active?: boolean | null
          last_name: string
          medical_conditions?: string | null
          organization_id: string
          parent_id?: string | null
          pickup_location?: string | null
          pickup_time?: string | null
          profile_image_url?: string | null
          school?: string | null
          school_name?: string | null
          special_instructions?: string | null
          updated_at?: string | null
        }
        Update: {
          allergies?: string | null
          created_at?: string | null
          date_of_birth?: string
          dropoff_location?: string | null
          dropoff_time?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          grade?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          medical_conditions?: string | null
          organization_id?: string
          parent_id?: string | null
          pickup_location?: string | null
          pickup_time?: string | null
          profile_image_url?: string | null
          school?: string | null
          school_name?: string | null
          special_instructions?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      child_registration_steps: {
        Row: {
          child_id: number | null
          completed_at: string | null
          created_at: string | null
          data_snapshot: Json | null
          id: string
          is_completed: boolean | null
          step_name: string
          updated_at: string | null
        }
        Insert: {
          child_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          data_snapshot?: Json | null
          id?: string
          is_completed?: boolean | null
          step_name: string
          updated_at?: string | null
        }
        Update: {
          child_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          data_snapshot?: Json | null
          id?: string
          is_completed?: boolean | null
          step_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      child_tracking: {
        Row: {
          child_id: string | null
          created_by: string | null
          driver_id: string | null
          event_type: string
          id: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          notes: string | null
          organization_id: string | null
          timestamp: string
          vehicle_id: string | null
        }
        Insert: {
          child_id?: string | null
          created_by?: string | null
          driver_id?: string | null
          event_type: string
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          organization_id?: string | null
          timestamp?: string
          vehicle_id?: string | null
        }
        Update: {
          child_id?: string | null
          created_by?: string | null
          driver_id?: string | null
          event_type?: string
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          organization_id?: string | null
          timestamp?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_tracking_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_tracking_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "child_transport_status_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_alerts: {
        Row: {
          alert_date: string
          alert_type: string
          assigned_to: string | null
          compliance_rule_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          driver_id: string | null
          due_date: string | null
          id: string
          license_id: string | null
          organization_id: string
          penalty_amount: number | null
          points_deducted: number | null
          priority: string | null
          resolution_notes: string | null
          resolved_by: string | null
          resolved_date: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string | null
          vehicle_id: string | null
          violation_type: string | null
        }
        Insert: {
          alert_date: string
          alert_type: string
          assigned_to?: string | null
          compliance_rule_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          driver_id?: string | null
          due_date?: string | null
          id?: string
          license_id?: string | null
          organization_id: string
          penalty_amount?: number | null
          points_deducted?: number | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_by?: string | null
          resolved_date?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vehicle_id?: string | null
          violation_type?: string | null
        }
        Update: {
          alert_date?: string
          alert_type?: string
          assigned_to?: string | null
          compliance_rule_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          driver_id?: string | null
          due_date?: string | null
          id?: string
          license_id?: string | null
          organization_id?: string
          penalty_amount?: number | null
          points_deducted?: number | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_by?: string | null
          resolved_date?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vehicle_id?: string | null
          violation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_alerts_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "driver_licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_violations: {
        Row: {
          appeal_date: string | null
          appeal_outcome: string | null
          appeal_status: string | null
          attachments: Json | null
          automatic_detection: boolean | null
          case_number: string | null
          citation_number: string | null
          corrective_action: string | null
          court_date: string | null
          court_outcome: string | null
          created_at: string | null
          created_by: string | null
          description: string
          detected_at: string
          detected_date: string | null
          detection_source: string | null
          driver_id: string | null
          evidence_files: string[] | null
          fine_amount: number | null
          id: string
          is_reportable: boolean | null
          license_id: string | null
          location: string | null
          metadata: Json | null
          officer_badge: string | null
          officer_name: string | null
          organization_id: string | null
          penalty_amount: number | null
          penalty_points: number | null
          points_deducted: number | null
          report_reference: string | null
          reported_at: string | null
          reported_by: string | null
          reported_date: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["infringement_severity"] | null
          status: string | null
          updated_at: string | null
          vehicle_id: string | null
          violation_code: string | null
          violation_date: string | null
          violation_type: string
          witness_statements: string | null
        }
        Insert: {
          appeal_date?: string | null
          appeal_outcome?: string | null
          appeal_status?: string | null
          attachments?: Json | null
          automatic_detection?: boolean | null
          case_number?: string | null
          citation_number?: string | null
          corrective_action?: string | null
          court_date?: string | null
          court_outcome?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          detected_at?: string
          detected_date?: string | null
          detection_source?: string | null
          driver_id?: string | null
          evidence_files?: string[] | null
          fine_amount?: number | null
          id?: string
          is_reportable?: boolean | null
          license_id?: string | null
          location?: string | null
          metadata?: Json | null
          officer_badge?: string | null
          officer_name?: string | null
          organization_id?: string | null
          penalty_amount?: number | null
          penalty_points?: number | null
          points_deducted?: number | null
          report_reference?: string | null
          reported_at?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["infringement_severity"] | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          violation_code?: string | null
          violation_date?: string | null
          violation_type: string
          witness_statements?: string | null
        }
        Update: {
          appeal_date?: string | null
          appeal_outcome?: string | null
          appeal_status?: string | null
          attachments?: Json | null
          automatic_detection?: boolean | null
          case_number?: string | null
          citation_number?: string | null
          corrective_action?: string | null
          court_date?: string | null
          court_outcome?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          detected_at?: string
          detected_date?: string | null
          detection_source?: string | null
          driver_id?: string | null
          evidence_files?: string[] | null
          fine_amount?: number | null
          id?: string
          is_reportable?: boolean | null
          license_id?: string | null
          location?: string | null
          metadata?: Json | null
          officer_badge?: string | null
          officer_name?: string | null
          organization_id?: string | null
          penalty_amount?: number | null
          penalty_points?: number | null
          points_deducted?: number | null
          report_reference?: string | null
          reported_at?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["infringement_severity"] | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          violation_code?: string | null
          violation_date?: string | null
          violation_type?: string
          witness_statements?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_violations_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "driver_licenses"
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
      customer_communications: {
        Row: {
          communication_date: string | null
          communication_type: string | null
          contact_method: string | null
          contact_person: string | null
          created_at: string | null
          defect_id: string
          direction: string | null
          id: string
          mechanic_id: string | null
          message: string | null
          subject: string | null
        }
        Insert: {
          communication_date?: string | null
          communication_type?: string | null
          contact_method?: string | null
          contact_person?: string | null
          created_at?: string | null
          defect_id: string
          direction?: string | null
          id?: string
          mechanic_id?: string | null
          message?: string | null
          subject?: string | null
        }
        Update: {
          communication_date?: string | null
          communication_type?: string | null
          contact_method?: string | null
          contact_person?: string | null
          created_at?: string | null
          defect_id?: string
          direction?: string | null
          id?: string
          mechanic_id?: string | null
          message?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_communications_defect_id_fkey"
            columns: ["defect_id"]
            isOneToOne: false
            referencedRelation: "defect_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_communications_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          account_manager_id: string | null
          address: string | null
          billing_address: string | null
          billing_city: string | null
          billing_country: string | null
          billing_state: string | null
          billing_zip_code: string | null
          city: string | null
          company_name: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          credit_limit: number | null
          customer_number: string
          customer_type: string | null
          email: string
          id: string
          industry: string | null
          is_active: boolean | null
          metadata: Json | null
          mobile: string | null
          notes: string | null
          organization_id: string | null
          payment_terms: number | null
          phone: string | null
          preferred_payment_method: string | null
          state: string | null
          tax_number: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          account_manager_id?: string | null
          address?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_state?: string | null
          billing_zip_code?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          credit_limit?: number | null
          customer_number: string
          customer_type?: string | null
          email: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          mobile?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_terms?: number | null
          phone?: string | null
          preferred_payment_method?: string | null
          state?: string | null
          tax_number?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          account_manager_id?: string | null
          address?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_state?: string | null
          billing_zip_code?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          credit_limit?: number | null
          customer_number?: string
          customer_type?: string | null
          email?: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          mobile?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_terms?: number | null
          phone?: string | null
          preferred_payment_method?: string | null
          state?: string | null
          tax_number?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_attendance: {
        Row: {
          attendance_date: string
          child_id: string | null
          created_at: string
          driver_notes: string | null
          dropoff_status: string | null
          id: string
          notification_sent: boolean | null
          parent_notes: string | null
          pickup_status: string | null
          route_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attendance_date?: string
          child_id?: string | null
          created_at?: string
          driver_notes?: string | null
          dropoff_status?: string | null
          id?: string
          notification_sent?: boolean | null
          parent_notes?: string | null
          pickup_status?: string | null
          route_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          child_id?: string | null
          created_at?: string
          driver_notes?: string | null
          dropoff_status?: string | null
          id?: string
          notification_sent?: boolean | null
          parent_notes?: string | null
          pickup_status?: string | null
          route_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_attendance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_attendance_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_rest: {
        Row: {
          created_at: string | null
          driver_id: string
          duration_hours: number | null
          end_time: string | null
          id: string
          notes: string | null
          organization_id: string | null
          rest_date: string
          rest_type: string | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          duration_hours?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          rest_date: string
          rest_type?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          duration_hours?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          rest_date?: string
          rest_type?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_rest_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_rest_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      defect_reports: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          assigned_mechanic_id: string | null
          completion_date: string | null
          created_at: string | null
          customer_approval_date: string | null
          customer_approval_notes: string | null
          customer_approval_required: boolean | null
          customer_approved: boolean | null
          defect_number: string
          defect_type: string | null
          description: string | null
          estimated_cost: number | null
          estimated_hours: number | null
          id: string
          location: string | null
          organization_id: string
          priority: string | null
          reported_by: string | null
          reported_date: string | null
          resolved_date: string | null
          severity: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          vehicle_id: string | null
          work_notes: string | null
          work_order_number: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_mechanic_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          customer_approval_date?: string | null
          customer_approval_notes?: string | null
          customer_approval_required?: boolean | null
          customer_approved?: boolean | null
          defect_number: string
          defect_type?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          location?: string | null
          organization_id: string
          priority?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolved_date?: string | null
          severity?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vehicle_id?: string | null
          work_notes?: string | null
          work_order_number?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_mechanic_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          customer_approval_date?: string | null
          customer_approval_notes?: string | null
          customer_approval_required?: boolean | null
          customer_approved?: boolean | null
          defect_number?: string
          defect_type?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          location?: string | null
          organization_id?: string
          priority?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolved_date?: string | null
          severity?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vehicle_id?: string | null
          work_notes?: string | null
          work_order_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defect_reports_assigned_mechanic_id_fkey"
            columns: ["assigned_mechanic_id"]
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
        ]
      }
      demo_requests: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          first_name: string
          fleet_size: string | null
          id: string
          last_name: string
          marketing_consent: boolean | null
          message: string | null
          notes: string | null
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          role: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          first_name: string
          fleet_size?: string | null
          id?: string
          last_name: string
          marketing_consent?: boolean | null
          message?: string | null
          notes?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          role?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          fleet_size?: string | null
          id?: string
          last_name?: string
          marketing_consent?: boolean | null
          message?: string | null
          notes?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          role?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      device_verification_tokens: {
        Row: {
          created_at: string | null
          device_id: string
          expires_at: string
          id: string
          user_id: string
          verification_token: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          expires_at: string
          id?: string
          user_id: string
          verification_token: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          expires_at?: string
          id?: string
          user_id?: string
          verification_token?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      document_notifications: {
        Row: {
          admin_id: string | null
          created_at: string | null
          document_id: string | null
          driver_id: string
          id: string
          is_read: boolean | null
          message: string
          organization_id: string
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          document_id?: string | null
          driver_id: string
          id?: string
          is_read?: boolean | null
          message: string
          organization_id: string
          read_at?: string | null
          title: string
          type: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          document_id?: string | null
          driver_id?: string
          id?: string
          is_read?: boolean | null
          message?: string
          organization_id?: string
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_notifications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_notifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "driver_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_notifications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: string | null
          checksum: string | null
          created_at: string | null
          description: string | null
          download_count: number | null
          expiry_date: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_public: boolean | null
          last_downloaded_at: string | null
          last_reminder_date: string | null
          metadata: Json | null
          mime_type: string
          name: string
          organization_id: string | null
          parent_document_id: string | null
          related_record_id: string | null
          related_record_type: string | null
          reminder_days_before_expiry: number | null
          requires_approval: boolean | null
          status: Database["public"]["Enums"]["document_status"] | null
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          checksum?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          expiry_date?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_public?: boolean | null
          last_downloaded_at?: string | null
          last_reminder_date?: string | null
          metadata?: Json | null
          mime_type: string
          name: string
          organization_id?: string | null
          parent_document_id?: string | null
          related_record_id?: string | null
          related_record_type?: string | null
          reminder_days_before_expiry?: number | null
          requires_approval?: boolean | null
          status?: Database["public"]["Enums"]["document_status"] | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by: string
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          checksum?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_public?: boolean | null
          last_downloaded_at?: string | null
          last_reminder_date?: string | null
          metadata?: Json | null
          mime_type?: string
          name?: string
          organization_id?: string | null
          parent_document_id?: string | null
          related_record_id?: string | null
          related_record_type?: string | null
          reminder_days_before_expiry?: number | null
          requires_approval?: boolean | null
          status?: Database["public"]["Enums"]["document_status"] | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_assignments: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          driver_id: string | null
          id: string
          organization_id: string | null
          route_id: string | null
          status: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          organization_id?: string | null
          route_id?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          organization_id?: string | null
          route_id?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: []
      }
      driver_compliance_scores: {
        Row: {
          assessment_notes: string | null
          created_at: string | null
          driver_id: string
          id: string
          last_assessment_date: string | null
          license_score: number | null
          next_assessment_date: string | null
          organization_id: string
          overall_score: number
          risk_level: string
          training_score: number | null
          updated_at: string | null
          violation_score: number | null
        }
        Insert: {
          assessment_notes?: string | null
          created_at?: string | null
          driver_id: string
          id?: string
          last_assessment_date?: string | null
          license_score?: number | null
          next_assessment_date?: string | null
          organization_id: string
          overall_score?: number
          risk_level?: string
          training_score?: number | null
          updated_at?: string | null
          violation_score?: number | null
        }
        Update: {
          assessment_notes?: string | null
          created_at?: string | null
          driver_id?: string
          id?: string
          last_assessment_date?: string | null
          license_score?: number | null
          next_assessment_date?: string | null
          organization_id?: string
          overall_score?: number
          risk_level?: string
          training_score?: number | null
          updated_at?: string | null
          violation_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_compliance_scores_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_compliance_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string | null
          description: string | null
          driver_id: string
          driver_notes: string | null
          due_date: string | null
          expiry_date: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_urgent: boolean | null
          name: string
          organization_id: string
          priority: string | null
          requested_at: string | null
          requested_by: string | null
          review_date: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          driver_id: string
          driver_notes?: string | null
          due_date?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_urgent?: boolean | null
          name: string
          organization_id: string
          priority?: string | null
          requested_at?: string | null
          requested_by?: string | null
          review_date?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          driver_id?: string
          driver_notes?: string | null
          due_date?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_urgent?: boolean | null
          name?: string
          organization_id?: string
          priority?: string | null
          requested_at?: string | null
          requested_by?: string | null
          review_date?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_documents_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_invoices: {
        Row: {
          created_at: string | null
          driver_id: string
          due_date: string
          id: string
          invoice_number: string
          jobs_included: Json
          notes: string | null
          organization_id: string | null
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          due_date: string
          id?: string
          invoice_number: string
          jobs_included?: Json
          notes?: string | null
          organization_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          due_date?: string
          id?: string
          invoice_number?: string
          jobs_included?: Json
          notes?: string | null
          organization_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_licenses: {
        Row: {
          background_check_expiry: string | null
          created_at: string | null
          driver_id: string
          drug_test_expiry: string | null
          endorsements: string[] | null
          expiry_date: string
          id: string
          issue_date: string
          issuing_authority: string | null
          last_updated: string | null
          license_class: string | null
          license_number: string
          license_type: string
          medical_certificate_expiry: string | null
          notes: string | null
          organization_id: string
          points_balance: number | null
          restrictions: string[] | null
          status: string | null
          training_expiry: string | null
          updated_at: string | null
        }
        Insert: {
          background_check_expiry?: string | null
          created_at?: string | null
          driver_id: string
          drug_test_expiry?: string | null
          endorsements?: string[] | null
          expiry_date: string
          id?: string
          issue_date: string
          issuing_authority?: string | null
          last_updated?: string | null
          license_class?: string | null
          license_number: string
          license_type: string
          medical_certificate_expiry?: string | null
          notes?: string | null
          organization_id: string
          points_balance?: number | null
          restrictions?: string[] | null
          status?: string | null
          training_expiry?: string | null
          updated_at?: string | null
        }
        Update: {
          background_check_expiry?: string | null
          created_at?: string | null
          driver_id?: string
          drug_test_expiry?: string | null
          endorsements?: string[] | null
          expiry_date?: string
          id?: string
          issue_date?: string
          issuing_authority?: string | null
          last_updated?: string | null
          license_class?: string | null
          license_number?: string
          license_type?: string
          medical_certificate_expiry?: string | null
          notes?: string | null
          organization_id?: string
          points_balance?: number | null
          restrictions?: string[] | null
          status?: string | null
          training_expiry?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_licenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_locations: {
        Row: {
          accuracy_meters: number | null
          altitude_meters: number | null
          created_at: string
          driver_id: string
          heading_degrees: number | null
          id: string
          latitude: number
          longitude: number
          organization_id: string | null
          recorded_at: string
          route_id: string | null
          speed_kmh: number | null
          vehicle_id: string | null
        }
        Insert: {
          accuracy_meters?: number | null
          altitude_meters?: number | null
          created_at?: string
          driver_id: string
          heading_degrees?: number | null
          id?: string
          latitude: number
          longitude: number
          organization_id?: string | null
          recorded_at?: string
          route_id?: string | null
          speed_kmh?: number | null
          vehicle_id?: string | null
        }
        Update: {
          accuracy_meters?: number | null
          altitude_meters?: number | null
          created_at?: string
          driver_id?: string
          heading_degrees?: number | null
          id?: string
          latitude?: number
          longitude?: number
          organization_id?: string | null
          recorded_at?: string
          route_id?: string | null
          speed_kmh?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_locations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_points_history: {
        Row: {
          balance_after: number
          balance_before: number
          created_at: string | null
          created_by: string | null
          description: string | null
          driver_id: string | null
          effective_date: string
          expiry_date: string | null
          id: string
          infringement_id: string | null
          is_active: boolean | null
          notes: string | null
          organization_id: string | null
          penalty_amount: number | null
          points_added: number
          points_removed: number | null
          reason: string
          recorded_date: string | null
          status: string | null
          updated_at: string | null
          violation_type: string | null
        }
        Insert: {
          balance_after: number
          balance_before: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          driver_id?: string | null
          effective_date?: string
          expiry_date?: string | null
          id?: string
          infringement_id?: string | null
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string | null
          penalty_amount?: number | null
          points_added: number
          points_removed?: number | null
          reason: string
          recorded_date?: string | null
          status?: string | null
          updated_at?: string | null
          violation_type?: string | null
        }
        Update: {
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          driver_id?: string | null
          effective_date?: string
          expiry_date?: string | null
          id?: string
          infringement_id?: string | null
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string | null
          penalty_amount?: number | null
          points_added?: number
          points_removed?: number | null
          reason?: string
          recorded_date?: string | null
          status?: string | null
          updated_at?: string | null
          violation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_points_history_infringement_id_fkey"
            columns: ["infringement_id"]
            isOneToOne: false
            referencedRelation: "infringements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_points_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_risk_scores: {
        Row: {
          calculated_at: string | null
          created_at: string | null
          created_by: string | null
          driver_id: string | null
          factors: Json | null
          id: string
          metadata: Json | null
          notes: string | null
          organization_id: string | null
          recommendations: string[] | null
          risk_level: string | null
          score: number
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          calculated_at?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_id?: string | null
          factors?: Json | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          recommendations?: string[] | null
          risk_level?: string | null
          score: number
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          calculated_at?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_id?: string | null
          factors?: Json | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          recommendations?: string[] | null
          risk_level?: string | null
          score?: number
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_risk_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_shift_patterns: {
        Row: {
          created_at: string | null
          driver_id: string
          friday_end: string | null
          friday_start: string | null
          id: string
          is_active: boolean | null
          monday_end: string | null
          monday_start: string | null
          organization_id: string | null
          pattern_name: string
          saturday_end: string | null
          saturday_start: string | null
          sunday_end: string | null
          sunday_start: string | null
          thursday_end: string | null
          thursday_start: string | null
          tuesday_end: string | null
          tuesday_start: string | null
          updated_at: string | null
          wednesday_end: string | null
          wednesday_start: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          friday_end?: string | null
          friday_start?: string | null
          id?: string
          is_active?: boolean | null
          monday_end?: string | null
          monday_start?: string | null
          organization_id?: string | null
          pattern_name: string
          saturday_end?: string | null
          saturday_start?: string | null
          sunday_end?: string | null
          sunday_start?: string | null
          thursday_end?: string | null
          thursday_start?: string | null
          tuesday_end?: string | null
          tuesday_start?: string | null
          updated_at?: string | null
          wednesday_end?: string | null
          wednesday_start?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          friday_end?: string | null
          friday_start?: string | null
          id?: string
          is_active?: boolean | null
          monday_end?: string | null
          monday_start?: string | null
          organization_id?: string | null
          pattern_name?: string
          saturday_end?: string | null
          saturday_start?: string | null
          sunday_end?: string | null
          sunday_start?: string | null
          thursday_end?: string | null
          thursday_start?: string | null
          tuesday_end?: string | null
          tuesday_start?: string | null
          updated_at?: string | null
          wednesday_end?: string | null
          wednesday_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_shift_patterns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_vehicle_assignments: {
        Row: {
          assigned_date: string
          created_at: string | null
          driver_id: string
          id: string
          notes: string | null
          organization_id: string | null
          status: string | null
          unassigned_date: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          assigned_date?: string
          created_at?: string | null
          driver_id: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          status?: string | null
          unassigned_date?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          assigned_date?: string
          created_at?: string | null
          driver_id?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          status?: string | null
          unassigned_date?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_driver_vehicle_assignments_driver_id"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_driver_vehicle_assignments_organization_id"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_driver_vehicle_assignments_vehicle_id"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          clicked_count: number | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          opened_count: number | null
          organization_id: string | null
          recipients_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string
          type: string
          updated_at: string | null
        }
        Insert: {
          clicked_count?: number | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          opened_count?: number | null
          organization_id?: string | null
          recipients_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          type: string
          updated_at?: string | null
        }
        Update: {
          clicked_count?: number | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          opened_count?: number | null
          organization_id?: string | null
          recipients_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          attachments: Json | null
          bounced_at: string | null
          campaign_id: string | null
          click_tracking_enabled: boolean | null
          clicked_at: string | null
          content: string | null
          content_html: string | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          external_message_id: string | null
          failed_at: string | null
          id: string
          metadata: Json | null
          open_tracking_enabled: boolean | null
          opened_at: string | null
          organization_id: string | null
          priority: number | null
          recipient_email: string
          recipient_name: string | null
          related_record_id: string | null
          related_record_type: string | null
          scheduled_at: string | null
          sender_email: string
          sender_name: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["email_status"] | null
          subject: string
          tags: string[] | null
          template_id: string | null
          tracking_pixel_url: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          bounced_at?: string | null
          campaign_id?: string | null
          click_tracking_enabled?: boolean | null
          clicked_at?: string | null
          content?: string | null
          content_html?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          external_message_id?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          open_tracking_enabled?: boolean | null
          opened_at?: string | null
          organization_id?: string | null
          priority?: number | null
          recipient_email: string
          recipient_name?: string | null
          related_record_id?: string | null
          related_record_type?: string | null
          scheduled_at?: string | null
          sender_email: string
          sender_name?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"] | null
          subject: string
          tags?: string[] | null
          template_id?: string | null
          tracking_pixel_url?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          bounced_at?: string | null
          campaign_id?: string | null
          click_tracking_enabled?: boolean | null
          clicked_at?: string | null
          content?: string | null
          content_html?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          external_message_id?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          open_tracking_enabled?: boolean | null
          opened_at?: string | null
          organization_id?: string | null
          priority?: number | null
          recipient_email?: string
          recipient_name?: string | null
          related_record_id?: string | null
          related_record_type?: string | null
          scheduled_at?: string | null
          sender_email?: string
          sender_name?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"] | null
          subject?: string
          tags?: string[] | null
          template_id?: string | null
          tracking_pixel_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_recipients: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          opened_at: string | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          created_at: string | null
          daily_send_limit: number | null
          from_email: string | null
          from_name: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          reply_to_email: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_send_limit?: number | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          reply_to_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_send_limit?: number | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          reply_to_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string
          content: string
          content_html: string | null
          created_at: string | null
          created_by: string | null
          from_email: string | null
          from_name: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          language: string | null
          last_used_at: string | null
          name: string
          organization_id: string | null
          preview_text: string | null
          reply_to_email: string | null
          subject: string
          type: string | null
          updated_at: string | null
          updated_by: string | null
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          category: string
          content: string
          content_html?: string | null
          created_at?: string | null
          created_by?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          language?: string | null
          last_used_at?: string | null
          name: string
          organization_id?: string | null
          preview_text?: string | null
          reply_to_email?: string | null
          subject: string
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string
          content_html?: string | null
          created_at?: string | null
          created_by?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          language?: string | null
          last_used_at?: string | null
          name?: string
          organization_id?: string | null
          preview_text?: string | null
          reply_to_email?: string | null
          subject?: string
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          address: string | null
          available_times: string | null
          can_authorize_treatment: boolean | null
          child_id: number
          contact_name: string
          contact_type: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          medical_qualifications: string | null
          phone: string
          preferred_contact_method: string | null
          priority_order: number | null
          relationship: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          available_times?: string | null
          can_authorize_treatment?: boolean | null
          child_id: number
          contact_name: string
          contact_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          medical_qualifications?: string | null
          phone: string
          preferred_contact_method?: string | null
          priority_order?: number | null
          relationship: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          available_times?: string | null
          can_authorize_treatment?: boolean | null
          child_id?: number
          contact_name?: string
          contact_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          medical_qualifications?: string | null
          phone?: string
          preferred_contact_method?: string | null
          priority_order?: number | null
          relationship?: string
          updated_at?: string
        }
        Relationships: []
      }
      enhanced_notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          id: string
          is_read: boolean
          metadata: Json | null
          organization_id: string
          priority: string
          read_at: string | null
          recipient_id: string
          sender_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          organization_id: string
          priority?: string
          read_at?: string | null
          recipient_id: string
          sender_id?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          organization_id?: string
          priority?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
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
          purchase_date: string | null
          quantity: number
          total_cost: number
          unit_price: number
          updated_at: string | null
          vehicle_id: string
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
          purchase_date?: string | null
          quantity: number
          total_cost: number
          unit_price: number
          updated_at?: string | null
          vehicle_id: string
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
          purchase_date?: string | null
          quantity?: number
          total_cost?: number
          unit_price?: number
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_purchases_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          additional_data: Json | null
          attachments: Json | null
          created_at: string | null
          description: string
          driver_id: string | null
          id: string
          incident_date: string | null
          incident_time: string | null
          incident_type: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          organization_id: string | null
          people_involved: string[] | null
          reported_by: string
          severity: string | null
          status: string | null
          title: string
          updated_at: string | null
          vehicle_id: string | null
          witnesses: string[] | null
        }
        Insert: {
          additional_data?: Json | null
          attachments?: Json | null
          created_at?: string | null
          description: string
          driver_id?: string | null
          id?: string
          incident_date?: string | null
          incident_time?: string | null
          incident_type: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          organization_id?: string | null
          people_involved?: string[] | null
          reported_by: string
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vehicle_id?: string | null
          witnesses?: string[] | null
        }
        Update: {
          additional_data?: Json | null
          attachments?: Json | null
          created_at?: string | null
          description?: string
          driver_id?: string | null
          id?: string
          incident_date?: string | null
          incident_time?: string | null
          incident_type?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          organization_id?: string | null
          people_involved?: string[] | null
          reported_by?: string
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vehicle_id?: string | null
          witnesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      infringement_types: {
        Row: {
          category: string
          code: string
          created_at: string | null
          default_fine_amount: number | null
          default_points: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_criminal: boolean | null
          name: string
          organization_id: string | null
          regulatory_reference: string | null
          severity: Database["public"]["Enums"]["infringement_severity"]
          statutory_limit_days: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          default_fine_amount?: number | null
          default_points?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_criminal?: boolean | null
          name: string
          organization_id?: string | null
          regulatory_reference?: string | null
          severity?: Database["public"]["Enums"]["infringement_severity"]
          statutory_limit_days?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          default_fine_amount?: number | null
          default_points?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_criminal?: boolean | null
          name?: string
          organization_id?: string | null
          regulatory_reference?: string | null
          severity?: Database["public"]["Enums"]["infringement_severity"]
          statutory_limit_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infringement_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      infringements: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          court_date: string | null
          court_outcome: string | null
          created_at: string | null
          description: string | null
          driver_id: string | null
          due_date: string | null
          fine_amount: number | null
          id: string
          incident_date: string
          incident_time: string | null
          infringement_number: string
          infringement_type_id: string | null
          issue_date: string
          issuing_authority: string
          latitude: number | null
          location: string | null
          longitude: number | null
          metadata: Json | null
          notes: string | null
          organization_id: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_reference: string | null
          penalty_points: number | null
          reference_number: string | null
          severity: Database["public"]["Enums"]["infringement_severity"] | null
          status: Database["public"]["Enums"]["infringement_status"] | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          court_date?: string | null
          court_outcome?: string | null
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
          due_date?: string | null
          fine_amount?: number | null
          id?: string
          incident_date: string
          incident_time?: string | null
          infringement_number: string
          infringement_type_id?: string | null
          issue_date: string
          issuing_authority: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          penalty_points?: number | null
          reference_number?: string | null
          severity?: Database["public"]["Enums"]["infringement_severity"] | null
          status?: Database["public"]["Enums"]["infringement_status"] | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          court_date?: string | null
          court_outcome?: string | null
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
          due_date?: string | null
          fine_amount?: number | null
          id?: string
          incident_date?: string
          incident_time?: string | null
          infringement_number?: string
          infringement_type_id?: string | null
          issue_date?: string
          issuing_authority?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          penalty_points?: number | null
          reference_number?: string | null
          severity?: Database["public"]["Enums"]["infringement_severity"] | null
          status?: Database["public"]["Enums"]["infringement_status"] | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infringements_infringement_type_id_fkey"
            columns: ["infringement_type_id"]
            isOneToOne: false
            referencedRelation: "infringement_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "infringements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "infringements_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_question_sets: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_question_sets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_question_sets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_questions: {
        Row: {
          category: string
          created_at: string | null
          guidance: string | null
          has_notes: boolean | null
          has_photo: boolean | null
          id: string
          is_critical: boolean | null
          is_required: boolean | null
          order_index: number
          question: string
          question_set_id: string
          question_type: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          guidance?: string | null
          has_notes?: boolean | null
          has_photo?: boolean | null
          id?: string
          is_critical?: boolean | null
          is_required?: boolean | null
          order_index?: number
          question: string
          question_set_id: string
          question_type?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          guidance?: string | null
          has_notes?: boolean | null
          has_photo?: boolean | null
          id?: string
          is_critical?: boolean | null
          is_required?: boolean | null
          order_index?: number
          question?: string
          question_set_id?: string
          question_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_questions_question_set_id_fkey"
            columns: ["question_set_id"]
            isOneToOne: false
            referencedRelation: "inspection_question_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_schedules: {
        Row: {
          assigned_driver_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string | null
          scheduled_date: string
          status: string | null
          template_id: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          assigned_driver_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          scheduled_date: string
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          assigned_driver_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          scheduled_date?: string
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_schedules_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_schedules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "inspection_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_schedules_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          frequency_days: number
          id: string
          inspection_type: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency_days: number
          id?: string
          inspection_type: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency_days?: number
          id?: string
          inspection_type?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_alerts: {
        Row: {
          alert_type: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string
          organization_id: string
          part_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          title: string
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message: string
          organization_id: string
          part_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          title: string
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string
          organization_id?: string
          part_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_alerts_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          approved_by: string | null
          attachments: Json | null
          bank_account_details: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          customer_id: string | null
          description: string | null
          discount_amount: number | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          last_reminder_date: string | null
          late_fee_amount: number | null
          line_items: Json | null
          metadata: Json | null
          notes: string | null
          organization_id: string | null
          paid_amount: number | null
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_terms: string | null
          quotation_id: string | null
          reminder_count: number | null
          sent_date: string | null
          service_date: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          terms_conditions: string | null
          title: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          attachments?: Json | null
          bank_account_details?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          discount_amount?: number | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          last_reminder_date?: string | null
          late_fee_amount?: number | null
          line_items?: Json | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_terms?: string | null
          quotation_id?: string | null
          reminder_count?: number | null
          sent_date?: string | null
          service_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms_conditions?: string | null
          title: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          attachments?: Json | null
          bank_account_details?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          discount_amount?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          last_reminder_date?: string | null
          late_fee_amount?: number | null
          line_items?: Json | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_terms?: string | null
          quotation_id?: string | null
          reminder_count?: number | null
          sent_date?: string | null
          service_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms_conditions?: string | null
          title?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assignments: {
        Row: {
          accepted_at: string | null
          assigned_at: string
          assigned_by: string | null
          completed_at: string | null
          created_at: string
          driver_id: string | null
          id: string
          job_id: string | null
          notes: string | null
          organization_id: string | null
          started_at: string | null
          status: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          driver_id?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          organization_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          driver_id?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          organization_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_duration: number | null
          assigned_driver_id: string | null
          assigned_to: string | null
          assigned_vehicle_id: string | null
          created_at: string
          created_by: string | null
          customer_contact: string | null
          customer_name: string | null
          delivery_location: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          estimated_duration: number | null
          id: string
          organization_id: string | null
          pickup_location: string | null
          priority: string | null
          start_date: string | null
          start_time: string | null
          status: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          actual_duration?: number | null
          assigned_driver_id?: string | null
          assigned_to?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_contact?: string | null
          customer_name?: string | null
          delivery_location?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          estimated_duration?: number | null
          id?: string
          organization_id?: string | null
          pickup_location?: string | null
          priority?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          actual_duration?: number | null
          assigned_driver_id?: string | null
          assigned_to?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_contact?: string | null
          customer_name?: string | null
          delivery_location?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          estimated_duration?: number | null
          id?: string
          organization_id?: string | null
          pickup_location?: string | null
          priority?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      license_folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          completed_date: string | null
          created_at: string | null
          description: string
          estimated_cost: number | null
          estimated_hours: number | null
          id: string
          mechanic_id: string | null
          notes: string | null
          organization_id: string | null
          parts_needed: string[] | null
          priority: string | null
          requested_by: string
          scheduled_date: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          completed_date?: string | null
          created_at?: string | null
          description: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          mechanic_id?: string | null
          notes?: string | null
          organization_id?: string | null
          parts_needed?: string[] | null
          priority?: string | null
          requested_by: string
          scheduled_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          completed_date?: string | null
          created_at?: string | null
          description?: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          mechanic_id?: string | null
          notes?: string | null
          organization_id?: string | null
          parts_needed?: string[] | null
          priority?: string | null
          requested_by?: string
          scheduled_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanic_organization_preferences: {
        Row: {
          created_at: string | null
          id: string
          mechanic_id: string
          notification_settings: Json | null
          organization_id: string
          preferences: Json | null
          ui_settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mechanic_id: string
          notification_settings?: Json | null
          organization_id: string
          preferences?: Json | null
          ui_settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mechanic_id?: string
          notification_settings?: Json | null
          organization_id?: string
          preferences?: Json | null
          ui_settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mechanic_organization_preferences_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mechanic_organization_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanic_organization_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          mechanic_id: string
          message: string | null
          organization_id: string
          request_type: string
          requested_by: string
          response_message: string | null
          status: string
          terminated_at: string | null
          terminated_by: string | null
          termination_reason: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          mechanic_id: string
          message?: string | null
          organization_id: string
          request_type: string
          requested_by: string
          response_message?: string | null
          status?: string
          terminated_at?: string | null
          terminated_by?: string | null
          termination_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          mechanic_id?: string
          message?: string | null
          organization_id?: string
          request_type?: string
          requested_by?: string
          response_message?: string | null
          status?: string
          terminated_at?: string | null
          terminated_by?: string | null
          termination_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mechanic_organization_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mechanic_organization_requests_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mechanic_organization_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mechanic_organization_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mechanic_organization_requests_terminated_by_fkey"
            columns: ["terminated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanic_organizations: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          mechanic_id: string
          notes: string | null
          organization_id: string
          role_in_org: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mechanic_id: string
          notes?: string | null
          organization_id: string
          role_in_org?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mechanic_id?: string
          notes?: string | null
          organization_id?: string
          role_in_org?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mechanic_organizations_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mechanic_organizations_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mechanic_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanic_sessions: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          mechanic_id: string
          organization_id: string
          session_end: string | null
          session_start: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          mechanic_id: string
          organization_id: string
          session_end?: string | null
          session_start?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          mechanic_id?: string
          organization_id?: string
          session_end?: string | null
          session_start?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mechanic_sessions_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mechanic_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanics: {
        Row: {
          availability_schedule: Json | null
          certification_level: string | null
          created_at: string | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          mechanic_license_number: string | null
          mechanic_name: string
          organization_id: string | null
          profile_id: string | null
          specializations: string[] | null
          updated_at: string | null
        }
        Insert: {
          availability_schedule?: Json | null
          certification_level?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          mechanic_license_number?: string | null
          mechanic_name: string
          organization_id?: string | null
          profile_id?: string | null
          specializations?: string[] | null
          updated_at?: string | null
        }
        Update: {
          availability_schedule?: Json | null
          certification_level?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          mechanic_license_number?: string | null
          mechanic_name?: string
          organization_id?: string | null
          profile_id?: string | null
          specializations?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          joined_at: string
          metadata: Json | null
          organization_id: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          joined_at?: string
          metadata?: Json | null
          organization_id: string
          role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          joined_at?: string
          metadata?: Json | null
          organization_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_auth_logs: {
        Row: {
          action: string
          app_type: string
          created_at: string | null
          device_id: string
          device_info: Json | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          success: boolean
          user_id: string | null
        }
        Insert: {
          action: string
          app_type: string
          created_at?: string | null
          device_id: string
          device_info?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success: boolean
          user_id?: string | null
        }
        Update: {
          action?: string
          app_type?: string
          created_at?: string | null
          device_id?: string
          device_info?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      mobile_sessions: {
        Row: {
          app_type: string
          created_at: string | null
          device_id: string
          device_token: string | null
          device_type: string
          id: string
          last_active: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_type: string
          created_at?: string | null
          device_id: string
          device_token?: string | null
          device_type: string
          id?: string
          last_active?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_type?: string
          created_at?: string | null
          device_id?: string
          device_token?: string | null
          device_type?: string
          id?: string
          last_active?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      notification_logs: {
        Row: {
          agreement_id: string
          agreement_title: string | null
          created_at: string | null
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          agreement_id: string
          agreement_title?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          agreement_id?: string
          agreement_title?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "user_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          is_active: boolean | null
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
          is_active?: boolean | null
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
          is_active?: boolean | null
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
      orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          product_description: string | null
          product_name: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          product_description?: string | null
          product_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          product_description?: string | null
          product_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      organization_subscriptions: {
        Row: {
          amount: number
          auto_renew: boolean | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          next_billing_date: string | null
          organization_id: string
          payment_method_id: string | null
          plan_id: string
          start_date: string | null
          status: string | null
          trial_organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          organization_id: string
          payment_method_id?: string | null
          plan_id: string
          start_date?: string | null
          status?: string | null
          trial_organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          organization_id?: string
          payment_method_id?: string | null
          plan_id?: string
          start_date?: string | null
          status?: string | null
          trial_organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_trial_organization_id_fkey"
            columns: ["trial_organization_id"]
            isOneToOne: false
            referencedRelation: "organization_trials"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_trials: {
        Row: {
          created_at: string | null
          features: string | null
          id: string
          max_drivers: number | null
          organization_id: string
          trial_end_date: string | null
          trial_start_date: string | null
          trial_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          features?: string | null
          id?: string
          max_drivers?: number | null
          organization_id: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          trial_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          features?: string | null
          id?: string
          max_drivers?: number | null
          organization_id?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          trial_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_trials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_usage: {
        Row: {
          api_calls_count: number | null
          created_at: string | null
          date: string
          drivers_count: number | null
          id: string
          organization_id: string
          storage_used_gb: number | null
          vehicles_count: number | null
        }
        Insert: {
          api_calls_count?: number | null
          created_at?: string | null
          date?: string
          drivers_count?: number | null
          id?: string
          organization_id: string
          storage_used_gb?: number | null
          vehicles_count?: number | null
        }
        Update: {
          api_calls_count?: number | null
          created_at?: string | null
          date?: string
          drivers_count?: number | null
          id?: string
          organization_id?: string
          storage_used_gb?: number | null
          vehicles_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          billing_address: string | null
          billing_contact_email: string | null
          billing_contact_name: string | null
          billing_contact_phone: string | null
          city: string | null
          contact_email: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          legal_name: string | null
          logo_url: string | null
          max_drivers: number | null
          max_vehicles: number | null
          name: string
          phone: string | null
          registration_number: string | null
          settings: Json | null
          slug: string | null
          state: string | null
          subscription_plan: string | null
          subscription_status: string | null
          tax_number: string | null
          type: string | null
          updated_at: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          billing_address?: string | null
          billing_contact_email?: string | null
          billing_contact_name?: string | null
          billing_contact_phone?: string | null
          city?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          max_drivers?: number | null
          max_vehicles?: number | null
          name: string
          phone?: string | null
          registration_number?: string | null
          settings?: Json | null
          slug?: string | null
          state?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tax_number?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          billing_address?: string | null
          billing_contact_email?: string | null
          billing_contact_name?: string | null
          billing_contact_phone?: string | null
          city?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          max_drivers?: number | null
          max_vehicles?: number | null
          name?: string
          phone?: string | null
          registration_number?: string | null
          settings?: Json | null
          slug?: string | null
          state?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tax_number?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
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
      parts_approval_requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          current_value: string | null
          id: string
          organization_id: string
          part_id: string | null
          quantity_requested: number | null
          reason: string
          request_type: string | null
          requested_value: string | null
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          current_value?: string | null
          id?: string
          organization_id: string
          part_id?: string | null
          quantity_requested?: number | null
          reason: string
          request_type?: string | null
          requested_value?: string | null
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          current_value?: string | null
          id?: string
          organization_id?: string
          part_id?: string | null
          quantity_requested?: number | null
          reason?: string
          request_type?: string | null
          requested_value?: string | null
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_approval_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_approval_requests_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_inventory: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          discontinued: boolean | null
          id: string
          last_ordered: string | null
          location: string | null
          max_quantity: number | null
          min_quantity: number | null
          name: string
          next_order_date: string | null
          organization_id: string
          part_number: string
          quantity: number | null
          status: string | null
          supplier: string | null
          supplier_contact: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discontinued?: boolean | null
          id?: string
          last_ordered?: string | null
          location?: string | null
          max_quantity?: number | null
          min_quantity?: number | null
          name: string
          next_order_date?: string | null
          organization_id: string
          part_number: string
          quantity?: number | null
          status?: string | null
          supplier?: string | null
          supplier_contact?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discontinued?: boolean | null
          id?: string
          last_ordered?: string | null
          location?: string | null
          max_quantity?: number | null
          min_quantity?: number | null
          name?: string
          next_order_date?: string | null
          organization_id?: string
          part_number?: string
          quantity?: number | null
          status?: string | null
          supplier?: string | null
          supplier_contact?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_inventory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_requests: {
        Row: {
          created_at: string | null
          defect_id: string
          id: string
          installed_at: string | null
          notes: string | null
          ordered_at: string | null
          part_name: string
          part_number: string | null
          quantity: number
          received_at: string | null
          requested_at: string | null
          requested_by: string | null
          status: string | null
          supplier: string | null
          supplier_contact: string | null
          total_cost: number | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          defect_id: string
          id?: string
          installed_at?: string | null
          notes?: string | null
          ordered_at?: string | null
          part_name: string
          part_number?: string | null
          quantity?: number
          received_at?: string | null
          requested_at?: string | null
          requested_by?: string | null
          status?: string | null
          supplier?: string | null
          supplier_contact?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          defect_id?: string
          id?: string
          installed_at?: string | null
          notes?: string | null
          ordered_at?: string | null
          part_name?: string
          part_number?: string | null
          quantity?: number
          received_at?: string | null
          requested_at?: string | null
          requested_by?: string | null
          status?: string | null
          supplier?: string | null
          supplier_contact?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_requests_defect_id_fkey"
            columns: ["defect_id"]
            isOneToOne: false
            referencedRelation: "defect_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      password_resets: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          notes: string | null
          organization_id: string
          requested_by: string
          reset_type: string
          status: string
          temporary_password: string | null
          updated_at: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          requested_by: string
          reset_type?: string
          status?: string
          temporary_password?: string | null
          updated_at?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          requested_by?: string
          reset_type?: string
          status?: string
          temporary_password?: string | null
          updated_at?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_resets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          allowances: number | null
          approved_by: string | null
          attachments: Json | null
          bank_account_number: string | null
          basic_salary: number
          bonus_amount: number | null
          commission_amount: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          employee_id: string | null
          gross_pay: number
          id: string
          is_paid: boolean | null
          metadata: Json | null
          net_pay: number
          ni_deduction: number | null
          notes: string | null
          organization_id: string | null
          other_deductions: number | null
          overtime_hours: number | null
          overtime_pay: number | null
          overtime_rate: number | null
          paid_date: string | null
          pay_date: string
          pay_period_end: string
          pay_period_start: string
          payment_method: string | null
          payment_reference: string | null
          payroll_number: string
          pension_deduction: number | null
          sort_code: string | null
          tax_deduction: number | null
          total_deductions: number | null
          updated_at: string | null
        }
        Insert: {
          allowances?: number | null
          approved_by?: string | null
          attachments?: Json | null
          bank_account_number?: string | null
          basic_salary?: number
          bonus_amount?: number | null
          commission_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          employee_id?: string | null
          gross_pay?: number
          id?: string
          is_paid?: boolean | null
          metadata?: Json | null
          net_pay?: number
          ni_deduction?: number | null
          notes?: string | null
          organization_id?: string | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          overtime_rate?: number | null
          paid_date?: string | null
          pay_date: string
          pay_period_end: string
          pay_period_start: string
          payment_method?: string | null
          payment_reference?: string | null
          payroll_number: string
          pension_deduction?: number | null
          sort_code?: string | null
          tax_deduction?: number | null
          total_deductions?: number | null
          updated_at?: string | null
        }
        Update: {
          allowances?: number | null
          approved_by?: string | null
          attachments?: Json | null
          bank_account_number?: string | null
          basic_salary?: number
          bonus_amount?: number | null
          commission_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          employee_id?: string | null
          gross_pay?: number
          id?: string
          is_paid?: boolean | null
          metadata?: Json | null
          net_pay?: number
          ni_deduction?: number | null
          notes?: string | null
          organization_id?: string | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          overtime_rate?: number | null
          paid_date?: string | null
          pay_date?: string
          pay_period_end?: string
          pay_period_start?: string
          payment_method?: string | null
          payment_reference?: string | null
          payroll_number?: string
          pension_deduction?: number | null
          sort_code?: string | null
          tax_deduction?: number | null
          total_deductions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_organization_id_fkey"
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
          email: string | null
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
          email?: string | null
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
          email?: string | null
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
          avatar_url: string | null
          cdl_number: string | null
          city: string | null
          created_at: string
          default_organization_id: string | null
          email: string
          employee_id: string | null
          employment_status: string | null
          first_name: string | null
          hire_date: string | null
          id: string
          is_active: boolean
          last_name: string | null
          medical_card_expiry: string | null
          must_change_password: boolean | null
          onboarding_status: string | null
          organization_id: string | null
          password_changed_at: string | null
          phone: string | null
          privacy_policy_accepted: boolean | null
          privacy_policy_accepted_date: string | null
          privacy_policy_version: string | null
          role: string
          state: string | null
          termination_date: string | null
          terms_accepted: boolean | null
          terms_accepted_date: string | null
          terms_version: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          cdl_number?: string | null
          city?: string | null
          created_at?: string
          default_organization_id?: string | null
          email: string
          employee_id?: string | null
          employment_status?: string | null
          first_name?: string | null
          hire_date?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          medical_card_expiry?: string | null
          must_change_password?: boolean | null
          onboarding_status?: string | null
          organization_id?: string | null
          password_changed_at?: string | null
          phone?: string | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_accepted_date?: string | null
          privacy_policy_version?: string | null
          role?: string
          state?: string | null
          termination_date?: string | null
          terms_accepted?: boolean | null
          terms_accepted_date?: string | null
          terms_version?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          cdl_number?: string | null
          city?: string | null
          created_at?: string
          default_organization_id?: string | null
          email?: string
          employee_id?: string | null
          employment_status?: string | null
          first_name?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          medical_card_expiry?: string | null
          must_change_password?: boolean | null
          onboarding_status?: string | null
          organization_id?: string | null
          password_changed_at?: string | null
          phone?: string | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_accepted_date?: string | null
          privacy_policy_version?: string | null
          role?: string
          state?: string | null
          termination_date?: string | null
          terms_accepted?: boolean | null
          terms_accepted_date?: string | null
          terms_version?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_organization_id_fkey"
            columns: ["default_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          accepted_date: string | null
          approved_by: string | null
          attachments: Json | null
          converted_to_invoice_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          customer_id: string | null
          description: string | null
          discount_amount: number | null
          dropoff_location: string | null
          duration_hours: number | null
          id: string
          metadata: Json | null
          notes: string | null
          organization_id: string | null
          passenger_count: number | null
          pickup_location: string | null
          quotation_number: string
          rejected_date: string | null
          rejection_reason: string | null
          route_details: string | null
          sent_date: string | null
          service_date: string | null
          service_time: string | null
          service_type: string | null
          status: Database["public"]["Enums"]["quotation_status"] | null
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          terms_conditions: string | null
          title: string
          total_amount: number
          updated_at: string | null
          valid_until: string | null
          vehicle_type: string | null
        }
        Insert: {
          accepted_date?: string | null
          approved_by?: string | null
          attachments?: Json | null
          converted_to_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          discount_amount?: number | null
          dropoff_location?: string | null
          duration_hours?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          passenger_count?: number | null
          pickup_location?: string | null
          quotation_number: string
          rejected_date?: string | null
          rejection_reason?: string | null
          route_details?: string | null
          sent_date?: string | null
          service_date?: string | null
          service_time?: string | null
          service_type?: string | null
          status?: Database["public"]["Enums"]["quotation_status"] | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms_conditions?: string | null
          title: string
          total_amount?: number
          updated_at?: string | null
          valid_until?: string | null
          vehicle_type?: string | null
        }
        Update: {
          accepted_date?: string | null
          approved_by?: string | null
          attachments?: Json | null
          converted_to_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          discount_amount?: number | null
          dropoff_location?: string | null
          duration_hours?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          passenger_count?: number | null
          pickup_location?: string | null
          quotation_number?: string
          rejected_date?: string | null
          rejection_reason?: string | null
          route_details?: string | null
          sent_date?: string | null
          service_date?: string | null
          service_time?: string | null
          service_type?: string | null
          status?: Database["public"]["Enums"]["quotation_status"] | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms_conditions?: string | null
          title?: string
          total_amount?: number
          updated_at?: string | null
          valid_until?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
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
        ]
      }
      rail_replacement_services: {
        Row: {
          actual_cost: number | null
          affected_line: string
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          dropoff_locations: string[] | null
          dropoff_points: string[] | null
          end_date: string
          end_time: string | null
          estimated_cost: number | null
          frequency: string | null
          id: string
          notes: string | null
          operator_contact: string | null
          operator_email: string | null
          operator_phone: string | null
          organization_id: string | null
          passengers_affected: number | null
          performance_metrics: Json | null
          pickup_locations: string[] | null
          pickup_points: string[] | null
          priority: string | null
          rail_operator: string | null
          revenue: number | null
          route_details: string | null
          route_name: string
          service_code: string | null
          service_type: string | null
          special_requirements: string[] | null
          start_date: string
          start_time: string | null
          status: string
          updated_at: string | null
          vehicles_assigned: number | null
          vehicles_required: number | null
        }
        Insert: {
          actual_cost?: number | null
          affected_line: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          dropoff_locations?: string[] | null
          dropoff_points?: string[] | null
          end_date: string
          end_time?: string | null
          estimated_cost?: number | null
          frequency?: string | null
          id?: string
          notes?: string | null
          operator_contact?: string | null
          operator_email?: string | null
          operator_phone?: string | null
          organization_id?: string | null
          passengers_affected?: number | null
          performance_metrics?: Json | null
          pickup_locations?: string[] | null
          pickup_points?: string[] | null
          priority?: string | null
          rail_operator?: string | null
          revenue?: number | null
          route_details?: string | null
          route_name: string
          service_code?: string | null
          service_type?: string | null
          special_requirements?: string[] | null
          start_date: string
          start_time?: string | null
          status?: string
          updated_at?: string | null
          vehicles_assigned?: number | null
          vehicles_required?: number | null
        }
        Update: {
          actual_cost?: number | null
          affected_line?: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          dropoff_locations?: string[] | null
          dropoff_points?: string[] | null
          end_date?: string
          end_time?: string | null
          estimated_cost?: number | null
          frequency?: string | null
          id?: string
          notes?: string | null
          operator_contact?: string | null
          operator_email?: string | null
          operator_phone?: string | null
          organization_id?: string | null
          passengers_affected?: number | null
          performance_metrics?: Json | null
          pickup_locations?: string[] | null
          pickup_points?: string[] | null
          priority?: string | null
          rail_operator?: string | null
          revenue?: number | null
          route_details?: string | null
          route_name?: string
          service_code?: string | null
          service_type?: string | null
          special_requirements?: string[] | null
          start_date?: string
          start_time?: string | null
          status?: string
          updated_at?: string | null
          vehicles_assigned?: number | null
          vehicles_required?: number | null
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
            foreignKeyName: "rail_replacement_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_invoices: {
        Row: {
          created_at: string | null
          created_by: string | null
          defect_id: string
          due_date: string | null
          id: string
          invoice_date: string | null
          invoice_number: string
          labor_hours: number | null
          labor_rate: number | null
          labor_total: number | null
          notes: string | null
          paid_date: string | null
          parts_total: number | null
          payment_method: string | null
          payment_terms: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          defect_id: string
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number: string
          labor_hours?: number | null
          labor_rate?: number | null
          labor_total?: number | null
          notes?: string | null
          paid_date?: string | null
          parts_total?: number | null
          payment_method?: string | null
          payment_terms?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          defect_id?: string
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string
          labor_hours?: number | null
          labor_rate?: number | null
          labor_total?: number | null
          notes?: string | null
          paid_date?: string | null
          parts_total?: number | null
          payment_method?: string | null
          payment_terms?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_invoices_defect_id_fkey"
            columns: ["defect_id"]
            isOneToOne: false
            referencedRelation: "defect_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_photos: {
        Row: {
          created_at: string | null
          defect_id: string
          description: string | null
          id: string
          photo_type: string | null
          photo_url: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          defect_id: string
          description?: string | null
          id?: string
          photo_type?: string | null
          photo_url: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          defect_id?: string
          description?: string | null
          id?: string
          photo_type?: string | null
          photo_url?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_photos_defect_id_fkey"
            columns: ["defect_id"]
            isOneToOne: false
            referencedRelation: "defect_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_time_logs: {
        Row: {
          activity_type: string | null
          created_at: string | null
          defect_id: string
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          mechanic_id: string
          start_time: string
        }
        Insert: {
          activity_type?: string | null
          created_at?: string | null
          defect_id: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          mechanic_id: string
          start_time: string
        }
        Update: {
          activity_type?: string | null
          created_at?: string | null
          defect_id?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          mechanic_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_time_logs_defect_id_fkey"
            columns: ["defect_id"]
            isOneToOne: false
            referencedRelation: "defect_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_time_logs_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      route_assignments: {
        Row: {
          assignment_date: string
          created_at: string
          driver_id: string | null
          end_time: string | null
          id: string
          is_active: boolean
          notes: string | null
          organization_id: string | null
          route_id: string | null
          start_time: string | null
          status: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          assignment_date: string
          created_at?: string
          driver_id?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          organization_id?: string | null
          route_id?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          assignment_date?: string
          created_at?: string
          driver_id?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          organization_id?: string | null
          route_id?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_assignments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
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
          created_at: string
          current_passengers: number | null
          days_of_week: number[] | null
          destination: string | null
          distance: number | null
          driver_id: string | null
          dropoff_times: string[] | null
          end_location: string | null
          end_time: string | null
          estimated_revenue: number | null
          estimated_time: number | null
          grade_levels: string[] | null
          id: string
          name: string | null
          notes: string | null
          organization_id: string | null
          pickup_times: string[] | null
          priority: string | null
          route_type: string | null
          schedule: Json | null
          school_name: string | null
          start_location: string | null
          start_time: string | null
          status: string | null
          stops: Json | null
          updated_at: string
        }
        Insert: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          capacity?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          current_passengers?: number | null
          days_of_week?: number[] | null
          destination?: string | null
          distance?: number | null
          driver_id?: string | null
          dropoff_times?: string[] | null
          end_location?: string | null
          end_time?: string | null
          estimated_revenue?: number | null
          estimated_time?: number | null
          grade_levels?: string[] | null
          id?: string
          name?: string | null
          notes?: string | null
          organization_id?: string | null
          pickup_times?: string[] | null
          priority?: string | null
          route_type?: string | null
          schedule?: Json | null
          school_name?: string | null
          start_location?: string | null
          start_time?: string | null
          status?: string | null
          stops?: Json | null
          updated_at?: string
        }
        Update: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          capacity?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          current_passengers?: number | null
          days_of_week?: number[] | null
          destination?: string | null
          distance?: number | null
          driver_id?: string | null
          dropoff_times?: string[] | null
          end_location?: string | null
          end_time?: string | null
          estimated_revenue?: number | null
          estimated_time?: number | null
          grade_levels?: string[] | null
          id?: string
          name?: string | null
          notes?: string | null
          organization_id?: string | null
          pickup_times?: string[] | null
          priority?: string | null
          route_type?: string | null
          schedule?: Json | null
          school_name?: string | null
          start_location?: string | null
          start_time?: string | null
          status?: string | null
          stops?: Json | null
          updated_at?: string
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
      schedules: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          driver_id: string | null
          end_date: string | null
          end_time: string | null
          id: string
          is_recurring: boolean | null
          notes: string | null
          organization_id: string
          priority: string | null
          recurring_pattern: Json | null
          route_id: string | null
          start_date: string
          start_time: string | null
          status: string | null
          title: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          driver_id?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          organization_id: string
          priority?: string | null
          recurring_pattern?: Json | null
          route_id?: string | null
          start_date: string
          start_time?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          driver_id?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          organization_id?: string
          priority?: string | null
          recurring_pattern?: Json | null
          route_id?: string | null
          start_date?: string
          start_time?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          local_authority: string | null
          name: string
          ofsted_rating: string | null
          phone: string | null
          school_type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          local_authority?: string | null
          name: string
          ofsted_rating?: string | null
          phone?: string | null
          school_type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          local_authority?: string | null
          name?: string
          ofsted_rating?: string | null
          phone?: string | null
          school_type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          description: string
          event_type: string
          id: string
          metadata: Json | null
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          actor_id: string | null
          created_at: string
          event_description: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          organization_id: string
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_description?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id: string
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_description?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          approval_request_id: string | null
          created_at: string | null
          id: string
          moved_by: string
          movement_date: string | null
          movement_number: string
          movement_type: string | null
          new_quantity: number
          notes: string | null
          organization_id: string
          part_id: string
          previous_quantity: number
          quantity: number
          reference_number: string | null
          reference_type: string | null
          total_value: number | null
          unit_price: number | null
        }
        Insert: {
          approval_request_id?: string | null
          created_at?: string | null
          id?: string
          moved_by: string
          movement_date?: string | null
          movement_number: string
          movement_type?: string | null
          new_quantity: number
          notes?: string | null
          organization_id: string
          part_id: string
          previous_quantity: number
          quantity: number
          reference_number?: string | null
          reference_type?: string | null
          total_value?: number | null
          unit_price?: number | null
        }
        Update: {
          approval_request_id?: string | null
          created_at?: string | null
          id?: string
          moved_by?: string
          movement_date?: string | null
          movement_number?: string
          movement_type?: string | null
          new_quantity?: number
          notes?: string | null
          organization_id?: string
          part_id?: string
          previous_quantity?: number
          quantity?: number
          reference_number?: string | null
          reference_type?: string | null
          total_value?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "parts_approval_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_orders: {
        Row: {
          actual_delivery: string | null
          approval_request_id: string | null
          created_at: string | null
          expected_delivery: string | null
          id: string
          notes: string | null
          order_date: string | null
          order_number: string
          order_status: string | null
          ordered_by: string
          organization_id: string
          part_id: string
          quantity_ordered: number
          quantity_received: number | null
          received_by: string | null
          supplier: string
          supplier_contact: string | null
          total_cost: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery?: string | null
          approval_request_id?: string | null
          created_at?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number: string
          order_status?: string | null
          ordered_by: string
          organization_id: string
          part_id: string
          quantity_ordered: number
          quantity_received?: number | null
          received_by?: string | null
          supplier: string
          supplier_contact?: string | null
          total_cost: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery?: string | null
          approval_request_id?: string | null
          created_at?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string
          order_status?: string | null
          ordered_by?: string
          organization_id?: string
          part_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          received_by?: string | null
          supplier?: string
          supplier_contact?: string | null
          total_cost?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_orders_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "parts_approval_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_orders_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts_inventory"
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
      student_pickups: {
        Row: {
          created_at: string
          driver_id: string | null
          dropoff_confirmed_by: string | null
          dropoff_location: string | null
          dropoff_time: string | null
          id: string
          notes: string | null
          organization_id: string | null
          parent_notified_dropoff: boolean
          parent_notified_pickup: boolean
          pickup_confirmed_by: string | null
          pickup_location: string
          pickup_time: string
          route_id: string | null
          status: string
          student_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          driver_id?: string | null
          dropoff_confirmed_by?: string | null
          dropoff_location?: string | null
          dropoff_time?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          parent_notified_dropoff?: boolean
          parent_notified_pickup?: boolean
          pickup_confirmed_by?: string | null
          pickup_location: string
          pickup_time: string
          route_id?: string | null
          status?: string
          student_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          driver_id?: string | null
          dropoff_confirmed_by?: string | null
          dropoff_location?: string | null
          dropoff_time?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          parent_notified_dropoff?: boolean
          parent_notified_pickup?: boolean
          pickup_confirmed_by?: string | null
          pickup_location?: string
          pickup_time?: string
          route_id?: string | null
          status?: string
          student_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_pickups_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
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
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
          assigned_to: string | null
          attachments: Json | null
          category: string | null
          created_at: string | null
          customer_feedback: string | null
          customer_satisfaction_rating: number | null
          description: string
          device_info: string | null
          escalated_to: string | null
          estimated_resolution_date: string | null
          first_response_date: string | null
          id: string
          is_escalated: boolean | null
          is_internal: boolean | null
          last_activity_date: string | null
          metadata: Json | null
          organization_id: string | null
          priority:
            | Database["public"]["Enums"]["support_ticket_priority"]
            | null
          requester_email: string | null
          requester_id: string | null
          requester_name: string | null
          requester_phone: string | null
          resolution: string | null
          resolution_date: string | null
          status: Database["public"]["Enums"]["support_ticket_status"] | null
          tags: string[] | null
          ticket_number: string
          title: string
          type: string | null
          updated_at: string | null
          user_email: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          app_version?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          created_at?: string | null
          customer_feedback?: string | null
          customer_satisfaction_rating?: number | null
          description: string
          device_info?: string | null
          escalated_to?: string | null
          estimated_resolution_date?: string | null
          first_response_date?: string | null
          id?: string
          is_escalated?: boolean | null
          is_internal?: boolean | null
          last_activity_date?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?:
            | Database["public"]["Enums"]["support_ticket_priority"]
            | null
          requester_email?: string | null
          requester_id?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          resolution?: string | null
          resolution_date?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"] | null
          tags?: string[] | null
          ticket_number: string
          title: string
          type?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          app_version?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          created_at?: string | null
          customer_feedback?: string | null
          customer_satisfaction_rating?: number | null
          description?: string
          device_info?: string | null
          escalated_to?: string | null
          estimated_resolution_date?: string | null
          first_response_date?: string | null
          id?: string
          is_escalated?: boolean | null
          is_internal?: boolean | null
          last_activity_date?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?:
            | Database["public"]["Enums"]["support_ticket_priority"]
            | null
          requester_email?: string | null
          requester_id?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          resolution?: string | null
          resolution_date?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"] | null
          tags?: string[] | null
          ticket_number?: string
          title?: string
          type?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tachograph_card_readers: {
        Row: {
          created_at: string | null
          device_name: string
          device_type: string
          firmware_version: string | null
          id: string
          last_calibration_date: string | null
          next_calibration_due: string | null
          organization_id: string
          serial_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_name: string
          device_type: string
          firmware_version?: string | null
          id?: string
          last_calibration_date?: string | null
          next_calibration_due?: string | null
          organization_id: string
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_name?: string
          device_type?: string
          firmware_version?: string | null
          id?: string
          last_calibration_date?: string | null
          next_calibration_due?: string | null
          organization_id?: string
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tachograph_card_readers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tachograph_download_sessions: {
        Row: {
          card_number: string | null
          card_reader_id: string | null
          card_type: string
          created_at: string | null
          download_end_time: string | null
          download_start_time: string | null
          download_status: string | null
          driver_id: string | null
          error_message: string | null
          file_path: string | null
          id: string
          organization_id: string
          records_downloaded: number | null
          vehicle_id: string | null
        }
        Insert: {
          card_number?: string | null
          card_reader_id?: string | null
          card_type: string
          created_at?: string | null
          download_end_time?: string | null
          download_start_time?: string | null
          download_status?: string | null
          driver_id?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          organization_id: string
          records_downloaded?: number | null
          vehicle_id?: string | null
        }
        Update: {
          card_number?: string | null
          card_reader_id?: string | null
          card_type?: string
          created_at?: string | null
          download_end_time?: string | null
          download_start_time?: string | null
          download_status?: string | null
          driver_id?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          organization_id?: string
          records_downloaded?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tachograph_download_sessions_card_reader_id_fkey"
            columns: ["card_reader_id"]
            isOneToOne: false
            referencedRelation: "tachograph_card_readers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tachograph_download_sessions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tachograph_download_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tachograph_download_sessions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      tachograph_records: {
        Row: {
          activity_type: string
          card_expiry_date: string | null
          card_holder_name: string | null
          card_number: string | null
          card_type: string | null
          created_at: string | null
          digital_signature: string | null
          distance_km: number | null
          download_method: string | null
          downloaded_at: string | null
          driver_id: string | null
          end_location: string | null
          end_time: string | null
          file_path: string | null
          id: string
          is_validated: boolean | null
          organization_id: string | null
          raw_data: Json | null
          record_date: string
          start_location: string | null
          start_time: string
          updated_at: string | null
          validation_notes: string | null
          vehicle_id: string | null
          violations: Json | null
        }
        Insert: {
          activity_type: string
          card_expiry_date?: string | null
          card_holder_name?: string | null
          card_number?: string | null
          card_type?: string | null
          created_at?: string | null
          digital_signature?: string | null
          distance_km?: number | null
          download_method?: string | null
          downloaded_at?: string | null
          driver_id?: string | null
          end_location?: string | null
          end_time?: string | null
          file_path?: string | null
          id?: string
          is_validated?: boolean | null
          organization_id?: string | null
          raw_data?: Json | null
          record_date: string
          start_location?: string | null
          start_time: string
          updated_at?: string | null
          validation_notes?: string | null
          vehicle_id?: string | null
          violations?: Json | null
        }
        Update: {
          activity_type?: string
          card_expiry_date?: string | null
          card_holder_name?: string | null
          card_number?: string | null
          card_type?: string | null
          created_at?: string | null
          digital_signature?: string | null
          distance_km?: number | null
          download_method?: string | null
          downloaded_at?: string | null
          driver_id?: string | null
          end_location?: string | null
          end_time?: string | null
          file_path?: string | null
          id?: string
          is_validated?: boolean | null
          organization_id?: string | null
          raw_data?: Json | null
          record_date?: string
          start_location?: string | null
          start_time?: string
          updated_at?: string | null
          validation_notes?: string | null
          vehicle_id?: string | null
          violations?: Json | null
        }
        Relationships: [
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
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          break_end_time: string | null
          break_hours: number | null
          break_start_time: string | null
          clock_in_time: string | null
          clock_out_time: string | null
          created_at: string | null
          driver_id: string
          driving_hours: number | null
          entry_date: string
          entry_type: string | null
          id: string
          location_clock_in: string | null
          location_clock_out: string | null
          notes: string | null
          organization_id: string | null
          status: string | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          break_end_time?: string | null
          break_hours?: number | null
          break_start_time?: string | null
          clock_in_time?: string | null
          clock_out_time?: string | null
          created_at?: string | null
          driver_id: string
          driving_hours?: number | null
          entry_date?: string
          entry_type?: string | null
          id?: string
          location_clock_in?: string | null
          location_clock_out?: string | null
          notes?: string | null
          organization_id?: string | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          break_end_time?: string | null
          break_hours?: number | null
          break_start_time?: string | null
          clock_in_time?: string | null
          clock_out_time?: string | null
          created_at?: string | null
          driver_id?: string
          driving_hours?: number | null
          entry_date?: string
          entry_type?: string | null
          id?: string
          location_clock_in?: string | null
          location_clock_out?: string | null
          notes?: string | null
          organization_id?: string | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off_requests: {
        Row: {
          created_at: string | null
          driver_id: string
          end_date: string
          id: string
          notes: string | null
          organization_id: string | null
          reason: string
          request_type: string
          requested_at: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          total_days: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          end_date: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          reason: string
          request_type: string
          requested_at?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          total_days?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          end_date?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          reason?: string
          request_type?: string
          requested_at?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          total_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_off_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tire_inventory: {
        Row: {
          condition: string | null
          cost_per_tire: number | null
          created_at: string | null
          expiry_date: string | null
          id: string
          location: string | null
          minimum_quantity: number | null
          notes: string | null
          organization_id: string
          purchase_date: string | null
          quantity: number
          serial_number: string | null
          supplier: string | null
          tire_brand: string
          tire_model: string
          tire_size: string
          updated_at: string | null
        }
        Insert: {
          condition?: string | null
          cost_per_tire?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          location?: string | null
          minimum_quantity?: number | null
          notes?: string | null
          organization_id: string
          purchase_date?: string | null
          quantity?: number
          serial_number?: string | null
          supplier?: string | null
          tire_brand: string
          tire_model: string
          tire_size: string
          updated_at?: string | null
        }
        Update: {
          condition?: string | null
          cost_per_tire?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          location?: string | null
          minimum_quantity?: number | null
          notes?: string | null
          organization_id?: string
          purchase_date?: string | null
          quantity?: number
          serial_number?: string | null
          supplier?: string | null
          tire_brand?: string
          tire_model?: string
          tire_size?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tire_inventory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_completions: {
        Row: {
          certificate_url: string | null
          completion_date: string | null
          created_at: string | null
          driver_id: string
          due_date: string | null
          id: string
          max_score: number | null
          notes: string | null
          organization_id: string
          progress: number | null
          score: number | null
          status: string
          training_name: string
          training_type: string
          updated_at: string | null
        }
        Insert: {
          certificate_url?: string | null
          completion_date?: string | null
          created_at?: string | null
          driver_id: string
          due_date?: string | null
          id?: string
          max_score?: number | null
          notes?: string | null
          organization_id: string
          progress?: number | null
          score?: number | null
          status?: string
          training_name: string
          training_type: string
          updated_at?: string | null
        }
        Update: {
          certificate_url?: string | null
          completion_date?: string | null
          created_at?: string | null
          driver_id?: string
          due_date?: string | null
          id?: string
          max_score?: number | null
          notes?: string | null
          organization_id?: string
          progress?: number | null
          score?: number | null
          status?: string
          training_name?: string
          training_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_completions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_completions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      user_agreement_acceptances: {
        Row: {
          accepted_at: string
          agreement_id: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          agreement_id: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          agreement_id?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_agreement_acceptances_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "user_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_agreement_acceptances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_agreements: {
        Row: {
          agreement_type: string
          content: string
          created_at: string | null
          created_by: string | null
          effective_date: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
          version: string
        }
        Insert: {
          agreement_type: string
          content: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
          version: string
        }
        Update: {
          agreement_type?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_agreements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_check_answers: {
        Row: {
          answer_notes: string | null
          answer_value: string
          created_at: string | null
          gps_location: Json | null
          id: string
          is_correct: boolean | null
          question_id: string
          session_id: string
          timestamp: string | null
        }
        Insert: {
          answer_notes?: string | null
          answer_value: string
          created_at?: string | null
          gps_location?: Json | null
          id?: string
          is_correct?: boolean | null
          question_id: string
          session_id: string
          timestamp?: string | null
        }
        Update: {
          answer_notes?: string | null
          answer_value?: string
          created_at?: string | null
          gps_location?: Json | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
          session_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_check_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "vehicle_check_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_check_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "vehicle_check_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_check_gps_points: {
        Row: {
          accuracy_meters: number | null
          altitude_meters: number | null
          created_at: string | null
          heading_degrees: number | null
          id: string
          latitude: number
          longitude: number
          session_id: string
          speed_kmh: number | null
          timestamp: string | null
        }
        Insert: {
          accuracy_meters?: number | null
          altitude_meters?: number | null
          created_at?: string | null
          heading_degrees?: number | null
          id?: string
          latitude: number
          longitude: number
          session_id: string
          speed_kmh?: number | null
          timestamp?: string | null
        }
        Update: {
          accuracy_meters?: number | null
          altitude_meters?: number | null
          created_at?: string | null
          heading_degrees?: number | null
          id?: string
          latitude?: number
          longitude?: number
          session_id?: string
          speed_kmh?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_check_gps_points_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "vehicle_check_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_check_items: {
        Row: {
          acceptable_values: string | null
          category: string
          check_method: string | null
          created_at: string | null
          description: string | null
          failure_criteria: string | null
          frequency_days: number | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          item_name: string
          organization_id: string | null
          points_value: number | null
          regulatory_reference: string | null
          remedial_action: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          acceptable_values?: string | null
          category: string
          check_method?: string | null
          created_at?: string | null
          description?: string | null
          failure_criteria?: string | null
          frequency_days?: number | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          item_name: string
          organization_id?: string | null
          points_value?: number | null
          regulatory_reference?: string | null
          remedial_action?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          acceptable_values?: string | null
          category?: string
          check_method?: string | null
          created_at?: string | null
          description?: string | null
          failure_criteria?: string | null
          frequency_days?: number | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          item_name?: string
          organization_id?: string | null
          points_value?: number | null
          regulatory_reference?: string | null
          remedial_action?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_check_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_check_questions: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_critical: boolean | null
          is_required: boolean | null
          options: Json | null
          order_index: number
          question_text: string
          question_type: string
          template_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_critical?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          order_index: number
          question_text: string
          question_type?: string
          template_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_critical?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: string
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_check_questions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "vehicle_check_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_check_sessions: {
        Row: {
          check_date: string
          check_time: string
          created_at: string | null
          driver_id: string
          driver_signature_data: string | null
          driver_signature_timestamp: string | null
          end_timestamp: string | null
          failed_questions: number | null
          gps_tracking_data: Json | null
          id: string
          notes: string | null
          organization_id: string
          overall_result: string | null
          passed_questions: number | null
          reference_number: string
          start_timestamp: string | null
          status: string
          template_id: string
          total_questions: number | null
          updated_at: string | null
          vehicle_id: string
          vehicle_mileage: number | null
          vehicle_registration_photo_url: string | null
        }
        Insert: {
          check_date?: string
          check_time?: string
          created_at?: string | null
          driver_id: string
          driver_signature_data?: string | null
          driver_signature_timestamp?: string | null
          end_timestamp?: string | null
          failed_questions?: number | null
          gps_tracking_data?: Json | null
          id?: string
          notes?: string | null
          organization_id: string
          overall_result?: string | null
          passed_questions?: number | null
          reference_number: string
          start_timestamp?: string | null
          status?: string
          template_id: string
          total_questions?: number | null
          updated_at?: string | null
          vehicle_id: string
          vehicle_mileage?: number | null
          vehicle_registration_photo_url?: string | null
        }
        Update: {
          check_date?: string
          check_time?: string
          created_at?: string | null
          driver_id?: string
          driver_signature_data?: string | null
          driver_signature_timestamp?: string | null
          end_timestamp?: string | null
          failed_questions?: number | null
          gps_tracking_data?: Json | null
          id?: string
          notes?: string | null
          organization_id?: string
          overall_result?: string | null
          passed_questions?: number | null
          reference_number?: string
          start_timestamp?: string | null
          status?: string
          template_id?: string
          total_questions?: number | null
          updated_at?: string | null
          vehicle_id?: string
          vehicle_mileage?: number | null
          vehicle_registration_photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_check_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_check_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "vehicle_check_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_check_sessions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_check_templates: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_check_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_checks: {
        Row: {
          attachments: Json | null
          check_date: string | null
          check_type: string
          completed_at: string | null
          compliance_review_notes: string | null
          compliance_review_status: string | null
          compliance_status: string | null
          created_at: string | null
          critical_issues: number | null
          defects_found: number | null
          driver_id: string | null
          fuel_level: number | null
          id: string
          inspector_id: string | null
          issues_found: string[] | null
          location: string | null
          metadata: Json | null
          next_check_due: string | null
          notes: string | null
          odometer_reading: number | null
          organization_id: string | null
          overall_condition: string | null
          pass_fail: boolean | null
          scheduled_date: string | null
          score: number | null
          started_at: string | null
          status: string | null
          temperature_celsius: number | null
          updated_at: string | null
          vehicle_id: string | null
          weather_conditions: string | null
        }
        Insert: {
          attachments?: Json | null
          check_date?: string | null
          check_type: string
          completed_at?: string | null
          compliance_review_notes?: string | null
          compliance_review_status?: string | null
          compliance_status?: string | null
          created_at?: string | null
          critical_issues?: number | null
          defects_found?: number | null
          driver_id?: string | null
          fuel_level?: number | null
          id?: string
          inspector_id?: string | null
          issues_found?: string[] | null
          location?: string | null
          metadata?: Json | null
          next_check_due?: string | null
          notes?: string | null
          odometer_reading?: number | null
          organization_id?: string | null
          overall_condition?: string | null
          pass_fail?: boolean | null
          scheduled_date?: string | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          temperature_celsius?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          weather_conditions?: string | null
        }
        Update: {
          attachments?: Json | null
          check_date?: string | null
          check_type?: string
          completed_at?: string | null
          compliance_review_notes?: string | null
          compliance_review_status?: string | null
          compliance_status?: string | null
          created_at?: string | null
          critical_issues?: number | null
          defects_found?: number | null
          driver_id?: string | null
          fuel_level?: number | null
          id?: string
          inspector_id?: string | null
          issues_found?: string[] | null
          location?: string | null
          metadata?: Json | null
          next_check_due?: string | null
          notes?: string | null
          odometer_reading?: number | null
          organization_id?: string | null
          overall_condition?: string | null
          pass_fail?: boolean | null
          scheduled_date?: string | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          temperature_celsius?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          weather_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_checks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          created_at: string | null
          defects_details: Json | null
          defects_found: boolean | null
          driver_id: string | null
          end_time: string | null
          id: string
          inspection_category: string
          inspection_date: string | null
          inspection_type: string
          location_data: Json | null
          next_inspection_date: string | null
          notes: string | null
          organization_id: string | null
          overall_status: string | null
          schedule_id: string | null
          signature_data: string | null
          start_time: string | null
          updated_at: string | null
          vehicle_id: string | null
          walkaround_data: Json | null
        }
        Insert: {
          created_at?: string | null
          defects_details?: Json | null
          defects_found?: boolean | null
          driver_id?: string | null
          end_time?: string | null
          id?: string
          inspection_category: string
          inspection_date?: string | null
          inspection_type: string
          location_data?: Json | null
          next_inspection_date?: string | null
          notes?: string | null
          organization_id?: string | null
          overall_status?: string | null
          schedule_id?: string | null
          signature_data?: string | null
          start_time?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          walkaround_data?: Json | null
        }
        Update: {
          created_at?: string | null
          defects_details?: Json | null
          defects_found?: boolean | null
          driver_id?: string | null
          end_time?: string | null
          id?: string
          inspection_category?: string
          inspection_date?: string | null
          inspection_type?: string
          location_data?: Json | null
          next_inspection_date?: string | null
          notes?: string | null
          organization_id?: string | null
          overall_status?: string | null
          schedule_id?: string | null
          signature_data?: string | null
          start_time?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          walkaround_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_driver_id_fkey"
            columns: ["driver_id"]
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
            foreignKeyName: "vehicle_inspections_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "inspection_schedules"
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
      vehicle_tires: {
        Row: {
          created_at: string | null
          id: string
          installation_date: string | null
          is_active: boolean | null
          last_rotation_date: string | null
          notes: string | null
          organization_id: string
          pressure_psi: number | null
          serial_number: string | null
          tire_brand: string | null
          tire_model: string | null
          tire_position: string
          tire_size: string | null
          tread_depth: number | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          installation_date?: string | null
          is_active?: boolean | null
          last_rotation_date?: string | null
          notes?: string | null
          organization_id: string
          pressure_psi?: number | null
          serial_number?: string | null
          tire_brand?: string | null
          tire_model?: string | null
          tire_position: string
          tire_size?: string | null
          tread_depth?: number | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          installation_date?: string | null
          is_active?: boolean | null
          last_rotation_date?: string | null
          notes?: string | null
          organization_id?: string
          pressure_psi?: number | null
          serial_number?: string | null
          tire_brand?: string | null
          tire_model?: string | null
          tire_position?: string
          tire_size?: string | null
          tread_depth?: number | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_tires_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_tires_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          fuel_level: number | null
          id: string
          last_maintenance_date: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          next_maintenance_date: string | null
          organization_id: string | null
          status: string | null
          updated_at: string
          vehicle_number: string
          vehicle_type: string | null
          year: number | null
        }
        Insert: {
          created_at?: string
          fuel_level?: number | null
          id?: string
          last_maintenance_date?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          next_maintenance_date?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string
          vehicle_number: string
          vehicle_type?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string
          fuel_level?: number | null
          id?: string
          last_maintenance_date?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          next_maintenance_date?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string
          vehicle_number?: string
          vehicle_type?: string | null
          year?: number | null
        }
        Relationships: []
      }
      weekly_rest: {
        Row: {
          compensation_date: string | null
          compensation_required: boolean | null
          created_at: string | null
          driver_id: string
          id: string
          notes: string | null
          organization_id: string | null
          rest_end_time: string | null
          rest_start_time: string | null
          rest_type: string | null
          total_rest_hours: number | null
          updated_at: string | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          compensation_date?: string | null
          compensation_required?: boolean | null
          created_at?: string | null
          driver_id: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          rest_end_time?: string | null
          rest_start_time?: string | null
          rest_type?: string | null
          total_rest_hours?: number | null
          updated_at?: string | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          compensation_date?: string | null
          compensation_required?: boolean | null
          created_at?: string | null
          driver_id?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          rest_end_time?: string | null
          rest_start_time?: string | null
          rest_type?: string | null
          total_rest_hours?: number | null
          updated_at?: string | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_rest_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_stages: {
        Row: {
          completed_at: string | null
          created_at: string | null
          defect_id: string
          id: string
          mechanic_id: string | null
          notes: string | null
          stage_name: string
          stage_order: number
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          defect_id: string
          id?: string
          mechanic_id?: string | null
          notes?: string | null
          stage_name: string
          stage_order: number
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          defect_id?: string
          id?: string
          mechanic_id?: string | null
          notes?: string | null
          stage_name?: string
          stage_order?: number
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_order_stages_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          actual_hours: number | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          mechanic_id: string | null
          priority: string | null
          started_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          vehicle_id: string | null
          work_order_number: string
        }
        Insert: {
          actual_hours?: number | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          mechanic_id?: string | null
          priority?: string | null
          started_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vehicle_id?: string | null
          work_order_number: string
        }
        Update: {
          actual_hours?: number | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          mechanic_id?: string | null
          priority?: string | null
          started_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vehicle_id?: string | null
          work_order_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_mechanic_id_fkey"
            columns: ["mechanic_id"]
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
      workflow_template_stages: {
        Row: {
          created_at: string | null
          estimated_duration_minutes: number | null
          id: string
          is_required: boolean | null
          requires_approval: boolean | null
          stage_description: string | null
          stage_name: string
          stage_order: number
          template_id: string
        }
        Insert: {
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_required?: boolean | null
          requires_approval?: boolean | null
          stage_description?: string | null
          stage_name: string
          stage_order: number
          template_id: string
        }
        Update: {
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_required?: boolean | null
          requires_approval?: boolean | null
          stage_description?: string | null
          stage_name?: string
          stage_order?: number
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_template_stages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          defect_type: string
          description: string | null
          id: string
          is_active: boolean | null
          template_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          defect_type: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          template_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          defect_type?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          template_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analyze_weekly_rest_compliance: {
        Args: { p_driver_id: string; p_week_start_date: string }
        Returns: {
          compensation_required: boolean
          rest_compliance: boolean
          rest_type: string
          total_rest_hours: number
          total_work_hours: number
          violations: string[]
          warnings: string[]
          week_end_date: string
          week_start_date: string
          weekly_rest_hours: number
        }[]
      }
      audit_auth_profile_sync: {
        Args: Record<PropertyKey, never>
        Returns: {
          has_auth_user: boolean
          profile_email: string
          profile_id: string
          recommended_action: string
          sync_status: string
        }[]
      }
      auto_record_rest_days: {
        Args: { p_driver_id: string; p_end_date: string; p_start_date: string }
        Returns: {
          days_processed: number
          existing_rest_days: number
          rest_days_created: number
          worked_days: number
        }[]
      }
      auto_record_weekly_rest: {
        Args: { p_driver_id: string; p_week_start_date: string }
        Returns: {
          compensation_required: boolean
          rest_type: string
          total_rest_hours: number
          week_processed: string
          weekly_rest_created: boolean
        }[]
      }
      calculate_vehicle_check_result: {
        Args: { session_uuid: string }
        Returns: string
      }
      check_approval_needed: {
        Args: {
          p_organization_id: string
          p_part_id: string
          p_quantity: number
          p_request_type: string
        }
        Returns: boolean
      }
      check_auth_rate_limit: {
        Args: {
          max_attempts?: number
          user_identifier: string
          window_minutes?: number
        }
        Returns: boolean
      }
      check_organization_rate_limit: {
        Args: {
          max_attempts?: number
          operation_type: string
          window_minutes?: number
        }
        Returns: boolean
      }
      check_profile_exists: {
        Args: { user_id?: string }
        Returns: boolean
      }
      check_user_agreement_status: {
        Args: { user_id_param: string }
        Returns: {
          latest_privacy_version: string
          latest_terms_version: string
          needs_privacy_acceptance: boolean
          needs_terms_acceptance: boolean
        }[]
      }
      complete_work_order: {
        Args: { p_defect_id: string; p_mechanic_id: string }
        Returns: boolean
      }
      create_default_daily_pretrip_questions: {
        Args: { creator_id: string; org_id: string }
        Returns: string
      }
      create_inventory_alert: {
        Args: {
          p_alert_type: string
          p_message: string
          p_organization_id: string
          p_part_id: string
          p_severity?: string
          p_title: string
        }
        Returns: string
      }
      create_security_alert: {
        Args: { alert_type: string; details?: Json; severity?: string }
        Returns: string
      }
      end_repair_time_log: {
        Args: { p_defect_id: string; p_mechanic_id: string }
        Returns: boolean
      }
      enhanced_password_validation: {
        Args: { password: string }
        Returns: Json
      }
      expire_trials: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_auth_user_by_email: {
        Args: { target_email: string }
        Returns: {
          auth_user_id: string
          user_email: string
        }[]
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_vehicle_check_reference: {
        Args: { check_date?: string; company_prefix: string }
        Returns: string
      }
      generate_work_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_available_organizations_for_mechanic: {
        Args: { mechanic_uuid: string }
        Returns: {
          id: string
          is_active: boolean
          name: string
          slug: string
          type: string
        }[]
      }
      get_current_mechanic_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_organization_id_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_expiring_licenses: {
        Args: { org_id?: string }
        Returns: {
          background_check_expiry: string
          created_at: string
          driver_id: string
          drug_test_expiry: string
          email: string
          endorsements: string[]
          expiry_date: string
          first_name: string
          id: string
          issue_date: string
          issuing_authority: string
          last_name: string
          last_updated: string
          license_class: string
          license_number: string
          license_type: string
          medical_certificate_expiry: string
          notes: string
          organization_id: string
          organization_name: string
          phone: string
          points_balance: number
          restrictions: string[]
          status: string
          training_expiry: string
          updated_at: string
        }[]
      }
      get_latest_agreement_version: {
        Args: { agreement_type_param: string }
        Returns: string
      }
      get_license_statistics: {
        Args: { org_id?: string }
        Returns: {
          active_licenses: number
          expired_licenses: number
          expiring_soon: number
          organization_id: string
          revoked_licenses: number
          suspended_licenses: number
          total_licenses: number
        }[]
      }
      get_licenses_with_drivers: {
        Args: { org_id: string }
        Returns: {
          background_check_expiry: string
          created_at: string
          driver_email: string
          driver_id: string
          driver_name: string
          drug_test_expiry: string
          endorsements: string[]
          expiry_date: string
          id: string
          issue_date: string
          issuing_authority: string
          license_class: string
          license_number: string
          license_type: string
          medical_certificate_expiry: string
          notes: string
          organization_id: string
          points_balance: number
          restrictions: string[]
          status: string
          training_expiry: string
          updated_at: string
        }[]
      }
      get_mechanic_organization_preferences: {
        Args: { mechanic_uuid: string; org_uuid: string }
        Returns: Json
      }
      get_mechanic_organizations: {
        Args: { mechanic_uuid: string }
        Returns: {
          is_primary: boolean
          organization_id: string
          organization_name: string
          role: string
          status: string
        }[]
      }
      get_notification_statistics: {
        Args: { org_id?: string }
        Returns: {
          emergency_category_notifications: number
          emergency_notifications: number
          high_priority_notifications: number
          organization_id: string
          safety_notifications: number
          total_notifications: number
          unread_notifications: number
        }[]
      }
      get_notification_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          success_rate: number
          total_failed: number
          total_pending: number
          total_sent: number
        }[]
      }
      get_school_routes_summary: {
        Args: { org_id?: string }
        Returns: {
          assigned_driver_id: string
          assigned_vehicle_id: string
          capacity: number
          contact_email: string
          contact_person: string
          contact_phone: string
          created_at: string
          current_passengers: number
          days_of_week: string[]
          dropoff_times: string[]
          end_location: string
          grade_levels: string[]
          id: string
          name: string
          pickup_times: string[]
          route_type: string
          school_name: string
          start_location: string
          status: string
          updated_at: string
        }[]
      }
      get_unread_notification_count: {
        Args: { user_id: string }
        Returns: number
      }
      get_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_organization_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_organizations: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_primary_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_roles_in_organization: {
        Args: { org_id: string }
        Returns: string[]
      }
      get_users_needing_agreement_acceptance: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          first_name: string
          last_login: string
          last_name: string
          needs_privacy: boolean
          needs_terms: boolean
          user_id: string
        }[]
      }
      handle_duplicate_email_creation: {
        Args: {
          target_email: string
          target_profile_id: string
          temp_password?: string
        }
        Returns: Json
      }
      handle_mobile_session: {
        Args: {
          p_app_type: string
          p_device_id: string
          p_device_token?: string
          p_device_type: string
        }
        Returns: string
      }
      has_role_in_organization: {
        Args: { org_id: string; required_role: string }
        Returns: boolean
      }
      is_admin_in_any_organization: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_or_council: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin_safe: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_service_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin_safe: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_operation: {
        Args: {
          p_admin_user_id: string
          p_error_details?: string
          p_ip_address?: unknown
          p_operation_details: Json
          p_operation_type: string
          p_success: boolean
          p_target_email: string
          p_target_user_id: string
          p_user_agent?: string
        }
        Returns: string
      }
      log_mobile_auth_event: {
        Args: {
          p_action: string
          p_app_type: string
          p_device_id: string
          p_device_info?: Json
          p_error_message?: string
          p_success?: boolean
        }
        Returns: string
      }
      log_repair_time: {
        Args: {
          p_activity_type: string
          p_defect_id: string
          p_description: string
          p_mechanic_id: string
        }
        Returns: boolean
      }
      log_security_event: {
        Args:
          | {
              event_details?: Json
              event_type: string
              ip_address?: unknown
              severity?: string
              user_id?: string
            }
          | { p_details: Json; p_operation_type: string }
        Returns: undefined
      }
      log_sensitive_operation: {
        Args: {
          details?: Json
          operation_type: string
          record_id: string
          table_name: string
        }
        Returns: undefined
      }
      repair_auth_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          message: string
          profile_id: string
          status: string
        }[]
      }
      reset_user_password_admin: {
        Args: { new_temp_password?: string; target_email: string }
        Returns: {
          message: string
          success: boolean
          temp_password: string
        }[]
      }
      safe_password_change_request: {
        Args: {
          p_admin_user_id: string
          p_new_password?: string
          p_target_user_id: string
        }
        Returns: Json
      }
      sanitize_user_input: {
        Args: { input_text: string }
        Returns: string
      }
      start_work_order: {
        Args: { p_defect_id: string; p_mechanic_id: string }
        Returns: boolean
      }
      start_work_order_debug: {
        Args: { p_defect_id: string; p_mechanic_id: string }
        Returns: string
      }
      switch_mechanic_organization: {
        Args: { new_org_id: string }
        Returns: boolean
      }
      update_daily_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_mechanic_organization_preferences: {
        Args: {
          new_notification_settings?: Json
          new_preferences?: Json
          new_ui_settings?: Json
          org_uuid: string
        }
        Returns: boolean
      }
      validate_organization_access: {
        Args: { target_org_id: string }
        Returns: boolean
      }
      validate_password_complexity: {
        Args: { password: string }
        Returns: boolean
      }
      validate_session_security: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      verify_mobile_device: {
        Args: { p_app_type: string; p_device_id: string }
        Returns: boolean
      }
    }
    Enums: {
      appeal_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "withdrawn"
      document_status: "draft" | "active" | "expired" | "archived"
      email_status: "pending" | "sent" | "delivered" | "failed" | "bounced"
      infringement_severity: "minor" | "major" | "serious" | "severe"
      infringement_status:
        | "pending"
        | "active"
        | "resolved"
        | "disputed"
        | "expired"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      quotation_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      support_ticket_priority: "low" | "normal" | "high" | "urgent"
      support_ticket_status:
        | "open"
        | "in_progress"
        | "waiting_customer"
        | "resolved"
        | "closed"
      user_role:
        | "admin"
        | "driver"
        | "mechanic"
        | "parent"
        | "council"
        | "compliance_officer"
        | "super_admin"
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
  public: {
    Enums: {
      appeal_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "withdrawn",
      ],
      document_status: ["draft", "active", "expired", "archived"],
      email_status: ["pending", "sent", "delivered", "failed", "bounced"],
      infringement_severity: ["minor", "major", "serious", "severe"],
      infringement_status: [
        "pending",
        "active",
        "resolved",
        "disputed",
        "expired",
      ],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      quotation_status: ["draft", "sent", "accepted", "rejected", "expired"],
      support_ticket_priority: ["low", "normal", "high", "urgent"],
      support_ticket_status: [
        "open",
        "in_progress",
        "waiting_customer",
        "resolved",
        "closed",
      ],
      user_role: [
        "admin",
        "driver",
        "mechanic",
        "parent",
        "council",
        "compliance_officer",
        "super_admin",
      ],
    },
  },
} as const
