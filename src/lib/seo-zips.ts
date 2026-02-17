// SEO ZIP Pages — Data and utilities for ZIP-targeted landing pages

export interface SeoZipData {
  zip: string;
  city: string;
  citySlug: string;
  neighborhoods: string[];
  tier: 'A' | 'B' | 'C';
  yardId: string;
}

// Priority ZIPs for initial deployment — Oakland + immediate East Bay
export const SEO_ZIP_DATA: SeoZipData[] = [
  // Tier A — Oakland Core
  { zip: '94601', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Fruitvale', 'Jingletown', 'San Antonio'], tier: 'A', yardId: 'oakland' },
  { zip: '94603', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Sobrante Park', 'Elmhurst', 'Brookfield Village'], tier: 'A', yardId: 'oakland' },
  { zip: '94605', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Seminary', 'Millsmont', 'Maxwell Park'], tier: 'A', yardId: 'oakland' },
  { zip: '94606', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['San Antonio', 'Clinton', 'East Lake'], tier: 'A', yardId: 'oakland' },
  { zip: '94607', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['West Oakland', 'Prescott', 'Acorn'], tier: 'A', yardId: 'oakland' },
  { zip: '94608', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Emeryville', 'North Oakland', 'Longfellow'], tier: 'A', yardId: 'oakland' },
  { zip: '94609', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Temescal', 'Piedmont Avenue', 'North Oakland'], tier: 'A', yardId: 'oakland' },
  { zip: '94610', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Grand Lake', 'Adams Point', 'Lakeshore'], tier: 'A', yardId: 'oakland' },
  { zip: '94611', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Piedmont', 'Montclair', 'Upper Rockridge'], tier: 'A', yardId: 'oakland' },
  { zip: '94612', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Downtown Oakland', 'Chinatown', 'Old Oakland'], tier: 'A', yardId: 'oakland' },
  { zip: '94618', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Rockridge', 'Upper Broadway', 'Temescal'], tier: 'A', yardId: 'oakland' },
  { zip: '94619', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Laurel', 'Redwood Heights', 'Lincoln Highlands'], tier: 'A', yardId: 'oakland' },
  { zip: '94621', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Coliseum', 'Hegenberger', 'Havenscourt'], tier: 'A', yardId: 'oakland' },
  // Tier A — Berkeley
  { zip: '94702', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['West Berkeley', 'San Pablo Park'], tier: 'A', yardId: 'oakland' },
  { zip: '94703', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['South Berkeley', 'Lorin'], tier: 'A', yardId: 'oakland' },
  { zip: '94704', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['Downtown Berkeley', 'UC Campus'], tier: 'A', yardId: 'oakland' },
  { zip: '94705', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['Claremont', 'Elmwood'], tier: 'A', yardId: 'oakland' },
  // Tier A — Alameda
  { zip: '94501', city: 'Alameda', citySlug: 'alameda', neighborhoods: ['Central Alameda', 'Gold Coast', 'East End'], tier: 'A', yardId: 'oakland' },
  // Tier A — San Leandro
  { zip: '94577', city: 'San Leandro', citySlug: 'san-leandro', neighborhoods: ['Downtown San Leandro', 'Estudillo Estates'], tier: 'A', yardId: 'oakland' },
  { zip: '94578', city: 'San Leandro', citySlug: 'san-leandro', neighborhoods: ['Washington Manor', 'Floresta Gardens'], tier: 'A', yardId: 'oakland' },
  // Tier A — Hayward
  { zip: '94541', city: 'Hayward', citySlug: 'hayward', neighborhoods: ['Downtown Hayward', 'Tennyson'], tier: 'A', yardId: 'oakland' },
  { zip: '94544', city: 'Hayward', citySlug: 'hayward', neighborhoods: ['South Hayward', 'Five Canyons'], tier: 'A', yardId: 'oakland' },
  // Tier A — Castro Valley
  { zip: '94546', city: 'Castro Valley', citySlug: 'castro-valley', neighborhoods: ['Castro Valley Center', 'Five Canyons'], tier: 'A', yardId: 'oakland' },
  // Tier A — Richmond
  { zip: '94801', city: 'Richmond', citySlug: 'richmond', neighborhoods: ['Iron Triangle', 'Point Richmond'], tier: 'A', yardId: 'oakland' },
  { zip: '94804', city: 'Richmond', citySlug: 'richmond', neighborhoods: ['Hilltop', 'El Sobrante'], tier: 'A', yardId: 'oakland' },
];

export function getZipData(zip: string): SeoZipData | undefined {
  return SEO_ZIP_DATA.find(z => z.zip === zip);
}

export function getZipsByCity(citySlug: string): SeoZipData[] {
  return SEO_ZIP_DATA.filter(z => z.citySlug === citySlug);
}

export function getTierAZips(): SeoZipData[] {
  return SEO_ZIP_DATA.filter(z => z.tier === 'A');
}
