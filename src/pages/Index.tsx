import { Suspense, lazy, useState, useCallback } from 'react'; // homepage
import { PhotoCarousel } from '@/components/home/PhotoCarousel';
import howItWorksVideo from '@/assets/how-it-works-home.mp4.asset.json';
import { BUILD_INFO } from '@/lib/buildInfo';
import { Layout } from '@/components/layout/Layout';
import { PAGE_SEO, generateFAQSchema, generateBreadcrumbSchema, BUSINESS_INFO } from '@/lib/seo';
import { getFAQsForSchema, DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { INCLUDED_TONS as PRICE_LIST_TONS } from '@/lib/price-list-data';
import { GENERAL_DEBRIS_SIZES, HEAVY_MATERIAL } from '@/config/pricingConfig';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Shield, MapPin, ArrowRight, ArrowLeft, Phone, CheckCircle, Scale, MessageSquare,
  Truck, Star, Clock, Wrench, Upload, Package, Hammer, Users, Globe, HardHat,
  Search, Building2, Home, TreePine, Shovel, Newspaper,
} from 'lucide-react';
import { DumpsterIllustration } from '@/components/dumpster/DumpsterIllustration';

// Dumpster images
import yd5Img from '@/assets/5yd-dumpster.webp';
import yd5Photo1 from '@/assets/5yd-photo-1.webp';
import yd5Photo2 from '@/assets/5yd-photo-2.webp';
import yd5Photo3 from '@/assets/5yd-photo-3.webp';
import yd8Img from '@/assets/8yd-dumpster.webp';
import yd8Photo1 from '@/assets/8yd-photo-1.webp';
import yd8Photo2 from '@/assets/8yd-photo-2.webp';
import yd8Photo3 from '@/assets/8yd-photo-3.webp';
import yd8Photo4 from '@/assets/8yd-photo-4.webp';
import yd10Img from '@/assets/10yd-dumpster.webp';
import yd10Photo1 from '@/assets/10yd-photo-1.webp';
import yd10Photo2 from '@/assets/10yd-photo-2.webp';
import yd10Photo3 from '@/assets/10yd-photo-3.webp';
import yd10Photo4 from '@/assets/10yd-photo-4.webp';
import yd20Img from '@/assets/20yd-dumpster.webp';
import yd20Photo1 from '@/assets/20yd-photo-1.webp';
import yd20Photo2 from '@/assets/20yd-photo-2.webp';
import yd20Photo3 from '@/assets/20yd-photo-3.webp';
import yd20Photo4 from '@/assets/20yd-photo-4.webp';
import yd30Img from '@/assets/30yd-dumpster.webp';
import yd30Photo1 from '@/assets/30yd-photo-1.webp';
import yd30Photo2 from '@/assets/30yd-photo-2.webp';
import yd30Photo3 from '@/assets/30yd-photo-3.webp';
import yd30Photo4 from '@/assets/30yd-photo-4.webp';
import yd40Img from '@/assets/40yd-dumpster.webp';
import yd40Photo1 from '@/assets/40yd-photo-1.webp';
import yd40Photo2 from '@/assets/40yd-photo-2.webp';
import yd40Photo3 from '@/assets/40yd-photo-3.webp';
import yd40Photo4 from '@/assets/40yd-photo-4.webp';
import yd50Img from '@/assets/50yd-dumpster.webp';
import yd50Photo1 from '@/assets/50yd-photo-1.webp';
import yd50Photo2 from '@/assets/50yd-photo-2.webp';
import yd50Photo3 from '@/assets/50yd-photo-3.webp';
import { HeroImagePanel } from '@/components/sections/HeroImagePanel';
import yd50Photo4 from '@/assets/50yd-photo-4.webp';

const SIZE_GALLERY: Record<number, string[]> = {
  5: [yd5Img, yd5Photo1, yd5Photo2, yd5Photo3],
  8: [yd8Img, yd8Photo1, yd8Photo2, yd8Photo3, yd8Photo4],
  10: [yd10Img, yd10Photo1, yd10Photo2, yd10Photo3, yd10Photo4],
  20: [yd20Img, yd20Photo1, yd20Photo2, yd20Photo3, yd20Photo4],
  30: [yd30Img, yd30Photo1, yd30Photo2, yd30Photo3, yd30Photo4],
  40: [yd40Img, yd40Photo1, yd40Photo2, yd40Photo3, yd40Photo4],
  50: [yd50Img, yd50Photo1, yd50Photo2, yd50Photo3, yd50Photo4],
};
const SIZE_IMAGES: Record<number, string> = {
  5: yd5Img,
  8: yd8Img,
  10: yd10Img,
  20: yd20Img,
  30: yd30Img,
  40: yd40Img,
  50: yd50Img,
};

