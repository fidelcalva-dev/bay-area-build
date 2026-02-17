// SEO ZIP Pages — Data and utilities for ZIP-targeted landing pages

export interface SeoZipData {
  zip: string;
  city: string;
  citySlug: string;
  neighborhoods: string[];
  tier: 'A' | 'B' | 'C';
  yardId: string;
}

// Priority ZIPs for SEO deployment
export const SEO_ZIP_DATA: SeoZipData[] = [
  // ══════════════════════════════════════════════════
  // Tier A — Oakland Core
  // ══════════════════════════════════════════════════
  { zip: '94601', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Fruitvale', 'Jingletown', 'San Antonio'], tier: 'A', yardId: 'oakland' },
  { zip: '94602', city: 'Oakland', citySlug: 'oakland', neighborhoods: ['Glenview', 'Dimond', 'Lincoln Highlands'], tier: 'A', yardId: 'oakland' },
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

  // ══════════════════════════════════════════════════
  // Tier A — Berkeley
  // ══════════════════════════════════════════════════
  { zip: '94702', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['West Berkeley', 'San Pablo Park'], tier: 'A', yardId: 'oakland' },
  { zip: '94703', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['South Berkeley', 'Lorin'], tier: 'A', yardId: 'oakland' },
  { zip: '94704', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['Downtown Berkeley', 'UC Campus'], tier: 'A', yardId: 'oakland' },
  { zip: '94705', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['Claremont', 'Elmwood'], tier: 'A', yardId: 'oakland' },
  { zip: '94707', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['North Berkeley', 'Thousand Oaks'], tier: 'A', yardId: 'oakland' },
  { zip: '94708', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['Kensington', 'Arlington'], tier: 'A', yardId: 'oakland' },
  { zip: '94709', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['North Berkeley', 'Gourmet Ghetto'], tier: 'A', yardId: 'oakland' },
  { zip: '94710', city: 'Berkeley', citySlug: 'berkeley', neighborhoods: ['West Berkeley', 'Aquatic Park'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier A — Alameda
  // ══════════════════════════════════════════════════
  { zip: '94501', city: 'Alameda', citySlug: 'alameda', neighborhoods: ['Central Alameda', 'Gold Coast', 'East End'], tier: 'A', yardId: 'oakland' },
  { zip: '94502', city: 'Alameda', citySlug: 'alameda', neighborhoods: ['Bay Farm Island', 'Harbor Bay'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier A — San Leandro
  // ══════════════════════════════════════════════════
  { zip: '94577', city: 'San Leandro', citySlug: 'san-leandro', neighborhoods: ['Downtown San Leandro', 'Estudillo Estates'], tier: 'A', yardId: 'oakland' },
  { zip: '94578', city: 'San Leandro', citySlug: 'san-leandro', neighborhoods: ['Washington Manor', 'Floresta Gardens'], tier: 'A', yardId: 'oakland' },
  { zip: '94579', city: 'San Leandro', citySlug: 'san-leandro', neighborhoods: ['Marina', 'Bay-O-Vista'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier A — Hayward
  // ══════════════════════════════════════════════════
  { zip: '94541', city: 'Hayward', citySlug: 'hayward', neighborhoods: ['Downtown Hayward', 'Tennyson'], tier: 'A', yardId: 'oakland' },
  { zip: '94544', city: 'Hayward', citySlug: 'hayward', neighborhoods: ['South Hayward', 'Five Canyons'], tier: 'A', yardId: 'oakland' },
  { zip: '94545', city: 'Hayward', citySlug: 'hayward', neighborhoods: ['Industrial Hayward', 'West Hayward'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier A — Richmond
  // ══════════════════════════════════════════════════
  { zip: '94801', city: 'Richmond', citySlug: 'richmond', neighborhoods: ['Iron Triangle', 'Point Richmond'], tier: 'A', yardId: 'oakland' },
  { zip: '94804', city: 'Richmond', citySlug: 'richmond', neighborhoods: ['Hilltop', 'El Sobrante'], tier: 'A', yardId: 'oakland' },
  { zip: '94805', city: 'Richmond', citySlug: 'richmond', neighborhoods: ['El Cerrito Hills', 'Mira Vista'], tier: 'A', yardId: 'oakland' },
  { zip: '94806', city: 'Richmond', citySlug: 'richmond', neighborhoods: ['San Pablo', 'Pinole'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier A — Castro Valley + Emeryville + El Cerrito + Albany + San Lorenzo
  // ══════════════════════════════════════════════════
  { zip: '94546', city: 'Castro Valley', citySlug: 'castro-valley', neighborhoods: ['Castro Valley Center', 'Five Canyons'], tier: 'A', yardId: 'oakland' },
  { zip: '94552', city: 'Castro Valley', citySlug: 'castro-valley', neighborhoods: ['Cull Canyon', 'Jensen Ranch'], tier: 'A', yardId: 'oakland' },
  { zip: '94530', city: 'El Cerrito', citySlug: 'el-cerrito', neighborhoods: ['El Cerrito Plaza', 'Cerrito Vista'], tier: 'A', yardId: 'oakland' },
  { zip: '94706', city: 'Albany', citySlug: 'albany', neighborhoods: ['Albany Hill', 'Solano Avenue'], tier: 'A', yardId: 'oakland' },
  { zip: '94580', city: 'San Lorenzo', citySlug: 'san-lorenzo', neighborhoods: ['San Lorenzo Village', 'Ashland'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier B — Fremont / Union City / Newark / Tri-Valley
  // ══════════════════════════════════════════════════
  { zip: '94536', city: 'Fremont', citySlug: 'fremont', neighborhoods: ['Centerville', 'Irvington'], tier: 'B', yardId: 'oakland' },
  { zip: '94538', city: 'Fremont', citySlug: 'fremont', neighborhoods: ['Warm Springs', 'Niles'], tier: 'B', yardId: 'oakland' },
  { zip: '94539', city: 'Fremont', citySlug: 'fremont', neighborhoods: ['Mission San Jose', 'Sunol Ridge'], tier: 'B', yardId: 'oakland' },
  { zip: '94555', city: 'Fremont', citySlug: 'fremont', neighborhoods: ['Ardenwood', 'Newark Border'], tier: 'B', yardId: 'oakland' },
  { zip: '94587', city: 'Union City', citySlug: 'union-city', neighborhoods: ['Alvarado', 'Decoto'], tier: 'B', yardId: 'oakland' },
  { zip: '94560', city: 'Newark', citySlug: 'newark', neighborhoods: ['Old Town Newark', 'Cedar Boulevard'], tier: 'B', yardId: 'oakland' },
  { zip: '94568', city: 'Dublin', citySlug: 'dublin', neighborhoods: ['Dublin Ranch', 'Downtown Dublin'], tier: 'B', yardId: 'oakland' },
  { zip: '94566', city: 'Pleasanton', citySlug: 'pleasanton', neighborhoods: ['Downtown Pleasanton', 'Bernal'], tier: 'B', yardId: 'oakland' },
  { zip: '94588', city: 'Pleasanton', citySlug: 'pleasanton', neighborhoods: ['Ruby Hill', 'Hacienda'], tier: 'B', yardId: 'oakland' },
  { zip: '94550', city: 'Livermore', citySlug: 'livermore', neighborhoods: ['Downtown Livermore', 'Sunset West'], tier: 'B', yardId: 'oakland' },
  { zip: '94551', city: 'Livermore', citySlug: 'livermore', neighborhoods: ['South Livermore', 'Wine Country'], tier: 'B', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier B — Contra Costa
  // ══════════════════════════════════════════════════
  { zip: '94596', city: 'Walnut Creek', citySlug: 'walnut-creek', neighborhoods: ['Downtown Walnut Creek', 'Broadway Plaza'], tier: 'B', yardId: 'oakland' },
  { zip: '94597', city: 'Walnut Creek', citySlug: 'walnut-creek', neighborhoods: ['Northgate', 'Rossmoor'], tier: 'B', yardId: 'oakland' },
  { zip: '94598', city: 'Walnut Creek', citySlug: 'walnut-creek', neighborhoods: ['Shell Ridge', 'Tice Valley'], tier: 'B', yardId: 'oakland' },
  { zip: '94518', city: 'Concord', citySlug: 'concord', neighborhoods: ['Downtown Concord', 'Clayton Valley'], tier: 'B', yardId: 'oakland' },
  { zip: '94519', city: 'Concord', citySlug: 'concord', neighborhoods: ['Cowell', 'Lime Ridge'], tier: 'B', yardId: 'oakland' },
  { zip: '94520', city: 'Concord', citySlug: 'concord', neighborhoods: ['Todos Santos', 'Monument'], tier: 'B', yardId: 'oakland' },
  { zip: '94521', city: 'Concord', citySlug: 'concord', neighborhoods: ['Dana Estates', 'Ygnacio Valley'], tier: 'B', yardId: 'oakland' },
  { zip: '94582', city: 'San Ramon', citySlug: 'san-ramon', neighborhoods: ['Dougherty Valley', 'Canyon Lakes'], tier: 'B', yardId: 'oakland' },
  { zip: '94583', city: 'San Ramon', citySlug: 'san-ramon', neighborhoods: ['Downtown San Ramon', 'Crow Canyon'], tier: 'B', yardId: 'oakland' },
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

export function getZipsByCitySlug(citySlug: string): string[] {
  return SEO_ZIP_DATA.filter(z => z.citySlug === citySlug).map(z => z.zip);
}
