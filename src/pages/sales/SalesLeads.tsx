import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, FileText, Phone, Plus, Search, Filter, 
  Clock, CheckCircle2, XCircle, Loader2, TrendingUp,
  AlertTriangle, Shield, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getSlaDuration, formatElapsed } from "@/services/leadScoringService";
import { format } from "date-fns";

interface Lead {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  company_name: string | null;
  lead_source: string | null;
  source_key: string | null;
  channel_key: string | null;
  lead_status: string;
  lead_quality_score: number | null;
  lead_risk_score: number | null;
  lead_quality_label: string | null;
  first_response_at: string | null;
  first_response_sent_at: string | null;
  last_activity_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
  city: string | null;
  zip: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-800", icon: Clock },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-800", icon: Phone },
  qualified: { label: "Qualified", color: "bg-purple-100 text-purple-800", icon: TrendingUp },
  quoted: { label: "Quoted", color: "bg-indigo-100 text-indigo-800", icon: FileText },
  converted: { label: "Won", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  lost: { label: "Lost", color: "bg-red-100 text-red-800", icon: XCircle },
};

const QUALITY_COLORS: Record<string, string> = {
  GREEN: "bg-green-100 text-green-800",
  AMBER: "bg-yellow-100 text-yellow-800",
  RED: "bg-red-100 text-red-800",
};

const SLA_BADGE: Record<string, { label: string; className: string }> = {
  on_track: { label: "✓", className: "bg-green-100 text-green-800" },
  at_risk: { label: "⚠", className: "bg-yellow-100 text-yellow-800" },
  breached: { label: "!", className: "bg-red-100 text-red-800" },
};

const SOURCE_OPTIONS = ["website", "phone", "referral", "google_ads", "ghl", "meta", "yelp", "other"];

export default function SalesLeads() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isSales, isAdmin } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    company_name: "",
    lead_source: "website",
    notes: "",
  });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { fetchLeads(); }, []);

  async function fetchLeads() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sales_leads")
        .select("id, customer_name, customer_phone, customer_email, company_name, lead_source, source_key, channel_key, lead_status, lead_quality_score, lead_risk_score, lead_quality_label, first_response_at, first_response_sent_at, last_activity_at, last_contacted_at, created_at, city, zip")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setLeads(data as Lead[]);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading leads", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  function openAddDialog() {
    setForm({ customer_name: "", customer_phone: "", customer_email: "", company_name: "", lead_source: "website", notes: "" });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      const { error } = await supabase.from("sales_leads").insert({
        customer_name: form.customer_name || null,
        customer_phone: form.customer_phone || null,
        customer_email: form.customer_email || null,
        company_name: form.company_name || null,
        lead_source: form.lead_source,
        notes: form.notes || null,
        assigned_to: user?.id,
      });
      if (error) throw error;
      toast({ title: "Lead created" });
      setDialogOpen(false);
      fetchLeads();
    } catch (err) {
      console.error(err);
      toast({ title: "Error saving lead", variant: "destructive" });
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = !searchTerm || 
      lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customer_phone?.includes(searchTerm) ||
      lead.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.lead_status === statusFilter;
    const matchesQuality = qualityFilter === "all" || lead.lead_quality_label === qualityFilter;

    // Special filters
    if (statusFilter === "sla_breached") {
      const sla = getSlaDuration(lead.created_at, lead.first_response_at || lead.first_response_sent_at);
      return matchesSearch && matchesQuality && sla.status === 'breached';
    }
    if (statusFilter === "uncontacted") {
      return matchesSearch && matchesQuality && lead.lead_status === 'new' && !lead.first_response_at && !lead.first_response_sent_at;
    }

    return matchesSearch && matchesStatus && matchesQuality;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.lead_status === "new").length,
    breached: leads.filter(l => {
      const sla = getSlaDuration(l.created_at, l.first_response_at || l.first_response_sent_at);
      return sla.status === 'breached' && l.lead_status === 'new';
    }).length,
    highRisk: leads.filter(l => l.lead_quality_label === 'RED').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Leads</h1>
          <p className="text-muted-foreground">Lead intelligence & follow-up monitoring</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-sm text-muted-foreground">Total Leads</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <p className="text-sm text-muted-foreground">New</p>
        </CardContent></Card>
        <Card className={stats.breached > 0 ? "border-destructive/50" : ""}><CardContent className="pt-6">
          <div className="text-2xl font-bold text-red-600">{stats.breached}</div>
          <p className="text-sm text-muted-foreground">SLA Breached</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="text-2xl font-bold text-orange-600">{stats.highRisk}</div>
          <p className="text-sm text-muted-foreground">High Risk</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="uncontacted">⚡ New & Uncontacted</SelectItem>
            <SelectItem value="sla_breached">🔴 SLA Breached</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, c]) => (
              <SelectItem key={key} value={key}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={qualityFilter} onValueChange={setQualityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All Quality" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quality</SelectItem>
            <SelectItem value="GREEN">🟢 Green</SelectItem>
            <SelectItem value="AMBER">🟡 Amber</SelectItem>
            <SelectItem value="RED">🔴 Red</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No leads found</TableCell>
                </TableRow>
              ) : (
                filteredLeads.map(lead => {
                  const sla = getSlaDuration(lead.created_at, lead.first_response_at || lead.first_response_sent_at);
                  const ageMinutes = Math.floor((now.getTime() - new Date(lead.created_at).getTime()) / 60000);
                  const lastActMin = lead.last_activity_at ? Math.floor((now.getTime() - new Date(lead.last_activity_at).getTime()) / 60000) : null;
                  const statusConfig = STATUS_CONFIG[lead.lead_status] || STATUS_CONFIG.new;
                  const slaBadge = SLA_BADGE[sla.status];
                  const qualityColor = QUALITY_COLORS[lead.lead_quality_label || 'GREEN'];

                  return (
                    <TableRow 
                      key={lead.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/sales/leads/${lead.id}`)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.customer_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{lead.customer_phone}</p>
                          {lead.city && <p className="text-xs text-muted-foreground">{lead.city}{lead.zip ? `, ${lead.zip}` : ''}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {lead.source_key || lead.channel_key || lead.lead_source || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono">{formatElapsed(ageMinutes)}</TableCell>
                      <TableCell>
                        <Badge className={`${slaBadge.className} text-xs`}>
                          {slaBadge.label} {sla.responseMinutes !== null ? formatElapsed(sla.responseMinutes) : formatElapsed(sla.elapsedMinutes)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${qualityColor} text-xs`}>
                          {lead.lead_quality_label || 'GREEN'} {lead.lead_quality_score ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {lastActMin !== null ? formatElapsed(lastActMin) + ' ago' : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Lead</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="John Smith" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} placeholder="(510) 555-1234" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lead Source</Label>
              <Select value={form.lead_source} onValueChange={v => setForm({ ...form, lead_source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
