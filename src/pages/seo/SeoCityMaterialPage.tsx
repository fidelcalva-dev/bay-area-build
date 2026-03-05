import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO, OPERATIONAL_YARDS } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { SEO_MATERIALS, type SeoCity, type FaqItem, generateInternalLinks } from '@/lib/seo-engine';
import { ArrowRight, Phone, CheckCircle } from 'lucide-react';
import { useSeoTracking } from '@/hooks/useSeoTracking';
import { cityUrl, cityMaterialUrl, citySizeUrl } from '@/lib/seo-urls';
import { normalizeCitySlug } from '@/lib/seo-slug-normalizer';
import NotFound from '../NotFound';

export default function SeoCityMaterialPage() {
  const { citySlug: rawSlug, materialSlug } = useParams<{ citySlug: string; materialSlug: string }>();
  const normalized = normalizeCitySlug(rawSlug || '');
  const needsRedirect = !!(rawSlug && normalized !== rawSlug);
  const citySlug = normalized;

  const material = SEO_MATERIALS.find(m => m.slug === materialSlug);

  const { data: city, isLoading } = useQuery({
    queryKey: ['seo-city', citySlug],
    queryFn: async () => {
      const { data } = await supabase.from('seo_cities').select('*').eq('city_slug', citySlug || '').eq('is_active', true).single();
      return data as SeoCity | null;
    },
    enabled: !!citySlug && !needsRedirect,
  });

  const { data: page } = useQuery({
    queryKey: ['seo-page', citySlug, materialSlug],
    queryFn: async () => {
      const urlPath = `/dumpster-rental/${citySlug}/${materialSlug}`;
      const { data } = await supabase.from('seo_pages').select('*').eq('url_path', urlPath).eq('is_published', true).single();
      return data;
    },
    enabled: !!citySlug && !!materialSlug && !needsRedirect,
  });

  const { data: allCities } = useQuery({
    queryKey: ['seo-all-cities'],
    queryFn: async () => {
      const { data } = await supabase.from('seo_cities').select('*').eq('is_active', true);
      return (data || []) as SeoCity[];
    },
    enabled: !needsRedirect,
  });

  const { trackQuoteClick, trackCallClick } = useSeoTracking({ pageType: 'city_material', city: city?.city_name || '', material: material?.slug || '', slug: city?.city_slug || '' });

  if (needsRedirect) {
    return <Navigate to={`/dumpster-rental/${normalized}/${materialSlug}`} replace />;
  }

  if (isLoading) {
    return <Layout><div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div></Layout>;
  }

  if (!city || !material) return <NotFound />;

  const yard = OPERATIONAL_YARDS.find(y => y.id === city.primary_yard_id);
  const faqs = (page?.faq_json as unknown as FaqItem[] | null) || [];
  const schemas = (page?.schema_json as unknown as object[] | null) || [];
  const internalLinks = generateInternalLinks(city, 'CITY_MATERIAL', allCities || []);
  const isHeavy = material.category === 'heavy';

  const pageTitle = page?.title || `${material.name} Dumpster Rental ${city.city_name} CA`;
  const pageDescription = page?.meta_description || `${material.name} dumpster rental in ${city.city_name}, CA. ${material.description} Available in ${material.sizes.join(', ')} yard sizes.`;

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <Helmet>
        <link rel="canonical" href={`${BUSINESS_INFO.url}${cityMaterialUrl(city.city_slug, material.slug)}`} />
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
              <span className="text-primary-foreground">{material.name}</span>
            </div>
            <h1 className="heading-xl mb-4">{material.name} Dumpster Rental in {city.city_name}, CA</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              {material.description} Serving {city.city_name} from our {yard?.city || 'local'} yard with same-day delivery available.
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

      {/* Recommended Sizes */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Recommended Sizes for {material.name} in {city.city_name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {material.sizes.map(sz => {
              const s = DUMPSTER_SIZES_DATA.find(d => d.yards === sz);
              if (!s) return null;
              return (
                <Link key={sz} to={citySizeUrl(city.city_slug, sz)}
                  className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/50 hover:shadow-md transition-all group">
                  <div className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{sz}</div>
                  <div className="text-xs text-muted-foreground mb-2">YARD</div>
                  <div className="text-sm font-semibold text-primary">From ${s.priceFrom}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.loads}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Info */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6 text-center">{material.name} Disposal Pricing</h2>
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            {isHeavy ? (
              <>
                <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-foreground"><strong>Flat-fee pricing</strong> -- disposal included, no weight overage charges</span></div>
                <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-muted-foreground">Keep loads clean and unmixed for flat-fee qualification</span></div>
                <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-muted-foreground">Available in {material.sizes.join(', ')} yard sizes only</span></div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-foreground">Includes base tonnage by size</span></div>
                <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-muted-foreground">Overage: ${PRICING_POLICIES.overagePerTonGeneral}/ton based on scale ticket</span></div>
                <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-muted-foreground">Standard {PRICING_POLICIES.standardRentalDays}-day rental, ${PRICING_POLICIES.extraDayCost}/day extra</span></div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container-narrow">
            <h2 className="heading-md text-foreground mb-6 text-center">{material.name} FAQ -- {city.city_name}</h2>
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
          <h2 className="heading-lg mb-4">{material.name} Dumpster in {city.city_name}?</h2>
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
            <Link to="/materials" className="text-primary hover:underline">All Materials</Link>
            <Link to="/sizes" className="text-primary hover:underline">All Sizes</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
