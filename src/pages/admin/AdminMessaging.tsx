import { useEffect, useState } from "react";
import { 
  MessageSquare, Mail, Send, RefreshCw, Settings, Check, X, Clock, 
  AlertTriangle, Loader2, ToggleLeft, ToggleRight 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getMessageQueue, getMessagingMode, setMessagingMode, type QueuedMessage, type MessageTemplate } from "@/lib/ghlMessaging";

export default function AdminMessaging() {
  const [mode, setMode] = useState<"DRY_RUN" | "LIVE">("DRY_RUN");
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueuedMessage[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [toggling, setToggling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [modeVal, queueData, templatesData] = await Promise.all([
        getMessagingMode(),
        getMessageQueue({}, 100),
        supabase.from("message_templates").select("*").order("category").order("name"),
      ]);
      setMode(modeVal);
      setQueue(queueData);
      setTemplates((templatesData.data || []).map((t: any) => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables.map(String) : [],
      })));
    } catch (err: any) {
      toast({ title: "Error loading data", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }

  async function handleToggleMode() {
    const newMode = mode === "DRY_RUN" ? "LIVE" : "DRY_RUN";
    
    if (newMode === "LIVE") {
      const confirmed = window.confirm(
        "⚠️ CAUTION: Switching to LIVE mode will send REAL messages to customers.\n\nAre you sure?"
      );
      if (!confirmed) return;
    }

    setToggling(true);
    try {
      await setMessagingMode(newMode);
      setMode(newMode);
      toast({ 
        title: `Mode changed to ${newMode}`,
        description: newMode === "LIVE" ? "Messages will now be sent to customers" : "Messages will only be logged",
      });
    } catch (err: any) {
      toast({ title: "Error changing mode", description: err.message, variant: "destructive" });
    }
    setToggling(false);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "SENT":
        return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" /> Sent</Badge>;
      case "DRY_RUN":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Dry Run</Badge>;
      case "PENDING":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "RETRYING":
        return <Badge className="bg-yellow-100 text-yellow-800"><RefreshCw className="w-3 h-3 mr-1" /> Retrying</Badge>;
      case "FAILED":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Failed</Badge>;
      case "SKIPPED":
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" /> Skipped</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: queue.length,
    sent: queue.filter(m => m.status === "SENT").length,
    dryRun: queue.filter(m => m.status === "DRY_RUN").length,
    pending: queue.filter(m => m.status === "PENDING" || m.status === "RETRYING").length,
    failed: queue.filter(m => m.status === "FAILED").length,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">GHL Messaging</h1>
          <p className="text-muted-foreground mt-1">
            Send SMS and Email via GoHighLevel
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Mode Toggle Card */}
      <Card className={`mb-6 border-2 ${mode === "LIVE" ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {mode === "LIVE" ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-yellow-600" />
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  Current Mode: <span className={mode === "LIVE" ? "text-green-700" : "text-yellow-700"}>{mode}</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {mode === "LIVE" 
                    ? "Messages are being sent to real customers" 
                    : "Messages are logged but not sent (safe testing mode)"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleToggleMode}
              disabled={toggling}
              variant={mode === "LIVE" ? "destructive" : "default"}
            >
              {toggling ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Settings className="w-4 h-4 mr-2" />
              )}
              Switch to {mode === "LIVE" ? "DRY_RUN" : "LIVE"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <div className="text-sm text-muted-foreground">Sent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-600">{stats.dryRun}</div>
            <div className="text-sm text-muted-foreground">Dry Run</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Message Queue</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Last 100 queued messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {queue.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {msg.channel === "sms" ? (
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Mail className="w-4 h-4 text-purple-600" />
                        )}
                        <span className="font-mono text-sm">{msg.to_address}</span>
                        {getStatusBadge(msg.status)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.created_at), "MMM d, HH:mm")}
                      </span>
                    </div>
                    {msg.subject && (
                      <div className="text-sm font-medium mb-1">{msg.subject}</div>
                    )}
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {msg.body}
                    </div>
                    {msg.error_message && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                        Error: {msg.error_message}
                      </div>
                    )}
                    {msg.template_key && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {msg.template_key}
                      </Badge>
                    )}
                  </div>
                ))}
                {queue.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages in queue
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Available templates for SMS and Email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {template.channel === "sms" ? (
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Mail className="w-4 h-4 text-purple-600" />
                          )}
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </div>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription className="font-mono text-xs">
                        {template.key}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {template.subject && (
                        <div className="text-sm font-medium mb-2">
                          Subject: {template.subject}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground bg-muted p-2 rounded max-h-32 overflow-y-auto">
                        {template.body}
                      </div>
                      {template.variables.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.variables.map((v, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {`{${v}}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {template.category && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {template.category}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
