# Contractor Application Fields

> Last updated: 2026-04-01

## Form Fields (Public)

### Step 1: Company Info
| Field | Required | Type |
|---|---|---|
| legal_business_name | Yes | text |
| dba_name | No | text |
| contact_name | Yes | text |
| role_title | No | text |
| phone | Yes | tel |
| email | Yes | email |
| website | No | url |
| business_address | Yes | text |
| city | Yes | text |
| state | No | text (default: CA) |
| zip | Yes | text |

### Step 2: Contractor Profile
| Field | Required | Type |
|---|---|---|
| contractor_type | Yes | select |
| license_number | No | text |
| is_insured | No | boolean |
| years_in_business | No | number |
| service_area | No | multi-city select |
| typical_project_type | No | text |
| current_active_projects | No | number |
| average_project_size | No | select |

### Step 3: Service Needs
| Field | Required | Type |
|---|---|---|
| service_line_interest | Yes | DUMPSTER/CLEANUP/BOTH |
| monthly_dumpster_usage_estimate | No | select |
| monthly_cleanup_usage_estimate | No | select |
| recurring_service_interest | No | boolean |
| preferred_cleanup_frequency | No | select |
| common_dumpster_sizes | No | multi-select |
| common_materials | No | multi-select |
| need_priority_service | No | boolean |
| need_net_terms | No | boolean |
| required_dump_sites | No | text |
| notes | No | textarea |

### Step 4: Document Uploads
| Category | Description |
|---|---|
| license | Contractor license (CSLB) |
| insurance | Insurance certificate / COI |
| w9 | W-9 tax form |
| project_photos | Current/past project photos |
| company_logo | Company logo (optional) |

## Internal Fields (Staff-Only)

| Field | Set By |
|---|---|
| status | Staff action |
| review_notes | Staff |
| declined_reason | Staff (on decline) |
| pricing_tier | Staff (on approval) |
| approved_discount_percent | Staff (on approval) |
| approved_by_user_id | Auto |
| reviewed_at | Auto |
| customer_id | Auto (on conversion) |
| converted_at | Auto (on conversion) |
| contractor_fit_score | Auto (calculated) |
| lead_id | Auto (lead-ingest) |
