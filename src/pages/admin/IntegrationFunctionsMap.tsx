import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Phone, MessageSquare, Users, BarChart3, CreditCard, Truck, 
  Bot, FileText, Shield, Copy, Check, ChevronDown, ChevronRight,
  AlertCircle, CheckCircle2, MinusCircle, ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUPABASE_PROJECT_ID = "tvcwzohfycwfaqjyruow";
const BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;

interface EdgeFunction {
  name: string;
  endpoint: string;
  description: string;
  category: string;
  externalServices: string[];
  envVars: { name: string; required: boolean }[];
  webhookUrl?: string;
  uiRoutes?: string[];
}

interface SecretStatus {
  name: string;
  present: boolean;
}

const EDGE_FUNCTIONS: EdgeFunction[] = [
  // TELEPHONY
  { name: "calls-inbound-handler", endpoint: `${BASE_URL}/calls-inbound-handler`, description: "Handles inbound Twilio calls, routes to agents, creates voicemail fallback", category: "TELEPHONY", externalServices: ["Twilio Voice"], envVars: [{ name: "TWILIO_AUTH_TOKEN", required: true }], webhookUrl: `${BASE_URL}/calls-inbound-handler`, uiRoutes: ["/admin/telephony/*", "/sales/calls", "/cs/calls"] },
  { name: "calls-outbound-handler", endpoint: `${BASE_URL}/calls-outbound-handler`, description: "Initiates outbound calls via Twilio", category: "TELEPHONY", externalServices: ["Twilio Voice"], envVars: [{ name: "TWILIO_ACCOUNT_SID", required: true }, { name: "TWILIO_AUTH_TOKEN", required: true }, { name: "TWILIO_PHONE_NUMBER", required: true }], uiRoutes: ["/sales/calls", "/cs/calls"] },
  { name: "calls-outbound-connect", endpoint: `${BASE_URL}/calls-outbound-connect`, description: "TwiML for outbound call connection", category: "TELEPHONY", externalServices: ["Twilio Voice"], envVars: [] },
  { name: "calls-status-callback", endpoint: `${BASE_URL}/calls-status-callback`, description: "Twilio call status updates", category: "TELEPHONY", externalServices: ["Twilio Voice"], envVars: [], webhookUrl: `${BASE_URL}/calls-status-callback` },
  { name: "calls-voicemail-handler", endpoint: `${BASE_URL}/calls-voicemail-handler`, description: "Processes voicemail recordings", category: "TELEPHONY", externalServices: ["Twilio Voice"], envVars: [], webhookUrl: `${BASE_URL}/calls-voicemail-handler` },
  { name: "send-otp", endpoint: `${BASE_URL}/send-otp`, description: "Sends OTP codes via Twilio SMS", category: "TELEPHONY", externalServices: ["Twilio SMS"], envVars: [{ name: "TWILIO_ACCOUNT_SID", required: true }, { name: "TWILIO_AUTH_TOKEN", required: true }, { name: "TWILIO_PHONE_NUMBER", required: true }] },
  { name: "verify-otp", endpoint: `${BASE_URL}/verify-otp`, description: "Verifies OTP codes", category: "TELEPHONY", externalServices: [], envVars: [] },
  
  // MESSAGING
  { name: "twilio-sms-webhook", endpoint: `${BASE_URL}/twilio-sms-webhook`, description: "Handles inbound SMS, auto-replies for scheduling", category: "MESSAGING", externalServices: ["Twilio SMS"], envVars: [{ name: "TWILIO_ACCOUNT_SID", required: true }], webhookUrl: `${BASE_URL}/twilio-sms-webhook` },
  { name: "send-payment-receipt", endpoint: `${BASE_URL}/send-payment-receipt`, description: "Sends payment receipt via SMS and Email", category: "MESSAGING", externalServices: ["Twilio SMS", "Resend Email"], envVars: [{ name: "TWILIO_ACCOUNT_SID", required: true }, { name: "RESEND_API_KEY", required: false }] },
  { name: "send-quote-summary", endpoint: `${BASE_URL}/send-quote-summary`, description: "Sends quote summary via SMS", category: "MESSAGING", externalServices: ["Twilio SMS"], envVars: [{ name: "TWILIO_ACCOUNT_SID", required: true }] },
  { name: "send-schedule-confirmation", endpoint: `${BASE_URL}/send-schedule-confirmation`, description: "Sends delivery confirmation", category: "MESSAGING", externalServices: ["Twilio SMS"], envVars: [{ name: "TWILIO_ACCOUNT_SID", required: true }] },
  
  // LEADS
  { name: "lead-capture", endpoint: `${BASE_URL}/lead-capture`, description: "Website lead capture form handler", category: "LEADS", externalServices: [], envVars: [], webhookUrl: `${BASE_URL}/lead-capture`, uiRoutes: ["/admin/leads/*"] },
  { name: "lead-omnichannel", endpoint: `${BASE_URL}/lead-omnichannel`, description: "Multi-channel lead capture with deduplication", category: "LEADS", externalServices: [], envVars: [] },
  { name: "lead-from-quote", endpoint: `${BASE_URL}/lead-from-quote`, description: "Creates lead from saved quote", category: "LEADS", externalServices: [], envVars: [] },
  { name: "lead-from-phone", endpoint: `${BASE_URL}/lead-from-phone`, description: "Creates lead from phone call", category: "LEADS", externalServices: [], envVars: [] },
  { name: "lead-from-sms", endpoint: `${BASE_URL}/lead-from-sms`, description: "Creates lead from SMS conversation", category: "LEADS", externalServices: [], envVars: [] },
  { name: "lead-from-meta", endpoint: `${BASE_URL}/lead-from-meta`, description: "Meta (FB/IG/WhatsApp) webhook handler", category: "LEADS", externalServices: ["Meta Graph API"], envVars: [{ name: "META_VERIFY_TOKEN", required: true }], webhookUrl: `${BASE_URL}/lead-from-meta` },
  { name: "lead-from-google-ads", endpoint: `${BASE_URL}/lead-from-google-ads`, description: "Google Ads lead form webhook", category: "LEADS", externalServices: ["Google Ads"], envVars: [], webhookUrl: `${BASE_URL}/lead-from-google-ads` },
  { name: "lead-manual-add", endpoint: `${BASE_URL}/lead-manual-add`, description: "Manual lead creation by staff", category: "LEADS", externalServices: [], envVars: [] },
  { name: "lead-ai-classify", endpoint: `${BASE_URL}/lead-ai-classify`, description: "AI classification of lead intent/type", category: "LEADS", externalServices: ["Lovable AI"], envVars: [{ name: "LOVABLE_API_KEY", required: true }] },
  { name: "lead-export", endpoint: `${BASE_URL}/lead-export`, description: "Export leads to CSV/JSON", category: "LEADS", externalServices: [], envVars: [] },
  { name: "ai-chat-lead", endpoint: `${BASE_URL}/ai-chat-lead`, description: "AI chatbot lead qualification", category: "LEADS", externalServices: ["Lovable AI"], envVars: [{ name: "LOVABLE_API_KEY", required: true }] },
  { name: "ai-sales-chat", endpoint: `${BASE_URL}/ai-sales-chat`, description: "AI-powered sales chat assistant", category: "LEADS", externalServices: ["Lovable AI"], envVars: [{ name: "LOVABLE_API_KEY", required: true }] },
  
  // ADS
  { name: "ads-generate-campaigns", endpoint: `${BASE_URL}/ads-generate-campaigns`, description: "Generates campaign structures for markets", category: "ADS", externalServices: ["Google Ads API"], envVars: [{ name: "GOOGLE_ADS_CLIENT_ID", required: false }], uiRoutes: ["/admin/ads/*"] },
  { name: "ads-capacity-guard", endpoint: `${BASE_URL}/ads-capacity-guard`, description: "Pauses/adjusts campaigns based on inventory", category: "ADS", externalServices: ["Google Ads API"], envVars: [{ name: "GOOGLE_ADS_CLIENT_ID", required: false }] },
  
  // BILLING
  { name: "process-payment", endpoint: `${BASE_URL}/process-payment`, description: "Process card payments via Accept.js", category: "BILLING", externalServices: ["Authorize.Net"], envVars: [{ name: "AUTHNET_API_LOGIN_ID", required: true }, { name: "AUTHNET_TRANSACTION_KEY", required: true }], uiRoutes: ["/billing/*"] },
  { name: "process-refund", endpoint: `${BASE_URL}/process-refund`, description: "Process refunds via Authorize.Net", category: "BILLING", externalServices: ["Authorize.Net"], envVars: [{ name: "AUTHNET_API_LOGIN_ID", required: true }] },
  { name: "authnet-webhook", endpoint: `${BASE_URL}/authnet-webhook`, description: "Authorize.Net webhook handler", category: "BILLING", externalServices: ["Authorize.Net"], envVars: [{ name: "AUTHNET_SIGNATURE_KEY", required: true }], webhookUrl: `${BASE_URL}/authnet-webhook` },
  { name: "create-hosted-session", endpoint: `${BASE_URL}/create-hosted-session`, description: "Creates Authorize.Net hosted payment session", category: "BILLING", externalServices: ["Authorize.Net"], envVars: [{ name: "AUTHNET_API_LOGIN_ID", required: true }] },
  { name: "send-payment-request", endpoint: `${BASE_URL}/send-payment-request`, description: "Sends payment link via SMS", category: "BILLING", externalServices: ["Twilio SMS"], envVars: [{ name: "TWILIO_ACCOUNT_SID", required: true }] },
  { name: "overdue-billing-daily", endpoint: `${BASE_URL}/overdue-billing-daily`, description: "Daily overdue billing automation", category: "BILLING", externalServices: [], envVars: [] },
  
  // DISPATCH
  { name: "truck-route", endpoint: `${BASE_URL}/truck-route`, description: "Truck-aware routing via Google Routes API", category: "DISPATCH", externalServices: ["Google Maps"], envVars: [{ name: "GOOGLE_MAPS_API_KEY", required: true }], uiRoutes: ["/dispatch/*", "/quote"] },
  { name: "geocode-address", endpoint: `${BASE_URL}/geocode-address`, description: "Address geocoding and autocomplete", category: "DISPATCH", externalServices: ["Google Maps"], envVars: [{ name: "GOOGLE_MAPS_API_KEY", required: true }], uiRoutes: ["/quote"] },
  { name: "nearest-facilities", endpoint: `${BASE_URL}/nearest-facilities`, description: "Finds nearest disposal facilities", category: "DISPATCH", externalServices: ["Google Maps"], envVars: [{ name: "GOOGLE_MAPS_API_KEY", required: true }] },
  { name: "update-days-out", endpoint: `${BASE_URL}/update-days-out`, description: "Updates asset days_out counters", category: "DISPATCH", externalServices: [], envVars: [] },
  { name: "run-automations", endpoint: `${BASE_URL}/run-automations`, description: "Triggers dispatch automations", category: "DISPATCH", externalServices: [], envVars: [] },
  { name: "analyze-waste", endpoint: `${BASE_URL}/analyze-waste`, description: "AI-powered waste analysis from photos", category: "DISPATCH", externalServices: ["Lovable AI"], envVars: [{ name: "LOVABLE_API_KEY", required: true }] },
  { name: "generate-internal-pdf", endpoint: `${BASE_URL}/generate-internal-pdf`, description: "Generates dispatch documents", category: "DISPATCH", externalServices: [], envVars: [] },
  
  // MASTER_AI
  { name: "master-ai-worker", endpoint: `${BASE_URL}/master-ai-worker`, description: "Processes AI job queue", category: "MASTER_AI", externalServices: [], envVars: [] },
  { name: "master-ai-scheduler", endpoint: `${BASE_URL}/master-ai-scheduler`, description: "Enqueues scheduled AI jobs", category: "MASTER_AI", externalServices: [], envVars: [] },
  { name: "master-ai-notifier", endpoint: `${BASE_URL}/master-ai-notifier`, description: "Sends notifications from outbox", category: "MASTER_AI", externalServices: ["Slack", "Google Chat"], envVars: [] },
  { name: "master-ai-admin", endpoint: `${BASE_URL}/master-ai-admin`, description: "Admin controls for Master AI", category: "MASTER_AI", externalServices: [], envVars: [] },
  
  // QUOTES
  { name: "save-quote", endpoint: `${BASE_URL}/save-quote`, description: "Saves quote and triggers CRM sync", category: "QUOTES", externalServices: ["HighLevel CRM"], envVars: [{ name: "HIGHLEVEL_API_KEY", required: true }], uiRoutes: ["/quote"] },
  { name: "create-order-from-quote", endpoint: `${BASE_URL}/create-order-from-quote`, description: "Converts quote to order", category: "QUOTES", externalServices: [], envVars: [] },
  { name: "send-contract", endpoint: `${BASE_URL}/send-contract`, description: "Sends contract for signature", category: "QUOTES", externalServices: ["Twilio SMS"], envVars: [{ name: "TWILIO_ACCOUNT_SID", required: true }] },
  { name: "send-service-receipt", endpoint: `${BASE_URL}/send-service-receipt`, description: "Sends service completion receipt", category: "QUOTES", externalServices: ["Twilio SMS", "Resend"], envVars: [{ name: "TWILIO_ACCOUNT_SID", required: true }] },
  { name: "quote-ai-recommend", endpoint: `${BASE_URL}/quote-ai-recommend`, description: "AI-powered size/material recommendations", category: "QUOTES", externalServices: ["Lovable AI"], envVars: [{ name: "LOVABLE_API_KEY", required: true }] },
  
  // SECURITY
  { name: "validate-session", endpoint: `${BASE_URL}/validate-session`, description: "Validates customer portal sessions", category: "SECURITY", externalServices: [], envVars: [] },
  { name: "highlevel-webhook", endpoint: `${BASE_URL}/highlevel-webhook`, description: "Syncs contacts to HighLevel CRM", category: "SECURITY", externalServices: ["HighLevel CRM"], envVars: [{ name: "HIGHLEVEL_API_KEY", required: true }, { name: "HIGHLEVEL_LOCATION_ID", required: true }] },
];