const HomepageAIAssistant = lazy(() =>
  import('@/components/home/HomepageAIAssistant').then(mod => ({ default: mod.HomepageAIAssistant }))
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

/* ── STATIC DATA ── */

const TRUST_BADGES = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: Shield, label: 'BBB A+ Accredited' },
  { icon: MapPin, label: 'Local Bay Area Since 2015' },
  { icon: Scale, label: 'Transparent Pricing' },
  { icon: HardHat, label: 'Contractor-Ready' },
  { icon: Star, label: '4.9★ · 89 Reviews on Google' },
  { icon: Globe, label: 'Español Disponible' },
];

const WHATS_INCLUDED = [
  'Delivery and pickup included',
  'Standard 7-day rental',
  'Included weight allowance shown up front',
  'Local Bay Area coverage',
  'Clear material guidance',
  'English & Spanish support',
];

const WHY_CALSAN = [
  'Real local yard support in Oakland and San Jose',
  'Transparent pricing with included weight shown up front',
  'Professional dispatch and clear communication',
  'Contractor-ready service for repeat jobs',
  'Guidance for heavy materials and special disposal needs',
];

const HOW_IT_WORKS_STEPS = [
  { number: '1', icon: Search, title: 'Check Price in Your Area', desc: 'Enter your ZIP and project details' },
  { number: '2', icon: Package, title: 'Choose the Right Container', desc: 'We help you pick the right size' },
  { number: '3', icon: Clock, title: 'Pick Your Delivery Date', desc: 'Choose a date that works for you' },
  { number: '4', icon: Truck, title: 'Fill It & We Pick It Up', desc: 'Load at your pace — we haul it away' },
];

const PROJECT_TYPES = [
  { label: 'Home Cleanouts', slug: 'home-cleanout', icon: Home },
  { label: 'Kitchen Remodels', slug: 'kitchen-remodel', icon: Hammer },
  { label: 'Roofing Debris', slug: 'roof-replacement', icon: Wrench },
  { label: 'Construction Debris', slug: 'construction-debris', icon: Truck },
  { label: 'Garage Cleanouts', slug: 'garage-cleanout', icon: Package },
  { label: 'Estate Cleanouts', slug: 'estate-cleanout', icon: Scale },
  { label: 'Yard Cleanup', slug: 'yard-cleanup', icon: TreePine },
  { label: 'Concrete / Soil Removal', slug: 'concrete-soil', icon: Shovel },
];

/* Mini gallery slider for size cards */
function DumpsterGallery({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const touchStartRef = { current: 0 };

  const goPrev = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIdx((p) => Math.max(p - 1, 0)); };
  const goNext = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIdx((p) => Math.min(p + 1, images.length - 1)); };

  return (
    <div
      className="relative w-full h-28 md:h-36 overflow-hidden rounded-2xl group/gallery"
      onTouchStart={(e) => { touchStartRef.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = touchStartRef.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          setIdx((prev) => diff > 0 ? Math.min(prev + 1, images.length - 1) : Math.max(prev - 1, 0));
        }
      }}
    >
      <img
        src={images[idx]}
        alt={`${alt} - ${idx + 1}`}
        width={400}
        height={300}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-opacity duration-300 rounded-2xl"
      />
      {/* Left arrow */}
      {idx > 0 && (
        <button onClick={goPrev} className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md opacity-80 hover:opacity-100 transition-opacity">
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      {/* Right arrow */}
      {idx < images.length - 1 && (
        <button onClick={goNext} className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md opacity-80 hover:opacity-100 transition-opacity">
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
      {/* Dots */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
        ))}
      </div>
    </div>
  );
}

const ACTION_OPTIONS = [
  { label: 'See My Price Now', icon: ArrowRight, to: '/quote?v3=1', primary: true },
  { label: 'Call / Text Us', icon: Phone, href: true, primary: false },
  { label: 'Upload Photos for Size Help', icon: Upload, to: '/waste-vision', primary: false },
];

const SERVICE_AREAS_CITIES = [
  'Berkeley', 'Alameda', 'San Leandro', 'Hayward', 'Fremont',
  'Walnut Creek', 'Concord', 'Pleasanton', 'Dublin', 'Livermore',
  'Santa Clara', 'Sunnyvale', 'Mountain View', 'San Francisco',
];

