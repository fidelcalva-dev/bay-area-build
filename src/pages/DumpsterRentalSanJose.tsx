import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO, OPERATIONAL_YARDS, generateFAQSchema, generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { ArrowRight, Phone, MapPin, Clock, Shield, Truck, CheckCircle, HardHat, Building2, Ruler } from 'lucide-react';
import { RelatedLocations, InternalLinkBlock } from '@/components/seo';

// ── San Jose-specific data ───────────────────────────────────
const SJ_YARD = OPERATIONAL_YARDS.find(y => y.id === 'sanjose')!;

const META = {
  title: 'Dumpster Rental San Jose CA | Same-Day Delivery | From $395 | Calsan',
  description: 'Local dumpster rental in San Jose, CA from $395. 5-50 yard roll-off dumpsters with same-day delivery from our San Jose yard. Transparent pricing, no brokers. Get an instant quote in 60 seconds.',
  slug: 'dumpster-rental-san-jose-ca',
};

const NEIGHBORHOODS = [
  'Downtown San Jose', 'Willow Glen', 'Alum Rock', 'Evergreen',
  'Berryessa', 'Cambrian Park', 'North San Jose', 'Almaden Valley',
  'Santa Teresa', 'Rose Garden', 'Japantown', 'Silver Creek',
];

const SIZE_DETAILS: { yards: number; title: string; description: string; useCases: string[] }[] = [
  {
    yards: 5,
    title: '5 Yard Dumpster — San Jose',
    description: 'Compact size for small concrete removal, dirt hauling, and minor cleanout jobs across San Jose.',
    useCases: ['Small concrete slab', 'Dirt & soil removal', 'Yard debris', 'Minor cleanout'],
  },
  {
    yards: 8,
    title: '8 Yard Dumpster — San Jose',
    description: 'Popular for driveway demolition, foundation work, and garage cleanouts in San Jose neighborhoods.',
    useCases: ['Driveway demo', 'Foundation concrete', 'Garage cleanout', 'Bathroom remodel'],
  },
  {
    yards: 10,
    title: '10 Yard Dumpster — San Jose',
    description: 'Perfect for small home cleanouts, bathroom remodels, and concrete or dirt removal in San Jose. Our most popular size for heavy material jobs.',
    useCases: ['Bathroom remodel debris', 'Concrete slab removal', 'Small garage cleanout', 'Yard waste & dirt'],
  },
  {
    yards: 20,
    title: '20 Yard Dumpster — San Jose',
    description: 'Our best seller for San Jose home renovations. Ideal for kitchen remodels, roofing tear-offs, and medium-sized cleanouts.',
    useCases: ['Kitchen renovation', 'Roofing tear-off', 'Full room cleanout', 'Deck removal'],
  },
  {
    yards: 30,
    title: '30 Yard Dumpster — San Jose',
    description: 'Built for major renovations and new construction in San Jose. High sidewalls handle bulky furniture and framing debris.',
    useCases: ['Major home renovation', 'New construction debris', 'Estate cleanout', 'Multi-room remodel'],
  },
  {
    yards: 40,
    title: '40 Yard Dumpster — San Jose',
    description: 'Commercial-grade capacity for large San Jose projects. Ideal for demolition, warehouse cleanouts, and industrial sites.',
    useCases: ['Commercial demolition', 'Warehouse cleanout', 'Large construction site', 'Industrial waste removal'],
  },
  {
    yards: 50,
    title: '50 Yard Dumpster — San Jose',
    description: 'Maximum capacity for high-volume commercial debris, new construction, and large-scale demolition in San Jose.',
    useCases: ['New construction', 'Large demolition', 'High-volume commercial', 'Industrial projects'],
  },
];

