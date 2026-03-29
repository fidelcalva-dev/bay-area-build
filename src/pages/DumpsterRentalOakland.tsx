import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO, OPERATIONAL_YARDS, generateFAQSchema, generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { ArrowRight, Phone, MapPin, Clock, Shield, Truck, CheckCircle, HardHat, Building2, Ruler, Users, Weight, Scale, FileCheck } from 'lucide-react';
import { RelatedLocations, InternalLinkBlock } from '@/components/seo';

// ── Oakland-specific data ────────────────────────────────────
const OAKLAND_YARD = OPERATIONAL_YARDS.find(y => y.id === 'oakland')!;

const META = {
  title: 'Dumpster Rental Oakland CA | Same-Day Delivery | From $395 | Calsan',
  description: 'Local dumpster rental in Oakland, CA. 5-50 yard roll-off dumpsters from $395. Same-day delivery from our Oakland yard. Transparent pricing, no brokers. Get an instant quote.',
  slug: 'dumpster-rental-oakland-ca',
};

const SIZE_DETAILS: { yards: number; title: string; description: string; includes: string[] }[] = [
  {
    yards: 5,
    title: '5 Yard Dumpster',
    description: 'Compact size for small jobs, concrete removal, and yard debris.',
    includes: ['Delivery included', 'Pickup included', '7-day rental included', '0.5 ton included'],
  },
  {
    yards: 8,
    title: '8 Yard Dumpster',
    description: 'Popular for driveway and foundation work.',
    includes: ['Delivery included', 'Pickup included', '7-day rental included', '0.5 ton included'],
  },
  {
    yards: 10,
    title: '10 Yard Dumpster',
    description: 'Best for cleanouts and small remodels.',
    includes: ['Delivery included', 'Pickup included', '7-day rental included', '1 ton included'],
  },
  {
    yards: 20,
    title: '20 Yard Dumpster',
    description: 'Ideal for kitchen remodels and medium construction projects.',
    includes: ['Delivery included', 'Pickup included', '7-day rental included', '2 tons included'],
  },
  {
    yards: 30,
    title: '30 Yard Dumpster',
    description: 'Great for large renovations and commercial cleanouts.',
    includes: ['Delivery included', 'Pickup included', '7-day rental included', '3 tons included'],
  },
  {
    yards: 40,
    title: '40 Yard Dumpster',
    description: 'Designed for major construction and demolition.',
    includes: ['Delivery included', 'Pickup included', '7-day rental included', '4 tons included'],
  },
  {
    yards: 50,
    title: '50 Yard Dumpster',
    description: 'Maximum capacity for large-scale commercial and industrial projects.',
    includes: ['Delivery included', 'Pickup included', '7-day rental included', '5 tons included'],
  },
];

const WHO_WE_SERVE = [
  'Homeowners',
  'General Contractors',
  'Excavation Crews',
  'Roofers',
  'Property Managers',
  'Retail Businesses',
  'Warehouses',
  'Multi-family Properties',
];

const WHY_CHOOSE = [
  { title: 'Real Local Yard', desc: `Our fleet operates from ${OAKLAND_YARD.address}. We own the trucks and dumpsters.` },
  { title: 'Fast Dispatch', desc: 'Delivery times under 2 hours for most Oakland neighborhoods from our centrally located yard.' },
  { title: 'Licensed and Insured', desc: 'Fully licensed waste hauler with comprehensive insurance coverage for every job.' },
  { title: 'Professional Drivers', desc: 'Experienced drivers who know Oakland streets, from narrow hillside driveways to downtown loading zones.' },
  { title: 'Transparent Weight Policy', desc: `Flat-fee pricing for heavy materials. General debris overage is $${PRICING_POLICIES.overagePerTonGeneral}/ton, verified by scale ticket.` },
  { title: 'Same-Day Availability', desc: 'Order before noon for same-day delivery to most Oakland addresses, based on inventory.' },
];

