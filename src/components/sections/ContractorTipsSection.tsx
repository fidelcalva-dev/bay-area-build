import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Scale, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tips = [
  {
    icon: Layers,
    title: 'Inert vs General',
    description: 'Keep concrete/dirt separate from mixed debris to avoid reclassification fees.',
  },
  {
    icon: Scale,
    title: 'Weight & Overage',
    description: 'Each size includes tonnage—excess weight is billed per ton.',
  },
  {
    icon: FileText,
    title: 'Permits',
    description: 'Street placement often requires a city permit. We can help point you in the right direction.',
  },
  {
    icon: AlertTriangle,
    title: 'Overfill Policy',
    description: 'Load must stay below the rim—overfilled dumpsters cannot be hauled.',
  },
];

interface ContractorTipsSectionProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function ContractorTipsSection({ variant = 'default', className = '' }: ContractorTipsSectionProps) {
  const isCompact = variant === 'compact';

  return (
    <section className={`section-padding ${isCompact ? 'bg-muted/50' : 'bg-muted'} ${className}`}>
      <div className="container-wide">
        <div className={`${isCompact ? 'flex flex-col lg:flex-row lg:items-center gap-8' : ''}`}>
          <div className={isCompact ? 'lg:w-1/3' : 'text-center mb-8'}>
            <h2 className={`${isCompact ? 'heading-md' : 'heading-lg'} text-foreground mb-2`}>
              Contractor Tips
            </h2>
            <p className="text-muted-foreground">
              Quick rules to avoid fees and keep your job moving.
            </p>
          </div>

          <div className={`${isCompact ? 'lg:w-2/3' : ''}`}>
            <div className={`grid ${isCompact ? 'grid-cols-2 lg:grid-cols-4 gap-3' : 'sm:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
              {tips.map((tip) => (
                <div 
                  key={tip.title} 
                  className={`bg-card rounded-xl border border-border ${isCompact ? 'p-3' : 'p-4'} hover:border-primary/30 transition-colors`}
                >
                  <div className={`flex items-center justify-center ${isCompact ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-primary/10 text-primary mb-2`}>
                    <tip.icon className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
                  </div>
                  <h3 className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-foreground mb-1`}>
                    {tip.title}
                  </h3>
                  <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground leading-snug`}>
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>

            <div className={`${isCompact ? 'mt-4' : 'mt-6 text-center'}`}>
              <Button asChild variant="outline" size={isCompact ? 'sm' : 'default'}>
                <Link to="/contractor-best-practices">
                  View Full Best Practices Guide
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
