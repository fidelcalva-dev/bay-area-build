import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO, generateFAQSchema, generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { ArrowRight, Phone, MapPin, Clock, Shield, Truck, CheckCircle, HardHat, Building2, Ruler, AlertTriangle } from 'lucide-react';
import { RelatedLocations, InternalLinkBlock } from '@/components/seo';

// ── SF-specific data ─────────────────────────────────────────
const META = {
  title: 'Dumpster Rental San Francisco CA | Same-Day | From $395 | Calsan',
  description: 'Local dumpster rental in San Francisco, CA from $395. 10-40 yard roll-off dumpsters for construction, renovation, and cleanouts. Same-day delivery, transparent pricing, no brokers. Hablamos Español.',
  slug: 'dumpster-rental-san-francisco-ca',
};

const NEIGHBORHOODS = [
  'Mission District', 'SoMa', 'Pacific Heights', 'Sunset District',
  'Richmond District', 'Noe Valley', 'Castro', 'Haight-Ashbury',
  'Marina District', 'Potrero Hill', 'Bayview-Hunters Point', 'Excelsior',
  'Outer Sunset', 'Inner Richmond', 'Bernal Heights', 'Glen Park',
];

const ZIP_CODES = [
  '94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110',
  '94112', '94114', '94115', '94116', '94117', '94118', '94121', '94122',
  '94123', '94124', '94127', '94129', '94130', '94131', '94132', '94133',
  '94134',
];

const TRANSFER_STATIONS = [
  { name: 'Recology SF Transfer Station', address: '501 Tunnel Ave, San Francisco', note: 'Primary transfer station for construction and demolition debris.' },
  { name: 'SF Recycling & Disposal', address: '900 7th St, San Francisco', note: 'Accepts mixed debris, concrete, and green waste.' },
];

const SIZE_DETAILS: { yards: number; title: string; description: string; useCases: string[] }[] = [
  {
    yards: 10,
    title: '10 Yard Dumpster — San Francisco',
    description: 'Perfect for tight San Francisco driveways and small renovation projects. Our most popular size for concrete and bathroom remodels in the city.',
    useCases: ['Bathroom remodel debris', 'Concrete slab removal', 'Small garage cleanout', 'Yard waste removal'],
  },
  {
    yards: 20,
    title: '20 Yard Dumpster — San Francisco',
    description: 'The go-to size for San Francisco home renovations. Fits most driveways and handles kitchen remodels, roofing tear-offs, and medium cleanouts.',
    useCases: ['Kitchen renovation', 'Roofing tear-off (single story)', 'Full room cleanout', 'Deck removal'],
  },
  {
    yards: 30,
    title: '30 Yard Dumpster — San Francisco',
    description: 'Ideal for major San Francisco renovations and multi-unit projects. High sidewalls handle bulky furniture and framing debris.',
    useCases: ['Major home renovation', 'Multi-unit cleanout', 'New construction debris', 'Estate cleanout'],
  },
  {
    yards: 40,
    title: '40 Yard Dumpster — San Francisco',
    description: 'Commercial-grade capacity for large San Francisco construction and demolition projects. Requires adequate access for placement.',
    useCases: ['Commercial demolition', 'Warehouse cleanout', 'Large construction site', 'Tenant improvement debris'],
  },
];

