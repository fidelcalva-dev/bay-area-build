import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FileText, DollarSign, Clock, CheckCircle2, 
  Search, Filter, Loader2, ArrowRight, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Quote {
  id: string;
  display_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  zip_code: string;
  material_type: string;
  subtotal: number;
  estimated_min: number;
  estimated_max: number;
  status: string;
  created_at: string;
  delivery_address: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  saved: { label: "Saved", color: "bg-blue-100 text-blue-800" },
  pinned: { label: "Pinned", color: "bg-purple-100 text-purple-800" },
  scheduled: { label: "Scheduled", color: "bg-green-100 text-green-800" },
  converted: { label: "Converted", color: "bg-emerald-100 text-emerald-800" },
  expired: { label: "Expired", color: "bg-red-100 text-red-800" },
};

export default function SalesQuotes() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  useEffect(() => {
    fetchQuotes();
  }, []);

  async function fetchQuotes() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setQuotes(data as Quote[]);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading quotes", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function convertToOrder(quoteId: string) {
    try {
      // Create order from quote
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          quote_id: quoteId,
          status: "scheduled",
        })
        .select()
        .single();

      if (error) throw error;

      // Update quote status
      await supabase
        .from("quotes")
        .update({ status: "converted", converted_at: new Date().toISOString() })
        .eq("id", quoteId);

      toast({ title: "Order created successfully" });
      navigate(`/admin/orders`);
    } catch (err) {
      console.error(err);
      toast({ title: "Error creating order", variant: "destructive" });
    }
  }

  async function markAsConverted(quoteId: string) {
    try {
      const { error } = await supabase
        .from("quotes")
        .update({ status: "converted", converted_at: new Date().toISOString() })
        .eq("id", quoteId);

      if (error) throw error;
      toast({ title: "Quote marked as converted" });
      fetchQuotes();
    } catch (err) {
      console.error(err);
      toast({ title: "Error updating quote", variant: "destructive" });
    }
  }

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch = 
      quote.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_phone?.includes(searchTerm) ||
      quote.zip_code.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: quotes.length,
    saved: quotes.filter((q) => q.status === "saved").length,
    scheduled: quotes.filter((q) => q.status === "scheduled").length,
    converted: quotes.filter((q) => q.status === "converted").length,
    totalValue: quotes.reduce((sum, q) => sum + q.subtotal, 0),
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
          <h1 className="text-2xl font-bold">Quotes</h1>
          <p className="text-muted-foreground">View and manage customer quotes</p>
        </div>
        <Button asChild>
          <Link to="/sales/quotes/new">
            <FileText className="w-4 h-4 mr-2" /> New Quote
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Quotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.saved}</div>
            <p className="text-sm text-muted-foreground">Saved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.scheduled}</div>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">{stats.converted}</div>
            <p className="text-sm text-muted-foreground">Converted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              ${(stats.totalValue / 1000).toFixed(0)}k
            </div>
            <p className="text-sm text-muted-foreground">Pipeline Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or ZIP..."
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

      {/* Quotes Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Estimate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No quotes found
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((quote) => {
                  const statusConfig = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;
                  const canConvert = ["saved", "scheduled", "pinned"].includes(quote.status);

                  return (
                    <TableRow key={quote.id} className="cursor-pointer" onClick={() => navigate(`/sales/quotes/${quote.id}`)}>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-primary">
                          {quote.display_id || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.customer_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{quote.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{quote.zip_code}</p>
                          {quote.delivery_address && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {quote.delivery_address}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{quote.material_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${quote.estimated_min.toFixed(0)} - ${quote.estimated_max.toFixed(0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(quote.created_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          {canConvert && (
                            <Button size="sm" onClick={() => convertToOrder(quote.id)}>
                              <ArrowRight className="w-4 h-4 mr-1" /> Convert
                            </Button>
                          )}
                          {quote.status !== "converted" && (
                            <Button size="sm" variant="outline" onClick={() => markAsConverted(quote.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Converted
                            </Button>
                          )}
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
    </div>
  );
}