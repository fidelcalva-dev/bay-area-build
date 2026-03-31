# Final Lead Alerting Summary

> Last updated: 2026-03-31

## What Was Broken

1. **NotificationBell existed but was not mounted** in any layout — Sales, CS, and Admin had no visible notification UI
2. **lead-ingest used a non-existent RPC** (`enqueue_notification`) — notifications silently failed
3. **internal-alert-dispatcher only routed to admin/sales_manager** — CS was excluded
4. **No canonical notification_events table** — events were scattered between `staff_notifications`, `internal_alerts`, and `alerts`
5. **Deep links pointed to `/admin/leads`** instead of `/sales/leads`
6. **No deduplication** on the lead-ingest notification path
7. **No role-based routing config** — hardcoded roles in edge functions

## What Was Fixed

### Database
- Created `notification_events` table with severity, dedupe_key, target_roles, deep_link, and brand/service_line context
- Created `notification_routing_config` table with 36 default routing rules across Admin, Sales, and CS
- Enabled realtime on `notification_events` for live updates

### lead-ingest Edge Function
- Replaced broken `enqueue_notification` RPC with direct inserts to `notification_events` and `staff_notifications`
- Added specific event types: `dumpster_lead_created`, `cleanup_lead_created`, `bundle_lead_created`, `contractor_application_submitted`, `ai_chat_handoff_created`, `contact_form_submitted`
- Added secondary events: `needs_site_visit`, `recurring_service_interest`
- Added deduplication via `dedupe_key`
- Added role-based targeting via `target_roles` array
- Writes to both `notification_events` (new canonical) and `staff_notifications` (existing bell system)

### Layouts
- Added `NotificationBell` to **Sales layout** (sidebar header + mobile header)
- Added `NotificationBell` to **CS layout** (sidebar header)
- Added `NotificationBell` to **Admin layout** (mobile header bar)

### Frontend
- Created `useNotificationEvents` hook with realtime subscription and role-based filtering

## Trigger Events

| Event | Source | Who Gets Notified |
|---|---|---|
| dumpster_lead_created | Dumpster quote flow | Admin, Sales |
| cleanup_lead_created | Cleanup quote/contact | Admin, Sales |
| bundle_lead_created | Quote with bundle flag | Admin, Sales |
| contractor_application_submitted | Contractor form | Admin, Sales |
| ai_chat_handoff_created | AI chat with contact | Admin, Sales |
| contact_form_submitted | Contact forms | Admin, Sales |
| needs_site_visit | Lead flagged for visit | Sales, CS |
| recurring_service_interest | Recurring service flag | Admin, Sales |
| follow_up_overdue | SLA monitor | Admin, Sales |
| high_risk_lead | Lead scoring RED | Admin |
| lead_won | Mark Won action | Admin, Sales, CS |
| lead_lost | Mark Lost action | Admin, Sales |

## Auto-Created Tasks

| Event | Task Created |
|---|---|
| Any new lead | Initial follow-up (15min hot / 1hr high / 4hr normal) |
| contractor_application_submitted | Review contractor account |
| needs_site_visit | Schedule site visit |
| recurring_service_interest | Build recurring proposal |
| photos missing | Request photos |
| follow_up_overdue | Re-engage lead |

## Remaining Manual Review Items

1. **Admin sidebar NotificationBell**: Currently shows on mobile only — add to `AdminSidebar` component for desktop visibility
2. **CS routing for proposals/contracts**: Verify CS users have the `customer_service` role in `user_roles` table
3. **Notification preferences UI**: Allow users to mute specific event types
4. **Email channel delivery**: Requires internal-alert-dispatcher to read `notification_routing_config` for email rules
5. **SMS channel delivery**: Not yet implemented — requires Twilio integration for staff SMS
