# GO-LIVE READINESS REPORT
## Platform Audit - January 26, 2026

---

## EXECUTIVE SUMMARY

| Category | Status | Notes |
|----------|--------|-------|
| **Website Pricing** | ✅ PASS | DB and shared-data.ts are in sync |
| **Calculator Rules** | ✅ PASS | v58 pricing engine operational |
| **Heavy Rules Enforcement** | ✅ PASS | Fill-line, photos, reclassification all configured |
| **Reclassification Billing** | ✅ PASS | mark_order_contaminated function complete |
| **Overdue Billing** | ✅ PASS | Cron scheduled, policy-based gating active |
| **Lead Hub Capture** | ✅ PASS | 15 channels, dedup, routing operational |
| **Telephony Readiness** | ⚠️ DRY_RUN | Configured, awaiting Twilio webhook setup |
| **Messaging Readiness** | ⚠️ DRY_RUN | Templates ready, SMS/Email in DRY_RUN |
| **Ads Engine Readiness** | ⚠️ DRY_RUN | Campaigns ready, awaiting Google Ads API credentials |
| **Master AI Readiness** | ✅ LIVE_INTERNAL | Cron jobs scheduled, internal notifications active |
| **Security Posture** | ⚠️ ACTION REQUIRED | 3 manual items pending |

---

## PHASE 1: PRICING CANON VERIFICATION

### Database vs Code Consistency

| Size | DB base_price | shared-data.ts | Status |
|------|--------------|----------------|--------|
| 5yd | $390 | $390 | ✅ Match |
| 8yd | $460 | $460 | ✅ Match |
| 10yd | $580 | $580 | ✅ Match |
| 20yd | $620 | $620 | ✅ Match |
| 30yd | $770 | $770 | ✅ Match |
| 40yd | $895 | $895 | ✅ Match |
| 50yd | $1,135 | $1,135 | ✅ Match |

### Included Tonnage

| Size | DB included_tons | INCLUDED_TONS_BY_SIZE | Status |
|------|-----------------|----------------------|--------|
| 5yd | 0.5T | 0.5T | ✅ Match |
| 8yd | 0.5T | 0.5T | ✅ Match |
| 10yd | 1.0T | 1.0T | ✅ Match |
| 20yd | 2.0T | 2.0T | ✅ Match |
| 30yd | 3.0T | 3.0T | ✅ Match |
| 40yd | 4.0T | 4.0T | ✅ Match |
| 50yd | 5.0T | 5.0T | ✅ Match |

### Heavy Material Reclassification Tonnage
Separate from general debris - used when heavy loads are contaminated:
- 5yd: 0.5T, 8yd: 0.8T, 10yd: 1.0T ✅

---

## PHASE 2: MATERIAL ROUTING VERIFICATION

### Grass/Yard Waste Routing
- **material_catalog.GRASS_YARD_WASTE**: Routes to `DEBRIS_HEAVY` ✅
- **green_halo_allowed**: `false` (correct - no composting upsell) ✅
- **allowed_sizes**: [5, 6, 8, 10] ✅

### Heavy Material Profiles (11 active)
All seeded correctly with proper density ranges and fill lines:
- CONCRETE_CLEAN, ASPHALT_CLEAN, SOIL_CLEAN, ROCK_CLEAN, GRAVEL_CLEAN
- GRANITE_CLEAN, BRICK_TILE_CLEAN, WOOD_CLEAN, GRASS_CLEAN, WOOD_CHIPS_CLEAN
- MIXED_HEAVY

---

## PHASE 3: CONFIGURATION MODES

| Config Key | Current Value | Expected | Status |
|------------|--------------|----------|--------|
| messaging.mode | DRY_RUN | DRY_RUN | ✅ |
| telephony.mode | DRY_RUN | DRY_RUN | ✅ |
| ads.mode | DRY_RUN | DRY_RUN | ✅ |
| master_ai.mode | LIVE_INTERNAL | LIVE_INTERNAL | ✅ |
| master_ai.allow_customer_messages | false | false | ✅ |
| master_ai.allow_internal_notifications | true | true | ✅ |
| overdue.daily_rate | 35 | 35 | ✅ |
| overdue.auto_bill_max | 250 | 250 | ✅ |
| leads.timeout_minutes | 15 | 15 | ✅ |

---

## PHASE 4: CRON SCHEDULES

| Job Name | Schedule | Status |
|----------|----------|--------|
| overdue-billing-daily | 0 6 * * * (6am UTC / 10pm PT) | ✅ Active |
| master-ai-control-tower | */30 * * * * (every 30 min) | ✅ Active |
| master-ai-daily-brief | 0 16 * * * (8am PT) | ✅ Active |
| master-ai-eod-report | 0 2 * * * (6pm PT) | ✅ Active |

---

## PHASE 5: SECURITY AUDIT

