import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, RefreshCw, Brain, AlertTriangle, 
  CheckCircle, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useMasterAI } from '@/hooks/useMasterAI';
import { cn } from '@/lib/utils';

interface AIAction {
  id: string;
  action_type: string;
  status: string;
  request_json: Record<string, unknown>;
  result_json: Record<string, unknown>;
  created_at: string;
}

interface AIDecision {
  id: string;
  job_id: string;
  decision_type: string;
  severity: string;
  entity_type: string;
  entity_id?: string;
  summary: string;
  recommendation?: string;
  actions_json: unknown[];
  requires_approval: boolean;
  created_at: string;
  ai_actions?: AIAction[];
}

const severityConfig: Record<string, { color: string; icon: React.ElementType }> = {
  LOW: { color: 'bg-muted text-muted-foreground', icon: Info },
  MED: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  HIGH: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  CRITICAL: { color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle },
};

export default function MasterAIDecisions() {
  const { toast } = useToast();
  const { fetchDecisions } = useMasterAI();
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadDecisions = async (severity?: string) => {
    setIsLoading(true);
    try {
      const data = await fetchDecisions(severity === 'all' ? undefined : severity, 100);
      setDecisions(data as AIDecision[]);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load decisions', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDecisions(activeTab);
  }, [activeTab]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <NavLink to="/admin/master-ai">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </NavLink>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Decisions
          </h1>
          <p className="text-muted-foreground">Complete decision audit log</p>
        </div>
        <Button variant="outline" onClick={() => loadDecisions(activeTab)}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="CRITICAL">Critical</TabsTrigger>
          <TabsTrigger value="HIGH">High</TabsTrigger>
          <TabsTrigger value="MED">Medium</TabsTrigger>
          <TabsTrigger value="LOW">Low</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Decision Log</CardTitle>
              <CardDescription>
                {decisions.length} decision{decisions.length !== 1 ? 's' : ''} recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : decisions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No decisions found</p>
              ) : (
                <div className="space-y-3">
                  {decisions.map((decision) => {
                    const SeverityIcon = severityConfig[decision.severity]?.icon || Info;
                    const isExpanded = expandedId === decision.id;
                    
                    return (
                      <Collapsible 
                        key={decision.id}
                        open={isExpanded}
                        onOpenChange={(open) => setExpandedId(open ? decision.id : null)}
                      >
                        <div className="rounded-lg border bg-card">
                          <CollapsibleTrigger asChild>
                            <div className="flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className={cn(
                                'p-2 rounded-full shrink-0',
                                severityConfig[decision.severity]?.color || 'bg-muted'
                              )}>
                                <SeverityIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline">{decision.decision_type}</Badge>
                                  <Badge className={severityConfig[decision.severity]?.color}>
                                    {decision.severity}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {decision.entity_type}
                                    {decision.entity_id && ` #${decision.entity_id.slice(0, 8)}`}
                                  </span>
                                  {decision.requires_approval && (
                                    <Badge variant="destructive">Approval Required</Badge>
                                  )}
                                </div>
                                <p className="text-sm mt-1">{decision.summary}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(decision.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="px-4 pb-4 pt-0 border-t">
                              {decision.recommendation && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Recommendation
                                  </p>
                                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded">
                                    {decision.recommendation}
                                  </p>
                                </div>
                              )}
                              
                              {decision.ai_actions && decision.ai_actions.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Actions ({decision.ai_actions.length})
                                  </p>
                                  <div className="space-y-2">
                                    {decision.ai_actions.map((action) => (
                                      <div 
                                        key={action.id}
                                        className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm"
                                      >
                                        <Badge variant="outline" className="text-xs">
                                          {action.action_type}
                                        </Badge>
                                        <Badge 
                                          variant={action.status === 'EXECUTED' ? 'default' : 'secondary'}
                                          className="text-xs"
                                        >
                                          {action.status}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
