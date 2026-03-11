import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { getCountyBySlug } from '@/lib/seo-counties';
import { cityUrl } from '@/lib/seo-urls';
import type { SeoCity } from '@/lib/seo-engine';
import { ArrowRight, MapPin, Phone, Truck } from 'lucide-react';
import NotFound from '../NotFound';

export default function SeoCountyPage() {
  const { countySlug } = useParams<{ countySlug: string }>();
  const county = getCountyBySlug(countySlug || '');

  const { data: cities, isLoading } = useQuery({
    queryKey: ['seo-county-cities', county?.majorCities],
    queryFn: async () => {
      if (!county) return [];
      const { data } = await supabase
        .from('seo_cities')
        .select('*')
        .in('city_slug', county.majorCities)
        .eq('is_active', true)
        .order('city_name');
      return (data || []) as SeoCity[];
    },
    enabled: !!county,
  });

  if (!county) return <NotFound />;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const pageTitle = `Dumpster Rental in ${county.name}, CA`;
  const pageDescription = county.description;
  const canonical = `/county/${county.slug}/dumpster-rental`;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Service Areas', url: '/areas' },
    { name: county.name, url: canonical },
  ]);

  const faqs = [
    { question: `What dumpster sizes are available in ${county.name}?`, answer: `We offer 5, 8, 10, 20, 30, 40, and 50 yard roll-off dumpsters throughout ${county.name}. Heavy material containers (5, 8, 10 yard) are also available.` },
    { question: `How fast can you deliver a dumpster in ${county.name}?`, answer: `Same-day delivery is available for most ${county.name} addresses based on scheduling and inventory.` },
    { question: `Do I need a permit for a dumpster in ${county.name}?`, answer: `Dumpsters on private property typically do not need permits. Street placement requirements vary by city within ${county.name}.` },
    { question: `Which cities in ${county.name} do you serve?`, answer: `We serve all cities in ${county.name} including ${county.majorCities.map(s => s.replace(/-/g, ' ')).join(', ')}.` },
  ];

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={canonical}
        schema={[breadcrumbSchema, generateFAQSchema(faqs)]}
      />

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-3" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-primary-foreground">Home</Link>
              <span>/</span>
              <Link to="/areas" className="hover:text-primary-foreground">Service Areas</Link>
              <span>/</span>
              <span className="text-primary-foreground">{county.name}</span>
            </nav>
            <h1 className="heading-xl mb-4">Dumpster Rental in {county.name}, California</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">{county.description}</p>
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

      {/* Cities in County */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Cities We Serve in {county.name}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(cities || []).map(city => (
              <Link key={city.city_slug} to={cityUrl(city.city_slug)}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{city.city_name}, CA</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{city.local_intro || `Professional dumpster rental in ${city.city_name}.`}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Dumpster Sizes Available in {county.name}</h2>
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
          <h2 className="heading-lg text-foreground mb-8 text-center">Frequently Asked Questions — {county.name}</h2>
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
          <h2 className="heading-lg mb-4">Ready to Rent a Dumpster in {county.name}?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Get an instant quote or call us now.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}><Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}</a>
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
            <Link to="/quote" className="text-primary hover:underline">Get Quote</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
