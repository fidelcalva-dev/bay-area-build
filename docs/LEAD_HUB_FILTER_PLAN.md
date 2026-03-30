# Lead Hub Filter Plan

> Last updated: 2026-03-30

## Service Line Filter

A new **Service Line** dropdown filter has been added to `/sales/leads`:

| Filter Value | Shows |
|---|---|
| All Services | All leads regardless of service line |
| Dumpster | `service_line = 'DUMPSTER'` |
| Cleanup | `service_line = 'CLEANUP'` |
| Bundle | `service_line = 'BOTH'` |

## Table Columns

The Lead Hub table now includes a **Service** column showing:
- **Dumpster** badge (blue) for dumpster-only leads
- **Cleanup** badge (green) for cleanup-only leads
- **Bundle** badge (purple) for combined leads
- **Contractor** badge when `contractor_flag = true`
- **Recurring** badge when `recurring_service_flag = true`

## Source Labels

New source labels for cleanup channels:
- `CLEANUP_WEBSITE` → "Cleanup Website"
- `CLEANUP_CONTACT` → "Cleanup Contact"
- `CLEANUP_CONTRACTOR` → "Cleanup Contractor"
- `CLEANUP_PHOTO_UPLOAD` → "Cleanup Photos"
- `CLEANUP_CALL` → "Cleanup Call"
- `CLEANUP_TEXT` → "Cleanup Text"

## Existing Tabs (unchanged)

All existing tabs continue to work across both service lines:
- New, Needs Follow-Up, My Leads, High Intent, Existing Customer, High Risk, All

## Recommended Saved Views (Manual Setup)

| View Name | Filter Combination |
|---|---|
| Cleanup Leads | Service = Cleanup |
| Bundle Leads | Service = Bundle |
| Contractor Leads | Service = Cleanup + Source = Cleanup Contractor |
| Recurring Service Leads | Service = Cleanup + (check recurring_service_flag) |
| Follow-Up Today | Tab = Needs Follow-Up |