### RLS Status
- All 99 public tables have RLS enabled ✅
- Sensitive tables (orders, quotes, invoices, payments, customers, call_events, voicemails, driver_payouts, approval_requests, sales_leads, message_logs, contracts) all have role-based policies ✅

### Permissive Policies (INSERT only - Low Risk)
| Table | Policy | Risk Assessment |
|-------|--------|-----------------|
| ads_metrics | Service role insert | Low - internal analytics |
| ads_sync_log | Service role insert | Low - internal logging |
| customer_profiles | Anyone can create | Low - public registration |
| quotes | Public quote creation | Low - expected public funnel |
| waste_vision_analyses | Anyone can create | Low - public feature |

### Storage Buckets
| Bucket | Public | Assessment |
|--------|--------|------------|
| call-recordings | ❌ Private | ✅ Correct |
| dump-tickets | ❌ Private | ✅ Correct |
| internal-docs | ❌ Private | ✅ Correct |
| lead-exports | ❌ Private | ✅ Correct |
| order-documents | ⚠️ Public | Review: may need signed URLs for invoices |

### Database Triggers (13 active on orders)
All critical lifecycle triggers verified:
- update_orders_updated_at
- trigger_order_scheduled (asset reservation)
- trigger_order_delivered (MOVE_OUT, asset deploy)
- trigger_order_completed (MOVE_IN, asset return)
- trigger_order_cancelled (asset release)
- trigger_create_delivery_run (auto-run creation)
- trigger_create_pickup_run (auto-run creation)
- trigger_cancel_runs_on_close
- auto_populate_heavy_fields_trigger

---

## PHASE 6: MANUAL ACTION ITEMS

### 🔴 CRITICAL - Security Infrastructure

1. **Enable Leaked Password Protection**
   - Location: Supabase Dashboard → Authentication → Security
   - Action: Enable "Protect against leaked passwords"
   - Risk: User accounts may use compromised passwords

2. **Move pg_net Extension from Public Schema**
   - Location: SQL Editor
   - Action: 
     ```sql
     CREATE SCHEMA IF NOT EXISTS extensions;
     ALTER EXTENSION pg_net SET SCHEMA extensions;
     ```
   - Risk: Low - but best practice

### 🟡 RECOMMENDED - Integration Setup

3. **Twilio Webhook Configuration**
   - Inbound calls: `https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-inbound-handler`
   - SMS webhook: `https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/twilio-sms-webhook`
   - Status callback: `https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-status-callback`

4. **Google Ads API Credentials**
   - Required: Customer ID, OAuth Client ID, Client Secret
   - Configure in: Supabase Secrets

5. **Review order-documents Bucket**
   - Consider: Switch to private + signed URLs for invoices/contracts

---

## FIXES APPLIED IN THIS AUDIT

### Database
1. ✅ Added Master AI cron schedules (CONTROL_TOWER, DAILY_BRIEF, EOD_REPORT)

### Verified (No Changes Needed)
1. ✅ Pricing consistency: DB matches shared-data.ts
2. ✅ Heavy material profiles: All 11 active with correct densities
3. ✅ Grass/yard waste: Routes to DEBRIS_HEAVY correctly
4. ✅ Order lifecycle triggers: All 13 present and enabled
5. ✅ Foreign key relationships: orders→quotes→customers chain intact
6. ✅ RLS policies: All sensitive tables protected

---

## ROLLBACK PLAN

### Feature Flags (config_settings)
```sql
-- Disable Master AI
UPDATE config_settings SET value = 'false' WHERE key = 'enabled' AND category = 'master_ai';

-- Disable Overdue Billing
UPDATE config_settings SET value = 'false' WHERE key = 'enabled' AND category = 'overdue';

-- Switch messaging to DRY_RUN
UPDATE config_settings SET value = '"DRY_RUN"' WHERE key = 'mode' AND category = 'messaging';
```

### Cron Disable
```sql
-- Pause all cron jobs
SELECT cron.unschedule('master-ai-control-tower');
SELECT cron.unschedule('master-ai-daily-brief');
SELECT cron.unschedule('master-ai-eod-report');
SELECT cron.unschedule('overdue-billing-daily');
```

---

## FINAL VERDICT

### ✅ READY FOR INTERNAL OPERATIONS
- Master AI LIVE_INTERNAL active
- Lead Hub capturing from all channels
- Overdue billing running
- Heavy material enforcement complete
- Reclassification billing functional

### ⚠️ PENDING FOR CUSTOMER-FACING LIVE
1. Complete Twilio webhook configuration
2. Enable leaked password protection
3. Verify messaging templates
4. Complete Google Ads API setup (if needed)
5. Review order-documents bucket access

---

*Report generated: 2026-01-26T20:36:00Z*
*Auditor: Lovable Engineering Autopilot*
