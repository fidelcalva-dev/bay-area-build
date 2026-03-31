# Unified Lead Capture System

> Last updated: 2026-03-31

## Architecture Summary

```
Visitor enters any intake surface
    ↓
[Anonymous Session] created (quote_sessions)
    ↓
Progressive autosave on every meaningful step
    ↓
Contact captured (phone/email)?
    ↓  YES → lead-ingest promotes to Lead
    ↓  NO  → session preserved for Sales recovery
    ↓
Lead appears in canonical Lead Hub (/sales/leads)
```

## One System — No Duplicates

| Concern | Canonical Service |
|---|---|
| Lead intake | `lead-ingest` edge function |
| Quote sessions | `save-quote-session` edge function |
| Lead storage | `sales_leads` table |
| Session storage | `quote_sessions` table |
| Event log | `lead_source_events` table |
| Lead Hub | `/sales/leads` |
| Customer 360 | `/admin/customers/:id` |

## Intake Surfaces

| Surface | Source Channel | Brand | Creates Lead? |
|---|---|---|---|
| V3 Quote Flow | `QUOTE_FLOW` | Auto-detect | On contact capture |
| Contact Form | `CONTACT_FORM` | `CALSAN_DUMPSTERS_PRO` | Immediately |
| Cleanup Contact | `CLEANUP_CONTACT` | `CALSAN_CD_WASTE_REMOVAL` | Immediately |
| Contractor App | `CONTRACTOR_APPLICATION` | `CALSAN_DUMPSTERS_PRO` | Immediately |
| AI Chat | `AI_CHAT` | Auto-detect | On contact capture |
| Cleanup Quote | `CLEANUP_WEBSITE` | `CALSAN_CD_WASTE_REMOVAL` | Immediately |

## Progressive Autosave Events

`quote_landing_viewed`, `zip_entered`, `address_entered`, `project_type_selected`, `material_selected`, `size_recommended`, `size_selected`, `rental_term_selected`, `extras_selected`, `notes_entered`, `photo_uploaded`, `contact_started`, `phone_entered`, `email_entered`, `quote_abandoned`

## Lead Creation Thresholds

- Phone entered
- Email entered
- Photos uploaded + ZIP
- Quote reaches high-intent milestone
- User requests quote send
- User requests contact
- Contractor application submitted
- Contact form submitted
- AI chat handoff with contact info

## Privacy Notice

`PrivacyNoticeAtCollection` component appears on all collection surfaces before data submission.

## Lead Hub Saved Views

All Leads, New, Follow-Up, Cleanup, Contractors, Bundle, AI Chat, Contact Form, High Risk, Existing Customer, My Leads, High Intent

## Lead Conversion Actions

Dumpster Quote, Cleanup Proposal, Bundle Quote, Send Quote, Send Contract, Collect Payment, Create Order, Schedule Delivery, Mark Won, Mark Lost

## Brands & Service Lines

- Brands: `CALSAN_DUMPSTERS_PRO`, `CALSAN_CD_WASTE_REMOVAL`
- Service Lines: `DUMPSTER`, `CLEANUP`, `BOTH`
