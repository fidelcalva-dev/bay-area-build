import { Link } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { CORE_SERVICES, CLEANUP_BRAND, BRAND_CLARIFICATION } from '@/config/cleanup/content';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight } from 'lucide-react';

interface LocalPageConfig {
  slug: string;
  city: string;
  seoTitle: string;
  metaDesc: string;
  h1: string;
  intro: string;
  projectTypes: string[];
  nearbyLinks: { label: string; href: string }[];
  isHub?: boolean;
}

const LOCAL_PAGES: Record<string, LocalPageConfig> = {
  'oakland-construction-cleanup': {
    slug: 'oakland-construction-cleanup',
    city: 'Oakland',
    seoTitle: 'Construction Cleanup Oakland CA | Calsan C&D Waste Removal',
    metaDesc: 'Professional construction cleanup, post-construction cleanup, and demolition debris cleanup in Oakland, CA. Local crews, fast response. CSLB #1152237.',
    h1: 'Construction Cleanup in Oakland, CA',
    intro: 'Oakland is our home market. From active remodels in Rockridge to ADU builds in Temescal, commercial turnovers downtown, and jobsite cleanup across East Oakland — our crews operate here daily with the fastest response in the market.',
    projectTypes: [
      'Kitchen and bath remodels',
      'ADU construction and conversion',
      'Additions and expansions',
      'Commercial tenant improvement cleanup',
      'Multi-unit turnover cleanup',
      'Demo debris cleanup for renovation phases',
    ],
    nearbyLinks: [
      { label: 'Alameda', href: '/cleanup/alameda-construction-cleanup' },
      { label: 'Bay Area', href: '/cleanup/bay-area-construction-cleanup' },
    ],
  },
  'alameda-construction-cleanup': {
    slug: 'alameda-construction-cleanup',
    city: 'Alameda',
    seoTitle: 'Construction Cleanup Alameda CA | Calsan C&D Waste Removal',
    metaDesc: 'Construction cleanup, post-construction cleanup, and recurring jobsite service in Alameda, CA. Licensed, fast, professional. CSLB #1152237.',
    h1: 'Construction Cleanup in Alameda, CA',
    intro: 'Alameda\'s residential remodels, ADU builds, and property turnovers need cleanup that fits island logistics. Our crews serve Alameda regularly with reliable scheduling and professional service.',
    projectTypes: [
      'Residential remodel cleanup',
      'ADU and garage conversion cleanup',
      'Post-construction final clean',
      'Property turnover cleanup',
      'Recurring site support',
    ],
    nearbyLinks: [
      { label: 'Oakland', href: '/cleanup/oakland-construction-cleanup' },
      { label: 'Bay Area', href: '/cleanup/bay-area-construction-cleanup' },
    ],
  },
  'bay-area-construction-cleanup': {
    slug: 'bay-area-construction-cleanup',
    city: 'Bay Area',
    seoTitle: 'Bay Area Construction Cleanup | Calsan C&D Waste Removal',
    metaDesc: 'Professional construction cleanup across the Bay Area. Oakland, Alameda, and extended service area. CSLB #1152237.',
    h1: 'Construction Cleanup Across the Bay Area',
    intro: 'From our Oakland base, we serve construction cleanup projects across the Bay Area. Whether it\'s a remodel in Alameda, a commercial turnover in San Leandro, or a recurring site in Berkeley — contact us to confirm availability for your project location.',
    projectTypes: [
      'Active jobsite cleanup',
      'Post-construction and final cleanup',
      'Demolition debris cleanup',
      'Recurring contractor support',
      'ADU and residential remodel cleanup',
      'Light commercial cleanup',
    ],
    nearbyLinks: [
      { label: 'Oakland', href: '/cleanup/oakland-construction-cleanup' },
      { label: 'Alameda', href: '/cleanup/alameda-construction-cleanup' },
    ],
    isHub: true,
  },
};

export default function CleanupLocalPage() {
  const slug = window.location.pathname.replace('/cleanup/', '');
  const page = LOCAL_PAGES[slug];

  if (!page) {
    return null;
  }

  return (
    <CleanupLayout title={page.seoTitle} description={page.metaDesc}>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">{page.h1}</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mb-6">{page.intro}</p>
          <Button asChild size="lg" variant="cta">
            <Link to="/cleanup/quote">Get a Quote for {page.city}</Link>
          </Button>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Cleanup Services in {page.city}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {CORE_SERVICES.map((svc) => (
              <Link
                key={svc.code}
                to={`/cleanup/${svc.slug}`}
                className="group flex items-center gap-3 bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{svc.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{svc.startingPrice}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
              </Link>
            ))}
          </div>

          {/* Common projects */}
          <h2 className="text-xl font-bold text-foreground mb-4">Common {page.city} Projects</h2>
          <div className="grid sm:grid-cols-2 gap-2 mb-10">
            {page.projectTypes.map((p) => (
              <div key={p} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{p}</span>
              </div>
            ))}
          </div>

          {/* Nearby */}
          <div className="bg-muted rounded-xl border border-border p-5 mb-10">
            <h3 className="font-semibold text-foreground mb-3">Nearby Service Areas</h3>
            <div className="flex flex-wrap gap-3">
              {page.nearbyLinks.map((l) => (
                <Link key={l.href} to={l.href} className="text-sm text-primary hover:underline">{l.label} →</Link>
              ))}
              <Link to="/cleanup/for-contractors" className="text-sm text-primary hover:underline">For Contractors →</Link>
              <Link to="/cleanup/pricing" className="text-sm text-primary hover:underline">Pricing →</Link>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Need Cleanup Support in {page.city}?
            </h2>
            <p className="text-muted-foreground mb-6">
              Send us project details and photos for the fastest recommendation.
            </p>
            <Button asChild size="lg" variant="cta">
              <Link to="/cleanup/quote">Request a Quote</Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-6">{BRAND_CLARIFICATION}</p>
          </div>
        </div>
      </section>
    </CleanupLayout>
  );
}
