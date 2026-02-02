// Sales AI Closer Types

export interface SalesAIInsight {
  id: string;
  lead_id?: string;
  contact_id?: string;
  entity_type: 'LEAD' | 'QUOTE' | 'ORDER';
  entity_id: string;
  intent_score: number;
  urgency_score: number;
  value_score: number;
  churn_risk_score: number;
  objections_json: {
    price: boolean;
    schedule: boolean;
    size: boolean;
    rules: boolean;
    trust: boolean;
    notes: string[];
  };
  recommended_next_action: 'CALL' | 'SMS' | 'EMAIL' | 'QUOTE' | 'FOLLOW_UP';
  recommended_script_json: {
    short_close: string;
    clarify_close: string;
  };
  recommended_offer_json: {
    type: string;
    description: string;
    allowed: boolean;
    reason: string;
  };
  reasoning?: string;
  model_used?: string;
  created_at: string;
}

export interface SalesAIDraft {
  id: string;
  lead_id?: string;
  contact_id?: string;
  insight_id?: string;
  channel: 'SMS' | 'EMAIL';
  draft_type: 'SHORT_CLOSE' | 'CLARIFY_CLOSE' | 'FOLLOW_UP';
  subject?: string;
  draft_body: string;
  status: 'DRAFT' | 'SENT' | 'DISCARDED';
  sent_at?: string;
  discarded_at?: string;
  created_by_user_id?: string;
  created_at: string;
}

export interface SalesAIAnalyzeRequest {
  lead_id?: string;
  contact_id?: string;
  entity_type: 'LEAD' | 'QUOTE' | 'ORDER';
  entity_id: string;
  messages?: string[];
  source_channel?: string;
  zip?: string;
  market?: string;
  material_category?: string;
  size_yd?: number;
  customer_type?: string;
  customer_tier?: string;
  is_heavy?: boolean;
  quote_price?: number;
  user_role?: string;
}

export interface SalesAIAnalyzeResponse {
  success: boolean;
  mode: 'DRY_RUN' | 'LIVE';
  insight: SalesAIInsight;
  drafts: SalesAIDraft[];
  latency_ms: number;
  error?: string;
}

export interface SalesAIConfig {
  enabled: boolean;
  mode: 'DRY_RUN' | 'LIVE';
  send_enabled: boolean;
  max_discount_pct_sales: number;
  preferred_customer_discount_pct: number;
}
