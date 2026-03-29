import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { generateFAQSchema, generateBreadcrumbSchema, BUSINESS_INFO } from '@/lib/seo';
import { SeoJsonLd } from '@/components/seo/SeoJsonLd';
import { PageFAQ, InternalLinkCluster, type FAQItem } from '@/components/seo';
import { SeoTrustBar } from '@/components/seo/SeoTrustBar';
import { SeoReviewProof } from '@/components/seo/SeoReviewProof';
import { StickyMobileCTA } from '@/components/seo/StickyMobileCTA';
import { useSeoTracking } from '@/hooks/useSeoTracking';
import {
  CheckCircle, ArrowRight, Phone, Truck, AlertTriangle,
  Home, HardHat, Trees, Wrench, Scale, Hammer, Info
} from 'lucide-react';

const ALLOWED_CATEGORIES = [
  {
    title: 'Household Junk & Cleanout Debris',
    icon: Home,
    items: [
      'Furniture (couches, tables, chairs, desks)',
      'Mattresses (CA recycling fee applies — $50 each)',
      'Clothing, textiles, and linens',
      'Books, paper, and cardboard',
      'Toys, sporting goods, and small household items',
      'Non-hazardous appliances (washers, dryers, stoves)',
    ],
    note: 'Appliances with freon (refrigerators, freezers, AC units) require a $75 special handling fee.',
    sizes: 'Any size — 5 to 50 yard',
  },
  {
    title: 'Construction & Remodel Debris',
    icon: HardHat,
    items: [
      'Drywall and sheetrock',
      'Lumber, plywood, and framing wood',
      'Flooring — tile, carpet, laminate, hardwood',
      'Siding, trim, and molding',
      'Cabinets, countertops, and fixtures',
      'Windows, doors, and frames',
      'Insulation (non-asbestos only)',
    ],
    note: 'Treated wood and painted lumber are accepted in general debris dumpsters.',
    sizes: 'Any size — 5 to 50 yard',
  },
  {
    title: 'Roofing Materials',
    icon: Wrench,
    items: [
      'Asphalt shingles',
      'Composite shingles',
      'Underlayment and tar paper',
      'Flashing and metal edging',
      'Gutters and downspouts',
      'Roofing nails and fasteners',
    ],
    note: 'Roofing debris is heavy. A 20-yard dumpster handles most single-story roof tear-offs.',
    sizes: '10, 20, or 30 yard recommended',
  },
  {
    title: 'Yard Waste & Landscaping Debris',
    icon: Trees,
    items: [
      'Branches, brush, and tree limbs',
      'Grass clippings and leaves',
      'Shrubs and bushes',
      'Small tree stumps (under 12" diameter)',
      'Garden soil (small amounts mixed with debris)',
      'Fencing (wood or chain link)',
    ],
    note: 'Large quantities of pure dirt or soil should go in a dedicated heavy material dumpster.',
    sizes: '5, 10, or 20 yard recommended',
  },
  {
    title: 'Heavy / Inert Materials',
    icon: Scale,
    items: [
      'Concrete (clean, unmixed)',
      'Asphalt and blacktop',
      'Brick and block',
      'Clean fill dirt and soil',
      'Rocks, gravel, and stone',
      'Sand',
      'Ceramic tile',
    ],
    note: 'Heavy materials require a dedicated 5, 8, or 10 yard dumpster with flat-fee pricing. Cannot be mixed with general debris.',
    sizes: '5, 8, or 10 yard only — flat fee, disposal included',
  },
  {
    title: 'Mixed C&D (Construction & Demolition)',
    icon: Hammer,
    items: [
      'Mixed wood and drywall',
      'Metal and wire',
      'Broken concrete with rebar (small amounts)',
      'Plumbing fixtures',
      'Electrical conduit and wiring',
      'HVAC ductwork',
    ],
    note: 'Mixed loads go in a general debris dumpster. If more than 50% is heavy material, consider a dedicated heavy dumpster.',
    sizes: 'Any size — 5 to 50 yard',
  },
];

