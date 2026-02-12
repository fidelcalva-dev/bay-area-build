import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO, OPERATIONAL_YARDS, generateFAQSchema, generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { ArrowRight, Phone, MapPin, Clock, Shield, Truck, CheckCircle, HardHat, Building2, Ruler } from 'lucide-react';
import { RelatedLocations, InternalLinkBlock } from '@/components/seo';

// ── Oakland-specific data ────────────────────────────────────
const OAKLAND_YARD = OPERATIONAL_YARDS.find(y => y.id === 'oakland')!;

const META = {
  title: 'Dumpster Rental Oakland CA | 10-40 Yard Roll Off | Same-Day Delivery',
  description: 'Local dumpster rental in Oakland, CA with real yard support. 10, 20, 30 & 40 yard roll-off dumpsters. Transparent pricing. Same-day delivery available. Get an instant quote in 60 seconds.',
  slug: 'dumpster-rental-oakland-ca',
};

const NEIGHBORHOODS = [
  'Downtown Oakland', 'Rockridge', 'Montclair', 'Fruitvale',
  'East Oakland', 'West Oakland', 'Lake Merritt', 'Temescal',
  'Oakland Hills', 'Piedmont Avenue', 'Grand Lake', 'Dimond District',
];

const SIZE_DETAILS: { yards: number; title: string; description: string; useCases: string[] }[] = [
  {
    yards: 10,
    title: '10 Yard Dumpster — Oakland',
    description: 'Ideal for small home cleanouts, bathroom remodels, and concrete or dirt removal in Oakland. This is our most popular size for heavy material jobs.',
    useCases: ['Bathroom remodel debris', 'Concrete slab removal', 'Small garage cleanout', 'Yard waste & dirt'],
  },
  {
    yards: 20,
    title: '20 Yard Dumpster — Oakland',
    description: 'Our best seller for Oakland home renovations. Perfect for kitchen remodels, roofing tear-offs, and medium-sized cleanouts.',
    useCases: ['Kitchen renovation', 'Roofing tear-off', 'Full room cleanout', 'Deck removal'],
  },
  {
    yards: 30,
    title: '30 Yard Dumpster — Oakland',
    description: 'Great for major renovations and new construction in Oakland. High sidewalls handle bulky furniture and framing debris.',
    useCases: ['Major home renovation', 'New construction debris', 'Estate cleanout', 'Multi-room remodel'],
  },
  {
    yards: 40,
    title: '40 Yard Dumpster — Oakland',
    description: 'Commercial-grade capacity for large Oakland projects. Ideal for demolition, warehouse cleanouts, and industrial sites.',
    useCases: ['Commercial demolition', 'Warehouse cleanout', 'Large construction site', 'Industrial waste removal'],
  },
];

const FAQS = [
  {
    question: 'How much does dumpster rental cost in Oakland?',
    answer: `Dumpster rental in Oakland starts at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard dumpster. Pricing depends on size, material type, ZIP code, and rental duration. Heavy materials like concrete use flat-fee pricing with no weight overage. General debris overage is $${PRICING_POLICIES.overagePerTonGeneral}/ton beyond included tonnage.`,
  },
  {
    question: 'Do I need a permit for a dumpster in Oakland?',
    answer: 'If the dumpster is placed on your private property (driveway, yard), no permit is required in Oakland. If you need to place it on a public street or right-of-way, you will need an encroachment permit from the City of Oakland. We can help guide you through the process.',
  },
  {
    question: 'What size dumpster do I need?',
    answer: 'For small cleanouts and concrete jobs, a 10-yard dumpster works well. For home renovations, most Oakland customers choose a 20-yard. For major construction or commercial projects, 30 or 40 yard sizes are recommended. Call us at (510) 680-2150 and we will help you pick the right size.',
  },
  {
    question: 'Can I put concrete in a dumpster?',
    answer: 'Yes. We offer dedicated concrete dumpsters in 6, 8, and 10-yard sizes with flat-fee pricing. Clean concrete is recyclable. Mixed loads (concrete + general debris) may be reclassified and priced differently. The dumpster must not be loaded above the fill line.',
  },
  {
    question: 'Are you a broker?',
    answer: `No. Calsan Dumpsters Pro is NOT a broker. We own our trucks and dumpsters. Our Oakland yard is at ${OAKLAND_YARD.address}. When you call us, you are talking to the company that delivers your dumpster.`,
  },
  {
    question: 'How fast can you deliver a dumpster in Oakland?',
    answer: 'Same-day delivery is available for most Oakland addresses when you order before noon. Our Oakland yard is centrally located, so delivery times are typically under 2 hours for most neighborhoods.',
  },
  {
    question: 'What weight is included in the rental price?',
    answer: 'Each dumpster size includes a base tonnage allowance. For example, a 10-yard includes 1 ton and a 20-yard includes 2 tons of general debris. Heavy material dumpsters (concrete, dirt) are flat-fee with no weight overage. Any excess weight on general debris is billed at $165/ton based on scale ticket.',
  },
  {
    question: 'How do I book a dumpster in Oakland?',
    answer: 'You can get an instant quote online in 60 seconds at calsandumpsterspro.com/quote. Or call us at (510) 680-2150. We accept same-day orders before noon for most Oakland locations.',
  },
];

