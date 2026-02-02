export type TranscriptStatus = 'LIVE' | 'FINAL' | 'FAILED';
export type CallFollowupStatus = 'DRAFT' | 'SENT' | 'DISCARDED';
export type CallAIEventType = 'TRANSCRIPT_CHUNK' | 'INSIGHT_UPDATE' | 'COACH_PROMPT' | 'AGENT_ACTION' | 'DISCLAIMER_PLAYED';

export interface CallTranscript {
  id: string;
  call_id: string;
  provider: string;
  status: TranscriptStatus;
  transcript_text: string | null;
  language: string;
  word_count: number;
  confidence_avg: number | null;
  speaker_segments: SpeakerSegment[];
  created_at: string;
  updated_at: string;
}

export interface SpeakerSegment {
  text: string;
  timestamp: string;
  speaker: string | null;
  confidence: number | null;
}

export interface CallAIInsight {
  id: string;
  call_id: string;
  intent_score: number | null;
  urgency_score: number | null;
  churn_risk_score: number | null;
  objection_tags_json: string[];
  detected_topics_json: string[];
  competitor_mentions: string[];
  next_best_action: string | null;
  suggested_responses_json: SuggestedResponse[];
  risk_flags_json: string[];
  detected_material_category: string | null;
  detected_size_preference: number | null;
  detected_zip_code: string | null;
  summary_bullets: string[];
  model_used: string | null;
  tokens_used: number | null;
  latency_ms: number | null;
  is_final: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuggestedResponse {
  type: 'short' | 'clarify' | 'overcome';
  text: string;
}

export interface CallAIEvent {
  id: string;
  call_id: string;
  event_type: CallAIEventType;
  payload_json: Record<string, unknown>;
  agent_user_id: string | null;
  created_at: string;
}

export interface CallFollowup {
  id: string;
  call_id: string;
  channel: 'SMS' | 'EMAIL';
  draft_body: string;
  subject: string | null;
  status: CallFollowupStatus;
  sent_at: string | null;
  sent_by: string | null;
  discarded_at: string | null;
  discarded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallCoachingState {
  isLive: boolean;
  transcript: string;
  recentSegments: SpeakerSegment[];
  insight: CallAIInsight | null;
  followups: CallFollowup[];
  lastUpdated: string | null;
}

export interface AnalyzeCallResponse {
  success: boolean;
  mode: string;
  insight: {
    id: string;
    intentScore: number;
    urgencyScore: number;
    churnRiskScore: number;
    objections: string[];
    nextBestAction: string;
    suggestedResponses: SuggestedResponse[];
    riskFlags: string[];
    detectedMaterial: string | null;
    detectedSize: number | null;
    detectedZip: string | null;
    summaryBullets: string[];
  };
  latencyMs: number;
}