const KNOWN_SECRETS = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN", 
  "TWILIO_PHONE_NUMBER",
  "GOOGLE_MAPS_API_KEY",
  "AUTHNET_API_LOGIN_ID",
  "AUTHNET_TRANSACTION_KEY",
  "AUTHNET_SIGNATURE_KEY",
  "HIGHLEVEL_API_KEY",
  "HIGHLEVEL_LOCATION_ID",
  "LOVABLE_API_KEY",
  "RESEND_API_KEY",
  "META_VERIFY_TOKEN",
  "META_APP_SECRET",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_REFRESH_TOKEN",
];

// Simulated secret presence (in real app, this would come from a secure endpoint)
const PRESENT_SECRETS = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "GOOGLE_MAPS_API_KEY",
  "AUTHNET_API_LOGIN_ID",
  "AUTHNET_TRANSACTION_KEY",
  "AUTHNET_SIGNATURE_KEY",
  "HIGHLEVEL_API_KEY",
  "HIGHLEVEL_LOCATION_ID",
  "LOVABLE_API_KEY",
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  TELEPHONY: <Phone className="h-4 w-4" />,
  MESSAGING: <MessageSquare className="h-4 w-4" />,
  LEADS: <Users className="h-4 w-4" />,
  ADS: <BarChart3 className="h-4 w-4" />,
  BILLING: <CreditCard className="h-4 w-4" />,
  DISPATCH: <Truck className="h-4 w-4" />,
  MASTER_AI: <Bot className="h-4 w-4" />,
  QUOTES: <FileText className="h-4 w-4" />,
  SECURITY: <Shield className="h-4 w-4" />,
};

