# CAL 008 — 5 yd General Debris price decision

## Confirmed by Fidel (2026-09-27)
- 5 cubic yards, General Debris: base price **$390**, includes **0.5 ton**.
- Applies only to this size and material. META 2026 is NOT approved as a whole.

## Applied (preview only, code change, not published)
- `src/lib/price-list-data.ts`: group GA column 5GD 481.60 -> 390; `INCLUDED_TONS[5]` 0.25 -> 0.5.
- `src/pages/Index.tsx`: home card "From $390"; 0.5 ton now shown (list and catalog agree).
- `src/config/pricingConfig.ts`, `src/lib/shared-data.ts`, `PhotoDumpsterCard.tsx`: 395 -> 390.
- City pages (Oakland, San Jose, San Francisco, cityData titles, SeoCityPage): "From $395" -> "From $390".
- No database, server function or permission was changed.

## Pending decision (Fidel)
- Other ZIP groups for 5 yd General Debris keep their META 2026 prices (GB $501.60 ... GJ $712.75,
  overrides 94662/94557/95056). Decide whether they should also shift by the same -$91.60.
- Other sizes still differ between META 2026 (calculator/home) and the older catalog
  (pricingConfig/shared-data, e.g. 8yd $425 vs $511, 10yd $495 vs $581, 20yd $650 vs $687,
  30yd $775 vs $755, 40yd $925 vs $881, 50yd $1,095 vs $1,051).

## Security finding (reported, not fixed)
- `create-order-from-quote` uses the service key and does not check caller identity, role or
  ownership of the quote. Anyone with a quote id could trigger order creation.
  Fix requires a server change on the shared backend: needs Fidel's approval first.
  Revert plan: redeploy previous function version.

## Not done yet
- Security audit of the 183 warnings, remaining save tests, keyboard/real-phone checks,
  claim evidence (yards, licensed and insured, Most Popular), screenshots.
