import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Phone,
  RefreshCw,
  Settings,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  Play,
  Mail,
  Users,
  Shield,
  HeartPulse,
  AlertTriangle,
  Globe,
  Link2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

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
}

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
      };

      for (const row of data || []) {
        const rawValue = row.value as string;
        try {
          const val = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
          if (row.key === "ghl.messaging_mode") cfg.messaging_mode = val;
          if (row.key === "ghl.sms_enabled") cfg.sms_enabled = val === true || val === "true";
          if (row.key === "ghl.email_enabled") cfg.email_enabled = val === true || val === "true";
          if (row.key === "ghl.sync_interval_minutes") cfg.sync_interval_minutes = parseInt(val) || 5;
          if (row.key === "ghl.default_sender") cfg.default_sender = String(val);
          if (row.key === "ghl.rate_limit_per_phone_per_day") cfg.rate_limit = parseInt(val) || 6;
        } catch {
          if (row.key === "ghl.messaging_mode") cfg.messaging_mode = rawValue as "DRY_RUN" | "LIVE";
          if (row.key === "ghl.sms_enabled") cfg.sms_enabled = rawValue === "true";
          if (row.key === "ghl.email_enabled") cfg.email_enabled = rawValue === "true";
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

      const [threads, messages, calls, inboundToday, outboundToday, failedToday, lastSync] = await Promise.all([
        supabase.from("ghl_message_threads").select("id", { count: "exact", head: true }),
        supabase.from("ghl_messages").select("id", { count: "exact", head: true }),
        supabase.from("ghl_call_logs").select("id", { count: "exact", head: true }),
        supabase.from("ghl_messages").select("id", { count: "exact", head: true })
          .eq("direction", "INBOUND").gte("created_at", todayISO),
        supabase.from("ghl_messages").select("id", { count: "exact", head: true })
          .eq("direction", "OUTBOUND").gte("created_at", todayISO),
        supabase.from("ghl_messages").select("id", { count: "exact", head: true })
          .eq("status", "FAILED").gte("created_at", todayISO),
        supabase.from("ghl_sync_log").select("completed_at, status")
          .order("created_at", { ascending: false }).limit(1).maybeSingle(),
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "FAILED":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case "IN_PROGRESS":
      case "STARTED":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1 animate-spin" /> Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
            {config?.messaging_mode === "LIVE" ? (
              <><Wifi className="w-3 h-3 mr-1" /> LIVE</>
            ) : (
              <><WifiOff className="w-3 h-3 mr-1" /> DRY RUN</>
            )}
          </Badge>
          <Button size="sm" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
            {syncMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Sync Now
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="health"><HeartPulse className="w-4 h-4 mr-1.5" />Health</TabsTrigger>
          <TabsTrigger value="providers"><Phone className="w-4 h-4 mr-1.5" />Providers</TabsTrigger>
          <TabsTrigger value="sync"><Users className="w-4 h-4 mr-1.5" />Sync</TabsTrigger>
          <TabsTrigger value="webhooks"><Link2 className="w-4 h-4 mr-1.5" />Webhooks</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1.5" />Settings</TabsTrigger>
        </TabsList>

        {/* HEALTH TAB */}
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Inbound Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{health?.inboundToday || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Outbound Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{health?.outboundToday || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Failed Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{health?.failedToday || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Architecture Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Architecture</CardTitle>
              <CardDescription>Calsan CRM = Source of Truth · GHL = Communications Layer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> Calsan Owns
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Leads, Quotes, Pricing</li>
                    <li>• Contracts, Payments, Billing</li>
                    <li>• Orders, Dispatch, Drivers</li>
                    <li>• Customer Identity & Timeline</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" /> GHL Handles
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SMS Sending (LC Phone)</li>
                    <li>• Email Sending (LC Email)</li>
                    <li>• Call Routing (LC Phone)</li>
                    <li>• Workflows & Automations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROVIDERS TAB */}
        <TabsContent value="providers">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Channel Providers</CardTitle>
                <CardDescription>Default mode: LC Phone for SMS/Calls, LC Email for Email (via GHL)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProviderRow
                  icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
                  label="SMS"
                  provider="LC Phone (via GHL)"
                  enabled={config?.sms_enabled ?? true}
                  onToggle={(v) => updateConfigMutation.mutate({ key: "ghl.sms_enabled", value: v ? "true" : "false" })}
                  configLoading={configLoading}
                />
                <Separator />
                <ProviderRow
                  icon={<Phone className="w-5 h-5 text-green-600" />}
                  label="Voice Calls"
                  provider="LC Phone (via GHL)"
                  enabled={true}
                  onToggle={() => {}}
                  configLoading={configLoading}
                  readOnly
                  note="Call routing managed in GHL settings"
                />
                <Separator />
                <ProviderRow
                  icon={<Mail className="w-5 h-5 text-purple-600" />}
                  label="Email"
                  provider="LC Email (via GHL)"
                  enabled={config?.email_enabled ?? true}
                  onToggle={(v) => updateConfigMutation.mutate({ key: "ghl.email_enabled", value: v ? "true" : "false" })}
                  configLoading={configLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Secondary Providers (Available)</CardTitle>
                <CardDescription>Can be activated as fallback or replacement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Twilio (SMS/Voice)</div>
                      <div className="text-xs text-muted-foreground">Native telephony with OTP, call routing</div>
                    </div>
                  </div>
                  <Badge variant="outline">Configured</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Resend (Email)</div>
                      <div className="text-xs text-muted-foreground">Transactional emails, receipts, invites</div>
                    </div>
                  </div>
                  <Badge variant="outline">Configured</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SYNC TAB */}
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
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : syncLogs?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sync history yet. Click "Sync Now" to start.
                </div>
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
                              {format(new Date(log.started_at), "MMM d, h:mm a")}
                              {" · "}
                              {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <p><span className="font-medium">{log.records_processed}</span> processed</p>
                          <p className="text-muted-foreground">
                            {log.records_created} created · {log.records_updated} updated · {log.records_failed} failed
                          </p>
                          {log.error_message && (
                            <p className="text-destructive mt-1">{log.error_message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEBHOOKS TAB */}
        <TabsContent value="webhooks">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Canonical Webhook Endpoints</CardTitle>
                <CardDescription>Configure these URLs in GoHighLevel Settings → Webhooks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <WebhookRow
                  label="Inbound Messages / Calls / Conversations"
                  url={`${supabaseUrl}/functions/v1/ghl-webhook-inbound`}
                  description="Handles inbound SMS, email, call events, and conversation updates. Creates timeline events, matches contacts, creates notifications."
                  status="active"
                />
                <Separator />
                <WebhookRow
                  label="Contact Sync (from Public Quotes)"
                  url={`${supabaseUrl}/functions/v1/highlevel-webhook`}
                  description="Creates/updates GHL contacts when customers submit quotes on the public website. Adds quote notes to GHL contacts."
                  status="active"
                />
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
                  <p className="text-xs text-muted-foreground">
                    Sends SMS/Email via GHL API. Supports DRY_RUN mode, opt-out compliance, template rendering,
                    contact resolution (by customer_id, lead_id, contact_id, or raw phone/email), timeline event creation, and full audit logging.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">ghl-sync-poller</span>
                    <Badge variant="secondary">Polling</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Polls GHL API for recent conversations, messages, and call logs. Matches contacts via ghl_match_contact.
                    Recommended: trigger every 5 minutes via external cron.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Deprecated / Removed Functions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <code>ghl-send-message</code> — Merged into ghl-send-outbound (deleted)</li>
                  <li>• <code>ghl-message-worker</code> — Queue processor for ghl-send-message (deleted)</li>
                  <li>• <code>ghl-inbound-webhook</code> — Simpler duplicate of ghl-webhook-inbound (deleted)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>GHL Configuration</CardTitle>
              <CardDescription>Core integration settings stored in config_settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {configLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <>
                  {/* Messaging Mode */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Messaging Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        DRY_RUN: Messages logged only. LIVE: Messages sent via GHL.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={config?.messaging_mode === "DRY_RUN" ? "font-medium text-sm" : "text-muted-foreground text-sm"}>
                        DRY_RUN
                      </span>
                      <Switch
                        checked={config?.messaging_mode === "LIVE"}
                        onCheckedChange={(checked) =>
                          updateConfigMutation.mutate({
                            key: "ghl.messaging_mode",
                            value: checked ? "LIVE" : "DRY_RUN",
                          })
                        }
                      />
                      <span className={config?.messaging_mode === "LIVE" ? "font-medium text-sm text-green-600" : "text-muted-foreground text-sm"}>
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* SMS Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">SMS Sending</Label>
                      <p className="text-sm text-muted-foreground">Enable/disable outbound SMS via GHL</p>
                    </div>
                    <Switch
                      checked={config?.sms_enabled}
                      onCheckedChange={(checked) =>
                        updateConfigMutation.mutate({ key: "ghl.sms_enabled", value: checked ? "true" : "false" })
                      }
                    />
                  </div>

                  {/* Email Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Email Sending</Label>
                      <p className="text-sm text-muted-foreground">Enable/disable outbound email via GHL</p>
                    </div>
                    <Switch
                      checked={config?.email_enabled}
                      onCheckedChange={(checked) =>
                        updateConfigMutation.mutate({ key: "ghl.email_enabled", value: checked ? "true" : "false" })
                      }
                    />
                  </div>

                  {/* Connection Info */}
                  <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
                    <Label className="text-base font-medium">Connection Details</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">API Version:</span>{" "}
                        <span className="font-mono">v1 (Private Token)</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">API Key:</span>{" "}
                        <Badge variant="outline">HIGHLEVEL_API_KEY ✓</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location ID:</span>{" "}
                        <Badge variant="outline">HIGHLEVEL_LOCATION_ID ✓</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rate Limit:</span>{" "}
                        <span>{config?.rate_limit} SMS/phone/day</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Default Sender:</span>{" "}
                        <span>{config?.default_sender}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sync Interval:</span>{" "}
                        <span>{config?.sync_interval_minutes} min</span>
                      </div>
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

// --- Sub-components ---

function HealthCard({ title, value, icon, loading, status }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading: boolean;
  status?: "ok" | "warn" | "error";
}) {
  const borderClass = status === "error" ? "border-red-300" : status === "warn" ? "border-amber-300" : "";
  return (
    <Card className={borderClass}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-16" /> : (
          <div className="text-xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

function ProviderRow({ icon, label, provider, enabled, onToggle, configLoading, readOnly, note }: {
  icon: React.ReactNode;
  label: string;
  provider: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  configLoading: boolean;
  readOnly?: boolean;
  note?: string;
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
      {configLoading ? <Skeleton className="h-5 w-10" /> : (
        readOnly ? (
          <Badge variant="outline">Active</Badge>
        ) : (
          <Switch checked={enabled} onCheckedChange={onToggle} />
        )
      )}
    </div>
  );
}

function WebhookRow({ label, url, description, status }: {
  label: string;
  url: string;
  description: string;
  status: "active" | "inactive";
}) {
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
