import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, CheckCircle, XCircle, Info, DollarSign, Truck, Clock, AlertTriangle, Scale, Calendar, Trash2, HardHat, Leaf, Ban } from 'lucide-react';

const TRASHLAB_URL = 'https://app.trashlab.com';

const pricingTiers = [
  { size: 8, priceRange: '$350–$425', weightLimit: '1 ton', idealFor: 'Small cleanouts, bathroom remodels' },
  { size: 10, priceRange: '$395–$475', weightLimit: '2 tons', idealFor: 'Single room renovation, garage cleanout' },
  { size: 15, priceRange: '$445–$525', weightLimit: '2 tons', idealFor: 'Kitchen remodel, small roofing job' },
  { size: 20, priceRange: '$495–$595', weightLimit: '3 tons', idealFor: 'Whole-house cleanout, medium construction' },
  { size: 30, priceRange: '$595–$695', weightLimit: '4 tons', idealFor: 'Major renovation, commercial cleanout' },
  { size: 40, priceRange: '$695–$825', weightLimit: '5 tons', idealFor: 'New construction, large demolition' },
];

const included = [
  { item: 'Up to 7 days rental period', detail: 'Plenty of time for most projects' },
  { item: 'Delivery & pickup', detail: 'Both trips included in your price' },
  { item: 'Weight allowance included', detail: 'See limits per size above' },
  { item: 'Standard disposal fees', detail: 'For common household debris' },
  { item: 'Text delivery updates', detail: 'Know exactly when we arrive' },
  { item: 'Placement guidance', detail: "We'll help you choose the best spot" },
];

const notIncluded = [
  { item: 'Hazardous materials', detail: 'Paint, chemicals, batteries, etc.' },
  { item: 'Appliances with freon', detail: 'AC units, refrigerators need special handling' },
  { item: 'Tires and mattresses', detail: 'Additional fees apply if included' },
  { item: 'Heavy materials (concrete, dirt, brick)', detail: '$100 surcharge applies' },
  { item: 'Extra rental days beyond 7', detail: '$50/day after initial period' },
  { item: 'Weight overages', detail: '$75/ton over your weight limit' },
];

const materialTypes = [
  { 
    name: 'Standard Debris', 
    icon: Trash2, 
    items: ['Household junk', 'Furniture', 'Carpet', 'Drywall', 'Wood', 'Yard waste'],
    fee: 'Included',
    color: 'text-success'
  },
  { 
    name: 'Construction Materials', 
    icon: HardHat, 
    items: ['Shingles', 'Siding', 'Lumber', 'Fixtures', 'Cabinets', 'Flooring'],
    fee: 'Included',
    color: 'text-success'
  },
  { 
    name: 'Heavy Materials', 
    icon: Scale, 
    items: ['Concrete', 'Asphalt', 'Brick', 'Dirt', 'Rocks', 'Sand'],
    fee: '+$100 flat surcharge',
    color: 'text-warning'
  },
  { 
    name: 'Prohibited Items', 
    icon: Ban, 
    items: ['Hazardous waste', 'Paint/chemicals', 'Batteries', 'Electronics', 'Medical waste', 'Asbestos'],
    fee: 'Not accepted',
    color: 'text-destructive'
  },
];

const overageExplanations = [
  {
    title: 'Extra Rental Days',
    icon: Calendar,
    rate: '$50/day',
    description: 'Need more time? No problem. After your 7-day rental period, each additional day is just $50. We\'ll send you a reminder before your rental period ends.',
    tip: 'Most projects finish within 7 days, but larger renovations often need 10-14 days.'
  },
  {
    title: 'Overweight Charges',
    icon: Scale,
    rate: '$75/ton',
    description: 'Each dumpster size includes a weight allowance. If your load exceeds the limit, you\'ll be charged $75 for each additional ton. We weigh every load at the landfill.',
    tip: 'Heavy materials like concrete and dirt fill up weight limits fast—consider a dedicated "dirt" dumpster.'
  },
];

