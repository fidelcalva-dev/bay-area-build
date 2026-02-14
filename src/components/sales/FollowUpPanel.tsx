import { useState, useEffect } from "react";
import {
  Phone, MessageSquare, Mail, Copy, Send, AlertTriangle,
  Loader2, Zap, Ban, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  generateFollowUpScripts,
  type GeneratedScript,
  type FollowUpResult,
} from "@/services/followUpScriptService";

interface LeadForScripts {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  company_name: string | null;
  city: string | null;
  zip: string | null;
  customer_type_detected: string | null;
  project_category: string | null;
  lead_quality_label: string | null;
  lead_quality_score: number | null;
  lead_risk_score: number | null;
  lead_status: string;
  first_response_at: string | null;
  first_response_sent_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
  consent_status: string | null;
}

interface FollowUpPanelProps {
  lead: LeadForScripts;
  userId: string;
  onActionLogged: () => void;
}

const CHANNEL_ICONS = {
  CALL: Phone,
  SMS: MessageSquare,
  EMAIL: Mail,
};

const CHANNEL_LABELS = {
  CALL: "Call Script",
  SMS: "SMS Message",
  EMAIL: "Email",
};

export default function FollowUpPanel({ lead, userId, onActionLogged }: FollowUpPanelProps) {
  const { toast } = useToast();
  const [result, setResult] = useState<FollowUpResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedBodies, setEditedBodies] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  useEffect(() => {
    loadScripts();
  }, [lead.id, lead.lead_quality_label, lead.lead_status]);

  async function loadScripts() {
    setLoading(true);
    try {
      const res = await generateFollowUpScripts(lead);
      setResult(res);
      // Pre-fill editable bodies
      const bodies: Record<string, string> = {};
      res.scripts.forEach((s) => {
        bodies[s.channel] = s.body;
      });
      setEditedBodies(bodies);
    } catch (err) {
      console.error("Failed to generate scripts:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(channel: string) {
    const text = editedBodies[channel] || "";
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  }

  async function handleSend(script: GeneratedScript) {
    if (!script.canSend) return;
    setSending(script.channel);
    try {
      // Log the action
      const actionType = script.channel === "CALL" ? "CALL_OUT" :
                          script.channel === "SMS" ? "SMS_OUT" : "EMAIL_OUT";
      const body = editedBodies[script.channel] || script.body;

      await supabase.from("lead_actions").insert({
        lead_id: lead.id,
        action_type: actionType,
        performed_by_user_id: userId,
        summary: body.substring(0, 200),
        provider: "SYSTEM",
        action_status: "SUCCESS",
      });

      // Update lead contact timestamps
      await supabase.from("sales_leads").update({
        last_contacted_at: new Date().toISOString(),
        last_contacted_by_user_id: userId,
        last_activity_at: new Date().toISOString(),
        first_response_at: lead.first_response_at || new Date().toISOString(),
      }).eq("id", lead.id);

      if (script.channel === "CALL" && lead.customer_phone) {
        window.open(`tel:${lead.customer_phone}`);
      } else if (script.channel === "SMS" && lead.customer_phone) {
        window.open(`sms:${lead.customer_phone}?body=${encodeURIComponent(body)}`);
      } else if (script.channel === "EMAIL" && lead.customer_email) {
        const subject = script.subject || "Calsan Dumpsters Pro";
        window.open(`mailto:${lead.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      }

      toast({ title: `${script.channel} action logged` });
      onActionLogged();
    } catch (err) {
      toast({ title: "Error logging action", variant: "destructive" });
    } finally {
      setSending(null);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Generating scripts...</span>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  const isRed = lead.lead_quality_label === "RED";

  return (
    <div className="space-y-4">
      {/* Next Best Action */}
      <Card className={isRed ? "border-destructive/50" : "border-primary/30"}>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Next Best Action</span>
            <Badge variant={isRed ? "destructive" : "default"} className="ml-auto text-xs">
              {result.stage.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-sm mt-1 font-medium">{result.nextBestAction}</p>
          {isRed && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-destructive">
              <AlertTriangle className="w-3.5 h-3.5" />
              Payment links blocked — manual verification required
            </div>
          )}
        </CardContent>
      </Card>

      {/* Script Cards */}
      {result.scripts.map((script) => {
        const Icon = CHANNEL_ICONS[script.channel];
        const label = CHANNEL_LABELS[script.channel];
        const isExpanded = expandedChannel === script.channel;
        const body = editedBodies[script.channel] || script.body;

        return (
          <Card key={script.channel} className="overflow-hidden">
            <CardHeader
              className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedChannel(isExpanded ? null : script.channel)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon className="w-4 h-4" /> {label}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {!script.canSend && script.disabledReason && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      <Ban className="w-3 h-3 mr-1" />
                      {script.disabledReason}
                    </Badge>
                  )}
                  {script.canSend && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
              {script.subject && (
                <p className="text-xs text-muted-foreground mt-1">
                  Subject: {script.subject}
                </p>
              )}
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0 space-y-3">
                <Separator />
                <Textarea
                  value={body}
                  onChange={(e) =>
                    setEditedBodies((prev) => ({ ...prev, [script.channel]: e.target.value }))
                  }
                  rows={Math.min(10, Math.max(3, body.split("\n").length + 1))}
                  className="text-sm font-mono"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(script.channel)}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                  </Button>
                  <Button
                    size="sm"
                    disabled={!script.canSend || sending === script.channel}
                    onClick={() => handleSend(script)}
                  >
                    {sending === script.channel ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <Send className="w-3.5 h-3.5 mr-1" />
                    )}
                    {script.channel === "CALL" ? "Call & Log" : `Send ${script.channel}`}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
