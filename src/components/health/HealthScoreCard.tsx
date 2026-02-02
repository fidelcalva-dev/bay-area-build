import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HealthBadge, HealthScoreDisplay } from './HealthBadge';
import { 
  getCustomerHealthScore, 
  recalculateHealthScore,
  type CustomerHealthScore,
  type HealthDriver 
} from '@/lib/customerHealthService';
import { cn } from '@/lib/utils';

interface HealthScoreCardProps {
  customerId: string;
  compact?: boolean;
  className?: string;
}

export function HealthScoreCard({ customerId, compact = false, className }: HealthScoreCardProps) {
  const [health, setHealth] = useState<CustomerHealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadHealth();
  }, [customerId]);

  async function loadHealth() {
    setIsLoading(true);
    const data = await getCustomerHealthScore(customerId);
    setHealth(data);
    setIsLoading(false);
  }

  async function handleRecalculate() {
    setIsRecalculating(true);
    await recalculateHealthScore(customerId);
    await loadHealth();
    setIsRecalculating(false);
  }

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="h-12 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center text-muted-foreground">
          <Info className="w-5 h-5 mx-auto mb-2" />
          <p className="text-sm">No health score available</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={handleRecalculate}
            disabled={isRecalculating}
          >
            {isRecalculating ? 'Calculating...' : 'Calculate Score'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <HealthScoreDisplay score={health.score} status={health.status} size="sm" />
        <div>
          <HealthBadge status={health.status} size="sm" />
          <p className="text-xs text-muted-foreground mt-0.5">
            Updated {new Date(health.last_updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  const positiveDrivers = (health.positive_drivers || []) as HealthDriver[];
  const negativeDrivers = (health.negative_drivers || []) as HealthDriver[];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Customer Health</CardTitle>
            <CardDescription>
              Last updated {new Date(health.last_updated_at).toLocaleString()}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRecalculate}
            disabled={isRecalculating}
            title="Recalculate score"
          >
            <RefreshCw className={cn('w-4 h-4', isRecalculating && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <HealthScoreDisplay score={health.score} status={health.status} size="lg" />
          <div>
            <HealthBadge status={health.status} showScore size="md" />
            <div className="text-sm text-muted-foreground mt-1">
              {health.status === 'GREEN' && 'This customer is in good standing'}
              {health.status === 'AMBER' && 'This customer needs attention'}
              {health.status === 'RED' && 'This customer requires immediate review'}
            </div>
          </div>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span>Why this score?</span>
              <Info className="w-4 h-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {positiveDrivers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-1.5 text-green-700 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Positive Factors
                </h4>
                <ul className="space-y-1">
                  {positiveDrivers.map((driver, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span>{driver.driver}</span>
                      <span className="text-green-600 font-medium ml-auto">{driver.impact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {negativeDrivers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-1.5 text-red-700 mb-2">
                  <TrendingDown className="w-4 h-4" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {negativeDrivers.map((driver, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      <span>{driver.driver}</span>
                      <span className="text-red-600 font-medium ml-auto">{driver.impact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {positiveDrivers.length === 0 && negativeDrivers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No detailed breakdown available yet
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
