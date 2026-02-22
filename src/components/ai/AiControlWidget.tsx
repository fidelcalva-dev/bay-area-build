import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { 
  Brain, X, Send, RefreshCw, CheckCircle2, XCircle, 
  AlertTriangle, BookOpen, Search, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAiControlBrain, type AiMode } from '@/hooks/useAiControlBrain';

const MODE_LABELS: Record<AiMode, string> = {
  SALES: 'Sales Mode',
  DISPATCH: 'Dispatch Mode',
  FINANCE: 'Finance Mode',
  CS: 'CS Mode',
  ADMIN: 'Admin Mode',
  DRIVER: 'Driver Mode',
  MAINTENANCE: 'Maintenance Mode',
};

const QUICK_PROMPTS: Record<AiMode, string[]> = {
  SALES: [
    'Summarize this lead',
    'Best next action',
    'Write follow-up SMS',
    'Check pricing for this ZIP',
  ],
  DISPATCH: [
    'Best facility for this load',
    'Risk of overweight',
    'Route summary',
    'Swap timing recommendation',
  ],
  FINANCE: [
    'Margin check',
    'What is missing to bill',
    'Approval required?',
    'Overage calculation',
  ],
  CS: [
    'Order status summary',
    'Billing readiness check',
    'Extension policy',
    'Escalation needed?',
  ],
  ADMIN: [
    'System health check',
    'How do I create a run?',
    'What is the overage policy?',
    'Heavy material rules',
  ],
  DRIVER: [
    'My next stop',
    'Facility rules',
    'Report issue',
    'Live load procedure',
  ],
  MAINTENANCE: [
    'Inspection checklist',
    'Asset status',
    'Maintenance schedule',
    'Report damage',
  ],
};

export default function AiControlWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    pendingActions,
    knowledge,
    knowledgeLoading,
    mode,
    sendMessage,
    handleAction,
    searchKnowledge,
    clearSession,
  } = useAiControlBrain();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleKnowledgeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchKnowledge(knowledgeSearch.trim() || undefined);
  };

  const activePendingActions = pendingActions.filter(a => !a.status || a.status === 'SUGGESTED');

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open AI Assistant"
        >
          <Brain className="w-5 h-5" />
          {activePendingActions.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {activePendingActions.length}
            </span>
          )}
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-h-[600px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-foreground" />
              <span className="text-sm font-semibold text-foreground">AI Control Brain</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {MODE_LABELS[mode]}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearSession} title="New session">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="assistant" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-3 mt-2 grid grid-cols-3 h-8">
              <TabsTrigger value="assistant" className="text-xs">Assistant</TabsTrigger>
              <TabsTrigger value="actions" className="text-xs relative">
                Actions
                {activePendingActions.length > 0 && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] inline-flex items-center justify-center">
                    {activePendingActions.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="howto" className="text-xs">How-To</TabsTrigger>
            </TabsList>

            {/* Assistant Tab */}
            <TabsContent value="assistant" className="flex-1 flex flex-col min-h-0 m-0 p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground text-center">
                      Ask anything about your current workflow.
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUICK_PROMPTS[mode].map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleQuickPrompt(prompt)}
                          className="text-left text-xs px-2.5 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'text-sm',
                      msg.role === 'user'
                        ? 'ml-8 bg-primary text-primary-foreground rounded-xl rounded-br-sm px-3 py-2'
                        : 'mr-4 bg-muted rounded-xl rounded-bl-sm px-3 py-2 text-foreground'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Risk Flags */}
                    {msg.riskFlags && msg.riskFlags.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.riskFlags.map((flag, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex items-start gap-1.5 text-xs p-1.5 rounded',
                              flag.severity === 'HIGH' ? 'bg-destructive/10 text-destructive' :
                              flag.severity === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-700' :
                              'bg-muted text-muted-foreground'
                            )}
                          >
                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>{flag.reason}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Confidence */}
                    {msg.confidence !== undefined && msg.role === 'assistant' && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Confidence: {Math.round(msg.confidence * 100)}%
                      </p>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="mr-4 bg-muted rounded-xl rounded-bl-sm px-3 py-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="px-3 pb-3 pt-1 border-t border-border">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the AI Brain..."
                    className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={isLoading || !input.trim()}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 text-center">DRY_RUN mode -- suggestions only</p>
              </form>
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="flex-1 overflow-y-auto m-0 p-0 px-4 py-3">
              {pendingActions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No suggested actions yet. Start a conversation to get recommendations.
                </p>
              ) : (
                <div className="space-y-2">
                  {pendingActions.map((action, i) => (
                    <div
                      key={action.id || i}
                      className={cn(
                        'border border-border rounded-lg p-3 space-y-2',
                        action.status === 'CONFIRMED' ? 'bg-green-500/5 border-green-500/20' :
                        action.status === 'REJECTED' ? 'bg-muted/50 opacity-60' : ''
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-foreground">{action.label}</p>
                          <Badge variant="outline" className="text-[10px] mt-1">{action.type}</Badge>
                        </div>
                        {action.status && action.status !== 'SUGGESTED' ? (
                          <Badge variant={action.status === 'CONFIRMED' ? 'default' : 'secondary'} className="text-[10px]">
                            {action.status}
                          </Badge>
                        ) : action.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => action.id && handleAction(action.id, 'CONFIRMED')}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              onClick={() => action.id && handleAction(action.id, 'REJECTED')}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* How-To Tab */}
            <TabsContent value="howto" className="flex-1 overflow-y-auto m-0 p-0">
              <form onSubmit={handleKnowledgeSearch} className="px-4 pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={knowledgeSearch}
                      onChange={(e) => setKnowledgeSearch(e.target.value)}
                      placeholder="Search SOPs, policies..."
                      className="w-full bg-muted rounded-lg pl-8 pr-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <Button type="submit" size="sm" variant="secondary" className="h-8" disabled={knowledgeLoading}>
                    Search
                  </Button>
                </div>
              </form>

              <div className="px-4 pb-3 space-y-2">
                {/* Category shortcuts */}
                {knowledge.length === 0 && !knowledgeLoading && (
                  <div className="space-y-1">
                    {['CRM_HOWTO', 'SALES_PLAYBOOK', 'DISPATCH_RULES', 'BILLING_RULES', 'HEAVY_RULES', 'PRICING_POLICY'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setKnowledgeSearch(cat);
                          searchKnowledge(cat);
                        }}
                        className="w-full flex items-center justify-between text-left text-xs px-3 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-foreground font-medium">{cat.replace(/_/g, ' ')}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}

                {knowledgeLoading && (
                  <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
                )}

                {knowledge.map(article => (
                  <details key={article.id} className="border border-border rounded-lg group">
                    <summary className="px-3 py-2.5 text-xs font-medium text-foreground cursor-pointer hover:bg-muted/50 rounded-lg list-none flex items-center justify-between">
                      <div>
                        <p>{article.title}</p>
                        <Badge variant="outline" className="text-[10px] mt-0.5">{article.category}</Badge>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-3 pb-3 text-xs text-muted-foreground whitespace-pre-wrap border-t border-border pt-2">
                      {article.content_markdown}
                    </div>
                  </details>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}
