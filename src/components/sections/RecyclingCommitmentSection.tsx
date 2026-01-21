import { Recycle, Leaf, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  WHAT_WE_DO, 
  RECYCLABLE_MATERIALS, 
  RECYCLING_PROCESS,
  GREEN_WASTE_INFO,
  METAL_RECYCLING_INFO,
  RECYCLING_DISCLAIMER,
  GREEN_HALO_NOTE 
} from '@/data/recycling';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';

export function RecyclingCommitmentSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <div className="container-wide">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600/10 rounded-full text-sm font-medium text-green-700 dark:text-green-400 mb-4">
            <Recycle className="w-4 h-4" />
            Environmentally responsible hauling
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            {RECYCLING_PROCESS.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {RECYCLING_PROCESS.mainStatement}
          </p>
        </AnimatedSection>

        {/* What We Do Grid */}
        <StaggeredContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {WHAT_WE_DO.map((item) => (
            <AnimatedItem key={item.id} variant="fadeUp">
              <div className="bg-card p-6 rounded-xl border border-border h-full">
                <div className="w-12 h-12 rounded-xl bg-green-600/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>

        {/* Process Steps */}
        <AnimatedSection className="mb-12">
          <h3 className="text-xl font-bold text-foreground text-center mb-8">How Recycling Works</h3>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-4 md:gap-2">
            {RECYCLING_PROCESS.steps.map((step, index) => (
              <div key={step.step} className="flex items-center gap-2">
                <div className="flex items-center gap-3 bg-card px-4 py-3 rounded-xl border border-border">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">{step.title}</div>
                    <div className="text-xs text-muted-foreground hidden lg:block">{step.description}</div>
                  </div>
                </div>
                {index < RECYCLING_PROCESS.steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Materials Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Recyclable Materials */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="font-semibold text-foreground mb-4">Materials Commonly Recycled</h3>
            <div className="flex flex-wrap gap-2">
              {RECYCLABLE_MATERIALS.map((material) => (
                <span 
                  key={material.name}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    material.category === 'heavy' 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      : material.category === 'organic'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}
                >
                  {material.name}
                </span>
              ))}
            </div>
          </div>

          {/* Green Waste & Metals */}
          <div className="space-y-4">
            <div className="bg-card p-5 rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">{GREEN_WASTE_INFO.title}</h4>
                  <p className="text-sm text-muted-foreground">{GREEN_WASTE_INFO.description}</p>
                </div>
              </div>
            </div>
            <div className="bg-card p-5 rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <Recycle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">{METAL_RECYCLING_INFO.title}</h4>
                  <p className="text-sm text-muted-foreground">{METAL_RECYCLING_INFO.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Green Halo CTA */}
        <AnimatedSection className="bg-card p-6 md:p-8 rounded-2xl border border-green-200 dark:border-green-800/50 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-green-600/10 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <div className="inline-block px-2 py-0.5 bg-green-600/10 rounded text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
                  {GREEN_HALO_NOTE.label}
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1">{GREEN_HALO_NOTE.title}</h3>
                <p className="text-muted-foreground">{GREEN_HALO_NOTE.description}</p>
              </div>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
              <Link to="/green-halo">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </AnimatedSection>

        {/* Disclaimer */}
        <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto italic">
          {RECYCLING_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}