const FAQS = [
  {
    question: 'What size dumpster do I need in Oakland?',
    answer: 'For small cleanouts or concrete removal, a 10-yard dumpster is typically sufficient. Kitchen and bathroom remodels usually require a 20-yard. For major renovations or commercial projects, 30 or 40-yard dumpsters provide the capacity you need. Call us at (510) 680-2150 for a recommendation based on your specific project.',
  },
  {
    question: 'How much does dumpster rental cost in Oakland?',
    answer: `Dumpster rental in Oakland starts at $${DUMPSTER_SIZES_DATA[0]?.priceFrom || 395} for a ${DUMPSTER_SIZES_DATA[0]?.yards || 5}-yard dumpster. Final pricing depends on dumpster size, material type, your ZIP code, and distance from our yard. Heavy material dumpsters (concrete, dirt) use flat-fee pricing with no weight overage. Use our online calculator for an instant, exact quote.`,
  },
  {
    question: 'Do I need a permit in Oakland?',
    answer: 'If the dumpster is placed on your private property (driveway, yard, or job site), no permit is required. If placement on a public street or right-of-way is necessary, you will need an encroachment permit from the City of Oakland Public Works Department. We can advise you on the process.',
  },
  {
    question: 'Can I dispose of concrete in a roll-off dumpster?',
    answer: 'Yes. We offer dedicated concrete dumpsters in 5, 8, and 10-yard sizes with flat-fee pricing and no weight overage. Clean concrete (no rebar, no mixed debris) qualifies for our lowest rate. If you mix concrete with general debris, the load may be reclassified and priced as general debris. The dumpster must not be loaded above the fill line for safe transport.',
  },
  {
    question: 'How fast can you deliver in Oakland?',
    answer: 'Same-day delivery is available for most Oakland addresses when you order before noon. Our yard is centrally located in Oakland, so delivery times are typically under 2 hours. We serve every neighborhood from Downtown to the Oakland Hills.',
  },
];

// ── Schema generators ────────────────────────────────────────
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: BUSINESS_INFO.name,
  description: META.description,
  url: BUSINESS_INFO.url,
  telephone: BUSINESS_INFO.phone.salesFormatted,
  address: {
    '@type': 'PostalAddress',
    streetAddress: OAKLAND_YARD.address.split(',')[0],
    addressLocality: 'Oakland',
    addressRegion: 'CA',
    postalCode: '94601',
    addressCountry: 'US',
  },
  areaServed: {
    '@type': 'City',
    name: 'Oakland',
    sameAs: 'https://en.wikipedia.org/wiki/Oakland,_California',
  },
  priceRange: `$${DUMPSTER_SIZES_DATA[0]?.priceFrom || 395} - $${DUMPSTER_SIZES_DATA[DUMPSTER_SIZES_DATA.length - 1]?.priceFrom || 1095}`,
};

const serviceSchema = generateServiceSchema({
  name: 'Dumpster Rental Oakland CA',
  description: META.description,
  areaServed: ['Oakland', 'Alameda County', 'East Bay'],
  price: String(DUMPSTER_SIZES_DATA[0]?.priceFrom || 395),
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Dumpster Rental Oakland CA', url: `/${META.slug}` },
]);

const faqSchema = generateFAQSchema(FAQS);

