# AI Chat Lead Persistence

> Last updated: 2026-03-31

## Architecture

### Chat Session Storage
- **Tables**: `ai_chat_sessions`, `ai_chat_messages`
- Sessions are created anonymously and persist even before contact capture
- Messages, detected intent, and context are stored per session

### Lead Linkage
- `ai-chat-lead` edge function calls `lead-ingest` with:
  - `source_channel: 'AI_CHAT'`
  - `ai_conversation_id`: links session to lead
  - `ai_conversation_summary`: summary text stored on lead
  - `ai_estimated_yards_min/max`: size estimates
- Once contact is captured, `ai_chat_sessions.lead_id` is set

### Lead Hub Visibility
- **Tab**: "AI Chat" (`source_channel IN ('AI_CHAT', 'AI_ASSISTANT', 'WEBSITE_CHAT', 'WEBSITE_ASSISTANT')`)
- **Badge**: 🤖 icon with conversation summary preview in Progress column
- **Fields on lead**: `ai_conversation_summary`, `ai_conversation_id`

## Fields Persisted

| Field | Table | Description |
|---|---|---|
| `session_token` | `ai_chat_sessions` | Anonymous session identifier |
| `lead_id` | `ai_chat_sessions` | Links to `sales_leads` after contact capture |
| `message_text` | `ai_chat_messages` | Each message in conversation |
| `ai_conversation_id` | `sales_leads` | References chat session |
| `ai_conversation_summary` | `sales_leads` | Summary for sales team |
