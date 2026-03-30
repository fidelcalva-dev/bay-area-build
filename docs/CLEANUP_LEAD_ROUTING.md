# Cleanup Lead Routing

> Last updated: 2026-03-30

## Routing Rules

All cleanup leads enter the **same canonical lead pipeline** (`sales_leads` table) via the `lead-ingest` edge function.

| Entry Point | `source_channel` | `service_line` |
|---|---|---|
| `/quote` | `QUOTE_FLOW` | `DUMPSTER` |
| `/cleanup/quote` | `CLEANUP_WEBSITE` | `CLEANUP` |
| `/cleanup/contact` | `CLEANUP_CONTACT` | `CLEANUP` |
| `/cleanup/for-contractors` | `CLEANUP_CONTRACTOR` | `CLEANUP` |
| Click-to-call (cleanup) | `CLEANUP_CALL` | `CLEANUP` |
| SMS (cleanup) | `CLEANUP_TEXT` | `CLEANUP` |
| Photo upload (cleanup) | `CLEANUP_PHOTO_UPLOAD` | `CLEANUP` |
| Customer indicates both | Any | `BOTH` |

## Source Channel Values

| Channel Code | Origin |
|---|---|
| `CLEANUP_WEBSITE` | Cleanup quote form |
| `CLEANUP_CONTACT` | Cleanup contact form |
| `CLEANUP_CONTRACTOR` | Contractor application via cleanup site |
| `CLEANUP_PHOTO_UPLOAD` | Photo upload from cleanup site |
| `CLEANUP_CALL` | Phone click from cleanup site |
| `CLEANUP_TEXT` | SMS click from cleanup site |

## Service Line Detection Logic (lead-ingest)

```
1. If raw_payload.service_line is set → use it
2. Else if source_channel starts with 'CLEANUP' → 'CLEANUP'
3. Else → 'DUMPSTER' (default)
4. If raw_payload.need_dumpster_too → override to 'BOTH'
```

## SLA Rules by Service Line

| Priority | Dumpster SLA | Cleanup SLA |
|---|---|---|
| Hot | 15 min callback | 15 min callback |
| High | 1 hour | 1 hour |
| Normal | 4 hours | 4 hours |
| Recurring/Contractor | — | High priority auto-upgrade |

## Auto-Tasks Created

For cleanup leads, the system creates the same follow-up task as dumpster leads. The Sales team uses the `service_line` filter in Lead Hub to prioritize.
