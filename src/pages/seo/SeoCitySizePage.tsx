import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO, OPERATIONAL_YARDS } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { type SeoCity, type FaqItem, generateInternalLinks } from '@/lib/seo-engine';
import { ArrowRight, Phone, Ruler, Weight, Clock, CheckCircle } from 'lucide-react';
import { useSeoTracking } from '@/hooks/useSeoTracking';
import { citySizeUrl, cityUrl } from '@/lib/seo-urls';
import NotFound from '../NotFound';

export default function SeoCitySizePage() {
  const { citySlug, sizeSlug } = useParams<{ citySlug: string; sizeSlug: string }>();
  const yards = sizeSlug ? parseInt(sizeSlug) : NaN;

  const { data: city, isLoading } = useQuery({
    queryKey: ['seo-city', citySlug],
    queryFn: async () => {
      const { data } = await supabase.from('seo_cities').select('*').eq('city_slug', citySlug || '').eq('is_active', true).single();
      return data as SeoCity | null;
    },
    enabled: !!citySlug,
  });

  const { data: page } = useQuery({
    queryKey: ['seo-page', citySlug, sizeSlug],
    queryFn: async () => {
      const urlPath = `/dumpster-rental/${citySlug}/${sizeSlug}-yard`;
      const { data } = await supabase.from('seo_pages').select('*').eq('url_path', urlPath).eq('is_published', true).single();
      return data;
    },
    enabled: !!citySlug && !isNaN(yards),
  });

  const { data: allCities } = useQuery({
    queryKey: ['seo-all-cities'],
    queryFn: async () => {
      const { data } = await supabase.from('seo_cities').select('*').eq('is_active', true);
      return (data || []) as SeoCity[];
    },
  });

  const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === yards);

  if (isLoading) {
    return <Layout><div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div></Layout>;
  }

  if (!city || !sizeData || isNaN(yards)) return <NotFound />;

  const yard = OPERATIONAL_YARDS.find(y => y.id === city.primary_yard_id);
  const faqs = (page?.faq_json as unknown as FaqItem[] | null) || [];
  const schemas = (page?.schema_json as unknown as object[] | null) || [];
  const internalLinks = generateInternalLinks(city, 'CITY_SIZE', allCities || []);
  const { trackQuoteClick, trackCallClick } = useSeoTracking({ pageType: 'city_size', city: city.city_name, sizeYd: yards, slug: city.city_slug });

  const pageTitle = page?.title || `${yards} Yard Dumpster Rental ${city.city_name} CA | From $${sizeData.priceFrom}`;
  const pageDescription = page?.meta_description || `Rent a ${yards}-yard dumpster in ${city.city_name}, CA. ${sizeData.dimensions}, ${sizeData.loads}. From $${sizeData.priceFrom}. Same-day delivery.`;

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <Helmet>
        <link rel="canonical" href={`${BUSINESS_INFO.url}${citySizeUrl(city.city_slug, yards)}`} />
        {schemas.map((schema, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
        ))}
      </Helmet>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-3">
              <Link to="/" className="hover:text-primary-foreground">Home</Link>
              <span>/</span>
              <Link to={cityUrl(city.city_slug)} className="hover:text-primary-foreground">{city.city_name}</Link>
              <span>/</span>
              <span className="text-primary-foreground">{yards} Yard</span>
            </div>
            <h1 className="heading-xl mb-4">{yards} Yard Dumpster Rental in {city.city_name}, CA</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              {sizeData.dimensions} -- holds approximately {sizeData.loads}. Ideal for {sizeData.useCases.join(', ').toLowerCase()}. Delivered from our {yard?.city || 'local'} yard.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="cta" size="lg">
                <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}><Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">{yards} Yard Dumpster Specifications</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <Ruler className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Dimensions</div>
              <div className="font-semibold text-foreground">{sizeData.dimensions}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <Weight className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Included Weight</div>
              <div className="font-semibold text-foreground">{sizeData.includedTons} ton{sizeData.includedTons > 1 ? 's' : ''}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Rental Period</div>
              <div className="font-semibold text-foreground">{PRICING_POLICIES.standardRentalDays} days</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <div className="text-2xl font-black text-primary mb-1">From ${sizeData.priceFrom}</div>
              <div className="text-sm text-muted-foreground">Starting price</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6 text-center">Common Uses for {yards} Yard Dumpsters in {city.city_name}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {sizeData.useCases.map(uc => (
              <div key={uc} className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{uc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Sizes */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-md text-foreground mb-6 text-center">Other Sizes in {city.city_name}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-3xl mx-auto">
            {DUMPSTER_SIZES_DATA.filter(s => s.yards !== yards).map(s => (
              <Link key={s.yards} to={citySizeUrl(city.city_slug, s.yards)}
                className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary/50 transition-all">
                <div className="text-xl font-black text-foreground">{s.yards}</div>
                <div className="text-xs text-muted-foreground">YARD</div>
                <div className="text-xs text-primary font-semibold mt-1">From ${s.priceFrom}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container-narrow">
            <h2 className="heading-md text-foreground mb-6 text-center">{yards} Yard Dumpster FAQ -- {city.city_name}</h2>
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
      )}

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Rent a {yards} Yard Dumpster in {city.city_name}</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Get an instant quote. Same-day delivery available.</p>
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
            {internalLinks.map(link => (
              <Link key={link.url} to={link.url} className="text-primary hover:underline">{link.text}</Link>
            ))}
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <Link to="/sizes" className="text-primary hover:underline">All Sizes</Link>
            <Link to="/materials" className="text-primary hover:underline">Materials</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