const FAQS = [
  {
    question: 'How much does dumpster rental cost in San Francisco?',
    answer: `Dumpster rental in San Francisco starts at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard dumpster. San Francisco pricing may be slightly higher than East Bay due to city-specific disposal fees and logistics. Heavy materials like concrete use flat-fee pricing with no weight overage. General debris overage is $${PRICING_POLICIES.overagePerTonGeneral}/ton beyond included tonnage.`,
  },
  {
    question: 'Do I need a permit for a dumpster in San Francisco?',
    answer: 'If the dumpster is placed on your private property (driveway, yard), no permit is required. If you need to place it on a public street in San Francisco, you will need a Temporary Exclusive Use permit from SFMTA. Street placement also requires reflective cones and may have time restrictions. We can help guide you through the San Francisco permit process.',
  },
  {
    question: 'Can you deliver to narrow San Francisco streets?',
    answer: 'Yes. Our experienced drivers navigate San Francisco tight streets, steep hills, and parking-restricted areas daily. We recommend calling ahead for addresses in Pacific Heights, Russian Hill, Telegraph Hill, or other steep neighborhoods so we can plan the safest placement.',
  },
  {
    question: 'What size dumpster do I need for my SF project?',
    answer: 'For small cleanouts and concrete jobs, a 10-yard works well and fits most SF driveways. For home renovations, 20-yard is our best seller. For major construction or commercial projects, 30 or 40 yard sizes are recommended. Call us at (510) 680-2150 and we will help you pick the right size.',
  },
  {
    question: 'Can I put concrete in a dumpster in San Francisco?',
    answer: 'Yes. We offer dedicated concrete dumpsters in 6, 8, and 10-yard sizes with flat-fee pricing. Clean concrete is recyclable. Mixed loads (concrete + general debris) may be reclassified and priced at general debris rates. The dumpster must not be loaded above the fill line.',
  },
  {
    question: 'Are you a broker?',
    answer: 'No. Calsan Dumpsters Pro is NOT a broker. We own our trucks and dumpsters. We serve San Francisco from our Oakland yard at 1000 46th Ave. When you call us, you are talking to the company that delivers your dumpster.',
  },
  {
    question: 'How fast can you deliver a dumpster in San Francisco?',
    answer: 'Same-day delivery is available for most San Francisco addresses when you order before noon. Delivery times are typically 2-3 hours depending on traffic and access logistics. We coordinate closely with you on placement timing.',
  },
  {
    question: 'What are the weight limits for dumpsters in San Francisco?',
    answer: 'Each dumpster size includes a base tonnage allowance. For example, a 10-yard includes 1 ton and a 20-yard includes 2 tons of general debris. Heavy material dumpsters (concrete, dirt) are flat-fee with no weight overage. Any excess weight on general debris is billed at $165/ton based on scale ticket.',
  },
];

// ── Schema generators ────────────────────────────────────────
const serviceSchema = generateServiceSchema({
  name: 'Dumpster Rental San Francisco CA',
  description: META.description,
  areaServed: ['San Francisco', 'San Francisco County'],
  price: '390',
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Dumpster Rental San Francisco CA', url: `/${META.slug}` },
]);

const faqSchema = generateFAQSchema(FAQS);

