/**
 * SizeCategoryBadge — Color-coded badge that classifies a dumpster size
 * into a customer-facing job category.
 *
 *   SMALL  (5, 8 yd)    → green  "Small Job"
 *   MEDIUM (10, 20 yd)  → blue   "Most Popular"
 *   LARGE  (30, 40 yd)  → orange "Contractor"
 *   XL     (50 yd)      → red    "Industrial"
 *
 * Uses Tailwind palette utilities (not the design-system primary token) so the
 * four categories remain visually distinct from each other and from the brand
 * green used inside the dumpster diagram.
 */

import { cn } from '@/lib/utils';

export type SizeCategory = 'SMALL' | 'MEDIUM' | 'LARGE' | 'XL';

export function getSizeCategory(yards: number): SizeCategory {
  if (yards <= 8) return 'SMALL';
  if (yards <= 20) return 'MEDIUM';
  if (yards <= 40) return 'LARGE';
  return 'XL';
}

const CATEGORY_META: Record<SizeCategory, { label: string; classes: string }> = {
  SMALL:  { label: 'Small Job',    classes: 'bg-green-100 text-green-800 border-green-200' },
  MEDIUM: { label: 'Most Popular', classes: 'bg-blue-100 text-blue-800 border-blue-200' },
  LARGE:  { label: 'Contractor',   classes: 'bg-orange-100 text-orange-800 border-orange-200' },
  XL:     { label: 'Industrial',   classes: 'bg-red-100 text-red-800 border-red-200' },
};

interface SizeCategoryBadgeProps {
  yards: number;
  className?: string;
}

export function SizeCategoryBadge({ yards, className }: SizeCategoryBadgeProps) {
  const cat = getSizeCategory(yards);
  const meta = CATEGORY_META[cat];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        meta.classes,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export default SizeCategoryBadge;
