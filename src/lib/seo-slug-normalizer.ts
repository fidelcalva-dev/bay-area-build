// SEO Slug Normalizer — single source of truth for city slug canonicalization
// Strips "-ca" suffix, resolves aliases, ensures canonical DB format

const SLUG_ALIASES: Record<string, string> = {
  'sf': 'san-francisco',
  'sanfrancisco': 'san-francisco',
  'sj': 'san-jose',
  'sanjose': 'san-jose',
  'oak': 'oakland',
  'oak-town': 'oakland',
  'ssf': 'south-san-francisco',
  'rwd': 'redwood-city',
  'wc': 'walnut-creek',
  'mv': 'mountain-view',
  'pa': 'palo-alto',
  'dc': 'daly-city',
  'sr': 'san-rafael',
};

/**
 * Normalize a city slug to its canonical form (matching seo_cities.city_slug).
 * Rules:
 *  1. Check alias table first
 *  2. Strip trailing "-ca" suffix
 *  3. Lowercase + trim
 */
export function normalizeCitySlug(slug: string): string {
  const lower = slug.toLowerCase().trim();

  // Check aliases first
  if (SLUG_ALIASES[lower]) return SLUG_ALIASES[lower];

  // Strip trailing "-ca"
  if (lower.endsWith('-ca')) {
    return lower.slice(0, -3);
  }

  return lower;
}
