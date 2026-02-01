# Workflow Health Report

> **Generated:** 2026-02-01  
> **Project:** Calsan Dumpster Rental Platform  
> **Supabase Project ID:** tvcwzohfycwfaqjyruow

---

## Overview

The **Workflow Health System** provides real-time visibility into the operational status of all Edge Functions, cron jobs, integrations, and manual setup items. Health signals (GREEN/AMBER/RED) are computed from actual system telemetry.

---

## Health Signal Definitions

| Severity | Meaning | Action Required |
|----------|---------|-----------------|
| **GREEN** | Healthy, all systems operational | None |
| **AMBER** | Attention needed, non-blocking issue | Review at convenience |
| **RED** | Blocked/broken, critical issue | Immediate action required |

---

## Health Signal Sources

### 1. Integration Readiness

Health is determined by comparing **required secrets** vs **current mode**:

| Integration | Required Secrets | Related Functions |
|-------------|-----------------|-------------------|
| TWILIO | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | calls-*, send-otp |
| RESEND | `RESEND_API_KEY` | send-quote-summary, send-contract, send-*-receipt |
| AUTHNET | `AUTHNET_API_LOGIN_ID`, `AUTHNET_TRANSACTION_KEY`, `AUTHNET_SIGNATURE_KEY` | process-payment, process-refund, authnet-webhook |
| GOOGLE_MAPS | `GOOGLE_MAPS_API_KEY` | geocode-address, truck-route, nearest-facilities |
| GHL | `HIGHLEVEL_API_KEY`, `HIGHLEVEL_LOCATION_ID` | ghl-send-message, ghl-message-worker |
| META | `META_VERIFY_TOKEN`, `META_APP_SECRET` | lead-from-meta |
| GOOGLE_ADS | `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_REFRESH_TOKEN` | ads-capacity-guard, ads-generate-campaigns |

**Rules:**
- **RED**: Integration in LIVE mode but missing required secrets
- **AMBER**: Integration in DRY_RUN mode with missing secrets (not blocking)
- **GREEN**: All required secrets present OR feature not applicable

### 2. Cron Jobs

| Cron Job | Schedule | Health Check |
|----------|----------|--------------|
| `overdue-billing-daily` | `0 6 * * *` (6 AM UTC) | Check for recent billing alerts |
| `master-ai-scheduler` | `*/30 * * * *` (every 30 min) | Check ai_jobs for recent activity |

**Rules:**
- **GREEN**: Recent activity within expected interval
- **AMBER**: No activity in 24 hours
- **RED**: Failed jobs or repeated errors

### 3. Manual Setup Items

External configurations that cannot be auto-detected:

| Category | Item | Description | Status Tracking |
|----------|------|-------------|-----------------|
| TWILIO | voice_webhook | Configure calls-inbound-handler URL | manual_setup_items table |
| TWILIO | status_callback | Configure calls-status-callback URL | manual_setup_items table |
| TWILIO | sms_webhook | Configure twilio-sms-webhook URL | manual_setup_items table |
| AUTHNET | webhook | Configure authnet-webhook in merchant interface | manual_setup_items table |
| RESEND | domain_verification | Verify sending domain in Resend | manual_setup_items table |
| META | webhook_config | Configure lead-from-meta webhook | manual_setup_items table |
| GOOGLE_ADS | lead_form | Configure lead-from-google-ads webhook | manual_setup_items table |
| GHL | inbound_webhook | Configure ghl-inbound-webhook URL | manual_setup_items table |
| SECURITY | leaked_password_protection | Enable in Supabase Auth settings | manual_setup_items table |
| SECURITY | extension_schema | Move pg_net from public schema | manual_setup_items table |

**Rules:**
- **RED**: Required for LIVE mode but not configured
- **AMBER**: Pending configuration (DRY_RUN mode)
- **GREEN**: Marked as DONE or NOT_APPLICABLE

### 4. Mode Configuration

| Mode Key | Category | Values |
|----------|----------|--------|
| `telephony.mode` | telephony | DRY_RUN / LIVE |
| `ghl.messaging_mode` | messaging | DRY_RUN / LIVE |
| `ads.mode` | ads | DRY_RUN / LIVE |
| `master_ai.mode` | master_ai | LIVE_INTERNAL / LIVE |
| `compensation.mode` | compensation | DRY_RUN / LIVE |

