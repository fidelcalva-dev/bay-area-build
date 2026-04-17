import { Suspense, lazy, useState, useCallback } from 'react'; // homepage
import { PhotoCarousel } from '@/components/home/PhotoCarousel';
import { BUILD_INFO } from '@/lib/buildInfo';
import { Layout } from '@/components/layout/Layout';
import { PAGE_SEO, generateFAQSchema, generateBreadcrumbSchema, BUSINESS_INFO } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';
import { GENERAL_DEBRIS_SIZES, HEAVY_MATERIAL } from '@/config/pricingConfig';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Shield, MapPin, ArrowRight, ArrowLeft, Phone, CheckCircle, Scale, MessageSquare,
  Truck, Star, Clock, Wrench, Upload, Package, Hammer, Users, Globe, HardHat,
  Search, Building2, Home, TreePine, Shovel,
} from 'lucide-react';
import { DumpsterIllustration } from '@/components/dumpster/DumpsterIllustration';
import { DumpsterSizeComparison } from '@/components/dumpster/DumpsterSizeComparison';
import { SizeCategoryBadge } from '@/components/sizes/SizeCategoryBadge';

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
    if (extra) Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    return `/quote?${params.toString()}`;
  }, [isValidZip, isAddress, heroInput]);

  const handleHeroQuote = useCallback(() => {
    const params = new URLSearchParams({ v3: '1' });
    if (isValidZip) params.set('zip', heroInput.trim());
    else if (isAddress) params.set('address', heroInput.trim());
    if (heroProject) params.set('project', heroProject);
    navigate(`/quote?${params.toString()}`);
  }, [isValidZip, isAddress, heroInput, heroProject, navigate]);

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
      <section className="bg-background py-10 md:py-16 lg:py-20">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-8 lg:gap-12 items-center">
            {/* Left — Content + Form */}
            <div className="order-1 lg:order-1 space-y-6">
              <div className="text-center lg:text-left space-y-4">
                <p className="text-sm font-semibold text-primary tracking-wide uppercase">10+ Years Local Experience · Since 2015</p>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-[1.1] tracking-tight">
                  Bay Area Dumpster Rental
                  <span className="block text-primary mt-1">Transparent Pricing. No Hidden Fees.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl mx-auto lg:mx-0">
                  See your all-in price upfront — delivery, pickup, and included weight shown before you book. No surprises, no bait-and-switch.
                </p>
                {/* Dynamic starting price from config */}
                <p className="text-base text-foreground font-semibold">
                  Starting at ${GENERAL_DEBRIS_SIZES[0]?.price || 395} · 7-day rental · Delivery included
                </p>
              </div>

              {/* Mini Quote Starter */}
              <div className="max-w-md mx-auto lg:mx-0 space-y-3">
                <div className="flex items-center bg-card rounded-2xl border border-border shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                  <div className="flex items-center pl-4 pr-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    value={heroInput}
                    onChange={(e) => setHeroInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleHeroQuote(); }}
                    placeholder="Service address or ZIP"
                    className="flex-1 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                  />
                </div>
                <select
                  value={heroProject}
                  onChange={(e) => setHeroProject(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-border bg-card px-4 text-sm text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none appearance-none"
                >
                  <option value="">What are you working on?</option>
                  <option value="home-cleanout">Home Cleanout</option>
                  <option value="kitchen-remodel">Kitchen Remodel</option>
                  <option value="roof-replacement">Roofing Debris</option>
                  <option value="construction-debris">Construction Debris</option>
                  <option value="garage-cleanout">Garage Cleanout</option>
                  <option value="estate-cleanout">Estate Cleanout</option>
                  <option value="yard-cleanup">Yard Cleanup</option>
                  <option value="concrete-soil">Concrete / Soil Removal</option>
                </select>
                {/* Urgency badge */}
                <div className="flex justify-center lg:justify-start">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                    Same-day delivery available in Oakland & San Jose
                  </span>
                </div>

                {/* Trust proof lines */}
                <div className="space-y-1 text-center lg:text-left">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center lg:justify-start">
                    <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                    4.9★ from 89 verified Bay Area customers
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center lg:justify-start">
                    <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                    Same-day delivery available
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center lg:justify-start">
                    <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                    Included weight shown upfront — no hidden fees
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleHeroQuote}
                  className="w-full h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-cta"
                >
                  See My Exact Price Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center lg:text-left">Instant price — no account needed · No spam · Cancel anytime before delivery</p>
              </div>

              {/* Supporting CTAs */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 max-w-[520px] mx-auto lg:mx-0">
                <Button asChild variant="outline" size="lg" className="rounded-full font-semibold px-6 text-sm flex-1">
                  <Link to="/waste-vision">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photos for Size Help
                  </Link>
                </Button>
              </div>
              {/* Prominent phone number */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 items-center">
                <a
                  href={`tel:${BUSINESS_INFO.phone.sales}`}
                  className="inline-flex items-center gap-2 text-lg md:text-xl font-bold text-primary hover:text-primary/80 transition-colors min-h-[44px]"
                >
                  <Phone className="w-5 h-5" />
                  {BUSINESS_INFO.phone.salesFormatted}
                </a>
                <span className="hidden sm:inline text-muted-foreground">·</span>
                <a
                  href={`sms:${BUSINESS_INFO.phone.sales}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4" />
                  Text Us
                </a>
              </div>
              <p className="text-center lg:text-left text-sm text-muted-foreground">
                Need cleanup too?{' '}
                <Link to="/cleanup" className="text-primary font-medium hover:underline">
                  The same trusted team now offers construction cleanup →
                </Link>
              </p>
            </div>

            {/* Right — Hero Image */}
            <div className="order-2 lg:order-2">
              <HeroImagePanel />
            </div>
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

      {/* ========== SECTION 3 — MAIN ACTION BLOCK ========== */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              How Can We Help You Today?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {ACTION_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              if (opt.href) {
                return (
                  <a
                    key={opt.label}
                    href={`tel:${BUSINESS_INFO.phone.sales}`}
                    className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-muted/30 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
                    </div>
                    <span>{opt.label}</span>
                  </a>
                );
              }
              return (
                <Link
                  key={opt.label}
                  to={opt.to === '/quote?v3=1' ? quoteUrl() : opt.to === '/quote?v3=1&schedule=1' ? quoteUrl({ schedule: '1' }) : opt.to!}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold transition-all ${
                    opt.primary
                      ? 'bg-primary text-primary-foreground shadow-cta hover:bg-primary/90'
                      : 'bg-card border border-border text-foreground hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    opt.primary ? 'bg-primary-foreground/20' : 'bg-primary/10'
                  }`}>
                    <Icon className={`w-4 h-4 ${opt.primary ? 'text-primary-foreground' : 'text-primary'}`} strokeWidth={1.8} />
                  </div>
                  <span>{opt.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== CLEANUP ANNOUNCEMENT STRIP ========== */}
      <div className="bg-accent/10 border-b border-accent/20">
        <div className="container-wide py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <p className="text-sm font-semibold text-foreground">
              <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded mr-2">NEW</span>
              Construction Cleanup Division Now Available
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Calsan C&amp;D Waste Removal now supports active jobsites, final cleanups, demolition debris, and recurring contractor cleanup.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/cleanup" className="text-xs font-semibold text-primary hover:underline">Learn More →</Link>
            <Link to="/cleanup/quote" className="text-xs font-semibold text-accent hover:underline">Get Cleanup Quote →</Link>
          </div>
        </div>
      </div>

      {/* ========== PHOTO CAROUSEL ========== */}
      <PhotoCarousel />

      {/* ========== SECTION 4 — WHAT'S INCLUDED ========== */}
      <section className="py-10 md:py-14 bg-muted/30">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto bg-card rounded-2xl border border-border p-6 md:p-8">
            <h2 className="font-bold text-foreground text-lg md:text-xl mb-4 text-center">
              What's Included
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WHATS_INCLUDED.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 5 — PRICE ANCHOR (All sizes + heavy) ========== */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Popular Dumpster Sizes &amp; Starting Prices
            </h2>
          </div>

          {/* Size grid — responsive: 1 col mobile, 2 col sm, 3 col lg */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-6">
            {GENERAL_DEBRIS_SIZES.filter(s => s.size !== 50).map((s) => {
              const isMostPopular = s.size === 20;
              return (
                <Link
                  key={s.size}
                  to={quoteUrl({ size: String(s.size) })}
                  className={`relative bg-card rounded-2xl border p-4 md:p-8 text-center hover:shadow-xl transition-all group flex flex-col items-center ${
                    isMostPopular
                      ? 'border-primary/60 ring-2 ring-primary/30 shadow-lg'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  {isMostPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-md whitespace-nowrap">
                        ★ Most Popular
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <SizeCategoryBadge yards={s.size} />
                  </div>
                  <div className="w-full flex justify-center mb-5 mt-4 relative px-2">
                    <DumpsterIllustration yards={s.size} width={220} className="w-full h-auto max-w-[220px]" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-1">
                    {s.size}<span className="text-lg font-medium text-muted-foreground ml-1">yd</span>
                  </div>
                  <div className="text-lg font-semibold text-primary mt-3">From ${s.price.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.includedTons} ton{s.includedTons !== 1 ? 's' : ''} included</div>
                </Link>
              );
            })}
          </div>

          {/* Second row: 50 yd centered */}
          <div className="flex justify-center max-w-5xl mx-auto mb-6">
            <Link
              to={quoteUrl({ size: '50' })}
              className="relative bg-card rounded-2xl border border-border p-8 md:p-10 text-center hover:border-primary/30 hover:shadow-xl transition-all group flex flex-col items-center w-full max-w-xs"
            >
              <div className="absolute top-3 right-3">
                <SizeCategoryBadge yards={50} />
              </div>
              <div className="w-full flex justify-center mb-5 mt-4 relative px-2">
                <DumpsterIllustration yards={50} width={240} className="w-full h-auto max-w-[240px]" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-1">
                50<span className="text-lg font-medium text-muted-foreground ml-1">yd</span>
              </div>
              <div className="text-lg font-semibold text-primary mt-3">From ${GENERAL_DEBRIS_SIZES.find(s => s.size === 50)?.price.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">{GENERAL_DEBRIS_SIZES.find(s => s.size === 50)?.includedTons} tons included</div>
            </Link>
          </div>

          {/* Heavy material note */}
          <div className="max-w-2xl mx-auto bg-muted/40 rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Heavy Material Pricing (Soil / Concrete)</h3>
            <div className="flex flex-wrap gap-4">
              {HEAVY_MATERIAL.cleanSoil.allowedSizes.map((size) => (
                <div key={size} className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{size} yd</span> — ${HEAVY_MATERIAL.cleanSoil.prices[size]}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Final pricing depends on material, location, and included weight.{' '}
            <Link to="/sizes" className="underline hover:text-primary">View all sizes</Link>
          </p>
        </div>
      </section>

      {/* ========== SECTION 6 — HOW IT WORKS ========== */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              How It Works
            </h2>
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

      {/* ========== SECTION 7 — AI ASSISTANT (compact) ========== */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container-wide">
          <div className="text-center mb-5">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Not Sure What Size You Need?
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm max-w-md mx-auto">
              Ask our dumpster assistant for a quick recommendation, then get exact pricing by ZIP.
            </p>
          </div>
          <Suspense fallback={<SectionLoader />}>
            <HomepageAIAssistant />
          </Suspense>
        </div>
      </section>

      {/* ========== SECTION 8 — COMMON PROJECTS ========== */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Common Project Types
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {PROJECT_TYPES.map(({ label, slug, icon: Icon }) => (
              <Link
                key={slug}
                to={`/projects/${slug}`}
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

      {/* ========== SECTION 8.5 — VISUAL SIZE COMPARISON ========== */}
      <DumpsterSizeComparison />

      {/* ========== SECTION 9 — WHY CALSAN ========== */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
              Why Customers Choose Calsan
            </h2>
            <div className="space-y-3">
              {WHY_CALSAN.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 10 — LOCAL COVERAGE ========== */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
              Local Bay Area Coverage
            </h2>

            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We operate directly from Oakland and San Jose and support projects across the Bay Area, including{' '}
                    {SERVICE_AREAS_CITIES.join(', ')}.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Need service outside the Bay Area? We also coordinate dumpster rental in selected California markets through our service network.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/dumpster-rental-oakland-ca" className="px-3 py-1.5 bg-muted/50 border border-border rounded-full text-xs font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors">Oakland</Link>
                    <Link to="/dumpster-rental-san-jose-ca" className="px-3 py-1.5 bg-muted/50 border border-border rounded-full text-xs font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors">San Jose</Link>
                    <Link to="/dumpster-rental-san-francisco-ca" className="px-3 py-1.5 bg-muted/50 border border-border rounded-full text-xs font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors">San Francisco</Link>
                    <Link to="/areas" className="px-3 py-1.5 bg-muted/50 border border-border rounded-full text-xs font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors">Bay Area</Link>
                    <Link to="/areas/california" className="px-3 py-1.5 bg-muted/50 border border-border rounded-full text-xs font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors">California</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 11 — CONTRACTOR BLOCK ========== */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto bg-card rounded-2xl border border-border p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <HardHat className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-foreground text-lg md:text-xl mb-3">Built for Contractors</h2>
                <div className="space-y-2 mb-4">
                  {CONTRACTOR_BENEFITS.map((b) => (
                    <div key={b} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
                <Button asChild size="lg" className="rounded-full font-semibold px-6">
                  <Link to="/contractor-application">
                    Apply for Contractor Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 12 — REVIEWS ========== */}
      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>

      {/* ========== SECTION 13 — FAQ ========== */}
      <Suspense fallback={<SectionLoader />}>
        <FAQSection limit={6} />
      </Suspense>

      {/* ========== SPLIT SERVICE SELECTOR ========== */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Two Service Lines, One Trusted Team</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
              The same team you know as Calsan Dumpsters Pro, now with a dedicated construction cleanup division.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Dumpster Rentals */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Dumpster Rentals</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Roll-off dumpsters, debris containers, and self-loaded projects across the Bay Area.
              </p>
              <Button asChild size="lg" className="w-full rounded-xl">
                <Link to={quoteUrl()}>Rent a Dumpster</Link>
              </Button>
            </div>
            {/* Cleanup */}
            <div className="bg-card rounded-2xl border-2 border-accent p-6 md:p-8 text-center relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">NEW</span>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <HardHat className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Construction Cleanup</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Active jobsite cleanup, final cleanup, demolition debris, and recurring contractor support.
              </p>
              <Button asChild size="lg" variant="cta" className="w-full rounded-xl">
                <Link to="/cleanup/quote">Request Cleanup Service</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHICH SERVICE DO I NEED? ========== */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container-wide max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6">Which Service Do I Need?</h2>
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-1">Choose a Dumpster Rental when…</h3>
              <p className="text-sm text-muted-foreground">You need a container placed on-site, your crew loads it, and we pick it up when you're done.</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-1">Choose Cleanup Service when…</h3>
              <p className="text-sm text-muted-foreground">You need our crew to handle the cleanup labor — debris collection, site reset, final cleaning, or recurring support.</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-1">Need both?</h3>
              <p className="text-sm text-muted-foreground">Many projects use dumpster rental plus cleanup support. We can coordinate both service lines for your project.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg" className="rounded-full font-semibold px-8">
              <Link to={quoteUrl()}>Start With Dumpster Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full font-semibold px-8">
              <Link to="/cleanup/quote">Start With Cleanup Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== CLEANUP TEASER ========== */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Construction Cleanup &amp; Debris Removal for Contractors and Owners
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
            {[
              { name: 'Construction Cleanup', desc: 'Active jobsite cleanup and site reset between trades.', href: '/cleanup/construction-cleanup' },
              { name: 'Final / Post-Construction', desc: 'Turnover-ready cleanup for walkthroughs and handoff.', href: '/cleanup/post-construction-cleanup' },
              { name: 'Demolition Debris', desc: 'Debris staging, loading, and disposal coordination.', href: '/cleanup/demolition-debris-cleanup' },
              { name: 'Recurring Cleanup', desc: 'Scheduled support for contractors with active projects.', href: '/cleanup/recurring-jobsite-cleanup' },
            ].map((svc) => (
              <Link
                key={svc.name}
                to={svc.href}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-accent/30 transition-all group"
              >
                <h3 className="font-bold text-foreground text-sm mb-2">{svc.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{svc.desc}</p>
                <span className="text-xs font-medium text-accent group-hover:underline">Learn More →</span>
              </Link>
            ))}
          </div>
          <div className="text-center flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild variant="outline" size="lg" className="rounded-full font-semibold px-6">
              <Link to="/cleanup/for-contractors">For Contractors</Link>
            </Button>
            <Button asChild variant="cta" size="lg" className="rounded-full font-semibold px-6">
              <Link to="/cleanup/quote">Request Cleanup Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== SECTION 14 — FINAL CTA ========== */}
      <section className="py-14 md:py-20 gradient-hero">
        <div className="container-narrow text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-semibold px-8 shadow-cta text-base">
              <Link to={quoteUrl()}>
                Get Dumpster Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full font-semibold px-8 border-primary-foreground/30 text-accent hover:bg-primary-foreground/10 hover:text-accent text-base">
              <Link to="/cleanup/quote">
                Request Cleanup Quote
              </Link>
            </Button>
          </div>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline" size="lg" className="rounded-full font-semibold px-8 border-primary-foreground/30 text-accent hover:bg-primary-foreground/10 hover:text-accent text-base">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-4 h-4 mr-2" />
                Call / Text Us
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== SECTION 15 — CONTACT US CTA ========== */}
      <section className="py-10 md:py-14 bg-muted">
        <div className="container-narrow text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Have Questions?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Reach out to our team — we're here to help you pick the right dumpster and get it delivered fast.
          </p>
          <Button asChild size="lg" className="rounded-full font-semibold px-10 text-base shadow-cta">
            <Link to="/contact-us">
              Contact Us
            </Link>
          </Button>
        </div>
      </section>

      {/* Build fingerprint — invisible metadata only (visible overlay removed) */}
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
