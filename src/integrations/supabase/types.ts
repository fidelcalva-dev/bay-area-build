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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          can_approve: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_write: boolean | null
          created_at: string
          id: string
          module: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          can_approve?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          created_at?: string
          id?: string
          module: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          can_approve?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          created_at?: string
          id?: string
          module?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      approval_requests: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          reason: string | null
          request_type: string
          requested_by: string
          requested_value: Json | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          reason?: string | null
          request_type: string
          requested_by: string
          requested_value?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          reason?: string | null
          request_type?: string
          requested_by?: string
          requested_value?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      ar_actions: {
        Row: {
          action_type: string
          channel: string | null
          created_at: string
          customer_id: string | null
          id: string
          invoice_id: string
          metadata: Json | null
          notes: string | null
          order_id: string | null
          performed_by: string | null
        }
        Insert: {
          action_type: string
          channel?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          performed_by?: string | null
        }
        Update: {
          action_type?: string
          channel?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ar_actions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_actions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_actions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      assets_dumpsters: {
        Row: {
          asset_code: string
          asset_notes: string | null
          asset_status: string
          asset_type: string
          condition: string | null
          created_at: string
          current_location_type: string
          current_order_id: string | null
          current_yard_id: string | null
          days_out: number
          deployed_at: string | null
          home_yard_id: string
          id: string
          last_inspection_at: string | null
          last_movement_at: string | null
          needs_rebalance: boolean | null
          revenue_30d: number | null
          revenue_90d: number | null
          size_id: string
          total_deployments: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          asset_code: string
          asset_notes?: string | null
          asset_status?: string
          asset_type?: string
          condition?: string | null
          created_at?: string
          current_location_type?: string
          current_order_id?: string | null
          current_yard_id?: string | null
          days_out?: number
          deployed_at?: string | null
          home_yard_id: string
          id?: string
          last_inspection_at?: string | null
          last_movement_at?: string | null
          needs_rebalance?: boolean | null
          revenue_30d?: number | null
          revenue_90d?: number | null
          size_id: string
          total_deployments?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          asset_code?: string
          asset_notes?: string | null
          asset_status?: string
          asset_type?: string
          condition?: string | null
          created_at?: string
          current_location_type?: string
          current_order_id?: string | null
          current_yard_id?: string | null
          days_out?: number
          deployed_at?: string | null
          home_yard_id?: string
          id?: string
          last_inspection_at?: string | null
          last_movement_at?: string | null
          needs_rebalance?: boolean | null
          revenue_30d?: number | null
          revenue_90d?: number | null
          size_id?: string
          total_deployments?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_dumpsters_current_order_id_fkey"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_dumpsters_current_yard_id_fkey"
            columns: ["current_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "assets_dumpsters_current_yard_id_fkey"
            columns: ["current_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_dumpsters_home_yard_id_fkey"
            columns: ["home_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "assets_dumpsters_home_yard_id_fkey"
            columns: ["home_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_dumpsters_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["size_id"]
          },
          {
            foreignKeyName: "assets_dumpsters_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "dumpster_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          after_data: Json | null
          before_data: Json | null
          changes_summary: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          after_data?: Json | null
          before_data?: Json | null
          changes_summary?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          after_data?: Json | null
          before_data?: Json | null
          changes_summary?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          alerts_created: number | null
          automation_type: string
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          notifications_sent: number | null
          recommendations_created: number | null
          triggered_by: string | null
        }
        Insert: {
          alerts_created?: number | null
          automation_type: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          notifications_sent?: number | null
          recommendations_created?: number | null
          triggered_by?: string | null
        }
        Update: {
          alerts_created?: number | null
          automation_type?: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          notifications_sent?: number | null
          recommendations_created?: number | null
          triggered_by?: string | null
        }
        Relationships: []
      }
      certified_sources: {
        Row: {
          city_or_market: string
          created_at: string
          facilities_found: number | null
          id: string
          is_active: boolean | null
          last_checked_at: string | null
          last_success_at: string | null
          market_id: string | null
          notes: string | null
          parse_status: string | null
          source_name: string
          source_type: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          city_or_market: string
          created_at?: string
          facilities_found?: number | null
          id?: string
          is_active?: boolean | null
          last_checked_at?: string | null
          last_success_at?: string | null
          market_id?: string | null
          notes?: string | null
          parse_status?: string | null
          source_name: string
          source_type: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          city_or_market?: string
          created_at?: string
          facilities_found?: number | null
          id?: string
          is_active?: boolean | null
          last_checked_at?: string | null
          last_success_at?: string | null
          market_id?: string | null
          notes?: string | null
          parse_status?: string | null
          source_name?: string
          source_type?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certified_sources_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      city_facility_rules: {
        Row: {
          city: string
          created_at: string
          default_facility_type_for_mixed: string
          facility_selection_policy: string
          id: string
          manual_review_distance_miles: number | null
          market: string | null
          notes: string | null
          requires_green_halo_for_projects: boolean
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          default_facility_type_for_mixed?: string
          facility_selection_policy?: string
          id?: string
          manual_review_distance_miles?: number | null
          market?: string | null
          notes?: string | null
          requires_green_halo_for_projects?: boolean
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          default_facility_type_for_mixed?: string
          facility_selection_policy?: string
          id?: string
          manual_review_distance_miles?: number | null
          market?: string | null
          notes?: string | null
          requires_green_halo_for_projects?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      city_rates: {
        Row: {
          city_name: string
          created_at: string
          extra_ton_rate_prepay: number | null
          extra_ton_rate_standard: number
          heavy_base_10yd: number
          id: string
          is_active: boolean
          market_id: string | null
          prepay_discount_pct: number
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          city_name: string
          created_at?: string
          extra_ton_rate_prepay?: number | null
          extra_ton_rate_standard?: number
          heavy_base_10yd?: number
          id?: string
          is_active?: boolean
          market_id?: string | null
          prepay_discount_pct?: number
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          city_name?: string
          created_at?: string
          extra_ton_rate_prepay?: number | null
          extra_ton_rate_standard?: number
          heavy_base_10yd?: number
          id?: string
          is_active?: boolean
          market_id?: string | null
          prepay_discount_pct?: number
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_rates_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_rates_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "pricing_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      config_pending_changes: {
        Row: {
          created_at: string
          current_data: Json | null
          entity_id: string | null
          entity_type: string
          expires_at: string | null
          id: string
          is_critical: boolean | null
          module: string
          proposed_by: string
          proposed_by_email: string | null
          proposed_data: Json
          reason_note: string
          review_note: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          created_at?: string
          current_data?: Json | null
          entity_id?: string | null
          entity_type: string
          expires_at?: string | null
          id?: string
          is_critical?: boolean | null
          module: string
          proposed_by: string
          proposed_by_email?: string | null
          proposed_data: Json
          reason_note: string
          review_note?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          created_at?: string
          current_data?: Json | null
          entity_id?: string | null
          entity_type?: string
          expires_at?: string | null
          id?: string
          is_critical?: boolean | null
          module?: string
          proposed_by?: string
          proposed_by_email?: string | null
          proposed_data?: Json
          reason_note?: string
          review_note?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: []
      }
      config_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_locked: boolean | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_locked?: boolean | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_locked?: boolean | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      config_versions: {
        Row: {
          after_data: Json
          applied_at: string | null
          approved_by: string | null
          approved_by_email: string | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          id: string
          is_critical: boolean | null
          module: string
          proposed_by: string | null
          proposed_by_email: string | null
          reason_note: string
          rolled_back_at: string | null
          status: string
        }
        Insert: {
          after_data: Json
          applied_at?: string | null
          approved_by?: string | null
          approved_by_email?: string | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_critical?: boolean | null
          module: string
          proposed_by?: string | null
          proposed_by_email?: string | null
          reason_note: string
          rolled_back_at?: string | null
          status?: string
        }
        Update: {
          after_data?: Json
          applied_at?: string | null
          approved_by?: string | null
          approved_by_email?: string | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_critical?: boolean | null
          module?: string
          proposed_by?: string | null
          proposed_by_email?: string | null
          reason_note?: string
          rolled_back_at?: string | null
          status?: string
        }
        Relationships: []
      }
      contract_events: {
        Row: {
          actor_id: string | null
          actor_role: string | null
          contract_id: string
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_role?: string | null
          contract_id: string
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_role?: string | null
          contract_id?: string
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_events_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_type: Database["public"]["Enums"]["contract_type"]
          contract_version: string
          created_at: string
          customer_id: string
          expires_at: string | null
          id: string
          pdf_url: string | null
          service_address: string | null
          service_address_normalized: string | null
          signature_method: string | null
          signed_at: string | null
          signed_ip: string | null
          status: Database["public"]["Enums"]["contract_status"]
          terms_content: string | null
          updated_at: string
        }
        Insert: {
          contract_type: Database["public"]["Enums"]["contract_type"]
          contract_version?: string
          created_at?: string
          customer_id: string
          expires_at?: string | null
          id?: string
          pdf_url?: string | null
          service_address?: string | null
          service_address_normalized?: string | null
          signature_method?: string | null
          signed_at?: string | null
          signed_ip?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          terms_content?: string | null
          updated_at?: string
        }
        Update: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          contract_version?: string
          created_at?: string
          customer_id?: string
          expires_at?: string | null
          id?: string
          pdf_url?: string | null
          service_address?: string | null
          service_address_normalized?: string | null
          signature_method?: string | null
          signed_at?: string | null
          signed_ip?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          terms_content?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_sessions: {
        Row: {
          created_at: string
          customer_id: string | null
          expires_at: string
          id: string
          last_active_at: string
          phone: string
          session_token: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          expires_at: string
          id?: string
          last_active_at?: string
          phone: string
          session_token: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          expires_at?: string
          id?: string
          last_active_at?: string
          phone?: string
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          billing_address: string | null
          billing_email: string | null
          billing_phone: string | null
          company_name: string | null
          created_at: string
          customer_type: string
          id: string
          is_active: boolean
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          company_name?: string | null
          created_at?: string
          customer_type?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          company_name?: string | null
          created_at?: string
          customer_type?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      disposal_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string
          requested_by: string
          requested_facility_id: string | null
          requested_facility_name_text: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          requested_by: string
          requested_facility_id?: string | null
          requested_facility_name_text?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          requested_by?: string
          requested_facility_id?: string | null
          requested_facility_name_text?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "disposal_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disposal_requests_requested_facility_id_fkey"
            columns: ["requested_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      distance_brackets: {
        Row: {
          bracket_name: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          market_id: string | null
          max_miles: number | null
          min_miles: number
          price_adjustment: number
          requires_review: boolean
        }
        Insert: {
          bracket_name: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          market_id?: string | null
          max_miles?: number | null
          min_miles?: number
          price_adjustment?: number
          requires_review?: boolean
        }
        Update: {
          bracket_name?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          market_id?: string | null
          max_miles?: number | null
          min_miles?: number
          price_adjustment?: number
          requires_review?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "distance_brackets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      distance_caps: {
        Row: {
          action: string
          bracket_name: string
          created_at: string
          id: string
          is_active: boolean
          market_id: string | null
          max_miles: number | null
          message: string | null
          min_miles: number
          surcharge_amount: number | null
        }
        Insert: {
          action?: string
          bracket_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          market_id?: string | null
          max_miles?: number | null
          message?: string | null
          min_miles?: number
          surcharge_amount?: number | null
        }
        Update: {
          action?: string
          bracket_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          market_id?: string | null
          max_miles?: number | null
          message?: string | null
          min_miles?: number
          surcharge_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "distance_caps_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          doc_type: string
          file_name: string | null
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          notes: string | null
          order_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          doc_type: string
          file_name?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          order_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          order_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_facility_preferences: {
        Row: {
          created_at: string
          driver_id: string
          facility_id: string
          id: string
          is_default: boolean | null
          market: string
          notes: string | null
          rank: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          facility_id: string
          id?: string
          is_default?: boolean | null
          market: string
          notes?: string | null
          rank?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          facility_id?: string
          id?: string
          is_default?: boolean | null
          market?: string
          notes?: string | null
          rank?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_facility_preferences_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_facility_preferences_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_payouts: {
        Row: {
          base_payout: number
          bonus: number | null
          created_at: string
          driver_id: string
          id: string
          job_type: string
          mileage_payout: number | null
          notes: string | null
          order_id: string
          paid_at: string | null
          status: string
          total_payout: number | null
        }
        Insert: {
          base_payout?: number
          bonus?: number | null
          created_at?: string
          driver_id: string
          id?: string
          job_type: string
          mileage_payout?: number | null
          notes?: string | null
          order_id: string
          paid_at?: string | null
          status?: string
          total_payout?: number | null
        }
        Update: {
          base_payout?: number
          bonus?: number | null
          created_at?: string
          driver_id?: string
          id?: string
          job_type?: string
          mileage_payout?: number | null
          notes?: string | null
          order_id?: string
          paid_at?: string | null
          status?: string
          total_payout?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_payouts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          assigned_yard_id: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          is_owner_operator: boolean
          license_number: string | null
          name: string
          payout_rate_per_job: number | null
          payout_rate_per_mile: number | null
          phone: string
          truck_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_yard_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_owner_operator?: boolean
          license_number?: string | null
          name: string
          payout_rate_per_job?: number | null
          payout_rate_per_mile?: number | null
          phone: string
          truck_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_yard_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_owner_operator?: boolean
          license_number?: string | null
          name?: string
          payout_rate_per_job?: number | null
          payout_rate_per_mile?: number | null
          phone?: string
          truck_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_assigned_yard_id_fkey"
            columns: ["assigned_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "drivers_assigned_yard_id_fkey"
            columns: ["assigned_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
        ]
      }
      dumpster_sizes: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          dimensions: string | null
          display_order: number
          id: string
          included_tons: number
          is_active: boolean
          is_heavy_only: boolean
          label: string
          size_value: number
          updated_at: string
        }
        Insert: {
          base_price: number
          created_at?: string
          description?: string | null
          dimensions?: string | null
          display_order?: number
          id?: string
          included_tons: number
          is_active?: boolean
          is_heavy_only?: boolean
          label: string
          size_value: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          dimensions?: string | null
          display_order?: number
          id?: string
          included_tons?: number
          is_active?: boolean
          is_heavy_only?: boolean
          label?: string
          size_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          accepted_material_classes: string[]
          address: string
          approved_by_city: string[]
          certification_city: string | null
          certification_type: string | null
          city: string
          compliance_notes: string | null
          created_at: string
          facility_type: string
          green_halo_certified: boolean
          green_halo_related: boolean | null
          hours: string | null
          id: string
          lat: number | null
          lng: number | null
          market: string | null
          market_id: string | null
          name: string
          notes: string | null
          phone: string | null
          source_id: string | null
          source_url: string | null
          state: string
          status: string
          updated_at: string
          zip: string
        }
        Insert: {
          accepted_material_classes?: string[]
          address: string
          approved_by_city?: string[]
          certification_city?: string | null
          certification_type?: string | null
          city: string
          compliance_notes?: string | null
          created_at?: string
          facility_type: string
          green_halo_certified?: boolean
          green_halo_related?: boolean | null
          hours?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          market?: string | null
          market_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source_id?: string | null
          source_url?: string | null
          state?: string
          status?: string
          updated_at?: string
          zip: string
        }
        Update: {
          accepted_material_classes?: string[]
          address?: string
          approved_by_city?: string[]
          certification_city?: string | null
          certification_type?: string | null
          city?: string
          compliance_notes?: string | null
          created_at?: string
          facility_type?: string
          green_halo_certified?: boolean
          green_halo_related?: boolean | null
          hours?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          market?: string | null
          market_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source_id?: string | null
          source_url?: string | null
          state?: string
          status?: string
          updated_at?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "facilities_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facilities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "certified_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_recommendations: {
        Row: {
          city_or_market: string | null
          compliance_guidance: string | null
          compliance_required: boolean | null
          created_at: string
          id: string
          market_id: string | null
          order_id: string
          project_type: string
          recommended_facilities: Json
          recommended_reason: string | null
          selected_facility_id: string | null
          selection_method: string | null
          updated_at: string
        }
        Insert: {
          city_or_market?: string | null
          compliance_guidance?: string | null
          compliance_required?: boolean | null
          created_at?: string
          id?: string
          market_id?: string | null
          order_id: string
          project_type?: string
          recommended_facilities?: Json
          recommended_reason?: string | null
          selected_facility_id?: string | null
          selection_method?: string | null
          updated_at?: string
        }
        Update: {
          city_or_market?: string | null
          compliance_guidance?: string | null
          compliance_required?: boolean | null
          created_at?: string
          id?: string
          market_id?: string | null
          order_id?: string
          project_type?: string
          recommended_facilities?: Json
          recommended_reason?: string | null
          selected_facility_id?: string | null
          selection_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_recommendations_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_recommendations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_recommendations_selected_facility_id_fkey"
            columns: ["selected_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_actions: {
        Row: {
          action_type: string
          created_at: string
          flag_id: string
          id: string
          metadata: Json | null
          notes: string | null
          performed_by: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          flag_id: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          performed_by?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          flag_id?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_actions_flag_id_fkey"
            columns: ["flag_id"]
            isOneToOne: false
            referencedRelation: "fraud_flags"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_flags: {
        Row: {
          created_at: string
          customer_id: string | null
          evidence_json: Json | null
          flag_type: string
          id: string
          is_whitelisted: boolean | null
          order_id: string | null
          phone: string | null
          quote_id: string | null
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          resolved_notes: string | null
          risk_level: string | null
          risk_score: number | null
          severity: string
          status: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          evidence_json?: Json | null
          flag_type: string
          id?: string
          is_whitelisted?: boolean | null
          order_id?: string | null
          phone?: string | null
          quote_id?: string | null
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_notes?: string | null
          risk_level?: string | null
          risk_score?: number | null
          severity: string
          status?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          evidence_json?: Json | null
          flag_type?: string
          id?: string
          is_whitelisted?: boolean | null
          order_id?: string | null
          phone?: string | null
          quote_id?: string | null
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_notes?: string | null
          risk_level?: string | null
          risk_score?: number | null
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fraud_flags_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_flags_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_flags_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      heavy_material_rules: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          increment_amount: number
          is_active: boolean
          material_class: string
          material_list: string[]
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          increment_amount?: number
          is_active?: boolean
          material_class: string
          material_list?: string[]
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          increment_amount?: number
          is_active?: boolean
          material_class?: string
          material_list?: string[]
        }
        Relationships: []
      }
      inventory: {
        Row: {
          available_count: number
          created_at: string
          id: string
          in_use_count: number
          low_stock_threshold: number
          maintenance_count: number
          reserved_count: number
          size_id: string
          total_count: number
          updated_at: string
          yard_id: string
        }
        Insert: {
          available_count?: number
          created_at?: string
          id?: string
          in_use_count?: number
          low_stock_threshold?: number
          maintenance_count?: number
          reserved_count?: number
          size_id: string
          total_count?: number
          updated_at?: string
          yard_id: string
        }
        Update: {
          available_count?: number
          created_at?: string
          id?: string
          in_use_count?: number
          low_stock_threshold?: number
          maintenance_count?: number
          reserved_count?: number
          size_id?: string
          total_count?: number
          updated_at?: string
          yard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["size_id"]
          },
          {
            foreignKeyName: "inventory_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "dumpster_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "inventory_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          asset_id: string | null
          created_at: string
          created_by: string | null
          driver_id: string | null
          from_location_type: string | null
          from_yard_id: string | null
          id: string
          inventory_id: string
          movement_type: string
          notes: string | null
          order_id: string | null
          quantity: number
          to_location_type: string | null
          to_yard_id: string | null
          truck_id: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          created_by?: string | null
          driver_id?: string | null
          from_location_type?: string | null
          from_yard_id?: string | null
          id?: string
          inventory_id: string
          movement_type: string
          notes?: string | null
          order_id?: string | null
          quantity?: number
          to_location_type?: string | null
          to_yard_id?: string | null
          truck_id?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          created_by?: string | null
          driver_id?: string | null
          from_location_type?: string | null
          from_yard_id?: string | null
          id?: string
          inventory_id?: string
          movement_type?: string
          notes?: string | null
          order_id?: string | null
          quantity?: number
          to_location_type?: string | null
          to_yard_id?: string | null
          truck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_type: string
          metadata: Json | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_type: string
          metadata?: Json | null
          order_id: string
          quantity?: number
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_type?: string
          metadata?: Json | null
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_due: number
          amount_paid: number
          balance_due: number
          collections_flagged: boolean | null
          created_at: string
          customer_id: string | null
          dispute_reason: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          notes: string | null
          order_id: string
          payment_status: string
          updated_at: string
        }
        Insert: {
          amount_due?: number
          amount_paid?: number
          balance_due?: number
          collections_flagged?: boolean | null
          created_at?: string
          customer_id?: string | null
          dispute_reason?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          notes?: string | null
          order_id: string
          payment_status?: string
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          balance_due?: number
          collections_flagged?: boolean | null
          created_at?: string
          customer_id?: string | null
          dispute_reason?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          notes?: string | null
          order_id?: string
          payment_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_snapshots: {
        Row: {
          actual_value: number
          created_at: string
          id: string
          kpi_key: string
          metadata: Json | null
          snapshot_date: string
          status: string | null
          target_value: number | null
        }
        Insert: {
          actual_value: number
          created_at?: string
          id?: string
          kpi_key: string
          metadata?: Json | null
          snapshot_date: string
          status?: string | null
          target_value?: number | null
        }
        Update: {
          actual_value?: number
          created_at?: string
          id?: string
          kpi_key?: string
          metadata?: Json | null
          snapshot_date?: string
          status?: string | null
          target_value?: number | null
        }
        Relationships: []
      }
      kpi_targets: {
        Row: {
          created_at: string
          higher_is_better: boolean | null
          id: string
          kpi_category: string
          kpi_key: string
          kpi_name: string
          target_value: number
          unit: string | null
          updated_at: string
          warning_threshold: number | null
        }
        Insert: {
          created_at?: string
          higher_is_better?: boolean | null
          id?: string
          kpi_category: string
          kpi_key: string
          kpi_name: string
          target_value: number
          unit?: string | null
          updated_at?: string
          warning_threshold?: number | null
        }
        Update: {
          created_at?: string
          higher_is_better?: boolean | null
          id?: string
          kpi_category?: string
          kpi_key?: string
          kpi_name?: string
          target_value?: number
          unit?: string | null
          updated_at?: string
          warning_threshold?: number | null
        }
        Relationships: []
      }
      lead_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_type: string
          from_assignment_type: string | null
          id: string
          lead_id: string
          notes: string | null
          to_assignment_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_type: string
          from_assignment_type?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          to_assignment_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_type?: string
          from_assignment_type?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          to_assignment_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      logistics_events: {
        Row: {
          actor_id: string | null
          actor_role: string | null
          created_at: string
          event_type: string
          filled_location: string | null
          from_status: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          logistics_type: string
          metadata: Json | null
          notes: string | null
          order_id: string
          photo_url: string | null
          to_status: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_type: string
          filled_location?: string | null
          from_status?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          logistics_type: string
          metadata?: Json | null
          notes?: string | null
          order_id: string
          photo_url?: string | null
          to_status?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_type?: string
          filled_location?: string | null
          from_status?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          logistics_type?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string
          photo_url?: string | null
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logistics_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      logistics_pricing: {
        Row: {
          base_fee: number | null
          created_at: string
          description: string | null
          dry_run_fee: number | null
          id: string
          included_minutes: number | null
          is_active: boolean | null
          logistics_type: string
          per_minute_fee: number | null
          updated_at: string
        }
        Insert: {
          base_fee?: number | null
          created_at?: string
          description?: string | null
          dry_run_fee?: number | null
          id?: string
          included_minutes?: number | null
          is_active?: boolean | null
          logistics_type: string
          per_minute_fee?: number | null
          updated_at?: string
        }
        Update: {
          base_fee?: number | null
          created_at?: string
          description?: string | null
          dry_run_fee?: number | null
          id?: string
          included_minutes?: number | null
          is_active?: boolean | null
          logistics_type?: string
          per_minute_fee?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      market_rates: {
        Row: {
          created_at: string
          extra_ton_rate_prepay: number | null
          extra_ton_rate_standard: number
          heavy_base_10yd: number
          id: string
          is_active: boolean
          market_id: string
          mixed_small_overage_rate: number | null
          notes: string | null
          prepay_discount_pct: number
          rental_day_10_factor: number | null
          rental_day_14_factor: number | null
          rental_day_3_factor: number | null
          rental_day_30_factor: number | null
          rental_day_7_factor: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          extra_ton_rate_prepay?: number | null
          extra_ton_rate_standard?: number
          heavy_base_10yd?: number
          id?: string
          is_active?: boolean
          market_id: string
          mixed_small_overage_rate?: number | null
          notes?: string | null
          prepay_discount_pct?: number
          rental_day_10_factor?: number | null
          rental_day_14_factor?: number | null
          rental_day_3_factor?: number | null
          rental_day_30_factor?: number | null
          rental_day_7_factor?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          extra_ton_rate_prepay?: number | null
          extra_ton_rate_standard?: number
          heavy_base_10yd?: number
          id?: string
          is_active?: boolean
          market_id?: string
          mixed_small_overage_rate?: number | null
          notes?: string | null
          prepay_discount_pct?: number
          rental_day_10_factor?: number | null
          rental_day_14_factor?: number | null
          rental_day_3_factor?: number | null
          rental_day_30_factor?: number | null
          rental_day_7_factor?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_rates_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: true
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          created_at: string
          default_yard_id: string | null
          id: string
          name: string
          notes: string | null
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_yard_id?: string | null
          id: string
          name: string
          notes?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_yard_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "markets_default_yard_id_fkey"
            columns: ["default_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "markets_default_yard_id_fkey"
            columns: ["default_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
        ]
      }
      material_types: {
        Row: {
          allowed_sizes: number[]
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          label: string
          price_adjustment: number
          updated_at: string
          value: string
        }
        Insert: {
          allowed_sizes?: number[]
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          label: string
          price_adjustment?: number
          updated_at?: string
          value: string
        }
        Update: {
          allowed_sizes?: number[]
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          label?: string
          price_adjustment?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      message_history: {
        Row: {
          channel: string
          created_at: string
          customer_id: string | null
          customer_phone: string | null
          direction: string
          external_id: string | null
          id: string
          message_body: string
          order_id: string | null
          sent_by: string | null
          status: string
          template_key: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          customer_id?: string | null
          customer_phone?: string | null
          direction: string
          external_id?: string | null
          id?: string
          message_body: string
          order_id?: string | null
          sent_by?: string | null
          status?: string
          template_key?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          customer_id?: string | null
          customer_phone?: string | null
          direction?: string
          external_id?: string | null
          id?: string
          message_body?: string
          order_id?: string | null
          sent_by?: string | null
          status?: string
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          customer_id: string
          email_marketing: boolean | null
          email_orders: boolean | null
          email_quotes: boolean | null
          email_receipts: boolean | null
          id: string
          sms_marketing: boolean | null
          sms_orders: boolean | null
          sms_reminders: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          email_marketing?: boolean | null
          email_orders?: boolean | null
          email_quotes?: boolean | null
          email_receipts?: boolean | null
          id?: string
          sms_marketing?: boolean | null
          sms_orders?: boolean | null
          sms_reminders?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          email_marketing?: boolean | null
          email_orders?: boolean | null
          email_quotes?: boolean | null
          email_receipts?: boolean | null
          id?: string
          sms_marketing?: boolean | null
          sms_orders?: boolean | null
          sms_reminders?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_disposal_plans: {
        Row: {
          created_at: string
          dump_fee_at_cost: boolean | null
          facility_selection_mode: string | null
          green_halo_required: boolean
          handling_fee_possible: boolean | null
          id: string
          market: string | null
          material_classification: string
          notes: string | null
          order_id: string
          request_reason: string | null
          requested_by: string | null
          required_facility_type: string
          route_miles_to_facility: number | null
          route_minutes_to_facility: number | null
          route_polyline: string | null
          selected_facility_id: string | null
          selection_method: string | null
          suggested_facilities: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          dump_fee_at_cost?: boolean | null
          facility_selection_mode?: string | null
          green_halo_required?: boolean
          handling_fee_possible?: boolean | null
          id?: string
          market?: string | null
          material_classification: string
          notes?: string | null
          order_id: string
          request_reason?: string | null
          requested_by?: string | null
          required_facility_type: string
          route_miles_to_facility?: number | null
          route_minutes_to_facility?: number | null
          route_polyline?: string | null
          selected_facility_id?: string | null
          selection_method?: string | null
          suggested_facilities?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          dump_fee_at_cost?: boolean | null
          facility_selection_mode?: string | null
          green_halo_required?: boolean
          handling_fee_possible?: boolean | null
          id?: string
          market?: string | null
          material_classification?: string
          notes?: string | null
          order_id?: string
          request_reason?: string | null
          requested_by?: string | null
          required_facility_type?: string
          route_miles_to_facility?: number | null
          route_minutes_to_facility?: number | null
          route_polyline?: string | null
          selected_facility_id?: string | null
          selection_method?: string | null
          suggested_facilities?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_disposal_plans_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_disposal_plans_selected_facility_id_fkey"
            columns: ["selected_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          actor_id: string | null
          actor_role: string | null
          after_json: Json | null
          before_json: Json | null
          created_at: string
          event_type: string
          id: string
          message: string | null
          order_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_role?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          event_type: string
          id?: string
          message?: string | null
          order_id: string
        }
        Update: {
          actor_id?: string | null
          actor_role?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          event_type?: string
          id?: string
          message?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_at: string | null
          actual_pickup_at: string | null
          addendum_contract_id: string | null
          amount_due: number | null
          amount_paid: number | null
          asset_id: string | null
          assigned_driver_id: string | null
          assigned_yard_id: string | null
          balance_due: number | null
          contracts_valid: boolean | null
          created_at: string
          custom_logistics_notes: string | null
          customer_id: string | null
          delivery_completed_at: string | null
          delivery_started_at: string | null
          deposit_required_reason: string | null
          destination_type: string | null
          destination_yard_id: string | null
          driver_notes: string | null
          driver_notes_internal: string | null
          dry_run_reason: string | null
          dump_ticket_url: string | null
          filled_location: string | null
          final_total: number | null
          fraud_blocked: boolean | null
          fraud_flags_count: number | null
          id: string
          included_days: number | null
          internal_notes: string | null
          inventory_id: string | null
          invoice_url: string | null
          is_dry_run: boolean | null
          live_load_minutes: number | null
          logistics_type: string | null
          market_id: string | null
          msa_contract_id: string | null
          multi_stop_sequence: number | null
          origin_yard_id: string | null
          overfill_flagged: boolean | null
          parent_order_id: string | null
          payment_link_amount: number | null
          payment_link_sent_at: string | null
          payment_link_type: string | null
          payment_link_url: string | null
          payment_status: string | null
          pickup_completed_at: string | null
          pickup_photo_url: string | null
          pickup_started_at: string | null
          placement_confirmed: boolean | null
          placement_locked: boolean | null
          placement_photo_url: string | null
          primary_dumpster_id: string | null
          quick_link_id: string | null
          quote_id: string | null
          requires_deposit: boolean | null
          requires_manual_review: boolean | null
          route_notes: string | null
          scheduled_delivery_date: string | null
          scheduled_delivery_window: string | null
          scheduled_pickup_date: string | null
          scheduled_pickup_window: string | null
          secondary_dumpster_id: string | null
          status: string
          text_before_arrival: boolean | null
          truck_id: string | null
          updated_at: string
          wrong_material_flagged: boolean | null
        }
        Insert: {
          actual_delivery_at?: string | null
          actual_pickup_at?: string | null
          addendum_contract_id?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          asset_id?: string | null
          assigned_driver_id?: string | null
          assigned_yard_id?: string | null
          balance_due?: number | null
          contracts_valid?: boolean | null
          created_at?: string
          custom_logistics_notes?: string | null
          customer_id?: string | null
          delivery_completed_at?: string | null
          delivery_started_at?: string | null
          deposit_required_reason?: string | null
          destination_type?: string | null
          destination_yard_id?: string | null
          driver_notes?: string | null
          driver_notes_internal?: string | null
          dry_run_reason?: string | null
          dump_ticket_url?: string | null
          filled_location?: string | null
          final_total?: number | null
          fraud_blocked?: boolean | null
          fraud_flags_count?: number | null
          id?: string
          included_days?: number | null
          internal_notes?: string | null
          inventory_id?: string | null
          invoice_url?: string | null
          is_dry_run?: boolean | null
          live_load_minutes?: number | null
          logistics_type?: string | null
          market_id?: string | null
          msa_contract_id?: string | null
          multi_stop_sequence?: number | null
          origin_yard_id?: string | null
          overfill_flagged?: boolean | null
          parent_order_id?: string | null
          payment_link_amount?: number | null
          payment_link_sent_at?: string | null
          payment_link_type?: string | null
          payment_link_url?: string | null
          payment_status?: string | null
          pickup_completed_at?: string | null
          pickup_photo_url?: string | null
          pickup_started_at?: string | null
          placement_confirmed?: boolean | null
          placement_locked?: boolean | null
          placement_photo_url?: string | null
          primary_dumpster_id?: string | null
          quick_link_id?: string | null
          quote_id?: string | null
          requires_deposit?: boolean | null
          requires_manual_review?: boolean | null
          route_notes?: string | null
          scheduled_delivery_date?: string | null
          scheduled_delivery_window?: string | null
          scheduled_pickup_date?: string | null
          scheduled_pickup_window?: string | null
          secondary_dumpster_id?: string | null
          status?: string
          text_before_arrival?: boolean | null
          truck_id?: string | null
          updated_at?: string
          wrong_material_flagged?: boolean | null
        }
        Update: {
          actual_delivery_at?: string | null
          actual_pickup_at?: string | null
          addendum_contract_id?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          asset_id?: string | null
          assigned_driver_id?: string | null
          assigned_yard_id?: string | null
          balance_due?: number | null
          contracts_valid?: boolean | null
          created_at?: string
          custom_logistics_notes?: string | null
          customer_id?: string | null
          delivery_completed_at?: string | null
          delivery_started_at?: string | null
          deposit_required_reason?: string | null
          destination_type?: string | null
          destination_yard_id?: string | null
          driver_notes?: string | null
          driver_notes_internal?: string | null
          dry_run_reason?: string | null
          dump_ticket_url?: string | null
          filled_location?: string | null
          final_total?: number | null
          fraud_blocked?: boolean | null
          fraud_flags_count?: number | null
          id?: string
          included_days?: number | null
          internal_notes?: string | null
          inventory_id?: string | null
          invoice_url?: string | null
          is_dry_run?: boolean | null
          live_load_minutes?: number | null
          logistics_type?: string | null
          market_id?: string | null
          msa_contract_id?: string | null
          multi_stop_sequence?: number | null
          origin_yard_id?: string | null
          overfill_flagged?: boolean | null
          parent_order_id?: string | null
          payment_link_amount?: number | null
          payment_link_sent_at?: string | null
          payment_link_type?: string | null
          payment_link_url?: string | null
          payment_status?: string | null
          pickup_completed_at?: string | null
          pickup_photo_url?: string | null
          pickup_started_at?: string | null
          placement_confirmed?: boolean | null
          placement_locked?: boolean | null
          placement_photo_url?: string | null
          primary_dumpster_id?: string | null
          quick_link_id?: string | null
          quote_id?: string | null
          requires_deposit?: boolean | null
          requires_manual_review?: boolean | null
          route_notes?: string | null
          scheduled_delivery_date?: string | null
          scheduled_delivery_window?: string | null
          scheduled_pickup_date?: string | null
          scheduled_pickup_window?: string | null
          secondary_dumpster_id?: string | null
          status?: string
          text_before_arrival?: boolean | null
          truck_id?: string | null
          updated_at?: string
          wrong_material_flagged?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_addendum_contract_id_fkey"
            columns: ["addendum_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_assigned_yard_id_fkey"
            columns: ["assigned_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "orders_assigned_yard_id_fkey"
            columns: ["assigned_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_destination_yard_id_fkey"
            columns: ["destination_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "orders_destination_yard_id_fkey"
            columns: ["destination_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_msa_contract_id_fkey"
            columns: ["msa_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_origin_yard_id_fkey"
            columns: ["origin_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "orders_origin_yard_id_fkey"
            columns: ["origin_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_parent_order_id_fkey"
            columns: ["parent_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_primary_dumpster_id_fkey"
            columns: ["primary_dumpster_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quick_link_id_fkey"
            columns: ["quick_link_id"]
            isOneToOne: false
            referencedRelation: "quick_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_secondary_dumpster_id_fkey"
            columns: ["secondary_dumpster_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["payment_action_type"]
          amount: number
          approved_by: string | null
          created_at: string
          error_message: string | null
          evidence_url: string | null
          id: string
          invoice_id: string | null
          order_id: string
          payment_id: string
          processed_by: string | null
          provider: string
          provider_refund_transaction_id: string | null
          provider_transaction_id: string | null
          reason_code: string
          reason_notes: string | null
          requested_by: string
          status: Database["public"]["Enums"]["payment_action_status"]
          updated_at: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["payment_action_type"]
          amount: number
          approved_by?: string | null
          created_at?: string
          error_message?: string | null
          evidence_url?: string | null
          id?: string
          invoice_id?: string | null
          order_id: string
          payment_id: string
          processed_by?: string | null
          provider?: string
          provider_refund_transaction_id?: string | null
          provider_transaction_id?: string | null
          reason_code: string
          reason_notes?: string | null
          requested_by: string
          status?: Database["public"]["Enums"]["payment_action_status"]
          updated_at?: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["payment_action_type"]
          amount?: number
          approved_by?: string | null
          created_at?: string
          error_message?: string | null
          evidence_url?: string | null
          id?: string
          invoice_id?: string | null
          order_id?: string
          payment_id?: string
          processed_by?: string | null
          provider?: string
          provider_refund_transaction_id?: string | null
          provider_transaction_id?: string | null
          reason_code?: string
          reason_notes?: string | null
          requested_by?: string
          status?: Database["public"]["Enums"]["payment_action_status"]
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          auth_code: string | null
          card_last_four: string | null
          card_type: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_phone: string | null
          id: string
          order_id: string
          payment_type: string
          provider: string
          refunded_amount: number
          response_code: string | null
          response_message: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          auth_code?: string | null
          card_last_four?: string | null
          card_type?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_phone?: string | null
          id?: string
          order_id: string
          payment_type: string
          provider?: string
          refunded_amount?: number
          response_code?: string | null
          response_message?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          auth_code?: string | null
          card_last_four?: string | null
          card_type?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_phone?: string | null
          id?: string
          order_id?: string
          payment_type?: string
          provider?: string
          refunded_amount?: number
          response_code?: string | null
          response_message?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_otps: {
        Row: {
          attempts: number
          code_hash: string
          cooldown_until: string | null
          created_at: string
          expires_at: string
          id: string
          phone: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          code_hash: string
          cooldown_until?: string | null
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          code_hash?: string
          cooldown_until?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      pricing_extras: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          label: string
          price: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          label: string
          price: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          label?: string
          price?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      pricing_zones: {
        Row: {
          base_multiplier: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          base_multiplier?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          base_multiplier?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      quick_links: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          name: string | null
          preferred_address: string | null
          preset_extras: Json | null
          preset_material: string | null
          preset_size: number | null
          preset_yard_id: string | null
          preset_zip: string | null
          source: string | null
          token: string
          updated_at: string
          use_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name?: string | null
          preferred_address?: string | null
          preset_extras?: Json | null
          preset_material?: string | null
          preset_size?: number | null
          preset_yard_id?: string | null
          preset_zip?: string | null
          source?: string | null
          token: string
          updated_at?: string
          use_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name?: string | null
          preferred_address?: string | null
          preset_extras?: Json | null
          preset_material?: string | null
          preset_size?: number | null
          preset_yard_id?: string | null
          preset_zip?: string | null
          source?: string | null
          token?: string
          updated_at?: string
          use_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "quick_links_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_links_preset_yard_id_fkey"
            columns: ["preset_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "quick_links_preset_yard_id_fkey"
            columns: ["preset_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_data: Json | null
          event_type: string
          id: string
          quote_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          quote_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          quote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_events_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          ai_analysis_id: string | null
          ai_confidence: string | null
          ai_hazards_json: Json | null
          ai_materials_json: Json | null
          ai_recommended_size: number | null
          ai_volume_range: Json | null
          ai_weight_range: Json | null
          city_rate_id: string | null
          company_name: string | null
          completed_at: string | null
          confidence_level: string | null
          confidence_note: string | null
          converted_at: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_lat: number | null
          customer_lng: number | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          delivery_lat: number | null
          delivery_lng: number | null
          discount_cap_applied: boolean | null
          discount_percent: number | null
          distance_bracket: string | null
          distance_miles: number | null
          driver_id: string | null
          estimated_max: number
          estimated_min: number
          extra_tons_prepurchased: number | null
          extras: string[] | null
          fraud_flags_count: number | null
          green_halo_category: string | null
          green_halo_dump_fee: number | null
          green_halo_dump_fee_per_ton: number | null
          green_halo_handling_fee: number | null
          heavy_material_class: string | null
          heavy_material_increment: number | null
          highlevel_contact_id: string | null
          highlevel_tags: string[] | null
          id: string
          is_calsan_fulfillment: boolean
          is_green_halo: boolean | null
          is_trash_contaminated: boolean | null
          is_weekend_delivery: boolean | null
          last_synced_at: string | null
          margin: number | null
          market_id: string | null
          material_type: string
          order_id: string | null
          original_material_type: string | null
          placement_lat: number | null
          placement_lng: number | null
          placement_notes: string | null
          placement_type: string | null
          pre_purchase_suggested: boolean | null
          preferred_delivery_date: string | null
          preferred_delivery_window: string | null
          prepurchase_city_rate: number | null
          prepurchase_discount_pct: number | null
          prepurchase_rate: number | null
          project_type: string | null
          quick_link_id: string | null
          receipt_sent_at: string | null
          reclassified_to_mixed: boolean | null
          recommendation_reason: string | null
          recommended_size_yards: number | null
          rental_days: number
          requires_discount_approval: boolean | null
          route_calculated_at: string | null
          route_polyline: string | null
          routing_provider: string | null
          scheduling_notes: string | null
          selected_vendor_id: string | null
          size_id: string | null
          status: string
          subtotal: number
          suggested_extra_tons: number | null
          suggested_pickup_date: string | null
          toll_surcharge: number | null
          truck_distance_miles: number | null
          truck_duration_max: number | null
          truck_duration_min: number | null
          updated_at: string
          user_selected_size_yards: number | null
          user_type: string
          vendor_cost: number | null
          volume_agreement_id: string | null
          volume_commitment_count: number | null
          volume_discount_pct: number | null
          volume_validity_end: string | null
          volume_validity_start: string | null
          yard_id: string | null
          yard_name: string | null
          zip_code: string
          zone_id: string | null
        }
        Insert: {
          ai_analysis_id?: string | null
          ai_confidence?: string | null
          ai_hazards_json?: Json | null
          ai_materials_json?: Json | null
          ai_recommended_size?: number | null
          ai_volume_range?: Json | null
          ai_weight_range?: Json | null
          city_rate_id?: string | null
          company_name?: string | null
          completed_at?: string | null
          confidence_level?: string | null
          confidence_note?: string | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          discount_cap_applied?: boolean | null
          discount_percent?: number | null
          distance_bracket?: string | null
          distance_miles?: number | null
          driver_id?: string | null
          estimated_max: number
          estimated_min: number
          extra_tons_prepurchased?: number | null
          extras?: string[] | null
          fraud_flags_count?: number | null
          green_halo_category?: string | null
          green_halo_dump_fee?: number | null
          green_halo_dump_fee_per_ton?: number | null
          green_halo_handling_fee?: number | null
          heavy_material_class?: string | null
          heavy_material_increment?: number | null
          highlevel_contact_id?: string | null
          highlevel_tags?: string[] | null
          id?: string
          is_calsan_fulfillment?: boolean
          is_green_halo?: boolean | null
          is_trash_contaminated?: boolean | null
          is_weekend_delivery?: boolean | null
          last_synced_at?: string | null
          margin?: number | null
          market_id?: string | null
          material_type: string
          order_id?: string | null
          original_material_type?: string | null
          placement_lat?: number | null
          placement_lng?: number | null
          placement_notes?: string | null
          placement_type?: string | null
          pre_purchase_suggested?: boolean | null
          preferred_delivery_date?: string | null
          preferred_delivery_window?: string | null
          prepurchase_city_rate?: number | null
          prepurchase_discount_pct?: number | null
          prepurchase_rate?: number | null
          project_type?: string | null
          quick_link_id?: string | null
          receipt_sent_at?: string | null
          reclassified_to_mixed?: boolean | null
          recommendation_reason?: string | null
          recommended_size_yards?: number | null
          rental_days?: number
          requires_discount_approval?: boolean | null
          route_calculated_at?: string | null
          route_polyline?: string | null
          routing_provider?: string | null
          scheduling_notes?: string | null
          selected_vendor_id?: string | null
          size_id?: string | null
          status?: string
          subtotal: number
          suggested_extra_tons?: number | null
          suggested_pickup_date?: string | null
          toll_surcharge?: number | null
          truck_distance_miles?: number | null
          truck_duration_max?: number | null
          truck_duration_min?: number | null
          updated_at?: string
          user_selected_size_yards?: number | null
          user_type?: string
          vendor_cost?: number | null
          volume_agreement_id?: string | null
          volume_commitment_count?: number | null
          volume_discount_pct?: number | null
          volume_validity_end?: string | null
          volume_validity_start?: string | null
          yard_id?: string | null
          yard_name?: string | null
          zip_code: string
          zone_id?: string | null
        }
        Update: {
          ai_analysis_id?: string | null
          ai_confidence?: string | null
          ai_hazards_json?: Json | null
          ai_materials_json?: Json | null
          ai_recommended_size?: number | null
          ai_volume_range?: Json | null
          ai_weight_range?: Json | null
          city_rate_id?: string | null
          company_name?: string | null
          completed_at?: string | null
          confidence_level?: string | null
          confidence_note?: string | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          discount_cap_applied?: boolean | null
          discount_percent?: number | null
          distance_bracket?: string | null
          distance_miles?: number | null
          driver_id?: string | null
          estimated_max?: number
          estimated_min?: number
          extra_tons_prepurchased?: number | null
          extras?: string[] | null
          fraud_flags_count?: number | null
          green_halo_category?: string | null
          green_halo_dump_fee?: number | null
          green_halo_dump_fee_per_ton?: number | null
          green_halo_handling_fee?: number | null
          heavy_material_class?: string | null
          heavy_material_increment?: number | null
          highlevel_contact_id?: string | null
          highlevel_tags?: string[] | null
          id?: string
          is_calsan_fulfillment?: boolean
          is_green_halo?: boolean | null
          is_trash_contaminated?: boolean | null
          is_weekend_delivery?: boolean | null
          last_synced_at?: string | null
          margin?: number | null
          market_id?: string | null
          material_type?: string
          order_id?: string | null
          original_material_type?: string | null
          placement_lat?: number | null
          placement_lng?: number | null
          placement_notes?: string | null
          placement_type?: string | null
          pre_purchase_suggested?: boolean | null
          preferred_delivery_date?: string | null
          preferred_delivery_window?: string | null
          prepurchase_city_rate?: number | null
          prepurchase_discount_pct?: number | null
          prepurchase_rate?: number | null
          project_type?: string | null
          quick_link_id?: string | null
          receipt_sent_at?: string | null
          reclassified_to_mixed?: boolean | null
          recommendation_reason?: string | null
          recommended_size_yards?: number | null
          rental_days?: number
          requires_discount_approval?: boolean | null
          route_calculated_at?: string | null
          route_polyline?: string | null
          routing_provider?: string | null
          scheduling_notes?: string | null
          selected_vendor_id?: string | null
          size_id?: string | null
          status?: string
          subtotal?: number
          suggested_extra_tons?: number | null
          suggested_pickup_date?: string | null
          toll_surcharge?: number | null
          truck_distance_miles?: number | null
          truck_duration_max?: number | null
          truck_duration_min?: number | null
          updated_at?: string
          user_selected_size_yards?: number | null
          user_type?: string
          vendor_cost?: number | null
          volume_agreement_id?: string | null
          volume_commitment_count?: number | null
          volume_discount_pct?: number | null
          volume_validity_end?: string | null
          volume_validity_start?: string | null
          yard_id?: string | null
          yard_name?: string | null
          zip_code?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_ai_analysis_id_fkey"
            columns: ["ai_analysis_id"]
            isOneToOne: false
            referencedRelation: "waste_vision_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_quick_link_id_fkey"
            columns: ["quick_link_id"]
            isOneToOne: false
            referencedRelation: "quick_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_selected_vendor_id_fkey"
            columns: ["selected_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["size_id"]
          },
          {
            foreignKeyName: "quotes_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "dumpster_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "pricing_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          accepted: boolean | null
          accepted_at: string | null
          action_data: Json | null
          action_label: string | null
          context: Json
          created_at: string
          description: string | null
          dismissed_at: string | null
          entity_id: string
          entity_type: string
          id: string
          rec_type: string
          shown_at: string | null
          title: string
        }
        Insert: {
          accepted?: boolean | null
          accepted_at?: string | null
          action_data?: Json | null
          action_label?: string | null
          context?: Json
          created_at?: string
          description?: string | null
          dismissed_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          rec_type: string
          shown_at?: string | null
          title: string
        }
        Update: {
          accepted?: boolean | null
          accepted_at?: string | null
          action_data?: Json | null
          action_label?: string | null
          context?: Json
          created_at?: string
          description?: string | null
          dismissed_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          rec_type?: string
          shown_at?: string | null
          title?: string
        }
        Relationships: []
      }
      rental_periods: {
        Row: {
          created_at: string
          days: number
          display_order: number
          extra_cost: number
          id: string
          is_active: boolean
          is_default: boolean
          label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days: number
          display_order?: number
          extra_cost?: number
          id?: string
          is_active?: boolean
          is_default?: boolean
          label: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days?: number
          display_order?: number
          extra_cost?: number
          id?: string
          is_active?: boolean
          is_default?: boolean
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      risk_score_events: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          order_id: string | null
          phone: string | null
          quote_id: string | null
          rule_name: string
          score_delta: number
          total_score: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          order_id?: string | null
          phone?: string | null
          quote_id?: string | null
          rule_name: string
          score_delta: number
          total_score?: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          order_id?: string | null
          phone?: string | null
          quote_id?: string | null
          rule_name?: string
          score_delta?: number
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_score_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_score_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_score_events_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      role_definitions: {
        Row: {
          allowed_actions: string[] | null
          allowed_routes: string[] | null
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          label: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          allowed_actions?: string[] | null
          allowed_routes?: string[] | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          label: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          allowed_actions?: string[] | null
          allowed_routes?: string[] | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          label?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          action: string
          conditions: Json | null
          created_at: string
          id: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          action: string
          conditions?: Json | null
          created_at?: string
          id?: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          action?: string
          conditions?: Json | null
          created_at?: string
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      sales_leads: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          assignment_type: string | null
          company_name: string | null
          converted_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          is_existing_customer: boolean | null
          lead_source: string | null
          lead_status: string
          next_followup_at: string | null
          notes: string | null
          quote_id: string | null
          routing_tags: string[] | null
          sales_notes: string | null
          timeout_at: string | null
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          assignment_type?: string | null
          company_name?: string | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          is_existing_customer?: boolean | null
          lead_source?: string | null
          lead_status?: string
          next_followup_at?: string | null
          notes?: string | null
          quote_id?: string | null
          routing_tags?: string[] | null
          sales_notes?: string | null
          timeout_at?: string | null
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          assignment_type?: string | null
          company_name?: string | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          is_existing_customer?: boolean | null
          lead_source?: string | null
          lead_status?: string
          next_followup_at?: string | null
          notes?: string | null
          quote_id?: string | null
          routing_tags?: string[] | null
          sales_notes?: string | null
          timeout_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_leads_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string
          id: string
          new_date: string | null
          new_window: string | null
          old_date: string | null
          old_window: string | null
          order_id: string
          reason: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          new_date?: string | null
          new_window?: string | null
          old_date?: string | null
          old_window?: string | null
          order_id: string
          reason?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          new_date?: string | null
          new_window?: string | null
          old_date?: string | null
          old_window?: string | null
          order_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_receipts: {
        Row: {
          created_at: string
          email_sent_at: string | null
          facility_name: string | null
          heavy_material_class: string | null
          id: string
          included_tons: number | null
          overage_charge: number | null
          overage_rate: number | null
          overage_tons: number | null
          prepurchase_applied_tons: number | null
          prepurchased_tons: number | null
          pricing_rule: string | null
          quote_id: string
          sms_sent_at: string | null
          standard_overage_tons: number | null
          ticket_date: string | null
          ticket_number: string | null
          ticket_url: string | null
          total_tons: number
          updated_at: string
          was_reclassified: boolean | null
        }
        Insert: {
          created_at?: string
          email_sent_at?: string | null
          facility_name?: string | null
          heavy_material_class?: string | null
          id?: string
          included_tons?: number | null
          overage_charge?: number | null
          overage_rate?: number | null
          overage_tons?: number | null
          prepurchase_applied_tons?: number | null
          prepurchased_tons?: number | null
          pricing_rule?: string | null
          quote_id: string
          sms_sent_at?: string | null
          standard_overage_tons?: number | null
          ticket_date?: string | null
          ticket_number?: string | null
          ticket_url?: string | null
          total_tons: number
          updated_at?: string
          was_reclassified?: boolean | null
        }
        Update: {
          created_at?: string
          email_sent_at?: string | null
          facility_name?: string | null
          heavy_material_class?: string | null
          id?: string
          included_tons?: number | null
          overage_charge?: number | null
          overage_rate?: number | null
          overage_tons?: number | null
          prepurchase_applied_tons?: number | null
          prepurchased_tons?: number | null
          pricing_rule?: string | null
          quote_id?: string
          sms_sent_at?: string | null
          standard_overage_tons?: number | null
          ticket_date?: string | null
          ticket_number?: string | null
          ticket_url?: string | null
          total_tons?: number
          updated_at?: string
          was_reclassified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "service_receipts_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          assigned_to: string | null
          change_type: string | null
          created_at: string
          customer_id: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          order_id: string
          photo_url: string | null
          preferred_date: string | null
          preferred_window: string | null
          priority: string | null
          request_type: string
          requested_delivery_date: string | null
          requested_delivery_window: string | null
          requested_pickup_date: string | null
          requested_pickup_window: string | null
          resolution_notes: string | null
          response_sent_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          change_type?: string | null
          created_at?: string
          customer_id?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_id: string
          photo_url?: string | null
          preferred_date?: string | null
          preferred_window?: string | null
          priority?: string | null
          request_type: string
          requested_delivery_date?: string | null
          requested_delivery_window?: string | null
          requested_pickup_date?: string | null
          requested_pickup_window?: string | null
          resolution_notes?: string | null
          response_sent_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          change_type?: string | null
          created_at?: string
          customer_id?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          photo_url?: string | null
          preferred_date?: string | null
          preferred_window?: string | null
          priority?: string | null
          request_type?: string
          requested_delivery_date?: string | null
          requested_delivery_window?: string | null
          requested_pickup_date?: string | null
          requested_pickup_window?: string | null
          resolution_notes?: string | null
          response_sent_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      size_volume_factors: {
        Row: {
          created_at: string
          id: string
          size_yards: number
          volume_factor: number
        }
        Insert: {
          created_at?: string
          id?: string
          size_yards: number
          volume_factor?: number
        }
        Update: {
          created_at?: string
          id?: string
          size_yards?: number
          volume_factor?: number
        }
        Relationships: []
      }
      sms_templates: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          template_body: string
          template_key: string
          template_name: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          template_body: string
          template_key: string
          template_name: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          template_body?: string
          template_key?: string
          template_name?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          department: string
          email: string
          full_name: string
          id: string
          last_login_at: string | null
          notes: string | null
          phone: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department: string
          email: string
          full_name: string
          id?: string
          last_login_at?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department?: string
          email?: string
          full_name?: string
          id?: string
          last_login_at?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      toll_surcharges: {
        Row: {
          applies_to_delivery: boolean
          applies_to_pickup: boolean
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          origin_yard_id: string | null
          surcharge_amount: number
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          applies_to_delivery?: boolean
          applies_to_pickup?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          origin_yard_id?: string | null
          surcharge_amount?: number
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          applies_to_delivery?: boolean
          applies_to_pickup?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          origin_yard_id?: string | null
          surcharge_amount?: number
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "toll_surcharges_origin_yard_id_fkey"
            columns: ["origin_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "toll_surcharges_origin_yard_id_fkey"
            columns: ["origin_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toll_surcharges_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "pricing_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      trucks: {
        Row: {
          assigned_driver_id: string | null
          assigned_yard_id: string | null
          capacity_tons: number | null
          capacity_yards: number | null
          created_at: string
          current_yard_id: string | null
          home_yard_id: string | null
          id: string
          is_active: boolean | null
          last_maintenance_at: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          next_maintenance_due: string | null
          notes: string | null
          odometer_miles: number | null
          truck_code: string | null
          truck_number: string
          truck_status: string | null
          truck_type: string | null
          updated_at: string
          vin: string | null
          year: number | null
        }
        Insert: {
          assigned_driver_id?: string | null
          assigned_yard_id?: string | null
          capacity_tons?: number | null
          capacity_yards?: number | null
          created_at?: string
          current_yard_id?: string | null
          home_yard_id?: string | null
          id?: string
          is_active?: boolean | null
          last_maintenance_at?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          next_maintenance_due?: string | null
          notes?: string | null
          odometer_miles?: number | null
          truck_code?: string | null
          truck_number: string
          truck_status?: string | null
          truck_type?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          assigned_driver_id?: string | null
          assigned_yard_id?: string | null
          capacity_tons?: number | null
          capacity_yards?: number | null
          created_at?: string
          current_yard_id?: string | null
          home_yard_id?: string | null
          id?: string
          is_active?: boolean | null
          last_maintenance_at?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          next_maintenance_due?: string | null
          notes?: string | null
          odometer_miles?: number | null
          truck_code?: string | null
          truck_number?: string
          truck_status?: string | null
          truck_type?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trucks_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trucks_assigned_yard_id_fkey"
            columns: ["assigned_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "trucks_assigned_yard_id_fkey"
            columns: ["assigned_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trucks_current_yard_id_fkey"
            columns: ["current_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "trucks_current_yard_id_fkey"
            columns: ["current_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trucks_home_yard_id_fkey"
            columns: ["home_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "trucks_home_yard_id_fkey"
            columns: ["home_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_customers: {
        Row: {
          added_by: string | null
          created_at: string
          customer_id: string | null
          id: string
          phone: string | null
          reason: string
          status: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          phone?: string | null
          reason: string
          status?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          phone?: string | null
          reason?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "trusted_customers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          target_email: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          target_email?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          target_email?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          driver_id: string | null
          id: string
          phone: string | null
          preferred_role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          driver_id?: string | null
          id?: string
          phone?: string | null
          preferred_role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          driver_id?: string | null
          id?: string
          phone?: string | null
          preferred_role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_pricing: {
        Row: {
          cost: number
          created_at: string
          id: string
          notes: string | null
          size_id: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          cost: number
          created_at?: string
          id?: string
          notes?: string | null
          size_id: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          notes?: string | null
          size_id?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_pricing_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["size_id"]
          },
          {
            foreignKeyName: "vendor_pricing_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "dumpster_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_pricing_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_zones: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          vendor_id: string
          zone_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          vendor_id: string
          zone_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          vendor_id?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_zones_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_zones_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "pricing_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          priority_rank: number
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          priority_rank?: number
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          priority_rank?: number
          updated_at?: string
        }
        Relationships: []
      }
      volume_commitments: {
        Row: {
          agreement_id: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          commitment_type: Database["public"]["Enums"]["commitment_type"]
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          customer_type: string
          discount_pct: number
          id: string
          notes: string | null
          payment_ref: string | null
          service_count_committed: number
          services_remaining: number
          updated_at: string
          validity_end_date: string
          validity_start_date: string
          volume_tier: Database["public"]["Enums"]["volume_tier"]
        }
        Insert: {
          agreement_id?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          commitment_type: Database["public"]["Enums"]["commitment_type"]
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          customer_type: string
          discount_pct: number
          id?: string
          notes?: string | null
          payment_ref?: string | null
          service_count_committed: number
          services_remaining: number
          updated_at?: string
          validity_end_date: string
          validity_start_date: string
          volume_tier: Database["public"]["Enums"]["volume_tier"]
        }
        Update: {
          agreement_id?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          commitment_type?: Database["public"]["Enums"]["commitment_type"]
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          customer_type?: string
          discount_pct?: number
          id?: string
          notes?: string | null
          payment_ref?: string | null
          service_count_committed?: number
          services_remaining?: number
          updated_at?: string
          validity_end_date?: string
          validity_start_date?: string
          volume_tier?: Database["public"]["Enums"]["volume_tier"]
        }
        Relationships: []
      }
      waste_vision_analyses: {
        Row: {
          alternate_sizes: number[] | null
          applied_at: string | null
          applied_to_quote: boolean | null
          created_at: string
          fit_confidence: string | null
          green_halo_eligible: boolean | null
          green_halo_note: string | null
          hazard_review_notes: string | null
          hazard_review_required: boolean | null
          hazard_review_status: string | null
          hazard_reviewer_id: string | null
          hazards_detected: Json
          id: string
          image_count: number
          input_type: string
          materials_detected: Json
          order_id: string | null
          overall_confidence: string | null
          pickup_loads_high: number | null
          pickup_loads_low: number | null
          quote_id: string | null
          raw_ai_response: Json | null
          recommendation_notes: string[] | null
          recommended_size: number | null
          recommended_waste_type: string | null
          reference_object: string | null
          session_id: string | null
          volume_cy_high: number | null
          volume_cy_low: number | null
          weight_tons_high: number | null
          weight_tons_low: number | null
        }
        Insert: {
          alternate_sizes?: number[] | null
          applied_at?: string | null
          applied_to_quote?: boolean | null
          created_at?: string
          fit_confidence?: string | null
          green_halo_eligible?: boolean | null
          green_halo_note?: string | null
          hazard_review_notes?: string | null
          hazard_review_required?: boolean | null
          hazard_review_status?: string | null
          hazard_reviewer_id?: string | null
          hazards_detected?: Json
          id?: string
          image_count?: number
          input_type?: string
          materials_detected?: Json
          order_id?: string | null
          overall_confidence?: string | null
          pickup_loads_high?: number | null
          pickup_loads_low?: number | null
          quote_id?: string | null
          raw_ai_response?: Json | null
          recommendation_notes?: string[] | null
          recommended_size?: number | null
          recommended_waste_type?: string | null
          reference_object?: string | null
          session_id?: string | null
          volume_cy_high?: number | null
          volume_cy_low?: number | null
          weight_tons_high?: number | null
          weight_tons_low?: number | null
        }
        Update: {
          alternate_sizes?: number[] | null
          applied_at?: string | null
          applied_to_quote?: boolean | null
          created_at?: string
          fit_confidence?: string | null
          green_halo_eligible?: boolean | null
          green_halo_note?: string | null
          hazard_review_notes?: string | null
          hazard_review_required?: boolean | null
          hazard_review_status?: string | null
          hazard_reviewer_id?: string | null
          hazards_detected?: Json
          id?: string
          image_count?: number
          input_type?: string
          materials_detected?: Json
          order_id?: string | null
          overall_confidence?: string | null
          pickup_loads_high?: number | null
          pickup_loads_low?: number | null
          quote_id?: string | null
          raw_ai_response?: Json | null
          recommendation_notes?: string[] | null
          recommended_size?: number | null
          recommended_waste_type?: string | null
          reference_object?: string | null
          session_id?: string | null
          volume_cy_high?: number | null
          volume_cy_low?: number | null
          weight_tons_high?: number | null
          weight_tons_low?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "waste_vision_analyses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_vision_analyses_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      yards: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          market: string
          market_id: string | null
          name: string
          priority_rank: number
          slug: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          market: string
          market_id?: string | null
          name: string
          priority_rank?: number
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          market?: string
          market_id?: string | null
          name?: string
          priority_rank?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yards_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      zip_warnings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          max_distance_miles: number | null
          requires_approval: boolean
          warning_message: string
          warning_type: string
          zip_code: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_distance_miles?: number | null
          requires_approval?: boolean
          warning_message: string
          warning_type: string
          zip_code: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_distance_miles?: number | null
          requires_approval?: boolean
          warning_message?: string
          warning_type?: string
          zip_code?: string
        }
        Relationships: []
      }
      zone_pricing: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          price_override: number | null
          size_id: string
          updated_at: string
          zone_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          price_override?: number | null
          size_id: string
          updated_at?: string
          zone_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          price_override?: number | null
          size_id?: string
          updated_at?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_pricing_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["size_id"]
          },
          {
            foreignKeyName: "zone_pricing_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "dumpster_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_pricing_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "pricing_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_zip_codes: {
        Row: {
          city_name: string | null
          county: string | null
          created_at: string
          id: string
          market_id: string | null
          zip_code: string
          zone_id: string
        }
        Insert: {
          city_name?: string | null
          county?: string | null
          created_at?: string
          id?: string
          market_id?: string | null
          zip_code: string
          zone_id: string
        }
        Update: {
          city_name?: string | null
          county?: string | null
          created_at?: string
          id?: string
          market_id?: string | null
          zip_code?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_zip_codes_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_zip_codes_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "pricing_zones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      asset_inventory_summary: {
        Row: {
          available_count: number | null
          deployed_count: number | null
          maintenance_count: number | null
          reserved_count: number | null
          size_id: string | null
          size_label: string | null
          size_value: number | null
          total_count: number | null
          yard_id: string | null
          yard_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_admin_permission: {
        Args: { _action: string; _module: string; _user_id: string }
        Returns: boolean
      }
      check_existing_customer: {
        Args: { p_email?: string; p_phone?: string }
        Returns: boolean
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_lead_event: {
        Args: {
          p_event_type: string
          p_from_type?: string
          p_lead_id: string
          p_notes?: string
          p_to_type?: string
        }
        Returns: string
      }
      update_assets_days_out: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "customer"
        | "dispatcher"
        | "finance"
        | "driver"
        | "sales"
        | "owner_operator"
        | "system_admin"
        | "ops_admin"
        | "finance_admin"
        | "sales_admin"
        | "read_only_admin"
        | "cs"
        | "cs_agent"
        | "billing_specialist"
        | "executive"
      approval_status: "pending" | "approved" | "rejected"
      commitment_type: "prepaid" | "contracted"
      contract_status: "pending" | "signed" | "declined" | "expired"
      contract_type: "msa" | "addendum"
      filled_location: "customer" | "yard" | "truck"
      logistics_type:
        | "delivery"
        | "pickup"
        | "swap"
        | "live_load"
        | "dump_and_return"
        | "relocation"
        | "custom_request"
        | "yard_filled"
        | "truck_filled"
        | "partial_pickup"
        | "dry_run"
        | "multi_stop"
        | "maintenance_hold"
      payment_action_status:
        | "requested"
        | "approved"
        | "processing"
        | "completed"
        | "failed"
        | "canceled"
      payment_action_type: "refund" | "void"
      volume_tier: "tier_a" | "tier_b" | "tier_c" | "tier_d"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "customer",
        "dispatcher",
        "finance",
        "driver",
        "sales",
        "owner_operator",
        "system_admin",
        "ops_admin",
        "finance_admin",
        "sales_admin",
        "read_only_admin",
        "cs",
        "cs_agent",
        "billing_specialist",
        "executive",
      ],
      approval_status: ["pending", "approved", "rejected"],
      commitment_type: ["prepaid", "contracted"],
      contract_status: ["pending", "signed", "declined", "expired"],
      contract_type: ["msa", "addendum"],
      filled_location: ["customer", "yard", "truck"],
      logistics_type: [
        "delivery",
        "pickup",
        "swap",
        "live_load",
        "dump_and_return",
        "relocation",
        "custom_request",
        "yard_filled",
        "truck_filled",
        "partial_pickup",
        "dry_run",
        "multi_stop",
        "maintenance_hold",
      ],
      payment_action_status: [
        "requested",
        "approved",
        "processing",
        "completed",
        "failed",
        "canceled",
      ],
      payment_action_type: ["refund", "void"],
      volume_tier: ["tier_a", "tier_b", "tier_c", "tier_d"],
    },
  },
} as const
