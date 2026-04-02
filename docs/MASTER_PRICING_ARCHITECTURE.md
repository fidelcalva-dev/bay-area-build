# Master Pricing Architecture

Last updated: 2026-04-02

## Target Architecture

### Layer A — Internal Editable Pricing Base
**Used by:** CRM calculator, exact quote engine, quote detail, Customer 360, documents, simulator, pricing analytics

**Source tables:**
- `pricing_general_debris` — Base prices by size/market
- `pricing_heavy_service_costs` — Heavy service costs by size
- `pricing_heavy_groups` — Heavy group dump fees and premiums
- `pricing_policies` — Operational fees and surcharges
- `pricing_extras` — Add-on items catalog
- `pricing_zones` — Zone surcharges (A-E)
- `rush_delivery_config` — Rush/same-day fees
- `contractor_tiers` — Contractor discount tiers
- `customer_required_dump_rules` — Dump site pricing rules
- `dumpster_sizes` — Size catalog
- `material_catalog` — Material catalog
- `waste_profiles` — Weight behavior profiles
- `rental_term_catalog` — Rental period options
- `crm_calculator_rules` — Internal calculator config

**Service layer:**
- `masterPricingService.ts` — Unified pricing gateway (Smart Engine → static fallback)
- `pricingCatalogService.ts` — DB CRUD with config fallback
- `smartPricingEngine.ts` — Location-aware dynamic pricing

### Layer B — Published Public Pricing Catalog
**Used by:** Website pricing page, size pages, material pages, city representative pricing, public size cards

**Source table:** `public_price_catalog`

**Service layer:** `publicPricingService.ts` — Reads only from compiled public catalog with config fallback

**Rules:**
- Public pages do NOT read raw internal pricing tables directly
- Public pages read from `public_price_catalog` or `publicPricingService.ts`
- Shows representative "from $X" pricing, not internal cost breakdowns

### Layer C — Exact Quote Calculation
**Used by:** Website quote flow, CRM calculator, quote detail, proposal generation, Customer 360, simulator

**Flow:** ZIP → Smart Pricing Engine → exact price with zone/yard/facility resolution

## Versioning Model

| Status | Description |
|--------|-------------|
| `draft` | Editable, visible in admin only |
| `pending_approval` | Ready for review |
| `published` | Active production version (only one) |
| `archived` | Previous versions kept for rollback |

## Compilation Flow

```
Admin edits → pricing_general_debris + pricing_heavy_* → Save Draft
                                                            ↓
Admin publishes → compilePriceCatalog() → public_price_catalog
                                            ↓
Website reads → publicPricingService.ts → "From $395"
```

## Canonical Size Rules

| Category | Sizes |
|----------|-------|
| General Debris | 5, 8, 10, 20, 30, 40, 50 |
| Heavy Material | 5, 8, 10 |
| 6-yard | **DECOMMISSIONED** |

## Service Layer Map

| Service | Purpose | Layer |
|---------|---------|-------|
| `publicPricingService.ts` | Public catalog reads | B |
| `masterPricingService.ts` | Exact internal pricing | A, C |
| `pricingCatalogService.ts` | Admin CRUD | A |
| `pricingCatalogCompiler.ts` | Compile public catalog | A → B |
| `pricingVersionService.ts` | Version lifecycle | A, B |
| `smartPricingEngine.ts` | Location-aware pricing | C |

## Admin Hub

`/admin/pricing` — 33 tabs across 5 groups with sticky action bar and right summary sidebar.