// ── Component ────────────────────────────────────────────────
export default function DumpsterRentalSanFrancisco() {
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
              <span className="text-foreground font-medium">Dumpster Rental San Francisco CA</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-4">
              Dumpster Rental San Francisco, CA
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-3">
              Local Roll-Off Dumpster Delivery Throughout San Francisco
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" />Not a Broker</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" />Transparent Pricing</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" />Same-Day Available</span>
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-primary" />Hill & Tight-Access Experts</span>
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
          <h2 className="heading-lg text-foreground mb-3 text-center">Why San Francisco Trusts Calsan</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            San Francisco projects demand precision logistics. Tight streets, steep hills, and strict city regulations
            require a dumpster company that knows the city — not a broker dialing in from out of state.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: 'SF Street Navigation Experts',
                desc: 'Our drivers deliver to Pacific Heights, the Mission, SoMa, and every neighborhood in between. We know which streets accommodate roll-offs and which require special planning.',
              },
              {
                title: 'Not a Broker',
                desc: 'Calsan Dumpsters Pro owns its fleet. When you book a dumpster rental in San Francisco, our team handles delivery, pickup, and disposal directly from our Oakland yard.',
              },
              {
                title: 'Permit Guidance',
                desc: 'Need to place a dumpster on a San Francisco street? We guide you through the SFMTA Temporary Exclusive Use permit process, including reflective cone requirements.',
              },
              {
                title: 'Transparent Pricing',
                desc: `Flat-fee pricing for heavy materials. General debris starts at $${DUMPSTER_SIZES_DATA[0].priceFrom}. No hidden fuel surcharges or environmental fees.`,
              },
              {
                title: 'Same-Day Delivery',
                desc: 'Order before noon for same-day dumpster delivery to most San Francisco addresses. We coordinate timing to minimize impact on street access.',
              },
              {
                title: 'Construction & Residential',
                desc: 'From Victorian renovation debris in the Haight to commercial tenant improvements in SoMa, we handle every type of San Francisco project.',
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
          <h2 className="heading-lg text-foreground mb-3 text-center">Dumpster Sizes Available in San Francisco</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Every dumpster rental in San Francisco includes 7-day rental, delivery, and pickup. Choose the right size for your project.
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
              View all 7 dumpster sizes (5-50 yard) →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA BREAK ─────────────────────────────────────── */}
      <section className="py-10 bg-primary/5 border-y border-primary/20">
        <div className="container-narrow text-center">
          <p className="text-lg font-semibold text-foreground mb-1">Need a dumpster in San Francisco today?</p>
          <p className="text-sm text-muted-foreground mb-4">Get your exact price by ZIP code in 60 seconds.</p>
          <Button asChild variant="cta" size="lg">
            <Link to="/quote">Check Price by ZIP <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </section>

      {/* ── 4. HEAVY MATERIAL ─────────────────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">Concrete & Dirt Dumpsters in San Francisco</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            San Francisco foundation work, sidewalk replacement, and demolition projects generate heavy materials.
            We offer dedicated heavy material dumpsters with flat-rate pricing — no weight overage surprises.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-4">
            {[
              { label: 'Available Sizes', value: '6, 8, and 10 yard dumpsters for heavy materials. Due to SF street constraints, 10-yard is most common.' },
              { label: 'Fill-Line Required', value: 'Heavy material dumpsters must not be loaded above the fill line for safe transport — especially critical on San Francisco hills.' },
              { label: 'Flat-Rate Pricing', value: 'Concrete and dirt dumpsters use flat-fee pricing. No weight overage charges — the price you see is the price you pay.' },
              { label: 'Clean Concrete', value: 'Clean concrete (no rebar, no dirt mixed in) is fully recyclable and qualifies for our lowest heavy material rate.' },
              { label: 'Mixed Loads', value: 'If you mix concrete with general debris, the load will be reclassified as general debris and priced accordingly at $165/ton overage.' },
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
          <h2 className="heading-lg text-foreground mb-3 text-center">How Much Does Dumpster Rental Cost in San Francisco?</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            San Francisco dumpster rental pricing depends on size, material type, your ZIP code, and rental duration.
            City-specific disposal fees may apply.
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
              <p className="text-sm text-muted-foreground">San Francisco delivery from our Oakland yard is competitively priced. Central SF ZIPs (94103, 94107, 94110) get strong rates.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <Clock className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Rental Duration</h3>
              <p className="text-sm text-muted-foreground">Standard 7-day rental included. Extended rentals available at a daily rate. Street permits may have their own time limits.</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-lg font-semibold text-foreground mb-1">San Francisco dumpster rental starting at ${DUMPSTER_SIZES_DATA[0].priceFrom}</p>
            <p className="text-sm text-muted-foreground mb-4">7-day rental, delivery & pickup included</p>
            <Button asChild variant="cta" size="lg">
              <Link to="/quote">Check Exact Price by ZIP <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 6. TRANSFER STATIONS ──────────────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">San Francisco Transfer Stations & Disposal</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            We work with licensed San Francisco transfer stations to ensure proper sorting, recycling, and disposal
            of your debris. All loads are weighed on certified scales.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {TRANSFER_STATIONS.map((station, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{station.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{station.address}</p>
                    <p className="text-xs text-muted-foreground">{station.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. NEIGHBORHOODS & ZIP CODES ──────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">Serving All San Francisco Neighborhoods</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you need a dumpster rental near me in San Francisco or a roll-off for a job across the city,
            we deliver to every neighborhood — including steep hills and tight-access areas.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {NEIGHBORHOODS.map(hood => (
              <div key={hood} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5 text-sm">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-foreground">{hood}</span>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-2 text-center">San Francisco ZIP Codes We Serve</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {ZIP_CODES.map(zip => (
                <span key={zip} className="px-2.5 py-1 bg-card border border-border rounded text-xs text-muted-foreground font-mono">{zip}</span>
              ))}
            </div>
          </div>

          <div className="text-center mt-6">
            <Link to="/areas" className="text-primary font-medium hover:underline text-sm">
              View all Bay Area service areas →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. SF PERMIT GUIDE ────────────────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">San Francisco Dumpster Permit Guide</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            San Francisco has specific rules for dumpster placement. Here is what you need to know.
          </p>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Private Property — No Permit Needed</h3>
                <p className="text-sm text-muted-foreground">If the dumpster fits on your driveway, yard, or private property, no permit is required in San Francisco.</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-accent-foreground mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Street Placement — SFMTA Permit Required</h3>
                <p className="text-sm text-muted-foreground">Placing a dumpster on a San Francisco public street requires a Temporary Exclusive Use (TEU) permit from SFMTA. You will also need reflective cones and may face time-of-day restrictions.</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
              <HardHat className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">We Help With the Process</h3>
                <p className="text-sm text-muted-foreground">Not sure if you need a permit? Call us at {BUSINESS_INFO.phone.salesFormatted} and we will assess your placement options and guide you through the process.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BREAK ─────────────────────────────────────── */}
      <section className="py-10 bg-primary/5 border-y border-primary/20">
        <div className="container-narrow text-center">
          <p className="text-lg font-semibold text-foreground mb-1">San Francisco construction project?</p>
          <p className="text-sm text-muted-foreground mb-4">Contractors get priority scheduling and volume discounts.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild variant="cta" size="lg">
              <Link to="/quote/contractor">Contractor Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild variant="heroOutline" size="lg">
              <Link to="/contractors">Contractor Programs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 9. CONTRACTOR SECTION ─────────────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-3 text-center">Contractor Dumpster Rentals in San Francisco</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            San Francisco contractors trust Calsan for reliable dumpster rental with priority scheduling, fast swaps, and dedicated support.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: HardHat, title: 'Job Site Priority', desc: 'Contractors get priority scheduling for time-sensitive San Francisco job sites. We understand the pace of SF construction.' },
              { icon: Truck, title: 'Concrete & Demo Dumpsters', desc: 'Dedicated heavy material dumpsters for San Francisco foundation, demo, and tenant improvement jobs.' },
              { icon: Building2, title: 'Volume Pricing', desc: 'Multi-dumpster and recurring service discounts for San Francisco contractors. Net-30 available for qualified accounts.' },
              { icon: Clock, title: 'Fast Swaps', desc: 'Need a swap on a San Francisco job site? We coordinate fast dumpster swaps — hours, not days.' },
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
        </div>
      </section>

      {/* ── 10. FAQ SECTION ───────────────────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-8 text-center">San Francisco Dumpster Rental FAQ</h2>
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

      {/* ── 11. FINAL CTA ─────────────────────────────────── */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Rent a Dumpster in San Francisco?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Get an instant quote in 60 seconds or call us now. Same-day delivery available for most San Francisco addresses.
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

      {/* ── 12. RELATED LOCATIONS ─────────────────────────── */}
      <RelatedLocations currentCity="san-francisco-ca" pageContext="sf-landing" title="Also Serving Nearby Areas" />

      {/* ── 13. INTERNAL LINKS ────────────────────────────── */}
      <InternalLinkBlock currentCity="san-francisco-ca" type="city" pageContext="sf-landing" />

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