export default function IntegrationFunctionsMap() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["TELEPHONY"]);
  const [configModes, setConfigModes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConfigModes();
  }, []);

  const loadConfigModes = async () => {
    const { data } = await supabase
      .from("config_settings")
      .select("category, key, value")
      .in("key", ["mode"]);
    
    const modes: Record<string, string> = {};
    data?.forEach(row => {
      const rawValue = row.value;
      const value = typeof rawValue === 'string' ? rawValue.replace(/"/g, '') : String(rawValue);
      modes[`${row.category}.${row.key}`] = value;
    });
    setConfigModes(modes);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getSecretStatus = (secretName: string): boolean => {
    return PRESENT_SECRETS.includes(secretName);
  };

  const getFunctionStatus = (fn: EdgeFunction): "connected" | "missing" | "partial" | "dry_run" => {
    // Check if in DRY_RUN mode for certain categories
    if (fn.category === "ADS" && configModes["ads.mode"] === "DRY_RUN") {
      return "dry_run";
    }
    
    const requiredVars = fn.envVars.filter(v => v.required);
    if (requiredVars.length === 0) return "connected";
    
    const presentCount = requiredVars.filter(v => getSecretStatus(v.name)).length;
    if (presentCount === requiredVars.length) return "connected";
    if (presentCount > 0) return "partial";
    return "missing";
  };

  const getStatusBadge = (status: "connected" | "missing" | "partial" | "dry_run") => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Connected</Badge>;
      case "missing":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Missing</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><MinusCircle className="h-3 w-3 mr-1" />Partial</Badge>;
      case "dry_run":
        return <Badge variant="secondary"><MinusCircle className="h-3 w-3 mr-1" />DRY_RUN</Badge>;
    }
  };

  const categories = [...new Set(EDGE_FUNCTIONS.map(f => f.category))];
  
  const summary = {
    total: EDGE_FUNCTIONS.length,
    connected: EDGE_FUNCTIONS.filter(f => getFunctionStatus(f) === "connected").length,
    missing: EDGE_FUNCTIONS.filter(f => getFunctionStatus(f) === "missing").length,
    partial: EDGE_FUNCTIONS.filter(f => getFunctionStatus(f) === "partial").length,
    dryRun: EDGE_FUNCTIONS.filter(f => getFunctionStatus(f) === "dry_run").length,
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integration Functions Map</h1>
        <p className="text-muted-foreground">Complete inventory of Edge Functions and external integrations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-sm text-muted-foreground">Total Functions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{summary.connected}</div>
            <p className="text-sm text-muted-foreground">Connected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{summary.missing}</div>
            <p className="text-sm text-muted-foreground">Missing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{summary.partial}</div>
            <p className="text-sm text-muted-foreground">Partial</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-muted-foreground">{summary.dryRun}</div>
            <p className="text-sm text-muted-foreground">DRY_RUN</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="functions">
        <TabsList>
          <TabsTrigger value="functions">Functions by Category</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook URLs</TabsTrigger>
          <TabsTrigger value="secrets">Secrets Status</TabsTrigger>
        </TabsList>

        <TabsContent value="functions" className="space-y-4">
          {categories.map(category => {
            const categoryFns = EDGE_FUNCTIONS.filter(f => f.category === category);
            const isExpanded = expandedCategories.includes(category);
            
            return (
              <Card key={category}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {CATEGORY_ICONS[category]}
                          <CardTitle className="text-lg">{category}</CardTitle>
                          <Badge variant="outline">{categoryFns.length}</Badge>
                        </div>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Function</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>External Services</TableHead>
                            <TableHead>Env Vars</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryFns.map(fn => (
                            <TableRow key={fn.name}>
                              <TableCell className="font-mono text-sm">{fn.name}</TableCell>
                              <TableCell className="text-sm max-w-xs">{fn.description}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {fn.externalServices.length > 0 ? (
                                    fn.externalServices.map(svc => (
                                      <Badge key={svc} variant="outline" className="text-xs">{svc}</Badge>
                                    ))
                                  ) : (
                                    <span className="text-muted-foreground text-xs">None</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {fn.envVars.length > 0 ? (
                                    fn.envVars.map(v => (
                                      <Badge 
                                        key={v.name} 
                                        variant="outline" 
                                        className={`text-xs ${getSecretStatus(v.name) ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}
                                      >
                                        {getSecretStatus(v.name) ? '✓' : '✗'} {v.name.split('_')[0]}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(getFunctionStatus(fn))}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook URLs</CardTitle>
              <CardDescription>Copy these URLs to configure external services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Twilio */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Twilio Configuration
                  </h3>
                  <div className="space-y-2 pl-6">
                    {[
                      { label: "Voice Webhook", url: `${BASE_URL}/calls-inbound-handler` },
                      { label: "Status Callback", url: `${BASE_URL}/calls-status-callback` },
                      { label: "Voicemail Handler", url: `${BASE_URL}/calls-voicemail-handler` },
                      { label: "SMS Webhook", url: `${BASE_URL}/twilio-sms-webhook` },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between bg-muted p-2 rounded">
                        <div>
                          <span className="text-sm font-medium">{item.label}:</span>
                          <code className="ml-2 text-xs">{item.url}</code>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(item.url)}
                        >
                          {copiedUrl === item.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leads */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Lead Sources
                  </h3>
                  <div className="space-y-2 pl-6">
                    {[
                      { label: "Website Form", url: `${BASE_URL}/lead-capture` },
                      { label: "Meta (FB/IG)", url: `${BASE_URL}/lead-from-meta` },
                      { label: "Google Ads", url: `${BASE_URL}/lead-from-google-ads` },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between bg-muted p-2 rounded">
                        <div>
                          <span className="text-sm font-medium">{item.label}:</span>
                          <code className="ml-2 text-xs">{item.url}</code>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(item.url)}
                        >
                          {copiedUrl === item.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Authorize.Net
                  </h3>
                  <div className="space-y-2 pl-6">
                    <div className="flex items-center justify-between bg-muted p-2 rounded">
                      <div>
                        <span className="text-sm font-medium">Webhook URL:</span>
                        <code className="ml-2 text-xs">{BASE_URL}/authnet-webhook</code>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${BASE_URL}/authnet-webhook`)}
                      >
                        {copiedUrl === `${BASE_URL}/authnet-webhook` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="secrets">
          <Card>
            <CardHeader>
              <CardTitle>Secrets Status</CardTitle>
              <CardDescription>Environment variables configured in Lovable Cloud</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Secret Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Used By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {KNOWN_SECRETS.map(secret => {
                    const isPresent = getSecretStatus(secret);
                    const usedBy = EDGE_FUNCTIONS.filter(f => 
                      f.envVars.some(v => v.name === secret)
                    ).map(f => f.name);
                    
                    return (
                      <TableRow key={secret}>
                        <TableCell className="font-mono text-sm">{secret}</TableCell>
                        <TableCell>
                          {isPresent ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" />Present
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />Missing
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {usedBy.length > 0 ? (
                              usedBy.slice(0, 3).map(fn => (
                                <Badge key={fn} variant="outline" className="text-xs">{fn}</Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                            {usedBy.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{usedBy.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Current Mode Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Mode Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: "telephony.mode", label: "Telephony" },
              { key: "ads.mode", label: "Ads" },
              { key: "messaging.mode", label: "Messaging" },
              { key: "master_ai.mode", label: "Master AI" },
              { key: "leads.ai_mode", label: "Lead AI" },
            ].map(item => (
              <div key={item.key} className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">{item.label}</div>
                <Badge 
                  variant={configModes[item.key] === "LIVE" || configModes[item.key] === "LIVE_INTERNAL" ? "default" : "secondary"}
                  className="mt-1"
                >
                  {configModes[item.key] || "DRY_RUN"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
