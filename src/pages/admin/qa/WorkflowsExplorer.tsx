import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Phone, 
  Users, 
  FileText, 
  CreditCard, 
  Truck, 
  Bot, 
  Mail,
  Settings,
  Clock,
  Database,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Edge Functions Data
const EDGE_FUNCTIONS = [
  // Telephony
  { name: 'calls-inbound-handler', category: 'TELEPHONY', description: 'Handles incoming Twilio calls', external: ['Twilio'], tables: ['call_events', 'phone_numbers'] },
  { name: 'calls-outbound-handler', category: 'TELEPHONY', description: 'Initiates outbound calls', external: ['Twilio'], tables: ['call_events'] },
  { name: 'calls-outbound-connect', category: 'TELEPHONY', description: 'TwiML for connected calls', external: ['Twilio'], tables: [] },
  { name: 'calls-status-callback', category: 'TELEPHONY', description: 'Call status webhooks', external: ['Twilio'], tables: ['call_events', 'call_assignments'] },
  { name: 'calls-voicemail-handler', category: 'TELEPHONY', description: 'Voicemail processing', external: ['Twilio'], tables: ['voicemails'] },
  { name: 'twilio-sms-webhook', category: 'TELEPHONY', description: 'SMS webhooks', external: ['Twilio'], tables: ['message_history'] },
  { name: 'send-otp', category: 'TELEPHONY', description: 'Send OTP for portal auth', external: ['Twilio'], tables: ['customer_sessions'] },
  { name: 'verify-otp', category: 'TELEPHONY', description: 'Verify OTP codes', external: [], tables: ['customer_sessions'] },
  { name: 'validate-session', category: 'TELEPHONY', description: 'Validate portal sessions', external: [], tables: ['customer_sessions'] },
  { name: 'ghl-inbound-webhook', category: 'TELEPHONY', description: 'GHL inbound messages', external: ['GHL'], tables: ['message_history'] },
  { name: 'ghl-send-message', category: 'TELEPHONY', description: 'Send via GHL', external: ['GHL'], tables: ['message_queue'] },
  { name: 'highlevel-webhook', category: 'TELEPHONY', description: 'GHL webhooks', external: ['GHL'], tables: [] },
  
  // Leads
  { name: 'lead-capture', category: 'LEADS', description: 'Generic lead capture', external: [], tables: ['sales_leads', 'lead_events'] },
  { name: 'lead-omnichannel', category: 'LEADS', description: 'Unified lead ingestion', external: [], tables: ['sales_leads', 'lead_dedup_keys'] },
  { name: 'lead-from-quote', category: 'LEADS', description: 'Lead from quote', external: [], tables: ['sales_leads', 'quotes'] },
  { name: 'lead-from-phone', category: 'LEADS', description: 'Lead from phone call', external: ['Twilio'], tables: ['sales_leads'] },
  { name: 'lead-from-sms', category: 'LEADS', description: 'Lead from SMS', external: ['Twilio'], tables: ['sales_leads'] },
  { name: 'lead-from-meta', category: 'LEADS', description: 'Meta lead forms', external: ['Meta'], tables: ['sales_leads'] },
  { name: 'lead-from-google-ads', category: 'LEADS', description: 'Google Ads leads', external: ['Google Ads'], tables: ['sales_leads'] },
  { name: 'lead-manual-add', category: 'LEADS', description: 'Manual lead creation', external: [], tables: ['sales_leads'] },
  { name: 'lead-ai-classify', category: 'LEADS', description: 'AI lead classification', external: ['Lovable AI'], tables: ['sales_leads', 'lead_events'] },
  { name: 'lead-export', category: 'LEADS', description: 'Export leads', external: [], tables: ['sales_leads'] },
  { name: 'ai-chat-lead', category: 'LEADS', description: 'AI chat qualification', external: ['Lovable AI'], tables: ['sales_leads'] },
  { name: 'ai-sales-chat', category: 'LEADS', description: 'Bilingual sales assistant', external: ['Lovable AI'], tables: ['sales_leads', 'quotes'] },
  
  // Quotes
  { name: 'save-quote', category: 'QUOTES', description: 'Save quote to DB', external: [], tables: ['quotes'] },
  { name: 'quote-ai-recommend', category: 'QUOTES', description: 'AI size recommendations', external: ['Lovable AI'], tables: ['disposal_item_catalog'] },
  { name: 'send-quote-summary', category: 'QUOTES', description: 'Send quote email/SMS', external: ['GHL', 'Resend'], tables: ['message_queue', 'quotes'] },
  { name: 'send-contract', category: 'QUOTES', description: 'Send e-signature contract', external: ['Resend'], tables: ['contracts'] },
  { name: 'create-order-from-quote', category: 'QUOTES', description: 'Convert quote to order', external: [], tables: ['orders', 'quotes', 'customers'] },
  { name: 'generate-internal-pdf', category: 'QUOTES', description: 'Generate order PDFs', external: [], tables: ['orders'] },
  { name: 'calculate-service-cost', category: 'QUOTES', description: 'Calculate pricing', external: [], tables: ['pricing_zones', 'dumpster_sizes'] },
  
  // Billing
  { name: 'create-hosted-session', category: 'BILLING', description: 'Create payment session', external: ['Authorize.Net'], tables: ['payments', 'invoices'] },
  { name: 'process-payment', category: 'BILLING', description: 'Process payment', external: ['Authorize.Net'], tables: ['payments', 'invoices', 'orders'] },
  { name: 'authnet-webhook', category: 'BILLING', description: 'Payment webhooks', external: ['Authorize.Net'], tables: ['payments'] },
  { name: 'process-refund', category: 'BILLING', description: 'Process refunds', external: ['Authorize.Net'], tables: ['payments', 'invoices'] },
  { name: 'send-payment-request', category: 'BILLING', description: 'Send payment request', external: ['GHL', 'Resend'], tables: ['message_queue', 'invoices'] },
  { name: 'send-payment-receipt', category: 'BILLING', description: 'Send receipt', external: ['GHL', 'Resend'], tables: ['message_queue', 'payments'] },
  { name: 'overdue-billing-daily', category: 'BILLING', description: 'Daily overdue billing', external: [], tables: ['invoices', 'invoice_line_items', 'alerts'] },
  { name: 'compensation-calc-on-payment', category: 'BILLING', description: 'Sales commission calc', external: [], tables: ['compensation_earnings'] },
  { name: 'compensation-calc-on-run', category: 'BILLING', description: 'Driver pay calc', external: [], tables: ['compensation_earnings'] },
  { name: 'compensation-approval-worker', category: 'BILLING', description: 'Comp approvals', external: [], tables: ['compensation_earnings'] },
  { name: 'compensation-kpi-evaluator', category: 'BILLING', description: 'KPI bonuses', external: [], tables: ['compensation_earnings'] },
  
  // Dispatch
  { name: 'calculate-operational-time', category: 'DISPATCH', description: 'Route time calc', external: ['Google Maps'], tables: [] },
  { name: 'geocode-address', category: 'DISPATCH', description: 'Geocode addresses', external: ['Google Maps'], tables: ['quotes', 'orders'] },
  { name: 'truck-route', category: 'DISPATCH', description: 'Optimize routes', external: ['Google Maps'], tables: ['runs'] },
  { name: 'nearest-facilities', category: 'DISPATCH', description: 'Find facilities', external: ['Google Maps'], tables: ['facilities'] },
  { name: 'run-automations', category: 'DISPATCH', description: 'Run automations', external: [], tables: ['runs', 'run_events'] },
  { name: 'send-schedule-confirmation', category: 'DISPATCH', description: 'Delivery confirmations', external: ['GHL', 'Resend'], tables: ['message_queue', 'orders'] },
  
  // Master AI
  { name: 'master-ai-scheduler', category: 'MASTER_AI', description: 'Enqueue AI jobs', external: [], tables: ['ai_jobs'] },
  { name: 'master-ai-worker', category: 'MASTER_AI', description: 'Process AI jobs', external: ['Lovable AI'], tables: ['ai_jobs', 'ai_decisions', 'crm_tasks', 'alerts'] },
  { name: 'master-ai-admin', category: 'MASTER_AI', description: 'Admin AI commands', external: ['Lovable AI'], tables: ['ai_jobs'] },
  { name: 'master-ai-notifier', category: 'MASTER_AI', description: 'Send notifications', external: ['GHL', 'Resend'], tables: ['notifications_outbox'] },
  { name: 'send-service-receipt', category: 'MASTER_AI', description: 'Service receipts', external: ['GHL', 'Resend'], tables: ['message_queue'] },
  
  // Google
  { name: 'google-oauth-start', category: 'GOOGLE', description: 'Start OAuth flow', external: ['Google OAuth'], tables: ['google_connections'] },
  { name: 'google-oauth-callback', category: 'GOOGLE', description: 'OAuth callback', external: ['Google OAuth'], tables: ['google_connections'] },
  { name: 'google-send-email', category: 'GOOGLE', description: 'Send via Gmail', external: ['Gmail API'], tables: ['entity_google_links'] },
  { name: 'google-create-meet', category: 'GOOGLE', description: 'Create Meet links', external: ['Google Meet'], tables: ['entity_google_links'] },
  { name: 'google-drive-folder', category: 'GOOGLE', description: 'Create Drive folders', external: ['Google Drive'], tables: ['entity_google_links'] },
  { name: 'google-chat-webhook', category: 'GOOGLE', description: 'Chat notifications', external: ['Google Chat'], tables: [] },
  
  // Ads
  { name: 'ads-capacity-guard', category: 'ADS', description: 'Pause ads on low inventory', external: ['Google Ads API'], tables: ['ads_campaigns', 'ads_markets'] },
  { name: 'ads-generate-campaigns', category: 'ADS', description: 'Auto-generate campaigns', external: ['Google Ads API'], tables: ['ads_campaigns', 'ads_adgroups'] },
  
  // Other
  { name: 'ghl-message-worker', category: 'MESSAGING', description: 'Process message queue', external: ['GHL'], tables: ['message_queue', 'message_logs'] },
  { name: 'analyze-waste', category: 'OTHER', description: 'AI waste analysis', external: ['Lovable AI'], tables: [] },
  { name: 'qa-runner', category: 'QA', description: 'Run QA checks', external: [], tables: ['qa_results'] },
  { name: 'update-days-out', category: 'BILLING', description: 'Update asset days', external: [], tables: ['assets_dumpsters'] },
];

