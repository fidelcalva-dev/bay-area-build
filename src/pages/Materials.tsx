import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, XCircle, AlertTriangle, Info, Truck, Ruler, Phone } from 'lucide-react';
import { BUSINESS_INFO, PAGE_SEO } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { PageFAQ, InternalLinkCluster, type FAQItem } from '@/components/seo';

const MATERIALS_FAQS: FAQItem[] = [
  { question: 'Can I mix concrete with regular trash?', answer: 'No. Concrete, dirt, brick, and asphalt must go in a dedicated heavy material dumpster (5, 8, or 10 yard). Mixing with general debris will result in reclassification and additional charges.' },
  { question: 'What happens if I put prohibited items in the dumpster?', answer: 'Prohibited items (hazardous waste, batteries, electronics) will be identified during disposal. You may be charged additional fees for special handling and your load may be rejected by the facility.' },
  { question: 'Do I need to separate materials before loading?', answer: 'For general debris dumpsters, no separation is needed — you can mix household items, construction debris, and yard waste. For heavy material dumpsters, only one material type is allowed per load.' },
  { question: 'What should I do if I am unsure about a material?', answer: 'Call us before loading at (510) 680-2150. Our team will advise you on the right dumpster type and any special handling requirements. It is always better to ask first.' },
];

const allowed = [
  { category: 'Household Junk', items: ['Furniture', 'Appliances (without freon)', 'Clothing & textiles', 'Books & paper', 'Toys', 'General household items'] },
  { category: 'Construction Debris', items: ['Drywall', 'Lumber & wood', 'Flooring (tile, carpet, laminate)', 'Siding', 'Insulation', 'Windows & doors'] },
  { category: 'Yard Waste', items: ['Branches & brush', 'Grass clippings', 'Leaves', 'Shrubs & bushes', 'Small tree stumps', 'Garden debris'] },
  { category: 'Roofing Materials', items: ['Shingles (asphalt, composite)', 'Underlayment', 'Flashing', 'Gutters', 'Roofing nails'] },
  { category: 'Concrete & Dirt', items: ['Concrete (clean, unmixed)', 'Bricks', 'Asphalt', 'Clean fill dirt', 'Rocks & gravel', 'Sand'] },
];

const prohibited = [
  { item: 'Hazardous Waste', description: 'Chemicals, solvents, pesticides, oil-based paints' },
  { item: 'Batteries', description: 'Car batteries, lithium batteries, all types' },
  { item: 'Tires', description: 'Car, truck, or equipment tires' },
  { item: 'Appliances with Freon', description: 'Refrigerators, freezers, AC units' },
  { item: 'Electronics (E-Waste)', description: 'TVs, computers, monitors, printers' },
  { item: 'Medical Waste', description: 'Needles, pharmaceuticals, biohazards' },
  { item: 'Flammable Liquids', description: 'Gasoline, propane tanks, kerosene' },
  { item: 'Food Waste', description: 'Perishable food items, liquids' },
];

const specialRules = [
  {
    title: 'Concrete & Dirt Rules',
    description: 'Concrete and clean dirt require a dedicated 5/8/10-yard dumpster. FLAT FEE pricing—disposal included with no extra weight charges. Cannot be mixed with other materials.',
    icon: AlertTriangle,
  },
  {
    title: 'Overage Fees',
    description: 'General debris dumpsters include base tonnage by size. Any weight beyond the included amount is billed at $165 per ton, based on scale ticket. Heavy material dumpsters: No overage—flat fee includes disposal.',
    icon: Info,
  },
  {
    title: 'No Overfilling',
    description: 'Materials must not extend above the top of the dumpster walls. Overfilled dumpsters cannot be transported safely.',
    icon: AlertTriangle,
  },
];

// Pickup truck load estimates
const PICKUP_LOADS_QUICK = [
  { yards: 5, loads: '2–3' },
  { yards: 8, loads: '3–4' },
  { yards: 10, loads: '4–5' },
  { yards: 20, loads: '6–8' },
  { yards: 30, loads: '9–12' },
  { yards: 40, loads: '12–16' },
  { yards: 50, loads: '16–20' },
];

export default function Materials() {
  return (
    <Layout
      title={PAGE_SEO.materials.title}
      description={PAGE_SEO.materials.description}
      canonical={PAGE_SEO.materials.canonical}
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">What Can Go in a Dumpster?</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              Know what you can and can't load. Avoid extra fees and ensure safe, compliant disposal.
            </p>
            <Button asChild variant="cta" size="lg">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-4 h-4" />
                Not Sure? Call Before Loading
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Allowed Materials */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success/10 text-success">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h2 className="heading-lg text-foreground">Accepted Materials</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allowed.map((category) => (
              <div key={category.category} className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">{category.category}</h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prohibited Materials */}
      <section className="section-padding bg-destructive/5">
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-destructive/10 text-destructive">
              <XCircle className="w-6 h-6" />
            </div>
            <h2 className="heading-lg text-foreground">Prohibited Materials</h2>
          </div>

          <p className="text-muted-foreground mb-8 max-w-2xl">
            These items cannot go in any dumpster due to safety, environmental, or legal regulations.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {prohibited.map((item) => (
              <div key={item.item} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground">{item.item}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capacity Quick Reference */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="heading-lg text-foreground">Capacity Quick Reference</h2>
                <p className="text-sm text-muted-foreground">How many pickup truck loads fit in each dumpster</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/capacity-guide">
                Full Capacity Guide
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-x divide-border">
              {PICKUP_LOADS_QUICK.map((item) => {
                const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === item.yards);
                return (
                  <div key={item.yards} className="p-4 text-center hover:bg-muted/30 transition-colors">
                    <div className="text-2xl font-black text-foreground">{item.yards}</div>
                    <div className="text-xs text-muted-foreground mb-2">YARD</div>
                    <div className="text-lg font-bold text-primary">{item.loads}</div>
                    <div className="text-xs text-muted-foreground">loads</div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 bg-muted/30 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                Based on standard 6-ft bed pickup, loaded to the top. 
                <Link to="/capacity-guide" className="text-primary hover:underline ml-1">
                  See full scenarios guide →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Rules */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8">Special Rules & Fees</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {specialRules.map((rule) => (
              <div key={rule.title} className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-4">
                  <rule.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{rule.title}</h3>
                <p className="text-muted-foreground">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageFAQ faqs={MATERIALS_FAQS} />
      <InternalLinkCluster exclude={['/materials']} />

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Get Your Dumpster Quote?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Know your materials? Get an instant price or call us for guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">
                Check Material Pricing in My Area
                <ArrowRight className="w-4 h-4" />
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