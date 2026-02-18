import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO, OPERATIONAL_YARDS } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { SEO_MATERIALS, type SeoCity, type ContentSection, type FaqItem, generateInternalLinks } from '@/lib/seo-engine';
import { ArrowRight, MapPin, Phone, Truck, Clock, Shield, Building, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { useSeoTracking } from '@/hooks/useSeoTracking';
import { cityUrl, citySizeUrl, cityMaterialUrl } from '@/lib/seo-urls';
import { SEO_BLOG_TOPICS } from '@/lib/seo-blog-topics';
import NotFound from '../NotFound';

export default function SeoCityPage() {
  const { citySlug } = useParams<{ citySlug: string }>();

  const { data: city, isLoading: cityLoading } = useQuery({
    queryKey: ['seo-city', citySlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('seo_cities')
        .select('*')
        .eq('city_slug', citySlug || '')
        .eq('is_active', true)
        .single();
      return data as SeoCity | null;
    },
    enabled: !!citySlug,
  });

  const { data: page } = useQuery({
    queryKey: ['seo-page', citySlug, 'CITY'],
    queryFn: async () => {
      const urlPath = `/dumpster-rental/${citySlug}`;
      const { data } = await supabase
        .from('seo_pages')
        .select('*')
        .eq('url_path', urlPath)
        .eq('is_published', true)
        .single();
      return data;
    },
    enabled: !!citySlug,
  });

  const { data: allCities } = useQuery({
    queryKey: ['seo-all-cities'],
    queryFn: async () => {
      const { data } = await supabase.from('seo_cities').select('*').eq('is_active', true);
      return (data || []) as SeoCity[];
    },
  });

  const { data: nearbyCities } = useQuery({
    queryKey: ['seo-nearby-cities', city?.nearby_cities_json],
    queryFn: async () => {
      if (!city?.nearby_cities_json?.length) return [];
      const { data } = await supabase
        .from('seo_cities')
        .select('*')
        .in('city_slug', city.nearby_cities_json)
        .eq('is_active', true);
      return (data || []) as SeoCity[];
    },
    enabled: !!city,
  });

  if (cityLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!city) return <NotFound />;

  const yard = OPERATIONAL_YARDS.find(y => y.id === city.primary_yard_id);
  const neighborhoods = city.neighborhoods_json || [];
  const sections = (page?.sections_json as unknown as ContentSection[] | null) || [];
  const faqs = (page?.faq_json as unknown as FaqItem[] | null) || [];
  const schemas = (page?.schema_json as unknown as object[] | null) || [];
  const internalLinks = generateInternalLinks(city, 'CITY', allCities || []);
  const { trackQuoteClick, trackCallClick } = useSeoTracking({ pageType: 'city', city: city.city_name, slug: city.city_slug });

  const pageTitle = page?.title || `Dumpster Rental ${city.city_name} CA | Same-Day Delivery`;
  const pageDescription = page?.meta_description || `Local dumpster rental in ${city.city_name}, CA. Same-day delivery, 6-50 yard sizes. Call ${BUSINESS_INFO.phone.salesFormatted}.`;

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <Helmet>
        <link rel="canonical" href={`${BUSINESS_INFO.url}${cityUrl(city.city_slug)}`} />
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
              <Link to="/areas" className="hover:text-primary-foreground">Service Areas</Link>
              <span>/</span>
              <span className="text-primary-foreground">{city.city_name}</span>
            </div>
            <h1 className="heading-xl mb-4">Dumpster Rental in {city.city_name}, CA</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">{city.local_intro}</p>
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

      {/* Trust Signals */}
      <section className="py-6 bg-muted/50 border-b border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span>Local Yard in {yard?.city || 'Bay Area'}</span></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span>Same-Day Delivery Available</span></div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /><span>Licensed & Insured</span></div>
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /><span>6-50 Yard Sizes</span></div>
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-3 text-center">Dumpster Sizes Available in {city.city_name}</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            From small cleanouts to major construction projects--find the right size for your {city.city_name} project.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {DUMPSTER_SIZES_DATA.map(size => (
              <Link key={size.yards} to={citySizeUrl(city.city_slug, size.yards)}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{size.yards}</div>
                <div className="text-xs text-muted-foreground mb-2">YARD</div>
                <div className="text-sm font-semibold text-primary">From ${size.priceFrom}</div>
                <div className="text-xs text-muted-foreground mt-1">{size.loads}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Materials */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Popular Materials in {city.city_name}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEO_MATERIALS.map(m => (
              <Link key={m.slug} to={cityMaterialUrl(city.city_slug, m.slug)}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all group">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{m.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{m.description}</p>
                <span className="text-xs text-primary font-medium">Available in {m.sizes.join(', ')} yd sizes</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Disposal & Permits */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Building className="w-5 h-5 text-primary" /></div>
                <h2 className="heading-md text-foreground">Local Disposal Rules</h2>
              </div>
              <p className="text-muted-foreground mb-4">{city.dump_rules}</p>
              <div className="space-y-3">
                <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-sm text-muted-foreground">Heavy materials (concrete, dirt): <strong className="text-foreground">Flat fee--no weight overage</strong></span></div>
                <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-sm text-muted-foreground">General debris: ${PRICING_POLICIES.overagePerTonGeneral}/ton overage based on scale ticket</span></div>
                <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-sm text-muted-foreground">Standard {PRICING_POLICIES.standardRentalDays}-day rental, ${PRICING_POLICIES.extraDayCost}/day extra</span></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-accent-foreground" /></div>
                <h2 className="heading-md text-foreground">Permit Information</h2>
              </div>
              <p className="text-muted-foreground mb-4">{city.permit_info}</p>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-2">Need help with permits?</p>
                <p className="text-sm text-muted-foreground">Our team can guide you through the permit process for {city.city_name}. Call us for assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      {neighborhoods.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container-wide">
            <h2 className="heading-md text-foreground mb-6 text-center">Neighborhoods We Serve in {city.city_name}</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {neighborhoods.map((n: string) => (
                <span key={n} className="px-3 py-1.5 bg-card border border-border rounded-full text-sm text-muted-foreground">{n}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing CTA */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
            <h2 className="heading-md text-foreground mb-3">{city.city_name} Pricing</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{city.pricing_note}</p>
            <Button asChild variant="cta" size="lg">
              <Link to="/quote">Get Your {city.city_name} Price <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container-narrow">
            <h2 className="heading-lg text-foreground mb-8 text-center">Frequently Asked Questions -- {city.city_name}</h2>
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

      {/* Nearby Cities */}
      {(nearbyCities?.length || 0) > 0 && (
        <section className="section-padding bg-background">
          <div className="container-wide">
            <h2 className="heading-md text-foreground mb-6 text-center">Also Serving Nearby</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {nearbyCities?.map(c => (
                <Link key={c.city_slug} to={cityUrl(c.city_slug)}
                  className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  {c.city_name}, CA
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Guides */}
      {(() => {
        const cityName = city.city_name.toLowerCase();
        const relatedGuides = SEO_BLOG_TOPICS.filter(t =>
          t.targetCity?.toLowerCase() === cityName ||
          t.internalLinks.some(l => l.url.includes(city.city_slug))
        ).slice(0, 4);
        if (!relatedGuides.length) return null;
        return (
          <section className="section-padding bg-muted/30">
            <div className="container-wide">
              <h2 className="heading-md text-foreground mb-6 text-center flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Related Guides for {city.city_name}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedGuides.map(guide => (
                  <Link key={guide.slug} to={`/blog/${guide.slug}`}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all group">
                    <span className="text-xs text-primary font-medium uppercase">{guide.category}</span>
                    <h3 className="font-semibold text-foreground text-sm mt-1 group-hover:text-primary transition-colors line-clamp-2">{guide.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{guide.metaDescription}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Technology + Local Infrastructure */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-md text-foreground mb-4">Technology + Local Infrastructure</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Calsan combines real Bay Area yards with centralized logistics technology.
              We calculate routes, disposal timing, and delivery cycles before dispatching drivers.
            </p>
            <p className="text-muted-foreground">
              This means faster scheduling, fewer delays, and clearer pricing.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Rent a Dumpster in {city.city_name}?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Get an instant quote or call us now. Same-day delivery available.</p>
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
            {internalLinks.filter(l => l.type === 'size').slice(0, 4).map(link => (
              <Link key={link.url} to={link.url} className="text-primary hover:underline">{link.text}</Link>
            ))}
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <Link to="/sizes" className="text-primary hover:underline">All Sizes</Link>
            <Link to="/materials" className="text-primary hover:underline">Materials</Link>
            <Link to="/pricing" className="text-primary hover:underline">Pricing</Link>
            <Link to="/contractors" className="text-primary hover:underline">Contractors</Link>
            <Link to="/areas" className="text-primary hover:underline">All Areas</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
