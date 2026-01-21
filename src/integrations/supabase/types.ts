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
          company_name: string | null
          completed_at: string | null
          confidence_level: string | null
          confidence_note: string | null
          converted_at: string | null
          created_at: string
          customer_email: string | null
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
          estimated_max: number
          estimated_min: number
          extra_tons_prepurchased: number | null
          extras: string[] | null
          heavy_material_class: string | null
          heavy_material_increment: number | null
          id: string
          is_calsan_fulfillment: boolean
          is_trash_contaminated: boolean | null
          margin: number | null
          material_type: string
          original_material_type: string | null
          placement_lat: number | null
          placement_lng: number | null
          placement_notes: string | null
          placement_type: string | null
          pre_purchase_suggested: boolean | null
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
          selected_vendor_id: string | null
          size_id: string | null
          status: string
          subtotal: number
          suggested_extra_tons: number | null
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
          company_name?: string | null
          completed_at?: string | null
          confidence_level?: string | null
          confidence_note?: string | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
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
          estimated_max: number
          estimated_min: number
          extra_tons_prepurchased?: number | null
          extras?: string[] | null
          heavy_material_class?: string | null
          heavy_material_increment?: number | null
          id?: string
          is_calsan_fulfillment?: boolean
          is_trash_contaminated?: boolean | null
          margin?: number | null
          material_type: string
          original_material_type?: string | null
          placement_lat?: number | null
          placement_lng?: number | null
          placement_notes?: string | null
          placement_type?: string | null
          pre_purchase_suggested?: boolean | null
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
          selected_vendor_id?: string | null
          size_id?: string | null
          status?: string
          subtotal: number
          suggested_extra_tons?: number | null
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
          company_name?: string | null
          completed_at?: string | null
          confidence_level?: string | null
          confidence_note?: string | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
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
          estimated_max?: number
          estimated_min?: number
          extra_tons_prepurchased?: number | null
          extras?: string[] | null
          heavy_material_class?: string | null
          heavy_material_increment?: number | null
          id?: string
          is_calsan_fulfillment?: boolean
          is_trash_contaminated?: boolean | null
          margin?: number | null
          material_type?: string
          original_material_type?: string | null
          placement_lat?: number | null
          placement_lng?: number | null
          placement_notes?: string | null
          placement_type?: string | null
          pre_purchase_suggested?: boolean | null
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
          selected_vendor_id?: string | null
          size_id?: string | null
          status?: string
          subtotal?: number
          suggested_extra_tons?: number | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
