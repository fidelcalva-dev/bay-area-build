import { useState, useEffect } from 'react';
import { 
  Brain, 
  MessageSquare, 
  Copy, 
  Check, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCallCoaching } from '@/hooks/useCallAI';
import { cn } from '@/lib/utils';
import type { SuggestedResponse } from '@/types/callAI';

interface LiveCoachPanelProps {
  callId: string;
  isActive?: boolean;
  onCreateQuote?: (data: { zip?: string; material?: string; size?: number }) => void;
}

export function LiveCoachPanel({ callId, isActive = false, onCreateQuote }: LiveCoachPanelProps) {
  const { coachingState, isAnalyzing, refresh, finalizeCall, updateFollowupStatus } = useCallCoaching(callId);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  // Auto-refresh during active call
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      refresh();
    }, 10000); // Refresh every 10 seconds during active call

    return () => clearInterval(interval);
  }, [isActive, refresh]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number | null): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score === null) return 'outline';
    if (score >= 70) return 'default';
    if (score >= 40) return 'secondary';
    return 'destructive';
  };

  const { insight, recentSegments, followups, isLive } = coachingState;

  const handleFinalizeCall = async () => {
    await finalizeCall(callId);
    refresh();
  };

  const handleCreateQuote = () => {
    if (onCreateQuote && insight) {
      onCreateQuote({
        zip: insight.detected_zip_code || undefined,
        material: insight.detected_material_category || undefined,
        size: insight.detected_size_preference || undefined,
      });
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300",
      isLive && "border-green-500/50 bg-green-50/30 dark:bg-green-950/10"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Coach
            {isLive && (
              <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                LIVE
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={isAnalyzing}>
            <RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={getScoreBadgeVariant(insight?.intent_score ?? null)} className="gap-1">
            <TrendingUp className="w-3 h-3" />
            Intent: {insight?.intent_score ?? '--'}%
          </Badge>
          <Badge variant={getScoreBadgeVariant(insight?.urgency_score ?? null)} className="gap-1">
            <Clock className="w-3 h-3" />
            Urgency: {insight?.urgency_score ?? '--'}%
          </Badge>
          {(insight?.churn_risk_score ?? 0) > 50 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" />
              Churn Risk: {insight?.churn_risk_score}%
            </Badge>
          )}
        </div>

        {/* Detected Info */}
        {(insight?.detected_zip_code || insight?.detected_material_category || insight?.detected_size_preference) && (
          <div className="flex gap-2 flex-wrap text-sm">
            {insight.detected_zip_code && (
              <Badge variant="outline">ZIP: {insight.detected_zip_code}</Badge>
            )}
            {insight.detected_material_category && (
              <Badge variant="outline">{insight.detected_material_category}</Badge>
            )}
            {insight.detected_size_preference && (
              <Badge variant="outline">{insight.detected_size_preference}yd</Badge>
            )}
          </div>
        )}

        {/* Objections */}
        {insight?.objection_tags_json && insight.objection_tags_json.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Detected Objections</p>
            <div className="flex gap-1 flex-wrap">
              {insight.objection_tags_json.map((objection, i) => (
                <Badge key={i} variant="secondary" className="text-xs capitalize">
                  {objection}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Risk Flags */}
        {insight?.risk_flags_json && insight.risk_flags_json.length > 0 && (
          <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-md">
            <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 text-xs font-medium mb-1">
              <AlertTriangle className="w-3 h-3" />
              Compliance Flags
            </div>
            <div className="flex gap-1 flex-wrap">
              {insight.risk_flags_json.map((flag, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-amber-100 text-amber-800">
                  {flag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Next Best Action */}
        {insight?.next_best_action && (
          <div className="p-2 bg-primary/5 rounded-md">
            <p className="text-xs font-medium text-muted-foreground mb-1">Recommended Action</p>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium capitalize">
                {insight.next_best_action.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        )}

        <Tabs defaultValue="responses" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-8">
            <TabsTrigger value="responses" className="text-xs">Responses</TabsTrigger>
            <TabsTrigger value="transcript" className="text-xs">Transcript</TabsTrigger>
            <TabsTrigger value="followup" className="text-xs">Follow-up</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="mt-2">
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {insight?.suggested_responses_json?.map((response: SuggestedResponse, i: number) => (
                  <div key={i} className="p-2 bg-muted/50 rounded-md group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Badge variant="outline" className="text-[10px] mb-1 capitalize">
                          {response.type}
                        </Badge>
                        <p className="text-sm">{response.text}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(response.text, `response-${i}`)}
                      >
                        {copiedId === `response-${i}` ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                {(!insight?.suggested_responses_json || insight.suggested_responses_json.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No suggestions yet. Responses will appear as the conversation progresses.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="transcript" className="mt-2">
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {recentSegments.length > 0 ? (
                  recentSegments.map((segment, i) => (
                    <div key={i} className="text-sm p-2 bg-muted/30 rounded">
                      <span className="text-xs text-muted-foreground">
                        {segment.speaker || 'Speaker'}:
                      </span>
                      <p>{segment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Transcript will appear here during the call.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="followup" className="mt-2">
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {followups.map((followup) => (
                  <div key={followup.id} className="p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        {followup.channel}
                      </Badge>
                      <Badge 
                        variant={followup.status === 'SENT' ? 'default' : followup.status === 'DISCARDED' ? 'secondary' : 'outline'}
                        className="text-[10px]"
                      >
                        {followup.status}
                      </Badge>
                    </div>
                    {followup.subject && (
                      <p className="text-xs font-medium mb-1">{followup.subject}</p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {followup.draft_body}
                    </p>
                    {followup.status === 'DRAFT' && (
                      <div className="flex gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => copyToClipboard(followup.draft_body, followup.id)}
                        >
                          {copiedId === followup.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-destructive"
                          onClick={() => updateFollowupStatus(followup.id, 'DISCARDED')}
                        >
                          Discard
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {followups.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Follow-up drafts will be generated when the call ends.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Summary Bullets (After Call) */}
        {insight?.summary_bullets && insight.summary_bullets.length > 0 && (
          <Collapsible open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-xs">Call Summary</span>
                {isTranscriptOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <ul className="text-sm space-y-1 list-disc list-inside">
                {insight.summary_bullets.map((bullet, i) => (
                  <li key={i} className="text-muted-foreground">{bullet}</li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {isLive ? (
            <Button variant="outline" size="sm" className="flex-1" onClick={handleFinalizeCall}>
              End & Generate Summary
            </Button>
          ) : (
            <>
              {onCreateQuote && insight?.detected_zip_code && (
                <Button variant="default" size="sm" className="flex-1" onClick={handleCreateQuote}>
                  Create Quote
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
