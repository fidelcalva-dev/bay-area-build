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
      city_rates: {
        Row: {
          city_name: string
          created_at: string
          extra_ton_rate_prepay: number | null
          extra_ton_rate_standard: number
          heavy_base_10yd: number
          id: string
          is_active: boolean
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
          prepay_discount_pct?: number
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_rates_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "pricing_zones"
            referencedColumns: ["id"]
          },
        ]
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
      distance_brackets: {
        Row: {
          bracket_name: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
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
          max_miles?: number | null
          min_miles?: number
          price_adjustment?: number
          requires_review?: boolean
        }
        Relationships: []
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
      orders: {
        Row: {
          actual_delivery_at: string | null
          actual_pickup_at: string | null
          assigned_driver_id: string | null
          assigned_yard_id: string | null
          created_at: string
          customer_id: string | null
          delivery_completed_at: string | null
          delivery_started_at: string | null
          driver_notes: string | null
          driver_notes_internal: string | null
          dump_ticket_url: string | null
          final_total: number | null
          id: string
          internal_notes: string | null
          invoice_url: string | null
          payment_status: string | null
          pickup_completed_at: string | null
          pickup_photo_url: string | null
          pickup_started_at: string | null
          placement_confirmed: boolean | null
          placement_locked: boolean | null
          placement_photo_url: string | null
          quote_id: string | null
          route_notes: string | null
          scheduled_delivery_date: string | null
          scheduled_delivery_window: string | null
          scheduled_pickup_date: string | null
          scheduled_pickup_window: string | null
          status: string
          text_before_arrival: boolean | null
          updated_at: string
        }
        Insert: {
          actual_delivery_at?: string | null
          actual_pickup_at?: string | null
          assigned_driver_id?: string | null
          assigned_yard_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_completed_at?: string | null
          delivery_started_at?: string | null
          driver_notes?: string | null
          driver_notes_internal?: string | null
          dump_ticket_url?: string | null
          final_total?: number | null
          id?: string
          internal_notes?: string | null
          invoice_url?: string | null
          payment_status?: string | null
          pickup_completed_at?: string | null
          pickup_photo_url?: string | null
          pickup_started_at?: string | null
          placement_confirmed?: boolean | null
          placement_locked?: boolean | null
          placement_photo_url?: string | null
          quote_id?: string | null
          route_notes?: string | null
          scheduled_delivery_date?: string | null
          scheduled_delivery_window?: string | null
          scheduled_pickup_date?: string | null
          scheduled_pickup_window?: string | null
          status?: string
          text_before_arrival?: boolean | null
          updated_at?: string
        }
        Update: {
          actual_delivery_at?: string | null
          actual_pickup_at?: string | null
          assigned_driver_id?: string | null
          assigned_yard_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_completed_at?: string | null
          delivery_started_at?: string | null
          driver_notes?: string | null
          driver_notes_internal?: string | null
          dump_ticket_url?: string | null
          final_total?: number | null
          id?: string
          internal_notes?: string | null
          invoice_url?: string | null
          payment_status?: string | null
          pickup_completed_at?: string | null
          pickup_photo_url?: string | null
          pickup_started_at?: string | null
          placement_confirmed?: boolean | null
          placement_locked?: boolean | null
          placement_photo_url?: string | null
          quote_id?: string | null
          route_notes?: string | null
          scheduled_delivery_date?: string | null
          scheduled_delivery_window?: string | null
          scheduled_pickup_date?: string | null
          scheduled_pickup_window?: string | null
          status?: string
          text_before_arrival?: boolean | null
          updated_at?: string
        }
        Relationships: [
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
            foreignKeyName: "orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
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
      quotes: {
        Row: {
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
          green_halo_category: string | null
          green_halo_dump_fee: number | null
          green_halo_dump_fee_per_ton: number | null
          green_halo_handling_fee: number | null
          heavy_material_class: string | null
          heavy_material_increment: number | null
          id: string
          is_calsan_fulfillment: boolean
          is_green_halo: boolean | null
          is_trash_contaminated: boolean | null
          is_weekend_delivery: boolean | null
          margin: number | null
          material_type: string
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
          green_halo_category?: string | null
          green_halo_dump_fee?: number | null
          green_halo_dump_fee_per_ton?: number | null
          green_halo_handling_fee?: number | null
          heavy_material_class?: string | null
          heavy_material_increment?: number | null
          id?: string
          is_calsan_fulfillment?: boolean
          is_green_halo?: boolean | null
          is_trash_contaminated?: boolean | null
          is_weekend_delivery?: boolean | null
          margin?: number | null
          material_type: string
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
          green_halo_category?: string | null
          green_halo_dump_fee?: number | null
          green_halo_dump_fee_per_ton?: number | null
          green_halo_handling_fee?: number | null
          heavy_material_class?: string | null
          heavy_material_increment?: number | null
          id?: string
          is_calsan_fulfillment?: boolean
          is_green_halo?: boolean | null
          is_trash_contaminated?: boolean | null
          is_weekend_delivery?: boolean | null
          margin?: number | null
          material_type?: string
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
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
          assigned_to: string | null
          company_name: string | null
          converted_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          lead_source: string | null
          lead_status: string
          next_followup_at: string | null
          notes: string | null
          quote_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_name?: string | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          lead_source?: string | null
          lead_status?: string
          next_followup_at?: string | null
          notes?: string | null
          quote_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_name?: string | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          lead_source?: string | null
          lead_status?: string
          next_followup_at?: string | null
          notes?: string | null
          quote_id?: string | null
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
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          order_id: string
          photo_url: string | null
          preferred_date: string | null
          preferred_window: string | null
          request_type: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_id: string
          photo_url?: string | null
          preferred_date?: string | null
          preferred_window?: string | null
          request_type: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          photo_url?: string | null
          preferred_date?: string | null
          preferred_window?: string | null
          request_type?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
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
      yards: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          market: string
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
          name?: string
          priority_rank?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
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
          zip_code: string
          zone_id: string
        }
        Insert: {
          city_name?: string | null
          county?: string | null
          created_at?: string
          id?: string
          zip_code: string
          zone_id: string
        }
        Update: {
          city_name?: string | null
          county?: string | null
          created_at?: string
          id?: string
          zip_code?: string
          zone_id?: string
        }
        Relationships: [
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
      [_ in never]: never
    }
    Functions: {
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
      approval_status: "pending" | "approved" | "rejected"
      commitment_type: "prepaid" | "contracted"
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
      ],
      approval_status: ["pending", "approved", "rejected"],
      commitment_type: ["prepaid", "contracted"],
      volume_tier: ["tier_a", "tier_b", "tier_c", "tier_d"],
    },
  },
} as const
