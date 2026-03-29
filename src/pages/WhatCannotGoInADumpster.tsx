import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { generateFAQSchema, generateBreadcrumbSchema, BUSINESS_INFO } from '@/lib/seo';
import { PageFAQ, InternalLinkCluster, type FAQItem } from '@/components/seo';
import { SeoTrustBar } from '@/components/seo/SeoTrustBar';
import { SeoReviewProof } from '@/components/seo/SeoReviewProof';
import { StickyMobileCTA } from '@/components/seo/StickyMobileCTA';
import { useSeoTracking } from '@/hooks/useSeoTracking';
import {
  XCircle, ArrowRight, Phone, AlertTriangle, Info,
  CheckCircle, DollarSign, Shield
} from 'lucide-react';

const PROHIBITED_ITEMS = [
  {
    item: 'Hazardous Waste',
    description: 'Chemicals, solvents, pesticides, herbicides, oil-based paints, pool chemicals, cleaning agents with warning labels.',
    reason: 'Federal and state environmental law prohibits disposal in standard landfills.',
    alternative: 'Contact your local Household Hazardous Waste (HHW) facility. Alameda County and Santa Clara County both operate free drop-off programs.',
  },
  {
    item: 'Batteries (All Types)',
    description: 'Car batteries, lithium-ion batteries, rechargeable batteries, button cells.',
    reason: 'Batteries contain heavy metals and flammable electrolytes that can cause fires.',
    alternative: 'Most auto parts stores accept car batteries for free. Rechargeable batteries can go to Call2Recycle drop-off locations.',
  },
  {
    item: 'Electronics (E-Waste)',
    description: 'TVs, monitors, computers, printers, cell phones, tablets, gaming consoles.',
    reason: 'California law (SB 20/50) bans e-waste from landfills due to lead, mercury, and cadmium content.',
    alternative: 'Use your county e-waste collection program or retailer take-back programs (Best Buy, Staples).',
  },
  {
    item: 'Appliances with Freon',
    description: 'Refrigerators, freezers, air conditioning units, dehumidifiers, wine coolers.',
    reason: 'Freon (CFC/HCFC refrigerants) must be professionally recovered before disposal under EPA regulations.',
    alternative: 'We can handle freon appliances for a $75 special handling fee. Let us know when you order.',
  },
  {
    item: 'Flammable Liquids & Gases',
    description: 'Gasoline, kerosene, propane tanks, lighter fluid, aerosol cans (full), paint thinner.',
    reason: 'Fire and explosion hazard during transport and at disposal facilities.',
    alternative: 'Your local fire department or HHW facility can accept these items safely.',
  },
  {
    item: 'Medical & Biohazard Waste',
    description: 'Needles/sharps, prescription medications, biological specimens, contaminated PPE.',
    reason: 'Public health regulations require specialized treatment and incineration.',
    alternative: 'Use pharmacy take-back programs for medications. Sharps containers go to approved collection sites.',
  },
  {
    item: 'Asbestos-Containing Materials',
    description: 'Certain insulation, floor tiles, siding, roofing, and pipe wrap from pre-1980 buildings.',
    reason: 'Asbestos is a regulated carcinogen. Improper disposal carries criminal penalties.',
    alternative: 'Hire a licensed asbestos abatement contractor. Do NOT attempt to remove or dispose of asbestos yourself.',
  },
  {
    item: 'Tires',
    description: 'Passenger, truck, and equipment tires — whole or cut.',
    reason: 'California law bans whole tires from landfills. They must be recycled or processed separately.',
    alternative: 'We accept tires for a $25/tire handling fee. Or take them to a tire retailer for recycling.',
  },
];

const SPECIAL_HANDLING_ITEMS = [
  {
    item: 'Mattresses',
    fee: '$50 each',
    note: 'California recycling fee. We handle compliance.',
  },
  {
    item: 'Appliances with Freon',
    fee: '$75 each',
    note: 'Refrigerators, freezers, AC units. Professional freon recovery included.',
  },
  {
    item: 'Tires (Passenger)',
    fee: '$25 each',
    note: 'Whole or cut. Must be declared at order time.',
  },
];

