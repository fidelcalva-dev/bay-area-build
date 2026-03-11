import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Weight, CheckCircle, Phone, HelpCircle, Hammer, Home, Eye, Calculator } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PRICING_POLICIES, getHeavySizes, getGeneralSizes } from '@/lib/shared-data';
import { BUSINESS_INFO } from '@/lib/seo';
import { PlainDumpsterCard, type DumpsterSizeYd } from '@/components/shared/PlainDumpsterCard';
import { DumpsterSizeVisualizer } from '@/components/visualizer';

export default function Sizes() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('general');

  // Use canonical pricing from PRICING_POLICIES
  const overageRate = PRICING_POLICIES.overagePerTonGeneral;

  // Get canonical data
  const generalSizes = getGeneralSizes();
  const heavySizes = getHeavySizes();

  return (
    <Layout
      title="Dumpster Sizes Guide | 5 to 50 Yard Dumpsters"
      description="Compare dumpster sizes from 5 to 50 yards. Heavy material sizes (5, 8, 10 yard) for concrete and dirt. General debris sizes for renovations and cleanouts."
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
                <span className="hidden sm:inline text-xs text-muted-foreground ml-1">5-50 yd</span>
              </TabsTrigger>
              <TabsTrigger 
                value="heavy" 
                className="flex-1 h-full text-sm font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md"
              >
                <Hammer className="w-4 h-4" />
                <span>Heavy Materials</span>
                <span className="hidden sm:inline text-xs text-muted-foreground ml-1">5-10 yd</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {generalSizes.map((size) => (
                  <PlainDumpsterCard
                    key={`general-${size.yards}`}
                    sizeYd={size.yards as DumpsterSizeYd}
                    description={size.description}
                    useCases={size.useCases}
                    isPopular={size.popular}
                    variant="general"
                    ctaLink="/pricing"
                  />
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
                {heavySizes.map((size) => (
                  <PlainDumpsterCard
                    key={`heavy-${size.yards}`}
                    sizeYd={size.yards as DumpsterSizeYd}
                    description={size.description}
                    useCases={size.useCases}
                    variant="heavy"
                    ctaLink="/pricing"
                  />
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

      {/* Weight Info Banner */}
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
                  Heavy Materials: Flat Fee (no overage) | General Debris: ${overageRate}/ton based on scale ticket
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

      {/* Visualizer Section */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              <Eye className="w-4 h-4" />
              Interactive Tool
            </div>
            <h2 className="heading-lg text-foreground mb-3">Size Visualizer</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Compare dumpster dimensions to everyday objects and calculate if your debris will fit.
            </p>
          </div>
          
          <DumpsterSizeVisualizer initialSize={20} showQuoteLink={true} />
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
                <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="gap-2">
                  <Phone className="w-4 h-4" />
                  Call {BUSINESS_INFO.phone.salesFormatted}
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