const FAQS: FAQItem[] = [
  {
    question: 'Can I mix different materials in one dumpster?',
    answer: 'Yes — for general debris dumpsters, you can mix household junk, construction materials, roofing, and yard waste in a single load. The only exception is heavy materials (concrete, dirt, brick), which must go in a dedicated heavy material dumpster and cannot be mixed with other debris.',
  },
  {
    question: 'What size dumpster do I need for a home cleanout?',
    answer: 'Most whole-house cleanouts need a 20 or 30 yard dumpster. A single room or garage cleanout typically fits in a 10-yard. Use our size guide or call us — we help you choose the right size every day.',
  },
  {
    question: 'Can I put a mattress in a dumpster?',
    answer: 'Yes. California requires a $50 recycling fee per mattress. We handle the recycling compliance. Just let us know how many mattresses you plan to dispose of when you order.',
  },
  {
    question: 'Is concrete allowed in a regular dumpster?',
    answer: 'No. Concrete, dirt, brick, and asphalt must go in a dedicated heavy material dumpster (5, 8, or 10 yard). These use flat-fee pricing with disposal included — no weight overage charges.',
  },
  {
    question: 'What happens if I accidentally load a prohibited item?',
    answer: 'Our team will identify prohibited items during disposal. You may be charged additional fees for special handling, and certain items (hazardous waste, electronics) may need to be removed before we can haul the load. When in doubt, call us before loading.',
  },
  {
    question: 'Do I need to sort materials before loading?',
    answer: 'Not for general debris dumpsters — you can mix everything together. For heavy material dumpsters, only one type of material is allowed per load (e.g., all concrete or all dirt). Mixing heavy materials with trash triggers reclassification and additional charges.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Materials', url: '/materials' },
  { name: 'What Can You Put in a Dumpster', url: '/what-can-you-put-in-a-dumpster' },
];

export default function WhatCanYouPutInADumpster() {
  return (
    <Layout
      title="What Can You Put in a Dumpster? | Accepted Materials Guide"
      description="Complete list of materials you can put in a dumpster — household junk, construction debris, roofing, concrete, yard waste. Bay Area dumpster loading guide."
      canonical="/what-can-you-put-in-a-dumpster"
      schema={[
        generateBreadcrumbSchema(breadcrumbs),
        generateFAQSchema(FAQS),
      ]}
    >
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container-wide">
          <nav className="text-sm text-primary-foreground/70 mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/materials" className="hover:text-primary-foreground">Materials</Link>
            <span className="mx-2">/</span>
            <span>Accepted Materials</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            What Can You Put in a Dumpster?
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mb-6">
            Most common household, construction, and yard debris is accepted. Here's your complete guide to what goes in — organized by project type.
          </p>
          <Button asChild variant="cta" size="lg">
            <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
              <Phone className="w-4 h-4" />
              Not Sure? Call Before Loading
            </a>
          </Button>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="container-wide py-10">
        <div className="bg-success/5 border border-success/20 rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">The Short Answer</h2>
              <p className="text-muted-foreground">
                You can put most non-hazardous materials in a dumpster — furniture, construction debris, roofing, yard waste, and more. Heavy materials like concrete and dirt need a dedicated dumpster. The only things you <em>can't</em> load are hazardous waste, electronics, batteries, and a few other regulated items.
              </p>
              <Link to="/what-cannot-go-in-a-dumpster" className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-3 hover:underline">
                See prohibited items list <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Allowed Categories */}
      <section className="container-wide pb-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Accepted Materials by Category</h2>
        <div className="space-y-8">
          {ALLOWED_CATEGORIES.map((cat) => (
            <div key={cat.title} className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <cat.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{cat.title}</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                {cat.items.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                {cat.note && (
                  <div className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg px-4 py-3 flex-1">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{cat.note}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm bg-primary/5 rounded-lg px-4 py-3">
                  <Truck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">{cat.sizes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Heavy Material Callout */}
      <section className="bg-muted/30 py-12">
        <div className="container-wide max-w-3xl">
          <div className="flex items-start gap-4">
            <Scale className="w-8 h-8 text-warning flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Heavy Material Rule</h2>
              <p className="text-muted-foreground mb-4">
                Concrete, dirt, brick, asphalt, and rock <strong>must</strong> go in a dedicated heavy material dumpster (5, 8, or 10 yard only). These use flat-fee pricing with disposal included — no weight overage charges. Mixing heavy materials with general debris triggers reclassification and additional fees.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/pricing" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
                  See heavy material pricing <ArrowRight className="w-3 h-3" />
                </Link>
                <Link to="/services/concrete-dumpsters" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
                  Concrete dumpster details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call Before Loading CTA */}
      <section className="container-wide py-12">
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 md:p-8 text-center">
          <Info className="w-8 h-8 text-accent mx-auto mb-3" />
          <h2 className="text-xl font-bold text-foreground mb-2">Not Sure About a Material?</h2>
          <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
            Call us before you load. Our team will tell you the right dumpster type, flag any special handling fees, and help you avoid surprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-4 h-4 mr-2" />
                {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/what-cannot-go-in-a-dumpster">
                See Prohibited Items
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <PageFAQ faqs={FAQS} />
      <InternalLinkCluster exclude={['/what-can-you-put-in-a-dumpster']} />

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Order Your Dumpster?</h2>
          <p className="text-lg text-primary-foreground/80 mb-6">
            Get an instant quote with exact pricing for your location and materials.
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
