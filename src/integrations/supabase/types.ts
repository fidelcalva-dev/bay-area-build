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
      access_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          notes: string | null
          requested_role: string | null
          resolved_at: string | null
          resolved_by_user_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          requested_role?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          requested_role?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      activation_tokens: {
        Row: {
          attempt_number: number
          channel: string
          clicked_at: string | null
          created_at: string
          customer_id: string
          error_message: string | null
          expires_at: string
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string
          token: string
          used_at: string | null
        }
        Insert: {
          attempt_number?: number
          channel: string
          clicked_at?: string | null
          created_at?: string
          customer_id: string
          error_message?: string | null
          expires_at?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          token?: string
          used_at?: string | null
        }
        Update: {
          attempt_number?: number
          channel?: string
          clicked_at?: string | null
          created_at?: string
          customer_id?: string
          error_message?: string | null
          expires_at?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activation_tokens_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
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
      ads_accounts: {
        Row: {
          account_name: string
          created_at: string
          currency: string
          daily_budget: number
          google_customer_id: string
          id: string
          last_synced_at: string | null
          refresh_token_encrypted: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_name: string
          created_at?: string
          currency?: string
          daily_budget?: number
          google_customer_id: string
          id?: string
          last_synced_at?: string | null
          refresh_token_encrypted?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          created_at?: string
          currency?: string
          daily_budget?: number
          google_customer_id?: string
          id?: string
          last_synced_at?: string | null
          refresh_token_encrypted?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ads_adgroups: {
        Row: {
          adgroup_name: string
          campaign_id: string
          created_at: string
          google_adgroup_id: string | null
          id: string
          keyword_theme: string
          max_cpc: number | null
          size_yd: number | null
          status: string
          updated_at: string
        }
        Insert: {
          adgroup_name: string
          campaign_id: string
          created_at?: string
          google_adgroup_id?: string | null
          id?: string
          keyword_theme: string
          max_cpc?: number | null
          size_yd?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          adgroup_name?: string
          campaign_id?: string
          created_at?: string
          google_adgroup_id?: string | null
          id?: string
          keyword_theme?: string
          max_cpc?: number | null
          size_yd?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_adgroups_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ads_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_ads: {
        Row: {
          ad_type: string
          adgroup_id: string
          created_at: string
          description_1: string
          description_2: string | null
          disapproval_reason: string | null
          display_url: string | null
          final_url: string
          google_ad_id: string | null
          headline_1: string
          headline_2: string | null
          headline_3: string | null
          id: string
          last_refreshed_at: string | null
          quality_score: number | null
          status: string
          updated_at: string
        }
        Insert: {
          ad_type?: string
          adgroup_id: string
          created_at?: string
          description_1: string
          description_2?: string | null
          disapproval_reason?: string | null
          display_url?: string | null
          final_url: string
          google_ad_id?: string | null
          headline_1: string
          headline_2?: string | null
          headline_3?: string | null
          id?: string
          last_refreshed_at?: string | null
          quality_score?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          ad_type?: string
          adgroup_id?: string
          created_at?: string
          description_1?: string
          description_2?: string | null
          disapproval_reason?: string | null
          display_url?: string | null
          final_url?: string
          google_ad_id?: string | null
          headline_1?: string
          headline_2?: string | null
          headline_3?: string | null
          id?: string
          last_refreshed_at?: string | null
          quality_score?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_ads_adgroup_id_fkey"
            columns: ["adgroup_id"]
            isOneToOne: false
            referencedRelation: "ads_adgroups"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_alerts: {
        Row: {
          alert_type: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_resolved: boolean
          message: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_resolved?: boolean
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_resolved?: boolean
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      ads_campaigns: {
        Row: {
          account_id: string | null
          campaign_name: string
          campaign_type: string
          created_at: string
          daily_budget: number
          google_campaign_id: string | null
          id: string
          last_synced_at: string | null
          market_code: string | null
          messaging_tier: string
          pause_reason: string | null
          service_type: string
          size_yd: number | null
          status: string
          target_cpa: number | null
          target_roas: number | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          campaign_name: string
          campaign_type?: string
          created_at?: string
          daily_budget?: number
          google_campaign_id?: string | null
          id?: string
          last_synced_at?: string | null
          market_code?: string | null
          messaging_tier?: string
          pause_reason?: string | null
          service_type?: string
          size_yd?: number | null
          status?: string
          target_cpa?: number | null
          target_roas?: number | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          campaign_name?: string
          campaign_type?: string
          created_at?: string
          daily_budget?: number
          google_campaign_id?: string | null
          id?: string
          last_synced_at?: string | null
          market_code?: string | null
          messaging_tier?: string
          pause_reason?: string | null
          service_type?: string
          size_yd?: number | null
          status?: string
          target_cpa?: number | null
          target_roas?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_campaigns_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "ads_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_campaigns_market_code_fkey"
            columns: ["market_code"]
            isOneToOne: false
            referencedRelation: "ads_markets"
            referencedColumns: ["market_code"]
          },
        ]
      }
      ads_keywords: {
        Row: {
          adgroup_id: string
          created_at: string
          google_keyword_id: string | null
          id: string
          keyword: string
          match_type: string
          max_cpc: number | null
          quality_score: number | null
          status: string
          updated_at: string
        }
        Insert: {
          adgroup_id: string
          created_at?: string
          google_keyword_id?: string | null
          id?: string
          keyword: string
          match_type?: string
          max_cpc?: number | null
          quality_score?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          adgroup_id?: string
          created_at?: string
          google_keyword_id?: string | null
          id?: string
          keyword?: string
          match_type?: string
          max_cpc?: number | null
          quality_score?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_keywords_adgroup_id_fkey"
            columns: ["adgroup_id"]
            isOneToOne: false
            referencedRelation: "ads_adgroups"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_markets: {
        Row: {
          city: string
          created_at: string
          daily_budget: number
          id: string
          inventory_threshold: number
          is_active: boolean
          market_code: string
          priority: number
          state: string
          updated_at: string
          utilization_pause_threshold: number
          utilization_premium_threshold: number
          yard_id: string | null
          zip_list: string[]
        }
        Insert: {
          city: string
          created_at?: string
          daily_budget?: number
          id?: string
          inventory_threshold?: number
          is_active?: boolean
          market_code: string
          priority?: number
          state?: string
          updated_at?: string
          utilization_pause_threshold?: number
          utilization_premium_threshold?: number
          yard_id?: string | null
          zip_list?: string[]
        }
        Update: {
          city?: string
          created_at?: string
          daily_budget?: number
          id?: string
          inventory_threshold?: number
          is_active?: boolean
          market_code?: string
          priority?: number
          state?: string
          updated_at?: string
          utilization_pause_threshold?: number
          utilization_premium_threshold?: number
          yard_id?: string | null
          zip_list?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "ads_markets_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "ads_markets_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_markets_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_metrics: {
        Row: {
          ad_id: string | null
          avg_position: number | null
          campaign_id: string | null
          clicks: number
          conversion_value: number
          conversions: number
          cost: number
          cpa: number | null
          cpc: number | null
          created_at: string
          ctr: number | null
          date: string
          id: string
          impressions: number
          keyword_id: string | null
          roas: number | null
        }
        Insert: {
          ad_id?: string | null
          avg_position?: number | null
          campaign_id?: string | null
          clicks?: number
          conversion_value?: number
          conversions?: number
          cost?: number
          cpa?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          date: string
          id?: string
          impressions?: number
          keyword_id?: string | null
          roas?: number | null
        }
        Update: {
          ad_id?: string | null
          avg_position?: number | null
          campaign_id?: string | null
          clicks?: number
          conversion_value?: number
          conversions?: number
          cost?: number
          cpa?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number
          keyword_id?: string | null
          roas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_metrics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads_ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ads_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_metrics_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "ads_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_negative_keywords: {
        Row: {
          adgroup_id: string | null
          campaign_id: string | null
          created_at: string
          id: string
          keyword: string
          match_type: string
        }
        Insert: {
          adgroup_id?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          keyword: string
          match_type?: string
        }
        Update: {
          adgroup_id?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          keyword?: string
          match_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_negative_keywords_adgroup_id_fkey"
            columns: ["adgroup_id"]
            isOneToOne: false
            referencedRelation: "ads_adgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_negative_keywords_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ads_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          priority: number
          rule_name: string
          rule_type: string
          trigger_count: number
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          priority?: number
          rule_name: string
          rule_type: string
          trigger_count?: number
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          priority?: number
          rule_name?: string
          rule_type?: string
          trigger_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      ads_sync_log: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          metadata: Json | null
          records_created: number | null
          records_paused: number | null
          records_processed: number | null
          records_updated: number | null
          status: string
          sync_type: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_created?: number | null
          records_paused?: number | null
          records_processed?: number | null
          records_updated?: number | null
          status: string
          sync_type: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_created?: number | null
          records_paused?: number | null
          records_processed?: number | null
          records_updated?: number | null
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      agent_availability: {
        Row: {
          calls_today: number | null
          current_call_id: string | null
          id: string
          last_call_ended_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calls_today?: number | null
          current_call_id?: string | null
          id?: string
          last_call_ended_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calls_today?: number | null
          current_call_id?: string | null
          id?: string
          last_call_ended_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_availability_current_call_id_fkey"
            columns: ["current_call_id"]
            isOneToOne: false
            referencedRelation: "call_events"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_actions: {
        Row: {
          action_type: string
          created_at: string
          decision_id: string
          id: string
          request_json: Json | null
          result_json: Json | null
          status: string
        }
        Insert: {
          action_type: string
          created_at?: string
          decision_id: string
          id?: string
          request_json?: Json | null
          result_json?: Json | null
          status?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          decision_id?: string
          id?: string
          request_json?: Json | null
          result_json?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_actions_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "ai_decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_messages: {
        Row: {
          created_at: string
          id: string
          message_text: string
          meta_json: Json | null
          role: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          meta_json?: Json | null
          role: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          meta_json?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          capture_ip: string | null
          capture_user_agent: string | null
          context_json: Json | null
          created_at: string
          customer_id: string | null
          id: string
          landing_url: string | null
          last_event_at: string
          lead_id: string | null
          referrer_url: string | null
          session_token: string
          started_at: string
          status: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          capture_ip?: string | null
          capture_user_agent?: string | null
          context_json?: Json | null
          created_at?: string
          customer_id?: string | null
          id?: string
          landing_url?: string | null
          last_event_at?: string
          lead_id?: string | null
          referrer_url?: string | null
          session_token?: string
          started_at?: string
          status?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          capture_ip?: string | null
          capture_user_agent?: string | null
          context_json?: Json | null
          created_at?: string
          customer_id?: string | null
          id?: string
          landing_url?: string | null
          last_event_at?: string
          lead_id?: string | null
          referrer_url?: string | null
          session_token?: string
          started_at?: string
          status?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_sessions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_control_actions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          message_id: string | null
          payload_json: Json
          requires_confirmation: boolean
          session_id: string
          status: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          message_id?: string | null
          payload_json?: Json
          requires_confirmation?: boolean
          session_id: string
          status?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          message_id?: string | null
          payload_json?: Json
          requires_confirmation?: boolean
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_control_actions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ai_control_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_control_actions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_control_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_control_knowledge: {
        Row: {
          category: string
          content_markdown: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content_markdown: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_markdown?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_control_messages: {
        Row: {
          created_at: string
          id: string
          message_text: string
          response_json: Json
          role: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          response_json?: Json
          role: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          response_json?: Json
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_control_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_control_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_control_sessions: {
        Row: {
          context_snapshot_json: Json
          created_at: string
          current_entity_id: string | null
          current_entity_type: string | null
          current_route: string | null
          id: string
          last_active_at: string
          mode: string
          started_at: string
          user_id: string
          user_role: string
        }
        Insert: {
          context_snapshot_json?: Json
          created_at?: string
          current_entity_id?: string | null
          current_entity_type?: string | null
          current_route?: string | null
          id?: string
          last_active_at?: string
          mode?: string
          started_at?: string
          user_id: string
          user_role: string
        }
        Update: {
          context_snapshot_json?: Json
          created_at?: string
          current_entity_id?: string | null
          current_entity_type?: string | null
          current_route?: string | null
          id?: string
          last_active_at?: string
          mode?: string
          started_at?: string
          user_id?: string
          user_role?: string
        }
        Relationships: []
      }
      ai_decisions: {
        Row: {
          actions_json: Json | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          decision_type: string
          entity_id: string | null
          entity_type: string | null
          id: string
          job_id: string | null
          recommendation: string | null
          requires_approval: boolean
          severity: string
          summary: string
        }
        Insert: {
          actions_json?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          decision_type: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          job_id?: string | null
          recommendation?: string | null
          requires_approval?: boolean
          severity?: string
          summary: string
        }
        Update: {
          actions_json?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          decision_type?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          job_id?: string | null
          recommendation?: string | null
          requires_approval?: boolean
          severity?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_decisions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "ai_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_entry_events: {
        Row: {
          action_type: string
          created_at: string
          id: string
          ip_hash: string | null
          metadata: Json | null
          referrer: string | null
          time_on_page_ms: number | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          referrer?: string | null
          time_on_page_ms?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          referrer?: string | null
          time_on_page_ms?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      ai_entry_sessions: {
        Row: {
          created_at: string
          events: Json | null
          id: string
          ip_hash: string | null
          lead_id: string | null
          path_selected: string | null
          referrer: string | null
          session_id: string | null
          started_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          events?: Json | null
          id?: string
          ip_hash?: string | null
          lead_id?: string | null
          path_selected?: string | null
          referrer?: string | null
          session_id?: string | null
          started_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          events?: Json | null
          id?: string
          ip_hash?: string | null
          lead_id?: string | null
          path_selected?: string | null
          referrer?: string | null
          session_id?: string | null
          started_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      ai_jobs: {
        Row: {
          attempt_count: number
          created_at: string
          id: string
          job_type: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          payload: Json | null
          priority: number
          scheduled_for: string
          status: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          id?: string
          job_type: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          payload?: Json | null
          priority?: number
          scheduled_for?: string
          status?: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          id?: string
          job_type?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          payload?: Json | null
          priority?: number
          scheduled_for?: string
          status?: string
          updated_at?: string
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
            foreignKeyName: "ar_actions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "ar_actions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "ar_actions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_actions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
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
          current_run_id: string | null
          current_yard_id: string | null
          days_out: number
          deployed_at: string | null
          home_yard_id: string
          id: string
          last_inspection_at: string | null
          last_movement_at: string | null
          needs_rebalance: boolean | null
          overdue_notified: boolean | null
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
          current_run_id?: string | null
          current_yard_id?: string | null
          days_out?: number
          deployed_at?: string | null
          home_yard_id: string
          id?: string
          last_inspection_at?: string | null
          last_movement_at?: string | null
          needs_rebalance?: boolean | null
          overdue_notified?: boolean | null
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
          current_run_id?: string | null
          current_yard_id?: string | null
          days_out?: number
          deployed_at?: string | null
          home_yard_id?: string
          id?: string
          last_inspection_at?: string | null
          last_movement_at?: string | null
          needs_rebalance?: boolean | null
          overdue_notified?: boolean | null
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "assets_dumpsters_current_order_id_fkey"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_dumpsters_current_order_id_fkey"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "assets_dumpsters_current_run_id_fkey"
            columns: ["current_run_id"]
            isOneToOne: false
            referencedRelation: "runs"
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
            foreignKeyName: "assets_dumpsters_current_yard_id_fkey"
            columns: ["current_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
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
            foreignKeyName: "assets_dumpsters_home_yard_id_fkey"
            columns: ["home_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
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
      calculator_estimates: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          blocked_reason: string | null
          created_at: string | null
          created_by: string | null
          customer_price: number | null
          customer_tier: string | null
          customer_type: string
          destination_address: string | null
          destination_lat: number | null
          destination_lng: number | null
          discount_reason: string | null
          discount_type: string | null
          discount_value: number | null
          dumpster_size: number
          facility_id: string | null
          final_margin_pct: number | null
          final_price: number | null
          id: string
          internal_cost: number | null
          is_feasible: boolean | null
          is_same_day: boolean | null
          linked_lead_id: string | null
          linked_order_id: string | null
          linked_quote_id: string | null
          margin_class: string | null
          margin_pct: number | null
          market_code: string
          material_category: string
          recommendations: Json | null
          requires_approval: boolean | null
          route_details: Json | null
          service_type: string
          sla_class: string | null
          time_breakdown: Json | null
          total_time_minutes: number | null
          traffic_mode: string | null
          updated_at: string | null
          warnings: string[] | null
          yard_id: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_price?: number | null
          customer_tier?: string | null
          customer_type: string
          destination_address?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          discount_reason?: string | null
          discount_type?: string | null
          discount_value?: number | null
          dumpster_size: number
          facility_id?: string | null
          final_margin_pct?: number | null
          final_price?: number | null
          id?: string
          internal_cost?: number | null
          is_feasible?: boolean | null
          is_same_day?: boolean | null
          linked_lead_id?: string | null
          linked_order_id?: string | null
          linked_quote_id?: string | null
          margin_class?: string | null
          margin_pct?: number | null
          market_code: string
          material_category: string
          recommendations?: Json | null
          requires_approval?: boolean | null
          route_details?: Json | null
          service_type: string
          sla_class?: string | null
          time_breakdown?: Json | null
          total_time_minutes?: number | null
          traffic_mode?: string | null
          updated_at?: string | null
          warnings?: string[] | null
          yard_id?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_price?: number | null
          customer_tier?: string | null
          customer_type?: string
          destination_address?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          discount_reason?: string | null
          discount_type?: string | null
          discount_value?: number | null
          dumpster_size?: number
          facility_id?: string | null
          final_margin_pct?: number | null
          final_price?: number | null
          id?: string
          internal_cost?: number | null
          is_feasible?: boolean | null
          is_same_day?: boolean | null
          linked_lead_id?: string | null
          linked_order_id?: string | null
          linked_quote_id?: string | null
          margin_class?: string | null
          margin_pct?: number | null
          market_code?: string
          material_category?: string
          recommendations?: Json | null
          requires_approval?: boolean | null
          route_details?: Json | null
          service_type?: string
          sla_class?: string | null
          time_breakdown?: Json | null
          total_time_minutes?: number | null
          traffic_mode?: string | null
          updated_at?: string | null
          warnings?: string[] | null
          yard_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculator_estimates_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "calculator_estimates_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculator_estimates_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
            referencedColumns: ["id"]
          },
        ]
      }
      calculator_logs: {
        Row: {
          action_type: string
          created_at: string | null
          discount_applied: Json | null
          estimate_id: string | null
          id: string
          inputs_json: Json
          ip_address: string | null
          linked_entity_id: string | null
          linked_entity_type: string | null
          notes: string | null
          outputs_json: Json | null
          override_details: Json | null
          user_agent: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          discount_applied?: Json | null
          estimate_id?: string | null
          id?: string
          inputs_json: Json
          ip_address?: string | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          notes?: string | null
          outputs_json?: Json | null
          override_details?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          discount_applied?: Json | null
          estimate_id?: string | null
          id?: string
          inputs_json?: Json
          ip_address?: string | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          notes?: string | null
          outputs_json?: Json | null
          override_details?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculator_logs_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "calculator_estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      call_ai_events: {
        Row: {
          agent_user_id: string | null
          call_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["call_ai_event_type"]
          id: string
          payload_json: Json | null
        }
        Insert: {
          agent_user_id?: string | null
          call_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["call_ai_event_type"]
          id?: string
          payload_json?: Json | null
        }
        Update: {
          agent_user_id?: string | null
          call_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["call_ai_event_type"]
          id?: string
          payload_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "call_ai_events_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "call_events"
            referencedColumns: ["id"]
          },
        ]
      }
      call_ai_insights: {
        Row: {
          call_id: string
          churn_risk_score: number | null
          competitor_mentions: Json | null
          created_at: string
          detected_material_category: string | null
          detected_size_preference: number | null
          detected_topics_json: Json | null
          detected_zip_code: string | null
          id: string
          intent_score: number | null
          is_final: boolean | null
          latency_ms: number | null
          model_used: string | null
          next_best_action: string | null
          objection_tags_json: Json | null
          risk_flags_json: Json | null
          suggested_responses_json: Json | null
          summary_bullets: Json | null
          tokens_used: number | null
          updated_at: string
          urgency_score: number | null
        }
        Insert: {
          call_id: string
          churn_risk_score?: number | null
          competitor_mentions?: Json | null
          created_at?: string
          detected_material_category?: string | null
          detected_size_preference?: number | null
          detected_topics_json?: Json | null
          detected_zip_code?: string | null
          id?: string
          intent_score?: number | null
          is_final?: boolean | null
          latency_ms?: number | null
          model_used?: string | null
          next_best_action?: string | null
          objection_tags_json?: Json | null
          risk_flags_json?: Json | null
          suggested_responses_json?: Json | null
          summary_bullets?: Json | null
          tokens_used?: number | null
          updated_at?: string
          urgency_score?: number | null
        }
        Update: {
          call_id?: string
          churn_risk_score?: number | null
          competitor_mentions?: Json | null
          created_at?: string
          detected_material_category?: string | null
          detected_size_preference?: number | null
          detected_topics_json?: Json | null
          detected_zip_code?: string | null
          id?: string
          intent_score?: number | null
          is_final?: boolean | null
          latency_ms?: number | null
          model_used?: string | null
          next_best_action?: string | null
          objection_tags_json?: Json | null
          risk_flags_json?: Json | null
          suggested_responses_json?: Json | null
          summary_bullets?: Json | null
          tokens_used?: number | null
          updated_at?: string
          urgency_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_ai_insights_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "call_events"
            referencedColumns: ["id"]
          },
        ]
      }
      call_assignments: {
        Row: {
          accepted_at: string | null
          call_id: string
          created_at: string | null
          declined_at: string | null
          ended_at: string | null
          id: string
          offered_at: string | null
          role: Database["public"]["Enums"]["phone_purpose"]
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          call_id: string
          created_at?: string | null
          declined_at?: string | null
          ended_at?: string | null
          id?: string
          offered_at?: string | null
          role: Database["public"]["Enums"]["phone_purpose"]
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          call_id?: string
          created_at?: string | null
          declined_at?: string | null
          ended_at?: string | null
          id?: string
          offered_at?: string | null
          role?: Database["public"]["Enums"]["phone_purpose"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_assignments_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "call_events"
            referencedColumns: ["id"]
          },
        ]
      }
      call_events: {
        Row: {
          answered_at: string | null
          assigned_user_id: string | null
          call_source: string | null
          call_status: Database["public"]["Enums"]["call_status"]
          caller_name: string | null
          contact_id: string | null
          created_at: string | null
          direction: Database["public"]["Enums"]["call_direction"]
          duration_seconds: number | null
          ended_at: string | null
          from_number: string
          id: string
          imported_at: string | null
          is_historical: boolean | null
          notes: string | null
          order_id: string | null
          phone_number_id: string | null
          recording_sid: string | null
          recording_url: string | null
          started_at: string | null
          to_number: string
          twilio_call_sid: string | null
        }
        Insert: {
          answered_at?: string | null
          assigned_user_id?: string | null
          call_source?: string | null
          call_status?: Database["public"]["Enums"]["call_status"]
          caller_name?: string | null
          contact_id?: string | null
          created_at?: string | null
          direction: Database["public"]["Enums"]["call_direction"]
          duration_seconds?: number | null
          ended_at?: string | null
          from_number: string
          id?: string
          imported_at?: string | null
          is_historical?: boolean | null
          notes?: string | null
          order_id?: string | null
          phone_number_id?: string | null
          recording_sid?: string | null
          recording_url?: string | null
          started_at?: string | null
          to_number: string
          twilio_call_sid?: string | null
        }
        Update: {
          answered_at?: string | null
          assigned_user_id?: string | null
          call_source?: string | null
          call_status?: Database["public"]["Enums"]["call_status"]
          caller_name?: string | null
          contact_id?: string | null
          created_at?: string | null
          direction?: Database["public"]["Enums"]["call_direction"]
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string
          id?: string
          imported_at?: string | null
          is_historical?: boolean | null
          notes?: string | null
          order_id?: string | null
          phone_number_id?: string | null
          recording_sid?: string | null
          recording_url?: string | null
          started_at?: string | null
          to_number?: string
          twilio_call_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "call_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "call_events_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      call_followups: {
        Row: {
          call_id: string
          channel: string
          created_at: string
          discarded_at: string | null
          discarded_by: string | null
          draft_body: string
          id: string
          sent_at: string | null
          sent_by: string | null
          status: Database["public"]["Enums"]["call_followup_status"]
          subject: string | null
          updated_at: string
        }
        Insert: {
          call_id: string
          channel: string
          created_at?: string
          discarded_at?: string | null
          discarded_by?: string | null
          draft_body: string
          id?: string
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["call_followup_status"]
          subject?: string | null
          updated_at?: string
        }
        Update: {
          call_id?: string
          channel?: string
          created_at?: string
          discarded_at?: string | null
          discarded_by?: string | null
          draft_body?: string
          id?: string
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["call_followup_status"]
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_followups_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "call_events"
            referencedColumns: ["id"]
          },
        ]
      }
      call_history_imports: {
        Row: {
          errors: Json | null
          filename: string | null
          id: string
          imported_at: string | null
          imported_by: string | null
          records_imported: number | null
          records_skipped: number | null
          records_total: number | null
        }
        Insert: {
          errors?: Json | null
          filename?: string | null
          id?: string
          imported_at?: string | null
          imported_by?: string | null
          records_imported?: number | null
          records_skipped?: number | null
          records_total?: number | null
        }
        Update: {
          errors?: Json | null
          filename?: string | null
          id?: string
          imported_at?: string | null
          imported_by?: string | null
          records_imported?: number | null
          records_skipped?: number | null
          records_total?: number | null
        }
        Relationships: []
      }
      call_routing_rules: {
        Row: {
          business_hours_only: boolean | null
          conditions: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          max_ring_time: number | null
          name: string
          overflow_to_voicemail: boolean | null
          priority: number | null
          purpose: Database["public"]["Enums"]["phone_purpose"]
          round_robin: boolean | null
          updated_at: string | null
        }
        Insert: {
          business_hours_only?: boolean | null
          conditions?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_ring_time?: number | null
          name: string
          overflow_to_voicemail?: boolean | null
          priority?: number | null
          purpose: Database["public"]["Enums"]["phone_purpose"]
          round_robin?: boolean | null
          updated_at?: string | null
        }
        Update: {
          business_hours_only?: boolean | null
          conditions?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_ring_time?: number | null
          name?: string
          overflow_to_voicemail?: boolean | null
          priority?: number | null
          purpose?: Database["public"]["Enums"]["phone_purpose"]
          round_robin?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      call_tasks: {
        Row: {
          assigned_to: string | null
          call_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          priority: number | null
          scheduled_for: string | null
          task_type: string
        }
        Insert: {
          assigned_to?: string | null
          call_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          scheduled_for?: string | null
          task_type: string
        }
        Update: {
          assigned_to?: string | null
          call_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          scheduled_for?: string | null
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_tasks_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "call_events"
            referencedColumns: ["id"]
          },
        ]
      }
      call_transcripts: {
        Row: {
          call_id: string
          confidence_avg: number | null
          created_at: string
          id: string
          language: string | null
          provider: string
          speaker_segments: Json | null
          status: Database["public"]["Enums"]["transcript_status"]
          transcript_text: string | null
          updated_at: string
          word_count: number | null
        }
        Insert: {
          call_id: string
          confidence_avg?: number | null
          created_at?: string
          id?: string
          language?: string | null
          provider?: string
          speaker_segments?: Json | null
          status?: Database["public"]["Enums"]["transcript_status"]
          transcript_text?: string | null
          updated_at?: string
          word_count?: number | null
        }
        Update: {
          call_id?: string
          confidence_avg?: number | null
          created_at?: string
          id?: string
          language?: string | null
          provider?: string
          speaker_segments?: Json | null
          status?: Database["public"]["Enums"]["transcript_status"]
          transcript_text?: string | null
          updated_at?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_transcripts_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "call_events"
            referencedColumns: ["id"]
          },
        ]
      }
      camera_alert_rules: {
        Row: {
          auto_create_issue: boolean
          created_at: string
          event_type: string
          id: string
          is_active: boolean
          notify_dispatch: boolean
          notify_safety: boolean
          severity: string
        }
        Insert: {
          auto_create_issue?: boolean
          created_at?: string
          event_type: string
          id?: string
          is_active?: boolean
          notify_dispatch?: boolean
          notify_safety?: boolean
          severity?: string
        }
        Update: {
          auto_create_issue?: boolean
          created_at?: string
          event_type?: string
          id?: string
          is_active?: boolean
          notify_dispatch?: boolean
          notify_safety?: boolean
          severity?: string
        }
        Relationships: []
      }
      camera_clips: {
        Row: {
          created_at: string
          duration_seconds: number | null
          event_id: string
          file_size_bytes: number | null
          file_url: string
          id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          event_id: string
          file_size_bytes?: number | null
          file_url: string
          id?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          event_id?: string
          file_size_bytes?: number | null
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camera_clips_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "camera_events"
            referencedColumns: ["id"]
          },
        ]
      }
      camera_devices: {
        Row: {
          created_at: string | null
          device_model: string | null
          device_serial: string
          firmware_version: string | null
          id: string
          installed_at: string | null
          is_active: boolean | null
          last_heartbeat_at: string | null
          mount_position: string | null
          provider_id: string | null
          truck_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_model?: string | null
          device_serial: string
          firmware_version?: string | null
          id?: string
          installed_at?: string | null
          is_active?: boolean | null
          last_heartbeat_at?: string | null
          mount_position?: string | null
          provider_id?: string | null
          truck_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_model?: string | null
          device_serial?: string
          firmware_version?: string | null
          id?: string
          installed_at?: string | null
          is_active?: boolean | null
          last_heartbeat_at?: string | null
          mount_position?: string | null
          provider_id?: string | null
          truck_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camera_devices_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "camera_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camera_devices_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      camera_events: {
        Row: {
          created_at: string
          device_id: string | null
          driver_id: string | null
          event_timestamp: string
          event_type: string
          gps_lat: number | null
          gps_lng: number | null
          heading: number | null
          id: string
          metadata: Json | null
          provider_id: string | null
          run_id: string | null
          severity: string | null
          speed_mph: number | null
          thumbnail_url: string | null
          truck_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          driver_id?: string | null
          event_timestamp?: string
          event_type?: string
          gps_lat?: number | null
          gps_lng?: number | null
          heading?: number | null
          id?: string
          metadata?: Json | null
          provider_id?: string | null
          run_id?: string | null
          severity?: string | null
          speed_mph?: number | null
          thumbnail_url?: string | null
          truck_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          driver_id?: string | null
          event_timestamp?: string
          event_type?: string
          gps_lat?: number | null
          gps_lng?: number | null
          heading?: number | null
          id?: string
          metadata?: Json | null
          provider_id?: string | null
          run_id?: string | null
          severity?: string | null
          speed_mph?: number | null
          thumbnail_url?: string | null
          truck_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camera_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "camera_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camera_events_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camera_events_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "camera_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camera_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camera_events_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      camera_providers: {
        Row: {
          api_base_url: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          api_base_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          api_base_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: []
      }
      cart_audit_log: {
        Row: {
          action: string
          cart_id: string
          created_at: string
          details_json: Json | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          cart_id: string
          created_at?: string
          details_json?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          cart_id?: string
          created_at?: string
          details_json?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_audit_log_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "order_carts"
            referencedColumns: ["id"]
          },
        ]
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
      chat_conversations: {
        Row: {
          context_json: Json | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          escalation_reason: string | null
          handled_at: string | null
          handled_by: string | null
          id: string
          lead_id: string | null
          session_id: string | null
          source: string | null
          status: string
          updated_at: string
          visitor_id: string | null
        }
        Insert: {
          context_json?: Json | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          escalation_reason?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          lead_id?: string | null
          session_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          visitor_id?: string | null
        }
        Update: {
          context_json?: Json | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          escalation_reason?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          lead_id?: string | null
          session_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          next_action: string | null
          quick_replies: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          next_action?: string | null
          quick_replies?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          next_action?: string | null
          quick_replies?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
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
      compensation_adjustments: {
        Row: {
          adjustment_type: Database["public"]["Enums"]["adjustment_type"]
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          id: string
          period: string
          reason: string
          related_entity_id: string | null
          related_entity_type: string | null
          status: Database["public"]["Enums"]["earning_status"]
          user_id: string
        }
        Insert: {
          adjustment_type: Database["public"]["Enums"]["adjustment_type"]
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          period: string
          reason: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: Database["public"]["Enums"]["earning_status"]
          user_id: string
        }
        Update: {
          adjustment_type?: Database["public"]["Enums"]["adjustment_type"]
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          period?: string
          reason?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: Database["public"]["Enums"]["earning_status"]
          user_id?: string
        }
        Relationships: []
      }
      compensation_audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          details_json: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          details_json?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          details_json?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      compensation_earnings: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          calculation_details: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          gross_amount: number
          id: string
          paid_at: string | null
          payout_amount: number
          period: string
          plan_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          rule_id: string | null
          status: Database["public"]["Enums"]["earning_status"]
          updated_at: string
          user_id: string
          void_reason: string | null
          voided_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          calculation_details?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          gross_amount: number
          id?: string
          paid_at?: string | null
          payout_amount: number
          period: string
          plan_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          rule_id?: string | null
          status?: Database["public"]["Enums"]["earning_status"]
          updated_at?: string
          user_id: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          calculation_details?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          gross_amount?: number
          id?: string
          paid_at?: string | null
          payout_amount?: number
          period?: string
          plan_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          rule_id?: string | null
          status?: Database["public"]["Enums"]["earning_status"]
          updated_at?: string
          user_id?: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compensation_earnings_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "compensation_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensation_earnings_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "compensation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      compensation_periods: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          created_at: string
          id: string
          period: string
          period_end: string
          period_start: string
          status: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          period: string
          period_end: string
          period_start: string
          status?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          period?: string
          period_end?: string
          period_start?: string
          status?: string
        }
        Relationships: []
      }
      compensation_plans: {
        Row: {
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at: string
          created_by: string | null
          description: string | null
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean
          plan_name: string
          role: Database["public"]["Enums"]["app_role"]
          rules_json: Json
          updated_at: string
        }
        Insert: {
          commission_type?: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          plan_name: string
          role: Database["public"]["Enums"]["app_role"]
          rules_json?: Json
          updated_at?: string
        }
        Update: {
          commission_type?: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          plan_name?: string
          role?: Database["public"]["Enums"]["app_role"]
          rules_json?: Json
          updated_at?: string
        }
        Relationships: []
      }
      compensation_rules: {
        Row: {
          condition_json: Json
          created_at: string
          id: string
          is_active: boolean
          payout_formula_json: Json
          plan_id: string
          priority: number
          rule_name: string
          trigger_event: Database["public"]["Enums"]["compensation_trigger"]
          updated_at: string
        }
        Insert: {
          condition_json?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          payout_formula_json?: Json
          plan_id: string
          priority?: number
          rule_name: string
          trigger_event: Database["public"]["Enums"]["compensation_trigger"]
          updated_at?: string
        }
        Update: {
          condition_json?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          payout_formula_json?: Json
          plan_id?: string
          priority?: number
          rule_name?: string
          trigger_event?: Database["public"]["Enums"]["compensation_trigger"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compensation_rules_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "compensation_plans"
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
          is_sensitive: boolean | null
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
          is_sensitive?: boolean | null
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
          is_sensitive?: boolean | null
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
      contacts: {
        Row: {
          city: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          job_title: string | null
          notes: string | null
          phone: string | null
          phone_normalized: string | null
          sms_opt_out: boolean | null
          sms_opt_out_at: string | null
          state: string | null
          street_address: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          job_title?: string | null
          notes?: string | null
          phone?: string | null
          phone_normalized?: string | null
          sms_opt_out?: boolean | null
          sms_opt_out_at?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          job_title?: string | null
          notes?: string | null
          phone?: string | null
          phone_normalized?: string | null
          sms_opt_out?: boolean | null
          sms_opt_out_at?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
      crm_notes: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          entity_id: string
          entity_type: string
          id: string
          is_internal: boolean | null
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_internal?: boolean | null
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_internal?: boolean | null
        }
        Relationships: []
      }
      crm_tasks: {
        Row: {
          assigned_team: string | null
          assigned_user_id: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          priority: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_team?: string | null
          assigned_user_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          priority?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_team?: string | null
          assigned_user_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          priority?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_category_visibility: {
        Row: {
          category_code: string
          created_at: string | null
          customer_type: string
          display_order: number | null
          id: string
          is_visible: boolean | null
        }
        Insert: {
          category_code: string
          created_at?: string | null
          customer_type: string
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
        }
        Update: {
          category_code?: string
          created_at?: string | null
          customer_type?: string
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_category_visibility_category_code_fkey"
            columns: ["category_code"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["category_code"]
          },
        ]
      }
      customer_health_events: {
        Row: {
          created_at: string
          customer_id: string
          delta_score: number
          details_json: Json | null
          event_type: Database["public"]["Enums"]["health_event_type"]
          id: string
          score_after: number | null
          score_before: number | null
          severity: Database["public"]["Enums"]["health_event_severity"]
          source_entity_id: string | null
          source_entity_type: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          delta_score?: number
          details_json?: Json | null
          event_type: Database["public"]["Enums"]["health_event_type"]
          id?: string
          score_after?: number | null
          score_before?: number | null
          severity?: Database["public"]["Enums"]["health_event_severity"]
          source_entity_id?: string | null
          source_entity_type?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          delta_score?: number
          details_json?: Json | null
          event_type?: Database["public"]["Enums"]["health_event_type"]
          id?: string
          score_after?: number | null
          score_before?: number | null
          severity?: Database["public"]["Enums"]["health_event_severity"]
          source_entity_id?: string | null
          source_entity_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_health_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_health_rules: {
        Row: {
          category: string
          created_at: string
          delta_score: number
          description: string
          event_type: Database["public"]["Enums"]["health_event_type"]
          id: string
          is_active: boolean
          rule_key: string
          threshold_json: Json | null
          updated_at: string
          weight: number
        }
        Insert: {
          category?: string
          created_at?: string
          delta_score: number
          description: string
          event_type: Database["public"]["Enums"]["health_event_type"]
          id?: string
          is_active?: boolean
          rule_key: string
          threshold_json?: Json | null
          updated_at?: string
          weight?: number
        }
        Update: {
          category?: string
          created_at?: string
          delta_score?: number
          description?: string
          event_type?: Database["public"]["Enums"]["health_event_type"]
          id?: string
          is_active?: boolean
          rule_key?: string
          threshold_json?: Json | null
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      customer_health_scores: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          last_updated_at: string
          negative_drivers: Json | null
          positive_drivers: Json | null
          score: number
          score_breakdown_json: Json | null
          status: Database["public"]["Enums"]["health_status"]
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          last_updated_at?: string
          negative_drivers?: Json | null
          positive_drivers?: Json | null
          score?: number
          score_breakdown_json?: Json | null
          status?: Database["public"]["Enums"]["health_status"]
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          last_updated_at?: string
          negative_drivers?: Json | null
          positive_drivers?: Json | null
          score?: number
          score_breakdown_json?: Json | null
          status?: Database["public"]["Enums"]["health_status"]
        }
        Relationships: [
          {
            foreignKeyName: "customer_health_scores_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_material_offers: {
        Row: {
          created_at: string | null
          customer_type: string
          id: string
          is_hidden: boolean | null
          is_recommended: boolean | null
          material_code: string
          priority: number | null
          project_category_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_type: string
          id?: string
          is_hidden?: boolean | null
          is_recommended?: boolean | null
          material_code: string
          priority?: number | null
          project_category_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_type?: string
          id?: string
          is_hidden?: boolean | null
          is_recommended?: boolean | null
          material_code?: string
          priority?: number | null
          project_category_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_material_offers_material_code_fkey"
            columns: ["material_code"]
            isOneToOne: false
            referencedRelation: "material_catalog"
            referencedColumns: ["material_code"]
          },
          {
            foreignKeyName: "customer_material_offers_project_category_code_fkey"
            columns: ["project_category_code"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["category_code"]
          },
        ]
      }
      customer_portal_links: {
        Row: {
          created_at: string
          customer_id: string | null
          expires_at: string
          id: string
          last_used_at: string | null
          order_id: string
          token_hash: string
          trigger_source: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          expires_at?: string
          id?: string
          last_used_at?: string | null
          order_id: string
          token_hash: string
          trigger_source?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          expires_at?: string
          id?: string
          last_used_at?: string | null
          order_id?: string
          token_hash?: string
          trigger_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_portal_links_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_portal_links_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "customer_portal_links_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_portal_links_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          company_name: string | null
          confidence_score: number
          contact_id: string | null
          created_at: string | null
          customer_type: string
          detected_signals_json: Json | null
          email: string | null
          id: string
          session_id: string | null
          updated_at: string | null
          was_auto_detected: boolean | null
          was_overridden: boolean | null
        }
        Insert: {
          company_name?: string | null
          confidence_score?: number
          contact_id?: string | null
          created_at?: string | null
          customer_type?: string
          detected_signals_json?: Json | null
          email?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          was_auto_detected?: boolean | null
          was_overridden?: boolean | null
        }
        Update: {
          company_name?: string | null
          confidence_score?: number
          contact_id?: string | null
          created_at?: string | null
          customer_type?: string
          detected_signals_json?: Json | null
          email?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          was_auto_detected?: boolean | null
          was_overridden?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_contact_id_fkey"
            columns: ["contact_id"]
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
      customer_type_rules: {
        Row: {
          conditions_json: Json
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          output_customer_type: string
          rule_code: string
          rule_name: string
          signal_type: string
          updated_at: string | null
          weight: number
        }
        Insert: {
          conditions_json?: Json
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          output_customer_type: string
          rule_code: string
          rule_name: string
          signal_type: string
          updated_at?: string | null
          weight?: number
        }
        Update: {
          conditions_json?: Json
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          output_customer_type?: string
          rule_code?: string
          rule_name?: string
          signal_type?: string
          updated_at?: string | null
          weight?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          activated_at: string | null
          activation_attempts: number
          activation_status: string
          billing_address: string | null
          billing_email: string | null
          billing_phone: string | null
          company_name: string | null
          contact_name: string | null
          created_at: string
          customer_type: string
          id: string
          is_active: boolean
          notes: string | null
          phone: string | null
          sms_opt_out: boolean | null
          sms_opt_out_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          activation_attempts?: number
          activation_status?: string
          billing_address?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          customer_type?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          sms_opt_out?: boolean | null
          sms_opt_out_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          activation_attempts?: number
          activation_status?: string
          billing_address?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          customer_type?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          sms_opt_out?: boolean | null
          sms_opt_out_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      dispatch_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          message: string | null
          metadata: Json | null
          order_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          run_id: string | null
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message?: string | null
          metadata?: Json | null
          order_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          run_id?: string | null
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message?: string | null
          metadata?: Json | null
          order_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          run_id?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_alerts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "dispatch_alerts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_alerts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "dispatch_alerts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      disposal_item_catalog: {
        Row: {
          created_at: string
          default_material_code: string | null
          display_name: string
          display_order: number
          forces_category: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          item_code: string
          item_group: string
          updated_at: string
          volume_points: number
          weight_class: string
        }
        Insert: {
          created_at?: string
          default_material_code?: string | null
          display_name: string
          display_order?: number
          forces_category?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          item_code: string
          item_group: string
          updated_at?: string
          volume_points?: number
          weight_class?: string
        }
        Update: {
          created_at?: string
          default_material_code?: string | null
          display_name?: string
          display_order?: number
          forces_category?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          item_code?: string
          item_group?: string
          updated_at?: string
          volume_points?: number
          weight_class?: string
        }
        Relationships: []
      }
      disposal_rates: {
        Row: {
          created_at: string
          disposal_site_id: string
          flat_fee: number | null
          id: string
          is_active: boolean
          last_verified_at: string | null
          material_type: string
          minimum_fee: number | null
          notes: string | null
          price_per_ton: number | null
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          disposal_site_id: string
          flat_fee?: number | null
          id?: string
          is_active?: boolean
          last_verified_at?: string | null
          material_type: string
          minimum_fee?: number | null
          notes?: string | null
          price_per_ton?: number | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          disposal_site_id?: string
          flat_fee?: number | null
          id?: string
          is_active?: boolean
          last_verified_at?: string | null
          material_type?: string
          minimum_fee?: number | null
          notes?: string | null
          price_per_ton?: number | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disposal_rates_disposal_site_id_fkey"
            columns: ["disposal_site_id"]
            isOneToOne: false
            referencedRelation: "disposal_sites"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "disposal_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disposal_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
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
      disposal_sites: {
        Row: {
          address: string
          city: string
          compliance_rating: number | null
          created_at: string
          hours: string | null
          id: string
          is_active: boolean
          lat: number | null
          lng: number | null
          materials_accepted: string[] | null
          name: string
          notes: string | null
          phone: string | null
          state: string
          ticket_required: boolean
          type: string
          typical_wait_time_min: number | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address: string
          city: string
          compliance_rating?: number | null
          created_at?: string
          hours?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          materials_accepted?: string[] | null
          name: string
          notes?: string | null
          phone?: string | null
          state?: string
          ticket_required?: boolean
          type?: string
          typical_wait_time_min?: number | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string
          city?: string
          compliance_rating?: number | null
          created_at?: string
          hours?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          materials_accepted?: string[] | null
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string
          ticket_required?: boolean
          type?: string
          typical_wait_time_min?: number | null
          updated_at?: string
          zip?: string | null
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
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
      driver_locations: {
        Row: {
          accuracy_m: number | null
          driver_id: string
          heading: number | null
          id: string
          lat: number
          lng: number
          recorded_at: string
          source: string
          speed_mph: number | null
          truck_id: string | null
        }
        Insert: {
          accuracy_m?: number | null
          driver_id: string
          heading?: number | null
          id?: string
          lat: number
          lng: number
          recorded_at?: string
          source?: string
          speed_mph?: number | null
          truck_id?: string | null
        }
        Update: {
          accuracy_m?: number | null
          driver_id?: string
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          recorded_at?: string
          source?: string
          speed_mph?: number | null
          truck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "driver_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
      }
      driver_truck_assignments: {
        Row: {
          assigned_at: string
          created_at: string
          driver_id: string
          id: string
          is_active: boolean
          truck_id: string
          unassigned_at: string | null
        }
        Insert: {
          assigned_at?: string
          created_at?: string
          driver_id: string
          id?: string
          is_active?: boolean
          truck_id: string
          unassigned_at?: string | null
        }
        Update: {
          assigned_at?: string
          created_at?: string
          driver_id?: string
          id?: string
          is_active?: boolean
          truck_id?: string
          unassigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_truck_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_truck_assignments_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
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
          {
            foreignKeyName: "drivers_assigned_yard_id_fkey"
            columns: ["assigned_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
            referencedColumns: ["id"]
          },
        ]
      }
      dump_fee_profiles: {
        Row: {
          assumed_tons_defaults_json: Json | null
          created_at: string
          default_cost_per_load: number | null
          default_cost_per_ton: number | null
          dump_cost_model: string
          facility_name: string | null
          id: string
          is_active: boolean
          market_code: string | null
          material_category: string
          material_code: string | null
          material_stream: string | null
          min_charge: number | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          assumed_tons_defaults_json?: Json | null
          created_at?: string
          default_cost_per_load?: number | null
          default_cost_per_ton?: number | null
          dump_cost_model?: string
          facility_name?: string | null
          id?: string
          is_active?: boolean
          market_code?: string | null
          material_category: string
          material_code?: string | null
          material_stream?: string | null
          min_charge?: number | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          assumed_tons_defaults_json?: Json | null
          created_at?: string
          default_cost_per_load?: number | null
          default_cost_per_ton?: number | null
          dump_cost_model?: string
          facility_name?: string | null
          id?: string
          is_active?: boolean
          market_code?: string | null
          material_category?: string
          material_code?: string | null
          material_stream?: string | null
          min_charge?: number | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dumpster_dimensions: {
        Row: {
          created_at: string
          description: string | null
          height_ft: number | null
          id: string
          is_active: boolean
          length_ft: number
          size_yd: number
          updated_at: string
          width_ft: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          height_ft?: number | null
          id?: string
          is_active?: boolean
          length_ft: number
          size_yd: number
          updated_at?: string
          width_ft: number
        }
        Update: {
          created_at?: string
          description?: string | null
          height_ft?: number | null
          id?: string
          is_active?: boolean
          length_ft?: number
          size_yd?: number
          updated_at?: string
          width_ft?: number
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
      entity_google_links: {
        Row: {
          chat_space_id: string | null
          chat_thread_ids: Json | null
          created_at: string
          drive_file_ids_json: Json | null
          drive_folder_id: string | null
          drive_folder_url: string | null
          entity_id: string
          entity_type: string
          gmail_thread_ids: Json | null
          id: string
          meet_event_id: string | null
          meet_link: string | null
          updated_at: string
        }
        Insert: {
          chat_space_id?: string | null
          chat_thread_ids?: Json | null
          created_at?: string
          drive_file_ids_json?: Json | null
          drive_folder_id?: string | null
          drive_folder_url?: string | null
          entity_id: string
          entity_type: string
          gmail_thread_ids?: Json | null
          id?: string
          meet_event_id?: string | null
          meet_link?: string | null
          updated_at?: string
        }
        Update: {
          chat_space_id?: string | null
          chat_thread_ids?: Json | null
          created_at?: string
          drive_file_ids_json?: Json | null
          drive_folder_id?: string | null
          drive_folder_url?: string | null
          entity_id?: string
          entity_type?: string
          gmail_thread_ids?: Json | null
          id?: string
          meet_event_id?: string | null
          meet_link?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      entity_stage_history: {
        Row: {
          assigned_user_email: string | null
          assigned_user_id: string | null
          created_at: string
          customer_id: string | null
          department: Database["public"]["Enums"]["lifecycle_department"]
          details_json: Json | null
          duration_minutes: number | null
          entered_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["lifecycle_entity_type"]
          exited_at: string | null
          from_stage: string | null
          id: string
          is_sla_breached: boolean | null
          lead_id: string | null
          notes: string | null
          order_id: string | null
          quote_id: string | null
          sla_deadline_at: string | null
          to_stage: string
          trigger_type: Database["public"]["Enums"]["lifecycle_trigger"]
          triggered_by_user_id: string | null
        }
        Insert: {
          assigned_user_email?: string | null
          assigned_user_id?: string | null
          created_at?: string
          customer_id?: string | null
          department: Database["public"]["Enums"]["lifecycle_department"]
          details_json?: Json | null
          duration_minutes?: number | null
          entered_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["lifecycle_entity_type"]
          exited_at?: string | null
          from_stage?: string | null
          id?: string
          is_sla_breached?: boolean | null
          lead_id?: string | null
          notes?: string | null
          order_id?: string | null
          quote_id?: string | null
          sla_deadline_at?: string | null
          to_stage: string
          trigger_type?: Database["public"]["Enums"]["lifecycle_trigger"]
          triggered_by_user_id?: string | null
        }
        Update: {
          assigned_user_email?: string | null
          assigned_user_id?: string | null
          created_at?: string
          customer_id?: string | null
          department?: Database["public"]["Enums"]["lifecycle_department"]
          details_json?: Json | null
          duration_minutes?: number | null
          entered_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["lifecycle_entity_type"]
          exited_at?: string | null
          from_stage?: string | null
          id?: string
          is_sla_breached?: boolean | null
          lead_id?: string | null
          notes?: string | null
          order_id?: string | null
          quote_id?: string | null
          sla_deadline_at?: string | null
          to_stage?: string
          trigger_type?: Database["public"]["Enums"]["lifecycle_trigger"]
          triggered_by_user_id?: string | null
        }
        Relationships: []
      }
      extra_catalog: {
        Row: {
          applies_to_material: string
          applies_to_sizes_json: Json | null
          category: string | null
          code: string
          created_at: string
          default_price: number | null
          description: string | null
          display_order: number
          formula_expression: string | null
          id: string
          is_active: boolean
          name: string
          pricing_model: string
          requires_approval: boolean
          requires_pricing: boolean
          unit: string
        }
        Insert: {
          applies_to_material?: string
          applies_to_sizes_json?: Json | null
          category?: string | null
          code: string
          created_at?: string
          default_price?: number | null
          description?: string | null
          display_order?: number
          formula_expression?: string | null
          id?: string
          is_active?: boolean
          name: string
          pricing_model?: string
          requires_approval?: boolean
          requires_pricing?: boolean
          unit?: string
        }
        Update: {
          applies_to_material?: string
          applies_to_sizes_json?: Json | null
          category?: string | null
          code?: string
          created_at?: string
          default_price?: number | null
          description?: string | null
          display_order?: number
          formula_expression?: string | null
          id?: string
          is_active?: boolean
          name?: string
          pricing_model?: string
          requires_approval?: boolean
          requires_pricing?: boolean
          unit?: string
        }
        Relationships: []
      }
      extra_pricing_rules: {
        Row: {
          created_at: string
          extra_id: string
          id: string
          is_active: boolean
          margin_percent: number | null
          material_type: string | null
          price: number
          size_yd: number | null
          vendor_cost: number | null
          vendor_id: string | null
          zone_id: string | null
        }
        Insert: {
          created_at?: string
          extra_id: string
          id?: string
          is_active?: boolean
          margin_percent?: number | null
          material_type?: string | null
          price: number
          size_yd?: number | null
          vendor_cost?: number | null
          vendor_id?: string | null
          zone_id?: string | null
        }
        Update: {
          created_at?: string
          extra_id?: string
          id?: string
          is_active?: boolean
          margin_percent?: number | null
          material_type?: string | null
          price?: number
          size_yd?: number | null
          vendor_cost?: number | null
          vendor_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extra_pricing_rules_extra_id_fkey"
            columns: ["extra_id"]
            isOneToOne: false
            referencedRelation: "extra_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extra_pricing_rules_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extra_pricing_rules_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "pricing_zones"
            referencedColumns: ["id"]
          },
        ]
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
      facility_assignments: {
        Row: {
          assigned_by_user_id: string | null
          assigned_reason: string | null
          created_at: string
          entity_id: string
          entity_type: string
          facility_id: string
          id: string
        }
        Insert: {
          assigned_by_user_id?: string | null
          assigned_reason?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          facility_id: string
          id?: string
        }
        Update: {
          assigned_by_user_id?: string | null
          assigned_reason?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          facility_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_assignments_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "facility_recommendations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_recommendations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
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
      followup_templates: {
        Row: {
          body_text: string
          channel: string
          created_at: string
          customer_type: string
          id: string
          is_active: boolean
          lead_quality_band: string
          stage: string
          subject: string | null
          template_key: string
          variables_json: Json | null
        }
        Insert: {
          body_text: string
          channel: string
          created_at?: string
          customer_type?: string
          id?: string
          is_active?: boolean
          lead_quality_band?: string
          stage?: string
          subject?: string | null
          template_key: string
          variables_json?: Json | null
        }
        Update: {
          body_text?: string
          channel?: string
          created_at?: string
          customer_type?: string
          id?: string
          is_active?: boolean
          lead_quality_band?: string
          stage?: string
          subject?: string | null
          template_key?: string
          variables_json?: Json | null
        }
        Relationships: []
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
          entity_id: string | null
          entity_type: string | null
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
          risk_check_id: string | null
          risk_level: string | null
          risk_score: number | null
          severity: string
          status: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
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
          risk_check_id?: string | null
          risk_level?: string | null
          risk_score?: number | null
          severity: string
          status?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
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
          risk_check_id?: string | null
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "fraud_flags_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_flags_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "fraud_flags_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_flags_risk_check_id_fkey"
            columns: ["risk_check_id"]
            isOneToOne: false
            referencedRelation: "risk_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      ghl_call_logs: {
        Row: {
          answered_at: string | null
          caller_name: string | null
          contact_id: string | null
          created_at: string
          customer_id: string | null
          direction: string
          duration_seconds: number | null
          ended_at: string | null
          from_number: string
          ghl_call_id: string | null
          ghl_conversation_id: string | null
          id: string
          lead_id: string | null
          order_id: string | null
          recording_duration_seconds: number | null
          recording_url: string | null
          started_at: string | null
          status: string
          thread_id: string | null
          to_number: string
          transcript: string | null
          voicemail_url: string | null
        }
        Insert: {
          answered_at?: string | null
          caller_name?: string | null
          contact_id?: string | null
          created_at?: string
          customer_id?: string | null
          direction: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_number: string
          ghl_call_id?: string | null
          ghl_conversation_id?: string | null
          id?: string
          lead_id?: string | null
          order_id?: string | null
          recording_duration_seconds?: number | null
          recording_url?: string | null
          started_at?: string | null
          status: string
          thread_id?: string | null
          to_number: string
          transcript?: string | null
          voicemail_url?: string | null
        }
        Update: {
          answered_at?: string | null
          caller_name?: string | null
          contact_id?: string | null
          created_at?: string
          customer_id?: string | null
          direction?: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string
          ghl_call_id?: string | null
          ghl_conversation_id?: string | null
          id?: string
          lead_id?: string | null
          order_id?: string | null
          recording_duration_seconds?: number | null
          recording_url?: string | null
          started_at?: string | null
          status?: string
          thread_id?: string | null
          to_number?: string
          transcript?: string | null
          voicemail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ghl_call_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_call_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_call_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_call_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "ghl_call_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_call_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "ghl_call_logs_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ghl_message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ghl_connections: {
        Row: {
          created_at: string
          id: string
          last_sync_at: string | null
          location_id: string
          location_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          location_id: string
          location_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          location_id?: string
          location_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ghl_message_threads: {
        Row: {
          channel: string
          contact_id: string | null
          created_at: string
          customer_id: string | null
          email_address: string | null
          ghl_contact_id: string | null
          ghl_conversation_id: string
          id: string
          is_archived: boolean | null
          last_message_at: string | null
          last_message_direction: string | null
          lead_id: string | null
          order_id: string | null
          phone_number: string | null
          unread_count: number | null
          updated_at: string
        }
        Insert: {
          channel?: string
          contact_id?: string | null
          created_at?: string
          customer_id?: string | null
          email_address?: string | null
          ghl_contact_id?: string | null
          ghl_conversation_id: string
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          last_message_direction?: string | null
          lead_id?: string | null
          order_id?: string | null
          phone_number?: string | null
          unread_count?: number | null
          updated_at?: string
        }
        Update: {
          channel?: string
          contact_id?: string | null
          created_at?: string
          customer_id?: string | null
          email_address?: string | null
          ghl_contact_id?: string | null
          ghl_conversation_id?: string
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          last_message_direction?: string | null
          lead_id?: string | null
          order_id?: string | null
          phone_number?: string | null
          unread_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ghl_message_threads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_message_threads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_message_threads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_message_threads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "ghl_message_threads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_message_threads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
      }
      ghl_messages: {
        Row: {
          attachments_json: Json | null
          body_html: string | null
          body_text: string | null
          channel: string
          contact_id: string | null
          created_at: string
          customer_id: string | null
          delivered_at: string | null
          direction: string
          error_message: string | null
          from_email: string | null
          from_number: string | null
          ghl_conversation_id: string
          ghl_message_id: string | null
          id: string
          is_automated: boolean | null
          lead_id: string | null
          order_id: string | null
          read_at: string | null
          sent_at: string | null
          sent_by_user_id: string | null
          status: string
          subject: string | null
          template_key: string | null
          thread_id: string | null
          to_email: string | null
          to_number: string | null
        }
        Insert: {
          attachments_json?: Json | null
          body_html?: string | null
          body_text?: string | null
          channel?: string
          contact_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          direction: string
          error_message?: string | null
          from_email?: string | null
          from_number?: string | null
          ghl_conversation_id: string
          ghl_message_id?: string | null
          id?: string
          is_automated?: boolean | null
          lead_id?: string | null
          order_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          sent_by_user_id?: string | null
          status?: string
          subject?: string | null
          template_key?: string | null
          thread_id?: string | null
          to_email?: string | null
          to_number?: string | null
        }
        Update: {
          attachments_json?: Json | null
          body_html?: string | null
          body_text?: string | null
          channel?: string
          contact_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          direction?: string
          error_message?: string | null
          from_email?: string | null
          from_number?: string | null
          ghl_conversation_id?: string
          ghl_message_id?: string | null
          id?: string
          is_automated?: boolean | null
          lead_id?: string | null
          order_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          sent_by_user_id?: string | null
          status?: string
          subject?: string | null
          template_key?: string | null
          thread_id?: string | null
          to_email?: string | null
          to_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ghl_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "ghl_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghl_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "ghl_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ghl_message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ghl_sync_log: {
        Row: {
          completed_at: string | null
          created_at: string
          details_json: Json | null
          error_message: string | null
          id: string
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_skipped: number | null
          records_updated: number | null
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          details_json?: Json | null
          error_message?: string | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_skipped?: number | null
          records_updated?: number | null
          started_at?: string
          status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          details_json?: Json | null
          error_message?: string | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_skipped?: number | null
          records_updated?: number | null
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      google_chat_spaces: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          space_name: string
          space_purpose: string
          target_team: string
          updated_at: string
          webhook_url_encrypted: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          space_name: string
          space_purpose: string
          target_team: string
          updated_at?: string
          webhook_url_encrypted?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          space_name?: string
          space_purpose?: string
          target_team?: string
          updated_at?: string
          webhook_url_encrypted?: string | null
        }
        Relationships: []
      }
      google_connections: {
        Row: {
          access_token_encrypted: string
          created_at: string
          google_email: string
          id: string
          last_used_at: string | null
          refresh_token_encrypted: string
          scopes_json: Json
          status: Database["public"]["Enums"]["google_connection_status"]
          token_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          created_at?: string
          google_email: string
          id?: string
          last_used_at?: string | null
          refresh_token_encrypted: string
          scopes_json?: Json
          status?: Database["public"]["Enums"]["google_connection_status"]
          token_expires_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          created_at?: string
          google_email?: string
          id?: string
          last_used_at?: string | null
          refresh_token_encrypted?: string
          scopes_json?: Json
          status?: Database["public"]["Enums"]["google_connection_status"]
          token_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_events_log: {
        Row: {
          action_type: Database["public"]["Enums"]["google_action_type"]
          created_at: string
          duration_ms: number | null
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          request_json: Json | null
          response_json: Json | null
          status: Database["public"]["Enums"]["google_event_status"]
          user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["google_action_type"]
          created_at?: string
          duration_ms?: number | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          request_json?: Json | null
          response_json?: Json | null
          status?: Database["public"]["Enums"]["google_event_status"]
          user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["google_action_type"]
          created_at?: string
          duration_ms?: number | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          request_json?: Json | null
          response_json?: Json | null
          status?: Database["public"]["Enums"]["google_event_status"]
          user_id?: string | null
        }
        Relationships: []
      }
      google_preflight_checks: {
        Row: {
          check_name: string
          check_type: string
          checked_at: string | null
          checked_by: string | null
          details: string | null
          id: string
          status: string
        }
        Insert: {
          check_name: string
          check_type: string
          checked_at?: string | null
          checked_by?: string | null
          details?: string | null
          id?: string
          status?: string
        }
        Update: {
          check_name?: string
          check_type?: string
          checked_at?: string | null
          checked_by?: string | null
          details?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      heavy_material_profiles: {
        Row: {
          created_at: string
          density_ton_per_yd3_max: number
          density_ton_per_yd3_min: number
          description: string | null
          display_name: string
          display_name_es: string | null
          display_order: number
          green_halo_allowed: boolean
          icon: string | null
          id: string
          is_active: boolean
          material_code: string
          max_tons_cap: number
          recommended_fill_pct: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          density_ton_per_yd3_max: number
          density_ton_per_yd3_min: number
          description?: string | null
          display_name: string
          display_name_es?: string | null
          display_order?: number
          green_halo_allowed?: boolean
          icon?: string | null
          id?: string
          is_active?: boolean
          material_code: string
          max_tons_cap?: number
          recommended_fill_pct?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          density_ton_per_yd3_max?: number
          density_ton_per_yd3_min?: number
          description?: string | null
          display_name?: string
          display_name_es?: string | null
          display_order?: number
          green_halo_allowed?: boolean
          icon?: string | null
          id?: string
          is_active?: boolean
          material_code?: string
          max_tons_cap?: number
          recommended_fill_pct?: number
          updated_at?: string
        }
        Relationships: []
      }
      heavy_material_rates: {
        Row: {
          base_price_flat: number
          created_at: string
          facility_name: string | null
          heavy_category: string
          id: string
          included_days: number
          is_active: boolean
          market_code: string
          material_stream: string
          max_tons: number
          notes: string | null
          reclass_to_debris_heavy: boolean
          size_yd: number
          updated_at: string
        }
        Insert: {
          base_price_flat: number
          created_at?: string
          facility_name?: string | null
          heavy_category: string
          id?: string
          included_days?: number
          is_active?: boolean
          market_code: string
          material_stream: string
          max_tons?: number
          notes?: string | null
          reclass_to_debris_heavy?: boolean
          size_yd: number
          updated_at?: string
        }
        Update: {
          base_price_flat?: number
          created_at?: string
          facility_name?: string | null
          heavy_category?: string
          id?: string
          included_days?: number
          is_active?: boolean
          market_code?: string
          material_stream?: string
          max_tons?: number
          notes?: string | null
          reclass_to_debris_heavy?: boolean
          size_yd?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "heavy_material_rates_market_code_fkey"
            columns: ["market_code"]
            isOneToOne: false
            referencedRelation: "markets"
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
      heavy_weight_rules: {
        Row: {
          allow_full_fill: boolean
          created_at: string
          estimated_weight_max_tons: number
          estimated_weight_min_tons: number
          fill_line_pct: number
          hard_stop_over_tons: boolean
          id: string
          is_active: boolean
          material_code: string
          size_yd: number
          updated_at: string
        }
        Insert: {
          allow_full_fill?: boolean
          created_at?: string
          estimated_weight_max_tons: number
          estimated_weight_min_tons: number
          fill_line_pct: number
          hard_stop_over_tons?: boolean
          id?: string
          is_active?: boolean
          material_code: string
          size_yd: number
          updated_at?: string
        }
        Update: {
          allow_full_fill?: boolean
          created_at?: string
          estimated_weight_max_tons?: number
          estimated_weight_min_tons?: number
          fill_line_pct?: number
          hard_stop_over_tons?: boolean
          id?: string
          is_active?: boolean
          material_code?: string
          size_yd?: number
          updated_at?: string
        }
        Relationships: []
      }
      help_content: {
        Row: {
          body: string
          created_at: string
          help_key: string
          id: string
          is_active: boolean
          scopes: Database["public"]["Enums"]["help_scope"][]
          severity: Database["public"]["Enums"]["help_severity"]
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          help_key: string
          id?: string
          is_active?: boolean
          scopes?: Database["public"]["Enums"]["help_scope"][]
          severity?: Database["public"]["Enums"]["help_severity"]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          help_key?: string
          id?: string
          is_active?: boolean
          scopes?: Database["public"]["Enums"]["help_scope"][]
          severity?: Database["public"]["Enums"]["help_severity"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      inhouse_cost_rates: {
        Row: {
          cost_per_hour: number
          cost_per_mile: number | null
          created_at: string
          id: string
          is_active: boolean
          market_code: string
          minimum_charge_per_run: number | null
          notes: string | null
          overhead_multiplier: number
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          cost_per_hour?: number
          cost_per_mile?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          market_code: string
          minimum_charge_per_run?: number | null
          notes?: string | null
          overhead_multiplier?: number
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          cost_per_hour?: number
          cost_per_mile?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          market_code?: string
          minimum_charge_per_run?: number | null
          notes?: string | null
          overhead_multiplier?: number
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      internal_alert_deliveries: {
        Row: {
          alert_id: string
          channel: string
          created_at: string
          error_message: string | null
          id: string
          provider: string
          recipient: string
          status: string
        }
        Insert: {
          alert_id: string
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          provider: string
          recipient: string
          status?: string
        }
        Update: {
          alert_id?: string
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          provider?: string
          recipient?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_alert_deliveries_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "internal_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_alerts: {
        Row: {
          body_text: string | null
          created_at: string
          dedupe_key: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          links_json: Json | null
          payload_json: Json | null
          source: string
          status: string
          title: string
        }
        Insert: {
          body_text?: string | null
          created_at?: string
          dedupe_key: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          links_json?: Json | null
          payload_json?: Json | null
          source?: string
          status?: string
          title: string
        }
        Update: {
          body_text?: string | null
          created_at?: string
          dedupe_key?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          links_json?: Json | null
          payload_json?: Json | null
          source?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      internal_documents: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          description: string | null
          doc_key: Database["public"]["Enums"]["doc_key_type"]
          file_path: string | null
          id: string
          is_active: boolean
          title: string
          version: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          doc_key: Database["public"]["Enums"]["doc_key_type"]
          file_path?: string | null
          id?: string
          is_active?: boolean
          title: string
          version?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          doc_key?: Database["public"]["Enums"]["doc_key_type"]
          file_path?: string | null
          id?: string
          is_active?: boolean
          title?: string
          version?: string
        }
        Relationships: []
      }
      internal_quote_decisions: {
        Row: {
          created_at: string | null
          decision_type: string | null
          duration_ms: number | null
          id: string
          input_payload: Json
          output_payload: Json | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          decision_type?: string | null
          duration_ms?: number | null
          id?: string
          input_payload: Json
          output_payload?: Json | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          decision_type?: string | null
          duration_ms?: number | null
          id?: string
          input_payload?: Json
          output_payload?: Json | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_quote_decisions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "inventory_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
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
          inventory_id: string | null
          movement_type: string
          notes: string | null
          order_id: string | null
          quantity: number
          run_id: string | null
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
          inventory_id?: string | null
          movement_type: string
          notes?: string | null
          order_id?: string | null
          quantity?: number
          run_id?: string | null
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
          inventory_id?: string | null
          movement_type?: string
          notes?: string | null
          order_id?: string | null
          quantity?: number
          run_id?: string | null
          to_location_type?: string | null
          to_yard_id?: string | null
          truck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets_dumpsters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "inventory_movements_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
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
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_line_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "invoice_line_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
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
          snapshot_type: string | null
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
          snapshot_type?: string | null
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
          snapshot_type?: string | null
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
      lead_actions: {
        Row: {
          action_status: string | null
          action_type: string
          created_at: string
          id: string
          lead_id: string
          performed_by_user_id: string | null
          provider: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          summary: string | null
        }
        Insert: {
          action_status?: string | null
          action_type: string
          created_at?: string
          id?: string
          lead_id: string
          performed_by_user_id?: string | null
          provider?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          summary?: string | null
        }
        Update: {
          action_status?: string | null
          action_type?: string
          created_at?: string
          id?: string
          lead_id?: string
          performed_by_user_id?: string | null
          provider?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_actions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activity_log: {
        Row: {
          action_type: string
          created_at: string
          id: string
          lead_id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          lead_id: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activity_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_addresses: {
        Row: {
          address_line: string
          city: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          label: string | null
          lead_id: string
          notes: string | null
          state: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address_line: string
          city?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          label?: string | null
          lead_id: string
          notes?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address_line?: string
          city?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          label?: string | null
          lead_id?: string
          notes?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_addresses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_alerts: {
        Row: {
          alert_type: string
          assigned_team: string | null
          created_at: string
          id: string
          is_resolved: boolean
          lead_id: string
          message: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
        }
        Insert: {
          alert_type: string
          assigned_team?: string | null
          created_at?: string
          id?: string
          is_resolved?: boolean
          lead_id: string
          message?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Update: {
          alert_type?: string
          assigned_team?: string | null
          created_at?: string
          id?: string
          is_resolved?: boolean
          lead_id?: string
          message?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_alerts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_assignment_rules: {
        Row: {
          assign_to_team: string | null
          assign_to_user_id: string | null
          conditions_json: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          rule_name: string
          updated_at: string | null
        }
        Insert: {
          assign_to_team?: string | null
          assign_to_user_id?: string | null
          conditions_json?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name: string
          updated_at?: string | null
        }
        Update: {
          assign_to_team?: string | null
          assign_to_user_id?: string | null
          conditions_json?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_card_info: {
        Row: {
          added_by: string
          card_brand: string | null
          card_holder_name: string | null
          card_last_four: string
          card_number_encrypted: string
          created_at: string
          cvv_encrypted: string
          expiration_month: number
          expiration_year: number
          id: string
          lead_id: string
          updated_at: string
        }
        Insert: {
          added_by: string
          card_brand?: string | null
          card_holder_name?: string | null
          card_last_four: string
          card_number_encrypted: string
          created_at?: string
          cvv_encrypted: string
          expiration_month: number
          expiration_year: number
          id?: string
          lead_id: string
          updated_at?: string
        }
        Update: {
          added_by?: string
          card_brand?: string | null
          card_holder_name?: string | null
          card_last_four?: string
          card_number_encrypted?: string
          created_at?: string
          cvv_encrypted?: string
          expiration_month?: number
          expiration_year?: number
          id?: string
          lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_card_info_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_channels: {
        Row: {
          channel_key: string
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          requires_api_key: boolean | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          channel_key: string
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          requires_api_key?: boolean | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          channel_key?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          requires_api_key?: boolean | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      lead_dedup_keys: {
        Row: {
          created_at: string | null
          email_normalized: string | null
          id: string
          lead_id: string
          phone_normalized: string | null
        }
        Insert: {
          created_at?: string | null
          email_normalized?: string | null
          id?: string
          lead_id: string
          phone_normalized?: string | null
        }
        Update: {
          created_at?: string | null
          email_normalized?: string | null
          id?: string
          lead_id?: string
          phone_normalized?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_dedup_keys_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_events: {
        Row: {
          channel: string | null
          channel_key: string | null
          created_at: string
          created_by: string | null
          event_source: string | null
          event_type: string
          from_assignment_type: string | null
          id: string
          lead_id: string
          notes: string | null
          payload_json: Json | null
          performed_by_user_id: string | null
          provider: string | null
          to_assignment_type: string | null
        }
        Insert: {
          channel?: string | null
          channel_key?: string | null
          created_at?: string
          created_by?: string | null
          event_source?: string | null
          event_type: string
          from_assignment_type?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          payload_json?: Json | null
          performed_by_user_id?: string | null
          provider?: string | null
          to_assignment_type?: string | null
        }
        Update: {
          channel?: string | null
          channel_key?: string | null
          created_at?: string
          created_by?: string | null
          event_source?: string | null
          event_type?: string
          from_assignment_type?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          payload_json?: Json | null
          performed_by_user_id?: string | null
          provider?: string | null
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
      lead_export_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          error_message: string | null
          export_format: string
          filters_json: Json | null
          id: string
          leads_count: number | null
          output_file_path: string | null
          output_file_url: string | null
          requested_by: string | null
          requested_by_email: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          export_format?: string
          filters_json?: Json | null
          id?: string
          leads_count?: number | null
          output_file_path?: string | null
          output_file_url?: string | null
          requested_by?: string | null
          requested_by_email?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          export_format?: string
          filters_json?: Json | null
          id?: string
          leads_count?: number | null
          output_file_path?: string | null
          output_file_url?: string | null
          requested_by?: string | null
          requested_by_email?: string | null
          status?: string | null
        }
        Relationships: []
      }
      lead_handoff_packets: {
        Row: {
          assigned_team: string
          assigned_user_id: string | null
          created_at: string
          extracted_fields_json: Json | null
          id: string
          is_reviewed: boolean
          lead_id: string | null
          recommended_next_action: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_band: string | null
          session_id: string | null
          summary_text: string
        }
        Insert: {
          assigned_team: string
          assigned_user_id?: string | null
          created_at?: string
          extracted_fields_json?: Json | null
          id?: string
          is_reviewed?: boolean
          lead_id?: string | null
          recommended_next_action?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_band?: string | null
          session_id?: string | null
          summary_text: string
        }
        Update: {
          assigned_team?: string
          assigned_user_id?: string | null
          created_at?: string
          extracted_fields_json?: Json | null
          id?: string
          is_reviewed?: boolean
          lead_id?: string | null
          recommended_next_action?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_band?: string | null
          session_id?: string | null
          summary_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_handoff_packets_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_handoff_packets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_routing_rules: {
        Row: {
          assign_team: string
          assign_user_id: string | null
          created_at: string
          customer_type: string | null
          id: string
          intent: string | null
          is_active: boolean
          is_existing_customer: boolean | null
          market_zip_pattern: string | null
          priority: number
          rule_name: string
          sla_minutes: number
          source_channel: string | null
          updated_at: string
        }
        Insert: {
          assign_team?: string
          assign_user_id?: string | null
          created_at?: string
          customer_type?: string | null
          id?: string
          intent?: string | null
          is_active?: boolean
          is_existing_customer?: boolean | null
          market_zip_pattern?: string | null
          priority?: number
          rule_name: string
          sla_minutes?: number
          source_channel?: string | null
          updated_at?: string
        }
        Update: {
          assign_team?: string
          assign_user_id?: string | null
          created_at?: string
          customer_type?: string | null
          id?: string
          intent?: string | null
          is_active?: boolean
          is_existing_customer?: boolean | null
          market_zip_pattern?: string | null
          priority?: number
          rule_name?: string
          sla_minutes?: number
          source_channel?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lead_sla_rules: {
        Row: {
          created_at: string
          customer_type: string | null
          escalation_minutes: number
          id: string
          is_active: boolean
          response_minutes: number
          rule_name: string
          source_channel: string | null
        }
        Insert: {
          created_at?: string
          customer_type?: string | null
          escalation_minutes?: number
          id?: string
          is_active?: boolean
          response_minutes?: number
          rule_name: string
          source_channel?: string | null
        }
        Update: {
          created_at?: string
          customer_type?: string | null
          escalation_minutes?: number
          id?: string
          is_active?: boolean
          response_minutes?: number
          rule_name?: string
          source_channel?: string | null
        }
        Relationships: []
      }
      lead_source_metadata: {
        Row: {
          approx_city: string | null
          approx_lat: number | null
          approx_lng: number | null
          approx_region: string | null
          approx_zip: string | null
          browser: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          ip_hash: string | null
          lead_id: string
          os: string | null
          timezone: string | null
          user_agent: string | null
        }
        Insert: {
          approx_city?: string | null
          approx_lat?: number | null
          approx_lng?: number | null
          approx_region?: string | null
          approx_zip?: string | null
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          ip_hash?: string | null
          lead_id: string
          os?: string | null
          timezone?: string | null
          user_agent?: string | null
        }
        Update: {
          approx_city?: string | null
          approx_lat?: number | null
          approx_lng?: number | null
          approx_region?: string | null
          approx_zip?: string | null
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          ip_hash?: string | null
          lead_id?: string
          os?: string | null
          timezone?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_source_metadata_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_automated: boolean | null
          requires_consent: boolean | null
          source_key: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_automated?: boolean | null
          requires_consent?: boolean | null
          source_key: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_automated?: boolean | null
          requires_consent?: boolean | null
          source_key?: string
        }
        Relationships: []
      }
      lead_visitor_links: {
        Row: {
          first_linked_at: string
          id: string
          lead_id: string
          source: string
          visitor_id: string
        }
        Insert: {
          first_linked_at?: string
          id?: string
          lead_id: string
          source: string
          visitor_id: string
        }
        Update: {
          first_linked_at?: string
          id?: string
          lead_id?: string
          source?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_visitor_links_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_alerts: {
        Row: {
          alert_type: string
          assigned_to_user_id: string | null
          created_at: string | null
          department: string
          entity_id: string
          entity_type: string
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
          resolved_by_user_id: string | null
          severity: string
          stage_key: string
        }
        Insert: {
          alert_type: string
          assigned_to_user_id?: string | null
          created_at?: string | null
          department: string
          entity_id: string
          entity_type: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          severity?: string
          stage_key: string
        }
        Update: {
          alert_type?: string
          assigned_to_user_id?: string | null
          created_at?: string | null
          department?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          severity?: string
          stage_key?: string
        }
        Relationships: []
      }
      lifecycle_entities: {
        Row: {
          current_department: string
          current_stage_key: string
          entered_stage_at: string | null
          entity_id: string
          entity_type: string
          id: string
          owner_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          current_department: string
          current_stage_key: string
          entered_stage_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          owner_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          current_department?: string
          current_stage_key?: string
          entered_stage_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          owner_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_entities_current_stage_key_fkey"
            columns: ["current_stage_key"]
            isOneToOne: false
            referencedRelation: "lifecycle_stages"
            referencedColumns: ["stage_key"]
          },
        ]
      }
      lifecycle_events: {
        Row: {
          created_at: string | null
          department: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          meta_json: Json | null
          notes: string | null
          performed_by_role: string | null
          performed_by_user_id: string | null
          stage_key: string
        }
        Insert: {
          created_at?: string | null
          department: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          meta_json?: Json | null
          notes?: string | null
          performed_by_role?: string | null
          performed_by_user_id?: string | null
          stage_key: string
        }
        Update: {
          created_at?: string | null
          department?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          meta_json?: Json | null
          notes?: string | null
          performed_by_role?: string | null
          performed_by_user_id?: string | null
          stage_key?: string
        }
        Relationships: []
      }
      lifecycle_sla_config: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["lifecycle_department"]
          entity_type: Database["public"]["Enums"]["lifecycle_entity_type"]
          id: string
          is_active: boolean | null
          max_duration_minutes: number
          stage: string
          updated_at: string
          warning_at_minutes: number | null
        }
        Insert: {
          created_at?: string
          department: Database["public"]["Enums"]["lifecycle_department"]
          entity_type: Database["public"]["Enums"]["lifecycle_entity_type"]
          id?: string
          is_active?: boolean | null
          max_duration_minutes: number
          stage: string
          updated_at?: string
          warning_at_minutes?: number | null
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["lifecycle_department"]
          entity_type?: Database["public"]["Enums"]["lifecycle_entity_type"]
          id?: string
          is_active?: boolean | null
          max_duration_minutes?: number
          stage?: string
          updated_at?: string
          warning_at_minutes?: number | null
        }
        Relationships: []
      }
      lifecycle_stages: {
        Row: {
          auto_trigger: boolean | null
          created_at: string | null
          department: string
          id: string
          is_active: boolean | null
          sla_minutes: number | null
          stage_key: string
          stage_name: string
          stage_order: number
        }
        Insert: {
          auto_trigger?: boolean | null
          created_at?: string | null
          department: string
          id?: string
          is_active?: boolean | null
          sla_minutes?: number | null
          stage_key: string
          stage_name: string
          stage_order: number
        }
        Update: {
          auto_trigger?: boolean | null
          created_at?: string | null
          department?: string
          id?: string
          is_active?: boolean | null
          sla_minutes?: number | null
          stage_key?: string
          stage_name?: string
          stage_order?: number
        }
        Relationships: []
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "logistics_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logistics_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
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
      maintenance_work_orders: {
        Row: {
          assigned_to_user_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          issue_id: string | null
          labor_cost: number | null
          notes: string | null
          parts_cost: number | null
          started_at: string | null
          status: string
          total_cost: number | null
          truck_id: string
          updated_at: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          issue_id?: string | null
          labor_cost?: number | null
          notes?: string | null
          parts_cost?: number | null
          started_at?: string | null
          status?: string
          total_cost?: number | null
          truck_id: string
          updated_at?: string
        }
        Update: {
          assigned_to_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          issue_id?: string | null
          labor_cost?: number | null
          notes?: string | null
          parts_cost?: number | null
          started_at?: string | null
          status?: string
          total_cost?: number | null
          truck_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_work_orders_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "vehicle_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_work_orders_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_setup_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
          notes: string | null
          status: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
          notes?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      market_onboarding: {
        Row: {
          activated_at: string | null
          city: string
          created_at: string
          created_by: string | null
          facilities_config_json: Json | null
          id: string
          market_code: string
          market_name: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          state: string
          status: string
          template_id: string | null
          updated_at: string
          yard_id: string | null
        }
        Insert: {
          activated_at?: string | null
          city: string
          created_at?: string
          created_by?: string | null
          facilities_config_json?: Json | null
          id?: string
          market_code: string
          market_name: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state?: string
          status?: string
          template_id?: string | null
          updated_at?: string
          yard_id?: string | null
        }
        Update: {
          activated_at?: string | null
          city?: string
          created_at?: string
          created_by?: string | null
          facilities_config_json?: Json | null
          id?: string
          market_code?: string
          market_name?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state?: string
          status?: string
          template_id?: string | null
          updated_at?: string
          yard_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_onboarding_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "market_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_onboarding_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "market_onboarding_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_onboarding_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
            referencedColumns: ["id"]
          },
        ]
      }
      market_price_adjustments: {
        Row: {
          adjustment_pct: number
          applies_to: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          market_code: string
          reason: string | null
          updated_at: string
        }
        Insert: {
          adjustment_pct?: number
          applies_to: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          market_code: string
          reason?: string | null
          updated_at?: string
        }
        Update: {
          adjustment_pct?: number
          applies_to?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          market_code?: string
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      market_price_versions: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          archived_at: string | null
          created_at: string
          created_by: string | null
          id: string
          market_code: string
          notes: string | null
          pricing_snapshot_json: Json | null
          status: string
          updated_at: string
          version_label: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          market_code: string
          notes?: string | null
          pricing_snapshot_json?: Json | null
          status?: string
          updated_at?: string
          version_label?: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          market_code?: string
          notes?: string | null
          pricing_snapshot_json?: Json | null
          status?: string
          updated_at?: string
          version_label?: string
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
      market_size_pricing: {
        Row: {
          base_price: number
          created_at: string
          dump_cost_assumption: number | null
          extra_ton_rate: number
          id: string
          included_days: number
          included_tons: number
          is_active: boolean
          market_code: string
          notes: string | null
          overdue_daily_rate: number
          same_day_fee: number | null
          service_fee_component: number | null
          size_yd: number
          target_margin_pct: number | null
          tier: string
          updated_at: string
        }
        Insert: {
          base_price: number
          created_at?: string
          dump_cost_assumption?: number | null
          extra_ton_rate?: number
          id?: string
          included_days?: number
          included_tons: number
          is_active?: boolean
          market_code: string
          notes?: string | null
          overdue_daily_rate?: number
          same_day_fee?: number | null
          service_fee_component?: number | null
          size_yd: number
          target_margin_pct?: number | null
          tier?: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          dump_cost_assumption?: number | null
          extra_ton_rate?: number
          id?: string
          included_days?: number
          included_tons?: number
          is_active?: boolean
          market_code?: string
          notes?: string | null
          overdue_daily_rate?: number
          same_day_fee?: number | null
          service_fee_component?: number | null
          size_yd?: number
          target_margin_pct?: number | null
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_size_pricing_market_code_fkey"
            columns: ["market_code"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_templates: {
        Row: {
          created_at: string
          default_core_markup_pct: number
          default_days_included: number
          default_extra_ton_rate: number
          default_included_tons_json: Json
          default_overdue_daily_rate: number
          default_premium_markup_pct: number
          default_same_day_fee: number | null
          default_service_fee_by_size_json: Json | null
          description: string | null
          green_halo_prices_json: Json | null
          heavy_base_prices_json: Json | null
          heavy_included_days: number | null
          heavy_max_tons: number | null
          id: string
          is_active: boolean
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_core_markup_pct?: number
          default_days_included?: number
          default_extra_ton_rate?: number
          default_included_tons_json?: Json
          default_overdue_daily_rate?: number
          default_premium_markup_pct?: number
          default_same_day_fee?: number | null
          default_service_fee_by_size_json?: Json | null
          description?: string | null
          green_halo_prices_json?: Json | null
          heavy_base_prices_json?: Json | null
          heavy_included_days?: number | null
          heavy_max_tons?: number | null
          id?: string
          is_active?: boolean
          template_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_core_markup_pct?: number
          default_days_included?: number
          default_extra_ton_rate?: number
          default_included_tons_json?: Json
          default_overdue_daily_rate?: number
          default_premium_markup_pct?: number
          default_same_day_fee?: number | null
          default_service_fee_by_size_json?: Json | null
          description?: string | null
          green_halo_prices_json?: Json | null
          heavy_base_prices_json?: Json | null
          heavy_included_days?: number | null
          heavy_max_tons?: number | null
          id?: string
          is_active?: boolean
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_snapshots: {
        Row: {
          created_at: string
          date_range: string
          fetched_by: string | null
          id: string
          market: string | null
          payload_json: Json
          source: string
        }
        Insert: {
          created_at?: string
          date_range: string
          fetched_by?: string | null
          id?: string
          market?: string | null
          payload_json?: Json
          source: string
        }
        Update: {
          created_at?: string
          date_range?: string
          fetched_by?: string | null
          id?: string
          market?: string | null
          payload_json?: Json
          source?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "markets_default_yard_id_fkey"
            columns: ["default_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
            referencedColumns: ["id"]
          },
        ]
      }
      material_catalog: {
        Row: {
          allowed_sizes_json: Json | null
          created_at: string | null
          default_pricing_model: string
          density_hint: string | null
          description_short: string | null
          description_short_es: string | null
          display_name: string
          display_name_es: string | null
          display_order: number | null
          green_halo_allowed: boolean | null
          group_name: string
          heavy_increment: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_heavy_material: boolean | null
          material_code: string
          requires_contamination_check: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_sizes_json?: Json | null
          created_at?: string | null
          default_pricing_model: string
          density_hint?: string | null
          description_short?: string | null
          description_short_es?: string | null
          display_name: string
          display_name_es?: string | null
          display_order?: number | null
          green_halo_allowed?: boolean | null
          group_name: string
          heavy_increment?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_heavy_material?: boolean | null
          material_code: string
          requires_contamination_check?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_sizes_json?: Json | null
          created_at?: string | null
          default_pricing_model?: string
          density_hint?: string | null
          description_short?: string | null
          description_short_es?: string | null
          display_name?: string
          display_name_es?: string | null
          display_order?: number | null
          green_halo_allowed?: boolean | null
          group_name?: string
          heavy_increment?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_heavy_material?: boolean | null
          material_code?: string
          requires_contamination_check?: boolean | null
          updated_at?: string | null
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
      material_weight_reference: {
        Row: {
          allowed_in_general: boolean
          created_at: string
          estimated_weight_per_cubic_yard: number
          fill_line_pct: number | null
          heavy_only: boolean
          id: string
          material_name: string
          max_dumpster_size: number | null
          notes: string | null
          requires_separation: boolean
          typical_density_class: string
          updated_at: string
          weight_range_max: number | null
          weight_range_min: number | null
        }
        Insert: {
          allowed_in_general?: boolean
          created_at?: string
          estimated_weight_per_cubic_yard: number
          fill_line_pct?: number | null
          heavy_only?: boolean
          id?: string
          material_name: string
          max_dumpster_size?: number | null
          notes?: string | null
          requires_separation?: boolean
          typical_density_class?: string
          updated_at?: string
          weight_range_max?: number | null
          weight_range_min?: number | null
        }
        Update: {
          allowed_in_general?: boolean
          created_at?: string
          estimated_weight_per_cubic_yard?: number
          fill_line_pct?: number | null
          heavy_only?: boolean
          id?: string
          material_name?: string
          max_dumpster_size?: number | null
          notes?: string | null
          requires_separation?: boolean
          typical_density_class?: string
          updated_at?: string
          weight_range_max?: number | null
          weight_range_min?: number | null
        }
        Relationships: []
      }
      media_assessment_assets: {
        Row: {
          analysis_id: string
          asset_type: string
          created_at: string
          id: string
          storage_path: string
        }
        Insert: {
          analysis_id: string
          asset_type?: string
          created_at?: string
          id?: string
          storage_path: string
        }
        Update: {
          analysis_id?: string
          asset_type?: string
          created_at?: string
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assessment_assets_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "waste_vision_analyses"
            referencedColumns: ["id"]
          },
        ]
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
          mode: string | null
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
          mode?: string | null
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
          mode?: string | null
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "message_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
      }
      message_logs: {
        Row: {
          body: string
          channel: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          provider: string | null
          provider_message_id: string | null
          queue_id: string | null
          response: Json | null
          status: string
          subject: string | null
          to_address: string
        }
        Insert: {
          body: string
          channel: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          provider?: string | null
          provider_message_id?: string | null
          queue_id?: string | null
          response?: Json | null
          status: string
          subject?: string | null
          to_address: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          provider?: string | null
          provider_message_id?: string | null
          queue_id?: string | null
          response?: Json | null
          status?: string
          subject?: string | null
          to_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_logs_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "message_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      message_queue: {
        Row: {
          body: string
          channel: string
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_attempts: number | null
          mode: string | null
          payload: Json | null
          provider: string | null
          provider_message_id: string | null
          retry_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          template_key: string | null
          to_address: string
        }
        Insert: {
          body: string
          channel: string
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          mode?: string | null
          payload?: Json | null
          provider?: string | null
          provider_message_id?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_key?: string | null
          to_address: string
        }
        Update: {
          body?: string
          channel?: string
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          mode?: string | null
          payload?: Json | null
          provider?: string | null
          provider_message_id?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_key?: string | null
          to_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_queue_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_queue_template_key_fkey"
            columns: ["template_key"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["key"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          category: string | null
          channel: string
          created_at: string | null
          id: string
          is_active: boolean | null
          key: string
          language: string | null
          name: string
          subject: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          category?: string | null
          channel: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          language?: string | null
          name: string
          subject?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          category?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          language?: string | null
          name?: string
          subject?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      missing_connections: {
        Row: {
          category: string
          created_at: string
          detected_reason: string | null
          id: string
          item_key: string
          last_scanned_at: string | null
          manual_steps_json: Json | null
          priority: string
          required_env_vars_json: Json | null
          required_webhooks_json: Json | null
          status: string
          title: string
          verification_steps_json: Json | null
        }
        Insert: {
          category: string
          created_at?: string
          detected_reason?: string | null
          id?: string
          item_key: string
          last_scanned_at?: string | null
          manual_steps_json?: Json | null
          priority?: string
          required_env_vars_json?: Json | null
          required_webhooks_json?: Json | null
          status?: string
          title: string
          verification_steps_json?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          detected_reason?: string | null
          id?: string
          item_key?: string
          last_scanned_at?: string | null
          manual_steps_json?: Json | null
          priority?: string
          required_env_vars_json?: Json | null
          required_webhooks_json?: Json | null
          status?: string
          title?: string
          verification_steps_json?: Json | null
        }
        Relationships: []
      }
      missing_connections_log: {
        Row: {
          action: string
          created_at: string
          id: string
          item_id: string
          note: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          item_id: string
          note?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          item_id?: string
          note?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missing_connections_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "missing_connections"
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
      notification_rules: {
        Row: {
          channels: Json
          created_at: string
          description: string | null
          event_action:
            | Database["public"]["Enums"]["timeline_event_action"]
            | null
          event_type: Database["public"]["Enums"]["timeline_event_type"]
          id: string
          is_active: boolean
          priority: Database["public"]["Enums"]["notification_priority"]
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          channels?: Json
          created_at?: string
          description?: string | null
          event_action?:
            | Database["public"]["Enums"]["timeline_event_action"]
            | null
          event_type: Database["public"]["Enums"]["timeline_event_type"]
          id?: string
          is_active?: boolean
          priority?: Database["public"]["Enums"]["notification_priority"]
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          channels?: Json
          created_at?: string
          description?: string | null
          event_action?:
            | Database["public"]["Enums"]["timeline_event_action"]
            | null
          event_type?: Database["public"]["Enums"]["timeline_event_type"]
          id?: string
          is_active?: boolean
          priority?: Database["public"]["Enums"]["notification_priority"]
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      notifications_outbox: {
        Row: {
          body: string
          channel: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          mode: string
          priority: string | null
          sent_at: string | null
          status: string
          target_team: string | null
          target_user_id: string | null
          title: string
        }
        Insert: {
          body: string
          channel: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          mode?: string
          priority?: string | null
          sent_at?: string | null
          status?: string
          target_team?: string | null
          target_user_id?: string | null
          title: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          mode?: string
          priority?: string | null
          sent_at?: string | null
          status?: string
          target_team?: string | null
          target_user_id?: string | null
          title?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          assigned_user_id: string | null
          contact_id: string | null
          created_at: string | null
          expected_close_date: string | null
          id: string
          last_activity_at: string | null
          lead_id: string | null
          lost_reason: string | null
          order_id: string | null
          pipeline_id: string
          probability: number | null
          quote_id: string | null
          source: string | null
          stage_id: string
          stage_type: Database["public"]["Enums"]["pipeline_stage_type"]
          status: string | null
          updated_at: string | null
          value_estimate: number | null
        }
        Insert: {
          assigned_user_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          last_activity_at?: string | null
          lead_id?: string | null
          lost_reason?: string | null
          order_id?: string | null
          pipeline_id: string
          probability?: number | null
          quote_id?: string | null
          source?: string | null
          stage_id: string
          stage_type?: Database["public"]["Enums"]["pipeline_stage_type"]
          status?: string | null
          updated_at?: string | null
          value_estimate?: number | null
        }
        Update: {
          assigned_user_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          last_activity_at?: string | null
          lead_id?: string | null
          lost_reason?: string | null
          order_id?: string | null
          pipeline_id?: string
          probability?: number | null
          quote_id?: string | null
          source?: string | null
          stage_id?: string
          stage_type?: Database["public"]["Enums"]["pipeline_stage_type"]
          status?: string | null
          updated_at?: string | null
          value_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "opportunities_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "opportunities_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      order_cart_items: {
        Row: {
          amount: number | null
          cart_id: string
          created_at: string
          description: string | null
          id: string
          is_price_pending: boolean
          item_type: string
          pricing_source: string
          qty: number
          related_material_category: string | null
          related_size_yd: number | null
          sort_order: number
          title: string
          unit: string
          unit_price: number | null
        }
        Insert: {
          amount?: number | null
          cart_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_price_pending?: boolean
          item_type?: string
          pricing_source?: string
          qty?: number
          related_material_category?: string | null
          related_size_yd?: number | null
          sort_order?: number
          title: string
          unit?: string
          unit_price?: number | null
        }
        Update: {
          amount?: number | null
          cart_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_price_pending?: boolean
          item_type?: string
          pricing_source?: string
          qty?: number
          related_material_category?: string | null
          related_size_yd?: number | null
          sort_order?: number
          title?: string
          unit?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "order_carts"
            referencedColumns: ["id"]
          },
        ]
      }
      order_cart_schedules: {
        Row: {
          cart_item_id: string
          created_at: string
          id: string
          notes: string | null
          schedule_type: string
          scheduled_date: string
          status: string
          time_window: string
        }
        Insert: {
          cart_item_id: string
          created_at?: string
          id?: string
          notes?: string | null
          schedule_type?: string
          scheduled_date: string
          status?: string
          time_window?: string
        }
        Update: {
          cart_item_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          schedule_type?: string
          scheduled_date?: string
          status?: string
          time_window?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_cart_schedules_cart_item_id_fkey"
            columns: ["cart_item_id"]
            isOneToOne: false
            referencedRelation: "order_cart_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_carts: {
        Row: {
          converted_order_id: string | null
          created_at: string
          created_by_user_id: string
          customer_id: string | null
          customer_type: string | null
          id: string
          lead_id: string | null
          notes_customer: string | null
          notes_internal: string | null
          portal_token: string | null
          portal_token_expires_at: string | null
          service_address_text: string | null
          service_lat: number | null
          service_lng: number | null
          status: string
          total_estimated: number | null
          total_final: number | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          converted_order_id?: string | null
          created_at?: string
          created_by_user_id: string
          customer_id?: string | null
          customer_type?: string | null
          id?: string
          lead_id?: string | null
          notes_customer?: string | null
          notes_internal?: string | null
          portal_token?: string | null
          portal_token_expires_at?: string | null
          service_address_text?: string | null
          service_lat?: number | null
          service_lng?: number | null
          status?: string
          total_estimated?: number | null
          total_final?: number | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          converted_order_id?: string | null
          created_at?: string
          created_by_user_id?: string
          customer_id?: string | null
          customer_type?: string | null
          id?: string
          lead_id?: string | null
          notes_customer?: string | null
          notes_internal?: string | null
          portal_token?: string | null
          portal_token_expires_at?: string | null
          service_address_text?: string | null
          service_lat?: number | null
          service_lng?: number | null
          status?: string
          total_estimated?: number | null
          total_final?: number | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_disposal_plans_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_disposal_plans_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
      }
      order_site_placement: {
        Row: {
          created_at: string
          created_by_role: Database["public"]["Enums"]["placement_creator_role"]
          created_by_user_id: string | null
          dumpster_rect_json: Json
          dumpster_size_yd: number
          id: string
          image_storage_path: string | null
          map_center_lat: number
          map_center_lng: number
          map_provider: string
          map_zoom: number
          order_id: string
          placement_notes: string | null
          truck_rect_json: Json
          truck_type: Database["public"]["Enums"]["truck_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_role?: Database["public"]["Enums"]["placement_creator_role"]
          created_by_user_id?: string | null
          dumpster_rect_json?: Json
          dumpster_size_yd: number
          id?: string
          image_storage_path?: string | null
          map_center_lat: number
          map_center_lng: number
          map_provider?: string
          map_zoom?: number
          order_id: string
          placement_notes?: string | null
          truck_rect_json?: Json
          truck_type?: Database["public"]["Enums"]["truck_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_role?: Database["public"]["Enums"]["placement_creator_role"]
          created_by_user_id?: string | null
          dumpster_rect_json?: Json
          dumpster_size_yd?: number
          id?: string
          image_storage_path?: string | null
          map_center_lat?: number
          map_center_lng?: number
          map_provider?: string
          map_zoom?: number
          order_id?: string
          placement_notes?: string | null
          truck_rect_json?: Json
          truck_type?: Database["public"]["Enums"]["truck_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_site_placement_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_site_placement_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_site_placement_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
      }
      orders: {
        Row: {
          access_flags: Json | null
          actual_delivery_at: string | null
          actual_pickup_at: string | null
          actual_weight_tons: number | null
          addendum_contract_id: string | null
          amount_due: number | null
          amount_paid: number | null
          asset_id: string | null
          assigned_driver_id: string | null
          assigned_yard_id: string | null
          balance_due: number | null
          contamination_detected: boolean | null
          contamination_detected_at: string | null
          contamination_notes: string | null
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
          dump_details: Json | null
          dump_ticket_url: string | null
          estimated_fill_pct: number | null
          estimated_weight_tons_max: number | null
          estimated_weight_tons_min: number | null
          eta_confidence: string | null
          eta_max_minutes: number | null
          eta_min_minutes: number | null
          eta_updated_at: string | null
          extra_tons_charged: number | null
          filled_location: string | null
          final_total: number | null
          fraud_blocked: boolean | null
          fraud_flags_count: number | null
          gate_code: string | null
          gclid: string | null
          heavy_material_code: string | null
          id: string
          included_days: number | null
          included_tons_for_size: number | null
          internal_notes: string | null
          inventory_id: string | null
          invoice_url: string | null
          is_dry_run: boolean | null
          is_heavy_material: boolean | null
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
          placement_type: string | null
          portal_link_id: string | null
          portal_link_sent_at: string | null
          portal_show_dump_ticket: boolean | null
          primary_dumpster_id: string | null
          quick_link_id: string | null
          quote_id: string | null
          reclassified_at: string | null
          reclassified_to_debris: boolean | null
          reclassify_on_contamination: boolean | null
          requested_green_halo: boolean | null
          requires_deposit: boolean | null
          requires_fill_line: boolean | null
          requires_manual_review: boolean | null
          requires_pre_pickup_photos: boolean | null
          route_notes: string | null
          scheduled_delivery_date: string | null
          scheduled_delivery_window: string | null
          scheduled_pickup_date: string | null
          scheduled_pickup_window: string | null
          secondary_dumpster_id: string | null
          sla_tier: string | null
          status: string
          text_before_arrival: boolean | null
          truck_id: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          weight_risk_level: string | null
          wrong_material_flagged: boolean | null
        }
        Insert: {
          access_flags?: Json | null
          actual_delivery_at?: string | null
          actual_pickup_at?: string | null
          actual_weight_tons?: number | null
          addendum_contract_id?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          asset_id?: string | null
          assigned_driver_id?: string | null
          assigned_yard_id?: string | null
          balance_due?: number | null
          contamination_detected?: boolean | null
          contamination_detected_at?: string | null
          contamination_notes?: string | null
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
          dump_details?: Json | null
          dump_ticket_url?: string | null
          estimated_fill_pct?: number | null
          estimated_weight_tons_max?: number | null
          estimated_weight_tons_min?: number | null
          eta_confidence?: string | null
          eta_max_minutes?: number | null
          eta_min_minutes?: number | null
          eta_updated_at?: string | null
          extra_tons_charged?: number | null
          filled_location?: string | null
          final_total?: number | null
          fraud_blocked?: boolean | null
          fraud_flags_count?: number | null
          gate_code?: string | null
          gclid?: string | null
          heavy_material_code?: string | null
          id?: string
          included_days?: number | null
          included_tons_for_size?: number | null
          internal_notes?: string | null
          inventory_id?: string | null
          invoice_url?: string | null
          is_dry_run?: boolean | null
          is_heavy_material?: boolean | null
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
          placement_type?: string | null
          portal_link_id?: string | null
          portal_link_sent_at?: string | null
          portal_show_dump_ticket?: boolean | null
          primary_dumpster_id?: string | null
          quick_link_id?: string | null
          quote_id?: string | null
          reclassified_at?: string | null
          reclassified_to_debris?: boolean | null
          reclassify_on_contamination?: boolean | null
          requested_green_halo?: boolean | null
          requires_deposit?: boolean | null
          requires_fill_line?: boolean | null
          requires_manual_review?: boolean | null
          requires_pre_pickup_photos?: boolean | null
          route_notes?: string | null
          scheduled_delivery_date?: string | null
          scheduled_delivery_window?: string | null
          scheduled_pickup_date?: string | null
          scheduled_pickup_window?: string | null
          secondary_dumpster_id?: string | null
          sla_tier?: string | null
          status?: string
          text_before_arrival?: boolean | null
          truck_id?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          weight_risk_level?: string | null
          wrong_material_flagged?: boolean | null
        }
        Update: {
          access_flags?: Json | null
          actual_delivery_at?: string | null
          actual_pickup_at?: string | null
          actual_weight_tons?: number | null
          addendum_contract_id?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          asset_id?: string | null
          assigned_driver_id?: string | null
          assigned_yard_id?: string | null
          balance_due?: number | null
          contamination_detected?: boolean | null
          contamination_detected_at?: string | null
          contamination_notes?: string | null
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
          dump_details?: Json | null
          dump_ticket_url?: string | null
          estimated_fill_pct?: number | null
          estimated_weight_tons_max?: number | null
          estimated_weight_tons_min?: number | null
          eta_confidence?: string | null
          eta_max_minutes?: number | null
          eta_min_minutes?: number | null
          eta_updated_at?: string | null
          extra_tons_charged?: number | null
          filled_location?: string | null
          final_total?: number | null
          fraud_blocked?: boolean | null
          fraud_flags_count?: number | null
          gate_code?: string | null
          gclid?: string | null
          heavy_material_code?: string | null
          id?: string
          included_days?: number | null
          included_tons_for_size?: number | null
          internal_notes?: string | null
          inventory_id?: string | null
          invoice_url?: string | null
          is_dry_run?: boolean | null
          is_heavy_material?: boolean | null
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
          placement_type?: string | null
          portal_link_id?: string | null
          portal_link_sent_at?: string | null
          portal_show_dump_ticket?: boolean | null
          primary_dumpster_id?: string | null
          quick_link_id?: string | null
          quote_id?: string | null
          reclassified_at?: string | null
          reclassified_to_debris?: boolean | null
          reclassify_on_contamination?: boolean | null
          requested_green_halo?: boolean | null
          requires_deposit?: boolean | null
          requires_fill_line?: boolean | null
          requires_manual_review?: boolean | null
          requires_pre_pickup_photos?: boolean | null
          route_notes?: string | null
          scheduled_delivery_date?: string | null
          scheduled_delivery_window?: string | null
          scheduled_pickup_date?: string | null
          scheduled_pickup_window?: string | null
          secondary_dumpster_id?: string | null
          sla_tier?: string | null
          status?: string
          text_before_arrival?: boolean | null
          truck_id?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          weight_risk_level?: string | null
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
            foreignKeyName: "orders_assigned_yard_id_fkey"
            columns: ["assigned_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
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
            foreignKeyName: "orders_destination_yard_id_fkey"
            columns: ["destination_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
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
            foreignKeyName: "orders_origin_yard_id_fkey"
            columns: ["origin_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_parent_order_id_fkey"
            columns: ["parent_order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "orders_parent_order_id_fkey"
            columns: ["parent_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_parent_order_id_fkey"
            columns: ["parent_order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "orders_portal_link_id_fkey"
            columns: ["portal_link_id"]
            isOneToOne: false
            referencedRelation: "customer_portal_links"
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
      outbound_quote_messages: {
        Row: {
          channel: string
          created_at: string
          id: string
          message_body: string
          outbound_quote_id: string
          provider: string
          provider_message_id: string | null
          status: string
          to_address: string
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          message_body: string
          outbound_quote_id: string
          provider: string
          provider_message_id?: string | null
          status?: string
          to_address: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          message_body?: string
          outbound_quote_id?: string
          provider?: string
          provider_message_id?: string | null
          status?: string
          to_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "outbound_quote_messages_outbound_quote_id_fkey"
            columns: ["outbound_quote_id"]
            isOneToOne: false
            referencedRelation: "outbound_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      outbound_quotes: {
        Row: {
          address_text: string | null
          created_at: string
          created_by_user_id: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          customer_price: number
          customer_type: string
          error_message: string | null
          id: string
          included_days: number
          included_tons: string
          material_category: string
          order_id: string | null
          overage_rule_text: string
          payment_link: string | null
          portal_link: string | null
          quote_id: string | null
          quote_source: string
          same_day_flag: boolean
          schedule_link: string | null
          size_yd: number
          status: string
          tier: string
          zip: string | null
        }
        Insert: {
          address_text?: string | null
          created_at?: string
          created_by_user_id: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          customer_price: number
          customer_type?: string
          error_message?: string | null
          id?: string
          included_days?: number
          included_tons?: string
          material_category?: string
          order_id?: string | null
          overage_rule_text?: string
          payment_link?: string | null
          portal_link?: string | null
          quote_id?: string | null
          quote_source?: string
          same_day_flag?: boolean
          schedule_link?: string | null
          size_yd: number
          status?: string
          tier: string
          zip?: string | null
        }
        Update: {
          address_text?: string | null
          created_at?: string
          created_by_user_id?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          customer_price?: number
          customer_type?: string
          error_message?: string | null
          id?: string
          included_days?: number
          included_tons?: string
          material_category?: string
          order_id?: string | null
          overage_rule_text?: string
          payment_link?: string | null
          portal_link?: string | null
          quote_id?: string | null
          quote_source?: string
          same_day_flag?: boolean
          schedule_link?: string | null
          size_yd?: number
          status?: string
          tier?: string
          zip?: string | null
        }
        Relationships: []
      }
      overdue_billing_state: {
        Row: {
          asset_id: string
          billed_overdue_days_total: number
          created_at: string
          id: string
          last_billed_at: string | null
          last_notified_at: string | null
          order_id: string
          updated_at: string
        }
        Insert: {
          asset_id: string
          billed_overdue_days_total?: number
          created_at?: string
          id?: string
          last_billed_at?: string | null
          last_notified_at?: string | null
          order_id: string
          updated_at?: string
        }
        Update: {
          asset_id?: string
          billed_overdue_days_total?: number
          created_at?: string
          id?: string
          last_billed_at?: string | null
          last_notified_at?: string | null
          order_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "overdue_billing_state_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets_dumpsters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overdue_billing_state_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overdue_billing_state_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "overdue_billing_state_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "overdue_billing_state_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overdue_billing_state_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
      }
      owner_operator_rates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          market_code: string
          mileage_rate: number | null
          minimum_payout: number | null
          notes: string | null
          payout_delivery: number
          payout_dump_run: number | null
          payout_pickup: number
          payout_swap: number
          toll_policy_json: Json | null
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          market_code: string
          mileage_rate?: number | null
          minimum_payout?: number | null
          notes?: string | null
          payout_delivery?: number
          payout_dump_run?: number | null
          payout_pickup?: number
          payout_swap?: number
          toll_policy_json?: Json | null
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          market_code?: string
          mileage_rate?: number | null
          minimum_payout?: number | null
          notes?: string | null
          payout_delivery?: number
          payout_dump_run?: number | null
          payout_pickup?: number
          payout_swap?: number
          toll_policy_json?: Json | null
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
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
          gclid: string | null
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
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
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
          gclid?: string | null
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
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
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
          gclid?: string | null
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
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          created_at: string | null
          friendly_name: string | null
          id: string
          is_active: boolean | null
          market_code: string | null
          purpose: Database["public"]["Enums"]["phone_purpose"]
          twilio_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          friendly_name?: string | null
          id?: string
          is_active?: boolean | null
          market_code?: string | null
          purpose: Database["public"]["Enums"]["phone_purpose"]
          twilio_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          friendly_name?: string | null
          id?: string
          is_active?: boolean | null
          market_code?: string | null
          purpose?: Database["public"]["Enums"]["phone_purpose"]
          twilio_number?: string
          updated_at?: string | null
        }
        Relationships: []
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
      pipeline_stages: {
        Row: {
          auto_advance_days: number | null
          color: string | null
          created_at: string | null
          id: string
          name: string
          pipeline_id: string
          position: number
          stage_type: Database["public"]["Enums"]["pipeline_stage_type"]
        }
        Insert: {
          auto_advance_days?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          pipeline_id: string
          position: number
          stage_type: Database["public"]["Enums"]["pipeline_stage_type"]
        }
        Update: {
          auto_advance_days?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          pipeline_id?: string
          position?: number
          stage_type?: Database["public"]["Enums"]["pipeline_stage_type"]
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pod_requirements: {
        Row: {
          checkpoint_type: Database["public"]["Enums"]["checkpoint_type"]
          condition_json: Json | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          run_type: Database["public"]["Enums"]["run_type"]
        }
        Insert: {
          checkpoint_type: Database["public"]["Enums"]["checkpoint_type"]
          condition_json?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          run_type: Database["public"]["Enums"]["run_type"]
        }
        Update: {
          checkpoint_type?: Database["public"]["Enums"]["checkpoint_type"]
          condition_json?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          run_type?: Database["public"]["Enums"]["run_type"]
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
      pricing_override_log: {
        Row: {
          cart_id: string | null
          created_at: string
          extra_code: string | null
          id: string
          item_id: string | null
          new_price: number
          order_id: string | null
          original_price: number
          reason: string | null
          user_id: string
        }
        Insert: {
          cart_id?: string | null
          created_at?: string
          extra_code?: string | null
          id?: string
          item_id?: string | null
          new_price: number
          order_id?: string | null
          original_price: number
          reason?: string | null
          user_id: string
        }
        Update: {
          cart_id?: string | null
          created_at?: string
          extra_code?: string | null
          id?: string
          item_id?: string | null
          new_price?: number
          order_id?: string | null
          original_price?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_override_log_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "order_carts"
            referencedColumns: ["id"]
          },
        ]
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
      profit_guardrail_events: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          is_acknowledged: boolean
          margin_pct: number | null
          reason: string
          recommendation: string | null
          recommended_action: string | null
          severity: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          is_acknowledged?: boolean
          margin_pct?: number | null
          reason: string
          recommendation?: string | null
          recommended_action?: string | null
          severity?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_acknowledged?: boolean
          margin_pct?: number | null
          reason?: string
          recommendation?: string | null
          recommended_action?: string | null
          severity?: string
        }
        Relationships: []
      }
      project_categories: {
        Row: {
          allowed_customer_types: Json | null
          category_code: string
          created_at: string | null
          description: string | null
          description_es: string | null
          display_name: string
          display_name_es: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_customer_types?: Json | null
          category_code: string
          created_at?: string | null
          description?: string | null
          description_es?: string | null
          display_name: string
          display_name_es?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_customer_types?: Json | null
          category_code?: string
          created_at?: string | null
          description?: string | null
          description_es?: string | null
          display_name?: string
          display_name_es?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_devices: {
        Row: {
          app_version: string | null
          created_at: string | null
          device_token: string
          enabled: boolean | null
          id: string
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          device_token: string
          enabled?: boolean | null
          id?: string
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          device_token?: string
          enabled?: boolean | null
          id?: string
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      qa_checks: {
        Row: {
          category: Database["public"]["Enums"]["qa_category"]
          check_key: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          severity: Database["public"]["Enums"]["qa_severity"]
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["qa_category"]
          check_key: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          severity?: Database["public"]["Enums"]["qa_severity"]
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["qa_category"]
          check_key?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          severity?: Database["public"]["Enums"]["qa_severity"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      qa_results: {
        Row: {
          admin_route: string | null
          check_key: string
          created_at: string
          details_json: Json | null
          evidence: string | null
          fix_suggestion: string | null
          id: string
          qa_run_id: string
          status: Database["public"]["Enums"]["qa_check_status"]
        }
        Insert: {
          admin_route?: string | null
          check_key: string
          created_at?: string
          details_json?: Json | null
          evidence?: string | null
          fix_suggestion?: string | null
          id?: string
          qa_run_id: string
          status: Database["public"]["Enums"]["qa_check_status"]
        }
        Update: {
          admin_route?: string | null
          check_key?: string
          created_at?: string
          details_json?: Json | null
          evidence?: string | null
          fix_suggestion?: string | null
          id?: string
          qa_run_id?: string
          status?: Database["public"]["Enums"]["qa_check_status"]
        }
        Relationships: [
          {
            foreignKeyName: "qa_results_qa_run_id_fkey"
            columns: ["qa_run_id"]
            isOneToOne: false
            referencedRelation: "qa_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          started_at: string
          started_by_user_id: string | null
          status: Database["public"]["Enums"]["qa_run_status"]
          summary_json: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string
          started_by_user_id?: string | null
          status?: Database["public"]["Enums"]["qa_run_status"]
          summary_json?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string
          started_by_user_id?: string | null
          status?: Database["public"]["Enums"]["qa_run_status"]
          summary_json?: Json | null
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
          {
            foreignKeyName: "quick_links_preset_yard_id_fkey"
            columns: ["preset_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_contracts: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          dumpster_size: string | null
          id: string
          material_type: string | null
          price: number | null
          quote_id: string
          rental_days: number | null
          sent_at: string | null
          sent_via: string[] | null
          service_address: string | null
          signature_data: string | null
          signature_type: string | null
          signed_at: string | null
          signed_ip: string | null
          status: string
          terms_content: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          dumpster_size?: string | null
          id?: string
          material_type?: string | null
          price?: number | null
          quote_id: string
          rental_days?: number | null
          sent_at?: string | null
          sent_via?: string[] | null
          service_address?: string | null
          signature_data?: string | null
          signature_type?: string | null
          signed_at?: string | null
          signed_ip?: string | null
          status?: string
          terms_content: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          dumpster_size?: string | null
          id?: string
          material_type?: string | null
          price?: number | null
          quote_id?: string
          rental_days?: number | null
          sent_at?: string | null
          sent_via?: string[] | null
          service_address?: string | null
          signature_data?: string | null
          signature_type?: string | null
          signed_at?: string | null
          signed_ip?: string | null
          status?: string
          terms_content?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_contracts_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_drafts: {
        Row: {
          address: string | null
          created_at: string
          customer_type: string | null
          draft_token: string
          email: string | null
          expires_at: string
          id: string
          name: string | null
          phone: string | null
          project_id: string | null
          size: number | null
          step: string | null
          updated_at: string
          wants_swap: boolean | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_type?: string | null
          draft_token?: string
          email?: string | null
          expires_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          project_id?: string | null
          size?: number | null
          step?: string | null
          updated_at?: string
          wants_swap?: boolean | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_type?: string | null
          draft_token?: string
          email?: string | null
          expires_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          project_id?: string | null
          size?: number | null
          step?: string | null
          updated_at?: string
          wants_swap?: boolean | null
          zip?: string | null
        }
        Relationships: []
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
      quote_item_selections: {
        Row: {
          created_at: string
          id: string
          item_code: string
          quantity_level: string
          quote_id: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_code: string
          quantity_level?: string
          quote_id?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_code?: string
          quantity_level?: string
          quote_id?: string | null
          session_id?: string
        }
        Relationships: []
      }
      quote_site_placement: {
        Row: {
          created_at: string
          geometry_json: Json
          id: string
          notes: string | null
          quote_id: string
          screenshot_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          geometry_json: Json
          id?: string
          notes?: string | null
          quote_id: string
          screenshot_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          geometry_json?: Json
          id?: string
          notes?: string | null
          quote_id?: string
          screenshot_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          access_flags: Json | null
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
          delivery_date: string | null
          delivery_instructions: string | null
          delivery_lat: number | null
          delivery_lng: number | null
          delivery_photos: string[] | null
          delivery_time_window: string | null
          discount_cap_applied: boolean | null
          discount_percent: number | null
          display_id: string | null
          distance_bracket: string | null
          distance_miles: number | null
          driver_id: string | null
          estimated_fill_pct: number | null
          estimated_max: number
          estimated_min: number
          estimated_weight_tons_max: number | null
          estimated_weight_tons_min: number | null
          extra_tons_prepurchased: number | null
          extras: string[] | null
          fraud_flags_count: number | null
          gate_code: string | null
          gclid: string | null
          green_halo_category: string | null
          green_halo_dump_fee: number | null
          green_halo_dump_fee_per_ton: number | null
          green_halo_handling_fee: number | null
          heavy_material_class: string | null
          heavy_material_code: string | null
          heavy_material_increment: number | null
          highlevel_contact_id: string | null
          highlevel_tags: string[] | null
          id: string
          is_calsan_fulfillment: boolean
          is_green_halo: boolean | null
          is_heavy_material: boolean | null
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
          reclassify_on_contamination: boolean | null
          recommendation_reason: string | null
          recommended_size_yards: number | null
          rental_days: number
          requested_green_halo: boolean | null
          requires_discount_approval: boolean | null
          requires_fill_line: boolean | null
          requires_pre_pickup_photos: boolean | null
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
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          vendor_cost: number | null
          volume_agreement_id: string | null
          volume_commitment_count: number | null
          volume_discount_pct: number | null
          volume_validity_end: string | null
          volume_validity_start: string | null
          weight_risk_level: string | null
          yard_id: string | null
          yard_name: string | null
          zip_code: string
          zone_id: string | null
        }
        Insert: {
          access_flags?: Json | null
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
          delivery_date?: string | null
          delivery_instructions?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_photos?: string[] | null
          delivery_time_window?: string | null
          discount_cap_applied?: boolean | null
          discount_percent?: number | null
          display_id?: string | null
          distance_bracket?: string | null
          distance_miles?: number | null
          driver_id?: string | null
          estimated_fill_pct?: number | null
          estimated_max: number
          estimated_min: number
          estimated_weight_tons_max?: number | null
          estimated_weight_tons_min?: number | null
          extra_tons_prepurchased?: number | null
          extras?: string[] | null
          fraud_flags_count?: number | null
          gate_code?: string | null
          gclid?: string | null
          green_halo_category?: string | null
          green_halo_dump_fee?: number | null
          green_halo_dump_fee_per_ton?: number | null
          green_halo_handling_fee?: number | null
          heavy_material_class?: string | null
          heavy_material_code?: string | null
          heavy_material_increment?: number | null
          highlevel_contact_id?: string | null
          highlevel_tags?: string[] | null
          id?: string
          is_calsan_fulfillment?: boolean
          is_green_halo?: boolean | null
          is_heavy_material?: boolean | null
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
          reclassify_on_contamination?: boolean | null
          recommendation_reason?: string | null
          recommended_size_yards?: number | null
          rental_days?: number
          requested_green_halo?: boolean | null
          requires_discount_approval?: boolean | null
          requires_fill_line?: boolean | null
          requires_pre_pickup_photos?: boolean | null
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
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          vendor_cost?: number | null
          volume_agreement_id?: string | null
          volume_commitment_count?: number | null
          volume_discount_pct?: number | null
          volume_validity_end?: string | null
          volume_validity_start?: string | null
          weight_risk_level?: string | null
          yard_id?: string | null
          yard_name?: string | null
          zip_code: string
          zone_id?: string | null
        }
        Update: {
          access_flags?: Json | null
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
          delivery_date?: string | null
          delivery_instructions?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_photos?: string[] | null
          delivery_time_window?: string | null
          discount_cap_applied?: boolean | null
          discount_percent?: number | null
          display_id?: string | null
          distance_bracket?: string | null
          distance_miles?: number | null
          driver_id?: string | null
          estimated_fill_pct?: number | null
          estimated_max?: number
          estimated_min?: number
          estimated_weight_tons_max?: number | null
          estimated_weight_tons_min?: number | null
          extra_tons_prepurchased?: number | null
          extras?: string[] | null
          fraud_flags_count?: number | null
          gate_code?: string | null
          gclid?: string | null
          green_halo_category?: string | null
          green_halo_dump_fee?: number | null
          green_halo_dump_fee_per_ton?: number | null
          green_halo_handling_fee?: number | null
          heavy_material_class?: string | null
          heavy_material_code?: string | null
          heavy_material_increment?: number | null
          highlevel_contact_id?: string | null
          highlevel_tags?: string[] | null
          id?: string
          is_calsan_fulfillment?: boolean
          is_green_halo?: boolean | null
          is_heavy_material?: boolean | null
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
          reclassify_on_contamination?: boolean | null
          recommendation_reason?: string | null
          recommended_size_yards?: number | null
          rental_days?: number
          requested_green_halo?: boolean | null
          requires_discount_approval?: boolean | null
          requires_fill_line?: boolean | null
          requires_pre_pickup_photos?: boolean | null
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
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          vendor_cost?: number | null
          volume_agreement_id?: string | null
          volume_commitment_count?: number | null
          volume_discount_pct?: number | null
          volume_validity_end?: string | null
          volume_validity_start?: string | null
          weight_risk_level?: string | null
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "quotes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
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
      review_requests: {
        Row: {
          channel: string
          city_name: string | null
          created_at: string
          customer_id: string
          customer_type: string | null
          email_sent_at: string | null
          followup_1_sent_at: string | null
          followup_2_sent_at: string | null
          id: string
          market_code: string | null
          opted_out: boolean | null
          order_id: string
          review_link: string
          review_rating: number | null
          review_received: boolean | null
          review_received_at: string | null
          sent_at: string | null
          sms_sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          channel?: string
          city_name?: string | null
          created_at?: string
          customer_id: string
          customer_type?: string | null
          email_sent_at?: string | null
          followup_1_sent_at?: string | null
          followup_2_sent_at?: string | null
          id?: string
          market_code?: string | null
          opted_out?: boolean | null
          order_id: string
          review_link: string
          review_rating?: number | null
          review_received?: boolean | null
          review_received_at?: string | null
          sent_at?: string | null
          sms_sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          channel?: string
          city_name?: string | null
          created_at?: string
          customer_id?: string
          customer_type?: string | null
          email_sent_at?: string | null
          followup_1_sent_at?: string | null
          followup_2_sent_at?: string | null
          id?: string
          market_code?: string | null
          opted_out?: boolean | null
          order_id?: string
          review_link?: string
          review_rating?: number | null
          review_received?: boolean | null
          review_received_at?: string | null
          sent_at?: string | null
          sms_sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "review_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
      }
      risk_checks: {
        Row: {
          created_at: string
          email_input: string | null
          entity_id: string | null
          entity_type: string
          id: string
          phone_input: string | null
          phone_normalized: string | null
          provider_results_json: Json | null
          reasons_json: Json | null
          requested_by_user_id: string | null
          risk_band: string
          risk_score: number
        }
        Insert: {
          created_at?: string
          email_input?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          phone_input?: string | null
          phone_normalized?: string | null
          provider_results_json?: Json | null
          reasons_json?: Json | null
          requested_by_user_id?: string | null
          risk_band?: string
          risk_score?: number
        }
        Update: {
          created_at?: string
          email_input?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          phone_input?: string | null
          phone_normalized?: string | null
          provider_results_json?: Json | null
          reasons_json?: Json | null
          requested_by_user_id?: string | null
          risk_band?: string
          risk_score?: number
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "risk_score_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_score_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
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
      role_assignments_audit: {
        Row: {
          assigned_by_email: string | null
          assigned_by_user_id: string
          assigned_role: string
          created_at: string
          id: string
          reason: string | null
          source: string
          target_email: string | null
          target_user_id: string
        }
        Insert: {
          assigned_by_email?: string | null
          assigned_by_user_id: string
          assigned_role: string
          created_at?: string
          id?: string
          reason?: string | null
          source: string
          target_email?: string | null
          target_user_id: string
        }
        Update: {
          assigned_by_email?: string | null
          assigned_by_user_id?: string
          assigned_role?: string
          created_at?: string
          id?: string
          reason?: string | null
          source?: string
          target_email?: string | null
          target_user_id?: string
        }
        Relationships: []
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
      run_checkpoints: {
        Row: {
          checkpoint_type: Database["public"]["Enums"]["checkpoint_type"]
          completed_at: string | null
          completed_by: string | null
          created_at: string
          document_urls: Json | null
          id: string
          is_required: boolean
          metadata: Json | null
          notes: string | null
          photo_urls: Json | null
          run_id: string
          updated_at: string
          validation_notes: string | null
          validation_status: string | null
        }
        Insert: {
          checkpoint_type: Database["public"]["Enums"]["checkpoint_type"]
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          document_urls?: Json | null
          id?: string
          is_required?: boolean
          metadata?: Json | null
          notes?: string | null
          photo_urls?: Json | null
          run_id: string
          updated_at?: string
          validation_notes?: string | null
          validation_status?: string | null
        }
        Update: {
          checkpoint_type?: Database["public"]["Enums"]["checkpoint_type"]
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          document_urls?: Json | null
          id?: string
          is_required?: boolean
          metadata?: Json | null
          notes?: string | null
          photo_urls?: Json | null
          run_id?: string
          updated_at?: string
          validation_notes?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "run_checkpoints_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      run_events: {
        Row: {
          actor_id: string | null
          actor_role: string | null
          created_at: string
          event_type: string
          from_status: string | null
          id: string
          metadata: Json | null
          notes: string | null
          run_id: string
          to_status: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_type: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          run_id: string
          to_status?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_type?: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          run_id?: string
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "run_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      run_route_points: {
        Row: {
          id: string
          lat: number
          lng: number
          recorded_at: string
          run_id: string
        }
        Insert: {
          id?: string
          lat: number
          lng: number
          recorded_at?: string
          run_id: string
        }
        Update: {
          id?: string
          lat?: number
          lng?: number
          recorded_at?: string
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "run_route_points_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      run_routes: {
        Row: {
          created_at: string
          dest_lat: number | null
          dest_lng: number | null
          distance_miles: number | null
          duration_minutes: number | null
          duration_traffic_minutes: number | null
          geojson: Json | null
          id: string
          origin_lat: number | null
          origin_lng: number | null
          polyline: string | null
          route_type: string
          run_id: string
        }
        Insert: {
          created_at?: string
          dest_lat?: number | null
          dest_lng?: number | null
          distance_miles?: number | null
          duration_minutes?: number | null
          duration_traffic_minutes?: number | null
          geojson?: Json | null
          id?: string
          origin_lat?: number | null
          origin_lng?: number | null
          polyline?: string | null
          route_type: string
          run_id: string
        }
        Update: {
          created_at?: string
          dest_lat?: number | null
          dest_lng?: number | null
          distance_miles?: number | null
          duration_minutes?: number | null
          duration_traffic_minutes?: number | null
          geojson?: Json | null
          id?: string
          origin_lat?: number | null
          origin_lng?: number | null
          polyline?: string | null
          route_type?: string
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "run_routes_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      runs: {
        Row: {
          accepted_at: string | null
          actual_miles: number | null
          actual_weight_tons: number | null
          arrived_at: string | null
          asset_id: string | null
          assigned_driver_id: string | null
          assigned_truck_id: string | null
          assignment_type: Database["public"]["Enums"]["assignment_type"]
          base_payout: number | null
          bonus_payout: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          contamination_flagged: boolean | null
          created_at: string
          created_by: string | null
          customer_name: string | null
          customer_phone: string | null
          destination_address: string | null
          destination_facility_id: string | null
          destination_lat: number | null
          destination_lng: number | null
          destination_type: Database["public"]["Enums"]["location_type"]
          destination_yard_id: string | null
          dispatcher_notes: string | null
          driver_notes: string | null
          dump_fee: number | null
          estimated_duration_mins: number | null
          estimated_miles: number | null
          fill_line_compliant: boolean | null
          id: string
          is_heavy_material: boolean | null
          material_code: string | null
          mileage_payout: number | null
          notes: string | null
          order_id: string | null
          origin_address: string | null
          origin_facility_id: string | null
          origin_lat: number | null
          origin_lng: number | null
          origin_type: Database["public"]["Enums"]["location_type"]
          origin_yard_id: string | null
          overfill_flagged: boolean | null
          pause_reason: string | null
          paused_at: string | null
          payout_status: string | null
          pickup_asset_id: string | null
          priority: number
          requires_fill_line_check: boolean | null
          resumed_at: string | null
          run_number: string | null
          run_type: Database["public"]["Enums"]["run_type"]
          scheduled_date: string
          scheduled_end: string | null
          scheduled_start: string | null
          scheduled_window: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["run_status"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          actual_miles?: number | null
          actual_weight_tons?: number | null
          arrived_at?: string | null
          asset_id?: string | null
          assigned_driver_id?: string | null
          assigned_truck_id?: string | null
          assignment_type?: Database["public"]["Enums"]["assignment_type"]
          base_payout?: number | null
          bonus_payout?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          contamination_flagged?: boolean | null
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          destination_address?: string | null
          destination_facility_id?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          destination_type?: Database["public"]["Enums"]["location_type"]
          destination_yard_id?: string | null
          dispatcher_notes?: string | null
          driver_notes?: string | null
          dump_fee?: number | null
          estimated_duration_mins?: number | null
          estimated_miles?: number | null
          fill_line_compliant?: boolean | null
          id?: string
          is_heavy_material?: boolean | null
          material_code?: string | null
          mileage_payout?: number | null
          notes?: string | null
          order_id?: string | null
          origin_address?: string | null
          origin_facility_id?: string | null
          origin_lat?: number | null
          origin_lng?: number | null
          origin_type?: Database["public"]["Enums"]["location_type"]
          origin_yard_id?: string | null
          overfill_flagged?: boolean | null
          pause_reason?: string | null
          paused_at?: string | null
          payout_status?: string | null
          pickup_asset_id?: string | null
          priority?: number
          requires_fill_line_check?: boolean | null
          resumed_at?: string | null
          run_number?: string | null
          run_type: Database["public"]["Enums"]["run_type"]
          scheduled_date: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          scheduled_window?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["run_status"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          actual_miles?: number | null
          actual_weight_tons?: number | null
          arrived_at?: string | null
          asset_id?: string | null
          assigned_driver_id?: string | null
          assigned_truck_id?: string | null
          assignment_type?: Database["public"]["Enums"]["assignment_type"]
          base_payout?: number | null
          bonus_payout?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          contamination_flagged?: boolean | null
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          destination_address?: string | null
          destination_facility_id?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          destination_type?: Database["public"]["Enums"]["location_type"]
          destination_yard_id?: string | null
          dispatcher_notes?: string | null
          driver_notes?: string | null
          dump_fee?: number | null
          estimated_duration_mins?: number | null
          estimated_miles?: number | null
          fill_line_compliant?: boolean | null
          id?: string
          is_heavy_material?: boolean | null
          material_code?: string | null
          mileage_payout?: number | null
          notes?: string | null
          order_id?: string | null
          origin_address?: string | null
          origin_facility_id?: string | null
          origin_lat?: number | null
          origin_lng?: number | null
          origin_type?: Database["public"]["Enums"]["location_type"]
          origin_yard_id?: string | null
          overfill_flagged?: boolean | null
          pause_reason?: string | null
          paused_at?: string | null
          payout_status?: string | null
          pickup_asset_id?: string | null
          priority?: number
          requires_fill_line_check?: boolean | null
          resumed_at?: string | null
          run_number?: string | null
          run_type?: Database["public"]["Enums"]["run_type"]
          scheduled_date?: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          scheduled_window?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["run_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets_dumpsters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "runs_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_assigned_truck_id_fkey"
            columns: ["assigned_truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_destination_facility_id_fkey"
            columns: ["destination_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_destination_yard_id_fkey"
            columns: ["destination_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "runs_destination_yard_id_fkey"
            columns: ["destination_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_destination_yard_id_fkey"
            columns: ["destination_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "runs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "runs_origin_facility_id_fkey"
            columns: ["origin_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_origin_yard_id_fkey"
            columns: ["origin_yard_id"]
            isOneToOne: false
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "runs_origin_yard_id_fkey"
            columns: ["origin_yard_id"]
            isOneToOne: false
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_origin_yard_id_fkey"
            columns: ["origin_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_pickup_asset_id_fkey"
            columns: ["pickup_asset_id"]
            isOneToOne: false
            referencedRelation: "assets_dumpsters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_pickup_asset_id_fkey"
            columns: ["pickup_asset_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_pickup_asset_id_fkey"
            columns: ["pickup_asset_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      sales_ai_audit: {
        Row: {
          action_type: string
          ai_output_json: Json | null
          contact_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          input_summary_json: Json | null
          latency_ms: number | null
          lead_id: string | null
          model_used: string | null
          tokens_used: number | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action_type: string
          ai_output_json?: Json | null
          contact_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          input_summary_json?: Json | null
          latency_ms?: number | null
          lead_id?: string | null
          model_used?: string | null
          tokens_used?: number | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action_type?: string
          ai_output_json?: Json | null
          contact_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          input_summary_json?: Json | null
          latency_ms?: number | null
          lead_id?: string | null
          model_used?: string | null
          tokens_used?: number | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_ai_audit_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_ai_audit_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_ai_insights: {
        Row: {
          churn_risk_score: number | null
          contact_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          intent_score: number | null
          lead_id: string | null
          model_used: string | null
          objections_json: Json | null
          reasoning: string | null
          recommended_next_action: string | null
          recommended_offer_json: Json | null
          recommended_script_json: Json | null
          urgency_score: number | null
          value_score: number | null
        }
        Insert: {
          churn_risk_score?: number | null
          contact_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          intent_score?: number | null
          lead_id?: string | null
          model_used?: string | null
          objections_json?: Json | null
          reasoning?: string | null
          recommended_next_action?: string | null
          recommended_offer_json?: Json | null
          recommended_script_json?: Json | null
          urgency_score?: number | null
          value_score?: number | null
        }
        Update: {
          churn_risk_score?: number | null
          contact_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          intent_score?: number | null
          lead_id?: string | null
          model_used?: string | null
          objections_json?: Json | null
          reasoning?: string | null
          recommended_next_action?: string | null
          recommended_offer_json?: Json | null
          recommended_script_json?: Json | null
          urgency_score?: number | null
          value_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_ai_insights_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_ai_insights_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_ai_messages_drafts: {
        Row: {
          channel: string
          contact_id: string | null
          created_at: string
          created_by_user_id: string | null
          discarded_at: string | null
          draft_body: string
          draft_type: string | null
          id: string
          insight_id: string | null
          lead_id: string | null
          sent_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          channel: string
          contact_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          discarded_at?: string | null
          draft_body: string
          draft_type?: string | null
          id?: string
          insight_id?: string | null
          lead_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          channel?: string
          contact_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          discarded_at?: string | null
          draft_body?: string
          draft_type?: string | null
          id?: string
          insight_id?: string | null
          lead_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_ai_messages_drafts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_ai_messages_drafts_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "sales_ai_insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_ai_messages_drafts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_leads: {
        Row: {
          address: string | null
          ai_classification_json: Json | null
          ai_mode: string | null
          ai_recommended_action: string | null
          assigned_at: string | null
          assigned_to: string | null
          assignment_type: string | null
          call_recording_id: string | null
          capture_ip: string | null
          capture_user_agent: string | null
          channel_key: string | null
          city: string | null
          company_domain: string | null
          company_name: string | null
          consent_status: string | null
          converted_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_type_detected: string | null
          escalation_level: number
          first_contact_at: string | null
          first_response_at: string | null
          first_response_sent_at: string | null
          followup_count: number
          gclid: string | null
          id: string
          is_existing_customer: boolean | null
          is_sla_breached: boolean
          landing_url: string | null
          last_activity_at: string | null
          last_contacted_at: string | null
          last_contacted_by_user_id: string | null
          last_followup_at: string | null
          lat: number | null
          latest_assessment_id: string | null
          latest_heavy_flag: boolean | null
          latest_recommended_size: number | null
          lead_quality_label: string | null
          lead_quality_score: number | null
          lead_risk_score: number | null
          lead_source: string | null
          lead_status: string
          linked_contact_id: string | null
          linked_opportunity_id: string | null
          lng: number | null
          market_code: string | null
          material_category: string | null
          message_excerpt: string | null
          next_followup_at: string | null
          notes: string | null
          owner_user_id: string | null
          project_category: string | null
          quote_id: string | null
          raw_payload_json: Json | null
          referrer_url: string | null
          requested_service: string | null
          routing_rule_id: string | null
          routing_tags: string[] | null
          sales_notes: string | null
          size_preference: string | null
          sla_due_at: string | null
          sla_minutes: number
          source_key: string | null
          timeout_at: string | null
          updated_at: string
          urgency_score: number | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          ai_classification_json?: Json | null
          ai_mode?: string | null
          ai_recommended_action?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          assignment_type?: string | null
          call_recording_id?: string | null
          capture_ip?: string | null
          capture_user_agent?: string | null
          channel_key?: string | null
          city?: string | null
          company_domain?: string | null
          company_name?: string | null
          consent_status?: string | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_type_detected?: string | null
          escalation_level?: number
          first_contact_at?: string | null
          first_response_at?: string | null
          first_response_sent_at?: string | null
          followup_count?: number
          gclid?: string | null
          id?: string
          is_existing_customer?: boolean | null
          is_sla_breached?: boolean
          landing_url?: string | null
          last_activity_at?: string | null
          last_contacted_at?: string | null
          last_contacted_by_user_id?: string | null
          last_followup_at?: string | null
          lat?: number | null
          latest_assessment_id?: string | null
          latest_heavy_flag?: boolean | null
          latest_recommended_size?: number | null
          lead_quality_label?: string | null
          lead_quality_score?: number | null
          lead_risk_score?: number | null
          lead_source?: string | null
          lead_status?: string
          linked_contact_id?: string | null
          linked_opportunity_id?: string | null
          lng?: number | null
          market_code?: string | null
          material_category?: string | null
          message_excerpt?: string | null
          next_followup_at?: string | null
          notes?: string | null
          owner_user_id?: string | null
          project_category?: string | null
          quote_id?: string | null
          raw_payload_json?: Json | null
          referrer_url?: string | null
          requested_service?: string | null
          routing_rule_id?: string | null
          routing_tags?: string[] | null
          sales_notes?: string | null
          size_preference?: string | null
          sla_due_at?: string | null
          sla_minutes?: number
          source_key?: string | null
          timeout_at?: string | null
          updated_at?: string
          urgency_score?: number | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          ai_classification_json?: Json | null
          ai_mode?: string | null
          ai_recommended_action?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          assignment_type?: string | null
          call_recording_id?: string | null
          capture_ip?: string | null
          capture_user_agent?: string | null
          channel_key?: string | null
          city?: string | null
          company_domain?: string | null
          company_name?: string | null
          consent_status?: string | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_type_detected?: string | null
          escalation_level?: number
          first_contact_at?: string | null
          first_response_at?: string | null
          first_response_sent_at?: string | null
          followup_count?: number
          gclid?: string | null
          id?: string
          is_existing_customer?: boolean | null
          is_sla_breached?: boolean
          landing_url?: string | null
          last_activity_at?: string | null
          last_contacted_at?: string | null
          last_contacted_by_user_id?: string | null
          last_followup_at?: string | null
          lat?: number | null
          latest_assessment_id?: string | null
          latest_heavy_flag?: boolean | null
          latest_recommended_size?: number | null
          lead_quality_label?: string | null
          lead_quality_score?: number | null
          lead_risk_score?: number | null
          lead_source?: string | null
          lead_status?: string
          linked_contact_id?: string | null
          linked_opportunity_id?: string | null
          lng?: number | null
          market_code?: string | null
          material_category?: string | null
          message_excerpt?: string | null
          next_followup_at?: string | null
          notes?: string | null
          owner_user_id?: string | null
          project_category?: string | null
          quote_id?: string | null
          raw_payload_json?: Json | null
          referrer_url?: string | null
          requested_service?: string | null
          routing_rule_id?: string | null
          routing_tags?: string[] | null
          sales_notes?: string | null
          size_preference?: string | null
          sla_due_at?: string | null
          sla_minutes?: number
          source_key?: string | null
          timeout_at?: string | null
          updated_at?: string
          urgency_score?: number | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_leads_latest_assessment_id_fkey"
            columns: ["latest_assessment_id"]
            isOneToOne: false
            referencedRelation: "waste_vision_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_leads_linked_contact_id_fkey"
            columns: ["linked_contact_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_leads_linked_opportunity_id_fkey"
            columns: ["linked_opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_leads_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_leads_routing_rule_id_fkey"
            columns: ["routing_rule_id"]
            isOneToOne: false
            referencedRelation: "lead_routing_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_leads_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "schedule_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
      }
      search_index: {
        Row: {
          address_normalized: string | null
          entity_id: string
          entity_type: string
          id: string
          market_code: string | null
          phone_normalized: string | null
          search_text: string
          status: string | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          address_normalized?: string | null
          entity_id: string
          entity_type: string
          id?: string
          market_code?: string | null
          phone_normalized?: string | null
          search_text: string
          status?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          address_normalized?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          market_code?: string | null
          phone_normalized?: string | null
          search_text?: string
          status?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_acknowledgements: {
        Row: {
          id: string
          issue_key: string
          notes: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          issue_key: string
          notes?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          issue_key?: string
          notes?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      seo_cities: {
        Row: {
          city_name: string
          city_slug: string
          common_sizes_json: Json
          county: string | null
          created_at: string
          dump_rules: string | null
          heavy_sizes_json: Json
          id: string
          is_active: boolean
          is_primary_market: boolean
          lat: number | null
          lng: number | null
          local_intro: string | null
          market_code: string | null
          nearby_cities_json: Json | null
          neighborhoods_json: Json | null
          permit_info: string | null
          population: string | null
          pricing_note: string | null
          primary_yard_id: string | null
          state: string
          updated_at: string
        }
        Insert: {
          city_name: string
          city_slug: string
          common_sizes_json?: Json
          county?: string | null
          created_at?: string
          dump_rules?: string | null
          heavy_sizes_json?: Json
          id?: string
          is_active?: boolean
          is_primary_market?: boolean
          lat?: number | null
          lng?: number | null
          local_intro?: string | null
          market_code?: string | null
          nearby_cities_json?: Json | null
          neighborhoods_json?: Json | null
          permit_info?: string | null
          population?: string | null
          pricing_note?: string | null
          primary_yard_id?: string | null
          state?: string
          updated_at?: string
        }
        Update: {
          city_name?: string
          city_slug?: string
          common_sizes_json?: Json
          county?: string | null
          created_at?: string
          dump_rules?: string | null
          heavy_sizes_json?: Json
          id?: string
          is_active?: boolean
          is_primary_market?: boolean
          lat?: number | null
          lng?: number | null
          local_intro?: string | null
          market_code?: string | null
          nearby_cities_json?: Json | null
          neighborhoods_json?: Json | null
          permit_info?: string | null
          population?: string | null
          pricing_note?: string | null
          primary_yard_id?: string | null
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_link_rules: {
        Row: {
          conditions_json: Json | null
          created_at: string
          id: string
          is_active: boolean
          output_json: Json | null
          rule_key: string
          rule_type: string
        }
        Insert: {
          conditions_json?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          output_json?: Json | null
          rule_key: string
          rule_type: string
        }
        Update: {
          conditions_json?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          output_json?: Json | null
          rule_key?: string
          rule_type?: string
        }
        Relationships: []
      }
      seo_locations_registry: {
        Row: {
          anchor_variants: string[]
          city_name: string
          created_at: string
          id: string
          is_active: boolean
          page_exists: boolean
          priority: number
          slug: string
          updated_at: string
        }
        Insert: {
          anchor_variants?: string[]
          city_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_exists?: boolean
          priority?: number
          slug: string
          updated_at?: string
        }
        Update: {
          anchor_variants?: string[]
          city_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_exists?: boolean
          priority?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_pages: {
        Row: {
          canonical_url: string | null
          city_id: string | null
          created_at: string
          faq_json: Json | null
          h1: string
          id: string
          is_published: boolean
          last_generated_at: string | null
          meta_description: string
          page_type: string
          schema_json: Json | null
          sections_json: Json | null
          title: string
          updated_at: string
          url_path: string
        }
        Insert: {
          canonical_url?: string | null
          city_id?: string | null
          created_at?: string
          faq_json?: Json | null
          h1: string
          id?: string
          is_published?: boolean
          last_generated_at?: string | null
          meta_description: string
          page_type: string
          schema_json?: Json | null
          sections_json?: Json | null
          title: string
          updated_at?: string
          url_path: string
        }
        Update: {
          canonical_url?: string | null
          city_id?: string | null
          created_at?: string
          faq_json?: Json | null
          h1?: string
          id?: string
          is_published?: boolean
          last_generated_at?: string | null
          meta_description?: string
          page_type?: string
          schema_json?: Json | null
          sections_json?: Json | null
          title?: string
          updated_at?: string
          url_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_pages_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "seo_cities"
            referencedColumns: ["id"]
          },
        ]
      }
      service_cost_estimates: {
        Row: {
          alternative_model_cost: number | null
          alternative_model_margin_pct: number | null
          assumed_dump_fee_cost: number
          assumed_weight_tons: number | null
          best_model: string | null
          calculation_details: Json | null
          comparison_json: Json | null
          cost_model_used: string | null
          created_at: string
          customer_price: number
          dump_cost_breakdown_json: Json | null
          entity_id: string
          entity_type: string
          estimated_drive_minutes: number
          estimated_dump_minutes: number
          estimated_handling_minutes: number
          estimated_margin: number
          estimated_margin_pct: number
          estimated_total_cost: number
          estimated_total_minutes: number
          estimated_truck_cost: number
          id: string
          market_code: string | null
          material_category: string | null
          material_code: string | null
          route_miles: number | null
          service_type: string
          truck_cost_breakdown_json: Json | null
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          alternative_model_cost?: number | null
          alternative_model_margin_pct?: number | null
          assumed_dump_fee_cost?: number
          assumed_weight_tons?: number | null
          best_model?: string | null
          calculation_details?: Json | null
          comparison_json?: Json | null
          cost_model_used?: string | null
          created_at?: string
          customer_price?: number
          dump_cost_breakdown_json?: Json | null
          entity_id: string
          entity_type: string
          estimated_drive_minutes?: number
          estimated_dump_minutes?: number
          estimated_handling_minutes?: number
          estimated_margin?: number
          estimated_margin_pct?: number
          estimated_total_cost?: number
          estimated_total_minutes?: number
          estimated_truck_cost?: number
          id?: string
          market_code?: string | null
          material_category?: string | null
          material_code?: string | null
          route_miles?: number | null
          service_type: string
          truck_cost_breakdown_json?: Json | null
          updated_at?: string
          vehicle_type?: string
        }
        Update: {
          alternative_model_cost?: number | null
          alternative_model_margin_pct?: number | null
          assumed_dump_fee_cost?: number
          assumed_weight_tons?: number | null
          best_model?: string | null
          calculation_details?: Json | null
          comparison_json?: Json | null
          cost_model_used?: string | null
          created_at?: string
          customer_price?: number
          dump_cost_breakdown_json?: Json | null
          entity_id?: string
          entity_type?: string
          estimated_drive_minutes?: number
          estimated_dump_minutes?: number
          estimated_handling_minutes?: number
          estimated_margin?: number
          estimated_margin_pct?: number
          estimated_total_cost?: number
          estimated_total_minutes?: number
          estimated_truck_cost?: number
          id?: string
          market_code?: string | null
          material_category?: string | null
          material_code?: string | null
          route_miles?: number | null
          service_type?: string
          truck_cost_breakdown_json?: Json | null
          updated_at?: string
          vehicle_type?: string
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
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "service_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
      }
      size_pricing_defaults: {
        Row: {
          base_service_fee: number
          created_at: string
          description: string | null
          id: string
          included_days_default: number
          included_tons_default: number
          is_active: boolean
          size_yd: number
          updated_at: string
        }
        Insert: {
          base_service_fee: number
          created_at?: string
          description?: string | null
          id?: string
          included_days_default?: number
          included_tons_default: number
          is_active?: boolean
          size_yd: number
          updated_at?: string
        }
        Update: {
          base_service_fee?: number
          created_at?: string
          description?: string | null
          id?: string
          included_days_default?: number
          included_tons_default?: number
          is_active?: boolean
          size_yd?: number
          updated_at?: string
        }
        Relationships: []
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
      staff_invites: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          invite_token_hash: string | null
          role: string
          temp_password_hash: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at: string
          id?: string
          invite_token_hash?: string | null
          role: string
          temp_password_hash?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          invite_token_hash?: string | null
          role?: string
          temp_password_hash?: string | null
          used_at?: string | null
        }
        Relationships: []
      }
      staff_notifications: {
        Row: {
          action_url: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          dismissed_at: string | null
          event_id: string | null
          id: string
          message: string | null
          notification_type: Database["public"]["Enums"]["timeline_event_type"]
          priority: Database["public"]["Enums"]["notification_priority"]
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          dismissed_at?: string | null
          event_id?: string | null
          id?: string
          message?: string | null
          notification_type: Database["public"]["Enums"]["timeline_event_type"]
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          dismissed_at?: string | null
          event_id?: string | null
          id?: string
          message?: string | null
          notification_type?: Database["public"]["Enums"]["timeline_event_type"]
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "timeline_events"
            referencedColumns: ["id"]
          },
        ]
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
          must_reset_password: boolean
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
          must_reset_password?: boolean
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
          must_reset_password?: boolean
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_errors: {
        Row: {
          created_at: string
          error_message: string
          error_stack: string | null
          function_name: string
          id: string
          payload_json: Json | null
          resolved_at: string | null
          resolved_by: string | null
          route: string | null
          severity: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message: string
          error_stack?: string | null
          function_name: string
          id?: string
          payload_json?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          route?: string | null
          severity?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string
          error_stack?: string | null
          function_name?: string
          id?: string
          payload_json?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          route?: string | null
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_health_events: {
        Row: {
          created_at: string
          details_json: Json | null
          id: string
          message: string
          severity: string
          source_key: string
          source_type: string
        }
        Insert: {
          created_at?: string
          details_json?: Json | null
          id?: string
          message: string
          severity: string
          source_key: string
          source_type: string
        }
        Update: {
          created_at?: string
          details_json?: Json | null
          id?: string
          message?: string
          severity?: string
          source_key?: string
          source_type?: string
        }
        Relationships: []
      }
      system_health_snapshot: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          issues_json: Json
          node_health_json: Json
          summary_json: Json
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          issues_json?: Json
          node_health_json?: Json
          summary_json?: Json
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          issues_json?: Json
          node_health_json?: Json
          summary_json?: Json
        }
        Relationships: []
      }
      telephony_migrations: {
        Row: {
          business_hours: Json | null
          created_at: string | null
          created_by: string | null
          current_provider: string
          cutover_completed_at: string | null
          cutover_started_at: string | null
          friendly_name: string | null
          ghl_routing_rules: Json | null
          id: string
          migration_method: string
          notes: string | null
          phone_number: string
          purpose: Database["public"]["Enums"]["phone_purpose"]
          recording_enabled: boolean | null
          rollback_at: string | null
          status: string
          target_provider: string
          twilio_number_id: string | null
          updated_at: string | null
          voicemail_enabled: boolean | null
        }
        Insert: {
          business_hours?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_provider?: string
          cutover_completed_at?: string | null
          cutover_started_at?: string | null
          friendly_name?: string | null
          ghl_routing_rules?: Json | null
          id?: string
          migration_method: string
          notes?: string | null
          phone_number: string
          purpose: Database["public"]["Enums"]["phone_purpose"]
          recording_enabled?: boolean | null
          rollback_at?: string | null
          status?: string
          target_provider?: string
          twilio_number_id?: string | null
          updated_at?: string | null
          voicemail_enabled?: boolean | null
        }
        Update: {
          business_hours?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_provider?: string
          cutover_completed_at?: string | null
          cutover_started_at?: string | null
          friendly_name?: string | null
          ghl_routing_rules?: Json | null
          id?: string
          migration_method?: string
          notes?: string | null
          phone_number?: string
          purpose?: Database["public"]["Enums"]["phone_purpose"]
          recording_enabled?: boolean | null
          rollback_at?: string | null
          status?: string
          target_provider?: string
          twilio_number_id?: string | null
          updated_at?: string | null
          voicemail_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "telephony_migrations_twilio_number_id_fkey"
            columns: ["twilio_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          actor_role: string | null
          correction_reason: string | null
          corrects_event_id: string | null
          created_at: string
          created_by_user_id: string | null
          customer_id: string | null
          details_json: Json | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["timeline_entity_type"]
          event_action: Database["public"]["Enums"]["timeline_event_action"]
          event_type: Database["public"]["Enums"]["timeline_event_type"]
          id: string
          is_correction: boolean | null
          order_id: string | null
          source: Database["public"]["Enums"]["timeline_source"]
          source_id: string | null
          source_table: string | null
          summary: string
          visibility: Database["public"]["Enums"]["timeline_visibility"]
        }
        Insert: {
          actor_role?: string | null
          correction_reason?: string | null
          corrects_event_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          customer_id?: string | null
          details_json?: Json | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["timeline_entity_type"]
          event_action: Database["public"]["Enums"]["timeline_event_action"]
          event_type: Database["public"]["Enums"]["timeline_event_type"]
          id?: string
          is_correction?: boolean | null
          order_id?: string | null
          source?: Database["public"]["Enums"]["timeline_source"]
          source_id?: string | null
          source_table?: string | null
          summary: string
          visibility?: Database["public"]["Enums"]["timeline_visibility"]
        }
        Update: {
          actor_role?: string | null
          correction_reason?: string | null
          corrects_event_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          customer_id?: string | null
          details_json?: Json | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["timeline_entity_type"]
          event_action?: Database["public"]["Enums"]["timeline_event_action"]
          event_type?: Database["public"]["Enums"]["timeline_event_type"]
          id?: string
          is_correction?: boolean | null
          order_id?: string | null
          source?: Database["public"]["Enums"]["timeline_source"]
          source_id?: string | null
          source_table?: string | null
          summary?: string
          visibility?: Database["public"]["Enums"]["timeline_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_corrects_event_id_fkey"
            columns: ["corrects_event_id"]
            isOneToOne: false
            referencedRelation: "timeline_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "timeline_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
        ]
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
            foreignKeyName: "toll_surcharges_origin_yard_id_fkey"
            columns: ["origin_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
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
      truck_cost_profiles: {
        Row: {
          cost_per_hour: number
          cost_per_mile: number | null
          created_at: string
          driver_cost_model: string
          id: string
          is_active: boolean
          owner_operator_payout_delivery: number | null
          owner_operator_payout_pickup: number | null
          owner_operator_payout_swap: number | null
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          cost_per_hour?: number
          cost_per_mile?: number | null
          created_at?: string
          driver_cost_model?: string
          id?: string
          is_active?: boolean
          owner_operator_payout_delivery?: number | null
          owner_operator_payout_pickup?: number | null
          owner_operator_payout_swap?: number | null
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          cost_per_hour?: number
          cost_per_mile?: number | null
          created_at?: string
          driver_cost_model?: string
          id?: string
          is_active?: boolean
          owner_operator_payout_delivery?: number | null
          owner_operator_payout_pickup?: number | null
          owner_operator_payout_swap?: number | null
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      truck_dimensions: {
        Row: {
          clearance_notes: string | null
          created_at: string
          id: string
          is_active: boolean
          length_ft: number
          truck_type: Database["public"]["Enums"]["truck_type"]
          updated_at: string
          width_ft: number
        }
        Insert: {
          clearance_notes?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          length_ft: number
          truck_type: Database["public"]["Enums"]["truck_type"]
          updated_at?: string
          width_ft: number
        }
        Update: {
          clearance_notes?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          length_ft?: number
          truck_type?: Database["public"]["Enums"]["truck_type"]
          updated_at?: string
          width_ft?: number
        }
        Relationships: []
      }
      trucks: {
        Row: {
          assigned_driver_id: string | null
          assigned_yard_id: string | null
          capacity_tons: number | null
          capacity_yards: number | null
          created_at: string
          current_yard_id: string | null
          dot_compliance_status: string | null
          home_yard_id: string | null
          id: string
          insurance_active: boolean | null
          insurance_exp_date: string | null
          is_active: boolean | null
          last_inspection_at: string | null
          last_maintenance_at: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          next_maintenance_due: string | null
          notes: string | null
          odometer_miles: number | null
          plate_number: string | null
          registration_exp_date: string | null
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
          dot_compliance_status?: string | null
          home_yard_id?: string | null
          id?: string
          insurance_active?: boolean | null
          insurance_exp_date?: string | null
          is_active?: boolean | null
          last_inspection_at?: string | null
          last_maintenance_at?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          next_maintenance_due?: string | null
          notes?: string | null
          odometer_miles?: number | null
          plate_number?: string | null
          registration_exp_date?: string | null
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
          dot_compliance_status?: string | null
          home_yard_id?: string | null
          id?: string
          insurance_active?: boolean | null
          insurance_exp_date?: string | null
          is_active?: boolean | null
          last_inspection_at?: string | null
          last_maintenance_at?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          next_maintenance_due?: string | null
          notes?: string | null
          odometer_miles?: number | null
          plate_number?: string | null
          registration_exp_date?: string | null
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
            foreignKeyName: "trucks_assigned_yard_id_fkey"
            columns: ["assigned_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
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
            foreignKeyName: "trucks_current_yard_id_fkey"
            columns: ["current_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
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
          {
            foreignKeyName: "trucks_home_yard_id_fkey"
            columns: ["home_yard_id"]
            isOneToOne: false
            referencedRelation: "yards_public"
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
      user_compensation_summary: {
        Row: {
          approved_amount: number
          id: string
          paid_amount: number
          pending_amount: number
          period: string
          total_adjustments: number
          total_earnings: number
          updated_at: string
          user_id: string
          voided_amount: number
        }
        Insert: {
          approved_amount?: number
          id?: string
          paid_amount?: number
          pending_amount?: number
          period: string
          total_adjustments?: number
          total_earnings?: number
          updated_at?: string
          user_id: string
          voided_amount?: number
        }
        Update: {
          approved_amount?: number
          id?: string
          paid_amount?: number
          pending_amount?: number
          period?: string
          total_adjustments?: number
          total_earnings?: number
          updated_at?: string
          user_id?: string
          voided_amount?: number
        }
        Relationships: []
      }
      user_help_acknowledgements: {
        Row: {
          acknowledged_at: string
          help_key: string
          id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          help_key: string
          id?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          help_key?: string
          id?: string
          user_id?: string
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
      vehicle_cost_profiles: {
        Row: {
          created_at: string
          default_cost_model: string
          id: string
          is_active: boolean
          market_code: string
          notes: string | null
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          default_cost_model?: string
          id?: string
          is_active?: boolean
          market_code: string
          notes?: string | null
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          default_cost_model?: string
          id?: string
          is_active?: boolean
          market_code?: string
          notes?: string | null
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      vehicle_documents: {
        Row: {
          doc_type: string
          expires_at: string | null
          file_url: string
          id: string
          truck_id: string
          uploaded_at: string
        }
        Insert: {
          doc_type?: string
          expires_at?: string | null
          file_url: string
          id?: string
          truck_id: string
          uploaded_at?: string
        }
        Update: {
          doc_type?: string
          expires_at?: string | null
          file_url?: string
          id?: string
          truck_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_inspections: {
        Row: {
          checklist_json: Json
          created_at: string
          driver_id: string
          id: string
          inspection_type: string
          notes: string | null
          signature_name: string | null
          status: string
          truck_id: string
        }
        Insert: {
          checklist_json?: Json
          created_at?: string
          driver_id: string
          id?: string
          inspection_type?: string
          notes?: string | null
          signature_name?: string | null
          status?: string
          truck_id: string
        }
        Update: {
          checklist_json?: Json
          created_at?: string
          driver_id?: string
          id?: string
          inspection_type?: string
          notes?: string | null
          signature_name?: string | null
          status?: string
          truck_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_issue_photos: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          photo_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id: string
          photo_url: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_issue_photos_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "vehicle_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_issues: {
        Row: {
          created_at: string
          description: string | null
          id: string
          issue_category: string
          reported_by_driver_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          truck_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          issue_category?: string
          reported_by_driver_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          truck_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          issue_category?: string
          reported_by_driver_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          truck_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_issues_reported_by_driver_id_fkey"
            columns: ["reported_by_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_issues_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
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
      vendor_quotes: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          id: string
          margin_estimate: number | null
          notes: string | null
          quoted_cost: number | null
          recommended_customer_price: number | null
          request_payload: Json
          requested_by: string | null
          status: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          margin_estimate?: number | null
          notes?: string | null
          quoted_cost?: number | null
          recommended_customer_price?: number | null
          request_payload?: Json
          requested_by?: string | null
          status?: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          margin_estimate?: number | null
          notes?: string | null
          quoted_cost?: number | null
          recommended_customer_price?: number | null
          request_payload?: Json
          requested_by?: string | null
          status?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_quotes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_rates: {
        Row: {
          base_cost: number
          city: string | null
          created_at: string | null
          effective_date: string | null
          extra_day_cost: number | null
          id: string
          included_tons: number | null
          is_active: boolean | null
          market_code: string | null
          material_category: string
          overage_cost_per_ton: number | null
          size_yd: number
          vendor_id: string
        }
        Insert: {
          base_cost: number
          city?: string | null
          created_at?: string | null
          effective_date?: string | null
          extra_day_cost?: number | null
          id?: string
          included_tons?: number | null
          is_active?: boolean | null
          market_code?: string | null
          material_category?: string
          overage_cost_per_ton?: number | null
          size_yd: number
          vendor_id: string
        }
        Update: {
          base_cost?: number
          city?: string | null
          created_at?: string | null
          effective_date?: string | null
          extra_day_cost?: number | null
          id?: string
          included_tons?: number | null
          is_active?: boolean | null
          market_code?: string | null
          material_category?: string
          overage_cost_per_ton?: number | null
          size_yd?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_rates_vendor_id_fkey"
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
          coverage_cities: string[] | null
          coverage_zips: string[] | null
          created_at: string
          equipment_types: string[] | null
          id: string
          is_active: boolean
          material_support: string[] | null
          name: string
          notes: string | null
          priority_rank: number
          reliability_score: number | null
          response_sla_minutes: number | null
          size_support: number[] | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coverage_cities?: string[] | null
          coverage_zips?: string[] | null
          created_at?: string
          equipment_types?: string[] | null
          id?: string
          is_active?: boolean
          material_support?: string[] | null
          name: string
          notes?: string | null
          priority_rank?: number
          reliability_score?: number | null
          response_sla_minutes?: number | null
          size_support?: number[] | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coverage_cities?: string[] | null
          coverage_zips?: string[] | null
          created_at?: string
          equipment_types?: string[] | null
          id?: string
          is_active?: boolean
          material_support?: string[] | null
          name?: string
          notes?: string | null
          priority_rank?: number
          reliability_score?: number | null
          response_sla_minutes?: number | null
          size_support?: number[] | null
          updated_at?: string
        }
        Relationships: []
      }
      visitor_events: {
        Row: {
          event_name: string
          event_time: string
          id: string
          page_url: string | null
          properties_json: Json | null
          session_id: string
          visitor_id: string
        }
        Insert: {
          event_name: string
          event_time?: string
          id?: string
          page_url?: string | null
          properties_json?: Json | null
          session_id: string
          visitor_id: string
        }
        Update: {
          event_name?: string
          event_time?: string
          id?: string
          page_url?: string | null
          properties_json?: Json | null
          session_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "visitor_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_events_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_profiles: {
        Row: {
          consent_status: string
          device_summary: string | null
          first_referrer: string | null
          first_seen_at: string
          first_utm_json: Json | null
          id: string
          last_known_city: string | null
          last_known_region: string | null
          last_referrer: string | null
          last_seen_at: string
          last_utm_json: Json | null
          total_pageviews: number
          total_sessions: number
          visit_count: number
        }
        Insert: {
          consent_status?: string
          device_summary?: string | null
          first_referrer?: string | null
          first_seen_at?: string
          first_utm_json?: Json | null
          id: string
          last_known_city?: string | null
          last_known_region?: string | null
          last_referrer?: string | null
          last_seen_at?: string
          last_utm_json?: Json | null
          total_pageviews?: number
          total_sessions?: number
          visit_count?: number
        }
        Update: {
          consent_status?: string
          device_summary?: string | null
          first_referrer?: string | null
          first_seen_at?: string
          first_utm_json?: Json | null
          id?: string
          last_known_city?: string | null
          last_known_region?: string | null
          last_referrer?: string | null
          last_seen_at?: string
          last_utm_json?: Json | null
          total_pageviews?: number
          total_sessions?: number
          visit_count?: number
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          approx_geo_json: Json | null
          consent_status: string
          device_json: Json | null
          duration_seconds: number | null
          ended_at: string | null
          gclid: string | null
          id: string
          ip_hash: string | null
          landing_url: string | null
          referrer_url: string | null
          started_at: string
          timezone: string | null
          utm_json: Json | null
          visitor_id: string
        }
        Insert: {
          approx_geo_json?: Json | null
          consent_status?: string
          device_json?: Json | null
          duration_seconds?: number | null
          ended_at?: string | null
          gclid?: string | null
          id: string
          ip_hash?: string | null
          landing_url?: string | null
          referrer_url?: string | null
          started_at?: string
          timezone?: string | null
          utm_json?: Json | null
          visitor_id: string
        }
        Update: {
          approx_geo_json?: Json | null
          consent_status?: string
          device_json?: Json | null
          duration_seconds?: number | null
          ended_at?: string | null
          gclid?: string | null
          id?: string
          ip_hash?: string | null
          landing_url?: string | null
          referrer_url?: string | null
          started_at?: string
          timezone?: string | null
          utm_json?: Json | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_sessions_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voicemails: {
        Row: {
          audio_path: string
          call_id: string
          created_at: string | null
          id: string
          is_reviewed: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          transcription: string | null
        }
        Insert: {
          audio_path: string
          call_id: string
          created_at?: string | null
          id?: string
          is_reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          transcription?: string | null
        }
        Update: {
          audio_path?: string
          call_id?: string
          created_at?: string | null
          id?: string
          is_reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          transcription?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voicemails_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "call_events"
            referencedColumns: ["id"]
          },
        ]
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
          address: string | null
          alternate_sizes: number[] | null
          applied_at: string | null
          applied_to_quote: boolean | null
          confidence: number | null
          created_at: string
          customer_type: string | null
          detected_materials: Json | null
          fit_confidence: string | null
          green_halo_eligible: boolean | null
          green_halo_note: string | null
          hazard_review_notes: string | null
          hazard_review_required: boolean | null
          hazard_review_status: string | null
          hazard_reviewer_id: string | null
          hazards_detected: Json
          heavy_flag: boolean | null
          id: string
          image_count: number
          image_storage_path: string | null
          input_type: string
          lead_id: string | null
          materials_detected: Json
          mode: string | null
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
          zip: string | null
        }
        Insert: {
          address?: string | null
          alternate_sizes?: number[] | null
          applied_at?: string | null
          applied_to_quote?: boolean | null
          confidence?: number | null
          created_at?: string
          customer_type?: string | null
          detected_materials?: Json | null
          fit_confidence?: string | null
          green_halo_eligible?: boolean | null
          green_halo_note?: string | null
          hazard_review_notes?: string | null
          hazard_review_required?: boolean | null
          hazard_review_status?: string | null
          hazard_reviewer_id?: string | null
          hazards_detected?: Json
          heavy_flag?: boolean | null
          id?: string
          image_count?: number
          image_storage_path?: string | null
          input_type?: string
          lead_id?: string | null
          materials_detected?: Json
          mode?: string | null
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
          zip?: string | null
        }
        Update: {
          address?: string | null
          alternate_sizes?: number[] | null
          applied_at?: string | null
          applied_to_quote?: boolean | null
          confidence?: number | null
          created_at?: string
          customer_type?: string | null
          detected_materials?: Json | null
          fit_confidence?: string | null
          green_halo_eligible?: boolean | null
          green_halo_note?: string | null
          hazard_review_notes?: string | null
          hazard_review_required?: boolean | null
          hazard_review_status?: string | null
          hazard_reviewer_id?: string | null
          hazards_detected?: Json
          heavy_flag?: boolean | null
          id?: string
          image_count?: number
          image_storage_path?: string | null
          input_type?: string
          lead_id?: string | null
          materials_detected?: Json
          mode?: string | null
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
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waste_vision_analyses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_vision_analyses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "waste_vision_analyses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_vision_analyses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
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
      yard_disposal_config: {
        Row: {
          compliance_mode: boolean
          created_at: string
          default_disposal_site_ids: string[] | null
          fuel_cost_per_mile: number | null
          id: string
          labor_hourly_rate: number | null
          markup_pct: number | null
          min_margin_pct: number | null
          notes: string | null
          overhead_factor: number | null
          updated_at: string
          yard_id: string
        }
        Insert: {
          compliance_mode?: boolean
          created_at?: string
          default_disposal_site_ids?: string[] | null
          fuel_cost_per_mile?: number | null
          id?: string
          labor_hourly_rate?: number | null
          markup_pct?: number | null
          min_margin_pct?: number | null
          notes?: string | null
          overhead_factor?: number | null
          updated_at?: string
          yard_id: string
        }
        Update: {
          compliance_mode?: boolean
          created_at?: string
          default_disposal_site_ids?: string[] | null
          fuel_cost_per_mile?: number | null
          id?: string
          labor_hourly_rate?: number | null
          markup_pct?: number | null
          min_margin_pct?: number | null
          notes?: string | null
          overhead_factor?: number | null
          updated_at?: string
          yard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yard_disposal_config_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: true
            referencedRelation: "asset_inventory_summary"
            referencedColumns: ["yard_id"]
          },
          {
            foreignKeyName: "yard_disposal_config_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: true
            referencedRelation: "yards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yard_disposal_config_yard_id_fkey"
            columns: ["yard_id"]
            isOneToOne: true
            referencedRelation: "yards_public"
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
      zone_restrictions: {
        Row: {
          allowed_windows: string[] | null
          applies_to: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          market_code: string
          max_size_yd: number | null
          reason: string | null
          restriction_type: string
          updated_at: string | null
          zone_name: string | null
        }
        Insert: {
          allowed_windows?: string[] | null
          applies_to?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          market_code: string
          max_size_yd?: number | null
          reason?: string | null
          restriction_type: string
          updated_at?: string | null
          zone_name?: string | null
        }
        Update: {
          allowed_windows?: string[] | null
          applies_to?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          market_code?: string
          max_size_yd?: number | null
          reason?: string | null
          restriction_type?: string
          updated_at?: string | null
          zone_name?: string | null
        }
        Relationships: []
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
      heavy_risk_orders_vw: {
        Row: {
          actual_weight_tons: number | null
          contamination_detected: boolean | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          estimated_fill_pct: number | null
          estimated_weight_tons_max: number | null
          estimated_weight_tons_min: number | null
          extra_tons_charged: number | null
          heavy_material_code: string | null
          included_tons_for_size: number | null
          is_heavy_material: boolean | null
          order_id: string | null
          reclassified_to_debris: boolean | null
          requested_green_halo: boolean | null
          requires_fill_line: boolean | null
          requires_pre_pickup_photos: boolean | null
          status: string | null
          weight_risk_level: string | null
        }
        Relationships: []
      }
      lead_card_info_view: {
        Row: {
          added_by: string | null
          can_view_full: boolean | null
          card_brand: string | null
          card_holder_name: string | null
          card_last_four: string | null
          card_number: string | null
          created_at: string | null
          cvv: string | null
          expiration_month: number | null
          expiration_year: number | null
          id: string | null
          lead_id: string | null
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          can_view_full?: never
          card_brand?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          card_number?: never
          created_at?: string | null
          cvv?: never
          expiration_month?: number | null
          expiration_year?: number | null
          id?: string | null
          lead_id?: string | null
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          can_view_full?: never
          card_brand?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          card_number?: never
          created_at?: string | null
          cvv?: never
          expiration_month?: number | null
          expiration_year?: number | null
          id?: string | null
          lead_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_card_info_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      overdue_assets: {
        Row: {
          asset_code: string | null
          current_order_id: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          days_out: number | null
          days_overdue: number | null
          deployed_at: string | null
          id: string | null
          included_days: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_dumpsters_current_order_id_fkey"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "heavy_risk_orders_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "assets_dumpsters_current_order_id_fkey"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_dumpsters_current_order_id_fkey"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "overdue_assets_billing_vw"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      overdue_assets_billing_vw: {
        Row: {
          asset_code: string | null
          asset_id: string | null
          asset_status: string | null
          billable_days: number | null
          billed_overdue_days_total: number | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          days_out: number | null
          deployed_at: string | null
          included_days: number | null
          invoice_id: string | null
          invoice_number: string | null
          last_billed_at: string | null
          last_notified_at: string | null
          order_id: string | null
          order_status: string | null
          overdue_days: number | null
          overdue_notified: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      yards_public: {
        Row: {
          id: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          market: string | null
          market_id: string | null
          name: string | null
          priority_rank: number | null
          slug: string | null
        }
        Insert: {
          id?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          market?: string | null
          market_id?: string | null
          name?: string | null
          priority_rank?: number | null
          slug?: string | null
        }
        Update: {
          id?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          market?: string | null
          market_id?: string | null
          name?: string | null
          priority_rank?: number | null
          slug?: string | null
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
    }
    Functions: {
      append_transcript_chunk: {
        Args: {
          p_call_id: string
          p_chunk_text: string
          p_confidence?: number
          p_speaker?: string
        }
        Returns: string
      }
      apply_routing_rules: { Args: { p_lead_id: string }; Returns: string }
      apply_scale_ticket_weight: {
        Args: { p_actual_weight_tons: number; p_order_id: string }
        Returns: boolean
      }
      approve_compensation_earning: {
        Args: { p_earning_id: string }
        Returns: boolean
      }
      auto_assign_lead: { Args: { p_lead_id: string }; Returns: string }
      backfill_search_index_contacts: { Args: never; Returns: number }
      backfill_search_index_customers: { Args: never; Returns: number }
      can_complete_run: {
        Args: { p_run_id: string }
        Returns: {
          can_complete: boolean
          missing_checkpoints: string[]
          reason: string
        }[]
      }
      capture_omnichannel_lead: {
        Args: {
          p_address?: string
          p_channel_key: string
          p_city?: string
          p_company_name?: string
          p_consent_status?: string
          p_contact_name?: string
          p_dedup_window_days?: number
          p_email?: string
          p_gclid?: string
          p_message_excerpt?: string
          p_phone?: string
          p_raw_payload?: Json
          p_utm_campaign?: string
          p_utm_source?: string
          p_utm_term?: string
          p_zip?: string
        }
        Returns: string
      }
      check_admin_permission: {
        Args: { _action: string; _module: string; _user_id: string }
        Returns: boolean
      }
      check_existing_customer: {
        Args: { p_email?: string; p_phone?: string }
        Returns: boolean
      }
      check_sms_rate_limit: { Args: { p_phone: string }; Returns: boolean }
      claim_next_ai_job: {
        Args: { p_worker_id: string }
        Returns: {
          attempt_count: number
          id: string
          job_type: string
          payload: Json
        }[]
      }
      classify_and_route_lead: { Args: { p_lead_id: string }; Returns: Json }
      complete_ai_job: {
        Args: { p_error?: string; p_job_id: string; p_success: boolean }
        Returns: undefined
      }
      compute_health_status: {
        Args: { p_score: number }
        Returns: Database["public"]["Enums"]["health_status"]
      }
      create_compensation_earning: {
        Args: {
          p_calculation_details?: Json
          p_entity_id: string
          p_entity_type: string
          p_gross_amount: number
          p_payout_amount: number
          p_plan_id: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_rule_id: string
          p_user_id: string
        }
        Returns: string
      }
      create_or_update_lead: {
        Args: {
          p_address?: string
          p_city?: string
          p_company_name?: string
          p_customer_email?: string
          p_customer_name?: string
          p_customer_phone?: string
          p_dedup_hours?: number
          p_gclid?: string
          p_notes?: string
          p_raw_payload?: Json
          p_source_key: string
          p_utm_campaign?: string
          p_utm_source?: string
          p_utm_term?: string
          p_zip?: string
        }
        Returns: string
      }
      create_portal_link: {
        Args: {
          p_order_id: string
          p_token_hash: string
          p_trigger_source?: string
        }
        Returns: string
      }
      create_run_checkpoints_from_config: {
        Args: { p_run_id: string }
        Returns: number
      }
      create_run_for_order: {
        Args: {
          p_notes?: string
          p_order_id: string
          p_run_type: Database["public"]["Enums"]["run_type"]
          p_scheduled_date: string
          p_scheduled_window?: string
        }
        Returns: string
      }
      create_staff_notification: {
        Args: {
          p_action_url?: string
          p_channel: Database["public"]["Enums"]["notification_channel"]
          p_event_id: string
          p_message?: string
          p_notification_type: Database["public"]["Enums"]["timeline_event_type"]
          p_priority: Database["public"]["Enums"]["notification_priority"]
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
      driver_assigned_to_order: {
        Args: { p_order_id: string; p_user_id: string }
        Returns: boolean
      }
      enqueue_ai_job: {
        Args: {
          p_job_type: string
          p_payload?: Json
          p_priority?: number
          p_scheduled_for?: string
        }
        Returns: string
      }
      enqueue_ghl_message: {
        Args: {
          p_channel: string
          p_contact_id?: string
          p_entity_id?: string
          p_entity_type?: string
          p_scheduled_for?: string
          p_template_key: string
          p_to_address: string
          p_variables?: Json
        }
        Returns: string
      }
      enqueue_notification: {
        Args: {
          p_body: string
          p_channel: string
          p_entity_id?: string
          p_entity_type?: string
          p_mode?: string
          p_priority?: string
          p_target_team: string
          p_target_user_id?: string
          p_title: string
        }
        Returns: string
      }
      estimate_heavy_weight: {
        Args: {
          p_fill_pct?: number
          p_material_code: string
          p_size_yd: number
        }
        Returns: {
          allow_full_fill: boolean
          green_halo_allowed: boolean
          recommended_fill_pct: number
          risk_level: string
          volume_effective: number
          weight_max_tons: number
          weight_min_tons: number
        }[]
      }
      finalize_call_transcript: { Args: { p_call_id: string }; Returns: string }
      find_available_agent: {
        Args: { p_purpose: Database["public"]["Enums"]["phone_purpose"] }
        Returns: string
      }
      flag_run_contamination: {
        Args: { p_notes?: string; p_photo_url?: string; p_run_id: string }
        Returns: boolean
      }
      flag_run_overfill: {
        Args: { p_notes?: string; p_run_id: string }
        Returns: boolean
      }
      get_current_compensation_period: { Args: never; Returns: string }
      get_dump_fee: {
        Args: { p_market_code: string; p_material_stream: string }
        Returns: {
          assumed_tons_json: Json
          cost_per_load: number
          cost_per_ton: number
          dump_cost_model: string
          facility_name: string
          min_charge: number
        }[]
      }
      get_google_connection: {
        Args: { p_user_id: string }
        Returns: {
          google_email: string
          id: string
          scopes_json: Json
          status: Database["public"]["Enums"]["google_connection_status"]
          token_expires_at: string
        }[]
      }
      get_heavy_material_rate: {
        Args: {
          p_market_code: string
          p_material_stream: string
          p_size_yd: number
        }
        Returns: {
          base_price_flat: number
          facility_name: string
          heavy_category: string
          included_days: number
          max_tons: number
          reclass_to_debris_heavy: boolean
        }[]
      }
      get_market_pricing: {
        Args: { p_market_code: string; p_size_yd: number; p_tier?: string }
        Returns: {
          base_price: number
          dump_cost_assumption: number
          extra_ton_rate: number
          included_days: number
          included_tons: number
          overdue_daily_rate: number
          same_day_fee: number
          service_fee_component: number
        }[]
      }
      get_search_index_stats: {
        Args: never
        Returns: {
          coverage_pct: number
          entity_type_out: string
          indexed_count: number
          total_count: number
        }[]
      }
      ghl_create_call_timeline_event: {
        Args: { p_call_id: string; p_entity_id: string; p_entity_type: string }
        Returns: string
      }
      ghl_create_message_timeline_event: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_message_id: string
        }
        Returns: string
      }
      ghl_match_contact: {
        Args: { p_email?: string; p_phone?: string }
        Returns: {
          contact_id: string
          customer_id: string
          lead_id: string
          match_type: string
        }[]
      }
      ghl_process_inbound_call: {
        Args: {
          p_direction?: string
          p_duration_seconds?: number
          p_from_number?: string
          p_ghl_call_id: string
          p_ghl_conversation_id?: string
          p_recording_url?: string
          p_started_at?: string
          p_status?: string
          p_to_number?: string
        }
        Returns: string
      }
      ghl_process_inbound_message: {
        Args: {
          p_body_text?: string
          p_channel: string
          p_from_email?: string
          p_from_number?: string
          p_ghl_conversation_id: string
          p_ghl_message_id: string
          p_sent_at?: string
          p_subject?: string
          p_to_email?: string
          p_to_number?: string
        }
        Returns: string
      }
      global_search: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          entity_id: string
          entity_type: string
          match_type: string
          rank: number
          subtitle: string
          title: string
        }[]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_billing_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lifecycle_advance_stage: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_event_type?: string
          p_meta?: Json
          p_notes?: string
          p_performed_by_role?: string
          p_performed_by_user_id?: string
          p_to_stage_key: string
        }
        Returns: string
      }
      log_ai_decision: {
        Args: {
          p_actions_json?: Json
          p_decision_type: string
          p_entity_id: string
          p_entity_type: string
          p_job_id: string
          p_recommendation?: string
          p_requires_approval?: boolean
          p_severity: string
          p_summary: string
        }
        Returns: string
      }
      log_call_ai_event: {
        Args: {
          p_agent_user_id?: string
          p_call_id: string
          p_event_type: Database["public"]["Enums"]["call_ai_event_type"]
          p_payload?: Json
        }
        Returns: string
      }
      log_call_event: {
        Args: {
          p_direction: Database["public"]["Enums"]["call_direction"]
          p_from: string
          p_status?: Database["public"]["Enums"]["call_status"]
          p_to: string
          p_twilio_sid: string
        }
        Returns: string
      }
      log_compensation_audit: {
        Args: {
          p_action: string
          p_after_data?: Json
          p_before_data?: Json
          p_details?: Json
          p_entity_id?: string
          p_entity_type?: string
          p_target_user_id: string
        }
        Returns: string
      }
      log_google_event: {
        Args: {
          p_action_type: Database["public"]["Enums"]["google_action_type"]
          p_duration_ms?: number
          p_entity_id?: string
          p_entity_type?: string
          p_error_message?: string
          p_request_json?: Json
          p_response_json?: Json
          p_status?: Database["public"]["Enums"]["google_event_status"]
          p_user_id: string
        }
        Returns: string
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
      log_sales_ai_audit: {
        Args: {
          p_action_type: string
          p_ai_output?: Json
          p_contact_id?: string
          p_entity_id?: string
          p_entity_type?: string
          p_input_summary?: Json
          p_latency_ms?: number
          p_lead_id?: string
          p_model_used?: string
          p_tokens_used?: number
        }
        Returns: string
      }
      log_timeline_event: {
        Args: {
          p_actor_role?: string
          p_customer_id?: string
          p_details_json?: Json
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["timeline_entity_type"]
          p_event_action: Database["public"]["Enums"]["timeline_event_action"]
          p_event_type: Database["public"]["Enums"]["timeline_event_type"]
          p_order_id?: string
          p_source?: Database["public"]["Enums"]["timeline_source"]
          p_source_id?: string
          p_source_table?: string
          p_summary: string
          p_visibility?: Database["public"]["Enums"]["timeline_visibility"]
        }
        Returns: string
      }
      mark_order_contaminated:
        | { Args: { p_notes?: string; p_order_id: string }; Returns: boolean }
        | {
            Args: {
              p_actual_weight_tons?: number
              p_notes?: string
              p_order_id: string
            }
            Returns: boolean
          }
      normalize_address: { Args: { p_address: string }; Returns: string }
      normalize_phone: { Args: { p_phone: string }; Returns: string }
      recalculate_customer_health: {
        Args: { p_customer_id: string }
        Returns: number
      }
      record_kpi_snapshot: {
        Args: {
          p_date: string
          p_market_code: string
          p_metrics: Json
          p_type?: string
        }
        Returns: string
      }
      save_order_placement: {
        Args: {
          p_creator_role?: Database["public"]["Enums"]["placement_creator_role"]
          p_dumpster_rect_json: Json
          p_dumpster_size_yd: number
          p_image_storage_path?: string
          p_map_center_lat: number
          p_map_center_lng: number
          p_map_zoom: number
          p_order_id: string
          p_placement_notes?: string
          p_truck_rect_json: Json
          p_truck_type: Database["public"]["Enums"]["truck_type"]
        }
        Returns: string
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      transition_entity_stage: {
        Args: {
          p_assigned_user_id?: string
          p_customer_id?: string
          p_department: Database["public"]["Enums"]["lifecycle_department"]
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["lifecycle_entity_type"]
          p_lead_id?: string
          p_notes?: string
          p_order_id?: string
          p_quote_id?: string
          p_to_stage: string
          p_trigger?: Database["public"]["Enums"]["lifecycle_trigger"]
        }
        Returns: string
      }
      update_assets_days_out: { Args: never; Returns: undefined }
      update_customer_health_score: {
        Args: {
          p_customer_id: string
          p_delta_score?: number
          p_details_json?: Json
          p_event_type: Database["public"]["Enums"]["health_event_type"]
          p_severity?: Database["public"]["Enums"]["health_event_severity"]
          p_source_entity_id?: string
          p_source_entity_type?: string
        }
        Returns: string
      }
      update_lead_status: {
        Args: { p_lead_id: string; p_notes?: string; p_status: string }
        Returns: boolean
      }
      update_user_compensation_summary: {
        Args: { p_period: string; p_user_id: string }
        Returns: undefined
      }
      upsert_entity_google_link: {
        Args: {
          p_chat_space_id?: string
          p_drive_file_id?: string
          p_drive_folder_id?: string
          p_drive_folder_url?: string
          p_entity_id: string
          p_entity_type: string
          p_gmail_thread_id?: string
          p_meet_event_id?: string
          p_meet_link?: string
        }
        Returns: string
      }
      upsert_search_index: {
        Args: {
          p_address?: string
          p_entity_id: string
          p_entity_type: string
          p_market_code?: string
          p_phone?: string
          p_search_text?: string
          p_status?: string
          p_subtitle?: string
          p_title: string
        }
        Returns: string
      }
      user_owns_order: {
        Args: { p_order_id: string; p_user_id: string }
        Returns: boolean
      }
      validate_portal_token: {
        Args: { p_order_id: string; p_token_hash: string }
        Returns: {
          customer_id: string
          link_id: string
          order_id: string
          valid: boolean
        }[]
      }
      void_compensation_earning: {
        Args: { p_entity_id: string; p_entity_type: string; p_reason: string }
        Returns: boolean
      }
    }
    Enums: {
      adjustment_type: "BONUS" | "PENALTY" | "CREDIT" | "CLAWBACK"
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
      assignment_type: "IN_HOUSE" | "CARRIER"
      call_ai_event_type:
        | "TRANSCRIPT_CHUNK"
        | "INSIGHT_UPDATE"
        | "COACH_PROMPT"
        | "AGENT_ACTION"
        | "DISCLAIMER_PLAYED"
      call_direction: "INBOUND" | "OUTBOUND"
      call_followup_status: "DRAFT" | "SENT" | "DISCARDED"
      call_status:
        | "RINGING"
        | "ANSWERED"
        | "MISSED"
        | "VOICEMAIL"
        | "COMPLETED"
        | "FAILED"
      checkpoint_type:
        | "PICKUP_POD"
        | "DELIVERY_POD"
        | "DUMP_TICKET"
        | "FILL_LINE_PHOTO"
        | "MATERIAL_CLOSEUP"
        | "CONTAMINATION_PHOTO"
        | "SWAP_PICKUP_POD"
        | "SWAP_DELIVERY_POD"
        | "OVERFILL_PHOTO"
      commission_type: "PERCENTAGE" | "FLAT" | "TIERED" | "KPI_BASED"
      commitment_type: "prepaid" | "contracted"
      compensation_trigger:
        | "PAYMENT_CAPTURED"
        | "ORDER_COMPLETED"
        | "RUN_COMPLETED"
        | "KPI_PERIOD_END"
        | "MANUAL"
      contract_status: "pending" | "signed" | "declined" | "expired"
      contract_type: "msa" | "addendum"
      doc_key_type:
        | "NON_NEGOTIABLE_RULES"
        | "CEO_WEEKLY_CHECKLIST"
        | "PLAYBOOK_EXCEPTIONS"
      earning_status: "PENDING" | "APPROVED" | "PAID" | "VOIDED"
      filled_location: "customer" | "yard" | "truck"
      google_action_type:
        | "SEND_EMAIL"
        | "READ_EMAIL"
        | "SYNC_THREAD"
        | "CREATE_MEET"
        | "UPDATE_MEET"
        | "CREATE_DRIVE_FOLDER"
        | "UPLOAD_DRIVE"
        | "ATTACH_FILE"
        | "POST_CHAT_MESSAGE"
        | "OAUTH_CONNECT"
        | "OAUTH_REFRESH"
        | "OAUTH_REVOKE"
      google_connection_status: "CONNECTED" | "EXPIRED" | "REVOKED" | "PENDING"
      google_event_status: "DRY_RUN" | "LIVE" | "SUCCESS" | "FAILED" | "PENDING"
      health_event_severity: "LOW" | "MED" | "HIGH"
      health_event_type:
        | "PAYMENT_RECEIVED"
        | "PAYMENT_OVERDUE"
        | "CHARGEBACK"
        | "REFUND"
        | "DISPUTE"
        | "CANCELLATION"
        | "NO_SHOW"
        | "BLOCKED_ACCESS"
        | "RESCHEDULE"
        | "CONTAMINATION"
        | "OVERWEIGHT"
        | "POD_MISSING"
        | "REPEAT_ORDER"
        | "HIGH_VOLUME"
        | "FAST_PAY"
        | "CLEAN_COMPLIANCE"
        | "REVIEW_POSITIVE"
        | "REVIEW_NEGATIVE"
        | "INITIAL_SCORE"
      health_status: "GREEN" | "AMBER" | "RED"
      help_scope:
        | "GLOBAL"
        | "SALES"
        | "CS"
        | "DISPATCH"
        | "DRIVER"
        | "BILLING"
        | "ADMIN"
      help_severity: "INFO" | "WARNING" | "CRITICAL"
      lifecycle_department:
        | "SALES"
        | "BILLING"
        | "LOGISTICS"
        | "DISPATCH"
        | "CS"
        | "ADMIN"
      lifecycle_entity_type: "LEAD" | "QUOTE" | "ORDER" | "JOB" | "INVOICE"
      lifecycle_trigger: "MANUAL" | "SYSTEM" | "AUTOMATION" | "WEBHOOK" | "CRON"
      location_type: "yard" | "customer" | "facility"
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
      notification_channel: "IN_APP" | "SMS" | "EMAIL" | "SLACK" | "GOOGLE_CHAT"
      notification_priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL"
      payment_action_status:
        | "requested"
        | "approved"
        | "processing"
        | "completed"
        | "failed"
        | "canceled"
      payment_action_type: "refund" | "void"
      phone_purpose: "SALES" | "CS" | "BILLING"
      pipeline_stage_type:
        | "new_lead"
        | "quoted"
        | "follow_up"
        | "won_paid"
        | "scheduled"
        | "delivered"
        | "pickup_requested"
        | "completed"
        | "overdue"
        | "lost"
      placement_creator_role:
        | "CUSTOMER"
        | "SALES"
        | "CS"
        | "DISPATCH"
        | "ADMIN"
        | "DRIVER"
      qa_category:
        | "WEBSITE"
        | "CALCULATOR"
        | "PRICING"
        | "HEAVY"
        | "CRM"
        | "LEADS"
        | "MESSAGING"
        | "TELEPHONY"
        | "DISPATCH"
        | "DRIVER"
        | "BILLING"
        | "ADS"
        | "MASTER_AI"
        | "GOOGLE"
        | "SECURITY"
      qa_check_status: "PASS" | "FAIL" | "WARN" | "SKIP"
      qa_run_status: "RUNNING" | "DONE" | "FAILED"
      qa_severity: "P0" | "P1" | "P2"
      run_status:
        | "DRAFT"
        | "SCHEDULED"
        | "ASSIGNED"
        | "ACCEPTED"
        | "EN_ROUTE"
        | "ARRIVED"
        | "PAUSED"
        | "COMPLETED"
        | "CANCELLED"
      run_type:
        | "DELIVERY"
        | "PICKUP"
        | "HAUL"
        | "SWAP"
        | "DUMP_AND_RETURN"
        | "YARD_TRANSFER"
      timeline_entity_type:
        | "CUSTOMER"
        | "ORDER"
        | "LEAD"
        | "RUN"
        | "INVOICE"
        | "QUOTE"
        | "ASSET"
      timeline_event_action:
        | "CREATED"
        | "UPDATED"
        | "SENT"
        | "RECEIVED"
        | "COMPLETED"
        | "FAILED"
        | "FLAGGED"
        | "SCHEDULED"
        | "CANCELLED"
        | "ASSIGNED"
        | "UPLOADED"
        | "APPROVED"
        | "REJECTED"
        | "REFUNDED"
      timeline_event_type:
        | "CALL"
        | "SMS"
        | "EMAIL"
        | "QUOTE"
        | "ORDER"
        | "PAYMENT"
        | "DISPATCH"
        | "DELIVERY"
        | "PICKUP"
        | "SWAP"
        | "PLACEMENT"
        | "NOTE"
        | "SYSTEM"
        | "AI"
        | "BILLING"
        | "OVERDUE"
        | "CONTAMINATION"
        | "DUMP_TICKET"
      timeline_source: "USER" | "SYSTEM" | "AI" | "WEBHOOK" | "TRIGGER" | "CRON"
      timeline_visibility: "INTERNAL" | "CUSTOMER"
      transcript_status: "LIVE" | "FINAL" | "FAILED"
      truck_type: "ROLLOFF" | "HIGHSIDE" | "END_DUMP" | "TENWHEEL" | "SUPER10"
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
      adjustment_type: ["BONUS", "PENALTY", "CREDIT", "CLAWBACK"],
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
      assignment_type: ["IN_HOUSE", "CARRIER"],
      call_ai_event_type: [
        "TRANSCRIPT_CHUNK",
        "INSIGHT_UPDATE",
        "COACH_PROMPT",
        "AGENT_ACTION",
        "DISCLAIMER_PLAYED",
      ],
      call_direction: ["INBOUND", "OUTBOUND"],
      call_followup_status: ["DRAFT", "SENT", "DISCARDED"],
      call_status: [
        "RINGING",
        "ANSWERED",
        "MISSED",
        "VOICEMAIL",
        "COMPLETED",
        "FAILED",
      ],
      checkpoint_type: [
        "PICKUP_POD",
        "DELIVERY_POD",
        "DUMP_TICKET",
        "FILL_LINE_PHOTO",
        "MATERIAL_CLOSEUP",
        "CONTAMINATION_PHOTO",
        "SWAP_PICKUP_POD",
        "SWAP_DELIVERY_POD",
        "OVERFILL_PHOTO",
      ],
      commission_type: ["PERCENTAGE", "FLAT", "TIERED", "KPI_BASED"],
      commitment_type: ["prepaid", "contracted"],
      compensation_trigger: [
        "PAYMENT_CAPTURED",
        "ORDER_COMPLETED",
        "RUN_COMPLETED",
        "KPI_PERIOD_END",
        "MANUAL",
      ],
      contract_status: ["pending", "signed", "declined", "expired"],
      contract_type: ["msa", "addendum"],
      doc_key_type: [
        "NON_NEGOTIABLE_RULES",
        "CEO_WEEKLY_CHECKLIST",
        "PLAYBOOK_EXCEPTIONS",
      ],
      earning_status: ["PENDING", "APPROVED", "PAID", "VOIDED"],
      filled_location: ["customer", "yard", "truck"],
      google_action_type: [
        "SEND_EMAIL",
        "READ_EMAIL",
        "SYNC_THREAD",
        "CREATE_MEET",
        "UPDATE_MEET",
        "CREATE_DRIVE_FOLDER",
        "UPLOAD_DRIVE",
        "ATTACH_FILE",
        "POST_CHAT_MESSAGE",
        "OAUTH_CONNECT",
        "OAUTH_REFRESH",
        "OAUTH_REVOKE",
      ],
      google_connection_status: ["CONNECTED", "EXPIRED", "REVOKED", "PENDING"],
      google_event_status: ["DRY_RUN", "LIVE", "SUCCESS", "FAILED", "PENDING"],
      health_event_severity: ["LOW", "MED", "HIGH"],
      health_event_type: [
        "PAYMENT_RECEIVED",
        "PAYMENT_OVERDUE",
        "CHARGEBACK",
        "REFUND",
        "DISPUTE",
        "CANCELLATION",
        "NO_SHOW",
        "BLOCKED_ACCESS",
        "RESCHEDULE",
        "CONTAMINATION",
        "OVERWEIGHT",
        "POD_MISSING",
        "REPEAT_ORDER",
        "HIGH_VOLUME",
        "FAST_PAY",
        "CLEAN_COMPLIANCE",
        "REVIEW_POSITIVE",
        "REVIEW_NEGATIVE",
        "INITIAL_SCORE",
      ],
      health_status: ["GREEN", "AMBER", "RED"],
      help_scope: [
        "GLOBAL",
        "SALES",
        "CS",
        "DISPATCH",
        "DRIVER",
        "BILLING",
        "ADMIN",
      ],
      help_severity: ["INFO", "WARNING", "CRITICAL"],
      lifecycle_department: [
        "SALES",
        "BILLING",
        "LOGISTICS",
        "DISPATCH",
        "CS",
        "ADMIN",
      ],
      lifecycle_entity_type: ["LEAD", "QUOTE", "ORDER", "JOB", "INVOICE"],
      lifecycle_trigger: ["MANUAL", "SYSTEM", "AUTOMATION", "WEBHOOK", "CRON"],
      location_type: ["yard", "customer", "facility"],
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
      notification_channel: ["IN_APP", "SMS", "EMAIL", "SLACK", "GOOGLE_CHAT"],
      notification_priority: ["LOW", "NORMAL", "HIGH", "CRITICAL"],
      payment_action_status: [
        "requested",
        "approved",
        "processing",
        "completed",
        "failed",
        "canceled",
      ],
      payment_action_type: ["refund", "void"],
      phone_purpose: ["SALES", "CS", "BILLING"],
      pipeline_stage_type: [
        "new_lead",
        "quoted",
        "follow_up",
        "won_paid",
        "scheduled",
        "delivered",
        "pickup_requested",
        "completed",
        "overdue",
        "lost",
      ],
      placement_creator_role: [
        "CUSTOMER",
        "SALES",
        "CS",
        "DISPATCH",
        "ADMIN",
        "DRIVER",
      ],
      qa_category: [
        "WEBSITE",
        "CALCULATOR",
        "PRICING",
        "HEAVY",
        "CRM",
        "LEADS",
        "MESSAGING",
        "TELEPHONY",
        "DISPATCH",
        "DRIVER",
        "BILLING",
        "ADS",
        "MASTER_AI",
        "GOOGLE",
        "SECURITY",
      ],
      qa_check_status: ["PASS", "FAIL", "WARN", "SKIP"],
      qa_run_status: ["RUNNING", "DONE", "FAILED"],
      qa_severity: ["P0", "P1", "P2"],
      run_status: [
        "DRAFT",
        "SCHEDULED",
        "ASSIGNED",
        "ACCEPTED",
        "EN_ROUTE",
        "ARRIVED",
        "PAUSED",
        "COMPLETED",
        "CANCELLED",
      ],
      run_type: [
        "DELIVERY",
        "PICKUP",
        "HAUL",
        "SWAP",
        "DUMP_AND_RETURN",
        "YARD_TRANSFER",
      ],
      timeline_entity_type: [
        "CUSTOMER",
        "ORDER",
        "LEAD",
        "RUN",
        "INVOICE",
        "QUOTE",
        "ASSET",
      ],
      timeline_event_action: [
        "CREATED",
        "UPDATED",
        "SENT",
        "RECEIVED",
        "COMPLETED",
        "FAILED",
        "FLAGGED",
        "SCHEDULED",
        "CANCELLED",
        "ASSIGNED",
        "UPLOADED",
        "APPROVED",
        "REJECTED",
        "REFUNDED",
      ],
      timeline_event_type: [
        "CALL",
        "SMS",
        "EMAIL",
        "QUOTE",
        "ORDER",
        "PAYMENT",
        "DISPATCH",
        "DELIVERY",
        "PICKUP",
        "SWAP",
        "PLACEMENT",
        "NOTE",
        "SYSTEM",
        "AI",
        "BILLING",
        "OVERDUE",
        "CONTAMINATION",
        "DUMP_TICKET",
      ],
      timeline_source: ["USER", "SYSTEM", "AI", "WEBHOOK", "TRIGGER", "CRON"],
      timeline_visibility: ["INTERNAL", "CUSTOMER"],
      transcript_status: ["LIVE", "FINAL", "FAILED"],
      truck_type: ["ROLLOFF", "HIGHSIDE", "END_DUMP", "TENWHEEL", "SUPER10"],
      volume_tier: ["tier_a", "tier_b", "tier_c", "tier_d"],
    },
  },
} as const