const FAQS: FAQItem[] = [
  {
    question: 'What happens if prohibited items are found in my dumpster?',
    answer: 'If our team or the disposal facility identifies prohibited items, the load may be rejected or require special handling. You will be charged additional fees for sorting, re-routing, or hazardous material processing. In some cases, the dumpster may need to be returned to you for item removal before we can haul it.',
  },
  {
    question: 'Can I put paint cans in a dumpster?',
    answer: 'Dried latex paint cans (completely dried out, lid off) are generally accepted. Oil-based paint, spray paint, and wet paint are classified as hazardous waste and cannot go in any dumpster. Tip: Leave lids off latex paint cans and let them dry completely before loading.',
  },
  {
    question: 'Are there extra fees for special items?',
    answer: 'Yes. Mattresses ($50 each), freon appliances ($75 each), and tires ($25 each) require special handling fees. Let us know about these items when you order so we can include them in your quote.',
  },
  {
    question: 'Can I put a hot tub or spa in a dumpster?',
    answer: 'Yes, if it is broken down into pieces that fit below the fill line. Hot tubs are considered general debris once dismantled. The electrical components and any chemical containers must be removed and disposed of separately.',
  },
  {
    question: 'What about food waste — can it go in a dumpster?',
    answer: 'Small amounts of incidental food waste are accepted, but large quantities of perishable food create sanitation and pest issues. For significant food waste disposal, contact a composting service or your local waste hauler.',
  },
  {
    question: 'Where can I take prohibited items in the Bay Area?',
    answer: 'Alameda County operates free HHW collection events and a permanent drop-off at the Davis Street facility in San Leandro. Santa Clara County has the Sunnyvale SMaRT Station and the San Jose HHW facility. San Francisco residents can use Recology\'s free collection service.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Materials', url: '/materials' },
  { name: 'What Cannot Go in a Dumpster', url: '/what-cannot-go-in-a-dumpster' },
];

export default function WhatCannotGoInADumpster() {
  return (
    <Layout
      title="What Cannot Go in a Dumpster? | Prohibited Items List"
      description="What items are banned from dumpsters? Hazardous waste, batteries, e-waste, freon appliances, and more. Bay Area disposal alternatives and special handling fees."
      canonical="/what-cannot-go-in-a-dumpster"
      schema={[
        generateBreadcrumbSchema(breadcrumbs),
        generateFAQSchema(FAQS),
      ]}
    >
      {/* Hero */}
      <section className="bg-destructive/90 text-destructive-foreground py-12 md:py-16">
        <div className="container-wide">
          <nav className="text-sm text-destructive-foreground/70 mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-destructive-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/materials" className="hover:text-destructive-foreground">Materials</Link>
            <span className="mx-2">/</span>
            <span>Prohibited Items</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            What Cannot Go in a Dumpster
          </h1>
          <p className="text-lg text-destructive-foreground/90 max-w-2xl mb-6">
            Certain materials are banned from dumpsters by law. Loading prohibited items can result in extra fees, load rejection, or fines. Here's what to avoid and where to take it instead.
          </p>
          <Button asChild variant="cta" size="lg">
            <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
              <Phone className="w-4 h-4" />
              Questions? Call Us First
            </a>
          </Button>
        </div>
      </section>

      {/* Quick Link to Allowed */}
      <section className="container-wide py-8">
        <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <span className="text-sm text-foreground">Looking for what <strong>is</strong> allowed? Most common materials are accepted.</span>
          </div>
          <Link to="/what-can-you-put-in-a-dumpster" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
            See accepted materials <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </section>

      {/* Prohibited Items */}
      <section className="container-wide pb-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Prohibited Items</h2>
        <div className="space-y-6">
          {PROHIBITED_ITEMS.map((item) => (
            <div key={item.item} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{item.item}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-destructive/5 rounded-lg p-4">
                    <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-1">Why It's Banned</p>
                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                  <div className="bg-success/5 rounded-lg p-4">
                    <p className="text-xs font-semibold text-success uppercase tracking-wide mb-1">Where to Take It</p>
                    <p className="text-sm text-muted-foreground">{item.alternative}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Special Handling Items */}
      <section className="bg-muted/30 py-12">
        <div className="container-wide">
          <h2 className="text-2xl font-bold text-foreground mb-2">Special Handling Items</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            These items <strong>can</strong> go in a dumpster but require a special handling fee. Let us know when you order so we include it in your quote.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {SPECIAL_HANDLING_ITEMS.map((item) => (
              <div key={item.item} className="bg-card border border-warning/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <h3 className="font-bold text-foreground">{item.item}</h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-lg font-bold text-primary">{item.fee}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contamination Warning */}
      <section className="container-wide py-12">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-warning/30 rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-warning flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Contamination & Reclassification Policy</h2>
              <p className="text-muted-foreground mb-4">
                If prohibited or misdeclared items are found in your dumpster, the load may be reclassified. This can result in:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <span><strong>Load rejection:</strong> The disposal facility may refuse the entire load, requiring sorting or re-routing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <span><strong>Reclassification fees:</strong> Heavy material loads contaminated with debris are billed at general debris rates ($165/ton overage).</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <span><strong>No-notice reroute surcharge:</strong> If materials are misdeclared and we aren't notified before pickup, a $150–$300 surcharge applies.</span>
                </li>
              </ul>
              <p className="text-sm text-foreground font-medium">
                Advance notice avoids all penalties. Call us if your load changes after ordering.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PageFAQ faqs={FAQS} />
      <InternalLinkCluster exclude={['/what-cannot-go-in-a-dumpster']} />

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Know What You're Loading? Get Your Quote.</h2>
          <p className="text-lg text-primary-foreground/80 mb-6">
            Enter your ZIP code and material type for instant, accurate pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">
                Get Instant Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                Call {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
