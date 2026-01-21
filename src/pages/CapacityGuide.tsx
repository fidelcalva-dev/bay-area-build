import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight, 
  Truck, 
  Home, 
  HardHat, 
  Building2, 
  Weight, 
  Ruler, 
  Info,
  CheckCircle,
  AlertTriangle,
  Phone,
  MessageSquare,
  Calculator
} from 'lucide-react';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES, getOverageInfo } from '@/lib/shared-data';
import { BUSINESS_INFO } from '@/lib/seo';

// Pickup truck load estimates by size
const PICKUP_TRUCK_LOADS = [
  { yards: 6, loads: '2–3', note: 'Small cleanouts' },
  { yards: 8, loads: '3–4', note: 'Medium projects' },
  { yards: 10, loads: '4–5', note: 'Room renovations' },
  { yards: 20, loads: '6–8', note: 'Larger remodels' },
  { yards: 30, loads: '9–12', note: 'Major renovations' },
  { yards: 40, loads: '12–16', note: 'Commercial scale' },
  { yards: 50, loads: '16–20', note: 'Maximum capacity' },
];

// Homeowner scenarios
const HOMEOWNER_SCENARIOS = [
  {
    title: 'Garage Cleanout (1-2 Car)',
    icon: Home,
    recommended: ['10 yd', '20 yd'],
    why: 'Years of accumulated items, old furniture, and boxes typically fill 10-20 cubic yards.',
    weightNote: 'Light materials—standard pricing applies.',
  },
  {
    title: 'Bathroom Remodel',
    icon: Home,
    recommended: ['10 yd', '20 yd'],
    why: 'Demolition debris including tile, fixtures, drywall, and cabinetry.',
    weightNote: 'Tile and fixtures add weight. Dispose of old toilets and sinks.',
  },
  {
    title: 'Kitchen Remodel',
    icon: Home,
    recommended: ['20 yd'],
    why: 'Cabinets, countertops, flooring, appliances, and drywall require more space.',
    weightNote: 'Countertops (granite/marble) are heavy—separate if possible.',
  },
  {
    title: 'Small Deck Removal',
    icon: Home,
    recommended: ['10 yd', '20 yd'],
    why: 'Treated lumber, railings, and hardware from a typical residential deck.',
    weightNote: 'Treated wood is heavier when wet.',
  },
  {
    title: 'Roof Tear-Off (Single Layer)',
    icon: Home,
    recommended: ['10 yd', '20 yd'],
    why: 'Shingles are heavy. A typical home (~15-20 squares) fills 10-20 yards.',
    weightNote: 'Roofing is weight-limited. Ask about number of "squares" (100 sf each).',
  },
  {
    title: 'Yard Cleanup / Green Waste',
    icon: Home,
    recommended: ['10 yd', '20 yd'],
    why: 'Branches, brush, leaves, and debris from landscaping projects.',
    weightNote: 'Green waste is light when dry, heavy when wet.',
  },
];

// Contractor scenarios
const CONTRACTOR_SCENARIOS = [
  {
    title: 'Small Demo (1 Room + Drywall/Wood)',
    icon: HardHat,
    recommended: ['20 yd'],
    why: 'Single room demolition with drywall, framing lumber, and finishes.',
    weightNote: 'Standard mixed debris pricing.',
  },
  {
    title: 'Full Remodel (Multiple Rooms)',
    icon: HardHat,
    recommended: ['30 yd'],
    why: 'Multi-room renovation with cabinets, flooring, fixtures, and framing.',
    weightNote: 'May need multiple pulls for large projects.',
  },
  {
    title: 'Light Demo / Renovation + Framing',
    icon: HardHat,
    recommended: ['30 yd', '40 yd'],
    why: 'Tenant improvements with significant lumber and drywall.',
    weightNote: 'Lumber is bulky but relatively light.',
  },
  {
    title: 'Commercial Cleanout / TI',
    icon: HardHat,
    recommended: ['40 yd', '50 yd'],
    why: 'Office buildouts, retail spaces, and warehouse cleanouts require maximum capacity.',
    weightNote: 'Watch for weight limits on mixed loads.',
  },
  {
    title: 'Concrete / Dirt (HEAVY)',
    icon: HardHat,
    recommended: ['6 yd', '8 yd', '10 yd'],
    why: 'FLAT FEE pricing for pure heavy material loads. Weight not a concern.',
    weightNote: 'HEAVY ONLY: Must be clean loads (no trash). 6/8/10 yard ONLY.',
    isHeavy: true,
  },
];

