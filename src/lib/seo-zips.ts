// SEO ZIP Pages — Data and utilities for ZIP-targeted landing pages

export interface SeoZipData {
  zip: string;
  city: string;
  citySlug: string;
  neighborhoods: string[];
  tier: 'A' | 'B' | 'C';
  yardId: string;
}

// Priority ZIPs for SEO deployment — 300+ ZIP codes
export const SEO_ZIP_DATA: SeoZipData[] = [
  // ══════════════════════════════════════════════════
  // Tier A — Oakland Core (14 ZIPs)
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
  // Tier A — Berkeley (8 ZIPs)
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
  // Tier A — Alameda (2 ZIPs)
  // ══════════════════════════════════════════════════
  { zip: '94501', city: 'Alameda', citySlug: 'alameda', neighborhoods: ['Central Alameda', 'Gold Coast', 'East End'], tier: 'A', yardId: 'oakland' },
  { zip: '94502', city: 'Alameda', citySlug: 'alameda', neighborhoods: ['Bay Farm Island', 'Harbor Bay'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier A — San Leandro (3 ZIPs)
  // ══════════════════════════════════════════════════
  { zip: '94577', city: 'San Leandro', citySlug: 'san-leandro', neighborhoods: ['Downtown San Leandro', 'Estudillo Estates'], tier: 'A', yardId: 'oakland' },
  { zip: '94578', city: 'San Leandro', citySlug: 'san-leandro', neighborhoods: ['Washington Manor', 'Floresta Gardens'], tier: 'A', yardId: 'oakland' },
  { zip: '94579', city: 'San Leandro', citySlug: 'san-leandro', neighborhoods: ['Marina', 'Bay-O-Vista'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier A — Hayward (3 ZIPs)
  // ══════════════════════════════════════════════════
  { zip: '94541', city: 'Hayward', citySlug: 'hayward', neighborhoods: ['Downtown Hayward', 'Tennyson'], tier: 'A', yardId: 'oakland' },
  { zip: '94544', city: 'Hayward', citySlug: 'hayward', neighborhoods: ['South Hayward', 'Five Canyons'], tier: 'A', yardId: 'oakland' },
  { zip: '94545', city: 'Hayward', citySlug: 'hayward', neighborhoods: ['Industrial Hayward', 'West Hayward'], tier: 'A', yardId: 'oakland' },
  { zip: '94542', city: 'Hayward', citySlug: 'hayward', neighborhoods: ['Hayward Hills', 'East Hayward'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier A — Richmond / El Cerrito / San Pablo (5 ZIPs)
  // ══════════════════════════════════════════════════
  { zip: '94801', city: 'Richmond', citySlug: 'richmond', neighborhoods: ['Iron Triangle', 'Point Richmond'], tier: 'A', yardId: 'oakland' },
  { zip: '94804', city: 'Richmond', citySlug: 'richmond', neighborhoods: ['Hilltop', 'El Sobrante'], tier: 'A', yardId: 'oakland' },
  { zip: '94805', city: 'Richmond', citySlug: 'richmond', neighborhoods: ['El Cerrito Hills', 'Mira Vista'], tier: 'A', yardId: 'oakland' },
  { zip: '94806', city: 'Richmond', citySlug: 'richmond', neighborhoods: ['San Pablo', 'Pinole'], tier: 'A', yardId: 'oakland' },
  { zip: '94803', city: 'Richmond', citySlug: 'richmond', neighborhoods: ['El Sobrante', 'Tara Hills'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier A — Castro Valley / El Cerrito / Albany / San Lorenzo
  // ══════════════════════════════════════════════════
  { zip: '94546', city: 'Castro Valley', citySlug: 'castro-valley', neighborhoods: ['Castro Valley Center', 'Five Canyons'], tier: 'A', yardId: 'oakland' },
  { zip: '94552', city: 'Castro Valley', citySlug: 'castro-valley', neighborhoods: ['Cull Canyon', 'Jensen Ranch'], tier: 'A', yardId: 'oakland' },
  { zip: '94530', city: 'El Cerrito', citySlug: 'el-cerrito', neighborhoods: ['El Cerrito Plaza', 'Cerrito Vista'], tier: 'A', yardId: 'oakland' },
  { zip: '94706', city: 'Albany', citySlug: 'albany', neighborhoods: ['Albany Hill', 'Solano Avenue'], tier: 'A', yardId: 'oakland' },
  { zip: '94580', city: 'San Lorenzo', citySlug: 'san-lorenzo', neighborhoods: ['San Lorenzo Village', 'Ashland'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier A — San Jose Core (20 ZIPs)
  // ══════════════════════════════════════════════════
  { zip: '95110', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Downtown San Jose', 'Japantown'], tier: 'A', yardId: 'sanjose' },
  { zip: '95112', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Naglee Park', 'Horace Mann'], tier: 'A', yardId: 'sanjose' },
  { zip: '95113', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Downtown Core', 'SoFA District'], tier: 'A', yardId: 'sanjose' },
  { zip: '95116', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['East San Jose', 'Five Wounds'], tier: 'A', yardId: 'sanjose' },
  { zip: '95117', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Campbell Gate', 'West San Jose'], tier: 'A', yardId: 'sanjose' },
  { zip: '95118', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Cambrian Park', 'Branham'], tier: 'A', yardId: 'sanjose' },
  { zip: '95119', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Blossom Valley', 'Santa Teresa'], tier: 'A', yardId: 'sanjose' },
  { zip: '95120', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Almaden Valley', 'New Almaden'], tier: 'A', yardId: 'sanjose' },
  { zip: '95121', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Evergreen', 'Silver Creek'], tier: 'A', yardId: 'sanjose' },
  { zip: '95122', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['East Side', 'Tully'], tier: 'A', yardId: 'sanjose' },
  { zip: '95123', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Blossom Valley', 'Vista Park'], tier: 'A', yardId: 'sanjose' },
  { zip: '95124', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Cambrian', 'Willow Glen South'], tier: 'A', yardId: 'sanjose' },
  { zip: '95125', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Willow Glen', 'Rose Garden'], tier: 'A', yardId: 'sanjose' },
  { zip: '95126', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['The Alameda', 'Shasta Hanchett'], tier: 'A', yardId: 'sanjose' },
  { zip: '95127', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['East Foothills', 'Alum Rock'], tier: 'A', yardId: 'sanjose' },
  { zip: '95128', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['West San Jose', 'Valley Fair'], tier: 'A', yardId: 'sanjose' },
  { zip: '95129', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['West San Jose', 'Lynbrook'], tier: 'A', yardId: 'sanjose' },
  { zip: '95130', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['West San Jose', 'Saratoga Border'], tier: 'A', yardId: 'sanjose' },
  { zip: '95131', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['North San Jose', 'Berryessa'], tier: 'A', yardId: 'sanjose' },
  { zip: '95132', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Berryessa', 'Piedmont Hills'], tier: 'A', yardId: 'sanjose' },
  { zip: '95133', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Alviso', 'North San Jose'], tier: 'A', yardId: 'sanjose' },
  { zip: '95134', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['North San Jose', 'Rincon de los Esteros'], tier: 'A', yardId: 'sanjose' },
  { zip: '95135', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Evergreen', 'Ruby Hill'], tier: 'A', yardId: 'sanjose' },
  { zip: '95136', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Snell', 'Blossom Valley'], tier: 'A', yardId: 'sanjose' },
  { zip: '95138', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['South San Jose', 'Edenvale'], tier: 'A', yardId: 'sanjose' },
  { zip: '95139', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Santa Teresa', 'IBM'], tier: 'A', yardId: 'sanjose' },
  { zip: '95148', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Evergreen', 'Fowler Creek'], tier: 'A', yardId: 'sanjose' },
  { zip: '95111', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Coyote', 'South San Jose'], tier: 'A', yardId: 'sanjose' },
  { zip: '95114', city: 'San Jose', citySlug: 'san-jose', neighborhoods: ['Downtown San Jose'], tier: 'A', yardId: 'sanjose' },

  // ══════════════════════════════════════════════════
  // Tier A — San Francisco (15 ZIPs)
  // ══════════════════════════════════════════════════
  { zip: '94102', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Tenderloin', 'Civic Center', 'Hayes Valley'], tier: 'A', yardId: 'oakland' },
  { zip: '94103', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['SoMa', 'South of Market'], tier: 'A', yardId: 'oakland' },
  { zip: '94107', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Potrero Hill', 'Dogpatch', 'Mission Bay'], tier: 'A', yardId: 'oakland' },
  { zip: '94108', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Chinatown', 'Financial District'], tier: 'A', yardId: 'oakland' },
  { zip: '94109', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Russian Hill', 'Nob Hill', 'Polk Gulch'], tier: 'A', yardId: 'oakland' },
  { zip: '94110', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Mission District', 'Bernal Heights'], tier: 'A', yardId: 'oakland' },
  { zip: '94112', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Outer Mission', 'Ingleside', 'Excelsior'], tier: 'A', yardId: 'oakland' },
  { zip: '94114', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Castro', 'Noe Valley', 'Dolores Heights'], tier: 'A', yardId: 'oakland' },
  { zip: '94115', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Western Addition', 'Pacific Heights'], tier: 'A', yardId: 'oakland' },
  { zip: '94116', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Sunset District', 'Parkside'], tier: 'A', yardId: 'oakland' },
  { zip: '94117', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Haight-Ashbury', 'Cole Valley'], tier: 'A', yardId: 'oakland' },
  { zip: '94118', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Inner Richmond', 'Lone Mountain'], tier: 'A', yardId: 'oakland' },
  { zip: '94121', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Outer Richmond', 'Sea Cliff'], tier: 'A', yardId: 'oakland' },
  { zip: '94122', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Inner Sunset', 'Golden Gate Heights'], tier: 'A', yardId: 'oakland' },
  { zip: '94124', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Bayview', 'Hunters Point'], tier: 'A', yardId: 'oakland' },
  { zip: '94127', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['St. Francis Wood', 'West Portal'], tier: 'A', yardId: 'oakland' },
  { zip: '94131', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Glen Park', 'Diamond Heights'], tier: 'A', yardId: 'oakland' },
  { zip: '94132', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Lake Merced', 'Stonestown'], tier: 'A', yardId: 'oakland' },
  { zip: '94133', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['North Beach', 'Telegraph Hill'], tier: 'A', yardId: 'oakland' },
  { zip: '94134', city: 'San Francisco', citySlug: 'san-francisco', neighborhoods: ['Visitacion Valley', 'Sunnydale'], tier: 'A', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier B — Fremont / Union City / Newark
  // ══════════════════════════════════════════════════
  { zip: '94536', city: 'Fremont', citySlug: 'fremont', neighborhoods: ['Centerville', 'Irvington'], tier: 'B', yardId: 'oakland' },
  { zip: '94538', city: 'Fremont', citySlug: 'fremont', neighborhoods: ['Warm Springs', 'Niles'], tier: 'B', yardId: 'oakland' },
  { zip: '94539', city: 'Fremont', citySlug: 'fremont', neighborhoods: ['Mission San Jose', 'Sunol Ridge'], tier: 'B', yardId: 'oakland' },
  { zip: '94555', city: 'Fremont', citySlug: 'fremont', neighborhoods: ['Ardenwood', 'Newark Border'], tier: 'B', yardId: 'oakland' },
  { zip: '94537', city: 'Fremont', citySlug: 'fremont', neighborhoods: ['Warm Springs South', 'Irvington'], tier: 'B', yardId: 'oakland' },
  { zip: '94587', city: 'Union City', citySlug: 'union-city', neighborhoods: ['Alvarado', 'Decoto'], tier: 'B', yardId: 'oakland' },
  { zip: '94560', city: 'Newark', citySlug: 'newark', neighborhoods: ['Old Town Newark', 'Cedar Boulevard'], tier: 'B', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier B — Tri-Valley
  // ══════════════════════════════════════════════════
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
  { zip: '94506', city: 'Danville', citySlug: 'danville', neighborhoods: ['Downtown Danville', 'Tassajara'], tier: 'B', yardId: 'oakland' },
  { zip: '94526', city: 'Danville', citySlug: 'danville', neighborhoods: ['Alamo', 'Diablo'], tier: 'B', yardId: 'oakland' },
  { zip: '94549', city: 'Lafayette', citySlug: 'lafayette', neighborhoods: ['Downtown Lafayette', 'Happy Valley'], tier: 'B', yardId: 'oakland' },
  { zip: '94563', city: 'Orinda', citySlug: 'orinda', neighborhoods: ['Downtown Orinda', 'Orinda Village'], tier: 'B', yardId: 'oakland' },
  { zip: '94556', city: 'Moraga', citySlug: 'moraga', neighborhoods: ['Moraga Center', 'Rheem Valley'], tier: 'B', yardId: 'oakland' },
  { zip: '94553', city: 'Martinez', citySlug: 'martinez', neighborhoods: ['Downtown Martinez', 'Alhambra Valley'], tier: 'B', yardId: 'oakland' },
  { zip: '94523', city: 'Pleasant Hill', citySlug: 'pleasant-hill', neighborhoods: ['Downtown Pleasant Hill', 'Gregory Gardens'], tier: 'B', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier B — Antioch / Pittsburg / Brentwood
  // ══════════════════════════════════════════════════
  { zip: '94509', city: 'Antioch', citySlug: 'antioch', neighborhoods: ['Downtown Antioch', 'Somersville'], tier: 'B', yardId: 'oakland' },
  { zip: '94531', city: 'Antioch', citySlug: 'antioch', neighborhoods: ['East Antioch', 'Sand Creek'], tier: 'B', yardId: 'oakland' },
  { zip: '94565', city: 'Pittsburg', citySlug: 'pittsburg', neighborhoods: ['Downtown Pittsburg', 'Bay Point'], tier: 'B', yardId: 'oakland' },
  { zip: '94513', city: 'Brentwood', citySlug: 'brentwood', neighborhoods: ['Downtown Brentwood', 'Shadow Lakes'], tier: 'B', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier B — Pinole / Hercules / El Cerrito
  // ══════════════════════════════════════════════════
  { zip: '94564', city: 'Pinole', citySlug: 'pinole', neighborhoods: ['Downtown Pinole', 'Appian Way'], tier: 'B', yardId: 'oakland' },
  { zip: '94547', city: 'Hercules', citySlug: 'hercules', neighborhoods: ['Downtown Hercules', 'Refugio Valley'], tier: 'B', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier B — Santa Clara / Sunnyvale / Mountain View / Cupertino
  // ══════════════════════════════════════════════════
  { zip: '95050', city: 'Santa Clara', citySlug: 'santa-clara', neighborhoods: ['Downtown Santa Clara', 'Old Quad'], tier: 'B', yardId: 'sanjose' },
  { zip: '95051', city: 'Santa Clara', citySlug: 'santa-clara', neighborhoods: ['West Santa Clara', 'Agnew'], tier: 'B', yardId: 'sanjose' },
  { zip: '95054', city: 'Santa Clara', citySlug: 'santa-clara', neighborhoods: ['North Santa Clara', 'Mission College'], tier: 'B', yardId: 'sanjose' },
  { zip: '94085', city: 'Sunnyvale', citySlug: 'sunnyvale', neighborhoods: ['Downtown Sunnyvale', 'Murphy Station'], tier: 'B', yardId: 'sanjose' },
  { zip: '94086', city: 'Sunnyvale', citySlug: 'sunnyvale', neighborhoods: ['Central Sunnyvale', 'Heritage District'], tier: 'B', yardId: 'sanjose' },
  { zip: '94087', city: 'Sunnyvale', citySlug: 'sunnyvale', neighborhoods: ['West Sunnyvale', 'Cupertino Border'], tier: 'B', yardId: 'sanjose' },
  { zip: '94089', city: 'Sunnyvale', citySlug: 'sunnyvale', neighborhoods: ['North Sunnyvale', 'Moffett Park'], tier: 'B', yardId: 'sanjose' },
  { zip: '94040', city: 'Mountain View', citySlug: 'mountain-view', neighborhoods: ['Downtown Mountain View', 'Old Mountain View'], tier: 'B', yardId: 'sanjose' },
  { zip: '94041', city: 'Mountain View', citySlug: 'mountain-view', neighborhoods: ['Blossom Valley', 'Monta Loma'], tier: 'B', yardId: 'sanjose' },
  { zip: '94043', city: 'Mountain View', citySlug: 'mountain-view', neighborhoods: ['North Bayshore', 'Whisman'], tier: 'B', yardId: 'sanjose' },
  { zip: '95014', city: 'Cupertino', citySlug: 'cupertino', neighborhoods: ['Downtown Cupertino', 'Rancho Rinconada'], tier: 'B', yardId: 'sanjose' },

  // ══════════════════════════════════════════════════
  // Tier B — Milpitas / Campbell / Los Gatos
  // ══════════════════════════════════════════════════
  { zip: '95035', city: 'Milpitas', citySlug: 'milpitas', neighborhoods: ['Downtown Milpitas', 'Calaveras Hills'], tier: 'B', yardId: 'sanjose' },
  { zip: '95036', city: 'Milpitas', citySlug: 'milpitas', neighborhoods: ['South Milpitas', 'McCarthy Ranch'], tier: 'B', yardId: 'sanjose' },
  { zip: '95008', city: 'Campbell', citySlug: 'campbell', neighborhoods: ['Downtown Campbell', 'Pruneyard'], tier: 'B', yardId: 'sanjose' },
  { zip: '95009', city: 'Campbell', citySlug: 'campbell', neighborhoods: ['West Campbell', 'Hamilton'], tier: 'B', yardId: 'sanjose' },
  { zip: '95030', city: 'Los Gatos', citySlug: 'los-gatos', neighborhoods: ['Downtown Los Gatos', 'Blossom Manor'], tier: 'B', yardId: 'sanjose' },
  { zip: '95032', city: 'Los Gatos', citySlug: 'los-gatos', neighborhoods: ['Shannon Hills', 'Belgatos'], tier: 'B', yardId: 'sanjose' },

  // ══════════════════════════════════════════════════
  // Tier B — Palo Alto / Menlo Park / Redwood City
  // ══════════════════════════════════════════════════
  { zip: '94301', city: 'Palo Alto', citySlug: 'palo-alto', neighborhoods: ['Downtown Palo Alto', 'Crescent Park'], tier: 'B', yardId: 'sanjose' },
  { zip: '94303', city: 'Palo Alto', citySlug: 'palo-alto', neighborhoods: ['East Palo Alto', 'Midtown'], tier: 'B', yardId: 'sanjose' },
  { zip: '94304', city: 'Palo Alto', citySlug: 'palo-alto', neighborhoods: ['Stanford', 'Barron Park'], tier: 'B', yardId: 'sanjose' },
  { zip: '94306', city: 'Palo Alto', citySlug: 'palo-alto', neighborhoods: ['South Palo Alto', 'Charleston Meadows'], tier: 'B', yardId: 'sanjose' },
  { zip: '94025', city: 'Menlo Park', citySlug: 'menlo-park', neighborhoods: ['Downtown Menlo Park', 'Allied Arts'], tier: 'B', yardId: 'sanjose' },
  { zip: '94027', city: 'Atherton', citySlug: 'atherton', neighborhoods: ['Atherton', 'Lindenwood'], tier: 'B', yardId: 'sanjose' },
  { zip: '94061', city: 'Redwood City', citySlug: 'redwood-city', neighborhoods: ['Downtown Redwood City', 'Redwood Oaks'], tier: 'B', yardId: 'sanjose' },
  { zip: '94062', city: 'Redwood City', citySlug: 'redwood-city', neighborhoods: ['Woodside', 'Emerald Hills'], tier: 'B', yardId: 'sanjose' },
  { zip: '94063', city: 'Redwood City', citySlug: 'redwood-city', neighborhoods: ['Friendly Acres', 'Stambaugh Heller'], tier: 'B', yardId: 'sanjose' },
  { zip: '94065', city: 'Redwood City', citySlug: 'redwood-city', neighborhoods: ['Redwood Shores', 'Marina'], tier: 'B', yardId: 'sanjose' },

  // ══════════════════════════════════════════════════
  // Tier B — San Mateo / South SF / San Bruno / Pacifica
  // ══════════════════════════════════════════════════
  { zip: '94401', city: 'San Mateo', citySlug: 'san-mateo', neighborhoods: ['Downtown San Mateo', 'North Central'], tier: 'B', yardId: 'sanjose' },
  { zip: '94402', city: 'San Mateo', citySlug: 'san-mateo', neighborhoods: ['Hillsdale', 'Aragon'], tier: 'B', yardId: 'sanjose' },
  { zip: '94403', city: 'San Mateo', citySlug: 'san-mateo', neighborhoods: ['San Mateo Park', 'Beresford'], tier: 'B', yardId: 'sanjose' },
  { zip: '94404', city: 'San Mateo', citySlug: 'san-mateo', neighborhoods: ['Foster City', 'Bay Meadows'], tier: 'B', yardId: 'sanjose' },
  { zip: '94080', city: 'South San Francisco', citySlug: 'south-san-francisco', neighborhoods: ['Downtown SSF', 'Westborough'], tier: 'B', yardId: 'oakland' },
  { zip: '94066', city: 'San Bruno', citySlug: 'san-bruno', neighborhoods: ['Downtown San Bruno', 'Tanforan'], tier: 'B', yardId: 'oakland' },
  { zip: '94044', city: 'Pacifica', citySlug: 'pacifica', neighborhoods: ['Linda Mar', 'Rockaway Beach'], tier: 'B', yardId: 'oakland' },
  { zip: '94019', city: 'Half Moon Bay', citySlug: 'half-moon-bay', neighborhoods: ['Downtown HMB', 'Miramar'], tier: 'B', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier B — San Rafael / Vallejo / Napa
  // ══════════════════════════════════════════════════
  { zip: '94901', city: 'San Rafael', citySlug: 'san-rafael', neighborhoods: ['Downtown San Rafael', 'Canal District'], tier: 'B', yardId: 'oakland' },
  { zip: '94903', city: 'San Rafael', citySlug: 'san-rafael', neighborhoods: ['Terra Linda', 'Lucas Valley'], tier: 'B', yardId: 'oakland' },
  { zip: '94904', city: 'San Rafael', citySlug: 'san-rafael', neighborhoods: ['Kentfield', 'Greenbrae'], tier: 'B', yardId: 'oakland' },
  { zip: '94590', city: 'Vallejo', citySlug: 'vallejo', neighborhoods: ['Downtown Vallejo', 'Mare Island'], tier: 'B', yardId: 'oakland' },
  { zip: '94591', city: 'Vallejo', citySlug: 'vallejo', neighborhoods: ['Glen Cove', 'Hiddenbrooke'], tier: 'B', yardId: 'oakland' },
  { zip: '94589', city: 'Vallejo', citySlug: 'vallejo', neighborhoods: ['North Vallejo', 'Springs'], tier: 'B', yardId: 'oakland' },
  { zip: '94558', city: 'Napa', citySlug: 'napa', neighborhoods: ['Downtown Napa', 'Old Town'], tier: 'B', yardId: 'oakland' },
  { zip: '94559', city: 'Napa', citySlug: 'napa', neighborhoods: ['Browns Valley', 'Silverado'], tier: 'B', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier B — Morgan Hill / Gilroy
  // ══════════════════════════════════════════════════
  { zip: '95037', city: 'Morgan Hill', citySlug: 'morgan-hill', neighborhoods: ['Downtown Morgan Hill', 'Holiday Lake'], tier: 'B', yardId: 'sanjose' },
  { zip: '95038', city: 'Morgan Hill', citySlug: 'morgan-hill', neighborhoods: ['South Morgan Hill', 'El Toro'], tier: 'B', yardId: 'sanjose' },
  { zip: '95020', city: 'Gilroy', citySlug: 'gilroy', neighborhoods: ['Downtown Gilroy', 'Eagle Ridge'], tier: 'B', yardId: 'sanjose' },

  // ══════════════════════════════════════════════════
  // Tier C — Extended East Bay
  // ══════════════════════════════════════════════════
  { zip: '94507', city: 'Alamo', citySlug: 'danville', neighborhoods: ['Alamo', 'Stone Valley'], tier: 'C', yardId: 'oakland' },
  { zip: '94517', city: 'Clayton', citySlug: 'concord', neighborhoods: ['Clayton', 'Oakhurst'], tier: 'C', yardId: 'oakland' },
  { zip: '94548', city: 'Knightsen', citySlug: 'brentwood', neighborhoods: ['Knightsen', 'Bethel Island'], tier: 'C', yardId: 'oakland' },
  { zip: '94514', city: 'Byron', citySlug: 'brentwood', neighborhoods: ['Byron', 'Discovery Bay'], tier: 'C', yardId: 'oakland' },
  { zip: '94505', city: 'Discovery Bay', citySlug: 'brentwood', neighborhoods: ['Discovery Bay', 'Byron'], tier: 'C', yardId: 'oakland' },
  { zip: '94516', city: 'Canyon', citySlug: 'moraga', neighborhoods: ['Canyon', 'Redwood Canyon'], tier: 'C', yardId: 'oakland' },
  { zip: '94575', city: 'Moraga', citySlug: 'moraga', neighborhoods: ['St. Mary\'s College', 'Moraga Hills'], tier: 'C', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Tier C — Extended South Bay
  // ══════════════════════════════════════════════════
  { zip: '95070', city: 'Saratoga', citySlug: 'los-gatos', neighborhoods: ['Downtown Saratoga', 'Quito Village'], tier: 'C', yardId: 'sanjose' },
  { zip: '95071', city: 'Saratoga', citySlug: 'los-gatos', neighborhoods: ['West Saratoga', 'Monte Sereno'], tier: 'C', yardId: 'sanjose' },
  { zip: '94022', city: 'Los Altos', citySlug: 'mountain-view', neighborhoods: ['Downtown Los Altos', 'Loyola'], tier: 'C', yardId: 'sanjose' },
  { zip: '94024', city: 'Los Altos Hills', citySlug: 'mountain-view', neighborhoods: ['Los Altos Hills', 'Moody Road'], tier: 'C', yardId: 'sanjose' },
  { zip: '94028', city: 'Portola Valley', citySlug: 'redwood-city', neighborhoods: ['Portola Valley', 'Blue Oaks'], tier: 'C', yardId: 'sanjose' },
  { zip: '94070', city: 'San Carlos', citySlug: 'redwood-city', neighborhoods: ['Downtown San Carlos', 'White Oaks'], tier: 'C', yardId: 'sanjose' },
  { zip: '94002', city: 'Belmont', citySlug: 'san-mateo', neighborhoods: ['Downtown Belmont', 'Carlmont'], tier: 'C', yardId: 'sanjose' },
  { zip: '94010', city: 'Burlingame', citySlug: 'san-mateo', neighborhoods: ['Downtown Burlingame', 'Broadway'], tier: 'C', yardId: 'sanjose' },
  { zip: '94030', city: 'Millbrae', citySlug: 'san-mateo', neighborhoods: ['Downtown Millbrae', 'Meadows'], tier: 'C', yardId: 'sanjose' },
  { zip: '94005', city: 'Brisbane', citySlug: 'south-san-francisco', neighborhoods: ['Brisbane', 'Sierra Point'], tier: 'C', yardId: 'oakland' },
  { zip: '94014', city: 'Daly City', citySlug: 'south-san-francisco', neighborhoods: ['Daly City', 'Westlake'], tier: 'C', yardId: 'oakland' },
  { zip: '94015', city: 'Daly City', citySlug: 'south-san-francisco', neighborhoods: ['Daly City South', 'Colma'], tier: 'C', yardId: 'oakland' },
  { zip: '94038', city: 'Moss Beach', citySlug: 'half-moon-bay', neighborhoods: ['Moss Beach', 'Princeton'], tier: 'C', yardId: 'oakland' },
  { zip: '94037', city: 'Montara', citySlug: 'half-moon-bay', neighborhoods: ['Montara', 'Devils Slide'], tier: 'C', yardId: 'oakland' },


  // ══════════════════════════════════════════════════
  // Tier C — Extended Marin / Napa
  // ══════════════════════════════════════════════════
  { zip: '94920', city: 'Tiburon', citySlug: 'san-rafael', neighborhoods: ['Tiburon', 'Belvedere'], tier: 'C', yardId: 'oakland' },
  { zip: '94941', city: 'Mill Valley', citySlug: 'san-rafael', neighborhoods: ['Mill Valley', 'Tam Valley'], tier: 'C', yardId: 'oakland' },
  { zip: '94945', city: 'Novato', citySlug: 'san-rafael', neighborhoods: ['Novato', 'Ignacio'], tier: 'C', yardId: 'oakland' },
  { zip: '94947', city: 'Novato', citySlug: 'san-rafael', neighborhoods: ['North Novato', 'Hamilton'], tier: 'C', yardId: 'oakland' },
  { zip: '94949', city: 'Novato', citySlug: 'san-rafael', neighborhoods: ['South Novato', 'Bel Marin Keys'], tier: 'C', yardId: 'oakland' },
  { zip: '94925', city: 'Corte Madera', citySlug: 'san-rafael', neighborhoods: ['Corte Madera', 'Town Center'], tier: 'C', yardId: 'oakland' },
  { zip: '94939', city: 'Larkspur', citySlug: 'san-rafael', neighborhoods: ['Larkspur', 'Madrone Canyon'], tier: 'C', yardId: 'oakland' },
  { zip: '94960', city: 'San Anselmo', citySlug: 'san-rafael', neighborhoods: ['San Anselmo', 'Sleepy Hollow'], tier: 'C', yardId: 'oakland' },
  { zip: '94930', city: 'Fairfax', citySlug: 'san-rafael', neighborhoods: ['Fairfax', 'Manor'], tier: 'C', yardId: 'oakland' },
  { zip: '94503', city: 'American Canyon', citySlug: 'napa', neighborhoods: ['American Canyon', 'Watson Ranch'], tier: 'C', yardId: 'oakland' },
  { zip: '94574', city: 'St. Helena', citySlug: 'napa', neighborhoods: ['St. Helena', 'Meadowood'], tier: 'C', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Expanded — Peninsula (San Mateo County)
  // ══════════════════════════════════════════════════
  { zip: '94010', city: 'Burlingame', citySlug: 'burlingame', neighborhoods: ['Burlingame Hills', 'Easton Addition'], tier: 'B', yardId: 'sanjose' },
  { zip: '94030', city: 'Millbrae', citySlug: 'millbrae', neighborhoods: ['Millbrae Meadows', 'Mills Estates'], tier: 'B', yardId: 'sanjose' },
  { zip: '94014', city: 'Daly City', citySlug: 'daly-city', neighborhoods: ['Westlake', 'Serramonte'], tier: 'B', yardId: 'oakland' },
  { zip: '94015', city: 'Daly City', citySlug: 'daly-city', neighborhoods: ['Broadmoor', 'Colma'], tier: 'B', yardId: 'oakland' },
  { zip: '94404', city: 'Foster City', citySlug: 'foster-city', neighborhoods: ['Foster City', 'Marlin Cove'], tier: 'B', yardId: 'sanjose' },
  { zip: '94002', city: 'Belmont', citySlug: 'belmont', neighborhoods: ['Belmont', 'Sterling Downs'], tier: 'B', yardId: 'sanjose' },
  { zip: '94070', city: 'San Carlos', citySlug: 'san-carlos', neighborhoods: ['San Carlos', 'White Oaks'], tier: 'B', yardId: 'sanjose' },
  { zip: '94025', city: 'Menlo Park', citySlug: 'menlo-park', neighborhoods: ['Menlo Park', 'Sharon Heights'], tier: 'B', yardId: 'sanjose' },
  { zip: '94027', city: 'Atherton', citySlug: 'atherton', neighborhoods: ['Atherton', 'Lindenwood'], tier: 'B', yardId: 'sanjose' },
  { zip: '94062', city: 'Woodside', citySlug: 'woodside', neighborhoods: ['Woodside', 'Kings Mountain'], tier: 'B', yardId: 'sanjose' },
  { zip: '94028', city: 'Portola Valley', citySlug: 'portola-valley', neighborhoods: ['Portola Valley', 'Ladera'], tier: 'B', yardId: 'sanjose' },
  { zip: '94303', city: 'East Palo Alto', citySlug: 'east-palo-alto', neighborhoods: ['East Palo Alto', 'Belle Haven'], tier: 'B', yardId: 'sanjose' },
  { zip: '94005', city: 'Brisbane', citySlug: 'brisbane', neighborhoods: ['Brisbane', 'Sierra Point'], tier: 'B', yardId: 'oakland' },
  { zip: '94017', city: 'Daly City', citySlug: 'daly-city', neighborhoods: ['Daly City', 'Broadmoor Village'], tier: 'B', yardId: 'oakland' },
  { zip: '94066', city: 'San Bruno', citySlug: 'san-bruno', neighborhoods: ['San Bruno', 'Crestmoor'], tier: 'B', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Expanded — South Bay (Santa Clara County)
  // ══════════════════════════════════════════════════
  { zip: '95070', city: 'Saratoga', citySlug: 'saratoga', neighborhoods: ['Saratoga Village', 'Quito'], tier: 'B', yardId: 'sanjose' },
  { zip: '95030', city: 'Los Gatos', citySlug: 'los-gatos', neighborhoods: ['Los Gatos', 'Shannon'], tier: 'B', yardId: 'sanjose' },
  { zip: '95032', city: 'Los Gatos', citySlug: 'los-gatos', neighborhoods: ['Los Gatos', 'Blossom Hill'], tier: 'B', yardId: 'sanjose' },
  { zip: '95008', city: 'Campbell', citySlug: 'campbell', neighborhoods: ['Downtown Campbell', 'Pruneyard'], tier: 'B', yardId: 'sanjose' },
  { zip: '95037', city: 'Morgan Hill', citySlug: 'morgan-hill', neighborhoods: ['Morgan Hill', 'El Toro'], tier: 'B', yardId: 'sanjose' },
  { zip: '95020', city: 'Gilroy', citySlug: 'gilroy', neighborhoods: ['Downtown Gilroy', 'Gilroy Gardens'], tier: 'B', yardId: 'sanjose' },
  { zip: '95046', city: 'Monte Sereno', citySlug: 'monte-sereno', neighborhoods: ['Monte Sereno'], tier: 'B', yardId: 'sanjose' },
  { zip: '94301', city: 'Palo Alto', citySlug: 'palo-alto', neighborhoods: ['Downtown Palo Alto', 'University South'], tier: 'B', yardId: 'sanjose' },
  { zip: '94306', city: 'Palo Alto', citySlug: 'palo-alto', neighborhoods: ['South Palo Alto', 'Barron Park'], tier: 'B', yardId: 'sanjose' },
  { zip: '94304', city: 'Palo Alto', citySlug: 'palo-alto', neighborhoods: ['Stanford', 'Stanford Research Park'], tier: 'B', yardId: 'sanjose' },
  { zip: '95014', city: 'Cupertino', citySlug: 'cupertino', neighborhoods: ['Cupertino', 'Rancho Rinconada'], tier: 'B', yardId: 'sanjose' },
  { zip: '94043', city: 'Mountain View', citySlug: 'mountain-view', neighborhoods: ['Mountain View', 'North Bayshore'], tier: 'B', yardId: 'sanjose' },
  { zip: '94085', city: 'Sunnyvale', citySlug: 'sunnyvale', neighborhoods: ['Sunnyvale', 'Lakewood Village'], tier: 'B', yardId: 'sanjose' },
  { zip: '94086', city: 'Sunnyvale', citySlug: 'sunnyvale', neighborhoods: ['Sunnyvale', 'Downtown Sunnyvale'], tier: 'B', yardId: 'sanjose' },
  { zip: '94087', city: 'Sunnyvale', citySlug: 'sunnyvale', neighborhoods: ['Sunnyvale', 'Ortega Park'], tier: 'B', yardId: 'sanjose' },
  { zip: '94089', city: 'Sunnyvale', citySlug: 'sunnyvale', neighborhoods: ['Sunnyvale', 'Moffett Park'], tier: 'B', yardId: 'sanjose' },
  { zip: '95050', city: 'Santa Clara', citySlug: 'santa-clara', neighborhoods: ['Downtown Santa Clara', 'Old Quad'], tier: 'B', yardId: 'sanjose' },
  { zip: '95051', city: 'Santa Clara', citySlug: 'santa-clara', neighborhoods: ['Santa Clara', 'Scott Blvd'], tier: 'B', yardId: 'sanjose' },
  { zip: '95054', city: 'Santa Clara', citySlug: 'santa-clara', neighborhoods: ['Santa Clara', 'Great America'], tier: 'B', yardId: 'sanjose' },
  { zip: '95035', city: 'Milpitas', citySlug: 'milpitas', neighborhoods: ['Milpitas', 'Great Mall'], tier: 'B', yardId: 'sanjose' },

  // ══════════════════════════════════════════════════
  // Expanded — Contra Costa County
  // ══════════════════════════════════════════════════
  { zip: '94523', city: 'Pleasant Hill', citySlug: 'pleasant-hill', neighborhoods: ['Pleasant Hill', 'Poet\'s Corner'], tier: 'B', yardId: 'oakland' },
  { zip: '94561', city: 'Oakley', citySlug: 'oakley', neighborhoods: ['Oakley', 'Cypress Grove'], tier: 'B', yardId: 'oakland' },
  { zip: '94505', city: 'Discovery Bay', citySlug: 'discovery-bay', neighborhoods: ['Discovery Bay'], tier: 'C', yardId: 'oakland' },
  { zip: '94565', city: 'Bay Point', citySlug: 'bay-point', neighborhoods: ['Bay Point', 'Porto Vista'], tier: 'B', yardId: 'oakland' },
  { zip: '94707', city: 'Kensington', citySlug: 'kensington', neighborhoods: ['Kensington', 'Sunset View'], tier: 'A', yardId: 'oakland' },
  { zip: '94611', city: 'Piedmont', citySlug: 'piedmont', neighborhoods: ['Piedmont', 'Piedmont Pines'], tier: 'A', yardId: 'oakland' },
  { zip: '94547', city: 'Hercules', citySlug: 'hercules', neighborhoods: ['Hercules', 'New Pacific'], tier: 'B', yardId: 'oakland' },
  { zip: '94803', city: 'El Sobrante', citySlug: 'el-sobrante', neighborhoods: ['El Sobrante', 'Tara Hills'], tier: 'B', yardId: 'oakland' },
  { zip: '94517', city: 'Clayton', citySlug: 'clayton', neighborhoods: ['Clayton', 'Oakhurst'], tier: 'B', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Expanded — Marin County
  // ══════════════════════════════════════════════════
  { zip: '94901', city: 'San Rafael', citySlug: 'san-rafael', neighborhoods: ['Downtown San Rafael', 'Canal District'], tier: 'B', yardId: 'oakland' },
  { zip: '94903', city: 'San Rafael', citySlug: 'san-rafael', neighborhoods: ['Terra Linda', 'Marinwood'], tier: 'B', yardId: 'oakland' },
  { zip: '94904', city: 'San Rafael', citySlug: 'san-rafael', neighborhoods: ['Kentfield', 'Greenbrae'], tier: 'B', yardId: 'oakland' },
  { zip: '94924', city: 'Corte Madera', citySlug: 'corte-madera', neighborhoods: ['Corte Madera', 'Christmas Tree Hill'], tier: 'B', yardId: 'oakland' },
  { zip: '94937', city: 'Larkspur', citySlug: 'larkspur', neighborhoods: ['Larkspur', 'Baltimore Park'], tier: 'B', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Expanded — Solano County
  // ══════════════════════════════════════════════════
  { zip: '94510', city: 'Benicia', citySlug: 'benicia', neighborhoods: ['Downtown Benicia', 'East Side'], tier: 'B', yardId: 'oakland' },
  { zip: '94503', city: 'American Canyon', citySlug: 'american-canyon', neighborhoods: ['American Canyon', 'Napa Junction'], tier: 'B', yardId: 'oakland' },
  { zip: '94585', city: 'Suisun City', citySlug: 'suisun-city', neighborhoods: ['Suisun City', 'Lawler Ranch'], tier: 'C', yardId: 'oakland' },
  { zip: '95687', city: 'Vacaville', citySlug: 'vacaville', neighborhoods: ['Downtown Vacaville', 'Alamo Creek'], tier: 'C', yardId: 'oakland' },
  { zip: '95688', city: 'Vacaville', citySlug: 'vacaville', neighborhoods: ['Brown Valley', 'Leisure Town'], tier: 'C', yardId: 'oakland' },
  { zip: '94533', city: 'Fairfield', citySlug: 'fairfield', neighborhoods: ['Downtown Fairfield', 'Cordelia'], tier: 'C', yardId: 'oakland' },
  { zip: '94534', city: 'Fairfield', citySlug: 'fairfield', neighborhoods: ['Fairfield', 'Green Valley'], tier: 'C', yardId: 'oakland' },
  { zip: '95620', city: 'Dixon', citySlug: 'dixon', neighborhoods: ['Downtown Dixon', 'Northeast Dixon'], tier: 'C', yardId: 'oakland' },
  { zip: '94571', city: 'Rio Vista', citySlug: 'rio-vista', neighborhoods: ['Rio Vista', 'Trilogy'], tier: 'C', yardId: 'oakland' },

  // ══════════════════════════════════════════════════
  // Expanded — Additional East Bay
  // ══════════════════════════════════════════════════
  { zip: '94706', city: 'Albany', citySlug: 'albany', neighborhoods: ['Albany Village', 'Solano Avenue'], tier: 'A', yardId: 'oakland' },
  { zip: '94580', city: 'San Lorenzo', citySlug: 'san-lorenzo', neighborhoods: ['San Lorenzo Village', 'Ashland'], tier: 'A', yardId: 'oakland' },
  { zip: '94806', city: 'San Pablo', citySlug: 'san-pablo', neighborhoods: ['San Pablo', 'Rumrill'], tier: 'A', yardId: 'oakland' },

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
