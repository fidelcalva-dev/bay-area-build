import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, ArrowRight, Package, Ruler, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const DUMPSTER_SIZES = [
  {
    yards: 8,
    capacity: '2-3 pickup truck loads',
    dimensions: "12' × 6' × 3.5'",
    weight: '1 ton',
    typicalUse: 'Small cleanouts & minor renovations',
    recommendedProjects: [
      'Bathroom remodel',
      'Small garage cleanout',
      'Deck removal (small)',
      'Spring cleaning',
    ],
    popular: false,
  },
  {
    yards: 10,
    capacity: '3-4 pickup truck loads',
    dimensions: "14' × 7' × 3.5'",
    weight: '1.5 tons',
    typicalUse: 'Medium cleanouts & single-room projects',
    recommendedProjects: [
      'Garage cleanout',
      'Basement cleanout',
      'Small kitchen remodel',
      'Flooring removal',
    ],
    popular: false,
  },
  {
    yards: 15,
    capacity: '5-6 pickup truck loads',
    dimensions: "16' × 7.5' × 4'",
    weight: '2 tons',
    typicalUse: 'Large cleanouts & multi-room renovations',
    recommendedProjects: [
      'Kitchen remodel',
      'Flooring project (whole house)',
      'Roof tear-off (small)',
      'Estate cleanout',
    ],
    popular: false,
  },
  {
    yards: 20,
    capacity: '6-8 pickup truck loads',
    dimensions: "22' × 7.5' × 4.5'",
    weight: '3 tons',
    typicalUse: 'Full renovations & construction projects',
    recommendedProjects: [
      'Full room renovation',
      'Roofing project',
      'Siding replacement',
      'Large landscaping',
    ],
    popular: true,
  },
  {
    yards: 30,
    capacity: '9-12 pickup truck loads',
    dimensions: "22' × 7.5' × 6'",
    weight: '4 tons',
    typicalUse: 'Major renovations & new construction',
    recommendedProjects: [
      'Major home renovation',
      'New construction debris',
      'Commercial cleanout',
      'Large demolition',
    ],
    popular: false,
  },
  {
    yards: 40,
    capacity: '12-16 pickup truck loads',
    dimensions: "22' × 8' × 8'",
    weight: '5 tons',
    typicalUse: 'Large construction & commercial projects',
    recommendedProjects: [
      'Commercial construction',
      'Industrial cleanout',
      'Large-scale demolition',
      'Multi-unit renovation',
    ],
    popular: false,
  },
];

export function CompareSizesSection() {
  const { t } = useLanguage();
  const [selectedSizes, setSelectedSizes] = useState<number[]>([10, 20, 30]);

  const toggleSize = (yards: number) => {
    if (selectedSizes.includes(yards)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((s) => s !== yards));
      }
    } else {
      if (selectedSizes.length < 3) {
        setSelectedSizes([...selectedSizes, yards].sort((a, b) => a - b));
      } else {
        setSelectedSizes([...selectedSizes.slice(1), yards].sort((a, b) => a - b));
      }
    }
  };

  const selectedDumpsters = DUMPSTER_SIZES.filter((d) => selectedSizes.includes(d.yards));

  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="heading-lg text-foreground mb-4">Compare Dumpster Sizes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select up to 3 sizes to compare side-by-side. Find the perfect fit for your project.
          </p>
        </div>

        {/* Size Selector Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {DUMPSTER_SIZES.map((size) => (
            <button
              key={size.yards}
              onClick={() => toggleSize(size.yards)}
              className={cn(
                'relative px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
                'border-2 focus:outline-none focus:ring-2 focus:ring-primary/50',
                selectedSizes.includes(size.yards)
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card text-foreground border-border hover:border-primary/50'
              )}
            >
              {size.yards} Yard
              {size.popular && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <Star className="w-2.5 h-2.5 text-white fill-white" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Popular Badge Legend */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-full text-sm text-amber-700 dark:text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Most Popular Choice</span>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {selectedDumpsters.map((dumpster) => (
            <div
              key={dumpster.yards}
              className={cn(
                'relative rounded-2xl border-2 p-6 transition-all duration-300',
                dumpster.popular
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              {/* Popular Badge */}
              {dumpster.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold uppercase tracking-wide">
                    <Star className="w-3 h-3 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Size Header */}
              <div className="text-center mb-6 pt-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-3">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-foreground">{dumpster.yards} Yard</h3>
                <p className="text-sm text-muted-foreground mt-1">{dumpster.dimensions}</p>
              </div>

              {/* Capacity */}
              <div className="mb-5 p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <Ruler className="w-4 h-4" />
                  Capacity
                </div>
                <p className="text-foreground font-semibold">{dumpster.capacity}</p>
                <p className="text-xs text-muted-foreground mt-1">Weight limit: {dumpster.weight}</p>
              </div>

              {/* Typical Use */}
              <div className="mb-5">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Wrench className="w-4 h-4" />
                  Typical Use
                </div>
                <p className="text-foreground">{dumpster.typicalUse}</p>
              </div>

              {/* Recommended Projects */}
              <div className="mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-3">Recommended Projects</p>
                <ul className="space-y-2">
                  {dumpster.recommendedProjects.map((project, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {project}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Button
                asChild
                variant={dumpster.popular ? 'default' : 'outline'}
                className="w-full"
              >
                <Link to={`/sizes#${dumpster.yards}-yard`}>
                  Choose {dumpster.yards} Yard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Not sure which size? We can help.</p>
          <Button asChild variant="outline" size="lg">
            <Link to="/sizes">
              View All Sizes & Pricing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
