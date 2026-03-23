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
  {
    slug: 'sonoma-county',
    name: 'Sonoma County',
    state: 'CA',
    majorCities: ['santa-rosa'],
    description: 'Sonoma County dumpster rental for Santa Rosa, Petaluma, and Wine Country communities.',
    population: '488K',
  },
];

export function getCountyBySlug(slug: string): SeoCounty | undefined {
  return SEO_COUNTIES.find(c => c.slug === slug);
}