const FAQS = [
  {
    question: 'How much does dumpster rental cost in San Jose?',
    answer: `Dumpster rental in San Jose starts at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard dumpster. Pricing depends on size, material type, ZIP code, and rental duration. Heavy materials like concrete use flat-fee pricing with no weight overage. General debris overage is $${PRICING_POLICIES.overagePerTonGeneral}/ton beyond included tonnage.`,
  },
  {
    question: 'Do I need a permit for a dumpster in San Jose?',
    answer: 'If the dumpster is placed on your private property (driveway, yard), no permit is typically required in San Jose. If you need to place it on a public street, you may need an encroachment permit from the City of San Jose Department of Transportation. We can guide you through the process.',
  },
  {
    question: 'How fast can you deliver a dumpster in San Jose?',
    answer: 'Same-day delivery is available for most San Jose addresses when you order before noon. Our San Jose yard is centrally located, so delivery times are typically under 2 hours for most neighborhoods.',
  },
  {
    question: 'What size dumpster do I need?',
    answer: 'For small cleanouts and concrete jobs, a 10-yard dumpster works well. For home renovations, most San Jose customers choose a 20-yard. For major construction or commercial projects, 30 or 40 yard sizes are recommended. Call us at (510) 680-2150 and we will help you pick the right size.',
  },
  {
    question: 'Can I put concrete in a dumpster?',
    answer: 'Yes. We offer dedicated concrete dumpsters in 5, 8, and 10-yard sizes with flat-fee pricing. Clean concrete is recyclable. Mixed loads (concrete + general debris) may be reclassified and priced differently. The dumpster must not be loaded above the fill line.',
  },
  {
    question: 'What weight is included in the rental price?',
    answer: 'Each dumpster size includes a base tonnage allowance. For example, a 10-yard includes 1 ton and a 20-yard includes 2 tons of general debris. Heavy material dumpsters (concrete, dirt) are flat-fee with no weight overage. Any excess weight on general debris is billed at $165/ton based on scale ticket.',
  },
  {
    question: 'Are you a broker?',
    answer: `No. Calsan Dumpsters Pro is NOT a broker. We own our trucks and dumpsters. Our San Jose yard is at ${SJ_YARD.address}. When you call us, you are talking to the company that delivers your dumpster.`,
  },
  {
    question: 'How do I schedule pickup?',
    answer: 'You can schedule pickup by calling (510) 680-2150 or through our online portal. Most pickups in San Jose are completed within 24 hours of your request. Your 7-day rental period starts on the day of delivery.',
  },
];

// ── Schema generators ────────────────────────────────────────
const serviceSchema = generateServiceSchema({
  name: 'Dumpster Rental San Jose CA',
  description: META.description,
  areaServed: ['San Jose', 'Santa Clara County'],
  price: String(DUMPSTER_SIZES_DATA[0]?.priceFrom || 395),
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Dumpster Rental San Jose CA', url: `/${META.slug}` },
]);

const faqSchema = generateFAQSchema(FAQS);

