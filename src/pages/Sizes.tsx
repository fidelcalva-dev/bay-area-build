import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Ruler, Weight, CheckCircle, Phone, HelpCircle, Hammer, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES, getHeavySizes, getGeneralSizes } from '@/lib/shared-data';

// Import photorealistic dumpster photos
import dumpster6yard from '@/assets/dumpsters/dumpster-6yard-photo.jpg';
import dumpster6yardDims from '@/assets/dumpsters/dumpster-6yard-dims.png';
import dumpster8yard from '@/assets/dumpsters/dumpster-8yard-photo.jpg';
import dumpster8yardDims from '@/assets/dumpsters/dumpster-8yard-dims.png';
import dumpster10yard from '@/assets/dumpsters/dumpster-10yard-photo.jpg';
import dumpster10yardDims from '@/assets/dumpsters/dumpster-10yard-dims.png';
import dumpster20yard from '@/assets/dumpsters/dumpster-20yard-photo.jpg';
import dumpster20yardDims from '@/assets/dumpsters/dumpster-20yard-dims.png';
import dumpster30yard from '@/assets/dumpsters/dumpster-30yard-photo.jpg';
import dumpster30yardDims from '@/assets/dumpsters/dumpster-30yard-dims.png';
import dumpster40yard from '@/assets/dumpsters/dumpster-40yard-photo.jpg';
import dumpster40yardDims from '@/assets/dumpsters/dumpster-40yard-dims.png';
import dumpster50yard from '@/assets/dumpsters/dumpster-50yard-photo.jpg';
import dumpster50yardDims from '@/assets/dumpsters/dumpster-50yard-dims.png';

// Image mapping by yard size
const DUMPSTER_IMAGES: Record<number, { photo: string; dims: string }> = {
  6: { photo: dumpster6yard, dims: dumpster6yardDims },
  8: { photo: dumpster8yard, dims: dumpster8yardDims },
  10: { photo: dumpster10yard, dims: dumpster10yardDims },
  20: { photo: dumpster20yard, dims: dumpster20yardDims },
  30: { photo: dumpster30yard, dims: dumpster30yardDims },
  40: { photo: dumpster40yard, dims: dumpster40yardDims },
  50: { photo: dumpster50yard, dims: dumpster50yardDims },
};

interface DumpsterSize {
  yards: number;
  dimensions: string;
  height: string;
  length: string;
  width: string;
  includedTons: number;
  useCases: string[];
  loads: string;
  image: string;
  imageDims: string;
  popular?: boolean;
  description: string;
}

// Build display arrays from canonical DUMPSTER_SIZES_DATA
const heavyMaterialSizes: DumpsterSize[] = getHeavySizes().map(size => ({
  yards: size.yards,
  dimensions: size.dimensions,
  length: size.length || '',
  width: size.width || '',
  height: size.height || '',
  includedTons: size.includedTons,
  useCases: size.useCases,
  loads: size.loads || '',
  image: DUMPSTER_IMAGES[size.yards]?.photo || '',
  imageDims: DUMPSTER_IMAGES[size.yards]?.dims || '',
  popular: size.popular,
  description: size.description,
}));

const generalDebrisSizes: DumpsterSize[] = getGeneralSizes().map(size => ({
  yards: size.yards,
  dimensions: size.dimensions,
  length: size.length || '',
  width: size.width || '',
  height: size.height || '',
  includedTons: size.includedTons,
  useCases: size.useCases,
  loads: size.loads || '',
  image: DUMPSTER_IMAGES[size.yards]?.photo || '',
  imageDims: DUMPSTER_IMAGES[size.yards]?.dims || '',
  popular: size.popular,
  description: size.description,
}));

