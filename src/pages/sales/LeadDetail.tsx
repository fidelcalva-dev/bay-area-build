import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, Phone, Mail, MessageSquare, FileText, User,
  AlertTriangle, CheckCircle2, Shield, Globe, Loader2, MapPin,
  Building2, Tag, ExternalLink, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getSlaDuration, formatElapsed } from "@/services/leadScoringService";
import { format } from "date-fns";
import FollowUpPanel from "@/components/sales/FollowUpPanel";
import { RiskCheckPanel } from "@/components/fraud";

interface LeadData {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  company_name: string | null;
  company_domain: string | null;
  lead_source: string | null;
  source_key: string | null;
  channel_key: string | null;
  lead_status: string;
  assignment_type: string | null;
  assigned_to: string | null;
  city: string | null;
  zip: string | null;
  address: string | null;
  customer_type_detected: string | null;
  project_category: string | null;
  urgency_score: number | null;
  consent_status: string | null;
  notes: string | null;
  sales_notes: string | null;
  lead_quality_score: number | null;
  lead_risk_score: number | null;
  lead_quality_label: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  landing_url: string | null;
  referrer_url: string | null;
  first_response_at: string | null;
  first_response_sent_at: string | null;
  last_activity_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadAction {
  id: string;
  action_type: string;
  action_status: string;
  performed_by_user_id: string | null;
  provider: string | null;
  summary: string | null;
  created_at: string;
}

interface LeadAlert {
  id: string;
  alert_type: string;
  severity: string;
  message: string | null;
  is_resolved: boolean;
  created_at: string;
}

const QUALITY_COLORS: Record<string, string> = {
  GREEN: "bg-green-100 text-green-800",
  AMBER: "bg-yellow-100 text-yellow-800",
  RED: "bg-red-100 text-red-800",
};

const SLA_COLORS: Record<string, string> = {
  on_track: "bg-green-100 text-green-800",
  at_risk: "bg-yellow-100 text-yellow-800",
  breached: "bg-red-100 text-red-800",
};

const ACTION_ICONS: Record<string, typeof Phone> = {
  CALL_OUT: Phone,
  CALL_IN: Phone,
  SMS_OUT: MessageSquare,
  SMS_IN: MessageSquare,
  EMAIL_OUT: Mail,
  EMAIL_IN: Mail,
  NOTE: FileText,
  QUOTE_CREATED: FileText,
  ORDER_CREATED: FileText,
  STATUS_CHANGE: Tag,
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAdminAuth();
  const [lead, setLead] = useState<LeadData | null>(null);
  const [actions, setActions] = useState<LeadAction[]>([]);
  const [alerts, setAlerts] = useState<LeadAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(new Date());

  // Live timer
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [leadRes, actionsRes, alertsRes] = await Promise.all([
        supabase.from("sales_leads").select("*").eq("id", id).single(),
        supabase.from("lead_actions").select("*").eq("lead_id", id).order("created_at", { ascending: false }).limit(100),
        supabase.from("lead_alerts").select("*").eq("lead_id", id).order("created_at", { ascending: false }).limit(50),
      ]);

      if (leadRes.error) throw leadRes.error;
      setLead(leadRes.data as unknown as LeadData);
      setActions((actionsRes.data || []) as unknown as LeadAction[]);
      setAlerts((alertsRes.data || []) as unknown as LeadAlert[]);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading lead", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addNote = async () => {
    if (!noteText.trim() || !id || !user) return;
    setSaving(true);
    try {
      await supabase.from("lead_actions").insert({
        lead_id: id,
        action_type: "NOTE",
        performed_by_user_id: user.id,
        summary: noteText.trim(),
        provider: "SYSTEM",
      });
      setNoteText("");
      toast({ title: "Note added" });
      fetchAll();
    } catch (err) {
      toast({ title: "Error adding note", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const logAction = async (actionType: string, summary: string) => {
    if (!id || !user) return;
    await supabase.from("lead_actions").insert({
      lead_id: id,
      action_type: actionType,
      performed_by_user_id: user.id,
      summary,
      provider: "SYSTEM",
    });
    fetchAll();
  };

  if (isLoading || !lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sla = getSlaDuration(lead.created_at, lead.first_response_at || lead.first_response_sent_at);
  const lastActivityMinutes = lead.last_activity_at
    ? Math.floor((now.getTime() - new Date(lead.last_activity_at).getTime()) / 60000)
    : null;
  const lastContactMinutes = lead.last_contacted_at
    ? Math.floor((now.getTime() - new Date(lead.last_contacted_at).getTime()) / 60000)
    : null;
  const unresolvedAlerts = alerts.filter(a => !a.is_resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{lead.customer_name || "Unknown Lead"}</h1>
            <Badge className={QUALITY_COLORS[lead.lead_quality_label || 'GREEN']}>
              {lead.lead_quality_label || 'GREEN'}
            </Badge>
            <Badge className={SLA_COLORS[sla.status]}>
              SLA: {sla.status === 'on_track' ? '✓ On Track' : sla.status === 'at_risk' ? '⚠ At Risk' : '🔴 Breached'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {lead.company_name && `${lead.company_name} · `}
            {lead.city && `${lead.city} · `}
            Created {format(new Date(lead.created_at), "MMM d, yyyy h:mm a")}
          </p>
        </div>
      </div>

      {/* SLA Timer Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5" /> Lead Age
            </div>
            <p className="text-xl font-bold">{formatElapsed(sla.elapsedMinutes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Phone className="w-3.5 h-3.5" /> First Response
            </div>
            <p className="text-xl font-bold">
              {sla.responseMinutes !== null ? formatElapsed(sla.responseMinutes) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MessageSquare className="w-3.5 h-3.5" /> Last Activity
            </div>
            <p className="text-xl font-bold">
              {lastActivityMinutes !== null ? formatElapsed(lastActivityMinutes) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Mail className="w-3.5 h-3.5" /> Last Contact
            </div>
            <p className="text-xl font-bold">
              {lastContactMinutes !== null ? formatElapsed(lastContactMinutes) : "Never"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Unresolved Alerts */}
      {unresolvedAlerts.length > 0 && (
        <Card className="border-destructive/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold text-sm">{unresolvedAlerts.length} Active Alert(s)</span>
            </div>
            <div className="space-y-2">
              {unresolvedAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between text-sm p-2 rounded bg-destructive/5">
                  <span>{alert.alert_type.replace(/_/g, ' ')} — {alert.message || alert.severity}</span>
                  <Badge variant="outline" className="text-xs">{alert.severity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Check Panel (compact) */}
      <RiskCheckPanel
        entityType="LEAD"
        entityId={lead.id}
        email={lead.customer_email}
        phone={lead.customer_phone}
        customerName={lead.customer_name}
        companyName={lead.company_name}
        address={lead.address}
        zip={lead.zip}
        compact
      />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => {
          if (lead.customer_phone) window.open(`tel:${lead.customer_phone}`);
          logAction('CALL_OUT', `Called ${lead.customer_phone}`);
        }}>
          <Phone className="w-4 h-4 mr-1" /> Call
        </Button>
        <Button size="sm" variant="outline" onClick={() => {
          if (lead.customer_phone) window.open(`sms:${lead.customer_phone}`);
          logAction('SMS_OUT', `SMS to ${lead.customer_phone}`);
        }}>
          <MessageSquare className="w-4 h-4 mr-1" /> SMS
        </Button>
        <Button size="sm" variant="outline" onClick={() => {
          if (lead.customer_email) window.open(`mailto:${lead.customer_email}`);
          logAction('EMAIL_OUT', `Email to ${lead.customer_email}`);
        }}>
          <Mail className="w-4 h-4 mr-1" /> Email
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate(`/quote?lead_id=${lead.id}`)}>
          <FileText className="w-4 h-4 mr-1" /> Create Quote
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({actions.length})</TabsTrigger>
          <TabsTrigger value="attribution">Source & Attribution</TabsTrigger>
          <TabsTrigger value="scoring">Risk & Quality</TabsTrigger>
          <TabsTrigger value="riskcheck">Risk Check</TabsTrigger>
          <TabsTrigger value="followup">Follow-Up</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4" /> Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{lead.customer_name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{lead.customer_phone || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{lead.customer_email || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{lead.customer_type_detected || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Consent</span><span>{lead.consent_status || '—'}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Building2 className="w-4 h-4" /> Company & Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Company</span><span>{lead.company_name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Domain</span><span>{lead.company_domain || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span>{lead.address || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">City</span><span>{lead.city || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ZIP</span><span>{lead.zip || '—'}</span></div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Tag className="w-4 h-4" /> Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{lead.project_category || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span>{lead.source_key || lead.channel_key || lead.lead_source || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline">{lead.lead_status}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Assignment</span><span>{lead.assignment_type || '—'}</span></div>
              {lead.notes && (
                <>
                  <Separator />
                  <p className="text-muted-foreground">{lead.notes}</p>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline">
          <Card>
            <CardContent className="pt-6">
              {actions.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No actions recorded yet</p>
              ) : (
                <div className="space-y-4">
                  {actions.map(action => {
                    const Icon = ACTION_ICONS[action.action_type] || Tag;
                    return (
                      <div key={action.id} className="flex gap-3 items-start">
                        <div className="mt-0.5 p-1.5 rounded-full bg-muted">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{action.action_type.replace(/_/g, ' ')}</span>
                            {action.action_status !== 'SUCCESS' && (
                              <Badge variant="outline" className="text-xs">{action.action_status}</Badge>
                            )}
                            {action.provider && (
                              <Badge variant="secondary" className="text-xs">{action.provider}</Badge>
                            )}
                          </div>
                          {action.summary && (
                            <p className="text-sm text-muted-foreground mt-0.5">{action.summary}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(action.created_at), "MMM d, yyyy h:mm a")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attribution */}
        <TabsContent value="attribution">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> Source Attribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">UTM Source</span><span>{lead.utm_source || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">UTM Medium</span><span>{lead.utm_medium || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">UTM Campaign</span><span>{lead.utm_campaign || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">UTM Term</span><span>{lead.utm_term || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">UTM Content</span><span>{lead.utm_content || '—'}</span></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">GCLID</span><span className="truncate max-w-[200px]">{lead.gclid || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Source Key</span><span>{lead.source_key || lead.channel_key || '—'}</span></div>
                </div>
              </div>
              {lead.landing_url && (
                <div>
                  <span className="text-muted-foreground text-xs">Landing URL</span>
                  <p className="text-xs truncate">{lead.landing_url}</p>
                </div>
              )}
              {lead.referrer_url && (
                <div>
                  <span className="text-muted-foreground text-xs">Referrer</span>
                  <p className="text-xs truncate">{lead.referrer_url}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring */}
        <TabsContent value="scoring">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" /> Quality Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-bold">{lead.lead_quality_score ?? 0}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${lead.lead_quality_score ?? 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" /> Risk Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-bold">{lead.lead_risk_score ?? 0}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${lead.lead_risk_score ?? 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Check (full) */}
        <TabsContent value="riskcheck">
          <RiskCheckPanel
            entityType="LEAD"
            entityId={lead.id}
            email={lead.customer_email}
            phone={lead.customer_phone}
            customerName={lead.customer_name}
            companyName={lead.company_name}
            address={lead.address}
            zip={lead.zip}
          />
        </TabsContent>

        {/* Follow-Up Scripts */}
        <TabsContent value="followup">
          {user && (
            <FollowUpPanel
              lead={lead}
              userId={user.id}
              onActionLogged={fetchAll}
            />
          )}
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={addNote} disabled={saving || !noteText.trim()}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                </Button>
              </div>
              <Separator />
              {actions.filter(a => a.action_type === 'NOTE').map(note => (
                <div key={note.id} className="p-3 rounded bg-muted/50 text-sm">
                  <p>{note.summary}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(note.created_at), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              ))}
              {lead.sales_notes && (
                <div className="p-3 rounded bg-muted/50 text-sm">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Sales Notes (legacy)</p>
                  <p>{lead.sales_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
