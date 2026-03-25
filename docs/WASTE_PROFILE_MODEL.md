# Waste Profile Model

Last updated: 2026-03-25

## Table: `waste_profiles`

| Field | Type | Description |
|-------|------|-------------|
| waste_profile_code | TEXT | LIGHT_CLEANOUT, STANDARD_DEBRIS, HEAVY_GENERAL, ROOFING, GREEN_WASTE, DEMO_DEBRIS, MANUAL_REVIEW |
| label | TEXT | Customer-friendly name |
| description | TEXT | Use case description |
| allowed_sizes_json | JSONB | Array of allowed dumpster sizes |
| estimated_density | TEXT | light, medium, heavy, unknown |
| included_tons_by_size_json | JSONB | Map of size → included tons |
| overage_rate | NUMERIC | Cost per extra ton (default $165) |
| requires_manual_review | BOOLEAN | Flags unusual materials |
| public_visible | BOOLEAN | Shown in public quote flow |
| active | BOOLEAN | Active in system |

## Usage

- Website quote: Recommend sizes based on waste profile density
- CRM calculator: Set included tons by profile
- Pricing engine: Use overage_rate from profile
- Warnings: Flag MANUAL_REVIEW profiles for staff attention