function DumpsterCard({ size, variant }: { size: DumpsterSize; variant: 'heavy' | 'general' }) {
  const isHeavy = variant === 'heavy';
  
  return (
    <div
      className={`group relative bg-card rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${
        size.popular 
          ? 'border-primary ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/30'
      }`}
    >
      {size.popular && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg">
          MOST POPULAR
        </div>
      )}

      {/* Image Section */}
      <div className="relative aspect-[4/3] bg-gradient-to-b from-muted/30 to-muted/80 p-6">
        <img
          src={size.image}
          alt={`${size.yards} yard dumpster`}
          className="w-full h-full object-contain transition-all duration-500 group-hover:scale-105"
        />

        {/* Size Badge */}
        <div className="absolute top-3 left-3 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-lg">
          <span className="text-2xl font-black text-foreground">{size.yards}</span>
          <span className="text-sm font-medium text-muted-foreground ml-1">YARD</span>
        </div>
        
        {/* Pricing Badge - Different for Heavy vs General */}
        <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
          isHeavy ? 'bg-success/90' : 'bg-primary/90'
        } backdrop-blur-sm`}>
          {isHeavy ? (
            <>
              <CheckCircle className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">Flat Fee</span>
            </>
          ) : (
            <>
              <Weight className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">{size.includedTons}T Included</span>
            </>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {size.description}
        </p>

        {/* Approx Dimensions Bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 rounded-lg border border-border/50">
          <Ruler className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Approx.</span>
            <span className="font-medium text-foreground">{size.length}</span>
            <span className="text-muted-foreground">×</span>
            <span className="font-medium text-foreground">{size.width}</span>
            <span className="text-muted-foreground">×</span>
            <span className="font-medium text-foreground">{size.height}</span>
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Perfect for
          </p>
          <ul className="space-y-1.5">
            {size.useCases.map((useCase) => (
              <li key={useCase} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className={`w-4 h-4 shrink-0 ${isHeavy ? 'text-amber-500' : 'text-primary'}`} />
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
          size="lg"
        >
          <Link to="/pricing">
            Choose {size.yards} Yard
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function Sizes() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('general');

  // Use canonical pricing from PRICING_POLICIES
  const overageRate = PRICING_POLICIES.overagePerTonGeneral;

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
            <p className="text-xl text-primary-foreground/85 mb-6">
              From heavy concrete removal to large-scale cleanouts—find the perfect dumpster for your project.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant={activeTab === 'general' ? 'secondary' : 'outline'}
                size="lg"
                onClick={() => setActiveTab('general')}
                className={activeTab !== 'general' ? 'bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10' : ''}
              >
                <Home className="w-4 h-4 mr-2" />
                General Debris
              </Button>
              <Button 
                variant={activeTab === 'heavy' ? 'secondary' : 'outline'}
                size="lg"
                onClick={() => setActiveTab('heavy')}
                className={activeTab !== 'heavy' ? 'bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10' : ''}
              >
                <Hammer className="w-4 h-4 mr-2" />
                Heavy Materials
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabbed Content */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-10 h-14 p-1.5 bg-muted">
              <TabsTrigger 
                value="general" 
                className="flex-1 h-full text-sm font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md"
              >
                <Home className="w-4 h-4" />
                <span>General Debris</span>
                <span className="hidden sm:inline text-xs text-muted-foreground ml-1">6-50 yd</span>
              </TabsTrigger>
              <TabsTrigger 
                value="heavy" 
                className="flex-1 h-full text-sm font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md"
              >
                <Hammer className="w-4 h-4" />
                <span>Heavy Materials</span>
                <span className="hidden sm:inline text-xs text-muted-foreground ml-1">6-10 yd</span>
              </TabsTrigger>
            </TabsList>

            {/* General Debris Tab */}
            <TabsContent value="general" className="mt-0">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                  <Home className="w-4 h-4" />
                  General Debris Dumpsters
                </div>
                <h2 className="heading-lg text-foreground mb-3">For Renovations, Roofing & Cleanouts</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Full range of sizes for household junk, construction debris, roofing shingles, and more. 
                  Tonnage included by size—<span className="font-semibold text-foreground">0.5T to 5T included</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {generalDebrisSizes.map((size) => (
                  <DumpsterCard key={`general-${size.yards}`} size={size} variant="general" />
                ))}
              </div>
            </TabsContent>

            {/* Heavy Materials Tab */}
            <TabsContent value="heavy" className="mt-0">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-sm font-semibold mb-4">
                  <Hammer className="w-4 h-4" />
                  Heavy Materials Dumpsters
                </div>
                <h2 className="heading-lg text-foreground mb-3">For Concrete, Dirt, Rock & Asphalt</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Compact sizes designed for heavy materials. Reinforced construction for dense loads.
                  <span className="font-semibold text-success"> FLAT FEE pricing—disposal included with no extra weight charges.</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {heavyMaterialSizes.map((size) => (
                  <DumpsterCard key={`heavy-${size.yards}`} size={size} variant="heavy" />
                ))}
              </div>

              {/* Heavy Materials Note */}
              <div className="mt-8 p-5 bg-success/10 border border-success/30 rounded-xl max-w-2xl mx-auto">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Flat Fee Pricing – No Weight Worries</p>
                    <p className="text-sm text-muted-foreground">
                      Heavy material dumpsters (6/8/10 yard) are FLAT FEE. Disposal is included with no extra weight charges.
                      If trash or debris is mixed in, the load may be reclassified and additional charges may apply.
                    </p>
                  </div>
                </div>
              </div>

              {/* Heavy Materials Only Warning */}
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl max-w-2xl mx-auto">
                <div className="flex items-start gap-3">
                  <Weight className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Heavy Materials Only – No Mixing</p>
                    <p className="text-sm text-muted-foreground">
                      These dumpsters are specifically for concrete, dirt, rock, brick, and asphalt. 
                      Mixing with general debris is not allowed due to recycling requirements.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Weight Info Banner - Now using canonical PRICING_POLICIES */}
      <section className="py-8 bg-accent/10 border-y border-accent/20">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Weight className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Overage Rules by Material Type</p>
                <p className="text-sm text-muted-foreground">
                  Heavy: Flat Fee (no overage) • General 6-10yd: $30/yard • General 20-50yd: ${overageRate}/ton
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/pricing">
                View Full Pricing
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Help Choosing */}
      <section className="section-padding bg-muted/50">
        <div className="container-narrow">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 text-center shadow-lg">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="heading-md text-foreground mb-3">Not Sure Which Size?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Our team can help you choose the right dumpster for your project. Call us for a free consultation or get an instant quote online.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Button asChild variant="cta" size="lg">
                <Link to="/pricing" className="gap-2">
                  Get Instant Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="tel:+15106802150" className="gap-2">
                  <Phone className="w-4 h-4" />
                  Call (510) 680-2150
                </a>
              </Button>
            </div>
            <Button asChild variant="link" size="sm" className="text-muted-foreground">
              <Link to="/capacity-guide">
                View Capacity & Scenarios Guide →
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
