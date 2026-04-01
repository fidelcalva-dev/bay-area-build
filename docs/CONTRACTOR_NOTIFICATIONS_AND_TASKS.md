# Contractor Notifications and Tasks

> Last updated: 2026-04-01

## Automated Triggers

| Event | Action |
|---|---|
| Application submitted | Create lead via `lead-ingest` |
| Application submitted | Notification to Sales + Admin |
| Docs missing | Suggest "Request Documents" task |
| Recurring = true | Tag as `RECURRING_CONTRACTOR` |
| Service = BOTH | Tag as `BUNDLE_CONTRACTOR` |
| Approved | Create conversion task |
| Declined | Save reason, optional notification |

## Notification Routing

| Event | Routed To |
|---|---|
| New contractor application | Sales, Admin |
| Application approved | Sales owner, Admin |
| Application declined | Admin |
| Converted to customer | Sales owner, CS |
| Docs requested | Sales owner |

## Lead Ingest Payload

```json
{
  "source_channel": "CONTRACTOR_APPLICATION",
  "lead_intent": "CONTRACTOR_ACCOUNT",
  "contractor_flag": true,
  "raw_payload": {
    "contractor_application_flag": true,
    "contractor_application_id": "<uuid>",
    "contractor_type": "<type>",
    "service_line": "<DUMPSTER|CLEANUP|BOTH>",
    "recurring_interest": true,
    "fit_score": 75
  }
}
```

## Fit Score Factors

### Positive
| Factor | Points |
|---|---|
| Bay Area service area | +15 |
| Business email (not free) | +10 |
| Phone + contact present | +10 |
| Recurring interest | +10 |
| 3+ active projects | +15 |
| 1-2 active projects | +8 |
| Both service lines | +10 |
| 2+ docs uploaded | +10 |
| 1 doc uploaded | +5 |
| Aligned contractor type | +5 |
| Insured | +5 |
| 5+ years in business | +5 |
| 2-4 years in business | +3 |
| License number | +5 |

### Score → Recommendation
| Score | Recommendation |
|---|---|
| ≥ 60 | Approve |
| 35–59 | Needs Review |
| < 35 | Consider Declining |
