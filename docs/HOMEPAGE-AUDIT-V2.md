# Homepage Audit Summary: Uber-Like Upgrade

**Generated**: 2026-02-02  
**Route**: `/` (current) → `/preview/home` (v2 preview)

---

## Current Homepage Structure

| Order | Section | Component |
|-------|---------|-----------|
| 1 | Hero | `HeroSection` |
| 2 | Service Guarantee | `ServiceGuaranteeSection` |
| 3 | How It Works | `HowItWorksSection` |
| 4 | Features | `FeaturesSection` |
| 5 | Trust Badges | `TrustBadgesSection` |
| 6 | Sizes Preview | `SizesPreviewSection` (lazy) |
| 7 | Real Work | `RealWorkSection` (lazy) |
| 8 | Coverage Map | `ServiceCoverageMapSection` (lazy) |
| 9 | Reviews | `ReviewsSection` (lazy) |
| 10 | Recycling | `RecyclingCommitmentSection` (lazy) |
| 11 | FAQ | `FAQSection` |
| 12 | CTA | `CTASection` |

---

## KEEP / MODIFY / REMOVE Analysis

### ✅ KEEP (High-Converting Elements)

| Element | Reason |
|---------|--------|
| `PriceAnchor` | Already uses DB pricing (no hardcoded conflicts) |
| `TrustBadgesSection` | Verified credentials, external links, clean design |
| `FeaturesSection` | Card-based, icons only (no emojis) |
| `SizesPreviewSection` | Photo cards with dynamic "From $X" pricing |
| `ReviewsSection` | Real customer reviews, social proof |
| `FAQSection` | Uses MASTER_FAQS from shared-data |
| `CTASection` | Clean CTA strip with phone number |

### ⚙️ MODIFY (Uber-Like Upgrades)

| Element | Change |
|---------|--------|
| **Hero H1** | Change to "Dumpster rental, booked in seconds." |
| **Hero Layout** | Add prominent centered ZIP input bar |
| **Hero CTAs** | Add "Track My Order" secondary CTA |
| **How It Works** | Simplify to 3 steps (ZIP → Materials → Confirm) |
| **Subheadlines** | Update to Uber-like minimal copy |
| **Benefits** | Add 3 key value props strip |

### ❌ REMOVE (Clutter/Redundancy)

| Element | Reason |
|---------|--------|
| Video in HowItWorks | Move to dedicated /how-it-works page only |
| Service Coverage Map | Lower priority for conversion (keep in full page) |
| Recycling Section | Lower priority for homepage (keep in /about) |

---

## Pricing Audit

### Current State: ✅ COMPLIANT

| Component | Pricing Display | Source | Status |
|-----------|-----------------|--------|--------|
| `PriceAnchor` | "From $X" | `dumpster_sizes` table | ✅ Uses DB |
| `SizesPreviewSection` | "From $X" | `PhotoDumpsterCard` → shared-data | ✅ No hardcoded |
| `HeroSection` | Dynamic from PriceAnchor | DB fallback to shared-data | ✅ Consistent |

### No Hardcoded Pricing Found

All public pricing uses:
1. `getPublicPriceRange()` from `src/lib/publicPricing.ts`
2. `DUMPSTER_SIZES_DATA` from `src/lib/shared-data.ts`
3. `PriceAnchor` component with DB fetch

---

## Emoji Audit

### ✅ NO EMOJIS DETECTED

Scanned sections:
- Hero, Service Guarantee, How It Works, Features, Trust Badges, Sizes, FAQ, CTA

All use Lucide icons consistently.

---

## V2 Components Created

| Component | Purpose |
|-----------|---------|
| `HeroSectionV2` | Uber-like hero with ZIP bar, track order CTA |
| `HowItWorksV2` | Simplified 3-step flow |
| `BenefitsStripV2` | 3 key value props (instant pricing, local yards, tracking) |
| `QuickSizesV2` | Common sizes quick picks (10/20/30/40) |
| `PortalTrack` | Order tracking entry page |

---

## Preview Implementation

### Routes
- `/preview/home` - V2 homepage with all upgrades
- `/preview/quote` - V2 quote flow (existing)
- `/portal/track` - Order tracking entry

### Feature Flags
- `public_theme.v2_uber` - Controls homepage v2 (default: false)
- `quote_flow.v2_minimal` - Controls quote flow v2 (default: false)
- Both require all P0 checks to pass before enabling

---

## QA P0 Checks (Homepage-Specific)

| Check | Description | Status |
|-------|-------------|--------|
| From/range pricing only | No exact prices on public pages | ✅ Verified |
| No hardcoded conflicts | All pricing from DB/shared-data | ✅ Verified |
| No emojis | Lucide icons only | ✅ Verified |
| ZIP bar routes correctly | Prefills ZIP in /quote | ✅ Implemented |
| Track Order link works | Routes to /portal/track | ✅ Implemented |
| SEO preserved | H1, meta tags, schema intact | ✅ Verified |

---

## Rollout Recommendation

1. **Test**: Review `/preview/home` internally
2. **Feedback**: Gather team feedback on v2 design
3. **P0 Gate**: Run QA Control Center, ensure all checks pass
4. **Enable**: Toggle `public_theme.v2_uber` to true
5. **Monitor**: Watch bounce rate and conversion metrics

---

*This audit is the canonical record of homepage changes. Update after any modifications.*
