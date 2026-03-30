# Cleanup Team Playbook

> Last updated: 2026-03-30

## Overview

The same Sales and CS team handles both Dumpster and Cleanup leads. Service-line filters in the Lead Hub allow them to focus on the right workflow.

## Dumpster Playbook (Existing)

1. Review lead → size/material/price
2. Send quote (auto-generated from calculator)
3. Send contract (MSA + Addendum)
4. Collect payment
5. Create order → dispatch

## Cleanup Playbook

1. **Review scope** — read project description, check service type
2. **Request photos** if not provided (`photos_uploaded_flag = false`)
3. **Estimate labor/disposal** — determine crew size, hours, disposal path
4. **Determine site visit need** — set `needs_site_visit = true` if complex
5. **Send cleanup proposal** — using Cleanup Quote template
6. **Schedule service** — coordinate crew and timing
7. **Complete job** — update order status

## Bundle Playbook

1. Same rep owns both services when possible
2. Identify bundle opportunity early (`bundle_opportunity_flag`)
3. Create combined Bundle Proposal
4. Coordinate dumpster delivery with cleanup schedule
5. Preserve one customer relationship in Customer 360

## SLA Priorities

| Lead Type | Priority | Follow-Up SLA |
|---|---|---|
| Cleanup + ASAP/Rush | Hot | 15 minutes |
| Contractor cleanup lead | High | 1 hour |
| Recurring service inquiry | High | 1 hour |
| Bundle opportunity | High | 1 hour |
| Standard cleanup lead | Normal | 4 hours |

## Task Templates (Auto-Created)

| Task | When |
|---|---|
| Initial follow-up call | All new leads |
| Request photos | When `photos_uploaded_flag = false` on cleanup leads |
| Review scope | After photos received |
| Schedule site visit | When `needs_site_visit = true` |
| Prepare cleanup proposal | After scope review |
| Follow up on cleanup quote | After proposal sent |
| Recurring service call | For recurring leads |

## Communication Templates

| Template | Use Case |
|---|---|
| Cleanup lead received | Auto-acknowledgment |
| Photo request | Ask for site photos |
| Cleanup estimate ready | Proposal notification |
| Site visit needed | Schedule on-site review |
| Recurring service proposal | Ongoing service pitch |
| Bundle quote ready | Combined service notification |
| Follow-up reminder | Scheduled check-in |
| Schedule confirmation | Job date confirmed |
