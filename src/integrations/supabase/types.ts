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
            foreignKeyName: "appeals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appeals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      compliance_violations: {
        Row: {
          attachments: Json | null
          automatic_detection: boolean | null
          corrective_action: string | null
          created_at: string | null
          description: string
          detected_at: string
          detection_source: string | null
          driver_id: string | null
          fine_amount: number | null
          id: string
          is_reportable: boolean | null
          location: string | null
          metadata: Json | null
          organization_id: string | null
          penalty_points: number | null
          report_reference: string | null
          reported_at: string | null
          reported_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["infringement_severity"] | null
          status: string | null
          updated_at: string | null
          vehicle_id: string | null
          violation_date: string | null
          violation_type: string
        }
        Insert: {
          attachments?: Json | null
          automatic_detection?: boolean | null
          corrective_action?: string | null
          created_at?: string | null
          description: string
          detected_at?: string
          detection_source?: string | null
          driver_id?: string | null
          fine_amount?: number | null
          id?: string
          is_reportable?: boolean | null
          location?: string | null
          metadata?: Json | null
          organization_id?: string | null
          penalty_points?: number | null
          report_reference?: string | null
          reported_at?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["infringement_severity"] | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          violation_date?: string | null
          violation_type: string
        }
        Update: {
          attachments?: Json | null
          automatic_detection?: boolean | null
          corrective_action?: string | null
          created_at?: string | null
          description?: string
          detected_at?: string
          detection_source?: string | null
          driver_id?: string | null
          fine_amount?: number | null
          id?: string
          is_reportable?: boolean | null
          location?: string | null
          metadata?: Json | null
          organization_id?: string | null
          penalty_points?: number | null
          report_reference?: string | null
          reported_at?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["infringement_severity"] | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          violation_date?: string | null
          violation_type?: string
        }
        Relationships: [
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
            foreignKeyName: "compliance_violations_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "documents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          driver_id: string | null
          effective_date: string
          expiry_date: string | null
          id: string
          infringement_id: string | null
          is_active: boolean | null
          notes: string | null
          organization_id: string | null
          points_added: number
          points_removed: number | null
          reason: string
          updated_at: string | null
        }
        Insert: {
          balance_after: number
          balance_before: number
          created_at?: string | null
          created_by?: string | null
          driver_id?: string | null
          effective_date?: string
          expiry_date?: string | null
          id?: string
          infringement_id?: string | null
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string | null
          points_added: number
          points_removed?: number | null
          reason: string
          updated_at?: string | null
        }
        Update: {
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          created_by?: string | null
          driver_id?: string | null
          effective_date?: string
          expiry_date?: string | null
          id?: string
          infringement_id?: string | null
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string | null
          points_added?: number
          points_removed?: number | null
          reason?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_points_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_points_history_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "driver_risk_scores_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_risk_scores_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_risk_scores_organization_id_fkey"
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
          updated_at?: string | null
          updated_by?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "incidents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "infringements_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "infringements_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "invoices_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          organization_id: string | null
          priority: string | null
          status: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
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
          created_at: string | null
          description: string
          id: string
          organization_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: []
      }
      mechanics: {
        Row: {
          created_at: string | null
          id: string
          mechanic_name: string
          organization_id: string | null
          profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mechanic_name: string
          organization_id?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mechanic_name?: string
          organization_id?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string | null
          billing_address: string | null
          billing_contact_email: string | null
          billing_contact_name: string | null
          billing_contact_phone: string | null
          city: string | null
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
          state: string | null
          subscription_plan: string | null
          subscription_status: string | null
          tax_number: string | null
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
          state?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tax_number?: string | null
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
          state?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tax_number?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
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
            foreignKeyName: "payroll_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_organization_id_fkey"
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
          role: string
          state: string | null
          termination_date: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          cdl_number?: string | null
          city?: string | null
          created_at?: string
          email: string
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
          role?: string
          state?: string | null
          termination_date?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          cdl_number?: string | null
          city?: string | null
          created_at?: string
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
          role?: string
          state?: string | null
          termination_date?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
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
            foreignKeyName: "quotations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      routes: {
        Row: {
          created_at: string
          distance: number | null
          end_location: string | null
          estimated_time: number | null
          id: string
          name: string | null
          organization_id: string | null
          start_location: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          distance?: number | null
          end_location?: string | null
          estimated_time?: number | null
          id?: string
          name?: string | null
          organization_id?: string | null
          start_location?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          distance?: number | null
          end_location?: string | null
          estimated_time?: number | null
          id?: string
          name?: string | null
          organization_id?: string | null
          start_location?: string | null
          status?: string | null
          updated_at?: string
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
      support_tickets: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: string | null
          created_at: string | null
          customer_feedback: string | null
          customer_satisfaction_rating: number | null
          description: string
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
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          created_at?: string | null
          customer_feedback?: string | null
          customer_satisfaction_rating?: number | null
          description: string
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
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          created_at?: string | null
          customer_feedback?: string | null
          customer_satisfaction_rating?: number | null
          description?: string
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
          updated_at?: string | null
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
            foreignKeyName: "support_tickets_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tachograph_records: {
        Row: {
          activity_type: string
          card_number: string | null
          created_at: string | null
          digital_signature: string | null
          distance_km: number | null
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
          card_number?: string | null
          created_at?: string | null
          digital_signature?: string | null
          distance_km?: number | null
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
          card_number?: string | null
          created_at?: string | null
          digital_signature?: string | null
          distance_km?: number | null
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
      vehicle_checks: {
        Row: {
          attachments: Json | null
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
            foreignKeyName: "vehicle_checks_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_checks_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      vehicles: {
        Row: {
          created_at: string
          id: string
          license_plate: string | null
          make: string | null
          model: string | null
          organization_id: string | null
          status: string | null
          updated_at: string
          vehicle_number: string
          vehicle_type: string | null
          year: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          license_plate?: string | null
          make?: string | null
          model?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string
          vehicle_number: string
          vehicle_type?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          license_plate?: string | null
          make?: string | null
          model?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string
          vehicle_number?: string
          vehicle_type?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_or_council: {
        Args: Record<PropertyKey, never>
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
    },
  },
} as const