const CONTRACTOR_BENEFITS = [
  'Priority coordination',
  'Clear size and material guidance',
  'Fast dispatch communication',
  'Support for recurring projects',
];

/* ── CAL 007 — unified size comparison data ── */
// Price source: META 2026 v2 price list (src/lib/price-list-data.ts), lowest group (GA).
// NOTE: src/lib/shared-data.ts + src/config/pricingConfig.ts still list different
// "approved public" prices (5yd $395 …). Discrepancy reported in docs/CAL_007.md — not resolved here.
const LOWEST_FROM: Record<number, number> = {
  5: 481, 8: 511, 10: 581, 20: 687, 30: 755, 40: 881, 50: 1051,
};
const SIZE_PAGE: Record<number, string> = {
  5: '/5-yard-dumpster-rental', 8: '/8-yard-dumpster-rental', 10: '/10-yard-dumpster-rental',
  20: '/20-yard-dumpster-rental', 30: '/30-yard-dumpster-rental', 40: '/40-yard-dumpster-rental',
  50: '/sizes',
};
const POPULAR_SIZE = 20;

/** Included weight is shown only when the price list and the size catalog agree. */
function confirmedTons(size: number): number | null {
  const listTons = PRICE_LIST_TONS[size];
  const catalogTons = GENERAL_DEBRIS_SIZES.find((s) => s.size === size)?.includedTons;
  if (listTons == null || catalogTons == null || listTons !== catalogTons) return null;
  return listTons;
}

const HERO_BADGES = [
  { icon: MapPin, label: 'Oakland & San Jose Yards' },
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: Package, label: '5–50 Yard Sizes' },
];