// Business scenarios
const BUSINESS_SCENARIOS = [
  {
    title: 'Retail / Office Cleanout',
    icon: Building2,
    recommended: ['20 yd', '30 yd'],
    why: 'Furniture, fixtures, equipment, and general office waste.',
    weightNote: 'Metal fixtures and equipment add weight.',
  },
  {
    title: 'Property Management Turnover',
    icon: Building2,
    recommended: ['20 yd', '30 yd'],
    why: 'Unit turnovers with furniture, appliances, and renovation debris.',
    weightNote: 'Multiple turnovers may need scheduled pickups.',
  },
  {
    title: 'Ongoing Construction Projects',
    icon: Building2,
    recommended: ['30 yd', '40 yd', '50 yd'],
    why: 'Continuous debris from active job sites.',
    weightNote: 'Ask about contractor program for volume discounts.',
    hasContractorCTA: true,
  },
];

// Concrete slab capacity reference
const CONCRETE_CAPACITY = [
  { size: 10, slab4in: '150–250 sq ft', slab6in: '100–170 sq ft' },
  { size: 8, slab4in: '120–200 sq ft', slab6in: '80–140 sq ft' },
  { size: 6, slab4in: '90–150 sq ft', slab6in: '60–110 sq ft' },
];

interface ScenarioCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  recommended: string[];
  why: string;
  weightNote: string;
  isHeavy?: boolean;
  hasContractorCTA?: boolean;
}

