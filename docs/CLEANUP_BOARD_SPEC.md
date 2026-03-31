# Cleanup Board Specification

> Last updated: 2026-03-31

## Overview

The Cleanup Board is a dedicated pipeline view for C&D Waste Removal leads within the canonical Lead Hub. Not a separate system.

## Access

- `/sales/leads?view=cleanup-board`
- `/cs/leads?view=cleanup-board`
- `/admin/leads/workspace?view=cleanup-board`

## Board Columns

| # | Column | Stage |
|---|---|---|
| 1 | New Inbound | new_inbound |
| 2 | Pending Contact | pending_contact |
| 3 | Waiting on Photos | waiting_on_photos |
| 4 | Scope Review | reviewing_scope |
| 5 | Needs Site Visit | needs_site_visit |
| 6 | Estimating | estimating |
| 7 | Proposal Sent | proposal_sent |
| 8 | Follow-Up | follow_up |
| 9 | Scheduled | scheduled |
| 10 | Won | won |
| 11 | Lost | lost |

## Card Badges

- Contractor 🏗️
- Recurring 🔄
- Bundle 📦
- Photos 📷
- Site Visit 📍
- HOT 🔥
- SAME DAY ⚡

## Filters

Service type, city, assigned rep, contractor flag, recurring flag, bundle flag, photos uploaded, needs site visit, date range.

## Data Source

Same `sales_leads` table filtered by `service_line IN ('CLEANUP', 'BOTH')`.

## Role Behavior

- Sales: Full CRUD + drag-drop
- CS: Read-only + notes
- Admin: Full CRUD + reassign + override
