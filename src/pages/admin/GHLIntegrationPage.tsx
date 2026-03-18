import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare, Phone, RefreshCw, Settings, CheckCircle, XCircle, Clock,
  Wifi, WifiOff, Play, Mail, Users, Shield, HeartPulse, AlertTriangle,
  Globe, Link2, GitBranch, Workflow, ArrowUpDown, RotateCcw, Mic,
  Smartphone, Monitor,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

// --- Types ---

interface SyncLog {
  id: string;
  sync_type: string;
  status: string;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_skipped: number;
  records_failed: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  details_json: Record<string, unknown>;
}

interface GHLConfig {
  messaging_mode: "DRY_RUN" | "LIVE";
  sms_enabled: boolean;
  email_enabled: boolean;
  sync_interval_minutes: number;
  default_sender: string;
  rate_limit: number;
  pipeline_id: string;
  pipeline_stage_mapping: Record<string, string>;
  workflow_routing: Record<string, string>;
  contact_sync_enabled: boolean;
  inbound_sync_enabled: boolean;
  callback_calendar_id: string;
}

interface HealthStats {
  threads: number;
  messages: number;
  calls: number;
  inboundToday: number;
  outboundToday: number;
  failedToday: number;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  unsyncedContacts: number;
  failedSends: number;
  orphanedThreads: number;
}

// --- Helpers ---

function parseConfigValue(raw: unknown, fallback: unknown): unknown {
  if (raw === null || raw === undefined) return fallback;
  try {
    const val = typeof raw === "string" ? JSON.parse(raw) : raw;
    return val;
  } catch {
    return raw;
  }
}

// --- Main Component ---