// DB Triggers
const DB_TRIGGERS = [
  { name: 'handle_order_scheduled', table: 'orders', event: 'UPDATE → scheduled', description: 'Reserves asset, creates delivery run' },
  { name: 'handle_order_delivered', table: 'orders', event: 'UPDATE → delivered', description: 'Updates asset to deployed, logs movement' },
  { name: 'handle_order_cancelled', table: 'orders', event: 'UPDATE → cancelled', description: 'Releases asset, cancels runs' },
  { name: 'create_delivery_run_from_order', table: 'orders', event: 'UPDATE → scheduled', description: 'Creates DELIVERY run' },
  { name: 'create_pickup_run_from_order', table: 'orders', event: 'UPDATE → delivered', description: 'Creates PICKUP run' },
  { name: 'cancel_runs_on_order_close', table: 'orders', event: 'UPDATE → completed/cancelled', description: 'Cancels pending runs' },
  { name: 'trigger_validate_asset_state', table: 'assets_dumpsters', event: 'INSERT/UPDATE', description: 'Enforces state consistency' },
  { name: 'route_new_lead', table: 'sales_leads', event: 'INSERT', description: 'Auto-assigns to sales/cs' },
  { name: 'auto_populate_heavy_fields', table: 'orders', event: 'INSERT', description: 'Copies heavy fields from quote' },
];

