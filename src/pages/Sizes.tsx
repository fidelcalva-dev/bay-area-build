import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Ruler, Weight, CheckCircle, Phone, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Import 3D dumpster renders
import dumpster6yard from '@/assets/dumpsters/dumpster-6yard.png';
import dumpster6yardDims from '@/assets/dumpsters/dumpster-6yard-dims.png';
import dumpster8yard from '@/assets/dumpsters/dumpster-8yard.png';
import dumpster8yardDims from '@/assets/dumpsters/dumpster-8yard-dims.png';
import dumpster10yard from '@/assets/dumpsters/dumpster-10yard.png';
import dumpster10yardDims from '@/assets/dumpsters/dumpster-10yard-dims.png';
import dumpster20yard from '@/assets/dumpsters/dumpster-20yard.png';
import dumpster20yardDims from '@/assets/dumpsters/dumpster-20yard-dims.png';
import dumpster30yard from '@/assets/dumpsters/dumpster-30yard.png';
import dumpster30yardDims from '@/assets/dumpsters/dumpster-30yard-dims.png';
import dumpster40yard from '@/assets/dumpsters/dumpster-40yard.png';
import dumpster40yardDims from '@/assets/dumpsters/dumpster-40yard-dims.png';
import dumpster50yard from '@/assets/dumpsters/dumpster-50yard.png';
import dumpster50yardDims from '@/assets/dumpsters/dumpster-50yard-dims.png';

const TRASHLAB_URL = 'https://app.trashlab.com';

interface DumpsterSize {
  yards: number;
  dimensions: string;
  includedTons: number;
  useCases: string[];
  loads: string;
  image: string;
  imageDims: string;
  popular?: boolean;
}

// Heavy Materials sizes (6, 8, 10 yard) - for concrete, dirt, rock, asphalt
const heavyMaterialSizes: DumpsterSize[] = [
  {
    yards: 6,
    dimensions: "10' L × 5' W × 3' H",
    includedTons: 10,
    useCases: ['Concrete removal', 'Dirt & soil', 'Rock & gravel', 'Asphalt demolition'],
    loads: '1-2 pickup loads',
    image: dumpster6yard,
    imageDims: dumpster6yardDims,
  },
  {
    yards: 8,
    dimensions: "12' L × 6' W × 3' H",
    includedTons: 10,
    useCases: ['Foundation demo', 'Brick & block', 'Heavy construction', 'Driveway removal'],
    loads: '2-3 pickup loads',
    image: dumpster8yard,
    imageDims: dumpster8yardDims,
  },
  {
    yards: 10,
    dimensions: "14' L × 7' W × 3.5' H",
    includedTons: 10,
    useCases: ['Large concrete jobs', 'Mixed heavy debris', 'Commercial demo', 'Pool removal'],
    loads: '3-4 pickup loads',
    image: dumpster10yard,
    imageDims: dumpster10yardDims,
    popular: true,
  },
];

// General Debris sizes (10, 20, 30, 40, 50 yard) - for household, construction, roofing
const generalDebrisSizes: DumpsterSize[] = [
  {
    yards: 10,
    dimensions: "14' L × 7' W × 3.5' H",
    includedTons: 2,
    useCases: ['Garage cleanouts', 'Small renovations', 'Deck removal', 'Moving cleanouts'],
    loads: '3-4 pickup loads',
    image: dumpster10yard,
    imageDims: dumpster10yardDims,
  },
  {
    yards: 20,
    dimensions: "22' L × 8' W × 4' H",
    includedTons: 3,
    useCases: ['Full room renovations', 'Roofing projects', 'Large cleanouts', 'Construction debris'],
    loads: '6-8 pickup loads',
    image: dumpster20yard,
    imageDims: dumpster20yardDims,
    popular: true,
  },
  {
    yards: 30,
    dimensions: "22' L × 8' W × 6' H",
    includedTons: 4,
    useCases: ['Major renovations', 'New construction', 'Commercial cleanouts', 'Estate cleanouts'],
    loads: '9-12 pickup loads',
    image: dumpster30yard,
    imageDims: dumpster30yardDims,
  },
  {
    yards: 40,
    dimensions: "22' L × 8' W × 8' H",
    includedTons: 5,
    useCases: ['Large construction sites', 'Commercial projects', 'Industrial waste', 'Major demolition'],
    loads: '12-16 pickup loads',
    image: dumpster40yard,
    imageDims: dumpster40yardDims,
  },
  {
    yards: 50,
    dimensions: "22' L × 8' W × 9' H",
    includedTons: 6,
    useCases: ['Largest projects', 'Industrial sites', 'Multi-building demo', 'Warehouses'],
    loads: '16-20 pickup loads',
    image: dumpster50yard,
    imageDims: dumpster50yardDims,
  },
];

