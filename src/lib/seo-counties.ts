// SEO County Data — Counties for county hub pages

export interface SeoCounty {
  slug: string;
  name: string;
  state: string;
  majorCities: string[]; // city slugs
  description: string;
  population?: string;
}

export const SEO_COUNTIES: SeoCounty[] = [
  {
    slug: 'alameda-county',
    name: 'Alameda County',
    state: 'CA',
    majorCities: ['oakland', 'berkeley', 'fremont', 'hayward', 'alameda', 'san-leandro', 'emeryville', 'livermore', 'pleasanton', 'dublin'],
    description: 'Alameda County dumpster rental for Oakland, Berkeley, Fremont, Hayward, and surrounding East Bay communities. Local yard dispatch ensures fast delivery.',
    population: '1.67M',
  },
  {
    slug: 'santa-clara-county',
    name: 'Santa Clara County',
    state: 'CA',
    majorCities: ['san-jose', 'milpitas', 'palo-alto'],
    description: 'Santa Clara County dumpster rental serving San Jose, Milpitas, Palo Alto, and Silicon Valley. Contractor-ready service with same-day availability.',
    population: '1.94M',
  },
  {
    slug: 'contra-costa-county',
    name: 'Contra Costa County',
    state: 'CA',
    majorCities: ['walnut-creek', 'concord', 'richmond'],
    description: 'Contra Costa County dumpster rental for Walnut Creek, Concord, Richmond, and surrounding communities.',
    population: '1.16M',
  },
  {
    slug: 'san-francisco-county',
    name: 'San Francisco County',
    state: 'CA',
    majorCities: ['san-francisco'],
    description: 'San Francisco dumpster rental with expert placement for tight streets, hills, and permitted street locations.',
    population: '874K',
  },
  {
    slug: 'san-mateo-county',
    name: 'San Mateo County',
    state: 'CA',
    majorCities: ['san-mateo', 'redwood-city', 'south-san-francisco', 'menlo-park'],
    description: 'San Mateo County dumpster rental serving the Peninsula from South San Francisco to Redwood City.',
    population: '764K',
  },
  {
    slug: 'solano-county',
    name: 'Solano County',
    state: 'CA',
    majorCities: ['vallejo'],
    description: 'Solano County dumpster rental for Vallejo, Fairfield, Vacaville, and surrounding areas.',
    population: '453K',
  },
  {
    slug: 'sacramento-county',
    name: 'Sacramento County',
    state: 'CA',
    majorCities: ['sacramento'],
    description: 'Sacramento County dumpster rental for the greater Sacramento area including Elk Grove, Citrus Heights, and Rancho Cordova.',
    population: '1.59M',
  },
  {
    slug: 'san-joaquin-county',
    name: 'San Joaquin County',
    state: 'CA',
    majorCities: ['stockton'],
    description: 'San Joaquin County dumpster rental serving Stockton, Tracy, Manteca, and the Northern Central Valley.',
    population: '789K',
  },
  {
    slug: 'los-angeles-county',
    name: 'Los Angeles County',
    state: 'CA',
    majorCities: ['los-angeles', 'long-beach'],
    description: 'Los Angeles County dumpster rental for LA, Long Beach, and surrounding communities. Roll-off dumpsters for construction, renovation, and cleanout projects.',
    population: '10.0M',
  },
  {
    slug: 'san-diego-county',
    name: 'San Diego County',
    state: 'CA',
    majorCities: ['san-diego'],
    description: 'San Diego County dumpster rental for residential, commercial, and construction projects throughout the region.',
    population: '3.34M',
  },
  {
    slug: 'orange-county',
    name: 'Orange County',
    state: 'CA',
    majorCities: ['anaheim'],
    description: 'Orange County dumpster rental for Anaheim, Irvine, Santa Ana, and surrounding cities.',
    population: '3.19M',
  },
  {
    slug: 'riverside-county',
    name: 'Riverside County',
    state: 'CA',
    majorCities: ['riverside'],
    description: 'Riverside County dumpster rental for the Inland Empire including Riverside, Corona, and Moreno Valley.',
    population: '2.47M',
  },
  {
    slug: 'fresno-county',
    name: 'Fresno County',
    state: 'CA',
    majorCities: ['fresno'],
    description: 'Fresno County dumpster rental for Fresno, Clovis, and the Central Valley.',
    population: '1.01M',
  },
  {
    slug: 'kern-county',
    name: 'Kern County',
    state: 'CA',
    majorCities: ['bakersfield'],
    description: 'Kern County dumpster rental for Bakersfield and surrounding communities in the Southern Central Valley.',
    population: '909K',
  },
  {
    slug: 'sonoma-county',
    name: 'Sonoma County',
    state: 'CA',
    majorCities: ['santa-rosa'],
    description: 'Sonoma County dumpster rental for Santa Rosa, Petaluma, and Wine Country communities.',
    population: '488K',
  },
  {
    slug: 'stanislaus-county',
    name: 'Stanislaus County',
    state: 'CA',
    majorCities: ['modesto'],
    description: 'Stanislaus County dumpster rental for Modesto, Turlock, and the Central Valley.',
    population: '552K',
  },
  {
    slug: 'marin-county',
    name: 'Marin County',
    state: 'CA',
    majorCities: ['san-rafael'],
    description: 'Marin County dumpster rental for San Rafael, Novato, Mill Valley, and surrounding North Bay communities.',
    population: '262K',
  },
  {
    slug: 'napa-county',
    name: 'Napa County',
    state: 'CA',
    majorCities: ['napa'],
    description: 'Napa County dumpster rental for Napa, American Canyon, and Wine Country renovation projects.',
    population: '138K',
  },
];

export function getCountyBySlug(slug: string): SeoCounty | undefined {
  return SEO_COUNTIES.find(c => c.slug === slug);
}