// Cron Jobs
const CRON_JOBS = [
  { id: 1, schedule: '0 6 * * *', function: 'overdue-billing-daily', description: 'Daily overdue billing (6 AM UTC)' },
  { id: 2, schedule: '*/30 * * * *', function: 'master-ai-scheduler', payload: 'CONTROL_TOWER', description: 'Control Tower checks (every 30 min)' },
  { id: 3, schedule: '0 16 * * *', function: 'master-ai-scheduler', payload: 'DAILY_BRIEF', description: 'Morning brief (8 AM PT)' },
  { id: 4, schedule: '0 2 * * *', function: 'master-ai-scheduler', payload: 'EOD_REPORT', description: 'End of day report (6 PM PT)' },
];

// Workflows
const WORKFLOWS = [
  {
    id: 'lead-to-order',
    name: 'Lead → Quote → Order',
    description: 'Customer acquisition flow from first contact to paid order',
    steps: [
      'Lead captured via website/phone/ads/chat',
      'Lead deduplicated and normalized',
      'Auto-routed to sales or CS',
      'AI classification for intent scoring',
      'Quote created with AI recommendations',
      'Contract sent for e-signature',
      'Payment processed via Authorize.Net',
      'Order created and commission calculated'
    ],
    functions: ['lead-omnichannel', 'lead-ai-classify', 'save-quote', 'quote-ai-recommend', 'send-contract', 'create-hosted-session', 'process-payment'],
    link: '/admin/dashboards/leads'
  },
  {
    id: 'dispatch-runs',
    name: 'Dispatch / Runs',
    description: 'Order scheduling through driver completion',
    steps: [
      'Order status → scheduled',
      'Asset reserved, DELIVERY run created',
      'Dispatch assigns driver/truck',
      'Route time calculated',
      'Driver starts run (EN_ROUTE)',
      'Driver arrives and uploads POD',
      'Run completed, asset deployed',
      'Driver pay calculated'
    ],
    functions: ['calculate-operational-time', 'run-automations', 'compensation-calc-on-run'],
    link: '/dispatch'
  },
  {
    id: 'heavy-enforcement',
    name: 'Heavy Material Enforcement',
    description: 'Fill-line compliance and contamination handling',
    steps: [
      'Heavy material detected at quote',
      'Size restricted to 5-10yd',
      'Weight risk calculated',
      'Fill-line warning displayed',
      'Driver uploads compliance photos',
      'If contaminated → reclassify to debris',
      'Extra tons billed at $165/ton',
      'Approval required if > $250'
    ],
    functions: ['quote-ai-recommend', 'run-automations'],
    link: '/admin/heavy-risk'
  },
  {
    id: 'overdue-billing',
    name: 'Overdue Billing',
    description: 'Automated rental overage detection and billing',
    steps: [
      'Cron runs daily at 6 AM UTC',
      'Query overdue_assets_billing_vw',
      'Calculate billable days',
      'Auto-bill up to $250 threshold',
      'Create approval for larger amounts',
      'Send overdue notices (DRY_RUN/LIVE)',
      'Escalate after 3+ overdue days',
      'Create dispatch pickup task'
    ],
    functions: ['overdue-billing-daily'],
    link: '/admin/overdue'
  },
  {
    id: 'master-ai',
    name: 'Master AI Control Tower',
    description: 'Autonomous supervisor for operational health',
    steps: [
      'Cron triggers every 30 min',
      'Check stale leads (5+ min)',
      'Check stale quotes (60+ min)',
      'Check delayed runs (30+ min late)',
      'Check heavy risk orders',
      'Check overdue assets (7+ days)',
      'Check aging approvals (24h+)',
      'Create tasks and internal alerts'
    ],
    functions: ['master-ai-scheduler', 'master-ai-worker', 'master-ai-notifier'],
    link: '/admin/qa/control-center'
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  TELEPHONY: <Phone className="h-4 w-4" />,
  LEADS: <Users className="h-4 w-4" />,
  QUOTES: <FileText className="h-4 w-4" />,
  BILLING: <CreditCard className="h-4 w-4" />,
  DISPATCH: <Truck className="h-4 w-4" />,
  MASTER_AI: <Bot className="h-4 w-4" />,
  GOOGLE: <Mail className="h-4 w-4" />,
  ADS: <Zap className="h-4 w-4" />,
  MESSAGING: <Mail className="h-4 w-4" />,
  QA: <CheckCircle2 className="h-4 w-4" />,
  OTHER: <Settings className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  TELEPHONY: 'bg-blue-100 text-blue-800',
  LEADS: 'bg-green-100 text-green-800',
  QUOTES: 'bg-purple-100 text-purple-800',
  BILLING: 'bg-yellow-100 text-yellow-800',
  DISPATCH: 'bg-orange-100 text-orange-800',
  MASTER_AI: 'bg-pink-100 text-pink-800',
  GOOGLE: 'bg-red-100 text-red-800',
  ADS: 'bg-indigo-100 text-indigo-800',
  MESSAGING: 'bg-cyan-100 text-cyan-800',
  QA: 'bg-emerald-100 text-emerald-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export default function WorkflowsExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedWorkflows, setExpandedWorkflows] = useState<string[]>(['lead-to-order']);

  const filteredFunctions = useMemo(() => {
    if (!searchQuery) return EDGE_FUNCTIONS;
    const q = searchQuery.toLowerCase();
    return EDGE_FUNCTIONS.filter(f => 
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.tables.some(t => t.toLowerCase().includes(q)) ||
      f.external.some(e => e.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const functionsByCategory = useMemo(() => {
    const grouped: Record<string, typeof EDGE_FUNCTIONS> = {};
    for (const fn of filteredFunctions) {
      if (!grouped[fn.category]) grouped[fn.category] = [];
      grouped[fn.category].push(fn);
    }
    return grouped;
  }, [filteredFunctions]);

  const toggleWorkflow = (id: string) => {
    setExpandedWorkflows(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflow Explorer</h1>
          <p className="text-muted-foreground">
            Complete map of {EDGE_FUNCTIONS.length} functions, {DB_TRIGGERS.length} triggers, and {CRON_JOBS.length} cron jobs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/setup/functions">
              <ExternalLink className="h-4 w-4 mr-2" />
              Integration Status
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search functions, tables, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="workflows">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="functions">Functions ({EDGE_FUNCTIONS.length})</TabsTrigger>
          <TabsTrigger value="triggers">Triggers ({DB_TRIGGERS.length})</TabsTrigger>
          <TabsTrigger value="cron">Cron ({CRON_JOBS.length})</TabsTrigger>
          <TabsTrigger value="setup">Manual Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {WORKFLOWS.map(workflow => (
            <Card key={workflow.id}>
              <Collapsible 
                open={expandedWorkflows.includes(workflow.id)}
                onOpenChange={() => toggleWorkflow(workflow.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedWorkflows.includes(workflow.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                        <Link to={workflow.link}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Steps</h4>
                        <ol className="space-y-2">
                          {workflow.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Functions Involved</h4>
                        <div className="flex flex-wrap gap-2">
                          {workflow.functions.map(fn => (
                            <Badge key={fn} variant="secondary" className="font-mono text-xs">
                              {fn}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="functions">
          <ScrollArea className="h-[600px]">
            <div className="space-y-6">
              {Object.entries(functionsByCategory).map(([category, functions]) => (
                <Card key={category}>
                  <CardHeader className="py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {CATEGORY_ICONS[category]}
                      {category}
                      <Badge variant="secondary">{functions.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {functions.map(fn => (
                        <div key={fn.name} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <code className="text-sm font-semibold">{fn.name}</code>
                              <p className="text-sm text-muted-foreground">{fn.description}</p>
                            </div>
                            <Badge className={CATEGORY_COLORS[fn.category]}>{fn.category}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {fn.external.map(ext => (
                              <Badge key={ext} variant="outline" className="text-xs">
                                {ext}
                              </Badge>
                            ))}
                            {fn.tables.map(table => (
                              <Badge key={table} variant="secondary" className="text-xs font-mono">
                                <Database className="h-3 w-3 mr-1" />
                                {table}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="triggers">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {DB_TRIGGERS.map(trigger => (
                  <div key={trigger.name} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div>
                        <code className="text-sm font-semibold">{trigger.name}</code>
                        <p className="text-sm text-muted-foreground mt-1">{trigger.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="font-mono">{trigger.table}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{trigger.event}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cron">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {CRON_JOBS.map(job => (
                  <div key={job.id} className="p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-semibold">{job.function}</code>
                          {job.payload && (
                            <Badge variant="outline">{job.payload}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{job.description}</p>
                      </div>
                      <div className="text-right">
                        <code className="text-sm bg-muted px-2 py-1 rounded">{job.schedule}</code>
                        <p className="text-xs text-muted-foreground mt-1">Job #{job.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Manual Configuration Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">External Service Webhooks</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted">
                      <h4 className="font-medium">Twilio</h4>
                      <div className="text-sm space-y-1 mt-2">
                        <p><span className="text-muted-foreground">Voice URL:</span> <code>/functions/v1/calls-inbound-handler</code></p>
                        <p><span className="text-muted-foreground">Status Callback:</span> <code>/functions/v1/calls-status-callback</code></p>
                        <p><span className="text-muted-foreground">SMS URL:</span> <code>/functions/v1/twilio-sms-webhook</code></p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <h4 className="font-medium">Authorize.Net</h4>
                      <div className="text-sm space-y-1 mt-2">
                        <p><span className="text-muted-foreground">Webhook:</span> <code>/functions/v1/authnet-webhook</code></p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <h4 className="font-medium">Google Ads</h4>
                      <div className="text-sm space-y-1 mt-2">
                        <p><span className="text-muted-foreground">Lead Form:</span> <code>/functions/v1/lead-from-google-ads</code></p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <h4 className="font-medium">Meta/Facebook</h4>
                      <div className="text-sm space-y-1 mt-2">
                        <p><span className="text-muted-foreground">Lead Form:</span> <code>/functions/v1/lead-from-meta</code></p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <h4 className="font-medium">GoHighLevel</h4>
                      <div className="text-sm space-y-1 mt-2">
                        <p><span className="text-muted-foreground">Inbound:</span> <code>/functions/v1/ghl-inbound-webhook</code></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Required Secrets</h3>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <code className="bg-muted p-2 rounded">TWILIO_ACCOUNT_SID</code>
                    <code className="bg-muted p-2 rounded">TWILIO_AUTH_TOKEN</code>
                    <code className="bg-muted p-2 rounded">AUTHNET_API_LOGIN</code>
                    <code className="bg-muted p-2 rounded">AUTHNET_TRANSACTION_KEY</code>
                    <code className="bg-muted p-2 rounded">GOOGLE_CLIENT_ID</code>
                    <code className="bg-muted p-2 rounded">GOOGLE_CLIENT_SECRET</code>
                    <code className="bg-muted p-2 rounded">GHL_API_KEY</code>
                    <code className="bg-muted p-2 rounded">RESEND_API_KEY</code>
                    <code className="bg-muted p-2 rounded">GOOGLE_MAPS_API_KEY</code>
                  </div>
                </div>

                <Button variant="outline" asChild>
                  <Link to="/admin/setup/functions">
                    Check Integration Status
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
