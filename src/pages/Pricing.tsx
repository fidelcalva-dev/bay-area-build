import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, CheckCircle, XCircle, Info, DollarSign, Truck, Clock, AlertTriangle, Scale, Calendar, Trash2, HardHat, Leaf, Ban, MapPin, Weight, Boxes, Sparkles, Receipt, Recycle, FileText, ClipboardList, Settings2 } from 'lucide-react';
import { PAGE_SEO, BUSINESS_INFO } from '@/lib/seo';
import { 
  PLAN_A_PRICING, 
  HEAVY_MATERIAL_PRICING, 
  PRICING_POLICIES,
  OVERAGE_NOTE,
  INCLUDED_TONS_BY_SIZE,
  CTA_LINKS,
  RECYCLING_SUPPORT_SERVICE
} from '@/lib/shared-data';

// All general debris sizes (5–50 yd)
const pricingTiers = PLAN_A_PRICING
  .map(p => ({
    size: p.size,
    startingAt: p.basePrice,
    priceRange: `$${p.priceRangeLow}–$${p.priceRangeHigh}`,
    weightLimit: `${p.includedTons} ton${p.includedTons > 1 ? 's' : ''}`,
    idealFor: getIdealFor(p.size, false),
    popular: p.size === 20,
  }));

// Heavy material pricing — V2 Service Cost + Dump Fee model
import { getHeavyPricingDisplay } from '@/lib/shared-data';

const heavyPricingDisplay = getHeavyPricingDisplay();

const heavyMaterialTiers = HEAVY_MATERIAL_PRICING.map(p => ({
  size: p.size,
  startingAt: p.basePrice,
  priceRange: `$${p.priceRangeLow}–$${p.priceRangeHigh}`,
  weightLimit: 'Flat Fee', // No tonnage for heavy materials
  idealFor: getIdealFor(p.size, true),
  savingsNote: null,
}));

function getIdealFor(size: number, isHeavy: boolean): string {
  if (isHeavy) {
    if (size === 5) return 'Small concrete or dirt removal';
    if (size === 8) return 'Driveway or patio demolition';
    return 'Large concrete or foundation removal';
  }
  if (size === 5) return 'Small cleanouts, concrete/dirt removal';
  if (size === 8) return 'Bathroom remodel, small debris loads';
  if (size === 10) return 'Small cleanouts, bathroom remodels';
  if (size === 20) return 'Single room renovation, garage cleanout';
  if (size === 30) return 'Whole-house cleanout, medium construction';
  if (size === 40) return 'Major renovation, commercial cleanout';
  return 'New construction, large demolition';
}

const priceFactors = [
  { 
    icon: MapPin, 
    title: 'Your Location (ZIP/Zone)', 
    description: 'Pricing varies by distance from our service hub. Closer locations get the best rates.',
    impact: 'Can add $0–$100 to base price'
  },
  { 
    icon: Trash2, 
    title: 'Debris Type', 
    description: 'Standard debris (furniture, wood, drywall) vs. heavy materials (concrete, dirt, brick).',
    impact: 'Heavy materials use dedicated sizes (5-10yd)'
  },
  { 
    icon: Weight, 
    title: 'Weight & Overage', 
    description: `Heavy materials: FLAT FEE (no weight overage). General debris: $${PRICING_POLICIES.overagePerTonGeneral}/ton overage beyond included tonnage.`,
    impact: 'Varies by material & size'
  },
  { 
    icon: Calendar,
    title: 'Rental Duration', 
    description: 'Standard 7-day rental included. Need more time? Add extra days easily.',
    impact: `$${PRICING_POLICIES.extraDayCost}/day after 7 days`
  },
  { 
    icon: Boxes, 
    title: 'Special Items', 
    description: 'Mattresses, tires, appliances with freon require special handling and disposal.',
    impact: `$${PRICING_POLICIES.tireDisposal}–$${PRICING_POLICIES.applianceWithFreon} per special item`
  },
  { 
    icon: Sparkles, 
    title: 'Add-On Services', 
    description: 'Same-day delivery, street permits, wait-time loading assistance.',
    impact: 'Optional add-ons at checkout'
  },
];

