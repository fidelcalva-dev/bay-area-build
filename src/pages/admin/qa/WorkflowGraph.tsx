import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RefreshCw, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Phone,
  Users,
  FileText,
  CreditCard,
  Truck,
  Bot,
  Mail,
  Zap,
  Settings,
  Clock,
  Database,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSystemHealth, type HealthSeverity, type HealthIssue } from '@/hooks/useSystemHealth';
import { HealthStatusBadge, HealthRing } from '@/components/admin/qa/HealthStatusBadge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Node categories
const NODE_CATEGORIES = {
  TELEPHONY: { icon: Phone, color: 'bg-blue-100 text-blue-800', label: 'Telephony' },
  LEADS: { icon: Users, color: 'bg-green-100 text-green-800', label: 'Leads' },
  QUOTES: { icon: FileText, color: 'bg-purple-100 text-purple-800', label: 'Quotes' },
  BILLING: { icon: CreditCard, color: 'bg-yellow-100 text-yellow-800', label: 'Billing' },
  DISPATCH: { icon: Truck, color: 'bg-orange-100 text-orange-800', label: 'Dispatch' },
  MASTER_AI: { icon: Bot, color: 'bg-pink-100 text-pink-800', label: 'Master AI' },
  GOOGLE: { icon: Mail, color: 'bg-red-100 text-red-800', label: 'Google' },
  ADS: { icon: Zap, color: 'bg-indigo-100 text-indigo-800', label: 'Ads' },
  MESSAGING: { icon: Mail, color: 'bg-cyan-100 text-cyan-800', label: 'Messaging' },
  SECURITY: { icon: ShieldAlert, color: 'bg-rose-100 text-rose-800', label: 'Security' },
  CONFIG: { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Config' },
  CRON: { icon: Clock, color: 'bg-teal-100 text-teal-800', label: 'Cron' },
};

// Edge Functions Data with categories
const EDGE_FUNCTIONS = [
  { name: 'calls-inbound-handler', category: 'TELEPHONY', description: 'Handles incoming Twilio calls' },
  { name: 'calls-outbound-handler', category: 'TELEPHONY', description: 'Initiates outbound calls' },
  { name: 'calls-outbound-connect', category: 'TELEPHONY', description: 'TwiML for connected calls' },
  { name: 'calls-status-callback', category: 'TELEPHONY', description: 'Call status webhooks' },
  { name: 'calls-voicemail-handler', category: 'TELEPHONY', description: 'Voicemail processing' },
  { name: 'twilio-sms-webhook', category: 'TELEPHONY', description: 'SMS webhooks' },
  { name: 'send-otp', category: 'TELEPHONY', description: 'Send OTP for portal auth' },
  { name: 'verify-otp', category: 'TELEPHONY', description: 'Verify OTP codes' },
  { name: 'validate-session', category: 'TELEPHONY', description: 'Validate portal sessions' },
  { name: 'ghl-webhook-inbound', category: 'MESSAGING', description: 'GHL inbound messages/calls' },
  { name: 'ghl-send-outbound', category: 'MESSAGING', description: 'Send SMS/Email via GHL' },
  { name: 'highlevel-webhook', category: 'MESSAGING', description: 'GHL contact sync (public quotes)' },
  { name: 'lead-capture', category: 'LEADS', description: 'Generic lead capture' },
  { name: 'lead-omnichannel', category: 'LEADS', description: 'Unified lead ingestion' },
  { name: 'lead-from-quote', category: 'LEADS', description: 'Lead from quote' },
  { name: 'lead-from-phone', category: 'LEADS', description: 'Lead from phone call' },
  { name: 'lead-from-sms', category: 'LEADS', description: 'Lead from SMS' },
  { name: 'lead-from-meta', category: 'LEADS', description: 'Meta lead forms' },
  { name: 'lead-from-google-ads', category: 'LEADS', description: 'Google Ads leads' },
  { name: 'lead-manual-add', category: 'LEADS', description: 'Manual lead creation' },
  { name: 'lead-ai-classify', category: 'LEADS', description: 'AI lead classification' },
  { name: 'lead-export', category: 'LEADS', description: 'Export leads' },
  { name: 'ai-chat-lead', category: 'LEADS', description: 'AI chat qualification' },
  { name: 'ai-sales-chat', category: 'LEADS', description: 'Bilingual sales assistant' },
  { name: 'save-quote', category: 'QUOTES', description: 'Save quote to DB' },
  { name: 'quote-ai-recommend', category: 'QUOTES', description: 'AI size recommendations' },
  { name: 'send-quote-summary', category: 'QUOTES', description: 'Send quote email/SMS' },
  { name: 'send-contract', category: 'QUOTES', description: 'Send e-signature contract' },
  { name: 'create-order-from-quote', category: 'QUOTES', description: 'Convert quote to order' },
  { name: 'generate-internal-pdf', category: 'QUOTES', description: 'Generate order PDFs' },
  { name: 'create-hosted-session', category: 'BILLING', description: 'Create payment session' },
  { name: 'process-payment', category: 'BILLING', description: 'Process payment' },
  { name: 'authnet-webhook', category: 'BILLING', description: 'Payment webhooks' },
  { name: 'process-refund', category: 'BILLING', description: 'Process refunds' },
  { name: 'send-payment-request', category: 'BILLING', description: 'Send payment request' },
  { name: 'send-payment-receipt', category: 'BILLING', description: 'Send receipt' },
  { name: 'overdue-billing-daily', category: 'BILLING', description: 'Daily overdue billing' },
  { name: 'calculate-operational-time', category: 'DISPATCH', description: 'Route time calc' },
  { name: 'geocode-address', category: 'DISPATCH', description: 'Geocode addresses' },
  { name: 'truck-route', category: 'DISPATCH', description: 'Optimize routes' },
  { name: 'nearest-facilities', category: 'DISPATCH', description: 'Find facilities' },
  { name: 'run-automations', category: 'DISPATCH', description: 'Run automations' },
  { name: 'send-schedule-confirmation', category: 'DISPATCH', description: 'Delivery confirmations' },
  { name: 'master-ai-scheduler', category: 'MASTER_AI', description: 'Enqueue AI jobs' },
  { name: 'master-ai-worker', category: 'MASTER_AI', description: 'Process AI jobs' },
  { name: 'master-ai-admin', category: 'MASTER_AI', description: 'Admin AI commands' },
  { name: 'master-ai-notifier', category: 'MASTER_AI', description: 'Send notifications' },
  { name: 'google-oauth-start', category: 'GOOGLE', description: 'Start OAuth flow' },
  { name: 'google-oauth-callback', category: 'GOOGLE', description: 'OAuth callback' },
  { name: 'google-send-email', category: 'GOOGLE', description: 'Send via Gmail' },
  { name: 'google-create-meet', category: 'GOOGLE', description: 'Create Meet links' },
  { name: 'google-drive-folder', category: 'GOOGLE', description: 'Create Drive folders' },
  { name: 'google-chat-webhook', category: 'GOOGLE', description: 'Chat notifications' },
  { name: 'ads-capacity-guard', category: 'ADS', description: 'Pause ads on low inventory' },
  { name: 'ads-generate-campaigns', category: 'ADS', description: 'Auto-generate campaigns' },
  { name: 'health-collector', category: 'MASTER_AI', description: 'System health monitoring' },
  { name: 'qa-runner', category: 'MASTER_AI', description: 'Run QA checks' },
];

// Workflows
const WORKFLOWS = [
  { id: 'lead-to-order', name: 'Lead to Order', functions: ['lead-omnichannel', 'lead-ai-classify', 'save-quote', 'create-order-from-quote', 'process-payment'] },
  { id: 'dispatch-runs', name: 'Dispatch / Runs', functions: ['calculate-operational-time', 'truck-route', 'run-automations'] },
  { id: 'heavy-enforcement', name: 'Heavy Enforcement', functions: ['quote-ai-recommend', 'run-automations'] },
  { id: 'overdue-billing', name: 'Overdue Billing', functions: ['overdue-billing-daily'] },
  { id: 'master-ai', name: 'Master AI', functions: ['master-ai-scheduler', 'master-ai-worker', 'master-ai-notifier'] },
  { id: 'telephony', name: 'Telephony', functions: ['calls-inbound-handler', 'calls-outbound-handler', 'calls-status-callback'] },
  { id: 'messaging', name: 'Messaging', functions: ['ghl-send-message', 'ghl-message-worker', 'send-quote-summary'] },
  { id: 'payments', name: 'Payments', functions: ['create-hosted-session', 'process-payment', 'authnet-webhook', 'send-payment-receipt'] },
];

function IssuesPanel({ issues }: { issues: HealthIssue[] }) {
  const p0Issues = issues.filter(i => i.severity === 'RED');
  const p1Issues = issues.filter(i => i.severity === 'AMBER');

  return (
    <div className="space-y-4">
      {p0Issues.length > 0 && (
        <div>
          <h3 className="font-medium text-red-700 flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" />
            P0 Blockers ({p0Issues.length})
          </h3>
          <div className="space-y-2">
            {p0Issues.map((issue, i) => (
              <Card key={i} className="border-red-200 bg-red-50/50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{issue.message}</p>
                      <p className="text-xs text-muted-foreground">{issue.source}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {p1Issues.length > 0 && (
        <div>
          <h3 className="font-medium text-amber-700 flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" />
            Attention Needed ({p1Issues.length})
          </h3>
          <div className="space-y-2">
            {p1Issues.map((issue, i) => (
              <Card key={i} className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{issue.message}</p>
                      <p className="text-xs text-muted-foreground">{issue.source}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {issues.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
          <p>All systems healthy</p>
        </div>
      )}

      <div className="pt-4 border-t space-y-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/admin/setup/functions">
            <ExternalLink className="h-4 w-4 mr-2" />
            Integration Status
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/admin/qa/workflows">
            <ExternalLink className="h-4 w-4 mr-2" />
            Workflow Explorer
          </Link>
        </Button>
      </div>
    </div>
  );
}

function FunctionNode({ 
  fn, 
  health 
}: { 
  fn: typeof EDGE_FUNCTIONS[0]; 
  health?: { severity: HealthSeverity; message: string } 
}) {
  const category = NODE_CATEGORIES[fn.category as keyof typeof NODE_CATEGORIES] || NODE_CATEGORIES.CONFIG;
  const CategoryIcon = category.icon;
  const severity = health?.severity || 'GREEN';

  return (
    <div className={cn(
      'p-3 rounded-lg border transition-colors hover:bg-muted/50',
      severity === 'RED' && 'border-red-300 bg-red-50/30',
      severity === 'AMBER' && 'border-amber-300 bg-amber-50/30',
      severity === 'GREEN' && 'border-border'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className={cn('p-1.5 rounded', category.color)}>
            <CategoryIcon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <code className="text-sm font-medium truncate">{fn.name}</code>
              <HealthStatusBadge severity={severity} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground truncate">{fn.description}</p>
            {health?.message && severity !== 'GREEN' && (
              <p className="text-xs mt-1 text-amber-600">{health.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowCard({ 
  workflow, 
  nodeHealth 
}: { 
  workflow: typeof WORKFLOWS[0]; 
  nodeHealth: Record<string, { severity: HealthSeverity; message: string }> 
}) {
  const worstSeverity = useMemo(() => {
    const severities = workflow.functions.map(fn => nodeHealth[fn]?.severity || 'GREEN');
    if (severities.includes('RED')) return 'RED';
    if (severities.includes('AMBER')) return 'AMBER';
    return 'GREEN';
  }, [workflow.functions, nodeHealth]);

  return (
    <Card className={cn(
      'transition-colors',
      worstSeverity === 'RED' && 'ring-2 ring-red-500/30',
      worstSeverity === 'AMBER' && 'ring-2 ring-amber-500/30'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {workflow.name}
            <HealthStatusBadge severity={worstSeverity} showLabel size="md" />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {workflow.functions.map(fn => {
            const health = nodeHealth[fn];
            return (
              <Badge 
                key={fn} 
                variant="secondary" 
                className={cn(
                  'font-mono text-xs',
                  health?.severity === 'RED' && 'border-red-300 bg-red-50 text-red-800',
                  health?.severity === 'AMBER' && 'border-amber-300 bg-amber-50 text-amber-800'
                )}
              >
                <HealthStatusBadge severity={health?.severity || 'GREEN'} size="sm" className="mr-1" />
                {fn}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function WorkflowGraph() {
  const { 
    isLoading, 
    isScanning, 
    latestSnapshot, 
    manualSetupItems,
    fetchLatestSnapshot, 
    fetchManualSetupItems,
    runHealthScan,
    updateManualSetupStatus 
  } = useSystemHealth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | HealthSeverity>('all');

  useEffect(() => {
    fetchLatestSnapshot();
    fetchManualSetupItems();
  }, [fetchLatestSnapshot, fetchManualSetupItems]);

  const nodeHealth = latestSnapshot?.node_health_json || {};
  const issues = latestSnapshot?.issues_json || [];
  const summary = latestSnapshot?.summary_json;

  const filteredFunctions = useMemo(() => {
    let filtered = EDGE_FUNCTIONS;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(fn => 
        fn.name.toLowerCase().includes(q) ||
        fn.category.toLowerCase().includes(q) ||
        fn.description.toLowerCase().includes(q)
      );
    }
    
    if (severityFilter !== 'all') {
      filtered = filtered.filter(fn => {
        const health = nodeHealth[fn.name];
        return health?.severity === severityFilter;
      });
    }
    
    return filtered;
  }, [searchQuery, severityFilter, nodeHealth]);

  const functionsByCategory = useMemo(() => {
    const grouped: Record<string, typeof EDGE_FUNCTIONS> = {};
    for (const fn of filteredFunctions) {
      if (!grouped[fn.category]) grouped[fn.category] = [];
      grouped[fn.category].push(fn);
    }
    return grouped;
  }, [filteredFunctions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflow Health Graph</h1>
          <p className="text-muted-foreground">
            Real-time system health signals across {EDGE_FUNCTIONS.length} functions
          </p>
        </div>
        <Button 
          onClick={() => runHealthScan()} 
          disabled={isScanning}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isScanning && "animate-spin")} />
          {isScanning ? 'Scanning...' : 'Run Health Scan'}
        </Button>
      </div>

      {/* Health Summary Bar */}
      {summary && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">{summary.green} Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium">{summary.amber} Attention</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">{summary.red} Blocked</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Last scan: {format(new Date(summary.generated_at), 'MMM d, h:mm a')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="workflows">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="functions">Functions</TabsTrigger>
                <TabsTrigger value="setup">Manual Setup</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as typeof severityFilter)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="RED">RED Only</SelectItem>
                    <SelectItem value="AMBER">AMBER Only</SelectItem>
                    <SelectItem value="GREEN">GREEN Only</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-[200px]"
                  />
                </div>
              </div>
            </div>

            <TabsContent value="workflows" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {WORKFLOWS.map(workflow => (
                  <WorkflowCard 
                    key={workflow.id} 
                    workflow={workflow} 
                    nodeHealth={nodeHealth} 
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="functions">
              <ScrollArea className="h-[600px]">
                <div className="space-y-6">
                  {Object.entries(functionsByCategory).map(([category, functions]) => {
                    const catInfo = NODE_CATEGORIES[category as keyof typeof NODE_CATEGORIES];
                    return (
                      <div key={category}>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          {catInfo && <catInfo.icon className="h-4 w-4" />}
                          {catInfo?.label || category}
                          <Badge variant="secondary">{functions.length}</Badge>
                        </h3>
                        <div className="grid md:grid-cols-2 gap-2">
                          {functions.map(fn => (
                            <FunctionNode 
                              key={fn.name} 
                              fn={fn} 
                              health={nodeHealth[fn.name]} 
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="setup">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Manual Configuration Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {manualSetupItems.map(item => (
                      <div 
                        key={item.id} 
                        className={cn(
                          'p-4 rounded-lg border',
                          item.status === 'DONE' && 'bg-green-50/50 border-green-200',
                          item.status === 'PENDING' && 'bg-amber-50/50 border-amber-200',
                          item.status === 'BLOCKED' && 'bg-red-50/50 border-red-200'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.name}</span>
                              <Badge variant="outline">{item.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          <Select 
                            value={item.status} 
                            onValueChange={(v) => updateManualSetupStatus(item.id, v as typeof item.status)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                              <SelectItem value="DONE">Done</SelectItem>
                              <SelectItem value="BLOCKED">Blocked</SelectItem>
                              <SelectItem value="NOT_APPLICABLE">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Issues Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Issues ({issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-2">
                <IssuesPanel issues={issues} />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
