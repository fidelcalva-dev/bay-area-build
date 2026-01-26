import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { BUSINESS_INFO } from '@/lib/seo';
import { useLanguage } from '@/contexts/LanguageContext';

// Pickup truck load estimates by size
const PICKUP_TRUCK_LOADS = [
  { yards: 6, loads: '2–3', noteKey: 'pickup.note6' },
  { yards: 8, loads: '3–4', noteKey: 'pickup.note8' },
  { yards: 10, loads: '4–5', noteKey: 'pickup.note10' },
  { yards: 20, loads: '6–8', noteKey: 'pickup.note20' },
  { yards: 30, loads: '9–12', noteKey: 'pickup.note30' },
  { yards: 40, loads: '12–16', noteKey: 'pickup.note40' },
  { yards: 50, loads: '16–20', noteKey: 'pickup.note50' },
];

// Scenario definitions with translation keys
const HOMEOWNER_SCENARIOS = [
  {
    titleKey: 'scenario.garage',
    icon: Home,
    recommended: ['10 yd', '20 yd'],
    whyKey: 'scenario.garageWhy',
    weightNoteKey: 'scenario.garageWeight',
  },
  {
    titleKey: 'scenario.bathroom',
    icon: Home,
    recommended: ['10 yd', '20 yd'],
    whyKey: 'scenario.bathroomWhy',
    weightNoteKey: 'scenario.bathroomWeight',
  },
  {
    titleKey: 'scenario.kitchen',
    icon: Home,
    recommended: ['20 yd'],
    whyKey: 'scenario.kitchenWhy',
    weightNoteKey: 'scenario.kitchenWeight',
  },
  {
    titleKey: 'scenario.deck',
    icon: Home,
    recommended: ['10 yd', '20 yd'],
    whyKey: 'scenario.deckWhy',
    weightNoteKey: 'scenario.deckWeight',
  },
  {
    titleKey: 'scenario.roof',
    icon: Home,
    recommended: ['10 yd', '20 yd'],
    whyKey: 'scenario.roofWhy',
    weightNoteKey: 'scenario.roofWeight',
  },
  {
    titleKey: 'scenario.yard',
    icon: Home,
    recommended: ['10 yd', '20 yd'],
    whyKey: 'scenario.yardWhy',
    weightNoteKey: 'scenario.yardWeight',
  },
];

const CONTRACTOR_SCENARIOS = [
  {
    titleKey: 'scenario.smallDemo',
    icon: HardHat,
    recommended: ['20 yd'],
    whyKey: 'scenario.smallDemoWhy',
    weightNoteKey: 'scenario.smallDemoWeight',
  },
  {
    titleKey: 'scenario.fullRemodel',
    icon: HardHat,
    recommended: ['30 yd'],
    whyKey: 'scenario.fullRemodelWhy',
    weightNoteKey: 'scenario.fullRemodelWeight',
  },
  {
    titleKey: 'scenario.lightDemo',
    icon: HardHat,
    recommended: ['30 yd', '40 yd'],
    whyKey: 'scenario.lightDemoWhy',
    weightNoteKey: 'scenario.lightDemoWeight',
  },
  {
    titleKey: 'scenario.commercial',
    icon: HardHat,
    recommended: ['40 yd', '50 yd'],
    whyKey: 'scenario.commercialWhy',
    weightNoteKey: 'scenario.commercialWeight',
  },
  {
    titleKey: 'scenario.concrete',
    icon: HardHat,
    recommended: ['6 yd', '8 yd', '10 yd'],
    whyKey: 'scenario.concreteWhy',
    weightNoteKey: 'scenario.concreteWeight',
    isHeavy: true,
  },
];

const BUSINESS_SCENARIOS = [
  {
    titleKey: 'scenario.retail',
    icon: Building2,
    recommended: ['20 yd', '30 yd'],
    whyKey: 'scenario.retailWhy',
    weightNoteKey: 'scenario.retailWeight',
  },
  {
    titleKey: 'scenario.property',
    icon: Building2,
    recommended: ['20 yd', '30 yd'],
    whyKey: 'scenario.propertyWhy',
    weightNoteKey: 'scenario.propertyWeight',
  },
  {
    titleKey: 'scenario.ongoing',
    icon: Building2,
    recommended: ['30 yd', '40 yd', '50 yd'],
    whyKey: 'scenario.ongoingWhy',
    weightNoteKey: 'scenario.ongoingWeight',
    hasContractorCTA: true,
  },
];

