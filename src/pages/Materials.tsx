import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

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
    description: 'Concrete and clean dirt require a dedicated dumpster. Cannot be mixed with other materials. Has specific weight limits and pricing.',
    icon: AlertTriangle,
  },
  {
    title: 'Overweight Fees',
    description: 'Each dumpster has a weight limit. Exceeding the limit results in $75/ton overage fee. We\'ll always notify you before pickup.',
    icon: Info,
  },
  {
    title: 'No Overfilling',
    description: 'Materials must not extend above the top of the dumpster walls. Overfilled dumpsters cannot be transported safely.',
    icon: AlertTriangle,
  },
];

export default function Materials() {
  return (
    <Layout
      title="Accepted Dumpster Materials | What Can Go in a Dumpster"
      description="Learn what materials are allowed in your dumpster rental. Accepted items, prohibited materials, and special rules for concrete and dirt disposal."
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">Materials Guide</h1>
            <p className="text-xl text-primary-foreground/85">
              Know what you can and can't put in your dumpster. Avoid extra fees and ensure safe disposal.
            </p>
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

      {/* Special Rules */}
      <section className="section-padding bg-muted">
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

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Have Questions About Your Materials?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Not sure if something can go in your dumpster? Call us and we'll help you figure it out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <a href="tel:+15106802150">
                Call (510) 680-2150
              </a>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <Link to="/sizes">
                View Dumpster Sizes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
