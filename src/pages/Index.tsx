import { Suspense, lazy, useState, useCallback } from 'react'; // homepage
import { BUILD_INFO } from '@/lib/buildInfo';
import { Layout } from '@/components/layout/Layout';
import { PAGE_SEO, generateFAQSchema, generateBreadcrumbSchema, BUSINESS_INFO } from '@/lib/seo';
import { getFAQsForSchema, DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Shield, MapPin, ArrowRight, Phone, CheckCircle, Scale, MessageSquare,
  Truck, Star, Clock, Wrench, Upload, Package, Hammer, Users, Globe, HardHat,
  Search, Building2,
} from 'lucide-react';

const GuidedAssistant = lazy(() =>
  import('@/components/home/GuidedAssistant').then(mod => ({ default: mod.GuidedAssistant }))
);
const FAQSection = lazy(() =>
  import('@/components/sections/FAQSection').then(mod => ({ default: mod.FAQSection }))
);
const ReviewsSection = lazy(() =>
  import('@/components/sections/ReviewsSection').then(mod => ({ default: mod.ReviewsSection }))
);

const SectionLoader = () => (
  <div className="min-h-[100px] flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const TRUST_BADGES = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: Star, label: '4.9★ (200+ Verified)' },
  { icon: Clock, label: 'Same-Day Available' },
  { icon: Scale, label: 'Transparent Pricing' },
  { icon: HardHat, label: 'Contractor Ready' },
  { icon: Globe, label: 'Español disponible' },
];

const WHATS_INCLUDED = [
  'All-inclusive pricing — no hidden fees',
  'Delivery & pickup included',
  'Weight allowance included',
  '7-day standard rental',
  'Bay Area coverage (9 counties)',
  'Professional local dispatch',
];

const PRICE_PREVIEW = [
  { yards: 10, from: 495, use: 'Small cleanouts & minor remodeling' },
  { yards: 20, from: 650, use: 'Most remodels & roofing jobs' },
  { yards: 30, from: 775, use: 'Construction & larger renovations' },
];

const WHY_CALSAN = [
  { icon: MapPin, title: 'Real Local Yard Support', desc: 'Operating directly from Oakland and San Jose — not a broker.' },
  { icon: Truck, title: 'Professional Dispatch', desc: 'Experienced operators who protect your property on every delivery.' },
  { icon: Scale, title: 'Transparent Pricing', desc: 'ZIP-based pricing with no hidden fees or surprise charges.' },
  { icon: Clock, title: 'Fast Scheduling', desc: 'Same-day delivery available in most Bay Area locations.' },
  { icon: Wrench, title: 'Heavy Material Guidance', desc: 'Expert help choosing the right container for soil, concrete, or mixed debris.' },
];

const PROJECT_TYPES = [
  { label: 'Kitchen Remodel', slug: 'kitchen-remodel', icon: Hammer },
  { label: 'Roof Replacement', slug: 'roof-replacement', icon: Wrench },
  { label: 'Garage Cleanout', slug: 'garage-cleanout', icon: Package },
  { label: 'Construction Debris', slug: 'construction-debris', icon: Truck },
  { label: 'Yard Cleanup', slug: 'yard-cleanup', icon: MapPin },
  { label: 'Estate Cleanout', slug: 'estate-cleanout', icon: Scale },
];

const HOW_IT_WORKS_STEPS = [
  { number: '1', icon: Search, title: 'Enter Your Address', desc: 'Tell us your delivery ZIP code' },
  { number: '2', icon: Package, title: 'Choose Material & Size', desc: 'We help you pick the right container' },
  { number: '3', icon: Clock, title: 'Pick Delivery Date', desc: 'Choose a date that works for you' },
  { number: '4', icon: Truck, title: 'We Deliver & Pick Up', desc: 'Load at your pace — we haul it away' },
];

const SERVICE_AREAS_LIST = [
  { name: 'Oakland', slug: 'oakland' },
  { name: 'San Jose', slug: 'san-jose' },
  { name: 'San Francisco', slug: 'san-francisco' },
  { name: 'Berkeley', slug: 'berkeley' },
  { name: 'Hayward', slug: 'hayward' },
  { name: 'Fremont', slug: 'fremont' },
  { name: 'Walnut Creek', slug: 'walnut-creek' },
  { name: 'Concord', slug: 'concord' },
];

