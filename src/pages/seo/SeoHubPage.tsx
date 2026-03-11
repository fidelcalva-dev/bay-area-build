import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { cityUrl } from '@/lib/seo-urls';
import { SEO_COUNTIES } from '@/lib/seo-counties';
import type { SeoCity } from '@/lib/seo-engine';
import { ArrowRight, MapPin, Phone, Truck } from 'lucide-react';
import NotFound from '../NotFound';

interface HubConfig {
  slug: string;
  title: string;
  h1: string;
  description: string;
  metaDescription: string;
  countyFilter: string[]; // county slugs to include
}

const HUB_CONFIGS: Record<string, HubConfig> = {
  'california-dumpster-rental': {
    slug: 'california-dumpster-rental',
    title: 'Dumpster Rental in California',
    h1: 'Dumpster Rental Across California',
    description: 'Calsan Dumpsters Pro serves communities across California with professional roll-off dumpster rental. From the Bay Area to Los Angeles, Sacramento to San Diego — find your local service.',
    metaDescription: 'California dumpster rental from Calsan Dumpsters Pro. 10-50 yard sizes, same-day delivery, transparent pricing. Serving the Bay Area, LA, Sacramento, and beyond.',
    countyFilter: [],
  },
  'bay-area-dumpster-rental': {
    slug: 'bay-area-dumpster-rental',
    title: 'Bay Area Dumpster Rental',
    h1: 'Bay Area Dumpster Rental',
    description: 'Calsan Dumpsters Pro serves the entire San Francisco Bay Area with local yard operations in Oakland and San Jose. Same-day delivery, transparent pricing, contractor-ready service.',
    metaDescription: 'Bay Area dumpster rental from local yards in Oakland and San Jose. 10-50 yard sizes, same-day delivery. Serving Alameda, Contra Costa, Santa Clara, San Francisco, and San Mateo counties.',
    countyFilter: ['alameda-county', 'contra-costa-county', 'santa-clara-county', 'san-francisco-county', 'san-mateo-county', 'solano-county'],
  },
  'southern-california-dumpster-rental': {
    slug: 'southern-california-dumpster-rental',
    title: 'Southern California Dumpster Rental',
    h1: 'Southern California Dumpster Rental',
    description: 'Professional dumpster rental serving Southern California including Los Angeles, San Diego, Orange County, Riverside, and San Bernardino.',
    metaDescription: 'Southern California dumpster rental. Serving LA, San Diego, Orange County, Riverside, and San Bernardino. Same-day delivery, transparent pricing.',
    countyFilter: ['los-angeles-county', 'san-diego-county', 'orange-county', 'riverside-county'],
  },
  'central-valley-dumpster-rental': {
    slug: 'central-valley-dumpster-rental',
    title: 'Central Valley Dumpster Rental',
    h1: 'Central Valley Dumpster Rental',
    description: 'Dumpster rental for California Central Valley communities including Sacramento, Stockton, Fresno, Bakersfield, and Modesto.',
    metaDescription: 'Central Valley dumpster rental serving Sacramento, Stockton, Fresno, Bakersfield, and Modesto. Transparent pricing, same-day delivery available.',
    countyFilter: ['sacramento-county', 'san-joaquin-county', 'fresno-county', 'kern-county', 'stanislaus-county'],
  },
};

export default function SeoHubPage() {
  const location = useLocation();
  const path = location.pathname.replace(/^\//, '');
  const config = HUB_CONFIGS[path];

  const { data: allCities, isLoading } = useQuery({
    queryKey: ['seo-hub-cities'],
    queryFn: async () => {
      const { data } = await supabase.from('seo_cities').select('*').eq('is_active', true).order('city_name');
      return (data || []) as SeoCity[];
    },
    enabled: !!config,
  });

  if (!config) return <NotFound />;

  // Filter cities by county
  const relevantCounties = config.countyFilter.length > 0
    ? SEO_COUNTIES.filter(c => config.countyFilter.includes(c.slug))
    : SEO_COUNTIES;

  const relevantCitySlugs = new Set(relevantCounties.flatMap(c => c.majorCities));
  const cities = config.countyFilter.length > 0
    ? (allCities || []).filter(c => relevantCitySlugs.has(c.city_slug))
    : (allCities || []);

  const canonical = `/${config.slug}`;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: config.title, url: canonical },
  ]);

  const faqs = [
    { question: `What dumpster sizes do you offer?`, answer: 'We offer 5, 8, 10, 20, 30, 40, and 50 yard roll-off dumpsters. Heavy material containers are available in 5, 8, and 10 yard sizes.' },
    { question: `How much does dumpster rental cost?`, answer: 'Pricing depends on dumpster size, material type, and delivery location. Enter your ZIP code for instant, transparent pricing with no hidden fees.' },
    { question: `Do you offer same-day delivery?`, answer: 'Same-day delivery is available for most addresses based on scheduling and inventory. Next-day delivery is standard.' },
    { question: `Do you serve contractors?`, answer: 'Yes. We offer contractor accounts with volume pricing, priority scheduling, and Net-30 terms for qualified businesses.' },
  ];

  return (
    <Layout title={config.h1} description={config.metaDescription}>
      <SEOHead
        title={config.h1}
        description={config.metaDescription}
        canonical={canonical}
        schema={[breadcrumbSchema, generateFAQSchema(faqs)]}
      />

      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">{config.h1}</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">{config.description}</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="cta" size="lg">
                <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                  <Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* County sections */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Service Areas</h2>
          <div className="space-y-8">
            {relevantCounties.map(county => {
              const countyCities = (allCities || []).filter(c => county.majorCities.includes(c.city_slug));
              if (countyCities.length === 0) return null;
              return (
                <div key={county.slug}>
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="heading-md text-foreground">
                      <Link to={`/county/${county.slug}/dumpster-rental`} className="hover:text-primary transition-colors">
                        {county.name}
                      </Link>
                    </h3>
                    {county.population && <span className="text-sm text-muted-foreground">({county.population} residents)</span>}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {countyCities.map(city => (
                      <Link key={city.city_slug} to={cityUrl(city.city_slug)}
                        className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                        {city.city_name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Dumpster Sizes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {DUMPSTER_SIZES_DATA.map(size => (
              <div key={size.yards} className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-foreground">{size.yards}</div>
                <div className="text-xs text-muted-foreground mb-2">YARD</div>
                <div className="text-sm font-semibold text-primary">From ${size.priceFrom}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-card border border-border rounded-xl overflow-hidden group">
                <summary className="p-5 cursor-pointer font-semibold text-foreground hover:bg-muted/30 transition-colors list-none flex items-center justify-between">
                  {faq.question}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-muted-foreground">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Get Your Dumpster Price Now</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Transparent pricing. No hidden fees. Same-day delivery available.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-8 bg-muted/30 border-t border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/sizes" className="text-primary hover:underline">All Dumpster Sizes</Link>
            <Link to="/materials" className="text-primary hover:underline">Materials Guide</Link>
            <Link to="/pricing" className="text-primary hover:underline">Pricing</Link>
            <Link to="/contractors" className="text-primary hover:underline">Contractor Service</Link>
            <Link to="/areas" className="text-primary hover:underline">All Service Areas</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