function DumpsterCard({ size, variant }: { size: DumpsterSize; variant: 'heavy' | 'general' }) {
  const [showDims, setShowDims] = useState(false);
  
  return (
    <div
      id={`${size.yards}-yard-${variant}`}
      className={`group relative bg-card rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-card-hover ${
        size.popular ? 'border-accent ring-2 ring-accent/20' : 'border-border hover:border-primary/30'
      }`}
    >
      {size.popular && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full shadow-sm">
          MOST POPULAR
        </div>
      )}

      {/* Image Section */}
      <div 
        className="relative aspect-[4/3] bg-gradient-to-b from-muted/50 to-muted p-4 cursor-pointer"
        onClick={() => setShowDims(!showDims)}
      >
        <img
          src={showDims ? size.imageDims : size.image}
          alt={`${size.yards} yard dumpster${showDims ? ' with dimensions' : ''}`}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <button 
          className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setShowDims(!showDims);
          }}
        >
          <Ruler className="w-3 h-3" />
          {showDims ? 'Hide' : 'Show'} dims
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-extrabold text-foreground">{size.yards} Yard</h3>
            <p className="text-sm text-muted-foreground">{size.loads}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-primary font-semibold">
              <Weight className="w-4 h-4" />
              <span>{size.includedTons}T</span>
            </div>
            <p className="text-xs text-muted-foreground">included</p>
          </div>
        </div>

        {/* Dimensions */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm">
          <Ruler className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Approx:</span>
          <span className="font-medium text-foreground">{size.dimensions}</span>
        </div>

        {/* Use Cases */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Perfect for</p>
          <ul className="grid grid-cols-1 gap-1.5">
            {size.useCases.slice(0, 3).map((useCase) => (
              <li key={useCase} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{useCase}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Button 
          asChild 
          variant={size.popular ? 'cta' : 'default'} 
          className="w-full mt-2"
        >
          <a href={TRASHLAB_URL} target="_blank" rel="noopener noreferrer">
            Choose This Size
            <ArrowRight className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

import { useState } from 'react';

export default function Sizes() {
  const { t } = useLanguage();

  return (
    <Layout
      title="Dumpster Sizes Guide | 6 to 50 Yard Dumpsters"
      description="Compare dumpster sizes from 6 to 50 yards. Heavy material sizes for concrete and dirt. General debris sizes for renovations and cleanouts."
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">{t('sizes.title')}</h1>
            <p className="text-xl text-primary-foreground/85">
              From heavy concrete removal to large-scale cleanouts—find the perfect dumpster for your project.
            </p>
          </div>
        </div>
      </section>

      {/* Heavy Materials Section */}
      <section className="section-padding bg-background" id="heavy-materials">
        <div className="container-wide">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm font-semibold mb-3">
              <Weight className="w-4 h-4" />
              Heavy Materials
            </div>
            <h2 className="heading-lg text-foreground mb-2">For Concrete, Dirt & Rock</h2>
            <p className="text-muted-foreground max-w-2xl">
              Compact sizes designed for heavy materials. Higher weight limits, reinforced construction. 
              <span className="font-medium text-foreground"> 10 tons included</span> on all heavy material dumpsters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {heavyMaterialSizes.map((size) => (
              <DumpsterCard key={`heavy-${size.yards}`} size={size} variant="heavy" />
            ))}
          </div>
        </div>
      </section>

      {/* General Debris Section */}
      <section className="section-padding bg-muted" id="general-debris">
        <div className="container-wide">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-3">
              <CheckCircle className="w-4 h-4" />
              General Debris
            </div>
            <h2 className="heading-lg text-foreground mb-2">For Renovations & Cleanouts</h2>
            <p className="text-muted-foreground max-w-2xl">
              Full range of sizes for household junk, construction debris, roofing, and more. 
              Weight limits scale with size—<span className="font-medium text-foreground">2 to 6 tons included</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalDebrisSizes.map((size) => (
              <DumpsterCard key={`general-${size.yards}`} size={size} variant="general" />
            ))}
          </div>
        </div>
      </section>

      {/* Weight Info Banner */}
      <section className="py-8 bg-accent/10 border-y border-accent/20">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Weight className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Overage charges apply beyond included tonnage</p>
                <p className="text-sm text-muted-foreground">$85/ton for general debris • $65/ton for heavy materials</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/pricing">
                View Full Pricing
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Help Choosing */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7 text-primary" />
            </div>
            <h2 className="heading-md text-foreground mb-2">Not Sure Which Size?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Our team can help you choose the right dumpster for your project. Call us for a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default" size="lg">
                <a href="tel:+15106802150" className="gap-2">
                  <Phone className="w-4 h-4" />
                  Call (510) 680-2150
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/materials">
                  View Allowed Materials
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
