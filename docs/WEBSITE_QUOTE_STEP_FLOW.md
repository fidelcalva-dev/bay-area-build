# Website Quote Step Flow (V3)

## Step Sequence

```
Step 1: Project Type → What's your project? (11 universal types)
Step 2: ZIP / Address → Where do you need service? (yard match, ETA)
Step 3: Material → What type of waste? (General / Heavy / Not Sure)
Step 4: Size → Choose Your Dumpster Size (selling cards with badges)
Step 5: Service → Customize Your Service (swap, same-day, dump site, notes)
Step 6: Contact → Who should we contact? (name, phone, email, company)
Step 7: Price → Your Price Range (rental days, inclusions, availability)
Step 8: Access → Placement & Access (constraints, gate code)
Step 9: Confirm → Proposal Summary (line items, extras, policies, total)
Step 10: Placement → Map Placement (post-confirm, optional)
```

## Progressive Data Capture

Data is saved at each transition via:
- **lead-ingest** edge function (milestones: address_saved, material_selected, size_selected, price_shown, contact_captured)
- **draftQuoteService** (upsert on ZIP+material+size threshold)
- **useQuoteDraftAutosave** (2-hour localStorage session persistence)

## Fields Collected

| Field | Step | Required |
|-------|------|----------|
| project_type | 1 | Yes |
| zip | 2 | Yes |
| address | 2 | No |
| material_group | 3 | Yes |
| material_detail | 3 | Yes |
| size | 4 | Yes |
| rental_days | 5/7 | Yes (default 7) |
| wants_swap | 5 | No |
| wants_same_day | 5 | No |
| special_placement | 5 | No |
| required_dump_site | 5 | No |
| customer_notes | 5 | No |
| customer_name | 6 | Yes |
| customer_phone | 6 | Yes |
| customer_email | 6 | No |
| company_name | 6 | No |
| consent_sms | 6 | Yes |
| consent_terms | 6 | Yes |
| access_flags | 8 | No |
| placement_type | 8 | No |
| gate_code | 8 | No |
| terms_accepted | 9 | Yes |

## Trust Elements (per step)

- Step 2: Licensed & Insured, Real Local Yard, Transparent Pricing, Same-Day Available
- Step 4: No hidden fees, Need help? Call us
- Step 6: Secure & private, 15-min response
- Step 7: Real local yard, Transparent pricing, Bay Area since 2009
- Step 9: Licensed & Insured, 15-min response
