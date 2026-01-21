import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, FileText, Phone, Plus, Search, Filter, 
  Clock, CheckCircle2, XCircle, Loader2, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { format } from "date-fns";

interface Lead {
  id: string;
  quote_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  company_name: string | null;
  lead_source: string | null;
  lead_status: string;
  notes: string | null;
  next_followup_at: string | null;
  created_at: string;
  quotes?: {
    zip_code: string;
    material_type: string;
    subtotal: number;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-800", icon: Clock },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-800", icon: Phone },
  qualified: { label: "Qualified", color: "bg-purple-100 text-purple-800", icon: TrendingUp },
  converted: { label: "Converted", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  lost: { label: "Lost", color: "bg-red-100 text-red-800", icon: XCircle },
};

const SOURCE_OPTIONS = ["website", "phone", "referral", "google_ads", "other"];

export default function SalesLeads() {
  const { toast } = useToast();
  const { user, isSales, isAdmin } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    company_name: "",
    lead_source: "website",
    notes: "",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sales_leads")
        .select(`
          *,
          quotes (zip_code, material_type, subtotal)
        `)
        .order("created_at", { ascending: false });

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
    setSelectedLead(null);
    setForm({
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      company_name: "",
      lead_source: "website",
      notes: "",
    });
    setDialogOpen(true);
  }

  function openEditDialog(lead: Lead) {
    setSelectedLead(lead);
    setForm({
      customer_name: lead.customer_name || "",
      customer_phone: lead.customer_phone || "",
      customer_email: lead.customer_email || "",
      company_name: lead.company_name || "",
      lead_source: lead.lead_source || "website",
      notes: lead.notes || "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      const data = {
        customer_name: form.customer_name || null,
        customer_phone: form.customer_phone || null,
        customer_email: form.customer_email || null,
        company_name: form.company_name || null,
        lead_source: form.lead_source,
        notes: form.notes || null,
        assigned_to: user?.id,
      };

      if (selectedLead) {
        const { error } = await supabase
          .from("sales_leads")
          .update(data)
          .eq("id", selectedLead.id);
        if (error) throw error;
        toast({ title: "Lead updated" });
      } else {
        const { error } = await supabase.from("sales_leads").insert(data);
        if (error) throw error;
        toast({ title: "Lead created" });
      }
      
      setDialogOpen(false);
      fetchLeads();
    } catch (err) {
      console.error(err);
      toast({ title: "Error saving lead", variant: "destructive" });
    }
  }

  async function updateLeadStatus(leadId: string, newStatus: string) {
    try {
      const updates: Record<string, unknown> = { lead_status: newStatus };
      if (newStatus === "converted") {
        updates.converted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("sales_leads")
        .update(updates)
        .eq("id", leadId);

      if (error) throw error;
      toast({ title: `Status updated to ${newStatus}` });
      fetchLeads();
    } catch (err) {
      toast({ title: "Error updating status", variant: "destructive" });
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customer_phone?.includes(searchTerm) ||
      lead.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.lead_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.lead_status === "new").length,
    qualified: leads.filter((l) => l.lead_status === "qualified").length,
    converted: leads.filter((l) => l.lead_status === "converted").length,
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
          <p className="text-muted-foreground">Manage and track your sales pipeline</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <p className="text-sm text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.qualified}</div>
            <p className="text-sm text-muted-foreground">Qualified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
            <p className="text-sm text-muted-foreground">Converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
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
                <TableHead>Company</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const statusConfig = STATUS_CONFIG[lead.lead_status] || STATUS_CONFIG.new;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEditDialog(lead)}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.customer_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{lead.customer_phone}</p>
                          <p className="text-xs text-muted-foreground">{lead.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{lead.company_name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.lead_source || "—"}</Badge>
                      </TableCell>
                      <TableCell>
                        {lead.quotes ? (
                          <div className="text-sm">
                            <p>{lead.quotes.zip_code}</p>
                            <p className="text-muted-foreground">${lead.quotes.subtotal}</p>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={lead.lead_status}
                          onValueChange={(v) => {
                            event?.stopPropagation();
                            updateLeadStatus(lead.id, v);
                          }}
                        >
                          <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedLead ? "Edit Lead" : "Add Lead"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  placeholder="(510) 555-1234"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lead Source</Label>
              <Select value={form.lead_source} onValueChange={(v) => setForm({ ...form, lead_source: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
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