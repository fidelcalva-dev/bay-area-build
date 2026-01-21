import { useState, useEffect } from "react";
import { 
  Search, FileText, Upload, Loader2, Download, Eye, 
  DollarSign, Scale, Calculator, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface OrderWithQuote {
  id: string;
  status: string;
  dump_ticket_url: string | null;
  final_total: number | null;
  payment_status: string | null;
  created_at: string;
  quotes: {
    id: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    material_type: string;
    heavy_material_class: string | null;
    subtotal: number;
    extra_tons_prepurchased: number | null;
    prepurchase_rate: number | null;
  } | null;
}

interface ServiceReceipt {
  id: string;
  quote_id: string;
  total_tons: number;
  included_tons: number | null;
  overage_tons: number | null;
  prepurchase_applied_tons: number | null;
  standard_overage_tons: number | null;
  overage_rate: number | null;
  overage_charge: number | null;
  ticket_url: string | null;
  ticket_number: string | null;
  facility_name: string | null;
  email_sent_at: string | null;
  sms_sent_at: string | null;
  created_at: string;
}

export default function TicketsManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<OrderWithQuote[]>([]);
  const [receipts, setReceipts] = useState<ServiceReceipt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithQuote | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [ticketForm, setTicketForm] = useState({
    total_tons: "",
    ticket_number: "",
    facility_name: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [ordersRes, receiptsRes] = await Promise.all([
        supabase
          .from("orders")
          .select(`
            id, status, dump_ticket_url, final_total, payment_status, created_at,
            quotes (
              id, customer_name, customer_phone, customer_email,
              material_type, heavy_material_class, subtotal,
              extra_tons_prepurchased, prepurchase_rate
            )
          `)
          .in("status", ["delivered", "pickup_scheduled", "completed"])
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("service_receipts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data as OrderWithQuote[]);
      if (receiptsRes.data) setReceipts(receiptsRes.data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  function openTicketDialog(order: OrderWithQuote) {
    setSelectedOrder(order);
    setTicketForm({
      total_tons: "",
      ticket_number: "",
      facility_name: "Oakland Transfer Station",
    });
    setTicketDialogOpen(true);
  }

  async function processTicket() {
    if (!selectedOrder || !selectedOrder.quotes) return;
    
    const totalTons = parseFloat(ticketForm.total_tons);
    if (isNaN(totalTons) || totalTons <= 0) {
      toast({ title: "Please enter valid tonnage", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    
    try {
      const quote = selectedOrder.quotes;
      const isHeavy = quote.heavy_material_class && quote.heavy_material_class !== "mixed";
      
      // Calculate overage based on pricing rules
      let includedTons = 0;
      let overageTons = 0;
      let prepurchaseApplied = 0;
      let standardOverage = 0;
      let overageRate = 165; // Default standard rate
      let overageCharge = 0;
      
      if (isHeavy) {
        // Heavy flat-fee: no overage charges, just record tons
        includedTons = totalTons;
        overageTons = 0;
        overageCharge = 0;
      } else {
        // Mixed debris: calculate overage
        // Assume included tons based on size (simplified - should come from dumpster_sizes)
        includedTons = 2; // Default, should be from size config
        overageTons = Math.max(0, totalTons - includedTons);
        
        if (overageTons > 0) {
          // Apply prepurchased tons first
          const prepurchased = quote.extra_tons_prepurchased || 0;
          const prepurchaseRate = quote.prepurchase_rate || 156.75;
          
          prepurchaseApplied = Math.min(prepurchased, overageTons);
          standardOverage = overageTons - prepurchaseApplied;
          
          overageCharge = (prepurchaseApplied * prepurchaseRate) + (standardOverage * overageRate);
        }
      }
      
      // Create service receipt
      const { error: receiptError } = await supabase.from("service_receipts").insert({
        quote_id: quote.id,
        total_tons: totalTons,
        included_tons: includedTons,
        overage_tons: overageTons,
        prepurchase_applied_tons: prepurchaseApplied,
        standard_overage_tons: standardOverage,
        overage_rate: overageRate,
        overage_charge: overageCharge,
        ticket_number: ticketForm.ticket_number || null,
        facility_name: ticketForm.facility_name || null,
        ticket_url: selectedOrder.dump_ticket_url,
        heavy_material_class: quote.heavy_material_class,
        pricing_rule: isHeavy ? "heavy_flatfee" : "mixed_perton",
      });

      if (receiptError) throw receiptError;
      
      // Update order with final total
      const finalTotal = quote.subtotal + overageCharge;
      await supabase
        .from("orders")
        .update({ 
          final_total: finalTotal,
          status: "completed"
        })
        .eq("id", selectedOrder.id);

      // Trigger receipt email/SMS
      try {
        await supabase.functions.invoke("send-service-receipt", {
          body: { order_id: selectedOrder.id, quote_id: quote.id },
        });
      } catch (e) {
        console.log("Receipt notification failed:", e);
      }

      toast({ title: "Ticket processed and receipt sent" });
      setTicketDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error processing ticket", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.quotes?.customer_name?.toLowerCase().includes(searchLower) ||
      order.quotes?.customer_phone?.includes(searchTerm) ||
      order.id.includes(searchTerm)
    );
  });

  const getReceiptForOrder = (quoteId: string) => {
    return receipts.find((r) => r.quote_id === quoteId);
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
          <h1 className="text-2xl font-bold">Tickets & Receipts</h1>
          <p className="text-muted-foreground">Process dump tickets and send customer receipts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{orders.filter((o) => !getReceiptForOrder(o.quotes?.id || "")).length}</div>
            <p className="text-sm text-muted-foreground">Pending Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{receipts.length}</div>
            <p className="text-sm text-muted-foreground">Processed Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${receipts.reduce((sum, r) => sum + (r.overage_charge || 0), 0).toFixed(0)}
            </div>
            <p className="text-sm text-muted-foreground">Overage Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {receipts.reduce((sum, r) => sum + r.total_tons, 0).toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Total Tons</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Completed Orders</CardTitle>
          <CardDescription>Process tickets for delivered orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const receipt = getReceiptForOrder(order.quotes?.id || "");
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.quotes?.customer_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{order.quotes?.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.quotes?.material_type}
                        </Badge>
                        {order.quotes?.heavy_material_class && (
                          <Badge variant="secondary" className="ml-1">
                            {order.quotes.heavy_material_class}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>${order.quotes?.subtotal?.toFixed(2)}</TableCell>
                      <TableCell>
                        {order.dump_ticket_url ? (
                          <a href={order.dump_ticket_url} target="_blank" rel="noopener noreferrer">
                            <Badge className="bg-green-100 text-green-800">
                              <FileText className="w-3 h-3 mr-1" /> Uploaded
                            </Badge>
                          </a>
                        ) : (
                          <Badge variant="outline">No ticket</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {receipt ? (
                          <div className="text-sm">
                            <p className="font-medium">{receipt.total_tons} tons</p>
                            {receipt.overage_charge ? (
                              <p className="text-green-600">+${receipt.overage_charge.toFixed(2)}</p>
                            ) : null}
                          </div>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          order.status === "completed" ? "bg-gray-100 text-gray-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!receipt && (
                          <Button size="sm" onClick={() => openTicketDialog(order)}>
                            <Calculator className="w-4 h-4 mr-1" /> Process
                          </Button>
                        )}
                        {receipt && (
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Process Ticket Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Dump Ticket</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* Order Summary */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedOrder.quotes?.customer_name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.quotes?.material_type} 
                  {selectedOrder.quotes?.heavy_material_class && ` • ${selectedOrder.quotes.heavy_material_class}`}
                </p>
                <p className="text-sm">Base: ${selectedOrder.quotes?.subtotal?.toFixed(2)}</p>
                {(selectedOrder.quotes?.extra_tons_prepurchased || 0) > 0 && (
                  <p className="text-sm text-blue-600">
                    Prepurchased: {selectedOrder.quotes?.extra_tons_prepurchased} tons @ ${selectedOrder.quotes?.prepurchase_rate?.toFixed(2)}/ton
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Total Tons from Ticket *</Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    value={ticketForm.total_tons}
                    onChange={(e) => setTicketForm({ ...ticketForm, total_tons: e.target.value })}
                    className="pl-10"
                    placeholder="e.g., 2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ticket Number</Label>
                  <Input
                    value={ticketForm.ticket_number}
                    onChange={(e) => setTicketForm({ ...ticketForm, ticket_number: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facility</Label>
                  <Input
                    value={ticketForm.facility_name}
                    onChange={(e) => setTicketForm({ ...ticketForm, facility_name: e.target.value })}
                  />
                </div>
              </div>

              {/* Pricing Preview */}
              {ticketForm.total_tons && !isNaN(parseFloat(ticketForm.total_tons)) && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium text-green-800 flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> Pricing Preview
                  </p>
                  <Separator className="my-2" />
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Total Tons:</span>
                      <span>{parseFloat(ticketForm.total_tons).toFixed(2)}</span>
                    </div>
                    {selectedOrder.quotes?.heavy_material_class ? (
                      <div className="flex justify-between text-green-700">
                        <span>Heavy Flat-Fee:</span>
                        <span>No overage</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Included:</span>
                          <span>2.0 tons</span>
                        </div>
                        <div className="flex justify-between text-orange-600">
                          <span>Overage:</span>
                          <span>{Math.max(0, parseFloat(ticketForm.total_tons) - 2).toFixed(2)} tons</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processTicket} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Process & Send Receipt
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
