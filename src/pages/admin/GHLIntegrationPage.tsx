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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
}

export default function GHLIntegrationPage() {
  const queryClient = useQueryClient();

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

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["ghl-stats"],
    queryFn: async () => {
      const [threads, messages, calls] = await Promise.all([
        supabase.from("ghl_message_threads").select("id", { count: "exact", head: true }),
        supabase.from("ghl_messages").select("id", { count: "exact", head: true }),
        supabase.from("ghl_call_logs").select("id", { count: "exact", head: true }),
      ]);
      return {
        threads: threads.count || 0,
        messages: messages.count || 0,
        calls: calls.count || 0,
      };
    },
  });

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
      };

      for (const row of data || []) {
        const rawValue = row.value as string;
        try {
          const val = JSON.parse(rawValue);
          if (row.key === "ghl.messaging_mode") cfg.messaging_mode = val;
          if (row.key === "ghl.sms_enabled") cfg.sms_enabled = val === true || val === "true";
          if (row.key === "ghl.email_enabled") cfg.email_enabled = val === true || val === "true";
          if (row.key === "ghl.sync_interval_minutes") cfg.sync_interval_minutes = parseInt(val) || 5;
        } catch {
          // Handle non-JSON values
          if (row.key === "ghl.messaging_mode") cfg.messaging_mode = rawValue as "DRY_RUN" | "LIVE";
          if (row.key === "ghl.sms_enabled") cfg.sms_enabled = rawValue === "true";
          if (row.key === "ghl.email_enabled") cfg.email_enabled = rawValue === "true";
        }
      }

      return cfg;
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
      queryClient.invalidateQueries({ queryKey: ["ghl-stats"] });
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            GHL Integration
          </h1>
          <p className="text-muted-foreground">GoHighLevel messaging and call sync</p>
        </div>
        <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
          {syncMutation.isPending ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          Sync Now
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Messaging Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {config?.messaging_mode === "LIVE" ? (
                <>
                  <Wifi className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">LIVE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-amber-500" />
                  <span className="text-2xl font-bold text-amber-600">DRY_RUN</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.threads || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.messages || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Call Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.calls || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sync" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sync">
            <Activity className="w-4 h-4 mr-2" />
            Sync History
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Recent GHL synchronization runs</CardDescription>
            </CardHeader>
            <CardContent>
              {syncLogsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : syncLogs?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sync history yet. Click "Sync Now" to start.
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {syncLogs?.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          {getStatusBadge(log.status)}
                          <div>
                            <p className="font-medium">{log.sync_type} Sync</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(log.started_at), "MMM d, h:mm a")}
                              {" · "}
                              {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p>
                            <span className="font-medium">{log.records_processed}</span> processed
                          </p>
                          <p className="text-muted-foreground">
                            {log.records_created} created · {log.records_updated} updated · {log.records_failed} failed
                          </p>
                          {log.error_message && (
                            <p className="text-destructive text-xs mt-1">{log.error_message}</p>
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

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>GHL Configuration</CardTitle>
              <CardDescription>Manage GoHighLevel integration settings</CardDescription>
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
                        DRY_RUN: Messages are logged but not sent. LIVE: Messages are sent via GHL.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={config?.messaging_mode === "DRY_RUN" ? "font-medium" : "text-muted-foreground"}>
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
                      <span className={config?.messaging_mode === "LIVE" ? "font-medium text-green-600" : "text-muted-foreground"}>
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* SMS Enabled */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">SMS Sending</Label>
                      <p className="text-sm text-muted-foreground">Enable or disable SMS sending via GHL</p>
                    </div>
                    <Switch
                      checked={config?.sms_enabled}
                      onCheckedChange={(checked) =>
                        updateConfigMutation.mutate({
                          key: "ghl.sms_enabled",
                          value: checked ? "true" : "false",
                        })
                      }
                    />
                  </div>

                  {/* Email Enabled */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Email Sending</Label>
                      <p className="text-sm text-muted-foreground">Enable or disable email sending via GHL</p>
                    </div>
                    <Switch
                      checked={config?.email_enabled}
                      onCheckedChange={(checked) =>
                        updateConfigMutation.mutate({
                          key: "ghl.email_enabled",
                          value: checked ? "true" : "false",
                        })
                      }
                    />
                  </div>

                  {/* Webhook URL */}
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <Label className="text-base font-medium">GHL Webhook URL</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Configure this URL in GoHighLevel for inbound message/call webhooks:
                    </p>
                    <code className="text-sm bg-background p-2 rounded block break-all">
                      {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ghl-webhook-inbound`}
                    </code>
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