export default function GHLIntegrationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("health");

  // Fetch config
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["ghl-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_settings")
        .select("key, value")
        .like("key", "ghl.%");
      if (error) throw error;

      const cfg: GHLConfig = {
        messaging_mode: "DRY_RUN",
        sms_enabled: true,
        email_enabled: true,
        sync_interval_minutes: 5,
        default_sender: "Calsan Dumpsters Pro",
        rate_limit: 6,
        pipeline_id: "",
        pipeline_stage_mapping: {},
        workflow_routing: {},
        contact_sync_enabled: true,
        inbound_sync_enabled: true,
        callback_calendar_id: "",
      };

      for (const row of data || []) {
        const val = parseConfigValue(row.value, null);
        switch (row.key) {
          case "ghl.messaging_mode": cfg.messaging_mode = val as "DRY_RUN" | "LIVE"; break;
          case "ghl.sms_enabled": cfg.sms_enabled = val === true || val === "true"; break;
          case "ghl.email_enabled": cfg.email_enabled = val === true || val === "true"; break;
          case "ghl.sync_interval_minutes": cfg.sync_interval_minutes = parseInt(String(val)) || 5; break;
          case "ghl.default_sender": cfg.default_sender = String(val || "Calsan Dumpsters Pro"); break;
          case "ghl.rate_limit_per_phone_per_day": cfg.rate_limit = parseInt(String(val)) || 6; break;
          case "ghl.pipeline_id": cfg.pipeline_id = String(val || ""); break;
          case "ghl.pipeline_stage_mapping": cfg.pipeline_stage_mapping = (typeof val === "object" && val) ? val as Record<string, string> : {}; break;
          case "ghl.workflow_routing": cfg.workflow_routing = (typeof val === "object" && val) ? val as Record<string, string> : {}; break;
          case "ghl.contact_sync_enabled": cfg.contact_sync_enabled = val === true || val === "true"; break;
          case "ghl.inbound_sync_enabled": cfg.inbound_sync_enabled = val === true || val === "true"; break;
          case "ghl.callback_calendar_id": cfg.callback_calendar_id = String(val || ""); break;
        }
      }
      return cfg;
    },
  });

  // Fetch health stats
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["ghl-health"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [threads, messages, calls, inboundToday, outboundToday, failedToday, lastSync, unsyncedContacts, failedSends, orphanedThreads] = await Promise.all([
        supabase.from("ghl_message_threads").select("id", { count: "exact", head: true }),
        supabase.from("ghl_messages").select("id", { count: "exact", head: true }),
        supabase.from("ghl_call_logs").select("id", { count: "exact", head: true }),
        supabase.from("ghl_messages").select("id", { count: "exact", head: true }).eq("direction", "INBOUND").gte("created_at", todayISO),
        supabase.from("ghl_messages").select("id", { count: "exact", head: true }).eq("direction", "OUTBOUND").gte("created_at", todayISO),
        supabase.from("ghl_messages").select("id", { count: "exact", head: true }).eq("status", "FAILED").gte("created_at", todayISO),
        supabase.from("ghl_sync_log").select("completed_at, status").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        // Customers without ghl_contact_id
        supabase.from("customers").select("id", { count: "exact", head: true }).is("ghl_contact_id" as any, null),
        // Failed outbound sends (last 7 days)
        supabase.from("ghl_messages").select("id", { count: "exact", head: true }).eq("status", "FAILED").eq("direction", "OUTBOUND"),
        // Threads without customer/lead match
        supabase.from("ghl_message_threads").select("id", { count: "exact", head: true }).is("customer_id", null).is("lead_id", null),
      ]);

      return {
        threads: threads.count || 0,
        messages: messages.count || 0,
        calls: calls.count || 0,
        inboundToday: inboundToday.count || 0,
        outboundToday: outboundToday.count || 0,
        failedToday: failedToday.count || 0,
        lastSyncAt: lastSync.data?.completed_at || null,
        lastSyncStatus: lastSync.data?.status || null,
        unsyncedContacts: unsyncedContacts.count || 0,
        failedSends: failedSends.count || 0,
        orphanedThreads: orphanedThreads.count || 0,
      } as HealthStats;
    },
    refetchInterval: 30000,
  });

  // Fetch sync logs
  const { data: syncLogs, isLoading: syncLogsLoading } = useQuery({
    queryKey: ["ghl-sync-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ghl_sync_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as SyncLog[];
    },
  });

  // Trigger manual sync
  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ghl-sync-poller", {});
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Sync completed: ${data.results?.conversations?.created || 0} new conversations`);
      queryClient.invalidateQueries({ queryKey: ["ghl-sync-logs"] });
      queryClient.invalidateQueries({ queryKey: ["ghl-health"] });
    },
    onError: (error: Error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  // Update config
  const updateConfigMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("config_settings")
        .update({ value: JSON.stringify(value) })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ghl-config"] });
      toast.success("Configuration updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  // Update JSON config
  const updateJsonConfigMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, string> }) => {
      const { error } = await supabase
        .from("config_settings")
        .update({ value: JSON.stringify(value) })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ghl-config"] });
      toast.success("Configuration updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED": return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "FAILED": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case "IN_PROGRESS":
      case "STARTED": return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1 animate-spin" /> Running</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            GHL Integration Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            GoHighLevel — Communications & Automation Layer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config?.messaging_mode === "LIVE" ? "default" : "secondary"} className="text-sm px-3 py-1">
            {config?.messaging_mode === "LIVE" ? <><Wifi className="w-3 h-3 mr-1" /> LIVE</> : <><WifiOff className="w-3 h-3 mr-1" /> DRY RUN</>}
          </Badge>
          <Button size="sm" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
            {syncMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Sync Now
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="health"><HeartPulse className="w-4 h-4 mr-1.5" />Health</TabsTrigger>
          <TabsTrigger value="voice"><Mic className="w-4 h-4 mr-1.5" />Voice</TabsTrigger>
          <TabsTrigger value="providers"><Phone className="w-4 h-4 mr-1.5" />Providers</TabsTrigger>
          <TabsTrigger value="pipeline"><ArrowUpDown className="w-4 h-4 mr-1.5" />Pipeline</TabsTrigger>
          <TabsTrigger value="workflows"><Workflow className="w-4 h-4 mr-1.5" />Workflows</TabsTrigger>
          <TabsTrigger value="sync"><Users className="w-4 h-4 mr-1.5" />Sync</TabsTrigger>
          <TabsTrigger value="webhooks"><Link2 className="w-4 h-4 mr-1.5" />Webhooks</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1.5" />Settings</TabsTrigger>
        </TabsList>

        {/* ─── VOICE / CALLING TAB ─── */}
        <TabsContent value="voice">
          <VoiceCallingTab config={config} configLoading={configLoading} updateConfigMutation={updateConfigMutation} />
        </TabsContent>

        {/* ─── HEALTH TAB ─── */}
        <TabsContent value="health">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <HealthCard title="Conversations" value={health?.threads || 0} icon={<MessageSquare className="w-4 h-4" />} loading={healthLoading} />
            <HealthCard title="Messages" value={health?.messages || 0} icon={<Mail className="w-4 h-4" />} loading={healthLoading} />
            <HealthCard title="Call Logs" value={health?.calls || 0} icon={<Phone className="w-4 h-4" />} loading={healthLoading} />
            <HealthCard
              title="Last Sync"
              value={health?.lastSyncAt ? formatDistanceToNow(new Date(health.lastSyncAt), { addSuffix: true }) : "Never"}
              icon={<RefreshCw className="w-4 h-4" />}
              loading={healthLoading}
              status={health?.lastSyncStatus === "COMPLETED" ? "ok" : health?.lastSyncStatus === "FAILED" ? "error" : "warn"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inbound Today</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-blue-600">{health?.inboundToday || 0}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Outbound Today</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{health?.outboundToday || 0}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Failed Today</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-destructive">{health?.failedToday || 0}</div></CardContent></Card>
          </div>

          {/* Failure Queue */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Issues & Failures
              </CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <IssueCard label="Unsynced Contacts" count={health?.unsyncedContacts || 0} description="Customers without GHL contact ID" severity={health?.unsyncedContacts ? "warn" : "ok"} />
                <IssueCard label="Failed Outbound Sends" count={health?.failedSends || 0} description="Messages that failed to send" severity={health?.failedSends ? "error" : "ok"} />
                <IssueCard label="Orphaned Threads" count={health?.orphanedThreads || 0} description="Threads not matched to customer or lead" severity={health?.orphanedThreads ? "warn" : "ok"} />
              </div>
            </CardContent>
          </Card>

          {/* Architecture Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Architecture</CardTitle>
              <CardDescription>Calsan CRM = Source of Truth · GHL = Communications Layer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Calsan Owns</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Leads, Quotes, Pricing</li><li>• Contracts, Payments, Billing</li>
                    <li>• Orders, Dispatch, Drivers</li><li>• Customer Identity & Timeline</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> GHL Handles</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SMS Sending (LC Phone)</li><li>• Email Sending (LC Email)</li>
                    <li>• Call Routing (LC Phone)</li><li>• Workflows & Automations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── PROVIDERS TAB ─── */}
        <TabsContent value="providers">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Channel Providers</CardTitle>
                <CardDescription>Default mode: LC Phone for SMS/Calls, LC Email for Email (via GHL)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProviderRow icon={<MessageSquare className="w-5 h-5 text-blue-600" />} label="SMS" provider="LC Phone (via GHL)"
                  enabled={config?.sms_enabled ?? true} onToggle={(v) => updateConfigMutation.mutate({ key: "ghl.sms_enabled", value: v ? "true" : "false" })} configLoading={configLoading} />
                <Separator />
                <ProviderRow icon={<Phone className="w-5 h-5 text-green-600" />} label="Voice Calls" provider="LC Phone (via GHL)"
                  enabled={true} onToggle={() => {}} configLoading={configLoading} readOnly note="Call routing managed in GHL settings" />
                <Separator />
                <ProviderRow icon={<Mail className="w-5 h-5 text-purple-600" />} label="Email" provider="LC Email (via GHL)"
                  enabled={config?.email_enabled ?? true} onToggle={(v) => updateConfigMutation.mutate({ key: "ghl.email_enabled", value: v ? "true" : "false" })} configLoading={configLoading} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Secondary Providers (Available)</CardTitle>
                <CardDescription>Can be activated as fallback or replacement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <SecondaryProvider icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />} name="Twilio (SMS/Voice)" description="Native telephony with OTP, call routing" status="Configured" />
                <SecondaryProvider icon={<Mail className="w-4 h-4 text-muted-foreground" />} name="Resend (Email)" description="Transactional emails, receipts, invites" status="Configured" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── PIPELINE TAB ─── */}
        <TabsContent value="pipeline">
          <PipelineTab config={config} configLoading={configLoading} updateConfigMutation={updateConfigMutation} updateJsonConfigMutation={updateJsonConfigMutation} />
        </TabsContent>

        {/* ─── WORKFLOWS TAB ─── */}
        <TabsContent value="workflows">
          <WorkflowRoutingTab config={config} configLoading={configLoading} updateJsonConfigMutation={updateJsonConfigMutation} />
        </TabsContent>

        {/* ─── SYNC TAB ─── */}
        <TabsContent value="sync">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sync History</CardTitle>
                <CardDescription>GHL → Calsan conversation, message, and call synchronization</CardDescription>
              </div>
              <Button size="sm" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                Sync Now
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 border rounded-lg bg-muted/30">
                <h4 className="text-sm font-medium mb-1">Contact Matching</h4>
                <p className="text-xs text-muted-foreground">
                  Contacts are matched by normalized 10-digit phone suffix. GHL contact IDs are stored on matched
                  customers/leads for future lookups. Unknown numbers create new leads via lead-ingest.
                </p>
              </div>
              {syncLogsLoading ? (
                <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : syncLogs?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No sync history yet. Click "Sync Now" to start.</div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {syncLogs?.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {getStatusBadge(log.status)}
                          <div>
                            <p className="font-medium text-sm">{log.sync_type} Sync</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(log.started_at), "MMM d, h:mm a")} · {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <p><span className="font-medium">{log.records_processed}</span> processed</p>
                          <p className="text-muted-foreground">{log.records_created} created · {log.records_updated} updated · {log.records_failed} failed</p>
                          {log.error_message && <p className="text-destructive mt-1">{log.error_message}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── WEBHOOKS TAB ─── */}
        <TabsContent value="webhooks">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Canonical Webhook Endpoints</CardTitle>
                <CardDescription>Configure these URLs in GoHighLevel Settings → Webhooks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <WebhookRow label="Inbound Messages / Calls / Conversations" url={`${supabaseUrl}/functions/v1/ghl-webhook-inbound`}
                  description="Handles inbound SMS, email, call events, and conversation updates. Creates timeline events, matches contacts, creates notifications." status="active" />
                <Separator />
                <WebhookRow label="Contact Sync (from Public Quotes)" url={`${supabaseUrl}/functions/v1/highlevel-webhook`}
                  description="Creates/updates GHL contacts when customers submit quotes on the public website." status="active" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Outbound Edge Functions</CardTitle>
                <CardDescription>Functions used by Calsan CRM to send messages via GHL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">ghl-send-outbound</span>
                    <Badge variant="default">Canonical</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Sends SMS/Email via GHL API. Supports DRY_RUN mode, opt-out compliance, template rendering, contact resolution, timeline event creation, and full audit logging.</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">ghl-sync-poller</span>
                    <Badge variant="secondary">Polling</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Polls GHL API for recent conversations, messages, and call logs. Recommended: trigger every 5 minutes via external cron.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /> Deprecated / Removed Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <code>ghl-send-message</code> — Merged into ghl-send-outbound</li>
                  <li>• <code>ghl-message-worker</code> — Queue processor (deleted)</li>
                  <li>• <code>ghl-inbound-webhook</code> — Duplicate of ghl-webhook-inbound (deleted)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── SETTINGS TAB ─── */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>GHL Configuration</CardTitle>
              <CardDescription>Core integration settings stored in config_settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {configLoading ? <Skeleton className="h-32 w-full" /> : (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Messaging Mode</Label>
                      <p className="text-sm text-muted-foreground">DRY_RUN: Messages logged only. LIVE: Messages sent via GHL.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={config?.messaging_mode === "DRY_RUN" ? "font-medium text-sm" : "text-muted-foreground text-sm"}>DRY_RUN</span>
                      <Switch checked={config?.messaging_mode === "LIVE"} onCheckedChange={(checked) => updateConfigMutation.mutate({ key: "ghl.messaging_mode", value: checked ? "LIVE" : "DRY_RUN" })} />
                      <span className={config?.messaging_mode === "LIVE" ? "font-medium text-sm text-green-600" : "text-muted-foreground text-sm"}>LIVE</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div><Label className="text-base font-medium">SMS Sending</Label><p className="text-sm text-muted-foreground">Enable/disable outbound SMS via GHL</p></div>
                    <Switch checked={config?.sms_enabled} onCheckedChange={(checked) => updateConfigMutation.mutate({ key: "ghl.sms_enabled", value: checked ? "true" : "false" })} />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div><Label className="text-base font-medium">Email Sending</Label><p className="text-sm text-muted-foreground">Enable/disable outbound email via GHL</p></div>
                    <Switch checked={config?.email_enabled} onCheckedChange={(checked) => updateConfigMutation.mutate({ key: "ghl.email_enabled", value: checked ? "true" : "false" })} />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div><Label className="text-base font-medium">Contact Sync</Label><p className="text-sm text-muted-foreground">Auto-sync new contacts to GHL</p></div>
                    <Switch checked={config?.contact_sync_enabled} onCheckedChange={(checked) => updateConfigMutation.mutate({ key: "ghl.contact_sync_enabled", value: checked ? "true" : "false" })} />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div><Label className="text-base font-medium">Inbound Sync</Label><p className="text-sm text-muted-foreground">Process inbound messages/calls from GHL</p></div>
                    <Switch checked={config?.inbound_sync_enabled} onCheckedChange={(checked) => updateConfigMutation.mutate({ key: "ghl.inbound_sync_enabled", value: checked ? "true" : "false" })} />
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
                    <Label className="text-base font-medium">Connection Details</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">API Version:</span> <span className="font-mono">v1 (Private Token)</span></div>
                      <div><span className="text-muted-foreground">API Key:</span> <Badge variant="outline">HIGHLEVEL_API_KEY ✓</Badge></div>
                      <div><span className="text-muted-foreground">Location ID:</span> <Badge variant="outline">HIGHLEVEL_LOCATION_ID ✓</Badge></div>
                      <div><span className="text-muted-foreground">Rate Limit:</span> <span>{config?.rate_limit} SMS/phone/day</span></div>
                      <div><span className="text-muted-foreground">Default Sender:</span> <span>{config?.default_sender}</span></div>
                      <div><span className="text-muted-foreground">Sync Interval:</span> <span>{config?.sync_interval_minutes} min</span></div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── SUB-COMPONENTS ───

function HealthCard({ title, value, icon, loading, status }: {
  title: string; value: string | number; icon: React.ReactNode; loading: boolean; status?: "ok" | "warn" | "error";
}) {
  const borderClass = status === "error" ? "border-destructive/50" : status === "warn" ? "border-amber-300" : "";
  return (
    <Card className={borderClass}>
      <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">{icon} {title}</CardTitle></CardHeader>
      <CardContent>{loading ? <Skeleton className="h-8 w-16" /> : <div className="text-xl font-bold">{value}</div>}</CardContent>
    </Card>
  );
}

function IssueCard({ label, count, description, severity }: {
  label: string; count: number; description: string; severity: "ok" | "warn" | "error";
}) {
  return (
    <div className={`p-4 rounded-lg border ${severity === "error" ? "border-destructive/50 bg-destructive/5" : severity === "warn" ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20" : "border-border bg-muted/30"}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <Badge variant={severity === "error" ? "destructive" : severity === "warn" ? "secondary" : "outline"}>{count}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ProviderRow({ icon, label, provider, enabled, onToggle, configLoading, readOnly, note }: {
  icon: React.ReactNode; label: string; provider: string; enabled: boolean; onToggle: (v: boolean) => void; configLoading: boolean; readOnly?: boolean; note?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{provider}</div>
          {note && <div className="text-xs text-amber-600 mt-0.5">{note}</div>}
        </div>
      </div>
      {configLoading ? <Skeleton className="h-5 w-10" /> : readOnly ? <Badge variant="outline">Active</Badge> : <Switch checked={enabled} onCheckedChange={onToggle} />}
    </div>
  );
}