// ── Component ────────────────────────────────────────────────
export default function DumpsterRentalSanJose() {
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
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Dumpster Rental San Jose CA</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-4">
              Dumpster Rental San Jose, CA
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-3">
              Fast Roll-Off Dumpster Delivery in San Jose from a Local Bay Area Team
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" />Real Inventory</span>
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
          <h2 className="heading-lg text-foreground mb-3 text-center">Why San Jose Customers Choose Calsan</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            When you need dumpster rental in San Jose, you deserve a company that serves your area daily — not a broker
            who farms out your order to the lowest bidder.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: 'We Serve San Jose Daily',
                desc: `Our San Jose yard at ${SJ_YARD.address} dispatches trucks to South Bay neighborhoods every single day. Real local presence, not a call center.`,
              },
              {
                title: 'Not a Broker Marketplace',
                desc: 'Calsan Dumpsters Pro owns its fleet. When you book a dumpster rental in San Jose, our team handles delivery, pickup, and disposal directly.',
              },
              {
                title: 'Direct Dispatch Team',
                desc: 'No middlemen. When you call (510) 680-2150, you talk directly to the team that delivers your dumpster in San Jose.',
              },
              {
                title: 'Transparent Pricing',
                desc: `Flat-fee pricing for heavy materials. General debris starts at $${DUMPSTER_SIZES_DATA[0].priceFrom}. No hidden fuel surcharges or environmental fees.`,
              },
              {
                title: 'Fast Turnaround',
                desc: 'Same-day delivery available for most San Jose addresses when you order before noon. Typical delivery times under 2 hours.',
              },
              {
                title: 'Construction & Residential',
                desc: 'Experienced with both large-scale construction projects and residential cleanouts across San Jose. We understand South Bay permitting and logistics.',
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
          <h2 className="heading-lg text-foreground mb-3 text-center">Dumpster Sizes Available in San Jose</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Every dumpster rental in San Jose includes 7-day rental, delivery, and pickup. Choose the right size for your project.
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
          <h2 className="heading-lg text-foreground mb-3 text-center">Concrete & Dirt Dumpsters in San Jose</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Need a concrete dumpster in San Jose? We offer dedicated heavy material dumpsters with flat-rate pricing — no weight overage surprises.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-4">
            {[
              { label: 'Available Sizes', value: '5, 8, and 10 yard dumpsters for heavy materials. 10-yard is most popular for San Jose concrete jobs.' },
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
          <h2 className="heading-lg text-foreground mb-3 text-center">How Much Does Dumpster Rental Cost in San Jose?</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Pricing for dumpster rental in San Jose depends on four factors: size, material type, your ZIP code, and rental duration.
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
              <p className="text-sm text-muted-foreground">Delivery distance from our San Jose yard affects pricing. Central San Jose ZIPs get the best rates.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <Clock className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Rental Duration</h3>
              <p className="text-sm text-muted-foreground">Standard 7-day rental included. Extended rentals available at a daily rate.</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-lg font-semibold text-foreground mb-1">San Jose dumpster rental starting at ${DUMPSTER_SIZES_DATA[0].priceFrom}</p>
            <p className="text-sm text-muted-foreground mb-4">7-day rental, delivery & pickup included</p>
            <Button asChild variant="cta" size="lg">
              <Link to="/quote">Check Exact Price by ZIP Code <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 6. SERVICE AREAS / NEIGHBORHOODS ──────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">Serving All San Jose Neighborhoods</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            If you searched "dumpster rental near me in San Jose," we deliver fast.
            Our San Jose yard covers every neighborhood across the South Bay.
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
          <h2 className="heading-lg text-foreground mb-3 text-center">Contractor Dumpster Rentals in San Jose</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            San Jose contractors trust Calsan for reliable dumpster rental with priority scheduling, fast swaps, and dedicated support.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: HardHat, title: 'Job Site Priority', desc: 'Contractors get priority scheduling for time-sensitive San Jose job sites.' },
              { icon: Truck, title: 'Concrete Dumpsters', desc: 'Dedicated heavy material dumpsters for San Jose foundation, demo, and flatwork jobs.' },
              { icon: Building2, title: 'Volume Pricing', desc: 'Multi-dumpster and recurring service discounts for San Jose contractors.' },
              { icon: Clock, title: 'Fast Swaps & Dispatch', desc: 'Need a swap? We coordinate fast dumpster swaps on San Jose job sites — hours, not days.' },
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
          <h2 className="heading-lg text-foreground mb-8 text-center">San Jose Dumpster Rental FAQ</h2>
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
          <h2 className="heading-lg mb-4">Ready to Rent a Dumpster in San Jose?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Get an instant quote in 60 seconds or call us now. Same-day delivery available for most San Jose addresses.
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

      {/* ── SIZE & SERVICE LINKS ──────────────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6 text-center">Explore Dumpster Services in San Jose</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { to: '/dumpster-rental/san-jose/10-yard', label: '10 Yard Dumpster San Jose', desc: 'Compact size for cleanouts and concrete removal.' },
              { to: '/dumpster-rental/san-jose/20-yard', label: '20 Yard Dumpster San Jose', desc: 'Best seller for home renovations and remodels.' },
              { to: '/dumpster-rental/san-jose/30-yard', label: '30 Yard Dumpster San Jose', desc: 'Large capacity for major construction projects.' },
              { to: '/dumpster-rental-oakland-ca', label: 'Dumpster Rental Oakland', desc: 'East Bay service from our Oakland yard.' },
              { to: '/dumpster-rental-san-francisco-ca', label: 'Dumpster Rental San Francisco', desc: 'Roll-off dumpsters delivered to SF job sites.' },
              { to: '/dumpster-rental/san-jose/concrete', label: 'Concrete Dumpster San Jose', desc: 'Flat-fee concrete and heavy material disposal.' },
              { to: '/contractors', label: 'Contractor Programs', desc: 'Priority scheduling and volume coordination.' },
              { to: '/sizes', label: 'All Dumpster Sizes', desc: 'Compare all sizes from 5 to 50 yards.' },
              { to: '/materials', label: 'Accepted Materials', desc: 'What you can and cannot dispose of.' },
            ].map((link) => (
              <Link key={link.to} to={link.to} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
                <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{link.label}</h3>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. RELATED LOCATIONS ─────────────────────────── */}
      <RelatedLocations currentCity="san-jose-ca" pageContext="sj-landing" title="Also Serving Nearby Areas" />

      {/* ── 11. INTERNAL LINKS ────────────────────────────── */}
      <InternalLinkBlock currentCity="san-jose-ca" type="city" pageContext="sj-landing" />

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
