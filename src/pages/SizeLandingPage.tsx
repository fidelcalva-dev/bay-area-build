import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { BUSINESS_INFO, generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { SERVICE_CITIES } from '@/lib/cityData';
import { ArrowRight, Phone, CheckCircle, Weight, Ruler, Truck, Home, Hammer } from 'lucide-react';
import NotFound from './NotFound';

const SIZE_CONTENT: Record<number, {
  headline: string;
  description: string;
  whoItsFor: string[];
  whatFits: string[];
  commonMistakes: string[];
  tips: string[];
}> = {
  6: {
    headline: 'The compact workhorse for small jobs.',
    description: 'A 6-yard dumpster is perfect for small cleanouts, single-room renovations, and concrete removal. At just 2.25 feet tall, it fits in tight driveways and is easy to load.',
    whoItsFor: ['Homeowners doing garage cleanouts', 'Small concrete or brick removal', 'Bathroom remodels', 'Yard debris cleanup'],
    whatFits: ['2-3 pickup truck loads', 'A small bathroom worth of demolition', 'A single concrete slab', 'A large pile of yard waste'],
    commonMistakes: ['Overestimating how much fits—6 yards is compact', 'Mixing heavy materials with general debris', 'Overfilling above the walls'],
    tips: ['Great for heavy materials like concrete at flat-fee pricing', 'Fits in most standard driveways', 'Order early for same-day delivery'],
  },
  8: {
    headline: 'The most popular size for foundation and driveway work.',
    description: 'An 8-yard dumpster is our top pick for driveway demolition, foundation work, and medium cleanouts. The 3-foot walls make loading easy while holding 3-4 pickup truck loads.',
    whoItsFor: ['Foundation demolition', 'Driveway removal', 'Garage cleanouts', 'Bathroom or kitchen remodels'],
    whatFits: ['3-4 pickup truck loads', 'A driveway worth of concrete', 'A single room of renovation debris', 'A large garage cleanout'],
    commonMistakes: ['Using a general debris dumpster for pure concrete (use heavy material for flat-fee)', 'Not accounting for weight of wet materials', 'Ordering too small for a full room renovation'],
    tips: ['Best value for concrete and brick jobs', 'Popular with contractors for its versatility', 'Available for both heavy and general debris'],
  },
  10: {
    headline: 'The sweet spot for small to medium projects.',
    description: 'A 10-yard dumpster bridges the gap between small jobs and larger renovations. With 1 ton included for general debris and flat-fee pricing for heavy materials, it\'s incredibly versatile.',
    whoItsFor: ['Small renovations', 'Deck removal', 'Large concrete jobs', 'Estate cleanouts'],
    whatFits: ['4-5 pickup truck loads', 'A deck demolition', 'A large concrete patio', 'Multiple rooms of junk'],
    commonMistakes: ['Underestimating renovation debris volume', 'Not separating heavy materials from general trash', 'Waiting too long to order for your project timeline'],
    tips: ['Largest size available for heavy materials (concrete, dirt)', 'Includes 1 ton for general debris', 'Flat-fee pricing for pure heavy loads'],
  },
  20: {
    headline: 'Our most popular size for home renovations.',
    description: 'The 20-yard dumpster is the go-to choice for home renovations, roofing projects, and large cleanouts. At 4 feet tall with 2 tons included, it handles serious debris volumes.',
    whoItsFor: ['Full room renovations', 'Roofing projects (up to 30 squares)', 'Large cleanouts', 'Small demolition projects'],
    whatFits: ['6-8 pickup truck loads', 'A full roof tear-off (up to 30 squares)', 'Multiple rooms of renovation debris', 'A large estate cleanout'],
    commonMistakes: ['Choosing a 10-yard when a 20 is more cost-effective', 'Not accounting for roofing weight (shingles are heavy)', 'Placing on soft ground without plywood protection'],
    tips: ['Most cost-effective for medium projects', '2 tons included—enough for most renovations', 'Ask about same-day delivery availability'],
  },
  30: {
    headline: 'High walls for major projects and bulky items.',
    description: 'The 30-yard dumpster features 6-foot walls for maximum capacity. Perfect for major renovations, new construction waste, and estate cleanouts with bulky furniture.',
    whoItsFor: ['Major home renovations', 'New construction waste', 'Estate cleanouts', 'Commercial tenant improvements'],
    whatFits: ['9-12 pickup truck loads', 'A whole-house renovation', 'Large furniture and appliances', 'Commercial buildout debris'],
    commonMistakes: ['Not measuring your driveway first—30 yards need 18+ feet of length', 'Overfilling above the 6-foot walls', 'Mixing prohibited items with general debris'],
    tips: ['Ideal for multi-room renovations', '3 tons included for general debris', 'High walls contain bulky items safely'],
  },
  40: {
    headline: 'Commercial-grade capacity for large-scale projects.',
    description: 'A 40-yard dumpster is built for commercial projects, large demolitions, and industrial waste. At 24 feet long with 6-foot walls, it holds 12-16 pickup truck loads.',
    whoItsFor: ['Commercial projects', 'Large demolition', 'Industrial waste', 'Multi-unit residential renovations'],
    whatFits: ['12-16 pickup truck loads', 'A commercial space buildout', 'A full house demolition', 'Industrial facility cleanout'],
    commonMistakes: ['Not confirming site access for a 24-foot container', 'Underestimating weight of commercial debris', 'Not ordering enough dumpsters for phased projects'],
    tips: ['Most popular commercial size', '4 tons included', 'Consider multiple 20-yard dumpsters for phased work'],
  },
  50: {
    headline: 'Maximum volume for the largest jobs.',
    description: 'Our 50-yard dumpster is the biggest available—24 feet long with 7.5-foot walls. Built for warehouse cleanouts, industrial sites, and the largest construction projects.',
    whoItsFor: ['Warehouse cleanouts', 'Industrial sites', 'Large commercial demolition', 'Multi-building projects'],
    whatFits: ['16-20 pickup truck loads', 'An entire warehouse worth of materials', 'Large-scale demolition debris', 'Industrial equipment and waste'],
    commonMistakes: ['Not verifying overhead clearance for 7.5-foot walls', 'Not planning for weight limits on large volumes', 'Forgetting to check site access for truck delivery'],
    tips: ['5 tons included', 'Best for high-volume, lower-weight materials', 'Call for availability—limited stock'],
  },
};

export default function SizeLandingPage() {
  const { sizeSlug } = useParams<{ sizeSlug: string }>();
  const yards = sizeSlug ? parseInt(sizeSlug) : NaN;
  const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === yards);
  const content = SIZE_CONTENT[yards];

  if (!sizeData || !content) return <NotFound />;

  const isHeavyCapable = sizeData.category === 'heavy' || sizeData.category === 'both';
  const serviceSchema = generateServiceSchema({
    name: `${yards} Yard Dumpster Rental`,
    description: content.description,
    price: sizeData.priceFrom.toString(),
  });
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Sizes', url: '/sizes' },
    { name: `${yards} Yard Dumpster`, url: `/${yards}-yard-dumpster` },
  ]);

  const title = `${yards} Yard Dumpster Rental | Dimensions, Pricing & Uses`;
  const description = `Rent a ${yards}-yard dumpster starting at $${sizeData.priceFrom}. ${sizeData.dimensions}. ${sizeData.loads} of capacity. ${isHeavyCapable ? 'Available for concrete & heavy materials.' : 'For general debris, renovations & cleanouts.'} Bay Area delivery.`;

  return (
    <Layout title={title} description={description}>
      <Helmet>
        <link rel="canonical" href={`${BUSINESS_INFO.url}/${yards}-yard-dumpster`} />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
      </Helmet>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-3">
              <Link to="/" className="hover:text-primary-foreground">Home</Link>
              <span>/</span>
              <Link to="/sizes" className="hover:text-primary-foreground">Sizes</Link>
              <span>/</span>
              <span className="text-primary-foreground">{yards} Yard</span>
            </div>
            <h1 className="heading-xl mb-4">{yards} Yard Dumpster Rental</h1>
            <p className="text-xl text-primary-foreground/85 mb-2">{content.headline}</p>
            <p className="text-primary-foreground/70 mb-6">Starting at <strong className="text-primary-foreground">${sizeData.priceFrom}</strong></p>
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

      {/* Specs */}
      <section className="py-6 bg-muted/50 border-b border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <Ruler className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-sm font-semibold text-foreground">{sizeData.dimensions}</div>
              <div className="text-xs text-muted-foreground">Dimensions</div>
            </div>
            <div>
              <Truck className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-sm font-semibold text-foreground">{sizeData.loads}</div>
              <div className="text-xs text-muted-foreground">Pickup Loads</div>
            </div>
            <div>
              <Weight className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-sm font-semibold text-foreground">{sizeData.includedTons}T Included</div>
              <div className="text-xs text-muted-foreground">General Debris</div>
            </div>
            <div>
              {isHeavyCapable ? <Hammer className="w-5 h-5 text-primary mx-auto mb-1" /> : <Home className="w-5 h-5 text-primary mx-auto mb-1" />}
              <div className="text-sm font-semibold text-foreground">{isHeavyCapable ? 'Heavy + General' : 'General Only'}</div>
              <div className="text-xs text-muted-foreground">Material Types</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Who It's For */}
            <div>
              <h2 className="heading-md text-foreground mb-4">Who It's For</h2>
              <ul className="space-y-3">
                {content.whoItsFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What Fits */}
            <div>
              <h2 className="heading-md text-foreground mb-4">What Fits Inside</h2>
              <ul className="space-y-3">
                {content.whatFits.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Weight */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-8 text-center">{yards}-Yard Pricing & Weight Rules</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {isHeavyCapable && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Hammer className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-foreground">Heavy Materials</h3>
                </div>
                <p className="text-2xl font-black text-foreground mb-1">Flat Fee</p>
                <p className="text-sm text-muted-foreground">Concrete, dirt, rock, brick, asphalt. Disposal included—no weight overage charges.</p>
              </div>
            )}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">General Debris</h3>
              </div>
              <p className="text-2xl font-black text-foreground mb-1">From ${sizeData.priceFrom}</p>
              <p className="text-sm text-muted-foreground">{sizeData.includedTons}T included. Overage at ${PRICING_POLICIES.overagePerTonGeneral}/ton based on scale ticket.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6">Common Mistakes to Avoid</h2>
          <div className="space-y-3">
            {content.commonMistakes.map((mistake, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                <span className="text-destructive font-bold shrink-0">✗</span>
                <span className="text-muted-foreground">{mistake}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Tips */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6">Pro Tips</h2>
          <div className="space-y-3">
            {content.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Served */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-md text-foreground mb-6 text-center">{yards}-Yard Dumpster Available In</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {SERVICE_CITIES.slice(0, 12).map(city => (
              <Link
                key={city.slug}
                to={`/dumpster-rental/${city.slug}`}
                className="px-3 py-1.5 bg-muted rounded-full text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Need a {yards}-Yard Dumpster?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Get an instant quote in 30 seconds. Same-day delivery available.</p>
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
    </Layout>
  );
}
