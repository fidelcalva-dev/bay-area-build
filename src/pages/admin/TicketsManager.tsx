import { useState, useEffect, useRef } from "react";
import { 
  Search, FileText, Upload, Loader2, Download, Eye, 
  DollarSign, Scale, Calculator, Send, Image
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
import { PRICING_POLICIES } from "@/lib/shared-data";
import { logOrderEvent } from "@/lib/orderEventService";

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
    size_id: string | null;
  } | null;
}

interface DumpsterSize {
  id: string;
  size_value: number;
  label: string;
  included_tons: number;
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
  const [sizes, setSizes] = useState<DumpsterSize[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithQuote | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [ticketForm, setTicketForm] = useState({
    total_tons: "",
    ticket_number: "",
    facility_name: "",
    ticket_file: null as File | null,
    ticket_preview: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [ordersRes, receiptsRes, sizesRes] = await Promise.all([
        supabase
          .from("orders")
          .select(`
            id, status, dump_ticket_url, final_total, payment_status, created_at,
            quotes (
              id, customer_name, customer_phone, customer_email,
              material_type, heavy_material_class, subtotal,
              extra_tons_prepurchased, prepurchase_rate, size_id
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
        supabase
          .from("dumpster_sizes")
          .select("id, size_value, label, included_tons")
          .eq("is_active", true),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data as OrderWithQuote[]);
      if (receiptsRes.data) setReceipts(receiptsRes.data);
      if (sizesRes.data) setSizes(sizesRes.data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  function getSizeForOrder(order: OrderWithQuote): DumpsterSize | undefined {
    return sizes.find(s => s.id === order.quotes?.size_id);
  }

  function openTicketDialog(order: OrderWithQuote) {
    setSelectedOrder(order);
    setTicketForm({
      total_tons: "",
      ticket_number: "",
      facility_name: "Oakland Transfer Station",
      ticket_file: null,
      ticket_preview: order.dump_ticket_url || "",
    });
    setTicketDialogOpen(true);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast({ title: "Please upload an image or PDF", variant: "destructive" });
      return;
    }
    
    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTicketForm(prev => ({
          ...prev,
          ticket_file: file,
          ticket_preview: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setTicketForm(prev => ({
        ...prev,
        ticket_file: file,
        ticket_preview: "",
      }));
    }
  }

  async function uploadTicketFile(): Promise<string | null> {
    if (!ticketForm.ticket_file || !selectedOrder) return selectedOrder?.dump_ticket_url || null;
    
    setIsUploading(true);
    try {
      const ext = ticketForm.ticket_file.name.split(".").pop() || "jpg";
      const filePath = `dump-tickets/${selectedOrder.id}/${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from("order-documents")
        .upload(filePath, ticketForm.ticket_file, { 
          cacheControl: "3600",
          upsert: true 
        });
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from("order-documents")
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (err) {
      console.error("File upload error:", err);
      toast({ title: "Failed to upload ticket", variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
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
      // Upload ticket file if provided
      const ticketUrl = await uploadTicketFile();
      
      const quote = selectedOrder.quotes;
      const sizeConfig = getSizeForOrder(selectedOrder);
      const isHeavy = quote.heavy_material_class && quote.heavy_material_class !== "mixed";
      
      // Calculate overage based on pricing rules
      let includedTons = sizeConfig?.included_tons || 2;
      let overageTons = 0;
      let prepurchaseApplied = 0;
      let standardOverage = 0;
      let overageRate = PRICING_POLICIES.overagePerTonGeneral;
      let overageCharge = 0;
      let pricingRule = "mixed_large";
      
      if (isHeavy) {
        // Heavy flat-fee: no overage charges
        pricingRule = "heavy_flat";
        overageTons = 0;
        overageCharge = 0;
      } else if (sizeConfig && sizeConfig.size_value <= 10) {
        // Mixed 6/8/10: yard-based (no ton overage)
        pricingRule = "mixed_small";
        overageTons = 0;
        overageCharge = 0;
      } else {
        // Mixed 20+: per-ton overage
        pricingRule = "mixed_large";
        overageTons = Math.max(0, totalTons - includedTons);
        
        if (overageTons > 0) {
          const prepurchased = quote.extra_tons_prepurchased || 0;
          const prepurchaseRate = quote.prepurchase_rate || (overageRate * 0.95);
          
          prepurchaseApplied = Math.min(prepurchased, overageTons);
          standardOverage = overageTons - prepurchaseApplied;
          
          overageCharge = (prepurchaseApplied * prepurchaseRate) + (standardOverage * overageRate);
        }
      }
      
      // Create service receipt
      const { error: receiptError } = await supabase.from("service_receipts").insert({
        quote_id: quote.id,
        total_tons: totalTons,
        included_tons: isHeavy ? null : includedTons,
        overage_tons: overageTons,
        prepurchased_tons: quote.extra_tons_prepurchased || 0,
        prepurchase_applied_tons: prepurchaseApplied,
        standard_overage_tons: standardOverage,
        overage_rate: pricingRule === "mixed_large" ? overageRate : null,
        overage_charge: overageCharge,
        ticket_number: ticketForm.ticket_number || null,
        facility_name: ticketForm.facility_name || null,
        ticket_url: ticketUrl,
        heavy_material_class: quote.heavy_material_class,
        pricing_rule: pricingRule,
        ticket_date: new Date().toISOString(),
      });

      if (receiptError) throw receiptError;
      
      // Update order with ticket URL and final total
      const finalTotal = quote.subtotal + overageCharge;
      await supabase
        .from("orders")
        .update({ 
          dump_ticket_url: ticketUrl,
          final_total: finalTotal,
          amount_due: finalTotal,
          balance_due: finalTotal - (selectedOrder.final_total ? (finalTotal - (quote.subtotal + overageCharge - quote.subtotal)) : 0),
          status: "completed"
        })
        .eq("id", selectedOrder.id);

      // Log ticket upload event
      await logOrderEvent({
        orderId: selectedOrder.id,
        eventType: "TICKET_UPLOADED",
        message: `Dump ticket processed: ${totalTons}T at ${ticketForm.facility_name}`,
        afterJson: { totalTons, overageTons, overageCharge, pricingRule }
      });

      // Trigger receipt email/SMS via edge function
      try {
        const { data: receiptResult } = await supabase.functions.invoke("send-service-receipt", {
          body: { 
            orderId: selectedOrder.id, 
            quoteId: quote.id,
            totalTons,
            ticketUrl,
            ticketNumber: ticketForm.ticket_number,
            facilityName: ticketForm.facility_name,
            ticketDate: new Date().toISOString()
          },
        });
        
        if (receiptResult?.success) {
          // Log receipt sent event
          await logOrderEvent({
            orderId: selectedOrder.id,
            eventType: "RECEIPT_SENT",
            message: `Service receipt sent to customer via ${receiptResult.emailSent ? 'email' : ''}${receiptResult.emailSent && receiptResult.smsSent ? ' and ' : ''}${receiptResult.smsSent ? 'SMS' : ''}`,
            afterJson: receiptResult
          });
        }
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

              {/* Ticket Upload */}
              <div className="space-y-2">
                <Label>Dump Ticket Image/PDF</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {ticketForm.ticket_preview ? (
                  <div className="relative">
                    {ticketForm.ticket_preview.startsWith("data:image") || ticketForm.ticket_preview.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img 
                        src={ticketForm.ticket_preview} 
                        alt="Ticket preview" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-muted rounded-lg border">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">PDF uploaded</span>
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-3 h-3 mr-1" /> Replace
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-24 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Image className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload ticket image</span>
                    </div>
                  </Button>
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
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> Pricing Preview
                  </p>
                  <Separator className="my-2" />
                  <div className="text-sm space-y-1">
                    {(() => {
                      const sizeConfig = getSizeForOrder(selectedOrder);
                      const isHeavy = selectedOrder.quotes?.heavy_material_class && selectedOrder.quotes.heavy_material_class !== "mixed";
                      const includedTons = sizeConfig?.included_tons || 2;
                      const tons = parseFloat(ticketForm.total_tons);
                      const isMixedSmall = sizeConfig && sizeConfig.size_value <= 10;
                      
                      return (
                        <>
                          <div className="flex justify-between">
                            <span>Total Tons:</span>
                            <span className="font-medium">{tons.toFixed(2)}</span>
                          </div>
                          {sizeConfig && (
                            <div className="flex justify-between text-muted-foreground">
                              <span>Size:</span>
                              <span>{sizeConfig.label}</span>
                            </div>
                          )}
                          {isHeavy ? (
                            <div className="flex justify-between text-green-700 dark:text-green-400">
                              <span>Heavy Flat-Fee:</span>
                              <span>No overage</span>
                            </div>
                          ) : isMixedSmall ? (
                            <div className="flex justify-between text-blue-700 dark:text-blue-400">
                              <span>Yard-based pricing:</span>
                              <span>No ton overage</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span>Included:</span>
                                <span>{includedTons} tons</span>
                              </div>
                              {tons > includedTons && (
                                <div className="flex justify-between text-orange-600 dark:text-orange-400 font-medium">
                                  <span>Overage:</span>
                                  <span>{(tons - includedTons).toFixed(2)}T × ${PRICING_POLICIES.overagePerTonGeneral} = ${((tons - includedTons) * PRICING_POLICIES.overagePerTonGeneral).toFixed(2)}</span>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processTicket} disabled={isProcessing || isUploading}>
              {isProcessing || isUploading ? (
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
