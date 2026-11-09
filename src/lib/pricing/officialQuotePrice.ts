// CAL 010 — Prepared official price calculator (NOT ACTIVE).
//
// Single, verifiable rule set built only on the official ZIP price list
// (src/lib/price-list-data.ts). It is not wired into any screen or server
// function yet: activating it would change some prices customers see today
// (see docs/CAL_010_PRICING.md) and needs the owner's confirmation first.
//
// Amounts are integer cents. Anything the list does not cover returns
// `needs_confirmation` instead of a guessed price.

import { getExactListPrice, INCLUDED_TONS } from '@/lib/price-list-data';

export type OfficialPriceResult =
  | {
      status: 'ok';
      base_cents: number;
      extra_days: number;
      extra_days_cents: number | null; // null = daily rate not confirmed
      total_cents: number | null;      // null while any part is unconfirmed
      included_days: number;
      included_tons: number | null;
      source: 'official_zip_price_list';
      assumptions: string[];
    }
  | { status: 'needs_confirmation'; reason: string };

export interface OfficialPriceInput {
  zip: string;
  sizeYd: number;
  material: string; // GENERAL | CLEAN_SOIL | CLEAN_CONCRETE | MIXED ...
  rentalDays?: number;
  /** Confirmed extra-day rate in cents. Pending owner confirmation ($15 vs $35 in code today). */
  extraDayRateCents?: number | null;
}

export const STANDARD_RENTAL_DAYS = 7;

export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function calculateOfficialPrice(input: OfficialPriceInput): OfficialPriceResult {
  const zip = (input.zip || '').trim();
  if (!/^\d{5}$/.test(zip)) return { status: 'needs_confirmation', reason: 'invalid_zip' };
  if (!Number.isInteger(input.sizeYd) || input.sizeYd <= 0) {
    return { status: 'needs_confirmation', reason: 'invalid_size' };
  }
  const list = getExactListPrice(zip, input.sizeYd, input.material || 'GENERAL');
  if (list === null) return { status: 'needs_confirmation', reason: 'not_in_price_list' };

  const days = input.rentalDays ?? STANDARD_RENTAL_DAYS;
  if (!Number.isInteger(days) || days < 1 || days > 90) {
    return { status: 'needs_confirmation', reason: 'invalid_rental_days' };
  }
  const extraDays = Math.max(0, days - STANDARD_RENTAL_DAYS);
  const rate = input.extraDayRateCents ?? null;
  const extraCents = extraDays === 0 ? 0 : rate === null ? null : extraDays * rate;
  const base = toCents(list);
  const isGeneral = !/(CLEAN|SOIL|CONCRETE|MIX|HEAVY)/i.test(input.material || '');
  const assumptions = ['Price is the exact cell of the official ZIP price list.'];
  if (extraDays > 0 && rate === null) assumptions.push('Extra-day rate pending confirmation.');

  return {
    status: 'ok',
    base_cents: base,
    extra_days: extraDays,
    extra_days_cents: extraCents,
    total_cents: extraCents === null ? null : base + extraCents,
    included_days: STANDARD_RENTAL_DAYS,
    included_tons: isGeneral ? INCLUDED_TONS[input.sizeYd] ?? null : null,
    source: 'official_zip_price_list',
    assumptions,
  };
}
