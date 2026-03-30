import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Phone, Mail, MessageSquare, FileText, Search, Plus, Clock,
  CheckCircle2, XCircle, TrendingUp, AlertTriangle, Shield, Loader2,
  Download, Calendar, Filter, Inbox, UserCheck, Zap, LayoutGrid
} from "lucide-react";
import SalesPipelineBoard from "@/components/sales/SalesPipelineBoard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLeadHub, useLeadHubStats, type LeadHubTab, type LeadHubFilters, type LeadHubLead } from "@/hooks/useLeadHub";
import { formatElapsed } from "@/services/leadScoringService";
import { format } from "date-fns";
import { AddressesCell } from "@/components/leads/LeadAddresses";
import { LeadAddress } from "@/hooks/useLeadAddresses";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  contacted: { label: "Contacted", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  qualified: { label: "Qualified", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  quote_started: { label: "Quote Started", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" },
  price_shown: { label: "Price Shown", className: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" },
  contact_captured: { label: "Contact Captured", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  quote_created: { label: "Quote Created", className: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" },
  quoted: { label: "Quoted", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  quote_ready: { label: "Quote Ready", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
  quote_sent: { label: "Quote Sent", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  quote_accepted: { label: "Quote Accepted", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
  contract_sent: { label: "Contract Sent", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  contract_pending: { label: "Contract Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  contract_signed: { label: "Contract Signed", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  payment_pending: { label: "Payment Pending", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  payment_received: { label: "Paid", className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" },
  ready_for_dispatch: { label: "Ready for Dispatch", className: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300" },
  order_created: { label: "Order Created", className: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300" },
  converted: { label: "Won", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  lost: { label: "Lost", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  attention_required: { label: "Attention Required", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  dormant: { label: "Dormant", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
};

const QUALITY_COLORS: Record<string, string> = {
  GREEN: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  AMBER: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  RED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const TAB_CONFIG: { key: LeadHubTab; label: string; icon: typeof Inbox }[] = [
  { key: 'new', label: 'New', icon: Clock },
  { key: 'needs_followup', label: 'Needs Follow-Up', icon: MessageSquare },
  { key: 'my_leads', label: 'My Leads', icon: UserCheck },
  { key: 'high_intent', label: 'High Intent', icon: Zap },
  { key: 'existing_customer', label: 'Existing Customer', icon: UserCheck },
  { key: 'high_risk', label: 'High Risk', icon: Shield },
  { key: 'all', label: 'All', icon: Users },
];

const SERVICE_LINE_OPTIONS = [
  { value: 'all', label: 'All Services' },
  { value: 'DUMPSTER', label: 'Dumpster' },
  { value: 'CLEANUP', label: 'Cleanup' },
  { value: 'BOTH', label: 'Bundle' },
];

const SERVICE_LINE_COLORS: Record<string, string> = {
  DUMPSTER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  CLEANUP: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  BOTH: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

type ViewMode = 'list' | 'pipeline';

const SOURCE_LABELS: Record<string, string> = {
  QUOTE_FLOW: "Quote Flow",
  WEBSITE_QUOTE: "Website Quote",
  website_quote: "Website Quote",
  WEBSITE_ORDER_NOW: "Order Now",
  WEBSITE_CONTACT: "Contact Form",
  WEBSITE_FORM: "Website Form",
  WEBSITE_CHAT: "Website Chat",
  AI_CHAT: "AI Chat",
  AI_ASSISTANT: "AI Assistant",
  AI_EXPERT_REQUEST: "Expert Request",
  WEBSITE_ASSISTANT: "AI Assistant",
  WEBSITE_MEDIA: "Photo Upload",
  WEBSITE_PHOTO: "Photo Upload",
  WEBSITE_VIDEO: "Video Upload",
  SCHEDULE_DELIVERY: "Schedule Delivery",
  QUICK_ORDER: "Quick Order",
  PHONE_CALL: "Phone Call",
  PHONE_INBOUND: "Phone Inbound",
  SMS_INBOUND: "SMS",
  EMAIL_INBOUND: "Email",
  PORTAL: "Portal",
  GOOGLE_ADS: "Google Ads",
  GHL_SMS: "GHL SMS",
  GHL_EMAIL: "GHL Email",
  GHL_QUOTE: "GHL Quote",
  FB_MESSENGER: "Facebook",
  INSTAGRAM_DM: "Instagram",
  WHATSAPP: "WhatsApp",
  YELP: "Yelp",
  NEXTDOOR: "Nextdoor",
  REFERRAL: "Referral",
  GBP_CALL: "GBP Call",
  GBP_MESSAGE: "GBP Message",
  LEAD_PLATFORM: "Lead Platform",
  ANGI: "Angi",
  THUMBTACK: "Thumbtack",
  MANUAL_ENTRY: "Manual",
  CALLBACK_REQUEST: "Callback",
  CONTACT_FORM: "Contact Form",
  CLEANUP_WEBSITE: "Cleanup Website",
  CLEANUP_CONTACT: "Cleanup Contact",
  CLEANUP_CONTRACTOR: "Cleanup Contractor",
  CLEANUP_PHOTO_UPLOAD: "Cleanup Photos",
  CLEANUP_CALL: "Cleanup Call",
  CLEANUP_TEXT: "Cleanup Text",
};

export default function SalesLeads() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<LeadHubTab>('new');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [serviceLineFilter, setServiceLineFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [leadAddressesMap, setLeadAddressesMap] = useState<Record<string, LeadAddress[]>>({});

  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_email: "",
    company_name: "", source_channel: "MANUAL_ENTRY", notes: "",
    city: "", zip: "",
  });

  const filters: LeadHubFilters = useMemo(() => ({
    tab: activeTab,
    search: searchTerm || undefined,
    source: sourceFilter !== 'all' ? sourceFilter : undefined,
    quality: qualityFilter !== 'all' ? qualityFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }), [activeTab, searchTerm, sourceFilter, qualityFilter, dateFrom, dateTo]);

  const { leads, loading, totalCount, refetch } = useLeadHub(filters);
  const { stats } = useLeadHubStats();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Fetch addresses for visible leads
  useEffect(() => {
    if (leads.length === 0) return;
    const ids = leads.map(l => l.id);
    supabase
      .from("lead_addresses")
      .select("*")
      .in("lead_id", ids)
      .order("is_primary", { ascending: false })
      .then(({ data }) => {
        const map: Record<string, LeadAddress[]> = {};
        (data || []).forEach((a: any) => {
          if (!map[a.lead_id]) map[a.lead_id] = [];
          map[a.lead_id].push(a as LeadAddress);
        });
        setLeadAddressesMap(map);
      });
  }, [leads]);

  // Derive unique sources
  const uniqueSources = useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => {
      const src = l.channel_key || l.source_key;
      if (src) set.add(src);
    });
    return Array.from(set).sort();
  }, [leads]);

  async function handleAddLead() {
    try {
      // Use the ingest edge function for proper dedup + routing
      const response = await supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: form.source_channel,
          source_detail: 'MANUAL_ENTRY',
          name: form.customer_name || null,
          phone: form.customer_phone || null,
          email: form.customer_email || null,
          company_name: form.company_name || null,
          message: form.notes || null,
          city: form.city || null,
          zip: form.zip || null,
          performed_by_user_id: user?.id,
        },
      });

      if (response.error) throw response.error;
      toast({ title: "Lead created via Lead Hub" });
      setDialogOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      // Fallback to direct insert
      const { error } = await supabase.from("sales_leads").insert({
        customer_name: form.customer_name || null,
        customer_phone: form.customer_phone || null,
        customer_email: form.customer_email || null,
        company_name: form.company_name || null,
        channel_key: form.source_channel,
        source_key: form.source_channel,
        notes: form.notes || null,
        city: form.city || null,
        zip: form.zip || null,
        assigned_to: user?.id,
      });
      if (error) {
        toast({ title: "Error saving lead", variant: "destructive" });
        return;
      }
      toast({ title: "Lead created" });
      setDialogOpen(false);
      refetch();
    }
  }

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Lead Hub Report", 14, 18);
    doc.setFontSize(9);
    doc.text(`Generated: ${format(new Date(), "MMM d, yyyy h:mm a")} | ${leads.length} leads`, 14, 25);

    const rows = leads.map(lead => {
      const ageMin = Math.floor((now.getTime() - new Date(lead.created_at).getTime()) / 60000);
      const lastActMin = lead.last_activity_at ? Math.floor((now.getTime() - new Date(lead.last_activity_at).getTime()) / 60000) : null;
      return [
        `${lead.customer_name || '--'}\n${lead.customer_phone || ''}\n${lead.city || ''}`,
        lead.zip || '--',
        SOURCE_LABELS[lead.channel_key || ''] || lead.source_key || lead.channel_key || '--',
        formatElapsed(ageMin),
        `${lead.lead_quality_label || 'GREEN'} ${lead.lead_quality_score ?? 0}`,
        (STATUS_CONFIG[lead.lead_status] || STATUS_CONFIG.new).label,
        lastActMin !== null ? formatElapsed(lastActMin) + ' ago' : '--',
      ];
    });

    autoTable(doc, {
      startY: 30,
      head: [['Contact', 'ZIP', 'Source', 'Age', 'Quality', 'Status', 'Last Activity']],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    doc.save(`lead-hub-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  function getLeadSource(lead: LeadHubLead) {
    const key = lead.source_channel || lead.channel_key || lead.source_key || lead.lead_source || '';
    return SOURCE_LABELS[key] || key || '--';
  }

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="w-6 h-6" /> Lead Hub
          </h1>
          <p className="text-sm text-muted-foreground">Omni-channel inbox — every lead, one place</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'pipeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'pipeline' : 'list')}
          >
            <LayoutGrid className="w-4 h-4 mr-1" /> Pipeline
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <Download className="w-4 h-4 mr-1" /> PDF
          </Button>
          <Button size="sm" onClick={() => {
            setForm({ customer_name: "", customer_phone: "", customer_email: "", company_name: "", source_channel: "MANUAL_ENTRY", notes: "", city: "", zip: "" });
            setDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-1" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab('all')}>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:border-primary/50 transition-colors ${activeTab === 'new' ? 'border-primary' : ''}`} onClick={() => setActiveTab('new')}>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <p className="text-xs text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:border-primary/50 transition-colors ${activeTab === 'high_intent' ? 'border-primary' : ''}`} onClick={() => setActiveTab('high_intent')}>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-emerald-600">{stats.highIntent}</div>
            <p className="text-xs text-muted-foreground">Hot Leads</p>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:border-primary/50 transition-colors ${activeTab === 'needs_followup' ? 'border-primary' : ''}`} onClick={() => setActiveTab('needs_followup')}>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-yellow-600">{stats.needsFollowup}</div>
            <p className="text-xs text-muted-foreground">Follow-Up</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-violet-600">{stats.quotesPending}</div>
            <p className="text-xs text-muted-foreground">Quotes Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-cyan-600">{stats.jobsScheduled}</div>
            <p className="text-xs text-muted-foreground">Jobs Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
            <p className="text-xs text-muted-foreground">Converted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-primary">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Conv. Rate</p>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:border-primary/50 transition-colors ${activeTab === 'existing_customer' ? 'border-primary' : ''}`} onClick={() => setActiveTab('existing_customer')}>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-indigo-600">{stats.existingCustomer}</div>
            <p className="text-xs text-muted-foreground">Existing</p>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:border-primary/50 transition-colors ${activeTab === 'high_risk' ? 'border-primary' : ''}`} onClick={() => setActiveTab('high_risk')}>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-orange-600">{stats.highRisk}</div>
            <p className="text-xs text-muted-foreground">High Risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LeadHubTab)}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="h-auto flex-wrap">
            {TAB_CONFIG.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5 text-xs">
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search name, phone, email, city, zip..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {uniqueSources.map(s => (
                <SelectItem key={s} value={s}>{SOURCE_LABELS[s] || s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={qualityFilter} onValueChange={setQualityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quality</SelectItem>
              <SelectItem value="GREEN">Green</SelectItem>
              <SelectItem value="AMBER">Amber</SelectItem>
              <SelectItem value="RED">Red</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="default" className={`gap-2 ${dateFrom || dateTo ? 'border-primary text-primary' : ''}`}>
                <Calendar className="w-4 h-4" />
                {dateFrom || dateTo ? 'Date Active' : 'Date Range'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 space-y-3" align="end">
              <p className="text-sm font-medium">Filter by Created Date</p>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">From</label>
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">To</label>
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
              {(dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                  Clear
                </Button>
              )}
            </PopoverContent>
          </Popover>
          <span className="text-sm text-muted-foreground ml-auto">{leads.length} leads</span>
        </div>

        {/* Pipeline Board or Table */}
        {viewMode === 'pipeline' ? (
          <div className="mt-4">
            <SalesPipelineBoard leads={leads as any} onRefresh={refetch} />
          </div>
        ) : (
        <Card className="mt-4">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Contact</TableHead>
                  <TableHead>Addresses</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Action</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No leads found in this view
                    </TableCell>
                  </TableRow>
                ) : (
                  leads
                    .filter(lead => {
                      if (activeTab === 'my_leads' && user?.id) {
                        return lead.owner_user_id === user.id || lead.assigned_to === user.id;
                      }
                      return true;
                    })
                    .map(lead => {
                    const ageMinutes = Math.floor((now.getTime() - new Date(lead.created_at).getTime()) / 60000);
                    const statusConfig = STATUS_CONFIG[lead.lead_status] || STATUS_CONFIG.new;
                    const qualityColor = QUALITY_COLORS[lead.lead_quality_label || 'GREEN'];

                    // Build progress summary
                    const progressParts: string[] = [];
                    if (lead.selected_size || lead.latest_recommended_size) progressParts.push(`${lead.selected_size || lead.latest_recommended_size}yd`);
                    if (lead.material_category) progressParts.push(lead.material_category);
                    if (lead.quote_amount) progressParts.push(`$${lead.quote_amount}`);
                    if (lead.last_step_completed) progressParts.push(lead.last_step_completed.replace(/_/g, ' '));

                    return (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/sales/leads/${lead.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{lead.customer_name || "--"}</p>
                            <p className="text-xs text-muted-foreground">{lead.customer_phone}</p>
                            {lead.city && <p className="text-xs text-muted-foreground">{lead.city}{lead.zip ? `, ${lead.zip}` : ''}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <AddressesCell
                            addresses={leadAddressesMap[lead.id] || []}
                            leadZip={lead.zip}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getLeadSource(lead)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {progressParts.length > 0 ? (
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              {progressParts.map((p, i) => <span key={i} className="block">{p}</span>)}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">--</span>
                          )}
                          {lead.ai_conversation_summary && (
                            <p className="text-xs text-primary/70 mt-0.5 truncate max-w-[120px]" title={lead.ai_conversation_summary}>
                              🤖 {lead.ai_conversation_summary.slice(0, 40)}…
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${qualityColor} text-xs`}>
                            {lead.lead_quality_label || 'GREEN'} {lead.lead_quality_score ?? 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.className} text-xs`}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.next_best_action ? (
                            <Badge variant="secondary" className="text-xs">
                              {lead.next_best_action}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">{formatElapsed(ageMinutes)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                            {lead.customer_phone && (
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => window.open(`tel:${lead.customer_phone}`)}>
                                <Phone className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {lead.customer_phone && (
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => window.open(`sms:${lead.customer_phone}`)}>
                                <MessageSquare className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => navigate(`/sales/quotes/new?lead_id=${lead.id}`)}>
                              <FileText className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        )}
      </Tabs>

      {/* Add Lead Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Lead to Hub</DialogTitle></DialogHeader>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>ZIP</Label>
                <Input value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Source Channel</Label>
              <Select value={form.source_channel} onValueChange={v => setForm({ ...form, source_channel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes / Message</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLead} disabled={!form.customer_phone && !form.customer_email}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