function SecondaryProvider({ icon, name, description, status }: { icon: React.ReactNode; name: string; description: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-3">
        {icon}
        <div><div className="text-sm font-medium">{name}</div><div className="text-xs text-muted-foreground">{description}</div></div>
      </div>
      <Badge variant="outline">{status}</Badge>
    </div>
  );
}

function WebhookRow({ label, url, description, status }: { label: string; url: string; description: string; status: "active" | "inactive" }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
      </div>
      <code className="text-xs bg-muted p-2 rounded block break-all font-mono">{url}</code>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

// ─── PIPELINE TAB ───

const CALSAN_STAGES = [
  { key: "lead_new", label: "New Lead" },
  { key: "lead_contacted", label: "Contacted" },
  { key: "quote_started", label: "Quote Started" },
  { key: "price_shown", label: "Price Shown" },
  { key: "contract_pending", label: "Contract Pending" },
  { key: "payment_pending", label: "Payment Pending" },
  { key: "ready_for_dispatch", label: "Ready for Dispatch" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

function PipelineTab({ config, configLoading, updateConfigMutation, updateJsonConfigMutation }: {
  config: GHLConfig | undefined; configLoading: boolean;
  updateConfigMutation: ReturnType<typeof useMutation<void, Error, { key: string; value: string }>>;
  updateJsonConfigMutation: ReturnType<typeof useMutation<void, Error, { key: string; value: Record<string, string> }>>;
}) {
  const [localMapping, setLocalMapping] = useState<Record<string, string>>({});
  const [pipelineId, setPipelineId] = useState("");
  const [dirty, setDirty] = useState(false);

  // Sync from config
  useState(() => {
    if (config) {
      setLocalMapping(config.pipeline_stage_mapping || {});
      setPipelineId(config.pipeline_id || "");
    }
  });

  const handleStageChange = (calsanKey: string, ghlName: string) => {
    setLocalMapping((prev) => ({ ...prev, [calsanKey]: ghlName }));
    setDirty(true);
  };

  const handleSave = () => {
    updateJsonConfigMutation.mutate({ key: "ghl.pipeline_stage_mapping", value: localMapping });
    if (pipelineId !== config?.pipeline_id) {
      updateConfigMutation.mutate({ key: "ghl.pipeline_id", value: pipelineId });
    }
    setDirty(false);
  };

  if (configLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><GitBranch className="w-4 h-4" /> Pipeline Stage Mapping</CardTitle>
          <CardDescription>Map Calsan pipeline stages to GHL opportunity stages. Stages update automatically when lead status changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>GHL Pipeline ID</Label>
            <Input value={pipelineId} onChange={(e) => { setPipelineId(e.target.value); setDirty(true); }} placeholder="Enter GHL Pipeline ID..." className="font-mono mt-1" />
            <p className="text-xs text-muted-foreground mt-1">Find this in GHL → Settings → Pipelines</p>
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground px-1">
              <span>Calsan Stage</span><span>GHL Stage Name</span>
            </div>
            {CALSAN_STAGES.map((stage) => (
              <div key={stage.key} className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{stage.label}</Badge>
                </div>
                <Input
                  value={localMapping[stage.key] || ""}
                  onChange={(e) => handleStageChange(stage.key, e.target.value)}
                  placeholder={stage.label}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={!dirty || updateJsonConfigMutation.isPending}>
              {updateJsonConfigMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Mapping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── WORKFLOW ROUTING TAB ───

const CALSAN_EVENTS = [
  { key: "lead_created", label: "Lead Created", description: "Triggered when a new lead enters Calsan" },
  { key: "quote_started", label: "Quote Started", description: "Customer begins quote/calculator flow" },
  { key: "contract_sent", label: "Contract Sent", description: "Contract sent to customer for signature" },
  { key: "payment_pending", label: "Payment Pending", description: "Payment link sent, awaiting payment" },
  { key: "order_completed", label: "Order Completed", description: "Dumpster picked up, order closed" },
];

function WorkflowRoutingTab({ config, configLoading, updateJsonConfigMutation }: {
  config: GHLConfig | undefined; configLoading: boolean;
  updateJsonConfigMutation: ReturnType<typeof useMutation<void, Error, { key: string; value: Record<string, string> }>>;
}) {
  const [localRouting, setLocalRouting] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  useState(() => {
    if (config) {
      setLocalRouting(config.workflow_routing || {});
    }
  });

  const handleChange = (eventKey: string, workflowId: string) => {
    setLocalRouting((prev) => ({ ...prev, [eventKey]: workflowId }));
    setDirty(true);
  };

  const handleSave = () => {
    updateJsonConfigMutation.mutate({ key: "ghl.workflow_routing", value: localRouting });
    setDirty(false);
  };

  if (configLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Workflow className="w-4 h-4" /> Event → Workflow Routing</CardTitle>
        <CardDescription>Map Calsan CRM events to GHL Workflow IDs. When an event occurs, the corresponding GHL workflow is triggered.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 border rounded-lg bg-muted/30 text-xs text-muted-foreground">
          <strong>How to get Workflow IDs:</strong> In GHL, go to Automation → Workflows. Click on a workflow and copy the ID from the URL.
        </div>
        <div className="space-y-3">
          {CALSAN_EVENTS.map((event) => (
            <div key={event.key} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{event.label}</span>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
                {localRouting[event.key] ? (
                  <Badge variant="default" className="text-xs">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Not Set</Badge>
                )}
              </div>
              <Input
                value={localRouting[event.key] || ""}
                onChange={(e) => handleChange(event.key, e.target.value)}
                placeholder="GHL Workflow ID..."
                className="font-mono text-sm"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={!dirty || updateJsonConfigMutation.isPending}>
            {updateJsonConfigMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Routing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
