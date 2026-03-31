# Notification Event Model

> Last updated: 2026-03-31

## Canonical Table: `notification_events`

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| event_type | TEXT | e.g. `lead_created`, `contractor_application_submitted` |
| lead_id | UUID | Linked lead |
| quote_id | UUID | Linked quote |
| customer_id | UUID | Linked customer |
| brand_origin | TEXT | `CALSAN_DUMPSTERS_PRO` or `CALSAN_CD_WASTE_REMOVAL` |
| service_line | TEXT | `DUMPSTER`, `CLEANUP`, `BOTH` |
| severity | TEXT | `info`, `warning`, `critical` |
| requires_action | BOOLEAN | Whether staff must act |
| title | TEXT | Human-readable title |
| message | TEXT | Detail message |
| deep_link | TEXT | URL path to the relevant record |
| payload_json | JSONB | Flexible metadata |
| dedupe_key | TEXT | Prevents duplicate notifications within time window |
| target_roles | TEXT[] | Which roles receive this event |
| created_at | TIMESTAMPTZ | When the event occurred |

## Routing Table: `notification_routing_config`

| Field | Type | Description |
|---|---|---|
| event_type | TEXT | Matches notification_events.event_type |
| target_role | TEXT | `admin`, `sales`, `customer_service` |
| channel_in_app | BOOLEAN | Show in notification bell |
| channel_email | BOOLEAN | Send email alert |
| channel_sms | BOOLEAN | Send SMS alert |
| is_active | BOOLEAN | Enable/disable rule |

## Deduplication

- `dedupe_key` format: `{event_type}:{entity_id}`
- 10-minute dedup window enforced in `internal-alert-dispatcher`
- Prevents notification spam from rapid updates to same lead

## Severity Mapping

| Lead Priority | Severity |
|---|---|
| hot | critical |
| high | warning |
| normal | info |