function ScenarioCard({ title, icon: Icon, recommended, why, weightNote, isHeavy, hasContractorCTA }: ScenarioCardProps) {
  return (
    <Card className={`h-full transition-all hover:shadow-md ${isHeavy ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
            isHeavy ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-primary/10 text-primary'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {recommended.map((size) => (
                <span
                  key={size}
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    isHeavy
                      ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <p className="text-sm text-muted-foreground">{why}</p>
        <div className="flex items-start gap-2 pt-1">
          <Weight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground italic">{weightNote}</p>
        </div>
        {hasContractorCTA && (
          <Button asChild variant="link" size="sm" className="px-0 h-auto text-primary">
            <Link to="/contractors">
              Ask about contractor program
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function CapacityGuide() {
  const overageGeneral = PRICING_POLICIES.overagePerTonGeneral;
  const overageYard = PRICING_POLICIES.overagePerYardSmall;

  return (
    <Layout
      title="Dumpster Capacity Guide | How Much Fits in Each Size"
      description="Real-world dumpster capacity estimates for common projects. Pickup truck loads, homeowner scenarios, contractor scenarios, and concrete slab capacity guide."
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-4">
              <Ruler className="w-4 h-4" />
              Real-World Capacity Guide
            </div>
            <h1 className="heading-xl mb-4">How Much Fits in Each Dumpster?</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              These are real-world estimates based on common projects in the Bay Area. 
              Actual capacity varies by material type, how it's loaded, and moisture weight.
            </p>
            <Button asChild variant="cta" size="xl">
              <Link to="/pricing">
                Get Instant Quote by ZIP
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pickup Truck Loads Table */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="heading-lg text-foreground">Pickup Truck Loads</h2>
              <p className="text-sm text-muted-foreground">How many standard 6-ft bed pickup loads fit in each dumpster</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">Dumpster Size</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">Pickup Loads</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground hidden sm:table-cell">Typical Use</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground hidden md:table-cell">Dimensions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PICKUP_TRUCK_LOADS.map((item) => {
                    const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === item.yards);
                    return (
                      <tr key={item.yards} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-foreground text-lg">{item.yards}</span>
                          <span className="text-muted-foreground ml-1">yard</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-primary">{item.loads}</span>
                          <span className="text-muted-foreground ml-1">loads</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                          {item.note}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                          {sizeData?.dimensions || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-muted/30 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                Pickup load estimates assume a standard 6-ft bed pickup, loaded to the top of the bed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Homeowner Scenarios */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="heading-lg text-foreground">Common Homeowner Scenarios</h2>
              <p className="text-sm text-muted-foreground">Estimated dumpster sizes for typical home projects</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOMEOWNER_SCENARIOS.map((scenario) => (
              <ScenarioCard key={scenario.title} {...scenario} />
            ))}
          </div>
        </div>
      </section>

      {/* Contractor Scenarios */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="heading-lg text-foreground">Contractor Scenarios</h2>
              <p className="text-sm text-muted-foreground">Professional project estimates with weight considerations</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTRACTOR_SCENARIOS.map((scenario) => (
              <ScenarioCard key={scenario.title} {...scenario} />
            ))}
          </div>
        </div>
      </section>

      {/* Business Scenarios */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="heading-lg text-foreground">Business Scenarios</h2>
              <p className="text-sm text-muted-foreground">Commercial and property management projects</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUSINESS_SCENARIOS.map((scenario) => (
              <ScenarioCard key={scenario.title} {...scenario} />
            ))}
          </div>
        </div>
      </section>

      {/* Concrete & Heavy Material Guide */}
      <section className="section-padding bg-amber-50 dark:bg-amber-950/20">
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
              <Weight className="w-6 h-6" />
            </div>
            <div>
              <h2 className="heading-lg text-foreground">Concrete & Heavy Material Quick Math</h2>
              <p className="text-sm text-muted-foreground">Weight-limited capacity for slabs and heavy loads</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Weight Reference */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Concrete Weight Reference</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">4-inch slab</span>
                    <span className="text-muted-foreground ml-2">≈ ~50 lb per square foot (estimate)</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">6-inch slab</span>
                    <span className="text-muted-foreground ml-2">≈ ~75 lb per square foot (estimate)</span>
                  </div>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">Practical Capacity by Dumpster</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium text-muted-foreground">Size</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">4" Slab</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">6" Slab</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONCRETE_CAPACITY.map((row) => (
                        <tr key={row.size} className="border-b border-border/50">
                          <td className="py-2 font-semibold text-foreground">{row.size} yd</td>
                          <td className="py-2 text-muted-foreground">{row.slab4in}</td>
                          <td className="py-2 text-muted-foreground">{row.slab6in}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* House Demo Estimate */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">House Demolition Estimates</h3>
              <p className="text-sm text-muted-foreground mb-4">
                For a typical 1,200 sq ft Bay Area house demolition:
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Wood-frame demo (no foundation)</span>
                    <p className="text-sm text-muted-foreground">Roughly ~30–60 tons (range)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">With foundation/concrete included</span>
                    <p className="text-sm text-muted-foreground">Roughly ~60–120 tons (range)</p>
                  </div>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Actual weight varies heavily by materials, plaster vs drywall, roof layers, and foundation type. 
                    Large demo projects typically require multiple dumpster pulls.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-5 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">Heavy Material Disclaimer</p>
                <p className="text-sm text-muted-foreground">
                  Concrete is weight-limited. These ranges depend on thickness, rebar, moisture, and access. 
                  We'll recommend the safest option for your project. Heavy material dumpsters (6/8/10yd) are 
                  <span className="font-semibold text-amber-700 dark:text-amber-300"> FLAT FEE—disposal included with no extra weight charges.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Rules Summary */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h2 className="heading-md text-center text-foreground mb-8">Disposal & Pricing Rules</h2>
            
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="divide-y divide-border">
                {/* Heavy Materials */}
                <div className="p-5 flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 shrink-0">
                    <Weight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Heavy Materials (6/8/10 yd)</h3>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-success font-semibold">FLAT FEE pricing.</span> Disposal included with no extra weight charges. 
                      Concrete, dirt, rock, brick, asphalt only—no mixing with trash.
                    </p>
                  </div>
                </div>

                {/* Mixed 6-10 */}
                <div className="p-5 flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Mixed Debris (6/8/10 yd)</h3>
                    <p className="text-sm text-muted-foreground">
                      Overage billed at <span className="font-semibold">${overageYard} per additional yard</span>. 
                      Capacity-based billing for small mixed loads.
                    </p>
                  </div>
                </div>

                {/* Mixed 20+ */}
                <div className="p-5 flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Mixed Debris (20/30/40/50 yd)</h3>
                    <p className="text-sm text-muted-foreground">
                      Included tons by size (2-5T). Overage billed <span className="font-semibold">${overageGeneral}/ton after scale ticket</span>.
                    </p>
                  </div>
                </div>

                {/* General Rule */}
                <div className="p-5 flex items-start gap-4 bg-muted/30">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Keep loads below rim</h3>
                    <p className="text-sm text-muted-foreground">
                      Materials must not extend above the top of the dumpster walls. Do not mix prohibited materials.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Not Sure What Size You Need?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Enter your ZIP and material type—we'll recommend the safest, most cost-effective option.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/pricing">
                Get Instant Quote
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`sms:${BUSINESS_INFO.phone.sales.replace('+1-', '+1')}`}>
                <MessageSquare className="w-5 h-5" />
                Text Us
              </a>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