---

## Telemetry Tables

### system_health_events

Individual health signals captured during scans:

```sql
CREATE TABLE system_health_events (
  id UUID PRIMARY KEY,
  source_type TEXT, -- EDGE_FUNCTION, CRON, WEBHOOK, CONFIG, INTEGRATION, MANUAL_SETUP
  source_key TEXT,
  severity TEXT, -- GREEN, AMBER, RED
  message TEXT,
  details_json JSONB,
  created_at TIMESTAMPTZ
);
```

### system_health_snapshot

Periodic summary snapshots:

```sql
CREATE TABLE system_health_snapshot (
  id UUID PRIMARY KEY,
  generated_at TIMESTAMPTZ,
  summary_json JSONB, -- {total_nodes, green, amber, red}
  node_health_json JSONB, -- map of node_id -> health
  issues_json JSONB, -- sorted list of issues
  created_at TIMESTAMPTZ
);
```

### manual_setup_items

Track external configuration status:

```sql
CREATE TABLE manual_setup_items (
  id UUID PRIMARY KEY,
  category TEXT,
  key TEXT,
  name TEXT,
  description TEXT,
  status TEXT, -- PENDING, IN_PROGRESS, DONE, BLOCKED, NOT_APPLICABLE
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  notes TEXT
);
```

---

## Edge Function: health-collector

**Endpoint:** `/functions/v1/health-collector`

**Invocation:**
```typescript
const { data } = await supabase.functions.invoke('health-collector');
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_nodes": 60,
    "green": 45,
    "amber": 12,
    "red": 3,
    "generated_at": "2026-02-01T12:00:00Z"
  },
  "issues": [
    {
      "severity": "RED",
      "source": "INTEGRATION:RESEND",
      "message": "RESEND in LIVE mode but missing required secrets",
      "details": {}
    }
  ],
  "node_health": {
    "send-quote-summary": {
      "severity": "AMBER",
      "message": "RESEND secrets not configured",
      "issues": ["..."]
    }
  },
  "snapshot_id": "uuid"
}
```

---

## UI: Workflow Health Graph

**Route:** `/admin/qa/workflow-graph`

### Features

1. **Health Summary Bar**
   - GREEN/AMBER/RED counts
   - Last scan timestamp

2. **Workflows Tab**
   - Shows aggregated health per workflow
   - Worst-of-dependencies calculation

3. **Functions Tab**
   - All 66 Edge Functions with health badges
   - Grouped by category
   - Filter by severity

4. **Manual Setup Tab**
   - All external configuration items
   - Status dropdown to mark as DONE

5. **Issues Panel**
   - P0 (RED) blockers listed first
   - P1 (AMBER) attention items
   - Links to relevant admin pages

6. **Run Health Scan Button**
   - Triggers health-collector function
   - Refreshes snapshot

---

## Integration with QA Control Center

The health system complements the existing QA Control Center:

| System | Purpose | Route |
|--------|---------|-------|
| QA Control Center | Automated validation checks | `/admin/qa/control-center` |
| Workflow Explorer | Documentation of functions/workflows | `/admin/qa/workflows` |
| Workflow Health Graph | Real-time health signals | `/admin/qa/workflow-graph` |

---

## Current Health Status (Example)

Based on secrets scan:

| Integration | Status | Notes |
|-------------|--------|-------|
| TWILIO | GREEN | All secrets present |
| AUTHNET | GREEN | All secrets present |
| GOOGLE_MAPS | GREEN | API key present |
| GHL | GREEN | All secrets present |
| RESEND | AMBER | Missing RESEND_API_KEY |
| META | AMBER | Missing META_VERIFY_TOKEN |
| GOOGLE_ADS | AMBER | Missing Google Ads credentials |

---

## Recommendations

1. **Immediate (P0)**
   - None currently (all LIVE integrations have required secrets)

2. **Before Go-Live (P1)**
   - Add RESEND_API_KEY for email functionality
   - Configure Twilio webhooks in Twilio Console
   - Enable Leaked Password Protection in Supabase Auth

3. **Optional (P2)**
   - Add META credentials for Facebook/Instagram lead forms
   - Add Google Ads credentials for campaign automation

---

*Last updated: 2026-02-01*