export default function Pricing() {
  return (
    <Layout 
      title="Dumpster Rental Pricing | Transparent Rates"
      description="Affordable dumpster rental prices in SF Bay Area. 8-40 yard dumpsters starting at $350. No hidden fees. Same-day delivery available."
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">Transparent Pricing</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              No surprises, no hidden fees. See exactly what you'll pay before you book.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Info className="w-4 h-4" />
              <span>Prices vary by location and material type—ranges shown below</span>
            </div>
          </div>
        </div>
      </section>

      {/* How Pricing Works */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">How Pricing Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, all-inclusive pricing. Your quote includes delivery, pickup, and rental period.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary mb-4">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">1. Choose Your Size</h3>
              <p className="text-muted-foreground">Pick the dumpster size that fits your project. Not sure? We'll help you decide.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">2. We Deliver</h3>
              <p className="text-muted-foreground">Same-day or next-day delivery. We'll text you when we're on the way.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">3. Fill & Call</h3>
              <p className="text-muted-foreground">Take up to 7 days. When you're done, schedule pickup. We handle disposal.</p>
            </div>
          </div>

          {/* Pricing Grid with Ranges */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <div key={tier.size} className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{tier.size} Yard</h3>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Price range</span>
                  <div className="text-3xl font-extrabold text-foreground">{tier.priceRange}</div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Weight included:</span>
                    <span className="font-medium text-foreground">{tier.weightLimit}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6 pb-4 border-b border-border">
                  <span className="font-medium text-foreground">Ideal for:</span> {tier.idealFor}
                </p>

                <Button asChild variant="cta" className="w-full">
                  <a href={TRASHLAB_URL} target="_blank" rel="noopener noreferrer">
                    Order Now
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included vs Not Included */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">What's Included vs. Not Included</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Know exactly what your rental covers—and what might cost extra.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Included */}
            <div className="bg-card rounded-2xl border border-success/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success/10">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Included in Every Rental</h3>
              </div>
              <div className="space-y-4">
                {included.map((item) => (
                  <div key={item.item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground">{item.item}</span>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Included */}
            <div className="bg-card rounded-2xl border border-destructive/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Not Included / Extra Fees</h3>
              </div>
              <div className="space-y-4">
                {notIncluded.map((item) => (
                  <div key={item.item} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground">{item.item}</span>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overage & Extra Day Explanations */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">Understanding Overages</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Extra fees are simple and predictable. Here's exactly how they work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {overageExplanations.map((item) => (
              <div key={item.title} className="bg-card rounded-2xl border border-border p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-warning/10">
                    <item.icon className="w-7 h-7 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                    <span className="text-2xl font-extrabold text-primary">{item.rate}</span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
                  <Leaf className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground"><span className="font-medium">Pro tip:</span> {item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Material Types */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">Material Types & Fees</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Different materials have different disposal requirements. Here's what to expect.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {materialTypes.map((type) => (
              <div key={type.name} className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                  <type.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{type.name}</h3>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                  type.color === 'text-success' ? 'bg-success/10 text-success' :
                  type.color === 'text-warning' ? 'bg-warning/10 text-warning' :
                  'bg-destructive/10 text-destructive'
                }`}>
                  {type.fee}
                </div>
                <ul className="space-y-1">
                  {type.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparent Disclaimer */}
      <section className="py-8 bg-background">
        <div className="container-wide space-y-4">
          <div className="flex items-start gap-4 p-6 bg-warning/5 rounded-xl border border-warning/20">
            <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground mb-2">Landfill Fees & Heavy Loads</h4>
              <p className="text-muted-foreground mb-3">
                Our pricing includes standard landfill disposal fees for typical household and construction debris. However, exceptionally heavy loads (like concrete-only dumpsters) may incur additional landfill fees that vary by facility.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <span className="font-medium text-foreground">Heavy material surcharge:</span> $100 flat fee for concrete, dirt, brick, asphalt</li>
                <li>• <span className="font-medium text-foreground">Weight overages:</span> $75/ton over your included weight limit</li>
                <li>• <span className="font-medium text-foreground">Mixed loads:</span> If heavy materials exceed 25% of the load, the surcharge applies</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-accent/5 rounded-xl border border-accent/20">
            <Info className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground mb-2">Why We Show Price Ranges</h4>
              <p className="text-muted-foreground">
                Final pricing depends on your delivery location (distance from our yard), material type, and current landfill rates. Rather than surprise you later, we show honest price ranges upfront. <span className="font-medium text-foreground">Get an instant quote with your ZIP code for your exact price.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Get Your Exact Quote?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Enter your ZIP code to see exact pricing for your location and project type.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/#quote">
                Get Instant Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href="tel:+15106802150">
                Call (510) 680-2150
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
