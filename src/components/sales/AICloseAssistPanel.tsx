// AI Close Assist Panel Component

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Phone, 
  Mail, 
  MessageSquare, 
  Copy, 
  Send, 
  Sparkles,
  Target,
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useSalesAIConfig, 
  useSalesAIInsight, 
  useSalesAIDrafts, 
  useSalesAIAnalyze,
  useLogCopyAudit,
  useUpdateDraftStatus
} from '@/hooks/useSalesAI';
import type { SalesAIAnalyzeRequest } from '@/types/salesAI';

interface AICloseAssistPanelProps {
  leadId: string;
  entityType: 'LEAD' | 'QUOTE' | 'ORDER';
  entityId: string;
  leadData?: {
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    zip?: string;
    city?: string;
    source_key?: string;
    notes?: string;
    message_excerpt?: string;
  };
  quoteData?: {
    material_category?: string;
    size_value?: number;
    subtotal?: number;
    customer_type?: string;
    is_heavy_material?: boolean;
  };
  userRole?: string;
}

export function AICloseAssistPanel({
  leadId,
  entityType,
  entityId,
  leadData,
  quoteData,
  userRole = 'sales',
}: AICloseAssistPanelProps) {
  const [activeTab, setActiveTab] = useState('insight');

  const { data: config } = useSalesAIConfig();
  const { data: insight, isLoading: insightLoading } = useSalesAIInsight(leadId);
  const { data: drafts = [] } = useSalesAIDrafts(leadId);
  const analyzeMutation = useSalesAIAnalyze();
  const logCopyMutation = useLogCopyAudit();
  const updateDraftMutation = useUpdateDraftStatus();

  const handleAnalyze = () => {
    const messages: string[] = [];
    if (leadData?.message_excerpt) messages.push(`Customer: ${leadData.message_excerpt}`);
    if (leadData?.notes) messages.push(`Notes: ${leadData.notes}`);

    const request: SalesAIAnalyzeRequest = {
      lead_id: leadId,
      entity_type: entityType,
      entity_id: entityId,
      messages,
      source_channel: leadData?.source_key,
      zip: leadData?.zip,
      market: leadData?.city,
      material_category: quoteData?.material_category,
      size_yd: quoteData?.size_value,
      customer_type: quoteData?.customer_type || 'homeowner',
      is_heavy: quoteData?.is_heavy_material,
      quote_price: quoteData?.subtotal,
      user_role: userRole,
    };

    analyzeMutation.mutate(request);
  };

  const handleCopy = async (content: string, label: string) => {
    await navigator.clipboard.writeText(content);
    toast.success(`${label} copied to clipboard`);
    logCopyMutation.mutate({
      leadId,
      entityType,
      entityId,
      content,
    });
  };

  const handleMarkSent = (draftId: string) => {
    updateDraftMutation.mutate({ draftId, status: 'SENT', leadId });
  };

  const handleDiscard = (draftId: string) => {
    updateDraftMutation.mutate({ draftId, status: 'DISCARDED', leadId });
  };

  if (!config?.enabled) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6 text-center text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>AI Close Assist is disabled</p>
        </CardContent>
      </Card>
    );
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 70) return 'default';
    if (score >= 40) return 'secondary';
    return 'outline';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-primary" />
            AI Close Assist
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={config.mode === 'LIVE' ? 'default' : 'secondary'} className="text-xs">
              {config.mode}
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending}
            >
              {analyzeMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="ml-1.5">{insight ? 'Refresh' : 'Analyze'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {insightLoading || analyzeMutation.isPending ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !insight ? (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click Analyze to get AI insights</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="insight">Insights</TabsTrigger>
              <TabsTrigger value="scripts">Scripts</TabsTrigger>
              <TabsTrigger value="offer">Offer</TabsTrigger>
            </TabsList>

            <TabsContent value="insight" className="space-y-4 mt-4">
              {/* Scores Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Intent</p>
                    <p className={`text-lg font-semibold ${getScoreColor(insight.intent_score)}`}>
                      {insight.intent_score}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Urgency</p>
                    <p className={`text-lg font-semibold ${getScoreColor(insight.urgency_score)}`}>
                      {insight.urgency_score}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Value</p>
                    <p className={`text-lg font-semibold ${getScoreColor(insight.value_score)}`}>
                      {insight.value_score}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Churn Risk</p>
                    <p className={`text-lg font-semibold ${getScoreColor(100 - insight.churn_risk_score)}`}>
                      {insight.churn_risk_score}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Action */}
              <div className="p-3 rounded-lg border bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Recommended Action</span>
                </div>
                <Badge variant="default" className="text-sm">
                  {insight.recommended_next_action === 'CALL' && <Phone className="h-3 w-3 mr-1" />}
                  {insight.recommended_next_action === 'SMS' && <MessageSquare className="h-3 w-3 mr-1" />}
                  {insight.recommended_next_action === 'EMAIL' && <Mail className="h-3 w-3 mr-1" />}
                  {insight.recommended_next_action}
                </Badge>
              </div>

              {/* Objections */}
              {insight.objections_json && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Detected Objections</p>
                  <div className="flex flex-wrap gap-2">
                    {insight.objections_json.price && (
                      <Badge variant="outline" className="text-amber-600">Price</Badge>
                    )}
                    {insight.objections_json.schedule && (
                      <Badge variant="outline" className="text-amber-600">Schedule</Badge>
                    )}
                    {insight.objections_json.size && (
                      <Badge variant="outline" className="text-amber-600">Size</Badge>
                    )}
                    {insight.objections_json.rules && (
                      <Badge variant="outline" className="text-amber-600">Rules</Badge>
                    )}
                    {insight.objections_json.trust && (
                      <Badge variant="outline" className="text-amber-600">Trust</Badge>
                    )}
                    {!insight.objections_json.price && 
                     !insight.objections_json.schedule && 
                     !insight.objections_json.size && 
                     !insight.objections_json.rules && 
                     !insight.objections_json.trust && (
                      <Badge variant="outline" className="text-green-600">None detected</Badge>
                    )}
                  </div>
                  {insight.objections_json.notes?.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.objections_json.notes.join('. ')}
                    </p>
                  )}
                </div>
              )}

              {/* Reasoning */}
              {insight.reasoning && (
                <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">AI Reasoning</p>
                  {insight.reasoning}
                </div>
              )}
            </TabsContent>

            <TabsContent value="scripts" className="space-y-4 mt-4">
              {/* Short Close Script */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    Short Close (SMS)
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(insight.recommended_script_json.short_close, 'SMS script')}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  {insight.recommended_script_json.short_close}
                </div>
              </div>

              <Separator />

              {/* Clarify Close Script */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    Clarify + Close (Email)
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(insight.recommended_script_json.clarify_close, 'Email script')}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
                  {insight.recommended_script_json.clarify_close}
                </div>
              </div>

              {/* Drafts */}
              {drafts.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Saved Drafts</p>
                    <ScrollArea className="h-[150px]">
                      {drafts.map((draft) => (
                        <div 
                          key={draft.id} 
                          className="p-2 rounded border mb-2 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {draft.channel} - {draft.draft_type}
                            </Badge>
                            <div className="flex gap-1">
                              {config.mode === 'LIVE' && config.send_enabled && userRole === 'sales' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2"
                                  onClick={() => handleMarkSent(draft.id)}
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-muted-foreground"
                                onClick={() => handleDiscard(draft.id)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {draft.draft_body}
                          </p>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="offer" className="space-y-4 mt-4">
              {insight.recommended_offer_json && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={insight.recommended_offer_json.allowed ? 'default' : 'secondary'}
                      className="text-sm"
                    >
                      {insight.recommended_offer_json.allowed ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {insight.recommended_offer_json.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium mb-1">Suggested Offer</p>
                    <p className="text-sm text-muted-foreground">
                      {insight.recommended_offer_json.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-dashed">
                    <p className="text-xs text-muted-foreground">
                      <strong>Why:</strong> {insight.recommended_offer_json.reason}
                    </p>
                  </div>

                  {!insight.recommended_offer_json.allowed && (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-sm">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      This offer requires manager approval based on current tier/limits.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