// Concrete slab capacity reference
const CONCRETE_CAPACITY = [
  { size: 10, slab4in: '150–250 sq ft', slab6in: '100–170 sq ft', slab4inEs: '150–250 pies²', slab6inEs: '100–170 pies²' },
  { size: 8, slab4in: '120–200 sq ft', slab6in: '80–140 sq ft', slab4inEs: '120–200 pies²', slab6inEs: '80–140 pies²' },
  { size: 6, slab4in: '90–150 sq ft', slab6in: '60–110 sq ft', slab4inEs: '90–150 pies²', slab6inEs: '60–110 pies²' },
];

interface ScenarioCardProps {
  titleKey: string;
  icon: React.ComponentType<{ className?: string }>;
  recommended: string[];
  whyKey: string;
  weightNoteKey: string;
  isHeavy?: boolean;
  hasContractorCTA?: boolean;
  t: (key: string) => string;
}

function ScenarioCard({ titleKey, icon: Icon, recommended, whyKey, weightNoteKey, isHeavy, hasContractorCTA, t }: ScenarioCardProps) {
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
            <CardTitle className="text-base font-semibold">{t(titleKey)}</CardTitle>
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
        <p className="text-sm text-muted-foreground">{t(whyKey)}</p>
        <div className="flex items-start gap-2 pt-1">
          <Weight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground italic">{t(weightNoteKey)}</p>
        </div>
        {hasContractorCTA && (
          <Button asChild variant="link" size="sm" className="px-0 h-auto text-primary">
            <Link to="/contractors">
              {t('capacity.askContractor')}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function CapacityGuide() {
  const { t, language } = useLanguage();
  const overageGeneral = PRICING_POLICIES.overagePerTonGeneral;

  return (
    <Layout
      title={language === 'es' ? 'Guía de Capacidad de Dumpster | ¿Cuánto Cabe en Cada Tamaño?' : 'Dumpster Capacity Guide | How Much Fits in Each Size'}
      description={language === 'es' 
        ? 'Estimados reales de capacidad de dumpster para proyectos comunes. Cargas de pickup, escenarios de propietarios, contratistas y guía de concreto.'
        : 'Real-world dumpster capacity estimates for common projects. Pickup truck loads, homeowner scenarios, contractor scenarios, and concrete slab capacity guide.'}
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-4">
              <Ruler className="w-4 h-4" />
              {t('capacity.badge')}
            </div>
            <h1 className="heading-xl mb-4">{t('capacity.title')}</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              {t('capacity.subtitle')}
            </p>
            <Button asChild variant="cta" size="xl">
              <Link to="/pricing">
                {t('capacity.ctaZip')}
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
              <h2 className="heading-lg text-foreground">{t('capacity.pickupTitle')}</h2>
              <p className="text-sm text-muted-foreground">{t('capacity.pickupSubtitle')}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">{t('capacity.dumpsterSize')}</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground">{t('capacity.pickupLoads')}</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground hidden sm:table-cell">{t('capacity.typicalUse')}</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground hidden md:table-cell">{t('capacity.dimensions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PICKUP_TRUCK_LOADS.map((item) => {
                    const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === item.yards);
                    return (
                      <tr key={item.yards} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-foreground text-lg">{item.yards}</span>
                          <span className="text-muted-foreground ml-1">{t('capacity.yard')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-primary">{item.loads}</span>
                          <span className="text-muted-foreground ml-1">{t('capacity.loads')}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                          {t(item.noteKey)}
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
                {t('capacity.pickupNote')}
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
              <h2 className="heading-lg text-foreground">{t('capacity.homeownerTitle')}</h2>
              <p className="text-sm text-muted-foreground">{t('capacity.homeownerSubtitle')}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOMEOWNER_SCENARIOS.map((scenario) => (
              <ScenarioCard key={scenario.titleKey} {...scenario} t={t} />
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
              <h2 className="heading-lg text-foreground">{t('capacity.contractorTitle')}</h2>
              <p className="text-sm text-muted-foreground">{t('capacity.contractorSubtitle')}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTRACTOR_SCENARIOS.map((scenario) => (
              <ScenarioCard key={scenario.titleKey} {...scenario} t={t} />
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
              <h2 className="heading-lg text-foreground">{t('capacity.businessTitle')}</h2>
              <p className="text-sm text-muted-foreground">{t('capacity.businessSubtitle')}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUSINESS_SCENARIOS.map((scenario) => (
              <ScenarioCard key={scenario.titleKey} {...scenario} t={t} />
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
              <h2 className="heading-lg text-foreground">{t('capacity.concreteTitle')}</h2>
              <p className="text-sm text-muted-foreground">{t('capacity.concreteSubtitle')}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Weight Reference */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">{t('capacity.concreteWeightRef')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">{t('capacity.slab4in')}</span>
                    <span className="text-muted-foreground ml-2">{t('capacity.slab4inWeight')}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">{t('capacity.slab6in')}</span>
                    <span className="text-muted-foreground ml-2">{t('capacity.slab6inWeight')}</span>
                  </div>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">{t('capacity.practicalCapacity')}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium text-muted-foreground">{t('capacity.size')}</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">4" {language === 'es' ? 'Losa' : 'Slab'}</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">6" {language === 'es' ? 'Losa' : 'Slab'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONCRETE_CAPACITY.map((row) => (
                        <tr key={row.size} className="border-b border-border/50">
                          <td className="py-2 font-semibold text-foreground">{row.size} yd</td>
                          <td className="py-2 text-muted-foreground">{language === 'es' ? row.slab4inEs : row.slab4in}</td>
                          <td className="py-2 text-muted-foreground">{language === 'es' ? row.slab6inEs : row.slab6in}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* House Demo Estimate */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">{t('capacity.demoTitle')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('capacity.demoSubtitle')}
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">{t('capacity.demoWoodFrame')}</span>
                    <p className="text-sm text-muted-foreground">{t('capacity.demoWoodFrameWeight')}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">{t('capacity.demoWithFoundation')}</span>
                    <p className="text-sm text-muted-foreground">{t('capacity.demoWithFoundationWeight')}</p>
                  </div>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    {t('capacity.demoNote')}
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
                <p className="font-semibold text-foreground mb-1">{t('capacity.heavyDisclaimer')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('capacity.heavyDisclaimerText')}
                  <span className="font-semibold text-amber-700 dark:text-amber-300">{t('capacity.flatFeeNote')}</span>
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
            <h2 className="heading-md text-center text-foreground mb-8">{t('capacity.pricingRulesTitle')}</h2>
            
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="divide-y divide-border">
                {/* Heavy Materials */}
                <div className="p-5 flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 shrink-0">
                    <Weight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t('capacity.heavyMaterialsTitle')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('capacity.heavyMaterialsDesc')}
                    </p>
                  </div>
                </div>

                {/* Mixed 6-10 */}
                <div className="p-5 flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t('capacity.mixed610Title')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('capacity.mixed610Desc')}
                    </p>
                  </div>
                </div>

                {/* Mixed 20+ */}
                <div className="p-5 flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t('capacity.mixed20Title')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('capacity.mixed20Desc')}
                    </p>
                  </div>
                </div>

                {/* General Rule */}
                <div className="p-5 flex items-start gap-4 bg-muted/30">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t('capacity.keepBelowRim')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('capacity.keepBelowRimDesc')}
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
          <h2 className="heading-lg mb-4">{t('capacity.ctaTitle')}</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            {t('capacity.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/pricing">
                {t('nav.getQuote')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`sms:${BUSINESS_INFO.phone.sales.replace('+1-', '+1')}`}>
                <MessageSquare className="w-5 h-5" />
                {t('capacity.textUs')}
              </a>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-5 h-5" />
                {t('capacity.callNow')}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
