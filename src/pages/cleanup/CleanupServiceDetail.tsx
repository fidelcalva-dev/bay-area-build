import { Link, useParams } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { CORE_SERVICES, CLEANUP_BRAND, BRAND_CLARIFICATION, SURCHARGES } from '@/config/cleanup/content';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Navigate } from 'react-router-dom';

// Per-service detail content
const SERVICE_DETAILS: Record<string, {
  seoTitle: string;
  metaDesc: string;
  h1: string;
  intro: string;
  bestFit: string[];
  included: string[];
  pricingHeadline: string;
  pricingBody: string;
  whyTitle: string;
  whyPoints: string[];
  ctaText: string;
}> = {
  'construction-cleanup': {
    seoTitle: 'Construction Cleanup for Active Jobsites | Calsan C&D Waste Removal',
    metaDesc: 'Professional construction cleanup for active jobsites, remodels, ADUs, and trade-heavy phases in Oakland, Alameda, and the Bay Area. From $495. CSLB #1152237.',
    h1: 'Construction Cleanup for Active Jobsites',
    intro: 'Active jobsites generate debris between every trade, every phase, and every walkthrough. Our construction cleanup service keeps sites safer, cleaner, and ready for the next crew without slowing down the schedule.',
    bestFit: [
      'Active residential remodels',
      'ADU construction sites',
      'Additions and expansions',
      'Trade-heavy phases needing cleanup between crews',
      'Periodic site cleanup and reset',
    ],
    included: [
      'Debris collection and staging',
      'Material sorting for disposal',
      'Broom-clean or rough-clean to spec',
      'Haul-off coordination when applicable',
      'Site photo documentation',
    ],
    pricingHeadline: 'Construction Cleanup Pricing',
    pricingBody: 'Typical starting range: From $495. Common pricing structure: scope-based, labor-based, or scope plus disposal depending on site conditions.',
    whyTitle: 'Why Construction Cleanup Matters',
    whyPoints: [
      'Safer active jobsite conditions',
      'Cleaner presentation for walkthroughs and inspections',
      'Easier transitions between trade crews',
      'Reduced risk of delays from debris buildup',
    ],
    ctaText: 'Request Construction Cleanup Pricing',
  },
  'post-construction-cleanup': {
    seoTitle: 'Final & Post-Construction Cleanup | Calsan C&D Waste Removal',
    metaDesc: 'Post-construction and final cleanup for turnover-ready projects in Oakland, Alameda, and the Bay Area. $0.35–$0.65/sqft, $695 minimum. CSLB #1152237.',
    h1: 'Final & Post-Construction Cleanup for Turnover-Ready Projects',
    intro: 'When the build is done, the cleanup has to match the quality of the finished work. Our post-construction cleanup prepares spaces for walkthroughs, inspections, tenant move-in, or owner handoff.',
    bestFit: [
      'Remodel and ADU final turnover',
      'New construction final clean',
      'Light commercial tenant improvement turnover',
      'Pre-inspection cleanup',
      'Owner or property manager handoff',
    ],
    included: [
      'Detailed surface cleaning',
      'Window, trim, and fixture wipe-down',
      'Floor preparation and cleaning',
      'Debris removal from all areas',
      'Final walkthrough-ready presentation',
    ],
    pricingHeadline: 'Post-Construction Cleanup Pricing',
    pricingBody: '$0.35–$0.65 per square foot, $695 minimum service. Photos and project condition help us confirm the right level of detail and final scope.',
    whyTitle: 'Why Final Cleanup Matters',
    whyPoints: [
      'Turnover-ready presentation for walkthroughs',
      'Professional handoff to owners, tenants, or managers',
      'Pass inspections with confidence',
      'Protect the quality of the finished work',
    ],
    ctaText: 'Get a Final Cleanup Quote',
  },
  'demolition-debris-cleanup': {
    seoTitle: 'Construction & Demolition Debris Cleanup | Calsan C&D Waste Removal',
    metaDesc: 'C&D debris cleanup for demolition phases in Oakland, Alameda, and the Bay Area. Labor, staging, haul-off, and disposal coordination. From $695. CSLB #1152237.',
    h1: 'Construction & Demolition Debris Cleanup',
    intro: 'Demolition and heavy construction phases create volume. Our debris cleanup service handles the labor, staging, loading, and coordination so the site stays ready for the next step.',
    bestFit: [
      'Interior demolition debris cleanup',
      'Exterior site debris staging and removal',
      'Material gathering and consolidation',
      'Haul-off and disposal coordination',
      'Phase-end site reset',
    ],
    included: [
      'Labor for debris collection and staging',
      'Material sorting by type',
      'Loading and haul-off when applicable',
      'Disposal path coordination',
      'Site documentation and close-out photos',
    ],
    pricingHeadline: 'Demolition Debris Cleanup Pricing',
    pricingBody: 'Starting range: From $695 + disposal. Final cost depends on debris volume, material type, loading conditions, access, and disposal path.',
    whyTitle: 'Why Demo Debris Cleanup Matters',
    whyPoints: [
      'Faster site turnaround between phases',
      'Proper material handling and disposal compliance',
      'Safer working conditions for follow-on trades',
      'Reduced project delays from debris buildup',
    ],
    ctaText: 'Request Post-Demo Cleanup Pricing',
  },
  'recurring-jobsite-cleanup': {
    seoTitle: 'Recurring Jobsite Cleanup for Contractors | Calsan C&D Waste Removal',
    metaDesc: 'Scheduled recurring jobsite cleanup for contractors with active projects in Oakland, Alameda, and the Bay Area. From $1,200/month. CSLB #1152237.',
    h1: 'Recurring Jobsite Cleanup for Contractors Who Need Reliable Support',
    intro: 'If you run multiple projects or long-duration builds, recurring cleanup keeps your sites cleaner without you having to rescope and request service every time. We show up on schedule and handle the ongoing work.',
    bestFit: [
      'GCs with active multi-phase projects',
      'Long-duration residential and commercial builds',
      'Property managers with multiple turnover properties',
      'Contractors managing multiple active jobsites',
      'Projects needing weekly or bi-weekly support',
    ],
    included: [
      'Scheduled site visits (weekly, bi-weekly, or custom)',
      'Ongoing debris management',
      'Phase-transition cleanup between trades',
      'Site presentation maintenance',
      'Consistent crew assignment',
    ],
    pricingHeadline: 'Recurring Cleanup Pricing',
    pricingBody: 'From $1,200/month. Weekly visit base $295. Custom schedules and multi-site plans available.',
    whyTitle: 'Why Recurring Cleanup Works',
    whyPoints: [
      'Cleaner active sites without constant re-requests',
      'Fewer last-minute cleanup issues',
      'Better jobsite presentation for inspections',
      'Easier phase transitions',
      'Consistent support from a team that knows the project',
    ],
    ctaText: 'Request a Recurring Cleanup Plan',
  },
};

