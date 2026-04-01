# Contractor Board Specification

> Last updated: 2026-04-01

## Location

- `/sales/leads?view=contractor-board`
- Available in Sales, Admin, and CS Lead Hub

## Board Columns (8)

| Column | Status Code | Color |
|---|---|---|
| New Application | `submitted` | Blue |
| Pending Review | `under_review` | Amber |
| Waiting on Info | `waiting_on_info` | Orange |
| Qualified | `qualified` | Cyan |
| Pricing Review | `pricing_review` | Purple |
| Approved | `approved` | Green |
| Declined | `declined` | Red |
| Converted to Customer | `converted` | Emerald |

## Card Display

Each card shows:
- Company name (legal_business_name or company_name)
- Contact name
- City (with MapPin icon)
- Service line interest badge
- Fit score badge (color-coded: green ≥60, amber ≥35, gray <35)
- Date submitted
- Recurring badge (if applicable)
- Docs icon (if uploaded)
- Active project count

## Component

- `src/components/contractor/ContractorBoard.tsx`
- Horizontally scrollable kanban
- Click card → opens ContractorApplicationDetail