const exampleInvoice = {
  projectDescription: '20 Yard Dumpster • General Debris • Oakland, CA (94612)',
  lineItems: [
    { label: '20 Yard Dumpster Base Price', amount: 650, type: 'base' as const },
    { label: '7-Day Rental Period', amount: 0, type: 'included' as const },
    { label: 'Delivery & Pickup', amount: 0, type: 'included' as const },
    { label: '2 Tons Included', amount: 0, type: 'included' as const },
    { label: '3 Extra Days', amount: PRICING_POLICIES.extraDayCost * 3, type: 'addition' as const },
    { label: 'Mattress Disposal (x2)', amount: PRICING_POLICIES.mattressDisposal, type: 'addition' as const },
  ],
  subtotal: 650 + (PRICING_POLICIES.extraDayCost * 3) + PRICING_POLICIES.mattressDisposal,
  note: `${OVERAGE_NOTE} ($${PRICING_POLICIES.overagePerTonGeneral}/ton)`
};

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
  { item: 'Appliances with freon', detail: `$${PRICING_POLICIES.applianceWithFreon} per unit` },
  { item: 'Tires and mattresses', detail: `$${PRICING_POLICIES.tireDisposal}–$${PRICING_POLICIES.mattressDisposal} per item` },
  { item: 'Heavy materials in general dumpster', detail: `$${PRICING_POLICIES.heavyMaterialSurcharge} surcharge applies` },
  { item: 'Extra rental days beyond 7', detail: `$${PRICING_POLICIES.extraDayCost}/day after initial period` },
  { item: 'Weight overages', detail: `$${PRICING_POLICIES.overagePerTonGeneral}/ton over your weight limit` },
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
    fee: `+$${PRICING_POLICIES.heavyMaterialSurcharge} flat surcharge`,
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
    rate: `$${PRICING_POLICIES.extraDayCost}/day`,
    description: `Need more time? No problem. After your 7-day rental period, each additional day is just $${PRICING_POLICIES.extraDayCost}. We'll send you a reminder before your rental period ends.`,
    tip: 'Most projects finish within 7 days, but larger renovations often need 10-14 days.'
  },
  {
    title: 'Overage Charges (General Debris)',
    icon: Scale,
    rate: `$${PRICING_POLICIES.overagePerTonGeneral}/ton`,
    description: `General debris dumpsters include base tonnage by size. Any weight beyond the included amount is billed at $${PRICING_POLICIES.overagePerTonGeneral} per ton, based on scale ticket. Heavy material dumpsters: FLAT FEE—no overage charges.`,
    tip: 'For heavy materials (concrete, dirt, brick), choose a dedicated heavy material dumpster for flat fee pricing with no weight worries.'
  },
];