// ── Schema generators ────────────────────────────────────────
const serviceSchema = generateServiceSchema({
  name: 'Dumpster Rental Oakland CA',
  description: META.description,
  areaServed: ['Oakland', 'Alameda County'],
  price: '390',
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
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* ── 1. HERO ───────────────────────────────────────── */}
      <section className="bg-background section-padding border-b border-border">
        <div className="container-wide">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Dumpster Rental Oakland CA</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-4">
              Dumpster Rental Oakland, CA
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-3">
              Fast Local Roll-Off Dumpster Delivery from Our Oakland Yard
            </p>

            {/* Trust line */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" />Real Oakland Yard</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" />Transparent Pricing</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" />Same-Day Available</span>
            </div>

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

      {/* ── 2. LOCAL AUTHORITY ─────────────────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">Why Oakland Chooses Calsan</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            When you need dumpster rental in Oakland, you deserve a company with a real local yard — not a broker
            who farms out your order to the lowest bidder.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Real Oakland Yard',
                desc: `Our fleet is based at ${OAKLAND_YARD.address}. We own the trucks and the dumpsters — not a broker office, an operational yard.`,
              },
              {
                title: 'Faster Delivery',
                desc: 'Because our yard is in Oakland, delivery times are under 2 hours for most neighborhoods. Same-day service when you order before noon.',
              },
              {
                title: 'Direct Dispatch',
                desc: 'No middlemen. When you call (510) 680-2150, you talk directly to the team that delivers your dumpster rental in Oakland.',
              },
              {
                title: 'Transparent Pricing',
                desc: `Flat-fee pricing for heavy materials. General debris starts at $${DUMPSTER_SIZES_DATA[0].priceFrom}. No hidden fuel surcharges or environmental fees.`,
              },
              {
                title: 'Not a Broker',
                desc: 'Calsan Dumpsters Pro is a locally owned company with real inventory. We control quality, timing, and pricing from our Oakland yard.',
              },
              {
                title: 'Real Inventory Control',
                desc: 'We know exactly which dumpsters are available because they sit in our yard. No guessing, no delays, no excuses.',
              },
            ].map((item, i) => (
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

      {/* ── 3. DUMPSTER SIZES ─────────────────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-3 text-center">Dumpster Sizes Available in Oakland</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Every dumpster rental in Oakland includes 7-day rental, delivery, and pickup. Choose the right size for your project.
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
                      <p className="text-sm text-muted-foreground">{sizeData.dimensions}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{size.description}</p>
                  <ul className="space-y-1.5 mb-4">
                    {size.useCases.map((uc, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />{uc}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <span className="text-lg font-bold text-primary">From ${sizeData.priceFrom}</span>
                      <span className="text-xs text-muted-foreground ml-2">{sizeData.includedTons}T included</span>
                    </div>
                    <Link to={`/${size.yards}-yard-dumpster`} className="text-sm text-primary font-medium hover:underline">
                      Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link to="/sizes" className="text-primary font-medium hover:underline text-sm">
              View all 7 dumpster sizes (6-50 yard) →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. HEAVY MATERIAL ─────────────────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">Concrete & Dirt Dumpsters in Oakland</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Need a concrete dumpster in Oakland? We offer dedicated heavy material dumpsters with flat-rate pricing — no weight overage surprises.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-4">
            {[
              { label: 'Available Sizes', value: '6, 8, and 10 yard dumpsters for heavy materials. 10-yard is most popular for Oakland concrete jobs.' },
              { label: 'Fill-Line Required', value: 'Heavy material dumpsters must not be loaded above the fill line for safe transport.' },
              { label: 'Flat-Rate Pricing', value: 'Concrete and dirt dumpsters use flat-fee pricing. No weight overage charges — the price you see is the price you pay.' },
              { label: 'Clean Concrete', value: 'Clean concrete (no rebar, no dirt mixed in) is fully recyclable and qualifies for our lowest heavy material rate.' },
              { label: 'Mixed Loads', value: 'If you mix concrete with general debris, the load will be reclassified as general debris and priced accordingly.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">{item.label}: </span>
                  <span className="text-muted-foreground text-sm">{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link to="/concrete-dumpster-rental" className="text-primary font-medium hover:underline text-sm">
              Learn more about concrete dumpster rental →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. PRICING EDUCATION ──────────────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">How Much Does Dumpster Rental Cost in Oakland?</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Pricing for dumpster rental in Oakland depends on four factors: size, material type, your ZIP code, and rental duration.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <Ruler className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Size</h3>
              <p className="text-sm text-muted-foreground">Larger dumpsters cost more. 10-yard starts at ${DUMPSTER_SIZES_DATA.find(s => s.yards === 10)?.priceFrom}, 40-yard at ${DUMPSTER_SIZES_DATA.find(s => s.yards === 40)?.priceFrom}.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <Truck className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Material</h3>
              <p className="text-sm text-muted-foreground">Heavy materials (concrete, dirt) use flat-fee pricing. General debris includes base tonnage with ${PRICING_POLICIES.overagePerTonGeneral}/ton overage.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <MapPin className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">ZIP Code</h3>
              <p className="text-sm text-muted-foreground">Delivery distance from our Oakland yard affects pricing. Central Oakland ZIPs get the best rates.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <Clock className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Rental Duration</h3>
              <p className="text-sm text-muted-foreground">Standard 7-day rental included. Extended rentals available at a daily rate.</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-lg font-semibold text-foreground mb-1">Oakland dumpster rental starting at ${DUMPSTER_SIZES_DATA[0].priceFrom}</p>
            <p className="text-sm text-muted-foreground mb-4">7-day rental, delivery & pickup included</p>
            <Button asChild variant="cta" size="lg">
              <Link to="/quote">Check Exact Price by ZIP <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 6. SERVICE AREAS / NEIGHBORHOODS ──────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">Serving All Oakland Neighborhoods</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you need a dumpster rental near me in Oakland or a roll-off for a job across town,
            our centrally located yard covers every neighborhood.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {NEIGHBORHOODS.map(hood => (
              <div key={hood} className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-3 text-sm">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-foreground">{hood}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link to="/areas" className="text-primary font-medium hover:underline text-sm">
              View all Bay Area service areas →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. CONTRACTOR SECTION ─────────────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">Contractor Dumpster Rentals in Oakland</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Oakland contractors trust Calsan for reliable dumpster rental with priority scheduling, fast swaps, and dedicated support.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: HardHat, title: 'Job Site Priority', desc: 'Contractors get priority scheduling for time-sensitive Oakland job sites.' },
              { icon: Truck, title: 'Concrete Dumpsters', desc: 'Dedicated heavy material dumpsters for Oakland foundation, demo, and flatwork jobs.' },
              { icon: Building2, title: 'Volume Pricing', desc: 'Multi-dumpster and recurring service discounts for Oakland contractors.' },
              { icon: Clock, title: 'Fast Swaps', desc: 'Need a swap? We can swap dumpsters on Oakland job sites within hours, not days.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-5 bg-card border border-border rounded-xl">
                <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 space-x-4">
            <Link to="/contractors" className="text-primary font-medium hover:underline text-sm">
              Contractor programs →
            </Link>
            <Link to="/contractor-best-practices" className="text-primary font-medium hover:underline text-sm">
              Best practices guide →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ SECTION ────────────────────────────────── */}
      <section className="section-padding bg-muted/30">
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

      {/* ── 9. FINAL CTA ──────────────────────────────────── */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Rent a Dumpster in Oakland?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Get an instant quote in 60 seconds or call us now. Same-day delivery available for most Oakland addresses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 10. RELATED LOCATIONS ─────────────────────────── */}
      <RelatedLocations currentCity="oakland-ca" pageContext="oak-landing" title="Also Serving Nearby Areas" />

      {/* ── 11. INTERNAL LINKS ────────────────────────────── */}
      <InternalLinkBlock currentCity="oakland-ca" type="city" pageContext="oak-landing" />

      {/* ── STICKY MOBILE CTA ─────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-50">
        <Button asChild variant="cta" size="lg" className="w-full h-14 text-base shadow-lg">
          <Link to="/quote">
            Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </Layout>
  );
}
