import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO, OPERATIONAL_YARDS, generateBreadcrumbSchema, generateFAQSchema, generateServiceSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { type SeoCity } from '@/lib/seo-engine';
import { getJobTypeBySlug, SEO_JOB_TYPES } from '@/lib/seo-jobs';
import { ArrowRight, Phone, CheckCircle, Wrench, HardHat, Building2 } from 'lucide-react';
import { useSeoTracking } from '@/hooks/useSeoTracking';
import { cityUrl, cityJobUrl, citySizeUrl } from '@/lib/seo-urls';
import { normalizeCitySlug } from '@/lib/seo-slug-normalizer';
import NotFound from '../NotFound';

const CATEGORY_ICONS = { residential: HardHat, commercial: Building2, contractor: Wrench };

export default function SeoCityJobPage() {
  const { citySlug: rawSlug, jobSlug } = useParams<{ citySlug: string; jobSlug: string }>();
  const normalized = normalizeCitySlug(rawSlug || '');
  const needsRedirect = !!(rawSlug && normalized !== rawSlug);
  const citySlug = normalized;
  const job = jobSlug ? getJobTypeBySlug(jobSlug) : undefined;

  const { data: city, isLoading } = useQuery({
    queryKey: ['seo-city', citySlug],
    queryFn: async () => {
      const { data } = await supabase.from('seo_cities').select('*').eq('city_slug', citySlug || '').eq('is_active', true).single();
      return data as SeoCity | null;
    },
    enabled: !!citySlug && !needsRedirect,
  });

  const { trackQuoteClick, trackCallClick } = useSeoTracking({ pageType: 'city_job', city: city?.city_name || '', jobType: job?.slug || '', slug: city?.city_slug || '' });

  if (needsRedirect) {
    return <Navigate to={`/dumpster-rental/${normalized}/${jobSlug}`} replace />;
  }

  if (isLoading) {
    return <Layout><div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div></Layout>;
  }

  if (!city || !job) return <NotFound />;

  const yard = OPERATIONAL_YARDS.find(y => y.id === city.primary_yard_id);
  const Icon = CATEGORY_ICONS[job.category];

  const pageTitle = `${job.name} Dumpster Rental ${city.city_name} CA | Calsan`;
  const pageDescription = `${job.name} dumpster rental in ${city.city_name}, CA. ${job.recommendedSizes.join(', ')} yard sizes. Same-day delivery from our ${yard?.city || 'local'} yard. Transparent pricing.`;
  const canonicalPath = cityJobUrl(city.city_slug, job.slug);
  const canonicalUrl = `${BUSINESS_INFO.url}${canonicalPath}`;

  // Localize FAQs
  const faqs = job.faqs.map(f => ({
    question: f.question.replace(/{city}/g, city.city_name),
    answer: f.answer.replace(/{city}/g, city.city_name),
  }));
  faqs.push(
    { question: `How fast can I get a ${job.name.toLowerCase()} dumpster in ${city.city_name}?`, answer: `Same-day delivery is available for most ${city.city_name} addresses when ordered before noon. Our ${yard?.name || 'local yard'} is close by for fast turnaround.` },
    { question: `What is included in ${job.name.toLowerCase()} dumpster rental?`, answer: `Every rental includes delivery, pickup, base tonnage, and ${PRICING_POLICIES.standardRentalDays}-day rental period. Extra days are $${PRICING_POLICIES.extraDayCost}/day. General debris overage is $${PRICING_POLICIES.overagePerTonGeneral}/ton.` },
    { question: `Do I need a permit for a ${job.name.toLowerCase()} dumpster in ${city.city_name}?`, answer: `If the dumpster is on your private driveway, no permit is needed. Street placement requires a city permit. Contact ${city.city_name} Public Works for details.` },
    { question: `Are you a local company?`, answer: `Yes. We operate our own ${yard?.name || 'local yard'} and dispatch our own trucks and drivers. We are not a broker.` },
    { question: `Do you offer bilingual support?`, answer: `Yes — Hablamos Español. Our team supports English and Spanish-speaking customers for all project types.` },
  );

  const schemas = [
    generateServiceSchema({
      name: `${job.name} Dumpster Rental in ${city.city_name}`,
      description: pageDescription,
      areaServed: [city.city_name, city.county || 'Bay Area', 'California'].filter(Boolean) as string[],
    }),
    generateFAQSchema(faqs),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: city.city_name, url: cityUrl(city.city_slug) },
      { name: job.name, url: canonicalPath },
    ]),
  ];

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
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
              <span className="text-primary-foreground">{job.name}</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h1 className="heading-xl">{job.name} Dumpster Rental in {city.city_name}, CA</h1>
            </div>
            <p className="text-xl text-primary-foreground/85 mb-6">
              {job.description} Serving {city.city_name} from our {yard?.city || 'local'} yard with same-day delivery available.
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

      {/* Typical Projects */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-4 text-center">Typical {job.name} Projects in {city.city_name}</h2>
          <p className="text-muted-foreground text-center mb-8">{job.typicalProjects}</p>
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-3">Why a Dumpster for {job.name}?</h3>
            <p className="text-muted-foreground">{job.whyDumpster}</p>
          </div>
        </div>
      </section>

      {/* Recommended Sizes */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <h2 className="heading-md text-foreground mb-8 text-center">Recommended Sizes for {job.name} in {city.city_name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {job.recommendedSizes.map(sz => {
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
          <p className="text-xs text-muted-foreground text-center mt-6">
            Exact pricing depends on ZIP, size, and material. <Link to="/quote" className="text-primary hover:underline">Get your exact price instantly</Link>.
          </p>
        </div>
      </section>

      {/* Pricing Rules */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6 text-center">{job.name} Dumpster Pricing</h2>
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-foreground">Delivery and pickup <strong>included</strong></span></div>
            <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-muted-foreground">Standard {PRICING_POLICIES.standardRentalDays}-day rental, ${PRICING_POLICIES.extraDayCost}/day extra</span></div>
            <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-muted-foreground">General debris overage: ${PRICING_POLICIES.overagePerTonGeneral}/ton</span></div>
            <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" /><span className="text-muted-foreground">Heavy materials (6-10yd): <strong>Flat fee, no weight overage</strong></span></div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6 text-center">{job.name} Dumpster FAQ — {city.city_name}</h2>
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
          <h2 className="heading-lg mb-4">{job.name} Dumpster in {city.city_name}?</h2>
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
            <Link to={cityUrl(city.city_slug)} className="text-primary hover:underline">All {city.city_name} Dumpsters</Link>
            <span className="text-muted-foreground hidden sm:inline">|</span>
            {SEO_JOB_TYPES.filter(j => j.slug !== job.slug).slice(0, 4).map(j => (
              <Link key={j.slug} to={cityJobUrl(city.city_slug, j.slug)} className="text-primary hover:underline">{j.name} in {city.city_name}</Link>
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
