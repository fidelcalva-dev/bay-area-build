import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { getUseCaseBySlug } from '@/lib/seo-use-cases';
import { cityUrl } from '@/lib/seo-urls';
import type { SeoCity } from '@/lib/seo-engine';
import { ArrowRight, CheckCircle, Phone } from 'lucide-react';
import NotFound from '../NotFound';

export default function SeoUseCasePage() {
  const { useCaseSlug } = useParams<{ useCaseSlug: string }>();
  const useCase = getUseCaseBySlug(useCaseSlug || '');

  const { data: topCities } = useQuery({
    queryKey: ['seo-top-cities-usecase'],
    queryFn: async () => {
      const { data } = await supabase.from('seo_cities').select('*').eq('is_active', true).limit(12);
      return (data || []) as SeoCity[];
    },
    enabled: !!useCase,
  });

  if (!useCase) return <NotFound />;

  const canonical = `/use-cases/${useCase.slug}`;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Use Cases', url: '/use-cases' },
    { name: useCase.name, url: canonical },
  ]);

  const sizeData = DUMPSTER_SIZES_DATA.filter(s => useCase.recommendedSizes.includes(s.yards));

  return (
    <Layout title={useCase.h1} description={useCase.metaDescription}>
      <SEOHead
        title={useCase.h1}
        description={useCase.metaDescription}
        canonical={canonical}
        schema={[breadcrumbSchema, generateFAQSchema(useCase.faqs)]}
      />

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-3" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-primary-foreground">Home</Link>
              <span>/</span>
              <span className="text-primary-foreground">{useCase.name}</span>
            </nav>
            <h1 className="heading-xl mb-4">{useCase.h1}</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">{useCase.description}</p>
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

      {/* Benefits */}
      <section className="section-padding bg-background">
        <div className="container-wide max-w-3xl mx-auto">
          <h2 className="heading-lg text-foreground mb-8 text-center">Why Rent a Dumpster for Your {useCase.name}?</h2>
          <div className="space-y-4">
            {useCase.benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                <span className="text-foreground">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Sizes */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Recommended Dumpster Sizes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {sizeData.map(size => (
              <div key={size.yards} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="text-4xl font-black text-foreground">{size.yards}</div>
                <div className="text-xs text-muted-foreground mb-2">YARD DUMPSTER</div>
                <div className="text-lg font-semibold text-primary mb-1">From ${size.priceFrom}</div>
                <div className="text-sm text-muted-foreground">{size.dimensions}</div>
                <div className="text-sm text-muted-foreground mt-1">{size.loads}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Available in Cities Across California</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {(topCities || []).map(city => (
              <Link key={city.city_slug} to={cityUrl(city.city_slug)}
                className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                {city.city_name}, CA
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-8 text-center">Frequently Asked Questions — {useCase.name} Dumpster Rental</h2>
          <div className="space-y-4">
            {useCase.faqs.map((faq, i) => (
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
          <h2 className="heading-lg mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Get an instant quote for your {useCase.name.toLowerCase()} project.</p>
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