export default function CleanupServiceDetail() {
  const slug = window.location.pathname.split('/cleanup/')[1];
  const detail = SERVICE_DETAILS[slug];
  const service = CORE_SERVICES.find((s) => s.slug === slug);

  if (!detail || !service) {
    return <Navigate to="/cleanup/services" replace />;
  }

  return (
    <CleanupLayout title={detail.seoTitle} description={detail.metaDesc}>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">{detail.h1}</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mb-6">{detail.intro}</p>
          <Button asChild size="lg" variant="cta">
            <Link to="/cleanup/quote">{detail.ctaText}</Link>
          </Button>
        </div>
      </section>

      {/* Best Fit */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Best-Fit Projects</h2>
            <ul className="space-y-2">
              {detail.bestFit.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">What May Be Included</h2>
            <ul className="space-y-2">
              {detail.included.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground mb-3">{detail.pricingHeadline}</h2>
          <p className="text-muted-foreground mb-6">{detail.pricingBody}</p>
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-3 text-sm">Common Surcharges</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SURCHARGES.map((s) => (
                <div key={s.label} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{s.value}</span> {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground mb-4">{detail.whyTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {detail.whyPoints.map((p) => (
              <div key={p} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 mb-6">
            Tell us about your project and we'll follow up with the right scope and pricing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg" variant="cta">
              <Link to="/cleanup/quote">{detail.ctaText}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/cleanup/contact">Contact Us</Link>
            </Button>
          </div>
          <p className="text-xs text-primary-foreground/50 mt-6">{BRAND_CLARIFICATION}</p>
        </div>
      </section>
    </CleanupLayout>
  );
}
