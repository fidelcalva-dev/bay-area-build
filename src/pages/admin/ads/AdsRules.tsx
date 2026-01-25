import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Zap, Clock, TrendingUp, Package, DollarSign } from 'lucide-react';
import { getAdsRules, toggleRule } from '@/lib/adsService';
import { useToast } from '@/hooks/use-toast';

interface AdsRule {
  id: string;
  rule_name: string;
  rule_type: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  priority: number;
  is_active: boolean;
  last_triggered_at: string | null;
  trigger_count: number;
}

export default function AdsRules() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [rules, setRules] = useState<AdsRule[]>([]);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      setIsLoading(true);
      const data = await getAdsRules();
      setRules(data);
    } catch (error) {
      console.error('Failed to load rules:', error);
      toast({
        title: 'Error loading rules',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggle(ruleId: string, isActive: boolean) {
    try {
      await toggleRule(ruleId, isActive);
      toast({
        title: 'Rule updated',
        description: `Rule ${isActive ? 'enabled' : 'disabled'}`
      });
      loadRules();
    } catch (error) {
      toast({
        title: 'Failed to update rule',
        variant: 'destructive'
      });
    }
  }

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'time':
        return <Clock className="w-5 h-5 text-purple-500" />;
      case 'performance':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'budget':
        return <DollarSign className="w-5 h-5 text-orange-500" />;
      default:
        return <Zap className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatConditions = (conditions: Record<string, unknown>): string => {
    const parts: string[] = [];
    
    if (conditions.threshold !== undefined) {
      parts.push(`Threshold: ${conditions.threshold}`);
    }
    if (conditions.utilization_threshold !== undefined) {
      parts.push(`Utilization: ${conditions.utilization_threshold}%`);
    }
    if (conditions.cpa_threshold !== undefined) {
      parts.push(`CPA: $${conditions.cpa_threshold}`);
    }
    if (conditions.start_hour !== undefined && conditions.end_hour !== undefined) {
      parts.push(`Hours: ${conditions.start_hour}:00 - ${conditions.end_hour}:00`);
    }
    
    return parts.join(' · ') || JSON.stringify(conditions);
  };

  const formatActions = (actions: Record<string, unknown>): string => {
    if (actions.action === 'pause_campaigns') {
      return `Pause campaigns (${actions.reason})`;
    }
    if (actions.action === 'switch_messaging_tier') {
      return `Switch to ${actions.tier} messaging`;
    }
    if (actions.action === 'create_alert') {
      return `Create ${actions.severity} alert`;
    }
    if (actions.action === 'reduce_bids') {
      return `Reduce bids by ${actions.percentage}%`;
    }
    return JSON.stringify(actions);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Automation Rules</h1>
        <p className="text-muted-foreground">
          Dynamic rules that control campaign behavior based on inventory, time, and performance
        </p>
      </div>

      {/* Rules Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">How Rules Work</p>
              <p className="text-sm text-blue-700">
                Rules are evaluated automatically during capacity checks. When conditions are met, 
                the specified actions are executed. Rules are processed in priority order.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <div className="grid gap-4">
        {rules.map(rule => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRuleIcon(rule.rule_type)}
                  <div>
                    <CardTitle className="text-lg">{rule.rule_name}</CardTitle>
                    <CardDescription>
                      Priority {rule.priority} · Triggered {rule.trigger_count} times
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="capitalize">
                    {rule.rule_type}
                  </Badge>
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) => handleToggle(rule.id, checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Conditions
                  </p>
                  <p className="text-sm">{formatConditions(rule.conditions)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Actions
                  </p>
                  <p className="text-sm">{formatActions(rule.actions)}</p>
                </div>
              </div>
              {rule.last_triggered_at && (
                <p className="text-xs text-muted-foreground mt-3">
                  Last triggered: {new Date(rule.last_triggered_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Built-in Rules Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Package className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Inventory Rules</p>
                <p className="text-muted-foreground">
                  Control campaigns based on available dumpster count and yard utilization.
                  Pause when inventory is low, switch to premium messaging when utilization is high.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Time Rules</p>
                <p className="text-muted-foreground">
                  Adjust bidding and ad extensions based on time of day and day of week.
                  Reduce bids after hours, pause call extensions when office is closed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Performance Rules</p>
                <p className="text-muted-foreground">
                  Monitor CPA, conversion rates, and ROAS. Create alerts when metrics exceed
                  thresholds, pause underperforming keywords automatically.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Budget Rules</p>
                <p className="text-muted-foreground">
                  Enforce daily and monthly budget caps. Alert when approaching limits,
                  require approval for budget increases beyond thresholds.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