const Index = () => {
  const homepageFAQs = getFAQsForSchema(4);
  const navigate = useNavigate();
  const [heroInput, setHeroInput] = useState('');
  const [heroProject, setHeroProject] = useState('');
  const isValidZip = /^\d{5}$/.test(heroInput.trim());
  const isAddress = !isValidZip && heroInput.trim().length >= 3;

  // Build quote URL with ZIP or address preserved
  const quoteUrl = useCallback((extra?: Record<string, string>) => {
    const params = new URLSearchParams({ v3: '1' });
    if (isValidZip) params.set('zip', heroInput.trim());
    else if (isAddress) params.set('address', heroInput.trim());
    if (heroProject) params.set('project', heroProject);
    if (extra) Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    return `/quote?${params.toString()}`;
  }, [isValidZip, isAddress, heroInput, heroProject]);

  const handleHeroQuote = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    navigate(quoteUrl());
  }, [quoteUrl, navigate]);

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

      {/* ========== 1 — HERO + QUOTE FORM ========== */}
      <section className="bg-background py-8 md:py-14 lg:py-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-8 lg:gap-12 items-center">
            <div className="space-y-6 min-w-0">
              <div className="text-center lg:text-left space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-[1.1] tracking-tight">
                  Dumpster Rental in Oakland &amp; the Bay Area
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  Tell us your ZIP code and project type to request a dumpster quote.
                </p>
              </div>

              <form onSubmit={handleHeroQuote} className="max-w-md mx-auto lg:mx-0 space-y-4" aria-label="Request a dumpster quote">
                <div className="space-y-1.5">
                  <label htmlFor="hero-zip" className="block text-sm font-semibold text-foreground">ZIP code</label>
                  <div className="flex items-center bg-card rounded-xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-ring transition-shadow">
                    <MapPin className="w-5 h-5 text-muted-foreground ml-4 shrink-0" aria-hidden="true" />
                    <Input
                      id="hero-zip"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={heroInput}
                      onChange={(e) => setHeroInput(e.target.value)}
                      placeholder="e.g. 94607"
                      className="flex-1 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="hero-project" className="block text-sm font-semibold text-foreground">Project type</label>
                  <select
                    id="hero-project"
                    value={heroProject}
                    onChange={(e) => setHeroProject(e.target.value)}
                    className="w-full h-14 rounded-xl border border-border bg-card px-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select a project type</option>
                    {PROJECT_TYPES.map((p) => (
                      <option key={p.slug} value={p.slug}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <Button type="submit" size="lg" className="w-full h-14 rounded-xl text-base font-bold shadow-cta">
                  Get a Quote
                  <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button asChild variant="outline" size="lg" className="h-12 rounded-xl font-semibold">
                    <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                      <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                      Call
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 rounded-xl font-semibold">
                    <a href={`sms:${BUSINESS_INFO.phone.sales}`}>
                      <MessageSquare className="w-4 h-4 mr-2" aria-hidden="true" />
                      Text
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center lg:text-left">
                  Call / Text {BUSINESS_INFO.phone.salesFormatted} · English &amp; Español
                </p>
              </form>
            </div>

            <div className="min-w-0">
              <HeroImagePanel
                imageAlt="Calsan roll-off truck delivering a dumpster in the Bay Area"
                badges={HERO_BADGES}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== 2 — BRIEF CONFIRMED BENEFITS ========== */}
      <section className="bg-muted/30 py-5 border-y border-border" aria-label="Why Calsan">
        <div className="container-wide">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5 text-sm text-foreground/80 font-medium">
                <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ========== 3 — SIZE COMPARISON (single section) ========== */}
      <section className="py-12 md:py-16 bg-background" id="sizes">
        <div className="container-wide">
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Compare Dumpster Sizes</h2>
            <p className="text-muted-foreground mt-2">
              Sizes are in cubic yards (volume). Included weight is listed separately in tons. Delivery, pickup and a standard 7-day rental are included.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {GENERAL_DEBRIS_SIZES.map((s) => {
              const isPopular = s.size === POPULAR_SIZE;
              const tons = confirmedTons(s.size);
              const price = LOWEST_FROM[s.size];
              const useCases = DUMPSTER_SIZES_DATA.find((d) => d.yards === s.size)?.useCases.slice(0, 3) ?? [];
              return (
                <article
                  key={s.size}
                  className={`relative bg-card rounded-2xl border p-5 flex flex-col ${
                    isPopular ? 'border-primary ring-1 ring-primary/40' : 'border-border'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                      Most Popular
                    </span>
                  )}
                  <Link to={SIZE_PAGE[s.size]} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${s.size} yard dumpster details`}>
                    <DumpsterIllustration yards={s.size} width={320} className="w-full h-auto rounded-xl" />
                  </Link>
                  <h3 className="mt-4 text-2xl font-bold text-foreground">
                    {s.size} <span className="text-base font-medium text-muted-foreground">cubic yards</span>
                  </h3>
                  {useCases.length > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">Good for: {useCases.join(', ')}</p>
                  )}
                  <dl className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Included weight</dt>
                      <dd className="font-medium text-foreground text-right">
                        {tons != null ? `${tons} ton${tons !== 1 ? 's' : ''}` : 'Confirmed in quote'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Price</dt>
                      <dd className="font-semibold text-primary text-right">
                        {price ? `From $${price.toLocaleString()}` : 'Request a quote'}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-auto pt-4 space-y-2">
                    <Button asChild className="w-full h-11 rounded-xl font-semibold">
                      <Link to={quoteUrl({ size: String(s.size) })}>Select size</Link>
                    </Button>
                    <Link to={SIZE_PAGE[s.size]} className="block text-center text-sm font-medium text-primary hover:underline py-1">
                      {s.size} yard details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="max-w-3xl mx-auto mt-6 bg-muted/40 rounded-xl border border-border p-4 text-sm">
            <p className="font-semibold text-foreground mb-1">Heavy material (clean concrete or soil)</p>
            <p className="text-muted-foreground">8 yd from $571 · 10 yd from $608. Heavy loads have size limits.</p>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            "From" prices are for the closest service area. Your final price depends on ZIP, material and weight.{' '}
            <Link to="/sizes" className="underline hover:text-primary">All sizes &amp; pricing</Link>
            {' · '}
            <Link to="/waste-vision" className="underline hover:text-primary">Upload photos for size help</Link>
          </p>

          {/* Common projects (links kept for navigation / SEO) */}
          <div className="max-w-4xl mx-auto mt-8">
            <h3 className="text-center text-base font-semibold text-foreground mb-3">Common projects</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {PROJECT_TYPES.map(({ label, slug }) => (
                <Link
                  key={slug}
                  to={`/projects/${slug}`}
                  className="px-4 py-2 min-h-[44px] inline-flex items-center bg-card border border-border rounded-full text-sm font-medium text-foreground hover:border-primary/40"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-10">
            <h3 className="text-center text-lg font-semibold text-foreground mb-3">Not sure what size you need?</h3>
            <Suspense fallback={<SectionLoader />}>
              <HomepageAIAssistant />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ========== 4 — HOW IT WORKS ========== */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-wide">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-foreground mb-8">How It Works</h2>
          <ol className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <li key={step.number} className="text-center">
                <div className="relative mx-auto mb-3 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </li>
            ))}
          </ol>
          <div className="max-w-3xl mx-auto mt-10">
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-card">
              <video className="w-full aspect-video" controls playsInline preload="none" src={howItWorksVideo.url} />
            </div>
          </div>
        </div>
      </section>

      {/* ========== 5 — JOB PHOTOS + VERIFIED REVIEWS ========== */}
      <PhotoCarousel />
      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>

      {/* ========== 6 — COVERAGE ========== */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Local Bay Area Coverage</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We operate from yards in Oakland and San Jose and support projects across the Bay Area, including{' '}
              {SERVICE_AREAS_CITIES.join(', ')}. Selected other California markets are coordinated through our service network.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                ['Oakland', '/dumpster-rental-oakland-ca'],
                ['San Jose', '/dumpster-rental-san-jose-ca'],
                ['San Francisco', '/dumpster-rental-san-francisco-ca'],
                ['Bay Area', '/areas'],
                ['California', '/areas/california'],
              ].map(([label, to]) => (
                <Link key={to} to={to} className="px-4 py-2 min-h-[44px] inline-flex items-center bg-muted/50 border border-border rounded-full text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECONDARY — CONTRACTORS & CONSTRUCTION CLEANUP ========== */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-3">
                <HardHat className="w-5 h-5 text-primary" aria-hidden="true" />
                <h2 className="font-bold text-foreground text-lg">For Contractors</h2>
              </div>
              <ul className="space-y-1.5 mb-4">
                {CONTRACTOR_BENEFITS.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />{b}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="rounded-xl font-semibold">
                <Link to="/contractor-application">Apply for Contractor Account</Link>
              </Button>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-1">
                <Building2 className="w-5 h-5 text-accent" aria-hidden="true" />
                <h2 className="font-bold text-foreground text-lg">Construction Cleanup</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Calsan C&amp;D Waste Removal handles cleanup labor when you need a crew, not just a container.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mb-4 text-sm">
                {[
                  ['Construction Cleanup', '/cleanup/construction-cleanup'],
                  ['Post-Construction', '/cleanup/post-construction-cleanup'],
                  ['Demolition Debris', '/cleanup/demolition-debris-cleanup'],
                  ['Recurring Cleanup', '/cleanup/recurring-jobsite-cleanup'],
                  ['For Contractors', '/cleanup/for-contractors'],
                  ['Cleanup Overview', '/cleanup'],
                ].map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="inline-flex min-h-[36px] items-center text-primary hover:underline">{label}</Link>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="rounded-xl font-semibold">
                <Link to="/cleanup/quote">Request Cleanup Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 7 — FAQ ========== */}
      <Suspense fallback={<SectionLoader />}>
        <FAQSection limit={6} />
      </Suspense>

      <section className="py-8 bg-background">
        <div className="container-wide text-center">
          <Link to="/blog" className="inline-flex items-center gap-2 min-h-[44px] text-primary font-semibold hover:underline">
            <Newspaper className="w-4 h-4" aria-hidden="true" />
            News &amp; Updates — guides and Bay Area tips on the Calsan Blog
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ========== 8 — FINAL CONTACT ========== */}
      <section className="py-14 md:py-20 gradient-hero">
        <div className="container-narrow text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">Ready for a Quote?</h2>
          <p className="text-primary-foreground/85 mb-6 max-w-xl mx-auto">
            Request a quote online, or call / text our Bay Area team at {BUSINESS_INFO.phone.salesFormatted}.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-xl mx-auto">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold px-8 shadow-cta">
              <Link to={quoteUrl()}>Get a Quote<ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl font-semibold px-8 bg-background text-foreground hover:bg-background/90">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}><Phone className="w-4 h-4 mr-2" aria-hidden="true" />Call / Text</a>
            </Button>
          </div>
          <p className="mt-5 text-sm">
            <Link to="/contact-us" className="text-primary-foreground underline underline-offset-4">Contact us</Link>
          </p>
        </div>
      </section>

      <div
        data-build-source="src/pages/Index.tsx"
        data-build-time={BUILD_INFO.timestamp}
        data-build-env={BUILD_INFO.env}
        className="hidden"
        aria-hidden="true"
      />
    </Layout>
  );
};

export default Index;