// ── Component ────────────────────────────────────────────────
export default function DumpsterRentalOakland() {
  return (
    <Layout title={META.title} description={META.description}>
      <Helmet>
        <link rel="canonical" href={`${BUSINESS_INFO.url}/${META.slug}`} />
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="bg-background section-padding border-b border-border">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Dumpster Rental Oakland CA</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-4">
              Dumpster Rental in Oakland, CA
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-4">
              Professional Roll-Off Dumpster Logistics for Residential, Contractor, and Commercial Projects.
            </p>
            <p className="text-base text-muted-foreground mb-6 max-w-2xl leading-relaxed">
              Calsan Dumpsters Pro provides fast, transparent, and professional dumpster rental services across Oakland
              and surrounding East Bay communities. Local yard dispatch. No hidden fees.
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" />Real Oakland Yard</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" />Licensed and Insured</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" />Same-Day Available</span>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild variant="cta" size="lg">
                <Link to="/quote">Get Your Exact Price <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                  <Phone className="w-4 h-4 mr-2" />Call {BUSINESS_INFO.phone.salesFormatted}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERMIT VERIFICATION CALLOUT ────────────────── */}
      <section className="py-6 bg-accent/5 border-b border-accent/20">
        <div className="container-wide max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-1">
              <AlertTriangle className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Placement & Permit Verification Recommended</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Oakland has specific rules for dumpster placement on public streets and rights-of-way. Private property placement (driveways, lots) typically needs no permit. 
                For street placement, an encroachment permit from Oakland Public Works may be required. Our team can walk you through the process — call {BUSINESS_INFO.phone.salesFormatted} or mention it during your quote.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: LOCAL AUTHORITY ──────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-6 text-center">Local Dumpster Rental Company Serving Oakland</h2>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
            <p>
              Calsan Dumpsters Pro is a locally owned and operated dumpster rental company serving all of Oakland, California.
              From <strong className="text-foreground">Downtown Oakland</strong> office renovations to <strong className="text-foreground">West Oakland</strong> warehouse
              cleanouts, <strong className="text-foreground">East Oakland</strong> residential projects, and job sites
              near <strong className="text-foreground">Jack London Square</strong>, our team delivers roll-off dumpsters directly
              from our local Bay Area yard.
            </p>
            <p>
              Oakland's <strong className="text-foreground">industrial corridors</strong> along San Leandro Street and International Boulevard
              see consistent demand for construction and demolition dumpsters. We serve these areas daily alongside
              Oakland's <strong className="text-foreground">residential neighborhoods</strong> — from Rockridge and Montclair
              to Fruitvale, Temescal, and the Oakland Hills.
            </p>
            <p>
              Whether your project involves an <strong className="text-foreground">ADU (accessory dwelling unit) build</strong> in the Oakland Hills,
              a <strong className="text-foreground">tenant improvement</strong> in a Downtown office space, or a full-scale commercial demolition,
              we have the right dumpster size and the local dispatch capability to keep your project on schedule.
            </p>
            <p>
              We operate from a local Bay Area yard and dispatch directly to Oakland job sites for faster delivery
              and tighter scheduling. No brokers, no middlemen, no delays.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: DUMPSTER SIZES ──────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-3 text-center">Available Dumpster Sizes in Oakland</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Every dumpster rental in Oakland includes delivery, pickup, and a 7-day rental period. Choose the right size for your project.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {SIZE_DETAILS.map(size => {
              const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === size.yards);
              if (!sizeData) return null;

              return (
                <div key={size.yards} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-black text-primary">{size.yards}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{size.title}</h3>
                      {sizeData.dimensions && (
                        <p className="text-sm text-muted-foreground">{sizeData.dimensions}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{size.description}</p>
                  <ul className="space-y-2">
                    {size.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                    <span className="text-lg font-bold text-primary">From ${sizeData.priceFrom}</span>
                    <Link to="/quote" className="text-sm text-primary font-medium hover:underline">
                      Get Price
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link to="/sizes" className="text-primary font-medium hover:underline text-sm">
              View all 7 dumpster sizes (5-50 yard)
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HEAVY MATERIAL ──────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">Concrete and Heavy Material Dumpsters in Oakland</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Specialized heavy material dumpsters for Oakland construction, demolition, and excavation projects.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-5">
            {[
              { icon: Weight, label: 'Clean Concrete Dumpsters', value: 'Dedicated dumpsters for clean concrete disposal. Fully recyclable material qualifies for our lowest heavy material rate. Available in 5, 8, and 10-yard sizes.' },
              { icon: Truck, label: 'Dirt and Soil Dumpsters', value: 'Separate hauling for dirt, soil, and fill material. Flat-fee pricing with no weight overage surprises.' },
              { icon: Shield, label: 'Fill-Line Enforcement', value: 'Heavy material dumpsters must not be loaded above the fill line. This is a non-negotiable safety requirement for transport on Oakland roads.' },
              { icon: FileCheck, label: 'Reclassification Policy', value: 'If a concrete dumpster is contaminated with general debris, the load will be reclassified and priced as general debris. Keep materials separated for the best rate.' },
              { icon: Scale, label: 'Scale Ticket Transparency', value: 'Every load is weighed at the disposal facility. You receive a copy of the scale ticket so you can verify the exact weight of your material.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: WHO WE SERVE ────────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-8 text-center">Who We Serve in Oakland</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {WHO_WE_SERVE.map((client) => (
              <div key={client} className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-3.5 text-sm">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <span className="text-foreground font-medium">{client}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: PRICING TRANSPARENCY ────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">Transparent Dumpster Pricing in Oakland</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            We do not publish misleading price ranges. Your exact rate depends on four factors:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <MapPin className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">ZIP Code</h3>
              <p className="text-sm text-muted-foreground">Delivery distance from our Oakland yard directly affects your rate. Central Oakland ZIPs get the best pricing.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <Ruler className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Distance from Yard</h3>
              <p className="text-sm text-muted-foreground">Closer job sites benefit from lower delivery costs. Our yard serves all of Oakland and surrounding East Bay cities.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <Truck className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Dumpster Size</h3>
              <p className="text-sm text-muted-foreground">
                10-yard starts at ${DUMPSTER_SIZES_DATA.find(s => s.yards === 10)?.priceFrom || 499}.
                40-yard starts at ${DUMPSTER_SIZES_DATA.find(s => s.yards === 40)?.priceFrom || 899}.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <Weight className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Material Type</h3>
              <p className="text-sm text-muted-foreground">Heavy materials (concrete, dirt) use flat-fee pricing. General debris includes base tonnage with ${PRICING_POLICIES.overagePerTonGeneral}/ton overage.</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-lg font-semibold text-foreground mb-1">Use our instant calculator to get your exact rate.</p>
            <p className="text-sm text-muted-foreground mb-4">No guesswork. Enter your ZIP and project details for a real price.</p>
            <Button asChild variant="cta" size="lg">
              <Link to="/quote">Get Your Exact Price <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: WHY CHOOSE CALSAN ───────────────── */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-8 text-center">Why Oakland Customers Choose Calsan Dumpsters Pro</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {WHY_CHOOSE.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-5 bg-card border border-border rounded-xl">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: INTERNAL LINKING ────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-8 text-center">Explore More Services</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { to: '/dumpster-rental/oakland/10-yard', label: '10 Yard Dumpster Oakland', desc: 'Compact dumpster for cleanouts and small remodels.' },
              { to: '/dumpster-rental/oakland/20-yard', label: '20 Yard Dumpster Oakland', desc: 'Most popular size for kitchen and bathroom renovations.' },
              { to: '/dumpster-rental/oakland/30-yard', label: '30 Yard Dumpster Oakland', desc: 'Large capacity for major renovations and commercial jobs.' },
              { to: '/dumpster-rental-san-jose-ca', label: 'Dumpster Rental San Jose', desc: 'South Bay dumpster delivery from our San Jose yard.' },
              { to: '/dumpster-rental-san-francisco-ca', label: 'Dumpster Rental San Francisco', desc: 'Roll-off dumpsters delivered to SF job sites.' },
              { to: '/dumpster-rental/oakland/concrete', label: 'Concrete Dumpster Oakland', desc: 'Flat-fee concrete and heavy material disposal.' },
              { to: '/contractors', label: 'Contractor Dumpster Programs', desc: 'Priority scheduling and repeat-job coordination.' },
              { to: '/sizes', label: 'All Dumpster Sizes', desc: 'Compare all sizes from 5 to 50 yards with pricing.' },
              { to: '/materials', label: 'Accepted Materials Guide', desc: 'What you can and cannot put in a dumpster.' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{link.label}</h3>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FAQ ─────────────────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-8 text-center">Oakland Dumpster Rental FAQ</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="bg-card border border-border rounded-xl overflow-hidden group">
                <summary className="p-5 cursor-pointer font-semibold text-foreground hover:bg-muted/30 transition-colors list-none flex items-center justify-between">
                  {faq.question}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────── */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Rent a Dumpster in Oakland?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Get an instant quote in 60 seconds or call us now. Same-day delivery available for most Oakland addresses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">Get Your Exact Price <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── RELATED LOCATIONS ─────────────────────────── */}
      <RelatedLocations currentCity="oakland-ca" pageContext="oak-landing" title="Also Serving Nearby Areas" />

      {/* ── INTERNAL LINKS ────────────────────────────── */}
      <InternalLinkBlock currentCity="oakland-ca" type="city" pageContext="oak-landing" />

      {/* ── STICKY MOBILE CTA ─────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-50">
        <Button asChild variant="cta" size="lg" className="w-full h-14 text-base shadow-lg">
          <Link to="/quote">
            Get Your Exact Price <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </Layout>
  );
}
