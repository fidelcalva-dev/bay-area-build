# Lead Orchestrator Specification

## Canonical Service

**Edge Function**: `lead-ingest` (`supabase/functions/lead-ingest/index.ts`)

All lead creation and enrichment flows through this single function.

## Responsibilities

| Responsibility | Implementation |
|---|---|
| Create lead | INSERT into `sales_leads` |
| Find existing lead | Normalized phone/email match via `trg_normalize_lead_identity` |
| Enrich progressively | UPDATE existing lead with new fields |
| Source attribution | `source_channel`, `source_detail`, UTM fields, `gclid` |
| Attach quote progress | `quote_id`, `selected_size`, `quote_amount` in raw_payload |
| Update next_best_action | DB trigger `trg_normalize_lead_identity` auto-calculates |
| Create timeline milestones | Logged via `lead_events` table |
| Link to quote/customer | `quote_id` on lead, `linked_lead_id` on quote |

## Source Channels

| Channel Code | Origin |
|---|---|
| `QUOTE_FLOW` | V3QuoteFlow progressive captures |
| `WEBSITE_QUOTE` | save-quote final submission |
| `AI_CHAT` | AI estimator/chat handoff |
| `PHOTO_UPLOAD` | Photo/plan upload form |
| `SCHEDULE_DELIVERY` | Delivery scheduling |
| `CONTRACTOR_APPLICATION` | Contractor form |
| `CALLBACK_REQUEST` | Contact/callback form |
| `CONTACT_FORM` | General contact |
| `CLICK_TO_CALL` | Phone click tracking |
| `CLICK_TO_TEXT` | SMS click tracking |
| `GOOGLE_ADS` | lead-from-google-ads |
| `META_ADS` | lead-from-meta |
| `SMS_INBOUND` | lead-from-sms |
| `PHONE_INBOUND` | lead-from-phone |

## Lead Quality Scoring

Built into lead-ingest with inline scoring:
- **Quality Score** (0-100): Email domain, name, phone, address, ZIP, project type, material, urgency keywords
- **Risk Score** (0-100): Disposable emails, short names, suspicious patterns
- **Quality Label**: GREEN (high quality), AMBER (review), RED (likely spam)

## Identity Resolution

- Phone normalized to E.164 via DB trigger
- Email lowercased and trimmed
- `identity_groups` cluster related profiles
- `identity_merge_suggestions` for staff review
