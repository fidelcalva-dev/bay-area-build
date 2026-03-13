import { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight, Upload, Phone, MessageSquare, CheckCircle, AlertTriangle,
  Clock, Package, Ruler, Scale, Truck, Home, Hammer, Wrench, TreePine, Shovel,
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seo';
import { GENERAL_DEBRIS_SIZES, HEAVY_MATERIAL } from '@/config/pricingConfig';

interface ProjectTypeData {
  slug: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  recommendedSizes: number[];
  commonMaterials: string[];
  avoidItems: string[];
  typicalDuration: string;
  isHeavy: boolean;
  tips: string[];
  icon: typeof Home;
}

const PROJECT_DATA: Record<string, ProjectTypeData> = {
  'home-cleanout': {
    slug: 'home-cleanout',
    title: 'Home Cleanout Dumpster Rental',
    h1: 'Dumpster Rental for Home Cleanouts',
    description: 'The right dumpster size for your home cleanout project. Clear out rooms, garages, and storage in one rental.',
    intro: 'Whether you\'re decluttering a single room or clearing out an entire house, a roll-off dumpster makes the job faster and easier. Most home cleanouts produce 3–8 cubic yards of mixed household waste.',
    recommendedSizes: [10, 20],
    commonMaterials: ['Furniture', 'Clothing', 'Household goods', 'Appliances (non-freon)', 'Boxes & packaging', 'General trash'],
    avoidItems: ['Hazardous chemicals', 'Paint cans (unless dry)', 'Batteries', 'Electronics (e-waste)', 'Tires', 'Freon appliances'],
    typicalDuration: '3–5 days',
    isHeavy: false,
    tips: ['Start with the largest room and work toward the door', 'Separate recyclables and donations before loading', 'Break down furniture to maximize space', 'Don\'t mix heavy materials like concrete with general debris'],
    icon: Home,
  },
  'kitchen-remodel': {
    slug: 'kitchen-remodel',
    title: 'Kitchen Remodel Dumpster Rental',
    h1: 'Dumpster Rental for Kitchen Remodels',
    description: 'Get the right dumpster for your kitchen renovation. Cabinets, countertops, flooring, and demolition debris.',
    intro: 'Kitchen remodels generate a mix of demolition debris: old cabinets, countertops, flooring, drywall, and fixtures. A 10 or 20 yard dumpster handles most kitchen renovations comfortably.',
    recommendedSizes: [10, 20],
    commonMaterials: ['Cabinets', 'Countertops', 'Flooring', 'Drywall', 'Fixtures', 'Tile', 'Wood framing'],
    avoidItems: ['Asbestos tile (pre-1980s homes)', 'Lead paint debris', 'Hazardous adhesives', 'Freon appliances'],
    typicalDuration: '5–10 days',
    isHeavy: false,
    tips: ['Demo cabinets carefully — they can be donated if in good condition', 'Tile and stone are heavy — don\'t overload', 'Schedule delivery before demo day for maximum efficiency', 'Consider a 20 yd if removing flooring throughout'],
    icon: Hammer,
  },
  'roof-replacement': {
    slug: 'roof-replacement',
    title: 'Roofing Debris Dumpster Rental',
    h1: 'Dumpster Rental for Roofing Jobs',
    description: 'Heavy-duty dumpsters for roofing debris. Shingles, underlayment, flashing, and tear-off waste.',
    intro: 'Roofing tear-offs produce heavy, bulky waste. Asphalt shingles alone weigh 2–3 tons per 1,000 sq ft of roof. Choose a container sized for the weight, not just the volume.',
    recommendedSizes: [20, 30],
    commonMaterials: ['Asphalt shingles', 'Wood decking', 'Tar paper / underlayment', 'Flashing', 'Nails & fasteners', 'Ridge caps'],
    avoidItems: ['Asbestos shingles (require special disposal)', 'Tar pots or hot mop equipment', 'Chemical solvents'],
    typicalDuration: '2–4 days',
    isHeavy: false,
    tips: ['Shingles are extremely heavy — don\'t exceed the weight limit', 'Park the dumpster as close to the roof edge as possible for easy loading', 'A 30 yd is standard for most residential re-roofs', 'Ask about our weight limits before ordering'],
    icon: Wrench,
  },
  'construction-debris': {
    slug: 'construction-debris',
    title: 'Construction Debris Dumpster Rental',
    h1: 'Dumpster Rental for Construction Sites',
    description: 'Roll-off dumpsters for new construction, remodels, and demolition. Lumber, drywall, concrete, and mixed debris.',
    intro: 'Construction sites generate mixed debris throughout the project lifecycle. From framing scraps to finishing waste, having the right container on site keeps your project on schedule and your site clean.',
    recommendedSizes: [20, 30, 40],
    commonMaterials: ['Lumber & wood scraps', 'Drywall', 'Concrete (small amounts)', 'Metal / rebar', 'Insulation', 'Packaging materials'],
    avoidItems: ['Hazardous materials', 'Asbestos', 'Liquid waste', 'Chemical containers'],
    typicalDuration: '1–4 weeks',
    isHeavy: false,
    tips: ['Separate clean concrete for lower disposal costs', 'Keep the dumpster accessible for equipment loading', 'Schedule swaps proactively to avoid full-container downtime', 'Ask about contractor account pricing for recurring projects'],
    icon: Truck,
  },
  'garage-cleanout': {
    slug: 'garage-cleanout',
    title: 'Garage Cleanout Dumpster Rental',
    h1: 'Dumpster Rental for Garage Cleanouts',
    description: 'Clear out your garage with the right size dumpster. Old furniture, tools, equipment, and stored items.',
    intro: 'Years of accumulated items can fill a garage fast. Most single-garage cleanouts fit comfortably in a 10 yard dumpster, while two-car garages may need a 20.',
    recommendedSizes: [10, 20],
    commonMaterials: ['Old furniture', 'Sports equipment', 'Stored boxes', 'Yard tools', 'Shelving', 'Miscellaneous household items'],
    avoidItems: ['Motor oil & automotive fluids', 'Propane tanks', 'Pesticides & chemicals', 'Paint (unless dry)'],
    typicalDuration: '2–3 days',
    isHeavy: false,
    tips: ['Sort items into keep, donate, and trash piles first', 'A 10 yd fits in most driveways', 'Load heavy items first, lighter items on top', 'Check for hazardous items before loading'],
    icon: Package,
  },
  'estate-cleanout': {
    slug: 'estate-cleanout',
    title: 'Estate Cleanout Dumpster Rental',
    h1: 'Dumpster Rental for Estate Cleanouts',
    description: 'Full estate cleanout dumpster service. Clear entire homes efficiently with the right container.',
    intro: 'Estate cleanouts often involve clearing an entire household. Multiple rooms, attics, basements, and garages add up quickly. A 20 or 30 yard dumpster handles most full-home cleanouts.',
    recommendedSizes: [20, 30],
    commonMaterials: ['Furniture', 'Mattresses', 'Clothing & linens', 'Kitchen items', 'Personal belongings', 'Old appliances'],
    avoidItems: ['Valuables (check drawers and closets)', 'Important documents', 'Hazardous materials', 'E-waste'],
    typicalDuration: '3–7 days',
    isHeavy: false,
    tips: ['Walk through the entire property before ordering', 'Consider a 30 yd for multi-bedroom homes', 'Separate valuables and documents before loading', 'Donate usable items to reduce waste'],
    icon: Scale,
  },
  'yard-cleanup': {
    slug: 'yard-cleanup',
    title: 'Yard Cleanup Dumpster Rental',
    h1: 'Dumpster Rental for Yard Cleanup',
    description: 'Dumpsters for landscaping, tree trimming, and yard waste. Green waste, branches, and outdoor debris.',
    intro: 'Landscaping projects, storm cleanup, and seasonal yard maintenance all benefit from a dumpster. Green waste is bulky but light — choose your container based on volume.',
    recommendedSizes: [10, 20],
    commonMaterials: ['Tree branches & limbs', 'Shrubs & brush', 'Grass clippings', 'Leaves', 'Sod & turf', 'Fencing'],
    avoidItems: ['Stumps over 12 inches (check with us)', 'Soil mixed with debris', 'Rocks or concrete', 'Treated lumber'],
    typicalDuration: '2–5 days',
    isHeavy: false,
    tips: ['Green waste is bulky — you may need a larger container than expected', 'Cut branches to 4-foot lengths for efficient loading', 'Don\'t mix soil or rocks with green waste', 'Ask about green waste disposal options in your area'],
    icon: TreePine,
  },
  'concrete-soil': {
    slug: 'concrete-soil',
    title: 'Concrete & Soil Removal Dumpster',
    h1: 'Dumpster Rental for Concrete & Soil',
    description: 'Heavy material dumpsters for concrete, soil, asphalt, and rock. Restricted to 5–10 yard containers.',
    intro: 'Concrete, soil, asphalt, and rock are heavy materials that require special containers. These materials are restricted to our 5, 8, and 10 yard heavy-duty dumpsters with a mandatory "fill to the line" rule.',
    recommendedSizes: [5, 8, 10],
    commonMaterials: ['Clean concrete', 'Clean soil / dirt', 'Asphalt', 'Brick', 'Rock / gravel', 'Block & masonry'],
    avoidItems: ['Trash or general debris mixed in', 'Rebar (separate if possible)', 'Contaminated soil', 'Wood or plastic'],
    typicalDuration: '2–5 days',
    isHeavy: true,
    tips: ['Heavy materials are restricted to 5–10 yard containers only', 'Fill to the line only — no overfilling', 'Keep materials clean for lower disposal rates', 'Mixing trash with concrete results in a contamination surcharge ($150)', 'Contact us if you\'re unsure about material classification'],
    icon: Shovel,
  },
};

export default function ProjectTypePage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? PROJECT_DATA[slug] : null;

  if (!data) {
    return <Navigate to="/quote?v3=1" replace />;
  }

  const Icon = data.icon;

  return (
    <Layout title={data.title} description={data.description} canonical={`/projects/${data.slug}`}>
      <div className="bg-muted/30 min-h-screen">
        {/* Hero */}
        <section className="bg-background py-10 md:py-16 border-b border-border">
          <div className="container-wide max-w-3xl mx-auto px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{data.h1}</h1>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">{data.intro}</p>
          </div>
        </section>

        <div className="container-wide max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
          {/* Recommended Sizes */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-primary" /> Recommended Dumpster Sizes
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.recommendedSizes.map(s => {
                  const sizeData = data.isHeavy
                    ? { price: HEAVY_MATERIAL.cleanSoil.prices[s as 5 | 8 | 10] || 0, tons: 'Flat rate' }
                    : GENERAL_DEBRIS_SIZES.find(g => g.size === s);
                  return (
                    <Link
                      key={s}
                      to={`/quote?v3=1&project=${data.slug}&size=${s}`}
                      className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-center hover:bg-primary/10 transition-colors"
                    >
                      <div className="text-2xl font-bold text-foreground">{s}<span className="text-sm text-muted-foreground ml-0.5">yd</span></div>
                      {sizeData && 'price' in sizeData && (
                        <div className="text-sm font-semibold text-primary mt-1">From ${typeof sizeData.price === 'number' ? sizeData.price.toLocaleString() : sizeData.price}</div>
                      )}
                      {sizeData && 'includedTons' in sizeData && (
                        <div className="text-xs text-muted-foreground">{(sizeData as any).includedTons} ton{(sizeData as any).includedTons !== 1 ? 's' : ''} included</div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Common Materials */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Common Materials
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {data.commonMaterials.map(m => (
                  <div key={m} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What to Avoid */}
          <Card className="border-destructive/30">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" /> What NOT to Put in the Dumpster
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {data.avoidItems.map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="w-4 h-4 text-destructive/60 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Heavy Material Warning */}
          {data.isHeavy && (
            <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600" /> Heavy Material Rules
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Heavy materials (soil, concrete, rock) are <strong>restricted to 5, 8, and 10 yard containers only</strong></li>
                  <li>• <strong>Fill to the line</strong> — no overfilling allowed</li>
                  <li>• Mixing trash or debris with heavy materials results in a <strong>$150 contamination surcharge</strong></li>
                  <li>• Keep materials as clean as possible for lower disposal rates</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" /> Tips for Success
              </h2>
              <ul className="space-y-2">
                {data.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Duration */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>Typical rental: <strong className="text-foreground">{data.typicalDuration}</strong></span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full font-semibold px-8">
              <Link to={`/quote?v3=1&project=${data.slug}`}>
                Get Exact Price <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full font-semibold px-8">
              <Link to="/waste-vision">
                <Upload className="w-4 h-4 mr-2" /> Upload Photo for Size Help
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full font-semibold px-8">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-4 h-4 mr-2" /> Call Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
