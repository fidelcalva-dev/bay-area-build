// CAL 010 — prepared official price calculator (not active).
// Values come from the official ZIP price list (group GA = Oakland/Alameda, ZIP 94501).
// Run: bun test ./tests/official-price.test.ts
import { describe, expect, test } from 'bun:test';
import { calculateOfficialPrice } from '../src/lib/pricing/officialQuotePrice';

describe('official ZIP price list, exact cell in cents', () => {
  test('5 yd General Debris in 94501 is $390 with 0.5 ton included', () => {
    const r = calculateOfficialPrice({ zip: '94501', sizeYd: 5, material: 'GENERAL' });
    expect(r.status).toBe('ok');
    if (r.status !== 'ok') return;
    expect(r.base_cents).toBe(39000);
    expect(r.total_cents).toBe(39000);
    expect(r.included_tons).toBe(0.5);
    expect(r.included_days).toBe(7);
  });

  test('8 yd General Debris in 94501 is $511.60 (no rounding)', () => {
    const r = calculateOfficialPrice({ zip: '94501', sizeYd: 8, material: 'GENERAL' });
    expect(r.status === 'ok' && r.base_cents).toBe(51160);
  });

  test('clean soil and clean concrete cost the same (10 yd, 94501 = $608.50)', () => {
    const soil = calculateOfficialPrice({ zip: '94501', sizeYd: 10, material: 'CLEAN_SOIL' });
    const concrete = calculateOfficialPrice({ zip: '94501', sizeYd: 10, material: 'CLEAN_CONCRETE' });
    expect(soil.status === 'ok' && soil.base_cents).toBe(60850);
    expect(concrete.status === 'ok' && concrete.base_cents).toBe(60850);
  });

  test('ZIP override 94662 uses its own 40 yd price ($901)', () => {
    const r = calculateOfficialPrice({ zip: '94662', sizeYd: 40, material: 'GENERAL' });
    expect(r.status === 'ok' && r.base_cents).toBe(90100);
  });
});

describe('never guesses', () => {
  test('ZIP outside the list needs confirmation', () => {
    expect(calculateOfficialPrice({ zip: '10001', sizeYd: 10, material: 'GENERAL' }).status).toBe('needs_confirmation');
  });
  test('size not on the list (12 yd) needs confirmation instead of using 10 yd', () => {
    expect(calculateOfficialPrice({ zip: '94501', sizeYd: 12, material: 'GENERAL' }).status).toBe('needs_confirmation');
  });
  test('extra days without a confirmed daily rate leave the total open', () => {
    const r = calculateOfficialPrice({ zip: '94501', sizeYd: 20, material: 'GENERAL', rentalDays: 10 });
    expect(r.status).toBe('ok');
    if (r.status !== 'ok') return;
    expect(r.base_cents).toBe(68700);
    expect(r.extra_days).toBe(3);
    expect(r.total_cents).toBeNull();
  });
  test('extra days with a given rate are added exactly', () => {
    const r = calculateOfficialPrice({ zip: '94501', sizeYd: 20, material: 'GENERAL', rentalDays: 10, extraDayRateCents: 1500 });
    expect(r.status === 'ok' && r.total_cents).toBe(68700 + 4500);
  });
});
