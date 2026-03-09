import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, AlertTriangle, CheckCircle2, ArrowRight, ListTodo, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CopilotType = 'SALES' | 'CS' | 'DISPATCH' | 'DRIVER' | 'FLEET' | 'FINANCE' | 'SEO' | 'ADMIN';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actionLabel?: string;
  entityType?: string;
  entityId?: string;
}

interface Warning {
  id: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface CopilotConfig {
  type: CopilotType;
  title: string;
  description: string;
  capabilities: string[];
  summaryCards: SummaryCard[];
}

interface SummaryCard {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

interface CopilotDashboardProps {
  config: CopilotConfig;
  recommendations?: Recommendation[];
  warnings?: Warning[];
  summaryCards?: SummaryCard[];
  isAnalyzing?: boolean;
  onRunAnalysis: () => void;
  onCreateTask?: (rec: Recommendation) => void;
  children?: React.ReactNode;
}

const priorityColors: Record<string, string> = {
  HIGH: 'bg-destructive/10 text-destructive border-destructive/20',
  MEDIUM: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  LOW: 'bg-muted text-muted-foreground border-border',
};

export default function CopilotDashboard({
  config,
  recommendations = [],
  warnings = [],
  summaryCards,
  isAnalyzing = false,
  onRunAnalysis,
  onCreateTask,
  children,
}: CopilotDashboardProps) {
  const cards = summaryCards || config.summaryCards;

  const handleCreateTask = async (rec: Recommendation) => {
    if (onCreateTask) {
      onCreateTask(rec);
      return;
    }
    // Log event
    try {
      await supabase.from('ai_control_events').insert({
        copilot_type: config.type,
        action_type: 'CREATE_TASK',
        prompt_summary: rec.title,
        recommendation_summary: rec.description,
      });
      toast.success('Task created from recommendation');
    } catch {
      toast.error('Failed to create task');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            {config.title}
          </h1>
          <p className="text-muted-foreground mt-1">{config.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">DRY_RUN</Badge>
          <Button onClick={onRunAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {cards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Warnings & Risks ({warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {warnings.map(w => (
              <div key={w.id} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className={`text-[10px] shrink-0 ${priorityColors[w.severity]}`}>
                  {w.severity}
                </Badge>
                <span>{w.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Recommended Actions ({recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map(rec => (
              <div key={rec.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-[10px] ${priorityColors[rec.priority]}`}>
                      {rec.priority}
                    </Badge>
                    <span className="font-medium text-sm">{rec.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreateTask(rec)}
                    className="text-xs"
                  >
                    <ListTodo className="h-3 w-3 mr-1" />
                    Create Task
                  </Button>
                  {rec.actionLabel && (
                    <Button size="sm" className="text-xs">
                      {rec.actionLabel}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Capabilities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Capabilities</CardTitle>
          <CardDescription>What this copilot can help with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {config.capabilities.map((cap, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                {cap}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom children (extra panels) */}
      {children}
    </div>
  );
}