export default function Pricing() {
  return (
    <Layout 
      title={PAGE_SEO.pricing.title}
      description={PAGE_SEO.pricing.description}
      canonical={PAGE_SEO.pricing.canonical}
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

          {/* Starting At Price Blocks - General Debris */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-primary" />
              General Debris Dumpsters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {pricingTiers.map((tier) => (
                <div 
                  key={tier.size} 
                  className={`relative bg-card rounded-2xl border p-5 hover:shadow-card-hover transition-all ${
                    tier.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-3xl font-black text-foreground mb-1">{tier.size} Yard</div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Dumpster</div>
                    
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground">Starting at</div>
                      <div className="text-3xl font-extrabold text-primary">${tier.startingAt}</div>
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">
                      <span className="font-medium text-foreground">{tier.weightLimit}</span> included
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{tier.idealFor}</p>

                    <Button asChild variant="cta" size="sm" className="w-full">
                      <Link to="/quote">
                        Get Quote
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Starting At Price Blocks - Heavy Materials */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-warning" />
              Heavy Materials Dumpsters
              <span className="text-sm font-normal text-muted-foreground">(Concrete, Dirt, Brick, Asphalt, Tile)</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Service Cost + Dump Fee pricing. All sizes include delivery, pickup, and disposal. No weight overage charges.
            </p>
            
            {/* Size cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {heavyMaterialTiers.map((tier) => (
                <div 
                  key={`heavy-${tier.size}`} 
                  className="bg-card rounded-2xl border border-warning/30 p-5 hover:shadow-card-hover transition-all"
                >
                  <div className="text-center">
                    <div className="text-3xl font-black text-foreground mb-1">{tier.size} Yard</div>
                    <div className="text-xs uppercase tracking-wide text-warning mb-3">Heavy Materials Only</div>
                    
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground">Starting at</div>
                      <div className="text-3xl font-extrabold text-primary">${Math.round(tier.startingAt)}</div>
                    </div>

                    <div className="text-xs text-success font-medium mb-2">
                      {tier.weightLimit} – Disposal Included
                    </div>
                    
                    {tier.savingsNote && (
                      <div className="text-xs text-amber-600 font-medium mb-2">
                        💰 {tier.savingsNote}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mb-4">{tier.idealFor}</p>

                    <Button asChild variant="outline" size="sm" className="w-full border-warning/50 hover:bg-warning/10">
                      <Link to="/quote">
                        Get Quote
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Heavy material sub-classification table */}
            <div className="bg-amber-500/5 border border-warning/20 rounded-xl p-5">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-warning" />
                Heavy Material Pricing by Type
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-warning/20">
                      <th className="text-left py-2 text-muted-foreground font-medium">Material Type</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">10 yd</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">8 yd</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">5 yd</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-warning/10">
                      <td className="py-3">
                        <div className="font-medium text-foreground">{heavyPricingDisplay.base.label}</div>
                        <div className="text-xs text-muted-foreground">{heavyPricingDisplay.base.description}</div>
                      </td>
                      <td className="text-center py-3 font-bold text-foreground">${heavyPricingDisplay.base.prices[10]}</td>
                      <td className="text-center py-3 font-bold text-foreground">${heavyPricingDisplay.base.prices[8]}</td>
                      <td className="text-center py-3 font-bold text-foreground">${heavyPricingDisplay.base.prices[5]}</td>
                    </tr>
                    <tr className="border-b border-warning/10">
                      <td className="py-3">
                        <div className="font-medium text-foreground">{heavyPricingDisplay.plus_200.label}</div>
                        <div className="text-xs text-muted-foreground">{heavyPricingDisplay.plus_200.description}</div>
                      </td>
                      <td className="text-center py-3 font-bold text-foreground">${heavyPricingDisplay.plus_200.prices[10]}</td>
                      <td className="text-center py-3 font-bold text-foreground">${heavyPricingDisplay.plus_200.prices[8]}</td>
                      <td className="text-center py-3 font-bold text-foreground">${heavyPricingDisplay.plus_200.prices[5]}</td>
                    </tr>
                    <tr>
                      <td className="py-3">
                        <div className="font-medium text-foreground">{heavyPricingDisplay.mixed_heavy.label}</div>
                        <div className="text-xs text-muted-foreground">{heavyPricingDisplay.mixed_heavy.description}</div>
                      </td>
                      <td className="text-center py-3 font-bold text-foreground">${heavyPricingDisplay.mixed_heavy.prices[10]}</td>
                      <td className="text-center py-3 font-bold text-foreground">${heavyPricingDisplay.mixed_heavy.prices[8]}</td>
                      <td className="text-center py-3 font-bold text-foreground">${heavyPricingDisplay.mixed_heavy.prices[5]}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Clean Load Rule:</strong> Clean loads of a single heavy material qualify for flat-fee pricing with disposal included. Fill to the line — do not overfill.</span>
                </p>
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Mixed / Debris:</strong> If more than 5% of another heavy material is present, the load is reclassified as Mixed Heavy (+$300). If more than 20% is trash or debris, it becomes General Debris and is billed by weight at $165/ton.</span>
                </p>
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span><strong>No-Notice Reroute:</strong> If materials are misdeclared and our team is not notified before pickup, a reroute surcharge of $150–$300 applies. Advance notice avoids any penalty.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Affects Your Price */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">What Affects Your Price?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your final quote depends on a few simple factors. Here's exactly how pricing is calculated.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {priceFactors.map((factor) => (
              <div key={factor.title} className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 flex-shrink-0">
                    <factor.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{factor.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{factor.description}</p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      <DollarSign className="w-3 h-3" />
                      {factor.impact}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Invoice Breakdown */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="heading-lg text-foreground mb-4">Example Invoice</h2>
              <p className="text-lg text-muted-foreground">
                Here's what a typical invoice looks like—no surprises, complete transparency.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
              {/* Invoice Header */}
              <div className="bg-primary/5 border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-bold text-foreground">Sample Quote</div>
                    <div className="text-sm text-muted-foreground">{exampleInvoice.projectDescription}</div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="px-6 py-4 space-y-3">
                {exampleInvoice.lineItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between py-2 ${
                      item.type === 'base' ? 'border-b border-border' : ''
                    }`}
                  >
                    <span className={`${item.type === 'base' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                    <span className={`font-medium ${
                      item.type === 'included' ? 'text-success' : 
                      item.type === 'addition' ? 'text-foreground' : 
                      'text-foreground'
                    }`}>
                      {item.type === 'included' ? 'Included' : `$${item.amount}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-muted px-6 py-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-primary">${exampleInvoice.subtotal}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  {exampleInvoice.note}
                </p>
              </div>
            </div>

            <div className="text-center mt-6">
              <Button asChild variant="cta" size="lg">
                <Link to="/quote">
                  Get Your Personalized Quote
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
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

      {/* Recycling & Diversion Support Service */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600/10 rounded-full text-sm font-medium text-green-700 dark:text-green-400 mb-4">
              <Recycle className="w-4 h-4" />
              {RECYCLING_SUPPORT_SERVICE.category}
            </div>
            <h2 className="heading-lg text-foreground mb-4">{RECYCLING_SUPPORT_SERVICE.displayName}</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {RECYCLING_SUPPORT_SERVICE.description}
            </p>
          </div>

          {/* Important Note */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 mb-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Important:</strong> {RECYCLING_SUPPORT_SERVICE.importantNote}
              </p>
            </div>
          </div>

          {/* Service Components Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {RECYCLING_SUPPORT_SERVICE.components.map((component, index) => {
              const icons = [Settings2, Truck, ClipboardList, FileText];
              const Icon = icons[index] || Recycle;
              return (
                <div key={component.id} className="bg-card rounded-2xl border border-green-200 dark:border-green-800/50 p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-600/10 mb-4">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{component.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{component.description}</p>
                  <ul className="space-y-2">
                    {component.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Pricing Display */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl border border-green-200 dark:border-green-800/50 p-8 max-w-3xl mx-auto mb-8">
            <div className="text-center mb-6">
              <div className="text-sm text-muted-foreground mb-2">Pricing</div>
              <div className="text-3xl font-extrabold text-foreground mb-2">
                {RECYCLING_SUPPORT_SERVICE.pricingDisplay.label}
              </div>
              <p className="text-muted-foreground">
                {RECYCLING_SUPPORT_SERVICE.pricingDisplay.note}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {RECYCLING_SUPPORT_SERVICE.pricingDisplay.structures.map((structure, idx) => (
                <span key={idx} className="px-4 py-2 bg-card rounded-full text-sm font-medium text-foreground border border-green-200 dark:border-green-800">
                  {structure}
                </span>
              ))}
            </div>

            <div className="text-center">
              <Button asChild variant="cta" size="lg" className="bg-green-600 hover:bg-green-700">
                <Link to={CTA_LINKS.recyclingSupport}>
                  Request Recycling Support
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Disclaimers */}
          <div className="max-w-2xl mx-auto">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">Important Disclaimers</h4>
            <div className="space-y-2">
              {RECYCLING_SUPPORT_SERVICE.disclaimers.map((disclaimer, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {disclaimer}
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4 italic">
              {RECYCLING_SUPPORT_SERVICE.integrationNote}
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Disclaimer */}
      <section className="py-8 bg-background">
        <div className="container-wide space-y-4">
          <div className="flex items-start gap-4 p-6 bg-success/5 rounded-xl border border-success/20">
            <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground mb-2">Heavy Material Pricing (Concrete, Dirt, Brick)</h4>
              <p className="text-muted-foreground mb-3">
                Heavy material dumpsters (5, 8, 10 yard) are priced as a <strong>FLAT FEE</strong>. Disposal is included with no extra weight charges.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <span className="font-medium text-success">Flat fee pricing:</span> No overage charges for heavy materials</li>
                <li>• <span className="font-medium text-foreground">Pure loads only:</span> Concrete, dirt, brick, asphalt—no mixing with trash</li>
                <li>• <span className="font-medium text-foreground">Reclassification warning:</span> If trash/debris is mixed in, load may be reclassified and different rates apply</li>
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

      {/* Internal Links */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-md text-foreground mb-6 text-center">Related Resources</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link to="/sizes" className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/40 transition-all">
              <Package className="w-4 h-4 text-primary shrink-0" />
              Dumpster Sizes Guide
            </Link>
            <Link to="/materials" className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/40 transition-all">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              Accepted Materials
            </Link>
            <Link to="/contractors" className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/40 transition-all">
              <HardHat className="w-4 h-4 text-primary shrink-0" />
              Contractor Services
            </Link>
            <Link to="/areas" className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/40 transition-all">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              Service Areas
            </Link>
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