const LOCAL_HUBS = [
  { label: 'Oakland', slug: 'oakland', type: 'yard' as const },
  { label: 'San Jose', slug: 'san-jose', type: 'yard' as const },
  { label: 'San Francisco', slug: 'san-francisco', type: 'city' as const },
  { label: 'Bay Area', slug: 'bay-area', path: '/areas', type: 'hub' as const },
  { label: 'California', slug: 'california', path: '/areas/california', type: 'hub' as const },
];

const Index = () => {
  const homepageFAQs = getFAQsForSchema(4);
  const navigate = useNavigate();
  const [heroZip, setHeroZip] = useState('');
  const isValidZip = heroZip.length === 5 && /^\d{5}$/.test(heroZip);

  const handleHeroQuote = useCallback(() => {
    if (isValidZip) {
      navigate(`/quote?v3=1&zip=${heroZip}`);
    }
  }, [isValidZip, heroZip, navigate]);

  return (
    <Layout
      title={PAGE_SEO.home.title}
      description={PAGE_SEO.home.description}
      canonical={PAGE_SEO.home.canonical}
      schema={[
        generateFAQSchema(homepageFAQs),
        generateBreadcrumbSchema([{ name: 'Home', url: '/' }]),
      ]}
      hideChat
    >
      <LocalSEOSchema includeFAQ includeService />

      {/* ========== SECTION 1 — HERO ========== */}
      <section className="bg-background py-12 md:py-20">
        <div className="container-wide">
          <div className="text-center mb-8 space-y-4 max-w-[660px] mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-[1.1] tracking-tight">
              Get Your Dumpster Quote
              <span className="block text-primary mt-1">In 60 Seconds</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-lg mx-auto">
              Transparent, all-inclusive pricing across the Bay Area. No hidden fees.
            </p>
          </div>

          {/* Quick Quote Start Form */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex items-center bg-card rounded-2xl border border-border shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <div className="flex items-center pl-4 pr-2">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                value={heroZip}
                onChange={(e) => setHeroZip(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleHeroQuote(); }}
                placeholder="Enter delivery ZIP"
                className="flex-1 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              />
              <div className="pr-2">
                <Button
                  size="lg"
                  onClick={handleHeroQuote}
                  disabled={!isValidZip}
                  className="h-10 px-5 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-none"
                >
                  Get Price
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              We'll match you with the nearest yard and show exact pricing
            </p>
          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-[520px] mx-auto">
            <Button asChild variant="outline" size="lg" className="rounded-full font-semibold px-6 text-sm flex-1">
              <Link to="/quote?v3=1&tab=photo">
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo for Size Help
              </Link>
            </Button>
          </div>

          {/* Tertiary: Call / Text */}
          <div className="mt-3 flex justify-center gap-4">
            <a
              href={`tel:${BUSINESS_INFO.phone.sales}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <Phone className="w-3.5 h-3.5" />
              Call {BUSINESS_INFO.phone.salesFormatted}
            </a>
            <a
              href={`sms:${BUSINESS_INFO.phone.sales}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Text Us
            </a>
          </div>
        </div>
      </section>

      {/* ========== SECTION 2 — TRUST BADGES ========== */}
      <section className="bg-muted/30 py-5 border-y border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2.5">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.8} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 3 — WHY CALSAN ========== */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Why Customers Choose Calsan
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {WHY_CALSAN.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 items-start p-4 bg-card rounded-2xl border border-border">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground mb-0.5">{title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 4 — HOW IT WORKS ========== */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              From quote to pickup in 4 simple steps.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="relative mx-auto mb-3 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary" strokeWidth={1.75} />
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 5 — PRICE PREVIEW (10/20/30) ========== */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Popular Sizes &amp; Starting Prices
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-2xl mx-auto">
            {PRICE_PREVIEW.map((size) => (
              <Link
                key={size.yards}
                to={`/quote?v3=1&size=${size.yards}`}
                className="bg-card rounded-2xl border border-border p-4 md:p-5 text-center hover:border-primary/30 transition-colors group"
              >
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{size.yards}<span className="text-base font-medium text-muted-foreground ml-1">yd</span></div>
                <div className="text-sm font-semibold text-primary mb-2">From ${size.from}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{size.use}</div>
              </Link>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-5">
            Final pricing depends on material, location, and included weight.{' '}
            <Link to="/sizes" className="underline hover:text-primary">View all sizes</Link>
          </p>
        </div>
      </section>

      {/* ========== SECTION 6 — WHAT'S INCLUDED ========== */}
      <section className="py-10 md:py-14 bg-muted/30">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto bg-card rounded-2xl border border-border p-6 md:p-8">
            <h2 className="font-bold text-foreground text-lg md:text-xl mb-4 text-center">
              What's Included in Every Rental
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WHATS_INCLUDED.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center mt-5">
              <Link to="/quote?v3=1" className="text-sm text-primary font-semibold hover:underline inline-flex items-center gap-1">
                See your exact price <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ========== SECTION 7 — COMMON PROJECT TYPES ========== */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Common Project Types
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              We handle debris from every type of project.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto">
            {PROJECT_TYPES.map(({ label, slug, icon: Icon }) => (
              <Link
                key={slug}
                to={`/quote?v3=1&project=${slug}`}
                className="flex items-center gap-3 px-4 py-4 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/40 hover:bg-muted/30 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
                </div>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 8 — SIZE HELP / GUIDED ASSISTANT (reduced) ========== */}
      <section className="py-10 md:py-14 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-5">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Not Sure What Size You Need?
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Answer a few quick questions and we'll recommend the right dumpster.
            </p>
          </div>
          <div className="max-w-xl mx-auto">
            <Suspense fallback={<SectionLoader />}>
              <GuidedAssistant />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ========== SECTION 9 — LOCAL PROOF ========== */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            {/* Bay Area Yard Proof */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base mb-1">Operating Directly from Oakland &amp; San Jose</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Calsan Dumpsters Pro runs its own yards in Oakland and San Jose, serving homeowners and contractors across the Bay Area with professional dispatch, real equipment, and transparent pricing.
                  </p>
                </div>
              </div>
            </div>
            {/* California Network */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base mb-1">Statewide Service Through Our California Network</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Beyond the Bay Area, Calsan coordinates dumpster rental service across California through a trusted network of local partners — including Sacramento, Stockton, Modesto, Los Angeles, and San Diego.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {LOCAL_HUBS.map((hub) => (
                      <Link
                        key={hub.slug}
                        to={hub.path || `/dumpster-rental/${hub.slug}`}
                        className="px-3 py-1.5 bg-muted/50 border border-border rounded-full text-xs font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors"
                      >
                        {hub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 10 — SERVICE AREAS ========== */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Serving the Bay Area
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Oakland, San Jose, San Francisco and surrounding cities.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {SERVICE_AREAS_LIST.map((area) => (
                <Link
                  key={area.slug}
                  to={`/dumpster-rental/${area.slug}`}
                  className="px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {area.name}
                </Link>
              ))}
            </div>
            <Button asChild variant="outline" className="rounded-full font-semibold px-6">
              <Link to="/areas">
                View All Service Areas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== SECTION 11 — SOCIAL PROOF ========== */}
      <section className="py-10 md:py-14 bg-background border-y border-border">
        <div className="container-wide">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 text-accent fill-accent" />
              ))}
            </div>
            <p className="text-lg font-semibold text-foreground">
              4.9 Rating · 300+ Customers Served
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary" />
                Google Reviews
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary" />
                Yelp
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                BBB A+
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Real Bay Area yards. Real dispatch. No broker middleman.
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>

      {/* ========== SECTION 12 — FINAL CTA ========== */}
      <section className="py-14 md:py-20 gradient-hero">
        <div className="container-narrow text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Get Your Dumpster Price Now
          </h2>
          <p className="text-primary-foreground/70 mb-6 text-base">
            See your exact price before confirming. No surprises, no hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-semibold px-8 shadow-cta text-base">
              <Link to="/quote?v3=1">
                Get Your Dumpster Price Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full font-semibold px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                Call {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/60">
            Calsan Dumpsters Pro — Dumpster Rental. Done Right.
          </p>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <Suspense fallback={<SectionLoader />}>
        <FAQSection limit={4} />
      </Suspense>

      {/* Build fingerprint */}
      {import.meta.env.DEV ? (
        <div className="fixed bottom-2 right-2 z-[9999] bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded pointer-events-none">
          <div>HOME_SOURCE: src/pages/Index.tsx</div>
          <div>BUILD: {BUILD_INFO.timestamp}</div>
          <div>ENV: {BUILD_INFO.env}</div>
        </div>
      ) : (
        <div
          data-build-source="src/pages/Index.tsx"
          data-build-time={BUILD_INFO.timestamp}
          data-build-env={BUILD_INFO.env}
          className="hidden"
          aria-hidden="true"
        />
      )}
    </Layout>
  );
};

export default Index;
